import * as home from '@/lib/content/home'
import * as contact from '@/lib/content/contact'
import * as builderHub from '@/lib/content/builder-hub'
import * as waterJourney from '@/lib/content/water-journey'
import { PRIMARY_NAV, FOOTER } from '@/lib/content/navigation'
import { PRODUCT_NARRATIVE } from '@/lib/content/products'
import { SITE_EXPLORER, SITE_EXPLORER_PLOTS } from '@/lib/content/site-explorer'

/**
 * The site's copy as shipped in the code, grouped into the sections the
 * content editor offers. What Sean saves in the editor is merged over
 * these (see merge.ts), so a field nobody has edited always shows the
 * wording in lib/content/, and code changes to structure keep working.
 */
export const CONTENT_DEFAULTS = {
  home: {
    HERO: home.HERO,
    WATER_STREAMS: home.WATER_STREAMS,
    WATER_TABS: home.WATER_TABS,
    INNOVATION_SLIDES: home.INNOVATION_SLIDES,
    TESTIMONIALS_HEADING: home.TESTIMONIALS_HEADING,
    TESTIMONIALS: home.TESTIMONIALS,
    RHINO_RANGE: home.RHINO_RANGE,
    SOLUTION_ROUTES: home.SOLUTION_ROUTES,
    BUILDER_CTA: home.BUILDER_CTA,
    PRODUCT_TILES: home.PRODUCT_TILES,
  },
  navigation: { PRIMARY_NAV, FOOTER },
  contact: {
    CONTACT_HERO: contact.CONTACT_HERO,
    SUPPORT_CARDS: contact.SUPPORT_CARDS,
    EXISTING_CUSTOMER: contact.EXISTING_CUSTOMER,
    CONTACT_FORM: contact.CONTACT_FORM,
  },
  builderHub: {
    BUILDER_HUB: builderHub.BUILDER_HUB,
    BUILDER_CARDS: builderHub.BUILDER_CARDS,
  },
  products: PRODUCT_NARRATIVE,
  siteExplorer: { SITE_EXPLORER, SITE_EXPLORER_PLOTS },
  waterJourney: {
    WATER_JOURNEY: waterJourney.WATER_JOURNEY,
    WATER_JOURNEY_STOPS: waterJourney.WATER_JOURNEY_STOPS,
  },
}

export type SiteContent = typeof CONTENT_DEFAULTS
export type SectionId = keyof SiteContent
export type HomeContent = SiteContent['home']
export type NavigationContent = SiteContent['navigation']
export type ContactContent = SiteContent['contact']
export type BuilderHubContent = SiteContent['builderHub']
export type SiteExplorerContent = SiteContent['siteExplorer']
export type WaterJourneyContent = SiteContent['waterJourney']

export const SECTION_IDS = Object.keys(CONTENT_DEFAULTS) as SectionId[]

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as string[]).includes(value)
}

/** How each section is named in the editor and where it shows on the site. */
export const SECTION_META: Record<SectionId, { label: string; description: string; preview: string }> = {
  home: { label: 'Home page', description: 'Hero, water tabs, innovation slides, testimonials, RHINO range and the cards further down.', preview: '/' },
  navigation: { label: 'Header and footer', description: 'Menu labels, the RHINO Range menu, header buttons and the footer.', preview: '/' },
  contact: { label: 'Contact page', description: 'Heading, support cards, existing customer block and the form labels.', preview: '/contact' },
  builderHub: { label: 'Builder hub', description: 'The SuDS Builder hub heading and product cards.', preview: '/builder' },
  products: { label: 'Product pages', description: 'The story on each product page: lockup, intro, clock section and feature sections.', preview: '/products' },
  siteExplorer: { label: 'Site Explorer', description: 'The development types and the product cards on the Site Explorer.', preview: '/site-explorer' },
  waterJourney: { label: 'Water journey', description: 'The roof-to-river journey page: intro, the copy at each stop and the closing call to action.', preview: '/water-journey' },
}
