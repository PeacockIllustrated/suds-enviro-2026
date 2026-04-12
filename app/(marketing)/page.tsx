import { HeroSection } from '@/components/marketing/HeroSection'
import { IntroSection } from '@/components/marketing/IntroSection'
import { USPTrio } from '@/components/marketing/USPTrio'
import { ProductShowcase } from '@/components/marketing/ProductShowcase'
import { CredentialsBanner } from '@/components/marketing/CredentialsBanner'
import { FeatureStrip } from '@/components/marketing/FeatureStrip'
import { TestimonialSection } from '@/components/marketing/TestimonialSection'
import { CTABanner } from '@/components/marketing/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <USPTrio />
      <ProductShowcase />
      <CredentialsBanner />
      <FeatureStrip />
      <TestimonialSection />
      <CTABanner />
    </>
  )
}
