import { Section } from '@/components/marketing/Section'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { CTABanner } from '@/components/marketing/CTABanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - SuDS Enviro',
  description:
    'SuDS Enviro manufactures HDPE rotationally moulded drainage chambers in the UK. Learn about our products, processes and team.',
}

export default function AboutPage() {
  return (
    <>
      <Section className="pt-32">
        <h1 className="text-4xl font-extrabold text-ink">About SuDS Enviro</h1>
        <p className="text-lg text-muted mt-4 max-w-3xl leading-relaxed">
          SuDS Enviro is a UK manufacturer of HDPE rotationally moulded drainage products.
          From inspection chambers and oil separators to pump stations and grease management,
          every product is built in-house using one-piece construction for maximum strength and
          reliability.
        </p>
      </Section>

      <Section dark id="values">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          What Sets Us Apart
        </h2>
        <FeatureGrid />
      </Section>

      <CTABanner />
    </>
  )
}
