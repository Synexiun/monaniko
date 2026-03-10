import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const search = sp.get('search')
    if (search) where.title = { contains: search }
    const type = sp.get('type')
    if (type) where.type = type
    const status = sp.get('status')
    if (status) where.status = status
    const channel = sp.get('channel')
    if (channel) where.channel = channel

    // Filter by month/year
    const month = sp.get('month')
    const year = sp.get('year')
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.scheduledAt = { gte: startDate, lte: endDate }
    }

    const [data, total] = await Promise.all([
      db.scheduledContent.findMany({ where, skip, take: limit, orderBy: { scheduledAt: 'asc' } }),
      db.scheduledContent.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch scheduled content: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const item = await db.scheduledContent.create({
      data: {
        title: body.title,
        type: body.type,
        scheduledAt: new Date(body.scheduledAt),
        status: body.status || 'scheduled',
        channel: body.channel || null,
        contentRef: body.contentRef || null,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'scheduled_content', entityId: item.id, action: 'create', details: JSON.stringify({ title: item.title }) },
    })

    return jsonResponse(item, 201)
  } catch (e) {
    return errorResponse('Failed to create scheduled content: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
