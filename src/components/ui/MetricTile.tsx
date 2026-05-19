import type { LucideIcon } from 'lucide-react'

type MetricTone = 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate'

const toneStyles: Record<MetricTone, string> = {
  emerald: 'text-emerald-200 bg-emerald-300/10 border-emerald-300/25',
  amber: 'text-amber-200 bg-amber-300/10 border-amber-300/25',
  rose: 'text-rose-200 bg-rose-300/10 border-rose-300/25',
  cyan: 'text-cyan-200 bg-cyan-300/10 border-cyan-300/25',
  slate: 'text-slate-200 bg-slate-700/30 border-slate-500/25',
}

interface MetricTileProps {
  title: string
  value: string
  helper: string
  trend?: string
  icon?: LucideIcon
  tone?: MetricTone
  compact?: boolean
}

export function MetricTile({
  title,
  value,
  helper,
  trend,
  icon: Icon,
  tone = 'slate',
  compact = false,
}: MetricTileProps) {
  return (
    <article className="pinti-panel group relative overflow-hidden rounded-2xl p-4 transition duration-300 ease-[var(--pinti-ease)] hover:border-emerald-300/25 hover:bg-white/[0.035] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p
            className={[
              'pinti-tabular mt-3 font-semibold tracking-tight text-white',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl',
            ].join(' ')}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${toneStyles[tone]}`}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-sm leading-5 text-slate-400">{helper}</p>
        {trend ? (
          <span className="shrink-0 text-sm font-semibold text-emerald-200">{trend}</span>
        ) : null}
      </div>
    </article>
  )
}
