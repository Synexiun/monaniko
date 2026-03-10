import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { publication: { contains: search } },
      ]
    }
    const featured = sp.get('featured')
    if (featured === 'true') where.featured = true

    const [data, total] = await Promise.all([
      db.pressItem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.pressItem.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch press items: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await db.pressItem.create({
      data: {
        title: body.title,
        publication: body.publication || null,
        date: body.date ? new Date(body.date) : null,
        url: body.url || null,
        excerpt: body.excerpt || null,
        image: body.image || null,
        featured: body.featured || false,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'press', entityId: item.id, action: 'create', details: JSON.stringify({ title: item.title }) },
    })

    return jsonResponse(item, 201)
  } catch (e) {
    return errorResponse('Failed to create press item: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
