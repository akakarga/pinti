import { useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dashboardProfitSeries } from '../../data/mockData'
import { formatCurrency } from '../../utils/formatters'

export function ProfitTrendChart() {
  const chartFrameRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)

  useEffect(() => {
    const chartFrame = chartFrameRef.current

    if (!chartFrame) {
      return undefined
    }

    const updateWidth = () => {
      setChartWidth(Math.max(240, Math.floor(chartFrame.getBoundingClientRect().width)))
    }

    updateWidth()

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setChartWidth(Math.max(240, Math.floor(entry.contentRect.width)))
    })

    observer.observe(chartFrame)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Kâr trendi
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Satış büyürken net kâr nereye gidiyor?
        </h2>
      </div>
      <div ref={chartFrameRef} className="min-h-72 w-full overflow-hidden">
        {chartWidth > 0 ? (
          <AreaChart
            width={chartWidth}
            height={280}
            data={dashboardProfitSeries}
            margin={{ left: 0, right: 4, top: 8 }}
          >
            <defs>
              <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="adProfitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={(value) => `${Number(value) / 1000}K`}
              tickLine={false}
              axisLine={false}
              width={46}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Gerçek net kâr"
              stroke="#34d399"
              fill="url(#profitFill)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="adProfit"
              name="Reklam sonrası net kâr"
              stroke="#fbbf24"
              fill="url(#adProfitFill)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <div className="grid h-72 place-items-center text-sm text-slate-500">
            Grafik hazırlanıyor...
          </div>
        )}
      </div>
    </section>
  )
}
