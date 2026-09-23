import type { SectionId } from './defaults'

/**
 * Human names for the pieces of copy, used by the editor's side panel and
 * by the hover labels drawn over the page. Keys are the property names in
 * lib/content/; anything unlisted is turned into words ("ctaLabel" becomes
 * "Cta label").
 */

const SECTION_LABELS: Record<SectionId, string> = {
  home: 'Home page',
  navigation: 'Header and footer',
  contact: 'Contact page',
  builderHub: 'Builder hub',
  products: 'Product pages',
  siteExplorer: 'Site Explorer',
  waterJourney: 'Water journey',
}

const GROUP_LABELS: Record<string, string> = {
  HERO: 'Hero',
  WATER_STREAMS: 'Storm and foul water',
  WATER_TABS: 'Water management tabs',
  INNOVATION_SLIDES: 'RoFlo, multiFlo and autoFlo',
  TESTIMONIALS_HEADING: 'Testimonials heading',
  TESTIMONIALS: 'Testimonials',
  RHINO_RANGE: 'The RHINO Range',
  SOLUTION_ROUTES: 'Solutions',
  BUILDER_CTA: 'Build your system',
  PRODUCT_TILES: 'Product cards',
  PRIMARY_NAV: 'Header',
  FOOTER: 'Footer',
  CONTACT_HERO: 'Contact heading',
  SUPPORT_CARDS: 'Support cards',
  EXISTING_CUSTOMER: 'Existing customers',
  CONTACT_FORM: 'Contact form',
  BUILDER_HUB: 'Builder hub heading',
  BUILDER_CARDS: 'Builder cards',
  WATER_JOURNEY: 'Journey intro and controls',
  WATER_JOURNEY_STOPS: 'Journey stops',
  chamber: 'Inspection chambers',
  catchpit: 'Catchpits',
  'flow-control': 'Flow control',
  'pump-station': 'Pumping stations',
}

const FIELD_LABELS: Record<string, string> = {
  lead: 'first line',
  trail: 'second line',
  mark: 'brand mark',
  cta: 'button',
  body: 'text',
  intro: 'introduction',
  heading: 'heading',
  headline: 'headline',
  strapline: 'strapline',
  eyebrow: 'eyebrow',
  quote: 'quote',
  lockup: 'heading',
  series: 'series name',
  stream: 'water stream',
  category: 'category',
  highlights: 'highlight',
  term: 'term',
  detail: 'detail',
  sections: 'section',
  clock: 'clock section',
  variants: 'variant',
  megaMenu: 'RHINO Range menu',
  columns: 'menu column',
  sidebar: 'menu side column',
  links: 'link',
  actions: 'button',
  brand: 'brand',
  author: 'author',
  name: 'name',
  role: 'role',
  label: 'label',
  title: 'title',
  description: 'description',
  placeholder: 'placeholder',
}

function words(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim()
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function sectionLabel(section: SectionId): string {
  return SECTION_LABELS[section]
}

export function groupLabel(key: string): string {
  return GROUP_LABELS[key] ?? capitalise(words(key))
}

/**
 * A short name for a piece of copy from its path, e.g.
 * ['home', 'WATER_TABS', 0, 'body'] becomes "Water management tabs, item 1: text".
 */
export function pathLabel(path: (string | number)[]): string {
  const [, group, ...rest] = path
  const head = typeof group === 'string' ? groupLabel(group) : ''
  const parts: string[] = []
  rest.forEach((key, i) => {
    if (typeof key === 'number') {
      parts.push(`${key + 1}`)
      return
    }
    // "link 1, label" says nothing "link 1" does not.
    if ((key === 'label' || key === 'text') && i === rest.length - 1 && typeof rest[i - 1] === 'number') return
    parts.push(FIELD_LABELS[key] ?? words(key))
  })
  if (parts.length === 0) return head
  // "Water management tabs · 1 · text" reads better as "... 1, text".
  return `${head}: ${parts.join(' ').replace(/ (\d+)/g, ' $1,').replace(/,$/, '')}`
}
