import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { DatasetValidationResult } from '../../types'

interface DataValidationPanelProps {
  validation: DatasetValidationResult
}

export function DataValidationPanel({ validation }: DataValidationPanelProps) {
  const items = [
    ['Ürün', validation.counts.products],
    ['Sipariş', validation.counts.orders],
    ['İade', validation.counts.returns],
    ['Müşteri', validation.counts.customers],
    ['Kampanya', validation.counts.campaigns],
    ['Performans', validation.counts.campaignPerformance],
    ['Hakediş', validation.counts.settlements],
    ['Banka', validation.counts.bankTransactions],
  ]

  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Veri doğrulama
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Analiz öncesi ilişki kontrolü
          </h2>
        </div>
        <span
          className={[
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
            validation.isValid
              ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
              : 'border-rose-300/30 bg-rose-300/10 text-rose-100',
          ].join(' ')}
        >
          {validation.isValid ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {validation.isValid ? 'Analize uygun' : 'Hata var'}
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="pinti-tabular mt-2 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.055] p-4">
          <div className="flex items-center gap-2 text-rose-100">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-semibold">Hatalar</p>
          </div>
          {validation.errors.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-100/90">
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Analizi engelleyen hata yok.</p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.055] p-4">
          <div className="flex items-center gap-2 text-amber-100">
            <Info className="h-4 w-4" />
            <p className="text-sm font-semibold">Uyarılar</p>
          </div>
          {validation.warnings.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100/90">
              {validation.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Veri ilişkileri temel kontrollerden geçti.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
