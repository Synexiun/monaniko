import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function GET() {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const orders = await db.order.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { id: true, title: true, image: true, price: true, quantity: true },
      },
    },
  })

  return NextResponse.json({ orders })
}
