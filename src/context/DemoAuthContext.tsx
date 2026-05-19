import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface DemoUser {
  name: string
  email: string
  businessName: string
}

interface DemoAuthContextValue {
  user: DemoUser | null
  isAuthenticated: boolean
  loginWithDemo: () => DemoUser
  loginWithCredentials: (
    email: string,
    password: string,
  ) => { ok: true; user: DemoUser } | { ok: false; message: string }
  registerDemoUser: (
    user: DemoUser,
    password: string,
  ) => { ok: true; user: DemoUser } | { ok: false; message: string }
  logout: () => void
}

const STORAGE_KEY = 'pinti.demoUser'

const defaultDemoUser: DemoUser = {
  name: 'Demo Satıcı',
  email: 'demo@pinti.local',
  businessName: 'Nova Aksesuar',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readStoredUser() {
  try {
    const storedUser = window.localStorage.getItem(STORAGE_KEY)

    if (!storedUser) {
      return null
    }

    const parsedUser = JSON.parse(storedUser) as Partial<DemoUser>

    if (parsedUser.name && parsedUser.email && parsedUser.businessName) {
      return {
        name: parsedUser.name,
        email: parsedUser.email,
        businessName: parsedUser.businessName,
      }
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return null
}

function persistUser(user: DemoUser) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function makeUserFromEmail(email: string): DemoUser {
  const normalizedEmail = email.trim().toLowerCase()
  const namePart = normalizedEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
  const displayName = namePart
    ? namePart
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : defaultDemoUser.name

  return {
    name: displayName || defaultDemoUser.name,
    email: normalizedEmail,
    businessName: defaultDemoUser.businessName,
  }
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => readStoredUser())

  const storeUser = useCallback((nextUser: DemoUser) => {
    persistUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const loginWithDemo = useCallback(() => storeUser(defaultDemoUser), [storeUser])

  const loginWithCredentials = useCallback(
    (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase()

      if (!emailPattern.test(normalizedEmail) || password.trim().length === 0) {
        return {
          ok: false as const,
          message: 'Demo giriş için geçerli bir e-posta ve şifre yaz.',
        }
      }

      return {
        ok: true as const,
        user: storeUser(makeUserFromEmail(normalizedEmail)),
      }
    },
    [storeUser],
  )

  const registerDemoUser = useCallback(
    (nextUser: DemoUser, password: string) => {
      const normalizedUser = {
        name: nextUser.name.trim(),
        email: nextUser.email.trim().toLowerCase(),
        businessName: nextUser.businessName.trim(),
      }

      if (
        !normalizedUser.name ||
        !emailPattern.test(normalizedUser.email) ||
        !normalizedUser.businessName ||
        password.trim().length === 0
      ) {
        return {
          ok: false as const,
          message: 'Demo hesap için tüm alanları örnek bilgilerle doldur.',
        }
      }

      return {
        ok: true as const,
        user: storeUser(normalizedUser),
      }
    },
    [storeUser],
  )

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo<DemoAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loginWithDemo,
      loginWithCredentials,
      registerDemoUser,
      logout,
    }),
    [loginWithCredentials, loginWithDemo, logout, registerDemoUser, user],
  )

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemoAuth() {
  const context = useContext(DemoAuthContext)

  if (!context) {
    throw new Error('useDemoAuth must be used within DemoAuthProvider')
  }

  return context
}
