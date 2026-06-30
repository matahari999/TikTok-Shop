import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; type: ToastType; message: string }
interface ToastCtx { addToast: (type: ToastType, message: string) => void }

const ToastContext = createContext<ToastCtx>({ addToast: () => {} })
export const useToast = () => useContext(ToastContext)

const icons = { success: CheckCircle, error: XCircle, info: Info }
const colors = { success: 'text-green-500', error: 'text-red-500', info: 'text-blue-500' }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts(p => [...p, { id, type, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className="flex items-center gap-3 bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3 min-w-[260px] animate-in slide-in-from-bottom-2">
              <Icon className={`w-4 h-4 shrink-0 ${colors[t.type]}`} />
              <p className="text-sm text-gray-800 flex-1">{t.message}</p>
              <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
