import type { Metadata } from 'next'
import Image from 'next/image'
import { BUILDER_CARDS, BUILDER_HUB } from '@/lib/content/builder-hub'
import { RichText } from '@/components/site/RichText'
import { SiteButton } from '@/components/site/SiteButton'

export const metadata: Metadata = {
  title: 'SuDS Builder Hub - SuDS Enviro',
}

/** Rebuild of the Webflow `SuDS Builder | Hub` page. */
export default function BuilderHubPreviewPage() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1400px] px-5">
        <div className="flex flex-col items-center text-center">
          <Image
            src={BUILDER_HUB.logo}
            alt="RHINO by SuDS Enviro"
            width={320}
            height={120}
            sizes="200px"
            className="h-14 w-auto"
          />

          <h1 className="mt-5 text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
            <span className="text-site-green">{BUILDER_HUB.heading.lead} </span>
            <span className="font-bold text-site-blue">{BUILDER_HUB.heading.trail}</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base/relaxed md:text-lg/relaxed">
            <RichText
              content={BUILDER_HUB.intro}
              voices={{ plain: 'text-site-blue-dark', bold: 'font-bold text-site-green' }}
            />
          </p>

          <h2 className="mt-10 text-sm font-bold tracking-widest text-site-green uppercase">
            {BUILDER_HUB.prompt}
          </h2>
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDER_CARDS.map((card) => (
            <article key={card.id} className="text-center">
              <div className="overflow-hidden rounded-3xl bg-site-ui-blue/20">
                <Image
                  src={card.image}
                  alt=""
                  width={1536}
                  height={1024}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>

              <h3 className="mt-5 text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight uppercase">
                <span className="block text-site-green">{card.heading.lead}</span>
                <span className="block font-bold text-site-blue">{card.heading.trail}</span>
              </h3>

              <div className="mt-4 flex justify-center">
                <SiteButton
                  href={`/configurator?product=${card.productId}`}
                  variant="card"
                >
                  {card.cta}
                </SiteButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
