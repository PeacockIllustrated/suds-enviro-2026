'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { InkOutlines, TOON, toonRamp, useWaterMaterial } from '@/components/site/three/toon'
import { ART } from '@/components/site/explorer/lineArt'
import { CUT_Z, FOUL_SEWER, OUTFALL, PIPES, RIVER, type PipeRun } from './journeyWorld'
import type { Vec3 } from './scenery'
import type { JourneyMotionState } from './journeyFraming'

/**
 * The drainage run along the section cut. Each pipe is drawn empty (white,
 * inked) and fills with the flowing blue toon water as the reader travels:
 * a pipe starts filling as the camera leaves the stop upstream of it and is
 * full before the next stop, so the water always arrives ahead of the
 * reader. Nothing re-renders on scroll; the fill is set in the frame loop.
 */

const FILLET = 0.35
const RADIAL = 12

function runPath(points: Vec3[]): THREE.CurvePath<THREE.Vector3> {
  const v = points.map((p) => new THREE.Vector3(...p))
  const path = new THREE.CurvePath<THREE.Vector3>()
  let from = v[0].clone()
  for (let i = 1; i < v.length; i++) {
    const corner = v[i]
    if (i === v.length - 1) {
      path.add(new THREE.LineCurve3(from, corner.clone()))
      break
    }
    const next = v[i + 1]
    const r = Math.min(FILLET, corner.distanceTo(v[i - 1]) / 2, corner.distanceTo(next) / 2)
    const a = corner.clone().add(v[i - 1].clone().sub(corner).setLength(r))
    const b = corner.clone().add(next.clone().sub(corner).setLength(r))
    if (from.distanceTo(a) > 1e-4) path.add(new THREE.LineCurve3(from, a))
    path.add(new THREE.QuadraticBezierCurve3(a, corner.clone(), b))
    from = b
  }
  return path
}

/** How full a run on `leg` is with the reader at `u`. */
export function fillAt(u: number, leg: number): number {
  return Math.min(1, Math.max(0, (u - leg + 0.3) / 1))
}

const shellMaterial = new THREE.MeshToonMaterial({ color: '#f4f9fc', gradientMap: toonRamp() })

function Pipe({ run, motionRef }: { run: PipeRun; motionRef: { current: JourneyMotionState } }) {
  const { shell, water, segments } = useMemo(() => {
    const path = runPath(run.points)
    const segs = Math.max(10, Math.round(path.getLength() * 8))
    return {
      shell: new THREE.TubeGeometry(path, segs, run.radius, RADIAL, false),
      water: new THREE.TubeGeometry(path, segs, run.radius * 1.03, RADIAL, false),
      segments: segs,
    }
  }, [run])
  const material = useWaterMaterial(Math.max(3, water.parameters.path.getLength() * 1.4))
  useFrame(() => {
    const fill = fillAt(motionRef.current.u, run.leg)
    water.setDrawRange(0, Math.round(segments * fill) * RADIAL * 6)
  })
  return (
    <group>
      <mesh geometry={shell} material={shellMaterial}>
        <InkOutlines thickness={1.5} color={TOON.ink} angle={0} />
      </mesh>
      <mesh geometry={water} material={material} />
    </group>
  )
}

/** Water falling from the outfall into the river once the run reaches it. */
function Pour({ motionRef }: { motionRef: { current: JourneyMotionState } }) {
  const run: PipeRun = useMemo(
    () => ({
      leg: 6.45,
      radius: 0.1,
      points: [
        OUTFALL,
        [OUTFALL[0] + 0.45, OUTFALL[1] - 0.05, CUT_Z],
        [OUTFALL[0] + 0.7, RIVER.level + 0.02, CUT_Z],
      ],
    }),
    [],
  )
  const geometry = useMemo(() => new THREE.TubeGeometry(runPath(run.points), 16, run.radius, RADIAL, false), [run])
  const material = useWaterMaterial(3)
  useFrame(() => {
    const fill = fillAt(motionRef.current.u, run.leg)
    geometry.setDrawRange(0, Math.round(16 * fill) * RADIAL * 6)
  })
  return <mesh geometry={geometry} material={material} />
}

const foulMaterial = new THREE.MeshToonMaterial({ color: TOON.red, gradientMap: toonRamp() })

/** The foul sewer under the road, end on in the section. */
function FoulSewer() {
  return (
    <mesh position={[FOUL_SEWER.x, FOUL_SEWER.y, CUT_Z - 2]} rotation={[Math.PI / 2, 0, 0]} material={foulMaterial}>
      <cylinderGeometry args={[FOUL_SEWER.radius, FOUL_SEWER.radius, 4.2, 20]} />
      <InkOutlines thickness={1.5} color="#7a2524" angle={0} />
    </mesh>
  )
}

export function JourneyPipes({ motionRef }: { motionRef: { current: JourneyMotionState } }) {
  return (
    <group>
      {PIPES.map((run, i) => (
        <Pipe key={i} run={run} motionRef={motionRef} />
      ))}
      <Pour motionRef={motionRef} />
      <FoulSewer />
      {/* A marker ring where the foul sewer is cut, so it reads as a pipe. */}
      <mesh position={[FOUL_SEWER.x, FOUL_SEWER.y, CUT_Z + 0.105]}>
        <ringGeometry args={[FOUL_SEWER.radius * 0.62, FOUL_SEWER.radius * 0.8, 24]} />
        <meshBasicMaterial color={ART.paper} />
      </mesh>
    </group>
  )
}
