import * as THREE from 'three'
import type { Box3Spec } from './explorerLayout'

/**
 * The isometric-style camera: orthographic, looking down on the strip
 * from the front right, so the section face and the fronts of the
 * buildings both show.
 */

const AZIMUTH = THREE.MathUtils.degToRad(33)
const ELEVATION = THREE.MathUtils.degToRad(26)

/** Unit vector from the target towards the camera. */
export const VIEW_DIR = new THREE.Vector3(
  Math.sin(AZIMUTH) * Math.cos(ELEVATION),
  Math.sin(ELEVATION),
  Math.cos(AZIMUTH) * Math.cos(ELEVATION),
).normalize()

const FORWARD = VIEW_DIR.clone().negate()
const RIGHT = new THREE.Vector3().crossVectors(FORWARD, new THREE.Vector3(0, 1, 0)).normalize()
const UP = new THREE.Vector3().crossVectors(RIGHT, FORWARD).normalize()

export interface CameraGoal {
  target: THREE.Vector3
  zoom: number
}

export interface Viewport {
  width: number
  height: number
  /** Pixels covered at the bottom of the canvas (the mobile sheet). */
  insetBottom: number
}

/**
 * Where to point the camera, and how far to zoom, so the box fills the
 * part of the canvas left uncovered, with `pad` pixels to spare.
 */
export function fitBox(box: Box3Spec, view: Viewport, pad = 24): CameraGoal {
  let minR = Infinity
  let maxR = -Infinity
  let minU = Infinity
  let maxU = -Infinity
  const c = new THREE.Vector3()
  for (let i = 0; i < 8; i++) {
    c.set(i & 1 ? box.max[0] : box.min[0], i & 2 ? box.max[1] : box.min[1], i & 4 ? box.max[2] : box.min[2])
    const r = c.dot(RIGHT)
    const u = c.dot(UP)
    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minU = Math.min(minU, u)
    maxU = Math.max(maxU, u)
  }
  const width = Math.max(1, view.width - pad * 2)
  const visible = Math.max(1, view.height - view.insetBottom - pad * 2)
  const zoom = Math.min(width / (maxR - minR), visible / (maxU - minU))
  // Sit the foot of the box (the section) on the foot of the uncovered
  // part; spare height on a tall screen goes above, to the buildings.
  const visibleCentreU = minU + (view.height - view.insetBottom) / 2 / zoom - pad / zoom
  // The camera looks at the middle of the whole canvas, which is half the
  // inset below the middle of the uncovered part.
  const targetU = visibleCentreU - view.insetBottom / 2 / zoom
  const target = new THREE.Vector3()
    .addScaledVector(RIGHT, (minR + maxR) / 2)
    .addScaledVector(UP, targetU)
  return { target, zoom }
}
