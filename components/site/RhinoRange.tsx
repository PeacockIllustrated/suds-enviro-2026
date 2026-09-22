import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText, BODY_VOICES } from './RichText'
import { SiteButton } from './SiteButton'

/** "THE RHINO RANGE / One solution, All Situations". */
export function RhinoRange({ content }: { content: Pick<HomeContent, 'RHINO_RANGE'> }) {
  const { RHINO_RANGE } = content
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-5 text-right">
        <p className="text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-tight uppercase">
          <span className="block text-site-green">{RHINO_RANGE.eyebrow.lead}</span>
          <span className="block font-bold text-site-blue">{RHINO_RANGE.eyebrow.mark}</span>
        </p>

        <h2 className="mt-8 text-[clamp(1.5rem,3.6vw,2.5rem)] leading-tight uppercase">
          <RichText
            content={RHINO_RANGE.heading}
            voices={{ plain: 'text-site-green', highlight: 'font-bold text-site-blue' }}
          />
        </h2>

        <p className="mt-6 text-base/relaxed md:text-lg/relaxed">
          <RichText content={RHINO_RANGE.body} voices={BODY_VOICES} />
        </p>

        <div className="mt-8">
          <SiteButton href={RHINO_RANGE.cta.href}>{RHINO_RANGE.cta.label}</SiteButton>
        </div>
      </div>
    </section>
  )
}
