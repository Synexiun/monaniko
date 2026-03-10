import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subscriber = await db.subscriber.findUnique({ where: { id } })
    if (!subscriber) return errorResponse('Subscriber not found', 404)
    return jsonResponse(subscriber)
  } catch (e) {
    return errorResponse('Failed to fetch subscriber: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.email !== undefined) data.email = body.email
    if (body.firstName !== undefined) data.firstName = body.firstName
    if (body.lastName !== undefined) data.lastName = body.lastName
    if (body.segments !== undefined) data.segments = JSON.stringify(body.segments)
    if (body.source !== undefined) data.source = body.source
    if (body.isActive !== undefined) data.isActive = body.isActive

    const subscriber = await db.subscriber.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'subscriber', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(subscriber)
  } catch (e) {
    return errorResponse('Failed to update subscriber: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.subscriber.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'subscriber', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete subscriber: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
