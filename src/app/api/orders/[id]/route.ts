import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({ where: { id }, include: { items: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } } })
    if (!order) return errorResponse('Order not found', 404)
    return jsonResponse(order)
  } catch (e) {
    return errorResponse('Failed to fetch order: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.status !== undefined) data.status = body.status
    if (body.paymentStatus !== undefined) data.paymentStatus = body.paymentStatus
    if (body.notes !== undefined) data.notes = body.notes
    if (body.shippingAddress !== undefined) data.shippingAddress = JSON.stringify(body.shippingAddress)

    const order = await db.order.update({ where: { id }, data, include: { items: true } })

    await db.activityLog.create({
      data: { entityType: 'order', entityId: id, action: 'update', details: JSON.stringify(data) },
    })

    return jsonResponse(order)
  } catch (e) {
    return errorResponse('Failed to update order: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const order = await db.order.findUnique({ where: { id } })
    if (!order) return errorResponse('Order not found', 404)
    await db.order.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'order', entityId: id, action: 'delete', details: JSON.stringify({ orderNumber: order.orderNumber }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete order: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
