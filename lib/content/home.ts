import type { RichText } from './rich-text'
import { webflowAsset } from './webflow-assets'

/**
 * Home page copy, transcribed from the Webflow `Home` page
 * (`reference/webflow/page-home.outline.txt`).
 *
 * Headings are stored as emphasis segments rather than plain strings so the
 * two-tone treatment on the Webflow site survives the port. Nothing here
 * describes layout - that belongs in the components.
 */

// ── Hero ─────────────────────────────────────────────────────

export const HERO = {
  logo: webflowAsset.logoMain,
  heading: [
    { text: 'Putting ' },
    { text: 'you', emphasis: 'highlight' },
    { text: ' in ' },
    { text: 'control', emphasis: 'highlight' },
    { text: ' of ' },
    { text: 'your drainage solutions', emphasis: 'highlight' },
  ] satisfies RichText,
} as const

// ── Water management tabs ────────────────────────────────────

export interface WaterTab {
  id: string
  label: { lead: string; trail: string }
  body: RichText
}

export const WATER_TABS: WaterTab[] = [
  {
    id: 'stormwater',
    label: { lead: 'Stormwater', trail: 'Management' },
    body: [
      { text: 'Improper surface water management can lead to ' },
      { text: 'flooding', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'erosion', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'pollution', emphasis: 'lowlight' },
      {
        text: '. Effective management involves drainage basins, conveyance systems, and retention basins. ',
      },
      { text: 'At SuDS Enviro', emphasis: 'highlight' },
      { text: ', we use advanced techniques to ' },
      { text: 'control runoff', emphasis: 'highlight' },
      { text: ', ' },
      { text: 'reduce erosion', emphasis: 'highlight' },
      { text: ', and ' },
      { text: 'improve water quality', emphasis: 'highlight' },
      { text: '. Learn more about our innovative, customer-first solutions today!' },
    ],
  },
  {
    id: 'silt',
    label: { lead: 'Silt', trail: 'Management' },
    body: [
      { text: 'Poor ' },
      { text: 'silt management', emphasis: 'lowlight' },
      { text: ' can cause ' },
      { text: 'blockages', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'reduce water quality', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'damage ecosystems', emphasis: 'lowlight' },
      { text: '. Effective silt control includes ' },
      { text: 'sediment traps', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'silt chambers', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'regular maintenance', emphasis: 'lowlight' },
      { text: '. At ' },
      { text: 'SuDS Enviro', emphasis: 'lowlight' },
      { text: ', we implement ' },
      { text: 'modern solutions', emphasis: 'lowlight' },
      { text: ' to capture and manage ' },
      { text: 'silt', emphasis: 'lowlight' },
      { text: ', ensuring ' },
      { text: 'clear', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'free-flowing waterways', emphasis: 'lowlight' },
      { text: '. Discover our innovative, customer-first approaches today!' },
    ],
  },
  {
    id: 'rainwater',
    label: { lead: 'Rain Water', trail: 'Management' },
    body: [
      { text: 'Rainwater, when not properly managed, can cause ' },
      { text: 'flooding', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'erosion', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'waterlogging', emphasis: 'lowlight' },
      { text: '. Effective rainwater management includes ' },
      { text: 'rainwater harvesting', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'gutter systems', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'roof drains', emphasis: 'lowlight' },
      { text: '. At SuDS Enviro, we implement modern solutions to ' },
      { text: 'capture', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'control', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'reuse', emphasis: 'lowlight' },
      { text: ' rainwater, reducing flooding and promoting ' },
      { text: 'sustainability', emphasis: 'lowlight' },
      { text: '. Learn more about our innovative approaches!' },
    ],
  },
  {
    id: 'foul',
    label: { lead: 'Foul Water', trail: 'Management' },
    body: [
      { text: 'Poor foul water management results in ' },
      { text: 'contamination', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'health hazards', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'environmental damage', emphasis: 'lowlight' },
      {
        text: '. Effective systems, including sanitary sewers and wastewater treatment, are ',
      },
      { text: 'essential', emphasis: 'lowlight' },
      { text: '. SuDS Enviro tackles these issues with ' },
      { text: 'cutting-edge solutions', emphasis: 'lowlight' },
      { text: ', ensuring ' },
      { text: 'safe', emphasis: 'lowlight' },
      { text: ', ' },
      { text: 'clean', emphasis: 'lowlight' },
      { text: ', and ' },
      { text: 'sustainable', emphasis: 'lowlight' },
      { text: ' waste management. Explore our innovative, customer-focused methods now!' },
    ],
  },
]

// ── Innovation slider: the three RHINO sub-brands ────────────

export interface InnovationSlide {
  id: string
  /** Sub-brand lockup, e.g. "Rhino" + italic "RoFlo". */
  brand: { lead: string; mark: string }
  /** Strapline beneath the lockup. */
  strapline: RichText
  body: RichText[]
  cta: { label: string; href: string }
  /** Distinguishes the autoFlo slide, which uses the amber accent. */
  accent?: 'green' | 'amber'
}

export const INNOVATION_SLIDES: InnovationSlide[] = [
  {
    id: 'roflo',
    brand: { lead: 'Rhino', mark: 'RoFlo' },
    strapline: [{ text: 'innovating ' }, { text: 'hydrology', emphasis: 'highlight' }],
    body: [
      [
        { text: 'With ' },
        { text: 'expertise', emphasis: 'highlight' },
        { text: ' in ' },
        { text: 'hydrology', emphasis: 'highlight' },
        { text: ', we’re leveraging ' },
        { text: 'leading vortex flow experts', emphasis: 'highlight' },
        { text: ' to enhance our ' },
        { text: 'Rhino RoFlo', emphasis: 'highlight' },
        { text: ' flow control.' },
      ],
      [
        { text: 'This is a ' },
        { text: 'revolutionary solution', emphasis: 'highlight' },
        { text: ' for managing water flow with ' },
        { text: 'unmatched precision', emphasis: 'highlight' },
        {
          text: '. Designed for sustainable drainage systems, it utilises advanced vortex technology to ',
        },
        { text: 'control discharge rates efficiently', emphasis: 'highlight' },
        { text: ' without the need for moving parts or power, ' },
        { text: 'reducing maintenance and energy costs.', emphasis: 'highlight' },
      ],
    ],
    cta: { label: 'Rhino Vortex Control', href: '/products/flow-control' },
  },
  {
    id: 'multiflo',
    brand: { lead: 'Rhino', mark: 'multiFlo' },
    strapline: [{ text: 'Versatile ' }, { text: 'system entry', emphasis: 'highlight' }],
    body: [
      [
        { text: 'Introducing the ' },
        { text: 'F/SIC', emphasis: 'highlight' },
        { text: ' Inspection Chamber’s ' },
        { text: 'Clockwork System', emphasis: 'italic' },
        { text: ' - a unique ' },
        { text: 'multi-inlet', emphasis: 'highlight' },
        { text: ' layout positioned at ' },
        { text: '3, 5, 6, 7', emphasis: 'highlight' },
        { text: ' and ' },
        { text: '9 o’clock', emphasis: 'highlight' },
        { text: ' for ' },
        { text: 'foul and surface water', emphasis: 'highlight' },
        { text: ' solutions.' },
      ],
      [
        { text: 'Designed for ' },
        { text: 'precision', emphasis: 'highlight' },
        { text: ' and ' },
        { text: 'flexibility', emphasis: 'highlight' },
        { text: ', this configuration allows for seamless connection to ' },
        { text: 'various pipe systems', emphasis: 'highlight' },
        { text: ', enhancing both ' },
        { text: 'installation speed', emphasis: 'highlight' },
        { text: ' and ' },
        { text: 'site adaptability', emphasis: 'highlight' },
        { text: '. Its versatile access points ' },
        { text: 'reduce bottlenecks, improve flow management', emphasis: 'highlight' },
        { text: ', and ' },
        { text: 'future-proof your drainage design.', emphasis: 'highlight' },
      ],
    ],
    cta: { label: 'Rhino F/SIC Inspection Chamber', href: '/products/inspection-chamber' },
  },
  {
    id: 'autoflo',
    brand: { lead: 'Rhino', mark: 'autoFlo' },
    strapline: [{ text: 'sensible ' }, { text: 'contingencies', emphasis: 'highlight' }],
    accent: 'amber',
    body: [
      [
        { text: 'An advanced ' },
        { text: 'auto-siphon', emphasis: 'highlight' },
        { text: ' engineered to ' },
        { text: 'maintain flow,', emphasis: 'highlight' },
        { text: ' even under pressure.' },
      ],
      [
        { text: 'Built with ' },
        { text: 'cutting-edge manufacturing', emphasis: 'highlight' },
        { text: ', it ' },
        { text: 'detects blockages and automatically bypasses', emphasis: 'highlight' },
        { text: ' the standard flow path, while simultaneously ' },
        { text: 'triggering a flushing action', emphasis: 'highlight' },
        { text: ' to clear the obstruction.' },
      ],
    ],
    cta: { label: 'SuDS Extras', href: '/products' },
  },
]

// ── Testimonials ─────────────────────────────────────────────

export interface Testimonial {
  id: string
  headline: RichText
  author: { name: string; role: string }
  quote: RichText
}

export const TESTIMONIALS_HEADING: RichText = [
  { text: 'tried, ' },
  { text: 'tested', emphasis: 'italic' },
  { text: ' and ' },
  { text: 'trusted', emphasis: 'highlight' },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'emma-p',
    headline: [
      { text: 'A Standard of ' },
      { text: 'Excellence', emphasis: 'bold' },
    ],
    author: { name: 'Emma P.', role: 'Civil engineer' },
    quote: [
      { text: 'Working with ' },
      { text: 'SuDS Enviro', emphasis: 'highlight' },
      { text: ' has been a ' },
      { text: 'game-changer.', emphasis: 'highlight' },
      { text: ' The ' },
      { text: 'bespoke nature', emphasis: 'highlight' },
      { text: ' of their ' },
      { text: 'Rhino products,', emphasis: 'highlight' },
      {
        text: ' particularly their inspection chambers and attenuation tanks, has allowed us to design systems that ',
      },
      { text: 'perfectly fit our project requirements.', emphasis: 'highlight' },
      { text: ' Their ' },
      { text: '‘Bespoke, Standardised’', emphasis: 'highlight' },
      { text: ' approach is not just a slogan, it’s a reality that has ' },
      { text: 'delivered exceptional results.', emphasis: 'highlight' },
    ],
  },
  {
    id: 'mark-d',
    headline: [
      { text: 'bespoke', emphasis: 'bold' },
      { text: ' solutions that actually ' },
      { text: 'work', emphasis: 'bold' },
    ],
    author: { name: 'Mark D.', role: 'Property developer' },
    quote: [
      { text: 'Our ' },
      { text: 'previous drainage systems', emphasis: 'highlight' },
      { text: ' felt like a ' },
      { text: 'one-size-fits-all', emphasis: 'highlight' },
      { text: ' approach, leading to constant issues. ' },
      { text: 'SuDS Enviro’s bespoke inlet bases', emphasis: 'highlight' },
      { text: ' have ' },
      { text: 'changed the game', emphasis: 'highlight' },
      { text: ' for us. Their clock system for inlets allowed us to ' },
      { text: 'tailor the drainage exactly', emphasis: 'highlight' },
      { text: ' to our site’s ' },
      { text: 'specifications.', emphasis: 'highlight' },
      { text: ' We’ve seen a ' },
      { text: 'significant reduction in blockages and maintenance', emphasis: 'highlight' },
      { text: ' needs since ' },
      { text: 'switching to their Rhino range.', emphasis: 'highlight' },
    ],
  },
]

// ── The RHINO Range block ────────────────────────────────────

export const RHINO_RANGE = {
  eyebrow: { lead: 'the', mark: 'RHINO RANGE' },
  heading: [
    { text: 'One solution ' },
    { text: 'All Situations', emphasis: 'highlight' },
  ] satisfies RichText,
  body: [
    { text: 'The perfect solution', emphasis: 'highlight' },
    { text: ' for all your drainage needs. Built for ' },
    { text: 'durability and efficiency', emphasis: 'highlight' },
    { text: ', our products tackle every situation, ' },
    { text: 'from rainwater harvesting', emphasis: 'highlight' },
    { text: ' to ' },
    { text: 'bespoke inspection chambers', emphasis: 'highlight' },
    { text: ' and ' },
    { text: 'flow control.', emphasis: 'highlight' },
    { text: ' Try our ' },
    { text: 'SuDS Editor', emphasis: 'highlight' },
    { text: ' and ' },
    { text: 'visualise', emphasis: 'highlight' },
    { text: ' your ' },
    { text: 'bespoke solution,', emphasis: 'highlight' },
    { text: ' today.' },
  ] satisfies RichText,
  cta: { label: 'View The Rhino Range', href: '/products' },
} as const

/** The two-up storm / foul split that sits under the hero. */
export const WATER_STREAMS = [
  { id: 'storm', lead: 'Storm Water', trail: 'Management', icon: webflowAsset.rhinoIcon },
  { id: 'foul', lead: 'Foul Water', trail: 'Management', icon: webflowAsset.rhinoIcon },
] as const

// ── Builder CTA ──────────────────────────────────────────────

export const BUILDER_CTA = {
  heading: [
    { text: 'build', emphasis: 'italic' },
    { text: ' your System!' },
  ] satisfies RichText,
  body: [
    { text: 'From selecting inlet ' },
    { text: 'positions', emphasis: 'highlight' },
    { text: ', chamber ' },
    { text: 'depths', emphasis: 'highlight' },
    { text: ', and ' },
    { text: 'entry angles', emphasis: 'highlight' },
    { text: ', to adding ' },
    { text: 'flow controls', emphasis: 'highlight' },
    { text: ', ' },
    { text: 'filters', emphasis: 'highlight' },
    { text: ', or extras, our ' },
    { text: 'SuDS Builder', emphasis: 'italic' },
    { text: ' puts the full product range ' },
    { text: 'at your fingertips', emphasis: 'highlight' },
    { text: ', letting you design a system that ' },
    { text: 'fits your project perfectly.', emphasis: 'highlight' },
  ] satisfies RichText,
  cta: { label: 'SuDS Builder Hub', href: '/configurator' },
} as const

// ── Solution routes: foul and surface water ──────────────────

export interface SolutionRoute {
  id: string
  heading: { lead: string; trail: string }
  logo: string
  links: { label: string; href: string }[]
}

export const SOLUTION_ROUTES: SolutionRoute[] = [
  {
    id: 'foul',
    heading: { lead: 'foul water', trail: 'solutions' },
    logo: webflowAsset.rhinoColour,
    links: [
      { label: 'Inspection Chambers', href: '/products/inspection-chamber' },
      { label: 'Pumping Stations', href: '/products/pump-station' },
    ],
  },
  {
    id: 'surface',
    heading: { lead: 'surface water', trail: 'solutions' },
    logo: webflowAsset.rhinoColour,
    links: [
      { label: 'Inspection Chambers', href: '/products/inspection-chamber' },
      { label: 'Flow Controls', href: '/products/flow-control' },
      { label: 'Silt Management', href: '/products/catchpit-silt-trap' },
      { label: 'Hydrodynamic Separator', href: '/products/rhinoceptor' },
      { label: 'Pumping Stations', href: '/products/pump-station' },
      { label: 'Oil / Water Separator', href: '/products/rhinoceptor' },
    ],
  },
]

// ── "more from" product cards ────────────────────────────────

export interface ProductTile {
  id: string
  heading: { lead: string; trail: string }
  image: string
  links: { label: string; href: string }[]
}

export const PRODUCT_TILES: ProductTile[] = [
  {
    id: 'inspection-chambers',
    heading: { lead: 'Inspection', trail: 'Chambers' },
    image: webflowAsset.cardInspectionChambers,
    links: [
      { label: '3-inlet', href: '/products/inspection-chamber' },
      { label: '5-inlet', href: '/products/inspection-chamber' },
    ],
  },
  {
    id: 'flow-controls',
    heading: { lead: 'Flow', trail: 'Controls' },
    image: webflowAsset.cardFlowControls,
    links: [
      { label: 'Orifice', href: '/products/flow-control' },
      { label: 'Vortex', href: '/products/flow-control' },
    ],
  },
  {
    id: 'catchment-pits',
    heading: { lead: 'Catchment', trail: 'Pits' },
    image: webflowAsset.cardCatchmentPits,
    links: [{ label: 'Learn more', href: '/products/catchpit-silt-trap' }],
  },
  {
    id: 'pumping-stations',
    heading: { lead: 'Pumping', trail: 'Stations' },
    image: webflowAsset.cardPumpingStations,
    links: [{ label: 'Learn more', href: '/products/pump-station' }],
  },
  {
    id: 'hydrodynamic-separators',
    heading: { lead: 'Hydrodynamic', trail: 'Separators' },
    image: webflowAsset.cardHydrodynamicSeparators,
    links: [{ label: 'Learn more', href: '/products/rhinoceptor' }],
  },
  {
    id: 'site-planner',
    heading: { lead: 'Site', trail: 'Planner' },
    image: webflowAsset.cardSitePlanner,
    links: [{ label: 'Learn more', href: '/configurator' }],
  },
]
