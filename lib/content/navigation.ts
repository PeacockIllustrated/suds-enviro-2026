import { webflowAsset } from './webflow-assets'

/**
 * Site navigation, ported from the Webflow `NavFinal` and `NewFooter`
 * components.
 *
 * Webflow's own routes are recorded in `reference/webflow/pages.json`. This
 * file maps them onto the routes this app actually serves - several Webflow
 * product pages collapse onto one catalogue entry here, because
 * `lib/product-catalog.ts` already carries the full spec for each family.
 */

export interface NavLink {
  label: string
  href: string
  /** Supporting line shown under the label in the mega menu. */
  description?: string
  /** Rendered but not yet linked - the product is not launched. */
  comingSoon?: boolean
}

export interface NavColumn {
  heading: string
  links: NavLink[]
  /** Product line drawing that backs this column in the mega menu. */
  artwork?: string
}

export const RHINO_RANGE_MENU: NavColumn[] = [
  {
    heading: 'Inspection Chambers',
    artwork: webflowAsset.drawingSersic,
    links: [
      {
        label: 'SIC / SERSIC',
        href: '/products/inspection-chamber',
        description: 'Storm-water inspection chamber',
      },
      {
        label: 'FIC / SERFIC',
        href: '/products/inspection-chamber',
        description: 'Foul-water inspection chamber',
      },
    ],
  },
  {
    heading: 'Flow Controls',
    artwork: webflowAsset.drawingVortex,
    links: [
      {
        label: 'Vortex Flow Control',
        href: '/products/flow-control',
        description: 'Flow regulation via passive centrifugal action',
      },
      {
        label: 'Orifice Flow Control',
        href: '/products/flow-control',
        description: 'Controlled discharge through outlet precision',
      },
    ],
  },
  {
    heading: 'Catchpits',
    artwork: webflowAsset.drawingOrifice,
    links: [
      {
        label: 'Standard Catchpit',
        href: '/products/catchpit-silt-trap',
        description: 'Simple, effective sediment interception',
      },
      {
        label: 'Protected Catchpit',
        href: '/products/catchpit-silt-trap',
        description: 'Enhanced filtration with built-in protection',
      },
    ],
  },
  {
    heading: 'Pumping Stations',
    artwork: webflowAsset.drawingAqua,
    links: [
      // TODO(client): on the Webflow site Aqua and Mini carry identical
      // descriptions, and Maxi is described as "compact ... for tight
      // spaces". Confirm the correct line for each with Sean before launch.
      {
        label: 'Aqua',
        href: '/products/pump-station',
        description: 'High-capacity pumping for demanding projects',
      },
      {
        label: 'Mini',
        href: '/products/pump-station',
        description: 'High-capacity pumping for demanding projects',
      },
      {
        label: 'Maxi',
        href: '/products/pump-station',
        description: 'Compact foul-water pumping for tight spaces',
      },
      {
        label: 'Pump Tanks',
        href: '/products/pump-station',
        description: 'Versatile tanks for controlled fluid movement',
      },
    ],
  },
  {
    heading: 'Silt Management',
    artwork: webflowAsset.drawingPumpTank,
    links: [
      {
        label: 'Dual-Filter',
        href: '/products/catchpit-silt-trap',
        description: 'Twin-stage filtration for storm-water purity',
      },
      {
        label: 'RHINO POD',
        href: '/products/rhinopod',
        description: 'Heavy-duty foul-water silt capture system',
      },
    ],
  },
  {
    heading: 'Hydrodynamic Separator',
    artwork: webflowAsset.drawingMaxi,
    links: [
      {
        // Named `*****` and disabled on the Webflow site - unreleased.
        label: 'RHINO SEHDS',
        href: '/products/rhinoceptor',
        description: 'Advanced swirl separation for cleaner outflows',
        comingSoon: true,
      },
    ],
  },
  {
    heading: 'Oil / Water Separator',
    artwork: webflowAsset.drawingMini,
    links: [
      {
        // Also `*****` and disabled on the Webflow site.
        label: 'RHINOCEPTOR',
        href: '/products/rhinoceptor',
        description: 'Removes oils efficiently from storm-water runoff',
        comingSoon: true,
      },
    ],
  },
]

/** The narrow right-hand column of the mega menu. */
export const ADAPTERS_AND_BASES: NavColumn = {
  heading: 'Adapters & Bases',
  links: [
    { label: 'Adapters', href: '/products', comingSoon: true },
    { label: '3 Inlet Base', href: '/products/inspection-chamber', comingSoon: true },
    { label: '5 Inlet Base', href: '/products/inspection-chamber', comingSoon: true },
  ],
}

export const PRIMARY_NAV = {
  brand: {
    href: '/',
    logo: webflowAsset.logoWhiteHorizontal,
    mark: webflowAsset.logoWhiteMark,
    /** The strapline that sits beside the mark in the header. */
    strapline: { lead: 'Bespoke,', trail: 'Standardised' },
  },
  megaMenu: {
    label: 'The RHINO Range',
    columns: RHINO_RANGE_MENU,
    sidebar: ADAPTERS_AND_BASES,
  },
  links: [{ label: 'Contact', href: '/contact' }] satisfies NavLink[],
  actions: [
    { label: 'RHINO Range', href: '/products' },
    { label: 'Build your SuDS', href: '/builder' },
  ] satisfies NavLink[],
} as const

export const FOOTER = {
  logo: webflowAsset.logoWhiteMark,
  strapline: { lead: 'Standardising', trail: 'bespoke solutions' },
  links: [
    { label: 'Products', href: '/products' },
    { label: 'Rhino SuDS', href: '/products' },
    { label: 'Contact', href: '/contact' },
  ] satisfies NavLink[],
} as const
