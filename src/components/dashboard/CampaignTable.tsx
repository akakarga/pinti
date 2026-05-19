import { useMemo } from 'react'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'
import { calculateAllCampaignProfits } from '../../services/reklamMerkeziService'
import { formatCurrency } from '../../utils/formatters'
import { StatusBadge } from '../cards/StatusBadge'

export function CampaignTable() {
  const { activeDataset, analysisStatus } = useDataWorkspace()
  const campaignResults = useMemo(
    () =>
      activeDataset && analysisStatus === 'completed'
        ? calculateAllCampaignProfits(
            activeDataset.campaigns,
            activeDataset.products,
            activeDataset.orders,
            activeDataset.returns,
            activeDataset.campaignPerformance,
          )
        : [],
    [activeDataset, analysisStatus],
  )

  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            ReklamMerkezi
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Kampanya kârlılık özeti
          </h2>
        </div>
      </div>

      <div
        className="pinti-scroll-region overflow-x-auto"
        tabIndex={0}
        aria-label="Kampanya tablosu yatay kaydırma alanı"
      >
        <table className="pinti-table w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
              <th className="pb-3 font-semibold">Kampanya</th>
              <th className="pb-3 font-semibold">Kanal</th>
              <th className="pb-3 font-semibold">Harcama</th>
              <th className="pb-3 font-semibold">ROAS</th>
              <th className="pb-3 font-semibold">Net kâr</th>
              <th className="pb-3 font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.08]">
            {campaignResults.map((campaign) => (
              <tr key={campaign.campaignId}>
                <td className="py-3 font-medium text-white">{campaign.campaignName}</td>
                <td className="py-3 text-slate-400">{campaign.channel}</td>
                <td className="py-3 text-slate-300">{formatCurrency(campaign.adSpend)}</td>
                <td className="py-3 text-slate-300">{campaign.roas.toFixed(1)}x</td>
                <td className="py-3 text-slate-300">
                  {formatCurrency(campaign.netProfitAfterAds)}
                </td>
                <td className="py-3">
                  <StatusBadge level={campaign.healthStatus === 'healthy' ? 'healthy' : campaign.healthStatus === 'watch' ? 'watch' : 'critical'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
