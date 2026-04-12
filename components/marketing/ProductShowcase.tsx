import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ProductFeature {
  category: string
  title: string
  description: string
  href: string
  gradient: string
  shadowColor: string
}

const PRODUCTS: ProductFeature[] = [
  {
    category: 'Silt Management',
    title: 'Catchpits',
    description:
      'Play a vital role in preventing the build-up of material that can cause pipe blockages, resulting in localised flooding.',
    href: '/products#category-silt',
    gradient: 'from-blue/20 to-navy/10',
    shadowColor: 'rgba(26,130,162,0.15)',
  },
  {
    category: 'Drainage Chambers',
    title: 'Inspection Chambers',
    description:
      'A comprehensive range of foul and surface water chambers suitable for Adoptable and Non-Adoptable applications.',
    href: '/products#category-chambers',
    gradient: 'from-navy/20 to-blue/10',
    shadowColor: 'rgba(0,77,112,0.15)',
  },
  {
    category: 'Stormwater',
    title: 'Flow Control',
    description:
      'Designed to limit the flow rate of storm water, preventing downstream flooding during periods of heavy rainfall.',
    href: '/products#category-flow',
    gradient: 'from-green/20 to-navy/10',
    shadowColor: 'rgba(68,175,67,0.15)',
  },
]

export function ProductShowcase() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
            Our Product Range
          </h2>
          <p className="mt-4 text-muted text-lg">
            Solutions for every drainage requirement
          </p>
        </div>

        <div className="space-y-20 md:space-y-28">
          {PRODUCTS.map((product, index) => {
            const isReversed = index % 2 === 1

            return (
              <div
                key={product.title}
                className={`flex flex-col items-center gap-10 md:gap-16 ${
                  isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
              >
                {/* Text content */}
                <div className="flex-1 max-w-md">
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue">
                    {product.category}
                  </span>
                  <h3 className="mt-3 text-2xl md:text-3xl font-bold text-ink tracking-tight">
                    {product.title}
                  </h3>
                  <p className="mt-4 text-muted leading-relaxed">
                    {product.description}
                  </p>
                  <Link
                    href={product.href}
                    className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-green hover:text-green-d transition-colors group"
                  >
                    Explore
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>

                {/* Sphere placeholder */}
                <div className="flex-1 flex items-center justify-center">
                  <div
                    className={`h-48 w-48 md:h-64 md:w-64 rounded-full bg-gradient-to-br ${product.gradient}`}
                    style={{
                      boxShadow: `0 0 80px ${product.shadowColor}`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
