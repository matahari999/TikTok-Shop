import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Calculator, ShoppingBag, LogOut, TrendingUp, Megaphone, Settings, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/features/auth/authStore'
import LangToggle from '@/shared/ui/LangToggle'
import { useLang } from '@/shared/lib/langStore'

export default function AppLayout() {
  const { logout, user } = useAuthStore()
  const { t } = useLang()
  const navigate = useNavigate()

  const nav = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/app/products', icon: Package, label: t('nav.products') },
    { to: '/app/calculator', icon: Calculator, label: t('nav.calculator') },
    { to: '/app/orders', icon: ShoppingBag, label: t('nav.orders') },
    { to: '/app/ads', icon: Megaphone, label: t('nav.ads') },
    { to: '/app/settings', icon: Settings, label: t('nav.settings') },
    { to: '/huong-dan', icon: BookOpen, label: t('nav.guide') },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shrink-0">
        <a href="/app/dashboard" className="p-4 border-b border-gray-100 block hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#EE1D52] rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-none">TikTok Shop VN</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('nav.subtitle')}</p>
            </div>
          </div>
        </a>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-rose-50 text-[#EE1D52] font-medium' : 'text-gray-600 hover:bg-gray-50'}`
              }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <p className="text-xs text-gray-400 px-3 truncate">{user?.email}</p>
          <LangToggle className="w-full justify-start" />
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors">
            <LogOut className="w-4 h-4" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
