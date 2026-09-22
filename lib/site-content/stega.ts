/**
 * Invisible path markers for the visual editor.
 *
 * In draft mode every piece of editable copy is served with its path
 * appended as zero-width characters. The page renders exactly as normal
 * (the markers have no width and no glyph), and the editor bridge running
 * inside the preview reads them back out of the DOM to learn which element
 * shows which piece of copy - so no page component needs to know it is
 * being edited. The same technique is known elsewhere as "stega" encoding.
 *
 * Markers are only ever added for signed-in editors in draft mode; the
 * public site never carries them.
 */

import { LOCKED_KEYS, isTextList } from './merge'

const DIGITS = ['​', '‌', '‍', '⁠']
const FENCE = '⁤'

export type ContentPath = (string | number)[]

export function encodePath(path: ContentPath): string {
  const json = JSON.stringify(path)
  let out = FENCE
  for (let i = 0; i < json.length; i++) {
    const code = json.charCodeAt(i)
    for (let shift = 14; shift >= 0; shift -= 2) out += DIGITS[(code >> shift) & 3]
  }
  return out + FENCE
}

const MARKER = new RegExp(`${FENCE}[${DIGITS.join('')}]+${FENCE}`, 'g')

/** The text with markers removed, and the paths they carried. */
export function decodeText(text: string): { clean: string; paths: ContentPath[] } {
  const paths: ContentPath[] = []
  const clean = text.replace(MARKER, (marker) => {
    const digits = marker.slice(1, -1)
    let json = ''
    for (let i = 0; i + 8 <= digits.length; i += 8) {
      let code = 0
      for (let j = 0; j < 8; j++) code = (code << 2) | DIGITS.indexOf(digits[i + j])
      json += String.fromCharCode(code)
    }
    try {
      const parsed: unknown = JSON.parse(json)
      if (Array.isArray(parsed)) paths.push(parsed as ContentPath)
    } catch {
      // A damaged marker is simply dropped.
    }
    return ''
  })
  return { clean, paths }
}

export function hasMarker(text: string): boolean {
  return text.includes(FENCE)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The content with a marker on every editable string. Rich text runs mark
 * each part with the path of the whole run, so clicking any word of a
 * heading selects the heading.
 */
export function markContent<T>(value: T, path: ContentPath): T {
  return mark(value, path) as T
}

function mark(value: unknown, path: ContentPath): unknown {
  if (typeof value === 'string') return value + encodePath(path)
  if (Array.isArray(value)) {
    if (isTextList(value) && value.every(isRecord)) {
      const marker = encodePath(path)
      return value.map((segment) => ({ ...(segment as Record<string, unknown>), text: `${String((segment as Record<string, unknown>).text)}${marker}` }))
    }
    return value.map((item, i) => mark(item, [...path, i]))
  }
  if (isRecord(value)) {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value)) {
      out[key] = LOCKED_KEYS.has(key) ? child : mark(child, [...path, key])
    }
    return out
  }
  return value
}
