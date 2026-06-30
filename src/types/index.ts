export interface User {
  id: string
  email?: string
  name?: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  sku: string
  category: string
  cost_price: number
  selling_price: number
  stock: number
  commission_rate: number
  created_at: string
}

export type OrderStatus = 'completed' | 'cod_rejected' | 'refunded' | 'failed_delivery' | 'cancelled'
export type FeeFormulaVersion = 'before_2026_04' | 'after_2026_04'

export interface Order {
  id: string
  user_id: string
  product_id: string | null
  product_name: string
  quantity: number
  selling_price: number
  cost_price: number
  commission_rate: number
  profit: number
  margin: number
  order_date: string
  created_at: string
  order_number?: string
  category: string
  is_refund: boolean
  settlement_amount: number
  affiliate_rate: number
  affiliate_fee: number
  seller_discount: number
  shipping_fee: number
  transaction_fee: number
  order_status: OrderStatus
  loss_amount: number
}

export interface FeeRule {
  id: string
  category: string
  referral_rate: number
  transaction_rate: number
  processing_fee: number
  notes?: string
  updated_at: string
  tax_registered: boolean
  fee_formula_version: FeeFormulaVersion
}

export interface ShopProfile {
  id: string
  user_id: string
  shop_name?: string
  shop_start_date?: string
  created_at: string
}

export interface AdSpend {
  id: string
  user_id: string
  spend_date: string
  campaign_name: string
  amount: number
  note?: string
  created_at: string
}

export type Period = '7d' | '30d' | '90d' | 'all'

export interface DashboardStats {
  totalRevenue: number
  totalProfit: number
  totalOrders: number
  avgMargin: number
  lowMarginProducts: number
  totalAdSpend: number
  netProfit: number
  breakEvenAdSpend: number
}

export interface TransactionFeeInput {
  sellingPrice: number
  costPrice: number
  quantity: number
  transactionRate: number
  orderDate: string
  isRefund: boolean
  sellerDiscount?: number
  shippingFee?: number
  taxRegistered?: boolean
  vatRate?: number
}

export interface LossCalculationInput {
  costPrice: number
  shippingFee: number
  quantity: number
  orderStatus: OrderStatus
}
