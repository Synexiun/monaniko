import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const { name, email, tier, status, notes, expiresAt } = body

  if (email) {
    const existing = await db.collectorMembership.findFirst({
      where: { email: email.toLowerCase(), NOT: { id } },
    })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const member = await db.collectorMembership.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(email !== undefined && { email: email.toLowerCase().trim() }),
      ...(tier !== undefined && { tier }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
    },
  })

  return NextResponse.json(member)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  await db.collectorMembership.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
