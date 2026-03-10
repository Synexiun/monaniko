import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireCustomerAuth } from '@/lib/customer-auth'

export async function PUT(req: NextRequest) {
  const auth = await requireCustomerAuth()
  if (auth instanceof NextResponse) return auth

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { id: auth.userId } })
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await db.user.update({ where: { id: auth.userId }, data: { password: hashed } })
  return NextResponse.json({ success: true })
}
