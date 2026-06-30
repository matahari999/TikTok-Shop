import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, TrendingUp } from 'lucide-react'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import LangToggle from '@/shared/ui/LangToggle'
import { useAuthStore } from './authStore'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'

type View = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
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
      </div>
    </div>
  )
}
