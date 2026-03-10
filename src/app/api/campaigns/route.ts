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
    const status = sp.get('status')
    if (status) where.status = status

    const [data, total] = await Promise.all([
      db.campaign.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.campaign.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch campaigns: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const campaign = await db.campaign.create({
      data: {
        title: body.title,
        description: body.description || null,
        objective: body.objective || null,
        channels: JSON.stringify(body.channels || []),
        status: body.status || 'DRAFT',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        targetSegments: JSON.stringify(body.targetSegments || []),
        metrics: JSON.stringify(body.metrics || { impressions: 0, clicks: 0, conversions: 0, inquiries: 0, revenue: 0 }),
      },
    })

    await db.activityLog.create({
      data: { entityType: 'campaign', entityId: campaign.id, action: 'create', details: JSON.stringify({ title: campaign.title }) },
    })

    return jsonResponse(campaign, 201)
  } catch (e) {
    return errorResponse('Failed to create campaign: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
