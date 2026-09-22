import type { PartRole } from '@/components/site/three/toon'

/**
 * Which 3D library models appear on each product page, and how.
 *
 * Keyed by the product catalogue slug (lib/product-catalog.ts). Models come
 * from public/models/library/v1 (see its manifest.json); part names are the
 * part node names listed there per product.
 *
 * Roles decide how a part is drawn and what the page's interaction does:
 *   casing  the outer shell; hovering (or the reveal control on touch)
 *           fades it so the insides show
 *   insides what the casing hides; drawn in the light accent colour
 *   inlet   pipe connections; green, as on the Webflow drawings
 *   accent  details worth picking out in brand blue
 *   xray    a presentation shell that is always see-through
 *   body    everything else (the default for unlisted parts)
 */

export interface ProductModel {
  /** Stable id, unique within the product. */
  id: string
  /** Short name shown with the model, e.g. "SERSIC 600". */
  label: string
  /** Assembled glb, relative to the site root: /models/library/v1/<slug>/<file>.glb */
  url: string
  /** Largest dimension of the product in mm (manifest bboxMm.size max), used to fit the view. */
  span: number
  roles: Record<string, PartRole>
  /** One line on what the viewer is showing; plain, no marketing. */
  caption?: string
  /** Camera start: degrees round from the front and above the horizon. */
  view?: { azimuth: number; elevation: number }
}

export interface ProductModelSet {
  /** The model shown in the page hero. */
  hero: ProductModel
  /** Further models for the lower "in 3D" section (variants, cut-aways, family members). */
  more?: ProductModel[]
}

export const PRODUCT_MODELS: Partial<Record<string, ProductModelSet>> = {}
