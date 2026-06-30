import { useEffect, useState } from 'react'
import { Plus, Megaphone, Trash2 } from 'lucide-react'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'
import type { AdSpend } from '@/types'

export default function AdsPage() {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { t } = useLang()
  const [items, setItems] = useState<AdSpend[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    spend_date: new Date().toISOString().split('T')[0],
    campaign_name: '',
    amount: '',
    note: '',
  })

  const fetchAds = async () => {
    if (!user) return
    const { data } = await supabase
      .from('ad_spend')
      .select('*')
      .eq('user_id', user.id)
      .order('spend_date', { ascending: false })
    setItems((data as AdSpend[]) ?? [])
  }

  useEffect(() => { fetchAds() }, [user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('ad_spend').insert({
      user_id: user.id,
      spend_date: form.spend_date,
      campaign_name: form.campaign_name || t('ads.defaultCampaign'),
      amount: parseFloat(form.amount.replace(/,/g, '')),
      note: form.note || null,
    })
    setLoading(false)
    if (error) { addToast('error', t('ads.addError')); return }
    addToast('success', t('ads.added'))
    setShowForm(false)
    setForm({ spend_date: new Date().toISOString().split('T')[0], campaign_name: '', amount: '', note: '' })
    fetchAds()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('ad_spend').delete().eq('id', id)
    addToast('success', t('ads.deleted'))
    fetchAds()
  }

  const total = items.reduce((s, a) => s + a.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#EE1D52]" />
            {t('ads.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('ads.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> {t('ads.add')}
        </Button>
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{t('ads.totalSpend')}</p>
          <p className="text-2xl font-bold text-[#EE1D52] mt-0.5">{formatCurrency(total)}</p>
        </div>
        <Megaphone className="w-10 h-10 text-rose-100" />
      </Card>

      {showForm && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('ads.addNew')}</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <Input label={t('ads.date')} type="date" value={form.spend_date}
              onChange={e => setForm(p => ({ ...p, spend_date: e.target.value }))} />
            <Input label={t('ads.campaign')} value={form.campaign_name}
              onChange={e => setForm(p => ({ ...p, campaign_name: e.target.value }))}
              placeholder={t('ads.defaultCampaign')} />
            <Input label={t('ads.amount')} type="number" value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              suffix="₫" required />
            <Input label={t('ads.note')} value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              placeholder={t('ads.notePlaceholder')} />
            <div className="col-span-2 flex gap-3 justify-end">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>{t('ads.cancel')}</Button>
              <Button type="submit" loading={loading}>{t('ads.save')}</Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 ? (
        <Card className="text-center py-16">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t('ads.empty')}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 pr-4 font-medium">{t('ads.colDate')}</th>
                <th className="pb-3 pr-4 font-medium">{t('ads.colCampaign')}</th>
                <th className="pb-3 pr-4 font-medium">{t('ads.colAmount')}</th>
                <th className="pb-3 pr-4 font-medium">{t('ads.colNote')}</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(a => (
                <tr key={a.id}>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(a.spend_date)}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{a.campaign_name}</td>
                  <td className="py-3 pr-4 text-red-600 font-medium">{formatCurrency(a.amount)}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{a.note ?? '—'}</td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
