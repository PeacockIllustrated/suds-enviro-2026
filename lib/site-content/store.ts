import { cache } from 'react'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { CONTENT_DEFAULTS, SECTION_IDS, type SectionId, type SiteContent } from './defaults'
import { mergeContent } from './merge'

/**
 * Where saved copy lives.
 *
 * Each section is one JSON file in a private Supabase Storage bucket, so
 * no database migration is needed; the service role key the app already
 * has can create the bucket and write to it. Reads go through fetch with
 * a cache tag, so pages stay static and a save refreshes them on demand.
 *
 * Without Supabase credentials (local development) the same files are
 * kept in .content-overrides/ at the project root instead.
 */

export const CONTENT_TAG = 'site-content'
const BUCKET = 'se-site-content'
const LOCAL_DIR = path.join(process.cwd(), '.content-overrides')

function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? { url, key } : null
}

function headers(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` }
}

/** The saved copy for a section, or null when nothing has been saved. */
export async function readSaved(section: SectionId, options: { fresh?: boolean } = {}): Promise<unknown> {
  const env = supabaseEnv()
  if (!env) {
    try {
      return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, `${section}.json`), 'utf8')) as unknown
    } catch {
      return null
    }
  }
  try {
    const res = await fetch(`${env.url}/storage/v1/object/authenticated/${BUCKET}/${section}.json`, {
      headers: headers(env.key),
      ...(options.fresh ? { cache: 'no-store' as const } : { cache: 'force-cache' as const, next: { tags: [CONTENT_TAG] } }),
    })
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    // Storage unreachable: the site falls back to the copy in the code
    // rather than failing to render.
    return null
  }
}

async function ensureBucket(env: { url: string; key: string }): Promise<void> {
  const res = await fetch(`${env.url}/storage/v1/bucket/${BUCKET}`, { headers: headers(env.key), cache: 'no-store' })
  if (res.ok) return
  const created = await fetch(`${env.url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers(env.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
    cache: 'no-store',
  })
  if (!created.ok && created.status !== 409) {
    throw new Error(`Could not create the content bucket (${created.status})`)
  }
}

export async function writeSaved(section: SectionId, value: unknown): Promise<void> {
  const body = JSON.stringify(value)
  const env = supabaseEnv()
  if (!env) {
    await fs.mkdir(LOCAL_DIR, { recursive: true })
    await fs.writeFile(path.join(LOCAL_DIR, `${section}.json`), body)
    return
  }
  await ensureBucket(env)
  const res = await fetch(`${env.url}/storage/v1/object/${BUCKET}/${section}.json`, {
    method: 'POST',
    headers: { ...headers(env.key), 'Content-Type': 'application/json', 'x-upsert': 'true', 'cache-control': 'no-cache' },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Could not save (${res.status})`)
}

export async function deleteSaved(section: SectionId): Promise<void> {
  const env = supabaseEnv()
  if (!env) {
    await fs.rm(path.join(LOCAL_DIR, `${section}.json`), { force: true })
    return
  }
  const res = await fetch(`${env.url}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...headers(env.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: [`${section}.json`] }),
    cache: 'no-store',
  })
  if (!res.ok && res.status !== 404) throw new Error(`Could not reset (${res.status})`)
}

/** One section's copy: the defaults with anything saved merged over. */
export async function getSection<S extends SectionId>(section: S, options: { fresh?: boolean } = {}): Promise<SiteContent[S]> {
  return mergeContent(CONTENT_DEFAULTS[section], await readSaved(section, options))
}

/** All of the site's copy, read once per request. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const entries = await Promise.all(SECTION_IDS.map(async (id) => [id, await getSection(id)] as const))
  return Object.fromEntries(entries) as SiteContent
})
