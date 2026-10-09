import type { RichText } from './rich-text'

/**
 * Contact page copy, transcribed from the Webflow `Contact` page.
 *
 * The three support cards carried lorem ipsum on Webflow until 2026-10-09;
 * the copy below replaced it on both sites.
 */

export const CONTACT_HERO = {
  heading: { lead: 'SuDS solutions', trail: 'nation-wide' },
  actions: [
    { label: 'Learn more', href: '/products', variant: 'outline' as const },
    { label: 'Discovery call', href: '#contact-form', variant: 'primary' as const },
  ],
}

export interface SupportCard {
  id: string
  heading: string
  body: string
  cta: { label: string; href: string }
}

export const SUPPORT_CARDS: SupportCard[] = [
  {
    id: 'sales',
    heading: 'Sales',
    body: 'Pricing a scheme or speccing a chamber? Talk to our team about the right RHINO products for your site.',
    cta: { label: 'Contact sales', href: '#contact-form' },
  },
  {
    id: 'support',
    heading: 'Help & Support',
    body: 'Questions on installation or maintenance? Our team is on hand to keep your system working as designed.',
    cta: { label: 'Get support', href: '#contact-form' },
  },
  {
    id: 'more',
    heading: 'More info',
    body: 'Explore the RHINO range, from inspection chambers to flow controls, and find the right fit for your site.',
    cta: { label: 'Learn more', href: '/products' },
  },
]

export const EXISTING_CUSTOMER = {
  heading: 'Already a customer?',
  body: [
    { text: 'Our care doesn’t end with the sale. ' },
    { text: 'If you need support, help is always at hand', emphasis: 'highlight' },
  ] satisfies RichText,
  cta: { label: 'Get support', href: '#contact-form' },
}

export const CONTACT_FORM = {
  heading: { lead: 'find a solution,', trail: 'The SuDS Enviro way.' },
  success: {
    title: 'Thank you! Your submission has been received!',
    body: 'Our bespoke AI assistant, Susie SuDS, will follow up with you instantly and organise a meeting with the team.',
    cta: { label: 'The RHINO Range', href: '/products' },
  },
  error: 'Something went wrong while submitting the form. Please try again.',
}
