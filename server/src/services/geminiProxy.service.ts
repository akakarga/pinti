import type {
  DashboardSummary,
  ModuleSummary,
  UnifiedAction,
  UnifiedHealthSummary,
} from '../../../src/types/index.ts'

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

const DISCLAIMER = 'Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.'

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

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
  disclaimer: typeof DISCLAIMER
}

function isNonEmptyApiKey(apiKey: unknown): apiKey is string {
  return typeof apiKey === 'string' && apiKey.trim().length > 0
}

function buildGeminiUrl(apiKey: string) {
  return `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`
}

async function requestGeminiText(apiKey: string, prompt: string, maxOutputTokens = 512) {
  const response = await fetch(buildGeminiUrl(apiKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    return null
  }

  const body = (await response.json().catch(() => null)) as GeminiGenerateResponse | null

  return body?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim() || null
}

function safeParseJsonObject(rawText: string) {
  const trimmedText = rawText.trim()
  const fencedMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmedText)
  const jsonText = fencedMatch?.[1]?.trim() ?? trimmedText

  try {
    return JSON.parse(jsonText) as unknown
  } catch {
    return null
  }
}

function normalizeGeminiSummary(value: unknown): GeminiActionSummaryResult | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<GeminiActionSummaryResult>
  const nextSteps = Array.isArray(candidate.nextSteps)
    ? candidate.nextSteps.filter((step): step is string => typeof step === 'string').slice(0, 3)
    : []

  if (
    typeof candidate.title !== 'string' ||
    typeof candidate.summary !== 'string' ||
    typeof candidate.riskNote !== 'string' ||
    nextSteps.length === 0
  ) {
    return null
  }

  return {
    title: candidate.title,
    summary: candidate.summary,
    nextSteps,
    riskNote: candidate.riskNote,
    disclaimer: DISCLAIMER,
  }
}

function buildActionSummaryPrompt(context: GeminiActionSummaryContext) {
  return [
    'Sen Pinti adlı bir hackathon MVP ürününde kısa Türkçe karar destek açıklaması üreten yardımcı metin katmanısın.',
    'Pinti finansal tavsiye vermez; mevcut veriye göre karar desteği sunar.',
    'Sadece verilen JSON bağlamına dayan. Veri uydurma, yeni metrik icat etme, kesin tavsiye verme.',
    'Pinti aksiyonları hesaplanmış kaynak gerçek kabul edilir; Gemini yalnızca ikincil açıklama yazar.',
    'Yanıtı yalnızca geçerli JSON olarak ver. Markdown kullanma.',
    'JSON şeması:',
    '{"title":"kısa başlık","summary":"2-3 cümlelik özet","nextSteps":["adım 1","adım 2","adım 3"],"riskNote":"kısa risk notu","disclaimer":"Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar."}',
    'Bağlam:',
    JSON.stringify(
      {
        companyName: context.companyName,
        topActions: context.topActions.map((action) => ({
          module: action.module,
          title: action.title,
          reason: action.reason,
          priority: action.priority,
          impactLabel: action.impactLabel,
          estimatedImpactAmount: action.estimatedImpactAmount,
          recommendedNextStep: action.recommendedNextStep,
        })),
        healthSummary: context.healthSummary,
        dashboardMetrics: context.dashboardMetrics,
        moduleSummaries: context.moduleSummaries,
      },
      null,
      2,
    ),
  ].join('\n\n')
}

export async function testGeminiConnection(apiKey: unknown) {
  if (!isNonEmptyApiKey(apiKey)) {
    return {
      ok: false as const,
      message: 'Gemini bağlantısı kurulamadı. Anahtar veya kullanım limiti kontrol edilebilir.',
    }
  }

  try {
    const text = await requestGeminiText(
      apiKey.trim(),
      'Yanıtı yalnızca {"ok":true} JSON objesi olarak ver.',
      32,
    )

    if (!text) {
      throw new Error('empty-gemini-response')
    }

    return {
      ok: true as const,
      message: 'Gemini bağlantısı çalışıyor.',
    }
  } catch {
    return {
      ok: false as const,
      message: 'Gemini bağlantısı kurulamadı. Anahtar veya kullanım limiti kontrol edilebilir.',
    }
  }
}

export async function generateGeminiActionSummary(
  apiKey: unknown,
  context: GeminiActionSummaryContext | null,
) {
  if (!isNonEmptyApiKey(apiKey) || !context) {
    return {
      ok: false as const,
      message: 'Gemini yanıtı alınamadı. Mevcut Pinti aksiyonları kullanılabilir.',
    }
  }

  try {
    const text = await requestGeminiText(
      apiKey.trim(),
      buildActionSummaryPrompt(context),
      700,
    )

    if (!text) {
      throw new Error('empty-gemini-response')
    }

    const result = normalizeGeminiSummary(safeParseJsonObject(text))

    if (!result) {
      throw new Error('invalid-gemini-response')
    }

    return {
      ok: true as const,
      result,
    }
  } catch {
    return {
      ok: false as const,
      message: 'Gemini yanıtı alınamadı. Mevcut Pinti aksiyonları kullanılabilir.',
    }
  }
}
