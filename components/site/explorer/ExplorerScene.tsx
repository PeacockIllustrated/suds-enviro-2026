'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ToonLights } from '@/components/site/three/toon'
import { Scenery } from './Scenery'
import { Ground } from './Ground'
import { Pipes } from './Pipes'
import { ExplorerProduct, ExplorerStorage } from './Products'
import { VIEW_DIR, fitBox, type CameraGoal } from './cameraFit'
import {
  OVERVIEW,
  PLOTS,
  productBase,
  productRadius,
  productTop,
  productZ,
  type Box3Spec,
  type PlotLayout,
  type ProductPlacement,
} from './explorerLayout'

/**
 * The Site Explorer's 3D drawing. The camera is driven only by the UI
 * (plot tabs, product markers), never by dragging, so on a phone the
 * canvas never fights the page scroll.
 *
 * Models load for the chosen plot first; the rest follow once the page
 * has settled. Rendering stops while the canvas is off screen, and under
 * reduced motion the camera cuts instead of gliding and the water stills.
 */

export interface HotspotInfo {
  number: number
  name: string
}

export interface ExplorerSceneProps {
  plotId: string
  productId: string | null
  onSelectPlot: (id: string) => void
  onSelectProduct: (id: string) => void
  /** Pixels at the bottom of the canvas hidden by the product sheet. */
  insetBottom: number
  /** Whether the canvas is on screen. */
  active: boolean
  reducedMotion: boolean
  /** Marker number and product name, by product id. */
  hotspots: Record<string, HotspotInfo>
  /** Accessible name prefix for a marker, e.g. "Show details for". */
  markerLabel: string
  /** Called once the renderer is up. */
  onReady?: () => void
  /** Shown instead of the drawing where WebGL is unavailable. */
  fallback?: React.ReactNode
}

const CAMERA_DISTANCE = 200

function focusBox(p: ProductPlacement, narrow: boolean): Box3Spec {
  const base = productBase(p)
  const top = Math.max(0, productTop(p))
  const z = productZ(p)
  const r = productRadius(p)
  return narrow
    ? { min: [p.x - 3, base - 0.5, Math.min(-2, z - r - 1)], max: [p.x + 3, top + 1.6, Math.max(1.5, z + r)] }
    : { min: [p.x - 7.5, base - 0.8, Math.min(-8, z - r - 2)], max: [p.x + 7.5, top + 4, Math.max(1.5, z + r)] }
}

function CameraRig({ goalFor, reducedMotion }: { goalFor: (w: number, h: number) => CameraGoal; reducedMotion: boolean }) {
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const invalidate = useThree((s) => s.invalidate)
  const current = useRef<CameraGoal | null>(null)
  const goal = useMemo(() => goalFor(width, height), [goalFor, width, height])

  useEffect(() => {
    invalidate()
  }, [goal, invalidate])

  useFrame(({ size, camera }, dt) => {
    if (!(camera instanceof THREE.OrthographicCamera) || size.width === 0) return
    // Start on the whole strip, then glide in to the chosen plot.
    if (current.current === null) {
      const start = reducedMotion ? goal : fitBox(OVERVIEW, { width: size.width, height: size.height, insetBottom: 0 })
      current.current = { target: start.target.clone(), zoom: start.zoom }
    }
    const cur = current.current
    if (reducedMotion) {
      cur.target.copy(goal.target)
      cur.zoom = goal.zoom
    } else {
      const k = 1 - Math.exp(-3.2 * Math.min(dt, 0.1))
      cur.target.lerp(goal.target, k)
      // Zoom eases in log space so zooming in and out feel the same.
      cur.zoom = Math.exp(THREE.MathUtils.lerp(Math.log(cur.zoom), Math.log(goal.zoom), k))
      const moving = cur.target.distanceToSquared(goal.target) > 1e-5 || Math.abs(cur.zoom - goal.zoom) > 1e-3
      if (moving) invalidate()
    }
    camera.position.copy(cur.target).addScaledVector(VIEW_DIR, CAMERA_DISTANCE)
    camera.lookAt(cur.target)
    if (camera.zoom !== cur.zoom) {
      camera.zoom = cur.zoom
      camera.updateProjectionMatrix()
    }
  })
  return null
}

function Hotspot({ placement, info, selected, label, onSelect }: {
  placement: ProductPlacement
  info: HotspotInfo
  selected: boolean
  label: string
  onSelect: (id: string) => void
}) {
  // Just above the product's cover, so the marker never hides the product.
  const y = Math.max(productTop(placement), 0) + 0.85
  const z = productZ(placement) + productRadius(placement) * 0.5
  return (
    <Html position={[placement.x, y, z]} center zIndexRange={[30, 10]}>
      <button
        type="button"
        onClick={() => onSelect(placement.id)}
        aria-label={`${label} ${info.name}`}
        aria-pressed={selected}
        className="group flex size-11 items-center justify-center rounded-full focus-visible:outline-none"
      >
        <span
          className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold shadow-md transition-[transform,background-color,color] duration-200 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-site-green/60 ${
            selected ? 'scale-110 border-white bg-site-blue text-white' : 'border-site-blue bg-white text-site-blue'
          }`}
        >
          {info.number}
        </span>
      </button>
    </Html>
  )
}

function Plot({ plot, children }: { plot: PlotLayout; children: React.ReactNode }) {
  return <group name={plot.id}>{children}</group>
}

function Site({ plotId, productId, onSelectPlot, onSelectProduct, hotspots, markerLabel, loadAll }: Omit<ExplorerSceneProps, 'insetBottom' | 'active' | 'reducedMotion'> & { loadAll: boolean }) {
  return (
    <group>
      <Ground />
      <Scenery onSelectPlot={onSelectPlot} />
      {PLOTS.map((plot) => (
        <Plot key={plot.id} plot={plot}>
          <Pipes runs={plot.pipes} />
          {plot.storage ? <ExplorerStorage spec={plot.storage} /> : null}
          {loadAll || plot.id === plotId
            ? plot.products.map((p) => (
                <ExplorerProduct
                  key={p.id}
                  placement={p}
                  selected={p.id === productId}
                  onSelect={(id) => (plot.id === plotId ? onSelectProduct(id) : onSelectPlot(plot.id))}
                />
              ))
            : null}
          {plot.id === plotId
            ? plot.products.map((p) =>
                hotspots[p.id] ? (
                  <Hotspot
                    key={p.id}
                    placement={p}
                    info={hotspots[p.id]}
                    selected={p.id === productId}
                    label={markerLabel}
                    onSelect={onSelectProduct}
                  />
                ) : null,
              )
            : null}
        </Plot>
      ))}
    </group>
  )
}

export default function ExplorerScene(props: ExplorerSceneProps) {
  const { plotId, productId, insetBottom, active, reducedMotion, onReady, fallback } = props
  const [loadAll, setLoadAll] = useState(false)

  // Other plots' models wait until the page has settled.
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

  const goalFor = useMemo(() => {
    const plot = PLOTS.find((p) => p.id === plotId) ?? PLOTS[0]
    const product = plot.products.find((p) => p.id === productId) ?? null
    return (width: number, height: number): CameraGoal => {
      const narrow = width / Math.max(1, height - insetBottom) < 1.1
      const box = product ? focusBox(product, narrow) : narrow ? plot.frameNarrow : plot.frame
      return fitBox(box, { width, height, insetBottom }, narrow ? 12 : 28)
    }
  }, [plotId, productId, insetBottom])

  const [dpr] = useState<[number, number]>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? [1, 1.5] : [1, 2],
  )

  return (
    <Canvas
      orthographic
      flat
      dpr={dpr}
      frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      camera={{ position: [0, 60, 120], zoom: 10, near: 1, far: 600 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={() => onReady?.()}
      fallback={fallback}
    >
      <color attach="background" args={['#ffffff']} />
      <ToonLights />
      <CameraRig goalFor={goalFor} reducedMotion={reducedMotion} />
      <Site {...props} loadAll={loadAll} />
    </Canvas>
  )
}
