import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

/** Convert a dollar amount to Stripe cents */
export const toCents = (dollars: number) => Math.round(dollars * 100)

/** Convert Stripe cents to dollars */
export const toDollars = (cents: number) => cents / 100
