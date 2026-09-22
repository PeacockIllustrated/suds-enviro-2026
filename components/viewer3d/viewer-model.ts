import type * as THREE from 'three'
import type { Vec3 } from './geometry'

/**
 * What the configurator's 3D preview draws, independent of React.
 *
 * A model is a set of parts in millimetres (Y up, base at y = 0). Parts are
 * either procedural (geometry built from the wizard selections) or come
 * from a 3D library file. Every part knows how it is drawn (its role), what
 * it is called, and where it moves to in the breakout view.
 */

/**
 * How a part is drawn:
 *   casing  outer shell; fades for "Show inside" and during breakout
 *   insides what the casing hides
 *   accent  working parts picked out in brand blue (baffles, orifice plates)
 *   cover   covers, lids and grates
 *   inlet   incoming pipes
 *   outlet  the outgoing pipe
 *   body    anything else
 *   xray    a presentation shell that is always see-through
 *   water   flowing or still water (never labelled, never hovered)
 */
export type ViewerRole = 'casing' | 'insides' | 'accent' | 'cover' | 'inlet' | 'outlet' | 'body' | 'xray' | 'water'

export interface ProcPart {
  /** Unique within the model. */
  id: string
  /** Shown next to the part when broken out or hovered. */
  label: string
  role: ViewerRole
  geometry: THREE.BufferGeometry
  /** Offset in mm at full breakout. */
  explode: Vec3
  /** For water parts: 'flow' streams along the UVs, 'still' barely moves. */
  water?: 'flow' | 'still'
  /** Fill override, e.g. a grease or sludge layer. */
  color?: string
  /** Show the name label on breakout (default true, never for water). */
  labelled?: boolean
}

export interface LibraryPartSpec {
  label: string
  role: ViewerRole
  /** Offset in mm at full breakout, in the library file's own axes. */
  explode: Vec3
  labelled?: boolean
}

/** One library file placed in the model. */
export interface LibraryUse {
  /** Prefix for part ids: a library part's id is `${id}:${partName}`. */
  id: string
  url: string
  /** Placement in mm. */
  position?: Vec3
  /** Turn about Y in radians. */
  rotationY?: number
  /** Parts to draw, by node name. Parts not listed are left out. */
  parts: Record<string, LibraryPartSpec>
  /**
   * Parts swung about a vertical axis at [x, z] (library mm) by `angle`
   * radians, e.g. a separator inlet moved to the chosen bearing.
   */
  swing?: Record<string, { pivot: readonly [number, number]; angle: number }>
}

export type CalloutTone = 'inlet' | 'outlet' | 'info' | 'accent'

/** A pipe or dimension callout drawn as an HTML label with a leader. */
export interface Callout {
  id: string
  title: string
  detail?: string
  tone: CalloutTone
  /** Part id the anchor moves with; omitted = the model itself. */
  follows?: string
  /** Anchor in the followed part's own mm coordinates; omitted = the part's top centre. */
  anchor?: Vec3
  /** Higher wins the best spot when labels compete for space. */
  priority: number
  /** Dimension callouts make no sense once parts have moved apart. */
  hideWhenExploded?: boolean
}

/**
 * configured  built from the selections, dimensions true to them
 * exact       a library model that matches the selection
 * nearest     the closest library model; the selection differs
 * indicative  a representative shape; sizes derived, not from a data sheet
 */
export type MatchKind = 'configured' | 'exact' | 'nearest' | 'indicative'

export interface ViewerModel {
  /** Changes whenever the drawn geometry changes. */
  key: string
  match: { kind: MatchKind; text: string; note?: string }
  parts: ProcPart[]
  libraries: LibraryUse[]
  callouts: Callout[]
  /** Camera start: degrees round from +Z towards +X, and above the horizon. */
  view: { azimuth: number; elevation: number }
  /** Frees the procedural geometry; library geometry is cached and kept. */
  dispose: () => void
}
