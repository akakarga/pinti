import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  Compass,
  Database,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Store,
  Tags,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { PintiAppIcon } from '../brand/PintiAppIcon'
import { useDemoAuth } from '../../context/DemoAuthContext'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Ana akış',
    items: [
      { label: 'Genel Bakış', path: '/app/overview', icon: LayoutDashboard },
      { label: 'Veri Merkezi', path: '/app/demo-verisi', icon: Database },
      { label: 'AI Aksiyon Merkezi', path: '/app/ai-aksiyon-merkezi', icon: Sparkles },
    ],
  },
  {
    title: 'Analiz Detayları',
    items: [
      { label: 'KârPusula', path: '/app/kar-pusula', icon: Compass },
      { label: 'ReklamMerkezi', path: '/app/reklam-merkezi', icon: Megaphone },
      { label: 'İadeKalkan', path: '/app/iade-kalkan', icon: ShieldCheck },
      { label: 'Mutabakat', path: '/app/mutabakat', icon: HandCoins },
      { label: 'FiyatKoruma', path: '/app/fiyat-koruma', icon: Tags },
      { label: 'KampanyaSim', path: '/app/kampanya-sim', icon: BadgePercent },
    ],
  },
]

const mobileNavItems = navGroups.flatMap((group) => group.items)

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          'pinti-link group flex min-h-11 min-w-fit shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold lg:min-w-0',
          isActive
            ? 'border-emerald-300/35 bg-emerald-300/10 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.035] hover:text-white',
        ].join(' ')
      }
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition group-hover:text-emerald-100">
        <item.icon className="h-4 w-4" />
      </span>
      {item.label}
    </NavLink>
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const { logout, user } = useDemoAuth()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="sticky top-0 z-20 border-b border-white/10 bg-[#071017]/95 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-[19rem] lg:border-r lg:border-b-0">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-4 py-4 sm:px-5 lg:p-5">
          <NavLink to="/" className="group flex items-center justify-between gap-4">
            <span className="flex items-center gap-3">
              <PintiAppIcon />
              <span>
                <span className="block text-lg font-semibold tracking-tight text-white">
                  Pinti
                </span>
                <span className="block text-xs text-slate-400">
                  Finansal kontrol merkezi
                </span>
              </span>
            </span>
            <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100 lg:inline-flex">
              MVP
            </span>
          </NavLink>
        </div>

        {user ? (
          <div className="border-b border-white/10 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.businessName}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="pinti-link inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/20 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Çıkış yap
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between px-4 pt-3 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ana akış
          </span>
          <span className="text-xs text-slate-500">Modüller</span>
        </div>
        <nav
          className="flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain px-4 pb-3 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden"
          aria-label="Pinti mobil modülleri"
        >
          {mobileNavItems.map((item) => (
            <NavItemLink key={item.path} item={item} />
          ))}
        </nav>

        <nav
          className="hidden flex-1 space-y-6 overflow-y-auto px-4 py-5 lg:block"
          aria-label="Pinti modülleri"
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              <p
                className={[
                  'mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.22em]',
                  group.title === 'Analiz Detayları' ? 'text-slate-500' : 'text-emerald-200',
                ].join(' ')}
              >
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItemLink key={item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-5 lg:block">
          {user ? (
            <div className="pinti-panel-quiet rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{user.businessName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="pinti-link mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-white/20 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Çıkış yap
              </button>
              <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">
                Akış: veri seç, analizi başlat, ilk 3 kontrolü gör.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
