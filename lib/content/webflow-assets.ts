import { WEBFLOW_ASSETS } from './webflow-assets.generated'

/**
 * Friendly names for the Webflow images the public pages use.
 *
 * The element trees in `reference/webflow/` reference images by asset id;
 * `WEBFLOW_ASSETS` turns an id into a path under `public/webflow/`, and this
 * map puts a readable name on the ones that appear in the rebuild. The full
 * manifest, with original filenames and alt text, is in
 * `reference/webflow/assets.index.json`.
 */
export const webflowAsset = {
  // Brand
  logoMain: WEBFLOW_ASSETS['666b82a4c1226625c40eb45c'],
  logoWhiteHorizontal: WEBFLOW_ASSETS['680a4c9d10f16e29414b7252'],
  logoWhiteMark: WEBFLOW_ASSETS['66868c57c4030a232fd5fa0b'],
  logoHorizontalSvg: WEBFLOW_ASSETS['67fd2701ce824586d81daea7'],
  rhinoColour: WEBFLOW_ASSETS['673e573e1701e74fbb3a727b'],
  rhinoIcon: WEBFLOW_ASSETS['666b82a4f21bdd6c3cbd6a6f'],

  // Decorative
  waveBlue: WEBFLOW_ASSETS['6687d1ef803ea205f34ece66'],
  navChevronIcon: WEBFLOW_ASSETS['666b82a4ef3f1544eeb2865b'],

  // Product line drawings, used behind the nav mega menu
  drawingSersic: WEBFLOW_ASSETS['671a5488f0ff64cf35fd3467'],
  drawingSerfic: WEBFLOW_ASSETS['671a548861baeff3457f7935'],
  drawingVortex: WEBFLOW_ASSETS['671a54887c4dd680d9ea7fd3'],
  drawingOrifice: WEBFLOW_ASSETS['671a5489c3f88b58583a9387'],
  drawingAqua: WEBFLOW_ASSETS['671a54884d1e7c59e0fd3842'],
  drawingMini: WEBFLOW_ASSETS['671a54898d9bedda4d8a6492'],
  drawingMaxi: WEBFLOW_ASSETS['671a5488bcb4d33d1460bdb5'],
  drawingPumpTank: WEBFLOW_ASSETS['671a5488e1b3443e3d47f24f'],

  // Home product cards. On the Webflow site these are AI-generated
  // stand-ins rather than product photography - replace when real
  // renders are available.
  cardInspectionChambers: WEBFLOW_ASSETS['67ffb41bc303f2154c2e9cfc'],
  cardFlowControls: WEBFLOW_ASSETS['67ffb5307e8369e7b2707e56'],
  cardCatchmentPits: WEBFLOW_ASSETS['67ffb49ffa405142370cac44'],
  cardPumpingStations: WEBFLOW_ASSETS['67ffb66161abe1dc966133d4'],
  cardHydrodynamicSeparators: WEBFLOW_ASSETS['67ffb7dce03c6ab3e182a932'],
  cardSitePlanner: WEBFLOW_ASSETS['67ffba54cbaad003d5c06f27'],
} as const

export type WebflowAssetName = keyof typeof webflowAsset
