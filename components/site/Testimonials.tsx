'use client'

import { TESTIMONIALS, TESTIMONIALS_HEADING } from '@/lib/content/home'
import { RichText, BODY_VOICES, HEADING_VOICES_INVERTED } from './RichText'
import { Carousel } from './Carousel'

/** "tried, tested and trusted" - the customer quote slider. */
export function Testimonials() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-5">
        <h2 className="mb-10 text-right text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-tight uppercase">
          <RichText content={TESTIMONIALS_HEADING} voices={HEADING_VOICES_INVERTED} />
        </h2>

        <Carousel label="Customer testimonials" count={TESTIMONIALS.length}>
          {(i) => {
            const item = TESTIMONIALS[i]
            return (
              <figure className="px-10 text-right md:px-14">
                <figcaption className="text-[clamp(1.25rem,3.2vw,2rem)] leading-tight italic uppercase">
                  <span aria-hidden className="mr-1 font-bold text-site-blue">
                    &ldquo;
                  </span>
                  <RichText
                    content={item.headline}
                    voices={{
                      plain: 'text-site-green',
                      bold: 'font-bold text-site-blue',
                    }}
                  />
                  <span aria-hidden className="ml-1 font-bold text-site-blue">
                    &rdquo;
                  </span>
                </figcaption>

                <p className="mt-2 text-sm tracking-wider text-site-green uppercase md:text-base">
                  {item.author.name} &middot; {item.author.role}
                </p>

                <blockquote className="mt-6 text-base/relaxed md:text-lg/relaxed">
                  <RichText content={item.quote} voices={BODY_VOICES} />
                </blockquote>
              </figure>
            )
          }}
        </Carousel>
      </div>
    </section>
  )
}
