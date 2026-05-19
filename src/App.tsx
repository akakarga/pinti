import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ScrollToTop } from './components/layout/ScrollToTop'

const AIAksiyonPage = lazy(() =>
  import('./pages/AIAksiyonPage').then((module) => ({ default: module.AIAksiyonPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const DemoDataPage = lazy(() =>
  import('./pages/DemoDataPage').then((module) => ({ default: module.DemoDataPage })),
)
const FiyatKorumaPage = lazy(() =>
  import('./pages/FiyatKorumaPage').then((module) => ({ default: module.FiyatKorumaPage })),
)
const IadeKalkanPage = lazy(() =>
  import('./pages/IadeKalkanPage').then((module) => ({ default: module.IadeKalkanPage })),
)
const KampanyaSimPage = lazy(() =>
  import('./pages/KampanyaSimPage').then((module) => ({ default: module.KampanyaSimPage })),
)
const KarPusulaPage = lazy(() =>
  import('./pages/KarPusulaPage').then((module) => ({ default: module.KarPusulaPage })),
)
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const MutabakatPage = lazy(() =>
  import('./pages/MutabakatPage').then((module) => ({ default: module.MutabakatPage })),
)
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const ReklamMerkeziPage = lazy(() =>
  import('./pages/ReklamMerkeziPage').then((module) => ({
    default: module.ReklamMerkeziPage,
  })),
)

function RouteLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#071017] text-sm font-semibold text-slate-300">
      Pinti hazırlanıyor...
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/overview" replace />} />
          <Route path="overview" element={<DashboardPage />} />
          <Route path="kar-pusula" element={<KarPusulaPage />} />
          <Route path="reklam-merkezi" element={<ReklamMerkeziPage />} />
          <Route path="iade-kalkan" element={<IadeKalkanPage />} />
          <Route path="mutabakat" element={<MutabakatPage />} />
          <Route path="fiyat-koruma" element={<FiyatKorumaPage />} />
          <Route path="kampanya-sim" element={<KampanyaSimPage />} />
          <Route path="ai-aksiyon-merkezi" element={<AIAksiyonPage />} />
          <Route path="demo-verisi" element={<DemoDataPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
