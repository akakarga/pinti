import { generateUnifiedAIInsight } from '../services/aiAksiyonService'
import { calculateAllPriceProtection } from '../services/fiyatKorumaService'
import {
  calculateAllProductReturnAnalysis,
  calculateReturnRiskResults,
} from '../services/iadeKalkanService'
import { calculateAllProductProfits } from '../services/karPusulaService'
import { calculateAllCampaignSimulations } from '../services/kampanyaSimService'
import {
  calculateAllReconciliationResults,
  calculateDeductionSummary,
  generateMarketplaceMessageDraft,
  generateReconciliationSummary,
} from '../services/mutabakatService'
import { calculateAllCampaignProfits } from '../services/reklamMerkeziService'
import type { DashboardSummary, PintiDataset } from '../types'

export function calculateWorkspaceResults(dataset: PintiDataset) {
  const productProfitResults = calculateAllProductProfits(
    dataset.products,
    dataset.orders,
    dataset.returns,
    dataset.campaigns,
  )
  const campaignProfitResults = calculateAllCampaignProfits(
    dataset.campaigns,
    dataset.products,
    dataset.orders,
    dataset.returns,
    dataset.campaignPerformance,
  )
  const productReturnResults = calculateAllProductReturnAnalysis(
    dataset.products,
    dataset.orders,
    dataset.returns,
  )
  const returnRiskResults = calculateReturnRiskResults(
    dataset.returns,
    dataset.products,
    dataset.orders,
    dataset.customers,
    dataset.paymentDisputes,
  )
  const reconciliationResults = calculateAllReconciliationResults(
    dataset.settlements,
    dataset.bankTransactions,
  )
  const deductionSummary = calculateDeductionSummary(
    dataset.settlements,
    reconciliationResults,
  )
  const reconciliationSummary = generateReconciliationSummary(
    reconciliationResults,
    deductionSummary,
  )
  const priceProtectionResults = calculateAllPriceProtection(
    dataset.products,
    dataset.orders,
    dataset.returns,
    dataset.campaigns,
  )
  const campaignSimulationResults = calculateAllCampaignSimulations(
    dataset.products,
    dataset.campaignSimulationScenarios,
  )
  const unifiedInsight = generateUnifiedAIInsight({
    productProfitResults,
    campaignProfitResults,
    productReturnResults,
    returnRiskResults,
    reconciliationResults,
    priceProtectionResults,
    campaignSimulationResults,
  })

  const dashboardSummary: DashboardSummary = {
    totalSales: productProfitResults.reduce((sum, result) => sum + result.revenue, 0),
    realNetProfit: productProfitResults.reduce((sum, result) => sum + result.netProfit, 0),
    netProfitAfterAds: campaignProfitResults.reduce(
      (sum, result) => sum + result.netProfitAfterAds,
      0,
    ),
    totalReturnLoss: productReturnResults.reduce(
      (sum, result) => sum + result.totalReturnLoss,
      0,
    ),
    unexplainedSettlementGap: Math.abs(deductionSummary.unexplainedDifference),
    riskyOrderCount: returnRiskResults.filter(
      (result) => result.riskLevel === 'high' || result.riskLevel === 'critical',
    ).length,
    healthScore: unifiedInsight.healthSummary.overallScore,
  }

  return {
    productProfitResults,
    campaignProfitResults,
    productReturnResults,
    returnRiskResults,
    reconciliationResults,
    deductionSummary,
    reconciliationSummary,
    marketplaceMessageDraft: generateMarketplaceMessageDraft(reconciliationResults),
    priceProtectionResults,
    campaignSimulationResults,
    unifiedInsight,
    dashboardSummary,
  }
}
