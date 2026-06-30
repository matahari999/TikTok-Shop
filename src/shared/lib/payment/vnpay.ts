import type { PaymentRequest, PaymentResult } from './types'

export async function createVnpayPayment(req: PaymentRequest): Promise<PaymentResult> {
  const tmnCode = import.meta.env.VITE_VNPAY_TMN_CODE
  const hashSecret = import.meta.env.VITE_VNPAY_HASH_SECRET

  if (!tmnCode || !hashSecret) {
    throw new Error('VNPay credentials not configured. Set VITE_VNPAY_TMN_CODE and VITE_VNPAY_HASH_SECRET in .env')
  }

  // VNPay payment API integration goes here once credentials are set
  // Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
  throw new Error('VNPay payment not yet implemented — add credentials to .env first')
}
