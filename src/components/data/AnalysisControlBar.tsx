import { ArrowRight, CheckCircle2, Loader2, Play, RotateCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDataWorkspace } from '../../context/DataWorkspaceContext'
import { formatDateTime } from '../../utils/formatters'

interface AnalysisControlBarProps {
  scope: 'global' | 'module'
  moduleName?: string
  compact?: boolean
}

const statusCopy = {
  idle: 'Veri bekleniyor',
  ready: 'Analiz bekleniyor',
  running: 'Analiz çalışıyor',
  completed: 'Analiz tamamlandı',
  error: 'Veri hatası',
}

export function AnalysisControlBar({
  scope,
  moduleName,
  compact = false,
}: AnalysisControlBarProps) {
  const {
    activeDataset,
    analysisStatus,
    dataSourceType,
    lastAnalyzedAt,
    validationResult,
    startAnalysis,
  } = useDataWorkspace()
  const isRunning = analysisStatus === 'running'
  const isCompleted = analysisStatus === 'completed'
  const isDisabled = !activeDataset || !validationResult.isValid || isRunning
  const buttonLabel =
    scope === 'module'
      ? isCompleted
        ? 'Yeniden analiz et'
        : 'Bu modülü analiz et'
      : isCompleted
        ? 'Analizi yenile'
        : 'Analizi başlat'

  return (
    <section
      className={[
        'pinti-panel flex flex-col gap-4 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between',
        compact ? 'p-4' : 'sm:p-5',
      ].join(' ')}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
              isCompleted
                ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                : analysisStatus === 'error'
                  ? 'border-rose-300/30 bg-rose-300/10 text-rose-100'
                  : 'border-amber-300/30 bg-amber-300/10 text-amber-100',
            ].join(' ')}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <TriangleAlert className="h-3.5 w-3.5" />
            )}
            {statusCopy[analysisStatus]}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
            {dataSourceType === 'uploaded' ? 'Yüklenen veri seti' : 'Demo veri seti'}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {activeDataset
            ? `${activeDataset.companyProfile.name} verisi seçili. ${
                isCompleted && lastAnalyzedAt
                  ? `Son analiz: ${formatDateTime(lastAnalyzedAt)}.`
                  : 'Sonuçları görmek için analizi başlat.'
              }`
            : 'Önce Veri Merkezi üzerinden demo şirket seç veya dosya yükle.'}
        </p>
        {moduleName ? (
          <p className="mt-1 text-xs text-slate-400">
            {moduleName} sonuçları seçili veri ve demo varsayımlarına göre üretilir.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {!validationResult.isValid ? (
          <Link
            to="/app/demo-verisi"
            className="pinti-link inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/30 px-4 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-300/10"
          >
            Veri Merkezi’ne git
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => void startAnalysis()}
          disabled={isDisabled}
          className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#7dd8b5] px-5 py-2.5 text-sm font-bold text-[#071017] transition hover:bg-[#98e4c7] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCompleted ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {buttonLabel}
        </button>
      </div>
    </section>
  )
}

export function AnalysisRequiredState({ moduleName }: { moduleName: string }) {
  const { activeDataset, analysisStatus } = useDataWorkspace()

  return (
    <section className="pinti-panel rounded-[1.5rem] p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-100">
        <TriangleAlert className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-white">
        {analysisStatus === 'running' ? 'Pinti verinin izini sürüyor...' : 'Analiz bekleniyor'}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        {activeDataset
          ? `${moduleName} sonuçlarını görmek için seçili ${activeDataset.companyProfile.name} veri setiyle analizi başlat.`
          : 'Önce Veri Merkezi üzerinden demo şirket seç veya veri dosyası yükle.'}
      </p>
      <div className="mt-5 flex justify-center">
        <Link
          to="/app/demo-verisi"
          className="pinti-link inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-emerald-300/35 hover:text-white"
        >
          Veri Merkezi’ni aç
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
