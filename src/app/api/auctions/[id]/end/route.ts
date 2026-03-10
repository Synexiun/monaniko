import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { requireAuth } from '@/lib/auth'
import { sendAuctionWon } from '@/lib/resend'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError
  try {
    const { id } = await params
    const auction = await db.auction.findUnique({
      where: { id },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    })
    if (!auction) return errorResponse('Auction not found', 404)
    if (auction.status === 'ENDED') return errorResponse('Auction already ended', 400)

    const winningBid = auction.bids[0]
    const updateData: Record<string, unknown> = { status: 'ENDED' }

    if (winningBid) {
      updateData.winnerBidId = winningBid.id
      updateData.winnerEmail = winningBid.bidderEmail
      updateData.winnerName = winningBid.bidderName
      updateData.currentBid = winningBid.amount

      await db.auctionBid.update({ where: { id: winningBid.id }, data: { isWinning: true } })

      // Send winner email
      sendAuctionWon({
        winnerName: winningBid.bidderName,
        winnerEmail: winningBid.bidderEmail,
        artworkTitle: auction.artworkTitle,
        winningBid: winningBid.amount,
        auctionSlug: auction.slug,
      }).catch(() => {})
    }

    const updated = await db.auction.update({ where: { id }, data: updateData })
    return jsonResponse(updated)
  } catch (e) {
    return errorResponse('Failed to end auction: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
