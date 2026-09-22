import type { Metadata } from 'next'
import { SiteLink } from '@/components/site/SiteLink'
import { ChevronRight } from 'lucide-react'
import { PRODUCT_CATALOG } from '@/lib/product-catalog'

export const metadata: Metadata = {
  title: 'Products preview - SuDS Enviro',
  robots: { index: false, follow: false },
}

/** Index of every catalogue entry, in the site's card language. */
export default function ProductsPreviewPage() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1400px] px-5">
        <h1 className="text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
          <span className="text-site-green">the </span>
          <span className="font-bold text-site-blue">RHINO Range</span>
        </h1>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_CATALOG.map((product) => (
            <SiteLink
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col rounded-2xl border-[3px] border-site-ui-blue p-6 transition-colors hover:border-site-blue"
            >
              <span className="text-xs font-bold tracking-widest text-site-green uppercase">
                {product.categoryLabel}
              </span>
              <span className="mt-2 text-2xl leading-tight font-bold text-site-blue uppercase">
                {product.name}
              </span>
              <span className="mt-2 flex-1 text-sm/relaxed text-site-blue-dark">
                {product.tagline}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold italic tracking-wider text-site-blue uppercase">
                Learn more
                <ChevronRight aria-hidden className="size-4" />
              </span>
            </SiteLink>
          ))}
        </div>
      </div>
    </section>
  )
}
