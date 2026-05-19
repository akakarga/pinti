import { useCallback, useMemo, useState } from 'react'

const SESSION_STORAGE_KEY = 'pinti.geminiApiKey'
const LOCAL_STORAGE_KEY = 'pinti.geminiApiKey.remembered'

function readInitialApiKey() {
  return (
    window.sessionStorage.getItem(SESSION_STORAGE_KEY) ??
    window.localStorage.getItem(LOCAL_STORAGE_KEY) ??
    ''
  )
}

function readInitialRememberChoice() {
  return Boolean(window.localStorage.getItem(LOCAL_STORAGE_KEY))
}

export function useGeminiApiKey() {
  const [apiKey, setApiKeyState] = useState(() => readInitialApiKey())
  const [rememberOnDevice, setRememberOnDevice] = useState(() => readInitialRememberChoice())

  const hasApiKey = apiKey.trim().length > 0

  const saveApiKey = useCallback((nextApiKey: string, shouldRemember: boolean) => {
    const trimmedApiKey = nextApiKey.trim()

    if (!trimmedApiKey) {
      return false
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, trimmedApiKey)

    if (shouldRemember) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, trimmedApiKey)
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    }

    setApiKeyState(trimmedApiKey)
    setRememberOnDevice(shouldRemember)
    return true
  }, [])

  const clearApiKey = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    setApiKeyState('')
    setRememberOnDevice(false)
  }, [])

  return useMemo(
    () => ({
      apiKey,
      hasApiKey,
      rememberOnDevice,
      setRememberOnDevice,
      saveApiKey,
      clearApiKey,
    }),
    [apiKey, clearApiKey, hasApiKey, rememberOnDevice, saveApiKey],
  )
}
