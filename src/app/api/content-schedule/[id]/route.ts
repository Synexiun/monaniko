import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.scheduledContent.findUnique({ where: { id } })
    if (!item) return errorResponse('Scheduled content not found', 404)
    return jsonResponse(item)
  } catch (e) {
    return errorResponse('Failed to fetch scheduled content: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.type !== undefined) data.type = body.type
    if (body.scheduledAt !== undefined) data.scheduledAt = new Date(body.scheduledAt)
    if (body.status !== undefined) data.status = body.status
    if (body.channel !== undefined) data.channel = body.channel
    if (body.contentRef !== undefined) data.contentRef = body.contentRef

    const item = await db.scheduledContent.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'scheduled_content', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(item)
  } catch (e) {
    return errorResponse('Failed to update scheduled content: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.scheduledContent.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'scheduled_content', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete scheduled content: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
