'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { InkOutlines, toonRamp } from '@/components/site/three/toon'
import { seeded } from './details'
import { LA } from './palette'
import type { Vec3 } from './sketch'

/**
 * Trees for the line-art scenery: Lombardy poplars (tall, layered
 * columns) and rounded broadleaves (a clustered canopy on a forked
 * trunk), toon shaded with an inked outline so each canopy lobe reads,
 * with a soft ground shadow under each.
 *
 * All the trees in one <Trees> draw as instanced meshes: two crowns, one
 * trunk and one shadow, whatever the count.
 *
 * Metres. Each tree's `position` is the foot of its trunk; `height` is to
 * the top of the crown (poplar default 7.5, broadleaf 6).
 */

export interface TreeSpec {
  position: Vec3
  kind?: 'poplar' | 'broadleaf'
  height?: number
}

export interface TreesProps {
  trees: TreeSpec[]
  /** Ground shadows (default true). */
  shadows?: boolean
}

type Lobe = [number, number, number, number, number, number]

function lobes(list: Lobe[], detail = 9): THREE.BufferGeometry {
  const parts = list.map(([x, y, z, rx, ry, rz]) => {
    const g = new THREE.SphereGeometry(1, detail, Math.round(detail * 0.75))
    g.scale(rx, ry, rz)
    g.translate(x, y, z)
    return g
  })
  const merged = mergeGeometries(parts, false)
  parts.forEach((p) => p.dispose())
  return merged ?? new THREE.SphereGeometry(1)
}

/** Unit poplar crown: 1 m tall from its base, about 0.36 m across. */
function poplarCrown(): THREE.BufferGeometry {
  return lobes([
    [0, 0.5, 0, 0.17, 0.5, 0.17],
    [0.07, 0.3, 0.05, 0.13, 0.2, 0.12],
    [-0.07, 0.52, 0.06, 0.12, 0.19, 0.11],
    [0.06, 0.7, -0.03, 0.1, 0.16, 0.1],
    [-0.05, 0.18, -0.05, 0.12, 0.16, 0.12],
    [0.01, 0.86, 0.02, 0.07, 0.13, 0.07],
  ])
}

/** Unit broadleaf crown: 1 m tall from its base, about 1.1 m across. */
function broadleafCrown(): THREE.BufferGeometry {
  return lobes([
    [0, 0.52, 0, 0.42, 0.36, 0.4],
    [0.3, 0.42, 0.14, 0.27, 0.24, 0.26],
    [-0.32, 0.46, 0.06, 0.28, 0.25, 0.27],
    [0.08, 0.76, -0.06, 0.3, 0.22, 0.28],
    [-0.12, 0.33, 0.3, 0.24, 0.2, 0.22],
    [0.2, 0.62, 0.3, 0.22, 0.2, 0.2],
    [-0.2, 0.7, 0.18, 0.2, 0.18, 0.2],
  ], 14)
}

function trunk(): THREE.BufferGeometry {
  const t = new THREE.CylinderGeometry(0.07, 0.11, 1, 7)
  t.translate(0, 0.5, 0)
  return t
}

const shadowMaterial = new THREE.MeshBasicMaterial({ color: '#1d3b4f', transparent: true, opacity: 0.07, depthWrite: false, toneMapped: false })

export function Trees({ trees, shadows = true }: TreesProps) {
  const poplars = useMemo(() => trees.filter((t) => (t.kind ?? 'poplar') === 'poplar'), [trees])
  const broad = useMemo(() => trees.filter((t) => t.kind === 'broadleaf'), [trees])
  const geos = useMemo(() => {
    const shadow = new THREE.CircleGeometry(1, 20)
    shadow.rotateX(-Math.PI / 2)
    return { poplar: poplarCrown(), broad: broadleafCrown(), trunk: trunk(), shadow }
  }, [])
  const materials = useMemo(
    () => ({
      poplar: new THREE.MeshToonMaterial({ color: LA.tree, gradientMap: toonRamp() }),
      broad: new THREE.MeshToonMaterial({ color: LA.treeLight, gradientMap: toonRamp() }),
      trunk: new THREE.MeshBasicMaterial({ color: LA.trunk, toneMapped: false }),
    }),
    [],
  )
  const poplarRef = useRef<THREE.InstancedMesh>(null)
  const broadRef = useRef<THREE.InstancedMesh>(null)
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const shadowRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    const rand = seeded(17)
    let ti = 0
    const place = (mesh: THREE.InstancedMesh | null, list: TreeSpec[], kind: 'poplar' | 'broadleaf') => {
      list.forEach((t, i) => {
        const [x, y, z] = t.position
        const jitter = 0.9 + rand() * 0.2
        const h = (t.height ?? (kind === 'poplar' ? 7.5 : 6)) * jitter
        const bole = kind === 'poplar' ? h * 0.2 : h * 0.3
        const crown = h - bole * 0.8
        o.position.set(x, y + bole * 0.8, z)
        o.rotation.set(0, rand() * Math.PI * 2, 0)
        o.scale.set(crown, crown, crown)
        o.updateMatrix()
        mesh?.setMatrixAt(i, o.matrix)
        o.position.set(x, y, z)
        o.rotation.set(0, 0, 0)
        o.scale.set(kind === 'poplar' ? 1 : 1.3, bole * 1.2, kind === 'poplar' ? 1 : 1.3)
        o.updateMatrix()
        trunkRef.current?.setMatrixAt(ti, o.matrix)
        const spread = kind === 'poplar' ? crown * 0.3 : crown * 0.62
        o.position.set(x + spread * 0.35, y + 0.05, z - spread * 0.15)
        o.scale.set(spread, 1, spread * 0.72)
        o.updateMatrix()
        shadowRef.current?.setMatrixAt(ti, o.matrix)
        ti++
      })
      if (mesh) {
        mesh.instanceMatrix.needsUpdate = true
        mesh.computeBoundingSphere()
      }
    }
    place(poplarRef.current, poplars, 'poplar')
    place(broadRef.current, broad, 'broadleaf')
    for (const m of [trunkRef.current, shadowRef.current]) {
      if (!m) continue
      m.instanceMatrix.needsUpdate = true
      m.computeBoundingSphere()
    }
  }, [poplars, broad])

  const noRaycast = () => {}
  return (
    <group>
      {poplars.length ? (
        <instancedMesh ref={poplarRef} args={[geos.poplar, materials.poplar, poplars.length]} raycast={noRaycast}>
          <InkOutlines thickness={1.3} color={LA.treeInk} />
        </instancedMesh>
      ) : null}
      {broad.length ? (
        <instancedMesh ref={broadRef} args={[geos.broad, materials.broad, broad.length]} raycast={noRaycast}>
          <InkOutlines thickness={1.3} color={LA.treeInk} />
        </instancedMesh>
      ) : null}
      <instancedMesh ref={trunkRef} args={[geos.trunk, materials.trunk, trees.length]} raycast={noRaycast} />
      {shadows ? <instancedMesh ref={shadowRef} args={[geos.shadow, shadowMaterial, trees.length]} raycast={noRaycast} renderOrder={1} /> : null}
    </group>
  )
}
