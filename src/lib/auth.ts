import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated'

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const plainPassword = process.env.ADMIN_PASSWORD

  if (username !== adminUsername) return false

  if (passwordHash) {
    return bcrypt.compare(password, passwordHash)
  }

  if (plainPassword) {
    return password === plainPassword
  }

  // Dev fallback
  return password === 'demo'
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === SESSION_VALUE
}

/** Call at the top of any admin API handler. Returns a 401 response if not authenticated, otherwise null. */
export async function requireAuth(): Promise<NextResponse | null> {
  const authenticated = await getSession()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
