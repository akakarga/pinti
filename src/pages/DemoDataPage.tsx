import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Play,
  RotateCcw,
  Store,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../components/cards/StatusBadge'
import { DataSourceSelector } from '../components/data/DataSourceSelector'
import { DataValidationPanel } from '../components/data/DataValidationPanel'
import { FileUploadPanel } from '../components/data/FileUploadPanel'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { useDataWorkspace } from '../context/DataWorkspaceContext'
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from '../utils/formatters'

function ReadinessItem({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'ready' | 'waiting' | 'error'
}) {
  return (
    <div className={`pinti-readiness-item is-${tone}`}>
      <span aria-hidden="true" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export function DemoDataPage() {
  const {
    activeDataset,
    dataSourceType,
    analysisStatus,
    lastAnalyzedAt,
    uploadedDatasetName,
    validationResult,
    startAnalysis,
  } = useDataWorkspace()

  const statusLabel =
    analysisStatus === 'completed'
      ? 'Analiz tamamlandı'
      : analysisStatus === 'running'
        ? 'Analiz çalışıyor'
        : analysisStatus === 'error'
          ? 'Veri kontrolü gerekiyor'
          : analysisStatus === 'idle'
            ? 'Veri bekleniyor'
            : 'Analize hazır'
  const isRunning = analysisStatus === 'running'
  const isCompleted = analysisStatus === 'completed'
  const isDisabled = !activeDataset || !validationResult.isValid || isRunning
  const sourceLabel =
    dataSourceType === 'uploaded'
      ? `Yüklenen veri${uploadedDatasetName ? ` · ${uploadedDatasetName}` : ''}`
      : 'Örnek satıcı profili'
  const analysisButtonLabel = isCompleted ? 'Analizi Yenile' : 'Finansal Analizi Başlat'
  const nextStepCopy = isCompleted
    ? 'İlk 3 kontrol hazır. Genel Bakış veya AI Aksiyon Merkezi’nden devam edebilirsin.'
    : isRunning
      ? 'Pinti bu veriyle bugünün ilk 3 kontrolünü çıkarıyor.'
      : 'Sonraki adım: analizi başlat ve bugünün ilk 3 kontrolünü gör.'

  return (
    <div className="pinti-veri-page space-y-7 pb-6">
      <section className="pinti-data-hero relative overflow-hidden rounded-[1.55rem] p-5 sm:p-7">
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="max-w-4xl">
            <div className="pinti-entry-badge">
              <Database className="h-4 w-4" />
              Başlangıç noktası
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Veri Merkezi
            </h1>
            <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-white sm:text-2xl">
              Hangi işletmenin kâr akışını inceleyelim?
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              Verini seç, analizi başlat, Pinti satıştan sonra cebinde ne kaldığını
              bu veriyle okur.
            </p>
          </div>
          <p className="pinti-data-hero-note">
            Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.
          </p>
        </div>
      </section>

      <section className="pinti-readiness-panel">
        <div className="pinti-readiness-heading">
          <div>
            <p className="pinti-section-kicker">Analize hazır veri</p>
            <h2>Bağlı veri kaynakları</h2>
          </div>
          <div className="pinti-readiness-status">
            {analysisStatus === 'running' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : validationResult.isValid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <TriangleAlert className="h-4 w-4" />
            )}
            {statusLabel}
          </div>
        </div>

        <div className="pinti-readiness-body">
          <div className="pinti-selected-seller">
            <span>
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p>Seçili profil</p>
              <h3>{activeDataset?.companyProfile.name ?? 'Henüz satıcı seçilmedi'}</h3>
              <p>{activeDataset?.companyProfile.sector ?? 'Devam etmek için bir işletme seç.'}</p>
            </div>
          </div>

          <div className="pinti-readiness-list">
            <ReadinessItem label="Kaynak" value={sourceLabel} tone="ready" />
            <ReadinessItem
              label="Sipariş ve iade"
              value={`${formatNumber(validationResult.counts.orders)} sipariş · ${formatNumber(validationResult.counts.returns)} iade`}
              tone={validationResult.counts.orders > 0 ? 'ready' : 'waiting'}
            />
            <ReadinessItem
              label="Kâr girdileri"
              value={`${formatNumber(validationResult.counts.products)} ürün · ${formatNumber(validationResult.counts.campaigns)} reklam`}
              tone={validationResult.counts.products > 0 ? 'ready' : 'waiting'}
            />
            <ReadinessItem
              label="Son analiz"
              value={lastAnalyzedAt ? formatDateTime(lastAnalyzedAt) : 'Henüz çalışmadı'}
              tone={isCompleted ? 'ready' : analysisStatus === 'error' ? 'error' : 'waiting'}
            />
          </div>
        </div>
      </section>

      <DataSourceSelector />

      <section className="pinti-analysis-guide">
        <div className="min-w-0">
          <div className="pinti-analysis-guide-status">
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : analysisStatus === 'error' ? (
              <TriangleAlert className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
            {statusLabel}
          </div>
          <h2>
            {activeDataset ? `${activeDataset.companyProfile.name} seçildi.` : 'Bir satıcı profili seç.'}
          </h2>
          <p>{nextStepCopy}</p>
        </div>

        <div className="pinti-analysis-guide-actions">
          {isCompleted ? (
            <div className="pinti-analysis-followups">
              <Link to="/app/overview" className="pinti-link">
                Genel Bakış
              </Link>
              <Link to="/app/ai-aksiyon-merkezi" className="pinti-link">
                AI Aksiyon Merkezi
              </Link>
            </div>
          ) : null}
          {!validationResult.isValid ? (
            <Link to="/app/demo-verisi" className="pinti-link pinti-analysis-secondary">
              Veri Merkezi’ne dön
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void startAnalysis()}
            disabled={isDisabled}
            className="pinti-link pinti-analysis-primary"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCompleted ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {analysisButtonLabel}
          </button>
        </div>
      </section>

      <CollapsibleSection
        eyebrow="Gelişmiş"
        title="Kendi veri dosyanı yükle"
        description="JSON veya CSV dosya denemeleri ana akışın altında tutulur."
      >
        <FileUploadPanel />
      </CollapsibleSection>

      <CollapsibleSection
        eyebrow="Gelişmiş"
        title="Veri doğrulama detayları"
        description="İlişki kontrolleri ve kayıt sayıları burada yer alır."
      >
        <DataValidationPanel validation={validationResult} />
      </CollapsibleSection>

      {activeDataset ? (
        <CollapsibleSection
          eyebrow="Gelişmiş"
          title="Veri önizleme"
          description="Ham veri tabloları ihtiyaç halinde açılır."
        >
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {[
              ['Ürün', validationResult.counts.products],
              ['Sipariş', validationResult.counts.orders],
              ['İade', validationResult.counts.returns],
              ['Müşteri', validationResult.counts.customers],
              ['Kampanya', validationResult.counts.campaigns],
              ['Reklam performansı', validationResult.counts.campaignPerformance],
              ['Hakediş', validationResult.counts.settlements],
              ['Banka işlemi', validationResult.counts.bankTransactions],
              ['Simülasyon', validationResult.counts.campaignSimulationScenarios],
              ['Ödeme itirazı', validationResult.counts.paymentDisputes],
            ].map(([label, value]) => (
              <article key={label} className="pinti-panel-quiet rounded-2xl p-4">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="pinti-tabular mt-2 text-2xl font-semibold text-white">{value}</p>
              </article>
            ))}
          </section>

          <section className="mt-5 grid gap-6 xl:grid-cols-2">
            <article className="pinti-panel rounded-[1.5rem] p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Ürün ve fiyat girdileri</h2>
                <p className="mt-1 text-sm text-slate-400">
                  KârPusula ve FiyatKoruma bu ürün girdileriyle hesaplama yapar.
                </p>
              </div>
              <div
                className="pinti-scroll-region overflow-x-auto"
                tabIndex={0}
                aria-label="Ürün tablosu yatay kaydırma alanı"
              >
                <table className="pinti-table w-full min-w-[780px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                      <th className="pb-3">Ürün</th>
                      <th className="pb-3">Fiyat</th>
                      <th className="pb-3">Maliyet</th>
                      <th className="pb-3">Komisyon</th>
                      <th className="pb-3">Kargo</th>
                      <th className="pb-3">Hedef marj</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {activeDataset.products.map((product) => (
                      <tr key={product.id}>
                        <td className="py-3">
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{product.sku}</p>
                        </td>
                        <td className="py-3 text-slate-300">{formatCurrency(product.salePrice)}</td>
                        <td className="py-3 text-slate-300">{formatCurrency(product.unitCost)}</td>
                        <td className="py-3 text-slate-300">{formatPercent(product.commissionRate)}</td>
                        <td className="py-3 text-slate-300">{formatCurrency(product.averageShippingCost)}</td>
                        <td className="py-3 text-slate-300">{formatPercent(product.targetNetMargin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="pinti-panel rounded-[1.5rem] p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Sipariş ve iade örnekleri</h2>
                <p className="mt-1 text-sm text-slate-400">
                  İlk kayıtlar ilişki kontrolü için gösterilir.
                </p>
              </div>
              <div
                className="pinti-scroll-region overflow-x-auto"
                tabIndex={0}
                aria-label="Sipariş ve iade tablosu yatay kaydırma alanı"
              >
                <table className="pinti-table w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                      <th className="pb-3">Sipariş</th>
                      <th className="pb-3">Ürün</th>
                      <th className="pb-3">Adet</th>
                      <th className="pb-3">Birim fiyat</th>
                      <th className="pb-3">İade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {activeDataset.orders.slice(0, 8).map((order) => (
                      <tr key={order.id}>
                        <td className="py-3 font-medium text-white">{order.id}</td>
                        <td className="py-3 text-slate-400">{order.productId}</td>
                        <td className="py-3 font-mono text-slate-300">{formatNumber(order.quantity)}</td>
                        <td className="py-3 text-slate-300">{formatCurrency(order.unitPrice)}</td>
                        <td className="py-3">
                          <StatusBadge
                            level={order.hasReturn ? 'watch' : 'healthy'}
                            label={order.hasReturn ? 'Var' : 'Yok'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </CollapsibleSection>
      ) : null}
    </div>
  )
}
