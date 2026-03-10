import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse, parsePagination } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = req.nextUrl
  const { page, limit, skip } = parsePagination(searchParams)
  const category = searchParams.get('category')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (fromDate || toDate) {
    where.date = {
      ...(fromDate ? { gte: new Date(fromDate) } : {}),
      ...(toDate ? { lte: new Date(toDate + 'T23:59:59') } : {}),
    }
  }

  const [expenses, total] = await Promise.all([
    db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    db.expense.count({ where }),
  ])

  return jsonResponse({ expenses, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { date, vendor, category, description, amount, receiptUrl, notes } = body

    if (!date || !vendor || !category || amount === undefined) {
      return errorResponse('date, vendor, category, and amount are required', 400)
    }

    const expense = await db.expense.create({
      data: {
        date: new Date(date),
        vendor,
        category,
        description: description || null,
        amount: parseFloat(amount),
        receiptUrl: receiptUrl || null,
        notes: notes || null,
      },
    })

    return jsonResponse(expense, 201)
  } catch (e) {
    console.error('Create expense error:', e)
    return errorResponse('Failed to create expense', 500)
  }
}
