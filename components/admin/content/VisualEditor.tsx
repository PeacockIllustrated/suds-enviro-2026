'use client'

import Image from 'next/image'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from 'react'
import {
  AlertCircle,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  LogOut,
  Monitor,
  MousePointerClick,
  Plus,
  RotateCcw,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { discardDrafts, logout, publishDrafts, saveDraft } from '@/app/admin/content/actions'
import { EMPHASES, LOCKED_KEYS, isTextList, type EmphasisOption, type Json } from '@/lib/site-content/merge'
import { groupLabel, pathLabel, sectionLabel } from '@/lib/site-content/labels'
import type { SectionId } from '@/lib/site-content/defaults'
import type { BridgeItem } from '@/components/site/EditBridge'

/**
 * The visual site editor.
 *
 * The real site loads in the canvas in draft mode, and the bridge inside it
 * (components/site/EditBridge) outlines every piece of copy. Click a
 * heading, a paragraph or a button label and it opens in the side panel;
 * typing shows on the page straight away. Changes save as a draft as you
 * go and only reach visitors when Publish is pressed.
 */

export interface EditorSection {
  id: SectionId
  defaults: Json
  published: Json
  working: Json
  hasDraft: boolean
}

export interface EditorPage {
  path: string
  label: string
  group?: string
}

type Path = (string | number)[]
type JsonObject = { [key: string]: Json }
type Device = 'desktop' | 'tablet' | 'mobile'
type Mode = 'edit' | 'browse'

const DEVICE_WIDTH: Record<Device, number> = { desktop: 1280, tablet: 834, mobile: 390 }
const SAVE_DELAY = 700

// ── value helpers ───────────────────────────────────────────────────

function isObject(value: Json | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function setAt(root: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value
  const [head, ...rest] = path
  if (Array.isArray(root) && typeof head === 'number') {
    const next = root.slice()
    next[head] = setAt(root[head], rest, value)
    return next
  }
  if (isObject(root) && typeof head === 'string') return { ...root, [head]: setAt(root[head], rest, value) }
  return root
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

function parseKey(key: string): Path | null {
  try {
    const path = JSON.parse(key) as unknown
    return Array.isArray(path) && path.length > 1 ? (path as Path) : null
  } catch {
    return null
  }
}

type Segment = { text: string; emphasis?: EmphasisOption }

function asSegments(value: Json | undefined): Segment[] | null {
  if (!Array.isArray(value) || !isTextList(value) || !value.every(isObject)) return null
  return value.map((s) => {
    const o = s as JsonObject
    const e = typeof o.emphasis === 'string' && (EMPHASES as readonly string[]).includes(o.emphasis) ? (o.emphasis as EmphasisOption) : undefined
    return e && e !== 'plain' ? { text: String(o.text ?? ''), emphasis: e } : { text: String(o.text ?? '') }
  })
}

// ── the side panel's fields ─────────────────────────────────────────

const STYLE_LABEL: Record<EmphasisOption, string> = {
  plain: 'Normal',
  highlight: 'Highlight',
  lowlight: 'Soft',
  italic: 'Italic',
  bold: 'Bold',
}

const STYLE_PREVIEW: Record<EmphasisOption, string> = {
  plain: 'text-site-blue-dark',
  highlight: 'font-bold text-site-blue',
  lowlight: 'text-site-green',
  italic: 'italic font-bold text-site-green',
  bold: 'font-bold text-site-blue-dark',
}

function AutoText({ value, onChange, label, big }: { value: string; onChange: (v: string) => void; label: string; big?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      aria-label={label}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full resize-none overflow-hidden rounded-xl border border-site-blue/20 bg-white px-3.5 py-2.5 text-site-blue-dark outline-none transition-shadow focus:border-site-blue focus:ring-4 focus:ring-site-blue/15 ${big ? 'text-base leading-relaxed' : 'text-sm'}`}
    />
  )
}

/** A heading or paragraph made of parts, each with its own style. */
function StyledTextField({ segments, onChange, label }: { segments: Segment[]; onChange: (s: Segment[]) => void; label: string }) {
  const update = (i: number, next: Segment) => onChange(segments.map((s, j) => (j === i ? next : s)))
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-[#f4f8fb] px-4 py-3 text-lg leading-snug" aria-label="Preview">
        {segments.map((s, i) => (
          <span key={i} className={STYLE_PREVIEW[s.emphasis ?? 'plain']}>
            {s.text}
          </span>
        ))}
      </div>
      <p className="text-xs text-site-blue-dark/60">
        Type on the page or below. Each part can have its own style.
      </p>
      <ol className="space-y-2">
        {segments.map((s, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <div className="min-w-0 flex-1">
              <AutoText value={s.text} label={`${label}, part ${i + 1}`} onChange={(text) => update(i, { ...s, text })} />
            </div>
            <select
              value={s.emphasis ?? 'plain'}
              aria-label={`Style for part ${i + 1}`}
              onChange={(e) => {
                const emphasis = e.target.value as EmphasisOption
                update(i, emphasis === 'plain' ? { text: s.text } : { text: s.text, emphasis })
              }}
              className={`mt-1 w-[104px] shrink-0 cursor-pointer rounded-lg border border-site-blue/20 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-site-blue/20 ${STYLE_PREVIEW[s.emphasis ?? 'plain']}`}
            >
              {EMPHASES.map((e) => (
                <option key={e} value={e} className="font-normal text-site-blue-dark not-italic">
                  {STYLE_LABEL[e]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(segments.filter((_, j) => j !== i))}
              disabled={segments.length <= 1}
              aria-label={`Remove part ${i + 1}`}
              className="mt-1 shrink-0 rounded-lg p-1.5 text-site-blue-dark/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onChange([...segments, { text: ' ' }])}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-site-blue hover:bg-site-blue-light/40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add a part
      </button>
    </div>
  )
}

// ── the editor ──────────────────────────────────────────────────────

export function VisualEditor({ sections, pages }: { sections: EditorSection[]; pages: EditorPage[] }) {
  const byId = useMemo(() => Object.fromEntries(sections.map((s) => [s.id, s])) as Record<SectionId, EditorSection>, [sections])
  const [working, setWorking] = useState<Record<SectionId, Json>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.working])) as Record<SectionId, Json>,
  )
  const [published, setPublished] = useState<Record<SectionId, Json>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.published])) as Record<SectionId, Json>,
  )

  const [pagePath, setPagePath] = useState('/')
  const [frameSrc, setFrameSrc] = useState('/admin/content/preview?path=%2F')
  const [device, setDevice] = useState<Device>('desktop')
  const [mode, setMode] = useState<Mode>('edit')
  const [items, setItems] = useState<BridgeItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [frameReady, setFrameReady] = useState(false)

  const [saving, setSaving] = useState(0)
  const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'error'; text: string }>({ kind: 'idle', text: '' })
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [pending, startTransition] = useTransition()

  const frame = useRef<HTMLIFrameElement>(null)
  const timers = useRef(new Map<SectionId, number>())
  const latest = useRef(working)
  useEffect(() => {
    latest.current = working
  }, [working])

  const send = useCallback((message: Record<string, unknown>) => {
    frame.current?.contentWindow?.postMessage(message, window.location.origin)
  }, [])


  useEffect(() => {
    send({ type: 'cms:mode', mode })
  }, [mode, send])

  // ── editing ──
  const unpublished = useMemo(
    () => sections.reduce((n, s) => n + countEdits(working[s.id], published[s.id]), 0),
    [sections, working, published],
  )

  // Sections whose next save changes structure (parts added, removed or
  // restyled): the page is refreshed from the draft after saving. Plain
  // typing is already on the page, and a refresh would move the cursor.
  const structural = useRef(new Set<SectionId>())

  const scheduleSave = useCallback(
    (section: SectionId) => {
      const t = timers.current.get(section)
      if (t) window.clearTimeout(t)
      timers.current.set(
        section,
        window.setTimeout(async () => {
          timers.current.delete(section)
          setSaving((n) => n + 1)
          const result = await saveDraft(section, latest.current[section])
          setSaving((n) => n - 1)
          if (result.ok) {
            setStatus({ kind: 'ok', text: 'Draft saved' })
            if (structural.current.delete(section)) send({ type: 'cms:refresh' })
          } else {
            setStatus({ kind: 'error', text: result.error })
          }
        }, SAVE_DELAY),
      )
    },
    [send],
  )

  const flushSaves = async () => {
    const waiting = [...timers.current.keys()]
    for (const section of waiting) {
      window.clearTimeout(timers.current.get(section))
      timers.current.delete(section)
      await saveDraft(section, latest.current[section])
    }
  }

  const change = (key: string, value: Json, from: 'panel' | 'page' = 'panel') => {
    const path = parseKey(key)
    if (!path) return
    const section = path[0] as SectionId
    const before = getAt(latest.current[section], path.slice(1))
    const next = setAt(latest.current[section], path.slice(1), value)
    latest.current = { ...latest.current, [section]: next }
    setWorking(latest.current)
    const oldSegs = asSegments(before)
    const newSegs = asSegments(value)
    const shape = (segs: Segment[] | null) => (segs ? segs.map((x) => x.emphasis ?? 'plain').join(',') : '')
    if (shape(oldSegs) !== shape(newSegs)) structural.current.add(section)
    // Show the words on the page straight away (typing on the page is
    // already there); the draft save follows.
    if (from === 'panel') {
      const parts = typeof value === 'string' ? [value] : (newSegs ?? []).map((x) => x.text)
      if (parts.length) send({ type: 'cms:patch', key, parts })
    }
    scheduleSave(section)
  }

  // Text typed straight onto the page, as one string per styled part.
  const typedOnPage = useEffectEvent((key: string, parts: string[]) => {
    const path = parseKey(key)
    if (!path) return
    const current = getAt(latest.current[path[0] as SectionId], path.slice(1))
    if (typeof current === 'string') {
      change(key, parts.join(''), 'page')
      return
    }
    const segs = asSegments(current)
    // Only when the parts still line up; otherwise the side panel is the
    // place to restructure.
    if (segs && segs.length === parts.length) {
      change(key, segs.map((x, i) => ({ ...x, text: parts[i] })) as unknown as Json, 'page')
    }
  })

  // ── messages from the page ──
  useEffect(() => {
    const onMessage = (e: MessageEvent<{ type?: string; items?: BridgeItem[]; pathname?: string; key?: string | null; parts?: string[] }>) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return
      const msg = e.data
      if (msg?.type === 'cms:ready') {
        setFrameReady(true)
        send({ type: 'cms:mode', mode })
      } else if (msg?.type === 'cms:items' && msg.items) {
        setItems(msg.items)
      } else if (msg?.type === 'cms:selected') {
        setSelected(msg.key ?? null)
      } else if (msg?.type === 'cms:location' && msg.pathname) {
        setPagePath(msg.pathname)
      } else if (msg?.type === 'cms:input' && msg.key && msg.parts) {
        typedOnPage(msg.key, msg.parts)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [mode, send])

  const select = (key: string | null, scroll = false) => {
    setSelected(key)
    send({ type: 'cms:select', key, scroll })
  }

  const publish = () =>
    startTransition(async () => {
      await flushSaves()
      const result = await publishDrafts()
      if (result.ok) {
        setPublished(latest.current)
        setStatus({ kind: 'ok', text: 'Published. The website is up to date.' })
      } else setStatus({ kind: 'error', text: result.error })
    })

  const discard = () => {
    if (!confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    setConfirmDiscard(false)
    startTransition(async () => {
      for (const t of timers.current.values()) window.clearTimeout(t)
      timers.current.clear()
      const result = await discardDrafts()
      if (result.ok) {
        latest.current = published
        setWorking(published)
        send({ type: 'cms:refresh' })
        setStatus({ kind: 'ok', text: 'Changes discarded' })
      } else setStatus({ kind: 'error', text: result.error })
    })
  }

  const openPage = (path: string) => {
    setPagePath(path)
    setItems([])
    setSelected(null)
    setFrameReady(false)
    setFrameSrc(`/admin/content/preview?path=${encodeURIComponent(path)}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null)
        send({ type: 'cms:select', key: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [send])

  // Warn before leaving with a save still queued.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (timers.current.size > 0) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  // ── canvas sizing ──
  const stage = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ w: 1200, h: 800 })
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const width = DEVICE_WIDTH[device]
  const scale = Math.min(1, (stageSize.w - 24) / width)

  // ── the selected piece of copy ──
  const selPath = selected ? parseKey(selected) : null
  const selSection = selPath ? (selPath[0] as SectionId) : null
  const selValue = selPath && selSection ? getAt(working[selSection], selPath.slice(1)) : undefined
  const selLive = selPath && selSection ? getAt(published[selSection], selPath.slice(1)) : undefined
  const selOriginal = selPath && selSection ? getAt(byId[selSection].defaults, selPath.slice(1)) : undefined
  const selSegments = asSegments(selValue)

  const grouped = useMemo(() => {
    const groups = new Map<string, BridgeItem[]>()
    for (const item of items) {
      const path = parseKey(item.key)
      if (!path) continue
      const name = typeof path[1] === 'string' ? `${groupLabel(path[1])}` : sectionLabel(path[0] as SectionId)
      const list = groups.get(name) ?? []
      list.push(item)
      groups.set(name, list)
    }
    return [...groups.entries()]
  }, [items])

  const currentPage = pages.find((p) => p.path === pagePath)

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#e9eff4] text-site-blue-dark">
      {/* ── toolbar ── */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 bg-site-blue-dark px-3 py-2 text-white md:px-4">
        <div className="flex items-center gap-2 pr-1">
          <Image src="/logos/suds/icon-white.png" alt="" width={26} height={26} className="h-6 w-6" />
          <span className="hidden text-sm font-bold sm:inline">Site editor</span>
        </div>

        <label className="flex min-w-0 items-center gap-2">
          <span className="sr-only">Page</span>
          <select
            value={currentPage ? pagePath : ''}
            onChange={(e) => openPage(e.target.value)}
            className="max-w-[60vw] rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-site-blue-dark"
          >
            {currentPage ? null : <option value="">{pagePath}</option>}
            {pages.filter((p) => !p.group).map((p) => (
              <option key={p.path} value={p.path}>
                {p.label}
              </option>
            ))}
            <optgroup label="Product pages">
              {pages.filter((p) => p.group).map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <div role="radiogroup" aria-label="Mode" className="flex rounded-lg bg-white/10 p-0.5">
          {(['edit', 'browse'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              title={m === 'edit' ? 'Click text on the page to edit it' : 'Use the page normally: open tabs, slides and menus'}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${mode === m ? 'bg-white text-site-blue-dark' : 'text-white/80 hover:text-white'}`}
            >
              {m === 'edit' ? <MousePointerClick className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
              {m === 'edit' ? 'Edit' : 'Browse'}
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label="Screen size" className="hidden rounded-lg bg-white/10 p-0.5 md:flex">
          {(
            [
              ['desktop', Monitor, 'Desktop'],
              ['tablet', Tablet, 'Tablet'],
              ['mobile', Smartphone, 'Phone'],
            ] as const
          ).map(([d, Icon, label]) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={device === d}
              aria-label={label}
              title={label}
              onClick={() => setDevice(d)}
              className={`rounded-md px-2 py-1 ${device === d ? 'bg-white text-site-blue-dark' : 'text-white/80 hover:text-white'}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-white/75 lg:flex" role="status">
            {saving > 0 ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving draft
              </>
            ) : status.kind === 'error' ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-300" aria-hidden /> <span className="text-red-200">{status.text}</span>
              </>
            ) : status.kind === 'ok' ? (
              <>
                <Check className="h-3.5 w-3.5 text-site-ui-green" aria-hidden /> {status.text}
              </>
            ) : null}
          </span>
          <a
            href={pagePath}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Live page
          </a>
          {unpublished > 0 ? (
            <button
              type="button"
              onClick={discard}
              onBlur={() => setConfirmDiscard(false)}
              disabled={pending}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${confirmDiscard ? 'bg-red-600 text-white' : 'text-white/80 hover:bg-white/10'}`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {confirmDiscard ? 'Click again to discard' : 'Discard'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={publish}
            disabled={pending || unpublished === 0}
            className="flex items-center gap-1.5 rounded-lg bg-site-green px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-site-green-dark disabled:bg-white/15 disabled:text-white/50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Check className="h-3.5 w-3.5" aria-hidden />}
            {unpublished > 0 ? `Publish ${unpublished} change${unpublished === 1 ? '' : 's'}` : 'All published'}
          </button>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* ── canvas ── */}
        <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className="absolute top-3 left-1/2 origin-top overflow-hidden rounded-lg bg-white shadow-[0_8px_40px_rgba(0,55,85,0.18)] ring-1 ring-black/5"
            style={{ width, height: (stageSize.h - 24) / scale, transform: `translateX(-50%) scale(${scale})` }}
          >
            <iframe ref={frame} key={frameSrc} src={frameSrc} title="Page preview" className="h-full w-full border-0" />
          </div>
          {!frameReady ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow">
                <Loader2 className="h-4 w-4 animate-spin text-site-blue" aria-hidden /> Loading page
              </span>
            </div>
          ) : null}
        </div>

        {/* ── side panel ── */}
        <aside className="flex max-h-[48dvh] min-h-0 w-full shrink-0 flex-col border-t border-site-blue/10 bg-white md:max-h-none md:w-[380px] md:border-t-0 md:border-l">
          {selPath && selSection && selValue !== undefined ? (
            <>
              <div className="flex items-start gap-3 border-b border-site-blue/10 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wider text-site-blue uppercase">{sectionLabel(selSection)}</p>
                  <h2 className="mt-0.5 text-base leading-snug font-bold">{pathLabel(selPath)}</h2>
                </div>
                <button type="button" onClick={() => select(null)} aria-label="Close" className="rounded-full p-1.5 text-site-blue-dark/50 hover:bg-[#eef4f8]">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {typeof selValue === 'string' ? (
                  <AutoText value={selValue} big label={pathLabel(selPath)} onChange={(v) => selected && change(selected, v)} />
                ) : selSegments ? (
                  <StyledTextField segments={selSegments} label={pathLabel(selPath)} onChange={(s) => selected && change(selected, s as unknown as Json)} />
                ) : (
                  <p className="text-sm text-site-blue-dark/70">This piece of the page is not text that can be edited here.</p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-site-blue/10 pt-4">
                  {JSON.stringify(selValue) !== JSON.stringify(selLive) && selLive !== undefined ? (
                    <button
                      type="button"
                      onClick={() => selected && change(selected, selLive)}
                      className="flex items-center gap-1.5 rounded-full bg-[#eef4f8] px-3 py-1.5 text-xs font-bold hover:bg-site-blue-light/60"
                    >
                      <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo my changes
                    </button>
                  ) : null}
                  {JSON.stringify(selValue) !== JSON.stringify(selOriginal) && selOriginal !== undefined ? (
                    <button
                      type="button"
                      onClick={() => selected && change(selected, selOriginal)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-site-blue-dark/70 hover:bg-[#eef4f8]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Original wording
                    </button>
                  ) : null}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-site-blue-dark/55">
                  Changes show on the page as you type and are kept as a draft. Nothing changes for visitors until you press Publish.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-site-blue/10 px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <MousePointerClick className="h-4 w-4 text-site-blue" aria-hidden />
                  {mode === 'edit' ? 'Click any text to change it' : 'Browsing the page'}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-site-blue-dark/65">
                  {mode === 'edit'
                    ? 'Hover over the page to see what can be edited. Some text sits in tabs, slides or menus: switch to Browse to open them, then back to Edit.'
                    : 'Click through tabs, slides and menus as a visitor would. Switch back to Edit to change the text.'}
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <p className="px-2 pb-2 text-[11px] font-bold tracking-wider text-site-blue-dark/50 uppercase">On this page</p>
                {grouped.length === 0 ? (
                  <p className="px-2 text-sm text-site-blue-dark/55">{frameReady ? 'No editable text found on this page.' : 'Loading...'}</p>
                ) : (
                  grouped.map(([group, list]) => (
                    <div key={group} className="mb-3">
                      <p className="px-2 py-1 text-xs font-bold text-site-blue">{group}</p>
                      <ul>
                        {list.map((item) => {
                          const path = parseKey(item.key)
                          const edited =
                            path && countEdits(getAt(working[path[0] as SectionId], path.slice(1)), getAt(published[path[0] as SectionId], path.slice(1))) > 0
                          return (
                            <li key={item.key}>
                              <button
                                type="button"
                                onClick={() => select(item.key, true)}
                                onMouseEnter={() => send({ type: 'cms:hover', key: item.key })}
                                onMouseLeave={() => send({ type: 'cms:hover', key: null })}
                                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[#eef4f8]"
                              >
                                <span className="min-w-0 flex-1 truncate">{item.text || item.label}</span>
                                {edited ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-site-green" title="Changed, not yet published" /> : null}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
