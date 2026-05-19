import { useMemo, useState } from 'react'
import {
  CircleDollarSign,
  ClipboardCopy,
  FileText,
  Filter,
  HandCoins,
  Info,
  Landmark,
  ShieldAlert,
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
  calculateAllReconciliationResults,
  calculateDeductionSummary,
  generateMarketplaceMessageDraft,
  generateReconciliationSummary,
} from '../services/mutabakatService'
import type {
  ReconciliationDifferenceType,
  ReconciliationResult,
  ReconciliationRiskLevel,
} from '../types'
import { formatCurrency, formatSignedCurrency } from '../utils/formatters'

type FilterKey = 'all' | 'matched' | 'unexplained' | 'delayed' | 'high' | 'manual'

const filterItems: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'matched', label: 'Uyumlu' },
  { key: 'unexplained', label: 'Açıklanamayan fark' },
  { key: 'delayed', label: 'Geciken ödeme' },
  { key: 'high', label: 'Yüksek risk' },
  { key: 'manual', label: 'Manuel kontrol' },
]

const riskStyles: Record<ReconciliationRiskLevel, string> = {
  low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  high: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
}

const riskLabels: Record<ReconciliationRiskLevel, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
}

const differenceLabels: Record<ReconciliationDifferenceType, string> = {
  matched: 'Uyumlu',
  commission_difference: 'Komisyon farkı',
  shipping_deduction: 'Kargo kesintisi',
  return_deduction: 'İade kesintisi',
  campaign_deduction: 'Kampanya kesintisi',
  service_fee: 'Hizmet bedeli',
  delayed_payment: 'Geciken ödeme',
  unexplained_difference: 'Açıklanamayan fark',
  overpayment: 'Fazla ödeme',
}

const differenceStyles: Record<ReconciliationDifferenceType, string> = {
  matched: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  commission_difference: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  shipping_deduction: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  return_deduction: 'border-orange-400/30 bg-orange-400/10 text-orange-200',
  campaign_deduction: 'border-purple-300/30 bg-purple-300/10 text-purple-100',
  service_fee: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
  delayed_payment: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  unexplained_difference: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  overpayment: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
}

function RiskBadge({ level }: { level: ReconciliationRiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskStyles[level]}`}
    >
      {riskLabels[level]}
    </span>
  )
}

function DifferenceBadge({ type }: { type: ReconciliationDifferenceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${differenceStyles[type]}`}
    >
      {differenceLabels[type]}
    </span>
  )
}

function getFilteredResults(results: ReconciliationResult[], activeFilter: FilterKey) {
  if (activeFilter === 'matched') {
    return results.filter((result) => result.differenceType === 'matched')
  }

  if (activeFilter === 'unexplained') {
    return results.filter((result) => result.differenceType === 'unexplained_difference')
  }

  if (activeFilter === 'delayed') {
    return results.filter((result) => result.isDelayed)
  }

  if (activeFilter === 'high') {
    return results.filter(
      (result) => result.riskLevel === 'high' || result.riskLevel === 'critical',
    )
  }

  if (activeFilter === 'manual') {
    return results.filter((result) => result.manualReviewRecommended)
  }

  return results
}

function getFilterCount(results: ReconciliationResult[], key: FilterKey) {
  return getFilteredResults(results, key).length
}

function getRiskRank(level: ReconciliationRiskLevel) {
  const rank: Record<ReconciliationRiskLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }

  return rank[level]
}

export function MutabakatPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [copyLabel, setCopyLabel] = useState('Metni kopyala')
  const { activeDataset, analysisStatus } = useDataWorkspace()

  const reconciliationResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllReconciliationResults(
            activeDataset.settlements,
            activeDataset.bankTransactions,
          )
        : [],
    [activeDataset, analysisStatus],
  )
  const deductionSummary = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateDeductionSummary(activeDataset.settlements, reconciliationResults)
        : calculateDeductionSummary([], reconciliationResults),
    [activeDataset, analysisStatus, reconciliationResults],
  )
  const summary = useMemo(
    () => generateReconciliationSummary(reconciliationResults, deductionSummary),
    [deductionSummary, reconciliationResults],
  )
  const messageDraft = useMemo(
    () => generateMarketplaceMessageDraft(reconciliationResults),
    [reconciliationResults],
  )

  const filteredResults = useMemo(
    () => getFilteredResults(reconciliationResults, activeFilter),
    [activeFilter, reconciliationResults],
  )

  const riskyResults = useMemo(
    () =>
      reconciliationResults
        .filter(
          (result) =>
            result.manualReviewRecommended ||
            result.isDelayed ||
            result.differenceType === 'unexplained_difference',
        )
        .toSorted(
          (first, second) =>
            getRiskRank(second.riskLevel) - getRiskRank(first.riskLevel) ||
            second.absoluteDifference - first.absoluteDifference,
        ),
    [reconciliationResults],
  )

  const deductionItems = [
    {
      label: 'Komisyon kesintisi',
      value: deductionSummary.commissionTotal,
      tone: 'bg-cyan-300',
    },
    {
      label: 'Kargo kesintisi',
      value: deductionSummary.shippingTotal,
      tone: 'bg-amber-300',
    },
    {
      label: 'İade kesintisi',
      value: deductionSummary.returnTotal,
      tone: 'bg-orange-300',
    },
    {
      label: 'Kampanya kesintisi',
      value: deductionSummary.campaignTotal,
      tone: 'bg-purple-300',
    },
    {
      label: 'Hizmet bedeli',
      value: deductionSummary.serviceFeeTotal,
      tone: 'bg-slate-300',
    },
    {
      label: 'Açıklanamayan fark',
      value: deductionSummary.unexplainedDifference,
      tone: 'bg-rose-300',
    },
  ]
  const maxDeductionValue = Math.max(...deductionItems.map((item) => item.value), 1)

  const handleCopyDraft = async () => {
    const draftText = `${messageDraft.subject}\n\n${messageDraft.body}\n\n${messageDraft.disclaimer}`

    try {
      await navigator.clipboard.writeText(draftText)
      setCopyLabel('Kopyalandı')
    } catch {
      setCopyLabel('Metin hazır')
    }

    window.setTimeout(() => setCopyLabel('Metni kopyala'), 1800)
  }

  return (
    <div className="space-y-6">
      <ModuleHero
        label="Hakediş ve banka kontrolü"
        title="Mutabakat"
        question="Para hesaba doğru yatmış mı?"
        description="Satış, hakediş ve banka ödeme kayıtlarını karşılaştırarak açıklanamayan farkları görün."
        disclaimer="Bu modül kesin muhasebesel veya hukuki tespit yapmaz; mevcut demo verisine göre karar desteği sunar."
        icon={Landmark}
        meta={`${activeDataset?.settlements.length ?? 0} hakediş · ${activeDataset?.bankTransactions.length ?? 0} banka işlemi`}
        tone="cyan"
      />

      <AnalysisControlBar scope="module" moduleName="Mutabakat" />

      {analysisStatus !== 'completed' || !activeDataset ? (
        <AnalysisRequiredState moduleName="Mutabakat" />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Toplam brüt satış"
          value={formatCurrency(summary.totalGrossSales)}
          helper="Hakediş raporu brüt tutarı"
          icon={CircleDollarSign}
          tone="cyan"
        />
        <MetricCard
          title="Beklenen hakediş"
          value={formatCurrency(summary.expectedSettlement)}
          helper="Kesintiler sonrası beklenen net"
          icon={HandCoins}
          tone="emerald"
        />
        <MetricCard
          title="Gerçekleşen ödeme"
          value={formatCurrency(summary.actualPaid)}
          helper="Eşleşen banka hareketleri"
          icon={Wallet}
          tone="slate"
        />
        <MetricCard
          title="Açıklanamayan fark"
          value={formatCurrency(summary.unexplainedDifference)}
          helper="Kesinti kalemleriyle netleşmeyen fark"
          icon={ShieldAlert}
          tone={summary.unexplainedDifference > 0 ? 'rose' : 'emerald'}
        />
        <MetricCard
          title="Manuel kontrol önerilen kayıt"
          value={String(summary.manualReviewCount)}
          helper="Yüksek risk veya açıklanamayan fark"
          icon={FileText}
          tone={summary.manualReviewCount > 0 ? 'amber' : 'emerald'}
        />
      </section>

      <ModuleInsightCard
        icon={ShieldAlert}
        title={
          riskyResults[0]
            ? `${riskyResults[0].settlementId} kaydı manuel kontrol istiyor.`
            : 'Hakediş ve banka kayıtları genel olarak uyumlu görünüyor.'
        }
        description={
          riskyResults[0]
            ? `Beklenen tutar ile yatan tutar arasında ${formatSignedCurrency(riskyResults[0].difference)} fark var. Hakediş ile banka hareketi aynı hikâyeyi anlatmıyor olabilir.`
            : 'Açıklanamayan fark düşük görünse de kesinti kalemleri gerektiğinde detay tablosundan incelenebilir.'
        }
        meta="Mutabakat içgörüsü"
        tone={riskyResults[0]?.riskLevel === 'critical' ? 'rose' : 'amber'}
      />

      <ManualOverridePanel mode="reconciliation" title="Mutabakat varsayımları" />

      <CollapsibleSection
        eyebrow="Detay"
        title="Hakedişten düşülen kalemler"
        description="Komisyon, kargo, iade, kampanya ve hizmet bedeli dağılımı."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Kesinti analizi</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Hakedişten düşülen kalemler
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Bu panel farkı açıklayabilecek komisyon, kargo, iade, kampanya ve hizmet
              bedeli kalemlerini ayrı gösterir.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-300">
            Açıklanabilir fark: {formatCurrency(deductionSummary.explainedDifference)}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {deductionItems.map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="font-semibold text-white">{formatCurrency(item.value)}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${item.tone}`}
                  style={{ width: `${(item.value / maxDeductionValue) * 100}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Mutabakat sonuç tablosu"
        description="Filtreler ve hakediş-banka karşılaştırma kayıtları."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-cyan-200">
              <Filter className="h-4 w-4" />
              <p className="text-sm font-semibold">Filtreler</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Mutabakat sonuç tablosu
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterItems.map((item) => {
              const isActive = activeFilter === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveFilter(item.key)}
                  className={[
                    'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white',
                  ].join(' ')}
                >
                  {item.label} · {getFilterCount(reconciliationResults, item.key)}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="pinti-scroll-region mt-5 overflow-x-auto"
          tabIndex={0}
          aria-label="Mutabakat tablosu yatay kaydırma alanı"
        >
          <table className="pinti-table w-full min-w-[1180px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="pb-3">Hakediş ID</th>
                <th className="pb-3">Sipariş ID</th>
                <th className="pb-3">Pazaryeri</th>
                <th className="pb-3">Beklenen tutar</th>
                <th className="pb-3">Yatan tutar</th>
                <th className="pb-3">Fark</th>
                <th className="pb-3">Fark tipi</th>
                <th className="pb-3">Risk seviyesi</th>
                <th className="pb-3">Gecikme</th>
                <th className="pb-3">Öneri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td className="py-3 font-medium text-white">{result.settlementId}</td>
                  <td className="py-3 text-slate-400">{result.orderId}</td>
                  <td className="py-3 text-slate-300">{result.marketplace}</td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.expectedAmount)}
                  </td>
                  <td className="py-3 text-slate-300">
                    {formatCurrency(result.actualPaidAmount)}
                  </td>
                  <td className="py-3 font-semibold text-slate-100">
                    {formatSignedCurrency(result.difference)}
                  </td>
                  <td className="py-3">
                    <DifferenceBadge type={result.differenceType} />
                  </td>
                  <td className="py-3">
                    <RiskBadge level={result.riskLevel} />
                  </td>
                  <td className="py-3 text-slate-300">
                    {result.isDelayed ? 'Evet' : 'Hayır'}
                  </td>
                  <td className="max-w-[280px] py-3 text-slate-400">
                    {result.suggestedAction}
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
        title="Riskli kayıtlar ve mesaj taslağı"
        description="Manuel kontrol kayıtları ve nötr pazaryeri inceleme metni."
      >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-200">Riskli kayıtlar</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Manuel kontrol sırasına alınabilecek kayıtlar
              </h2>
            </div>
            <ShieldAlert className="h-5 w-5 text-rose-200" />
          </div>
          <div className="mt-5 space-y-3">
            {riskyResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-white">
                      {result.settlementId} · {formatSignedCurrency(result.difference)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {differenceLabels[result.differenceType]}
                    </p>
                  </div>
                  <RiskBadge level={result.riskLevel} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {result.explanation}
                </p>
                <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-sm text-slate-300">
                  {result.suggestedAction}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Pazaryeri talep metni</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                İnceleme talebi taslağı
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCopyDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60"
            >
              <ClipboardCopy className="h-4 w-4" />
              {copyLabel}
            </button>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-sm text-slate-500">Konu</p>
            <p className="mt-2 font-semibold text-white">{messageDraft.subject}</p>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-sm text-slate-500">Mesaj gövdesi</p>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-300">
              {messageDraft.body}
            </pre>
          </div>
          <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] p-4 text-sm leading-6 text-amber-100">
            {messageDraft.disclaimer}
          </div>
          <div className="mt-3 text-sm text-slate-400">
            Referans kayıtlar: {messageDraft.referencedRecords.join(', ')}
          </div>
        </article>
      </section>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Pinti’nin mutabakat notları"
        description="Öne çıkan kayıtlar için kısa karar destek yorumu."
      >
      <section className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex items-center gap-2 text-emerald-200">
          <Info className="h-4 w-4" />
          <p className="text-sm font-semibold">Pinti yorumu</p>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Pinti’nin gözüne takılan mutabakat bulguları
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {riskyResults.slice(0, 3).map((result) => (
            <article
              key={result.id}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{result.settlementId}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatSignedCurrency(result.difference)} ·{' '}
                    {differenceLabels[result.differenceType]}
                  </p>
                </div>
                <RiskBadge level={result.riskLevel} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {result.settlementId} kaydında beklenen hakediş ile banka ödemesi aynı
                hikayeyi anlatmıyor olabilir. Bu kayıt için manuel kontrol önerilir.
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
