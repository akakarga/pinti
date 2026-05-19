import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CircleDollarSign,
  Compass,
  Filter,
  Gauge,
  HandCoins,
  Scale,
  ShieldAlert,
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
import { calculateAllProductProfits } from '../services/karPusulaService'
import type {
  ProductHealthStatus,
  ProductProfitResult,
  RecommendedProductAction,
} from '../types'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../utils/formatters'

type FilterKey = 'all' | ProductHealthStatus

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'healthy', label: 'Sağlıklı' },
  { key: 'watch', label: 'Takip' },
  { key: 'risky', label: 'Riskli' },
  { key: 'loss', label: 'Zarar' },
]

const healthStyles: Record<ProductHealthStatus, string> = {
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  risky: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  loss: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const healthLabels: Record<ProductHealthStatus, string> = {
  healthy: 'Sağlıklı',
  watch: 'Takip',
  risky: 'Riskli',
  loss: 'Zarar',
}

const actionLabels: Record<RecommendedProductAction, string> = {
  increase_price: 'Fiyatı gözden geçir',
  reduce_ads: 'Reklamı kontrollü azalt',
  monitor: 'İzlemeye devam et',
  review_returns: 'İadeleri incele',
  reorder_carefully: 'Stoku dikkatli yenile',
  pause_promotion: 'Promosyonu duraklatmayı değerlendir',
}

function HealthBadge({ status }: { status: ProductHealthStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${healthStyles[status]}`}
    >
      {healthLabels[status]}
    </span>
  )
}

function ProductProfitCard({ result }: { result: ProductProfitResult }) {
  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{result.productName}</h3>
          <p className="mt-1 text-sm text-slate-400">{result.category}</p>
        </div>
        <HealthBadge status={result.healthStatus} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Net kâr</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatSignedCurrency(result.netProfit)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Net marj</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatPercent(result.netMargin)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Skor</p>
          <p className="mt-2 text-base font-semibold text-white">{result.healthScore}/100</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-300"
            style={{ width: `${result.healthScore}%` }}
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

function ProductComment({ result }: { result: ProductProfitResult }) {
  const comment =
    result.netProfit < 0
      ? `${result.productName} için mevcut demo verisinde net kâr negatif görünüyor; fiyat, reklam ve iade etkisi birlikte kontrol edilebilir.`
      : `${result.productName} ciro üretiyor ancak reklam, kargo veya iade etkisi net marjı baskılıyor olabilir.`

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{result.productName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Net marj {formatPercent(result.netMargin)} · İade oranı{' '}
            {formatPercent(result.returnRate)}
          </p>
        </div>
        <HealthBadge status={result.healthStatus} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{comment}</p>
    </article>
  )
}

export function KarPusulaPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const productResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllProductProfits(
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
        ? productResults
        : productResults.filter((result) => result.healthStatus === activeFilter),
    [activeFilter, productResults],
  )

  const totalRevenue = productResults.reduce((sum, result) => sum + result.revenue, 0)
  const totalNetProfit = productResults.reduce((sum, result) => sum + result.netProfit, 0)
  const averageNetMargin = totalRevenue > 0 ? totalNetProfit / totalRevenue : 0
  const lowProfitCount = productResults.filter(
    (result) => result.netMargin < 0.08 || result.healthStatus === 'risky',
  ).length
  const lossCount = productResults.filter((result) => result.healthStatus === 'loss').length
  const riskiestProducts = productResults
    .toSorted((first, second) => first.healthScore - second.healthScore)
    .slice(0, 3)
  const riskiestProduct = riskiestProducts[0]

  return (
    <div className="space-y-6">
      <ModuleHero
        label="Ürün bazlı kâr pusulası"
        title="KârPusula"
        question="Bu ürün gerçekten kâr ettiriyor mu?"
        description="Ürün bazlı gerçek net kârı; komisyon, kargo, reklam ve iade etkisiyle birlikte görün."
        disclaimer="Bu modül finansal tavsiye vermez; mevcut demo verisine göre karar desteği sunar."
        icon={Compass}
        meta={`${activeDataset?.products.length ?? 0} ürün · ${activeDataset?.orders.length ?? 0} sipariş`}
      />

      <AnalysisControlBar scope="module" moduleName="KârPusula" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="KârPusula" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Toplam ciro"
          value={formatCurrency(totalRevenue)}
          helper="KârPusula sipariş seti"
          icon={CircleDollarSign}
          tone="cyan"
        />
        <MetricCard
          title="Toplam net kâr"
          value={formatSignedCurrency(totalNetProfit)}
          helper="Komisyon, kargo, reklam, iade dahil"
          icon={HandCoins}
          tone={totalNetProfit >= 0 ? 'emerald' : 'rose'}
        />
        <MetricCard
          title="Ortalama net marj"
          value={formatPercent(averageNetMargin)}
          helper="Toplam net kâr / toplam ciro"
          icon={Gauge}
          tone={averageNetMargin >= 0.15 ? 'emerald' : 'amber'}
        />
        <MetricCard
          title="Kârı düşük ürün sayısı"
          value={String(lowProfitCount)}
          helper="Net marjı baskılanan ürünler"
          icon={TrendingDown}
          tone="amber"
        />
        <MetricCard
          title="Zarar eden ürün sayısı"
          value={String(lossCount)}
          helper="Mevcut demo verisine göre"
          icon={ShieldAlert}
          tone={lossCount > 0 ? 'rose' : 'emerald'}
        />
      </section>

      <ModuleInsightCard
        icon={Scale}
        title={riskiestProduct ? `${riskiestProduct.productName} önce kontrol edilmeli.` : 'Ürün kârında belirgin bir risk görünmüyor.'}
        description={
          riskiestProduct
            ? `${riskiestProduct.productName} için net marj ${formatPercent(riskiestProduct.netMargin)}. Reklam, kargo ve iade etkisi birlikte okunmadan sadece ciroya bakmak yanıltıcı olabilir.`
            : 'Mevcut veri setinde ürün kârı dengeli görünüyor; detay kartları yine de ürün bazında kontrol için açılabilir.'
        }
        meta="KârPusula içgörüsü"
        tone={riskiestProduct?.healthStatus === 'loss' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="profit" title="KârPusula varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Ürün kartları ve filtreler"
        description="Ürün bazlı skorlar ve durum filtreleri burada açılır."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">Ürün kâr kartları</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const count =
                item.key === 'all'
                  ? productResults.length
                  : productResults.filter((result) => result.healthStatus === item.key).length
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
              <ProductProfitCard key={result.productId} result={result} />
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-slate-400 xl:col-span-2">
              Bu filtrede ürün görünmüyor. Pinti şimdilik burada sessiz; farklı bir durum seçerek
              ürünleri inceleyebilirsin.
            </div>
          )}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Ürün bazlı kâr kırılımı"
        description="Ciro, maliyet, komisyon, kargo, reklam ve iade etkisi tablosu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Detay tablo</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Ürün bazlı kâr kırılımı</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Ciro güzel görünebilir; Pinti burada cebinde kalan kısmı görünür kılar.
          </p>
        </div>

        <div
          className="pinti-scroll-region overflow-x-auto"
          tabIndex={0}
          aria-label="Ürün kâr tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1220px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3 font-semibold">Ürün</th>
                <th className="pb-3 font-semibold">Satılan adet</th>
                <th className="pb-3 font-semibold">Ciro</th>
                <th className="pb-3 font-semibold">Ürün maliyeti</th>
                <th className="pb-3 font-semibold">Komisyon</th>
                <th className="pb-3 font-semibold">Kargo</th>
                <th className="pb-3 font-semibold">Reklam</th>
                <th className="pb-3 font-semibold">İade etkisi</th>
                <th className="pb-3 font-semibold">Net kâr</th>
                <th className="pb-3 font-semibold">Net marj</th>
                <th className="pb-3 font-semibold">Skor</th>
                <th className="pb-3 font-semibold">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredResults.map((result) => (
                <tr key={result.productId}>
                  <td className="py-3">
                    <p className="font-medium text-white">{result.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">{result.category}</p>
                  </td>
                  <td className="py-3 font-mono text-slate-300">{result.unitsSold}</td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.revenue)}
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
                    {formatCurrency(result.adSpend)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.returnImpact)}
                  </td>
                  <td className="py-3 font-mono font-semibold text-white">
                    {formatSignedCurrency(result.netProfit)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatPercent(result.netMargin)}
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
        title="Manuel kontrol önerilen ürünler"
        description="Pinti’nin ürün bazında öne çıkardığı kısa kontrol notları."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-amber-200">
              <Scale className="h-4 w-4" />
              <p className="text-sm font-semibold">Pinti yorumu</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Manuel kontrol önerilen ürünler
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300">
            Karar desteği
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {riskiestProducts.map((result) => (
            <ProductComment key={result.productId} result={result} />
          ))}
        </div>
      </section>
      </CollapsibleSection>
        </>
      )}
    </div>
  )
}
