import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/shared/ui/Toast'
import { useAuthStore } from '@/features/auth/authStore'
import AuthPage from '@/features/auth/AuthPage'
import AuthGuard from '@/features/auth/AuthGuard'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import AppLayout from '@/layouts/AppLayout'
import LandingPage from '@/features/landing/LandingPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProductsPage from '@/features/products/ProductsPage'
import CalculatorPage from '@/features/calculator/CalculatorPage'
import OrdersPage from '@/features/orders/OrdersPage'
import AdsPage from '@/features/ads/AdsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import GuidePage from '@/features/guide/GuidePage'
import PrivacyPage from '@/features/legal/PrivacyPage'
import TermsPage from '@/features/legal/TermsPage'
import ZaloButton from '@/shared/ui/ZaloButton'
import ZaloCallbackPage from '@/features/auth/ZaloCallbackPage'

function AppRoutes() {
  const { init } = useAuthStore()
  useEffect(() => { init() }, [init])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* 퍼블릭 페이지: 가이드 + 법적 */}
      <Route path="/huong-dan" element={<GuidePage />} />
      <Route path="/chinh-sach-bao-mat" element={<PrivacyPage />} />
      <Route path="/dieu-khoan-su-dung" element={<TermsPage />} />
      {/* Zalo OAuth 콜백 */}
      <Route path="/auth/zalo-callback" element={<ZaloCallbackPage />} />
      <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
        {/* Zalo 플로팅 버튼: 전 페이지 공통 표시 */}
        <ZaloButton />
      </ToastProvider>
    </BrowserRouter>
  )
}
