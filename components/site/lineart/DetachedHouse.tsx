'use client'

import { glazing, punchedWindow, seeded, wall, type Rect } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A two-storey detached house in line art: a brick plinth, rendered walls
 * with casement windows in real reveals (sills, soldier-course heads,
 * top lights), a panelled front door with a fanlight under a pitched
 * canopy on brackets, a gabled roof with tile courses, ridge tiles and
 * barge boards, eaves gutters and downpipes, a chimney with its corbel
 * and pots, and an attached flat-roofed garage with a ribbed up-and-over
 * door.
 *
 * Metres. `position` is the centre of the front (+z) wall at ground level;
 * the ridge runs along x. The garage sits against the +x gable.
 */

export interface DetachedHouseProps {
  position?: Vec3
  rotation?: number
  width?: number
  depth?: number
  /** Wall plate (eaves) height. */
  eaves?: number
  /** Ridge height above the eaves. */
  rise?: number
  garage?: boolean
  /** Draw the downpipes (off when drainage runs are drawn separately). */
  downpipes?: boolean
  /** A path from the front door this far out, 0 for none. */
  frontPath?: number
  roofColor?: string
  doorColor?: string
  ink?: string
}

export function drawDetachedHouse(s: Sketch, props: DetachedHouseProps) {
  const {
    position = [0, 0, 0],
    rotation = 0,
    width: W = 10,
    depth: D = 8,
    eaves: E = 5.6,
    rise: R = 2.95,
    garage = true,
    downpipes = true,
    frontPath = 0,
    roofColor = '#e4eef5',
    doorColor = LA.ink,
    ink = LA.ink,
  } = props
  const x0 = -W / 2
  const x1 = W / 2
  const skin = 0.28
  const plinth = 0.3
  const rand = seeded(3)

  s.frame({ position, rotation }, () => {
    // ── walls ──
    s.box([x0 - 0.04, 0, -D - 0.04], [x1 + 0.04, plinth, 0.04], { fill: '#eef0f1', ink })
    // Brick coursing on the plinth.
    for (const y of [0.1, 0.2]) s.line([x0 - 0.04, y, 0.042], [x1 + 0.04, y, 0.042], ink, 'fine')
    s.box([x0, plinth, -D], [x1 - skin, E, -skin], { fill: LA.paper, ink })

    const ww = 1.9
    const front: Rect[] = [
      [x0 + 0.9, 0.9, ww, 1.4],
      [x1 - 0.9 - ww, 0.9, ww, 1.4],
      [x0 + 0.9, 3.35, ww, 1.35],
      [-ww / 2, 3.35, ww, 1.35],
      [x1 - 0.9 - ww, 3.35, ww, 1.35],
    ]
    const door: Rect = [-0.65, plinth, 1.3, 2.35]
    wall(s, x0, x1, plinth, E, 0, skin, [...front, door], { ink })
    for (const o of front) {
      punchedWindow(s, o, 0, skin, { cols: 2, transom: 0.72, ink })
      // Soldier-course head over each window.
      const [x, y, w, h] = o
      s.box([x - 0.1, y + h, -0.02], [x + w + 0.1, y + h + 0.2, 0.02], { fill: LA.paper, ink, weight: 'fine' })
      for (let bx = x - 0.1 + 0.12; bx < x + w + 0.1; bx += 0.12) s.line([bx, y + h, 0.022], [bx, y + h + 0.2, 0.022], ink, 'fine')
    }
    // Front door: panelled leaf, fanlight, letter plate and knob.
    const [dx, dy, dw, dh] = door
    const dz = -skin + 0.06
    const leafTop = dy + dh - 0.4
    s.rect(dx, dy, dw, leafTop - dy, dz, { fill: doorColor, ink: LA.inkDark, shade: false })
    glazing(s, dx, leafTop, dw, 0.4, dz, { cols: 3, reflection: false, ink })
    for (const [px, py, pw, ph] of [[0.15, 0.2, 0.42, 0.6], [0.73, 0.2, 0.42, 0.6], [0.15, 0.95, 0.42, 0.85], [0.73, 0.95, 0.42, 0.85]] as Rect[]) {
      s.rect(dx + px, dy + py, pw, ph, dz + 0.004, { fill: null, ink: LA.paper, weight: 'fine' })
    }
    s.line([dx + 0.45, dy + 1.0, dz + 0.006], [dx + 0.85, dy + 1.0, dz + 0.006], LA.paper, 'line')
    s.box([dx - 0.1, 0, 0], [dx + dw + 0.1, plinth, 0.35], { fill: '#eef0f1', ink, weight: 'fine' })
    // Pitched canopy over the door on two brackets.
    const cy = dy + dh + 0.12
    s.frame({ position: [0, cy, 0] }, () => {
      const half = dw / 2 + 0.35
      s.prism([[-half, 0], [half, 0], [0, 0.45]], 0, 0.95, { fill: roofColor, ink })
      s.box([-half, -0.1, 0], [half, 0, 0.95], { fill: LA.paper, ink, weight: 'fine' })
      for (const bx of [-half + 0.15, half - 0.15]) s.polyline([[bx, -0.1, 0.8], [bx, -0.1, 0.02], [bx, -0.6, 0.02]], ink, 'fine')
    })

    // ── gable wall with a landing window, and the side wall ──
    s.frame({ position: [x1, 0, 0], rotation: Math.PI / 2 }, () => {
      const side: Rect[] = [[1.3, 3.35, 1.3, 1.35], [D - 2.6, 3.35, 1.3, 1.35]]
      if (!garage) side.push([1.3, 0.9, 1.3, 1.4], [D - 2.6, 0.9, 1.3, 1.4])
      wall(s, 0, D, plinth, E, 0, skin, side, { ink })
      for (const o of side) punchedWindow(s, o, 0, skin, { cols: 1, transom: 0.72, ink })
      // The gable triangle, flush with the wall below.
      s.polygon([[0, E, 0], [D, E, 0], [D / 2, E + R, 0]], { fill: LA.paper, ink })
      s.rect(D / 2 - 0.3, E + 0.6, 0.6, 0.8, 0.002, { fill: LA.glass, ink, weight: 'line', shade: false })
    })
    // Gable volume behind the triangle.
    s.frame({ position: [0, 0, 0], rotation: Math.PI / 2 }, () => {
      s.prism([[0, E], [D, E], [D / 2, E + R]], x0, x1 - 0.002, { fill: LA.paper, ink: null })
    })

    // ── roof ──
    const over = 0.32
    const verge = 0.28
    const t = 0.16
    const slope = R / (D / 2)
    const eaveY = E - over * slope
    s.frame({ position: [0, 0, 0], rotation: Math.PI / 2 }, () => {
      // Profile in (depth back from the front, height); extruded along x.
      const ridgeZ = D / 2
      const profile: Vec2[] = [
        [-over, eaveY - t],
        [-over, eaveY],
        [ridgeZ, E + R + 0.06],
        [D + over, eaveY],
        [D + over, eaveY - t],
        [ridgeZ, E + R + 0.06 - t * 1.2],
      ]
      s.prism(profile, x0 - verge, x1 + verge, { fill: roofColor, ink })
      // Barge boards down each verge.
      for (const z of [x0 - verge - 0.04, x1 + verge]) {
        s.prism([[-over, eaveY - t - 0.12], [-over, eaveY + 0.02], [ridgeZ, E + R + 0.08], [ridgeZ, E + R - t - 0.1]], z, z + 0.04, { fill: LA.paper, ink, weight: 'fine' })
      }
    })
    // Tile courses on the front slope, with a scatter of joints.
    const slopeLen = Math.hypot(D / 2 + over, R + over * slope)
    const courses = Math.floor(slopeLen / 0.3)
    for (let i = 1; i < courses; i++) {
      const f = i / courses
      const z = over - (D / 2 + over) * f
      const y = eaveY + (E + R + 0.06 - eaveY) * f + 0.004
      s.line([x0 - verge, y, z], [x1 + verge, y, z], LA.roofInk, 'fine')
      if (i < courses - 1) {
        const f2 = (i + 1) / courses
        const z2 = over - (D / 2 + over) * f2
        const y2 = eaveY + (E + R + 0.06 - eaveY) * f2 + 0.004
        const off = (i % 2) * 0.2
        for (let x = x0 - verge + 0.4 + off; x < x1 + verge - 0.2; x += 0.4) {
          if (rand() < 0.28) s.line([x, y, z], [x, y2, z2], LA.roofInk, 'fine')
        }
      }
    }
    // Ridge tiles.
    const ry = E + R + 0.06
    s.frame({ position: [0, 0, -D / 2], rotation: Math.PI / 2 }, () => {
      s.prism([[-0.16, ry - 0.02], [0.16, ry - 0.02], [0.1, ry + 0.12], [-0.1, ry + 0.12]], x0 - verge, x1 + verge, { fill: roofColor, ink, weight: 'fine' })
    })
    for (let x = x0 - verge + 0.45; x < x1 + verge; x += 0.45) s.line([x, ry + 0.12, -D / 2 - 0.1], [x, ry - 0.02, -D / 2 + 0.16], ink, 'fine')
    // Fascia and gutter along the front eaves.
    s.box([x0 - verge, eaveY - t - 0.18, over - 0.02], [x1 + verge, eaveY - t + 0.02, over + 0.02], { fill: LA.paper, ink, weight: 'fine' })
    s.box([x0 - verge, eaveY - t - 0.14, over + 0.02], [x1 + verge, eaveY - t + 0.0, over + 0.16], { fill: LA.paper, ink })
    if (downpipes) {
      for (const px of [x0 + 0.4, x1 - 0.4]) {
        const top = eaveY - t - 0.45
        s.cylinder([px, 0.1, 0.1], 0.05, top - 0.1, { fill: LA.paper, ink, segments: 8 })
        // Swan neck back under the eaves to the gutter outlet.
        s.polyline([[px, top, 0.1], [px, top + 0.2, 0.1], [px, eaveY - t - 0.12, over + 0.09]], ink, 'line')
      }
    }

    // ── chimney ──
    const cx0 = W * 0.22
    const cz0 = -D * 0.59
    s.box([cx0, E + 0.5, cz0], [cx0 + 0.9, E + R + 1.0, cz0 + 0.9], { fill: LA.paper, ink })
    s.box([cx0 - 0.06, E + R + 0.72, cz0 - 0.06], [cx0 + 0.96, E + R + 0.84, cz0 + 0.96], { fill: LA.paper, ink, weight: 'fine' })
    s.box([cx0 - 0.04, E + R + 1.0, cz0 - 0.04], [cx0 + 0.94, E + R + 1.08, cz0 + 0.94], { fill: LA.paper, ink, weight: 'fine' })
    for (const px of [cx0 + 0.27, cx0 + 0.63]) s.cylinder([px, E + R + 1.08, cz0 + 0.45], 0.1, 0.38, { radiusTop: 0.08, fill: '#f4e6d8', ink, weight: 'fine', segments: 10 })

    // ── garage ──
    if (garage) {
      const g0 = x1
      const g1 = x1 + 3.2
      const gz = -0.35
      const gh = 2.8
      s.box([g0, 0, -D + 1.4], [g1, gh, gz], { fill: LA.paper, ink })
      s.box([g0, gh, -D + 1.3], [g1 + 0.08, gh + 0.25, gz + 0.08], { fill: LA.paper, ink })
      // Upstand round the flat roof, and a rooflight.
      s.box([g0, gh + 0.25, gz - 0.1], [g1 + 0.08, gh + 0.36, gz + 0.08], { fill: LA.paper, ink, weight: 'fine' })
      s.box([g1 - 0.1, gh + 0.25, -D + 1.3], [g1 + 0.08, gh + 0.36, gz - 0.1], { fill: LA.paper, ink, weight: 'fine' })
      s.box([(g0 + g1) / 2 - 0.45, gh + 0.25, -D * 0.5 - 0.45], [(g0 + g1) / 2 + 0.45, gh + 0.45, -D * 0.5 + 0.45], { fill: LA.glass, ink, weight: 'fine' })
      s.box([g0 - 0.02, 0, -D + 1.4], [g1 + 0.02, plinth, gz + 0.02], { fill: '#eef0f1', ink, weight: 'fine' })
      const dw = 2.45
      const ddx = (g0 + g1) / 2 - dw / 2
      s.rect(ddx - 0.1, 0, dw + 0.2, 2.2, gz + 0.004, { fill: LA.paper, ink })
      s.rect(ddx, 0, dw, 2.1, gz + 0.008, { fill: LA.paperCool, ink })
      for (let y = 0.2; y < 2.1; y += 0.2) s.line([ddx, y, gz + 0.01], [ddx + dw, y, gz + 0.01], ink, 'fine')
      s.line([ddx + dw / 2 - 0.15, 0.35, gz + 0.012], [ddx + dw / 2 + 0.15, 0.35, gz + 0.012], LA.inkDark, 'line')
      s.frame({ position: [g1 + 0.002, 0, 0], rotation: Math.PI / 2 }, () => {
        glazing(s, -gz + 2.2, 1.0, 1.2, 1.0, 0, { cols: 2, ink })
      })
    }

    // ── path to the door ──
    if (frontPath > 0) {
      s.patch(-0.8, 0.35, 0.8, frontPath, 0.006, { fill: '#eef0f1', ink, weight: 'fine' })
      for (let z = 0.35 + 0.45; z < frontPath; z += 0.45) s.line([-0.8, 0.008, z], [0.8, 0.008, z], LA.pavingInk, 'fine')
      s.line([0, 0.008, 0.35], [0, 0.008, frontPath], LA.pavingInk, 'fine')
    }
  })
}

export function DetachedHouse(props: DetachedHouseProps) {
  return <LineArt drawing={kitDrawing('DetachedHouse', props, drawDetachedHouse)} />
}
