import { useMemo } from 'react'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'
import { calculateAllProductProfits } from '../../services/karPusulaService'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { StatusBadge } from '../cards/StatusBadge'

export function ProductRiskTable() {
  const { activeDataset, analysisStatus } = useDataWorkspace()
  const productResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllProductProfits(
            activeDataset.products,
            activeDataset.orders,
            activeDataset.returns,
            activeDataset.campaigns,
          )
        : [],
    [activeDataset, analysisStatus],
  )

  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
          KârPusula
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Ürün bazlı erken uyarılar
        </h2>
      </div>

      <div className="space-y-3">
        {productResults.slice(0, 4).map((product) => (
          <article
            key={product.productId}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-semibold text-white">{product.productName}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {product.category} · İade oranı {formatPercent(product.returnRate)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300">
                Net kâr {formatCurrency(product.netProfit)}
              </span>
              <StatusBadge level={product.healthStatus === 'healthy' ? 'healthy' : product.healthStatus === 'watch' ? 'watch' : 'critical'} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
