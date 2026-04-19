'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { getPriorityStyle } from '@/lib/review-colors'

interface FeedbackPin {
  id: string
  x: number
  y: number
  priority: string
}

interface PhoneFrameProps {
  src: string
  commentMode: boolean
  pins: FeedbackPin[]
  selectedPinId: string | null
  onPinPlace: (x: number, y: number) => void
  onPinClick: (id: string) => void
  onUrlChange: (url: string) => void
}

const PHONE_W = 390
const PHONE_H = 780
const STATUS_BAR_H = 50
const HOME_BAR_H = 22
const CONTENT_H = PHONE_H - STATUS_BAR_H - HOME_BAR_H // viewport height of the iframe

export function PhoneFrame({
  src,
  commentMode,
  pins,
  selectedPinId,
  onPinPlace,
  onPinClick,
  onUrlChange,
}: PhoneFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  // Hold latest callbacks in refs so the URL-tracking effect doesn't restart
  // every time the parent re-renders.
  const onUrlChangeRef = useRef(onUrlChange)
  onUrlChangeRef.current = onUrlChange
  // Initial src is locked once - parent currentUrl changes shouldn't reload the iframe.
  const initialSrc = useRef(src)
  const [displayUrl, setDisplayUrl] = useState(src)
  const [scrollY, setScrollY] = useState(0)
  const [contentHeight, setContentHeight] = useState(CONTENT_H)

  // Track iframe scroll position and detect client-side navigation
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let animFrame: number
    let scrollCleanup: (() => void) | null = null

    const measureContent = (doc: Document | null): number => {
      if (!doc) return CONTENT_H
      // scrollHeight reflects total content; clientHeight is the viewport.
      // Use the larger so a page that doesn't scroll still places pins relative
      // to its visible area.
      const sh = doc.documentElement.scrollHeight || 0
      return Math.max(sh, CONTENT_H)
    }

    const attachScrollListener = () => {
      try {
        const win = iframe.contentWindow
        const doc = iframe.contentDocument
        if (!win || !doc) return

        const onScroll = () => {
          if (animFrame) cancelAnimationFrame(animFrame)
          animFrame = requestAnimationFrame(() => {
            setScrollY(win.scrollY || 0)
            setContentHeight(measureContent(doc))
          })
        }

        win.addEventListener('scroll', onScroll, { passive: true })
        // Re-measure content height on resize (lazy images, dynamic content reflow)
        win.addEventListener('resize', onScroll, { passive: true })
        onScroll()

        scrollCleanup = () => {
          win.removeEventListener('scroll', onScroll)
          win.removeEventListener('resize', onScroll)
          if (animFrame) cancelAnimationFrame(animFrame)
        }
      } catch {
        // Cross-origin - can't observe
      }
    }

    // Read wizard step from iframe DOM. Looks for an element matching the
    // wizard's "STEP N" label, which is rendered as a small uppercase tag.
    const getStepSuffix = (doc: Document | null): string => {
      if (!doc) return ''
      try {
        // Heuristic: walk small leaf elements looking for "Step N" or "STEP N"
        const nodes = doc.querySelectorAll('div, span, p')
        for (let i = 0; i < nodes.length && i < 200; i++) {
          const el = nodes[i]
          if (el.children.length !== 0) continue
          const txt = el.textContent?.trim() || ''
          const match = txt.match(/^step\s+(\d+)$/i)
          if (match) return `#step-${match[1]}`
        }
      } catch { /* ignore */ }
      return ''
    }

    let lastFullPath = ''
    const checkUrl = () => {
      try {
        const win = iframe.contentWindow
        const doc = iframe.contentDocument
        const pathname = win?.location.pathname
        if (!pathname) return

        const stepSuffix = getStepSuffix(doc)
        const fullPath = pathname + stepSuffix

        if (fullPath !== lastFullPath) {
          lastFullPath = fullPath
          setDisplayUrl(pathname)
          onUrlChangeRef.current(fullPath)
          setScrollY(0)
          setContentHeight(measureContent(doc))
          if (scrollCleanup) scrollCleanup()
          attachScrollListener()
        }
      } catch {
        // Cross-origin
      }
    }

    // Poll every 400ms (covers App Router client-nav + dynamic step changes)
    const pollInterval = setInterval(checkUrl, 400)

    // Also listen for hashchange and popstate inside the iframe for instant
    // detection where the browser fires events.
    const attachNavListeners = () => {
      try {
        const win = iframe.contentWindow
        if (!win) return
        win.addEventListener('hashchange', checkUrl)
        win.addEventListener('popstate', checkUrl)
      } catch { /* cross-origin */ }
    }

    iframe.addEventListener('load', () => {
      attachScrollListener()
      attachNavListeners()
      checkUrl()
    })
    // Initial pass for already-loaded iframe (HMR, SSR cache)
    attachScrollListener()
    attachNavListeners()
    checkUrl()

    return () => {
      clearInterval(pollInterval)
      if (scrollCleanup) scrollCleanup()
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [])

  // Place a pin. Always re-measure content height at click time so we never
  // store coordinates against a stale or zero contentHeight.
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!commentMode || !overlayRef.current) return

      const rect = overlayRef.current.getBoundingClientRect()
      const xPct = ((e.clientX - rect.left) / rect.width) * 100

      // Live-measure content height at click time
      let liveContent = contentHeight
      try {
        const doc = iframeRef.current?.contentDocument
        if (doc) {
          liveContent = Math.max(doc.documentElement.scrollHeight || 0, CONTENT_H)
        }
      } catch { /* cross-origin */ }

      const clickYInViewport = e.clientY - rect.top
      const clickYInContent = clickYInViewport + scrollY
      const yPct = (clickYInContent / liveContent) * 100

      // Clamp to safe range
      const cx = Math.max(0, Math.min(100, xPct))
      const cy = Math.max(0, Math.min(100, yPct))

      onPinPlace(
        Math.round(cx * 100) / 100,
        Math.round(cy * 100) / 100
      )
    },
    [commentMode, onPinPlace, scrollY, contentHeight]
  )

  const handleIframeLoad = useCallback(() => {
    setScrollY(0)
  }, [])

  const handleBack = () => {
    try { iframeRef.current?.contentWindow?.history.back() } catch { /* */ }
  }
  const handleForward = () => {
    try { iframeRef.current?.contentWindow?.history.forward() } catch { /* */ }
  }
  const handleReload = () => {
    try { iframeRef.current?.contentWindow?.location.reload() } catch { /* */ }
  }

  // Convert a pin's content-based Y% to a pixel offset within the viewport,
  // accounting for current scroll position.
  const pinTopPx = (pinYPercent: number): number => {
    const totalHeight = contentHeight > 0 ? contentHeight : CONTENT_H
    const contentPx = (pinYPercent / 100) * totalHeight
    return contentPx - scrollY
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone device */}
      <div
        className="relative overflow-hidden rounded-[46px] border-[3px] shadow-2xl"
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderColor: '#1a3a50',
          backgroundColor: '#000',
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-[30px] w-[150px] -translate-x-1/2 rounded-b-2xl bg-black" />

        {/* Status bar */}
        <div
          className="relative z-10 flex items-end justify-between bg-navy px-6 pb-1.5"
          style={{ height: STATUS_BAR_H }}
        >
          <span className="text-[12px] font-semibold text-white">9:41</span>
          <span className="text-[11px] font-bold text-white/80">SuDS Enviro</span>
          <div className="flex items-center gap-1">
            <div className="h-[10px] w-[10px] rounded-full border border-white/60" />
            <div className="h-[10px] w-[10px] rounded-full border border-white/60" />
          </div>
        </div>

        {/* Content area (iframe + pin overlay) */}
        <div className="relative" style={{ height: CONTENT_H }}>
          <iframe
            ref={iframeRef}
            src={initialSrc.current}
            onLoad={handleIframeLoad}
            className="h-full w-full border-0 bg-white"
            title="App preview"
          />

          {/* Pin overlay - clips pins that scroll out of view */}
          <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className={`absolute inset-0 z-10 overflow-hidden ${
              commentMode
                ? 'cursor-crosshair pointer-events-auto'
                : 'pointer-events-none'
            }`}
          >
            {/* Existing pins - clickable when not in comment mode */}
            {pins.map((pin, idx) => {
              const topPx = pinTopPx(pin.y)
              if (topPx < -16 || topPx > CONTENT_H + 16) return null
              const isSelected = selectedPinId === pin.id
              const style = getPriorityStyle(pin.priority)
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (commentMode) return
                    onPinClick(pin.id)
                  }}
                  title={`Pin ${idx + 1} - ${pin.priority}`}
                  className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white shadow-md transition-all hover:scale-110
                    ${style.pin}
                    ${commentMode ? 'pointer-events-none opacity-60' : 'pointer-events-auto cursor-pointer'}
                    ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-navy scale-125' : ''}
                  `}
                  style={{
                    left: `${pin.x}%`,
                    top: `${topPx}px`,
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}

            {/* Comment mode indicator */}
            {commentMode && (
              <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-green/60" />
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex items-center justify-center bg-black" style={{ height: HOME_BAR_H }}>
          <div className="h-[4px] w-[100px] rounded-full bg-white/30" />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-light hover:text-ink"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleForward}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-light hover:text-ink"
          title="Forward"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReload}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-light hover:text-ink"
          title="Reload"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <div
          className="ml-1 max-w-[180px] truncate rounded-lg border border-border bg-white px-3 py-2 text-[12px] font-medium text-muted"
          title={displayUrl}
        >
          {displayUrl}
        </div>
      </div>
    </div>
  )
}
