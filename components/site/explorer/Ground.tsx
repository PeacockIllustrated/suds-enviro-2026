'use client'

import { useMemo } from 'react'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { ART, InkSlab, LINE } from './lineArt'
import { GROUND_DEPTH, STRIP, STRIP_BACK } from './explorerLayout'

/**
 * The ground slab under the whole strip, cut open along z = 0: a charcoal
 * surfacing layer over three bands of soil. The top of the surfacing is
 * the pale site surface the buildings stand on.
 */

const SURFACING = 0.35
const BANDS = [1.0, 2.4] as const

function Layer({ top, bottom, color, ink, topColor }: { top: number; bottom: number; color: string; ink: string; topColor?: string }) {
  const [x0, x1] = STRIP
  const materials = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
    const up = topColor
      ? new THREE.MeshBasicMaterial({ color: topColor, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
      : side
    // Box face order: +x, -x, +y, -y, +z, -z.
    return [side, side, up, side, side, side]
  }, [color, topColor])
  return (
    <mesh position={[(x0 + x1) / 2, (top + bottom) / 2, STRIP_BACK / 2]} material={materials}>
      <boxGeometry args={[x1 - x0, top - bottom, -STRIP_BACK]} />
      <Edges color={ink} lineWidth={LINE} threshold={20} />
    </mesh>
  )
}

/** Pebbles and roots in the section face, so the soil reads as soil. */
function SoilSpecks() {
  const geometry = useMemo(() => {
    const pos: number[] = []
    const [x0, x1] = STRIP
    let seed = 7
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 420; i++) {
      const x = x0 + 0.4 + rand() * (x1 - x0 - 0.8)
      const y = -SURFACING - 0.3 - rand() * (GROUND_DEPTH - SURFACING - 0.6)
      const w = 0.12 + rand() * 0.22
      const h = w * (0.45 + rand() * 0.3)
      pos.push(x - w / 2, y, 0.004, x + w / 2, y, 0.004, x, y + h, 0.004)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={ART.soilInk} transparent opacity={0.35} />
    </mesh>
  )
}

export function Ground() {
  const top = 0
  const s1 = -SURFACING
  const s2 = s1 - BANDS[0]
  const s3 = s2 - BANDS[1]
  return (
    <group>
      <Layer top={top} bottom={s1} color={ART.asphalt} ink={ART.asphaltInk} topColor={ART.ground} />
      <Layer top={s1} bottom={s2} color={ART.soil[0]} ink={ART.soilInk} />
      <Layer top={s2} bottom={s3} color={ART.soil[1]} ink={ART.soilInk} />
      <Layer top={s3} bottom={-GROUND_DEPTH} color={ART.soil[2]} ink={ART.soilInk} />
      <SoilSpecks />
      {/* Grass verges between the plots, where the poplars stand. */}
      {[16, 46.5, 75.2].map((x) => (
        <InkSlab key={x} from={[x - 1.3, 0, -21.8]} to={[x + 1.3, 0.04, -0.8]} color={ART.grass} ink={ART.grassInk} />
      ))}
      <InkSlab from={[STRIP[0] + 0.3, 0, -22.7]} to={[STRIP[1] - 0.3, 0.04, -19.8]} color={ART.grass} ink={ART.grassInk} />
    </group>
  )
}
