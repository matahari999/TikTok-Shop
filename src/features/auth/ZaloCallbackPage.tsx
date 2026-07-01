// Zalo OAuth 콜백 페이지
// 경로: /auth/zalo-callback
// Zalo가 code + state를 이 URL로 리다이렉트 → Edge Function 호출 → Supabase 세션 수립

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '@/shared/lib/supabase'

export default function ZaloCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const codeVerifier = sessionStorage.getItem('zalo_code_verifier')

      if (!code) {
        setError('Không nhận được mã xác thực từ Zalo. Vui lòng thử lại.')
        return
      }
      if (!codeVerifier) {
        setError('Phiên xác thực đã hết hạn. Vui lòng đăng nhập lại.')
        return
      }

      // 사용 후 즉시 삭제 (재사용 방지)
      sessionStorage.removeItem('zalo_code_verifier')

      try {
        // Edge Function 호출: code + codeVerifier → Supabase hashed_token
        const { data, error: fnError } = await supabase.functions.invoke('zalo-auth', {
          body: { code, codeVerifier },
        })

        if (fnError || !data?.hashed_token) {
          throw new Error(fnError?.message ?? data?.error ?? 'Xác thực Zalo thất bại')
        }

        // hashed_token으로 Supabase 세션 수립
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: data.hashed_token,
        })

        if (otpError) throw new Error(otpError.message)

        navigate('/app/dashboard', { replace: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Đăng nhập Zalo thất bại'
        setError(msg)
      }
    }

    handleCallback()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập thất bại</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#EE1D52] text-white text-sm font-medium rounded-xl hover:bg-[#d01848] transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#EE1D52] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 justify-center text-gray-600">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-[#0068FF] rounded-full animate-spin" />
          <span className="text-sm">Đang xác thực Zalo...</span>
        </div>
      </div>
    </div>
  )
}
