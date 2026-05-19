import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  description?: string
  eyebrow?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  description,
  eyebrow = 'Detay',
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group border-t border-white/10 pt-5"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl px-1 py-2 outline-none transition hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-emerald-300/45 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </span>
          <span className="mt-1 block text-lg font-semibold text-white">{title}</span>
          {description ? (
            <span className="mt-1 block max-w-3xl text-sm leading-6 text-slate-400">
              {description}
            </span>
          ) : null}
        </span>
        <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}
