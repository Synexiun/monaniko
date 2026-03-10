import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const workshop = await db.workshop.findUnique({ where: { id } })
    if (!workshop) return errorResponse('Workshop not found', 404)
    return jsonResponse(workshop)
  } catch (e) {
    return errorResponse('Failed to fetch workshop: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.slug !== undefined) data.slug = body.slug
    if (body.description !== undefined) data.description = body.description
    if (body.longDescription !== undefined) data.longDescription = body.longDescription
    if (body.images !== undefined) data.images = JSON.stringify(body.images)
    if (body.date !== undefined) data.date = new Date(body.date)
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.time !== undefined) data.time = body.time
    if (body.duration !== undefined) data.duration = body.duration
    if (body.location !== undefined) data.location = body.location
    if (body.isOnline !== undefined) data.isOnline = body.isOnline
    if (body.price !== undefined) data.price = body.price
    if (body.capacity !== undefined) data.capacity = body.capacity
    if (body.spotsLeft !== undefined) data.spotsLeft = body.spotsLeft
    if (body.instructor !== undefined) data.instructor = body.instructor
    if (body.level !== undefined) data.level = body.level
    if (body.materials !== undefined) data.materials = JSON.stringify(body.materials)
    if (body.featured !== undefined) data.featured = body.featured

    const workshop = await db.workshop.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'workshop', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(workshop)
  } catch (e) {
    return errorResponse('Failed to update workshop: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const workshop = await db.workshop.findUnique({ where: { id } })
    if (!workshop) return errorResponse('Workshop not found', 404)
    await db.workshop.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'workshop', entityId: id, action: 'delete', details: JSON.stringify({ title: workshop.title }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete workshop: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
