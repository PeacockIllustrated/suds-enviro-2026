'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { decodeText, hasMarker, type ContentPath } from '@/lib/site-content/stega'
import { pathLabel } from '@/lib/site-content/labels'

/**
 * The visual editor's hands inside the page.
 *
 * Mounted only in draft mode. When the page is framed by the editor it:
 * - reads the invisible markers out of the text (lib/site-content/stega)
 *   and tags each element with the piece of copy it shows,
 * - outlines what the pointer is over and what is selected, Webflow style,
 * - tells the editor what was clicked, and what copy is on the page,
 * - takes typing from the editor and shows it straight away, and
 *   refreshes from the draft when the editor asks.
 *
 * Opened outside the editor (Sean browsing the site with draft mode still
 * on), it only shows a small bar to leave the draft view.
 */

type Mode = 'edit' | 'browse'

type FromEditor =
  | { type: 'cms:mode'; mode: Mode }
  | { type: 'cms:select'; key: string | null; scroll?: boolean }
  | { type: 'cms:hover'; key: string | null }
  | { type: 'cms:patch'; key: string; parts: string[] }
  | { type: 'cms:refresh' }
  | { type: 'cms:inline'; enabled: boolean }

export interface BridgeItem {
  key: string
  label: string
  text: string
}

const ACCENT = '#1d80b9'

function keyOf(path: ContentPath): string {
  return JSON.stringify(path)
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TEXTAREA', 'TITLE'])

/**
 * The elements a piece of copy shows in. Usually one; text repeated on the
 * page (the header's desktop and mobile menus) gives one per place. A rich
 * text run is split into spans, so a span whose parent holds more of the
 * same run is lifted to that parent: clicking any word selects the heading.
 */
function elementsFor(nodes: Text[]): Element[] {
  const out = new Set<Element>()
  for (const node of nodes) {
    let el = node.parentElement
    if (!el) continue
    const parent = el.parentElement
    if (el.tagName === 'SPAN' && parent && nodes.some((n) => n !== node && parent.contains(n))) el = parent
    out.add(el)
  }
  return [...out]
}

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

function makeBox(style: string): HTMLDivElement {
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = `position:fixed;pointer-events:none;z-index:2147483646;border-radius:4px;display:none;${style}`
  const tag = document.createElement('span')
  tag.style.cssText = `position:absolute;left:-2px;bottom:100%;margin-bottom:4px;white-space:nowrap;font:600 11px/1.2 Montserrat,system-ui,sans-serif;color:#fff;background:${ACCENT};padding:3px 7px;border-radius:4px;max-width:320px;overflow:hidden;text-overflow:ellipsis`
  box.appendChild(tag)
  document.body.appendChild(box)
  return box
}

function place(box: HTMLDivElement, el: Element | null, label?: string) {
  if (!el || !el.isConnected) {
    box.style.display = 'none'
    return
  }
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) {
    box.style.display = 'none'
    return
  }
  box.style.display = 'block'
  box.style.left = `${r.left - 4}px`
  box.style.top = `${r.top - 3}px`
  box.style.width = `${r.width + 8}px`
  box.style.height = `${r.height + 6}px`
  const tag = box.firstChild as HTMLSpanElement
  if (label !== undefined) tag.textContent = label
  // Keep the label on screen at the very top of the page.
  tag.style.bottom = r.top < 26 ? 'auto' : '100%'
  tag.style.top = r.top < 26 ? '100%' : 'auto'
  tag.style.marginTop = r.top < 26 ? '4px' : '0'
}

const noSubscribe = () => () => {}
const isFramed = () => window.parent !== window
const notFramed = () => false

export function EditBridge() {
  const router = useRouter()
  const pathname = usePathname()
  const framed = useSyncExternalStore(noSubscribe, isFramed, notFramed)
  const state = useRef({
    mode: 'edit' as Mode,
    nodes: new Map<string, Set<Text>>(),
    elements: new Map<string, Element[]>(),
    hovered: null as { key: string; el: Element } | null,
    selected: null as { key: string; el: Element | null } | null,
    editing: null as HTMLElement | null,
    inline: true,
  })

  useEffect(() => {
    if (!framed) return
    const s = state.current
    const post = (message: Record<string, unknown>) => window.parent.postMessage(message, window.location.origin)
    const hoverBox = makeBox(`outline:2px dashed ${ACCENT};outline-offset:0;background:rgba(29,128,185,0.04)`)
    const selectBox = makeBox(`outline:2px solid ${ACCENT};outline-offset:0;background:rgba(29,128,185,0.06)`)

    const labelFor = (key: string) => {
      try {
        return pathLabel(JSON.parse(key) as ContentPath)
      } catch {
        return ''
      }
    }

    /** The first place a piece of copy is showing, for selections made from the list. */
    const shownAt = (key: string): Element | null => (s.elements.get(key) ?? []).find(visible) ?? null

    // ── find the copy on the page ──
    let lastItems = ''
    const scan = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.parentElement && !SKIP.has(n.parentElement.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      })
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text
        if (!hasMarker(text.data)) continue
        const { clean, paths } = decodeText(text.data)
        text.data = clean
        for (const path of paths) {
          const key = keyOf(path)
          const set = s.nodes.get(key) ?? new Set<Text>()
          set.add(text)
          s.nodes.set(key, set)
        }
      }
      for (const el of document.querySelectorAll('[data-cms]')) el.removeAttribute('data-cms')
      s.elements.clear()
      for (const [key, set] of s.nodes) {
        for (const node of [...set]) if (!node.isConnected) set.delete(node)
        if (set.size === 0) {
          s.nodes.delete(key)
          continue
        }
        const els = elementsFor([...set])
        s.elements.set(key, els)
        for (const el of els) el.setAttribute('data-cms', key)
      }
      // A refresh can replace the selected element; find it again.
      if (s.selected && !s.selected.el?.isConnected) s.selected = { key: s.selected.key, el: shownAt(s.selected.key) }
      if (s.hovered && !s.hovered.el.isConnected) s.hovered = null
      if (s.editing && !s.editing.isConnected) startEditing(s.selected?.el ?? null)
      const items: BridgeItem[] = []
      for (const [key, els] of s.elements) {
        const el = els.find((e) => !e.closest('[aria-hidden="true"]'))
        if (!el) continue
        items.push({ key, label: labelFor(key), text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 90) })
      }
      const serial = JSON.stringify(items)
      if (serial !== lastItems) {
        lastItems = serial
        post({ type: 'cms:items', items, pathname: window.location.pathname })
      }
      draw()
    }

    const draw = () => {
      const edit = s.mode === 'edit'
      const hover = edit && s.hovered && s.hovered.el !== s.selected?.el ? s.hovered : null
      place(hoverBox, hover?.el ?? null, hover ? labelFor(hover.key) : '')
      place(selectBox, edit && s.selected ? s.selected.el : null, s.selected ? labelFor(s.selected.key) : '')
    }

    const hit = (target: EventTarget | null): { key: string; el: Element } | null => {
      if (!(target instanceof Node)) return null
      let best: { key: string; el: Element } | null = null
      let bestSize = Infinity
      // The smallest tagged element containing the target wins, so a word
      // inside a card selects that text, not the whole card.
      for (const [key, els] of s.elements) {
        for (const el of els) {
          if (!el.contains(target)) continue
          const r = el.getBoundingClientRect()
          const size = r.width * r.height
          if (size < bestSize) {
            best = { key, el }
            bestSize = size
          }
        }
      }
      return best
    }

    // ── typing on the page ──
    // The selected text becomes editable in place. What is typed goes to
    // the editor as the list of text parts (one per styled span), so the
    // side panel and the draft stay in step. Structure (adding parts,
    // changing styles) is left to the side panel.
    const stopEditing = () => {
      if (!s.editing) return
      s.editing.removeAttribute('contenteditable')
      s.editing.style.outline = ''
      s.editing = null
    }
    const startEditing = (el: Element | null) => {
      stopEditing()
      if (!s.inline || s.mode !== 'edit' || !(el instanceof HTMLElement) || !s.selected) return
      el.setAttribute('contenteditable', 'plaintext-only')
      el.style.outline = 'none'
      s.editing = el
    }
    const partsOf = (key: string, root: Element): string[] =>
      [...(s.nodes.get(key) ?? [])]
        .filter((n) => n.isConnected && root.contains(n))
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map((n) => n.data)
    const onInput = (e: Event) => {
      const el = s.editing
      if (!el || !s.selected || !(e.target instanceof Node) || !el.contains(e.target)) return
      // Typing can leave a stray text node when a span is emptied; pick the
      // new nodes up so the parts still line up.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      const set = s.nodes.get(s.selected.key) ?? new Set<Text>()
      for (let n = walker.nextNode(); n; n = walker.nextNode()) set.add(n as Text)
      s.nodes.set(s.selected.key, set)
      post({ type: 'cms:input', key: s.selected.key, parts: partsOf(s.selected.key, el) })
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (!s.editing) return
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        s.editing.blur()
        stopEditing()
        if (e.key === 'Escape') {
          s.selected = null
          post({ type: 'cms:selected', key: null })
        }
        draw()
      }
    }

    // ── pointer ──
    const onOver = (e: MouseEvent) => {
      if (s.mode !== 'edit') return
      const found = hit(e.target)
      if (found?.el !== s.hovered?.el) {
        s.hovered = found
        draw()
      }
    }
    const onLeave = () => {
      s.hovered = null
      draw()
    }
    const onClick = (e: MouseEvent) => {
      if (s.mode !== 'edit') return
      // In edit mode the page is a canvas: links and buttons do not fire.
      e.preventDefault()
      e.stopPropagation()
      if (s.editing && e.target instanceof Node && s.editing.contains(e.target)) return
      const found = hit(e.target)
      if (found && s.editing && found.el === s.editing) return
      s.selected = found
      startEditing(found?.el ?? null)
      if (s.editing) s.editing.focus()
      draw()
      post({ type: 'cms:selected', key: found?.key ?? null })
    }
    const block = (e: Event) => {
      if (s.mode === 'edit') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // ── messages from the editor ──
    const onMessage = (e: MessageEvent<FromEditor>) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return
      const msg = e.data
      if (!msg || typeof msg !== 'object') return
      if (msg.type === 'cms:mode') {
        s.mode = msg.mode
        if (s.mode !== 'edit') stopEditing()
        draw()
      } else if (msg.type === 'cms:select') {
        const keep = msg.key && s.selected?.key === msg.key && s.selected.el?.isConnected ? s.selected.el : null
        const el = msg.key ? keep ?? shownAt(msg.key) : null
        s.selected = msg.key ? { key: msg.key, el } : null
        if (el !== s.editing) startEditing(el)
        if (el && msg.scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        draw()
      } else if (msg.type === 'cms:hover') {
        const el = msg.key ? shownAt(msg.key) : null
        s.hovered = msg.key && el ? { key: msg.key, el } : null
        draw()
      } else if (msg.type === 'cms:patch') {
        // Instant preview of typing: same number of parts, same order.
        const nodes = [...(s.nodes.get(msg.key) ?? [])].filter((n) => n.isConnected && !(s.editing && document.activeElement === s.editing && s.editing.contains(n)))
        nodes.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        if (nodes.length === msg.parts.length) nodes.forEach((n, i) => n.data !== msg.parts[i] && (n.data = msg.parts[i]))
        draw()
      } else if (msg.type === 'cms:refresh') {
        router.refresh()
      } else if (msg.type === 'cms:inline') {
        s.inline = msg.enabled
        if (!s.inline) stopEditing()
      }
    }

    let queued = 0
    const observer = new MutationObserver(() => {
      if (queued) return
      queued = window.setTimeout(() => {
        queued = 0
        scan()
      }, 60)
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })

    let raf = 0
    const follow = () => {
      draw()
      raf = requestAnimationFrame(follow)
    }
    raf = requestAnimationFrame(follow)

    document.addEventListener('mouseover', onOver, true)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', block, true)
    document.addEventListener('input', onInput, true)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('message', onMessage)
    scan()
    post({ type: 'cms:ready', pathname: window.location.pathname })

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(queued)
      document.removeEventListener('mouseover', onOver, true)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', block, true)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('message', onMessage)
      stopEditing()
      hoverBox.remove()
      selectBox.remove()
    }
  }, [framed, router])

  // Tell the editor where the canvas has navigated to (browse mode).
  useEffect(() => {
    if (framed) window.parent.postMessage({ type: 'cms:location', pathname }, window.location.origin)
  }, [framed, pathname])

  if (framed) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-3 bg-site-blue-dark px-4 py-2.5 text-sm text-white">
      <span>You are viewing unpublished changes.</span>
      <a href={`/admin/content/exit-preview?path=${encodeURIComponent(pathname)}`} className="rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wider text-site-blue-dark uppercase">
        View live site
      </a>
      <a href="/admin/content" className="rounded-full border border-white/40 px-3 py-1 text-xs font-bold tracking-wider uppercase">
        Back to editor
      </a>
    </div>
  )
}
