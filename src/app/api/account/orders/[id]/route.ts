import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const order = await db.order.findFirst({
    where: { id, userId: auth.userId },
    include: { items: true },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
