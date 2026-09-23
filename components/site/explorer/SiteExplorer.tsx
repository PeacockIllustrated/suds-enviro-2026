'use client'

import dynamic from 'next/dynamic'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import type { SiteExplorerContent } from '@/lib/site-content/defaults'
import { ExplorerProductCard, StreamTag } from './ExplorerProductCard'
import { PLOTS, type Stream } from './explorerLayout'
import type { HotspotInfo } from './ExplorerScene'

const ExplorerScene = dynamic(() => import('./ExplorerScene'), { ssr: false })

/**
 * The Site Explorer: plot tabs, the 3D section drawing and the product
 * card. Everything but the drawing renders on the server, so the plots
 * and their products read and link before (and without) JavaScript.
 *
 * Desktop: the drawing is large with the plot and product details beside
 * it. Mobile: the tabs scroll as pills, and a product opens as a sheet
 * over the bottom of the drawing; the camera frames the product in the
 * part the sheet leaves clear, so it is never hidden.
 */

function useMedia(query: string, fallback: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}

const STREAMS: Record<string, Stream> = Object.fromEntries(
  PLOTS.flatMap((plot) => plot.products.map((p) => [p.id, p.stream] as const)),
)

export function SiteExplorer({ content }: { content: SiteExplorerContent }) {
  const { SITE_EXPLORER: ui, SITE_EXPLORER_PLOTS: plots } = content
  const [plotId, setPlotId] = useState(plots[0]?.id ?? 'office')
  const [productId, setProductId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [sheetHeight, setSheetHeight] = useState(0)
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)', false)
  const desktop = useMedia('(min-width: 1024px)', false)

  const stage = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const cardHeading = useRef<HTMLHeadingElement>(null)
  const sheetHeading = useRef<HTMLHeadingElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const focusCard = useRef(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const plotIndex = Math.max(0, plots.findIndex((p) => p.id === plotId))
  const plot = plots[plotIndex]
  const productIndex = plot.products.findIndex((p) => p.id === productId)
  const product = productIndex >= 0 ? plot.products[productIndex] : null
  const sheetOpen = product !== null && !desktop

  // The drawing mounts once the page is idle, so it never delays the copy.
  useEffect(() => {
    const idle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback
    if (typeof idle === 'function') {
      const handle = idle(() => setMounted(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(() => setMounted(true), 300)
    return () => window.clearTimeout(handle)
  }, [])

  // Stop rendering while the drawing is off screen.
  useEffect(() => {
    const el = stage.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // How much of the drawing the sheet covers, so the camera can frame above it.
  useEffect(() => {
    const el = sheet.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setSheetHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Move focus into the card when a product is opened from a marker or the list.
  useEffect(() => {
    if (!product || !focusCard.current) return
    focusCard.current = false
    const target = desktop ? cardHeading.current : sheetHeading.current
    target?.focus({ preventScroll: true })
  }, [product, desktop])

  const selectPlot = (id: string) => {
    if (id === plotId) return
    setPlotId(id)
    setProductId(null)
  }

  const openProduct = (id: string, from?: 'list') => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    focusCard.current = true
    setProductId(id)
    if (from === 'list' && !desktop && stage.current) {
      const r = stage.current.getBoundingClientRect()
      if (r.top < 0 || r.bottom > window.innerHeight) {
        stage.current.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
      }
    }
  }

  const closeProduct = () => {
    setProductId(null)
    const back = returnFocus.current
    returnFocus.current = null
    if (back && back.isConnected) back.focus({ preventScroll: true })
  }

  const stepProduct = (delta: number) => {
    const n = plot.products.length
    const next = plot.products[(Math.max(0, productIndex) + delta + n) % n]
    setProductId(next.id)
  }

  const stepPlot = (delta: number) => {
    const n = plots.length
    selectPlot(plots[(plotIndex + delta + n) % n].id)
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = plots.length
    const to =
      e.key === 'ArrowRight' ? (i + 1) % n
      : e.key === 'ArrowLeft' ? (i - 1 + n) % n
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : -1
    if (to < 0) return
    e.preventDefault()
    selectPlot(plots[to].id)
    tabs.current[to]?.focus()
  }

  const onStageKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && product) {
      e.stopPropagation()
      closeProduct()
    }
  }

  const hotspots = useMemo(() => {
    const out: Record<string, HotspotInfo> = {}
    plot.products.forEach((p, i) => {
      out[p.id] = { number: i + 1, name: p.name }
    })
    return out
  }, [plot])

  const panelId = `${baseId}-panel`
  const card = product ? (
    <ExplorerProductCard
      product={product}
      number={productIndex + 1}
      stream={STREAMS[product.id] ?? 'surface'}
      plotName={plot.name}
      ui={ui}
      onClose={closeProduct}
      onPrev={() => stepProduct(-1)}
      onNext={() => stepProduct(1)}
      headingRef={desktop ? cardHeading : sheetHeading}
      headingId={`${baseId}-card`}
    />
  ) : null

  return (
    <section className="bg-white pb-14 md:pb-20" aria-label={ui.eyebrow}>
      <div className="mx-auto max-w-[1400px] px-4 md:px-5">
        {/* Plot tabs: scrolling pills on a phone. */}
        <div
          role="tablist"
          aria-label={ui.plotsLabel}
          className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
        >
          {plots.map((p, i) => {
            const selected = p.id === plotId
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${p.id}`}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectPlot(p.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`min-h-11 shrink-0 snap-start rounded-full border-2 px-5 text-sm font-bold tracking-wider uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-green ${
                  selected
                    ? 'border-site-blue bg-site-blue text-white'
                    : 'border-site-blue-light bg-white text-site-blue hover:border-site-blue'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          {/* The drawing. */}
          <div
            ref={stage}
            onKeyDown={onStageKey}
            className="relative isolate h-[62svh] max-h-[720px] min-h-[420px] overflow-hidden rounded-3xl border border-site-ui-blue bg-white lg:h-[min(76vh,720px)]"
          >
            {mounted ? (
              <ExplorerScene
                plotId={plotId}
                productId={productId}
                onSelectPlot={selectPlot}
                onSelectProduct={(id) => openProduct(id)}
                insetBottom={sheetOpen ? sheetHeight : 0}
                active={active}
                reducedMotion={reducedMotion}
                hotspots={hotspots}
                markerLabel={ui.marker}
                onReady={() => setReady(true)}
                fallback={<p className="p-6 text-sm text-site-blue-dark">{ui.noWebgl}</p>}
              />
            ) : null}
            {!ready ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-site-blue">
                <LoaderCircle className="size-5 motion-safe:animate-spin" aria-hidden />
                <span>{ui.loading}</span>
              </div>
            ) : null}

            {/* Plot name and stepping, over the top of the drawing. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              <p aria-hidden className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold tracking-widest text-site-green uppercase shadow-sm">
                {plot.name}
              </p>
              <div className="pointer-events-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => stepPlot(-1)}
                  aria-label={ui.previousPlot}
                  className="flex size-11 items-center justify-center rounded-full border border-site-ui-blue bg-white text-site-blue shadow-sm transition-colors hover:border-site-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-green"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => stepPlot(1)}
                  aria-label={ui.nextPlot}
                  className="flex size-11 items-center justify-center rounded-full border border-site-ui-blue bg-white text-site-blue shadow-sm transition-colors hover:border-site-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-green"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Phone: the product card as a sheet over the foot of the drawing. */}
            <div
              ref={sheet}
              role="dialog"
              aria-modal="false"
              aria-labelledby={`${baseId}-card`}
              inert={!sheetOpen}
              className={`absolute inset-x-0 bottom-0 z-40 max-h-[55%] overflow-y-auto rounded-t-3xl border-t border-site-ui-blue bg-white px-4 pt-3 pb-3 transition-[translate,box-shadow] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
                sheetOpen ? 'translate-y-0 shadow-[0_-10px_30px_rgba(0,85,118,0.14)]' : 'translate-y-full shadow-none'
              }`}
            >
              {!desktop ? card : null}
            </div>
          </div>

          {/* Plot details and products. */}
          <div id={panelId} role="tabpanel" aria-labelledby={`${baseId}-tab-${plotId}`} onKeyDown={onStageKey} className="lg:sticky lg:top-24 lg:self-start">
            {desktop && card ? (
              <div className="mb-6 rounded-3xl border-2 border-site-blue-light bg-white p-5 shadow-md" role="region" aria-labelledby={`${baseId}-card`}>
                {card}
              </div>
            ) : null}

            <h2 className="text-2xl leading-tight font-bold text-site-blue uppercase">{plot.name}</h2>
            <p className="mt-3 text-base/relaxed text-site-blue-dark">{plot.summary}</p>

            <h3 className="mt-6 text-xs font-bold tracking-widest text-site-green uppercase">{ui.productsHeading}</h3>
            <ol className="mt-3 space-y-2">
              {plot.products.map((p, i) => {
                const selected = p.id === productId
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => (selected ? closeProduct() : openProduct(p.id, 'list'))}
                      aria-pressed={selected}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-green ${
                        selected ? 'border-site-blue bg-site-blue-light/25' : 'border-site-ui-blue bg-white hover:border-site-blue'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          selected ? 'border-site-blue bg-site-blue text-white' : 'border-site-blue text-site-blue'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-site-blue">{p.name}</span>
                        <StreamTag stream={STREAMS[p.id] ?? 'surface'} ui={ui} />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <p className="mt-4 text-sm text-site-blue-dark/80">{ui.hint}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
