'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { InkOutlines, TOON, toonRamp, useWaterMaterial } from '@/components/site/three/toon'
import { ART } from './lineArt'
import type { PipeRun, Vec3 } from './explorerLayout'

/**
 * Drain runs along the section cut, in the home page's stream colours:
 * surface water as the flowing blue toon water, foul in red, and the
 * cable duct in charcoal. Runs are polylines with softened corners so a
 * single tube can follow a downpipe round into the ground.
 */

const FILLET = 0.35

function runPath(points: Vec3[]): THREE.CurvePath<THREE.Vector3> {
  const v = points.map((p) => new THREE.Vector3(...p))
  const path = new THREE.CurvePath<THREE.Vector3>()
  let from = v[0].clone()
  for (let i = 1; i < v.length; i++) {
    const corner = v[i]
    const isLast = i === v.length - 1
    if (isLast) {
      path.add(new THREE.LineCurve3(from, corner.clone()))
      break
    }
    const next = v[i + 1]
    const inLen = corner.distanceTo(v[i - 1])
    const outLen = corner.distanceTo(next)
    const r = Math.min(FILLET, inLen / 2, outLen / 2)
    const a = corner.clone().add(v[i - 1].clone().sub(corner).setLength(r))
    const b = corner.clone().add(next.clone().sub(corner).setLength(r))
    if (from.distanceTo(a) > 1e-4) path.add(new THREE.LineCurve3(from, a))
    path.add(new THREE.QuadraticBezierCurve3(a, corner.clone(), b))
    from = b
  }
  return path
}

function runLength(points: Vec3[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    const [ax, ay, az] = points[i - 1]
    const [bx, by, bz] = points[i]
    len += Math.hypot(bx - ax, by - ay, bz - az)
  }
  return len
}

function useTube(run: PipeRun, radius: number) {
  return useMemo(() => {
    const path = runPath(run.points)
    const segments = Math.max(8, Math.round(runLength(run.points) * 6))
    return new THREE.TubeGeometry(path, segments, radius, 12, false)
  }, [run, radius])
}

function SurfacePipe({ run }: { run: PipeRun }) {
  const radius = run.radius ?? 0.15
  const geometry = useTube(run, radius)
  // Streaks per run scale with its length so the flow reads the same speed.
  const material = useWaterMaterial(Math.max(3, runLength(run.points) * 1.6))
  return (
    <mesh geometry={geometry} material={material}>
      <InkOutlines thickness={1.6} color={TOON.ink} angle={0} />
    </mesh>
  )
}

const foulMaterial = new THREE.MeshToonMaterial({ color: TOON.red, gradientMap: toonRamp() })
const ductMaterial = new THREE.MeshBasicMaterial({ color: ART.asphalt })

function SolidPipe({ run }: { run: PipeRun }) {
  const radius = run.radius ?? (run.stream === 'duct' ? 0.07 : 0.14)
  const geometry = useTube(run, radius)
  return (
    <mesh geometry={geometry} material={run.stream === 'foul' ? foulMaterial : ductMaterial}>
      <InkOutlines thickness={1.6} color={run.stream === 'foul' ? '#7a2524' : ART.asphaltInk} angle={0} />
    </mesh>
  )
}

export function Pipes({ runs }: { runs: PipeRun[] }) {
  return (
    <group>
      {runs.map((run, i) =>
        run.stream === 'surface' ? <SurfacePipe key={i} run={run} /> : <SolidPipe key={i} run={run} />,
      )}
    </group>
  )
}
