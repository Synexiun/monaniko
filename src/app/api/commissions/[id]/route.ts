import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const commission = await db.commission.findUnique({ where: { id } })
  if (!commission) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(commission)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  const fields = [
    'clientName', 'clientEmail', 'clientPhone', 'stage', 'artworkDescription',
    'medium', 'dimensions', 'colorNotes', 'depositAmount', 'totalAmount',
    'artworkId', 'inquiryId', 'notes',
  ]
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f] === '' ? null : body[f]
  }
  if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null
  if (body.depositPaidAt !== undefined) updateData.depositPaidAt = body.depositPaidAt ? new Date(body.depositPaidAt) : null
  if (body.completedAt !== undefined) updateData.completedAt = body.completedAt ? new Date(body.completedAt) : null

  // Auto-set completedAt when stage → COMPLETED
  if (body.stage === 'COMPLETED' && !body.completedAt) {
    const existing = await db.commission.findUnique({ where: { id } })
    if (existing && !existing.completedAt) updateData.completedAt = new Date()
  }

  const commission = await db.commission.update({ where: { id }, data: updateData })
  return NextResponse.json(commission)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  await db.commission.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
