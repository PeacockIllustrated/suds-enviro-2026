'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

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
  onPinPlace: (x: number, y: number) => void
  onUrlChange: (url: string) => void
}

const PIN_COLOURS: Record<string, string> = {
  low: 'bg-blue border-blue',
  medium: 'bg-amber-400 border-amber-500',
  high: 'bg-red-500 border-red-600',
  critical: 'bg-purple-500 border-purple-600',
}

export function PhoneFrame({
  src,
  commentMode,
  pins,
  onPinPlace,
  onUrlChange,
}: PhoneFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Track iframe scroll position so pins stay anchored to content
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let animFrame: number
    let cleanup: (() => void) | null = null

    const attachScrollListener = () => {
      try {
        const win = iframe.contentWindow
        const doc = iframe.contentDocument
        if (!win || !doc) return

        const onScroll = () => {
          animFrame = requestAnimationFrame(() => {
            setScrollY(win.scrollY || 0)
            setContentHeight(doc.documentElement.scrollHeight || 0)
            setViewportHeight(win.innerHeight || 0)
          })
        }

        win.addEventListener('scroll', onScroll, { passive: true })
        // Initial read
        onScroll()

        cleanup = () => {
          win.removeEventListener('scroll', onScroll)
          if (animFrame) cancelAnimationFrame(animFrame)
        }
      } catch {
        // Cross-origin - can't attach listener
      }
    }

    iframe.addEventListener('load', attachScrollListener)
    // Also try immediately in case iframe is already loaded
    attachScrollListener()

    return () => {
      iframe.removeEventListener('load', attachScrollListener)
      if (cleanup) cleanup()
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [src])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!commentMode || !overlayRef.current) return

      const rect = overlayRef.current.getBoundingClientRect()
      // X is a percentage of viewport width (doesn't scroll horizontally)
      const x = ((e.clientX - rect.left) / rect.width) * 100
      // Y needs to account for scroll: convert click position to content position
      const clickYInViewport = e.clientY - rect.top
      const clickYInContent = clickYInViewport + scrollY
      // Store as pixel offset from top of content, not percentage of viewport
      // We'll use negative values as a sentinel that this is a px-based pin
      // Actually, let's store as percentage of total content height for consistency
      const totalHeight = contentHeight > 0 ? contentHeight : rect.height
      const y = (clickYInContent / totalHeight) * 100

      onPinPlace(
        Math.round(x * 100) / 100,
        Math.round(y * 100) / 100
      )
    },
    [commentMode, onPinPlace, scrollY, contentHeight]
  )

  const handleIframeLoad = useCallback(() => {
    try {
      const iframe = iframeRef.current
      if (!iframe?.contentWindow) return
      const pathname = iframe.contentWindow.location.pathname
      onUrlChange(pathname)
      // Reset scroll tracking
      setScrollY(0)
      const doc = iframe.contentDocument
      if (doc) {
        setContentHeight(doc.documentElement.scrollHeight || 0)
        setViewportHeight(iframe.contentWindow.innerHeight || 0)
      }
    } catch {
      // Cross-origin restriction
    }
  }, [onUrlChange])

  const handleBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back()
    } catch {
      // Ignore cross-origin errors
    }
  }

  const handleForward = () => {
    try {
      iframeRef.current?.contentWindow?.history.forward()
    } catch {
      // Ignore cross-origin errors
    }
  }

  const handleReload = () => {
    try {
      iframeRef.current?.contentWindow?.location.reload()
    } catch {
      // Ignore cross-origin errors
    }
  }

  // Convert a pin's content-based Y% to a pixel offset in the overlay,
  // accounting for current scroll position
  const pinTopPx = (pinYPercent: number): number => {
    const totalHeight = contentHeight > 0 ? contentHeight : viewportHeight || 700
    const contentPx = (pinYPercent / 100) * totalHeight
    return contentPx - scrollY
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone device */}
      <div
        className="relative overflow-hidden rounded-[46px] border-[3px] shadow-2xl"
        style={{
          width: 390,
          height: 780,
          borderColor: '#1a3a50',
          backgroundColor: '#000',
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-[30px] w-[150px] -translate-x-1/2 rounded-b-2xl bg-black" />

        {/* Status bar */}
        <div className="relative z-10 flex h-[50px] items-end justify-between bg-navy px-6 pb-1.5">
          <span className="text-[12px] font-semibold text-white">9:41</span>
          <span className="text-[11px] font-bold text-white/80">
            SuDS Enviro
          </span>
          <div className="flex items-center gap-1">
            <div className="h-[10px] w-[10px] rounded-full border border-white/60" />
            <div className="h-[10px] w-[10px] rounded-full border border-white/60" />
          </div>
        </div>

        {/* Content area (iframe + pin overlay) */}
        <div className="relative" style={{ height: 'calc(100% - 72px)' }}>
          <iframe
            ref={iframeRef}
            src={src}
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
            {/* Render existing pins positioned relative to content */}
            {pins.map((pin) => {
              const topPx = pinTopPx(pin.y)
              // Hide pins that are scrolled out of view
              if (topPx < -10 || topPx > (viewportHeight || 700) + 10) return null
              return (
                <div
                  key={pin.id}
                  className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md ${
                    PIN_COLOURS[pin.priority] || PIN_COLOURS.medium
                  }`}
                  style={{
                    left: `${pin.x}%`,
                    top: `${topPx}px`,
                  }}
                />
              )
            })}

            {/* Comment mode indicator */}
            {commentMode && (
              <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-green/60" />
            )}
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex h-[22px] items-center justify-center bg-black">
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
        <div className="ml-1 rounded-lg border border-border bg-white px-3 py-2 text-[12px] font-medium text-muted">
          {src}
        </div>
      </div>
    </div>
  )
}
