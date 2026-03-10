import { NextRequest } from 'next/server'
import { stripe, toCents } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

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
}

const SHIPPING_THRESHOLD = 500  // free shipping above $500
const SHIPPING_FLAT = 25        // $25 flat shipping below threshold
const TAX_RATE = 0.0725         // 7.25% CA sales tax (adjust per jurisdiction)

export async function POST(req: NextRequest) {
  try {
    const body: PaymentIntentPayload = await req.json()
    const { items, customerEmail, customerName, customerPhone, shippingAddress } = body

    if (!items?.length || !customerEmail || !customerName) {
      return errorResponse('Missing required fields', 400)
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const total = subtotal + shipping + tax

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
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        shippingAddress: JSON.stringify(shippingAddress),
        // Store cart items in metadata (Stripe has 500 char limit per value — chunk if needed)
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
        ).slice(0, 490), // Stripe metadata value limit
      },
      description: `Mona Niko Gallery — Order for ${customerName}`,
    })

    return jsonResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: { subtotal, shipping, tax, total },
    })
  } catch (e) {
    console.error('PaymentIntent creation failed:', e)
    return errorResponse('Failed to create payment intent: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
