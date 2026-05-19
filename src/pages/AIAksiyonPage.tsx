import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Banknote,
  Brain,
  ClipboardCheck,
  FileText,
  Gauge,
  Loader2,
  PlugZap,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react'
import {
  generateGeminiActionSummary,
  GeminiApiError,
  type GeminiActionSummaryResult,
} from '../api/geminiApi'
import { GeminiSettingsPanel } from '../components/ai/GeminiSettingsPanel'
import { Link } from 'react-router-dom'
import { MetricCard } from '../components/cards/MetricCard'
import {
  AnalysisControlBar,
  AnalysisRequiredState,
} from '../components/data/AnalysisControlBar'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { useDataWorkspace } from '../context/DataWorkspaceContext'
import type {
  UnifiedAction,
  UnifiedActionCategory,
  UnifiedActionPriority,
} from '../types'
import { useGeminiApiKey } from '../hooks/useGeminiApiKey'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { calculateWorkspaceResults } from '../utils/workspaceAnalysis'

type FilterKey =
  | 'all'
  | 'critical'
  | 'high'
  | 'profit'
  | 'ads'
  | 'returns'
  | 'reconciliation'
  | 'pricing'
  | 'campaign'
  | 'review'

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'critical', label: 'Kritik' },
  { key: 'high', label: 'Yüksek' },
  { key: 'profit', label: 'Kâr' },
  { key: 'ads', label: 'Reklam' },
  { key: 'returns', label: 'İade' },
  { key: 'reconciliation', label: 'Mutabakat' },
  { key: 'pricing', label: 'Fiyat' },
  { key: 'campaign', label: 'Kampanya' },
  { key: 'review', label: 'Manuel kontrol' },
]

const priorityStyles: Record<UnifiedActionPriority, string> = {
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  high: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
}

const priorityLabels: Record<UnifiedActionPriority, string> = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
}

const categoryLabels: Record<UnifiedActionCategory, string> = {
  profit: 'Kâr',
  ads: 'Reklam',
  returns: 'İade',
  reconciliation: 'Mutabakat',
  pricing: 'Fiyat',
  campaign: 'Kampanya',
  cashflow: 'Nakit akışı',
  general: 'Genel',
}

const statusLabels: Record<UnifiedAction['status'], string> = {
  open: 'Açık',
  review: 'Manuel kontrol',
  monitor: 'Takip',
}

function PriorityBadge({ priority }: { priority: UnifiedActionPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  )
}

function formatImpact(action: UnifiedAction) {
  return action.estimatedImpactAmount > 0
    ? formatCurrency(action.estimatedImpactAmount)
    : 'Nitel etki'
}

function getFinalDemoActions(actions: UnifiedAction[], fallbackActions: UnifiedAction[]) {
  const selectedActions: UnifiedAction[] = []
  const addAction = (action: UnifiedAction | undefined) => {
    if (action && !selectedActions.some((item) => item.id === action.id)) {
      selectedActions.push(action)
    }
  }

  addAction(
    actions.find(
      (action) =>
        action.category === 'reconciliation' &&
        (action.title.includes('fark') || action.impactLabel.includes('Hakediş')),
    ),
  )
  addAction(
    actions.find(
      (action) =>
        action.category === 'ads' &&
        (action.title.includes('ROAS') || action.summary.includes('net kâr')),
    ),
  )
  addAction(
    actions.find(
      (action) => action.category === 'pricing' && action.priority !== 'low',
    ),
  )
  fallbackActions.forEach(addAction)

  return selectedActions.slice(0, 3)
}

function ActionFocusCard({ action, index }: { action: UnifiedAction; index: number }) {
  return (
    <article className="pinti-panel flex h-full flex-col rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="pinti-tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-sm font-semibold text-emerald-100">
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {action.module}
            </p>
            <h2 className="mt-1 text-base font-semibold leading-6 text-white">
              {action.title}
            </h2>
          </div>
        </div>
        <PriorityBadge priority={action.priority} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{action.reason}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
          {action.impactLabel}
        </span>
        <span className="pinti-tabular text-sm font-semibold text-emerald-100">
          {formatImpact(action)}
        </span>
      </div>

      <Link
        to={action.route}
        className="pinti-link mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/25 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10"
      >
        Detaya git
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

export function AIAksiyonPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [copyState, setCopyState] = useState('Metni kopyala')
  const [isGeminiSettingsOpen, setIsGeminiSettingsOpen] = useState(false)
  const [isGeminiGenerating, setIsGeminiGenerating] = useState(false)
  const [geminiResult, setGeminiResult] = useState<GeminiActionSummaryResult | null>(null)
  const [geminiMessage, setGeminiMessage] = useState('')
  const geminiApiKey = useGeminiApiKey()
  const { activeDataset, analysisStatus } = useDataWorkspace()
  const workspaceResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateWorkspaceResults(activeDataset)
        : null,
    [activeDataset, analysisStatus],
  )
  const aiInsight = workspaceResults?.unifiedInsight
  const marketplaceDraft = workspaceResults?.marketplaceMessageDraft
  const finalDemoActions = useMemo(
    () => (aiInsight ? getFinalDemoActions(aiInsight.actions, aiInsight.topActions) : []),
    [aiInsight],
  )

  const filteredActions = useMemo(() => {
    if (!aiInsight) {
      return []
    }

    if (activeFilter === 'all') {
      return aiInsight.actions
    }

    if (activeFilter === 'critical' || activeFilter === 'high') {
      return aiInsight.actions.filter((action) => action.priority === activeFilter)
    }

    if (activeFilter === 'review') {
      return aiInsight.actions.filter((action) => action.status === 'review')
    }

    return aiInsight.actions.filter((action) => action.category === activeFilter)
  }, [activeFilter, aiInsight])

  const healthScore = aiInsight?.healthSummary.overallScore ?? null
  const hasVeryLowHealthScore = healthScore !== null && healthScore <= 10
  const healthScoreBand = hasVeryLowHealthScore
    ? 'Kritik sinyal yoğunluğu'
    : aiInsight?.healthSummary.riskLevel === 'critical'
      ? 'Öncelikli kontrol önerilir'
      : 'Düzenli takip'

  function handleClearGeminiApiKey() {
    geminiApiKey.clearApiKey()
    setGeminiResult(null)
    setGeminiMessage('')
  }

  async function handleGenerateGeminiSummary() {
    if (!activeDataset || !workspaceResults || !aiInsight) {
      return
    }

    if (!geminiApiKey.hasApiKey) {
      setIsGeminiSettingsOpen(true)
      setGeminiMessage('Önce Gemini API anahtarını ekle.')
      return
    }

    setIsGeminiGenerating(true)
    setGeminiMessage('')

    try {
      const response = await generateGeminiActionSummary(geminiApiKey.apiKey, {
        companyName: activeDataset.companyProfile.name,
        topActions: finalDemoActions,
        healthSummary: aiInsight.healthSummary,
        dashboardMetrics: workspaceResults.dashboardSummary,
        moduleSummaries: aiInsight.moduleSummaries,
      })

      if (!response.ok || !response.result) {
        setGeminiMessage(
          response.message || 'Gemini yanıtı alınamadı. Pinti’nin mevcut aksiyonları kullanılabilir.',
        )
        return
      }

      setGeminiResult(response.result)
    } catch (error) {
      setGeminiMessage(
        error instanceof GeminiApiError
          ? error.message
          : 'Gemini yanıtı alınamadı. Pinti’nin mevcut aksiyonları kullanılabilir.',
      )
    } finally {
      setIsGeminiGenerating(false)
    }
  }

  async function handleCopyMarketplaceDraft() {
    if (!marketplaceDraft) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        `${marketplaceDraft.subject}\n\n${marketplaceDraft.body}`,
      )
      setCopyState('Kopyalandı')
    } catch {
      setCopyState('Kopyalanamadı')
    } finally {
      window.setTimeout(() => setCopyState('Metni kopyala'), 1800)
    }
  }

  return (
    <div className="space-y-6">
      <section className="pinti-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-[5rem] border-b border-l border-emerald-200/10 bg-emerald-300/[0.035]" />
        <div className="relative max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
            <Sparkles className="h-4 w-4" />
            Pinti’nin gözüne takılanlar
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Bugün ilk bakılacak 3 şey
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Pinti, tüm modüllerden gelen sinyalleri birleştirip en önemli finansal
            öncelikleri sıralar.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.
          </p>
        </div>
      </section>

      {!aiInsight || !marketplaceDraft ? (
        <>
          <AnalysisControlBar scope="module" moduleName="AI Aksiyon Merkezi" />
          <AnalysisRequiredState moduleName="AI Aksiyon Merkezi" />
        </>
      ) : (
        <>
          <section className="grid items-stretch gap-3 xl:grid-cols-3">
            {finalDemoActions.map((action, index) => (
              <ActionFocusCard key={action.id} action={action} index={index} />
            ))}
          </section>

          <section className="space-y-4">
            <div className="pinti-panel flex flex-col justify-between gap-4 rounded-[1.5rem] p-5 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  <PlugZap className="h-4 w-4" />
                  Opsiyonel demo modu
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  Gemini ile kısa yorum üret
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Gemini yalnızca bu butona basınca çağrılır. Pinti’nin hesaplanan ilk 3
                  aksiyonu değişmez.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsGeminiSettingsOpen((currentValue) => !currentValue)}
                  className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-white/20 hover:text-white"
                >
                  <Settings2 className="h-4 w-4" />
                  Gemini API bağla
                </button>
                <button
                  type="button"
                  onClick={() => void handleGenerateGeminiSummary()}
                  disabled={isGeminiGenerating}
                  className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#7dd8b5] px-5 py-2.5 text-sm font-bold text-[#071017] hover:bg-[#98e4c7] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isGeminiGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Gemini ile yorumu üret
                </button>
              </div>
            </div>

            {isGeminiSettingsOpen ? (
              <GeminiSettingsPanel
                apiKey={geminiApiKey.apiKey}
                rememberOnDevice={geminiApiKey.rememberOnDevice}
                setRememberOnDevice={geminiApiKey.setRememberOnDevice}
                saveApiKey={geminiApiKey.saveApiKey}
                clearApiKey={handleClearGeminiApiKey}
              />
            ) : null}

            {geminiMessage ? (
              <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.07] px-4 py-3 text-sm leading-6 text-amber-100">
                {geminiMessage}
              </div>
            ) : null}

            {geminiResult ? (
              <article className="pinti-panel rounded-[1.5rem] p-5">
                <div className="flex items-center gap-2 text-emerald-100">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-xl font-semibold text-white">Gemini yorumu</h2>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{geminiResult.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {geminiResult.summary}
                </p>
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  {geminiResult.nextSteps.map((step) => (
                    <div
                      key={step}
                      className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-6 text-slate-300"
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl border border-amber-200/18 bg-amber-200/[0.06] p-3 text-sm leading-6 text-amber-100">
                  {geminiResult.riskNote}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {geminiResult.disclaimer}
                </p>
              </article>
            ) : null}
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="pinti-panel rounded-[1.5rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Pinti sağlık skoru
                  </p>
                  <p className="pinti-tabular mt-3 text-3xl font-semibold text-white">
                    {aiInsight.healthSummary.overallScore}/100
                  </p>
                </div>
                <div
                  className={[
                    'rounded-2xl border p-3',
                    aiInsight.healthSummary.riskLevel === 'critical'
                      ? 'border-rose-400/25 bg-rose-400/10 text-rose-200'
                      : 'border-amber-300/25 bg-amber-300/10 text-amber-200',
                  ].join(' ')}
                >
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                    hasVeryLowHealthScore
                      ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                      : 'border-amber-300/30 bg-amber-300/10 text-amber-100',
                  ].join(' ')}
                >
                  {healthScoreBand}
                </span>
              </div>
              {hasVeryLowHealthScore ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Bu skor, aynı veri setinde birden fazla yüksek/kritik sinyal öne çıktığı
                  için düşük görünüyor.
                </p>
              ) : null}
            </article>
            <MetricCard
              title="Kritik aksiyon"
              value={formatNumber(aiInsight.healthSummary.totalCriticalActions)}
              helper="Öncelikli kontrol"
              icon={ShieldAlert}
              tone="rose"
            />
            <MetricCard
              title="En riskli modül"
              value={aiInsight.healthSummary.topModule}
              helper="Sinyal yoğunluğu"
              icon={Target}
              tone="slate"
            />
            <MetricCard
              title="Tahmini etki"
              value={formatCurrency(aiInsight.healthSummary.totalEstimatedImpact)}
              helper="Demo etki toplamı"
              icon={Banknote}
              tone="cyan"
            />
          </section>

          <AnalysisControlBar scope="module" moduleName="AI Aksiyon Merkezi" compact />

          <CollapsibleSection
            eyebrow="Detay"
            title="Tüm aksiyon listesi"
            description="Filtrelenebilir tüm aksiyonlar burada yer alır."
          >
            <section className="pinti-panel rounded-[1.5rem] p-5">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">Tüm aksiyonlar</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Kritikler üstte kalır; filtreler detay inceleme içindir.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterItems.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveFilter(item.key)}
                      className={[
                        'pinti-link rounded-xl border px-3 py-2 text-sm font-semibold',
                        activeFilter === item.key
                          ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                          : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="pinti-scroll-region mt-5 overflow-x-auto"
                tabIndex={0}
                aria-label="Aksiyon listesi tablosu yatay kaydırma alanı"
              >
                <table className="pinti-table w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                      <th className="pb-3">Öncelik</th>
                      <th className="pb-3">Modül</th>
                      <th className="pb-3">Kategori</th>
                      <th className="pb-3">Başlık</th>
                      <th className="pb-3">Etki</th>
                      <th className="pb-3">Durum</th>
                      <th className="pb-3">Sonraki adım</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {filteredActions.map((action) => (
                      <tr key={action.id}>
                        <td className="py-3">
                          <PriorityBadge priority={action.priority} />
                        </td>
                        <td className="py-3 font-semibold text-white">{action.module}</td>
                        <td className="py-3 text-slate-400">{categoryLabels[action.category]}</td>
                        <td className="py-3">
                          <p className="max-w-sm font-medium text-slate-200">{action.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{action.relatedEntityName}</p>
                        </td>
                        <td className="py-3 text-slate-300">
                          <p>{formatImpact(action)}</p>
                          <p className="mt-1 text-xs text-slate-500">{action.impactLabel}</p>
                        </td>
                        <td className="py-3 text-slate-300">{statusLabels[action.status]}</td>
                        <td className="py-3">
                          <Link
                            to={action.route}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
                          >
                            Modüle git
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </CollapsibleSection>

          <CollapsibleSection
            eyebrow="Detay"
            title="Modül durumları"
            description="Her modülün skor ve bulgu özeti."
          >
            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {aiInsight.moduleSummaries.map((summary) => (
                <article
                  key={summary.module}
                  className="pinti-panel rounded-[1.5rem] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Modül durumu
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{summary.title}</h3>
                    </div>
                    <PriorityBadge priority={summary.riskLevel} />
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Skor</p>
                      <p className="mt-1 text-3xl font-semibold text-white">{summary.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Aksiyon</p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-100">
                        {summary.actionCount}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">{summary.mainFinding}</p>
                  <Link
                    to={summary.route}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
                  >
                    Modüle git
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </section>
          </CollapsibleSection>

          <CollapsibleSection
            eyebrow="Detay"
            title="Pinti yorumu ve mesaj taslağı"
            description="Uzun açıklama ve pazaryeri mesajı final ekranın altında durur."
          >
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="pinti-panel rounded-[1.5rem] p-5">
                <div className="flex items-center gap-2 text-emerald-100">
                  <Brain className="h-5 w-5" />
                  <h2 className="text-xl font-semibold text-white">Pinti yorumu</h2>
                </div>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  {aiInsight.overallSummary}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.
                </p>
              </article>

              <article className="pinti-panel rounded-[1.5rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-semibold text-white">Pazaryeri mesaj taslağı</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMarketplaceDraft}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {copyState}
                  </button>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-sm font-semibold text-white">{marketplaceDraft.subject}</p>
                  <p className="mt-3 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-400">
                    {marketplaceDraft.body}
                  </p>
                </div>
              </article>
            </section>
          </CollapsibleSection>
        </>
      )}
    </div>
  )
}
