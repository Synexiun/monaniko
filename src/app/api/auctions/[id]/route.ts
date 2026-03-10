import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // find by id or slug
    const auction = await db.auction.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 50 },
        _count: { select: { bids: true } },
      },
    })
    if (!auction) return errorResponse('Auction not found', 404)
    return jsonResponse(auction)
  } catch (e) {
    return errorResponse('Failed to fetch auction: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.artworkTitle !== undefined) data.artworkTitle = body.artworkTitle
    if (body.artworkImage !== undefined) data.artworkImage = body.artworkImage
    if (body.artworkId !== undefined) data.artworkId = body.artworkId
    if (body.startingBid !== undefined) data.startingBid = body.startingBid
    if (body.reservePrice !== undefined) data.reservePrice = body.reservePrice || null
    if (body.status !== undefined) data.status = body.status
    if (body.startAt !== undefined) data.startAt = new Date(body.startAt)
    if (body.endAt !== undefined) data.endAt = new Date(body.endAt)
    if (body.description !== undefined) data.description = body.description
    if (body.notes !== undefined) data.notes = body.notes
    // Set winner when ending
    if (body.winnerBidId !== undefined) {
      const winningBid = await db.auctionBid.findUnique({ where: { id: body.winnerBidId } })
      if (winningBid) {
        data.winnerBidId = winningBid.id
        data.winnerEmail = winningBid.bidderEmail
        data.winnerName = winningBid.bidderName
        data.currentBid = winningBid.amount
        await db.auctionBid.update({ where: { id: winningBid.id }, data: { isWinning: true } })
      }
    }
    const auction = await db.auction.update({ where: { id }, data })
    return jsonResponse(auction)
  } catch (e) {
    return errorResponse('Failed to update auction: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    await db.auction.delete({ where: { id } })
    return jsonResponse({ success: true })
  } catch (e) {
    return errorResponse('Failed to delete auction: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
