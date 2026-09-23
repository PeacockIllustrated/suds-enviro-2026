'use client'

import { useMemo } from 'react'
import {
  JourneyCarPark,
  JourneyCloud,
  JourneyDrive,
  JourneyGarden,
  JourneyGround,
  JourneyHeadwall,
  JourneyHouse,
  JourneyRain,
  JourneyRiver,
  JourneyRoad,
  JourneyTree,
  JourneyTrees,
} from './scenery'
import {
  BACK,
  CAR_PARK,
  GROUND_DEPTH,
  HOUSE_AT,
  PROFILE,
  PRODUCT_STOPS,
  RIVER,
  ROAD,
  STOP_SCENES,
  SURFACES,
  groundAt,
  type StopId,
} from './journeyWorld'
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
  [30, -21.5], [33.5, -21.5], [37, -21.5], [40.5, -21.5],
  [13, -19], [9.8, -21],
]

const SLOPE_TREES: { x: number; z: number; h: number }[] = [
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
      <JourneyCloud position={[-1.6, 11.2, -3.4]} />
      <JourneyRain centre={[-1.4, -2.8]} size={[9, 3.6]} top={10.4} bottom={2.2} animate={animate} />

      <JourneyHouse position={HOUSE_AT} />
      {/* The neighbours, so the street carries on out of frame. */}
      <JourneyHouse position={[HOUSE_AT[0] - 13.5, 0, HOUSE_AT[2] - 1.5]} />
      <JourneyGarden from={HOUSE_AT[0] + 10} to={10.2} back={-14} />
      <JourneyDrive from={10.2} to={16.4} />
      <JourneyRoad from={ROAD.from} to={ROAD.to} back={BACK} gullyX={ROAD.gullyX} />
      <JourneyCarPark from={CAR_PARK.from} to={CAR_PARK.to} back={BACK} />
      <JourneyTrees spots={TREE_SPOTS} />
      {SLOPE_TREES.map((t) => (
        <JourneyTree key={`${t.x}-${t.z}`} position={[t.x, groundAt(t.x), t.z]} height={t.h} />
      ))}
      <JourneyRiver profile={PROFILE} level={RIVER.level} back={BACK} />
      <JourneyHeadwall x={RIVER.headwallX} top={groundAt(RIVER.headwallX - 0.8) + 0.2} bottom={RIVER.bed} />

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
