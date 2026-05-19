import type { LucideIcon } from 'lucide-react'

type ModuleInsightTone = 'emerald' | 'amber' | 'rose' | 'cyan'

interface ModuleInsightCardProps {
  icon: LucideIcon
  title: string
  description: string
  meta?: string
  tone?: ModuleInsightTone
}

const toneClasses: Record<ModuleInsightTone, string> = {
  emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  amber: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  rose: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
}

export function ModuleInsightCard({
  icon: Icon,
  title,
  description,
  meta = 'Öne çıkan içgörü',
  tone = 'emerald',
}: ModuleInsightCardProps) {
  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-4xl">
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${toneClasses[tone]}`}
          >
            <Icon className="h-4 w-4" />
            {meta}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </section>
  )
}
