'use client'

import { arc } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A family car in line art: a drawn side profile (bonnet, waistline, wheel
 * arches) with a narrower glasshouse on top, glazed all round, with door
 * shut lines, handles, lamps, mirrors and wheels with hubs.
 *
 * Metres. `position` is the centre of the car on the ground; the nose
 * points along +x before `rotation` (radians about +y). About 4.2 m long,
 * 1.8 m wide and 1.45 m high.
 */

export interface CarProps {
  position?: Vec3
  rotation?: number
  /** Body colour; keep to pale tints so the drawing stays paper-white. */
  color?: string
  body?: 'hatch' | 'estate'
  ink?: string
}

/** A wheel with its axle across z, at (x, r, z). */
export function drawWheel(s: Sketch, x: number, z: number, r: number, width: number, outward: 1 | -1) {
  const z0 = z - width / 2
  s.cylinder([x, r, z0], r, width, { axis: 'z', fill: LA.tyre, ink: LA.asphaltInk, segments: 12 })
  // The hub, just proud of the tyre wall on the outside.
  const hz = outward > 0 ? z + width / 2 : z - width / 2 - 0.02
  s.cylinder([x, r, hz], r * 0.56, 0.02, { axis: 'z', fill: LA.metal, ink: LA.asphaltInk, weight: 'fine', segments: 8, rings: outward > 0 ? 'end' : 'start' })
}

const R = 0.32
const WX = 1.33

function lowerProfile(): Vec2[] {
  const rear = arc(-WX, 0.3, 0.42, Math.PI, 0, 8)
  const front = arc(WX, 0.3, 0.42, Math.PI, 0, 8)
  return [
    [-2.06, 0.3],
    ...rear,
    ...front,
    [2.02, 0.3],
    [2.12, 0.48],
    [2.1, 0.7],
    [1.1, 0.9],
    [-1.86, 0.97],
    [-2.08, 0.88],
  ]
}

export function drawCar(s: Sketch, { position = [0, 0, 0], rotation = 0, color = LA.paper, body = 'hatch', ink = LA.ink }: CarProps) {
  s.frame({ position, rotation }, () => {
    const half = 0.88
    const cab = 0.74
    s.prism(lowerProfile(), -half, half, { fill: color, ink })
    // Glasshouse: windscreen, roof and the rear hatch or estate tail.
    const roofRear = body === 'estate' ? -1.9 : -1.5
    const cabin: Vec2[] = [
      [-1.92, 0.97],
      [1.08, 0.91],
      [0.12, 1.42],
      [roofRear, 1.45],
    ]
    s.prism(cabin, -cab, cab, { fill: color, ink })
    // Side glass on both flanks, split by the B pillar.
    for (const zs of [cab + 0.003, -cab - 0.003]) {
      const front: Vec3[] = [[-0.12, 1.0, zs], [0.9, 0.97, zs], [0.14, 1.36, zs], [-0.12, 1.37, zs]]
      const rearTop = body === 'estate' ? -1.8 : -1.42
      const rear: Vec3[] = [[-1.72, 1.02, zs], [-0.24, 1.0, zs], [-0.24, 1.37, zs], [rearTop, 1.39, zs]]
      s.polygon(front, { fill: LA.glass, ink, weight: 'fine' })
      s.polygon(rear, { fill: LA.glass, ink, weight: 'fine' })
    }
    // Windscreen and rear screen, inset on the sloping faces.
    const along = (a: Vec2, b: Vec2, t: number, off: number): [number, number] => {
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy)
      return [a[0] + dx * t + (dy / len) * off, a[1] + dy * t - (dx / len) * off]
    }
    const ws = (a: Vec2, b: Vec2) => {
      const p0 = along(a, b, 0.06, 0.004)
      const p1 = along(a, b, 0.94, 0.004)
      s.polygon([[p0[0], p0[1], cab - 0.07], [p1[0], p1[1], cab - 0.07], [p1[0], p1[1], -cab + 0.07], [p0[0], p0[1], -cab + 0.07]], { fill: LA.glass, ink, weight: 'fine' })
    }
    ws([1.08, 0.91], [0.12, 1.42])
    ws([roofRear, 1.45], [-1.92, 0.97])
    // Shut lines and handles on the near flank (and the far one, hidden unless turned).
    for (const zs of [half + 0.002, -half - 0.002]) {
      s.line([-0.18, 0.36, zs], [-0.18, 0.96, zs], ink, 'fine')
      s.line([0.95, 0.4, zs], [0.95, 0.92, zs], ink, 'fine')
      s.line([-1.3, 0.78, zs], [-1.3, 0.97, zs], ink, 'fine')
      s.line([0.55, 0.8, zs], [0.72, 0.8, zs], ink, 'fine')
      s.line([-0.6, 0.8, zs], [-0.43, 0.8, zs], ink, 'fine')
      // Sill line along the bottom of the doors.
      s.line([-0.9, 0.4, zs], [0.9, 0.4, zs], ink, 'fine')
    }
    // Lamps and bumpers.
    for (const z of [0.52, -0.52]) {
      s.polygon([[2.112, 0.58, z - 0.2], [2.112, 0.58, z + 0.2], [2.102, 0.68, z + 0.2], [2.102, 0.68, z - 0.2]], { fill: LA.paperCool, ink, weight: 'fine', shade: false })
      s.polygon([[-2.075, 0.68, z - 0.16], [-2.075, 0.68, z + 0.16], [-2.075, 0.84, z + 0.16], [-2.075, 0.84, z - 0.16]], { fill: LA.redPale, ink: LA.red, weight: 'fine', shade: false })
    }
    s.box([2.0, 0.28, -0.82], [2.16, 0.44, 0.82], { fill: LA.asphaltLight, ink: LA.asphaltInk, weight: 'fine' })
    s.box([-2.12, 0.28, -0.82], [-1.98, 0.44, 0.82], { fill: LA.asphaltLight, ink: LA.asphaltInk, weight: 'fine' })
    // Wing mirrors.
    for (const sgn of [1, -1]) s.box([0.78, 0.98, sgn * 0.74], [0.95, 1.1, sgn * 0.98], { fill: color, ink, weight: 'fine' })
    for (const sgn of [1, -1] as const) {
      drawWheel(s, WX, sgn * 0.77, R, 0.22, sgn)
      drawWheel(s, -WX, sgn * 0.77, R, 0.22, sgn)
    }
  })
}

export function Car(props: CarProps) {
  return <LineArt drawing={kitDrawing('Car', props, drawCar)} />
}
