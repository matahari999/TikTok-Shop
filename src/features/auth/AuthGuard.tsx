import { Navigate } from 'react-router-dom'
import { useAuthStore } from './authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#EE1D52] border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
