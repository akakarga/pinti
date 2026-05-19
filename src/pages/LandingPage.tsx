import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChevronDown,
  Compass,
  HandCoins,
  Megaphone,
  ShieldCheck,
  Tags,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PintiAppIcon } from '../components/brand/PintiAppIcon'
import { useDemoAuth } from '../context/DemoAuthContext'

const heroSignals = [
  {
    title: 'ROAS iyi ama kâr zayıf',
    detail: 'Reklam satış getiriyor, fakat komisyon ve kargo sonrası net kâr aynı hızda büyümüyor.',
    tone: 'mint',
  },
  {
    title: 'İade kârı eritiyor',
    detail: 'Çok satan ürünlerde iade oranı yükselince görünür ciro cebinde kalan tutarı saklıyor.',
    tone: 'amber',
  },
  {
    title: 'Hakediş farkı kontrol istiyor',
    detail: 'Hakediş kaydı ile banka hareketi aynı hikayeyi anlatmıyorsa Pinti bunu öne çıkarır.',
    tone: 'rose',
  },
]

const proofItems = ['Satış', 'Reklam', 'İade', 'Hakediş', 'Fiyat', 'Kampanya']

const flowSteps = [
  {
    step: '01',
    title: 'Verini seç veya yükle',
    description: 'Demo mağazayla başla ya da kendi örnek JSON verini Veri Merkezi’nde aç.',
  },
  {
    step: '02',
    title: 'Analizi başlat',
    description: 'Pinti satıştan sonra reklam, iade, hakediş, fiyat ve kampanya etkisini sıraya koyar.',
  },
  {
    step: '03',
    title: 'İlk 3 kontrolü gör',
    description: 'Bugün önce bakman gereken finansal kontroller tek kısa listede görünür.',
  },
  {
    step: '04',
    title: 'Detaya in',
    description: 'Kâr, reklam, iade, hakediş ve fiyat modüllerinde sinyalin nedenini incele.',
  },
]

const controlAreas = [
  {
    title: 'Ürün kârı',
    description: 'Satış fiyatı, komisyon, kargo ve maliyet sonrası ürün bazında cebinde kalanı gösterir.',
    icon: Compass,
  },
  {
    title: 'Reklam sonrası kâr',
    description: 'ROAS parlak görünse bile reklamdan sonra kârın zayıfladığı ürünleri ayırır.',
    icon: Megaphone,
  },
  {
    title: 'İade kaybı',
    description: 'İadenin kargo, komisyon ve operasyon maliyetiyle net kâra etkisini okunur yapar.',
    icon: ShieldCheck,
  },
  {
    title: 'Hakediş farkı',
    description: 'Hakediş kaydı ile banka hareketi ayrıştığında satıcının kontrol etmesi gereken farkı açar.',
    icon: HandCoins,
  },
  {
    title: 'Fiyat riski',
    description: 'Kampanya veya fiyat değişimi minimum kâr çizgisini bozduğunda bunu erken gösterir.',
    icon: Tags,
  },
  {
    title: 'Kampanya etkisi',
    description: 'İndirim satış getirse bile cebinde kalan tutara etkisini ayrı sinyal olarak okur.',
    icon: BadgePercent,
  },
]

const benefits = [
  {
    title: 'Ciro yerine gerçek net kârı gösterir.',
    description: 'Satış tutarının arkasındaki komisyon, kargo, reklam ve iade baskısını birlikte okur.',
  },
  {
    title: 'ROAS’ı kâr etkisiyle kontrol eder.',
    description: 'ROAS güçlü görünse bile cebinde kalan para zayıflıyorsa bunu ayrı sinyal yapar.',
  },
  {
    title: 'İade ve hakediş farklarını görünür yapar.',
    description: 'Gözden kaçan operasyon kayıplarını satıcının anlayacağı netlikte öne çıkarır.',
  },
  {
    title: 'Tüm sinyalleri ilk 3 kontrole indirir.',
    description: 'Uzun tablo okumadan, bugün hangi finansal konuya bakacağını açıkça gösterir.',
  },
]

const faqItems = [
  {
    question: 'Pinti finansal tavsiye verir mi?',
    answer: 'Hayır. Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.',
  },
  {
    question: 'Kendi verimi yükleyebilir miyim?',
    answer: 'Evet. Uygun JSON veri seti Veri Merkezi üzerinden yüklenebilir.',
  },
  {
    question: 'Gerçek pazaryeri entegrasyonu var mı?',
    answer: 'Bu MVP’de gerçek pazaryeri entegrasyonu yoktur. Demo veri ve JSON veri yükleme akışı vardır.',
  },
  {
    question: 'Backend ücretli servis kullanıyor mu?',
    answer: 'Hayır. Bu demo sürüm sıfır bütçeli local akışla çalışır.',
  },
  {
    question: 'Gemini/API key gerekiyor mu?',
    answer: 'Hayır. Gemini opsiyoneldir ve yalnızca kullanıcı butona basarsa kullanılır. Pinti Gemini olmadan da çalışır.',
  },
  {
    question: 'Bu proje demo verisiyle mi çalışıyor?',
    answer: 'Evet. Demo veriyle ve kullanıcı tarafından yüklenen örnek JSON veriyle çalışır.',
  },
]

function useLandingReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])
}

function useLandingLoader() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false

    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!isLoading) return

    const timer = window.setTimeout(() => setIsLoading(false), 850)

    return () => window.clearTimeout(timer)
  }, [isLoading])

  return isLoading
}

function LandingLoader() {
  return (
    <div className="pinti-landing-loader" role="status" aria-label="Pinti hazırlanıyor">
      <div className="pinti-loader-card">
        <PintiAppIcon className="h-12 w-12 rounded-[1.35rem]" />
        <div className="pinti-loader-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p>Pinti hazırlanıyor</p>
      </div>
    </div>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div className={className} data-reveal style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    card.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`)
    card.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`)
    card.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(0)}%`)
    card.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(0)}%`)
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return

    card.style.setProperty('--tilt-x', '0deg')
    card.style.setProperty('--tilt-y', '0deg')
    card.style.setProperty('--glare-x', '50%')
    card.style.setProperty('--glare-y', '35%')
  }

  return (
    <div
      ref={cardRef}
      className={`pinti-tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

function HeroPreview() {
  return (
    <TiltCard className="pinti-hero-preview rounded-[2rem] p-4 sm:p-5">
      <div className="pinti-preview-topline">
        <div>
          <span className="pinti-soft-label">Nova Aksesuar · Yerel demo</span>
          <p className="mt-2 text-sm text-[#f7f2e8]/62">Satış sonrası kontrol akışı</p>
        </div>
        <span className="pinti-status-pill">
          <CheckCircle2 className="h-4 w-4" />
          Kontroller hazır
        </span>
      </div>

      <div className="pinti-sequence-grid mt-6">
        <div className="pinti-signal-stack" aria-label="Pinti gelen sinyalleri">
          <p className="pinti-mini-label">Gelen sinyaller</p>
          {heroSignals.map((signal, index) => (
            <article key={signal.title} className={`pinti-signal-card is-${signal.tone}`}>
              <div className="pinti-signal-index">{index + 1}</div>
              <div>
                <h3>{signal.title}</h3>
                <p>{signal.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="pinti-sequence-bridge" aria-hidden="true">
          <span>Pinti okur</span>
          <ArrowRight className="h-5 w-5" />
        </div>

        <div className="pinti-action-panel">
          <div className="pinti-action-panel-head">
            <div>
              <p className="pinti-mini-label">Bugünün ilk 3 kontrolü</p>
              <h3>Öncelik sırası</h3>
            </div>
            <span>3</span>
          </div>
          <ol>
            <li>Hakediş farkını banka hareketiyle karşılaştır.</li>
            <li>ROAS iyi görünen ürünlerde net kârı yeniden oku.</li>
            <li>İade oranı kârı eriten ürünü incele.</li>
          </ol>
        </div>
      </div>
    </TiltCard>
  )
}

function FaqItem({ item, index }: { item: (typeof faqItems)[number]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0)
  const panelId = `pinti-faq-${index}`

  return (
    <article className={`pinti-faq-item ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="pinti-faq-button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{item.question}</span>
        <ChevronDown className="h-5 w-5" aria-hidden="true" />
      </button>
      <div id={panelId} className="pinti-faq-panel">
        <p>{item.answer}</p>
      </div>
    </article>
  )
}

export function LandingPage() {
  const { isAuthenticated } = useDemoAuth()
  const demoTarget = isAuthenticated ? '/app/demo-verisi' : '/login'
  const isLoading = useLandingLoader()
  const heroRef = useRef<HTMLElement>(null)

  useLandingReveal()

  function handleHeroMouseMove(event: MouseEvent<HTMLElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const hero = heroRef.current
    if (!hero) return

    const rect = hero.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    hero.style.setProperty('--parallax-x', `${(x * 18).toFixed(2)}px`)
    hero.style.setProperty('--parallax-y', `${(y * 14).toFixed(2)}px`)
  }

  function resetHeroParallax() {
    const hero = heroRef.current
    if (!hero) return

    hero.style.setProperty('--parallax-x', '0px')
    hero.style.setProperty('--parallax-y', '0px')
  }

  return (
    <main className="pinti-landing min-h-screen overflow-x-hidden text-[#f7f2e8]">
      {isLoading ? <LandingLoader /> : null}

      <header className="pinti-site-header">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3" aria-label="Pinti ana sayfa">
            <PintiAppIcon />
            <span>
              <span className="block text-lg font-bold text-[#fff8ec]">Pinti</span>
              <span className="block text-xs font-medium text-[#f7f2e8]/52">
                Karar destek sistemi
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold text-[#f7f2e8]/68 lg:flex">
            <a href="#nasil-calisir" className="pinti-nav-link">
              Nasıl çalışır?
            </a>
            <a href="#ozellikler" className="pinti-nav-link">
              Özellikler
            </a>
            <a href="#sss" className="pinti-nav-link">
              SSS
            </a>
            <Link to="/login" className="pinti-nav-link">
              Giriş
            </Link>
          </div>

          <Link to={demoTarget} className="pinti-header-cta group">
            Demo hesabıyla başla
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </header>

      <section
        ref={heroRef}
        className="pinti-hero relative overflow-hidden px-4 pb-12 pt-8 sm:px-6 lg:px-8"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroParallax}
      >
        <div className="pinti-hero-bg" aria-hidden="true" />
        <img
          aria-hidden="true"
          src="/assets/pinti-abstract-header.png"
          alt=""
          width="1916"
          height="821"
          decoding="async"
          className="pinti-hero-asset"
        />

        <div className="pinti-hero-layout relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 lg:min-h-[calc(100vh-188px)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          <Reveal className="min-w-0">
            <p className="pinti-hero-kicker">Küçük e-ticaret satıcısı için günlük finans kontrolü</p>
            <h1 className="pinti-hero-title">
              Satış var,{' '}
              <span className="pinti-profit-word">
                kâr nerede?
              </span>
            </h1>
            <p className="pinti-hero-copy">
              Pinti; satış, reklam, iade, hakediş, fiyat ve kampanya verilerini
              sadeleştirir. Bugün ilk bakman gereken 3 finansal kontrolü tek sırada
              gösterir.
            </p>
            <p className="pinti-hero-note">
              Ciro iyi görünebilir; Pinti cebinde kalanı kontrol eder.
            </p>
            <p className="pinti-hero-disclaimer">
              Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.
            </p>

            <div className="pinti-hero-actions">
              <Link to={demoTarget} className="pinti-primary-cta group">
                Demo hesabıyla başla
                <span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a href="#nasil-calisir" className="pinti-secondary-cta group">
                Nasıl çalışır?
                <ArrowRight className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      <section className="pinti-signal-ribbon-section px-4 py-6 sm:px-6 lg:px-8">
        <Reveal>
          <div className="pinti-signal-ribbon mx-auto max-w-[1200px]">
            <p>Pinti satıştan sonra geriye ne kaldığını okur.</p>
            <div className="pinti-proof-strip" aria-label="Pinti kontrol alanları">
              {proofItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="nasil-calisir" className="pinti-section px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="max-w-3xl">
            <p className="pinti-section-kicker">Nasıl çalışır?</p>
            <h2 className="pinti-section-title">
              Uzun tablo, kısa kontrol listesine dönüşür.
            </h2>
            <p className="pinti-section-copy">
              Pinti modülleri ikinci plana iter; satıcıya önce bugün neye bakacağını
              gösterir.
            </p>
          </Reveal>

          <div className="pinti-flow-list mt-10">
            {flowSteps.map((item, index) => (
              <Reveal key={item.step} delay={index * 75}>
                <article className="pinti-step-card">
                  <span className="pinti-step-number">{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="ozellikler" className="pinti-section px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="pinti-section-kicker">Pinti neyi kontrol eder?</p>
              <h2 className="pinti-section-title">
                Pinti kârı saklayan noktaları tek tek görünür yapar.
              </h2>
            </div>
            <p className="pinti-section-copy max-w-xl">
              Satış, reklam, iade, hakediş, fiyat ve kampanya sinyalleri aynı sırada
              okununca satıcı neyin kârı sakladığını daha hızlı görür.
            </p>
          </Reveal>

          <div className="pinti-feature-grid mt-9">
            {controlAreas.map(({ title, description, icon: Icon }, index) => (
              <Reveal key={title} delay={index * 55}>
                <article className="pinti-feature-card">
                  <span>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pinti-section px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <Reveal>
            <div className="pinti-bento-main">
              <p className="pinti-section-kicker">Neden Pinti?</p>
              <h2 className="pinti-section-title">
                Pinti hesap yapmaz gibi görünmez; neye bakacağını açıkça söyler.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-6 text-[#f7f2e8]/58">
                Bu demo sürüm sıfır bütçeli local akışla çalışır. Gemini opsiyoneldir
                ve yalnızca kullanıcı butona basarsa kullanılır.
              </p>
            </div>
          </Reveal>

          <div className="pinti-benefit-list">
            {benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 70}>
                <article className={`pinti-benefit-card ${index === 0 ? 'is-large' : ''}`}>
                  <CheckCircle2 className="h-5 w-5 text-[#8fe7c6]" />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sss" className="pinti-section px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="max-w-xl">
              <p className="pinti-section-kicker">Sık Sorulan Sorular</p>
              <h2 className="pinti-section-title">
                Aklında soru kalmasın.
              </h2>
              <p className="pinti-section-copy">
                Bu MVP’nin ne yaptığını ve neyi özellikle abartmadığını açıkça
                anlatıyoruz.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid gap-3">
              {faqItems.map((item, index) => (
                <FaqItem key={item.question} item={item} index={index} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="pinti-final-cta mx-auto max-w-[1200px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f0c37a]/22 bg-[#f0c37a]/10 px-3 py-1.5 text-xs font-bold text-[#f4cf92]">
                <TriangleAlert className="h-4 w-4" />
                Karar desteği
              </div>
              <h2 className="pinti-section-title">
                Ciroyu değil, cebinde kalanı gör.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f7f2e8]/58">
                Demo hesabıyla gir, veri seçimini yap ve Pinti’nin bugünün ilk 3
                kontrolünü nasıl öne çıkardığını gör.
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link to={demoTarget} className="pinti-primary-cta group">
                Demo hesabıyla başla
                <span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a href="#nasil-calisir" className="pinti-secondary-cta group">
                Nasıl çalışır?
                <ArrowRight className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.08] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 text-sm text-[#f7f2e8]/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PintiAppIcon className="h-9 w-9 rounded-xl" />
            <span>Pinti</span>
          </div>
          <p>Hackathon MVP · Sıfır bütçeli local demo · Karar destek sistemi</p>
        </div>
      </footer>
    </main>
  )
}
