import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { slugify } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) where.title = { contains: search }
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true

    const [data, total] = await Promise.all([
      db.collection.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { _count: { select: { artworks: true } } } }),
      db.collection.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch collections: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const collection = await db.collection.create({
      data: {
        title: body.title,
        slug: body.slug || slugify(body.title),
        description: body.description || null,
        coverImage: body.coverImage || null,
        featured: body.featured || false,
        year: body.year || null,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'collection', entityId: collection.id, action: 'create', details: JSON.stringify({ title: collection.title }) },
    })

    return jsonResponse(collection, 201)
  } catch (e) {
    return errorResponse('Failed to create collection: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
