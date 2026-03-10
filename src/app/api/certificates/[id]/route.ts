import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const cert = await db.certificate.findUnique({ where: { id } })
  if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cert)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  const body = await req.json()
  const {
    artworkTitle, artworkDescription, medium, dimensions, year,
    edition, artistName, recipientName, orderId, artworkId, notes,
  } = body

  const cert = await db.certificate.update({
    where: { id },
    data: {
      ...(artworkTitle !== undefined && { artworkTitle: artworkTitle.trim() }),
      ...(artworkDescription !== undefined && { artworkDescription: artworkDescription?.trim() || null }),
      ...(medium !== undefined && { medium: medium?.trim() || null }),
      ...(dimensions !== undefined && { dimensions: dimensions?.trim() || null }),
      ...(year !== undefined && { year: year ? parseInt(year) : null }),
      ...(edition !== undefined && { edition: edition?.trim() || null }),
      ...(artistName !== undefined && { artistName: artistName?.trim() || 'Mona Niko' }),
      ...(recipientName !== undefined && { recipientName: recipientName.trim() }),
      ...(orderId !== undefined && { orderId: orderId || null }),
      ...(artworkId !== undefined && { artworkId: artworkId || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  })

  return NextResponse.json(cert)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { id } = await params
  await db.certificate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
