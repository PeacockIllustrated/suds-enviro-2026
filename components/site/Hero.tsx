import Image from 'next/image'
import { HERO } from '@/lib/content/home'
import { RichText, HEADING_VOICES } from './RichText'

/**
 * Home hero. Mark over a two-line uppercase headline that alternates
 * green plain text with bold blue emphasis.
 *
 * `children` is the slot for the 3D chamber, which sits behind the type
 * on the Webflow site.
 */
export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* The chamber sits off to the right rather than behind the
          headline, so neither has to fight the other for legibility.
          On narrow screens it drops back further still. */}
      {children ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-30 lg:w-[55%] lg:opacity-60">
          {children}
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1400px] flex-col justify-center px-5 pt-16 pb-10 text-center md:min-h-[600px] md:pt-24">
        <Image
          src={HERO.logo}
          alt="SuDS Enviro - Bespoke, Standardised"
          width={420}
          height={220}
          priority
          sizes="(max-width: 768px) 220px, 300px"
          className="mx-auto h-auto w-[220px] md:w-[300px]"
        />

        <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(1.5rem,4.2vw,2.75rem)] leading-tight tracking-tight uppercase">
          <RichText content={HERO.heading} voices={HEADING_VOICES} />
        </h1>
      </div>
    </section>
  )
}
