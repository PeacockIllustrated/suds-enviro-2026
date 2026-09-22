import { webflowAsset } from './webflow-assets'

/**
 * SuDS Builder Hub, ported from the Webflow `SuDS Builder | Hub` page.
 *
 * Webflow routes each card to its own builder page, including separate
 * 3-inlet and 5-inlet pages for chambers. This app has one wizard that
 * takes inlet count as a step, so each card resolves to a single entry
 * with the product preselected. Two buttons landing on the same screen
 * would be worse, not more faithful.
 */

export const BUILDER_HUB = {
  logo: webflowAsset.rhinoColour,
  heading: { lead: 'System Builder', trail: 'Hub' },
  intro: [
    { text: 'Here you will find a hub for all of your SuDS Enviro needs. ' },
    { text: 'Build your system, the way ' },
    { text: 'you', emphasis: 'bold' as const },
    { text: ' want.' },
  ],
  prompt: 'Choose your product',
}

export interface BuilderCard {
  id: string
  heading: { lead: string; trail: string }
  image: string
  /** Product preselected on the configurator. */
  productId: string
  cta: string
  /** Rendered but not linked - no builder path exists yet. */
  comingSoon?: boolean
}

export const BUILDER_CARDS: BuilderCard[] = [
  {
    id: 'inspection-chambers',
    heading: { lead: 'Inspection', trail: 'Chambers' },
    image: webflowAsset.cardInspectionChambers,
    productId: 'chamber',
    cta: 'Build a chamber',
  },
  {
    id: 'flow-controls',
    heading: { lead: 'Flow', trail: 'Controls' },
    image: webflowAsset.cardFlowControls,
    productId: 'flow-control',
    cta: 'Build a flow control',
  },
  {
    id: 'catchment-pits',
    heading: { lead: 'Catchment', trail: 'Pits' },
    image: webflowAsset.cardCatchmentPits,
    productId: 'catchpit',
    cta: 'Build a catchpit',
  },
  {
    id: 'pumping-stations',
    heading: { lead: 'Pumping', trail: 'Stations' },
    image: webflowAsset.cardPumpingStations,
    productId: 'pump-station',
    cta: 'Build a pumping station',
  },
  {
    id: 'hydrodynamic-separators',
    heading: { lead: 'Hydrodynamic', trail: 'Separators' },
    image: webflowAsset.cardHydrodynamicSeparators,
    productId: 'rhinoceptor',
    cta: 'Build a separator',
  },
]
