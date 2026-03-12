import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

function safeJson<T>(val: unknown, fallback: T): T {
  if (typeof val !== 'string') return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const artwork = await db.artwork.findUnique({ where: { id }, include: { collection: true, products: true, inquiries: true } })
    if (!artwork) return errorResponse('Artwork not found', 404)
    return jsonResponse({
      ...artwork,
      images: safeJson(artwork.images, []),
      tags: safeJson(artwork.tags, []),
      dimensions: safeJson(artwork.dimensions, null),
    })
  } catch (e) {
    return errorResponse('Failed to fetch artwork: ' + (e instanceof Error ? e.message : ''), 500)
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
    if (body.images !== undefined) data.images = JSON.stringify(body.images)
    if (body.category !== undefined) data.category = String(body.category).toUpperCase()
    if (body.medium !== undefined) data.medium = body.medium
    if (body.dimensions !== undefined) data.dimensions = JSON.stringify(body.dimensions)
    if (body.year !== undefined) data.year = body.year
    if (body.status !== undefined) data.status = String(body.status).toUpperCase()
    if (body.price !== undefined) data.price = body.price
    if (body.priceOnInquiry !== undefined) data.priceOnInquiry = body.priceOnInquiry
    if (body.collectionId !== undefined) data.collectionId = body.collectionId
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags)
    if (body.featured !== undefined) data.featured = body.featured
    if (body.framing !== undefined) data.framing = body.framing
    if (body.certificate !== undefined) data.certificate = body.certificate

    const artwork = await db.artwork.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'artwork', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(artwork)
  } catch (e) {
    return errorResponse('Failed to update artwork: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const artwork = await db.artwork.findUnique({ where: { id } })
    if (!artwork) return errorResponse('Artwork not found', 404)

    await db.artwork.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'artwork', entityId: id, action: 'delete', details: JSON.stringify({ title: artwork.title }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete artwork: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
