'use client'

import { drawBollard } from '@/components/site/lineart/Bollard'
import { drawCar } from '@/components/site/lineart/Car'
import { drawDetachedHouse, type DetachedHouseProps } from '@/components/site/lineart/DetachedHouse'
import { joints } from '@/components/site/lineart/details'
import { drawDownpipe } from '@/components/site/lineart/Downpipe'
import { drawEVCharger } from '@/components/site/lineart/EVCharger'
import { drawFence } from '@/components/site/lineart/Fence'
import { drawGully } from '@/components/site/lineart/Gully'
import { drawHedge } from '@/components/site/lineart/Hedge'
import { LineArt } from '@/components/site/lineart/LineArt'
import { LogoPanel } from '@/components/site/lineart/LogoPanel'
import { drawManholeCover } from '@/components/site/lineart/ManholeCover'
import { cachedSketch } from '@/components/site/lineart/materials'
import { drawMultiStoreyCarPark, type MultiStoreyCarParkProps } from '@/components/site/lineart/MultiStoreyCarPark'
import { drawOfficeBuilding, officeSignCentre, type OfficeBuildingProps } from '@/components/site/lineart/OfficeBuilding'
import { LA } from '@/components/site/lineart/palette'
import { drawParkingBays } from '@/components/site/lineart/ParkingBays'
import { drawPerson } from '@/components/site/lineart/Person'
import { drawRetailParade, type RetailParadeProps } from '@/components/site/lineart/RetailParade'
import type { Sketch } from '@/components/site/lineart/sketch'
import { drawStreetLamp } from '@/components/site/lineart/StreetLamp'
import { Trees, type TreeSpec } from '@/components/site/lineart/Trees'
import { drawVan } from '@/components/site/lineart/Van'
import { selectHandlers } from './lineArt'
import { BACK_KITCHEN, PLOTS, STRIP, type Box3Spec, type PipeRun } from './explorerLayout'

/**
 * The scenery on each plot, drawn with the line-art kit
 * (components/site/lineart): buildings, vehicles, street furniture and the
 * surface details over the drainage (covers, gullies, channels). Each plot
 * is one Sketch, so a whole plot costs four draw calls however much it
 * carries; the trees are instanced across the whole strip.
 *
 * Positions are in the explorer's metres (see explorerLayout.ts): ground
 * at y = 0, the section cut at z = 0, buildings behind it.
 */

type OnSelect = () => void

/** Rainwater pipe runs that come down a wall: where their fittings (hopper, brackets, gully at the foot) go. */
function downpipesOf(runs: PipeRun[]) {
  return runs
    .filter((r) => r.stream === 'surface' && r.points[0][1] > 1)
    .map((r) => ({ x: r.points[0][0], z: r.points[0][2], top: r.points[0][1] }))
}

function fittings(s: Sketch, plotId: string) {
  const plot = PLOTS.find((p) => p.id === plotId)
  if (!plot) return
  for (const d of downpipesOf(plot.pipes)) drawDownpipe(s, { position: [d.x, 0, d.z], top: d.top, radius: 0.12 })
}

/**
 * Access covers on the section line over the chambers finished at the
 * surface. Deeper products bring their own riser, cover and frame up to
 * the surface (Products.tsx); housings and the drawpit carry their own.
 */
function covers(s: Sketch, plotId: string) {
  const plot = PLOTS.find((p) => p.id === plotId)
  if (!plot) return
  for (const p of plot.products) {
    if (p.model === 'chamber') drawManholeCover(s, { position: [p.x, 0, 0], size: 0.9, cut: true })
  }
}

// ── office ──────────────────────────────────────────────────────────

const OFFICE: OfficeBuildingProps = { position: [-3, 0, -7] }

function drawOfficePlot(s: Sketch) {
  drawOfficeBuilding(s, OFFICE)
  // Footway along the frontage, kerbed off from the service yard.
  s.patch(-14.8, -7, 8.2, -5.3, 0.006, { fill: LA.paving, ink: LA.pavingInk })
  joints(s, -14.8, -7, 8.2, -5.3, 0.008, 0.9, 0.85)
  s.patch(-14.8, -5.3, 8.2, -5.12, 0.02, { fill: LA.concrete, ink: LA.ink, weight: 'fine' })
  // Loading bays for the vans, and the yard's surface.
  s.patch(-14.8, -5.12, 14.2, -0.35, 0.004, { fill: '#e9edf0', ink: null })
  for (const [x0, x1] of [[-13.1, -6.5], [1.9, 8.5]]) {
    s.polyline([[x0, 0.008, -3.9], [x1, 0.008, -3.9], [x1, 0.008, -0.8], [x0, 0.008, -0.8]], LA.ink, 'line', true)
    for (let x = x0 + 0.6; x < x1; x += 0.6) s.line([x, 0.008, -3.9], [x - 0.5, 0.008, -3.4], LA.inkSoft, 'fine')
  }
  drawVan(s, { position: [-9.8, 0, -2.3] })
  drawVan(s, { position: [5.2, 0, -2.4], rotation: Math.PI })
  // Planters either side of the entrance, bollards along the kerb.
  for (const x of [-7.4, 1.4]) {
    s.box([x - 0.7, 0, -6.9], [x + 0.7, 0.55, -6.1], { fill: LA.concrete, ink: LA.ink })
    drawHedge(s, { position: [x, 0.55, -6.15], length: 1.3, height: 0.5, depth: 0.7, seed: Math.round(x * 10) })
  }
  for (const x of [-12.5, -10.3, 8.9, 11.1, 13.3]) drawBollard(s, { position: [x, 0.02, -5.5] })
  drawStreetLamp(s, { position: [-14.2, 0, -5.8], rotation: 0 })
  drawStreetLamp(s, { position: [11.8, 0, -5.8], rotation: Math.PI })
  drawPerson(s, { position: [-4.2, 0, -3.1], pose: 'walk' })
  drawPerson(s, { position: [-1.6, 0, -2.4], shirt: LA.shirtGreen, flip: true })
  drawPerson(s, { position: [-0.9, 0, -2.6], shirt: LA.paper, trousers: LA.inkDark })
  // Yard gully by the loading bay, draining to the surface water carrier.
  drawGully(s, { position: [-6.9, 0, -1.2] })
  fittings(s, 'office')
  covers(s, 'office')
}

// ── car park ────────────────────────────────────────────────────────

const CAR_PARK: MultiStoreyCarParkProps = { position: [31, 0, -6.8], occupancy: 0.65, seed: 4 }

function drawCarParkPlot(s: Sketch) {
  drawMultiStoreyCarPark(s, CAR_PARK)
  s.patch(18, -6.8, 44.6, -0.35, 0.004, { fill: '#e9edf0', ink: null })
  drawParkingBays(s, { position: [24.8, 0, -1.2], count: 5, ev: [3, 4] })
  drawCar(s, { position: [26.05, 0, -3.6], rotation: Math.PI / 2 })
  drawCar(s, { position: [31.05, 0, -3.5], rotation: -Math.PI / 2, color: '#e7f1f8' })
  drawCar(s, { position: [33.55, 0, -3.6], rotation: Math.PI / 2, color: '#e9f4e6' })
  for (const x of [33.55, 36.05]) drawEVCharger(s, { position: [x + 0.9, 0, -6.35] })
  // Entry lane arrows up to the barrier.
  for (const z of [-1.8, -4.2]) s.polygon([[22.3, 0.008, z + 0.9], [22.7, 0.008, z + 0.9], [22.7, 0.008, z], [23.05, 0.008, z], [22.5, 0.008, z - 0.7], [21.95, 0.008, z], [22.3, 0.008, z]], { fill: LA.paper, ink: LA.ink, weight: 'fine', shade: false })
  // A slot channel across the bays' foot, falling to the gully that holds the RhinoPod.
  s.patch(21.7, -0.95, 42, -0.75, 0.01, { fill: LA.metal, ink: LA.ink, weight: 'fine' })
  s.line([21.7, 0.012, -0.85], [42, 0.012, -0.85], LA.metalDark, 'line')
  drawGully(s, { position: [21.2, 0, -0.85] })
  drawStreetLamp(s, { position: [19.2, 0, -6.2] })
  drawPerson(s, { position: [28.4, 0, -1.9], pose: 'walk', shirt: LA.shirtGreen })
  fittings(s, 'car-park')
  covers(s, 'car-park')
}

// ── retail ──────────────────────────────────────────────────────────

const RETAIL: RetailParadeProps = { position: [62, 0, -6] }

function drawRetailPlot(s: Sketch) {
  drawRetailParade(s, RETAIL)
  s.patch(48.2, -6, 73.8, -0.35, 0.006, { fill: LA.paving, ink: LA.pavingInk })
  joints(s, 48.2, -6, 73.8, -0.35, 0.008, 0.9, 0.9)
  drawStreetLamp(s, { position: [59.4, 0, -1.1], rotation: Math.PI / 2, double: true })
  for (const x of [49.6, 72.6]) drawBollard(s, { position: [x, 0, -0.9] })
  drawPerson(s, { position: [57.2, 0, -3.3], pose: 'walk' })
  drawPerson(s, { position: [62.4, 0, -2.2], shirt: LA.shirtGreen, flip: true, pose: 'walk' })
  drawPerson(s, { position: [66.9, 0, -3.9], shirt: LA.paper, trousers: LA.inkDark })
  drawGully(s, { position: [55.4, 0, -0.9] })
  drawBackKitchen(s)
  fittings(s, 'retail')
  covers(s, 'retail')
}

/**
 * The cafe's back kitchen, a single-storey room on the parade's gable,
 * drawn cut away (no roof, front and side walls cut low) so the
 * floor-standing grease trap shows on its floor, with the sink it serves.
 */
function drawBackKitchen(s: Sketch) {
  const { x0, x1, z0, z1, height } = BACK_KITCHEN
  const wall = 0.2
  const cut = 0.45
  s.box([x0, 0, z1], [x1, 0.02, z0], { fill: LA.concrete, ink: LA.ink })
  joints(s, x0 + wall, z1 + wall, x1 - wall, z0 - wall, 0.024, 0.4, 0.4)
  s.box([x0, 0, z1], [x1, height, z1 + wall], { fill: LA.paper, ink: LA.ink })
  s.box([x1 - wall, 0, z1 + wall], [x1, cut, z0], { fill: LA.paper, ink: LA.ink })
  s.box([x0, 0, z0 - wall], [x1 - wall, cut, z0], { fill: LA.paper, ink: LA.ink })
  // Stainless worktop and sink against the gable.
  s.box([x0, 0.02, z1 + wall], [x0 + 0.65, 0.95, z1 + wall + 0.95], { fill: LA.metal, ink: LA.ink })
  s.box([x0 + 0.12, 0.8, z1 + wall + 0.2], [x0 + 0.53, 0.955, z1 + wall + 0.75], { fill: LA.metalDark, ink: LA.ink, weight: 'fine' })
}

// ── house ───────────────────────────────────────────────────────────

const HOUSE: DetachedHouseProps = { position: [89, 0, -9], eaves: 6.0, rise: 2.9, downpipes: false, frontPath: 7.6 }

function drawHousePlot(s: Sketch) {
  drawDetachedHouse(s, HOUSE)
  // Back garden: lawn, fence, shed.
  s.patch(77.8, -19.2, 83.6, -3.2, 0.012, { fill: LA.grass, ink: LA.grassInk })
  drawFence(s, { points: [[77.9, -19.1], [77.9, -3.1], [83.5, -3.1]] })
  s.box([78.6, 0, -18.4], [81, 2.0, -16.2], { fill: LA.timber, ink: LA.timberInk })
  s.frame({ position: [0, 2.0, 0], rotation: Math.PI / 2 }, () => {
    s.prism([[16.05, 0], [18.55, 0], [17.3, 0.75]], 78.45, 81.15, { fill: LA.timber, ink: LA.timberInk })
  })
  for (let x = 78.75; x < 81; x += 0.15) s.line([x, 0, -16.195], [x, 2.0, -16.195], LA.timberInk, 'fine')
  s.rect(79.3, 0, 0.8, 1.7, -16.19, { fill: '#e7d6b8', ink: LA.timberInk, weight: 'fine' })
  // Front garden: lawns either side of the path, a hedge on the boundary.
  s.patch(84.2, -8.6, 88.1, -1.9, 0.012, { fill: LA.grass, ink: LA.grassInk })
  s.patch(89.9, -8.6, 93.9, -1.9, 0.012, { fill: LA.grass, ink: LA.grassInk })
  drawHedge(s, { position: [86.1, 0, -1.3], length: 3.9, height: 0.9, depth: 0.6, seed: 7 })
  drawHedge(s, { position: [91.95, 0, -1.3], length: 4.0, height: 0.9, depth: 0.6, seed: 9 })
  // Block-paved drive with the car on charge.
  s.patch(94.4, -12, 102.6, -0.6, 0.006, { fill: '#eceff1', ink: LA.ink })
  joints(s, 94.4, -12, 102.6, -0.6, 0.008, 0.6, 0.6)
  drawCar(s, { position: [100.4, 0, -5.4], rotation: Math.PI / 2, color: '#e7f1f8' })
  drawEVCharger(s, { position: [98.3, 0, -6.6], rotation: Math.PI / 2 })
  drawPerson(s, { position: [89.9, 0, -4.4], shirt: LA.shirtGreen })
  fittings(s, 'house')
  covers(s, 'house')
}

// ── trees ───────────────────────────────────────────────────────────

const TREES: TreeSpec[] = (() => {
  const out: TreeSpec[] = []
  for (let x = STRIP[0] + 1; x <= STRIP[1] - 1; x += 3.3) out.push({ position: [x, 0.04, -21.2] })
  ;[16, 46.5, 76.7].forEach((x) => {
    // Beside the cafe's back kitchen the verge is kept clear so the room shows.
    for (let z = -18.5; z <= -2.5; z += 3.2) if (x !== 76.7 || z < -11) out.push({ position: [x, 0.04, z] })
  })
  out.push(
    { position: [-14.3, 0, -3.2], kind: 'broadleaf', height: 5.5 },
    { position: [80.9, 0.012, -11.2], kind: 'broadleaf', height: 6 },
    { position: [44.3, 0, -3.4], kind: 'broadleaf', height: 5.2 },
  )
  return out
})()

// ── plots ───────────────────────────────────────────────────────────

function HitBox({ box, onSelect }: { box: Box3Spec; onSelect: OnSelect }) {
  const [x0, y0, z0] = box.min
  const [x1, y1, z1] = box.max
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]} {...selectHandlers(onSelect)}>
      <boxGeometry args={[x1 - x0, y1 - y0, z1 - z0]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

const DRAWINGS: Record<string, (s: Sketch) => void> = {
  office: drawOfficePlot,
  'car-park': drawCarParkPlot,
  retail: drawRetailPlot,
  house: drawHousePlot,
}

/** The buildings' clickable volumes, which select their plot. */
const HITS: Record<string, Box3Spec> = {
  office: { min: [-12.2, 0, -18.2], max: [6.4, 14, -3.7] },
  'car-park': { min: [20.9, 0, -19.2], max: [44, 11.9, -6.8] },
  retail: { min: [51, 0, -16], max: [73, 7.6, -4.4] },
  house: { min: [84, 0, -17.4], max: [97.3, 9.9, -8.6] },
}

export function Scenery({ onSelectPlot }: { onSelectPlot: (id: string) => void }) {
  const sign = officeSignCentre(OFFICE)
  return (
    <group>
      {Object.entries(DRAWINGS).map(([id, draw]) => (
        <group key={id}>
          <LineArt drawing={cachedSketch(`explorer-${id}`, draw)} />
          <HitBox box={HITS[id]} onSelect={() => onSelectPlot(id)} />
        </group>
      ))}
      <LogoPanel position={[-3 + sign[0], sign[1], -7 + sign[2]]} width={8.4} />
      <Trees trees={TREES} />
    </group>
  )
}
