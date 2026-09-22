'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  ExternalLink,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react'
import { logout, resetSection, saveSection } from '@/app/admin/content/actions'
import { EMPHASES, LOCKED_KEYS, isTextList, type EmphasisOption, type Json } from '@/lib/site-content/merge'
import type { SectionId } from '@/lib/site-content/defaults'

/**
 * The content editor form, generated from the shape of the copy.
 *
 * It walks the section's default copy and offers an input for every piece
 * of text in it: plain strings, paragraphs, and rich text runs (segments
 * with an emphasis). Links, images and ids are never shown; the server
 * merges whatever is posted over the defaults anyway (lib/site-content).
 */

type Path = (string | number)[]
type JsonObject = { [key: string]: Json }

interface SectionLink {
  id: SectionId
  label: string
  description: string
  preview: string
}

interface ContentEditorProps {
  section: SectionId
  sections: SectionLink[]
  defaults: Json
  current: Json
  hasSaved: boolean
}

// ── helpers ─────────────────────────────────────────────────────────

function isObject(value: Json | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function setAt(root: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value
  const [head, ...rest] = path
  if (Array.isArray(root) && typeof head === 'number') {
    const next = root.slice()
    next[head] = setAt(root[head], rest, value)
    return next
  }
  if (isObject(root) && typeof head === 'string') {
    return { ...root, [head]: setAt(root[head], rest, value) }
  }
  return root
}

function getAt(root: Json | undefined, path: Path): Json | undefined {
  let node: Json | undefined = root
  for (const key of path) {
    if (Array.isArray(node) && typeof key === 'number') node = node[key]
    else if (isObject(node) && typeof key === 'string') node = node[key]
    else return undefined
  }
  return node
}

/** Whether a value holds any text the editor offers. */
function hasEditable(value: Json | undefined, key?: string): boolean {
  if (key && LOCKED_KEYS.has(key)) return false
  if (typeof value === 'string') return true
  if (Array.isArray(value)) return isTextList(value) || value.some((v) => hasEditable(v))
  if (isObject(value)) return Object.entries(value).some(([k, v]) => hasEditable(v, k))
  return false
}

const LABELS: Record<string, string> = {
  lead: 'First part',
  trail: 'Second part',
  mark: 'Emphasised part',
  emphasis: 'Emphasis',
  cta: 'Button',
  body: 'Text',
  intro: 'Introduction',
  heading: 'Heading',
  headline: 'Headline',
  strapline: 'Strapline',
  eyebrow: 'Eyebrow',
  quote: 'Quote',
  lockup: 'Heading lockup',
  series: 'Series name',
  stream: 'Water stream',
  category: 'Category',
  highlights: 'Highlights',
  term: 'Term',
  detail: 'Detail',
  sections: 'Sections',
  clock: 'Clock diagram section',
  variants: 'Variants',
  megaMenu: 'RHINO Range menu',
  columns: 'Menu columns',
  sidebar: 'Menu side column',
  links: 'Links',
  actions: 'Buttons',
  brand: 'Brand',
  author: 'Author',
  name: 'Name',
  role: 'Role',
  label: 'Label',
  title: 'Title',
  description: 'Description',
  placeholder: 'Placeholder',
}

const SECTION_KEY_LABELS: Record<string, string> = {
  HERO: 'Hero',
  WATER_STREAMS: 'Storm and foul water labels',
  WATER_TABS: 'Water management tabs',
  INNOVATION_SLIDES: 'RoFlo, multiFlo and autoFlo slides',
  TESTIMONIALS_HEADING: 'Testimonials heading',
  TESTIMONIALS: 'Testimonials',
  RHINO_RANGE: 'The RHINO Range block',
  SOLUTION_ROUTES: 'Foul and surface water solutions',
  BUILDER_CTA: 'Build your system block',
  PRODUCT_TILES: 'Product cards',
  PRIMARY_NAV: 'Header and menu',
  FOOTER: 'Footer',
  CONTACT_HERO: 'Heading and buttons',
  SUPPORT_CARDS: 'Support cards',
  EXISTING_CUSTOMER: 'Existing customer block',
  CONTACT_FORM: 'Contact form',
  BUILDER_HUB: 'Hub heading',
  BUILDER_CARDS: 'Product cards',
  chamber: 'Inspection chambers',
  catchpit: 'Catchpits and silt traps',
  'flow-control': 'Flow control',
  'pump-station': 'Pumping stations',
}

function humanise(key: string): string {
  if (SECTION_KEY_LABELS[key]) return SECTION_KEY_LABELS[key]
  if (LABELS[key]) return LABELS[key]
  const words = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function segmentsText(value: Json | undefined): string {
  if (!Array.isArray(value)) return ''
  return value.map((s) => (isObject(s) && typeof s.text === 'string' ? s.text : '')).join('')
}

/** A short title for a list item, from whatever text it carries. */
function itemTitle(item: Json, index: number): string {
  if (isObject(item)) {
    const pick = (v: Json | undefined): string => {
      if (typeof v === 'string') return v
      if (Array.isArray(v)) return segmentsText(v)
      if (isObject(v)) return [v.lead, v.mark, v.trail].filter((x) => typeof x === 'string').join(' ')
      return ''
    }
    const title =
      pick(item.label) || pick(item.title) || pick(item.name) || pick(item.heading) || pick(item.brand) || pick(item.headline) || pick(item.term) || (typeof item.id === 'string' ? item.id : '')
    if (title) return title.length > 60 ? `${title.slice(0, 57)}...` : title
  }
  return `Item ${index + 1}`
}

function countEdits(value: Json | undefined, base: Json | undefined): number {
  if (typeof value === 'string') return value === base ? 0 : 1
  if (Array.isArray(value)) {
    if (isTextList(value)) return JSON.stringify(value) === JSON.stringify(base) ? 0 : 1
    return value.reduce<number>((n, v, i) => n + countEdits(v, Array.isArray(base) ? base[i] : undefined), 0)
  }
  if (isObject(value)) {
    return Object.entries(value).reduce<number>(
      (n, [k, v]) => (LOCKED_KEYS.has(k) ? n : n + countEdits(v, isObject(base) ? base[k] : undefined)),
      0,
    )
  }
  return 0
}

// ── field pieces ────────────────────────────────────────────────────

const INPUT =
  'w-full rounded-lg border border-site-blue/25 bg-white px-3 py-2 text-[15px] text-site-blue-dark outline-none transition-colors focus:border-site-blue focus:ring-2 focus:ring-site-blue/15'

function FieldLabel({ children, edited, onUndo }: { children: React.ReactNode; edited: boolean; onUndo?: () => void }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="text-xs font-bold tracking-wider text-site-blue-dark/80 uppercase">{children}</span>
      {edited ? (
        <>
          <span className="rounded-full bg-site-green/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-site-green uppercase">
            Changed
          </span>
          {onUndo ? (
            <button
              type="button"
              onClick={onUndo}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-site-blue hover:text-site-blue-dark"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Original
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function TextField({ label, value, base, onChange }: { label: string; value: string; base: Json | undefined; onChange: (v: string) => void }) {
  const long = value.length > 70 || value.includes('\n') || (typeof base === 'string' && base.length > 70)
  const edited = typeof base === 'string' && value !== base
  return (
    <div>
      <FieldLabel edited={edited} onUndo={typeof base === 'string' ? () => onChange(base) : undefined}>
        {label}
      </FieldLabel>
      {long ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(8, Math.ceil(value.length / 70) + 1)} className={`${INPUT} resize-y leading-relaxed`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={INPUT} />
      )}
    </div>
  )
}

const EMPHASIS_LABEL: Record<EmphasisOption, string> = {
  plain: 'Plain',
  highlight: 'Highlight',
  lowlight: 'Soft',
  italic: 'Italic',
  bold: 'Bold',
}

const EMPHASIS_PREVIEW: Record<EmphasisOption, string> = {
  plain: 'text-site-blue-dark',
  highlight: 'font-bold text-site-blue',
  lowlight: 'text-site-green',
  italic: 'italic text-site-green',
  bold: 'font-bold text-site-blue-dark',
}

function emphasisOf(segment: Json): EmphasisOption {
  const e = isObject(segment) ? segment.emphasis : undefined
  return typeof e === 'string' && (EMPHASES as readonly string[]).includes(e) ? (e as EmphasisOption) : 'plain'
}

/** A run of text split into segments, each with its own emphasis. */
function RichTextField({ label, value, base, onChange }: { label: string; value: Json[]; base: Json | undefined; onChange: (v: Json) => void }) {
  const edited = JSON.stringify(value) === JSON.stringify(base) ? false : base !== undefined
  const setSegment = (i: number, next: { text: string; emphasis: EmphasisOption }) => {
    const out = value.slice()
    out[i] = next.emphasis === 'plain' ? { text: next.text } : { text: next.text, emphasis: next.emphasis }
    onChange(out)
  }
  return (
    <div className="rounded-xl border border-site-blue/15 bg-site-blue-light/10 p-3">
      <FieldLabel edited={edited} onUndo={base !== undefined ? () => onChange(base) : undefined}>
        {label}
      </FieldLabel>
      <p className="mb-3 rounded-lg bg-white px-3 py-2 text-[15px] leading-relaxed">
        {value.map((s, i) => (
          <span key={i} className={EMPHASIS_PREVIEW[emphasisOf(s)]}>
            {isObject(s) && typeof s.text === 'string' ? s.text : ''}
          </span>
        ))}
      </p>
      <div className="space-y-2">
        {value.map((segment, i) => {
          const text = isObject(segment) && typeof segment.text === 'string' ? segment.text : ''
          const emphasis = emphasisOf(segment)
          return (
            <div key={i} className="flex items-start gap-2">
              <textarea
                value={text}
                onChange={(e) => setSegment(i, { text: e.target.value, emphasis })}
                rows={text.length > 60 ? 2 : 1}
                aria-label={`${label}, part ${i + 1}`}
                className={`${INPUT} min-w-0 flex-1 resize-y py-1.5 text-sm`}
              />
              <select
                value={emphasis}
                onChange={(e) => setSegment(i, { text, emphasis: e.target.value as EmphasisOption })}
                aria-label={`Emphasis for part ${i + 1}`}
                className="shrink-0 rounded-lg border border-site-blue/25 bg-white px-2 py-1.5 text-sm text-site-blue-dark"
              >
                {EMPHASES.map((e) => (
                  <option key={e} value={e}>
                    {EMPHASIS_LABEL[e]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                disabled={value.length <= 1}
                aria-label={`Remove part ${i + 1}`}
                className="shrink-0 rounded-lg p-2 text-site-blue-dark/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, { text: '' }])}
        className="mt-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-site-blue uppercase hover:text-site-blue-dark"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add part
      </button>
    </div>
  )
}

/** A list of paragraphs. */
function ParagraphsField({ label, value, base, onChange }: { label: string; value: Json[]; base: Json | undefined; onChange: (v: Json) => void }) {
  const edited = base !== undefined && JSON.stringify(value) !== JSON.stringify(base)
  return (
    <div>
      <FieldLabel edited={edited} onUndo={base !== undefined ? () => onChange(base) : undefined}>
        {label}
      </FieldLabel>
      <div className="space-y-2">
        {value.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea
              value={typeof p === 'string' ? p : ''}
              onChange={(e) => {
                const out = value.slice()
                out[i] = e.target.value
                onChange(out)
              }}
              rows={Math.min(8, Math.ceil((typeof p === 'string' ? p.length : 0) / 70) + 1)}
              aria-label={`${label}, paragraph ${i + 1}`}
              className={`${INPUT} min-w-0 flex-1 resize-y leading-relaxed`}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              disabled={value.length <= 1}
              aria-label={`Remove paragraph ${i + 1}`}
              className="shrink-0 rounded-lg p-2 text-site-blue-dark/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="mt-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-site-blue uppercase hover:text-site-blue-dark"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add paragraph
      </button>
    </div>
  )
}

// ── the recursive form ──────────────────────────────────────────────

interface NodeProps {
  name: string
  value: Json
  base: Json | undefined
  path: Path
  onChange: (path: Path, value: Json) => void
  depth: number
}

function Node({ name, value, base, path, onChange, depth }: NodeProps) {
  if (!hasEditable(value, typeof path[path.length - 1] === 'string' ? String(path[path.length - 1]) : undefined)) return null
  const label = humanise(name)

  if (typeof value === 'string') {
    return <TextField label={label} value={value} base={base} onChange={(v) => onChange(path, v)} />
  }

  if (Array.isArray(value)) {
    if (isTextList(value)) {
      return value.every((v) => typeof v === 'string') ? (
        <ParagraphsField label={label} value={value} base={base} onChange={(v) => onChange(path, v)} />
      ) : (
        <RichTextField label={label} value={value} base={base} onChange={(v) => onChange(path, v)} />
      )
    }
    return (
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-bold tracking-wider text-site-blue-dark/80 uppercase">{label}</legend>
        {value.map((item, i) =>
          hasEditable(item) ? (
            <details key={i} className="group rounded-xl border border-site-blue/15 bg-white" open={value.length <= 2}>
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-site-blue-dark">
                <ChevronDown className="h-4 w-4 shrink-0 text-site-blue transition-transform group-open:rotate-180" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{itemTitle(item, i)}</span>
                <EditCount count={countEdits(item, Array.isArray(base) ? base[i] : undefined)} />
              </summary>
              <div className="space-y-4 border-t border-site-blue/10 px-4 py-4">
                <Children value={item} base={Array.isArray(base) ? base[i] : undefined} path={[...path, i]} onChange={onChange} depth={depth + 1} />
              </div>
            </details>
          ) : null,
        )}
      </fieldset>
    )
  }

  if (isObject(value)) {
    return (
      <fieldset className={depth > 0 ? 'space-y-4 rounded-xl border border-dashed border-site-blue/20 p-4' : 'space-y-4'}>
        <legend className="px-1 text-xs font-bold tracking-wider text-site-blue-dark/80 uppercase">{label}</legend>
        <Children value={value} base={base} path={path} onChange={onChange} depth={depth + 1} />
      </fieldset>
    )
  }
  return null
}

function Children({ value, base, path, onChange, depth }: Omit<NodeProps, 'name'>) {
  if (!isObject(value)) return null
  return (
    <>
      {Object.entries(value).map(([key, child]) =>
        LOCKED_KEYS.has(key) ? null : (
          <Node key={key} name={key} value={child} base={isObject(base) ? base[key] : undefined} path={[...path, key]} onChange={onChange} depth={depth} />
        ),
      )}
    </>
  )
}

function EditCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="shrink-0 rounded-full bg-site-green/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-site-green uppercase">
      {count} changed
    </span>
  )
}

// ── the page ────────────────────────────────────────────────────────

export function ContentEditor({ section, sections, defaults, current, hasSaved }: ContentEditorProps) {
  const [working, setWorking] = useState<Json>(current)
  const [published, setPublished] = useState<Json>(current)
  const [status, setStatus] = useState<{ kind: 'idle' | 'saved' | 'error'; message: string }>({ kind: 'idle', message: '' })
  const [confirmReset, setConfirmReset] = useState(false)
  const [savedExists, setSavedExists] = useState(hasSaved)
  const [pending, startTransition] = useTransition()

  const dirty = useMemo(() => JSON.stringify(working) !== JSON.stringify(published), [working, published])
  const meta = sections.find((s) => s.id === section)

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const onChange = (path: Path, value: Json) => {
    setWorking((w) => setAt(w, path, value))
    if (status.kind !== 'idle') setStatus({ kind: 'idle', message: '' })
  }

  const save = () =>
    startTransition(async () => {
      const result = await saveSection(section, working)
      if (result.ok) {
        setPublished(working)
        setSavedExists(true)
        setStatus({ kind: 'saved', message: `Published at ${new Date(result.savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` })
      } else {
        setStatus({ kind: 'error', message: result.error })
      }
    })

  const restore = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    setConfirmReset(false)
    startTransition(async () => {
      const result = await resetSection(section)
      if (result.ok) {
        setWorking(defaults)
        setPublished(defaults)
        setSavedExists(false)
        setStatus({ kind: 'saved', message: 'Original wording restored' })
      } else {
        setStatus({ kind: 'error', message: result.error })
      }
    })
  }

  const topLevel = isObject(working) ? Object.entries(working) : []

  return (
    <div className="min-h-screen w-full bg-[#f4f8fb] text-site-blue-dark">
      <header className="sticky top-0 z-20 bg-site-blue-dark text-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 md:px-6">
          <Image src="/logos/suds/icon-white.png" alt="" width={28} height={28} className="h-7 w-7" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Site content</p>
            <p className="truncate text-xs text-white/60">Changes go live on the website when you publish.</p>
          </div>
          <Link href={meta?.preview ?? '/'} target="_blank" className="hidden items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold tracking-wider uppercase hover:bg-white/10 sm:flex">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            View site
          </Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider uppercase hover:bg-white/10">
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:px-6">
        <nav aria-label="Sections" className="min-w-0 md:sticky md:top-20 md:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  href={`/admin/content?section=${s.id}`}
                  aria-current={s.id === section ? 'page' : undefined}
                  className={`block rounded-xl px-4 py-3 text-sm transition-colors ${
                    s.id === section ? 'bg-site-blue font-bold text-white' : 'bg-white font-semibold text-site-blue-dark hover:bg-site-blue-light/40'
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 pb-28">
          <div className="mb-5">
            <h1 className="text-2xl font-bold">{meta?.label}</h1>
            <p className="mt-1 text-sm text-site-blue-dark/70">{meta?.description}</p>
            <p className="mt-3 text-xs text-site-blue-dark/60">
              Parts marked Highlight, Soft, Italic or Bold take the site&apos;s colours for that spot; the preview above each run is a guide.
            </p>
          </div>

          <div className="space-y-4">
            {topLevel.map(([key, value]) =>
              hasEditable(value) ? (
                <details key={key} className="group rounded-2xl bg-white shadow-sm ring-1 ring-site-blue/10" open={topLevel.length <= 2}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                    <ChevronDown className="h-5 w-5 shrink-0 text-site-blue transition-transform group-open:rotate-180" aria-hidden />
                    <span className="min-w-0 flex-1 text-base font-bold">{humanise(key)}</span>
                    <EditCount count={countEdits(value, getAt(published, [key]))} />
                  </summary>
                  <div className="space-y-5 border-t border-site-blue/10 px-5 py-5">
                    {isObject(value) ? (
                      <Children value={value} base={isObject(defaults) ? defaults[key] : undefined} path={[key]} onChange={onChange} depth={0} />
                    ) : (
                      <Node name={key} value={value} base={isObject(defaults) ? defaults[key] : undefined} path={[key]} onChange={onChange} depth={0} />
                    )}
                  </div>
                </details>
              ) : null,
            )}
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-site-blue/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm" role="status">
            {status.kind === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                <span className="text-red-700">{status.message}</span>
              </>
            ) : status.kind === 'saved' && !dirty ? (
              <>
                <Check className="h-4 w-4 shrink-0 text-site-green" aria-hidden />
                <span>{status.message}</span>
              </>
            ) : dirty ? (
              <span className="font-semibold">You have unpublished changes</span>
            ) : (
              <span className="text-site-blue-dark/60">No unpublished changes</span>
            )}
          </p>
          {savedExists ? (
            <button
              type="button"
              onClick={restore}
              onBlur={() => setConfirmReset(false)}
              disabled={pending}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase disabled:opacity-50 ${
                confirmReset ? 'bg-red-600 text-white' : 'text-site-blue-dark/70 hover:bg-site-blue-light/40'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {confirmReset ? 'Click again to restore' : 'Restore original wording'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setWorking(published)}
            disabled={!dirty || pending}
            className="rounded-full px-4 py-2 text-xs font-bold tracking-wider text-site-blue-dark/70 uppercase hover:bg-site-blue-light/40 disabled:opacity-40"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className="flex items-center gap-2 rounded-full bg-site-green px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm transition-colors hover:bg-site-green-dark disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden />
            {pending ? 'Publishing' : 'Publish changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
