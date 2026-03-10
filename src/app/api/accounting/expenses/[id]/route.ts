import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense) return errorResponse('Expense not found', 404)
  return jsonResponse(expense)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  try {
    const body = await req.json()
    const { date, vendor, category, description, amount, receiptUrl, notes } = body

    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(date ? { date: new Date(date) } : {}),
        ...(vendor ? { vendor } : {}),
        ...(category ? { category } : {}),
        description: description ?? undefined,
        ...(amount !== undefined ? { amount: parseFloat(amount) } : {}),
        receiptUrl: receiptUrl ?? undefined,
        notes: notes ?? undefined,
      },
    })
    return jsonResponse(expense)
  } catch (e) {
    console.error('Update expense error:', e)
    return errorResponse('Failed to update expense', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  try {
    await db.expense.delete({ where: { id } })
    return jsonResponse({ success: true })
  } catch {
    return errorResponse('Failed to delete expense', 500)
  }
}
