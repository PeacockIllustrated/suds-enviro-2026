'use client'

import { INNOVATION_SLIDES } from '@/lib/content/home'
import { RichText, BODY_VOICES } from './RichText'
import { SiteButton } from './SiteButton'
import { Carousel } from './Carousel'

/**
 * The RoFlo / multiFlo / autoFlo slider. Right-aligned copy, the sub-brand
 * set as an upright blue word beside an italic accent word.
 */
export function InnovationSlider() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-5">
        <Carousel label="RHINO innovations" count={INNOVATION_SLIDES.length}>
          {(i) => {
            const slide = INNOVATION_SLIDES[i]
            const accent = slide.accent === 'amber' ? 'text-site-yellow' : 'text-site-green'
            return (
              <div className="px-10 text-right md:px-14">
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-none font-bold tracking-tight uppercase">
                  <span className="text-site-blue">{slide.brand.lead}</span>{' '}
                  <span className={`italic ${accent}`}>{slide.brand.mark}</span>
                </h2>
                <p className="mt-1 text-[clamp(1.25rem,3vw,2rem)] leading-tight uppercase">
                  <RichText
                    content={slide.strapline}
                    voices={{
                      plain: 'text-site-green',
                      highlight: 'font-bold text-site-blue',
                    }}
                  />
                </p>

                <div className="mt-6 space-y-5 text-base/relaxed md:text-lg/relaxed">
                  {slide.body.map((paragraph, p) => (
                    <p key={p}>
                      <RichText content={paragraph} voices={BODY_VOICES} />
                    </p>
                  ))}
                </div>

                <div className="mt-8">
                  <SiteButton href={slide.cta.href}>{slide.cta.label}</SiteButton>
                </div>
              </div>
            )
          }}
        </Carousel>
      </div>
    </section>
  )
}
