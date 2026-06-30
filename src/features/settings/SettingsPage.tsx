import { useEffect, useState, useCallback } from 'react'
import { Settings, Save, Store } from 'lucide-react'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { supabase } from '@/shared/lib/supabase'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'
import { useAuthStore } from '@/features/auth/authStore'
import type { FeeRule, FeeFormulaVersion, ShopProfile } from '@/types'

export default function SettingsPage() {
  const { t } = useLang()
  const { addToast } = useToast()
  const { user } = useAuthStore()
  const [rules, setRules] = useState<FeeRule[]>([])
  const [edits, setEdits] = useState<Record<string, Partial<FeeRule>>>({})
  const [loading, setLoading] = useState(false)
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null)
  const [shopStartDate, setShopStartDate] = useState('')

  const fetchRules = async () => {
    const { data } = await supabase.from('fee_rules').select('*').order('category')
    if (data) setRules(data as FeeRule[])
  }

  const fetchShopProfile = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('shop_profile').select('*').eq('user_id', user.id).maybeSingle()
    if (data) {
      setShopProfile(data as ShopProfile)
      if (data.shop_start_date) setShopStartDate(data.shop_start_date)
    }
  }, [user])

  useEffect(() => {
    fetchRules()
    fetchShopProfile()
  }, [fetchShopProfile])

  const setField = (id: string, field: keyof FeeRule, value: string | boolean) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: field === 'tax_registered' || field === 'fee_formula_version' ? value : (parseFloat(value as string) || 0) } }))
  }

  const getVal = (rule: FeeRule, field: 'referral_rate' | 'transaction_rate' | 'processing_fee'): string => {
    const edit = edits[rule.id]
    const val = edit?.[field] !== undefined ? edit[field] : rule[field]
    if (field === 'processing_fee') return String(val)
    return String(Number(val) * 100)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updates = Object.entries(edits)
      if (updates.length > 0) {
        for (const [id, patch] of updates) {
          const { error } = await supabase
            .from('fee_rules')
            .update({ ...patch, updated_at: new Date().toISOString() })
            .eq('id', id)
          if (error) throw error
        }
      }

      if (!user) return

      const { error: profileError } = await supabase.from('shop_profile').upsert({
        user_id: user.id,
        shop_start_date: shopStartDate || null,
      }, { onConflict: 'user_id' })
      if (profileError) throw profileError

      setEdits({})
      await fetchRules()
      await fetchShopProfile()
      addToast('success', t('settings.saved'))
    } catch {
      addToast('error', t('settings.saveError'))
    }
    setLoading(false)
  }

  // 전역 토글: 모든 카테고리의 tax_registered를 동시에 변경
  const toggleGlobalTax = async (value: boolean) => {
    const newEdits: Record<string, Partial<FeeRule>> = {}
    for (const rule of rules) {
      newEdits[rule.id] = { ...edits[rule.id], tax_registered: value }
    }
    setEdits(newEdits)
  }

  // 전역 토글: 모든 카테고리의 fee_formula_version를 동시에 변경
  const toggleGlobalFormula = async (value: FeeFormulaVersion) => {
    const newEdits: Record<string, Partial<FeeRule>> = {}
    for (const rule of rules) {
      newEdits[rule.id] = { ...edits[rule.id], fee_formula_version: value }
    }
    setEdits(newEdits)
  }

  // 현재 글로벌 상태 계산 (첫 번째 규칙 기준)
  const currentTaxRegistered = rules.length > 0
    ? (edits[rules[0].id]?.tax_registered ?? rules[0].tax_registered)
    : false
  const currentFormulaVersion: FeeFormulaVersion = rules.length > 0
    ? (edits[rules[0].id]?.fee_formula_version as FeeFormulaVersion ?? rules[0].fee_formula_version)
    : 'after_2026_04'

  const hasEdits = Object.keys(edits).length > 0 || shopStartDate !== (shopProfile?.shop_start_date ?? '')

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#EE1D52]" />
            {t('settings.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('settings.subtitle')}</p>
        </div>
        <Button onClick={handleSave} loading={loading} disabled={!hasEdits}>
          <Save className="w-4 h-4" /> {t('settings.save')}
        </Button>
      </div>

      {/* Phase 2: Shop Profile */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-[#EE1D52]" /> {t('settings.shopProfile')}
        </h2>
        <p className="text-xs text-gray-500 mb-3">{t('settings.shopStartDateDesc')}</p>
        <Input
          label={t('settings.shopStartDate')}
          type="date"
          value={shopStartDate}
          onChange={e => setShopStartDate(e.target.value)}
        />
      </Card>

      {/* Phase 1: Tax Registration 전역 토글 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('settings.taxRegistered')}</h2>
        <p className="text-xs text-gray-500 mb-3">{t('settings.taxRegisteredDesc')}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleGlobalTax(!currentTaxRegistered)}
            className={`relative w-11 h-6 rounded-full transition-colors ${currentTaxRegistered ? 'bg-[#EE1D52]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${currentTaxRegistered ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm text-gray-700">
            {currentTaxRegistered ? 'Đã đăng ký kinh doanh' : 'Chưa đăng ký kinh doanh'}
          </span>
        </div>
      </Card>

      {/* Phase 1: Fee Formula Version 전역 토글 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('settings.feeFormulaVersion')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => toggleGlobalFormula('before_2026_04')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentFormulaVersion === 'before_2026_04' ? 'bg-[#EE1D52] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t('settings.formulaBefore2026')}
          </button>
          <button
            onClick={() => toggleGlobalFormula('after_2026_04')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentFormulaVersion === 'after_2026_04' ? 'bg-[#EE1D52] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t('settings.formulaAfter2026')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">* 주문일자(order_date) 기준으로 자동 분기됩니다. 이 설정은 신규 주문의 기본값입니다.</p>
      </Card>

      {/* Fee table by category */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('settings.feeTable')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 pr-4 font-medium">{t('settings.category')}</th>
                <th className="pb-3 pr-4 font-medium">{t('settings.referralRate')}</th>
                <th className="pb-3 pr-4 font-medium">{t('settings.transactionRate')}</th>
                <th className="pb-3 pr-4 font-medium">{t('settings.processingFee')}</th>
                <th className="pb-3 pr-4 font-medium">{t('settings.notes')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td className="py-3 pr-4 font-medium text-gray-800">{rule.category}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number" step="0.1" min="0" max="100"
                        value={getVal(rule, 'referral_rate')}
                        onChange={e => setField(rule.id, 'referral_rate', String(parseFloat(e.target.value) / 100))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#EE1D52]"
                      />
                      <span className="text-gray-400 text-xs">%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number" step="0.1" min="0" max="100"
                        value={getVal(rule, 'transaction_rate')}
                        onChange={e => setField(rule.id, 'transaction_rate', String(parseFloat(e.target.value) / 100))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#EE1D52]"
                      />
                      <span className="text-gray-400 text-xs">%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <input
                        type="number" step="500" min="0"
                        value={getVal(rule, 'processing_fee')}
                        onChange={e => setField(rule.id, 'processing_fee', e.target.value)}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#EE1D52]"
                      />
                      <span className="text-gray-400 text-xs">₫</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{rule.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-4">{t('settings.lastUpdated')}</p>
      </Card>
    </div>
  )
}
