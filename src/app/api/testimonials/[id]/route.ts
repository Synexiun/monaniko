import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const testimonial = await db.testimonial.findUnique({ where: { id } })
    if (!testimonial) return errorResponse('Testimonial not found', 404)
    return jsonResponse(testimonial)
  } catch (e) {
    return errorResponse('Failed to fetch testimonial: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name
    if (body.role !== undefined) data.role = body.role
    if (body.text !== undefined) data.text = body.text
    if (body.image !== undefined) data.image = body.image
    if (body.rating !== undefined) data.rating = body.rating
    if (body.featured !== undefined) data.featured = body.featured

    const testimonial = await db.testimonial.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'testimonial', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(testimonial)
  } catch (e) {
    return errorResponse('Failed to update testimonial: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    await db.testimonial.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'testimonial', entityId: id, action: 'delete' },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete testimonial: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
