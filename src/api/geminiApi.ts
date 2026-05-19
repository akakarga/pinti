import { PINTI_API_BASE_URL } from './pintiApi'
import type {
  DashboardSummary,
  ModuleSummary,
  UnifiedAction,
  UnifiedHealthSummary,
} from '../types'

export interface GeminiActionSummaryContext {
  companyName: string
  topActions: UnifiedAction[]
  healthSummary: UnifiedHealthSummary
  dashboardMetrics: DashboardSummary
  moduleSummaries: ModuleSummary[]
}

export interface GeminiActionSummaryResult {
  title: string
  summary: string
  nextSteps: string[]
  riskNote: string
  disclaimer: string
}

export interface GeminiTestResponse {
  ok: boolean
  message: string
}

export interface GeminiActionSummaryResponse {
  ok: boolean
  result?: GeminiActionSummaryResult
  message?: string
}

export class GeminiApiError extends Error {
  constructor(message: string) {
    super(message)
  }
}

async function requestGeminiJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${PINTI_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new GeminiApiError('Yerel backend çalışmıyor olabilir. Pinti mevcut akışla devam eder.')
  }

  const responseBody = (await response.json().catch(() => null)) as
    | { message?: string }
    | TResponse
    | null

  if (!response.ok) {
    const errorMessage =
      responseBody && typeof responseBody === 'object' && 'message' in responseBody
        ? responseBody.message
        : null

    throw new GeminiApiError(errorMessage || 'Gemini isteği tamamlanamadı.')
  }

  return responseBody as TResponse
}

export function testGeminiConnection(apiKey: string) {
  return requestGeminiJson<GeminiTestResponse>('/gemini/test', { apiKey })
}

export function generateGeminiActionSummary(
  apiKey: string,
  context: GeminiActionSummaryContext,
) {
  return requestGeminiJson<GeminiActionSummaryResponse>('/gemini/action-summary', {
    apiKey,
    context,
  })
}
