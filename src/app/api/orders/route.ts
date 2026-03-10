import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, parseSort, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const orderBy = parseSort(sp, ['createdAt', 'total', 'orderNumber', 'status'])

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ]
    }
    const status = sp.get('status')
    if (status) where.status = status
    const paymentStatus = sp.get('paymentStatus')
    if (paymentStatus) where.paymentStatus = paymentStatus
    const dateFrom = sp.get('dateFrom')
    const dateTo = sp.get('dateTo')
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo)
    }

    const [data, total] = await Promise.all([
      db.order.findMany({ where, skip, take: limit, orderBy, include: { items: true } }),
      db.order.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch orders: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${String(orderCount + 1001).padStart(4, '0')}`

    const order = await db.order.create({
      data: {
        orderNumber,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone || null,
        shippingAddress: body.shippingAddress ? JSON.stringify(body.shippingAddress) : null,
        subtotal: body.subtotal,
        tax: body.tax || 0,
        shipping: body.shipping || 0,
        total: body.total,
        status: body.status || 'PENDING',
        paymentStatus: body.paymentStatus || 'PENDING',
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: { productId?: string; variantId?: string; title: string; image?: string; price: number; quantity?: number }) => ({
            productId: item.productId || null,
            variantId: item.variantId || null,
            title: item.title,
            image: item.image || null,
            price: item.price,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: { items: true },
    })

    await db.activityLog.create({
      data: { entityType: 'order', entityId: order.id, action: 'create', details: JSON.stringify({ orderNumber }) },
    })

    return jsonResponse(order, 201)
  } catch (e) {
    return errorResponse('Failed to create order: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
