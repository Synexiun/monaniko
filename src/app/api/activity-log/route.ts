import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)

    const where: Record<string, unknown> = {}
    const entityType = sp.get('entityType')
    if (entityType) where.entityType = entityType
    const action = sp.get('action')
    if (action) where.action = action

    const [data, total] = await Promise.all([
      db.activityLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      db.activityLog.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch activity log: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
