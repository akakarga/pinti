import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PintiAppIcon } from '../brand/PintiAppIcon'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { Sidebar } from './Sidebar'

function DemoAppGate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithDemo } = useDemoAuth()

  function handleContinue() {
    loginWithDemo()
    navigate('/app/demo-verisi', { replace: true })
  }

  return (
    <main className="pinti-entry-shell pinti-noise min-h-screen overflow-x-hidden px-4 py-8 text-white sm:py-10">
      <section className="pinti-entry-wrap">
        <Link to="/" className="pinti-entry-brand">
          <PintiAppIcon />
          <span>
            <span>Pinti</span>
            <span>Demo kapısı</span>
          </span>
        </Link>

        <div className="pinti-entry-card pinti-entry-gate-card grid lg:grid-cols-[1fr_0.86fr]">
          <aside className="pinti-entry-side">
            <div className="pinti-entry-badge">
              <ShieldCheck className="h-4 w-4" />
              Yerel demo oturumu
            </div>
            <h1>
              Pinti akışına demo hesabıyla devam et.
            </h1>
            <p>
              Bu kapı yalnızca sunum akışını korur. Gerçek şifre, kişisel bilgi
              veya üretim kullanıcı doğrulaması gerekmez.
            </p>
            <ol className="pinti-entry-flow" aria-label="Demo akışı">
              <li><span>01</span>Verini seç</li>
              <li><span>02</span>Analizi başlat</li>
              <li><span>03</span>İlk 3 kontrolü gör</li>
            </ol>
            <p className="pinti-entry-note">
              Çıkış yaptıysan yeniden yerel demo oturumu açılır.
            </p>
          </aside>

          <div className="pinti-entry-form">
            <div>
              <p className="pinti-entry-kicker">Demo kapısı</p>
              <h2>Akışa devam et</h2>
              <p className="pinti-entry-copy">
                Veri Merkezi’ne geçmeden önce tarayıcı içinde demo oturumu
                açılır. Akış: veri seç, analizi başlat, ilk 3 kontrolü gör.
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="pinti-entry-primary pinti-link"
            >
              <Sparkles className="h-4 w-4" />
              Demo hesabıyla devam et
            </button>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="pinti-entry-secondary pinti-link"
              >
                Giriş yap
              </Link>
              <Link
                to="/register"
                className="pinti-entry-secondary pinti-link"
              >
                Demo hesabı oluştur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export function AppLayout() {
  const { isAuthenticated } = useDemoAuth()

  if (!isAuthenticated) {
    return <DemoAppGate />
  }

  return (
    <div className="pinti-app-bg pinti-noise min-h-screen text-white">
      <Sidebar />
      <main className="relative lg:pl-[19rem]">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
