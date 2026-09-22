import type { ClockPosition, ProductId } from '@/lib/types'

/**
 * Product narrative lifted from the Webflow product pages.
 *
 * `lib/product-catalog.ts` already holds the hard data - dimensions,
 * compliance, applications. This is the explanatory copy that sat
 * alongside it on the Webflow site, keyed by the same `ProductId`.
 *
 * Only the products whose Webflow pages have been ported are listed;
 * pages fall back to the catalogue entry alone when there is no entry
 * here. Source outlines are in `reference/webflow/page-*.outline.txt`.
 */

export interface ClockVariant {
  /** e.g. "available for all chambers". */
  heading: { lead: string; emphasis: string; trail: string }
  available: ClockPosition[]
  title: string
}

export interface ProductNarrative {
  /** Four-line hero lockup, as on the Webflow product pages. */
  lockup: { series: string; stream: string; category: string }
  intro: string[]
  clock?: {
    heading: { lead: string; trail: string }
    body: string[]
    variants: ClockVariant[]
  }
  howItWorks?: {
    heading: { lead: string; trail: string }
    body: string[]
  }
}

export const PRODUCT_NARRATIVE: Partial<Record<ProductId, ProductNarrative>> = {
  chamber: {
    lockup: {
      series: 'SIC / SERSIC Series',
      stream: 'Surface water',
      category: 'Inspection chambers',
    },
    intro: [
      'The RHINO SIC/SERSIC Series Surface Water Benched Channelled Inspection Chambers are prefabricated, factory-built units engineered for efficient stormwater and drainage management.',
      'Constructed from High-Density Polyethylene (HDPE) using advanced extrusion and thermoforming technologies, the RHINO Inspection Chambers arrive fully assembled and ready for installation. Designed for both light-duty and full-traffic loading applications, these chambers are versatile for numerous project requirements.',
    ],
    clock: {
      heading: { lead: 'Clock-face', trail: 'versatile inlet selection' },
      body: [
        // NOTE: the Webflow page states 110/150/225/300 mm here. This repo
        // uses 160 mm, matching EN1401 and rule R7. See
        // reference/webflow/README.md - it is flagged for the client and
        // deliberately not resolved either way, so this sentence avoids
        // quoting the disputed figure.
        'These chambers feature a main channelled base with optional side connections, so a single unit can serve a range of pipe systems.',
        'The system integrates with the RHINO adaptor range, allowing flexible connectivity for both main and side channels.',
      ],
      variants: [
        {
          heading: { lead: 'available for', emphasis: 'all', trail: 'chambers' },
          available: ['3', '6', '9'],
          title:
            'Chamber clock face with straight side channels at 3, 6 and 9 o’clock and the outlet fixed at 12',
        },
        {
          heading: { lead: 'available for', emphasis: 'select', trail: 'chambers' },
          available: ['3', '5', '6', '7', '9'],
          title:
            'Chamber clock face with all five inlets at 3, 5, 6, 7 and 9 o’clock and the outlet fixed at 12',
        },
      ],
    },
    howItWorks: {
      heading: { lead: 'how the', trail: 'SIC / SERSIC works' },
      body: [
        'Designed to optimise the flow and management of water in drainage systems. The chamber’s benched base has sloped surfaces that guide water into the central flow channel, ensuring debris and sediment are directed into the main drainage path rather than settling in corners. This setup reduces the likelihood of blockages and promotes smooth, uninterrupted water flow.',
        'The central channel follows the profile of the drainage pipes connected to the chamber, minimising turbulence and enhancing the hydraulic efficiency of the system. This design ensures that stormwater or sewage can flow freely through the chamber, even under heavy load conditions, without the risk of sediment buildup.',
      ],
    },
  },
}
