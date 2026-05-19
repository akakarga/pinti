import type { RiskLevel } from '../../types'

const badgeStyles: Record<RiskLevel, string> = {
  healthy: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
  watch: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  critical: 'border-rose-300/35 bg-rose-300/10 text-rose-100',
  neutral: 'border-slate-500/35 bg-slate-700/35 text-slate-200',
}

const badgeLabels: Record<RiskLevel, string> = {
  healthy: 'Sağlıklı',
  watch: 'Takip',
  critical: 'Kritik',
  neutral: 'Nötr',
}

interface StatusBadgeProps {
  level: RiskLevel
  label?: string
}

export function StatusBadge({ level, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeStyles[level]}`}
    >
      {label ?? badgeLabels[level]}
    </span>
  )
}
