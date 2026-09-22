'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Box, Eye, EyeOff, Move3d, X } from 'lucide-react'
import type { ProductModel } from '@/lib/content/product-models'

const ProductModelCanvas = dynamic(() => import('./three/ProductModelCanvas'), { ssr: false })

/**
 * One product model from the 3D library, in the site's toon style.
 *
 * Desktop (992px and up) gets an inline canvas, mounted lazily once the
 * frame is near the viewport and the browser is idle. Hovering the model
 * fades its casing to show the insides, and a toggle does the same for
 * keyboard and touch. Below the tablet breakpoint no canvas is mounted in
 * the page: the library thumbnail stands in, and "View in 3D" opens a
 * full-screen viewer.
 */

interface ProductModelViewerProps {
  model: ProductModel
  /** `hero` is the tall stage beside the page intro; `card` sits in a grid. */
  size?: 'hero' | 'card'
}

const DESKTOP_QUERY = '(min-width: 992px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const HOVER_QUERY = '(hover: hover) and (pointer: fine)'

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** The library keeps a thumbnail beside each glb. */
function posterFor(model: ProductModel): string {
  return model.url.replace(/\.glb$/, '.png')
}

function hasCasing(model: ProductModel): boolean {
  return Object.values(model.roles).includes('casing')
}

/**
 * True once `ref` has come within a screen of the viewport and the
 * browser has had an idle moment, following HeroChamberMount.
 */
function useNearAndIdle(ref: React.RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!enabled || ready || !el) return

    let idleHandle: number | null = null
    let timeoutHandle: number | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        // requestIdleCallback is missing on older Safari.
        const requestIdle: typeof window.requestIdleCallback | undefined =
          window.requestIdleCallback
        if (typeof requestIdle === 'function') {
          idleHandle = requestIdle(() => setReady(true), { timeout: 1500 })
        } else {
          timeoutHandle = window.setTimeout(() => setReady(true), 300)
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      if (idleHandle !== null) window.cancelIdleCallback(idleHandle)
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle)
    }
  }, [ref, enabled, ready])

  return ready
}

/** Whether `ref` is on screen, so an off-screen canvas can stop drawing. */
function useOnScreen(ref: React.RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (entry) setOnScreen(entry.isIntersecting)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, enabled])
  return onScreen
}

function RevealToggle({
  revealed,
  onToggle,
  className = '',
}: {
  revealed: boolean
  onToggle: () => void
  className?: string
}) {
  const Icon = revealed ? EyeOff : Eye
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border-[3px] border-site-blue-light bg-white px-4 py-1.5 text-xs font-bold tracking-wider text-site-blue uppercase italic shadow-sm transition-colors hover:bg-site-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-blue ${className}`}
    >
      <Icon aria-hidden className="size-4" />
      {revealed ? 'Hide inside' : 'Show inside'}
    </button>
  )
}

function Poster({ model, hidden, priority }: { model: ProductModel; hidden?: boolean; priority?: boolean }) {
  return (
    <Image
      src={posterFor(model)}
      alt=""
      width={512}
      height={512}
      priority={priority}
      className={`pointer-events-none absolute inset-0 m-auto h-full w-full object-contain p-4 transition-opacity duration-500 ${
        hidden ? 'opacity-0' : 'opacity-100'
      }`}
    />
  )
}

/** The live canvas plus its poster, reveal state and toggle. */
function Stage({
  model,
  paused,
  hoverReveal,
  toggleClassName,
  priorityPoster,
}: {
  model: ProductModel
  paused: boolean
  hoverReveal: boolean
  toggleClassName: string
  priorityPoster?: boolean
}) {
  const reduced = useMediaQuery(REDUCED_QUERY)
  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [toggled, setToggled] = useState(false)
  const casing = hasCasing(model)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <>
      <Poster model={model} hidden={ready} priority={priorityPoster} />
      {!ready ? (
        <span className="absolute inset-x-0 bottom-4 text-center text-[11px] font-bold tracking-widest text-site-blue uppercase">
          Loading 3D model
        </span>
      ) : null}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        onPointerLeave={() => setHovered(false)}
      >
        <ProductModelCanvas
          model={model}
          revealed={casing && (toggled || (hoverReveal && hovered))}
          autoRotate={!reduced}
          paused={paused}
          onModelHover={hoverReveal && casing ? setHovered : undefined}
          onReady={onReady}
        />
      </div>
      {casing ? (
        <RevealToggle
          revealed={toggled}
          onToggle={() => setToggled((on) => !on)}
          className={`absolute ${toggleClassName}`}
        />
      ) : null}
    </>
  )
}

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

/** Full-screen viewer for phones and small tablets. */
function ModelModal({ model, onClose }: { model: ProductModel; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = focusables(dialogRef.current)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [onClose])

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex flex-col bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b-[3px] border-site-ui-blue px-5 py-3">
        <p id={titleId} className="text-base leading-tight font-bold text-site-blue uppercase">
          {model.label}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close 3D view"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[3px] border-site-blue-light text-site-blue transition-colors hover:bg-site-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-blue"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 touch-none">
        <Stage
          model={model}
          paused={false}
          hoverReveal={false}
          toggleClassName="bottom-5 left-1/2 -translate-x-1/2"
          priorityPoster
        />
      </div>
      <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-site-green uppercase">
          <Move3d aria-hidden className="size-4" />
          Drag to rotate
        </p>
        {model.caption ? (
          <p className="mt-1 text-sm/relaxed text-site-blue-dark">{model.caption}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export function ProductModelViewer({ model, size = 'card' }: ProductModelViewerProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const canHover = useMediaQuery(HOVER_QUERY)
  const frameRef = useRef<HTMLDivElement>(null)
  const mount = useNearAndIdle(frameRef, isDesktop)
  const onScreen = useOnScreen(frameRef, mount)
  const [modalOpen, setModalOpen] = useState(false)
  const closeModal = useCallback(() => setModalOpen(false), [])
  const hero = size === 'hero'

  const frameHeight = hero ? 'h-[clamp(420px,52vh,500px)]' : 'h-[360px]'
  const frameChrome = hero ? '' : 'rounded-2xl border-[3px] border-site-ui-blue'

  return (
    <figure className="m-0">
      {/* Desktop: inline, lazily mounted canvas. */}
      <div
        ref={frameRef}
        className={`relative overflow-hidden bg-white max-site-tablet:hidden ${frameHeight} ${frameChrome}`}
      >
        {mount && isDesktop ? (
          <Stage
            model={model}
            paused={!onScreen}
            hoverReveal={canHover}
            toggleClassName={hero ? 'top-2 left-2' : 'top-4 left-4'}
            priorityPoster={hero}
          />
        ) : (
          <Poster model={model} priority={hero} />
        )}
        <span className="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-site-ui-blue uppercase">
          <Move3d aria-hidden className="size-4" />
          Drag to rotate
        </span>
      </div>

      {/* Mobile: poster card that opens the full-screen viewer. */}
      <div
        className={`relative overflow-hidden rounded-2xl border-[3px] border-site-ui-blue bg-white site-tablet:hidden ${
          hero ? 'mt-2 h-[340px]' : 'h-[300px]'
        }`}
      >
        <Poster model={model} priority={hero} />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
          className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border-[3px] border-site-blue-light bg-site-blue px-6 py-2.5 text-sm font-bold tracking-wider whitespace-nowrap text-white uppercase italic shadow-md transition-colors hover:bg-site-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-blue"
        >
          <Box aria-hidden className="size-4" />
          View in 3D
        </button>
      </div>

      <figcaption className={hero ? 'mt-3' : 'mt-4'}>
        <span className="block text-sm font-bold tracking-wide text-site-blue uppercase">
          {model.label}
        </span>
        {model.caption ? (
          <span className="mt-1 block text-sm/relaxed text-site-blue-dark">{model.caption}</span>
        ) : null}
      </figcaption>

      {/* Growing past the breakpoint hands over to the inline view. */}
      {modalOpen && !isDesktop ? <ModelModal model={model} onClose={closeModal} /> : null}
    </figure>
  )
}
