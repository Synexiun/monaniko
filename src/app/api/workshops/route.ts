import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, parseSort, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { slugify } from '@/lib/utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const orderBy = parseSort(sp, ['title', 'date', 'createdAt', 'price', 'level'])

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) where.title = { contains: search }
    const level = sp.get('level')
    if (level) where.level = level
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true
    const timeframe = sp.get('timeframe')
    if (timeframe === 'upcoming') where.date = { gte: new Date() }
    if (timeframe === 'past') where.date = { lt: new Date() }

    const [data, total] = await Promise.all([
      db.workshop.findMany({ where, skip, take: limit, orderBy }),
      db.workshop.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch workshops: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const workshop = await db.workshop.create({
      data: {
        title: body.title,
        slug: body.slug || slugify(body.title),
        description: body.description || null,
        longDescription: body.longDescription || null,
        images: JSON.stringify(body.images || []),
        date: new Date(body.date),
        endDate: body.endDate ? new Date(body.endDate) : null,
        time: body.time || null,
        duration: body.duration || null,
        location: body.location || null,
        isOnline: body.isOnline || false,
        price: body.price,
        capacity: body.capacity,
        spotsLeft: body.spotsLeft ?? body.capacity,
        instructor: body.instructor || null,
        level: body.level || 'ALL_LEVELS',
        materials: JSON.stringify(body.materials || []),
        featured: body.featured || false,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'workshop', entityId: workshop.id, action: 'create', details: JSON.stringify({ title: workshop.title }) },
    })

    return jsonResponse(workshop, 201)
  } catch (e) {
    return errorResponse('Failed to create workshop: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
