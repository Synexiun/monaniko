import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const segment = searchParams.get('segment')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (segment) where.segment = segment

  const [blasts, total] = await Promise.all([
    db.emailBlast.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { template: { select: { id: true, name: true } } },
    }),
    db.emailBlast.count({ where }),
  ])

  return NextResponse.json({ blasts, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const { subject, html, previewText, segment, templateId, campaignId, notes } = body

  if (!subject?.trim() || !html?.trim() || !segment?.trim()) {
    return NextResponse.json({ error: 'subject, html, and segment are required' }, { status: 400 })
  }

  const blast = await db.emailBlast.create({
    data: {
      subject: subject.trim(),
      html,
      previewText: previewText?.trim() || null,
      segment,
      templateId: templateId || null,
      campaignId: campaignId || null,
      notes: notes?.trim() || null,
      status: 'DRAFT',
    },
  })

  return NextResponse.json(blast, { status: 201 })
}
