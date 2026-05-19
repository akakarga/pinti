import { type FormEvent, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PintiAppIcon } from '../components/brand/PintiAppIcon'
import { useDemoAuth } from '../context/DemoAuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { registerDemoUser } = useDemoAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = registerDemoUser(
      {
        name,
        email,
        businessName,
      },
      password,
    )

    if (!result.ok) {
      setErrorMessage(result.message)
      return
    }

    navigate('/app/demo-verisi', { replace: true })
  }

  return (
    <main className="pinti-entry-shell pinti-noise min-h-screen overflow-x-hidden px-4 py-8 text-white sm:py-10">
      <section className="pinti-entry-wrap">
        <Link to="/" className="pinti-entry-brand">
          <PintiAppIcon />
          <span>
            <span>Pinti</span>
            <span>Demo hesap</span>
          </span>
        </Link>

        <div className="pinti-entry-card grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="pinti-entry-side">
            <p className="pinti-entry-badge">
              Demo kayıt
            </p>
            <h1>
              Sunum için gerçek his veren, yerel bir hesap.
            </h1>
            <p>
              Bu kayıt yalnızca tarayıcıda saklanır; gerçek kullanıcı doğrulaması
              yapmaz.
            </p>
            <ol className="pinti-entry-flow" aria-label="Demo kayıt akışı">
              <li><span>01</span>Örnek satıcı adı</li>
              <li><span>02</span>Yerel demo oturumu</li>
              <li><span>03</span>Veri Merkezi’ne geçiş</li>
            </ol>
            <p className="pinti-entry-note">Örnek bilgiler yeterli.</p>
          </aside>

          <div className="pinti-entry-form">
            <div>
              <p className="pinti-entry-kicker">Demo kayıt</p>
              <h2>
                Demo hesabı oluştur
              </h2>
              <p className="pinti-entry-copy">
                Bir satıcı profili gibi görünsün diye doldurulur. Şifre üretim
                auth sistemine gönderilmez.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="pinti-entry-label">Ad Soyad</span>
                <span className="pinti-entry-input">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    type="text"
                    autoComplete="name"
                    placeholder="Demo Satıcı"
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </span>
              </label>

              <label className="block">
                <span className="pinti-entry-label">E-posta</span>
                <span className="pinti-entry-input">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="demo@pinti.local"
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
                    autoComplete="new-password"
                    placeholder="Demo için herhangi bir şifre"
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </span>
              </label>

              <label className="block">
                <span className="pinti-entry-label">İşletme adı</span>
                <span className="pinti-entry-input">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
                  <input
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    type="text"
                    autoComplete="organization"
                    placeholder="Nova Aksesuar"
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
                Demo hesabı oluştur
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
              Zaten demo hesabın var mı?{' '}
              <Link to="/login" className="font-semibold text-[#bff4dc] hover:text-white">
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
