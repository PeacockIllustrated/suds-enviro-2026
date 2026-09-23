'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ToonModel, useLibraryParts } from '../three/toon'
import type { ProductModel } from '@/lib/content/product-models'
import { DiagramBox, DiagramTank } from './JourneyDiagrams'
import { polar, type StopScene } from './journeyWorld'
import type { JourneyMotionState } from './journeyFraming'

/**
 * The close-up at a stop: the product rises out of the ground where it is
 * installed and settles large beside the copy, turning gently. As the
 * reader moves on it sinks back. Everything is driven from the shared
 * motion value in the frame loop; nothing re-renders on scroll.
 */

export interface HeroMotion {
  current: JourneyMotionState
}

/** How present stop `index` is at camera position `u`: 1 at the stop, 0 by halfway to the next. */
export function presence(u: number, index: number): number {
  const d = Math.abs(u - index)
  const t = Math.min(1, Math.max(0, (d - 0.06) / 0.46))
  return 1 - t * t * (3 - 2 * t)
}

let glowTexture: THREE.DataTexture | null = null
/** A soft white disc that lifts the product off the busy world behind it. */
function glow(): THREE.DataTexture {
  if (glowTexture) return glowTexture
  const n = 64
  const data = new Uint8Array(n * n * 4)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - n / 2 + 0.5, y - n / 2 + 0.5) / (n / 2)
      const a = Math.max(0, 1 - d)
      data.set([255, 255, 255, Math.round(255 * Math.min(1, a * a * 1.6))], (y * n + x) * 4)
    }
  }
  glowTexture = new THREE.DataTexture(data, n, n, THREE.RGBAFormat)
  glowTexture.magFilter = THREE.LinearFilter
  glowTexture.minFilter = THREE.LinearFilter
  glowTexture.needsUpdate = true
  return glowTexture
}

/** Settles with a small overshoot, so the product lands rather than stops. */
function settle(t: number) {
  const c = 1.4
  const v = t - 1
  return t <= 0 ? 0 : 1 + (c + 1) * v * v * v + c * v * v
}

interface HeroFrameProps {
  index: number
  scene: StopScene
  motionRef: HeroMotion
  /** Largest side of the content in its own units, and its centre. */
  span: number
  centre: THREE.Vector3
  animate: boolean
  children: ReactNode
}

/** Places its content in front of the camera at the framing's hero spot. */
function HeroFrame({ index, scene, motionRef, span, centre, animate, children }: HeroFrameProps) {
  const outer = useRef<THREE.Group>(null)
  const turn = useRef<THREE.Group>(null)
  const scratch = useMemo(
    () => ({ anchor: new THREE.Vector3(), ground: new THREE.Vector3(), dir: new THREE.Vector3(), q: new THREE.Quaternion() }),
    [],
  )
  const time = useRef(0)
  const backdrop = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ camera }, dt) => {
    const g = outer.current
    if (!g) return
    const { u, framing } = motionRef.current
    const k = presence(u, index)
    g.visible = k > 0.01
    if (!g.visible) return
    // The hero spot, a fixed distance in front of the camera.
    const { anchor, ground, dir } = scratch
    anchor.set(framing.hero[0] * 2 - 1, 1 - framing.hero[1] * 2, 0.5).unproject(camera)
    dir.subVectors(anchor, camera.position).normalize()
    const distance = 4.4
    anchor.copy(camera.position).addScaledVector(dir, distance)
    polar(scene.phi, scene.r, 0, ground)
    const eased = settle(k)
    g.position.lerpVectors(ground, anchor, Math.min(1, eased))
    const persp = camera as THREE.PerspectiveCamera
    const visible = 2 * distance * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2))
    const size = (framing.heroSize * visible) / span
    g.scale.setScalar(size * Math.max(0.05, eased))
    if (backdrop.current) backdrop.current.opacity = 0.9 * Math.min(1, k * 1.4)
    g.quaternion.copy(camera.quaternion)
    // Gentle turn: a slow sway around the product's best side.
    if (animate) time.current += dt
    if (turn.current) {
      const base = THREE.MathUtils.degToRad(scene.yaw ?? 25)
      turn.current.rotation.set(0.32, base + Math.sin(time.current * 0.45) * 0.5, 0)
    }
  })
  return (
    <group ref={outer} visible={false}>
      <mesh position={[0, 0, -span * 0.9]} renderOrder={-1}>
        <planeGeometry args={[span * 2.1, span * 2.1]} />
        <meshBasicMaterial ref={backdrop} map={glow()} transparent depthWrite={false} opacity={0.9} toneMapped={false} />
      </mesh>
      <group ref={turn}>
        <group position={[-centre.x, -centre.y, -centre.z]}>{children}</group>
      </group>
    </group>
  )
}

const REVEAL_SECONDS = 0.45

function ModelHero({ model, revealed, animate, ...frame }: Omit<HeroFrameProps, 'span' | 'centre' | 'children'> & {
  model: ProductModel
  revealed: boolean
}) {
  const parts = useLibraryParts(model.url)
  const centre = useMemo(() => {
    const box = new THREE.Box3()
    parts.forEach((p) => {
      if (!p.geometry.boundingBox) p.geometry.computeBoundingBox()
      if (p.geometry.boundingBox) box.union(p.geometry.boundingBox)
    })
    return box.getCenter(new THREE.Vector3())
  }, [parts])
  // The casing fades over a moment, or at once without motion.
  const [reveal, setReveal] = useState(revealed ? 1 : 0)
  const current = useRef(reveal)
  useFrame((_, dt) => {
    const target = revealed ? 1 : 0
    if (current.current === target) return
    const step = animate ? Math.min(dt, 0.1) / REVEAL_SECONDS : 1
    current.current = target > current.current ? Math.min(target, current.current + step) : Math.max(target, current.current - step)
    setReveal(current.current)
  })
  const eased = reveal * reveal * (3 - 2 * reveal)
  return (
    <HeroFrame {...frame} animate={animate} span={model.span} centre={centre}>
      <ToonModel url={model.url} roles={model.roles} reveal={eased} scale={1} thickness={2.2} />
    </HeroFrame>
  )
}

const ORIGIN = new THREE.Vector3(0, 0, 0)

export function JourneyHero({ index, scene, motionRef, animate, revealed }: {
  index: number
  scene: StopScene
  motionRef: HeroMotion
  animate: boolean
  revealed: boolean
}) {
  if (scene.model) {
    return <ModelHero index={index} scene={scene} motionRef={motionRef} animate={animate} model={scene.model} revealed={revealed} />
  }
  if (scene.diagram === 'tank') {
    return (
      <HeroFrame index={index} scene={scene} motionRef={motionRef} animate={animate} span={2.3} centre={ORIGIN}>
        <DiagramTank />
      </HeroFrame>
    )
  }
  if (scene.diagram === 'crates') {
    return (
      <HeroFrame index={index} scene={scene} motionRef={motionRef} animate={animate} span={2.6} centre={ORIGIN}>
        <DiagramBox size={[2.4, 1.2, 1.2]} cells={[4, 2, 2]} water={0.6} />
      </HeroFrame>
    )
  }
  return null
}
