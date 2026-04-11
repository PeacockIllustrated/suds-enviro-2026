/**
 * Simple password-based admin authentication.
 * Uses ADMIN_PASSWORD env var and httpOnly cookie for session.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'se-admin-session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Create a simple hash of the password + timestamp for the session token.
 * Not cryptographically robust - adequate for an MVP password gate.
 */
function createSessionToken(password: string): string {
  const timestamp = Date.now()
  const raw = `${password}:${timestamp}`
  // Simple base64 encoding of password + timestamp
  return Buffer.from(raw).toString('base64')
}

function isTokenValid(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length < 2) return false

    const password = parts.slice(0, -1).join(':')
    const timestamp = parseInt(parts[parts.length - 1])

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return false

    // Check password matches
    if (password !== adminPassword) return false

    // Check token hasn't expired
    if (Date.now() - timestamp > SESSION_DURATION_MS) return false

    return true
  } catch {
    return false
  }
}

/**
 * Validate admin password and set session cookie.
 */
export async function loginAdmin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false

  const token = createSessionToken(password)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })

  return true
}

/**
 * Check if the current request has a valid admin session.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return isTokenValid(token)
}

/**
 * Clear the admin session cookie.
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Guard helper for admin API routes.
 * Returns a 401 NextResponse if not authenticated, or null if OK.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const authed = await isAdminAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
