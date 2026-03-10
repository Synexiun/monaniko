import { NextRequest } from 'next/server'
import { stripe, toCents } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { db } from '@/lib/db'

export interface CartItemPayload {
  id: string
  productId: string
  variantId?: string
  title: string
  image: string
  price: number
  quantity: number
  type: string
}

export interface PaymentIntentPayload {
  items: CartItemPayload[]
  customerEmail: string
  customerName: string
  customerPhone?: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  }
  promoCode?: string
}

const SHIPPING_THRESHOLD = 500  // free shipping above $500
const SHIPPING_FLAT = 25        // $25 flat shipping below threshold
const TAX_RATE = 0.0725         // 7.25% CA sales tax (adjust per jurisdiction)

export async function POST(req: NextRequest) {
  try {
    const body: PaymentIntentPayload = await req.json()
    const { items, customerEmail, customerName, customerPhone, shippingAddress, promoCode } = body

    if (!items?.length || !customerEmail || !customerName) {
      return errorResponse('Missing required fields', 400)
    }

    // Calculate base totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT

    // Apply promo code discount
    let discount = 0
    let validatedPromoCode = ''

    if (promoCode) {
      const promo = await db.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } })
      if (promo && promo.isActive) {
        const now = new Date()
        const withinWindow =
          (!promo.validFrom || promo.validFrom <= now) &&
          (!promo.validUntil || promo.validUntil >= now)
        const withinLimit = promo.maxUses === null || promo.usedCount < promo.maxUses
        const meetsMinimum = !promo.minPurchase || subtotal >= promo.minPurchase

        if (withinWindow && withinLimit && meetsMinimum) {
          if (promo.discountType === 'PERCENTAGE') {
            discount = Math.round(subtotal * (promo.discountValue / 100) * 100) / 100
          } else {
            discount = Math.min(promo.discountValue, subtotal)
          }
          validatedPromoCode = promo.code
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount)
    const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100
    const total = discountedSubtotal + shipping + tax

    // Create PaymentIntent with metadata for webhook processing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(total),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail,
      metadata: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        promoCode: validatedPromoCode,
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            title: i.title,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            type: i.type,
          }))
        ).slice(0, 490),
      },
      description: `Mona Niko Gallery — Order for ${customerName}`,
    })

    return jsonResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: { subtotal, discount, shipping, tax, total },
    })
  } catch (e) {
    console.error('PaymentIntent creation failed:', e)
    return errorResponse('Failed to create payment intent: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
