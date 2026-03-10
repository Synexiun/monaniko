import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, parseSort, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const orderBy = parseSort(sp, ['title', 'createdAt', 'year', 'price', 'status'])

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { contains: search } },
        { medium: { contains: search } },
      ]
    }
    const status = sp.get('status')
    if (status) where.status = status
    const category = sp.get('category')
    if (category) where.category = category
    const collectionId = sp.get('collectionId')
    if (collectionId) where.collectionId = collectionId
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true

    const [data, total] = await Promise.all([
      db.artwork.findMany({ where, skip, take: limit, orderBy, include: { collection: true } }),
      db.artwork.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch artworks: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slug = body.slug || slugify(body.title)
    const artwork = await db.artwork.create({
      data: {
        title: body.title,
        slug,
        description: body.description || null,
        images: JSON.stringify(body.images || []),
        category: body.category,
        medium: body.medium || null,
        dimensions: body.dimensions ? JSON.stringify(body.dimensions) : null,
        year: body.year || null,
        status: body.status || 'AVAILABLE',
        price: body.price || null,
        priceOnInquiry: body.priceOnInquiry || false,
        collectionId: body.collectionId || null,
        tags: JSON.stringify(body.tags || []),
        featured: body.featured || false,
        framing: body.framing || null,
        certificate: body.certificate || null,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'artwork', entityId: artwork.id, action: 'create', details: JSON.stringify({ title: artwork.title }) },
    })

    return jsonResponse(artwork, 201)
  } catch (e) {
    return errorResponse('Failed to create artwork: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
