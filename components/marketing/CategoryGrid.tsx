import Link from 'next/link'
import { getAllCatalogCategories } from '@/lib/product-catalog'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  chambers: 'Inspection chambers for surface water, foul and combined drainage systems',
  stormwater: 'Oil separators, filters and rainwater harvesting for clean water discharge',
  silt: 'Catchpits, silt traps and grease management to protect downstream infrastructure',
  pumps: 'Package pump stations for sites where gravity drainage is not achievable',
  flow: 'Vortex and orifice plate flow control for stormwater attenuation',
  drawpits: 'Rectangular access chambers from recycled polymers for utility networks',
  bespoke: 'Custom solutions including septic tanks for off-mains wastewater treatment',
}

export function CategoryGrid() {
  const categories = getAllCatalogCategories()

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-ink text-center tracking-tight">Our Product Range</h2>
      <p className="text-muted text-center mt-3 text-lg">
        Drainage solutions for every application
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-14">
        {categories.map((cat) => (
          <Link
            key={cat.category}
            href={`/products#category-${cat.category}`}
            className="rounded-xl bg-white p-6 border border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <h3 className="font-bold text-ink group-hover:text-navy transition-colors duration-200 tracking-tight">
              {cat.label}
            </h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              {CATEGORY_DESCRIPTIONS[cat.category] ?? ''}
            </p>
            <span className="inline-flex items-center rounded-full bg-light px-3 py-1 text-xs font-medium text-navy mt-4">
              {cat.count} {cat.count === 1 ? 'product' : 'products'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
