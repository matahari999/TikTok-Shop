import { useEffect, useState, useCallback } from 'react'

interface InstallState {
  canInstall: boolean
  installed: boolean
  install: () => Promise<boolean>
}

export default function usePwaInstall(): InstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return result.outcome === 'accepted'
  }, [deferredPrompt])

  return { canInstall: !!deferredPrompt, installed, install }
}
