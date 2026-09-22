import type { ClockPosition, ProductId } from '@/lib/types'

/**
 * Product narrative lifted from the Webflow product pages.
 *
 * `lib/product-catalog.ts` already holds the hard data - dimensions,
 * compliance, applications. This is the explanatory copy that sat
 * alongside it, keyed by the same `ProductId`.
 *
 * The Webflow site splits some families across pages that this catalogue
 * keeps as one entry: Vortex and Orifice are two Webflow pages but one
 * `flow-control` product, and SERSIC and SERFIC are two pages but one
 * `chamber`. Those become `sections` on a single page rather than
 * duplicate catalogue entries.
 *
 * Source outlines: `reference/webflow/page-*.outline.txt`.
 *
 * Note on pipe diameters: the Webflow SERSIC and SERFIC pages quote
 * "110mm, 150mm, 225mm, or 300mm". This repo says 160 mm, matching
 * EN1401 and rule R7. That conflict is flagged for the client in
 * reference/webflow/README.md, so the copy here avoids the figure
 * entirely - the specification table carries the repo's numbers.
 */

export interface Highlight {
  term: string
  detail: string
}

export interface NarrativeSection {
  heading: { lead: string; trail: string }
  body?: string[]
  highlights?: Highlight[]
}

export interface ClockVariant {
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
  sections?: NarrativeSection[]
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
    sections: [
      {
        heading: { lead: 'how the', trail: 'SIC / SERSIC works' },
        body: [
          'Designed to optimise the flow and management of water in drainage systems. The chamber’s benched base has sloped surfaces that guide water into the central flow channel, ensuring debris and sediment are directed into the main drainage path rather than settling in corners. This setup reduces the likelihood of blockages and promotes smooth, uninterrupted water flow.',
          'The central channel follows the profile of the drainage pipes connected to the chamber, minimising turbulence and enhancing the hydraulic efficiency of the system. This design ensures that stormwater or sewage can flow freely through the chamber, even under heavy load conditions, without the risk of sediment buildup.',
        ],
      },
      {
        heading: { lead: 'the foul water', trail: 'FIC / SERFIC series' },
        body: [
          'The RHINO SERFIC Series Foul Water Benched Channelled Inspection Chambers are prefabricated factory-built units engineered for efficient foul water and drainage management.',
          'They share the channelled base and optional side connections of the surface water range, with the same clock-face inlet layout.',
        ],
      },
    ],
  },

  'flow-control': {
    lockup: {
      series: 'SERF Series',
      stream: 'Stormwater',
      category: 'Flow control chambers',
    },
    intro: [
      'The SuDS RHINO SERF Series Flow Control Chambers deliver optimal performance, ease of installation, and full compliance with industry standards.',
    ],
    sections: [
      {
        heading: { lead: 'RHINO', trail: 'Vortex flow control' },
        body: [
          'The RHINO Vortex Flow Control is an advanced and highly innovative solution for managing stormwater flow in drainage systems.',
          'Engineered for versatility, it can be fixed to either curved or flat surfaces as standard, making it adaptable to the specific requirements of various projects.',
        ],
        highlights: [
          {
            term: 'Passive flow control',
            detail: 'Requires no external power or mechanical parts, ensuring reliability.',
          },
          {
            term: 'Low maintenance',
            detail:
              'With no moving components, the system is highly robust and requires minimal servicing.',
          },
          {
            term: 'Space efficient',
            detail:
              'Compact design fits into a wide range of chamber sizes without taking up excessive space.',
          },
          {
            term: 'Environmental benefits',
            detail:
              'Helps manage stormwater in a controlled manner, preventing erosion and protecting downstream waterways from sediment and pollution.',
          },
        ],
      },
      {
        heading: { lead: 'RHINO', trail: 'Orifice flow control' },
        highlights: [
          {
            term: 'Stormwater applications',
            detail:
              'Ideal for applications requiring controlled flow of stormwater, and inspection and maintenance of surface pipework systems.',
          },
          {
            term: 'Versatile',
            detail: 'Suitable for both adoptable and non-adoptable installations.',
          },
          {
            term: 'Plug and play',
            detail:
              'A one-piece, factory-fitted unit with a built-in service drain down feature activated from ground level, simplifying installation.',
          },
        ],
      },
    ],
  },

  catchpit: {
    lockup: {
      series: 'Advanced Catchpit Range',
      stream: 'Silt management',
      category: 'Catch-pit chambers',
    },
    intro: [
      'The SuDS RHINO 600 Series Advanced Plus Range is specifically engineered for the efficient catchment and removal of silt and debris from impermeable or hard surface areas such as paths, driveways, patios, roofs, car parks, roads and highways.',
      'Featuring an innovative primary and secondary filtration system, this range plays a critical role in surface water management.',
    ],
  },

  'pump-station': {
    lockup: {
      series: 'RHINOLIFT',
      stream: 'Packaged',
      category: 'Pumping stations',
    },
    intro: [
      'The RHINOLIFT Packaged Pumping Stations are designed to provide reliable, efficient and robust solutions for managing foul water, stormwater and grey water.',
      'Whether for residential or large-scale commercial applications, RHINOLIFT systems offer flexibility and durability, with a range of single and dual pump configurations for duty/standby arrangements. Each system is custom-built to meet specific project needs.',
    ],
  },
}
