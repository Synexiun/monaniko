import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, jsonResponse, errorResponse } from '@/lib/api-utils'
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
        { title: { contains: search } },
        { description: { contains: search } },
        { ticketNumber: { contains: search } },
      ]
    }
    const status = sp.get('status')
    if (status && status !== 'all') where.status = status
    const category = sp.get('category')
    if (category && category !== 'all') where.category = category
    const priority = sp.get('priority')
    if (priority && priority !== 'all') where.priority = priority

    const [data, total, counts] = await Promise.all([
      db.supportTicket.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.supportTicket.count({ where }),
      db.supportTicket.groupBy({ by: ['status'], _count: { status: true } }),
    ])

    const statusCounts: Record<string, number> = { all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 }
    counts.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + c._count.status })
    statusCounts.all = total

    return jsonResponse({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts: statusCounts,
    })
  } catch (e) {
    return errorResponse('Failed to fetch tickets: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    if (!body.title || !body.description) {
      return errorResponse('title and description are required', 400)
    }

    const year = new Date().getFullYear()
    const count = await db.supportTicket.count()
    const ticketNumber = `TKT-${year}-${String(count + 1).padStart(4, '0')}`

    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        title: body.title,
        description: body.description,
        category: body.category || 'general',
        priority: body.priority || 'medium',
        status: 'open',
        pageContext: body.pageContext || null,
      },
    })

    return jsonResponse(ticket, 201)
  } catch (e) {
    return errorResponse('Failed to create ticket: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
