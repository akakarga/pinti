import { type FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PintiAppIcon } from '../components/brand/PintiAppIcon'
import { useDemoAuth } from '../context/DemoAuthContext'

function getRedirectPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: unknown }).from

    if (typeof from === 'string' && from.startsWith('/app')) {
      return from
    }
  }

  return '/app/demo-verisi'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithCredentials, loginWithDemo } = useDemoAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const redirectPath = getRedirectPath(location.state)

  function finishLogin(path = redirectPath) {
    navigate(path, { replace: true })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = loginWithCredentials(email, password)

    if (!result.ok) {
      setErrorMessage(result.message)
      return
    }

    finishLogin()
  }

  function handleDemoLogin() {
    loginWithDemo()
    finishLogin('/app/demo-verisi')
  }

  return (
    <main className="pinti-entry-shell pinti-noise min-h-screen overflow-x-hidden px-4 py-8 text-white sm:py-10">
      <section className="pinti-entry-wrap">
        <Link to="/" className="pinti-entry-brand">
          <PintiAppIcon />
          <span>
            <span>Pinti</span>
            <span>Demo giriş</span>
          </span>
        </Link>

        <div className="pinti-entry-card grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="pinti-entry-side">
            <div className="pinti-entry-badge">
              <ShieldCheck className="h-4 w-4" />
              Yerel demo
            </div>
            <h1>
              Demo hesabıyla Pinti akışına gir.
            </h1>
            <p>
              Gerçek şifre veya kişisel bilgi girmen gerekmez. Bu ekran yalnızca
              sunum akışını başlatmak için var.
            </p>
            <ol className="pinti-entry-flow" aria-label="Demo akışı">
              <li><span>01</span>Verini seç</li>
              <li><span>02</span>Analizi başlat</li>
              <li><span>03</span>İlk 3 kontrolü gör</li>
            </ol>
            <p className="pinti-entry-note">
              Demo auth, gerçek kullanıcı doğrulaması yapmaz.
            </p>
          </aside>

          <div className="pinti-entry-form">
            <div>
              <p className="pinti-entry-kicker">Demo giriş</p>
              <h2>Pinti’ye gir</h2>
              <p className="pinti-entry-copy">
                Her geçerli görünen e-posta ve şifre demo oturumu açar. Akış
                Veri Merkezi’nde başlar.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="pinti-entry-label">E-posta</span>
                <span className="pinti-entry-input">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@pinti.local"
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </span>
              </label>

              <label className="block">
                <span className="pinti-entry-label">Şifre</span>
                <span className="pinti-entry-input">
                  <LockKeyhole className="h-4 w-4 text-slate-500" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Demo için herhangi bir şifre"
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </span>
              </label>

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-300/25 bg-rose-300/[0.08] px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className="pinti-entry-primary pinti-link"
              >
                Giriş yap
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="pinti-entry-secondary pinti-link"
              >
                <Sparkles className="h-4 w-4" />
                Demo hesapla giriş yap
              </button>
              <Link
                to="/register"
                className="pinti-entry-secondary pinti-link"
              >
                Demo hesabı oluştur
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
