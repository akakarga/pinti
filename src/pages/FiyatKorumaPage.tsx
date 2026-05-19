import { useMemo, useState } from 'react'
import {
  BadgePercent,
  Filter,
  Gauge,
  Info,
  PackagePlus,
  Scale,
  ShieldCheck,
  Tags,
  TrendingDown,
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
import { calculateAllPriceProtection } from '../services/fiyatKorumaService'
import type {
  PriceAlternativeSuggestion,
  PriceProtectionResult,
  PriceRiskLevel,
  RecommendedPriceAction,
} from '../types'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../utils/formatters'

type FilterKey = 'all' | PriceRiskLevel

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'safe', label: 'Güvenli' },
  { key: 'watch', label: 'Takip' },
  { key: 'risky', label: 'Riskli' },
  { key: 'critical', label: 'Kritik' },
]

const riskStyles: Record<PriceRiskLevel, string> = {
  safe: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  risky: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const riskLabels: Record<PriceRiskLevel, string> = {
  safe: 'Güvenli',
  watch: 'Takip',
  risky: 'Riskli',
  critical: 'Kritik',
}

const actionLabels: Record<RecommendedPriceAction, string> = {
  monitor: 'İzlemeye devam et',
  review_price: 'Fiyatı gözden geçir',
  increase_price_carefully: 'Fiyatı dikkatli değerlendir',
  reduce_ad_cost: 'Reklam maliyetini azalt',
  create_bundle: 'Bundle oluştur',
  review_discount: 'İndirimi gözden geçir',
  set_cart_threshold: 'Sepet eşiği belirle',
}

const priorityStyles: Record<PriceAlternativeSuggestion['priority'], string> = {
  high: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
}

const priorityLabels: Record<PriceAlternativeSuggestion['priority'], string> = {
  high: 'Yüksek öncelik',
  medium: 'Orta öncelik',
  low: 'Düşük öncelik',
}

function RiskBadge({ level }: { level: PriceRiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[level]}`}
    >
      {riskLabels[level]}
    </span>
  )
}

function getRiskRank(level: PriceRiskLevel) {
  const rank: Record<PriceRiskLevel, number> = {
    safe: 1,
    watch: 2,
    risky: 3,
    critical: 4,
  }

  return rank[level]
}

function ProductPriceCard({ result }: { result: PriceProtectionResult }) {
  const gapRatio =
    result.minimumHealthyPrice > 0 ? result.priceGap / result.minimumHealthyPrice : 0

  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{result.productName}</h3>
          <p className="mt-1 text-sm text-slate-400">{result.category}</p>
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
          <p className="text-xs text-slate-500">Min. sağlıklı fiyat</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.minimumHealthyPrice)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Fiyat farkı</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.priceGap)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Net marj</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatPercent(result.currentNetMargin)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Hedef net marj {formatPercent(result.targetNetMargin)}</span>
          <span>Fark oranı {formatPercent(gapRatio)}</span>
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
            style={{ width: `${Math.min(100, Math.max(8, (1 - gapRatio) * 100))}%` }}
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

function AlternativeCard({ suggestion }: { suggestion: PriceAlternativeSuggestion }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{suggestion.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{suggestion.estimatedEffect}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[suggestion.priority]}`}
        >
          {priorityLabels[suggestion.priority]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{suggestion.explanation}</p>
    </article>
  )
}

export function FiyatKorumaPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const priceResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllPriceProtection(
            activeDataset.products,
            activeDataset.orders,
            activeDataset.returns,
            activeDataset.campaigns,
          )
        : [],
    [activeDataset, analysisStatus],
  )

  const filteredResults = useMemo(
    () =>
      activeFilter === 'all'
        ? priceResults
        : priceResults.filter((result) => result.riskLevel === activeFilter),
    [activeFilter, priceResults],
  )

  const averageCurrentNetMargin =
    priceResults.reduce((sum, result) => sum + result.currentNetMargin, 0) /
    Math.max(priceResults.length, 1)
  const belowMinimumCount = priceResults.filter((result) => result.priceGap > 0).length
  const criticalRiskCount = priceResults.filter(
    (result) => result.riskLevel === 'critical',
  ).length
  const totalPriceGapRisk = priceResults.reduce((sum, result) => sum + result.priceGap, 0)
  const highestRiskProduct = priceResults.toSorted(
    (first, second) =>
      getRiskRank(second.riskLevel) - getRiskRank(first.riskLevel) ||
      second.priceGap - first.priceGap,
  )[0]
  const criticalFindings = priceResults
    .toSorted(
      (first, second) =>
        getRiskRank(second.riskLevel) - getRiskRank(first.riskLevel) ||
        second.priceGap - first.priceGap,
    )
    .slice(0, 3)
  const alternativeSuggestions = priceResults
    .flatMap((result) =>
      result.alternatives.map((suggestion) => ({
        ...suggestion,
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
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <ModuleHero
        label="Minimum sağlıklı fiyat kontrolü"
        title="FiyatKoruma"
        question="Bu fiyatla satış sağlıklı mı?"
        description="Ürün fiyatlarını komisyon, kargo, reklam, iade ve hedef net marj etkisiyle birlikte değerlendirin."
        disclaimer="Bu modül fiyatlandırma tavsiyesi vermez; mevcut demo verisine göre karar desteği sunar."
        icon={Tags}
        meta={`${activeDataset?.products.length ?? 0} ürün · ${activeDataset?.orders.length ?? 0} sipariş`}
      />

      <AnalysisControlBar scope="module" moduleName="FiyatKoruma" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="FiyatKoruma" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Ortalama mevcut net marj"
          value={formatPercent(averageCurrentNetMargin)}
          helper="Komisyon, kargo, reklam ve iade dahil"
          icon={Gauge}
          tone={averageCurrentNetMargin >= 0.18 ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Minimum fiyat altında kalan ürün"
          value={String(belowMinimumCount)}
          helper="Mevcut fiyatı hedef tabanın altında"
          icon={TrendingDown}
          tone={belowMinimumCount > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Kritik fiyat riski olan ürün"
          value={String(criticalRiskCount)}
          helper="Marj açığı yüksek görünenler"
          icon={ShieldCheck}
          tone={criticalRiskCount > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Toplam fiyat farkı riski"
          value={formatCurrency(totalPriceGapRisk)}
          helper="Minimum fiyat altı toplam açık"
          icon={Scale}
          tone={totalPriceGapRisk > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="En yüksek fiyat riski"
          value={highestRiskProduct?.productName ?? '-'}
          helper={`${formatCurrency(highestRiskProduct?.priceGap ?? 0)} fiyat farkı`}
          icon={BadgePercent}
          tone={highestRiskProduct?.riskLevel === 'critical' ? 'rose' : 'amber'}
        />
      </section>

      <ModuleInsightCard
        icon={TrendingDown}
        title={
          highestRiskProduct
            ? `${highestRiskProduct.productName} minimum sağlıklı fiyatın altında.`
            : 'Fiyat tarafında belirgin bir açık görünmüyor.'
        }
        description={
          highestRiskProduct
            ? `Mevcut fiyat ile sağlıklı fiyat eşiği arasında ${formatSignedCurrency(highestRiskProduct.priceGap)} fark var. Fiyat kararı değil; kârı etkileyen maliyet ve indirim sinyali olarak okunmalı.`
            : 'Ürün fiyatları hedef marjı karşılıyor görünse de kampanya ve reklam etkisi değiştikçe tablo yeniden okunmalı.'
        }
        meta="FiyatKoruma içgörüsü"
        tone={highestRiskProduct?.riskLevel === 'critical' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="pricing" title="FiyatKoruma varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Ürün fiyat kartları ve filtreler"
        description="Minimum fiyat riski ve ürün bazlı fiyat kartları."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Ürün fiyat kartları
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const count =
                item.key === 'all'
                  ? priceResults.length
                  : priceResults.filter((result) => result.riskLevel === item.key).length
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
            <ProductPriceCard key={result.productId} result={result} />
          ))}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Minimum fiyat ve maliyet kırılımı"
        description="Ürün fiyatı, maliyetler, hedef marj ve risk tablosu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Fiyat detay tablosu</p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Minimum fiyat ve maliyet kırılımı
          </h2>
        </div>
        <div
          className="pinti-scroll-region mt-5 overflow-x-auto"
          tabIndex={0}
          aria-label="Fiyat tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1220px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3">Ürün</th>
                <th className="pb-3">Mevcut fiyat</th>
                <th className="pb-3">Minimum sağlıklı fiyat</th>
                <th className="pb-3">Fark</th>
                <th className="pb-3">Ürün maliyeti</th>
                <th className="pb-3">Komisyon</th>
                <th className="pb-3">Kargo</th>
                <th className="pb-3">Reklam etkisi</th>
                <th className="pb-3">İade etkisi</th>
                <th className="pb-3">Mevcut net marj</th>
                <th className="pb-3">Hedef net marj</th>
                <th className="pb-3">Risk</th>
                <th className="pb-3">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {priceResults.map((result) => (
                <tr key={result.productId}>
                  <td className="py-3">
                    <p className="font-medium text-white">{result.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">{result.category}</p>
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.currentPrice)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.minimumHealthyPrice)}
                  </td>
                  <td className="py-3 font-semibold text-slate-100">
                    {formatSignedCurrency(result.priceGap)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.unitCost)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatPercent(result.commissionRate)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.averageShippingCost)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.expectedAdCostPerUnit)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.expectedReturnCostPerUnit)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatPercent(result.currentNetMargin)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatPercent(result.targetNetMargin)}
                  </td>
                  <td className="py-3">
                    <RiskBadge level={result.riskLevel} />
                  </td>
                  <td className="max-w-[220px] py-3 text-slate-400">
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
        title="Alternatifler ve Pinti yorumu"
        description="Fiyat dışı seçenekler ve öne çıkan fiyat bulguları."
      >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-200">Alternatif öneriler</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Fiyat artırmadan denenebilecek yollar
              </h2>
            </div>
            <PackagePlus className="h-5 w-5 text-amber-200" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pinti bu bölümde kesin fiyat talimatı vermez; fiyat dışı aksiyonları karar
            desteği olarak sıralar.
          </p>
          <div className="mt-5 space-y-3">
            {alternativeSuggestions.map((suggestion) => (
              <div key={`${suggestion.productName}-${suggestion.type}`}>
                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  {suggestion.productName}
                </p>
                <AlternativeCard suggestion={suggestion} />
              </div>
            ))}
          </div>
        </article>

        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-emerald-200">
            <Info className="h-4 w-4" />
            <p className="text-sm font-semibold">Pinti yorumu</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Pinti’nin gözüne takılan fiyat bulguları
          </h2>
          <div className="mt-5 grid gap-4">
            {criticalFindings.map((result) => (
              <article
                key={result.productId}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{result.productName}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Mevcut marj {formatPercent(result.currentNetMargin)} · Hedef{' '}
                      {formatPercent(result.targetNetMargin)}
                    </p>
                  </div>
                  <RiskBadge level={result.riskLevel} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {result.productName} mevcut fiyatıyla hedef net marjın altında kalıyor
                  olabilir. Reklam, kargo veya iade etkisi azaltılmadan indirimli satış
                  dikkatle kontrol edilebilir.
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>
      </CollapsibleSection>
        </>
      )}
    </div>
  )
}
