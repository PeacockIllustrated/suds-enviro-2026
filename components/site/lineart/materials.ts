import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { INK_WIDTH, type InkWeight } from './palette'
import { Sketch, type BuiltSketch } from './sketch'

/**
 * Shared materials and a build cache for the line-art kit.
 *
 * Every Sketch draws with the same four materials: one vertex-coloured
 * fill and one ink material per weight. LineSegments2 sets each ink
 * material's resolution from the renderer before it draws, so sharing
 * them across canvases of different sizes is safe.
 */

let fillMaterial: THREE.MeshBasicMaterial | null = null

/** The paper: unlit, per-vertex colour, pushed back so ink draws on top. */
export function lineArtFill(): THREE.MeshBasicMaterial {
  if (!fillMaterial) {
    fillMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      toneMapped: false,
    })
  }
  return fillMaterial
}

const inkMaterials: Partial<Record<InkWeight, LineMaterial>> = {}

export function lineArtInk(weight: InkWeight): LineMaterial {
  let m = inkMaterials[weight]
  if (!m) {
    m = new LineMaterial({ vertexColors: true, linewidth: INK_WIDTH[weight], worldUnits: false, toneMapped: false })
    inkMaterials[weight] = m
  }
  return m
}

const built = new Map<string, BuiltSketch>()

/**
 * Build a drawing once per key and keep it: kit scenery is static, and two
 * components drawn with the same props share one set of buffers.
 */
export function cachedSketch(key: string, draw: (s: Sketch) => void): BuiltSketch {
  let b = built.get(key)
  if (!b) {
    const s = new Sketch()
    draw(s)
    b = s.build()
    built.set(key, b)
  }
  return b
}

/**
 * The drawing for a kit component's props, cached on the props' JSON so
 * re-renders and identical copies cost nothing.
 */
export function kitDrawing<P>(name: string, props: P, draw: (s: Sketch, p: P) => void): BuiltSketch {
  return cachedSketch(`${name}:${JSON.stringify(props)}`, (s) => draw(s, props))
}
