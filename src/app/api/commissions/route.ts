import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
  const skip = (page - 1) * limit

  const where = stage ? { stage } : {}
  const [commissions, total] = await Promise.all([
    db.commission.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    db.commission.count({ where }),
  ])

  return NextResponse.json({ commissions, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const {
    clientName, clientEmail, clientPhone, artworkDescription,
    medium, dimensions, colorNotes, deadline, depositAmount,
    totalAmount, inquiryId, notes,
  } = body

  if (!clientName?.trim() || !clientEmail?.trim()) {
    return NextResponse.json({ error: 'clientName and clientEmail are required' }, { status: 400 })
  }

  const commission = await db.commission.create({
    data: {
      clientName: clientName.trim(),
      clientEmail: clientEmail.toLowerCase().trim(),
      clientPhone: clientPhone?.trim() || null,
      artworkDescription: artworkDescription?.trim() || null,
      medium: medium?.trim() || null,
      dimensions: dimensions?.trim() || null,
      colorNotes: colorNotes?.trim() || null,
      deadline: deadline ? new Date(deadline) : null,
      depositAmount: depositAmount ? parseFloat(depositAmount) : null,
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      inquiryId: inquiryId || null,
      notes: notes?.trim() || null,
      stage: 'CONSULTATION',
    },
  })

  return NextResponse.json(commission, { status: 201 })
}
