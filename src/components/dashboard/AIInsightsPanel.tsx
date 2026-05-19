import { ArrowRight, Sparkles, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { aiInsights } from '../../data/mockData'
import { StatusBadge } from '../cards/StatusBadge'

const insightPaths: Record<string, string> = {
  KârPusula: '/app/kar-pusula',
  ReklamMerkezi: '/app/reklam-merkezi',
  İadeKalkan: '/app/iade-kalkan',
  Mutabakat: '/app/mutabakat',
  FiyatKoruma: '/app/fiyat-koruma',
  KampanyaSim: '/app/kampanya-sim',
}

export function AIInsightsPanel() {
  return (
    <section className="pinti-panel overflow-hidden rounded-[1.75rem] p-0">
      <div className="grid gap-0 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-white/10 p-5 sm:p-6 xl:border-r xl:border-b-0">
          <div className="flex items-center gap-3 text-emerald-100">
            <Sparkles className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Pinti’nin gözüne takılanlar
            </p>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
            Öncelikli finansal sinyaller
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Bu alan dashboard’daki dağınık sinyalleri tek karar akışına bağlar. Final
            ekranında tüm modüller birlikte önceliklendirilir.
          </p>
          <Link
            to="/app/ai-aksiyon-merkezi"
            className="pinti-link mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 px-5 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10"
          >
            Tüm öncelikleri gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-white/10">
          {aiInsights.map((insight, index) => (
            <article
              key={insight.id}
              className="grid gap-4 p-4 transition duration-300 ease-[var(--pinti-ease)] hover:bg-white/[0.025] sm:grid-cols-[auto_1fr_auto] sm:p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-amber-100">
                <TriangleAlert className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pinti-tabular text-xs font-semibold text-slate-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {insight.moduleName}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-white">{insight.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {insight.description}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                <StatusBadge level={insight.severity} />
                {insightPaths[insight.moduleName] ? (
                  <Link
                    to={insightPaths[insight.moduleName]}
                    className="pinti-link inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
                  >
                    Modüle git
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
