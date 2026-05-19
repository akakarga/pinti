import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, PlugZap, Trash2 } from 'lucide-react'
import { GeminiApiError, testGeminiConnection } from '../../api/geminiApi'

interface GeminiSettingsPanelProps {
  apiKey: string
  rememberOnDevice: boolean
  setRememberOnDevice: (rememberOnDevice: boolean) => void
  saveApiKey: (apiKey: string, rememberOnDevice: boolean) => boolean
  clearApiKey: () => void
}

export function GeminiSettingsPanel({
  apiKey,
  rememberOnDevice,
  setRememberOnDevice,
  saveApiKey,
  clearApiKey,
}: GeminiSettingsPanelProps) {
  const [draftApiKey, setDraftApiKey] = useState(apiKey)
  const [isKeyVisible, setIsKeyVisible] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'warning'>('neutral')

  function setStatus(message: string, tone: typeof statusTone) {
    setStatusMessage(message)
    setStatusTone(tone)
  }

  function handleSaveApiKey() {
    const isSaved = saveApiKey(draftApiKey, rememberOnDevice)

    if (!isSaved) {
      setStatus('Gemini API anahtarı alanı boş olamaz.', 'warning')
      return
    }

    setStatus(
      rememberOnDevice
        ? 'Anahtar bu cihazda hatırlanacak şekilde kaydedildi.'
        : 'Anahtar bu oturumda kullanılmak üzere kaydedildi.',
      'success',
    )
  }

  async function handleTestConnection() {
    const trimmedApiKey = draftApiKey.trim()

    if (!trimmedApiKey) {
      setStatus('Önce Gemini API anahtarını ekle.', 'warning')
      return
    }

    setIsTesting(true)
    setStatus('', 'neutral')

    try {
      const result = await testGeminiConnection(trimmedApiKey)
      setStatus(result.message, result.ok ? 'success' : 'warning')
    } catch (error) {
      setStatus(
        error instanceof GeminiApiError
          ? error.message
          : 'Gemini bağlantısı kurulamadı. Anahtar veya kullanım limiti kontrol edilebilir.',
        'warning',
      )
    } finally {
      setIsTesting(false)
    }
  }

  function handleClearApiKey() {
    clearApiKey()
    setDraftApiKey('')
    setStatus('Gemini API anahtarı tarayıcıdan temizlendi.', 'neutral')
  }

  return (
    <section className="pinti-panel rounded-[1.5rem] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
            <PlugZap className="h-4 w-4" />
            Gemini demo modu
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">Gemini API Ayarları</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Bu özellik opsiyoneldir. Anahtar girilmezse Pinti mevcut kural tabanlı
            aksiyon motoruyla çalışmaya devam eder.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div>
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Gemini API anahtarı</span>
            <span className="mt-2 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 focus-within:border-emerald-200/45">
              <KeyRound className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                value={draftApiKey}
                onChange={(event) => setDraftApiKey(event.target.value)}
                type={isKeyVisible ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                placeholder="Geçici Gemini API anahtarını yapıştır"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setIsKeyVisible((currentValue) => !currentValue)}
                className="pinti-link grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                aria-label={isKeyVisible ? 'Anahtarı gizle' : 'Anahtarı göster'}
              >
                {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <label className="mt-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberOnDevice}
              onChange={(event) => setRememberOnDevice(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#7dd8b5]"
            />
            <span>
              <span className="block font-semibold text-slate-200">Bu cihazda hatırla</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Varsayılan olarak yalnızca bu tarayıcı oturumunda saklanır.
              </span>
            </span>
          </label>

          {statusMessage ? (
            <p
              className={[
                'mt-3 rounded-2xl border px-4 py-3 text-sm leading-6',
                statusTone === 'success'
                  ? 'border-emerald-200/25 bg-emerald-200/[0.08] text-emerald-100'
                  : statusTone === 'warning'
                    ? 'border-amber-200/25 bg-amber-200/[0.08] text-amber-100'
                    : 'border-white/10 bg-white/[0.025] text-slate-300',
              ].join(' ')}
            >
              {statusMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="text-sm leading-6 text-slate-300">
            Bu anahtar yalnızca yerel demo için tarayıcıda saklanır. Koda veya repoya
            yazılmaz.
          </p>
          <p className="mt-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.06] p-3 text-xs leading-5 text-amber-100">
            Her Gemini denemesi kullanım hakkı harcayabilir. Otomatik çağrı yapılmaz.
          </p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-200/25 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              Bağlantıyı test et
            </button>
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="pinti-link inline-flex min-h-11 items-center justify-center rounded-full bg-[#7dd8b5] px-4 py-2.5 text-sm font-bold text-[#071017] hover:bg-[#98e4c7]"
            >
              Bu oturumda kullan
            </button>
            <button
              type="button"
              onClick={handleClearApiKey}
              className="pinti-link inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-white/20 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Anahtarı temizle
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
