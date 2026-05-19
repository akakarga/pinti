import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CircleDollarSign,
  Filter,
  Gauge,
  HandCoins,
  Megaphone,
  Scale,
  ShieldAlert,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { MetricCard } from '../components/cards/MetricCard'
import {
  AnalysisControlBar,
  AnalysisRequiredState,
} from '../components/data/AnalysisControlBar'
import { ManualOverridePanel } from '../components/data/ManualOverridePanel'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { ModuleInsightCard } from '../components/ui/ModuleInsightCard'
import { ModuleHero } from '../components/ui/ModuleHero'
import { useDataWorkspace } from '../context/DataWorkspaceContext'
import {
  calculateAllCampaignProfits,
  recommendBudgetShift,
} from '../services/reklamMerkeziService'
import type {
  CampaignHealthStatus,
  CampaignProfitResult,
  RecommendedCampaignAction,
} from '../types'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../utils/formatters'

type FilterKey = 'all' | CampaignHealthStatus

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'healthy', label: 'Sağlıklı' },
  { key: 'watch', label: 'Takip' },
  { key: 'risky', label: 'Riskli' },
  { key: 'loss', label: 'Zarar' },
]

const healthStyles: Record<CampaignHealthStatus, string> = {
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  risky: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  loss: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const healthLabels: Record<CampaignHealthStatus, string> = {
  healthy: 'Sağlıklı',
  watch: 'Takip',
  risky: 'Riskli',
  loss: 'Zarar',
}

const actionLabels: Record<RecommendedCampaignAction, string> = {
  increase_budget: 'Bütçe artışı değerlendirilebilir',
  reduce_budget: 'Bütçeyi kontrollü azalt',
  pause_campaign: 'Durdurmayı değerlendir',
  monitor: 'İzlemeye devam et',
  review_returns: 'İadeleri incele',
  shift_budget: 'Bütçe kaydırmayı test et',
}

function formatRoas(value: number) {
  return `${value.toLocaleString('tr-TR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}x`
}

function HealthBadge({ status }: { status: CampaignHealthStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${healthStyles[status]}`}
    >
      {healthLabels[status]}
    </span>
  )
}

function CampaignProfitCard({ result }: { result: CampaignProfitResult }) {
  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{result.campaignName}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {result.channel} · {result.productNames.join(', ')}
          </p>
        </div>
        <HealthBadge status={result.healthStatus} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Harcama</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.adSpend)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Ciro</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.attributedRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">ROAS</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatRoas(result.roas)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Net kâr</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatSignedCurrency(result.netProfitAfterAds)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={[
                'h-full rounded-full',
                result.healthStatus === 'loss'
                  ? 'bg-rose-300'
                  : result.healthStatus === 'risky'
                    ? 'bg-orange-300'
                    : 'bg-emerald-300',
              ].join(' ')}
              style={{ width: `${result.healthScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Kâr bazlı ROAS {formatRoas(result.profitBasedROAS)} · Skor{' '}
            {result.healthScore}/100
          </p>
        </div>
        {result.wastedAdSpend ? (
          <span className="inline-flex items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
            ROAS makyajlı olabilir
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-sm font-semibold text-emerald-100">
          {actionLabels[result.recommendedAction]}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{result.explanation}</p>
      </div>
    </article>
  )
}

function MisleadingRoasComment({ result }: { result: CampaignProfitResult }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{result.campaignName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            ROAS {formatRoas(result.roas)} · Net marj{' '}
            {formatPercent(result.netMarginAfterAds)}
          </p>
        </div>
        <HealthBadge status={result.healthStatus} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {result.campaignName} kampanyası ROAS olarak iyi görünüyor; ancak ürün maliyeti,
        kargo, iade ve reklam harcaması sonrası net kâr baskılanıyor olabilir.
      </p>
    </article>
  )
}

export function ReklamMerkeziPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const campaignResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllCampaignProfits(
            activeDataset.campaigns,
            activeDataset.products,
            activeDataset.orders,
            activeDataset.returns,
            activeDataset.campaignPerformance,
          )
        : [],
    [activeDataset, analysisStatus],
  )

  const filteredResults = useMemo(
    () =>
      activeFilter === 'all'
        ? campaignResults
        : campaignResults.filter((result) => result.healthStatus === activeFilter),
    [activeFilter, campaignResults],
  )

  const budgetShift = useMemo(
    () => recommendBudgetShift(campaignResults),
    [campaignResults],
  )
  const totalAdSpend = campaignResults.reduce((sum, result) => sum + result.adSpend, 0)
  const totalAttributedRevenue = campaignResults.reduce(
    (sum, result) => sum + result.attributedRevenue,
    0,
  )
  const weightedRoas = totalAdSpend > 0 ? totalAttributedRevenue / totalAdSpend : 0
  const totalNetProfitAfterAds = campaignResults.reduce(
    (sum, result) => sum + result.netProfitAfterAds,
    0,
  )
  const pauseRecommendedCount = campaignResults.filter(
    (result) => result.recommendedAction === 'pause_campaign',
  ).length
  const misleadingRoasResults = campaignResults
    .filter(
      (result) =>
        result.roas >= 4 &&
        (result.netMarginAfterAds < 0.1 ||
          result.profitBasedROAS < 0.35 ||
          result.wastedAdSpend),
    )
    .toSorted((first, second) => first.netMarginAfterAds - second.netMarginAfterAds)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <ModuleHero
        label="Reklam sonrası kâr kontrolü"
        title="ReklamMerkezi"
        question="ROAS iyi görünse bile reklam sonrası kâr sağlıklı mı?"
        description="Reklam kampanyalarını sadece ROAS’a göre değil, reklam sonrası gerçek net kâra göre değerlendirin."
        disclaimer="Bu modül reklam performansı garantisi vermez; mevcut demo verisine göre karar desteği sunar."
        icon={Megaphone}
        meta={`${activeDataset?.campaigns.length ?? 0} kampanya · ${activeDataset?.campaignPerformance.length ?? 0} günlük kayıt`}
        tone="cyan"
      />

      <AnalysisControlBar scope="module" moduleName="ReklamMerkezi" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="ReklamMerkezi" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Toplam reklam harcaması"
          value={formatCurrency(totalAdSpend)}
          helper="Kampanya performans seti"
          icon={Wallet}
          tone="cyan"
        />
        <MetricCard
          title="Reklam kaynaklı ciro"
          value={formatCurrency(totalAttributedRevenue)}
          helper="Kampanyaya atfedilen satış"
          icon={CircleDollarSign}
          tone="emerald"
        />
        <MetricCard
          title="Ortalama ROAS"
          value={formatRoas(weightedRoas)}
          helper="Ciro / reklam harcaması"
          icon={Gauge}
          tone={weightedRoas >= 4 ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Reklam sonrası net kâr"
          value={formatSignedCurrency(totalNetProfitAfterAds)}
          helper="Ürün, komisyon, kargo, iade dahil"
          icon={HandCoins}
          tone={totalNetProfitAfterAds >= 0 ? 'emerald' : 'rose'}
        />
        <MetricCard
          title="Durdurma kontrolü önerilen"
          value={String(pauseRecommendedCount)}
          helper="Mevcut demo verisine göre"
          icon={ShieldAlert}
          tone={pauseRecommendedCount > 0 ? 'rose' : 'emerald'}
        />
      </section>

      <ModuleInsightCard
        icon={TrendingDown}
        title={
          misleadingRoasResults[0]
            ? `${misleadingRoasResults[0].campaignName} ROAS iyi görünse de kârı baskılıyor.`
            : 'Reklam sinyallerinde kritik ROAS yanılsaması görünmüyor.'
        }
        description={
          misleadingRoasResults[0]
            ? `ROAS ${formatRoas(misleadingRoasResults[0].roas)}; ancak reklam sonrası net marj ${formatPercent(misleadingRoasResults[0].netMarginAfterAds)}. Bu kampanya ciro değil, cepte kalan kâr açısından okunmalı.`
            : 'Kampanyalar yine de reklam sonrası net kâr metriğiyle takip edilmeli; ROAS tek başına karar vermek için yeterli değil.'
        }
        meta="ReklamMerkezi içgörüsü"
        tone={misleadingRoasResults[0]?.healthStatus === 'loss' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="ads" title="ReklamMerkezi varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Kampanya kartları ve filtreler"
        description="Kampanya bazlı kâr kartları ve durum filtreleri burada açılır."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Kampanya kâr kartları
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const count =
                item.key === 'all'
                  ? campaignResults.length
                  : campaignResults.filter((result) => result.healthStatus === item.key)
                      .length
              const isActive = activeFilter === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={[
                    'min-h-11 shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]',
                    isActive
                      ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {item.label}
                  <span className="ml-2 text-xs text-slate-500">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <CampaignProfitCard key={result.campaignId} result={result} />
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-slate-400 xl:col-span-2">
              Bu filtrede kampanya görünmüyor. Pinti burada şimdilik sakin; farklı bir
              durum seçerek kampanyaları inceleyebilirsin.
            </div>
          )}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Kampanya bazlı kâr kırılımı"
        description="ROAS, maliyet, iade, kargo ve reklam sonrası net kâr tablosu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Detay tablo</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Kampanya bazlı kâr kırılımı
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            ROAS tek başına ışığı yakar; Pinti masaya ürün maliyeti, iade, kargo ve net
            kârı da koyar.
          </p>
        </div>

        <div
          className="pinti-scroll-region overflow-x-auto"
          tabIndex={0}
          aria-label="Kampanya tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1300px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3 font-semibold">Kampanya</th>
                <th className="pb-3 font-semibold">Kanal</th>
                <th className="pb-3 font-semibold">Harcama</th>
                <th className="pb-3 font-semibold">Ciro</th>
                <th className="pb-3 font-semibold">ROAS</th>
                <th className="pb-3 font-semibold">Ürün maliyeti</th>
                <th className="pb-3 font-semibold">Komisyon</th>
                <th className="pb-3 font-semibold">Kargo</th>
                <th className="pb-3 font-semibold">İade etkisi</th>
                <th className="pb-3 font-semibold">Reklam sonrası net kâr</th>
                <th className="pb-3 font-semibold">Kâr bazlı ROAS</th>
                <th className="pb-3 font-semibold">Skor</th>
                <th className="pb-3 font-semibold">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredResults.map((result) => (
                <tr key={result.campaignId}>
                  <td className="py-3">
                    <p className="font-medium text-white">{result.campaignName}</p>
                    <p className="mt-1 text-xs text-slate-500">{result.objective}</p>
                  </td>
                  <td className="py-3 text-slate-400">{result.channel}</td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.adSpend)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.attributedRevenue)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatRoas(result.roas)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.productCost)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.commissionCost)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.shippingCost)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.returnImpact)}
                  </td>
                  <td className="py-3 font-mono font-semibold text-white">
                    {formatSignedCurrency(result.netProfitAfterAds)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatRoas(result.profitBasedROAS)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-200">{result.healthScore}</span>
                      <HealthBadge status={result.healthStatus} />
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">
                    {actionLabels[result.recommendedAction]}
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
        title="ROAS yorumu ve bütçe test alanı"
        description="Yanıltıcı ROAS sinyalleri ve kontrollü bütçe kaydırma notu."
      >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-amber-200">
                <TrendingDown className="h-4 w-4" />
                <p className="text-sm font-semibold">ROAS yanıltabilir</p>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Ciro güzel, cepte kalan kısım dikkat istiyor
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300">
              Net kâr kontrolü
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-3">
            {misleadingRoasResults.map((result) => (
              <MisleadingRoasComment key={result.campaignId} result={result} />
            ))}
          </div>
        </article>

        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-emerald-200">
            <Scale className="h-4 w-4" />
            <p className="text-sm font-semibold">Bütçe kaydırma önerisi</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">Kontrollü test alanı</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Bu öneri reklam performansı garantisi değildir; mevcut demo verisine göre
            küçük bütçe testleri için karar desteğidir.
          </p>

          {budgetShift ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-4">
                  <p className="text-xs font-semibold uppercase text-rose-200">
                    Azaltılacak
                  </p>
                  <p className="mt-2 font-semibold text-white">
                    {budgetShift.fromCampaignName}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-200">
                    Artırılabilecek
                  </p>
                  <p className="mt-2 font-semibold text-white">
                    {budgetShift.toCampaignName}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-sm text-slate-400">Önerilen test tutarı</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(budgetShift.suggestedAmount)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {budgetShift.reason}
                </p>
                <p className="mt-3 text-sm font-semibold text-emerald-100">
                  Güven skoru {formatPercent(budgetShift.confidence, 0)}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-6 text-slate-400">
              Mevcut demo verisinde net bir bütçe kaydırma önerisi oluşmadı. Kampanyalar
              izlenmeye devam edilebilir.
            </div>
          )}
        </article>
      </section>
      </CollapsibleSection>
        </>
      )}
    </div>
  )
}
