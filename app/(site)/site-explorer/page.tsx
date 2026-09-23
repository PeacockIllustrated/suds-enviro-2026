import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getSection } from '@/lib/site-content/store'
import { SiteExplorer } from '@/components/site/explorer/SiteExplorer'

export const metadata: Metadata = {
  title: 'Site Explorer - SuDS Enviro',
  description:
    'An office, a car park, a parade of shops and a house, with the ground cut away to show the SuDS Enviro drainage products beneath each one.',
}

/**
 * Site Explorer: the Webflow site's isometric development drawing, made
 * to work. The drawing itself is client-only; the heading, the plot tabs
 * and panel, and the full list of plots and products below all render on
 * the server, so the page reads and links without JavaScript.
 */
export default async function SiteExplorerPage() {
  const content = await getSection('siteExplorer')
  const { SITE_EXPLORER: ui, SITE_EXPLORER_PLOTS: plots } = content
  return (
    <>
      <section className="bg-white pt-10 pb-6 md:pt-16 md:pb-8">
        <div className="mx-auto max-w-[1400px] px-4 md:px-5">
          <p className="text-sm font-bold tracking-widest text-site-green uppercase">{ui.eyebrow}</p>
          <h1 className="mt-2 text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
            <span className="text-site-green">{ui.heading.lead} </span>
            <span className="font-bold text-site-blue">{ui.heading.trail}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base/relaxed text-site-blue-dark md:text-lg/relaxed">{ui.intro}</p>
          <noscript>
            <p className="mt-4 max-w-2xl rounded-2xl border border-site-ui-blue p-4 text-sm text-site-blue-dark">{ui.noScript}</p>
          </noscript>
        </div>
      </section>

      <SiteExplorer content={content} />

      <section className="border-t border-site-ui-blue/60 bg-white py-14 md:py-20" aria-labelledby="site-explorer-list">
        <div className="mx-auto max-w-[1400px] px-4 md:px-5">
          <h2 id="site-explorer-list" className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight uppercase">
            <span className="text-site-green">{ui.listHeading.lead} </span>
            <span className="font-bold text-site-blue">{ui.listHeading.trail}</span>
          </h2>
          <p className="mt-3 max-w-2xl text-base/relaxed text-site-blue-dark">{ui.listIntro}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {plots.map((plot) => (
              <article key={plot.id} className="rounded-3xl border border-site-ui-blue p-5">
                <h3 className="text-lg font-bold text-site-blue uppercase">{plot.name}</h3>
                <p className="mt-2 text-sm/relaxed text-site-blue-dark">{plot.summary}</p>
                <ul className="mt-4 space-y-3">
                  {plot.products.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="group flex min-h-11 items-start gap-2 rounded-xl py-1 text-site-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-green"
                      >
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-site-green" aria-hidden />
                        <span>
                          <span className="block text-sm font-bold group-hover:underline">{product.name}</span>
                          <span className="block text-sm/relaxed text-site-blue-dark">{product.role}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
