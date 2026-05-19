import type { ReactNode } from 'react'

interface InsightCardProps {
  eyebrow: string
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: 'emerald' | 'amber' | 'rose' | 'cyan'
}

const toneStyles = {
  emerald: 'text-emerald-200 border-emerald-300/20 bg-emerald-300/[0.06]',
  amber: 'text-amber-200 border-amber-300/20 bg-amber-300/[0.06]',
  rose: 'text-rose-200 border-rose-300/20 bg-rose-300/[0.06]',
  cyan: 'text-cyan-200 border-cyan-300/20 bg-cyan-300/[0.06]',
}

export function InsightCard({
  eyebrow,
  title,
  children,
  action,
  tone = 'emerald',
}: InsightCardProps) {
  return (
    <article className="pinti-panel rounded-[1.5rem] p-5">
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneStyles[tone]}`}
      >
        {eyebrow}
      </span>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-slate-400">{children}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </article>
  )
}
