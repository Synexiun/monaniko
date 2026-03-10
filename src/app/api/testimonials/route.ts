import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) where.name = { contains: search }
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true

    const [data, total] = await Promise.all([
      db.testimonial.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.testimonial.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch testimonials: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const testimonial = await db.testimonial.create({
      data: {
        name: body.name,
        role: body.role || null,
        text: body.text,
        image: body.image || null,
        rating: body.rating || null,
        featured: body.featured || false,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'testimonial', entityId: testimonial.id, action: 'create', details: JSON.stringify({ name: testimonial.name }) },
    })

    return jsonResponse(testimonial, 201)
  } catch (e) {
    return errorResponse('Failed to create testimonial: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
