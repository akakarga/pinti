import type { LucideIcon } from 'lucide-react'
import { MetricTile } from '../ui/MetricTile'

type MetricTone = 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate'

interface MetricCardProps {
  title: string
  value: string
  helper: string
  trend?: string
  icon: LucideIcon
  tone?: MetricTone
}

export function MetricCard({
  title,
  value,
  helper,
  trend,
  icon: Icon,
  tone = 'slate',
}: MetricCardProps) {
  return (
    <MetricTile
      title={title}
      value={value}
      helper={helper}
      trend={trend}
      icon={Icon}
      tone={tone}
    />
  )
}
