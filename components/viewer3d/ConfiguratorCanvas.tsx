'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Outlines, useGLTF } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import {
  TOON,
  ToonLights,
  libraryPartsFromScene,
  toonRamp,
  useWaterMaterial,
  type LibraryPart,
} from '@/components/site/three/toon'
import type { Vec3 } from './geometry'
import type { CalloutTone, ViewerModel, ViewerRole } from './viewer-model'

/**
 * The configurator's 3D preview canvas, in the site's toon style.
 *
 * Draws a ViewerModel part by part, eases a "Show inside" fade and a
 * breakout (exploded) view in the render loop, highlights the part under
 * the pointer, and lays out HTML callouts over the canvas so pipe and part
 * labels stay legible and do not overlap. Default-exported for
 * `dynamic(..., { ssr: false })`.
 */

export interface ConfiguratorCanvasProps {
  model: ViewerModel
  revealed: boolean
  exploded: boolean
  showLabels: boolean
  reducedMotion: boolean
  /** Fine pointer: hover highlights parts. Touch uses tap instead. */
  canHover: boolean
  /** Narrow screens get thinner outlines. */
  compact: boolean
  onReady?: () => void
}

const FOV = 32
const REVEAL_SECONDS = 0.45
const EXPLODE_SECONDS = 0.9
const FRAME_MARGIN = 1.14
const MM = 0.001
const HIGHLIGHT = '#ffe98a'
/** How far casings fade while broken out, so the insides read. */
const BREAKOUT_FADE = 0.5

const ease = (t: number) => t * t * (3 - 2 * t)
const approach = (v: number, target: number, step: number) =>
  target > v ? Math.min(target, v + step) : Math.max(target, v - step)

const FILL: Record<ViewerRole, string> = {
  casing: TOON.body,
  body: TOON.body,
  insides: TOON.accentLight,
  accent: TOON.accent,
  cover: '#7f9aab',
  inlet: TOON.inkSoft,
  outlet: TOON.green,
  xray: '#cdeaf8',
  water: TOON.water,
}

function opacityFor(role: ViewerRole, fade: number): number {
  switch (role) {
    case 'casing':
      return 1 - 0.86 * fade
    case 'inlet':
    case 'outlet':
    case 'cover':
      return 1 - 0.5 * fade
    case 'xray':
      return 0.1
    default:
      return 1
  }
}

const NO_RAYCAST: THREE.Mesh['raycast'] = () => {}
const DEFAULT_RAYCAST = THREE.Mesh.prototype.raycast

const tuple = (v: Vec3): [number, number, number] => [v[0], v[1], v[2]]

// ── labels ──────────────────────────────────────────────────────────

interface LabelItem {
  id: string
  kind: 'part' | 'callout'
  /** Part id whose transform the anchor follows; '' = the model root. */
  target: string
  anchor: THREE.Vector3 | null
  title: string
  detail?: string
  tone: CalloutTone | 'part'
  priority: number
  hideWhenExploded: boolean
}

function labelItems(model: ViewerModel): LabelItem[] {
  const items: LabelItem[] = []
  model.callouts.forEach((c) =>
    items.push({
      id: `c:${c.id}`,
      kind: 'callout',
      target: c.follows ?? '',
      anchor: c.anchor ? new THREE.Vector3(c.anchor[0], c.anchor[1], c.anchor[2]) : null,
      title: c.title,
      detail: c.detail,
      tone: c.tone,
      priority: c.priority,
      hideWhenExploded: c.hideWhenExploded ?? false,
    }),
  )
  model.parts.forEach((p) => {
    if (p.role === 'water' || p.labelled === false) return
    items.push({ id: `p:${p.id}`, kind: 'part', target: p.id, anchor: null, title: p.label, tone: 'part', priority: 3, hideWhenExploded: false })
  })
  model.libraries.forEach((lib) =>
    Object.entries(lib.parts).forEach(([name, spec]) => {
      if (spec.role === 'water' || spec.labelled === false) return
      const id = `${lib.id}:${name}`
      items.push({ id: `p:${id}`, kind: 'part', target: id, anchor: null, title: spec.label, tone: 'part', priority: 3, hideWhenExploded: false })
    }),
  )
  return items.sort((a, b) => b.priority - a.priority)
}

interface LabelEls {
  box: HTMLDivElement | null
  line: SVGLineElement | null
  dot: SVGCircleElement | null
  w: number
  h: number
  x: number
  y: number
  alpha: number
  slot: number
  measuredAt: number
}

function blankEls(): LabelEls {
  return { box: null, line: null, dot: null, w: 0, h: 0, x: -1, y: -1, alpha: -1, slot: -1, measuredAt: 0 }
}

const TONE_BAR: Record<CalloutTone | 'part', string> = {
  inlet: 'bg-site-blue',
  outlet: 'bg-green',
  info: 'bg-muted',
  accent: 'bg-navy',
  part: 'bg-navy',
}

const TONE_STROKE: Record<CalloutTone | 'part', string> = {
  inlet: 'stroke-site-blue fill-site-blue',
  outlet: 'stroke-green fill-green',
  info: 'stroke-muted fill-muted',
  accent: 'stroke-navy fill-navy',
  part: 'stroke-navy fill-navy',
}

function LabelLayer({ items, els }: { items: LabelItem[]; els: RefObject<Map<string, LabelEls>> }) {
  const bind = useCallback(
    <K extends 'box' | 'line' | 'dot'>(id: string, key: K) =>
      (el: LabelEls[K]) => {
        const map = els.current
        const entry = map.get(id) ?? blankEls()
        entry[key] = el
        if (key === 'box') {
          entry.w = 0
          entry.alpha = -1
          entry.slot = -1
        }
        map.set(id, entry)
        return () => {
          const current = map.get(id)
          if (current && current[key] === el) current[key] = null
        }
      },
    [els],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {items.map((item) => (
          <g key={`${item.id}|${item.title}|${item.detail ?? ''}`} className={TONE_STROKE[item.tone]}>
            <line ref={bind(item.id, 'line')} strokeWidth={1.25} visibility="hidden" />
            <circle ref={bind(item.id, 'dot')} r={2.6} visibility="hidden" className="stroke-white" strokeWidth={1} />
          </g>
        ))}
      </svg>
      {items.map((item) => (
        <div
          key={`${item.id}|${item.title}|${item.detail ?? ''}`}
          ref={bind(item.id, 'box')}
          className={`invisible absolute top-0 left-0 flex items-stretch overflow-hidden whitespace-nowrap rounded-md shadow-[0_1px_4px_rgba(14,79,115,0.18)] will-change-transform ${
            item.kind === 'part' ? 'bg-navy text-white' : 'border border-border bg-white/95 text-ink'
          }`}
        >
          {item.kind === 'callout' ? <span className={`w-[3px] shrink-0 ${TONE_BAR[item.tone]}`} /> : null}
          <span className={`flex flex-col leading-tight ${item.kind === 'part' ? 'px-2 py-[3px]' : 'px-1.5 py-[3px]'}`}>
            <span className={`text-[10px] font-bold sm:text-[11px] ${item.kind === 'part' ? 'tracking-wide' : ''}`}>{item.title}</span>
            {item.detail ? <span className="text-[9px] font-semibold text-muted sm:text-[10px]">{item.detail}</span> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── parts ───────────────────────────────────────────────────────────

interface PartEntry {
  object: THREE.Object3D
  explode: THREE.Vector3
  /** Top centre of the part's geometry, in its own coordinates. */
  top: THREE.Vector3
  /** Centre of the part's bounds, in its own coordinates. */
  centre: THREE.Vector3
  /** Half the part's widest horizontal extent, in its own units. */
  radius: number
}

/** Parts by id, plus a flat list the render loop can walk without allocating. */
class PartRegistry {
  readonly byId = new Map<string, PartEntry>()
  readonly list: PartEntry[] = []
  add(id: string, entry: PartEntry) {
    const old = this.byId.get(id)
    if (old) this.list.splice(this.list.indexOf(old), 1)
    this.byId.set(id, entry)
    this.list.push(entry)
  }
  remove(id: string, entry: PartEntry) {
    if (this.byId.get(id) !== entry) return
    this.byId.delete(id)
    this.list.splice(this.list.indexOf(entry), 1)
  }
}

type Registry = RefObject<PartRegistry>

interface Interaction {
  hovered: string | null
  picked: string | null
  canHover: boolean
  onHover: (id: string) => void
  onHoverEnd: (id: string) => void
  onPick: (id: string) => void
}

interface DrawPartProps {
  id: string
  geometry: THREE.BufferGeometry
  role: ViewerRole
  color?: string
  explode: Vec3
  fade: number
  thickness: number
  registry: Registry
  interaction: Interaction
  water?: THREE.Material
  swing?: { pivot: readonly [number, number]; angle: number }
}

function DrawPart({ id, geometry, role, color, explode, fade, thickness, registry, interaction, water, swing }: DrawPartProps) {
  const anchors = useMemo(() => {
    if (!geometry.boundingBox) geometry.computeBoundingBox()
    const bb = geometry.boundingBox ?? new THREE.Box3()
    const centre = bb.getCenter(new THREE.Vector3())
    return {
      top: new THREE.Vector3(centre.x, bb.max.y, centre.z),
      centre,
      radius: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2,
    }
  }, [geometry])

  const register = useCallback(
    (group: THREE.Group | null) => {
      if (!group) return
      const parts = registry.current
      const entry: PartEntry = { object: group, explode: new THREE.Vector3(explode[0], explode[1], explode[2]), ...anchors }
      parts.add(id, entry)
      return () => parts.remove(id, entry)
    },
    [id, explode, anchors, registry],
  )

  let body: ReactNode
  if (role === 'water' && water) {
    body = <mesh geometry={geometry} material={water} raycast={NO_RAYCAST} renderOrder={1} />
  } else {
    const opacity = opacityFor(role, fade)
    const see = opacity < 0.999
    const lit = interaction.hovered === id || interaction.picked === id
    const pickable = opacity > 0.5 && role !== 'xray'
    body = (
      <mesh
        geometry={geometry}
        renderOrder={see ? 2 : 0}
        raycast={pickable ? DEFAULT_RAYCAST : NO_RAYCAST}
        onPointerOver={
          interaction.canHover
            ? (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation()
                interaction.onHover(id)
              }
            : undefined
        }
        onPointerOut={interaction.canHover ? () => interaction.onHoverEnd(id) : undefined}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 6) return
          e.stopPropagation()
          interaction.onPick(id)
        }}
      >
        <meshToonMaterial
          color={lit ? HIGHLIGHT : color ?? FILL[role]}
          gradientMap={toonRamp()}
          transparent={see}
          opacity={opacity}
          depthWrite={!see}
          side={see ? THREE.DoubleSide : THREE.FrontSide}
        />
        {/* drei 10.7's Outlines has its screenspace branches swapped; false
            gives pixel-width outlines (see components/site/three/toon.tsx). */}
        <Outlines
          screenspace={false}
          thickness={(see ? thickness * 0.6 : thickness) * (lit ? 1.5 : 1)}
          color={role === 'outlet' ? '#2f7c3a' : TOON.ink}
          toneMapped={false}
          transparent={see}
          opacity={see ? Math.min(1, opacity * 2.5) : 1}
          angle={Math.PI / 5}
        />
      </mesh>
    )
  }

  const moved = <group ref={register}>{body}</group>
  if (!swing) return moved
  return (
    <group position={[swing.pivot[0], 0, swing.pivot[1]]} rotation-y={swing.angle}>
      <group position={[-swing.pivot[0], 0, -swing.pivot[1]]}>{moved}</group>
    </group>
  )
}

// ── bounds and framing ──────────────────────────────────────────────

interface Bounds {
  assembled: THREE.Box3
  exploded: THREE.Box3
}

function computeBounds(model: ViewerModel, libParts: LibraryPart[][]): Bounds {
  const assembled = new THREE.Box3()
  const exploded = new THREE.Box3()
  const tmp = new THREE.Box3()
  model.parts.forEach((p) => {
    if (!p.geometry.boundingBox) p.geometry.computeBoundingBox()
    const bb = p.geometry.boundingBox
    if (!bb) return
    assembled.union(bb)
    exploded.union(bb)
    exploded.union(tmp.copy(bb).translate(new THREE.Vector3(p.explode[0], p.explode[1], p.explode[2])))
  })
  model.libraries.forEach((lib, i) => {
    const base = new THREE.Matrix4().compose(
      new THREE.Vector3(...(lib.position ?? [0, 0, 0])),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), lib.rotationY ?? 0),
      new THREE.Vector3(1, 1, 1),
    )
    ;(libParts[i] ?? []).forEach((part) => {
      const spec = lib.parts[part.name]
      if (!spec) return
      if (!part.geometry.boundingBox) part.geometry.computeBoundingBox()
      const bb = part.geometry.boundingBox
      if (!bb) return
      const m = base.clone()
      const swing = lib.swing?.[part.name]
      if (swing) {
        m.multiply(new THREE.Matrix4().makeTranslation(swing.pivot[0], 0, swing.pivot[1]))
        m.multiply(new THREE.Matrix4().makeRotationY(swing.angle))
        m.multiply(new THREE.Matrix4().makeTranslation(-swing.pivot[0], 0, -swing.pivot[1]))
      }
      assembled.union(tmp.copy(bb).applyMatrix4(m))
      exploded.union(tmp)
      m.multiply(new THREE.Matrix4().makeTranslation(spec.explode[0], spec.explode[1], spec.explode[2]))
      exploded.union(tmp.copy(bb).applyMatrix4(m))
    })
  })
  ;[assembled, exploded].forEach((b) => {
    if (b.isEmpty()) b.set(new THREE.Vector3(-500, 0, -500), new THREE.Vector3(500, 1000, 500))
    b.min.multiplyScalar(MM)
    b.max.multiplyScalar(MM)
  })
  return { assembled, exploded }
}

/**
 * Camera distance that fits the box at the default elevation for any
 * azimuth: the footprint is treated as a disc so turning never clips.
 */
function fitDistance(box: THREE.Box3, aspect: number, elevationDeg: number): number {
  const size = box.getSize(new THREE.Vector3())
  const r = Math.hypot(size.x, size.z) / 2
  const hy = size.y / 2
  const tanV = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const tanH = tanV * aspect
  const el = THREE.MathUtils.degToRad(elevationDeg)
  const sin = Math.sin(el)
  const cos = Math.cos(el)
  let d = 0
  for (const y of [-hy, hy]) {
    for (const [px, pz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
      const cy = y * cos - pz * sin
      const cf = y * sin + pz * cos
      d = Math.max(d, Math.max(Math.abs(px) / tanH, Math.abs(cy) / tanV) + cf)
    }
  }
  return d * FRAME_MARGIN
}

// ── scene ───────────────────────────────────────────────────────────

interface SceneProps extends ConfiguratorCanvasProps {
  items: LabelItem[]
  els: RefObject<Map<string, LabelEls>>
  interaction: Interaction
}

function Scene(props: SceneProps) {
  if (props.model.libraries.length === 0) return <SceneContent {...props} libParts={[]} />
  return <LibraryScene {...props} />
}

function LibraryScene(props: SceneProps) {
  const urls = useMemo(() => props.model.libraries.map((l) => l.url), [props.model])
  const gltfs = useGLTF(urls)
  const libParts = useMemo(() => urls.map((url, i) => libraryPartsFromScene(url, gltfs[i].scene)), [urls, gltfs])
  return <SceneContent {...props} libParts={libParts} />
}

// Scratch objects for the render loop.
const V_A = new THREE.Vector3()
const V_B = new THREE.Vector3()
const V_C = new THREE.Vector3()
const V_DIR = new THREE.Vector3()
const V_RIGHT = new THREE.Vector3()
const MAX_LABELS = 96

function SceneContent({
  model,
  libParts,
  revealed,
  exploded,
  showLabels,
  reducedMotion,
  compact,
  onReady,
  items,
  els,
  interaction,
}: SceneProps & { libParts: LibraryPart[][] }) {
  const flowWater = useWaterMaterial(5)
  // Still water is see-through so tank and sump internals stay readable; it
  // has no outline shell, so the opaque-water caveat in toon.tsx does not apply.
  const stillBase = useWaterMaterial(1.4)
  const stillWater = useMemo(() => {
    const m = stillBase.clone()
    m.transparent = true
    m.depthWrite = false
    m.uniforms.uOpacity.value = 0.62
    return m
  }, [stillBase])
  const stillSync = useRef({ from: stillBase, to: stillWater })
  useEffect(() => {
    stillSync.current = { from: stillBase, to: stillWater }
    return () => stillWater.dispose()
  }, [stillBase, stillWater])
  useFrame(() => {
    const { from, to } = stillSync.current
    to.uniforms.uTime.value = from.uniforms.uTime.value
  })
  const registry = useRef(new PartRegistry())
  const root = useRef<THREE.Group>(null)
  const controls = useRef<OrbitControlsImpl>(null)
  const thickness = compact ? 1.7 : 2.3

  const bounds = useMemo(() => computeBounds(model, libParts), [model, libParts])
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const fit = useMemo(() => {
    const box = exploded ? bounds.exploded : bounds.assembled
    return { center: box.getCenter(new THREE.Vector3()), distance: fitDistance(box, aspect, model.view.elevation) }
  }, [bounds, exploded, aspect, model.view.elevation])

  // Eased progress lives in a ref for the loop; the casing fade is mirrored
  // into state because it changes materials.
  const progress = useRef({ reveal: revealed ? 1 : 0, explode: exploded ? 1 : 0, fade: -1 })
  const [fade, setFade] = useState(() => Math.max(revealed ? 1 : 0, exploded ? BREAKOUT_FADE : 0))
  const [interacted, setInteracted] = useState(false)
  const cam = useRef({ placed: false, center: new THREE.Vector3(), distance: 1 })
  const placed = useRef(new Float32Array(MAX_LABELS * 4))

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useFrame((state, dt) => {
    const p = progress.current
    const step = Math.min(dt, 0.1)
    p.reveal = approach(p.reveal, revealed ? 1 : 0, reducedMotion ? 1 : step / REVEAL_SECONDS)
    p.explode = approach(p.explode, exploded ? 1 : 0, reducedMotion ? 1 : step / EXPLODE_SECONDS)
    const e = ease(p.explode)

    const list = registry.current.list
    for (let i = 0; i < list.length; i++) {
      const entry = list[i]
      entry.object.position.set(entry.explode.x * e, entry.explode.y * e, entry.explode.z * e)
    }

    const f = Math.max(ease(p.reveal), BREAKOUT_FADE * e)
    if (Math.abs(f - p.fade) > 0.02 || (f !== p.fade && (f === 0 || f === 1 || f === BREAKOUT_FADE))) {
      p.fade = f
      setFade(f)
    }

    // ── camera: place once, then ease to the fitted frame, keeping the
    // user's orbit direction and zoom ratio.
    const ctrl = controls.current
    const camera = state.camera
    if (ctrl) {
      const c = cam.current
      if (!c.placed) {
        const az = THREE.MathUtils.degToRad(model.view.azimuth)
        const el = THREE.MathUtils.degToRad(model.view.elevation)
        V_DIR.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
        c.center.copy(fit.center)
        c.distance = fit.distance
        ctrl.target.copy(c.center)
        camera.position.copy(c.center).addScaledVector(V_DIR, c.distance)
        camera.lookAt(c.center)
        c.placed = true
      } else if (c.center.distanceToSquared(fit.center) > 1e-10 || Math.abs(c.distance - fit.distance) > 1e-5) {
        const k = reducedMotion ? 1 : 1 - Math.exp(-step * 4.5)
        const zoom = camera.position.distanceTo(ctrl.target) / c.distance
        V_DIR.subVectors(camera.position, ctrl.target).normalize()
        c.center.lerp(fit.center, k)
        c.distance += (fit.distance - c.distance) * k
        if (c.center.distanceToSquared(fit.center) < 1e-9) c.center.copy(fit.center)
        if (Math.abs(c.distance - fit.distance) < 1e-4) c.distance = fit.distance
        ctrl.target.copy(c.center)
        camera.position.copy(c.center).addScaledVector(V_DIR, c.distance * zoom)
      }
    }

    // ── labels
    camera.updateMatrixWorld()
    const W = state.size.width
    const H = state.size.height
    const boxes = placed.current
    let count = 0
    const rootObj = root.current
    const frameNo = state.clock.elapsedTime
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const el = els.current.get(item.id)
      if (!el || !el.box) continue
      const focus = interaction.hovered === item.target || interaction.picked === item.target
      let alpha: number
      if (item.kind === 'part') alpha = focus ? 1 : showLabels ? e : 0
      else alpha = showLabels ? (item.hideWhenExploded ? 1 - e : 1) : 0

      const entry = item.target ? registry.current.byId.get(item.target) : undefined
      const obj = entry ? entry.object : item.target ? null : rootObj
      if (!obj || alpha < 0.02 || count >= MAX_LABELS) {
        hideLabel(el)
        continue
      }
      obj.updateWorldMatrix(true, false)
      const sideAnchored = item.kind === 'part' && !!entry
      if (item.anchor) V_A.copy(item.anchor)
      else if (entry) V_A.copy(sideAnchored ? entry.centre : entry.top)
      else V_A.set(0, 0, 0)
      V_A.applyMatrix4(obj.matrixWorld)

      // Anchors round the back of the model are dimmed, not hidden.
      V_B.subVectors(V_A, fit.center)
      V_DIR.subVectors(camera.position, fit.center)
      if (V_B.dot(V_DIR) < 0 && item.kind === 'callout') alpha *= 0.55

      // Part labels sit beside the part: anchor on its left or right edge.
      if (sideAnchored && entry) {
        V_RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(entry.radius * obj.matrixWorld.getMaxScaleOnAxis())
        V_B.copy(V_A).add(V_RIGHT).project(camera)
        V_C.copy(V_A).sub(V_RIGHT).project(camera)
      }
      V_A.project(camera)
      if (V_A.z > 1) {
        hideLabel(el)
        continue
      }
      const sx = (V_A.x * 0.5 + 0.5) * W
      const sy = (-V_A.y * 0.5 + 0.5) * H
      const rx = sideAnchored ? (V_B.x * 0.5 + 0.5) * W : sx
      const ry = sideAnchored ? (-V_B.y * 0.5 + 0.5) * H : sy
      const lx = sideAnchored ? (V_C.x * 0.5 + 0.5) * W : sx
      const ly = sideAnchored ? (-V_C.y * 0.5 + 0.5) * H : sy

      if (el.w === 0 || frameNo - el.measuredAt > 1.5) {
        el.w = el.box.offsetWidth
        el.h = el.box.offsetHeight
        el.measuredAt = frameNo
      }
      const w = el.w
      const h = el.h

      // Try the previous slot first so labels do not hop as the model turns.
      const order = sideAnchored ? PART_SLOTS : CALLOUT_SLOTS
      let best = -1
      let bestX = 0
      let bestY = 0
      let bestAx = sx
      let bestAy = sy
      let bestOverlap = Infinity
      for (let t = -1; t < order.length; t++) {
        const s = t === -1 ? el.slot : order[t]
        if (s < 0 || (t >= 0 && s === el.slot) || (t === -1 && order.indexOf(s) < 0)) continue
        const side = slotSide(s)
        const ax = side > 0 ? rx : side < 0 ? lx : sx
        const ay = side > 0 ? ry : side < 0 ? ly : sy
        const gx = ax + slotX(s, w)
        const gy = ay + slotY(s, h)
        const x = Math.min(Math.max(gx, 4), W - w - 4)
        const y = Math.min(Math.max(gy, 4), H - h - 4)
        let overlap = 0
        for (let b = 0; b < count; b++) {
          const o = b * 4
          const ox = Math.min(x + w, boxes[o + 2]) - Math.max(x, boxes[o])
          const oy = Math.min(y + h, boxes[o + 3]) - Math.max(y, boxes[o + 1])
          if (ox > -3 && oy > -3) overlap += (ox + 3) * (oy + 3)
        }
        // Clamping away from the slot counts against it a little.
        overlap += (Math.abs(x - gx) + Math.abs(y - gy)) * 2
        if (overlap < bestOverlap) {
          bestOverlap = overlap
          best = s
          bestX = x
          bestY = y
          bestAx = ax
          bestAy = ay
          if (overlap === 0) break
        }
      }
      el.slot = best
      const o = count * 4
      boxes[o] = bestX
      boxes[o + 1] = bestY
      boxes[o + 2] = bestX + w
      boxes[o + 3] = bestY + h
      count++

      showLabel(el, bestX, bestY, alpha, bestAx, bestAy, w, h)
    }
  })

  const shadowSize = Math.max(bounds.assembled.max.x - bounds.assembled.min.x, bounds.assembled.max.z - bounds.assembled.min.z) * 2.4
  const shadowCentre = bounds.assembled.getCenter(new THREE.Vector3())

  return (
    <>
      <group ref={root} scale={MM}>
        {model.parts.map((part) => (
          <DrawPart
            key={part.id}
            id={part.id}
            geometry={part.geometry}
            role={part.role}
            color={part.color}
            explode={part.explode}
            fade={fade}
            thickness={thickness}
            registry={registry}
            interaction={interaction}
            water={part.water === 'flow' ? flowWater : stillWater}
          />
        ))}
        {model.libraries.map((lib, i) => (
          <group key={`${lib.id}|${lib.url}`} position={lib.position ? tuple(lib.position) : undefined} rotation-y={lib.rotationY ?? 0}>
            {(libParts[i] ?? []).map((part) => {
              const spec = lib.parts[part.name]
              if (!spec) return null
              const id = `${lib.id}:${part.name}`
              return (
                <DrawPart
                  key={id}
                  id={id}
                  geometry={part.geometry}
                  role={spec.role}
                  explode={spec.explode}
                  fade={fade}
                  thickness={thickness}
                  registry={registry}
                  interaction={interaction}
                  swing={lib.swing?.[part.name]}
                />
              )
            })}
          </group>
        ))}
      </group>
      <ContactShadows
        key={model.key}
        position={[shadowCentre.x, 0.002, shadowCentre.z]}
        scale={shadowSize}
        resolution={512}
        far={Math.max(0.6, (bounds.assembled.max.y - bounds.assembled.min.y) * 0.5)}
        blur={2.6}
        opacity={0.42}
        color={TOON.ink}
        frames={1}
      />
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        enableZoom
        zoomSpeed={0.6}
        minDistance={fit.distance * 0.3}
        maxDistance={fit.distance * 1.8}
        autoRotate={!reducedMotion && !interacted}
        autoRotateSpeed={0.6}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI / 2 - 0.02}
        onStart={() => setInteracted(true)}
      />
    </>
  )
}

// Label slots round the anchor: above, right, left, below, the four
// diagonals, then further out above and below. Callouts try them in that
// order; part labels only sit beside their part.
const CALLOUT_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const PART_SLOTS = [1, 2, 4, 5, 6, 7]
/** 1 = right of the anchor, -1 = left, 0 = centred. */
function slotSide(s: number): number {
  return s === 1 || s === 4 || s === 6 ? 1 : s === 2 || s === 5 || s === 7 ? -1 : 0
}
function slotX(s: number, w: number): number {
  switch (s) {
    case 1:
    case 4:
    case 6:
      return 12
    case 2:
    case 5:
    case 7:
      return -w - 12
    default:
      return -w / 2
  }
}
function slotY(s: number, h: number): number {
  switch (s) {
    case 0:
      return -h - 14
    case 1:
    case 2:
      return -h / 2
    case 3:
      return 14
    case 4:
    case 5:
      return -h - 10
    case 6:
    case 7:
      return 10
    case 8:
      return -h - 46
    default:
      return 46
  }
}

function hideLabel(el: LabelEls) {
  if (el.alpha === 0) return
  el.alpha = 0
  if (el.box) el.box.style.visibility = 'hidden'
  if (el.line) el.line.setAttribute('visibility', 'hidden')
  if (el.dot) el.dot.setAttribute('visibility', 'hidden')
}

function showLabel(el: LabelEls, x: number, y: number, alpha: number, sx: number, sy: number, w: number, h: number) {
  const box = el.box
  if (!box) return
  const moved = Math.abs(x - el.x) > 0.3 || Math.abs(y - el.y) > 0.3
  if (el.alpha <= 0) box.style.visibility = 'visible'
  if (moved) box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
  if (Math.abs(alpha - el.alpha) > 0.01) box.style.opacity = alpha.toFixed(2)
  // Leader from the anchor to the nearest point of the label.
  const lx = Math.min(Math.max(sx, x), x + w)
  const ly = Math.min(Math.max(sy, y), y + h)
  const far = Math.hypot(lx - sx, ly - sy) > 3
  if (el.line) {
    if (far) {
      el.line.setAttribute('visibility', 'visible')
      el.line.setAttribute('x1', sx.toFixed(1))
      el.line.setAttribute('y1', sy.toFixed(1))
      el.line.setAttribute('x2', lx.toFixed(1))
      el.line.setAttribute('y2', ly.toFixed(1))
      el.line.style.opacity = alpha.toFixed(2)
    } else {
      el.line.setAttribute('visibility', 'hidden')
    }
  }
  if (el.dot) {
    el.dot.setAttribute('visibility', 'visible')
    el.dot.setAttribute('cx', sx.toFixed(1))
    el.dot.setAttribute('cy', sy.toFixed(1))
    el.dot.style.opacity = alpha.toFixed(2)
  }
  el.x = x
  el.y = y
  el.alpha = alpha
}

// ── canvas ──────────────────────────────────────────────────────────

export default function ConfiguratorCanvas(props: ConfiguratorCanvasProps) {
  const { model, canHover } = props
  const items = useMemo(() => labelItems(model), [model])
  const els = useRef(new Map<string, LabelEls>())
  const [hovered, setHovered] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)

  const interaction = useMemo<Interaction>(
    () => ({
      hovered,
      picked,
      canHover,
      onHover: (id) => setHovered(id),
      onHoverEnd: (id) => setHovered((h) => (h === id ? null : h)),
      onPick: (id) => setPicked((p) => (p === id ? null : id)),
    }),
    [hovered, picked, canHover],
  )

  return (
    <div className="absolute inset-0">
      <Canvas
        flat
        dpr={[1, 1.75]}
        camera={{ fov: FOV, near: 0.01, far: 200, position: [3, 2, 6] }}
        gl={{ antialias: true }}
        onPointerMissed={() => setPicked(null)}
        className={hovered ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
      >
        <color attach="background" args={['#ffffff']} />
        <ToonLights />
        <Suspense fallback={null}>
          <Scene {...props} items={items} els={els} interaction={interaction} />
        </Suspense>
      </Canvas>
      <LabelLayer items={items} els={els} />
    </div>
  )
}
