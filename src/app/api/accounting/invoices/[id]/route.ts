import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/api-utils'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const invoice = await db.invoice.findUnique({ where: { id } })
  if (!invoice) return errorResponse('Invoice not found', 404)
  return jsonResponse(invoice)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  try {
    const body = await req.json()
    const { status, paidAt, notes, dueAt, lineItems, taxRate, clientName, clientEmail, clientAddress } = body

    let computedFields: Record<string, unknown> = {}
    if (lineItems) {
      const parsedItems = lineItems as { description: string; qty: number; unitPrice: number; amount: number }[]
      const subtotal = parsedItems.reduce((s, i) => s + i.amount, 0)
      const rate = parseFloat(taxRate ?? '0') / 100
      const tax = Math.round(subtotal * rate * 100) / 100
      computedFields = {
        lineItems: JSON.stringify(parsedItems),
        subtotal,
        taxRate: parseFloat(taxRate ?? '0'),
        tax,
        total: subtotal + tax,
      }
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(paidAt ? { paidAt: new Date(paidAt) } : {}),
        ...(status === 'PAID' && !paidAt ? { paidAt: new Date() } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(dueAt ? { dueAt: new Date(dueAt) } : {}),
        ...(clientName ? { clientName } : {}),
        ...(clientEmail ? { clientEmail } : {}),
        ...(clientAddress !== undefined ? { clientAddress: JSON.stringify(clientAddress) } : {}),
        ...computedFields,
      },
    })
    return jsonResponse(invoice)
  } catch (e) {
    console.error('Update invoice error:', e)
    return errorResponse('Failed to update invoice', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  try {
    await db.invoice.delete({ where: { id } })
    return jsonResponse({ success: true })
  } catch {
    return errorResponse('Failed to delete invoice', 500)
  }
}
