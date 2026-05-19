import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  PackageOpen,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Truck,
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
import {
  analyzeReturnReasons,
  calculateAllProductReturnAnalysis,
  calculateReturnLoss,
  calculateReturnRiskResults,
  getManualReviewReturns,
} from '../services/iadeKalkanService'
import type {
  ProductReturnResult,
  RecommendedReturnAction,
  ReturnHealthStatus,
  ReturnReasonInsight,
  ReturnRiskLevel,
  ReturnRiskResult,
} from '../types'
import { formatCurrency, formatPercent } from '../utils/formatters'

type FilterKey = 'all' | ReturnRiskLevel | 'manual'

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'low', label: 'Düşük risk' },
  { key: 'medium', label: 'Orta risk' },
  { key: 'high', label: 'Yüksek risk' },
  { key: 'critical', label: 'Kritik' },
  { key: 'manual', label: 'Manuel kontrol' },
]

const healthStyles: Record<ReturnHealthStatus, string> = {
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  risky: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const riskStyles: Record<ReturnRiskLevel, string> = {
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  high: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const healthLabels: Record<ReturnHealthStatus, string> = {
  healthy: 'Sağlıklı',
  watch: 'Takip',
  risky: 'Riskli',
  critical: 'Kritik',
}

const riskLabels: Record<ReturnRiskLevel, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
}

const actionLabels: Record<RecommendedReturnAction, string> = {
  monitor: 'İzlemeye devam et',
  review_product_page: 'Ürün sayfasını incele',
  improve_packaging: 'Paketlemeyi iyileştir',
  manual_review: 'Manuel kontrol',
  review_quality_control: 'Kalite kontrolü incele',
  clarify_description: 'Açıklamayı netleştir',
  check_delivery_process: 'Teslimat sürecini kontrol et',
}

function ProductHealthBadge({ status }: { status: ReturnHealthStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${healthStyles[status]}`}
    >
      {healthLabels[status]}
    </span>
  )
}

function ReturnRiskBadge({ level }: { level: ReturnRiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[level]}`}
    >
      {riskLabels[level]}
    </span>
  )
}

function ProductReturnCard({ result }: { result: ProductReturnResult }) {
  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{result.productName}</h3>
          <p className="mt-1 text-sm text-slate-400">{result.category}</p>
        </div>
        <ProductHealthBadge status={result.riskLevel} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">Sipariş</p>
          <p className="mt-2 text-base font-semibold text-white">{result.totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">İade</p>
          <p className="mt-2 text-base font-semibold text-white">{result.totalReturns}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">İade oranı</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatPercent(result.returnRate)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
          <p className="text-xs text-slate-500">İade kaybı</p>
          <p className="mt-2 text-base font-semibold text-white">
            {formatCurrency(result.totalReturnLoss)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={[
              'h-full rounded-full',
              result.riskLevel === 'critical'
                ? 'bg-rose-300'
                : result.riskLevel === 'risky'
                  ? 'bg-orange-300'
                  : 'bg-emerald-300',
            ].join(' ')}
            style={{ width: `${result.healthScore}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Sağlık skoru {result.healthScore}/100 · Ana neden{' '}
          {result.mainReasons[0] ?? 'Sinyal yok'}
        </p>
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

function ReasonCard({ insight }: { insight: ReturnReasonInsight }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{insight.reason}</h3>
          <p className="mt-1 text-sm text-slate-500">{insight.count} kayıt</p>
        </div>
        <span className="font-mono text-sm font-semibold text-white">
          {formatCurrency(insight.estimatedLoss)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{insight.explanation}</p>
      <p className="mt-3 text-sm font-semibold text-emerald-100">
        {actionLabels[insight.suggestedAction]}
      </p>
    </article>
  )
}

function PintiComment({ result }: { result: ReturnRiskResult }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{result.productName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {result.returnId} · {result.customerName}
          </p>
        </div>
        <ReturnRiskBadge level={result.riskLevel} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {result.productName} için mevcut verilere göre manuel kontrol sinyali var.
        {result.riskSignals.length > 0
          ? ` Öne çıkan sinyal: ${result.riskSignals[0].toLocaleLowerCase('tr-TR')}.`
          : ' Sipariş ve iade bağlamı birlikte incelenebilir.'}
      </p>
    </article>
  )
}

export function IadeKalkanPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const productReturnResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllProductReturnAnalysis(
            activeDataset.products,
            activeDataset.orders,
            activeDataset.returns,
          )
        : [],
    [activeDataset, analysisStatus],
  )
  const returnRiskResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateReturnRiskResults(
            activeDataset.returns,
            activeDataset.products,
            activeDataset.orders,
            activeDataset.customers,
            activeDataset.paymentDisputes,
          )
        : [],
    [activeDataset, analysisStatus],
  )
  const reasonInsights = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? analyzeReturnReasons(activeDataset.returns)
        : [],
    [activeDataset, analysisStatus],
  )
  const manualReviewReturns = useMemo(
    () => getManualReviewReturns(returnRiskResults),
    [returnRiskResults],
  )

  const filteredRiskResults = useMemo(() => {
    if (activeFilter === 'all') {
      return returnRiskResults
    }

    if (activeFilter === 'manual') {
      return returnRiskResults.filter((result) => result.manualReviewRecommended)
    }

    return returnRiskResults.filter((result) => result.riskLevel === activeFilter)
  }, [activeFilter, returnRiskResults])

  const completedOrders =
    activeDataset?.orders.filter((order) => order.status === 'completed') ?? []
  const totalReturnLoss = (activeDataset?.returns ?? []).reduce(
    (sum, returnRequest) => sum + calculateReturnLoss(returnRequest).totalLoss,
    0,
  )
  const overallReturnRate =
    completedOrders.length > 0 ? (activeDataset?.returns.length ?? 0) / completedOrders.length : 0
  const highRiskCount = returnRiskResults.filter(
    (result) => result.riskLevel === 'high' || result.riskLevel === 'critical',
  ).length
  const topRiskComments = returnRiskResults
    .toSorted((first, second) => second.riskScore - first.riskScore)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <ModuleHero
        label="İade riski ve kayıp kontrolü"
        title="İadeKalkan"
        question="İadeler kârı nerede eritiyor?"
        description="İade oranlarını, iade kaynaklı finansal kayıpları ve manuel kontrol gerektiren risk sinyallerini görün."
        disclaimer="Bu modül kesin fraud tespiti yapmaz; mevcut demo verisine göre risk sinyali ve karar desteği sunar."
        icon={ShieldCheck}
        meta={`${activeDataset?.returns.length ?? 0} iade · ${activeDataset?.customers.length ?? 0} müşteri`}
        tone="rose"
      />

      <AnalysisControlBar scope="module" moduleName="İadeKalkan" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="İadeKalkan" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Toplam iade"
          value={String(activeDataset.returns.length)}
          helper="Aktif iade kayıtları"
          icon={RotateCcw}
          tone="amber"
        />
        <MetricCard
          title="Genel iade oranı"
          value={formatPercent(overallReturnRate)}
          helper="İade / sipariş oranı"
          icon={PackageOpen}
          tone={overallReturnRate > 0.12 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="Tahmini iade kaybı"
          value={formatCurrency(totalReturnLoss)}
          helper="Refund, iade kargo, stok kaybı"
          icon={WalletCards}
          tone="rose"
        />
        <MetricCard
          title="Manuel kontrol önerilen"
          value={String(manualReviewReturns.length)}
          helper="Yüksek sinyal taşıyan iadeler"
          icon={AlertTriangle}
          tone="amber"
        />
        <MetricCard
          title="Yüksek riskli kayıt sayısı"
          value={String(highRiskCount)}
          helper="Yüksek veya kritik risk seviyesi"
          icon={ShieldAlert}
          tone={highRiskCount > 0 ? 'rose' : 'emerald'}
        />
      </section>

      <ModuleInsightCard
        icon={AlertTriangle}
        title={
          topRiskComments[0]
            ? `${topRiskComments[0].productName} manuel kontrol için öne çıkıyor.`
            : 'İade tarafında kritik manuel kontrol sinyali görünmüyor.'
        }
        description={
          topRiskComments[0]
            ? `${topRiskComments[0].returnId} kaydında ${topRiskComments[0].riskSignals[0]?.toLocaleLowerCase('tr-TR') ?? 'iade bağlamı'} sinyali var. Pinti kesin tespit yapmaz; bu kayıt manuel kontrol için öne çıkar.`
            : 'İade oranı yine de ürün bazında takip edilmeli; yüksek hacimli ürünlerde küçük iade etkileri net kârı hızla azaltabilir.'
        }
        meta="İadeKalkan içgörüsü"
        tone={topRiskComments[0]?.riskLevel === 'critical' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="returns" title="İadeKalkan varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Ürün bazlı iade kartları"
        description="Ürünlerin iade oranı, iade kaybı ve önerilen kontrol alanları."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-200">Ürün bazlı analiz</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Ürün bazlı iade kartları
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Pinti burada iadenin biraz pahalıya patladığı ürünleri görünür kılar.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {productReturnResults.map((result) => (
            <ProductReturnCard key={result.productId} result={result} />
          ))}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Riskli iade kayıtları"
        description="Filtreler ve kayıt bazlı iade risk tablosu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Riskli iade kayıtları
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const count =
                item.key === 'all'
                  ? returnRiskResults.length
                  : item.key === 'manual'
                    ? returnRiskResults.filter((result) => result.manualReviewRecommended)
                        .length
                    : returnRiskResults.filter((result) => result.riskLevel === item.key)
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

        <div
          className="pinti-scroll-region mt-5 overflow-x-auto"
          tabIndex={0}
          aria-label="İade tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1320px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3 font-semibold">İade ID</th>
                <th className="pb-3 font-semibold">Sipariş</th>
                <th className="pb-3 font-semibold">Müşteri</th>
                <th className="pb-3 font-semibold">Ürün</th>
                <th className="pb-3 font-semibold">Refund</th>
                <th className="pb-3 font-semibold">İade kargo</th>
                <th className="pb-3 font-semibold">Risk skoru</th>
                <th className="pb-3 font-semibold">Risk seviyesi</th>
                <th className="pb-3 font-semibold">Risk sinyalleri</th>
                <th className="pb-3 font-semibold">Öneri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredRiskResults.map((result) => (
                <tr key={result.returnId}>
                  <td className="py-3 font-medium text-white">{result.returnId}</td>
                  <td className="py-3 text-slate-300">{result.orderId}</td>
                  <td className="py-3 text-slate-300">{result.customerName}</td>
                  <td className="py-3 text-slate-400">{result.productName}</td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.refundAmount)}
                  </td>
                  <td className="py-3 font-mono text-slate-300">
                    {formatCurrency(result.returnShippingCost)}
                  </td>
                  <td className="py-3 font-mono font-semibold text-white">
                    {result.riskScore}/100
                  </td>
                  <td className="py-3">
                    <ReturnRiskBadge level={result.riskLevel} />
                  </td>
                  <td className="py-3 text-slate-300">
                    <div className="flex max-w-md flex-wrap gap-2">
                      {result.riskSignals.length > 0 ? (
                        result.riskSignals.map((signal) => (
                          <span
                            key={signal}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-300"
                          >
                            {signal}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500">Belirgin sinyal yok</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">
                    {actionLabels[result.suggestedAction]}
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
        title="İade nedenleri ve Pinti yorumu"
        description="İade nedenleri analizi ve manuel kontrol notları."
      >
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="mb-5 flex items-center gap-2 text-amber-200">
            <Truck className="h-4 w-4" />
            <p className="text-sm font-semibold">İade nedenleri analizi</p>
          </div>
          <div className="grid gap-3">
            {reasonInsights.map((insight) => (
              <ReasonCard key={insight.reason} insight={insight} />
            ))}
          </div>
        </article>

        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-rose-200">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Pinti yorumu</p>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Manuel kontrol sırasına alınabilecek kayıtlar
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300">
              Karar desteği
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="grid gap-3">
            {topRiskComments.map((result) => (
              <PintiComment key={result.returnId} result={result} />
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
