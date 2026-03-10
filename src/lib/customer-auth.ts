import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'customer_session'
const SECRET = process.env.CUSTOMER_SESSION_SECRET || 'dev-customer-secret-change-in-production'

function sign(userId: string): string {
  return crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
}

function verify(userId: string, sig: string): boolean {
  try {
    const expected = sign(userId)
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))
  } catch {
    return false
  }
}

export async function createCustomerSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const value = `${userId}.${sign(userId)}`
  cookieStore.set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}

export async function getCustomerUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE)?.value
  if (!raw) return null

  const dot = raw.lastIndexOf('.')
  if (dot < 0) return null

  const userId = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  return verify(userId, sig) ? userId : null
}

/** Use in account API handlers — returns { userId } or a 401 NextResponse */
export async function requireCustomerAuth(): Promise<{ userId: string } | NextResponse> {
  const userId = await getCustomerUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  return { userId }
}
