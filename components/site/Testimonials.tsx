'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText, BODY_VOICES, HEADING_VOICES_INVERTED } from './RichText'

/**
 * "Tried, tested and trusted": an editorial quote.
 *
 * The heading holds a left rail; the quote takes the wider right field at
 * a large, readable size under an oversized quote mark. Controls are a
 * counter and two arrows beneath, rather than arrows floating over text.
 */
export function Testimonials({ content }: { content: Pick<HomeContent, 'TESTIMONIALS' | 'TESTIMONIALS_HEADING'> }) {
  const { TESTIMONIALS, TESTIMONIALS_HEADING } = content
  const [index, setIndex] = useState(0)
  const count = TESTIMONIALS.length
  const item = TESTIMONIALS[index]
  const go = (step: number) => setIndex((i) => (i + step + count) % count)
  const initials = item.author.name
    .replace(/[^A-Za-z ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

  return (
    <section className="bg-white py-24 md:py-32" aria-roledescription="carousel" aria-label="Customer testimonials">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 md:grid-cols-12">
        <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] leading-[0.95] tracking-[-0.02em] text-balance uppercase md:col-span-4">
          <RichText content={TESTIMONIALS_HEADING} voices={HEADING_VOICES_INVERTED} />
        </h2>

        <figure key={item.id} className="journey-panel relative md:col-span-8 md:col-start-5">
          <span aria-hidden className="block h-12 font-serif text-[6rem] leading-[0.95] text-site-blue-light select-none md:h-16 md:text-[8rem]">
            &ldquo;
          </span>
          <p className="relative text-[clamp(1.5rem,3vw,2.25rem)] leading-tight italic tracking-[-0.01em] text-balance uppercase">
            <RichText content={item.headline} voices={{ plain: 'text-site-green', bold: 'font-bold text-site-blue' }} />
          </p>
          <blockquote className="relative mt-6 max-w-[60ch] text-lg/relaxed text-pretty md:text-xl/relaxed">
            <RichText content={item.quote} voices={BODY_VOICES} />
          </blockquote>

          <figcaption className="mt-10 flex flex-wrap items-center gap-4 border-t border-site-blue/15 pt-6">
            <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-site-blue text-sm font-bold text-white">
              {initials}
            </span>
            <span className="text-sm leading-snug">
              <span className="block font-bold tracking-wide text-site-blue-dark uppercase">{item.author.name}</span>
              <span className="block text-site-green uppercase">{item.author.role}</span>
            </span>

            {count > 1 ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="mr-2 text-sm font-semibold text-site-blue-dark/60 tabular-nums" aria-live="polite">
                  {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="flex size-11 items-center justify-center rounded-full border-2 border-site-blue-light text-site-blue transition-colors duration-150 hover:bg-site-blue hover:text-white"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="flex size-11 items-center justify-center rounded-full border-2 border-site-blue-light text-site-blue transition-colors duration-150 hover:bg-site-blue hover:text-white"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </span>
            ) : null}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
