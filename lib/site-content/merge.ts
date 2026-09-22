/**
 * Merging saved copy over the defaults.
 *
 * The defaults decide the shape; saved values only ever replace text. So
 * a saved file can never add a field the pages do not know about, drop
 * one they need, or change a link, an image or an id, whatever it holds.
 *
 * - Strings take the saved string when there is one.
 * - "Text lists" (rich text segments, or lists of paragraphs) are replaced
 *   whole, so the editor can add and remove segments and paragraphs.
 * - Other lists (cards, slides, links) keep their length from the
 *   defaults and merge item by item.
 * - Everything else (numbers, booleans, and the locked keys below) always
 *   comes from the defaults.
 */

/** Keys the editor never changes: identifiers, links, images, styling. */
export const LOCKED_KEYS = new Set([
  'id', 'slug', 'href', 'logo', 'mark', 'image', 'icon', 'src', 'url',
  'variant', 'accent', 'available', 'productId', 'comingSoon', 'position',
])

export const EMPHASES = ['plain', 'highlight', 'lowlight', 'italic', 'bold'] as const
export type EmphasisOption = (typeof EMPHASES)[number]

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSegment(value: unknown): value is { text: string; emphasis?: string } {
  return isRecord(value) && typeof value.text === 'string' && Object.keys(value).every((k) => k === 'text' || k === 'emphasis')
}

/** A rich text run or a list of paragraphs: edited as a whole list. */
export function isTextList(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) return false
  return value.every((v) => typeof v === 'string') || value.every(isSegment)
}

function mergeTextList(base: unknown[], saved: unknown): unknown[] {
  if (!Array.isArray(saved)) return base
  const strings = base.every((v) => typeof v === 'string')
  if (strings) {
    const out = saved.filter((v): v is string => typeof v === 'string')
    return out.length ? out : base
  }
  const out = saved.filter(isSegment).map((s) => {
    const emphasis = typeof s.emphasis === 'string' && (EMPHASES as readonly string[]).includes(s.emphasis) && s.emphasis !== 'plain' ? s.emphasis : undefined
    return emphasis ? { text: s.text, emphasis } : { text: s.text }
  })
  return out.length ? out : base
}

export function mergeContent<T>(base: T, saved: unknown): T {
  return mergeValue(base, saved) as T
}

function mergeValue(base: unknown, saved: unknown): unknown {
  if (typeof base === 'string') return typeof saved === 'string' ? saved : base
  if (Array.isArray(base)) {
    if (isTextList(base)) return mergeTextList(base, saved)
    const items = Array.isArray(saved) ? saved : []
    return base.map((item, i) => mergeValue(item, items[i]))
  }
  if (isRecord(base)) {
    const from = isRecord(saved) ? saved : {}
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(base)) {
      out[key] = LOCKED_KEYS.has(key) ? value : mergeValue(value, from[key])
    }
    return out
  }
  return base
}

export type { Json }
