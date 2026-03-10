import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const blast = await db.emailBlast.findUnique({
    where: { id },
    include: { template: { select: { id: true, name: true } } },
  })
  if (!blast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(blast)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const { subject, html, previewText, segment, templateId, notes } = body

  const blast = await db.emailBlast.update({
    where: { id },
    data: {
      ...(subject !== undefined && { subject: subject.trim() }),
      ...(html !== undefined && { html }),
      ...(previewText !== undefined && { previewText: previewText?.trim() || null }),
      ...(segment !== undefined && { segment }),
      ...(templateId !== undefined && { templateId: templateId || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  })

  return NextResponse.json(blast)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const blast = await db.emailBlast.findUnique({ where: { id } })
  if (!blast) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (blast.status === 'SENDING') {
    return NextResponse.json({ error: 'Cannot delete a blast that is currently sending' }, { status: 409 })
  }

  await db.emailBlast.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
