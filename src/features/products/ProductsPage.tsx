import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Package } from 'lucide-react'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import Badge from '@/shared/ui/Badge'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { formatCurrency, calcTikTokFees, removeVietnameseTones } from '@/shared/lib/utils'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'
import type { Product } from '@/types'

const CATEGORIES = ['Thời trang', 'Mỹ phẩm', 'Điện tử', 'Gia dụng', 'Thực phẩm', 'Khác']

export default function ProductsPage() {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { t } = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', category: 'Thời trang', cost_price: '', selling_price: '', stock: '', commission_rate: '12.5' })

  const fetchProducts = async () => {
    if (!user) return
    const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setProducts(data ?? [])
  }

  useEffect(() => { fetchProducts() }, [user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('products').insert({
      user_id: user.id,
      name: form.name,
      sku: form.sku || `SKU-${Date.now()}`,
      category: form.category,
      cost_price: parseFloat(form.cost_price),
      selling_price: parseFloat(form.selling_price),
      stock: parseInt(form.stock) || 0,
      commission_rate: parseFloat(form.commission_rate) / 100,
    })
    setLoading(false)
    if (error) { addToast('error', t('toast.addProductError')); return }
    addToast('success', t('toast.addedProduct'))
    setShowForm(false)
    setForm({ name: '', sku: '', category: 'Thời trang', cost_price: '', selling_price: '', stock: '', commission_rate: '12.5' })
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    addToast('success', t('toast.deletedProduct'))
    fetchProducts()
  }

  const filtered = products.filter(p =>
    removeVietnameseTones(p.name).includes(removeVietnameseTones(search)) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const getMarginBadge = (p: Product) => {
    const { margin } = calcTikTokFees(p.selling_price, p.cost_price, p.commission_rate)
    if (margin > 15) return <Badge variant="green">{margin.toFixed(1)}%</Badge>
    if (margin > 5) return <Badge variant="yellow">{margin.toFixed(1)}%</Badge>
    return <Badge variant="red">{margin.toFixed(1)}%</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('prod.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('prod.count', { n: products.length })}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> {t('prod.add')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('prod.addNew')}</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <Input label={t('prod.name')} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="col-span-2" />
            <Input label={t('prod.sku')} value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder={t('prod.skuPlaceholder')} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">{t('prod.category')}</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#EE1D52]">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label={t('prod.costPrice')} type="number" value={form.cost_price} onChange={e => setForm(p => ({ ...p, cost_price: e.target.value }))} required suffix="₫" />
            <Input label={t('prod.sellingPrice')} type="number" value={form.selling_price} onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))} required suffix="₫" />
            <Input label={t('prod.stock')} type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
            <Input label={t('prod.commission')} type="number" value={form.commission_rate} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} suffix="%" />
            <div className="col-span-2 flex gap-3 justify-end">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>{t('prod.cancel')}</Button>
              <Button type="submit" loading={loading}>{t('prod.save')}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="w-72">
        <Input placeholder={t('prod.search')} value={search} onChange={e => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />} />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t('prod.empty')}</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                {[t('prod.colProduct'), t('prod.colCost'), t('prod.colSell'), t('prod.colProfitPerUnit'), t('prod.colMargin'), t('prod.colStock'), ''].map(h => (
                  <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const { profit } = calcTikTokFees(p.selling_price, p.cost_price, p.commission_rate)
                return (
                  <tr key={p.id} className="text-sm">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku} · {p.category}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{formatCurrency(p.cost_price)}</td>
                    <td className="py-3 pr-4 text-gray-900 font-medium">{formatCurrency(p.selling_price)}</td>
                    <td className={`py-3 pr-4 font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</td>
                    <td className="py-3 pr-4">{getMarginBadge(p)}</td>
                    <td className="py-3 pr-4 text-gray-600">{p.stock}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
