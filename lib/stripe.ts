import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripePublishableKey || !stripeSecretKey) {
  throw new Error('Faltan las variables de entorno de Stripe')
}

export const stripePromise = loadStripe(stripePublishableKey)
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16'
})

// Funciones de utilidad para pagos y suscripciones
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {
      enabled: true
    }
  })

  return paymentIntent
}

export const createSubscription = async (
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  })

  return subscription
}

export const cancelSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export const getCustomerSubscriptions = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method']
  })

  return subscriptions
}

export const getSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'default_payment_method']
  })

  return subscription
}

export const updateSubscription = async (
  subscriptionId: string,
  priceId: string
) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId
      }
    ],
    proration_behavior: 'always_invoice'
  })

  return updatedSubscription
}

export const createCustomer = async (email: string, metadata: Record<string, string> = {}) => {
  const customer = await stripe.customers.create({
    email,
    metadata
  })

  return customer
}

export const getCustomer = async (customerId: string) => {
  const customer = await stripe.customers.retrieve(customerId)
  return customer
}

export const updateCustomer = async (
  customerId: string,
  data: Stripe.CustomerUpdateParams
) => {
  const customer = await stripe.customers.update(customerId, data)
  return customer
}

export const deleteCustomer = async (customerId: string) => {
  const customer = await stripe.customers.del(customerId)
  return customer
}

export const createPrice = async (
  productId: string,
  unitAmount: number,
  currency: string = 'usd',
  interval: 'day' | 'week' | 'month' | 'year' = 'month'
) => {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: {
      interval
    }
  })

  return price
}

export const getPrice = async (priceId: string) => {
  const price = await stripe.prices.retrieve(priceId)
  return price
}

export const createProduct = async (
  name: string,
  description: string,
  metadata: Record<string, string> = {}
) => {
  const product = await stripe.products.create({
    name,
    description,
    metadata
  })

  return product
}

export const getProduct = async (productId: string) => {
  const product = await stripe.products.retrieve(productId)
  return product
}

export const updateProduct = async (
  productId: string,
  data: Stripe.ProductUpdateParams
) => {
  const product = await stripe.products.update(productId, data)
  return product
}

export const deleteProduct = async (productId: string) => {
  const product = await stripe.products.del(productId)
  return product
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