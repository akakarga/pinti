import type { ReactNode } from 'react'

interface DataTableShellProps {
  title: string
  description?: string
  scrollLabel?: string
  children: ReactNode
}

export function DataTableShell({
  title,
  description,
  scrollLabel,
  children,
}: DataTableShellProps) {
  return (
    <section className="pinti-panel rounded-[1.5rem] p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
          Detay kayıtları
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        ) : null}
      </div>
      <div
        className="pinti-scroll-region overflow-x-auto"
        tabIndex={0}
        aria-label={scrollLabel ?? `${title} yatay kaydırma alanı`}
      >
        {children}
      </div>
    </section>
  )
}
