import { useMemo } from 'react'
import {
  ArrowRight,
  Banknote,
  BadgePercent,
  ChartNoAxesCombined,
  Compass,
  HandCoins,
  Megaphone,
  RotateCcw,
  Sparkles,
  Tags,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from '../components/cards/MetricCard'
import { CampaignTable } from '../components/dashboard/CampaignTable'
import { ProductRiskTable } from '../components/dashboard/ProductRiskTable'
import { ProfitTrendChart } from '../components/dashboard/ProfitTrendChart'
import { AnalysisControlBar } from '../components/data/AnalysisControlBar'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { DemoFlow } from '../components/ui/DemoFlow'
import { useDataWorkspace } from '../context/DataWorkspaceContext'
import type { UnifiedActionPriority } from '../types'
import { calculateWorkspaceResults } from '../utils/workspaceAnalysis'
import { formatCurrency } from '../utils/formatters'

const demoFlowSteps = [
  {
    title: 'Veri Merkezi',
    description: 'Demo şirket seçilir ve analiz başlatılır.',
    path: '/app/demo-verisi',
  },
  {
    title: 'Genel Bakış',
    description: 'Beş ana metrik ve ilk 3 öncelik görülür.',
    path: '/app/overview',
  },
  {
    title: 'AI Aksiyon Merkezi',
    description: 'Tüm finansal öncelikler tek listede birleşir.',
    path: '/app/ai-aksiyon-merkezi',
  },
]

const quickModules = [
  {
    title: 'KârPusula',
    question: 'Ürün kârı',
    path: '/app/kar-pusula',
    icon: Compass,
  },
  {
    title: 'ReklamMerkezi',
    question: 'Reklam sonrası kâr',
    path: '/app/reklam-merkezi',
    icon: Megaphone,
  },
  {
    title: 'İadeKalkan',
    question: 'İade kaybı',
    path: '/app/iade-kalkan',
    icon: RotateCcw,
  },
  {
    title: 'Mutabakat',
    question: 'Hakediş farkı',
    path: '/app/mutabakat',
    icon: HandCoins,
  },
  {
    title: 'FiyatKoruma',
    question: 'Minimum fiyat',
    path: '/app/fiyat-koruma',
    icon: Tags,
  },
  {
    title: 'KampanyaSim',
    question: 'Kampanya etkisi',
    path: '/app/kampanya-sim',
    icon: BadgePercent,
  },
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

function PriorityBadge({ priority }: { priority: UnifiedActionPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  )
}

export function DashboardPage() {
  const {
    activeDataset,
    analysisStatus,
    validationResult,
    quickStartDemo,
  } = useDataWorkspace()
  const workspaceResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateWorkspaceResults(activeDataset)
        : null,
    [activeDataset, analysisStatus],
  )

  if (!activeDataset) {
    return (
      <div className="space-y-6">
        <section className="pinti-panel rounded-[1.75rem] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Genel Bakış
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Önce veri seçelim
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Pinti’nin kontrol paneli seçilen şirket verisiyle çalışır.
          </p>
          <Link
            to="/app/demo-verisi"
            className="pinti-link mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-200"
          >
            Veri Merkezi’ni aç
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    )
  }

  if (!workspaceResults) {
    return (
      <div className="space-y-6">
        <section className="pinti-panel rounded-[1.75rem] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Genel Bakış
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Analiz bekleniyor
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            {activeDataset.companyProfile.name} verisi seçildi. Sonuçları görmek için
            analizi başlat.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Şirket', activeDataset.companyProfile.name],
              ['Sektör', activeDataset.companyProfile.sector],
              ['Risk profili', activeDataset.companyProfile.riskProfile],
              ['Veri durumu', validationResult.isValid ? 'Analize uygun' : 'Eksik alan var'],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
              </article>
            ))}
          </div>
        </section>

        <AnalysisControlBar scope="global" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/app/demo-verisi"
            className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-emerald-300/35 hover:text-white"
          >
            Veri Merkezi’ne dön
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => void quickStartDemo()}
            className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-200"
          >
            Hızlı demo başlat
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const dashboardSummary = workspaceResults.dashboardSummary
  const topActions = workspaceResults.unifiedInsight.topActions.slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="pinti-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-[5rem] border-b border-l border-emerald-200/10 bg-emerald-300/[0.035]" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Genel Bakış
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Pinti kontrol paneli
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Bu analiz {activeDataset.companyProfile.name} verisine göre oluşturuldu.
            </p>
          </div>
          <Link
            to="/app/ai-aksiyon-merkezi"
            className="pinti-link group inline-flex items-center justify-center gap-3 rounded-full bg-emerald-300 py-2.5 pl-5 pr-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-200"
          >
            Tüm öncelikleri gör
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950/10 transition group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      <AnalysisControlBar scope="global" compact />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          <MetricCard
            title="Toplam satış"
            value={formatCurrency(dashboardSummary.totalSales)}
            helper="Seçili veri seti"
            icon={TrendingUp}
            tone="cyan"
          />
          <MetricCard
            title="Gerçek net kâr"
            value={formatCurrency(dashboardSummary.realNetProfit)}
            helper="Komisyon, kargo, iade dahil"
            icon={Banknote}
            tone="emerald"
          />
          <MetricCard
            title="Reklam sonrası net kâr"
            value={formatCurrency(dashboardSummary.netProfitAfterAds)}
            helper="ROAS yerine gerçek kâr"
            icon={ChartNoAxesCombined}
            tone="amber"
          />
          <MetricCard
            title="İade kaybı"
            value={formatCurrency(dashboardSummary.totalReturnLoss)}
            helper="İade kaynaklı etki"
            icon={RotateCcw}
            tone="rose"
          />
          <MetricCard
            title="Açıklanamayan hakediş farkı"
            value={formatCurrency(dashboardSummary.unexplainedSettlementGap)}
            helper="Mutabakat sinyali"
            icon={HandCoins}
            tone="rose"
          />
        </div>

        <div className="pinti-panel rounded-[1.5rem] p-5">
          <div className="flex items-center gap-2 text-emerald-100">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-white">
              Bugün ilk bakılacak 3 şey
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Genel bakış yalnızca özetler; karar sırası AI Aksiyon Merkezi’nde netleşir.
          </p>
          <div className="mt-5 space-y-3">
            {topActions.map((action, index) => (
              <article key={action.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="pinti-tabular grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-sm font-semibold text-emerald-100">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {action.module}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold leading-6 text-white">
                        {action.title}
                      </h3>
                    </div>
                  </div>
                  <PriorityBadge priority={action.priority} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                  {action.reason}
                </p>
              </article>
            ))}
          </div>
          <Link
            to="/app/ai-aksiyon-merkezi"
            className="pinti-link mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-300/30 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10"
          >
            AI Aksiyon Merkezi’ne git
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Modül detayları
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {quickModules.map(({ title, question, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="pinti-link rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-300/25 hover:bg-white/[0.035]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-emerald-100">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{question}</p>
            </Link>
          ))}
        </div>
      </section>

      <CollapsibleSection
        eyebrow="Detay"
        title="Grafikler ve tablolar"
        description="Ürün riski, trend ve kampanya tablosu ihtiyaç halinde açılır."
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ProfitTrendChart />
          <ProductRiskTable />
        </div>
        <div className="mt-6">
          <CampaignTable />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Detay"
        title="Demo rotası"
        description="Jüri anlatımı için kısa ürün akışı."
      >
        <DemoFlow steps={demoFlowSteps} />
      </CollapsibleSection>
    </div>
  )
}
