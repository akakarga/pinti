import { ArrowRight, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import { moduleDetails } from '../../data/mockData'
import type { ModuleKey } from '../../types'
import { StatusBadge } from '../cards/StatusBadge'

interface ModulePlaceholderProps {
  moduleKey: ModuleKey
}

export function ModulePlaceholder({ moduleKey }: ModulePlaceholderProps) {
  const module = moduleDetails[moduleKey]

  return (
    <div className="space-y-6">
      <section className="pinti-panel rounded-[1.5rem] p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-100">
              <Construction className="h-4 w-4" />
              Modül placeholder
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{module.title}</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">{module.description}</p>
            <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.08] p-4 text-sm leading-6 text-amber-100">
              Bu modül bir sonraki adımda geliştirilecek.
            </p>
          </div>
          <Link
            to="/app/overview"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/40 hover:text-white"
          >
            Genel bakışa dön
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {module.stats.map((stat) => (
          <article
            key={stat.label}
            className="pinti-panel-quiet rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <StatusBadge level={stat.tone} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
