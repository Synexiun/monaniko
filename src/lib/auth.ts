import { cookies } from 'next/headers'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated'
const DEMO_USER = 'demo'
const DEMO_PASS = 'demo'

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  return username === DEMO_USER && password === DEMO_PASS
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
