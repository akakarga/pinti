import { useMemo, useState, type ChangeEvent } from 'react'
import { FileJson, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'
import type { CsvRow } from '../../utils/csvParser'
import { parseCsv } from '../../utils/csvParser'
import { validateDataset } from '../../utils/dataValidation'
import type { PintiDataset } from '../../types'

type CsvPartKey =
  | 'products'
  | 'orders'
  | 'returns'
  | 'campaigns'
  | 'settlements'
  | 'bankTransactions'

const csvParts: Array<{ key: CsvPartKey; label: string; fileName: string }> = [
  { key: 'products', label: 'Ürünler', fileName: 'products.csv' },
  { key: 'orders', label: 'Siparişler', fileName: 'orders.csv' },
  { key: 'returns', label: 'İadeler', fileName: 'returns.csv' },
  { key: 'campaigns', label: 'Kampanyalar', fileName: 'campaigns.csv' },
  { key: 'settlements', label: 'Hakedişler', fileName: 'settlements.csv' },
  { key: 'bankTransactions', label: 'Banka hareketleri', fileName: 'bankTransactions.csv' },
]

function normalizeUploadedDataset(value: unknown, fallbackDataset: PintiDataset): PintiDataset {
  const parsed = value as Partial<PintiDataset>

  return {
    id: parsed.id ?? `uploaded-${Date.now()}`,
    companyProfile: {
      ...fallbackDataset.companyProfile,
      id: parsed.companyProfile?.id ?? `uploaded-${Date.now()}`,
      name: parsed.companyProfile?.name ?? 'Yüklenen Veri Seti',
      sector: parsed.companyProfile?.sector ?? 'Yüklenen veri',
      marketplace: parsed.companyProfile?.marketplace ?? 'Frontend yükleme',
      monthlyOrderVolume:
        parsed.companyProfile?.monthlyOrderVolume ?? parsed.orders?.length ?? 0,
      riskProfile: parsed.companyProfile?.riskProfile ?? 'Yüklenen veri doğrulanıyor.',
      description:
        parsed.companyProfile?.description ??
        'Bu veri seti frontend içinde yükleme akışıyla yüklenmiştir.',
      strongestModules: parsed.companyProfile?.strongestModules ?? ['KârPusula'],
    },
    products: parsed.products ?? [],
    orders: parsed.orders ?? [],
    returns: parsed.returns ?? [],
    customers: parsed.customers ?? fallbackDataset.customers,
    paymentDisputes: parsed.paymentDisputes ?? fallbackDataset.paymentDisputes,
    campaigns: parsed.campaigns ?? [],
    campaignPerformance: parsed.campaignPerformance ?? fallbackDataset.campaignPerformance,
    settlements: parsed.settlements ?? [],
    bankTransactions: parsed.bankTransactions ?? [],
    campaignSimulationScenarios:
      parsed.campaignSimulationScenarios ?? fallbackDataset.campaignSimulationScenarios,
  }
}

function formatFileSize(file: File) {
  return `${Math.max(1, Math.round(file.size / 1024))} KB`
}

export function FileUploadPanel() {
  const { activeDataset, uploadDataset } = useDataWorkspace()
  const [jsonStatus, setJsonStatus] = useState<string>('JSON veri dosyası seçilmedi.')
  const [jsonWarnings, setJsonWarnings] = useState<string[]>([])
  const [csvRowsByPart, setCsvRowsByPart] = useState<Partial<Record<CsvPartKey, CsvRow[]>>>({})
  const [csvWarnings, setCsvWarnings] = useState<string[]>([])

  const csvSummary = useMemo(
    () =>
      csvParts.map((part) => ({
        ...part,
        count: csvRowsByPart[part.key]?.length ?? 0,
      })),
    [csvRowsByPart],
  )

  async function handleJsonUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file || !activeDataset) {
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const dataset = normalizeUploadedDataset(parsed, activeDataset)
      const validation = validateDataset(dataset)

      setJsonWarnings([...validation.errors, ...validation.warnings])

      if (!validation.isValid) {
        setJsonStatus(`${file.name} okundu ama analiz için eksik alanlar var.`)
        return
      }

      uploadDataset(dataset, file.name)
      setJsonStatus(`${file.name} (${formatFileSize(file)}) aktif veri seti olarak yüklendi.`)
    } catch {
      setJsonStatus('JSON dosyası okunamadı. Dosya formatı kontrol edilmeli.')
      setJsonWarnings(['Geçersiz JSON yapısı.'])
    } finally {
      event.target.value = ''
    }
  }

  async function handleCsvUpload(partKey: CsvPartKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const parsed = parseCsv(await file.text())
    setCsvRowsByPart((currentRows) => ({
      ...currentRows,
      [partKey]: parsed.rows,
    }))
    setCsvWarnings((currentWarnings) => [
      ...currentWarnings,
      ...parsed.warnings.map((warning) => `${file.name}: ${warning}`),
    ])
    event.target.value = ''
  }

  function activateCsvDataset() {
    if (!activeDataset) {
      return
    }

    const dataset: PintiDataset = {
      ...activeDataset,
      id: `csv-upload-${Date.now()}`,
      companyProfile: {
        ...activeDataset.companyProfile,
        id: `csv-upload-${Date.now()}`,
        name: 'CSV Yüklenen Veri Seti',
        marketplace: 'Frontend CSV simülasyonu',
        description:
          'CSV dosyalarından parse edilen alanlar mevcut demo veri setiyle birleştirildi.',
      },
      products:
        (csvRowsByPart.products as unknown as PintiDataset['products']) ??
        activeDataset.products,
      orders:
        (csvRowsByPart.orders as unknown as PintiDataset['orders']) ??
        activeDataset.orders,
      returns:
        (csvRowsByPart.returns as unknown as PintiDataset['returns']) ??
        activeDataset.returns,
      campaigns:
        (csvRowsByPart.campaigns as unknown as PintiDataset['campaigns']) ??
        activeDataset.campaigns,
      settlements:
        (csvRowsByPart.settlements as unknown as PintiDataset['settlements']) ??
        activeDataset.settlements,
      bankTransactions:
        (csvRowsByPart.bankTransactions as unknown as PintiDataset['bankTransactions']) ??
        activeDataset.bankTransactions,
    }
    const validation = validateDataset(dataset)
    setCsvWarnings([...validation.errors, ...validation.warnings])

    if (validation.isValid) {
      uploadDataset(dataset, 'csv-upload')
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex items-center gap-3 text-emerald-100">
          <FileJson className="h-5 w-5" />
          <h2 className="text-xl font-semibold text-white">JSON veri yükleme</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Tek dosyada şirket profili, ürün, sipariş, iade, kampanya, hakediş ve banka
          hareketlerini içeren veri seti yüklenebilir. Bu işlem tamamen frontend içinde
          simüle edilir.
        </p>
        <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300/25 bg-emerald-300/[0.04] p-6 text-center transition hover:border-emerald-300/45">
          <UploadCloud className="h-7 w-7 text-emerald-100" />
          <span className="mt-3 text-sm font-semibold text-white">JSON dosyası seç</span>
          <span className="mt-1 text-xs text-slate-400">Ön kontrol ve doğrulama</span>
          <input type="file" accept="application/json,.json" className="sr-only" onChange={handleJsonUpload} />
        </label>
        <p className="mt-4 text-sm text-slate-300">{jsonStatus}</p>
        {jsonWarnings.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs leading-5 text-amber-100">
            {jsonWarnings.slice(0, 4).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </article>

      <article className="pinti-panel rounded-[1.5rem] p-5">
        <div className="flex items-center gap-3 text-cyan-100">
          <FileSpreadsheet className="h-5 w-5" />
          <h2 className="text-xl font-semibold text-white">CSV dosya yükleme simülasyonu</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Ayrı CSV dosyaları başlık satırıyla okunur. Eksik dosyalar seçili demo
          veri setinden tamamlanır; bu gerçek backend aktarımı değildir.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {csvParts.map((part) => (
            <label
              key={part.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 transition hover:border-cyan-300/30"
            >
              <span>
                <span className="block text-sm font-semibold text-white">{part.label}</span>
                <span className="text-xs text-slate-500">{part.fileName}</span>
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                {csvRowsByPart[part.key]?.length ?? 0} satır
              </span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void handleCsvUpload(part.key, event)} />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={activateCsvDataset}
          disabled={Object.keys(csvRowsByPart).length === 0}
          className="pinti-link mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/30 px-5 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-slate-600"
        >
          CSV setini aktif yap
        </button>
        <div className="mt-4 flex flex-wrap gap-2">
          {csvSummary.map((part) => (
            <span key={part.key} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              {part.label}: {part.count}
            </span>
          ))}
        </div>
        {csvWarnings.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs leading-5 text-amber-100">
            {csvWarnings.slice(0, 5).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  )
}
