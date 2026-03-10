import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier')
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (tier) where.tier = tier
  if (status) where.status = status

  const [members, total] = await Promise.all([
    db.collectorMembership.findMany({ where, orderBy: { joinedAt: 'desc' }, skip, take: limit }),
    db.collectorMembership.count({ where }),
  ])

  const stats = await db.collectorMembership.groupBy({
    by: ['tier'],
    _count: { id: true },
    where: { status: 'ACTIVE' },
  })

  return NextResponse.json({ members, total, page, limit, stats })
}

export async function POST(req: NextRequest) {
  // Allow public signups (no auth required) and admin creates
  const body = await req.json()
  const { name, email, tier, notes } = body

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const existing = await db.collectorMembership.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: 'A membership already exists for this email' }, { status: 409 })
  }

  const member = await db.collectorMembership.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      tier: tier || 'SILVER',
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(member, { status: 201 })
}
