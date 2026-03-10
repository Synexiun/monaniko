import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const item = await db.wishlistItem.findFirst({ where: { id, userId: auth.userId } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.wishlistItem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
