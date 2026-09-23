'use client'

import { drawCar } from './Car'
import { glazing, railing, seeded } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'
import { drawStreetLamp } from './StreetLamp'

/**
 * An open-sided multi-storey car park in line art: deck slabs with deep
 * edge beams, columns, steel barrier rails, scissor ramps between the
 * decks, bay lines, parked cars on every level, lamp columns on the roof
 * deck, and a glazed stair and lift core carrying the parking sign.
 *
 * Metres. `position` is the centre of the front (+z) edge at ground level.
 * The core stands outside the footprint, against the +x end.
 */

export interface MultiStoreyCarParkProps {
  position?: Vec3
  rotation?: number
  width?: number
  depth?: number
  /** Suspended decks above the ground level; the top one is the roof. */
  decks?: number
  levelHeight?: number
  /** The stair and lift core, against the +x end, or none. */
  core?: boolean
  /** Share of bays with a car in, 0..1. */
  occupancy?: number
  seed?: number
  ink?: string
}

const SLAB = 0.3
const BAY = 2.5
export const CAR_TINTS = [LA.paper, '#e7f1f8', '#eef3f5', '#e9f4e6', LA.paper, '#f4efe6'] as const

/** Where the core sits, in the car park's own frame: x0, x1, z0, z1 and its height. */
export function carParkCore(props: MultiStoreyCarParkProps) {
  const { width = 20.2, decks = 3, levelHeight = 3.1 } = props
  return { x0: width / 2, x1: width / 2 + 2.9, z0: -4.7, z1: -0.5, height: decks * levelHeight + SLAB + 2.0 }
}

export function drawMultiStoreyCarPark(s: Sketch, props: MultiStoreyCarParkProps) {
  const {
    position = [0, 0, 0],
    rotation = 0,
    width: W = 20.2,
    depth: D = 12.4,
    decks = 3,
    levelHeight: LH = 3.1,
    core = true,
    occupancy = 0.6,
    seed = 11,
    ink = LA.ink,
  } = props
  const x0 = -W / 2
  const x1 = W / 2
  const rand = seeded(seed)
  const rampW = 3.4
  const rx = x0 + rampW
  const void0 = -1.6
  const void1 = -D + 1.6
  const colXs: number[] = []
  const n = Math.round(W / 6.6)
  for (let i = 0; i <= n; i++) colXs.push(x0 + (W * i) / n)

  s.frame({ position, rotation }, () => {
    // Ground-level surfacing inside the footprint.
    s.patch(x0, -D, x1, 0, 0.004, { fill: '#e8edf0', ink, weight: 'fine' })

    const levelTops: number[] = [0]
    for (let d = 1; d <= decks; d++) levelTops.push(d * LH + SLAB)

    for (let d = 1; d <= decks; d++) {
      const y = d * LH
      const top = y + SLAB
      // Deck slab with a void for the ramps along the -x end; the roof
      // deck is whole, reached by the ramp from the level below.
      if (d === decks) {
        s.box([x0, y, -D], [x1, top, 0], { fill: LA.paper, ink })
      } else {
        s.box([rx, y, -D], [x1, top, 0], { fill: LA.paper, ink })
        s.box([x0, y, void0], [rx, top, 0], { fill: LA.paper, ink })
        s.box([x0, y, -D], [rx, top, void1], { fill: LA.paper, ink })
      }
      // Deep edge beams on the front and the +x end.
      s.box([x0, y - 0.5, -0.25], [x1, top + 0.05, 0.08], { fill: LA.paper, ink })
      s.box([x1 - 0.25, y - 0.5, -D], [x1 + 0.08, top + 0.05, -0.25], { fill: LA.paper, ink })
      s.line([x0, y - 0.18, 0.082], [x1, y - 0.18, 0.082], ink, 'fine')
      // Barrier: posts and three steel rails on the front and the end.
      const rail = (a: Vec3, b: Vec3) => s.box(a, b, { fill: LA.metal, ink, weight: 'fine' })
      const top1 = top + 0.05
      for (const h of [0.42, 0.72, 1.02]) {
        rail([x0, top1 + h, 0.0], [x1, top1 + h + 0.07, 0.07])
        rail([x1, top1 + h, -D], [x1 + 0.07, top1 + h + 0.07, 0])
      }
      for (let px = x0; px <= x1 + 1e-6; px += W / Math.round(W / 1.7)) s.box([px - 0.03, top1, 0.0], [px + 0.03, top1 + 1.1, 0.06], { fill: LA.metal, ink, weight: 'fine' })
      for (let pz = 0; pz >= -D - 1e-6; pz -= D / Math.round(D / 1.7)) s.box([x1, top1, pz - 0.03], [x1 + 0.06, top1 + 1.1, pz + 0.03], { fill: LA.metal, ink, weight: 'fine' })
      // Bay lines and parked cars, nose in, front row and back row.
      const deckTop = top + 0.004
      for (let bx = rx + 0.4; bx <= x1 - 0.4 + 1e-6; bx += BAY) {
        s.line([bx, deckTop, -0.5], [bx, deckTop, -5.0], ink, 'fine')
        s.line([bx, deckTop, -D + 0.5], [bx, deckTop, -D + 5.0], ink, 'fine')
      }
      for (let bx = rx + 0.4; bx + BAY <= x1 - 0.4 + 1e-6; bx += BAY) {
        const tint = CAR_TINTS[Math.floor(rand() * CAR_TINTS.length)]
        if (rand() < occupancy) drawCar(s, { position: [bx + BAY / 2, top, -2.85], rotation: Math.PI / 2, color: tint, ink })
        if (rand() < occupancy * 0.5) drawCar(s, { position: [bx + BAY / 2, top, -D + 2.85], rotation: -Math.PI / 2, color: tint, ink })
      }
    }
    // Ground-level bays and cars under the first deck.
    for (let bx = rx + 0.4; bx <= x1 - 0.4 + 1e-6; bx += BAY) s.line([bx, 0.006, -D + 0.5], [bx, 0.006, -D + 5.0], ink, 'fine')
    for (let bx = rx + 0.4; bx + BAY <= x1 - 0.4 + 1e-6; bx += BAY) {
      if (rand() < occupancy * 0.5) drawCar(s, { position: [bx + BAY / 2, 0, -D + 2.85], rotation: -Math.PI / 2, color: CAR_TINTS[Math.floor(rand() * CAR_TINTS.length)], ink })
    }

    // Columns between the levels, front, middle and back rows.
    for (let d = 0; d < decks; d++) {
      const yb = levelTops[d]
      const yt = (d + 1) * LH - 0.5
      for (const cx of colXs) {
        const a = Math.max(x0, cx - 0.22)
        const b = Math.min(x1 - 0.25, cx + 0.22)
        s.box([a, yb, -0.7], [b, yt, -0.26], { fill: LA.paper, ink })
        s.box([a, yb, -D / 2 - 0.22], [b, (d + 1) * LH, -D / 2 + 0.22], { fill: LA.paper, ink })
        s.box([a, yb, -D], [b, (d + 1) * LH, -D + 0.44], { fill: LA.paper, ink })
      }
    }
    // Scissor ramps in the void, alternating lanes, rising front to back.
    for (let d = 0; d < decks - 1; d++) {
      const lane0 = d % 2 === 0 ? x0 + 0.1 : x0 + rampW / 2
      const lane1 = lane0 + rampW / 2 - 0.1
      const yA = levelTops[d]
      const yB = (d + 1) * LH + SLAB
      const zA = d % 2 === 0 ? void0 : void1
      const zB = d % 2 === 0 ? void1 : void0
      const t = 0.25
      const a: Vec3 = [lane0, yA, zA]
      const b: Vec3 = [lane1, yA, zA]
      const c: Vec3 = [lane1, yB, zB]
      const e: Vec3 = [lane0, yB, zB]
      s.polygon([a, b, c, e], { fill: LA.paper, ink })
      s.polygon([[lane1, yA, zA], [lane1, yB, zB], [lane1, yB - t, zB], [lane1, yA - t, zA]], { fill: LA.paper, ink })
      s.line([(lane0 + lane1) / 2, yA + 0.004, zA], [(lane0 + lane1) / 2, yB + 0.004, zB], ink, 'fine')
      s.line([lane1, yA + 1.0, zA], [lane1, yB + 1.0, zB], ink, 'fine')
    }

    // Guard rails round the ramp void on every deck.
    for (let d = 1; d < decks; d++) {
      const y = levelTops[d]
      railing(s, [[rx - 0.05, void0], [rx - 0.05, void1]], y, 1.0, 1.4, ink)
    }
    // Roof deck: lamp columns.
    const roofTop = decks * LH + SLAB
    for (const lx of [x0 + W * 0.36, x0 + W * 0.72]) drawStreetLamp(s, { position: [lx, roofTop, -D / 2], rotation: Math.PI / 2, height: 5, ink })

    // Entrance barrier at the ramp foot.
    s.box([x0 + 0.2, 0, 0.3], [x0 + 0.6, 1.1, 0.7], { fill: LA.paper, ink, weight: 'fine' })
    const armY = 0.95
    const armLen = 3.0
    for (let i = 0; i < 6; i++) {
      const xa = x0 + 0.6 + (armLen * i) / 6
      const xb = x0 + 0.6 + (armLen * (i + 1)) / 6
      s.box([xa, armY, 0.46], [xb, armY + 0.09, 0.54], { fill: i % 2 ? LA.paper : LA.red, ink: LA.red, weight: 'fine' })
    }

    // Stair and lift core.
    if (core) {
      const c = carParkCore(props)
      s.box([c.x0, 0, c.z0], [c.x1, c.height, c.z1], { fill: LA.paper, ink })
      s.box([c.x0 - 0.1, c.height, c.z0 - 0.1], [c.x1 + 0.1, c.height + 0.25, c.z1 + 0.1], { fill: LA.paper, ink })
      // Full-height glazed stair on the front face, floor lines through it.
      glazing(s, c.x0 + 0.35, 0.3, 1.3, c.height - 1.0, c.z1 + 0.004, { rows: decks + 1 })
      // The parking sign.
      const sx = c.x0 + 1.85
      const sy = c.height - 2.2
      s.rect(sx, sy, 0.85, 0.85, c.z1 + 0.006, { fill: LA.ink, ink: LA.inkDark, shade: false })
      const pz = c.z1 + 0.009
      s.rect(sx + 0.22, sy + 0.14, 0.14, 0.57, pz, { fill: LA.paper, ink: null, shade: false })
      s.rect(sx + 0.22, sy + 0.57, 0.36, 0.14, pz, { fill: LA.paper, ink: null, shade: false })
      s.rect(sx + 0.22, sy + 0.36, 0.36, 0.12, pz, { fill: LA.paper, ink: null, shade: false })
      s.rect(sx + 0.5, sy + 0.36, 0.14, 0.35, pz, { fill: LA.paper, ink: null, shade: false })
      // Door at the foot, windows up the end.
      s.rect(c.x0 + 1.95, 0, 0.9, 2.1, c.z1 + 0.004, { fill: LA.paperCool, ink })
      s.frame({ position: [c.x1 + 0.004, 0, 0], rotation: Math.PI / 2 }, () => {
        for (let d = 0; d <= decks; d++) glazing(s, -c.z1 + 1.4, levelTops[d] + 1.0, 1.4, 1.5, 0, { cols: 1 })
      })
    }
  })
}

export function MultiStoreyCarPark(props: MultiStoreyCarParkProps) {
  return <LineArt drawing={kitDrawing('MultiStoreyCarPark', props, drawMultiStoreyCarPark)} />
}
