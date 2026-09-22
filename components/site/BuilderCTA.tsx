import { BUILDER_CTA } from '@/lib/content/home'
import { RichText, BODY_VOICES } from './RichText'
import { SiteButton } from './SiteButton'

/** "build your System!" - the run into the configurator. */
export function BuilderCTA() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-5">
        <h2 className="text-[clamp(2rem,5.5vw,3.75rem)] leading-none tracking-tight uppercase">
          <RichText
            content={BUILDER_CTA.heading}
            voices={{
              plain: 'font-bold text-site-blue',
              italic: 'italic font-bold text-site-green',
            }}
          />
        </h2>

        <p className="mt-6 max-w-3xl text-base/relaxed md:text-lg/relaxed">
          <RichText content={BUILDER_CTA.body} voices={BODY_VOICES} />
        </p>

        <div className="mt-8">
          <SiteButton href={BUILDER_CTA.cta.href}>{BUILDER_CTA.cta.label}</SiteButton>
        </div>
      </div>
    </section>
  )
}
