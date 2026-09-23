'use client'

import { joints } from './details'
import { drawGully } from './Gully'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A straight road along x: carriageway with a dashed centre line and edge
 * lines, bevelled kerbs, and paved footways with slab joints, plus gully
 * gratings in the channel at a set spacing.
 *
 * Metres. `position` is the centre of the carriageway at ground level;
 * `width` is the carriageway, `footway` each pavement (0 for none).
 */

export interface RoadProps {
  position?: Vec3
  rotation?: number
  length?: number
  width?: number
  footway?: number
  /** Kerb upstand above the carriageway. */
  kerb?: number
  centreLine?: boolean
  /** Gully spacing along the channel, 0 for none. */
  gullies?: number
  surface?: string
  ink?: string
}

/** A kerb along x, from x0 to x1, its road face at z, facing +z or -z. */
export function drawKerb(s: Sketch, x0: number, x1: number, z: number, facing: 1 | -1, upstand = 0.12, ink: string = LA.ink) {
  const w = 0.15
  // Profile in (z offset, y); the prism frame is turned so it runs along x.
  const prof: Vec2[] = facing > 0
    ? [[0, 0], [0, upstand - 0.03], [-0.03, upstand], [-w, upstand], [-w, 0]]
    : [[0, 0], [w, 0], [w, upstand], [0.03, upstand], [0, upstand - 0.03]]
  s.frame({ position: [0, 0, z], rotation: Math.PI / 2 }, () => {
    s.prism(prof.map(([pz, py]) => [-pz, py] as Vec2), x0, x1, { fill: LA.concrete, ink, weight: 'fine' })
  })
  for (let x = x0 + 0.9; x < x1; x += 0.9) s.line([x, upstand + 0.002, z], [x, upstand + 0.002, z - facing * w], LA.pavingInk, 'fine')
}

export function drawRoad(s: Sketch, props: RoadProps) {
  const {
    position = [0, 0, 0],
    rotation = 0,
    length: L = 30,
    width: Wd = 6.5,
    footway = 2,
    kerb = 0.12,
    centreLine = true,
    gullies = 12,
    surface = '#e1e6ea',
    ink = LA.ink,
  } = props
  const x0 = -L / 2
  const x1 = L / 2
  const h = Wd / 2
  s.frame({ position, rotation }, () => {
    s.patch(x0, -h, x1, h, 0.004, { fill: surface, ink: null })
    // Edge lines and the dashed centre line.
    for (const z of [-h + 0.3, h - 0.3]) s.patch(x0, z - 0.05, x1, z + 0.05, 0.006, { fill: LA.marking, ink: null })
    if (centreLine) {
      for (let x = x0 + 1; x + 3 < x1; x += 9) s.patch(x, -0.05, x + 3, 0.05, 0.006, { fill: LA.marking, ink: LA.inkSoft, weight: 'fine' })
    }
    drawKerb(s, x0, x1, h, -1, kerb, ink)
    drawKerb(s, x0, x1, -h, 1, kerb, ink)
    if (footway > 0) {
      s.patch(x0, h + 0.15, x1, h + 0.15 + footway, kerb + 0.004, { fill: LA.paving, ink })
      joints(s, x0, h + 0.15, x1, h + 0.15 + footway, kerb + 0.006, 0.9, 0.6)
      s.patch(x0, -h - 0.15 - footway, x1, -h - 0.15, kerb + 0.004, { fill: LA.paving, ink })
      joints(s, x0, -h - 0.15 - footway, x1, -h - 0.15, kerb + 0.006, 0.9, 0.6)
    }
    if (gullies > 0) {
      for (let x = x0 + gullies / 2; x < x1; x += gullies) {
        drawGully(s, { position: [x, 0, h - 0.35], ink })
        drawGully(s, { position: [x, 0, -h + 0.35], ink })
      }
    }
  })
}

export function Road(props: RoadProps) {
  return <LineArt drawing={kitDrawing('Road', props, drawRoad)} />
}
