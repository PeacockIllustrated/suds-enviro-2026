import { HeroSection } from '@/components/marketing/HeroSection'
import { Section } from '@/components/marketing/Section'
import { CategoryGrid } from '@/components/marketing/CategoryGrid'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { CTABanner } from '@/components/marketing/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Section>
        <CategoryGrid />
      </Section>

      <Section dark id="features">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Why SuDS Enviro?
        </h2>
        <FeatureGrid />
      </Section>

      <CTABanner />
    </>
  )
}
