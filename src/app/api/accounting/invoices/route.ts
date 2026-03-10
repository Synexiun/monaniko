import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse, parsePagination } from '@/lib/api-utils'

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `INV-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = req.nextUrl
  const { page, limit, skip } = parsePagination(searchParams)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({ where, orderBy: { issuedAt: 'desc' }, skip, take: limit }),
    db.invoice.count({ where }),
  ])

  return jsonResponse({ invoices, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await req.json()
    const { clientName, clientEmail, clientAddress, lineItems, taxRate, notes, dueAt, orderId } = body

    if (!clientName || !clientEmail || !lineItems?.length) {
      return errorResponse('clientName, clientEmail, and lineItems are required', 400)
    }

    const parsedItems: { description: string; qty: number; unitPrice: number; amount: number }[] = lineItems
    const subtotal = parsedItems.reduce((s, i) => s + i.amount, 0)
    const rate = parseFloat(taxRate || '0') / 100
    const tax = Math.round(subtotal * rate * 100) / 100
    const total = subtotal + tax

    // Ensure unique invoice number
    let invoiceNumber = generateInvoiceNumber()
    let attempts = 0
    while (attempts < 5) {
      const existing = await db.invoice.findUnique({ where: { invoiceNumber } })
      if (!existing) break
      invoiceNumber = generateInvoiceNumber()
      attempts++
    }

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        orderId: orderId || null,
        clientName,
        clientEmail,
        clientAddress: clientAddress ? JSON.stringify(clientAddress) : null,
        lineItems: JSON.stringify(parsedItems),
        subtotal,
        taxRate: parseFloat(taxRate || '0'),
        tax,
        total,
        notes: notes || null,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
    })

    return jsonResponse(invoice, 201)
  } catch (e) {
    console.error('Create invoice error:', e)
    return errorResponse('Failed to create invoice', 500)
  }
}
