'use server'

import { redirect } from 'next/navigation'
import { draftMode } from 'next/headers'
import { revalidatePath, revalidateTag } from 'next/cache'
import { checkCredentials, endSession, isSignedIn, startSession } from '@/lib/site-content/auth'
import { CONTENT_DEFAULTS, SECTION_IDS, isSectionId } from '@/lib/site-content/defaults'
import { mergeContent } from '@/lib/site-content/merge'
import { CONTENT_TAG, deleteSaved, readSaved, writeSaved } from '@/lib/site-content/store'

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
  ;(await draftMode()).disable()
  redirect('/admin/content')
}

export type ActionResult = { ok: true; at: string } | { ok: false; error: string }

function failure(error: unknown, fallback: string): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : fallback }
}

/** Saves the working copy of one section as a draft. Nothing goes live. */
export async function saveDraft(section: string, value: unknown): Promise<ActionResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'Your session has ended. Sign in again.' }
  if (!isSectionId(section)) return { ok: false, error: 'Unknown section.' }
  try {
    // Merging over the defaults keeps only text the editor may change.
    await writeSaved(section, mergeContent(CONTENT_DEFAULTS[section], value), 'draft')
    return { ok: true, at: new Date().toISOString() }
  } catch (error) {
    return failure(error, 'Could not save the draft.')
  }
}

/** Makes every section's draft live. */
export async function publishDrafts(): Promise<ActionResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try {
    for (const section of SECTION_IDS) {
      const draft = await readSaved(section, { fresh: true, stage: 'draft' })
      if (draft === null) continue
      await writeSaved(section, mergeContent(CONTENT_DEFAULTS[section], draft), 'published')
      await deleteSaved(section, 'draft')
    }
    revalidateTag(CONTENT_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
    return { ok: true, at: new Date().toISOString() }
  } catch (error) {
    return failure(error, 'Could not publish.')
  }
}

/** Throws away every draft, back to what is live. */
export async function discardDrafts(): Promise<ActionResult> {
  if (!(await isSignedIn())) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try {
    for (const section of SECTION_IDS) await deleteSaved(section, 'draft')
    return { ok: true, at: new Date().toISOString() }
  } catch (error) {
    return failure(error, 'Could not discard the changes.')
  }
}
