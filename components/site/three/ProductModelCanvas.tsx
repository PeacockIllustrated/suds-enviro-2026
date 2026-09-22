'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { TOON, ToonLights, ToonModel, useLibraryParts } from './toon'
import type { ProductModel } from '@/lib/content/product-models'

/**
 * The canvas behind ProductModelViewer: one library model in the toon
 * style on a white ground, fitted to the frame, with drag to rotate.
 *
 * Default-exported so the viewer can pull it in with
 * `dynamic(..., { ssr: false })` and keep three.js out of the route chunk.
 */

export interface ProductModelCanvasProps {
  model: ProductModel
  /** Whether the casing should be see-through; eased over REVEAL_SECONDS. */
  revealed: boolean
  /** Slow turntable until the user drags; off under reduced motion. */
  autoRotate: boolean
  /** Stop rendering entirely, e.g. while scrolled out of view. */
  paused?: boolean
  /** Pointer over (true) or off (false) the model itself. */
  onModelHover?: (over: boolean) => void
  /** Fired once the glb has loaded and the model is on screen. */
  onReady?: () => void
}

/** Model units per scene unit once normalised: the largest side is this long. */
const FIT_SIZE = 2
const FOV = 30
const REVEAL_SECONDS = 0.4
/** Breathing room around the bounding sphere; below 1 because a sphere is loose on tall models. */
const FRAME_MARGIN = 1
const DEFAULT_VIEW = { azimuth: 30, elevation: 16 }

/** Smoothstep, so the fade starts and lands softly. */
const ease = (t: number) => t * t * (3 - 2 * t)

interface Fit {
  scale: number
  /** Model box in scene units after scaling. */
  box: THREE.Box3
  /** Radius of the bounding sphere in scene units. */
  radius: number
}

function useFit(url: string, span: number): Fit {
  const parts = useLibraryParts(url)
  return useMemo(() => {
    const box = new THREE.Box3()
    parts.forEach((part) => {
      if (!part.geometry.boundingBox) part.geometry.computeBoundingBox()
      const partBox = part.geometry.boundingBox
      if (partBox) box.union(partBox)
    })
    // Scale from the declared span so every product fills its frame the
    // same way; fall back to the measured box if the span is missing.
    const measured = box.getSize(new THREE.Vector3())
    const largest = span > 0 ? span : Math.max(measured.x, measured.y, measured.z)
    const scale = FIT_SIZE / largest
    const scaled = box.clone()
    scaled.min.multiplyScalar(scale)
    scaled.max.multiplyScalar(scale)
    const radius = scaled.getBoundingSphere(new THREE.Sphere()).radius
    return { scale, box: scaled, radius }
  }, [parts, span])
}

function Scene({ model, revealed, autoRotate, onModelHover, onReady }: ProductModelCanvasProps) {
  const fit = useFit(model.url, model.span)
  const center = useMemo(() => fit.box.getCenter(new THREE.Vector3()), [fit])
  const view = model.view ?? DEFAULT_VIEW

  // Fit the bounding sphere to whichever of the two fields of view is
  // tighter, so tall models in a portrait frame are not clipped at the sides.
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height))
  const distance = useMemo(() => {
    const halfV = THREE.MathUtils.degToRad(FOV / 2)
    const halfH = Math.atan(Math.tan(halfV) * aspect)
    return (fit.radius / Math.sin(Math.min(halfV, halfH))) * FRAME_MARGIN
  }, [fit, aspect])

  // Place the camera at the model's starting view once, then only change
  // its distance on resize, so a user's orbit is never undone.
  const placedFor = useRef<string | null>(null)
  useFrame(({ camera }) => {
    const key = `${model.url}|${distance.toFixed(4)}`
    if (placedFor.current === key) return
    const direction = new THREE.Vector3()
    if (placedFor.current?.startsWith(`${model.url}|`)) {
      direction.subVectors(camera.position, center).normalize()
    } else {
      const az = THREE.MathUtils.degToRad(view.azimuth)
      const el = THREE.MathUtils.degToRad(view.elevation)
      direction.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
    }
    camera.position.copy(center).addScaledVector(direction, distance)
    camera.lookAt(center)
    placedFor.current = key
  })

  // Reveal eases towards its target inside the render loop.
  const [reveal, setReveal] = useState(revealed ? 1 : 0)
  const current = useRef(reveal)
  useFrame((_, dt) => {
    const target = revealed ? 1 : 0
    if (current.current === target) return
    const step = Math.min(dt, 0.1) / REVEAL_SECONDS
    current.current =
      target > current.current
        ? Math.min(target, current.current + step)
        : Math.max(target, current.current - step)
    setReveal(current.current)
  })

  // The turntable stops for good once the user takes hold of the model.
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    onReady?.()
  }, [onReady])

  // Leaving one part for the next fires out then over; a short grace
  // stops the casing flickering as the pointer crosses part boundaries.
  const leaveTimer = useRef<number | null>(null)
  const handlePartHover = useMemo(() => {
    if (!onModelHover) return undefined
    return (part: string | null) => {
      if (leaveTimer.current !== null) {
        window.clearTimeout(leaveTimer.current)
        leaveTimer.current = null
      }
      if (part) onModelHover(true)
      else leaveTimer.current = window.setTimeout(() => onModelHover(false), 120)
    }
  }, [onModelHover])
  useEffect(
    () => () => {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current)
    },
    [],
  )

  const shadowSize = Math.max(fit.box.max.x - fit.box.min.x, fit.box.max.z - fit.box.min.z) * 2.2

  return (
    <>
      <ToonModel
        url={model.url}
        roles={model.roles}
        reveal={ease(reveal)}
        scale={fit.scale}
        onPartHover={handlePartHover}
      />
      <ContactShadows
        position={[center.x, 0.002, center.z]}
        scale={shadowSize}
        resolution={512}
        far={Math.max(0.5, fit.box.max.y * 0.6)}
        blur={2.6}
        opacity={0.5}
        color={TOON.ink}
        frames={1}
      />
      <OrbitControls
        target={center}
        enableDamping
        dampingFactor={0.08}
        enableZoom={false}
        enablePan={false}
        autoRotate={autoRotate && !interacted}
        autoRotateSpeed={0.7}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.04}
        onStart={() => setInteracted(true)}
      />
    </>
  )
}

export default function ProductModelCanvas(props: ProductModelCanvasProps) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={props.paused ? 'never' : 'always'}
      camera={{ fov: FOV, near: 0.05, far: 100, position: [0, 1, 6] }}
      gl={{ antialias: true }}
      className="cursor-grab active:cursor-grabbing"
    >
      <color attach="background" args={['#ffffff']} />
      <ToonLights />
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  )
}
