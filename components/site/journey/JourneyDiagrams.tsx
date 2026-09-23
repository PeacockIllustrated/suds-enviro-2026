'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { InkOutlines, TOON, toonRamp, useWaterMaterial } from '../three/toon'

/**
 * Stand-ins for the stops that have no product model in the 3D library
 * (rainwater harvesting tanks and attenuation storage). They are drawn on
 * purpose as diagrams, not products: a pale blueprint shell with a fine
 * grid, dashed edges and the water level showing inside, so nobody takes
 * them for the real thing. The page labels them as diagrams as well.
 */

const SHELL = '#dff0f9'
const LINE = '#1d6f9e'

let gridTexture: THREE.DataTexture | null = null
/** A fine blueprint grid, generated once. */
function blueprintGrid(): THREE.DataTexture {
  if (gridTexture) return gridTexture
  const n = 32
  const data = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const line = x === 0 || y === 0
      const v = line ? [168, 208, 232, 255] : [236, 247, 252, 255]
      data.set(v, (y * n + x) * 4)
    }
  }
  gridTexture = new THREE.DataTexture(data, n, n, THREE.RGBAFormat)
  gridTexture.wrapS = THREE.RepeatWrapping
  gridTexture.wrapT = THREE.RepeatWrapping
  gridTexture.magFilter = THREE.NearestFilter
  gridTexture.needsUpdate = true
  return gridTexture
}

/** Dashed edges for a geometry, as one line object. */
function useDashedEdges(geometry: THREE.BufferGeometry, dash: number, threshold = 20) {
  return useMemo(() => {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, threshold),
      new THREE.LineDashedMaterial({ color: LINE, dashSize: dash, gapSize: dash * 0.7 }),
    )
    edges.computeLineDistances()
    return edges
  }, [geometry, dash, threshold])
}

function Shell({ geometry, repeat, dash }: { geometry: THREE.BufferGeometry; repeat: number; dash: number }) {
  const edges = useDashedEdges(geometry, dash)
  const material = useMemo(() => {
    const map = blueprintGrid().clone()
    map.repeat.set(repeat, repeat)
    map.needsUpdate = true
    return new THREE.MeshBasicMaterial({ color: SHELL, map, transparent: true, opacity: 0.55, depthWrite: false })
  }, [repeat])
  return (
    <>
      <mesh geometry={geometry} material={material} renderOrder={3} />
      <primitive object={edges} />
    </>
  )
}

/**
 * A below-ground rainwater tank: a rounded body with an access neck and
 * lid, the roof pipe coming in near the top and water inside. Unit size:
 * about 2 across and 2.2 tall, base at y = -1.
 */
export function DiagramTank() {
  const water = useWaterMaterial(6)
  const body = useMemo(() => {
    const profile: THREE.Vector2[] = []
    for (let i = 0; i <= 24; i++) {
      const a = -Math.PI / 2 + (i / 24) * Math.PI
      profile.push(new THREE.Vector2(Math.cos(a) * 1.0 * (1 + 0.08 * Math.cos(a * 2)), Math.sin(a) * 0.9))
    }
    return new THREE.LatheGeometry(profile, 32)
  }, [])
  const neck = useMemo(() => new THREE.CylinderGeometry(0.34, 0.4, 0.5, 24, 1, true), [])
  const fill = useMemo(() => {
    const profile: THREE.Vector2[] = []
    for (let i = 0; i <= 12; i++) {
      const a = -Math.PI / 2 + (i / 12) * (Math.PI * 0.55)
      profile.push(new THREE.Vector2(Math.cos(a) * 0.92, Math.sin(a) * 0.82))
    }
    profile.push(new THREE.Vector2(0, profile[profile.length - 1].y))
    return new THREE.LatheGeometry(profile, 32)
  }, [])
  return (
    <group>
      <mesh geometry={fill} material={water} />
      <Shell geometry={body} repeat={4} dash={0.08} />
      <group position={[0, 1.05, 0]}>
        <Shell geometry={neck} repeat={2} dash={0.06} />
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
          <meshToonMaterial color="#2f6f3a" gradientMap={toonRamp()} />
          <InkOutlines thickness={1.6} color="#1f4a27" angle={Math.PI / 5} />
        </mesh>
      </group>
      {/* Inlet from the roof, and the overflow on to the drains. */}
      <mesh position={[-1.05, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 14]} />
        <meshToonMaterial color={TOON.body} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.6} color={TOON.ink} angle={Math.PI / 5} />
      </mesh>
      <mesh position={[1.05, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 14]} />
        <meshToonMaterial color={TOON.green} gradientMap={toonRamp()} />
        <InkOutlines thickness={1.6} color="#2f7c3a" angle={Math.PI / 5} />
      </mesh>
    </group>
  )
}

/**
 * Modular attenuation storage: a block of crate cells, each outlined,
 * part filled with water. `size` is the whole block, centred on the origin.
 */
export function DiagramBox({ size, cells, water: level }: {
  size: [number, number, number]
  cells: [number, number, number]
  /** 0..1, how full the block is. */
  water: number
}) {
  const waterMat = useWaterMaterial(4)
  const [w, h, d] = size
  const [nx, ny, nz] = cells
  const cell = useMemo(() => new THREE.BoxGeometry(w / nx, h / ny, d / nz), [w, h, d, nx, ny, nz])
  const positions = useMemo(() => {
    const list: [number, number, number][] = []
    for (let x = 0; x < nx; x++)
      for (let y = 0; y < ny; y++)
        for (let z = 0; z < nz; z++)
          list.push([-w / 2 + (x + 0.5) * (w / nx), -h / 2 + (y + 0.5) * (h / ny), -d / 2 + (z + 0.5) * (d / nz)])
    return list
  }, [w, h, d, nx, ny, nz])
  const dash = Math.min(w / nx, h / ny) * 0.12
  return (
    <group>
      <mesh position={[0, -h / 2 + (h * level) / 2, 0]} material={waterMat}>
        <boxGeometry args={[w * 0.985, h * level, d * 0.96]} />
      </mesh>
      {positions.map((p) => (
        <group key={p.join(',')} position={p}>
          <Shell geometry={cell} repeat={2} dash={dash} />
        </group>
      ))}
    </group>
  )
}
