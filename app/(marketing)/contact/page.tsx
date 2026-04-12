import { Section } from '@/components/marketing/Section'
import { MapPin, Phone, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - SuDS Enviro',
  description:
    'Get in touch with SuDS Enviro for drainage product enquiries, technical support and project specifications.',
}

export default function ContactPage() {
  return (
    <Section className="pt-32">
      <h1 className="text-4xl font-extrabold text-ink">Contact Us</h1>
      <p className="text-lg text-muted mt-4 max-w-2xl leading-relaxed">
        Get in touch with our team for product enquiries, technical support or to discuss your
        project requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="rounded-xl border border-border bg-white p-8">
          <MapPin size={24} className="text-navy mb-4" />
          <h3 className="font-bold text-ink">Address</h3>
          <address className="not-italic text-sm text-muted mt-2 leading-relaxed">
            9 Ambleside Court<br />
            Chester-le-Street<br />
            DH3 2EB
          </address>
        </div>

        <div className="rounded-xl border border-border bg-white p-8">
          <Phone size={24} className="text-navy mb-4" />
          <h3 className="font-bold text-ink">Phone</h3>
          <p className="text-sm text-muted mt-2">
            <a
              href="tel:01224057700"
              className="hover:text-navy transition-colors"
            >
              01224 057 700
            </a>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-8">
          <Mail size={24} className="text-navy mb-4" />
          <h3 className="font-bold text-ink">Email</h3>
          <p className="text-sm text-muted mt-2">
            <a
              href="mailto:hello@sudsenviro.com"
              className="hover:text-navy transition-colors"
            >
              hello@sudsenviro.com
            </a>
          </p>
        </div>
      </div>
    </Section>
  )
}
