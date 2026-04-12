import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
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
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-navy transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: product info */}
          <div>
            <span className="inline-flex items-center rounded-full bg-light px-3 py-1 text-xs font-medium text-navy mb-4">
              {product.categoryLabel}
            </span>
            <h1 className="text-4xl font-extrabold text-ink">{product.name}</h1>
            <p className="text-lg text-muted mt-4 leading-relaxed">{product.description}</p>

            <Link
              href={`/configurator?product=${product.id}`}
              className="inline-flex mt-8 rounded-lg bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors"
            >
              Configure This Product
            </Link>
          </div>

          {/* Right: 3D model or placeholder */}
          <div className="flex items-center justify-center">
            <ProductModel productSlug={slug} />
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-light">
        <h2 className="text-2xl font-extrabold text-ink mb-8">Key Features</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Specifications */}
      <Section>
        <h2 className="text-2xl font-extrabold text-ink mb-8">Specifications</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {product.specifications.map((spec, i) => (
                <tr
                  key={spec.label}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-light'}
                >
                  <td className="px-6 py-3 font-medium text-ink w-1/3">{spec.label}</td>
                  <td className="px-6 py-3 text-muted">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Compliance */}
      <Section className="bg-light">
        <h2 className="text-2xl font-extrabold text-ink mb-8">Compliance</h2>
        <ul className="space-y-2">
          {product.compliance.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-navy shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Applications */}
      <Section>
        <h2 className="text-2xl font-extrabold text-ink mb-8">Applications</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {product.applications.map((app) => (
            <li key={app} className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-blue shrink-0 mt-0.5" />
              <span className="text-sm text-ink leading-relaxed">{app}</span>
            </li>
          ))}
        </ul>
      </Section>

      <CTABanner />
    </>
  )
}
