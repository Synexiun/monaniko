import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.pressItem.findUnique({ where: { id } })
    if (!item) return errorResponse('Press item not found', 404)
    return jsonResponse(item)
  } catch (e) {
    return errorResponse('Failed to fetch press item: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.publication !== undefined) data.publication = body.publication
    if (body.date !== undefined) data.date = body.date ? new Date(body.date) : null
    if (body.url !== undefined) data.url = body.url
    if (body.excerpt !== undefined) data.excerpt = body.excerpt
    if (body.image !== undefined) data.image = body.image
    if (body.featured !== undefined) data.featured = body.featured

    const item = await db.pressItem.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'press', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(item)
  } catch (e) {
    return errorResponse('Failed to update press item: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.pressItem.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'press', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete press item: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
