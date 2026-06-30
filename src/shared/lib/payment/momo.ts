import type { PaymentRequest, PaymentResult } from './types'

export async function createMomoPayment(req: PaymentRequest): Promise<PaymentResult> {
  const partnerCode = import.meta.env.VITE_MOMO_PARTNER_CODE
  const accessKey = import.meta.env.VITE_MOMO_ACCESS_KEY

  if (!partnerCode || !accessKey) {
    throw new Error('MoMo credentials not configured. Set VITE_MOMO_PARTNER_CODE and VITE_MOMO_ACCESS_KEY in .env')
  }

  // MoMo payment API integration goes here once credentials are set
  // Docs: https://developers.momo.vn/v3/docs/payment/api/payment-method/
  throw new Error('MoMo payment not yet implemented — add credentials to .env first')
}
