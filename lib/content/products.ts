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
      series: 'RhinoRoFlo and RhinoRoTex',
      stream: 'Stormwater',
      category: 'Flow control chambers',
    },
    intro: [
      'RhinoRoFlo (SERF) orifice and RhinoRoTex (ROTEX) vortex flow control chambers hold stormwater discharge to a pre-set maximum rate, protecting downstream drainage from overload during heavy rainfall.',
      'Both are passive, with no power supply, and are designed to the Sewers for Adoption 7th Edition, DCG Type D and E chambers and BS EN 13598-2.',
    ],
    sections: [
      {
        heading: { lead: 'RhinoRoTex', trail: 'Vortex flow control' },
        body: [
          'RhinoRoTex (ROTEX600 to ROTEX1200) uses a passive vortex regulator on the outlet. As inflow rises the vortex strengthens and holds the outflow to a pre-set maximum rate.',
          'It fits curved or flat surfaces as standard, and is supplied factory-fitted in an HDPE twinwall chamber or as a standalone unit for an existing concrete chamber.',
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
            term: 'Emergency bypass',
            detail:
              'A bypass door on the flow controller is opened by a cable from the surface, so the chamber can be drained without entry.',
          },
          {
            term: 'Chamber range',
            detail:
              'Housed in 600 to 1200 mm chambers, with the flow controller designed to suit the site design head and discharge rate.',
          },
        ],
      },
      {
        heading: { lead: 'RhinoRoFlo', trail: 'Orifice flow control' },
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
              'SERF300, SERF450 and SERF600: a one-piece, factory-fitted unit with a removable orifice plate cap and a drain-down operated from ground level.',
          },
        ],
      },
    ],
  },

  catchpit: {
    lockup: {
      series: 'SERS and SERDS Series',
      stream: 'Silt management',
      category: 'Catch-pit chambers',
    },
    intro: [
      'RHINO SERDS, the Advanced Plus 600 Series, is engineered for the efficient catchment and removal of silt and debris from impermeable or hard surface areas such as paths, driveways, patios, roofs, car parks, roads and highways.',
      'A primary and secondary filtration system improves downstream water quality and reduces the risk of flooding. The RHINO SERS Series adds a removable silt bucket in 300, 450 and 600 mm chambers, lifted out and emptied from above ground.',
    ],
  },

  'pump-station': {
    lockup: {
      series: 'RhinoLift',
      stream: 'Packaged',
      category: 'Pumping stations',
    },
    intro: [
      'RhinoLift packaged pumping stations move foul water, stormwater and grey water where gravity drainage is impractical or impossible.',
      'From a single dwelling to large commercial sites, each station is custom-built to the flow and storage the project needs, in an MDPE or GRP chamber with vortex or macerator pumps, as a single pump or a dual duty-standby pair.',
    ],
  },
}
