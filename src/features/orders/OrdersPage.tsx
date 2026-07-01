import { useEffect, useState, useCallback } from 'react'
import { Plus, ShoppingBag, Upload, List, AlertTriangle } from 'lucide-react'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import DateInput from '@/shared/ui/DateInput'
import Badge from '@/shared/ui/Badge'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { formatCurrency, formatDate, calcTikTokFees, calculateLossAmount, detectFormulaVersion } from '@/shared/lib/utils'
import { useToast } from '@/shared/ui/Toast'
import { useLang } from '@/shared/lib/langStore'
import CsvUpload from './CsvUpload'
import type { CsvRow } from '@/shared/lib/csvParser'
import type { Order, Product, FeeRule, OrderStatus } from '@/types'

type Tab = 'list' | 'manual' | 'csv'

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: 'ord.statusCompleted',
  cod_rejected: 'ord.statusCodRejected',
  refunded: 'ord.statusRefunded',
  failed_delivery: 'ord.statusFailedDelivery',
  cancelled: 'ord.statusCancelled',
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const { t } = useLang()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [feeRules, setFeeRules] = useState<FeeRule[]>([])
  const [tab, setTab] = useState<Tab>('list')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    product_id: '',
    quantity: '1',
    order_date: new Date().toISOString().split('T')[0],
    affiliate_rate: '0',
    is_refund: false,
    order_status: 'completed' as OrderStatus,
    seller_discount: '0',
    shipping_fee: '0',
  })

  const fetchData = useCallback(async () => {
    if (!user) return
    const [{ data: o }, { data: p }, { data: f }] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('order_date', { ascending: false }),
      supabase.from('products').select('*').eq('user_id', user.id),
      supabase.from('fee_rules').select('*'),
    ])
    setOrders((o as Order[]) ?? [])
    setProducts((p as Product[]) ?? [])
    setFeeRules((f as FeeRule[]) ?? [])
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const selectedProduct = products.find(p => p.id === form.product_id)
  const feeRule = feeRules.find(r => r.category === selectedProduct?.category)
  const affiliateRate = parseFloat(form.affiliate_rate) / 100 || 0
  const sellerDiscount = parseFloat(form.seller_discount) || 0
  const shippingFee = parseFloat(form.shipping_fee) || 0

  const previewTaxRegistered = feeRule?.tax_registered ?? false

  const previewFees = selectedProduct
    ? calcTikTokFees(
        selectedProduct.selling_price,
        selectedProduct.cost_price,
        feeRule?.referral_rate ?? selectedProduct.commission_rate,
        feeRule?.transaction_rate ?? 0.06,
        feeRule?.processing_fee ?? 3000,
        form.order_date,
        1,
        form.is_refund,
        previewTaxRegistered,
        sellerDiscount,
        shippingFee,
      )
    : null

  const netProfit = previewFees
    ? previewFees.profit - selectedProduct!.selling_price * affiliateRate
    : 0

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedProduct) return
    setLoading(true)
    const qty = parseInt(form.quantity)
    const affiliateFee = Math.round(selectedProduct.selling_price * affiliateRate * qty)

    const fees = calcTikTokFees(
      selectedProduct.selling_price,
      selectedProduct.cost_price,
      feeRule?.referral_rate ?? selectedProduct.commission_rate,
      feeRule?.transaction_rate ?? 0.06,
      feeRule?.processing_fee ?? 3000,
      form.order_date,
      qty,
      form.is_refund,
      previewTaxRegistered,
      sellerDiscount,
      shippingFee,
    )

    const lossAmt = calculateLossAmount({
      costPrice: selectedProduct.cost_price,
      shippingFee,
      quantity: qty,
      orderStatus: form.order_status,
    })

    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      category: selectedProduct.category,
      quantity: qty,
      selling_price: selectedProduct.selling_price,
      cost_price: selectedProduct.cost_price,
      commission_rate: feeRule?.referral_rate ?? selectedProduct.commission_rate,
      affiliate_rate: affiliateRate,
      affiliate_fee: affiliateFee,
      profit: (fees.profit - selectedProduct.selling_price * affiliateRate) * qty,
      margin: fees.margin,
      settlement_amount: 0,
      is_refund: form.is_refund,
      order_date: form.order_date,
      seller_discount: sellerDiscount,
      shipping_fee: shippingFee,
      transaction_fee: fees.transactionFee,
      order_status: form.order_status,
      loss_amount: lossAmt,
    })
    setLoading(false)
    if (error) { addToast('error', t('toast.addOrderError')); return }
    addToast('success', t('toast.addedOrder'))
    setTab('list')
    fetchData()
  }

  const handleCsvImport = async (rows: CsvRow[]) => {
    if (!user) return
    const chunks: CsvRow[][] = []
    for (let i = 0; i < rows.length; i += 100) chunks.push(rows.slice(i, i + 100))

    let imported = 0
    for (const chunk of chunks) {
      const records = chunk.map(r => {
        const fr = feeRules.find(f => f.category === r.category)
        const commissionRate = fr?.referral_rate ?? 0.125
        const transactionRate = fr?.transaction_rate ?? 0.06
        const processingFee = fr?.processing_fee ?? 3000
        const affiliateFee = Math.round(r.selling_price * r.affiliate_rate * r.quantity)

        const lossAmt = calculateLossAmount({
          costPrice: 0,
          shippingFee: r.shipping_fee,
          quantity: r.quantity,
          orderStatus: r.order_status,
        })

        const fees = calcTikTokFees(
          r.selling_price, 0, commissionRate, transactionRate, processingFee,
          r.order_date, r.quantity, r.is_refund,
          fr?.tax_registered ?? false, r.seller_discount, r.shipping_fee,
        )
        return {
          user_id: user.id,
          product_id: null,
          product_name: r.product_name,
          category: r.category,
          order_number: r.order_number,
          quantity: r.quantity,
          selling_price: r.selling_price,
          cost_price: 0,
          commission_rate: commissionRate,
          affiliate_rate: r.affiliate_rate,
          affiliate_fee: affiliateFee,
          settlement_amount: r.settlement_amount,
          is_refund: r.is_refund,
          profit: r.settlement_amount > 0
            ? r.settlement_amount - affiliateFee
            : (fees.profit - r.selling_price * r.affiliate_rate) * r.quantity,
          margin: fees.margin,
          order_date: r.order_date,
          seller_discount: r.seller_discount,
          shipping_fee: r.shipping_fee,
          transaction_fee: fees.transactionFee,
          order_status: r.order_status,
          loss_amount: lossAmt,
        }
      })
      const { error } = await supabase.from('orders').insert(records)
      if (error) { addToast('error', t('csv.importError')); return }
      imported += chunk.length
    }
    addToast('success', t('csv.importSuccess', { n: imported }))
    setTab('list')
    fetchData()
  }

  const activeOrders = orders.filter(o => o.order_status === 'completed')
  const totalProfit = activeOrders.reduce((s, o) => s + o.profit, 0)
  const totalRevenue = activeOrders.reduce((s, o) => s + o.selling_price * o.quantity, 0)
  const totalLoss = orders.reduce((s, o) => s + (o.loss_amount || 0), 0)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: t('ord.tabList'), icon: <List className="w-4 h-4" /> },
    { id: 'manual', label: t('ord.tabManual'), icon: <Plus className="w-4 h-4" /> },
    { id: 'csv', label: t('ord.tabCsv'), icon: <Upload className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('ord.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} đơn ·{' '}
            <span className={totalProfit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {formatCurrency(totalProfit)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === 'manual' && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('ord.addNew')}</h2>
          {products.length === 0 ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
              {t('ord.noProducts')}{' '}
              <a href="/app/products" className="font-medium underline">{t('ord.productsLink')}</a>
            </div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">{t('ord.product')}</label>
                  <select value={form.product_id}
                    onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#EE1D52]" required>
                    <option value="">{t('ord.selectProduct')}</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                  </select>
                </div>
                <Input label={t('ord.quantity')} type="number" value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} min="1" />
                <DateInput label={t('ord.date')} value={form.order_date}
                  onChange={e => setForm(p => ({ ...p, order_date: e.target.value }))} />
                <Input label={t('ord.affiliateRate')} type="number" step="0.1" value={form.affiliate_rate}
                  onChange={e => setForm(p => ({ ...p, affiliate_rate: e.target.value }))}
                  suffix="%" />
                {/* Phase 1: Seller discount & shipping fee */}
                <Input label={t('ord.sellerDiscount')} type="number" value={form.seller_discount}
                  onChange={e => setForm(p => ({ ...p, seller_discount: e.target.value }))} suffix="₫" />
                <Input label={t('ord.shippingFee')} type="number" value={form.shipping_fee}
                  onChange={e => setForm(p => ({ ...p, shipping_fee: e.target.value }))} suffix="₫" />
                {/* Phase 3: Order status */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">{t('ord.orderStatus')}</label>
                  <select value={form.order_status}
                    onChange={e => setForm(p => ({ ...p, order_status: e.target.value as OrderStatus }))}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#EE1D52]">
                    {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([status, labelKey]) => (
                      <option key={status} value={status}>{t(labelKey)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_refund" checked={form.is_refund}
                    onChange={e => setForm(p => ({ ...p, is_refund: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#EE1D52]" />
                  <label htmlFor="is_refund" className="text-sm text-gray-600">{t('ord.isRefund')}</label>
                </div>
              </div>

              {/* Phase 1: 수수료 공식 버전 표시 */}
              <div className="text-xs text-gray-400">
                Công thức áp dụng: <span className="font-medium text-gray-600">
                  {detectFormulaVersion(form.order_date) === 'before_2026_04'
                    ? t('calc.formulaBefore')
                    : t('calc.formulaAfter')
                  }
                </span>
                {previewTaxRegistered && <span className="ml-2">· {t('calc.taxRegistered')}</span>}
              </div>

              {previewFees && selectedProduct && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  <p className="font-medium text-gray-700 mb-2">{t('ord.preview')}</p>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('ord.previewSell')}</span>
                    <span>{formatCurrency(selectedProduct.selling_price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>− {t('ord.previewCost')}</span>
                    <span className="text-red-500">−{formatCurrency(selectedProduct.cost_price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>− {t('ord.previewFees')}</span>
                    <span className="text-red-500">−{formatCurrency(previewFees.totalFees)}</span>
                  </div>
                  {affiliateRate > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>− {t('ord.previewAffiliate', { rate: (affiliateRate * 100).toFixed(1) })}</span>
                      <span className="text-red-500">−{formatCurrency(selectedProduct.selling_price * affiliateRate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                    <span>{t('ord.previewNet')}</span>
                    <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(netProfit)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" type="button" onClick={() => setTab('list')}>{t('ord.cancel')}</Button>
                <Button type="submit" loading={loading}>{t('ord.save')}</Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {tab === 'csv' && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('csv.title')}</h2>
          <CsvUpload onImport={handleCsvImport} />
        </Card>
      )}

      {tab === 'list' && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-gray-500">{t('ord.totalRevenue')}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </Card>
            <Card>
              <p className="text-xs text-gray-500">{t('ord.totalProfit')}</p>
              <p className={`text-lg font-bold mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </Card>
            {/* Phase 3: Loss card */}
            <Card>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                {t('ord.totalLoss')}
              </p>
              <p className={`text-lg font-bold mt-1 ${totalLoss > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(totalLoss)}
              </p>
            </Card>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t('ord.empty')}</p>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    {[
                      t('ord.colProduct'), t('ord.colDate'), t('ord.colQty'),
                      t('ord.colRevenue'), t('ord.colProfit'), t('ord.colMargin'),
                      t('ord.colStatus'), t('ord.colLoss'),
                    ].map(h => (
                      <th key={h} className="pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => {
                    const isLossStatus = o.order_status === 'cod_rejected' || o.order_status === 'failed_delivery'
                    return (
                      <tr key={o.id} className={o.order_status !== 'completed' ? 'opacity-60' : ''}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900 text-sm">{o.product_name}</p>
                          {o.order_status !== 'completed' && (
                            <span className={`text-xs font-medium ${isLossStatus ? 'text-red-500' : 'text-gray-400'}`}>
                              {t(ORDER_STATUS_LABELS[o.order_status])}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-sm whitespace-nowrap">{formatDate(o.order_date)}</td>
                        <td className="py-3 pr-4 text-gray-600 text-sm">{o.quantity}</td>
                        <td className="py-3 pr-4 text-gray-900 text-sm">{formatCurrency(o.selling_price * o.quantity)}</td>
                        <td className={`py-3 pr-4 font-medium text-sm ${o.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(o.profit)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={o.margin > 10 ? 'green' : o.margin > 0 ? 'yellow' : 'red'}>
                            {o.margin.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                          {t(ORDER_STATUS_LABELS[o.order_status])}
                        </td>
                        <td className="py-3 pr-4 text-sm">
                          {o.loss_amount > 0 ? (
                            <span className="text-red-500 font-medium">{formatCurrency(o.loss_amount)}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
