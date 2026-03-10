import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const collection = await db.collection.findUnique({ where: { id }, include: { artworks: true, _count: { select: { artworks: true } } } })
    if (!collection) return errorResponse('Collection not found', 404)
    return jsonResponse(collection)
  } catch (e) {
    return errorResponse('Failed to fetch collection: ' + (e instanceof Error ? e.message : ''), 500)
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
    if (body.coverImage !== undefined) data.coverImage = body.coverImage
    if (body.featured !== undefined) data.featured = body.featured
    if (body.year !== undefined) data.year = body.year

    // Handle artwork assignment
    if (body.artworkIds !== undefined) {
      // Remove all artworks from this collection first
      await db.artwork.updateMany({ where: { collectionId: id }, data: { collectionId: null } })
      // Assign new artworks
      if (body.artworkIds.length > 0) {
        await db.artwork.updateMany({ where: { id: { in: body.artworkIds } }, data: { collectionId: id } })
      }
    }

    const collection = await db.collection.update({ where: { id }, data })

    await db.activityLog.create({
      data: { entityType: 'collection', entityId: id, action: 'update', details: JSON.stringify(Object.keys(data)) },
    })

    return jsonResponse(collection)
  } catch (e) {
    return errorResponse('Failed to update collection: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const collection = await db.collection.findUnique({ where: { id } })
    if (!collection) return errorResponse('Collection not found', 404)

    await db.artwork.updateMany({ where: { collectionId: id }, data: { collectionId: null } })
    await db.collection.delete({ where: { id } })

    await db.activityLog.create({
      data: { entityType: 'collection', entityId: id, action: 'delete', details: JSON.stringify({ title: collection.title }) },
    })

    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete collection: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
