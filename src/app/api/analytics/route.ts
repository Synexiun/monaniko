import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
      totalOrders,
      totalRevenue,
      totalInquiries,
      totalSubscribers,
      thisMonthOrders,
      lastMonthOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      topArtworksByInquiries,
      campaignMetrics,
      monthlyRevenue,
      collectionCounts,
    ] = await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.inquiry.count(),
      db.subscriber.count({ where: { isActive: true } }),
      db.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      db.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: thisMonthStart } } }),
      db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.inquiry.groupBy({ by: ['artworkId'], _count: true, where: { artworkId: { not: null } }, orderBy: { _count: { artworkId: 'desc' } }, take: 5 }),
      db.campaign.findMany({ select: { id: true, title: true, metrics: true, status: true } }),
      // Get last 6 months of order totals
      db.order.findMany({ select: { total: true, createdAt: true }, where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } }),
      db.collection.findMany({ select: { id: true, title: true, _count: { select: { artworks: true } } } }),
    ])

    // Build monthly revenue breakdown
    const monthlyData: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyData[key] = 0
    }
    for (const order of monthlyRevenue) {
      const key = order.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (monthlyData[key] !== undefined) monthlyData[key] += order.total
    }

    // Enrich top artworks with titles
    const artworkIds = topArtworksByInquiries.map(a => a.artworkId).filter(Boolean) as string[]
    const artworkDetails = artworkIds.length > 0
      ? await db.artwork.findMany({ where: { id: { in: artworkIds } }, select: { id: true, title: true } })
      : []
    const artworkTitleMap = Object.fromEntries(artworkDetails.map(a => [a.id, a.title]))

    const enrichedTopArtworks = topArtworksByInquiries.map(a => ({
      artworkId: a.artworkId,
      title: artworkTitleMap[a.artworkId as string] || `Artwork #${a.artworkId}`,
      inquiryCount: a._count,
    }))

    // Inquiry type breakdown
    const inquiryTypeBreakdown = await db.inquiry.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { type: 'desc' } },
    })

    return jsonResponse({
      overview: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalInquiries,
        totalSubscribers,
      },
      trends: {
        orders: { current: thisMonthOrders, previous: lastMonthOrders },
        revenue: { current: thisMonthRevenue._sum.total || 0, previous: lastMonthRevenue._sum.total || 0 },
      },
      topArtworksByInquiries: enrichedTopArtworks,
      campaignMetrics,
      monthlyRevenue: Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue })),
      collectionPerformance: collectionCounts.map(c => ({ id: c.id, title: c.title, artworkCount: c._count.artworks })),
      inquiryTypeBreakdown: inquiryTypeBreakdown.map(i => ({ type: i.type, count: i._count })),
    })
  } catch (e) {
    return errorResponse('Failed to fetch analytics: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
