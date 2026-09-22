import Image from 'next/image'
import type { HomeContent } from '@/lib/site-content/defaults'
import { SiteButton } from './SiteButton'

/**
 * The "more from" card grid. Image panel with a large corner radius, a
 * two-voice uppercase heading, then a row of small chevron pills.
 */
export function ProductTiles({ content }: { content: Pick<HomeContent, 'PRODUCT_TILES'> }) {
  const { PRODUCT_TILES } = content
  return (
    <section className="bg-white pb-20 md:pb-28">
      <div className="mx-auto grid max-w-[1400px] gap-x-8 gap-y-14 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TILES.map((tile) => (
          <article key={tile.id} className="text-center">
            <div className="overflow-hidden rounded-3xl bg-site-ui-blue/20">
              <Image
                src={tile.image}
                alt=""
                width={1536}
                height={1024}
                // Without this Next serves a 3840px image into a ~400px
                // card, which is most of the page weight for nothing.
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>

            <h3 className="mt-5 text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight uppercase">
              <span className="block text-site-green">{tile.heading.lead}</span>
              <span className="block font-bold text-site-blue">{tile.heading.trail}</span>
            </h3>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {tile.links.map((link) => (
                <SiteButton key={link.label} href={link.href} variant="card">
                  {link.label}
                </SiteButton>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
