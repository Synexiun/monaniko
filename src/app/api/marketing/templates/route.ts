import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
  const skip = (page - 1) * limit

  const where = category ? { category } : {}

  const [templates, total] = await Promise.all([
    db.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { blasts: true } } },
    }),
    db.emailTemplate.count({ where }),
  ])

  return NextResponse.json({ templates, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const { name, subject, html, previewText, category } = body

  if (!name?.trim() || !subject?.trim() || !html?.trim()) {
    return NextResponse.json({ error: 'name, subject, and html are required' }, { status: 400 })
  }

  const template = await db.emailTemplate.create({
    data: {
      name: name.trim(),
      subject: subject.trim(),
      html,
      previewText: previewText?.trim() || null,
      category: category || 'newsletter',
    },
  })

  return NextResponse.json(template, { status: 201 })
}
