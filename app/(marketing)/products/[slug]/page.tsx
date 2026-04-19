import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileDown, ExternalLink } from 'lucide-react'
import { getProductBySlug, PRODUCT_CATALOG } from '@/lib/product-catalog'
import { Section } from '@/components/marketing/Section'
import { CTABanner } from '@/components/marketing/CTABanner'
import { ProductModel } from '@/components/marketing/ProductModel'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRODUCT_CATALOG.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} - SuDS Enviro`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <Section className="pt-32">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy transition-colors duration-200 mb-8"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: product info */}
          <div>
            <span className="inline-flex items-center rounded-full bg-light px-3.5 py-1 text-xs font-semibold text-navy mb-5">
              {product.categoryLabel}
            </span>
            <h1 className="text-4xl font-extrabold text-ink tracking-tight">{product.name}</h1>
            <p className="text-lg text-muted mt-4 leading-relaxed max-w-lg">{product.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/configurator?product=${product.id}`}
                className="inline-flex rounded-full bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors shadow-lg shadow-green/20"
              >
                Configure This Product
              </Link>
              {product.brochures && product.brochures.length > 0 && (
                <a
                  href={product.brochures[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-white text-navy hover:bg-light px-6 py-4 text-base font-bold transition-colors"
                >
                  <FileDown size={18} />
                  Download Datasheet
                </a>
              )}
            </div>
          </div>

          {/* Right: 3D model or placeholder */}
          <div className="flex items-center justify-center">
            <ProductModel productSlug={slug} />
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-light">
        <h2 className="text-2xl font-extrabold text-ink mb-8 tracking-tight">Key Features</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Specifications */}
      <Section>
        <h2 className="text-2xl font-extrabold text-ink mb-8 tracking-tight">Specifications</h2>
        <div className="overflow-hidden rounded-xl border border-border/70">
          <table className="w-full text-sm">
            <tbody>
              {product.specifications.map((spec, i) => (
                <tr
                  key={spec.label}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-light'}
                >
                  <td className="px-6 py-3.5 font-medium text-ink w-1/3">{spec.label}</td>
                  <td className="px-6 py-3.5 text-muted">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Compliance */}
      <Section className="bg-light">
        <h2 className="text-2xl font-extrabold text-ink mb-8 tracking-tight">Compliance</h2>
        <ul className="space-y-3">
          {product.compliance.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-navy shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Brochures / Datasheets */}
      {product.brochures && product.brochures.length > 0 && (
        <Section>
          <h2 className="text-2xl font-extrabold text-ink mb-2 tracking-tight">Datasheets</h2>
          <p className="text-sm text-muted mb-8 max-w-xl">
            Download the official product datasheet. Each opens in a new tab and
            includes a one-click Save as PDF option.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.brochures.map((brochure) => (
              <a
                key={brochure.href}
                href={brochure.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-white p-5 transition-all hover:border-navy/40 hover:shadow-[0_4px_16px_rgba(0,77,112,0.10)]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/8 text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                    <FileDown size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-ink leading-snug">
                      {brochure.label}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
                      HTML datasheet - Save as PDF
                    </div>
                  </div>
                </div>
                <ExternalLink size={16} className="shrink-0 text-muted group-hover:text-navy transition-colors" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Applications */}
      <Section>
        <h2 className="text-2xl font-extrabold text-ink mb-8 tracking-tight">Applications</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {product.applications.map((app) => (
            <li key={app} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-blue shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{app}</span>
            </li>
          ))}
        </ul>
      </Section>

      <CTABanner />
    </>
  )
}
