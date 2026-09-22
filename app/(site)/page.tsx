import type { Metadata } from 'next'
import { WaterJourney } from '@/components/site/WaterJourney'
import { WaterTabs } from '@/components/site/WaterTabs'
import { InnovationSlider } from '@/components/site/InnovationSlider'
import { Testimonials } from '@/components/site/Testimonials'
import { RhinoRange } from '@/components/site/RhinoRange'
import { BuilderCTA } from '@/components/site/BuilderCTA'
import { SolutionRoutes } from '@/components/site/SolutionRoutes'
import { ProductTiles } from '@/components/site/ProductTiles'

export const metadata: Metadata = {
  title: 'SuDS Enviro - Bespoke, Standardised',
}

/**
 * Work-in-progress rebuild of the Webflow home page.
 *
 * Kept off `/` until it is finished so the current marketing site stays
 * live. Swap the route group over once the design is signed off.
 */
export default function HomePreviewPage() {
  return (
    <>
      <WaterJourney />
      <WaterTabs />
      <InnovationSlider />
      <Testimonials />
      <RhinoRange />
      <SolutionRoutes />
      <BuilderCTA />
      <ProductTiles />
    </>
  )
}
