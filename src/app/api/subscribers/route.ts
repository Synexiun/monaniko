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
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ]
    }
    const segment = sp.get('segment')
    if (segment) where.segments = { contains: segment }
    const active = sp.get('active')
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false

    const [data, total] = await Promise.all([
      db.subscriber.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.subscriber.count({ where }),
    ])

    // CSV export data
    const exportCsv = sp.get('export') === 'csv'
    if (exportCsv) {
      const allData = await db.subscriber.findMany({ where, orderBy: { createdAt: 'desc' } })
      const csv = [
        'Email,First Name,Last Name,Segments,Active,Created At',
        ...allData.map(s =>
          `"${s.email}","${s.firstName || ''}","${s.lastName || ''}","${s.segments}","${s.isActive}","${s.createdAt.toISOString()}"`
        ),
      ].join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=subscribers.csv',
        },
      })
    }

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch subscribers: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return errorResponse('Valid email is required', 400)
    }
    const subscriber = await db.subscriber.create({
      data: {
        email: body.email,
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        segments: JSON.stringify(body.segments || []),
        source: body.source || null,
        isActive: body.isActive ?? true,
      },
    })

    await db.activityLog.create({
      data: { entityType: 'subscriber', entityId: subscriber.id, action: 'create', details: JSON.stringify({ email: subscriber.email }) },
    })

    return jsonResponse(subscriber, 201)
  } catch (e) {
    return errorResponse('Failed to create subscriber: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
