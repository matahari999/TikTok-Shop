export type PaymentMethod = 'momo' | 'vnpay'

export interface PaymentRequest {
  method: PaymentMethod
  orderId: string
  amount: number
  description: string
  returnUrl: string
}

export interface PaymentResult {
  payUrl: string
  orderId: string
  method: PaymentMethod
}
