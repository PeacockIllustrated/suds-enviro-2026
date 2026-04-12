import Link from 'next/link'
import type { ProductId, ProductCategory } from '@/lib/types'

interface ProductCardProps {
  name: string
  tagline: string
  slug: string
  productId: ProductId
  category: ProductCategory
  specs?: { label: string; value: string }[]
}

const CATEGORY_GRADIENTS: Record<ProductCategory, string> = {
  chambers: 'from-navy/20 to-navy/10',
  stormwater: 'from-green/20 to-navy/10',
  silt: 'from-blue/20 to-navy/10',
  pumps: 'from-navy/20 to-blue/10',
  flow: 'from-green/20 to-green-d/10',
  drawpits: 'from-navy/20 to-muted/10',
  bespoke: 'from-blue/20 to-green/10',
}

export function ProductCard({
  name,
  tagline,
  slug,
  productId,
  category,
  specs,
}: ProductCardProps) {
  const gradientClasses = CATEGORY_GRADIENTS[category] ?? 'from-blue/20 to-navy/10'
  const displaySpecs = specs?.slice(0, 3)

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center px-6 pt-6 pb-4 flex-1">
        {/* Gradient sphere placeholder */}
        <div
          className={`mx-auto h-24 w-24 rounded-full bg-gradient-to-br ${gradientClasses} shadow-[0_0_40px_rgba(26,130,162,0.15)]`}
        />

        {/* Product name */}
        <h3 className="text-lg font-bold text-ink text-center mt-4">{name}</h3>

        {/* Tagline */}
        <p className="text-sm text-muted text-center mt-1">{tagline}</p>

        {/* Spec chips */}
        {displaySpecs && displaySpecs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {displaySpecs.map((spec) => (
              <span
                key={spec.label}
                className="inline-flex items-center rounded-full bg-light px-3 py-1 text-xs font-medium text-ink"
              >
                {spec.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="flex border-t border-border">
        <Link
          href={`/configurator?product=${productId}`}
          className="flex-1 py-3 text-center text-sm font-semibold text-green hover:bg-green/5 transition-colors"
        >
          Configure
        </Link>
        <div className="w-px bg-border" />
        <Link
          href={`/products/${slug}`}
          className="flex-1 py-3 text-center text-sm font-semibold text-navy hover:bg-navy/5 transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}
