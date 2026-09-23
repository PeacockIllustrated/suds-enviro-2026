'use client'

import { drawWheel } from './Car'
import { arc } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A panel van in line art: sloping bonnet and windscreen, cab glazing,
 * sliding side door, twin rear doors, a livery stripe, bumpers, lamps,
 * mirrors and wheels.
 *
 * Metres. `position` is the centre of the van on the ground; the nose
 * points along +x before `rotation`. About 5.3 m long, 2 m wide, 2.35 m
 * high.
 */

export interface VanProps {
  position?: Vec3
  rotation?: number
  color?: string
  /** The livery stripe colours, top to bottom; empty for a plain van. */
  livery?: string[]
  ink?: string
}

const WX = 1.72

function profile(): Vec2[] {
  return [
    [-2.62, 0.36],
    ...arc(-WX, 0.36, 0.5, Math.PI, 0, 9),
    ...arc(WX, 0.36, 0.5, Math.PI, 0, 9),
    [2.56, 0.36],
    [2.66, 0.58],
    [2.63, 1.08],
    [2.22, 1.26],
    [1.4, 2.1],
    [1.1, 2.32],
    [-2.6, 2.34],
    [-2.64, 2.24],
  ]
}

export function drawVan(s: Sketch, { position = [0, 0, 0], rotation = 0, color = LA.paper, livery = [LA.ink, LA.green], ink = LA.ink }: VanProps) {
  s.frame({ position, rotation }, () => {
    const half = 1.0
    s.prism(profile(), -half, half, { fill: color, ink })
    // Windscreen on the sloping face.
    const a: Vec2 = [2.22, 1.26]
    const b: Vec2 = [1.4, 2.1]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const nx = (b[1] - a[1]) / len
    const ny = -(b[0] - a[0]) / len
    const at = (t: number): [number, number] => [a[0] + (b[0] - a[0]) * t + nx * 0.004, a[1] + (b[1] - a[1]) * t + ny * 0.004]
    const [x0, y0] = at(0.08)
    const [x1, y1] = at(0.94)
    s.polygon([[x0, y0, 0.9], [x1, y1, 0.9], [x1, y1, -0.9], [x0, y0, -0.9]], { fill: LA.glass, ink, weight: 'fine' })
    for (const sgn of [1, -1]) {
      const z = sgn * (half + 0.003)
      // Cab door glass, following the windscreen rake.
      s.polygon([[0.7, 1.42, z], [2.0, 1.42, z], [1.36, 2.02, z], [0.7, 2.02, z]], { fill: LA.glass, ink, weight: 'fine' })
      // Cab door and sliding door shut lines, handles, the slide rail.
      s.line([0.6, 0.62, z], [0.6, 2.2, z], ink, 'fine')
      s.polyline([[-1.05, 0.5, z], [-1.05, 2.2, z], [0.52, 2.2, z], [0.52, 0.5, z]], ink, 'fine')
      s.line([-2.4, 1.72, z], [-1.05, 1.72, z], ink, 'fine')
      s.line([0.72, 1.3, z], [0.92, 1.3, z], ink, 'fine')
      s.line([0.25, 1.3, z], [0.45, 1.3, z], ink, 'fine')
      // Livery stripes along the load bay.
      livery.forEach((c, i) => {
        const top = 1.52 - i * 0.2
        s.polygon([[-2.62, top - 0.14, z], [0.5, top - 0.14, z], [0.62, top, z], [-2.62, top, z]], { fill: c, ink: null, shade: false })
      })
      // Wing mirror on its arm, just ahead of the door.
      s.line([2.0, 1.45, z], [2.05, 1.5, sgn * 1.12], ink, 'fine')
      s.box([1.98, 1.42, sgn < 0 ? -1.26 : 1.1], [2.1, 1.7, sgn < 0 ? -1.1 : 1.26], { fill: color, ink, weight: 'fine' })
    }
    // Rear doors and lamps.
    const xr = -2.62 - 0.003
    s.line([xr, 0.5, 0], [xr, 2.24, 0], ink, 'fine')
    for (const z of [0.82, -0.82]) {
      s.polygon([[xr, 0.7, z - 0.1], [xr, 0.7, z + 0.1], [xr, 1.2, z + 0.1], [xr, 1.2, z - 0.1]], { fill: LA.redPale, ink: LA.red, weight: 'fine', shade: false })
    }
    // Headlamps and grille.
    for (const z of [0.66, -0.66]) {
      s.polygon([[2.642, 0.84, z - 0.22], [2.642, 0.84, z + 0.22], [2.635, 1.0, z + 0.22], [2.635, 1.0, z - 0.22]], { fill: LA.paperCool, ink, weight: 'fine', shade: false })
    }
    for (let i = 0; i < 3; i++) s.line([2.645, 0.66 + i * 0.07, -0.36], [2.645, 0.66 + i * 0.07, 0.36], ink, 'fine')
    s.box([2.52, 0.3, -1.0], [2.72, 0.56, 1.0], { fill: LA.asphaltLight, ink: LA.asphaltInk, weight: 'fine' })
    s.box([-2.72, 0.3, -1.0], [-2.56, 0.52, 1.0], { fill: LA.asphaltLight, ink: LA.asphaltInk, weight: 'fine' })
    for (const sgn of [1, -1] as const) {
      drawWheel(s, WX, sgn * 0.86, 0.38, 0.26, sgn)
      drawWheel(s, -WX, sgn * 0.86, 0.38, 0.26, sgn)
    }
  })
}

export function Van(props: VanProps) {
  return <LineArt drawing={kitDrawing('Van', props, drawVan)} />
}
