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
      <h1 className="text-4xl font-extrabold text-ink tracking-tight">Contact Us</h1>
      <p className="text-lg text-muted mt-4 max-w-2xl leading-relaxed">
        Get in touch with our team for product enquiries, technical support or to discuss your
        project requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
        <div className="rounded-xl border border-border/70 bg-white p-8 shadow-sm">
          <MapPin size={22} className="text-navy mb-4" />
          <h3 className="font-bold text-ink tracking-tight">Address</h3>
          <address className="not-italic text-sm text-muted mt-2.5 leading-relaxed">
            9 Ambleside Court<br />
            Chester-le-Street<br />
            DH3 2EB
          </address>
        </div>

        <div className="rounded-xl border border-border/70 bg-white p-8 shadow-sm">
          <Phone size={22} className="text-navy mb-4" />
          <h3 className="font-bold text-ink tracking-tight">Phone</h3>
          <p className="text-sm text-muted mt-2.5">
            <a
              href="tel:01224057700"
              className="hover:text-navy transition-colors duration-200"
            >
              01224 057 700
            </a>
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-white p-8 shadow-sm">
          <Mail size={22} className="text-navy mb-4" />
          <h3 className="font-bold text-ink tracking-tight">Email</h3>
          <p className="text-sm text-muted mt-2.5">
            <a
              href="mailto:hello@sudsenviro.com"
              className="hover:text-navy transition-colors duration-200"
            >
              hello@sudsenviro.com
            </a>
          </p>
        </div>
      </div>
    </Section>
  )
}
