import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'
import { sendAuctionOutbid, sendAuctionNewBid } from '@/lib/resend'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bids = await db.auctionBid.findMany({
      where: { auctionId: id },
      orderBy: { amount: 'desc' },
    })
    return jsonResponse(bids)
  } catch (e) {
    return errorResponse('Failed to fetch bids: ' + (e instanceof Error ? e.message : ''), 500)
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { bidderName, bidderEmail, amount } = body

    if (!bidderName || !bidderEmail || !amount) {
      return errorResponse('Name, email and bid amount are required', 400)
    }

    const auction = await db.auction.findUnique({ where: { id }, include: { bids: { orderBy: { amount: 'desc' }, take: 1 } } })
    if (!auction) return errorResponse('Auction not found', 404)
    if (auction.status !== 'LIVE') return errorResponse('Auction is not live', 400)
    if (new Date() > auction.endAt) return errorResponse('Auction has ended', 400)

    const minBid = (auction.currentBid ?? auction.startingBid) + 1
    if (amount < minBid) {
      return errorResponse(`Minimum bid is $${minBid.toLocaleString()}`, 400)
    }

    // Get previous highest bidder before creating new bid
    const prevHighest = auction.bids[0]

    const bid = await db.auctionBid.create({
      data: { auctionId: id, bidderName, bidderEmail, amount },
    })

    // Update auction current bid
    await db.auction.update({ where: { id }, data: { currentBid: amount } })

    // Email outbid notification to previous highest bidder
    if (prevHighest && prevHighest.bidderEmail !== bidderEmail) {
      sendAuctionOutbid({
        bidderName: prevHighest.bidderName,
        bidderEmail: prevHighest.bidderEmail,
        artworkTitle: auction.artworkTitle,
        previousBid: prevHighest.amount,
        newBid: amount,
        auctionSlug: auction.slug,
        endAt: auction.endAt,
      }).catch(() => {})
    }

    // Email admin of new bid
    sendAuctionNewBid({
      bidderName,
      bidderEmail,
      artworkTitle: auction.artworkTitle,
      amount,
      auctionId: auction.id,
    }).catch(() => {})

    return jsonResponse(bid, 201)
  } catch (e) {
    return errorResponse('Failed to place bid: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
