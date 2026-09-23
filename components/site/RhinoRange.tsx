import type { HomeContent } from '@/lib/site-content/defaults'
import { RichText, type VoiceMap } from './RichText'
import { SiteButton } from './SiteButton'

/** Body voices on the dark band: pale text, green emphasis. */
const ON_DARK: VoiceMap = {
  plain: 'text-white/80',
  highlight: 'text-site-ui-green',
  lowlight: 'text-site-ui-green',
  italic: 'italic font-bold text-site-ui-green',
  bold: 'font-bold text-white',
}

/**
 * "THE RHINO RANGE / One solution, All Situations".
 *
 * The one dark band on the page: it breaks the run of white sections and
 * gives the range its weight. The lockup is set large in the left field;
 * the heading, copy and button take the right, top-aligned to the lockup.
 */
export function RhinoRange({ content }: { content: Pick<HomeContent, 'RHINO_RANGE'> }) {
  const { RHINO_RANGE } = content
  return (
    <section className="relative overflow-hidden bg-site-blue-dark py-20 text-white md:py-28">
      {/* A faint ripple, the site's water motif, in the far corner. */}
      <svg aria-hidden className="pointer-events-none absolute -right-40 -bottom-40 size-[36rem] text-white/[0.05]" viewBox="0 0 200 200" fill="none">
        {[30, 50, 70, 90].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeWidth="6" />
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-[1180px] gap-10 px-5 md:grid-cols-12 md:gap-12">
        <p className="text-[clamp(3rem,9vw,6.5rem)] leading-[0.86] tracking-[-0.03em] uppercase md:col-span-6">
          <span className="block font-light text-site-ui-green">{RHINO_RANGE.eyebrow.lead}</span>
          <span className="block font-bold">{RHINO_RANGE.eyebrow.mark}</span>
        </p>

        <div className="md:col-span-6 md:pt-3">
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-balance uppercase">
            <RichText content={RHINO_RANGE.heading} voices={{ plain: 'text-site-ui-green', highlight: 'font-bold text-white' }} />
          </h2>
          <p className="mt-6 max-w-[58ch] text-base/relaxed text-pretty md:text-lg/relaxed">
            <RichText content={RHINO_RANGE.body} voices={ON_DARK} />
          </p>
          <div className="mt-8">
            <SiteButton href={RHINO_RANGE.cta.href}>{RHINO_RANGE.cta.label}</SiteButton>
          </div>
        </div>
      </div>
    </section>
  )
}
