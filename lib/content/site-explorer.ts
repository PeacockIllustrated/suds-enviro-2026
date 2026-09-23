/**
 * Site Explorer copy: four development types and the SuDS Enviro products
 * that sit beneath each one.
 *
 * Only words live here. Where each product sits in the 3D scene, which
 * model it uses and which drain it belongs to are in
 * components/site/explorer/explorerLayout.ts, keyed by the same ids, so
 * the content editor can reword a card without being able to move a pipe.
 *
 * `slug` is the product page (lib/product-catalog.ts) and `productId` the
 * configurator product; both are locked in the editor (merge.ts).
 */

export interface ExplorerProductCopy {
  /** Matches a placement in explorerLayout.ts. */
  id: string
  name: string
  /** One line on the job it does on this plot. */
  role: string
  /** Product page: /products/[slug]. */
  slug: string
  /** Configurator product: /configurator?product=[productId]. */
  productId: string
}

export interface ExplorerPlotCopy {
  /** Matches a plot in explorerLayout.ts. */
  id: string
  name: string
  summary: string
  products: ExplorerProductCopy[]
}

export const SITE_EXPLORER = {
  eyebrow: 'Site Explorer',
  heading: { lead: 'Beneath', trail: 'the site' },
  intro:
    'Pick a development and the ground cuts away to show the drainage under it. Select a product to see the job it does there, then find it in the range or build it in the configurator.',
  plotsLabel: 'Development types',
  productsHeading: 'Beneath this plot',
  hint: 'Select a numbered marker in the drawing, or a product in this list.',
  marker: 'Show details for',
  viewProduct: 'View product',
  configure: 'Configure',
  close: 'Close',
  previousPlot: 'Previous development',
  nextPlot: 'Next development',
  previousProduct: 'Previous product',
  nextProduct: 'Next product',
  loading: 'Loading the 3D site',
  noWebgl: 'The 3D drawing needs WebGL, which this browser has turned off. Every product on this plot is listed here.',
  noScript: 'The 3D drawing needs JavaScript. Every development and its products are listed further down the page.',
  surfaceWater: 'Surface water',
  foulWater: 'Foul water',
  cableDuct: 'Cable duct',
  listHeading: { lead: 'Every plot,', trail: 'every product' },
  listIntro: 'The same developments as a list, with a link to each product.',
}

export const SITE_EXPLORER_PLOTS: ExplorerPlotCopy[] = [
  {
    id: 'office',
    name: 'Office',
    summary:
      'A commercial office with a service yard. Roof and yard water is collected, cleaned in a separator, held in storage below the yard and let out at a controlled rate. The foul drain runs on its own line to the foul sewer and never meets the surface water.',
    products: [
      {
        id: 'office-surface-chamber',
        name: 'Inspection chamber',
        role: 'Access at the head of the surface water drain, where the roof downpipe comes in through its gully.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
      {
        id: 'office-separator',
        name: 'SudSceptor hydrodynamic separator',
        role: 'Swirls the runoff so silt settles in its sump and oil and litter are held back, before the water reaches the storage.',
        slug: 'rhinoceptor',
        productId: 'rhinoceptor',
      },
      {
        id: 'office-flow-control',
        name: 'RhinoRoFlo orifice flow control',
        role: 'Sits at the outlet of the storage and holds the discharge to the rate agreed for the site. In a storm the excess backs up into the storage and drains down afterwards.',
        slug: 'flow-control',
        productId: 'flow-control',
      },
      {
        id: 'office-foul-chamber',
        name: 'Foul inspection chamber',
        role: 'Access to the foul drain from the washrooms and kitchen, on its own line to the foul sewer.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
    ],
  },
  {
    id: 'car-park',
    name: 'Car park',
    summary:
      'A multi-storey car park and its surface bays. Runoff from paving carries silt, metals and hydrocarbons, so it is filtered at the gully, settled in a catchpit, held in storage under the bays and released at a controlled rate.',
    products: [
      {
        id: 'car-park-rhinopod',
        name: 'RhinoPod gully filter',
        role: 'Floats in the standing water of the bay gully and filters dissolved metals, phosphate and hydrocarbons out of the runoff where it first drains.',
        slug: 'rhinopod',
        productId: 'rhinopod',
      },
      {
        id: 'car-park-catchpit',
        name: 'RhinoPit catchpit',
        role: 'Lets silt settle in its sump below the pipes, where it can be lifted out before it reaches and clogs the storage.',
        slug: 'catchpit-silt-trap',
        productId: 'catchpit',
      },
      {
        id: 'car-park-vortex',
        name: 'RhinoRoTex vortex flow control',
        role: 'Sits at the outlet of the storage and limits the outflow to the agreed rate through a larger opening than an orifice would need, so it is less likely to block.',
        slug: 'flow-control',
        productId: 'flow-control',
      },
    ],
  },
  {
    id: 'retail',
    name: 'Retail',
    summary:
      'A parade of shops with a cafe on the end. Roof water runs to the surface water drain. Kitchen waste carries fats, oils and grease, so it passes through a grease trap in the cafe kitchen before joining the foul drain to the sewer.',
    products: [
      {
        id: 'retail-surface-chamber',
        name: 'Inspection chamber',
        role: 'Brings the roof downpipe from the parade into the surface water drain, with access for rodding.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
      {
        id: 'retail-grease-trap',
        name: 'Grease trap',
        role: 'Stands on the cafe kitchen floor by the sink and holds back fats, oils and grease before they can set hard in the foul drain.',
        slug: 'grease-trap',
        productId: 'grease-trap',
      },
      {
        id: 'retail-foul-chamber',
        name: 'Foul inspection chamber',
        role: 'Access to the foul drain downstream of the grease trap, on its own line to the foul sewer.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
    ],
  },
  {
    id: 'house',
    name: 'House',
    summary:
      'A detached house whose foul drain sits lower than the sewer it has to reach. Foul water is pumped up a rising main to a gravity chamber, roof water runs to its own surface water drain, and a drawpit gives access to the duct for the driveway charger.',
    products: [
      {
        id: 'house-surface-chamber',
        name: 'Inspection chamber',
        role: 'Access to the roof drainage on the surface water side, kept apart from the foul.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
      {
        id: 'house-pumping-station',
        name: 'RhinoLift pumping station',
        role: 'Collects foul water where there is no fall to the sewer and pumps it up a rising main to a gravity chamber.',
        slug: 'pump-station',
        productId: 'pump-station',
      },
      {
        id: 'house-foul-chamber',
        name: 'Foul inspection chamber',
        role: 'Takes the rising main in at its invert and lets the foul water carry on to the sewer by gravity.',
        slug: 'inspection-chamber',
        productId: 'chamber',
      },
      {
        id: 'house-drawpit',
        name: 'RhinoDuct drawpit',
        role: 'An access pit on the cable duct to the car charger, so cables can be pulled through later. It carries cables, not water.',
        slug: 'drawpit',
        productId: 'drawpit',
      },
    ],
  },
]
