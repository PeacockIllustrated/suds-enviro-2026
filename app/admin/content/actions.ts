'use server'

import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { checkCredentials, endSession, isSignedIn, startSession } from '@/lib/site-content/auth'
import { CONTENT_DEFAULTS, isSectionId } from '@/lib/site-content/defaults'
import { mergeContent } from '@/lib/site-content/merge'
import { CONTENT_TAG, deleteSaved, writeSaved } from '@/lib/site-content/store'

export interface LoginState {
  error: string | null
  /** Echoed back so a failed attempt does not clear the username. */
  username: string
}

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')
  if (!checkCredentials(username, password)) {
    return { error: 'That username and password do not match.', username }
  }
  await startSession()
  redirect('/admin/content')
}

export async function logout(): Promise<void> {
  await endSession()
  redirect('/admin/content')
}

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string }

/** Publishes the site after a save: every page reads the copy. */
function refreshSite() {
  revalidateTag(CONTENT_TAG, { expire: 0 })
  revalidatePath('/', 'layout')
}

export async function saveSection(section: string, value: unknown): Promise<SaveResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'Your session has ended. Sign in again to save.' }
  if (!isSectionId(section)) return { ok: false, error: 'Unknown section.' }
  try {
    // Merging over the defaults keeps only text the editor may change,
    // whatever was posted.
    await writeSaved(section, mergeContent(CONTENT_DEFAULTS[section], value))
    refreshSite()
    return { ok: true, savedAt: new Date().toISOString() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not save.' }
  }
}

export async function resetSection(section: string): Promise<SaveResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'Your session has ended. Sign in again.' }
  if (!isSectionId(section)) return { ok: false, error: 'Unknown section.' }
  try {
    await deleteSaved(section)
    refreshSite()
    return { ok: true, savedAt: new Date().toISOString() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not restore.' }
  }
}
