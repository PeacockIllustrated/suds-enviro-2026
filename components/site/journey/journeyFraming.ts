import * as THREE from 'three'
import { VIEW_DIR } from '@/components/site/explorer/cameraFit'
import type { Box } from './journeyWorld'

/**
 * Shared state between the page and the 3D scene, and how the scene is
 * framed around the copy.
 *
 * The page writes `target` (where along the journey the reader is, in
 * stops) and `free` (the part of the stage the copy and timeline leave
 * clear). The scene eases `u` towards the target and fits each stop's box
 * into the free area with the Site Explorer's isometric-style camera, so
 * the card never sits on the product.
 */

export interface FreeArea {
  /** Fractions of the stage, 0..1, left to right and top to bottom. */
  x0: number
  x1: number
  y0: number
  y1: number
}

export interface JourneyMotionState {
  target: number
  u: number
  /** Jump rather than glide (reduced motion, or a first placement). */
  snap: boolean
  free: FreeArea
}

export function createMotion(): JourneyMotionState {
  return {
    target: 0,
    u: 0,
    snap: true,
    free: { x0: 0, x1: 1, y0: 0.1, y1: 0.55 },
  }
}

/** The camera's screen axes in the world, for the fixed view direction. */
const FORWARD = VIEW_DIR.clone().negate()
export const SCREEN_RIGHT = new THREE.Vector3().crossVectors(FORWARD, new THREE.Vector3(0, 1, 0)).normalize()
export const SCREEN_UP = new THREE.Vector3().crossVectors(SCREEN_RIGHT, FORWARD).normalize()

/** A camera goal in screen-axis coordinates: where it looks, and its zoom. */
export interface Shot {
  r: number
  u: number
  zoom: number
}

const corner = new THREE.Vector3()

/** Whether the free area is tall enough to want the narrow framing. */
export function isNarrow(free: FreeArea, width: number, height: number): boolean {
  return ((free.x1 - free.x0) * width) / Math.max(1, (free.y1 - free.y0) * height) < 1.15
}

/**
 * The shot that fits `box` into the free area of a `width` x `height`
 * stage with `pad` pixels to spare. The camera looks at the middle of the
 * stage, so the box centre is offset by the free area's offset from it.
 */
export function fitShot(box: Box, free: FreeArea, width: number, height: number, pad: number, out: Shot): Shot {
  let minR = Infinity
  let maxR = -Infinity
  let minU = Infinity
  let maxU = -Infinity
  for (let i = 0; i < 8; i++) {
    corner.set(i & 1 ? box.max[0] : box.min[0], i & 2 ? box.max[1] : box.min[1], i & 4 ? box.max[2] : box.min[2])
    const r = corner.dot(SCREEN_RIGHT)
    const u = corner.dot(SCREEN_UP)
    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minU = Math.min(minU, u)
    maxU = Math.max(maxU, u)
  }
  const fw = Math.max(1, (free.x1 - free.x0) * width - pad * 2)
  const fh = Math.max(1, (free.y1 - free.y0) * height - pad * 2)
  const zoom = Math.min(fw / (maxR - minR), fh / (maxU - minU))
  // Pixel offset of the free area's centre from the stage's centre.
  const dx = ((free.x0 + free.x1) / 2 - 0.5) * width
  const dy = (0.5 - (free.y0 + free.y1) / 2) * height
  out.r = (minR + maxR) / 2 - dx / zoom
  out.u = (minU + maxU) / 2 - dy / zoom
  out.zoom = zoom
  return out
}
