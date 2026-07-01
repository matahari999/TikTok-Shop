import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, TrendingUp } from 'lucide-react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import LangToggle from '@/shared/ui/LangToggle'
import { useAuthStore } from './authStore'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'
import { supabase } from '@/shared/lib/supabase'
import { generateCodeVerifier, generateCodeChallenge } from '@/shared/lib/pkce'

type View = 'login' | 'register' | 'forgot'

// Facebook 로고 SVG
function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// Zalo 로고 (텍스트 기반 아이콘)
function ZaloIcon() {
  return (
    <span className="w-5 h-5 flex items-center justify-center text-xs font-extrabold text-white bg-[#0068FF] rounded leading-none">
      Z
    </span>
  )
}

export default function AuthPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'facebook' | 'zalo' | null>(null)
  const { login, register, resetPassword, loading } = useAuthStore()
  const { addToast } = useToast()
  const { t } = useLang()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (view === 'login') {
        await login(email, password)
        addToast('success', t('toast.loginSuccess'))
        navigate('/app/dashboard')
      } else if (view === 'register') {
        await register(email, password, name)
        addToast('success', t('toast.registerSuccess'))
      } else {
        await resetPassword(email)
        addToast('success', t('toast.resetSent'))
        setView('login')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      addToast('error', msg === 'REPEATED_SIGNUP' ? t('toast.repeatedSignup') : msg || t('toast.genericError'))
    }
  }

  const handleFacebookLogin = async () => {
    setSocialLoading('facebook')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/app/dashboard` },
      })
      if (error) addToast('error', error.message || t('toast.genericError'))
    } catch {
      addToast('error', t('toast.genericError'))
    } finally {
      setSocialLoading(null)
    }
  }

  // Zalo OAuth — PKCE 코드 생성 후 Zalo 인증 페이지로 리다이렉트
  // 콜백은 /auth/zalo-callback → ZaloCallbackPage → Edge Function 호출
  const handleZaloLogin = async () => {
    const appId = import.meta.env.VITE_ZALO_APP_ID
    if (!appId) {
      addToast('error', 'Zalo chưa được cấu hình')
      return
    }
    setSocialLoading('zalo')
    try {
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      sessionStorage.setItem('zalo_code_verifier', codeVerifier)

      const params = new URLSearchParams({
        app_id: appId,
        redirect_uri: `${window.location.origin}/auth/zalo-callback`,
        code_challenge: codeChallenge,
        state: crypto.randomUUID(),
      })
      window.location.href = `https://oauth.zaloapp.com/v4/permission?${params.toString()}`
    } catch {
      setSocialLoading(null)
      addToast('error', t('toast.genericError'))
    }
  }

  const zaloAppId = import.meta.env.VITE_ZALO_APP_ID
  const anyLoading = loading || socialLoading !== null

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LangToggle />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#EE1D52] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TikTok Shop VN</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.tagline')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {view !== 'forgot' && (
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              {(['login', 'register'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  {v === 'login' ? t('auth.login') : t('auth.register')}
                </button>
              ))}
            </div>
          )}

          {view === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">{t('auth.forgotTitle')}</h2>
              <p className="text-xs text-gray-500 mt-1">{t('auth.forgotDesc')}</p>
            </div>
          )}

          {/* 소셜 로그인 버튼 — forgot 화면에서는 숨김 */}
          {view !== 'forgot' && (
            <div className="mb-5 space-y-2.5">
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={anyLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border-2 border-[#1877F2] bg-[#1877F2] text-white text-sm font-semibold hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'facebook' ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <FacebookIcon />}
                Đăng nhập bằng Facebook
              </button>

              {zaloAppId && (
                <button
                  type="button"
                  onClick={handleZaloLogin}
                  disabled={anyLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border-2 border-[#0068FF] bg-[#0068FF] text-white text-sm font-semibold hover:bg-[#0057D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'zalo' ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <ZaloIcon />}
                  Đăng nhập bằng Zalo
                </button>
              )}

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">hoặc</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <Input label={t('auth.shopName')} type="text" value={name} onChange={e => setName(e.target.value)}
                icon={<User className="w-4 h-4" />} placeholder={t('auth.shopPlaceholder')} />
            )}
            <Input label={t('auth.email')} type="email" value={email} onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />} placeholder="email@example.com" required />

            {view !== 'forgot' && (
              <div className="relative">
                <Input label={t('auth.password')} type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />}
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-[38px] text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading}>
              {view === 'login' && t('auth.login')}
              {view === 'register' && t('auth.createAccount')}
              {view === 'forgot' && t('auth.sendReset')}
            </Button>

            {view === 'login' && (
              <button type="button" onClick={() => setView('forgot')}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center pt-1">
                {t('auth.forgotPassword')}
              </button>
            )}

            {view === 'forgot' && (
              <button type="button" onClick={() => setView('login')}
                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center pt-1">
                {t('auth.backToLogin')}
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">{t('auth.footer')}</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
          <a href="/chinh-sach-bao-mat" className="hover:text-gray-600 underline transition-colors">
            Chính sách bảo mật
          </a>
          <a href="/dieu-khoan-su-dung" className="hover:text-gray-600 underline transition-colors">
            Điều khoản sử dụng
          </a>
        </div>
      </div>
    </div>
  )
}
