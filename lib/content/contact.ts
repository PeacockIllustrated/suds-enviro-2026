import type { RichText } from './rich-text'

/**
 * Contact page copy, transcribed from the Webflow `Contact` page.
 *
 * The three support cards are still lorem ipsum on the Webflow site. They
 * are kept here verbatim, flagged, rather than invented - real copy has to
 * come from the client.
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
  /** True while the Webflow site still carries placeholder copy. */
  placeholder?: boolean
}

export const SUPPORT_CARDS: SupportCard[] = [
  {
    id: 'sales',
    heading: 'Sales',
    // TODO(client): placeholder on the Webflow site. Needs real copy.
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in ero.',
    cta: { label: 'Contact sales', href: '#contact-form' },
    placeholder: true,
  },
  {
    id: 'support',
    heading: 'Help & Support',
    // TODO(client): placeholder on the Webflow site. Needs real copy.
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in ero.',
    cta: { label: 'Get support', href: '#contact-form' },
    placeholder: true,
  },
  {
    id: 'more',
    heading: 'More info',
    // TODO(client): placeholder on the Webflow site. Needs real copy.
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in ero.',
    cta: { label: 'Learn more', href: '/products' },
    placeholder: true,
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
