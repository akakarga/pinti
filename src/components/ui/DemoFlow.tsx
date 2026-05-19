import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DemoFlowStep {
  title: string
  description: string
  path: string
}

interface DemoFlowProps {
  steps: DemoFlowStep[]
}

export function DemoFlow({ steps }: DemoFlowProps) {
  return (
    <div className="pinti-panel rounded-[1.5rem] p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-9">
        {steps.map((step, index) => (
          <Link
            key={step.path}
            to={step.path}
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-3 transition duration-300 ease-[var(--pinti-ease)] hover:border-emerald-300/30 hover:bg-emerald-300/[0.055]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="pinti-tabular text-xs font-semibold text-emerald-200">
                {String(index + 1).padStart(2, '0')}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-emerald-100" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {step.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
