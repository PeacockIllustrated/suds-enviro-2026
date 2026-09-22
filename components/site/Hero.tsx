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
      {children ? <div className="absolute inset-0">{children}</div> : null}

      <div className="relative mx-auto max-w-[1400px] px-5 pt-16 pb-10 text-center md:pt-24">
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
