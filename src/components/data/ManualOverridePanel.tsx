import { useMemo, useState } from 'react'
import { ChevronDown, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'

type ManualOverrideMode =
  | 'profit'
  | 'ads'
  | 'returns'
  | 'reconciliation'
  | 'pricing'
  | 'campaign'

interface ManualOverridePanelProps {
  mode: ManualOverrideMode
  title?: string
}

function numberValue(value: number | undefined) {
  return Number.isFinite(value) ? String(value) : ''
}

function percentValue(value: number | undefined) {
  return Number.isFinite(value) ? String(Math.round((value ?? 0) * 1000) / 10) : ''
}

export function ManualOverridePanel({ mode, title = 'Manuel varsayımlar' }: ManualOverridePanelProps) {
  const workspace = useDataWorkspace()
  const { activeDataset, manualOverrides } = workspace
  const firstProductId = activeDataset?.products[0]?.id ?? ''
  const firstCampaignId = activeDataset?.campaigns[0]?.id ?? ''
  const firstReturnId = activeDataset?.returns[0]?.id ?? ''
  const firstScenarioId = activeDataset?.campaignSimulationScenarios[0]?.id ?? ''
  const [selectedProductId, setSelectedProductId] = useState(firstProductId)
  const [selectedCampaignId, setSelectedCampaignId] = useState(firstCampaignId)
  const [selectedReturnId, setSelectedReturnId] = useState(firstReturnId)
  const [selectedScenarioId, setSelectedScenarioId] = useState(firstScenarioId)

  const product = useMemo(
    () => activeDataset?.products.find((item) => item.id === selectedProductId) ?? activeDataset?.products[0],
    [activeDataset, selectedProductId],
  )
  const campaign = useMemo(
    () => activeDataset?.campaigns.find((item) => item.id === selectedCampaignId) ?? activeDataset?.campaigns[0],
    [activeDataset, selectedCampaignId],
  )
  const returnRequest = useMemo(
    () => activeDataset?.returns.find((item) => item.id === selectedReturnId) ?? activeDataset?.returns[0],
    [activeDataset, selectedReturnId],
  )
  const scenario = useMemo(
    () =>
      activeDataset?.campaignSimulationScenarios.find((item) => item.id === selectedScenarioId) ??
      activeDataset?.campaignSimulationScenarios[0],
    [activeDataset, selectedScenarioId],
  )

  if (!activeDataset) {
    return null
  }

  return (
    <details className="group border-t border-white/10 pt-5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl px-1 py-2 outline-none transition hover:bg-white/[0.025] focus-visible:ring-2 focus-visible:ring-emerald-300/45 [&::-webkit-details-marker]:hidden">
        <div>
          <div className="flex items-center gap-2 text-emerald-100">
            <SlidersHorizontal className="h-4 w-4" />
            <p className="text-sm font-semibold">Varsayımları düzenle</p>
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            {title}. Değişiklikler geçici varsayımlar olarak tutulur.
          </p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>

      <section className="pinti-panel mt-4 rounded-[1.5rem] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            En önemli birkaç varsayımı düzenle. Yeniden analiz önerilir.
          </p>
        <button
          type="button"
          onClick={workspace.resetManualOverrides}
          className="pinti-link rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-emerald-300/35 hover:text-white"
        >
          Varsayımları sıfırla
        </button>
        </div>

      {mode === 'profit' && product ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectField label="Ürün" value={product.id} onChange={setSelectedProductId} options={activeDataset.products.map((item) => [item.id, item.name])} />
          <NumberField label="Ürün maliyeti" value={numberValue(product.unitCost)} onChange={(value) => workspace.updateProductOverride(product.id, { unitCost: value })} />
          <PercentField label="Komisyon oranı" value={percentValue(product.commissionRate)} onChange={(value) => workspace.updateProductOverride(product.id, { commissionRate: value })} />
          <NumberField label="Ort. kargo" value={numberValue(product.averageShippingCost)} onChange={(value) => workspace.updateProductOverride(product.id, { averageShippingCost: value })} />
          <NumberField label="Reklam etkisi" value={numberValue(product.expectedAdCostPerUnit)} onChange={(value) => workspace.updateProductOverride(product.id, { expectedAdCostPerUnit: value })} />
        </div>
      ) : null}

      {mode === 'pricing' && product ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectField label="Ürün" value={product.id} onChange={setSelectedProductId} options={activeDataset.products.map((item) => [item.id, item.name])} />
          <PercentField label="Hedef net marj" value={percentValue(product.targetNetMargin)} onChange={(value) => workspace.updateProductOverride(product.id, { targetNetMargin: value })} />
          <NumberField label="Reklam etkisi" value={numberValue(product.expectedAdCostPerUnit)} onChange={(value) => workspace.updateProductOverride(product.id, { expectedAdCostPerUnit: value })} />
          <NumberField label="İade etkisi" value={numberValue(product.expectedReturnCostPerUnit)} onChange={(value) => workspace.updateProductOverride(product.id, { expectedReturnCostPerUnit: value })} />
          <NumberField label="Ort. kargo" value={numberValue(product.averageShippingCost)} onChange={(value) => workspace.updateProductOverride(product.id, { averageShippingCost: value })} />
        </div>
      ) : null}

      {mode === 'ads' && campaign ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="Kampanya" value={campaign.id} onChange={setSelectedCampaignId} options={activeDataset.campaigns.map((item) => [item.id, item.name])} />
          <NumberField label="Reklam harcaması" value={numberValue(campaign.totalSpend)} onChange={(value) => workspace.updateCampaignOverride(campaign.id, { totalSpend: value })} />
          <NumberField label="Atfedilen ciro" value={numberValue(campaign.attributedRevenue)} onChange={(value) => workspace.updateCampaignOverride(campaign.id, { attributedRevenue: value })} />
          <NumberField label="Atfedilen sipariş" value={numberValue(manualOverrides.campaignOverrides[campaign.id]?.attributedOrders ?? 0)} onChange={(value) => workspace.updateCampaignOverride(campaign.id, { attributedOrders: value })} />
        </div>
      ) : null}

      {mode === 'returns' && returnRequest ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="İade kaydı" value={returnRequest.id} onChange={setSelectedReturnId} options={activeDataset.returns.map((item) => [item.id, `${item.id} · ${item.reason}`])} />
          <SelectField label="Restockable" value={String(returnRequest.restockable)} onChange={(value) => workspace.updateReturnOverride(returnRequest.id, { restockable: value === 'true' })} options={[['true', 'Evet'], ['false', 'Hayır']]} />
          <SelectField label="Risk etiketi" value={returnRequest.riskLevel} onChange={(value) => workspace.updateReturnOverride(returnRequest.id, { riskLevel: value as never })} options={[['healthy', 'Düşük'], ['watch', 'Orta'], ['critical', 'Kritik'], ['neutral', 'Nötr']]} />
          <SelectField label="Manuel kontrol" value={String(manualOverrides.returnOverrides[returnRequest.id]?.manualReviewRecommended ?? false)} onChange={(value) => workspace.updateReturnOverride(returnRequest.id, { manualReviewRecommended: value === 'true' })} options={[['false', 'Standart'], ['true', 'Öne al']]} />
        </div>
      ) : null}

      {mode === 'reconciliation' ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <NumberField label="Tolerans tutarı" value={numberValue(manualOverrides.reconciliationOverrides.toleranceAmount ?? 50)} onChange={(value) => workspace.updateReconciliationOverrides({ toleranceAmount: value })} />
          <NumberField label="Gecikme günü eşiği" value={numberValue(manualOverrides.reconciliationOverrides.delayedPaymentDaysThreshold ?? 5)} onChange={(value) => workspace.updateReconciliationOverrides({ delayedPaymentDaysThreshold: value })} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 md:col-span-2">
            <div className="flex items-center gap-2 text-amber-100">
              <TriangleAlert className="h-4 w-4" />
              <p className="text-sm font-semibold">Not</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Mutabakat servis formülleri korunur. Bu eşikler demo notu ve yeniden analiz
              sinyali olarak kullanılır.
            </p>
          </div>
        </div>
      ) : null}

      {mode === 'campaign' && scenario ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectField label="Senaryo" value={scenario.id} onChange={setSelectedScenarioId} options={activeDataset.campaignSimulationScenarios.map((item) => [item.id, item.name])} />
          <PercentField label="İndirim oranı" value={percentValue(scenario.discountRate)} onChange={(value) => workspace.updateCampaignSimulationOverride(scenario.id, { discountRate: value })} />
          <NumberField label="Kupon tutarı" value={numberValue(scenario.couponAmount)} onChange={(value) => workspace.updateCampaignSimulationOverride(scenario.id, { couponAmount: value })} />
          <SelectField label="Ücretsiz kargo" value={String(scenario.freeShipping)} onChange={(value) => workspace.updateCampaignSimulationOverride(scenario.id, { freeShipping: value === 'true' })} options={[['false', 'Kapalı'], ['true', 'Açık']]} />
          <PercentField label="Beklenen satış artışı" value={percentValue(scenario.expectedSalesLift)} onChange={(value) => workspace.updateCampaignSimulationOverride(scenario.id, { expectedSalesLift: value })} />
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100">
        Veri değiştiğinde yeniden analiz önerilir.
      </div>
      </section>
    </details>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<[string, string]>
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-emerald-300/45"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-emerald-300/45"
      />
    </label>
  )
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: number) => void
}) {
  return (
    <NumberField label={`${label} (%)`} value={value} onChange={(number) => onChange(number / 100)} />
  )
}
