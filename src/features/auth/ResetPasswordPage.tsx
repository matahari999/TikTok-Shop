import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, TrendingUp } from 'lucide-react'
import { supabase } from '@/shared/lib/supabase'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import LangToggle from '@/shared/ui/LangToggle'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const { addToast } = useToast()
  const { t } = useLang()
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { addToast('error', t('reset.mismatch')); return }
    if (password.length < 6) { addToast('error', t('reset.tooShort')); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { addToast('error', error.message); return }
    addToast('success', t('reset.success'))
    await supabase.auth.signOut()
    navigate('/login')
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
          <h1 className="text-2xl font-bold text-gray-900">{t('reset.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">TikTok Shop VN</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {!ready ? (
            <div className="py-6 text-center">
              <div className="w-6 h-6 border-2 border-[#EE1D52] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t('reset.checking')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input label={t('reset.newPassword')} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />}
                  placeholder={t('reset.newPasswordPlaceholder')} required />
              </div>
              <div className="relative">
                <Input label={t('reset.confirmPassword')} type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)} icon={<Lock className="w-4 h-4" />}
                  placeholder={t('reset.confirmPasswordPlaceholder')} required />
              </div>
              <Button type="submit" fullWidth loading={loading}>
                {t('reset.submit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
