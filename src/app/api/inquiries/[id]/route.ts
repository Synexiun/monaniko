import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const inquiry = await db.inquiry.findUnique({ where: { id }, include: { artwork: true } })
    if (!inquiry) return errorResponse('Inquiry not found', 404)
    return jsonResponse(inquiry)
  } catch (e) {
    return errorResponse('Failed to fetch inquiry: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.status !== undefined) data.status = body.status
    if (body.type !== undefined) data.type = body.type
    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.phone !== undefined) data.phone = body.phone
    if (body.message !== undefined) data.message = body.message
    if (body.budget !== undefined) data.budget = body.budget

    const inquiry = await db.inquiry.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'inquiry', entityId: id, action: 'update', details: JSON.stringify(data) },
    })

    return jsonResponse(inquiry)
  } catch (e) {
    return errorResponse('Failed to update inquiry: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.inquiry.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'inquiry', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete inquiry: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
