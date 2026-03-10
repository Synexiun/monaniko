import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/resend'
import type Stripe from 'stripe'

// Disable body parsing — Stripe requires the raw body for signature verification
export const runtime = 'nodejs'

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${year}-${random}`
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const meta = paymentIntent.metadata

  // Parse cart items from metadata
  let cartItems: Array<{
    productId: string
    variantId?: string
    title: string
    image: string
    price: number
    quantity: number
    type: string
  }> = []

  try {
    cartItems = JSON.parse(meta.cartItems || '[]')
  } catch {
    console.error('Failed to parse cartItems from metadata')
  }

  const shippingAddress = (() => {
    try { return JSON.parse(meta.shippingAddress || '{}') } catch { return {} }
  })()

  // Generate unique order number (retry on collision)
  let orderNumber = generateOrderNumber()
  let attempts = 0
  while (attempts < 5) {
    const existing = await db.order.findUnique({ where: { orderNumber } })
    if (!existing) break
    orderNumber = generateOrderNumber()
    attempts++
  }

  // Create the order
  const order = await db.order.create({
    data: {
      orderNumber,
      customerEmail: meta.customerEmail,
      customerName: meta.customerName,
      customerPhone: meta.customerPhone || null,
      shippingAddress: JSON.stringify(shippingAddress),
      subtotal: parseFloat(meta.subtotal || '0'),
      tax: parseFloat(meta.tax || '0'),
      shipping: parseFloat(meta.shipping || '0'),
      total: parseFloat(meta.total || '0'),
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentIntentId: paymentIntent.id,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId || null,
          variantId: item.variantId || null,
          title: item.title,
          image: item.image || null,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  })

  // Log activity
  await db.activityLog.create({
    data: {
      entityType: 'order',
      entityId: order.id,
      action: 'create',
      details: JSON.stringify({ orderNumber, total: order.total, paymentIntentId: paymentIntent.id }),
    },
  })

  // Send order confirmation email
  try {
    await sendOrderConfirmation({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image || undefined,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: shippingAddress,
    })
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError)
    // Don't throw — order is still created successfully
  }

  console.log(`Order ${orderNumber} created for ${meta.customerEmail}`)
  return order
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Log failed payment attempts for monitoring
  console.error(`Payment failed for ${paymentIntent.metadata?.customerEmail}: ${paymentIntent.last_payment_error?.message}`)
  // Could send an "payment failed" email here
}

async function handleRefundCreated(charge: Stripe.Charge) {
  if (!charge.payment_intent) return

  const order = await db.order.findFirst({
    where: { paymentIntentId: charge.payment_intent as string },
  })

  if (!order) return

  const refundAmount = (charge.amount_refunded || 0) / 100
  const isFullRefund = charge.amount_refunded >= charge.amount

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: isFullRefund ? 'REFUNDED' : 'PAID',
      status: isFullRefund ? 'CANCELLED' : order.status,
    },
  })

  await db.activityLog.create({
    data: {
      entityType: 'order',
      entityId: order.id,
      action: 'update',
      details: JSON.stringify({ refundAmount, isFullRefund }),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'charge.refunded':
        await handleRefundCreated(event.data.object as Stripe.Charge)
        break
      default:
        // Unhandled event type — just acknowledge
        break
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
