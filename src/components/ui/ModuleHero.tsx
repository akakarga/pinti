import type { LucideIcon } from 'lucide-react'

interface ModuleHeroProps {
  label: string
  title: string
  question: string
  description: string
  disclaimer: string
  icon: LucideIcon
  meta?: string
  tone?: 'emerald' | 'amber' | 'rose' | 'cyan'
}

const toneClasses = {
  emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  amber: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  rose: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
}

export function ModuleHero({
  label,
  title,
  question,
  description,
  disclaimer,
  icon: Icon,
  meta,
  tone = 'emerald',
}: ModuleHeroProps) {
  return (
    <section className="pinti-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
      <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[4rem] border-b border-l border-emerald-200/10 bg-emerald-300/[0.035]" />
      <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div className="max-w-4xl">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses[tone]}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base font-semibold leading-7 text-emerald-100">
            {question}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            {description}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
            {disclaimer}
          </p>
        </div>
        {meta ? (
          <div className="pinti-panel-quiet rounded-2xl p-4 xl:w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Analiz kapsamı
            </p>
            <p className="pinti-tabular mt-3 text-2xl font-semibold text-white">{meta}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
