import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

function generateCertNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `MN-${year}-${rand}`
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const artworkId = searchParams.get('artworkId')
  const orderId = searchParams.get('orderId')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (artworkId) where.artworkId = artworkId
  if (orderId) where.orderId = orderId

  const [certificates, total] = await Promise.all([
    db.certificate.findMany({ where, orderBy: { issuedAt: 'desc' }, skip, take: limit }),
    db.certificate.count({ where }),
  ])

  return NextResponse.json({ certificates, total, page, limit })
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const {
    artworkTitle, artworkDescription, medium, dimensions, year,
    edition, artistName, recipientName, orderId, artworkId, notes,
  } = body

  if (!artworkTitle?.trim() || !recipientName?.trim()) {
    return NextResponse.json({ error: 'artworkTitle and recipientName are required' }, { status: 400 })
  }

  // Generate unique certificate number (retry up to 5 times)
  let certificateNumber = ''
  for (let i = 0; i < 5; i++) {
    certificateNumber = generateCertNumber()
    const exists = await db.certificate.findUnique({ where: { certificateNumber } })
    if (!exists) break
  }

  const cert = await db.certificate.create({
    data: {
      certificateNumber,
      artworkTitle: artworkTitle.trim(),
      artworkDescription: artworkDescription?.trim() || null,
      medium: medium?.trim() || null,
      dimensions: dimensions?.trim() || null,
      year: year ? parseInt(year) : null,
      edition: edition?.trim() || null,
      artistName: artistName?.trim() || 'Mona Niko',
      recipientName: recipientName.trim(),
      orderId: orderId || null,
      artworkId: artworkId || null,
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(cert, { status: 201 })
}
