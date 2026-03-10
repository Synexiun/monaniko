import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}
function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}
function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

async function getRevenue(from: Date, to: Date): Promise<number> {
  const orders = await db.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: from, lte: to } },
    select: { total: true },
  })
  return orders.reduce((s, o) => s + o.total, 0)
}

async function getExpenses(from: Date, to: Date): Promise<number> {
  const expenses = await db.expense.findMany({
    where: { date: { gte: from, lte: to } },
    select: { amount: true },
  })
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
    const lastMonthEnd = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1))
    const ytdStart = startOfYear(now)

    const [
      thisMonthRevenue,
      thisMonthExpenses,
      lastMonthRevenue,
      lastMonthExpenses,
      ytdRevenue,
      ytdExpenses,
    ] = await Promise.all([
      getRevenue(thisMonthStart, thisMonthEnd),
      getExpenses(thisMonthStart, thisMonthEnd),
      getRevenue(lastMonthStart, lastMonthEnd),
      getExpenses(lastMonthStart, lastMonthEnd),
      getRevenue(ytdStart, now),
      getExpenses(ytdStart, now),
    ])

    // Last 6 months P&L
    const monthlyPL = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i))
        return Promise.all([getRevenue(startOfMonth(d), endOfMonth(d)), getExpenses(startOfMonth(d), endOfMonth(d))]).then(
          ([rev, exp]) => ({
            month: monthLabel(d),
            revenue: rev,
            expenses: exp,
            profit: rev - exp,
          })
        )
      })
    )

    // Expense breakdown by category (YTD)
    const allExpenses = await db.expense.findMany({
      where: { date: { gte: ytdStart } },
      select: { category: true, amount: true },
    })
    const byCategory: Record<string, number> = {}
    for (const e of allExpenses) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    }
    const expensesByCategory = Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    // Outstanding invoices
    const outstandingInvoices = await db.invoice.findMany({
      where: { status: { in: ['SENT', 'OVERDUE'] } },
      select: { total: true },
    })

    // Tax liability (7.25% CA rate on paid orders YTD)
    const paidOrdersYtd = await db.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: ytdStart } },
      select: { tax: true },
    })
    const taxLiability = paidOrdersYtd.reduce((s, o) => s + (o.tax ?? 0), 0)

    return NextResponse.json({
      thisMonth: {
        revenue: thisMonthRevenue,
        expenses: thisMonthExpenses,
        profit: thisMonthRevenue - thisMonthExpenses,
      },
      lastMonth: {
        revenue: lastMonthRevenue,
        expenses: lastMonthExpenses,
        profit: lastMonthRevenue - lastMonthExpenses,
      },
      ytd: {
        revenue: ytdRevenue,
        expenses: ytdExpenses,
        profit: ytdRevenue - ytdExpenses,
      },
      taxLiability,
      monthlyPL,
      expensesByCategory,
      outstandingInvoices: {
        count: outstandingInvoices.length,
        total: outstandingInvoices.reduce((s, i) => s + i.total, 0),
      },
    })
  } catch (e) {
    console.error('Accounting summary error:', e)
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 })
  }
}
