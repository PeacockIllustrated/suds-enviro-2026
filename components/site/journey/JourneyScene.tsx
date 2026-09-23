'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { ToonLights } from '../three/toon'
import { JourneyWorld } from './JourneyWorld'
import { JourneyHero, presence } from './JourneyHero'
import { STOP_SCENES, polar, radial, stopFractions, waterRoute, type StopId } from './journeyWorld'
import { frameFor, type JourneyMotionState } from './journeyFraming'

/**
 * The water journey's 3D stage. Default-exported so the page can load it
 * with `dynamic(..., { ssr: false })` and keep three.js out of the route
 * chunk.
 *
 * The camera rides a spline through a viewpoint above each stop, driven
 * by `motion.u` (0 at the first stop, 1 per stop after). The page sets
 * `motion.target`; here it is eased into `u` (or jumped to, without
 * motion) and everything else reads `u` in the frame loop.
 */

export interface JourneySceneProps {
  stops: StopId[]
  motionRef: { current: JourneyMotionState }
  /** The stop whose panel is showing; its product is mounted. */
  active: number
  /** The stop that was showing before, kept mounted while it leaves. */
  previous: number
  /** Whether the active product's casing is faded to show inside. */
  revealed: boolean
  /** Motion allowed: auto camera glides, rain, turning products. */
  animate: boolean
  /** Stop drawing altogether, e.g. while scrolled away. */
  paused: boolean
  /** Device pixel ratio cap. */
  maxDpr: number
}

const FOV = 32

function CameraRig({ stops, motionRef, animate }: Pick<JourneySceneProps, 'stops' | 'motionRef' | 'animate'>) {
  const scenes = useMemo(() => stops.map((id) => STOP_SCENES[id]), [stops])
  // One spline through (phi, r, lift) at each stop; getPoint(t) is uniform
  // per segment, so the camera passes exactly over stop i at u = i.
  const spline = useMemo(
    () => new THREE.CatmullRomCurve3(scenes.map((s) => new THREE.Vector3(s.phi, s.r, s.lift)), false, 'catmullrom', 0.35),
    [scenes],
  )
  const scratch = useMemo(() => ({ p: new THREE.Vector3(), focus: new THREE.Vector3(), up: new THREE.Vector3() }), [])
  const heroes = useMemo(() => scenes.map((s, i) => (s.model || s.diagram ? i : -1)).filter((i) => i >= 0), [scenes])

  useFrame(({ camera, size }, dt) => {
    const m = motionRef.current
    const last = scenes.length - 1
    if (m.snap || !animate) {
      m.u = m.target
      m.snap = false
    } else {
      m.u = THREE.MathUtils.damp(m.u, m.target, 3.4, Math.min(dt, 0.1))
      if (Math.abs(m.u - m.target) < 1e-4) m.u = m.target
    }
    const u = Math.min(last, Math.max(0, m.u))
    const { p, focus, up } = scratch
    spline.getPoint(u / last, p)
    const [phi, r, lift] = [p.x, p.y, p.z]

    let heroness = 0
    heroes.forEach((i) => {
      heroness = Math.max(heroness, presence(u, i))
    })
    const cam = camera as THREE.PerspectiveCamera
    frameFor(m.free, size.width, size.height, heroness, FOV, m.framing)

    const i = Math.min(last - 1, Math.floor(u))
    const f = u - i
    const base = scenes[i].distance + (scenes[i + 1].distance - scenes[i].distance) * f
    const distance = Math.max(base, m.framing.distance)

    polar(phi, r, -0.5, focus)
    radial(phi, up)
    cam.position.copy(focus).addScaledVector(up, lift * (distance / 7.2))
    cam.position.z += distance
    cam.up.copy(up)
    cam.lookAt(focus)
    // Shift the picture so the focus lands in the free part of the stage.
    const [fx, fy] = m.framing.focus
    cam.setViewOffset(size.width, size.height, (0.5 - fx) * size.width, (0.5 - fy) * size.height, size.width, size.height)
    cam.updateProjectionMatrix()
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

function Stage({ stops, motionRef, active, previous, revealed, animate }: JourneySceneProps) {
  const curve = useMemo(() => waterRoute(), [])
  const fractions = useMemo(() => stopFractions(curve, stops), [curve, stops])
  const mounted = useMemo(() => [...new Set([previous, active])].filter((i) => i >= 0 && i < stops.length), [previous, active, stops.length])

  // Fetch the next stop's model only, so it is ready as the reader arrives.
  useEffect(() => {
    const next = stops[active + 1]
    const model = next ? STOP_SCENES[next].model : undefined
    if (model) useGLTF.preload(model.url)
  }, [active, stops])

  return (
    <>
      <CameraRig stops={stops} motionRef={motionRef} animate={animate} />
      <ToonLights />
      <JourneyWorld curve={curve} fractions={fractions} motionRef={motionRef} animate={animate} />
      {/* One boundary per product, so a slow model never blanks the scene. */}
      {mounted.map((i) => (
        <Suspense key={stops[i]} fallback={null}>
          <JourneyHero
            index={i}
            scene={STOP_SCENES[stops[i]]}
            motionRef={motionRef}
            animate={animate}
            revealed={revealed && i === active}
          />
        </Suspense>
      ))}
      <Invalidate keys={[active, previous, revealed]} />
    </>
  )
}

export default function JourneyScene(props: JourneySceneProps) {
  const { paused, animate, maxDpr } = props
  return (
    <Canvas
      flat
      dpr={[1, maxDpr]}
      frameloop={paused ? 'never' : animate ? 'always' : 'demand'}
      camera={{ fov: FOV, near: 0.1, far: 150, position: [0, R_CAMERA_START, 12] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
     
    >
      <Stage {...props} />
    </Canvas>
  )
}

const R_CAMERA_START = 16
