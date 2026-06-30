import Papa from 'papaparse'
import type { OrderStatus } from '@/types'

export interface CsvRow {
  order_number: string
  product_name: string
  quantity: number
  selling_price: number
  settlement_amount: number
  order_date: string
  is_refund: boolean
  category: string
  affiliate_rate: number
  order_status: OrderStatus
  shipping_fee: number
  seller_discount: number
}

// Normalise a header string for fuzzy matching
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '')

// Maps normalised header → internal field name
const COLUMN_MAP: Record<string, keyof CsvRow> = {
  // Order number
  'ordernumber': 'order_number',
  'orderid': 'order_number',
  'mãđơnhàng': 'order_number',
  'sốhiệuđơnhàng': 'order_number',
  // Product name
  'productname': 'product_name',
  'tênhànghóa': 'product_name',
  'tênsảnphẩm': 'product_name',
  'hànghóa': 'product_name',
  // Quantity
  'quantity': 'quantity',
  'qty': 'quantity',
  'sốlượng': 'quantity',
  'slsp': 'quantity',
  // Selling price
  'sellingprice': 'selling_price',
  'saleprice': 'selling_price',
  'ordertotalprice': 'selling_price',
  'giábán': 'selling_price',
  'giátrịđơnhàng': 'selling_price',
  // Settlement amount (what TikTok pays out)
  'settlementamount': 'settlement_amount',
  'settledamount': 'settlement_amount',
  'sốtiềnthanhtoán': 'settlement_amount',
  'tiềnthanhlýthực': 'settlement_amount',
  // Order date
  'orderdate': 'order_date',
  'createdate': 'order_date',
  'ngàyđặthàng': 'order_date',
  'ngàytạo': 'order_date',
  // Refund status
  'orderstatus': 'order_status',
  'status': 'order_status',
  'trạngtháiđơn': 'order_status',
  'trạngthái': 'order_status',
  // Category
  'category': 'category',
  'productcategory': 'category',
  'danhsách': 'category',
  'danhmục': 'category',
  // Affiliate rate
  'affiliatecommissionrate': 'affiliate_rate',
  'affiliaterate': 'affiliate_rate',
  'tỷlệhoahồngtiếpthị': 'affiliate_rate',
  // Shipping fee
  'shippingfee': 'shipping_fee',
  'phívậnchuyển': 'shipping_fee',
  'phísanphẩm': 'shipping_fee',
  // Seller discount
  'sellerdiscount': 'seller_discount',
  'vendorDiscount': 'seller_discount',
  'chiếtkhấungườibán': 'seller_discount',
}

const REFUND_STATUSES = ['hoàn trả', 'hoàn hàng', 'refund', 'returned', 'đã hủy', 'canceled']

// COD 거부/배송실패 키워드 (베트남어)
const COD_REJECTED_KEYWORDS = ['cod bị từ chối', 'cod reject', 'từ chối cod', 'không nhận hàng']
const FAILED_DELIVERY_KEYWORDS = ['giao hàng thất bại', 'delivery failed', 'không giao được', 'thất bại']
const CANCELLED_KEYWORDS = ['đã hủy', 'cancelled', 'canceled', 'hủy đơn']
const COMPLETED_KEYWORDS = ['hoàn thành', 'completed', 'delivered', 'đã giao', 'đã nhận']

function parseVnd(val: string): number {
  if (!val) return 0
  return parseFloat(val.replace(/[₫,.\s]/g, '').replace(/[^0-9-]/g, '')) || 0
}

function parseDate(val: string): string {
  if (!val) return new Date().toISOString().split('T')[0]
  // DD/MM/YYYY → YYYY-MM-DD
  const ddmm = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (ddmm) return `${ddmm[3]}-${ddmm[2].padStart(2, '0')}-${ddmm[1].padStart(2, '0')}`
  // Already ISO or YYYY-MM-DD
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return val.split('T')[0]
  return new Date().toISOString().split('T')[0]
}

function detectOrderStatus(raw: string): OrderStatus {
  const s = raw.toLowerCase().trim()
  if (COD_REJECTED_KEYWORDS.some(k => s.includes(k))) return 'cod_rejected'
  if (FAILED_DELIVERY_KEYWORDS.some(k => s.includes(k))) return 'failed_delivery'
  if (CANCELLED_KEYWORDS.some(k => s.includes(k))) return 'cancelled'
  if (REFUND_STATUSES.some(k => s.includes(k))) return 'refunded'
  if (COMPLETED_KEYWORDS.some(k => s.includes(k))) return 'completed'
  // 기본값
  return 'completed'
}

export function parseTikTokCsv(fileContent: string): CsvRow[] {
  const parsed = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  if (!parsed.data.length) return []

  // Build a mapping from original header → internal field
  const headers = Object.keys(parsed.data[0])
  const fieldMap: Record<string, keyof CsvRow> = {}
  for (const h of headers) {
    const mapped = COLUMN_MAP[norm(h)]
    if (mapped) fieldMap[h] = mapped
  }

  return parsed.data.map(row => {
    const get = (field: keyof CsvRow): string => {
      const originalKey = Object.keys(fieldMap).find(k => fieldMap[k] === field)
      return originalKey ? (row[originalKey] ?? '') : ''
    }

    const statusRaw = get('order_status')
    const orderStatus = detectOrderStatus(statusRaw)
    const isRefund = orderStatus === 'refunded'

    const affiliateRaw = parseFloat(get('affiliate_rate').replace('%', '')) || 0
    const affiliateRate = affiliateRaw > 1 ? affiliateRaw / 100 : affiliateRaw

    return {
      order_number: get('order_number') || `CSV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      product_name: get('product_name') || 'Sản phẩm không rõ',
      quantity: parseInt(get('quantity')) || 1,
      selling_price: parseVnd(get('selling_price')),
      settlement_amount: parseVnd(get('settlement_amount')),
      order_date: parseDate(get('order_date')),
      is_refund: isRefund,
      category: get('category') || 'Khác',
      affiliate_rate: affiliateRate,
      order_status: orderStatus,
      shipping_fee: parseVnd(get('shipping_fee')),
      seller_discount: parseVnd(get('seller_discount')),
    }
  })
}
