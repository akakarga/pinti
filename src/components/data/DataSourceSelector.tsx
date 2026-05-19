import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'
import type { PintiDataset } from '../../types'

const sellerPresentation: Record<
  string,
  {
    monogram: string
    platform: string
    volume: string
    risk: string
  }
> = {
  'luna-ev-yasam': {
    monogram: 'LE',
    platform: 'Trendyol',
    volume: '₺150B - ₺200B',
    risk: 'Kargo + iade etkisi',
  },
  'nova-aksesuar': {
    monogram: 'NA',
    platform: 'Hepsiburada',
    volume: '₺50B - ₺80B',
    risk: 'ROAS yanıltısı',
  },
  'pera-bebek-anne': {
    monogram: 'PB',
    platform: 'Trendyol',
    volume: '₺80B - ₺120B',
    risk: 'Fiyat + kupon baskısı',
  },
  'mira-kozmetik': {
    monogram: 'MK',
    platform: 'Pazaryeri karması',
    volume: '₺100B - ₺150B',
    risk: 'Hakediş + iade kontrolü',
  },
}

function makeMonogram(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toLocaleUpperCase('tr-TR')
}

function getSellerPresentation(dataset: PintiDataset) {
  return sellerPresentation[dataset.id] ?? {
    monogram: makeMonogram(dataset.companyProfile.name),
    platform: dataset.companyProfile.marketplace,
    volume: `${dataset.companyProfile.monthlyOrderVolume.toLocaleString('tr-TR')} sipariş/ay`,
    risk: dataset.companyProfile.riskProfile,
  }
}

export function DataSourceSelector() {
  const {
    availableDatasets,
    activeDatasetId,
    selectDemoDataset,
  } = useDataWorkspace()

  return (
    <section className="pinti-seller-selector">
      <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-end">
        <div>
          <p className="pinti-section-kicker">
            Örnek satıcı profilleri
          </p>
          <h2>
            Hangi satıcı profiliyle başlayalım?
          </h2>
          <p>
            Her profil farklı bir kâr akışını gösterir. Seçim yalnızca sunum için
            kullanılan yerel örnek veriyi değiştirir.
          </p>
        </div>
      </div>

      <div className="pinti-seller-grid">
        {availableDatasets.map((dataset) => {
          const isActive = activeDatasetId === dataset.id
          const strongestModules = dataset.companyProfile.strongestModules.slice(0, 2)
          const presentation = getSellerPresentation(dataset)

          return (
            <article
              key={dataset.id}
              className={`pinti-seller-card ${isActive ? 'is-active' : 'is-muted'}`}
            >
              <div className="pinti-seller-card-top">
                <div className="pinti-seller-monogram" aria-hidden="true">
                  {presentation.monogram}
                </div>
                {isActive ? (
                  <span className="pinti-seller-active-badge">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Seçili
                  </span>
                ) : null}
              </div>

              <div className="pinti-seller-card-copy">
                <h3>{dataset.companyProfile.name}</h3>
                <p>{dataset.companyProfile.sector}</p>
              </div>

              <dl className="pinti-seller-meta">
                <div>
                  <dt>Platform</dt>
                  <dd>{presentation.platform}</dd>
                </div>
                <div>
                  <dt>Aylık hacim</dt>
                  <dd>{presentation.volume}</dd>
                </div>
                <div>
                  <dt>Öne çıkan risk</dt>
                  <dd>{presentation.risk}</dd>
                </div>
              </dl>

              <p className="pinti-seller-risk">
                {dataset.companyProfile.riskProfile}
              </p>

              <div className="pinti-seller-modules">
                {strongestModules.map((moduleName) => (
                  <span
                    key={moduleName}
                  >
                    {moduleName}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => selectDemoDataset(dataset.id)}
                className="pinti-link pinti-seller-select"
                aria-pressed={isActive}
              >
                {isActive ? 'Seçili profil' : 'Bu profili seç'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
