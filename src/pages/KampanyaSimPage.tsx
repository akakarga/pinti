import { useMemo, useState } from 'react'
import {
  BadgePercent,
  Filter,
  Gauge,
  PackagePlus,
  Scale,
  ShieldAlert,
  Tags,
  TrendingDown,
  WalletCards,
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
import { calculateAllCampaignSimulations } from '../services/kampanyaSimService'
import type {
  CampaignAlternative,
  CampaignSimulationResult,
  CampaignSimulationRiskLevel,
  CampaignSimulationType,
  RecommendedCampaignSimulationAction,
} from '../types'
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters'

type FilterKey = 'all' | CampaignSimulationRiskLevel

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'safe', label: 'Güvenli' },
  { key: 'watch', label: 'Takip' },
  { key: 'risky', label: 'Riskli' },
  { key: 'critical', label: 'Kritik' },
]

const riskStyles: Record<CampaignSimulationRiskLevel, string> = {
  safe: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  risky: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const riskLabels: Record<CampaignSimulationRiskLevel, string> = {
  safe: 'Güvenli',
  watch: 'Takip',
  risky: 'Riskli',
  critical: 'Kritik',
}

const campaignTypeLabels: Record<CampaignSimulationType, string> = {
  discount: 'İndirim',
  coupon: 'Kupon',
  free_shipping: 'Ücretsiz kargo',
  bundle: 'Bundle',
  cart_threshold: 'Sepet eşiği',
}

const actionLabels: Record<RecommendedCampaignSimulationAction, string> = {
  monitor: 'İzlemeye devam et',
  run_small_test: 'Küçük test çalıştır',
  reduce_discount: 'İndirimi azalt',
  avoid_campaign: 'Kampanyayı yeniden değerlendir',
  use_bundle: 'Bundle dene',
  set_cart_threshold: 'Sepet eşiği belirle',
  review_free_shipping: 'Ücretsiz kargoyu gözden geçir',
  reduce_ad_cost: 'Reklam maliyetini azalt',
}

const priorityStyles: Record<CampaignAlternative['priority'], string> = {
  high: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
}

const priorityLabels: Record<CampaignAlternative['priority'], string> = {
  high: 'Yüksek öncelik',
  medium: 'Orta öncelik',
  low: 'Düşük öncelik',
}

function RiskBadge({ level }: { level: CampaignSimulationRiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[level]}`}
    >
      {riskLabels[level]}
    </span>
  )
}

function getRiskRank(level: CampaignSimulationRiskLevel) {
  const rank: Record<CampaignSimulationRiskLevel, number> = {
    safe: 1,
    watch: 2,
    risky: 3,
    critical: 4,
  }

  return rank[level]
}

function formatLift(value: number | null) {
  if (value === null) {
    return 'Ulaşılamaz'
  }

  return formatPercent(Math.max(0, value))
}

function formatBreakEvenUnits(value: number | null) {
  if (value === null) {
    return 'Ulaşılamaz'
  }

  return formatNumber(value)
}

function getProfitTone(value: number) {
  if (value <= 0) {
    return 'text-rose-200'
  }

  if (value < 50) {
    return 'text-amber-200'
  }

  return 'text-emerald-200'
}

function CampaignSimulationCard({ result }: { result: CampaignSimulationResult }) {
  const profitDropRatio =
    result.currentUnitNetProfit > 0
      ? result.profitDropPerUnit / result.currentUnitNetProfit
      : 0

  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{result.campaignName}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {result.productName} · {campaignTypeLabels[result.campaignType]}
          </p>
        </div>
        <RiskBadge level={result.riskLevel} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Mevcut fiyat</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.currentPrice)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Kampanya fiyatı</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.campaignPrice)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Öncesi birim net kâr</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.currentUnitNetProfit)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Sonrası birim net kâr</p>
          <p className={`mt-2 text-base font-semibold ${getProfitTone(result.campaignUnitNetProfit)}`}>
            {formatCurrency(result.campaignUnitNetProfit)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Gerekli satış artışı {formatLift(result.requiredSalesLift)}</span>
          <span>Beklenen artış {formatPercent(result.expectedSalesLift)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={[
              'h-full rounded-full',
              result.riskLevel === 'critical'
                ? 'bg-rose-300'
                : result.riskLevel === 'risky'
                  ? 'bg-orange-300'
                  : result.riskLevel === 'watch'
                    ? 'bg-amber-300'
                    : 'bg-emerald-300',
            ].join(' ')}
            style={{ width: `${Math.min(100, Math.max(8, (1 - profitDropRatio) * 100))}%` }}
          />
        </div>
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

function AlternativeCard({
  suggestion,
}: {
  suggestion: CampaignAlternative & { campaignName: string; productName: string }
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{suggestion.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {suggestion.productName} · {suggestion.campaignName}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[suggestion.priority]}`}
        >
          {priorityLabels[suggestion.priority]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{suggestion.explanation}</p>
      <p className="mt-3 text-xs font-semibold text-emerald-100">
        {suggestion.estimatedEffect}
      </p>
    </article>
  )
}

export function KampanyaSimPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const simulationResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllCampaignSimulations(
            activeDataset.products,
            activeDataset.campaignSimulationScenarios,
          )
        : [],
    [activeDataset, analysisStatus],
  )

  const filteredResults = useMemo(
    () =>
      activeFilter === 'all'
        ? simulationResults
        : simulationResults.filter((result) => result.riskLevel === activeFilter),
    [activeFilter, simulationResults],
  )

  const riskyCampaignCount = simulationResults.filter((result) =>
    ['risky', 'critical'].includes(result.riskLevel),
  ).length
  const criticalCampaignCount = simulationResults.filter(
    (result) => result.riskLevel === 'critical',
  ).length
  const averageProfitDrop =
    simulationResults.reduce((sum, result) => sum + result.profitDropPerUnit, 0) /
    Math.max(simulationResults.length, 1)
  const highestRequiredLift = simulationResults.reduce<number | null>(
    (highest, result) => {
      if (result.requiredSalesLift === null) {
        return highest
      }

      return highest === null
        ? result.requiredSalesLift
        : Math.max(highest, result.requiredSalesLift)
    },
    null,
  )
  const safestCampaign = simulationResults
    .toSorted(
      (first, second) =>
        getRiskRank(first.riskLevel) - getRiskRank(second.riskLevel) ||
        second.campaignNetMargin - first.campaignNetMargin,
    )[0]
  const misleadingDiscounts = simulationResults
    .toSorted(
      (first, second) =>
        getRiskRank(second.riskLevel) - getRiskRank(first.riskLevel) ||
        second.profitDropPerUnit - first.profitDropPerUnit,
    )
    .slice(0, 3)
  const campaignFindings = simulationResults
    .toSorted(
      (first, second) =>
        getRiskRank(second.riskLevel) - getRiskRank(first.riskLevel) ||
        second.profitDropPerUnit - first.profitDropPerUnit,
    )
    .slice(0, 3)
  const alternativeSuggestions = simulationResults
    .flatMap((result) =>
      result.alternatives.map((suggestion) => ({
        ...suggestion,
        campaignName: result.campaignName,
        productName: result.productName,
        riskRank: getRiskRank(result.riskLevel),
      })),
    )
    .toSorted(
      (first, second) =>
        second.riskRank - first.riskRank ||
        ['high', 'medium', 'low'].indexOf(first.priority) -
          ['high', 'medium', 'low'].indexOf(second.priority),
    )
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <ModuleHero
        label="Kampanya sonrası net kâr simülasyonu"
        title="KampanyaSim"
        question="Kampanya sonrası cebinde ne kalıyor?"
        description="İndirim, kupon ve ücretsiz kargo kampanyalarının gerçek net kâra etkisini simüle edin."
        disclaimer="Bu modül kampanya performansı garantisi vermez; mevcut demo verisine göre karar desteği sunar."
        icon={BadgePercent}
        meta={`${activeDataset?.campaignSimulationScenarios.length ?? 0} senaryo · ${activeDataset?.products.length ?? 0} ürün`}
      />

      <AnalysisControlBar scope="module" moduleName="KampanyaSim" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="KampanyaSim" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Riskli kampanya sayısı"
          value={String(riskyCampaignCount)}
          helper="Riskli veya kritik görünen senaryolar"
          icon={ShieldAlert}
          tone={riskyCampaignCount > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Kritik kampanya sayısı"
          value={String(criticalCampaignCount)}
          helper="Birim net kâr veya marj kritik seviyede"
          icon={TrendingDown}
          tone={criticalCampaignCount > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Ortalama kâr düşüşü"
          value={formatCurrency(averageProfitDrop)}
          helper="Kampanya sonrası birim net kâr farkı"
          icon={Scale}
          tone={averageProfitDrop > 80 ? 'rose' : 'amber'}
        />
        <MetricCard
          title="En yüksek gerekli satış artışı"
          value={formatLift(highestRequiredLift)}
          helper="Aynı toplam kârı koruma eşiği"
          icon={Gauge}
          tone={highestRequiredLift !== null && highestRequiredLift > 0.5 ? 'rose' : 'amber'}
        />
        <MetricCard
          title="En güvenli kampanya tipi"
          value={
            safestCampaign ? campaignTypeLabels[safestCampaign.campaignType] : '-'
          }
          helper={safestCampaign?.campaignName ?? 'Senaryo yok'}
          icon={WalletCards}
          tone={safestCampaign?.riskLevel === 'safe' ? 'emerald' : 'amber'}
        />
      </section>

      <ModuleInsightCard
        icon={TrendingDown}
        title={
          misleadingDiscounts[0]
            ? `${misleadingDiscounts[0].campaignName} satış getirebilir; kâr tarafı yeniden kontrol edilmeli.`
            : 'Kampanya simülasyonlarında kritik kâr erimesi görünmüyor.'
        }
        description={
          misleadingDiscounts[0]
            ? `Bu senaryoda kampanya sonrası birim net kâr ${formatCurrency(misleadingDiscounts[0].campaignUnitNetProfit)}. Aynı toplam kârı korumak için gereken satış artışı ${formatLift(misleadingDiscounts[0].requiredSalesLift)}.`
            : 'Kampanya kararları yine de satış artışı ve birim net kâr birlikte okunarak değerlendirilmelidir.'
        }
        meta="KampanyaSim içgörüsü"
        tone={misleadingDiscounts[0]?.riskLevel === 'critical' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="campaign" title="KampanyaSim varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Kampanya simülasyon kartları ve filtreler"
        description="Senaryo bazlı kampanya riski ve filtreler burada açılır."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Kampanya simülasyon kartları
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const count =
                item.key === 'all'
                  ? simulationResults.length
                  : simulationResults.filter((result) => result.riskLevel === item.key)
                      .length
              const isActive = activeFilter === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={[
                    'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                  ].join(' ')}
                >
                  {item.label} · {count}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredResults.map((result) => (
            <CampaignSimulationCard key={result.scenarioId} result={result} />
          ))}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Kampanya detay tablosu"
        description="İndirim, kupon, ücretsiz kargo ve break-even hesapları."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex items-center gap-2 text-emerald-200">
          <Tags className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-white">Kampanya detay tablosu</h2>
        </div>
        <div
          className="pinti-scroll-region mt-5 overflow-x-auto"
          tabIndex={0}
          aria-label="Kampanya simülasyonu tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1280px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3">Kampanya</th>
                <th className="pb-3">Ürün</th>
                <th className="pb-3">Tip</th>
                <th className="pb-3">İndirim</th>
                <th className="pb-3">Kupon</th>
                <th className="pb-3">Ücretsiz kargo</th>
                <th className="pb-3">Mevcut net kâr</th>
                <th className="pb-3">Kampanya net kâr</th>
                <th className="pb-3">Break-even adet</th>
                <th className="pb-3">Gerekli satış artışı</th>
                <th className="pb-3">Beklenen satış artışı</th>
                <th className="pb-3">Risk</th>
                <th className="pb-3">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredResults.map((result) => {
                const scenario = activeDataset.campaignSimulationScenarios.find(
                  (item) => item.id === result.scenarioId,
                )

                return (
                  <tr key={result.scenarioId}>
                    <td className="py-3">
                      <p className="font-medium text-white">{result.campaignName}</p>
                      <p className="mt-1 text-xs text-slate-500">{result.scenarioId}</p>
                    </td>
                    <td className="py-3 text-slate-400">{result.productName}</td>
                    <td className="py-3 text-slate-300">
                      {campaignTypeLabels[result.campaignType]}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatPercent(scenario?.discountRate ?? 0)}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatCurrency(scenario?.couponAmount ?? 0)}
                    </td>
                    <td className="py-3 text-slate-300">
                      {scenario?.freeShipping ? 'Var' : 'Yok'}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatCurrency(result.currentUnitNetProfit)}
                    </td>
                    <td className={`py-3 font-medium ${getProfitTone(result.campaignUnitNetProfit)}`}>
                      {formatCurrency(result.campaignUnitNetProfit)}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatBreakEvenUnits(result.breakEvenUnits)}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatLift(result.requiredSalesLift)}
                    </td>
                    <td className="py-3 text-slate-300">
                      {formatPercent(result.expectedSalesLift)}
                    </td>
                    <td className="py-3">
                      <RiskBadge level={result.riskLevel} />
                    </td>
                    <td className="py-3 text-slate-300">
                      {actionLabels[result.recommendedAction]}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="İndirim yorumu ve alternatifler"
        description="Kârı eritebilecek kampanyalar ve daha kontrollü seçenekler."
      >
      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-amber-200">
            <TrendingDown className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-white">İndirim yanıltabilir</h2>
          </div>
          <div className="mt-4 space-y-3">
            {misleadingDiscounts.map((result) => (
              <div
                key={result.scenarioId}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{result.campaignName}</p>
                  <RiskBadge level={result.riskLevel} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.campaignName} satış adedini artırabilir; ancak mevcut
                  verilere göre aynı toplam kârı korumak için satışın yaklaşık{' '}
                  <span className="font-semibold text-slate-200">
                    {result.requiredSalesLift === null
                      ? 'ulaşılamaz seviyeye'
                      : `${(1 + Math.max(0, result.requiredSalesLift)).toLocaleString(
                          'tr-TR',
                          { maximumFractionDigits: 1 },
                        )} katına`}
                  </span>{' '}
                  çıkması gerekir.
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-emerald-200">
            <PackagePlus className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-white">Alternatif öneriler</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Fiyatı ya da indirimi doğrudan büyütmeden önce değerlendirilebilecek daha
            kontrollü kampanya seçenekleri.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {alternativeSuggestions.map((suggestion, index) => (
              <AlternativeCard
                key={`${suggestion.campaignName}-${suggestion.type}-${index}`}
                suggestion={suggestion}
              />
            ))}
          </div>
        </article>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Pinti’nin kampanya notları"
        description="Öne çıkan kampanya bulguları için kısa karar destek yorumu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex items-center gap-2 text-emerald-100">
          <Scale className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-white">Pinti yorumu</h2>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          {campaignFindings.map((result) => (
            <article
              key={result.scenarioId}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            >
              <p className="text-sm font-semibold text-emerald-100">
                {result.productName}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {result.campaignName} senaryosu kampanya sonrası net marjı{' '}
                {formatPercent(result.campaignNetMargin)} seviyesine çekiyor. Kampanya
                genişletilmeden önce {actionLabels[result.recommendedAction].toLowerCase()}{' '}
                seçeneği değerlendirilebilir.
              </p>
            </article>
          ))}
        </div>
      </section>
      </CollapsibleSection>
        </>
      )}
    </div>
  )
}
