import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export const getStripe = () => {
  return stripePromise
}

export type PaymentIntent = {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'processing' | 'requires_payment_method'
  client_secret: string
}

export type PaymentMethod = {
  id: string
  type: 'card' | 'apple_pay' | 'google_pay'
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
} 