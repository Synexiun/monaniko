import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      activeInquiries,
      lastMonthInquiries,
      totalSubscribers,
      lastMonthSubscribers,
      recentOrders,
      recentInquiries,
      upcomingWorkshops,
      lowStockVariants,
      recentActivity,
    ] = await Promise.all([
      db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: thisMonthStart } } }),
      db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      db.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.inquiry.count({ where: { status: { in: ['NEW', 'CONTACTED', 'IN_PROGRESS'] } } }),
      db.inquiry.count({ where: { status: { in: ['NEW', 'CONTACTED', 'IN_PROGRESS'] }, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      db.subscriber.count({ where: { isActive: true } }),
      db.subscriber.count({ where: { isActive: true, createdAt: { lte: lastMonthEnd } } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }),
      db.inquiry.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { artwork: { select: { title: true } } } }),
      db.workshop.findMany({ where: { date: { gte: now } }, take: 3, orderBy: { date: 'asc' } }),
      db.productVariant.findMany({ where: { stock: { lte: 5, gt: 0 } }, take: 5, include: { product: { select: { title: true } } } }),
      db.activityLog.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
    ])

    const currentRevenue = totalRevenue._sum.total || 0
    const prevRevenue = lastMonthRevenue._sum.total || 0

    function calcTrend(current: number, previous: number) {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    return jsonResponse({
      stats: {
        revenue: { value: currentRevenue, trend: calcTrend(currentRevenue, prevRevenue) },
        orders: { value: totalOrders, trend: calcTrend(totalOrders, lastMonthOrders) },
        inquiries: { value: activeInquiries, trend: calcTrend(activeInquiries, lastMonthInquiries) },
        subscribers: { value: totalSubscribers, trend: calcTrend(totalSubscribers, lastMonthSubscribers) },
      },
      recentOrders,
      recentInquiries,
      upcomingWorkshops,
      lowStockVariants,
      recentActivity,
    })
  } catch (e) {
    return errorResponse('Failed to fetch dashboard data: ' + (e instanceof Error ? e.message : ''), 500)
  }
}
