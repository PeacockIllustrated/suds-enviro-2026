'use client'

import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight, Eye, EyeOff, Info } from 'lucide-react'
import type { WaterJourneyContent } from '@/lib/site-content/defaults'
import { SiteButton } from '../SiteButton'
import { STOP_SCENES } from './journeyWorld'
import { createMotion, type JourneyMotionState } from './journeyFraming'

const JourneyScene = dynamic(() => import('./JourneyScene'), { ssr: false })

/**
 * The Water Journey page's interactive section.
 *
 * Three ways it can show, decided once the page has hydrated:
 *
 * - list    before hydration and without JavaScript: every stop as a
 *           readable card with its links, one after another.
 * - scroll  the stage pins under the header and the page scroll drives the
 *           camera along the world; each stop's card fades in as the
 *           camera arrives. The timeline and arrows jump by scrolling.
 * - step    under reduced motion: the same stage at a fixed height, moved
 *           one stop at a time with the arrows or the timeline, with the
 *           camera cutting rather than gliding.
 *
 * The 3D scene is decoration (aria-hidden); the copy, links and controls
 * are real HTML throughout, and each stop is announced when it changes.
 */

type Mode = 'list' | 'scroll' | 'step'

const noop = () => () => {}

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

/** Keeps a broken WebGL context from taking the copy down with it. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function hasCasing(id: string): boolean {
  const model = STOP_SCENES[id as keyof typeof STOP_SCENES]?.model
  return model ? Object.values(model.roles).includes('casing') : false
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Where the camera is between stops, from how far through a stop's beat the reader has scrolled. */
function travel(s: number, last: number): number {
  const i = Math.min(last, Math.floor(s))
  const f = s - i
  const t = Math.min(1, Math.max(0, (f - 0.35) / 0.65))
  return Math.min(last, i + t * t * (3 - 2 * t))
}

export function WaterJourneyExperience({ content }: { content: WaterJourneyContent }) {
  const { WATER_JOURNEY: copy, WATER_JOURNEY_STOPS: stops } = content
  const count = stops.length
  const last = count - 1

  const hydrated = useSyncExternalStore(noop, () => true, () => false)
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const coarse = useMediaQuery('(pointer: coarse)')
  const mode: Mode = !hydrated ? 'list' : reduced ? 'step' : 'scroll'

  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState(-1)
  const [announce, setAnnounce] = useState('')
  const [revealedStop, setRevealedStop] = useState<string | null>(null)
  const [mountScene, setMountScene] = useState(false)
  const [onScreen, setOnScreen] = useState(true)

  const motion = useRef<JourneyMotionState>(createMotion())
  const activeRef = useRef(0)
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const beat = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const panels = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ticks = useRef<(HTMLButtonElement | null)[]>([])

  const paint = useCallback(
    (u: number) => {
      const p = last > 0 ? u / last : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
      if (dot.current) dot.current.style.transform = `translateX(${p * 100}%)`
    },
    [last],
  )

  /** Make stop `i` the one showing. */
  const show = useCallback(
    (i: number) => {
      const prev = activeRef.current
      if (i === prev) return
      activeRef.current = i
      setPrevious(prev)
      setActive(i)
      setAnnounce(`${copy.stopWord} ${i + 1} of ${count}: ${stops[i].heading.lead} ${stops[i].heading.trail}`)
    },
    [copy.stopWord, count, stops],
  )

  /** Travel to stop `i`: by scrolling in scroll mode, directly in step mode. */
  const goTo = useCallback(
    (target: number) => {
      const i = Math.min(last, Math.max(0, target))
      if (mode === 'scroll') {
        const el = section.current
        const st = stage.current
        const b = beat.current
        if (!el || !st || !b) return
        const stick = parseFloat(getComputedStyle(st).top) || 0
        const top = window.scrollY + el.getBoundingClientRect().top - stick + (i + 0.08) * b.offsetHeight
        window.scrollTo({ top, behavior: 'smooth' })
        return
      }
      motion.current.target = i
      show(i)
      paint(i)
    },
    [last, mode, paint, show],
  )

  // Mount the canvas once the browser has a quiet moment.
  useEffect(() => {
    if (!hydrated) return
    const requestIdle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback
    if (typeof requestIdle === 'function') {
      const handle = requestIdle(() => setMountScene(true), { timeout: 1200 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(() => setMountScene(true), 300)
    return () => window.clearTimeout(handle)
  }, [hydrated])

  // Stop drawing while the journey is scrolled out of view.
  useEffect(() => {
    const el = section.current
    if (!el || !hydrated) return
    const observer = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), {
      rootMargin: '100px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hydrated])

  // Scroll mode: the page position drives the journey.
  useEffect(() => {
    if (mode !== 'scroll') return
    let frame = 0
    const update = () => {
      frame = 0
      const el = section.current
      const st = stage.current
      const b = beat.current
      if (!el || !st || !b) return
      const stick = parseFloat(getComputedStyle(st).top) || 0
      const s = Math.min(last, Math.max(0, (stick - el.getBoundingClientRect().top) / Math.max(1, b.offsetHeight)))
      const u = travel(s, last)
      motion.current.target = u
      paint(u)
      show(Math.min(last, Math.floor(s + 0.33)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    motion.current.snap = true
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [mode, last, paint, show])

  // Step mode: the camera sits on the active stop.
  useEffect(() => {
    if (mode !== 'step') return
    motion.current.target = activeRef.current
    motion.current.snap = true
    paint(activeRef.current)
  }, [mode, paint])

  // Tell the scene which part of the stage the copy leaves clear.
  useEffect(() => {
    if (mode === 'list') return
    const measure = () => {
      const st = stage.current?.getBoundingClientRect()
      const top = bar.current?.getBoundingClientRect()
      const panel = panels.current?.getBoundingClientRect()
      if (!st || !top || !panel || st.width === 0 || st.height === 0) return
      const y0 = (top.bottom - st.top + 8) / st.height
      if (st.width >= 992) {
        motion.current.free = { x0: (panel.right - st.left + 16) / st.width, x1: 0.99, y0, y1: 0.98 }
      } else {
        motion.current.free = { x0: 0.01, x1: 0.99, y0, y1: (panel.top - st.top - 6) / st.height }
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (stage.current) observer.observe(stage.current)
    if (panels.current) observer.observe(panels.current)
    return () => observer.disconnect()
  }, [mode])

  const onTickKey = (e: React.KeyboardEvent, i: number) => {
    const to =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1
          : e.key === 'Home' ? 0
            : e.key === 'End' ? last
              : null
    if (to === null) return
    e.preventDefault()
    const next = Math.min(last, Math.max(0, to))
    ticks.current[next]?.focus()
    goTo(next)
  }

  // The track runs from the centre of the first tick to the centre of the last.
  const track = { left: `${50 / count}%`, right: `${50 / count}%` }

  const activeStop = stops[active]
  const canReveal = mode !== 'list' && hasCasing(activeStop.id)
  const revealed = revealedStop === activeStop.id
  const enhanced = mode !== 'list'

  return (
    <>
      <section
        ref={section}
        aria-labelledby="journey-heading"
        data-mode={mode}
        className="relative overflow-x-clip bg-white"
      >
        <a
          href="#journey-end"
          className="sr-only z-40 rounded-full bg-site-blue px-5 py-3 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:top-24 focus:left-4"
        >
          {copy.skipLabel}
        </a>

        <div
          ref={stage}
          className={
            mode === 'scroll'
              ? 'sticky top-16 h-[calc(100svh-4rem)] overflow-hidden bg-[linear-gradient(180deg,#cde9f7_0%,#eaf6fc_55%,#f7fbfd_100%)]'
              : mode === 'step'
                ? 'relative h-[calc(100svh-4rem)] min-h-[640px] overflow-hidden bg-[linear-gradient(180deg,#cde9f7_0%,#eaf6fc_55%,#f7fbfd_100%)]'
                : 'relative'
          }
        >
          {enhanced ? (
            <div aria-hidden className="absolute inset-0">
              {mountScene ? (
                <SceneBoundary>
                  <JourneyScene
                    stops={stops.map((s) => s.id)}
                    motionRef={motion}
                    active={active}
                    previous={previous}
                    revealed={revealed}
                    animate={mode === 'scroll'}
                    paused={!onScreen}
                    maxDpr={coarse ? 1.5 : 1.75}
                  />
                </SceneBoundary>
              ) : null}
            </div>
          ) : null}

          {/* The timeline: every stop is a 44px target, full width on phones. */}
          {enhanced ? (
            <div ref={bar} className="absolute inset-x-0 top-0 z-20 bg-white/75 backdrop-blur-sm lg:bg-white/60">
              <nav aria-label={copy.timelineLabel} className="mx-auto flex max-w-[1400px] items-start gap-3 px-1 py-1 lg:px-8 lg:pt-3 lg:pb-7">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  disabled={active === 0}
                  aria-label={copy.previousLabel}
                  className="hidden size-11 shrink-0 place-items-center rounded-full text-site-blue transition-colors hover:bg-site-blue-light/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-site-blue disabled:opacity-30 lg:grid"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>

                <div className="relative min-w-0 flex-1">
                  <div aria-hidden className="absolute top-[21px] h-[3px] rounded-full bg-site-ui-blue" style={track} />
                  <div aria-hidden className="absolute top-[21px] h-[3px]" style={track}>
                    <div ref={fill} className="h-full w-full origin-left scale-x-0 rounded-full bg-site-blue" />
                  </div>
                  <ol className="relative flex">
                    {stops.map((stop, i) => {
                      const current = i === active
                      return (
                        <li key={stop.id} className="relative flex min-w-0 flex-1 justify-center">
                          <button
                            ref={(el) => {
                              ticks.current[i] = el
                            }}
                            type="button"
                            tabIndex={current ? 0 : -1}
                            aria-current={current ? 'step' : undefined}
                            aria-label={`${copy.stopWord} ${i + 1} of ${count}: ${stop.label}`}
                            onClick={() => goTo(i)}
                            onKeyDown={(e) => onTickKey(e, i)}
                            className="group/tick grid h-11 w-full max-w-24 min-w-11 place-items-center rounded-full focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-site-blue"
                          >
                            <span
                              aria-hidden
                              className={`block size-2.5 rounded-full transition-colors duration-300 ${
                                i <= active ? 'bg-site-blue' : 'bg-white ring-2 ring-site-ui-blue group-hover/tick:ring-site-blue'
                              }`}
                            />
                          </button>
                          <span
                            aria-hidden
                            className={`pointer-events-none absolute top-[42px] left-1/2 hidden -translate-x-1/2 text-center text-[11px] leading-tight tracking-[0.12em] whitespace-nowrap uppercase lg:block ${
                              current ? 'font-extrabold text-site-blue' : 'font-semibold text-site-blue-dark/65'
                            }`}
                          >
                            {stop.label}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                  <div aria-hidden className="pointer-events-none absolute top-[22.5px]" style={track}>
                    <div ref={dot}>
                      <span className="block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-site-green shadow-[0_0_0_4px_rgba(255,255,255,0.9)]" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  disabled={active === last}
                  aria-label={copy.nextLabel}
                  className="hidden size-11 shrink-0 place-items-center rounded-full text-site-blue transition-colors hover:bg-site-blue-light/60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-site-blue disabled:opacity-30 lg:grid"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </nav>
            </div>
          ) : null}

          {/* The stops: a list before hydration, stacked cards on the stage after. */}
          <div
            ref={panels}
            className={
              enhanced
                ? 'absolute inset-x-0 bottom-0 z-10 grid px-2.5 pb-2.5 lg:inset-x-auto lg:top-28 lg:bottom-6 lg:left-6 lg:w-[min(430px,34vw)] lg:p-0 xl:left-10'
                : 'mx-auto grid max-w-3xl gap-6 px-5 pb-16'
            }
          >
            {mode === 'step' ? (
              <div className="pointer-events-none absolute inset-x-2.5 -top-13 flex justify-between lg:hidden">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  disabled={active === 0}
                  aria-label={copy.previousLabel}
                  className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/90 text-site-blue shadow-sm ring-1 ring-site-ui-blue focus-visible:outline-3 focus-visible:outline-site-blue disabled:opacity-40"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  disabled={active === last}
                  aria-label={copy.nextLabel}
                  className="pointer-events-auto grid size-11 place-items-center rounded-full bg-white/90 text-site-blue shadow-sm ring-1 ring-site-ui-blue focus-visible:outline-3 focus-visible:outline-site-blue disabled:opacity-40"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </div>
            ) : null}
            {stops.map((stop, i) => {
              const current = i === active
              const diagram = Boolean(STOP_SCENES[stop.id]?.diagram)
              const state = !enhanced ? '' : current ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 motion-safe:translate-y-3'
              return (
                <article
                  key={stop.id}
                  aria-labelledby={`journey-stop-${stop.id}`}
                  onFocusCapture={enhanced && !current ? () => goTo(i) : undefined}
                  className={`${
                    enhanced ? 'col-start-1 row-start-1 self-end lg:self-center' : ''
                  } border-l-4 border-site-green bg-white/95 px-4 py-3.5 shadow-[0_18px_40px_-20px_rgba(0,85,118,0.45)] ring-1 ring-site-ui-blue/70 transition-[opacity,translate] duration-500 ease-out lg:p-7 ${state}`}
                >
                  <p className="flex items-baseline gap-2 text-xs font-semibold tracking-[0.18em] text-site-blue-dark/70 uppercase">
                    <span aria-hidden className="text-sm font-extrabold text-site-blue tabular-nums">{pad(i + 1)}</span>
                    <span aria-hidden>/ {pad(count)}</span>
                    <span className="sr-only">
                      {copy.stopWord} {i + 1} of {count}
                    </span>
                  </p>
                  <h2
                    id={`journey-stop-${stop.id}`}
                    className="mt-1.5 text-[clamp(1.4rem,3vw,2.35rem)] leading-[0.95] tracking-tight uppercase lg:mt-2"
                  >
                    <span className="font-extrabold text-site-blue">{stop.heading.lead}</span>{' '}
                    <span className="font-semibold text-site-green">{stop.heading.trail}</span>
                  </h2>
                  {stop.tags.length ? (
                    <p className="mt-1.5 text-[10px] font-bold tracking-[0.2em] text-site-blue-dark/75 uppercase lg:mt-2 lg:text-[11px]">
                      {stop.tags.join(' / ')}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm/normal text-site-blue-dark lg:mt-3 lg:text-base/relaxed">{stop.body}</p>
                  {diagram ? (
                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-site-blue lg:mt-3">
                      <Info className="size-4 shrink-0" aria-hidden />
                      {copy.diagramNote}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2 lg:mt-4 lg:gap-2.5">
                    {stop.actions.map((action, k) => (
                      <SiteButton key={action.href} href={action.href} variant={k === 0 ? 'primary' : 'outline'} className="max-lg:px-4 max-lg:text-xs">
                        {action.label}
                      </SiteButton>
                    ))}
                  </div>
                  {enhanced && i === 0 ? (
                    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-site-blue-dark/75 lg:mt-4">
                      <ArrowDown className="size-4 motion-safe:animate-bounce" aria-hidden />
                      {mode === 'scroll' ? copy.scrollHint : copy.stepHint}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>

          {canReveal ? (
            <button
              type="button"
              aria-pressed={revealed}
              onClick={() => setRevealedStop(revealed ? null : activeStop.id)}
              className="absolute top-[4.25rem] right-3 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-site-blue-light bg-white/90 px-4 text-xs font-bold tracking-wider text-site-blue uppercase shadow-sm backdrop-blur-sm transition-colors hover:bg-site-blue hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-site-blue lg:top-auto lg:right-8 lg:bottom-8"
            >
              {revealed ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              {revealed ? copy.hideInside : copy.seeInside}
            </button>
          ) : null}

          {enhanced ? (
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {announce}
            </p>
          ) : null}
        </div>

        {/* Scroll length: one beat per stop after the first, and a pause at the end. */}
        {mode === 'scroll' ? (
          <div aria-hidden>
            {stops.slice(1).map((stop, i) => (
              <div key={stop.id} ref={i === 0 ? beat : undefined} className="h-[125svh]" />
            ))}
            <div className="h-[45svh]" />
          </div>
        ) : null}
      </section>

      <section id="journey-end" className="bg-site-blue-dark px-5 py-16 text-white md:py-20">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-tight uppercase">
              <span className="font-extrabold text-white">{copy.end.heading.lead}</span>{' '}
              <span className="font-semibold text-site-ui-green">{copy.end.heading.trail}</span>
            </h2>
            <p className="mt-4 text-base/relaxed text-white/85 md:text-lg/relaxed">{copy.end.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {copy.end.actions.map((action, k) => (
              <SiteButton key={action.href} href={action.href} variant={k === 0 ? 'primary' : 'outline'}>
                {action.label}
              </SiteButton>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
