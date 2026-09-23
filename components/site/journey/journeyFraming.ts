/**
 * Shared state between the page and the 3D scene, and how the scene is
 * framed around the copy.
 *
 * The page writes `target` (where along the journey the reader is, in
 * stops) and `free` (the part of the stage the copy and timeline leave
 * clear). The scene eases `u` towards the target and frames the world and
 * the product inside the free area, so the panel never sits on the model.
 */

export interface FreeArea {
  /** Fractions of the stage, 0..1, left to right and top to bottom. */
  x0: number
  x1: number
  y0: number
  y1: number
}

export interface Framing {
  /** Screen fraction where the stop on the world sits. */
  focus: [number, number]
  /** Screen fraction where the product settles. */
  hero: [number, number]
  /** Product's largest side, as a fraction of the view height at its distance. */
  heroSize: number
  /** How far back the camera sits for the free area it has. */
  distance: number
}

export interface JourneyMotionState {
  target: number
  u: number
  /** Jump rather than glide (reduced motion, or a first placement). */
  snap: boolean
  free: FreeArea
  framing: Framing
}

export function createMotion(): JourneyMotionState {
  return {
    target: 0,
    u: 0,
    snap: true,
    free: { x0: 0, x1: 1, y0: 0.1, y1: 0.55 },
    framing: { focus: [0.5, 0.35], hero: [0.7, 0.35], heroSize: 0.3, distance: 8 },
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Frame for a stage of `width` x `height` pixels. `heroness` is how much
 * a product is on stage (0..1); without one the world centres in the free
 * area, with one they share it, world left and product right.
 */
export function frameFor(free: FreeArea, width: number, height: number, heroness: number, fovDeg: number, out: Framing): Framing {
  const fw = (free.x1 - free.x0) * width
  const fh = (free.y1 - free.y0) * height
  const cy = (free.y0 + free.y1) / 2
  const cx = (free.x0 + free.x1) / 2
  const wide = fw > fh * 1.25
  out.focus[0] = mix(cx, free.x0 + (free.x1 - free.x0) * (wide ? 0.3 : 0.28), heroness)
  out.focus[1] = mix(cy, cy + (free.y1 - free.y0) * 0.08, heroness)
  out.hero[0] = free.x0 + (free.x1 - free.x0) * (wide ? 0.7 : 0.68)
  out.hero[1] = cy
  // The product fills most of the free height, but never more than a
  // little under half the free width.
  out.heroSize = Math.min((wide ? 0.84 : 0.8) * fh, (wide ? 0.46 : 0.54) * fw) / height
  // Back the camera off until about this many world units fit across the free width.
  const span = wide ? 7.6 : 4.6
  const tanHalf = Math.tan(((fovDeg / 2) * Math.PI) / 180)
  out.distance = span / (2 * tanHalf * (width / height) * Math.max(0.2, (free.x1 - free.x0)))
  return out
}
