'use client'

import { useMemo } from 'react'
import {
  JourneyCarPark,
  JourneyCloud,
  JourneyCovers,
  JourneyDrive,
  JourneyGarden,
  JourneyGround,
  JourneyHeadwall,
  JourneyHouse,
  JourneyPark,
  JourneyRain,
  JourneyRiver,
  JourneyRoad,
  JourneyTrees,
  type CoverSpec,
} from './scenery'
import {
  BACK,
  CAR_PARK,
  CHAMBER,
  FITS,
  GROUND_DEPTH,
  HOUSE_AT,
  HOUSE_DOWNPIPE,
  OUTFALL,
  PROFILE,
  PRODUCT_STOPS,
  RIVER,
  ROAD,
  STOP_SCENES,
  S,
  SURFACES,
  TANK,
  CRATES,
  groundAt,
  type StopId,
} from './journeyWorld'
import type { TreeSpec } from '@/components/site/lineart/Trees'
import { JourneyPipes } from './JourneyPipes'
import { Crates, Dimension, GullyPot, JourneyProduct, RainTank } from './JourneyProducts'
import type { JourneyMotionState } from './journeyFraming'

/**
 * The whole section the water journey travels along: scenery (all of it
 * from ./scenery), the drainage run and the products. Only the products
 * near the reader load their models at first; the rest follow once the
 * page has settled.
 */

const TREE_SPOTS: [number, number][] = [
  [-9.5, -3], [-9.2, -9.5], [-8.8, -15], [5.6, -12], [8.8, -15.5],
  [-23, -9], [-22.5, -3.5], [-14.5, -14], [-19, -17], [-24, -15],
  [26.2, -5], [26.6, -10], [26.4, -15], [27, -20],
  [13, -19], [9.8, -21],
]

const SLOPE_TREES: { x: number; z: number; h: number; poplar?: boolean }[] = [
  { x: 44, z: -5, h: 1.05 },
  { x: 47.5, z: -9, h: 0.9 },
  { x: 51, z: -4.5, h: 1.1 },
  { x: 54.5, z: -11, h: 0.95 },
  { x: 49, z: -15, h: 1 },
  { x: 71.5, z: -3.5, h: 1.1 },
  { x: 73.8, z: -8, h: 0.95 },
  { x: 71, z: -13, h: 1.05 },
  { x: 74.5, z: -17, h: 0.9 },
  { x: 77.5, z: -5.5, h: 1 },
  { x: 79.5, z: -12, h: 1.1 },
  { x: 44.5, z: -17, h: 1.2, poplar: true },
  { x: 57, z: -16, h: 1.1, poplar: true },
  { x: 76, z: -20, h: 1.15, poplar: true },
]

const SLOPE_TREE_SPECS: TreeSpec[] = SLOPE_TREES.map((t) => ({
  position: [t.x, groundAt(t.x), t.z],
  kind: t.poplar ? 'poplar' : 'broadleaf',
  height: (t.poplar ? 7 : 6) * t.h,
}))

/**
 * Access covers on the section line over what is centred on it: the
 * chamber and the tank's neck. The catchpit, separator and flow control
 * rise to the surface in risers (the first two forward of the cut), which
 * carry their own lids.
 */
const COVERS: CoverSpec[] = [
  { x: CHAMBER.x, y: groundAt(CHAMBER.x), size: FITS.chamber.radiusMm * S * 2 + 0.05 },
  { x: TANK.x, y: groundAt(TANK.x), size: TANK.neck * 2 + 0.1, shape: 'square' },
]

export interface JourneyWorldProps {
  motionRef: { current: JourneyMotionState }
  stops: StopId[]
  active: number
  revealed: boolean
  animate: boolean
  /** Load every model, not just those near the active stop. */
  loadAll: boolean
}

export function JourneyWorld({ motionRef, stops, active, revealed, animate, loadAll }: JourneyWorldProps) {
  const activeId = stops[active]
  const scene = STOP_SCENES[activeId]
  const near = useMemo(() => {
    const out = new Set<StopId>()
    for (let d = -1; d <= 1; d++) {
      const id = stops[active + d]
      if (id) out.add(id)
    }
    return out
  }, [stops, active])

  return (
    <group>
      <JourneyGround profile={PROFILE} surfaces={SURFACES} depth={GROUND_DEPTH} back={BACK} />

      {/* Rain on the house, from the cloud over it. */}
      <JourneyCloud position={[-1.2, 11.3, -1.2]} scale={1.45} />
      <JourneyCloud position={[71, 8.5, -12]} scale={0.8} />
      <JourneyRain centre={[-1.2, 0.1]} size={[10.5, 2]} top={10.3} bottom={0.5} animate={animate} />

      <JourneyHouse position={HOUSE_AT} downpipe={HOUSE_DOWNPIPE} />
      {/* The neighbours, so the street carries on out of frame. */}
      <JourneyHouse position={[HOUSE_AT[0] - 13.5, 0, HOUSE_AT[2] - 1.5]} garage={false} />
      <JourneyGarden from={HOUSE_AT[0] + 10} to={10.2} back={-14} />
      <JourneyDrive from={10.2} to={16.4} />
      <JourneyRoad from={ROAD.from} to={ROAD.to} back={BACK} gullyX={ROAD.gullyX} />
      <JourneyCarPark from={CAR_PARK.from} to={CAR_PARK.to} back={BACK} />
      <JourneyPark profile={PROFILE} from={CRATES.from - 1.5} to={RIVER.headwallX - 1} />
      <JourneyTrees spots={TREE_SPOTS} extra={SLOPE_TREE_SPECS} />
      <JourneyRiver profile={PROFILE} level={RIVER.level} back={BACK} />
      <JourneyHeadwall x={RIVER.headwallX} top={groundAt(RIVER.headwallX - 0.8) + 0.2} bottom={RIVER.bed} outlet={OUTFALL} />
      <JourneyCovers covers={COVERS} />

      <JourneyPipes motionRef={motionRef} />
      <GullyPot />
      <RainTank motionRef={motionRef} />
      <Crates motionRef={motionRef} />
      {PRODUCT_STOPS.map(({ stop, place }) => (
        <JourneyProduct
          key={stop}
          place={place}
          revealed={revealed && stop === activeId}
          animate={animate}
          load={loadAll || near.has(stop)}
        />
      ))}
      <Dimension key={activeId} scene={scene} />
    </group>
  )
}
