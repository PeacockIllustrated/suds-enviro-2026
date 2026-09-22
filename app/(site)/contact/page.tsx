import type { Metadata } from 'next'
import { SiteButton } from '@/components/site/SiteButton'
import { ContactForm } from '@/components/site/ContactForm'
import { RichText, BODY_VOICES } from '@/components/site/RichText'
import { getSection } from '@/lib/site-content/store'

export const metadata: Metadata = {
  title: 'Contact - SuDS Enviro',
}

/** Rebuild of the Webflow `Contact` page. */
export default async function ContactPage() {
  const { CONTACT_FORM, CONTACT_HERO, EXISTING_CUSTOMER, SUPPORT_CARDS } = await getSection('contact')
  return (
    <>
      <section className="bg-white py-16 text-center md:py-24">
        <div className="mx-auto max-w-[1100px] px-5">
          <h1 className="text-[clamp(2.25rem,6vw,4rem)] leading-none tracking-tight uppercase">
            <span className="block text-site-green">{CONTACT_HERO.heading.lead}</span>
            <span className="block font-bold text-site-blue">{CONTACT_HERO.heading.trail}</span>
          </h1>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {CONTACT_HERO.actions.map((action) => (
              <SiteButton key={action.label} href={action.href} variant={action.variant}>
                {action.label}
              </SiteButton>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-24">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-5 md:grid-cols-3">
          {SUPPORT_CARDS.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border-[3px] border-site-blue bg-white p-7 text-center"
            >
              <h2 className="text-2xl font-bold text-site-blue uppercase">{card.heading}</h2>
              <p className="mt-3 text-base/relaxed text-site-blue-dark">{card.body}</p>
              <div className="mt-5">
                <SiteButton href={card.cta.href}>{card.cta.label}</SiteButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white pb-16 text-center md:pb-24">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight text-site-green uppercase">
            {EXISTING_CUSTOMER.heading}
          </h2>
          <p className="mt-4 text-base/relaxed md:text-lg/relaxed">
            <RichText content={EXISTING_CUSTOMER.body} voices={BODY_VOICES} />
          </p>
          <div className="mt-6">
            <SiteButton href={EXISTING_CUSTOMER.cta.href} variant="outline">
              {EXISTING_CUSTOMER.cta.label}
            </SiteButton>
          </div>
        </div>
      </section>

      <section id="contact-form" className="scroll-mt-20 bg-site-blue py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-[clamp(1.75rem,4.5vw,3rem)] leading-tight text-white uppercase">
            <span className="block font-light">{CONTACT_FORM.heading.lead}</span>
            <span className="block font-bold">{CONTACT_FORM.heading.trail}</span>
          </h2>

          <div className="mt-10">
            <ContactForm content={{ CONTACT_FORM }} />
          </div>
        </div>
      </section>
    </>
  )
}
