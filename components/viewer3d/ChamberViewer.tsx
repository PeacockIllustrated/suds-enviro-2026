'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Box, Expand, Eye, EyeOff, Move3d, Shrink, Tag, X } from 'lucide-react'
import { useWizardContext } from '@/components/wizard/WizardContext'
import { getProductConfig } from '@/lib/products/registry'
import { buildViewerModel } from './build-model'
import type { MatchKind } from './viewer-model'

// The canvas pulls in three.js; keep it out of this chunk and off the server.
const ConfiguratorCanvas = dynamic(() => import('./ConfiguratorCanvas'), { ssr: false })

/**
 * The configurator's 3D preview: a panel that slides up over the wizard
 * (full screen on phones, a large sheet on wider screens) showing the
 * product as currently configured, with "Show inside", "Breakout" and
 * label controls and the selections as chips underneath.
 */

interface ChamberViewerProps {
  open: boolean
  onClose: () => void
}

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const HOVER_QUERY = '(hover: hover) and (pointer: fine)'
const COMPACT_QUERY = '(max-width: 639px)'
const SLIDE_MS = 320

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

const MATCH_STYLE: Record<MatchKind, string> = {
  configured: 'bg-green',
  exact: 'bg-green',
  nearest: 'bg-site-yellow ring-1 ring-[#c9a800]',
  indicative: 'bg-site-blue',
}

function ToggleButton({
  on,
  onClick,
  icon: Icon,
  offIcon: OffIcon,
  label,
  onLabel,
}: {
  on: boolean
  onClick: () => void
  icon: typeof Eye
  offIcon?: typeof Eye
  label: string
  onLabel?: string
}) {
  const Shown = on && OffIcon ? OffIcon : Icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full border-2 px-3 text-[11px] font-bold tracking-wide uppercase shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-4 sm:text-xs ${
        on ? 'border-navy bg-navy text-white' : 'border-site-blue-light bg-white text-navy hover:bg-light'
      }`}
    >
      <Shown aria-hidden className="size-4" />
      {on && onLabel ? onLabel : label}
    </button>
  )
}

export function ChamberViewer({ open, onClose }: ChamberViewerProps) {
  const { state } = useWizardContext()
  const reduced = useMediaQuery(REDUCED_QUERY)
  const canHover = useMediaQuery(HOVER_QUERY)
  const compact = useMediaQuery(COMPACT_QUERY)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  const model = useMemo(() => buildViewerModel(state), [state])
  useEffect(() => () => model?.dispose(), [model])

  const config = state.product ? getProductConfig(state.product) : null
  const chips = config ? config.getSummaryFields(state) : []

  const [shown, setShown] = useState(false)
  const [ready, setReady] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [labels, setLabels] = useState(true)
  const onReady = useCallback(() => setReady(true), [])

  // Slide in on the frame after mounting so the transition runs.
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [open])

  const closing = useRef<number | null>(null)
  const close = useCallback(() => {
    if (closing.current !== null) return
    setShown(false)
    closing.current = window.setTimeout(onClose, reduced ? 0 : SLIDE_MS)
  }, [onClose, reduced])
  useEffect(
    () => () => {
      if (closing.current !== null) window.clearTimeout(closing.current)
    },
    [],
  )

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus({ preventScroll: true })
    }
  }, [close])

  const hasCasing = useMemo(() => {
    if (!model) return false
    return (
      model.parts.some((p) => p.role === 'casing') ||
      model.libraries.some((lib) => Object.values(lib.parts).some((p) => p.role === 'casing'))
    )
  }, [model])

  const motion = reduced ? '' : 'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-stretch justify-center sm:items-center sm:p-6 ${motion} ${
        shown ? 'bg-ink/35 opacity-100' : 'bg-ink/0 opacity-100'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex h-full w-full flex-col overflow-hidden bg-white sm:h-[min(860px,calc(100dvh-48px))] sm:max-w-[1120px] sm:rounded-2xl sm:shadow-[0_24px_64px_rgba(0,58,84,0.35)] ${motion} ${
          shown ? 'translate-y-0' : 'translate-y-full sm:translate-y-[calc(100%+48px)]'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy text-white">
              <Box aria-hidden className="size-4" />
            </span>
            <div className="min-w-0">
              <p id={titleId} className="truncate text-sm leading-tight font-extrabold text-ink">
                {config ? config.name : '3D preview'}
              </p>
              {model ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-snug font-semibold text-navy">
                  <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${MATCH_STYLE[model.match.kind]}`} />
                  <span className="min-w-0">{model.match.text}</span>
                </p>
              ) : null}
              {model?.match.note ? (
                <p className="mt-0.5 text-[10px] leading-snug text-muted sm:text-[11px]">{model.match.note}</p>
              ) : null}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close 3D preview"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-site-blue-light text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="relative min-h-0 flex-1 touch-none bg-white">
          {model && shown ? (
            <ConfiguratorCanvas
              model={model}
              revealed={revealed}
              exploded={exploded}
              showLabels={labels}
              reducedMotion={reduced}
              canHover={canHover}
              compact={compact}
              onReady={onReady}
            />
          ) : null}
          {!ready ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold tracking-widest text-site-blue uppercase">
              {model ? 'Loading 3D model' : 'Choose a product to see it in 3D'}
            </span>
          ) : null}
          {model ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2 px-3">
              {hasCasing ? (
                <ToggleButton
                  on={revealed}
                  onClick={() => setRevealed((v) => !v)}
                  icon={Eye}
                  offIcon={EyeOff}
                  label="Show inside"
                  onLabel="Hide inside"
                />
              ) : null}
              <ToggleButton
                on={exploded}
                onClick={() => setExploded((v) => !v)}
                icon={Expand}
                offIcon={Shrink}
                label="Breakout"
                onLabel="Assemble"
              />
              <ToggleButton on={labels} onClick={() => setLabels((v) => !v)} icon={Tag} label="Labels" />
            </div>
          ) : null}
        </div>

        {/* Selections */}
        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-light px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="-my-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
            {chips.length === 0 ? (
              <span className="shrink-0 rounded-full border border-border bg-white px-2.5 py-1 text-[10px] font-bold text-muted">
                Make selections to build your product
              </span>
            ) : (
              chips.map((chip) => (
                <span
                  key={chip.label}
                  className={`shrink-0 rounded-full border bg-white px-2.5 py-1 text-[10px] font-bold whitespace-nowrap ${
                    chip.locked ? 'border-green/50 text-green-d' : 'border-border text-navy'
                  }`}
                >
                  <span className="font-semibold text-muted">{chip.label}: </span>
                  {chip.value}
                </span>
              ))
            )}
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted uppercase sm:inline-flex">
            <Move3d aria-hidden className="size-4" />
            {canHover ? 'Drag to rotate, scroll to zoom' : 'Drag to rotate'}
          </span>
        </div>
      </div>
    </div>
  )
}
