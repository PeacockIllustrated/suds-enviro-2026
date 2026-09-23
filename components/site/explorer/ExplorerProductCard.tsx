'use client'

import type { Ref } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import type { ExplorerProductCopy } from '@/lib/content/site-explorer'
import type { SiteExplorerContent } from '@/lib/site-content/defaults'
import type { Stream } from './explorerLayout'

/** The small card for one product: name, its job here, and where to go next. */

export const STREAM_STYLE: Record<Stream, { dot: string; key: 'surfaceWater' | 'foulWater' | 'cableDuct' }> = {
  surface: { dot: 'bg-site-blue', key: 'surfaceWater' },
  foul: { dot: 'bg-site-red', key: 'foulWater' },
  duct: { dot: 'bg-site-dark', key: 'cableDuct' },
}

export function StreamTag({ stream, ui }: { stream: Stream; ui: SiteExplorerContent['SITE_EXPLORER'] }) {
  const style = STREAM_STYLE[stream]
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-site-blue-dark/80 uppercase">
      <span aria-hidden className={`h-1.5 w-4 rounded-full ${style.dot}`} />
      {ui[style.key]}
    </span>
  )
}

const ACTION =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border-[3px] px-4 text-xs font-bold tracking-wider italic uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-blue'

export function ExplorerProductCard({ product, number, stream, plotName, ui, onClose, onPrev, onNext, headingRef, headingId }: {
  product: ExplorerProductCopy
  number: number
  stream: Stream
  plotName: string
  ui: SiteExplorerContent['SITE_EXPLORER']
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  headingRef?: Ref<HTMLHeadingElement>
  headingId: string
}) {
  const iconButton =
    'flex size-11 shrink-0 items-center justify-center rounded-full text-site-blue transition-colors hover:bg-site-blue-light/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-blue'
  return (
    <div>
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-site-blue text-sm font-bold text-white">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest text-site-green uppercase">{plotName}</p>
          <h3
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="mt-0.5 text-base/snug font-bold text-site-blue focus:outline-none lg:text-xl/snug"
          >
            {product.name}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label={ui.close} className={`-mt-1 -mr-2 ${iconButton}`}>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div className="mt-2">
        <StreamTag stream={stream} ui={ui} />
        <p className="mt-1.5 text-sm/relaxed text-site-blue-dark">{product.role}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link href={`/products/${product.slug}`} className={`${ACTION} border-site-blue-light bg-site-blue text-white hover:bg-site-blue-dark`}>
            {ui.viewProduct}
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
          <Link
            href={`/configurator?product=${product.productId}`}
            className={`${ACTION} border-site-green bg-white text-site-green hover:bg-site-green hover:text-white`}
          >
            {ui.configure}
          </Link>
          {/* Stepping through the plot's products; on a phone the markers above do this. */}
          <span className="ml-auto hidden gap-0.5 lg:flex">
            <button type="button" onClick={onPrev} aria-label={ui.previousProduct} className={iconButton}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={onNext} aria-label={ui.nextProduct} className={iconButton}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
