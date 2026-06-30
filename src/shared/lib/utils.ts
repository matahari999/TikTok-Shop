import type { TransactionFeeInput, LossCalculationInput, FeeFormulaVersion } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('vi-VN')
}

export function cn(...classes: (string | boolean | undefined | null | 0)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function removeVietnameseTones(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export interface FeeResult {
  commission: number
  transactionFee: number
  processingFee: number
  totalFees: number
  profit: number
  margin: number
}

/**
 * 주문일자(order_date) 기준으로 적절한 수수료 공식 버전을 반환
 * - 2026.4.1 미만: 'before_2026_04'
 * - 2026.4.1 이상: 'after_2026_04'
 */
export function detectFormulaVersion(orderDate: string): FeeFormulaVersion {
  const cutoff = new Date('2026-04-01')
  const date = new Date(orderDate)
  return date < cutoff ? 'before_2026_04' : 'after_2026_04'
}

/**
 * Transaction Fee 계산 (공식 버전 + 사업자 등록 여부 반영)
 *
 * before_2026_04:
 *   Transaction Fee = (고객 결제액 - 주문 환불액) × 수수료율
 *
 * after_2026_04:
 *   Transaction Fee = (원가 - 셀러 할인 + 고객 배송비 - 주문 환불액) × 수수료율
 *
 * 사업자 등록(taxRegistered) 여부:
 *   true  = 세금 제외 금액 기준 ( / (1 + VAT) )
 *   false = 세금 포함 금액 기준 (그대로)
 */
export function calculateTransactionFee(input: TransactionFeeInput): number {
  const {
    sellingPrice, costPrice, quantity, transactionRate,
    orderDate, isRefund,
    sellerDiscount = 0, shippingFee = 0,
    taxRegistered = false, vatRate = 0.10,
  } = input

  const formulaVersion = detectFormulaVersion(orderDate)
  const refundAmount = isRefund ? sellingPrice * quantity : 0

  let base: number
  if (formulaVersion === 'before_2026_04') {
    // before_2026_04: (고객 결제액 - 환불액) × 수수료율
    base = sellingPrice * quantity - refundAmount
  } else {
    // after_2026_04: (원가 - 셀러 할인 + 배송비 - 환불액) × 수수료율
    base = costPrice * quantity - sellerDiscount + shippingFee - refundAmount
  }

  // 사업자 등록 시: 세금 제외 금액으로 변환
  if (taxRegistered && vatRate > 0) {
    base = base / (1 + vatRate)
  }

  const fee = Math.max(0, base * transactionRate)
  return Math.round(fee)
}

/**
 * TikTok Shop VN 종합 수수료 계산
 * - 2026.4.1 전/후 공식 자동 분기
 * - 사업자 등록 여부 반영
 */
export function calcTikTokFees(
  sellingPrice: number,
  costPrice: number,
  commissionRate = 0.125,
  transactionRate = 0.06,
  processingFee = 3000,
  orderDate?: string,
  quantity = 1,
  isRefund = false,
  taxRegistered = false,
  sellerDiscount = 0,
  shippingFee = 0,
): FeeResult {
  const qty = Math.max(1, quantity)
  const commission = sellingPrice * commissionRate * qty

  const transactionFee = calculateTransactionFee({
    sellingPrice,
    costPrice,
    quantity: qty,
    transactionRate,
    orderDate: orderDate ?? new Date().toISOString().split('T')[0],
    isRefund,
    sellerDiscount,
    shippingFee,
    taxRegistered,
  })

  const totalProcessing = processingFee * qty
  const totalFees = commission + transactionFee + totalProcessing
  const totalSelling = sellingPrice * qty
  const totalCost = costPrice * qty
  const profit = totalSelling - totalCost - totalFees
  const margin = totalSelling > 0 ? (profit / totalSelling) * 100 : 0

  return {
    commission: Math.round(commission),
    transactionFee,
    processingFee: totalProcessing,
    totalFees: Math.round(totalFees),
    profit: Math.round(profit),
    margin,
  }
}

/**
 * COD 거부/배송실패 손실액 계산
 * 손실액 = (원가 × 수량) + 배송비
 * - 원가(cost_price) + 배송비(shipping_fee)가 이미 지출된 비용
 * - completed/refunded/cancelled는 손실 0
 * - cod_rejected: 원가 + 배송비 전액 손실
 * - failed_delivery: 원가 + 배송비 전액 손실
 */
export function calculateLossAmount(input: LossCalculationInput): number {
  const { costPrice, shippingFee, quantity, orderStatus } = input

  if (orderStatus === 'completed' || orderStatus === 'refunded' || orderStatus === 'cancelled') {
    return 0
  }

  // cod_rejected/failed_delivery: 원가 + 배송비
  return costPrice * quantity + shippingFee
}

/**
 * 공급가액(세금 제외 금액) 계산
 * VAT 기본 10%
 */
export function calcTaxExclusiveAmount(amount: number, vatRate = 0.10): number {
  return Math.round(amount / (1 + vatRate))
}
