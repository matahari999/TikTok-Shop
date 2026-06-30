import { Navigate } from 'react-router-dom'
import { useAuthStore } from './authStore'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'sinab7500@gmail.com'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized, logout } = useAuthStore()
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#EE1D52] border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Truy cập bị từ chối</h2>
          <p className="text-sm text-gray-500 mt-2">
            Tài khoản <strong className="text-gray-700">{user.email}</strong> không có quyền truy cập.
          </p>
          <p className="text-xs text-gray-400 mt-1">Chỉ quản trị viên mới được phép sử dụng ứng dụng này.</p>
          <button onClick={logout}
            className="mt-6 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors w-full">
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
