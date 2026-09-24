/**
 * The Water Journey page (/water-journey): one storm followed from the
 * roof of a house to the river, stopping at each product that handles it.
 *
 * Copy only. How each stop is drawn (where it sits on the little world,
 * which 3D model it shows) lives with the scene in
 * components/site/journey/journeyWorld.ts, keyed by `id`, so the editor
 * can change the words but never the order, the links or the models.
 *
 * Facts are taken from lib/product-catalog.ts; nothing here should claim
 * more than the catalogue does.
 */

export interface JourneyAction {
  label: string
  href: string
}

export interface JourneyStop {
  /** Stable key the scene uses to place the stop. Never edited. */
  id: 'rain' | 'harvest' | 'chamber' | 'silt' | 'separator' | 'storage' | 'flow' | 'river'
  /** Short name for the timeline. */
  label: string
  /** Two-voice heading: bold blue first, green second. */
  heading: { lead: string; trail: string }
  /** Small capitals line under the heading, joined with a slash. */
  tags: string[]
  body: string
  /** Links, first one filled, the rest outlined. */
  actions: JourneyAction[]
}

export const WATER_JOURNEY = {
  eyebrow: 'From roof to river',
  heading: { lead: 'Water', trail: 'Journey' },
  intro:
    'Follow one storm from the roof of a house to the river. At each stop you will see the part of the drainage system that deals with it, and what it is doing to the water on the way through.',
  scrollHint: 'Scroll to follow the water',
  stepHint: 'Use the arrows or the timeline to move between stops',
  skipLabel: 'Skip past the journey',
  timelineLabel: 'Journey stops',
  stopWord: 'Stop',
  previousLabel: 'Previous stop',
  nextLabel: 'Next stop',
  seeInside: 'See inside',
  hideInside: 'Show outside',
  diagramNote: 'Illustrative diagram, not a product model',
  end: {
    heading: { lead: 'Build', trail: 'Your System' },
    body: 'Every stop on the way is a product you can specify. Start with the configurator, or talk to us about the whole run.',
    actions: [
      { label: 'Open the configurator', href: '/configurator' },
      { label: 'Talk to us', href: '/contact' },
    ] as JourneyAction[],
  },
}

export const WATER_JOURNEY_STOPS: JourneyStop[] = [
  {
    id: 'rain',
    label: 'Rain',
    heading: { lead: 'Surface', trail: 'Water' },
    tags: ['Roofs', 'Driveways', 'Roads'],
    body: 'It starts on hard surfaces. Rain that lands on roofs, drives and roads cannot soak away, so it has to be collected, cleaned and slowed down before it reaches a river.',
    actions: [{ label: 'All products', href: '/products' }],
  },
  {
    id: 'harvest',
    label: 'Harvesting',
    heading: { lead: 'Rainwater', trail: 'Harvester' },
    tags: ['Below ground', '1000 to 3300 litres'],
    body: 'Roof water is the cleanest water on site, so the first stop keeps some. It is filtered into a buried tank that stores it for toilets, gardens and washdown, and overflows to the surface water drain when full. That cuts both the mains bill and what the drains further down have to carry.',
    actions: [
      { label: 'View product', href: '/products/rainwater-harvesting' },
      { label: 'Configure', href: '/configurator?product=rainwater' },
    ],
  },
  {
    id: 'chamber',
    label: 'Chambers',
    heading: { lead: 'Inspection', trail: 'Chambers' },
    tags: ['Adoptable', 'Non-adoptable'],
    body: 'Wherever pipes meet or change direction, a chamber gives access for rodding and survey. RHINO chambers take up to five inlets at 3, 5, 6, 7 and 9 o’clock with the outlet at 12, in diameters from 450 to 1200 mm.',
    actions: [
      { label: 'View product', href: '/products/inspection-chamber' },
      { label: 'Configure', href: '/configurator?product=chamber' },
    ],
  },
  {
    id: 'silt',
    label: 'Silt trap',
    heading: { lead: 'Silt', trail: 'Trap' },
    tags: ['Catchpits', 'Drives and roads'],
    body: 'Runoff from roads carries grit and silt. A catchpit slows the flow so the silt settles in its sump or bucket, where it can be lifted out, instead of building up in the pipes and storage downstream.',
    actions: [
      { label: 'View product', href: '/products/catchpit-silt-trap' },
      { label: 'Configure', href: '/configurator?product=catchpit' },
    ],
  },
  {
    id: 'separator',
    label: 'Separator',
    heading: { lead: 'Hydrodynamic', trail: 'Separator' },
    tags: ['Treatment', 'Car parks and highways'],
    body: 'Car parks and roads add oil and fine pollutants. The separator swirls the flow in a passive vortex so solids settle and hydrocarbons are held back, with no moving parts. An optional RhinoPod filter polishes it further.',
    actions: [
      { label: 'View product', href: '/products/rhinoceptor' },
      { label: 'Configure', href: '/configurator?product=rhinoceptor' },
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    heading: { lead: 'Attenuation', trail: 'Tanks' },
    tags: ['Below-ground storage'],
    body: 'In a storm, water arrives faster than a river can safely take it. Storage under a lawn or car park holds the peak and lets it go slowly. We size it with you, alongside the flow control that empties it.',
    actions: [
      { label: 'Talk to us', href: '/contact' },
      { label: 'Flow control', href: '/products/flow-control' },
    ],
  },
  {
    id: 'flow',
    label: 'Flow control',
    heading: { lead: 'Flow', trail: 'Control' },
    tags: ['Orifice', 'Vortex'],
    body: 'The flow control sets how fast stored water leaves the site, to the rate agreed for the development. An orifice plate gives simple restriction; a vortex regulator passes more flow at the same head. Neither needs power.',
    actions: [
      { label: 'View product', href: '/products/flow-control' },
      { label: 'Configure', href: '/configurator?product=flow-control' },
    ],
  },
  {
    id: 'river',
    label: 'River',
    heading: { lead: 'River', trail: 'Outfall' },
    tags: ['Cleaner', 'Slower'],
    body: 'The water reaches the river cleaner and slower than it fell, at a rate the river can take. That is the whole job of a sustainable drainage system, and every stop on the way is something we make.',
    actions: [
      { label: 'Build your system', href: '/builder' },
      { label: 'All products', href: '/products' },
    ],
  },
]
