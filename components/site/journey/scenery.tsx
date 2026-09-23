'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWaterMaterial } from '@/components/site/three/toon'
import { drawBench } from '@/components/site/lineart/Bench'
import { drawBollard } from '@/components/site/lineart/Bollard'
import { drawCar } from '@/components/site/lineart/Car'
import { drawDetachedHouse } from '@/components/site/lineart/DetachedHouse'
import { joints, railing, seeded } from '@/components/site/lineart/details'
import { drawDownpipe } from '@/components/site/lineart/Downpipe'
import { drawEVCharger } from '@/components/site/lineart/EVCharger'
import { drawFence } from '@/components/site/lineart/Fence'
import { drawGully } from '@/components/site/lineart/Gully'
import { drawHedge } from '@/components/site/lineart/Hedge'
import { LineArt } from '@/components/site/lineart/LineArt'
import { drawLitterBin } from '@/components/site/lineart/LitterBin'
import { drawManholeCover } from '@/components/site/lineart/ManholeCover'
import { cachedSketch } from '@/components/site/lineart/materials'
import { LA } from '@/components/site/lineart/palette'
import { drawParkingBays } from '@/components/site/lineart/ParkingBays'
import { drawPerson } from '@/components/site/lineart/Person'
import { drawRetailParade } from '@/components/site/lineart/RetailParade'
import { drawRoad } from '@/components/site/lineart/Road'
import type { Sketch, Vec2 } from '@/components/site/lineart/sketch'
import { drawStreetLamp } from '@/components/site/lineart/StreetLamp'
import { Trees, type TreeSpec } from '@/components/site/lineart/Trees'
import { drawVan } from '@/components/site/lineart/Van'

/**
 * The water journey's scenery, and only its scenery: the house, garden,
 * drive, road, car park, open space, trees, cloud and rain, the river and
 * its headwall, the access covers on the section line, and the ground
 * slab cut in section under all of it.
 *
 * This file is the one adapter between the journey and the line-art
 * scenery kit (components/site/lineart), the same kit the Site Explorer
 * draws with, so the two pages read as one drawing. Each component here
 * bakes everything it draws into one cached Sketch (at most four draw
 * calls however much detail it carries); the trees are instanced.
 *
 * Units are metres. The ground surface is y = 0 away from the river, the
 * section cut is the plane z = 0 and the site runs back towards -z.
 */

export type Vec3 = [number, number, number]

/** A point on the ground profile along the cut: [x, y]. */
export type ProfilePoint = [number, number]

/** How the top of the ground is finished between two x positions. */
export type SurfaceKind = 'paving' | 'road' | 'grass'

export interface SurfaceSpan {
  from: number
  to: number
  kind: SurfaceKind
}

/** A drawing cached on its inputs, so re-renders cost nothing. */
function Drawing<P>({ name, props, draw }: { name: string; props: P; draw: (s: Sketch, p: P) => void }) {
  return <LineArt drawing={cachedSketch(`journey-${name}:${JSON.stringify(props)}`, (s) => draw(s, props))} />
}

/** Height of the profile at x. */
function heightAt(profile: ProfilePoint[], x: number): number {
  for (let i = 1; i < profile.length; i++) {
    const [ax, ay] = profile[i - 1]
    const [bx, by] = profile[i]
    if (x >= ax && x <= bx && bx > ax) return ay + ((x - ax) / (bx - ax)) * (by - ay)
  }
  return x < profile[0][0] ? profile[0][1] : profile[profile.length - 1][1]
}

/** The profile clipped to [from, to], with its ends interpolated. */
function clipProfile(profile: ProfilePoint[], from: number, to: number): ProfilePoint[] {
  const out: ProfilePoint[] = [[from, heightAt(profile, from)]]
  profile.forEach(([x, y]) => {
    if (x > from && x < to) out.push([x, y])
  })
  out.push([to, heightAt(profile, to)])
  return out
}

/** Mix two hex colours in sRGB. */
function mix(a: string, b: string, t: number): string {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return `#${ca.lerp(cb, t).getHexString()}`
}

// ── the ground slab ─────────────────────────────────────────────────

/** Surfacing, then two soil bands; the third band runs to the slab bottom. */
const BANDS = [0.35, 1.35, 3.75] as const
const SOIL = ['#c29a6b', '#a4764b', '#825633'] as const
const SOIL_INK = '#5e3d22'
const TOPSOIL = '#8c6a48'
const ROAD_SURFACE = '#5b5c5f'
const BANK = '#b9a57f'

const SURFACE_STYLE: Record<SurfaceKind, { front: string; top: string; ink: string }> = {
  paving: { front: LA.asphalt, top: LA.ground, ink: LA.asphaltInk },
  road: { front: LA.asphalt, top: ROAD_SURFACE, ink: LA.asphaltInk },
  grass: { front: TOPSOIL, top: LA.grass, ink: SOIL_INK },
}

/** The outline of a band `top` to `bottom` metres under the line (or down to `floor`). */
function bandOutline(line: ProfilePoint[], top: number, bottom: number | null, floor: number): Vec3[] {
  const upper = line.map(([x, y]) => [x, y - top, 0] as Vec3)
  const lower = line.map(([x, y]) => [x, bottom === null ? floor : y - bottom, 0] as Vec3).reverse()
  return [...upper, ...lower]
}

interface GroundProps {
  profile: ProfilePoint[]
  surfaces: SurfaceSpan[]
  depth: number
  back: number
}

function drawGround(s: Sketch, { profile, surfaces, depth, back }: GroundProps) {
  const x0 = profile[0][0]
  const x1 = profile[profile.length - 1][0]
  const whole = clipProfile(profile, x0, x1)
  const floor = -depth
  // The soil bands on the cut face, and their ends at the right-hand edge.
  const bands: [number, number | null][] = [[BANDS[0], BANDS[1]], [BANDS[1], BANDS[2]], [BANDS[2], null]]
  bands.forEach(([top, bottom], i) => {
    s.polygon(bandOutline(whole, top, bottom, floor), { fill: SOIL[i], ink: SOIL_INK, weight: 'line', shade: false })
    const yTop = whole[whole.length - 1][1] - top
    const yBottom = bottom === null ? floor : whole[whole.length - 1][1] - bottom
    s.polygon([[x1, yTop, 0], [x1, yBottom, 0], [x1, yBottom, back], [x1, yTop, back]], { fill: SOIL[i], ink: SOIL_INK, weight: 'fine' })
  })
  // Surfacing: the cut face, its top across the site, and an end where it meets the edge.
  for (const span of surfaces) {
    const line = clipProfile(profile, span.from, span.to)
    const st = SURFACE_STYLE[span.kind]
    s.polygon(bandOutline(line, 0, BANDS[0], floor), { fill: st.front, ink: st.ink, weight: 'line', shade: false })
    for (let i = 1; i < line.length; i++) {
      const [ax, ay] = line[i - 1]
      const [bx, by] = line[i]
      const steep = Math.abs(by - ay) > (bx - ax) * 1.2
      s.polygon([[ax, ay, 0], [bx, by, 0], [bx, by, back], [ax, ay, back]], { fill: steep ? BANK : st.top, ink: null })
      // A steep bank is earth, not lawn: strata lines along it.
      if (steep) {
        for (const f of [0.25, 0.5, 0.75]) {
          const x = ax + (bx - ax) * f
          const y = ay + (by - ay) * f
          s.line([x, y, 0], [x, y, back], SOIL_INK, 'fine')
        }
        s.line([bx, by, 0], [bx, by, back], SOIL_INK, 'fine')
        s.line([ax, ay, 0], [ax, ay, back], LA.grassInk, 'line')
      }
    }
    s.polyline(line.map(([x, y]) => [x, y + 0.002, back] as Vec3), span.kind === 'grass' ? LA.grassInk : LA.pavingInk, 'fine')
    s.line([span.from, heightAt(profile, span.from) + 0.002, 0], [span.from, heightAt(profile, span.from) + 0.002, back], span.kind === 'grass' ? LA.grassInk : LA.pavingInk, 'fine')
    if (span.to >= x1) {
      const [, y] = line[line.length - 1]
      s.polygon([[x1, y, 0], [x1, y - BANDS[0], 0], [x1, y - BANDS[0], back], [x1, y, back]], { fill: st.front, ink: st.ink, weight: 'fine' })
    }
    // Grass tufts along the cut edge, so the lawn reads as turf in section.
    if (span.kind === 'grass') {
      const rand = seeded(Math.round(span.from * 10) + 101)
      for (let x = span.from + 0.2; x < span.to - 0.2; x += 0.28 + rand() * 0.3) {
        const y = heightAt(profile, x)
        const h = 0.08 + rand() * 0.1
        s.line([x, y, 0.005], [x - 0.05, y + h, 0.005], LA.grassInk, 'fine')
        s.line([x, y, 0.005], [x + 0.04, y + h * 0.8, 0.005], LA.grassInk, 'fine')
      }
      // Roots in the topsoil.
      for (let x = span.from + 0.6; x < span.to - 0.6; x += 1.4 + rand() * 1.6) {
        const y = heightAt(profile, x) - 0.08
        s.polyline([[x, y, 0.004], [x + 0.06, y - 0.12, 0.004], [x + 0.02, y - 0.24, 0.004]], SOIL_INK, 'fine')
      }
    }
  }
  // Pebbles in the soil bands.
  const rand = seeded(11)
  const count = Math.round((x1 - x0) * 5)
  for (let i = 0; i < count; i++) {
    const x = x0 + 0.3 + rand() * (x1 - x0 - 0.6)
    const top = heightAt(profile, x) - BANDS[0] - 0.2
    const y = top - rand() * (top - floor - 0.3)
    const band = heightAt(profile, x) - y < BANDS[1] ? 0 : heightAt(profile, x) - y < BANDS[2] ? 1 : 2
    const w = 0.1 + rand() * 0.22
    const h = w * (0.45 + rand() * 0.3)
    s.polygon([[x - w / 2, y, 0.004], [x + w / 2, y, 0.004], [x + w * 0.2, y + h, 0.004], [x - w * 0.25, y + h * 0.8, 0.004]], {
      fill: mix(SOIL[band], SOIL_INK, 0.38),
      ink: null,
      shade: false,
    })
  }
}

/**
 * The ground under the whole journey, cut open along z = 0: a surfacing
 * layer (paving, road or topsoil under grass) over three soil bands, all
 * following the ground profile, so the slab steps down to the river.
 */
export function JourneyGround(props: GroundProps) {
  return <Drawing name="ground" props={props} draw={drawGround} />
}

// ── the house ───────────────────────────────────────────────────────

/** The house's size; the gutter and downpipe levels in journeyWorld.ts follow the kit house. */
export const HOUSE = { width: 10, depth: 7, eaves: 5.6, rise: 2.9 } as const

interface HouseProps {
  position: Vec3
  garage: boolean
  downpipe: { x: number; z: number; top: number } | null
}

function drawHouse(s: Sketch, { position, garage, downpipe }: HouseProps) {
  const [x, y, z] = position
  drawDetachedHouse(s, {
    position: [x + HOUSE.width / 2, y, z],
    width: HOUSE.width,
    depth: HOUSE.depth,
    eaves: HOUSE.eaves,
    rise: HOUSE.rise,
    garage,
    downpipes: downpipe === null,
    frontPath: -z,
  })
  // The downpipe itself is a drainage run; draw its hopper, brackets and gully.
  if (downpipe) drawDownpipe(s, { position: [downpipe.x, y, downpipe.z], top: downpipe.top, radius: 0.08 })
}

/**
 * A two-storey detached house (the kit's DetachedHouse). `position` is the
 * bottom-left corner of its front wall; the house runs to +x and back to
 * -z, with its garage against the +x gable. Where `downpipe` is given the
 * journey draws the gutter and downpipe as a flowing run, so only the
 * fittings are drawn here; otherwise the kit draws its own downpipes.
 */
export function JourneyHouse({ position, garage = true, downpipe = null }: {
  position: Vec3
  garage?: boolean
  downpipe?: { x: number; z: number; top: number } | null
}) {
  return <Drawing name="house" props={{ position, garage, downpipe }} draw={drawHouse} />
}

// ── garden, drive, road, car park, open space ───────────────────────

interface GardenProps {
  from: number
  to: number
  back: number
}

function drawGarden(s: Sketch, { from, to, back }: GardenProps) {
  const houseX0 = from - HOUSE.width
  const houseBack = -1.2 - HOUSE.depth
  // Block-paved drive in front of the garage, out to the cut.
  s.patch(from + 0.1, -1.55, from + 3.3, -0.02, 0.008, { fill: '#eceff1', ink: LA.ink, weight: 'fine' })
  joints(s, from + 0.1, -1.55, from + 3.3, -0.02, 0.01, 0.4, 0.3)
  // Lawn beside it, edged by a flower bed and a front hedge.
  s.box([from + 3.6, 0, -3.4], [to - 0.5, 0.12, -2.4], { fill: '#e9dcc5', ink: LA.timberInk, weight: 'fine' })
  const rand = seeded(23)
  for (let x = from + 3.9; x < to - 0.7; x += 0.45) {
    s.disc([x, 0.3 + rand() * 0.12, -2.9 + (rand() - 0.5) * 0.4], 0.16 + rand() * 0.06, { fill: rand() > 0.5 ? LA.hedge : LA.treeLight, ink: LA.hedgeInk, weight: 'fine' })
  }
  drawHedge(s, { position: [(from + 3.6 + to - 0.3) / 2, 0, -0.35], length: to - 0.3 - from - 3.6, height: 0.85, depth: 0.55, seed: 5 })
  drawBench(s, { position: [to - 1.8, 0, -5.4] })
  // Boundary fences: down the side to the back, and across the back.
  drawFence(s, { points: [[to - 0.1, -0.5], [to - 0.1, back], [houseX0 - 1.8, back]] })
  drawFence(s, { points: [[houseX0 - 1.8, back], [houseX0 - 1.8, houseBack - 0.2]] })
  // Patio behind the house and a timber shed at the end of the garden.
  s.patch(houseX0 + 0.5, houseBack - 2.4, houseX0 + 6.5, houseBack, 0.008, { fill: LA.paving, ink: LA.pavingInk })
  joints(s, houseX0 + 0.5, houseBack - 2.4, houseX0 + 6.5, houseBack, 0.01, 0.6, 0.6)
  const shedX = houseX0 + 6.9
  const shedZ = back + 0.6
  s.box([shedX, 0, shedZ], [shedX + 2.4, 2.0, shedZ + 2.0], { fill: LA.timber, ink: LA.timberInk })
  s.frame({ position: [shedX + 1.2, 2.0, shedZ + 1.0] }, () => {
    s.prism([[-1.35, 0], [1.35, 0], [0, 0.7]], -1.15, 1.15, { fill: LA.timber, ink: LA.timberInk })
  })
  for (let x = shedX + 0.15; x < shedX + 2.4; x += 0.15) s.line([x, 0, shedZ + 2.004], [x, 2.0, shedZ + 2.004], LA.timberInk, 'fine')
  s.rect(shedX + 0.8, 0, 0.8, 1.7, shedZ + 2.01, { fill: '#e7d6b8', ink: LA.timberInk, weight: 'fine' })
}

/**
 * The garden between the house and the drive, from x `from` (the house's
 * gable) to `to`: a paved drive to the garage, a lawn with a bed and a
 * front hedge, a bench, boundary fences, a patio and a shed behind.
 */
export function JourneyGarden(props: GardenProps) {
  return <Drawing name="garden" props={props} draw={drawGarden} />
}

interface DriveProps {
  from: number
  to: number
}

function drawDrive(s: Sketch, { from, to }: DriveProps) {
  const footway = to - 1.4
  // A block-paved parking court with a charge point, and the footway by the road.
  s.patch(from + 0.05, -9.6, footway - 0.05, -0.02, 0.006, { fill: '#eceff1', ink: LA.ink, weight: 'fine' })
  joints(s, from + 0.05, -9.6, footway - 0.05, -0.02, 0.008, 0.6, 0.6)
  s.box([footway, 0, -24], [to, 0.12, 0], { fill: LA.paving, ink: LA.ink, weight: 'fine' })
  joints(s, footway, -24, to, 0, 0.124, 0.7, 0.9)
  drawCar(s, { position: [from + 2.2, 0, -5.6], rotation: Math.PI / 2, color: '#e7f1f8' })
  drawEVCharger(s, { position: [from + 0.6, 0, -8.6] })
  drawBollard(s, { position: [footway + 0.3, 0.12, -1.1] })
  drawBollard(s, { position: [footway + 0.3, 0.12, -3.1] })
}

/** A paved parking court with a car on charge, from x `from` to `to`, and the footway along the road. */
export function JourneyDrive(props: DriveProps) {
  return <Drawing name="drive" props={props} draw={drawDrive} />
}

interface RoadProps {
  from: number
  to: number
  back: number
  gullyX: number
}

function drawJourneyRoad(s: Sketch, { from, to, back, gullyX }: RoadProps) {
  const mid = (from + to) / 2
  const width = to - from - 0.3
  // The kit road runs along its own x; turned a quarter it runs back from the cut.
  drawRoad(s, { position: [mid, 0, back / 2], rotation: Math.PI / 2, length: -back, width, footway: 0, gullies: 0, surface: ROAD_SURFACE })
  // Gullies in both channels; the one at the cut is where the gully pot drains to the run.
  const other = from + (to - gullyX)
  for (const z of [-0.36, -12.3]) drawGully(s, { position: [gullyX, 0, z], rotation: Math.PI / 2 })
  for (const z of [-6.3, -18.3]) drawGully(s, { position: [other, 0, z], rotation: Math.PI / 2 })
  // The far footway.
  s.box([to, 0, back], [to + 1.4, 0.12, 0], { fill: LA.paving, ink: LA.ink, weight: 'fine' })
  joints(s, to, back, to + 1.4, 0, 0.124, 0.7, 0.9)
  // Traffic, well back from the section so the pipes below stay clear.
  drawVan(s, { position: [from + 1.9, 0, -13.5], rotation: -Math.PI / 2 })
  drawCar(s, { position: [to - 2.0, 0, -19.5], rotation: Math.PI / 2 })
  drawStreetLamp(s, { position: [to + 0.9, 0.12, -9.5], rotation: Math.PI })
  drawLitterBin(s, { position: [to + 0.9, 0.12, -14.5] })
  drawPerson(s, { position: [to + 0.7, 0.12, -5.2], pose: 'walk', shirt: LA.shirtGreen })
}

/**
 * A two-lane road running back from the section, kerb to kerb from x
 * `from` to `to`: carriageway, centre line, bevelled kerbs, gullies in the
 * channels (one at `gullyX` by the cut, over the journey's gully pot), a
 * footway beyond, parked traffic and a lamp.
 */
export function JourneyRoad(props: RoadProps) {
  return <Drawing name="road" props={props} draw={drawJourneyRoad} />
}

interface CarParkProps {
  from: number
  to: number
  back: number
}

const CAR_TINTS = [LA.paper, '#e7f1f8', '#e9f4e6', '#f4efe6'] as const

function drawCarPark(s: Sketch, { from, to, back }: CarParkProps) {
  const x0 = from + 0.25
  const bay = 2.5
  const n = Math.floor((to - from - 0.3) / bay)
  const row2 = -16.2
  drawParkingBays(s, { position: [x0, 0, -1.4], count: n, ev: [n - 2, n - 1] })
  drawParkingBays(s, { position: [x0 + n * bay, 0, row2], rotation: Math.PI, count: n })
  // A slot drain across the foot of the bays, draining to the run.
  s.patch(from + 0.2, -0.95, to - 0.2, -0.72, 0.01, { fill: LA.metal, ink: LA.ink, weight: 'fine' })
  s.line([from + 0.2, 0.012, -0.835], [to - 0.2, 0.012, -0.835], LA.metalDark, 'line')
  for (let k = 0; k < n; k++) {
    const x = x0 + (k + 0.5) * bay
    if (k !== 2) drawCar(s, { position: [x, 0, -3.8], rotation: Math.PI / 2, color: CAR_TINTS[k % 4], body: k % 2 ? 'estate' : 'hatch' })
    if (k !== 1) drawCar(s, { position: [x, 0, row2 + 2.4], rotation: -Math.PI / 2, color: CAR_TINTS[(k + 2) % 4] })
  }
  // Charge points at the head of the electric bays, and lighting down the aisle.
  for (const k of [n - 2, n - 1]) drawEVCharger(s, { position: [x0 + (k + 0.5) * bay + 0.9, 0, -6.5] })
  drawStreetLamp(s, { position: [from + 0.4, 0, -9.2], double: false })
  drawStreetLamp(s, { position: [to - 0.4, 0, -9.2], rotation: Math.PI })
  drawPerson(s, { position: [from + 5.2, 0, -8.8], pose: 'walk', flip: true })
  // A hedge along the back, and a small shopping parade beyond it for context.
  drawHedge(s, { position: [(from + to) / 2, 0, row2 - 0.5], length: to - from - 0.4, height: 1.1, depth: 0.7, seed: 12 })
  s.patch(from, back + 4.8, to, row2 - 1.3, 0.006, { fill: LA.paving, ink: LA.pavingInk })
  joints(s, from, back + 4.8, to, row2 - 1.3, 0.008, 0.9, 0.9)
  drawRetailParade(s, {
    position: [(from + to) / 2, 0, back + 4.8],
    width: to - from - 0.2,
    depth: 4.6,
    units: [{ fascia: LA.ink, lettering: LA.paper, awning: LA.red }, { fascia: LA.green, lettering: LA.paper, awning: LA.green }, { fascia: LA.paper, lettering: LA.ink, awning: null }],
    cafeTables: 0,
    roofPlant: false,
  })
}

/**
 * A surface car park from x `from` to `to`: two rows of marked bays (two
 * for electric charging), parked cars, a slot drain along the front,
 * lighting, and a hedge with a small shopping parade behind.
 */
export function JourneyCarPark(props: CarParkProps) {
  return <Drawing name="car-park" props={props} draw={drawCarPark} />
}

interface ParkProps {
  profile: ProfilePoint[]
  from: number
  to: number
}

function drawPark(s: Sketch, { profile, from, to }: ParkProps) {
  // A footpath across the open space, with a bench, a bin and a walker.
  const pz = -7.6
  for (let x = from; x < to; x += 0.5) {
    const a = heightAt(profile, x) + 0.01
    const b = heightAt(profile, Math.min(to, x + 0.5)) + 0.01
    s.polygon([[x, a, pz + 0.8], [Math.min(to, x + 0.5), b, pz + 0.8], [Math.min(to, x + 0.5), b, pz - 0.8], [x, a, pz - 0.8]], { fill: '#f1ebdf', ink: null })
  }
  s.polyline(clipProfile(profile, from, to).map(([x, y]) => [x, y + 0.012, pz + 0.8] as Vec3), LA.timberInk, 'fine')
  s.polyline(clipProfile(profile, from, to).map(([x, y]) => [x, y + 0.012, pz - 0.8] as Vec3), LA.timberInk, 'fine')
  const bx = from + (to - from) * 0.42
  drawBench(s, { position: [bx, heightAt(profile, bx), pz - 1.3] })
  drawLitterBin(s, { position: [bx + 1.6, heightAt(profile, bx + 1.6), pz - 1.2] })
  const px = from + (to - from) * 0.7
  drawPerson(s, { position: [px, heightAt(profile, px), pz], pose: 'walk', shirt: LA.shirtGreen, flip: true })
}

/** Open space over the storage: a footpath with a bench, a bin and a walker, following the ground. */
export function JourneyPark(props: ParkProps) {
  return <Drawing name="park" props={props} draw={drawPark} />
}

/** Trees at [x, z] spots on flat ground, plus any others given in full; one instanced draw for all. */
const NO_TREES: TreeSpec[] = []

export function JourneyTrees({ spots, extra = NO_TREES }: { spots: [number, number][]; extra?: TreeSpec[] }) {
  const trees = useMemo(
    () => [
      ...spots.map(([x, z], i): TreeSpec => ({ position: [x, 0.02, z], kind: i % 4 === 3 ? 'broadleaf' : 'poplar', height: i % 4 === 3 ? 5.6 : 7 })),
      ...extra,
    ],
    [spots, extra],
  )
  return <Trees trees={trees} />
}

/** A single broadleaf tree at any height, for sloping ground and river banks; `height` scales it. */
export function JourneyTree({ position, height = 1 }: { position: Vec3; height?: number }) {
  const trees = useMemo((): TreeSpec[] => [{ position, kind: 'broadleaf', height: 6 * height }], [position, height])
  return <Trees trees={trees} />
}

interface CarProps {
  position: Vec3
  turn: number
  color?: string
}

/** A car, nose towards +x. */
export function JourneyCar({ position, turn = 0, color }: { position: Vec3; turn?: number; color?: string }) {
  return <Drawing<CarProps> name="car" props={{ position, turn, color }} draw={(s, p) => drawCar(s, { position: p.position, rotation: p.turn, color: p.color })} />
}

// ── covers on the section line ──────────────────────────────────────

export interface CoverSpec {
  x: number
  y: number
  /** Clear opening. */
  size: number
  shape?: 'round' | 'square'
}

function drawCovers(s: Sketch, { covers }: { covers: CoverSpec[] }) {
  for (const c of covers) drawManholeCover(s, { position: [c.x, c.y + 0.004, 0], size: c.size, shape: c.shape ?? 'round', cut: true })
}

/** Access covers over the products, cut in half on the section line like the Site Explorer's. */
export function JourneyCovers({ covers }: { covers: CoverSpec[] }) {
  return <Drawing name="covers" props={{ covers }} draw={drawCovers} />
}

// ── weather ─────────────────────────────────────────────────────────

const PUFFS: [number, number, number][] = [
  [-2.3, 0.05, 1.2],
  [-0.7, 0.6, 1.6],
  [1.2, 0.4, 1.45],
  [2.75, 0.0, 1.05],
]
const CLOUD_BASE = -0.6

/** The top of the union of the puffs at `a`, or null outside them. */
function cloudTop(a: number): number | null {
  let top: number | null = null
  for (const [cx, cy, r] of PUFFS) {
    const d = a - cx
    if (Math.abs(d) >= r) continue
    const y = cy + Math.sqrt(r * r - d * d)
    if (top === null || y > top) top = y
  }
  return top !== null && top > CLOUD_BASE ? top : null
}

function drawCloud(s: Sketch, { position, scale }: { position: Vec3; scale: number }) {
  const pts: Vec2[] = []
  const a0 = Math.min(...PUFFS.map(([cx, , r]) => cx - r))
  const a1 = Math.max(...PUFFS.map(([cx, , r]) => cx + r))
  const steps = 90
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps
    const t = cloudTop(a)
    if (t !== null) pts.push([a * scale, t * scale])
  }
  const left = pts[0][0]
  const right = pts[pts.length - 1][0]
  const outline: Vec2[] = [[left, CLOUD_BASE * scale], ...pts, [right, CLOUD_BASE * scale]]
  s.billboard(position, outline, { fill: LA.paper, ink: LA.ink, weight: 'bold' })
  // A cool underside and the inner scallops where the puffs overlap.
  s.billboard(position, [[left + 0.25 * scale, CLOUD_BASE * scale], [right - 0.25 * scale, CLOUD_BASE * scale], [right - 0.6 * scale, (CLOUD_BASE + 0.28) * scale], [left + 0.6 * scale, (CLOUD_BASE + 0.28) * scale]], { fill: '#e8f3fa', ink: null }, 1)
  for (const [cx, cy, r] of PUFFS.slice(1)) {
    const arcPts: Vec2[] = []
    for (let k = 0; k <= 12; k++) {
      const t = Math.PI * (0.62 + 0.3 * (k / 12))
      const a = cx + Math.cos(t) * r * 0.98
      const b = cy + Math.sin(t) * r * 0.98
      if (b > CLOUD_BASE + 0.15) arcPts.push([a * scale, b * scale])
    }
    if (arcPts.length > 1) s.billboard(position, [...arcPts, ...[...arcPts].reverse()], { fill: null, ink: LA.inkSoft, weight: 'line' }, 2)
  }
}

/** A line-art cloud: one flat-bottomed outline in site blue, turned to the viewer. */
export function JourneyCloud({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return <Drawing name="cloud" props={{ position, scale }} draw={drawCloud} />
}

function random(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/**
 * Rain falling from `top` to `bottom` over a patch `size` wide (x) and
 * deep (z), as short site-blue streaks. Still under reduced motion.
 */
export function JourneyRain({ centre, size, top, bottom, animate }: {
  centre: [number, number]
  size: [number, number]
  top: number
  bottom: number
  animate: boolean
}) {
  const count = 170
  const ref = useRef<THREE.LineSegments>(null)
  const seeds = useMemo(() => {
    const rand = random(5)
    return Array.from({ length: count }, () => ({
      x: centre[0] + (rand() - 0.5) * size[0],
      z: centre[1] + (rand() - 0.5) * size[1],
      phase: rand(),
      speed: 0.8 + rand() * 0.4,
      length: 0.3 + rand() * 0.25,
    }))
  }, [centre, size])
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(count * 6), 3))
    return g
  }, [])
  const time = useRef(0)
  const place = (t: number) => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const span = top - bottom
    seeds.forEach((s, i) => {
      const y = top - (((s.phase + t * s.speed * 0.9) % 1) * span)
      attr.setXYZ(i * 2, s.x, y, s.z)
      attr.setXYZ(i * 2 + 1, s.x - 0.05, y - s.length, s.z)
    })
    attr.needsUpdate = true
    geometry.computeBoundingSphere()
  }
  useLayoutEffect(() => {
    place(0)
  })
  useFrame((_, dt) => {
    if (!animate) return
    time.current += Math.min(dt, 0.1)
    place(time.current)
  })
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={LA.ink} transparent opacity={0.75} />
    </lineSegments>
  )
}

// ── the river ───────────────────────────────────────────────────────

/** The part of the profile below `level`, closed along the water line. */
function waterOutline(profile: ProfilePoint[], level: number): ProfilePoint[] {
  const pts: ProfilePoint[] = []
  for (let i = 1; i < profile.length; i++) {
    const [ax, ay] = profile[i - 1]
    const [bx, by] = profile[i]
    if (ay < level) pts.push([ax, ay])
    if ((ay < level) !== (by < level)) {
      const t = (level - ay) / (by - ay)
      pts.push([ax + (bx - ax) * t, level])
    }
  }
  return pts
}

interface RiverProps {
  profile: ProfilePoint[]
  level: number
  back: number
}

function drawRiver(s: Sketch, { profile, level, back }: RiverProps) {
  const water = waterOutline(profile, level)
  if (water.length < 3) return
  const xs = water.map(([x]) => x)
  const left = Math.min(...xs)
  const right = Math.max(...xs)
  // The water cut in section, with a few current lines.
  s.polygon(water.map(([x, y]) => [x, y, 0.002] as Vec3), { fill: '#bfe3f5', ink: LA.glassInk, weight: 'line', shade: false })
  const depth = level - Math.min(...water.map(([, y]) => y))
  for (const f of [0.3, 0.6]) {
    const y = level - depth * f
    for (let x = left + 0.5 + f; x < right - 0.8; x += 1.6) s.polyline([[x, y, 0.004], [x + 0.3, y + 0.05, 0.004], [x + 0.6, y, 0.004]], LA.glassInk, 'fine')
  }
  // Water's edge along both banks.
  s.line([left, level + 0.01, 0], [left, level + 0.01, back], LA.glassInk, 'line')
  s.line([right, level + 0.01, 0], [right, level + 0.01, back], LA.glassInk, 'line')
  // Reeds in clumps along both edges, and stones at the foot of the far bank.
  const rand = seeded(3)
  const blade = (x: number, y: number, z: number, h: number) => {
    const lean = (rand() - 0.5) * 0.3
    s.line([x, y, z], [x + lean, y + h, z + (rand() - 0.5) * 0.1], LA.greenDark, 'line')
  }
  for (let z = -1.0; z > back + 1.5; z -= 1.6 + rand() * 1.8) {
    for (const x of [left + 0.35 + rand() * 0.3, right - 0.45 - rand() * 0.4]) {
      for (let k = 0; k < 6; k++) blade(x + (k - 2.5) * 0.07, level, z + (rand() - 0.5) * 0.35, 0.5 + rand() * 0.55)
      if (rand() > 0.4) s.block([x + 0.05, level + 0.95, z], [0.06, 0.2, 0.06], { fill: LA.trunk, ink: LA.timberInk, weight: 'fine' })
    }
  }
  for (let z = -0.4; z > back + 0.5; z -= 0.45 + rand() * 0.5) {
    const x = right + 0.1 + rand() * 0.8
    s.disc([x, heightAt(profile, x) + 0.06, z], 0.1 + rand() * 0.1, { fill: rand() > 0.5 ? '#dfe6eb' : '#e9eef2', ink: LA.metalDark, weight: 'fine' }, 8)
  }
  // A timber footbridge across the river, well back from the section.
  const bz = back + 6.5
  const deck = heightAt(profile, left - 0.8) + 0.3
  const bx0 = left - 1.4
  const bx1 = right + 4.2
  const end = heightAt(profile, bx1) + 0.3
  s.frame({ position: [0, 0, bz] }, () => {
    // Abutments on each bank.
    s.box([bx0 - 0.2, heightAt(profile, bx0) - 0.1, -1.1], [bx0 + 0.6, deck - 0.2, 1.1], { fill: LA.concrete, ink: LA.ink, weight: 'fine' })
    s.box([bx1 - 0.6, heightAt(profile, bx1) - 0.1, -1.1], [bx1 + 0.2, end - 0.2, 1.1], { fill: LA.concrete, ink: LA.ink, weight: 'fine' })
    s.prism([[bx0, deck - 0.25], [bx1, end - 0.25], [bx1, end], [bx0, deck]], -0.9, 0.9, { fill: LA.timber, ink: LA.timberInk })
    for (let x = bx0 + 0.3; x < bx1; x += 0.3) {
      const y = deck + ((x - bx0) / (bx1 - bx0)) * (end - deck) + 0.002
      s.line([x, y, -0.9], [x, y, 0.9], LA.timberInk, 'fine')
    }
    for (const side of [-0.85, 0.85]) {
      const posts = 12
      for (let k = 0; k <= posts; k++) {
        const x = bx0 + ((bx1 - bx0) * k) / posts
        const y = deck + ((x - bx0) / (bx1 - bx0)) * (end - deck)
        s.line([x, y, side], [x, y + 1.0, side], LA.timberInk, 'line')
      }
      s.line([bx0, deck + 1.0, side], [bx1, end + 1.0, side], LA.timberInk, 'line')
      s.line([bx0, deck + 0.5, side], [bx1, end + 0.5, side], LA.timberInk, 'fine')
    }
  })
}

/**
 * The river running across the site (along z) in the channel the ground
 * profile cuts, filled to `level`: a cut water section at the front, a
 * flowing surface, reeds and stones along the banks and a footbridge.
 */
export function JourneyRiver({ profile, level, back }: RiverProps) {
  const span = useMemo(() => {
    const xs = waterOutline(profile, level).map(([x]) => x)
    return xs.length ? ([Math.min(...xs), Math.max(...xs)] as [number, number]) : null
  }, [profile, level])
  const flow = useWaterMaterial(26)
  return (
    <group>
      <Drawing name="river" props={{ profile, level, back }} draw={drawRiver} />
      {span ? (
        /* The surface, streaking downstream (towards -z). */
        <group position={[(span[0] + span[1]) / 2, level + 0.006, back / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]} material={flow}>
            <planeGeometry args={[-back, span[1] - span[0]]} />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}

interface HeadwallProps {
  x: number
  top: number
  bottom: number
  outlet: Vec3 | null
}

function drawHeadwall(s: Sketch, { x, top, bottom, outlet }: HeadwallProps) {
  const concrete = { fill: '#eef2f5', ink: LA.ink } as const
  const z0 = -2.5
  const z1 = 0.55
  // The wall, its coping, and board marks on the river face.
  s.box([x - 0.45, bottom - 0.3, z0], [x + 0.1, top, z1], concrete)
  s.box([x - 0.55, top, z0 - 0.1], [x + 0.2, top + 0.16, z1 + 0.05], { ...concrete, weight: 'fine' })
  for (let y = bottom + 0.3; y < top - 0.1; y += 0.3) s.line([x + 0.102, y, z0], [x + 0.102, y, z1], LA.pavingInk, 'fine')
  // A splayed wingwall back along the bank, its top falling to the bed.
  s.frame({ position: [x + 0.1, 0, z0], rotation: 1.0 }, () => {
    s.prism([[0, bottom - 0.3], [1.7, bottom - 0.3], [1.7, bottom + 0.55], [0, top]], 0, 0.3, concrete)
    s.prism([[0, top], [1.7, bottom + 0.55], [1.7, bottom + 0.7], [0, top + 0.14]], -0.04, 0.34, { ...concrete, weight: 'fine' })
  })
  // Apron and toe wall on the bed, where the outfall lands.
  s.box([x + 0.1, bottom - 0.1, z0 - 0.4], [x + 1.7, bottom + 0.08, z1], concrete)
  s.box([x + 1.55, bottom - 0.3, z0 - 0.4], [x + 1.75, bottom + 0.14, z1], { ...concrete, weight: 'fine' })
  // A flap valve on the outfall and a guard rail along the top.
  if (outlet) {
    const [ox, oy, oz] = outlet
    s.cylinder([ox, oy, oz], 0.19, 0.05, { axis: 'x', fill: LA.metal, ink: LA.inkDark, segments: 16 })
    s.block([ox + 0.03, oy + 0.22, oz], [0.08, 0.06, 0.24], { fill: LA.metalDark, ink: LA.inkDark, weight: 'fine' })
  }
  railing(s, [[x - 0.25, z1 - 0.05], [x - 0.25, z0 - 0.05]], top + 0.16, 1.1, 1.0)
}

/**
 * A concrete outfall headwall on the river bank at `x`: the wall from the
 * river bed up to `top` with its coping and guard rail, a splayed wingwall
 * back along the bank, an apron and toe wall on the bed, and a flap valve
 * on the outfall at `outlet`.
 */
export function JourneyHeadwall({ x, top, bottom, outlet = null }: { x: number; top: number; bottom: number; outlet?: Vec3 | null }) {
  return <Drawing name="headwall" props={{ x, top, bottom, outlet }} draw={drawHeadwall} />
}
