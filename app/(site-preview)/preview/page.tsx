import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Hero } from '@/components/site/Hero'
import { WaterTabs } from '@/components/site/WaterTabs'
import { InnovationSlider } from '@/components/site/InnovationSlider'
import { Testimonials } from '@/components/site/Testimonials'
import { RhinoRange } from '@/components/site/RhinoRange'
import { BuilderCTA } from '@/components/site/BuilderCTA'
import { SolutionRoutes } from '@/components/site/SolutionRoutes'
import { ProductTiles } from '@/components/site/ProductTiles'

export const metadata: Metadata = {
  title: 'Home preview - SuDS Enviro',
  robots: { index: false, follow: false },
}

/**
 * Work-in-progress rebuild of the Webflow home page.
 *
 * Kept off `/` until it is finished so the current marketing site stays
 * live. Swap the route group over once the design is signed off.
 */
export default function HomePreviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <WaterTabs />
        <InnovationSlider />
        <Testimonials />
        <RhinoRange />
        <SolutionRoutes />
        <BuilderCTA />
        <ProductTiles />
      </main>
      <SiteFooter />
    </div>
  )
}
