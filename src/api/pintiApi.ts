import type {
  DashboardSummary,
  DatasetValidationResult,
  ManualOverrides,
  ModuleSummary,
  PintiDataset,
  UnifiedAction,
  UnifiedHealthSummary,
} from '../types'

const DEFAULT_API_BASE_URL = 'http://localhost:8787/api'

export const PINTI_API_BASE_URL =
  import.meta.env.VITE_PINTI_API_BASE_URL ?? DEFAULT_API_BASE_URL

export const API_CONNECTION_FALLBACK_MESSAGE =
  'API bağlantısı kurulamadı, yerel demo modu kullanılabilir.'

export class PintiApiConnectionError extends Error {
  constructor() {
    super(API_CONNECTION_FALLBACK_MESSAGE)
  }
}

export class PintiApiError extends Error {
  public readonly status: number
  public readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export interface HealthResponse {
  ok: boolean
  service: string
  mode: string
  uptimeSeconds: number
}

export interface DatasetValidationResponse {
  ok: boolean
  validation: DatasetValidationResult
}

export interface DatasetUploadResponse {
  ok: true
  datasetId: string
  sourceDatasetId: string
  uploadedAt: string
  validation: DatasetValidationResult
}

export interface AnalysisRunResponse {
  ok: true
  analysisId: string
  datasetId: string
  createdAt: string
  status: 'completed'
  dashboard: DashboardSummary
  topActions: UnifiedAction[]
  healthSummary: UnifiedHealthSummary
  moduleSummaries: ModuleSummary[]
}

export interface AnalysisDashboardResponse {
  ok: true
  analysisId: string
  dashboard: DashboardSummary
  healthSummary: UnifiedHealthSummary
  moduleSummaries: ModuleSummary[]
}

export interface AnalysisActionsResponse {
  ok: true
  analysisId: string
  actions: {
    topActions: UnifiedAction[]
    actions: UnifiedAction[]
    healthSummary: UnifiedHealthSummary
    moduleSummaries: ModuleSummary[]
    riskWarnings: string[]
    overallSummary: string
    disclaimer: string
  }
}

async function requestJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${PINTI_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new PintiApiConnectionError()
  }

  const body = (await response.json().catch(() => null)) as
    | { message?: string; details?: unknown }
    | TResponse
    | null

  const errorBody =
    body && typeof body === 'object'
      ? (body as { message?: string; details?: unknown })
      : null

  if (!response.ok) {
    throw new PintiApiError(
      errorBody?.message || 'Pinti API isteği başarısız oldu.',
      response.status,
      errorBody?.details ?? body,
    )
  }

  return body as TResponse
}

export function healthCheck() {
  return requestJson<HealthResponse>('/health')
}

export function validateDataset(dataset: PintiDataset) {
  return requestJson<DatasetValidationResponse>('/datasets/validate', {
    method: 'POST',
    body: JSON.stringify(dataset),
  })
}

export function uploadDataset(dataset: PintiDataset, fileName?: string) {
  return requestJson<DatasetUploadResponse>('/datasets/upload', {
    method: 'POST',
    body: JSON.stringify({ dataset, fileName }),
  })
}

export function runAnalysis(datasetId: string, manualOverrides?: Partial<ManualOverrides>) {
  return requestJson<AnalysisRunResponse>('/analysis/run', {
    method: 'POST',
    body: JSON.stringify({ datasetId, manualOverrides }),
  })
}

export function getAnalysis(analysisId: string) {
  return requestJson<{ ok: true; analysis: unknown }>(`/analysis/${analysisId}`)
}

export function getDashboard(analysisId: string) {
  return requestJson<AnalysisDashboardResponse>(`/analysis/${analysisId}/dashboard`)
}

export function getActions(analysisId: string) {
  return requestJson<AnalysisActionsResponse>(`/analysis/${analysisId}/actions`)
}
