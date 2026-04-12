import { PRODUCT_CATALOG } from '@/lib/product-catalog'
import { ProductCard } from '@/components/marketing/ProductCard'
import { Section } from '@/components/marketing/Section'
import { CTABanner } from '@/components/marketing/CTABanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - SuDS Enviro',
  description:
    'Browse the full range of HDPE drainage chambers, oil separators, grease traps, flow control and pumping solutions from SuDS Enviro.',
}

export default function ProductsPage() {
  return (
    <>
      <Section className="pt-32">
        <h1 className="text-4xl font-extrabold text-ink tracking-tight">Products</h1>
        <p className="text-lg text-muted mt-3 max-w-2xl leading-relaxed">
          Our complete range of HDPE drainage products, manufactured in the UK using
          rotational moulding for one-piece, joint-free construction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-14">
          {PRODUCT_CATALOG.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              tagline={product.tagline}
              slug={product.slug}
              productId={product.id}
              category={product.category}
              specs={product.specifications.slice(0, 3)}
            />
          ))}
        </div>
      </Section>

      <CTABanner />
    </>
  )
}
