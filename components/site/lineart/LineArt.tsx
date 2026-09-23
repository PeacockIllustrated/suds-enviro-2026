'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { lineArtFill, lineArtInk } from './materials'
import type { InkWeight } from './palette'
import type { BuiltSketch } from './sketch'

/**
 * Draws a built Sketch: one fill mesh and up to three ink meshes, so any
 * amount of line-art detail costs at most four draw calls.
 *
 * Scenery ignores the pointer (nothing to raycast through thousands of
 * triangles on every move); put a plain invisible box over anything that
 * should be clickable. `dispose` frees the buffers on unmount; leave it
 * off for drawings from `cachedSketch`, which are shared.
 */

const noRaycast: THREE.Object3D['raycast'] = () => {}
const WEIGHTS: InkWeight[] = ['fine', 'line', 'bold']

export interface LineArtProps {
  drawing: BuiltSketch
  dispose?: boolean
  /** Draw order against other transparent or offset layers. */
  renderOrder?: number
}

export function LineArt({ drawing, dispose = false, renderOrder = 0 }: LineArtProps) {
  const objects = useMemo(() => {
    const out: THREE.Object3D[] = []
    if (drawing.fill) {
      const mesh = new THREE.Mesh(drawing.fill, lineArtFill())
      mesh.raycast = noRaycast
      mesh.renderOrder = renderOrder
      mesh.matrixAutoUpdate = false
      out.push(mesh)
    }
    for (const w of WEIGHTS) {
      const g = drawing.ink[w]
      if (!g) continue
      const lines = new LineSegments2(g, lineArtInk(w))
      lines.raycast = noRaycast
      lines.renderOrder = renderOrder
      lines.matrixAutoUpdate = false
      out.push(lines)
    }
    return out
  }, [drawing, renderOrder])

  useEffect(() => {
    if (!dispose) return
    return () => {
      drawing.fill?.dispose()
      for (const w of WEIGHTS) drawing.ink[w]?.dispose()
    }
  }, [drawing, dispose])

  return (
    <group>
      {objects.map((o) => (
        <primitive key={o.uuid} object={o} />
      ))}
    </group>
  )
}
