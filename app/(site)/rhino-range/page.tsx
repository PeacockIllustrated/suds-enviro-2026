import type { Metadata } from 'next'
import { SolutionRoutes } from '@/components/site/SolutionRoutes'
import { ProductTiles } from '@/components/site/ProductTiles'
import { BuilderCTA } from '@/components/site/BuilderCTA'
import { getSection } from '@/lib/site-content/store'

export const metadata: Metadata = {
  title: 'The RHINO Range - SuDS Enviro',
}

/**
 * Rebuild of the Webflow `RHINO | Product Catalogue` page, which is the
 * foul-water / surface-water split shown full page.
 */
export default async function RhinoRangePage() {
  const home = await getSection('home')
  return (
    <>
      <section className="bg-white pt-14 text-center">
        <h1 className="mx-auto max-w-4xl px-5 text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
          <span className="text-site-green">the </span>
          <span className="font-bold text-site-blue">RHINO Range</span>
        </h1>
      </section>
      <SolutionRoutes content={home} />
      <ProductTiles content={home} />
      <BuilderCTA content={home} />
    </>
  )
}
