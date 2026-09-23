'use client'

import { useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ToonLights } from '@/components/site/three/toon'
import { VIEW_DIR } from '@/components/site/explorer/cameraFit'
import { JourneyWorld } from './JourneyWorld'
import { STOP_SCENES, type StopId } from './journeyWorld'
import { SCREEN_RIGHT, SCREEN_UP, fitShot, isNarrow, type JourneyMotionState, type Shot } from './journeyFraming'

/**
 * The water journey's 3D stage: the Site Explorer's orthographic,
 * isometric-style camera gliding along one long section. Default-exported
 * so the page can load it with `dynamic(..., { ssr: false })` and keep
 * three.js out of the route chunk.
 *
 * The page sets `motion.target` (0 at the first stop, 1 per stop after);
 * here it is eased into `u` (or jumped to, without motion). The camera
 * fits each stop's box into the part of the stage the copy leaves clear,
 * and between stops it blends the two shots, easing back a little at the
 * midpoint so the reader sees the run the water is travelling along.
 */

export interface JourneySceneProps {
  stops: StopId[]
  motionRef: { current: JourneyMotionState }
  /** The stop whose card is showing. */
  active: number
  /** Whether the active product's casing is faded to show inside. */
  revealed: boolean
  /** Motion allowed: camera glides, rain, flowing water. */
  animate: boolean
  /** Stop drawing altogether, e.g. while scrolled away. */
  paused: boolean
  /** Device pixel ratio cap. */
  maxDpr: number
}

const CAMERA_DISTANCE = 200
const PAD = 14

function CameraRig({ stops, motionRef, animate }: Pick<JourneySceneProps, 'stops' | 'motionRef' | 'animate'>) {
  const scratch = useMemo(() => ({ a: { r: 0, u: 0, zoom: 1 } as Shot, b: { r: 0, u: 0, zoom: 1 } as Shot, target: new THREE.Vector3() }), [])

  useFrame(({ camera, size }, dt) => {
    if (!(camera instanceof THREE.OrthographicCamera) || size.width === 0) return
    const m = motionRef.current
    const last = stops.length - 1
    if (m.snap || !animate) {
      m.u = m.target
      m.snap = false
    } else {
      m.u = THREE.MathUtils.damp(m.u, m.target, 3.4, Math.min(dt, 0.1))
      if (Math.abs(m.u - m.target) < 1e-4) m.u = m.target
    }
    const u = Math.min(last, Math.max(0, m.u))
    const i = Math.min(last - 1, Math.floor(u))
    const f = u - i
    const narrow = isNarrow(m.free, size.width, size.height)
    const box = (id: StopId) => (narrow ? STOP_SCENES[id].frameNarrow : STOP_SCENES[id].frame)
    const { a, b, target } = scratch
    fitShot(box(stops[i]), m.free, size.width, size.height, PAD, a)
    fitShot(box(stops[i + 1]), m.free, size.width, size.height, PAD, b)
    const r = a.r + (b.r - a.r) * f
    const up = a.u + (b.u - a.u) * f
    // Zoom blends in log space, easing back a touch between stops.
    const zoom = Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * f) * (1 - 0.16 * Math.sin(Math.PI * f))
    target.set(0, 0, 0).addScaledVector(SCREEN_RIGHT, r).addScaledVector(SCREEN_UP, up)
    camera.position.copy(target).addScaledVector(VIEW_DIR, CAMERA_DISTANCE)
    camera.lookAt(target)
    if (camera.zoom !== zoom) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
  }, -1)
  return null
}

/** Draws a frame when something the page controls changes, for demand rendering. */
function Invalidate({ keys }: { keys: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate)
  const signature = JSON.stringify(keys)
  useEffect(() => {
    invalidate()
    // A second frame lets anything that settles over two frames land.
    const id = requestAnimationFrame(() => invalidate())
    return () => cancelAnimationFrame(id)
  }, [signature, invalidate])
  return null
}

function Stage({ stops, motionRef, active, revealed, animate }: JourneySceneProps) {
  const [loadAll, setLoadAll] = useState(false)

  // Models away from the reader wait until the page has settled.
  useEffect(() => {
    const idle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback
    let handle = 0
    const timer = window.setTimeout(() => {
      if (typeof idle === 'function') handle = idle(() => setLoadAll(true), { timeout: 2000 })
      else setLoadAll(true)
    }, 2500)
    return () => {
      window.clearTimeout(timer)
      if (handle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle)
    }
  }, [])

  return (
    <>
      <CameraRig stops={stops} motionRef={motionRef} animate={animate} />
      <ToonLights />
      <JourneyWorld motionRef={motionRef} stops={stops} active={active} revealed={revealed} animate={animate} loadAll={loadAll} />
      <Invalidate keys={[active, revealed, loadAll]} />
    </>
  )
}

export default function JourneyScene(props: JourneySceneProps) {
  const { paused, animate, maxDpr } = props
  return (
    <Canvas
      orthographic
      flat
      dpr={[1, maxDpr]}
      frameloop={paused ? 'never' : animate ? 'always' : 'demand'}
      camera={{ position: [0, 60, 120], zoom: 10, near: 1, far: 600 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#ffffff']} />
      <Stage {...props} />
    </Canvas>
  )
}
