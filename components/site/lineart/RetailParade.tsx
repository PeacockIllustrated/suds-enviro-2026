'use client'

import { drawBench } from './Bench'
import { glazing, grid, punchedWindow, seeded, wall, type Rect } from './details'
import { LineArt } from './LineArt'
import { drawLitterBin } from './LitterBin'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A parade of shop units with flats over, in line art. Each unit has
 * pilasters with consoles, a fascia board with its name (drawn as
 * lettering blocks), a stall riser, a mullioned shopfront with a transom
 * and fanlights, a glazed door with a kick plate, and a striped awning
 * with a scalloped valance. The upper floor has punched sash windows with
 * real reveals, sills and lintels, under a parapet with coping. The last
 * unit can be a cafe with tables and chairs out front.
 *
 * Metres. `position` is the centre of the front (+z) face at ground level.
 */

export interface ShopUnit {
  /** Fascia colour and its lettering colour. */
  fascia?: string
  lettering?: string
  /** The awning's stripe colour; null for no awning. */
  awning?: string | null
}

export interface RetailParadeProps {
  position?: Vec3
  rotation?: number
  width?: number
  depth?: number
  groundHeight?: number
  upperHeight?: number
  units?: ShopUnit[]
  /** Cafe tables in front of the last unit. */
  cafeTables?: number
  /** Roof plant: condensers and the cafe's extract flue. */
  roofPlant?: boolean
  ink?: string
}

const DEFAULT_UNITS: ShopUnit[] = [
  { fascia: '#e5f3e1', lettering: LA.greenDark, awning: LA.red },
  { fascia: '#e3f0f9', lettering: LA.inkDark, awning: LA.red },
  { fascia: LA.paper, lettering: LA.red, awning: LA.red },
]

const PARAPET = 0.5

function drawAwning(s: Sketch, xa: number, xb: number, top: number, stripe: string, ink: string) {
  const proj = 1.55
  const drop = 0.55
  const zA = -0.12
  const zB = zA + proj
  const yA = top
  const yB = top - drop
  const n = Math.max(4, Math.round((xb - xa) / 0.42))
  const w = (xb - xa) / n
  for (let i = 0; i < n; i++) {
    const a = xa + i * w
    const b = a + w
    const fill = i % 2 ? LA.paper : stripe === LA.red ? LA.redPale : stripe
    s.polygon([[a, yA, zA], [b, yA, zA], [b, yB, zB], [a, yB, zB]], { fill, ink: null })
    // Valance with a scalloped hem.
    const hem: Vec3[] = []
    for (let k = 0; k <= 6; k++) {
      const t = k / 6
      hem.push([b - w * t, yB - 0.26 - Math.sin(t * Math.PI) * 0.07, zB])
    }
    s.polygon([[a, yB, zB], [b, yB, zB], ...hem], { fill, ink: null })
    s.polyline(hem, ink, 'fine')
  }
  s.polyline([[xa, yA, zA], [xb, yA, zA], [xb, yB, zB], [xa, yB, zB]], ink, 'line', true)
  s.line([xa, yB, zB], [xa, yB - 0.3, zB], ink, 'fine')
  s.line([xb, yB, zB], [xb, yB - 0.3, zB], ink, 'fine')
  // Side cheeks and the cassette box on the wall.
  for (const x of [xa, xb]) s.polygon([[x, yA, zA], [x, yB, zB], [x, yB - 0.3, zB], [x, yA - 0.12, zA]], { fill: LA.paper, ink, weight: 'fine' })
  s.box([xa - 0.02, top - 0.02, zA - 0.02], [xb + 0.02, top + 0.16, zA + 0.14], { fill: LA.paper, ink, weight: 'fine' })
}

/** A bistro table with two chairs, centred on (x, z). */
export function drawCafeSet(s: Sketch, x: number, z: number, ink: string = LA.ink) {
  s.cylinder([x, 0.72, z], 0.36, 0.04, { fill: LA.paper, ink, segments: 18 })
  s.cylinder([x, 0, z], 0.03, 0.72, { fill: LA.metal, ink, weight: 'fine', segments: 8 })
  s.cylinder([x, 0, z], 0.2, 0.03, { fill: LA.metal, ink, weight: 'fine', segments: 12 })
  for (const dx of [-0.62, 0.62]) {
    const cx = x + dx
    const back = dx < 0 ? cx - 0.2 : cx + 0.2
    s.box([cx - 0.2, 0.44, z - 0.2], [cx + 0.2, 0.47, z + 0.2], { fill: LA.paper, ink, weight: 'fine' })
    s.box([back - 0.02, 0.47, z - 0.2], [back + 0.02, 0.88, z + 0.2], { fill: LA.paper, ink, weight: 'fine' })
    for (const [lx, lz] of [[cx - 0.17, z - 0.17], [cx + 0.17, z - 0.17], [cx - 0.17, z + 0.17], [cx + 0.17, z + 0.17]] as Vec2[]) s.line([lx, 0, lz], [lx, 0.44, lz], ink, 'fine')
  }
}

export function drawRetailParade(s: Sketch, props: RetailParadeProps) {
  const {
    position = [0, 0, 0],
    rotation = 0,
    width: W = 22,
    depth: D = 10,
    groundHeight: G = 3.8,
    upperHeight: UH = 3.2,
    units = DEFAULT_UNITS,
    cafeTables = 2,
    roofPlant = true,
    ink = LA.ink,
  } = props
  const H = G + UH
  const x0 = -W / 2
  const x1 = W / 2
  const U = W / units.length
  const skin = 0.3
  const rand = seeded(5)

  s.frame({ position, rotation }, () => {
    // Body behind the skins; the shop floor sits back behind the shopfronts.
    s.box([x0, 0, -D], [x1 - skin, G, -0.45], { fill: LA.paper, ink })
    s.box([x0, G, -D], [x1 - skin, H, -skin], { fill: LA.paper, ink })

    // ── upper floor: front skin with sash windows ──
    const upperY = G + 0.25
    const winW = 1.5
    const winH = 1.65
    const openings: Rect[] = []
    units.forEach((_, i) => {
      const ux = x0 + i * U
      openings.push([ux + U * 0.25 - winW / 2, upperY + 0.6, winW, winH], [ux + U * 0.75 - winW / 2, upperY + 0.6, winW, winH])
    })
    wall(s, x0, x1, G, H + PARAPET, 0, skin, openings, { ink })
    for (const o of openings) punchedWindow(s, o, 0, skin, { rows: 2, head: true, ink })
    // String course between shop and flats.
    s.box([x0 - 0.06, G - 0.1, -skin], [x1 + 0.06, G + 0.18, 0.1], { fill: LA.paper, ink })

    // ── side (+x) wall, full height ──
    const side: Rect[] = [...grid(3, 1, 1.3, winH, D / 3, 0, D / 6 - 0.65, upperY + 0.6), [D - 2.4, 0, 1.0, 2.2], [1.6, 1.6, 1.8, 0.9]]
    s.frame({ position: [x1, 0, 0], rotation: Math.PI / 2 }, () => {
      wall(s, 0, D, 0, H + PARAPET, 0, skin, side, { ink })
      for (const o of side.slice(0, 3)) punchedWindow(s, o, 0, skin, { rows: 2, head: true, ink })
      glazing(s, side[4][0], side[4][1], side[4][2], side[4][3], -skin + 0.03, { cols: 2, ink })
      s.rect(side[3][0], 0, side[3][2], side[3][3], -skin + 0.03, { fill: LA.paperCool, ink })
      s.line([side[3][0] + 0.15, 1.0, -skin + 0.035], [side[3][0] + 0.3, 1.0, -skin + 0.035], ink, 'line')
      // The string course carries round the corner.
      s.box([-0.06, G - 0.1, -skin], [D, G + 0.18, 0.1], { fill: LA.paper, ink })
    })

    // ── parapet coping and the roof ──
    s.box([x0 - 0.06, H + PARAPET, -skin - 0.06], [x1 + 0.06, H + PARAPET + 0.1, 0.06], { fill: LA.paper, ink })
    s.box([x1 - skin - 0.06, H + PARAPET, -D], [x1 + 0.06, H + PARAPET + 0.1, -skin - 0.06], { fill: LA.paper, ink })
    s.box([x0, H, -D], [x0 + 0.25, H + PARAPET, -skin], { fill: LA.paper, ink })
    s.box([x0 + 0.25, H, -D], [x1 - skin, H + PARAPET, -D + 0.25], { fill: LA.paper, ink })
    s.patch(x0 + 0.25, -D + 0.25, x1 - skin, -skin, H + 0.004, { fill: '#f3f7fa', ink: null })
    for (let x = x0 + 1.4; x < x1 - skin - 0.3; x += 1.2) s.line([x, H + 0.006, -D + 0.25], [x, H + 0.006, -skin], LA.inkSoft, 'fine')
    // Rooflights over each shop's back room, and the roof hatch.
    units.forEach((_, i) => {
      const cx = x0 + (i + 0.5) * U
      s.box([cx - 0.7, H, -D * 0.55 - 0.6], [cx + 0.7, H + 0.3, -D * 0.55 + 0.6], { fill: LA.paper, ink })
      s.polygon([[cx - 0.62, H + 0.3, -D * 0.55 + 0.52], [cx + 0.62, H + 0.3, -D * 0.55 + 0.52], [cx + 0.62, H + 0.42, -D * 0.55 - 0.52], [cx - 0.62, H + 0.42, -D * 0.55 - 0.52]], { fill: LA.glass, ink, weight: 'fine' })
    })

    // ── shopfronts ──
    const sf = -0.35
    units.forEach((unit, i) => {
      const ux0 = x0 + i * U
      const ux1 = ux0 + U
      const a = ux0 + (i === 0 ? 0.3 : 0.225)
      const b = ux1 - (i === units.length - 1 ? 0.3 : 0.225)
      // Door at the party-wall end, display glazing across the rest.
      const doorLeft = i % 2 === 0
      const dw = 1.1
      const dx = doorLeft ? a + 0.1 : b - 0.1 - dw
      const gA = doorLeft ? dx + dw + 0.08 : a
      const gB = doorLeft ? b : dx - 0.08
      // Stall riser with a fielded panel line.
      s.box([gA, 0, sf], [gB, 0.5, sf + 0.1], { fill: LA.paper, ink })
      s.rect(gA + 0.12, 0.1, gB - gA - 0.24, 0.3, sf + 0.102, { fill: null, ink, weight: 'fine' })
      glazing(s, gA, 0.5, gB - gA, 2.45, sf + 0.004, { cols: 3, frame: 0.06, ink })
      glazing(s, a, 2.5, b - a, 0.5, sf + 0.004, { cols: 6, reflection: false, ink })
      s.rect(dx, 0, dw, 2.45, sf + 0.004, { fill: LA.glassDeep, ink, shade: false })
      s.rect(dx + 0.08, 0.08, dw - 0.16, 2.28, sf + 0.008, { fill: null, ink, weight: 'fine' })
      s.rect(dx + 0.08, 0.08, dw - 0.16, 0.3, sf + 0.01, { fill: LA.metal, ink, weight: 'fine', shade: false })
      s.line([dx + 0.2, 1.05, sf + 0.012], [dx + dw - 0.2, 1.05, sf + 0.012], LA.inkDark, 'line')
      // Fascia with its lettering.
      const fz = 0.1
      s.box([a - 0.05, 3.0, sf], [b + 0.05, 3.62, fz], { fill: unit.fascia ?? LA.paper, ink })
      const letters = 7 + Math.floor(rand() * 4)
      const lw = (b - a) * 0.55
      let lx = (a + b) / 2 - lw / 2
      for (let k = 0; k < letters; k++) {
        const cw = (lw / letters) * (0.55 + rand() * 0.3)
        s.rect(lx, 3.16, cw, 0.3, fz + 0.003, { fill: unit.lettering ?? LA.inkDark, ink: null, shade: false })
        lx += lw / letters
      }
      if (unit.awning) drawAwning(s, a + 0.1, b - 0.1, 2.96, unit.awning, unit.awning)
    })
    // Pilasters with consoles, between the units and at the ends.
    for (let i = 0; i <= units.length; i++) {
      const px = x0 + i * U
      const end = i === 0 || i === units.length
      const a = i === 0 ? px : px - 0.225
      const b = i === units.length ? px : px + 0.225
      const front = end ? 0.02 : 0.14
      s.box([a, 0, sf], [b, G - 0.1, front], { fill: LA.paper, ink })
      s.box([a - 0.04, 0, sf], [b + 0.04, 0.35, front + 0.04], { fill: LA.paper, ink, weight: 'fine' })
      s.box([a - 0.03, 3.0, sf], [b + 0.03, 3.7, front + 0.1], { fill: LA.paper, ink, weight: 'fine' })
    }

    // ── cafe furniture ──
    if (cafeTables > 0) {
      const ux0 = x0 + (units.length - 1) * U
      for (let t = 0; t < cafeTables; t++) drawCafeSet(s, ux0 + U * ((t + 1) / (cafeTables + 1)), 1.95, ink)
      // A-board by the door.
      const ax = ux0 + 0.9
      s.polygon([[ax - 0.3, 0, 0.8], [ax + 0.3, 0, 0.8], [ax + 0.3, 0.9, 0.62], [ax - 0.3, 0.9, 0.62]], { fill: LA.inkDark, ink: LA.inkDark, weight: 'fine' })
      s.polygon([[ax - 0.3, 0, 0.44], [ax + 0.3, 0, 0.44], [ax + 0.3, 0.9, 0.62], [ax - 0.3, 0.9, 0.62]], { fill: LA.inkDark, ink: LA.inkDark, weight: 'fine' })
      for (let k = 0; k < 3; k++) s.line([ax - 0.18, 0.62 - k * 0.14, 0.8 - (0.62 - k * 0.14) * 0.2 + 0.004], [ax + 0.18, 0.62 - k * 0.14, 0.8 - (0.62 - k * 0.14) * 0.2 + 0.004], LA.paper, 'fine')
    }
    drawBench(s, { position: [x0 + U * 0.5, 0, 2.2], ink })
    drawLitterBin(s, { position: [x0 + U + 0.3, 0, 2.1], ink })

    // ── roof plant ──
    if (roofPlant) {
      const fx = x1 - 2.0
      s.cylinder([fx, H, -6.7], 0.2, 1.7, { fill: LA.metal, ink, segments: 12 })
      s.cylinder([fx, H + 1.7, -6.7], 0.34, 0.12, { radiusTop: 0.1, fill: LA.metal, ink, weight: 'fine', segments: 12 })
      for (const cx of [x0 + 3, x0 + 5.2]) {
        s.box([cx - 0.5, H, -D + 1.2], [cx + 0.5, H + 0.8, -D + 1.7], { fill: LA.paperCool, ink })
        const pts: Vec3[] = []
        for (let k = 0; k < 16; k++) {
          const t = (k / 16) * Math.PI * 2
          pts.push([cx + Math.cos(t) * 0.28, H + 0.4 + Math.sin(t) * 0.28, -D + 1.704])
        }
        s.polyline(pts, ink, 'fine', true)
      }
    }
  })
}

export function RetailParade(props: RetailParadeProps) {
  return <LineArt drawing={kitDrawing('RetailParade', props, drawRetailParade)} />
}
