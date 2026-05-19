import type {
  DashboardSummary,
  ModuleSummary,
  UnifiedAction,
  UnifiedHealthSummary,
} from '../../../src/types/index.ts'
import type { PintiDataset, DatasetValidationResult } from './dataset.types.ts'

export const moduleSlugs = [
  'kar-pusula',
  'reklam-merkezi',
  'iade-kalkan',
  'mutabakat',
  'fiyat-koruma',
  'kampanya-sim',
] as const

export type ModuleSlug = (typeof moduleSlugs)[number]

export interface AnalysisActionsPayload {
  topActions: UnifiedAction[]
  actions: UnifiedAction[]
  healthSummary: UnifiedHealthSummary
  moduleSummaries: ModuleSummary[]
  riskWarnings: string[]
  overallSummary: string
  disclaimer: string
}

export interface StoredAnalysis {
  analysisId: string
  datasetId: string
  sourceDatasetId: string
  createdAt: string
  status: 'completed'
  validation: DatasetValidationResult
  datasetSnapshot: Pick<PintiDataset, 'id' | 'companyProfile'>
  dashboard: DashboardSummary
  actions: AnalysisActionsPayload
  healthSummary: UnifiedHealthSummary
  modules: Record<ModuleSlug, unknown>
  moduleSummaries: AnalysisActionsPayload['moduleSummaries']
}
