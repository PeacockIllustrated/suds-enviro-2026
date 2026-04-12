/**
 * Simple password-based reviewer authentication.
 * Uses REVIEWER_PASSWORD env var (falls back to ADMIN_PASSWORD).
 * Cookie stores base64(password:author:timestamp) with 7-day expiry.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'se-reviewer-session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getReviewerPassword(): string | undefined {
  return process.env.REVIEWER_PASSWORD || process.env.ADMIN_PASSWORD
}

/**
 * Validate reviewer password and set session cookie with author name.
 */
export async function loginReviewer(
  password: string,
  author: string
): Promise<boolean> {
  const expected = getReviewerPassword()
  if (!expected || password !== expected) return false

  const token = Buffer.from(
    `${password}:${author}:${Date.now()}`
  ).toString('base64')

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
 * Extract and validate session data from the reviewer cookie.
 * Returns { valid, author } or { valid: false }.
 */
function parseToken(
  token: string
): { valid: true; author: string } | { valid: false; author: null } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    // Format: password:author:timestamp
    if (parts.length < 3) return { valid: false, author: null }

    const timestamp = parseInt(parts[parts.length - 1])
    const author = parts.slice(1, -1).join(':')
    const password = parts[0]

    const expected = getReviewerPassword()
    if (!expected) return { valid: false, author: null }

    if (password !== expected) return { valid: false, author: null }
    if (Date.now() - timestamp > SESSION_DURATION_MS)
      return { valid: false, author: null }

    return { valid: true, author }
  } catch {
    return { valid: false, author: null }
  }
}

/**
 * Returns the reviewer name from cookie, or null if not authenticated.
 */
export async function getReviewerName(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const result = parseToken(token)
  return result.valid ? result.author : null
}

/**
 * Check if the current request has a valid reviewer session.
 */
export async function isReviewerAuthenticated(): Promise<boolean> {
  const name = await getReviewerName()
  return name !== null
}

/**
 * Clear the reviewer session cookie.
 */
export async function logoutReviewer(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Guard helper for reviewer API routes.
 * Returns a 401 NextResponse if not authenticated, or null if OK.
 */
export async function requireReviewer(): Promise<NextResponse | null> {
  const authed = await isReviewerAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
