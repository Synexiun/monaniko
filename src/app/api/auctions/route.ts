import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { parsePagination, paginatedResponse, jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = parsePagination(sp)
    const where: Record<string, unknown> = {}
    const status = sp.get('status')
    if (status && status !== 'all') where.status = status
    const search = sp.get('search')
    if (search) where.artworkTitle = { contains: search }
    // Public: only show LIVE auctions unless admin requested all
    const publicOnly = sp.get('public') === 'true'
    if (publicOnly) where.status = 'LIVE'

    const [raw, total] = await Promise.all([
      db.auction.findMany({ where, skip, take: limit, orderBy: { endAt: 'asc' }, include: { _count: { select: { bids: true } } } }),
      db.auction.count({ where }),
    ])
    return paginatedResponse(raw, total, page, limit)
  } catch (e) {
    return errorResponse('Failed to fetch auctions: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const body = await req.json()
    const slug = body.slug || slugify(body.artworkTitle)
    const auction = await db.auction.create({
      data: {
        artworkId: body.artworkId || null,
        artworkTitle: body.artworkTitle,
        artworkImage: body.artworkImage || null,
        slug,
        startingBid: body.startingBid,
        reservePrice: body.reservePrice || null,
        status: body.status || 'DRAFT',
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        description: body.description || null,
        notes: body.notes || null,
      },
    })
    return jsonResponse(auction, 201)
  } catch (e) {
    return errorResponse('Failed to create auction: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
