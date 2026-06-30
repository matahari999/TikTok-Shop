export type { PaymentMethod, PaymentRequest, PaymentResult } from './types'
export { createMomoPayment } from './momo'
export { createVnpayPayment } from './vnpay'

import type { PaymentRequest, PaymentResult } from './types'
import { createMomoPayment } from './momo'
import { createVnpayPayment } from './vnpay'

export async function createPayment(req: PaymentRequest): Promise<PaymentResult> {
  if (req.method === 'momo') return createMomoPayment(req)
  if (req.method === 'vnpay') return createVnpayPayment(req)
  throw new Error(`Unknown payment method: ${req.method}`)
}
