import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Sign-in for the site content editor.
 *
 * Deliberately simple, as asked: one hard-coded account for Sean. The
 * CONTENT_EDITOR_USER / CONTENT_EDITOR_PASSWORD environment variables
 * override it if they are ever set, so the password can be changed in
 * Vercel without a code change.
 *
 * The session is an httpOnly cookie holding an expiry and an HMAC of it,
 * keyed on the password, so changing the password signs everyone out.
 */
const USERNAME = process.env.CONTENT_EDITOR_USER ?? 'sean'
const PASSWORD = process.env.CONTENT_EDITOR_PASSWORD ?? 'RhinoRange-2026'

const COOKIE = 'se-content-editor'
const SESSION_SECONDS = 60 * 60 * 24 * 14

function sign(value: string): string {
  return createHmac('sha256', `se-content-editor:${USERNAME}:${PASSWORD}`).update(value).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function checkCredentials(username: string, password: string): boolean {
  // Both compared, whatever the first result, so timing says nothing.
  const userOk = safeEqual(username.trim().toLowerCase(), USERNAME.toLowerCase())
  const passOk = safeEqual(password, PASSWORD)
  return userOk && passOk
}

export async function startSession(): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const value = `${expires}.${sign(String(expires))}`
  const store = await cookies()
  store.set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export async function endSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function isSignedIn(): Promise<boolean> {
  const store = await cookies()
  const value = store.get(COOKIE)?.value
  if (!value) return false
  const [expires, mac] = value.split('.')
  if (!expires || !mac) return false
  if (Number(expires) < Date.now() / 1000) return false
  return safeEqual(mac, sign(expires))
}
