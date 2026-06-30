import { useState } from 'react'
import { Calculator, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import Card from '@/shared/ui/Card'
import Input from '@/shared/ui/Input'
import { formatCurrency, calcTikTokFees, detectFormulaVersion, calculateTransactionFee } from '@/shared/lib/utils'
import { useLang } from '@/shared/lib/langStore'

export default function CalculatorPage() {
  const { t } = useLang()
  const [sellingPrice, setSellingPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [commissionRate, setCommissionRate] = useState('12.5')
  const [qty, setQty] = useState('1')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [taxRegistered, setTaxRegistered] = useState(false)
  const [sellerDiscount, setSellerDiscount] = useState('')
  const [shippingFee, setShippingFee] = useState('')

  const selling = parseFloat(sellingPrice) || 0
  const cost = parseFloat(costPrice) || 0
  const rate = parseFloat(commissionRate) / 100 || 0.125
  const quantity = parseInt(qty) || 1
  const discount = parseFloat(sellerDiscount) || 0
  const shipping = parseFloat(shippingFee) || 0

  const formulaVersion = orderDate ? detectFormulaVersion(orderDate) : 'after_2026_04'

  const result = selling > 0
    ? calcTikTokFees(selling, cost, rate, 0.06, 3000, orderDate, quantity, false, taxRegistered, discount, shipping)
    : null

  const transactionFeeBreakdown = selling > 0 ? calculateTransactionFee({
    sellingPrice: selling,
    costPrice: cost,
    quantity,
    transactionRate: 0.06,
    orderDate,
    isRefund: false,
    sellerDiscount: discount,
    shippingFee: shipping,
    taxRegistered,
  }) : 0

  const isProfit = result && result.profit > 0
  const isWarning = result && result.margin < 5

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('calc.title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('calc.subtitle')}</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#EE1D52]" /> {t('calc.productInfo')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('calc.sellingPrice')} type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
            placeholder="150000" suffix="₫" />
          <Input label={t('calc.costPrice')} type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)}
            placeholder="80000" suffix="₫" />
          <Input label={t('calc.commissionRate')} type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)}
            placeholder="12.5" suffix="%" />
          <Input label={t('calc.quantity')} type="number" value={qty} onChange={e => setQty(e.target.value)}
            placeholder="1" />
        </div>
      </Card>

      {/* Phase 1: 추가 파라미터 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#EE1D52]" /> {t('calc.feeBreakdown')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('calc.orderDate')} type="date" value={orderDate}
            onChange={e => setOrderDate(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">{t('calc.formulaVersion')}</label>
            <div className={`px-3 py-2.5 rounded-xl text-sm border ${formulaVersion === 'after_2026_04' ? 'border-[#EE1D52] text-[#EE1D52] bg-rose-50' : 'border-gray-200 text-gray-600'}`}>
              {formulaVersion === 'before_2026_04' ? t('calc.formulaBefore') : t('calc.formulaAfter')}
            </div>
          </div>
          <Input label={t('calc.sellerDiscount')} type="number" value={sellerDiscount}
            onChange={e => setSellerDiscount(e.target.value)} suffix="₫" />
          <Input label={t('calc.shippingFee')} type="number" value={shippingFee}
            onChange={e => setShippingFee(e.target.value)} suffix="₫" />
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs font-medium text-gray-600">{t('calc.taxRegistered')}</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTaxRegistered(!taxRegistered)}
                className={`relative w-11 h-6 rounded-full transition-colors ${taxRegistered ? 'bg-[#EE1D52]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${taxRegistered ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm text-gray-600">
                {taxRegistered ? t('calc.taxRegistered') : t('calc.taxNotRegistered')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <>
          <Card className={isWarning ? 'border-amber-200' : isProfit ? 'border-green-200' : 'border-red-200'}>
            <div className="flex items-center gap-2 mb-4">
              {isProfit
                ? <CheckCircle className="w-5 h-5 text-green-500" />
                : <AlertTriangle className="w-5 h-5 text-red-500" />}
              <h2 className="text-sm font-semibold text-gray-700">{t('calc.result')}</h2>
              {isWarning && <span className="ml-auto text-xs text-amber-600 font-medium">{t('calc.lowMargin')}</span>}
            </div>

            <div className="space-y-2.5">
              {[
                { label: t('calc.labelSell'), value: formatCurrency(selling * quantity), negative: false },
                { label: t('calc.labelCost'), value: formatCurrency(cost * quantity), negative: true },
                { label: t('calc.labelCommission', { rate: commissionRate }), value: formatCurrency(result.commission), negative: true },
                { label: `${t('calc.labelTransaction')} (${formulaVersion === 'before_2026_04' ? t('calc.formulaBefore') : t('calc.formulaAfter')})`, value: formatCurrency(transactionFeeBreakdown), negative: true },
                { label: t('calc.labelProcessing'), value: formatCurrency(result.processingFee), note: t('calc.processingNote'), negative: true },
              ].map(({ label, value, note, negative }) => (
                <div key={label} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                  <span className="text-gray-600">{label} {note && <span className="text-xs text-gray-400">({note})</span>}</span>
                  <span className={negative ? 'text-red-500' : 'text-gray-900'}>{negative ? '−' : ''}{value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-gray-900">{t('calc.profitPerUnit')}</span>
                <span className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(result.profit)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('calc.margin')}</span>
                <span className={`text-sm font-semibold ${result.margin > 10 ? 'text-green-600' : result.margin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {result.margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          {quantity > 1 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('calc.bulkTitle', { n: quantity })}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{t('calc.totalRevenue')}</p>
                  <p className="text-base font-bold text-gray-900">{formatCurrency(selling * quantity)}</p>
                </div>
                <div className={`rounded-xl p-3 ${isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-xs text-gray-500">{t('calc.totalProfit')}</p>
                  <p className={`text-base font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(result.profit * quantity)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!isProfit && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium">{t('calc.tip')}</p>
              <ul className="mt-2 space-y-1 text-xs text-red-600">
                <li dangerouslySetInnerHTML={{ __html: t('calc.tip1', { price: `<strong>${formatCurrency(Math.ceil((cost + result.totalFees) * 1.05))}</strong>` }) }} />
                <li dangerouslySetInnerHTML={{ __html: t('calc.tip2', { price: `<strong>${formatCurrency(Math.floor(selling - result.totalFees))}</strong>` }) }} />
                <li>{t('calc.tip3')}</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
