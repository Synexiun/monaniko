import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function GET() {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, firstName: true, lastName: true, avatar: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const { firstName, lastName, email } = await req.json()

  if (email) {
    const existing = await db.user.findFirst({
      where: { email: email.toLowerCase(), NOT: { id: auth.userId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
  }

  const user = await db.user.update({
    where: { id: auth.userId },
    data: {
      ...(firstName !== undefined && { firstName: firstName.trim() }),
      ...(lastName !== undefined && { lastName: lastName.trim() }),
      ...(email !== undefined && { email: email.toLowerCase().trim() }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
  })

  return NextResponse.json(user)
}
