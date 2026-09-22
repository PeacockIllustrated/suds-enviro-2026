import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Check, FileDown, ExternalLink } from 'lucide-react'
import { getProductBySlug, PRODUCT_CATALOG } from '@/lib/product-catalog'
import { SiteButton } from '@/components/site/SiteButton'
import { BuilderCTA } from '@/components/site/BuilderCTA'
import { InletClock } from '@/components/site/InletClock'
import { ProductModelViewer } from '@/components/site/ProductModelViewer'
import { PRODUCT_NARRATIVE } from '@/lib/content/products'
import { PRODUCT_MODELS } from '@/lib/content/product-models'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return PRODUCT_CATALOG.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  return {
    title: `${product.name} preview - SuDS Enviro`,
    description: product.description,
    robots: { index: false, follow: false },
  }
}

/** A list where each item is marked with the brand tick. */
function TickList({ items, tone }: { items: string[]; tone: 'green' | 'blue' }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Check
            aria-hidden
            className={`mt-0.5 size-5 shrink-0 ${
              tone === 'green' ? 'text-site-green' : 'text-site-blue'
            }`}
          />
          <span className="text-base/relaxed text-site-blue-dark">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionHeading({ lead, trail }: { lead?: string; trail: string }) {
  return (
    <h2 className="mb-8 text-[clamp(1.5rem,3.2vw,2.25rem)] leading-tight uppercase">
      {lead ? <span className="text-site-green">{lead} </span> : null}
      <span className="font-bold text-site-blue">{trail}</span>
    </h2>
  )
}

/**
 * Product detail in the Webflow site's visual language, driven by the
 * existing lib/product-catalog.ts entries - those already carry the real
 * specifications, compliance list and applications.
 */
export default async function ProductPreviewPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const datasheet = product.brochures?.[0]
  const narrative = PRODUCT_NARRATIVE[product.id]
  const models = PRODUCT_MODELS[slug]
  const heroModel = models?.hero
  const moreModels = models?.more ?? []

  return (
    <>
      <section className="bg-white py-14 md:py-20">
        <div
          className={`mx-auto max-w-[1100px] px-5${
            heroModel
              ? ' site-tablet:grid site-tablet:grid-cols-[minmax(0,1fr)_minmax(0,48%)] site-tablet:items-center site-tablet:gap-10'
              : ''
          }`}
        >
          <div>
            <p className="text-sm font-bold tracking-widest text-site-green uppercase">
              {product.categoryLabel}
            </p>

            <h1 className="mt-3 text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
              <span className="text-site-green">RHINO </span>
              <span className="font-bold text-site-blue">
                {narrative?.lockup.series ?? product.name}
              </span>
            </h1>

            {narrative ? (
              <p className="mt-2 text-[clamp(1rem,2.2vw,1.375rem)] leading-tight italic uppercase">
                <span className="block font-bold text-site-blue">{narrative.lockup.stream}</span>
                <span className="block text-site-ui-blue">{narrative.lockup.category}</span>
              </p>
            ) : (
              <p className="mt-3 text-[clamp(1.125rem,2.4vw,1.5rem)] leading-tight text-site-blue uppercase">
                {product.tagline}
              </p>
            )}

            <div className="mt-6 max-w-3xl space-y-4 text-base/relaxed text-site-blue-dark md:text-lg/relaxed">
              {(narrative?.intro ?? [product.description]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <SiteButton href={`/configurator?product=${product.id}`}>
                Configure this product
              </SiteButton>
              {datasheet ? (
                <SiteButton href={datasheet.href} variant="outline">
                  Download datasheet
                </SiteButton>
              ) : null}
            </div>
          </div>

          {heroModel ? (
            <div className="max-site-tablet:mt-10">
              <ProductModelViewer model={heroModel} size="hero" />
            </div>
          ) : null}
        </div>
      </section>

      {narrative?.clock ? (
        <section className="bg-white pb-14">
          <div className="mx-auto max-w-[1100px] px-5">
            <SectionHeading
              lead={narrative.clock.heading.lead}
              trail={narrative.clock.heading.trail}
            />

            <div className="grid gap-10 md:grid-cols-2">
              {narrative.clock.variants.map((variant) => (
                <div key={variant.heading.emphasis} className="flex flex-col items-center">
                  <p className="mb-4 text-center text-lg leading-tight uppercase">
                    <span className="text-site-blue">{variant.heading.lead} </span>
                    <span className="font-bold text-site-green">{variant.heading.emphasis}</span>
                    <span className="text-site-blue"> {variant.heading.trail}</span>
                  </p>
                  <InletClock available={variant.available} title={variant.title} />
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-3xl space-y-4 text-center text-base/relaxed text-site-blue-dark md:text-lg/relaxed">
              {narrative.clock.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {narrative?.sections?.map((section) => (
        <section key={section.heading.trail} className="bg-white pb-14">
          <div className="mx-auto max-w-[1100px] px-5">
            <SectionHeading lead={section.heading.lead} trail={section.heading.trail} />

            {section.body ? (
              <div className="max-w-3xl space-y-4 text-base/relaxed text-site-blue-dark md:text-lg/relaxed">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {section.highlights ? (
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {section.highlights.map((highlight) => (
                  <div
                    key={highlight.term}
                    className="rounded-2xl border-[3px] border-site-ui-blue p-5"
                  >
                    <dt className="text-sm font-bold tracking-wide text-site-blue uppercase">
                      {highlight.term}
                    </dt>
                    <dd className="mt-1.5 text-base/relaxed text-site-blue-dark">
                      {highlight.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>
      ))}

      {moreModels.length > 0 ? (
        <section className="bg-white pb-14">
          <div className="mx-auto max-w-[1100px] px-5">
            <SectionHeading lead="The range" trail="in 3D" />
            <div
              className={`grid gap-8 site-mobile-l:grid-cols-2 ${
                moreModels.length >= 3 ? 'site-tablet:grid-cols-3' : ''
              }`}
            >
              {moreModels.map((model) => (
                <ProductModelViewer key={model.id} model={model} size="card" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1100px] px-5">
          <SectionHeading lead="Key" trail="Features" />
          <TickList items={product.features} tone="green" />
        </div>
      </section>

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1100px] px-5">
          <SectionHeading trail="Specifications" />
          <div className="overflow-hidden rounded-2xl border-[3px] border-site-blue">
            <table className="w-full text-left">
              <tbody>
                {product.specifications.map((spec, i) => (
                  <tr key={spec.label} className={i % 2 === 0 ? 'bg-white' : 'bg-site-ui-blue/20'}>
                    <th
                      scope="row"
                      className="w-1/3 px-5 py-3.5 text-sm font-bold text-site-blue uppercase"
                    >
                      {spec.label}
                    </th>
                    <td className="px-5 py-3.5 text-site-blue-dark">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1100px] px-5">
          <SectionHeading trail="Compliance" />
          <TickList items={product.compliance} tone="blue" />
        </div>
      </section>

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1100px] px-5">
          <SectionHeading trail="Applications" />
          <TickList items={product.applications} tone="green" />
        </div>
      </section>

      {product.brochures && product.brochures.length > 0 ? (
        <section className="bg-white pb-14">
          <div className="mx-auto max-w-[1100px] px-5">
            <SectionHeading trail="Datasheets" />
            <div className="grid gap-4 sm:grid-cols-2">
              {product.brochures.map((brochure) => (
                <a
                  key={brochure.href}
                  href={brochure.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-2xl border-[3px] border-site-ui-blue p-5 transition-colors hover:border-site-blue"
                >
                  <span className="flex min-w-0 items-start gap-3">
                    <FileDown
                      aria-hidden
                      className="mt-0.5 size-5 shrink-0 text-site-blue"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-site-blue-dark">
                        {brochure.label}
                      </span>
                      <span className="mt-1 block text-[11px] font-bold tracking-widest text-site-green uppercase">
                        HTML datasheet, save as PDF
                      </span>
                    </span>
                  </span>
                  <ExternalLink aria-hidden className="size-4 shrink-0 text-site-ui-blue" />
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <BuilderCTA />
    </>
  )
}
