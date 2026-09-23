'use client'

import { glazing, louvres, railing } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A commercial office block in line art: a glazed ground floor behind
 * piers, upper floors of curtain walling (continuous fins over spandrel
 * bands) or punched windows, a parapet with coping, an entrance canopy on
 * round columns with glazed double doors, a sign panel on the parapet,
 * and roof plant: a louvred plant screen, air handling units with fans, a
 * lift overrun and rows of solar panels.
 *
 * Metres. `position` is the centre of the front (+z) face at ground level;
 * `rotation` turns it about +y. Put the logo on the sign panel with
 * <LogoPanel> at `officeSignCentre(props)` (in the building's frame).
 */

export interface OfficeBuildingProps {
  position?: Vec3
  rotation?: number
  /** Frontage along x. */
  width?: number
  /** Depth back from the front face. */
  depth?: number
  /** Floors above the ground floor. */
  storeys?: number
  groundHeight?: number
  storeyHeight?: number
  /** Structural bays across the front and down the side. */
  bays?: number
  sideBays?: number
  facade?: 'curtain' | 'punched'
  /** Entrance canopy over the middle two bays. */
  canopy?: boolean
  /** Sign panel on the parapet, width x height; null for none. */
  sign?: [number, number] | null
  roofPlant?: boolean
  solar?: boolean
  ink?: string
}

const DEFAULTS = {
  width: 18,
  depth: 11,
  storeys: 3,
  groundHeight: 3.9,
  storeyHeight: 2.7,
  bays: 8,
  sideBays: 4,
}

const SETBACK = 0.3
const PARAPET = 0.8

/** Where the sign panel's face centre sits, in the building's own frame. */
export function officeSignCentre(props: OfficeBuildingProps): Vec3 {
  const { storeys = DEFAULTS.storeys, groundHeight = DEFAULTS.groundHeight, storeyHeight = DEFAULTS.storeyHeight, sign = [9.4, 1.6] } = props
  const roof = groundHeight + storeys * storeyHeight
  const h = sign ? sign[1] : 0
  return [0, roof - 0.05 + h / 2, 0.354]
}

export function drawOfficeBuilding(s: Sketch, props: OfficeBuildingProps) {
  const {
    position = [0, 0, 0],
    rotation = 0,
    width: W = DEFAULTS.width,
    depth: D = DEFAULTS.depth,
    storeys = DEFAULTS.storeys,
    groundHeight: G = DEFAULTS.groundHeight,
    storeyHeight: SH = DEFAULTS.storeyHeight,
    bays = DEFAULTS.bays,
    sideBays = DEFAULTS.sideBays,
    facade = 'curtain',
    canopy = true,
    sign = [9.4, 1.6],
    roofPlant = true,
    solar = true,
    ink = LA.ink,
  } = props
  const H = G + storeys * SH
  const x0 = -W / 2
  const x1 = W / 2
  const bay = W / bays
  const sideBay = D / sideBays
  const g = SETBACK

  s.frame({ position, rotation }, () => {
    // Plinth and the glazed body behind the facade line.
    s.extrude([[x0 - 0.05, 0.05], [x1 + 0.05, 0.05], [x1 + 0.05, -D - 0.05], [x0 - 0.05, -D - 0.05]], 0, 0.22, { fill: LA.concrete, ink })
    s.extrude([[x0 + g, -g], [x1 - g, -g], [x1 - g, -D + g], [x0 + g, -D + g]], 0.22, H, { fill: LA.paper, ink })

    // ── ground floor: piers, glazing, entrance ──
    const entrance0 = Math.floor(bays / 2) - 1
    for (let k = 0; k < bays; k++) {
      const bx = x0 + k * bay
      const isEntrance = canopy && (k === entrance0 || k === entrance0 + 1)
      if (isEntrance) {
        // Glazed screen with double doors, set a bay deep under the canopy.
        glazing(s, bx + 0.08, 0.22, bay - 0.16, G - 0.45, -g + 0.004, { cols: 2, transom: 0.68, glass: LA.glassDeep })
      } else {
        glazing(s, bx + 0.12, 0.22, bay - 0.24, G - 0.45, -g + 0.004, { cols: 2, transom: 0.72 })
      }
    }
    // Doors: two leaves either side of the centre line, with pull handles.
    if (canopy) {
      const cx = x0 + (entrance0 + 1) * bay
      const dz = -g + 0.01
      s.rect(cx - 1.8, 0.22, 3.6, 2.35, dz, { fill: LA.glass, ink, weight: 'line', shade: false })
      for (const dx of [-0.9, 0, 0.9]) s.line([cx + dx, 0.22, dz + 0.002], [cx + dx, 2.57, dz + 0.002], ink, dx === 0 ? 'line' : 'fine')
      for (const dx of [-0.12, 0.12]) s.line([cx + dx, 0.95, dz + 0.004], [cx + dx, 1.75, dz + 0.004], LA.inkDark, 'line')
      for (const dx of [-1.02, 1.02]) s.line([cx + dx, 0.95, dz + 0.004], [cx + dx, 1.75, dz + 0.004], LA.inkDark, 'fine')
    }
    // Piers at every other bay line, and at the corners.
    for (let k = 0; k <= bays; k++) {
      if (k % 2 && k !== bays) continue
      const px = x0 + k * bay
      const a = k === 0 ? px : px - 0.22
      const b = k === bays ? px : px + 0.22
      s.box([a, 0.22, k === 0 || k === bays ? -0.02 - g : -g], [b, G - 0.12, 0.02], { fill: LA.paper, ink })
    }
    for (let k = 0; k <= sideBays; k += 1) {
      const pz = -k * sideBay
      if (k === 0) continue
      const a = k === sideBays ? pz : pz - 0.22
      const b = pz + 0.22
      s.box([x1 - g, 0.22, a], [x1 + 0.02, G - 0.12, b], { fill: LA.paper, ink })
    }
    for (let k = 0; k < sideBays; k++) {
      const z = -k * sideBay
      s.frame({ position: [x1 - g + 0.004, 0, 0], rotation: Math.PI / 2 }, () => {
        glazing(s, -z - 0.0 + 0.24, 0.22, sideBay - 0.48, G - 0.45, 0, { cols: 2, transom: 0.72 })
      })
    }

    // ── upper floors ──
    const bands: number[] = []
    for (let i = 0; i <= storeys; i++) bands.push(G + i * SH)
    // Spandrel bands wrap the front and the side as one L.
    const band = (y0: number, y1: number, out = 0) => {
      const plan: Vec2[] = [
        [x0 - out, out],
        [x1 + out, out],
        [x1 + out, -D - out],
        [x1 - g - 0.1, -D - out],
        [x1 - g - 0.1, -g - 0.1],
        [x0 - out, -g - 0.1],
      ]
      s.extrude(plan, y0, y1, { fill: LA.paper, ink })
    }
    const backParapets = () => {
      s.box([x0, H, -D], [x0 + 0.3, H + PARAPET, -g - 0.1], { fill: LA.paper, ink })
      s.box([x0 + 0.3, H, -D], [x1 - g - 0.1, H + PARAPET, -D + 0.3], { fill: LA.paper, ink })
      s.patch(x0 + 0.3, -D + 0.3, x1 - g - 0.1, -g - 0.1, H + 0.004, { fill: '#f3f7fa', ink: null })
      // Membrane seams across the roof.
      for (let x = x0 + 1.5; x < x1 - g - 0.3; x += 1.2) s.line([x, H + 0.006, -D + 0.3], [x, H + 0.006, -g - 0.1], LA.inkSoft, 'fine')
    }
    if (facade === 'curtain') {
      for (let i = 0; i < storeys; i++) band(bands[i] - 0.12, bands[i] + 0.72)
      // Glazing between the bands, two panes a bay with an opening light.
      for (let i = 0; i < storeys; i++) {
        const y = bands[i] + 0.72
        const h = SH - 0.84
        for (let k = 0; k < bays; k++) {
          glazing(s, x0 + k * bay + 0.07, y, bay - 0.14, h, -g + 0.004, { cols: 2, transom: 0.8 })
        }
        for (let k = 0; k < sideBays; k++) {
          s.frame({ position: [x1 - g + 0.004, 0, 0], rotation: Math.PI / 2 }, () => {
            glazing(s, k * sideBay + 0.07, y, sideBay - 0.14, h, 0, { cols: 2, transom: 0.8 })
          })
        }
      }
      // Parapet: the top band, full height, with its coping line.
      band(H - 0.12, H + PARAPET)
      backParapets()
      // Continuous fins over the bands, from first floor to parapet.
      const finTop = H + PARAPET - 0.02
      for (let k = 1; k < bays; k++) {
        const fx = x0 + k * bay
        s.box([fx - 0.07, G - 0.12, -g], [fx + 0.07, finTop, 0.16], { fill: LA.paper, ink, weight: 'fine' })
      }
      for (let k = 1; k < sideBays; k++) {
        const fz = -k * sideBay
        s.box([x1 - g, G - 0.12, fz - 0.07], [x1 + 0.16, finTop, fz + 0.07], { fill: LA.paper, ink, weight: 'fine' })
      }
      // Corner piers, a touch proud of everything.
      s.box([x0 - 0.04, G - 0.12, -0.3], [x0 + 0.28, finTop, 0.2], { fill: LA.paper, ink })
      s.box([x1 - 0.28, G - 0.12, -0.3], [x1 + 0.2, finTop, 0.2], { fill: LA.paper, ink })
      s.box([x1 - 0.28, G - 0.12, -D], [x1 + 0.2, finTop, -D + 0.3], { fill: LA.paper, ink })
    } else {
      // Punched: a solid skin with two windows a bay.
      band(G - 0.12, H + PARAPET, 0)
      backParapets()
      for (let i = 0; i < storeys; i++) {
        for (let k = 0; k < bays; k++) {
          glazing(s, x0 + k * bay + 0.3, bands[i] + 0.8, bay - 0.6, SH - 1.3, 0.004, { cols: 2 })
        }
      }
    }
    // Coping line and cap along the parapet.
    s.line([x0 - 0.04, H + PARAPET - 0.1, 0.205], [x1 + 0.2, H + PARAPET - 0.1, 0.205], ink, 'fine')

    // ── entrance canopy ──
    if (canopy) {
      const cx = x0 + (entrance0 + 1) * bay
      const cw = bay * 1.6
      const proj = 3.3
      s.box([cx - cw, 3.3, -g], [cx + cw, 3.5, proj - 0.05], { fill: LA.paper, ink })
      // A deep fascia with a drip line round the three open sides.
      s.box([cx - cw - 0.05, 3.05, proj - 0.05], [cx + cw + 0.05, 3.62, proj + 0.05], { fill: LA.paper, ink })
      s.box([cx + cw - 0.05, 3.05, -g], [cx + cw + 0.05, 3.62, proj - 0.05], { fill: LA.paper, ink })
      s.box([cx - cw - 0.05, 3.05, -g], [cx - cw + 0.05, 3.62, proj - 0.05], { fill: LA.paper, ink })
      s.line([cx - cw - 0.05, 3.15, proj + 0.052], [cx + cw + 0.05, 3.15, proj + 0.052], ink, 'fine')
      s.frame({ position: [cx + cw + 0.052, 0, 0], rotation: Math.PI / 2 }, () => s.line([-proj - 0.05, 3.15, 0], [g, 3.15, 0], ink, 'fine'))
      for (const dx of [-cw + 0.35, cw - 0.35]) {
        s.cylinder([cx + dx, 0, proj - 0.35], 0.14, 3.05, { fill: LA.paper, ink, segments: 14 })
        s.cylinder([cx + dx, 0, proj - 0.35], 0.22, 0.12, { fill: LA.concrete, ink, weight: 'fine', segments: 14 })
      }
      // Entrance mat and step.
      s.patch(cx - 1.9, -g, cx + 1.9, 0.7, 0.225, { fill: LA.concrete, ink, weight: 'fine' })
    }

    // ── sign panel on the parapet ──
    if (sign) {
      const [sw, sh] = sign
      const c = officeSignCentre(props)
      s.box([c[0] - sw / 2, c[1] - sh / 2, 0.2], [c[0] + sw / 2, c[1] + sh / 2, 0.35], { fill: LA.paper, ink })
      s.line([c[0] - sw / 2 + 0.12, c[1] - sh / 2 + 0.12, 0.352], [c[0] + sw / 2 - 0.12, c[1] - sh / 2 + 0.12, 0.352], ink, 'fine')
    }

    // ── roof ──
    const roofY = H
    if (roofPlant) {
      // Louvred plant screen at the back left.
      const px0 = x0 + 1.2
      const px1 = px0 + 5.2
      const pz0 = -D + 1.0
      const pz1 = pz0 + 3.6
      s.box([px0, roofY, pz0], [px1, roofY + 1.9, pz1], { fill: LA.paper, ink })
      louvres(s, px0 + 0.05, roofY + 0.1, px1 - px0 - 0.1, 1.7, pz1 + 0.004, 0.16, ink)
      s.frame({ position: [px1 + 0.004, 0, 0], rotation: Math.PI / 2 }, () => louvres(s, -pz1 + 0.05, roofY + 0.1, pz1 - pz0 - 0.1, 1.7, 0, 0.16, ink))
      // Air handling unit with two fans on top.
      const ax0 = px1 + 1.3
      s.box([ax0, roofY, -D + 1.2], [ax0 + 3.6, roofY + 1.3, -D + 2.8], { fill: LA.paperCool, ink })
      for (const fx of [ax0 + 0.9, ax0 + 2.7]) {
        const ring = (r: number) => {
          const pts: Vec3[] = []
          for (let i = 0; i < 20; i++) {
            const t = (i / 20) * Math.PI * 2
            pts.push([fx + Math.cos(t) * r, roofY + 1.302, -D + 2.0 + Math.sin(t) * r])
          }
          s.polyline(pts, ink, 'fine', true)
        }
        ring(0.62)
        ring(0.18)
        s.line([fx - 0.62, roofY + 1.302, -D + 2.0], [fx + 0.62, roofY + 1.302, -D + 2.0], ink, 'fine')
        s.line([fx, roofY + 1.302, -D + 1.38], [fx, roofY + 1.302, -D + 2.62], ink, 'fine')
      }
      louvres(s, ax0 + 0.1, roofY + 0.15, 3.4, 1.0, -D + 2.804, 0.2, ink)
      // Lift overrun with its access door.
      const lx = x1 - 4.6
      s.box([lx, roofY, -D + 1.0], [lx + 2.6, roofY + 1.6, -D + 3.4], { fill: LA.paper, ink })
      s.rect(lx + 0.9, roofY, 0.85, 1.35, -D + 3.404, { fill: LA.paperCool, ink, weight: 'fine' })
      // A guard rail round the roof hatch.
      railing(s, [[lx - 1.8, -D + 4.2], [lx - 0.4, -D + 4.2], [lx - 0.4, -D + 5.4], [lx - 1.8, -D + 5.4], [lx - 1.8, -D + 4.2]], roofY, 1.0, 0.7, ink)
      s.box([lx - 1.5, roofY, -D + 4.5], [lx - 0.7, roofY + 0.25, -D + 5.1], { fill: LA.paperCool, ink, weight: 'fine' })
    }
    if (solar) {
      // Rows of tilted panels facing the front, on little A-frames.
      const rows = Math.max(1, Math.floor((D - 6.2) / 1.7))
      for (let r = 0; r < rows; r++) {
        const zf = -1.6 - r * 1.7
        const xa = x0 + 1.2
        const xb = x1 - 1.2
        const low = roofY + 0.25
        const high = roofY + 0.62
        const zb = zf - 1.05
        s.polygon([[xa, low, zf], [xb, low, zf], [xb, high, zb], [xa, high, zb]], { fill: LA.glassDeep, ink, weight: 'fine' })
        const n = Math.round((xb - xa) / 1.05)
        for (let i = 1; i < n; i++) {
          const x = xa + ((xb - xa) * i) / n
          s.line([x, low + 0.002, zf], [x, high + 0.002, zb], LA.paper, 'fine')
        }
        s.line([xa, (low + high) / 2 + 0.003, (zf + zb) / 2], [xb, (low + high) / 2 + 0.003, (zf + zb) / 2], LA.paper, 'fine')
        for (const x of [xa + 0.2, xb - 0.2]) {
          s.line([x, roofY, zf], [x, low, zf], ink, 'fine')
          s.line([x, roofY, zb], [x, high, zb], ink, 'fine')
        }
      }
    }
  })
}

export function OfficeBuilding(props: OfficeBuildingProps) {
  return <LineArt drawing={kitDrawing('OfficeBuilding', props, drawOfficeBuilding)} />
}
