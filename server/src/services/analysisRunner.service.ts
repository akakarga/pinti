import { randomUUID } from 'node:crypto'
import { calculateWorkspaceResults } from '../../../src/utils/workspaceAnalysis.ts'
import { recommendBudgetShift } from '../../../src/services/reklamMerkeziService.ts'
import type { ManualOverrides, PintiDataset } from '../../../src/types/index.ts'
import { validatePintiDatasetPayload } from './datasetValidation.service.ts'
import {
  getStoredAnalysis,
  getStoredDataset,
  saveAnalysisResult,
} from './datasetStorage.service.ts'
import { ApiError } from './apiError.ts'
import type { ModuleSlug, StoredAnalysis } from '../types/analysis.types.ts'

const emptyManualOverrides: ManualOverrides = {
  productOverrides: {},
  campaignOverrides: {},
  returnOverrides: {},
  reconciliationOverrides: {},
  campaignSimulationOverrides: {},
}

const moduleSelectors: Record<ModuleSlug, keyof StoredAnalysis['modules']> = {
  'kar-pusula': 'kar-pusula',
  'reklam-merkezi': 'reklam-merkezi',
  'iade-kalkan': 'iade-kalkan',
  mutabakat: 'mutabakat',
  'fiyat-koruma': 'fiyat-koruma',
  'kampanya-sim': 'kampanya-sim',
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function normalizeManualOverrides(overrides?: Partial<ManualOverrides>): ManualOverrides {
  return {
    productOverrides: overrides?.productOverrides ?? {},
    campaignOverrides: overrides?.campaignOverrides ?? {},
    returnOverrides: overrides?.returnOverrides ?? {},
    reconciliationOverrides: overrides?.reconciliationOverrides ?? {},
    campaignSimulationOverrides: overrides?.campaignSimulationOverrides ?? {},
  }
}

function applyProductOverrides(dataset: PintiDataset, overrides: ManualOverrides) {
  return dataset.products.map((product) => ({
    ...product,
    ...(overrides.productOverrides[product.id] ?? {}),
  }))
}

function applyCampaignOverrides(dataset: PintiDataset, overrides: ManualOverrides) {
  return dataset.campaigns.map((campaign) => {
    const override = overrides.campaignOverrides[campaign.id]

    if (!override) {
      return campaign
    }

    const totalSpend = override.totalSpend ?? campaign.totalSpend
    const attributedRevenue = override.attributedRevenue ?? campaign.attributedRevenue

    return {
      ...campaign,
      ...override,
      totalSpend,
      attributedRevenue,
      spend: totalSpend,
      revenue: attributedRevenue,
      roas: totalSpend > 0 ? attributedRevenue / totalSpend : 0,
    }
  })
}

function applyCampaignPerformanceOverrides(dataset: PintiDataset, overrides: ManualOverrides) {
  const campaignOverrideEntries = Object.entries(overrides.campaignOverrides)

  if (campaignOverrideEntries.length === 0) {
    return dataset.campaignPerformance
  }

  const rowsByCampaign = new Map<string, typeof dataset.campaignPerformance>()

  dataset.campaignPerformance.forEach((row) => {
    rowsByCampaign.set(row.campaignId, [...(rowsByCampaign.get(row.campaignId) ?? []), row])
  })

  return dataset.campaignPerformance.map((row) => {
    const override = overrides.campaignOverrides[row.campaignId]

    if (!override) {
      return row
    }

    const campaignRows = rowsByCampaign.get(row.campaignId) ?? []
    const spendTotal = campaignRows.reduce((sum, item) => sum + item.adSpend, 0)
    const revenueTotal = campaignRows.reduce((sum, item) => sum + item.attributedRevenue, 0)
    const orderTotal = campaignRows.reduce((sum, item) => sum + item.attributedOrders, 0)
    const spendShare = spendTotal > 0 ? row.adSpend / spendTotal : 1 / Math.max(1, campaignRows.length)
    const revenueShare =
      revenueTotal > 0 ? row.attributedRevenue / revenueTotal : spendShare
    const orderShare = orderTotal > 0 ? row.attributedOrders / orderTotal : spendShare

    return {
      ...row,
      adSpend:
        override.totalSpend !== undefined
          ? Math.round(override.totalSpend * spendShare)
          : row.adSpend,
      attributedRevenue:
        override.attributedRevenue !== undefined
          ? Math.round(override.attributedRevenue * revenueShare)
          : row.attributedRevenue,
      attributedOrders:
        override.attributedOrders !== undefined
          ? Math.max(0, Math.round(override.attributedOrders * orderShare))
          : row.attributedOrders,
    }
  })
}

function applyManualOverrides(
  dataset: PintiDataset,
  partialOverrides?: Partial<ManualOverrides>,
): PintiDataset {
  const overrides = normalizeManualOverrides(partialOverrides ?? emptyManualOverrides)
  const workingDataset = clone(dataset)

  // Mirrored from frontend DataWorkspaceContext for hackathon local backend demo.
  return {
    ...workingDataset,
    products: applyProductOverrides(workingDataset, overrides),
    campaigns: applyCampaignOverrides(workingDataset, overrides),
    campaignPerformance: applyCampaignPerformanceOverrides(workingDataset, overrides),
    returns: workingDataset.returns.map((returnRequest) => ({
      ...returnRequest,
      ...(overrides.returnOverrides[returnRequest.id] ?? {}),
    })),
    campaignSimulationScenarios: workingDataset.campaignSimulationScenarios.map((scenario) => ({
      ...scenario,
      ...(overrides.campaignSimulationOverrides[scenario.id] ?? {}),
    })),
  }
}

function createAnalysisId() {
  return `an-${Date.now()}-${randomUUID().slice(0, 8)}`
}

export async function runAnalysis(
  datasetId: string,
  manualOverrides?: Partial<ManualOverrides>,
): Promise<StoredAnalysis> {
  const storedDataset = await getStoredDataset(datasetId)

  if (!storedDataset) {
    throw new ApiError(404, `Dataset bulunamadı: ${datasetId}`)
  }

  const dataset = applyManualOverrides(storedDataset.dataset, manualOverrides)
  const { validation } = validatePintiDatasetPayload(dataset)

  if (!validation.isValid) {
    throw new ApiError(422, 'Dataset analiz için geçerli değil.', { validation })
  }

  const workspaceResults = calculateWorkspaceResults(dataset)
  const analysis: StoredAnalysis = {
    analysisId: createAnalysisId(),
    datasetId: storedDataset.datasetId,
    sourceDatasetId: storedDataset.sourceDatasetId,
    createdAt: new Date().toISOString(),
    status: 'completed',
    validation,
    datasetSnapshot: {
      id: dataset.id,
      companyProfile: dataset.companyProfile,
    },
    dashboard: workspaceResults.dashboardSummary,
    actions: {
      topActions: workspaceResults.unifiedInsight.topActions,
      actions: workspaceResults.unifiedInsight.actions,
      healthSummary: workspaceResults.unifiedInsight.healthSummary,
      moduleSummaries: workspaceResults.unifiedInsight.moduleSummaries,
      riskWarnings: workspaceResults.unifiedInsight.riskWarnings,
      overallSummary: workspaceResults.unifiedInsight.overallSummary,
      disclaimer: workspaceResults.unifiedInsight.disclaimer,
    },
    healthSummary: workspaceResults.unifiedInsight.healthSummary,
    moduleSummaries: workspaceResults.unifiedInsight.moduleSummaries,
    modules: {
      'kar-pusula': workspaceResults.productProfitResults,
      'reklam-merkezi': {
        results: workspaceResults.campaignProfitResults,
        budgetShiftRecommendation: recommendBudgetShift(workspaceResults.campaignProfitResults),
      },
      'iade-kalkan': {
        productReturnResults: workspaceResults.productReturnResults,
        returnRiskResults: workspaceResults.returnRiskResults,
      },
      mutabakat: {
        reconciliationResults: workspaceResults.reconciliationResults,
        deductionSummary: workspaceResults.deductionSummary,
        reconciliationSummary: workspaceResults.reconciliationSummary,
        marketplaceMessageDraft: workspaceResults.marketplaceMessageDraft,
      },
      'fiyat-koruma': workspaceResults.priceProtectionResults,
      'kampanya-sim': workspaceResults.campaignSimulationResults,
    },
  }

  return saveAnalysisResult(analysis)
}

export async function getAnalysis(analysisId: string) {
  return getStoredAnalysis<StoredAnalysis>(analysisId)
}

export function getAnalysisModule(analysis: StoredAnalysis, moduleName: ModuleSlug) {
  return analysis.modules[moduleSelectors[moduleName]]
}
