'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Minimal slider matching the Webflow `Slider` behaviour: arrows either
 * side, dots beneath, one slide visible. CSS transitions only - the
 * project does not use an animation library.
 */
interface CarouselProps {
  label: string
  count: number
  children: (index: number) => React.ReactNode
}

export function Carousel({ label, count, children }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const go = (next: number) => setIndex(((next % count) + count) % count)

  return (
    <div className="relative" aria-roledescription="carousel" aria-label={label}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              // Slides off-screen stay in the DOM for the transition, so
              // keep their links out of the tab order.
              inert={i !== index ? true : undefined}
            >
              {children(i)}
            </div>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={`${label}: previous`}
            className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full p-2 text-site-blue transition-colors hover:text-site-blue-dark"
          >
            <ChevronLeft className="size-8" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={`${label}: next`}
            className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full p-2 text-site-blue transition-colors hover:text-site-blue-dark"
          >
            <ChevronRight className="size-8" />
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${label}: go to ${i + 1}`}
                aria-current={i === index}
                className={`size-2.5 rounded-full transition-colors ${
                  i === index ? 'bg-site-blue' : 'bg-site-ui-blue'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
