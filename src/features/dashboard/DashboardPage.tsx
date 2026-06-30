import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, ShoppingBag, AlertTriangle, Megaphone, Target, Calendar, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '@/shared/ui/Card'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/features/auth/authStore'
import { formatCurrency, detectFormulaVersion } from '@/shared/lib/utils'
import { useLang } from '@/shared/lib/langStore'
import type { DashboardStats, Period, Order, ShopProfile, FeeRule } from '@/types'

interface ChartPoint { date: string; revenue: number; profit: number }

function getPeriodStart(period: Period): string | null {
  if (period === 'all') return null
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function groupByDate(orders: Order[]): ChartPoint[] {
  const map: Record<string, ChartPoint> = {}
  for (const o of orders) {
    if (o.order_status !== 'completed') continue
    const date = o.order_date.slice(0, 10)
    if (!map[date]) map[date] = { date, revenue: 0, profit: 0 }
    map[date].revenue += o.selling_price * o.quantity
    map[date].profit += o.profit
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map(p => ({
    ...p,
    date: p.date.slice(5).replace('-', '/'),
  }))
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { t } = useLang()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, totalProfit: 0, totalOrders: 0, avgMargin: 0,
    lowMarginProducts: 0, totalAdSpend: 0, netProfit: 0, breakEvenAdSpend: 0,
  })
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [period, setPeriod] = useState<Period>('30d')
  const [loading, setLoading] = useState(true)
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)
  const [codLoss, setCodLoss] = useState(0)
  const [failedDeliveryLoss, setFailedDeliveryLoss] = useState(0)
  const [feeRules, setFeeRules] = useState<FeeRule[]>([])

  const fetchDashboard = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const start = getPeriodStart(period)

    let ordersQ = supabase.from('orders').select('*').eq('user_id', user.id)
    if (start) ordersQ = ordersQ.gte('order_date', start)

    let adsQ = supabase.from('ad_spend').select('amount').eq('user_id', user.id)
    if (start) adsQ = adsQ.gte('spend_date', start)

    const [{ data: orders }, { data: ads }, { data: products }, { data: profile }, { data: allOrders }, { data: rules }] = await Promise.all([
      ordersQ,
      adsQ,
      supabase.from('products').select('selling_price, cost_price, commission_rate').eq('user_id', user.id),
      supabase.from('shop_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', user.id),
      supabase.from('fee_rules').select('*'),
    ])

    const completedOrders = (orders ?? []).filter((o: Order) => o.order_status === 'completed')
    const totalRevenue = completedOrders.reduce((s: number, o: Order) => s + o.selling_price * o.quantity, 0)
    const totalProfit = completedOrders.reduce((s: number, o: Order) => s + o.profit, 0)
    const avgMargin = completedOrders.length > 0
      ? completedOrders.reduce((s: number, o: Order) => s + o.margin, 0) / completedOrders.length
      : 0
    const totalAdSpend = (ads ?? []).reduce((s: number, a: any) => s + a.amount, 0)
    const netProfit = totalProfit - totalAdSpend
    const lowMarginProducts = (products ?? []).filter((p: any) => {
      const rule = (rules as FeeRule[] ?? []).find(r => r.category === p.category)
      const rate = rule?.referral_rate ?? 0.125
      const margin = (p.selling_price - p.cost_price - p.selling_price * rate - 3000) / p.selling_price * 100
      return margin < 5
    }).length
    const avgMarginDecimal = avgMargin / 100
    const breakEvenAdSpend = avgMarginDecimal > 0 ? totalRevenue * avgMarginDecimal : 0

    setStats({ totalRevenue, totalProfit, totalOrders: completedOrders.length, avgMargin, lowMarginProducts, totalAdSpend, netProfit, breakEvenAdSpend })
    setChart(groupByDate(orders ?? []))
    setShopProfile(profile as ShopProfile | null)
    setTotalOrders((allOrders ?? []).length)
    setFeeRules(rules as FeeRule[] ?? [])

    // Phase 3: COD 거부 + 배송실패 손실 집계
    const allOrdersArr = (allOrders ?? []) as Order[]
    const codLossAmt = allOrdersArr
      .filter(o => o.order_status === 'cod_rejected')
      .reduce((s, o) => s + (o.loss_amount || 0), 0)
    const failedLossAmt = allOrdersArr
      .filter(o => o.order_status === 'failed_delivery')
      .reduce((s, o) => s + (o.loss_amount || 0), 0)
    setCodLoss(codLossAmt)
    setFailedDeliveryLoss(failedLossAmt)

    setLoading(false)
  }, [user, period])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Phase 2: 프로베이션 계산
  const probationDays = 60
  const probationOrders = 1000
  let shopStartDate: Date | null = null
  if (shopProfile?.shop_start_date) {
    shopStartDate = new Date(shopProfile.shop_start_date + 'T00:00:00')
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let daysPassed = 0
  let daysRemaining = 0
  let probCompleted = false

  if (shopStartDate) {
    const diffMs = today.getTime() - shopStartDate.getTime()
    daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    daysRemaining = Math.max(0, probationDays - daysPassed)
    const daysMet = daysPassed >= probationDays
    const ordersMet = totalOrders >= probationOrders
    probCompleted = daysMet && ordersMet
  }

  const periods: { id: Period; label: string }[] = [
    { id: '7d', label: t('dash.period7d') },
    { id: '30d', label: t('dash.period30d') },
    { id: '90d', label: t('dash.period90d') },
    { id: 'all', label: t('dash.periodAll') },
  ]

  const statCards = [
    { label: t('dash.revenue'), value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('dash.profit'), value: formatCurrency(stats.totalProfit), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('dash.adSpend'), value: formatCurrency(stats.totalAdSpend), icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    {
      label: t('dash.netProfit'), value: formatCurrency(stats.netProfit),
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bg: stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    { label: t('dash.orders'), value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    {
      label: t('dash.avgMargin'), value: `${stats.avgMargin.toFixed(1)}%`,
      icon: stats.avgMargin > 10 ? TrendingUp : TrendingDown,
      color: stats.avgMargin > 10 ? 'text-green-600' : 'text-red-600',
      bg: stats.avgMargin > 10 ? 'bg-green-50' : 'bg-red-50',
    },
  ]

  const breakEvenPct = stats.breakEvenAdSpend > 0 ? Math.min((stats.totalAdSpend / stats.breakEvenAdSpend) * 100, 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#EE1D52] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('dash.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('dash.feeNote')}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {periods.map(({ id, label }) => (
            <button key={id} onClick={() => setPeriod(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase 2: Probation Progress Card */}
      {shopStartDate && (
        <Card className={`border ${probCompleted ? 'border-green-200' : 'border-amber-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {probCompleted
                ? <CheckCircle className="w-5 h-5 text-green-500" />
                : <Clock className="w-5 h-5 text-amber-500" />}
              <div>
                <h2 className="text-sm font-semibold text-gray-700">{t('dash.probationTitle')}</h2>
                {probCompleted ? (
                  <p className="text-sm text-green-600 font-medium mt-0.5">{t('dash.probationGraduated')}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {daysRemaining > 0
                      ? t('dash.probationDaysLeft', { n: daysRemaining })
                      : t('dash.probationDaysOverdue', { n: Math.abs(daysPassed - probationDays) })
                    }
                  </p>
                )}
              </div>
            </div>
            {probCompleted && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                {t('dash.probationGraduated')}
              </span>
            )}
          </div>
          {/* Progress bars */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('dash.probationDays')}</span>
                <span>{daysPassed}/{probationDays}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${daysPassed >= probationDays ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, (daysPassed / probationDays) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('dash.probationOrdersLabel')}</span>
                <span>{totalOrders}/{probationOrders}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${totalOrders >= probationOrders ? 'bg-green-500' : 'bg-amber-400'}`}
                  style={{ width: `${Math.min(100, (totalOrders / probationOrders) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Phase 2: 설정 안내 (시작일 미입력) */}
      {!shopProfile?.shop_start_date && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            {t('dash.probationNotSet')}
          </p>
        </div>
      )}

      {stats.lowMarginProducts > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700" dangerouslySetInnerHTML={{
            __html: t('dash.lowMarginWarning', { n: stats.lowMarginProducts }).replace(
              String(stats.lowMarginProducts),
              `<strong>${stats.lowMarginProducts}</strong>`
            )
          }} />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
          </Card>
        ))}
      </div>

      {/* Phase 3: COD Loss Cards */}
      {(codLoss > 0 || failedDeliveryLoss > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {codLoss > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-gray-500">{t('dash.codLoss')}</p>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(codLoss)}</p>
            </Card>
          )}
          {failedDeliveryLoss > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-red-500" />
                <p className="text-xs text-gray-500">{t('dash.failedDeliveryLoss')}</p>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(failedDeliveryLoss)}</p>
            </Card>
          )}
          {(codLoss > 0 && failedDeliveryLoss > 0) && (
            <Card className="col-span-2 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-red-600 font-medium">{t('dash.totalLoss')}</p>
              </div>
              <p className="text-lg font-bold text-red-700">{formatCurrency(codLoss + failedDeliveryLoss)}</p>
            </Card>
          )}
        </div>
      )}

      {/* Break-even */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-[#EE1D52]" />
          <h2 className="text-sm font-semibold text-gray-700">{t('dash.breakEven')}</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {t('dash.breakEvenDesc', { spent: formatCurrency(stats.totalAdSpend), max: formatCurrency(stats.breakEvenAdSpend) })}
        </p>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${breakEvenPct >= 90 ? 'bg-red-500' : breakEvenPct >= 60 ? 'bg-amber-400' : 'bg-green-500'}`}
            style={{ width: `${breakEvenPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">{breakEvenPct.toFixed(0)}% {t('dash.breakEvenUsed')}</p>
      </Card>

      {/* Chart */}
      {chart.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dash.chartTitle')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EE1D52" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EE1D52" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}tr`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#EE1D52" strokeWidth={2} fill="url(#revenue)" name={t('dash.chartRevenue')} />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profit)" name={t('dash.chartProfit')} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Fee Structure */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('dash.feeTitle')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('dash.commissionFee'), value: '12.5%', note: t('dash.marketplaceSellers') },
            { label: t('dash.transactionFee'), value: '6.0%', note: t('dash.transactionNote') },
            { label: t('dash.processingFee'), value: '3.000₫', note: t('dash.processingNote') },
          ].map(({ label, value, note }) => (
            <div key={label} className="bg-rose-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-[#EE1D52] mt-0.5">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>
            </div>
          ))}
        </div>
        {/* Phase 1: 수수료 공식 정보 */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Trước 01/04/2026</p>
            <p className="text-xs text-gray-700 mt-1">Phí GD = (Tiền KH trả − Hoàn trả) × Tỷ lệ</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Từ 01/04/2026</p>
            <p className="text-xs text-gray-700 mt-1">Phí GD = (Giá vốn − CK + Phí VC − Hoàn trả) × Tỷ lệ</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
