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
        { name: { contains: search } },
        { email: { contains: search } },
        { message: { contains: search } },
      ]
    }
    const type = sp.get('type')
    if (type) where.type = type
    const status = sp.get('status')
    if (status) where.status = status

    const [data, total] = await Promise.all([
      db.inquiry.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { artwork: { select: { id: true, title: true } } } }),
      db.inquiry.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch inquiries: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const inquiry = await db.inquiry.create({
      data: {
        type: body.type,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        message: body.message,
        artworkId: body.artworkId || null,
        budget: body.budget || null,
        status: body.status || 'NEW',
      },
    })

    await db.activityLog.create({
      data: { entityType: 'inquiry', entityId: inquiry.id, action: 'create', details: JSON.stringify({ name: inquiry.name, type: inquiry.type }) },
    })

    return jsonResponse(inquiry, 201)
  } catch (e) {
    return errorResponse('Failed to create inquiry: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
