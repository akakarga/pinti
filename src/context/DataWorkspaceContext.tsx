import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { defaultDatasetId, demoDatasets } from '../data/demoDatasets'
import type {
  AnalysisStatus,
  CampaignManualOverride,
  CampaignSimulationManualOverride,
  DataSourceType,
  DatasetValidationResult,
  ManualOverrides,
  PintiDataset,
  ProductManualOverride,
  ReconciliationManualOverride,
  ReturnManualOverride,
} from '../types'
import { validateDataset } from '../utils/dataValidation'

const emptyManualOverrides: ManualOverrides = {
  productOverrides: {},
  campaignOverrides: {},
  returnOverrides: {},
  reconciliationOverrides: {},
  campaignSimulationOverrides: {},
}

interface DataWorkspaceContextValue {
  availableDatasets: PintiDataset[]
  activeDatasetId: string | null
  activeDataset: PintiDataset | null
  uploadedDataset: PintiDataset | null
  uploadedDatasetName: string | null
  dataSourceType: DataSourceType
  analysisStatus: AnalysisStatus
  lastAnalyzedAt: string | null
  manualOverrides: ManualOverrides
  analysisRunId: number
  validationResult: DatasetValidationResult
  selectDemoDataset: (datasetId: string) => void
  uploadDataset: (dataset: PintiDataset, fileName: string) => void
  startAnalysis: () => Promise<void>
  quickStartDemo: () => Promise<void>
  updateProductOverride: (productId: string, override: ProductManualOverride) => void
  updateCampaignOverride: (campaignId: string, override: CampaignManualOverride) => void
  updateReturnOverride: (returnId: string, override: ReturnManualOverride) => void
  updateReconciliationOverrides: (override: ReconciliationManualOverride) => void
  updateCampaignSimulationOverride: (
    scenarioId: string,
    override: CampaignSimulationManualOverride,
  ) => void
  resetManualOverrides: () => void
}

const DataWorkspaceContext = createContext<DataWorkspaceContextValue | null>(null)

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

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

function applyManualOverrides(dataset: PintiDataset, overrides: ManualOverrides): PintiDataset {
  const workingDataset = clone(dataset)

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

export function DataWorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(defaultDatasetId)
  const [uploadedDataset, setUploadedDataset] = useState<PintiDataset | null>(null)
  const [uploadedDatasetName, setUploadedDatasetName] = useState<string | null>(null)
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>('demo')
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('ready')
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null)
  const [manualOverrides, setManualOverrides] = useState<ManualOverrides>(emptyManualOverrides)
  const [analysisRunId, setAnalysisRunId] = useState(0)
  const analysisTimer = useRef<number | null>(null)

  const baseDataset = useMemo(() => {
    if (dataSourceType === 'uploaded' && uploadedDataset) {
      return uploadedDataset
    }

    return demoDatasets.find((dataset) => dataset.id === activeDatasetId) ?? demoDatasets[0] ?? null
  }, [activeDatasetId, dataSourceType, uploadedDataset])

  const activeDataset = useMemo(
    () => (baseDataset ? applyManualOverrides(baseDataset, manualOverrides) : null),
    [baseDataset, manualOverrides],
  )

  const validationResult = useMemo(
    () => validateDataset(activeDataset),
    [activeDataset],
  )

  const markAnalysisStale = useCallback(() => {
    setLastAnalyzedAt(null)
    setAnalysisStatus((currentStatus) => (currentStatus === 'running' ? 'running' : 'ready'))
  }, [])

  const selectDemoDataset = useCallback((datasetId: string) => {
    setActiveDatasetId(datasetId)
    setDataSourceType('demo')
    setManualOverrides(emptyManualOverrides)
    setUploadedDatasetName(null)
    setAnalysisStatus('ready')
    setLastAnalyzedAt(null)
  }, [])

  const uploadDataset = useCallback((dataset: PintiDataset, fileName: string) => {
    setUploadedDataset(dataset)
    setUploadedDatasetName(fileName)
    setActiveDatasetId(dataset.id)
    setDataSourceType('uploaded')
    setManualOverrides(emptyManualOverrides)
    setAnalysisStatus('ready')
    setLastAnalyzedAt(null)
  }, [])

  const startAnalysis = useCallback(() => {
    if (!activeDataset || !validationResult.isValid) {
      setAnalysisStatus('error')
      return Promise.resolve()
    }

    if (analysisTimer.current) {
      window.clearTimeout(analysisTimer.current)
    }

    setAnalysisStatus('running')

    return new Promise<void>((resolve) => {
      analysisTimer.current = window.setTimeout(() => {
        setAnalysisStatus('completed')
        setLastAnalyzedAt(new Date().toISOString())
        setAnalysisRunId((currentRunId) => currentRunId + 1)
        resolve()
      }, 700)
    })
  }, [activeDataset, validationResult.isValid])

  const quickStartDemo = useCallback(async () => {
    if (analysisTimer.current) {
      window.clearTimeout(analysisTimer.current)
    }

    setActiveDatasetId(defaultDatasetId)
    setDataSourceType('demo')
    setManualOverrides(emptyManualOverrides)
    setAnalysisStatus('running')

    await new Promise<void>((resolve) => {
      analysisTimer.current = window.setTimeout(() => {
        setAnalysisStatus('completed')
        setLastAnalyzedAt(new Date().toISOString())
        setAnalysisRunId((currentRunId) => currentRunId + 1)
        resolve()
      }, 550)
    })
  }, [])

  const updateProductOverride = useCallback(
    (productId: string, override: ProductManualOverride) => {
      setManualOverrides((currentOverrides) => ({
        ...currentOverrides,
        productOverrides: {
          ...currentOverrides.productOverrides,
          [productId]: {
            ...currentOverrides.productOverrides[productId],
            ...override,
          },
        },
      }))
      markAnalysisStale()
    },
    [markAnalysisStale],
  )

  const updateCampaignOverride = useCallback(
    (campaignId: string, override: CampaignManualOverride) => {
      setManualOverrides((currentOverrides) => ({
        ...currentOverrides,
        campaignOverrides: {
          ...currentOverrides.campaignOverrides,
          [campaignId]: {
            ...currentOverrides.campaignOverrides[campaignId],
            ...override,
          },
        },
      }))
      markAnalysisStale()
    },
    [markAnalysisStale],
  )

  const updateReturnOverride = useCallback(
    (returnId: string, override: ReturnManualOverride) => {
      setManualOverrides((currentOverrides) => ({
        ...currentOverrides,
        returnOverrides: {
          ...currentOverrides.returnOverrides,
          [returnId]: {
            ...currentOverrides.returnOverrides[returnId],
            ...override,
          },
        },
      }))
      markAnalysisStale()
    },
    [markAnalysisStale],
  )

  const updateReconciliationOverrides = useCallback(
    (override: ReconciliationManualOverride) => {
      setManualOverrides((currentOverrides) => ({
        ...currentOverrides,
        reconciliationOverrides: {
          ...currentOverrides.reconciliationOverrides,
          ...override,
        },
      }))
      markAnalysisStale()
    },
    [markAnalysisStale],
  )

  const updateCampaignSimulationOverride = useCallback(
    (scenarioId: string, override: CampaignSimulationManualOverride) => {
      setManualOverrides((currentOverrides) => ({
        ...currentOverrides,
        campaignSimulationOverrides: {
          ...currentOverrides.campaignSimulationOverrides,
          [scenarioId]: {
            ...currentOverrides.campaignSimulationOverrides[scenarioId],
            ...override,
          },
        },
      }))
      markAnalysisStale()
    },
    [markAnalysisStale],
  )

  const resetManualOverrides = useCallback(() => {
    setManualOverrides(emptyManualOverrides)
    markAnalysisStale()
  }, [markAnalysisStale])

  const value = useMemo<DataWorkspaceContextValue>(
    () => ({
      availableDatasets: demoDatasets,
      activeDatasetId,
      activeDataset,
      uploadedDataset,
      uploadedDatasetName,
      dataSourceType,
      analysisStatus,
      lastAnalyzedAt,
      manualOverrides,
      analysisRunId,
      validationResult,
      selectDemoDataset,
      uploadDataset,
      startAnalysis,
      quickStartDemo,
      updateProductOverride,
      updateCampaignOverride,
      updateReturnOverride,
      updateReconciliationOverrides,
      updateCampaignSimulationOverride,
      resetManualOverrides,
    }),
    [
      activeDatasetId,
      activeDataset,
      uploadedDataset,
      uploadedDatasetName,
      dataSourceType,
      analysisStatus,
      lastAnalyzedAt,
      manualOverrides,
      analysisRunId,
      validationResult,
      selectDemoDataset,
      uploadDataset,
      startAnalysis,
      quickStartDemo,
      updateProductOverride,
      updateCampaignOverride,
      updateReturnOverride,
      updateReconciliationOverrides,
      updateCampaignSimulationOverride,
      resetManualOverrides,
    ],
  )

  return (
    <DataWorkspaceContext.Provider value={value}>
      {children}
    </DataWorkspaceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDataWorkspace() {
  const context = useContext(DataWorkspaceContext)

  if (!context) {
    throw new Error('useDataWorkspace must be used within DataWorkspaceProvider')
  }

  return context
}
