'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The shared 3D look for the marketing site: the toon shading with inked
 * outlines the Webflow site's Spline scenes were built on.
 *
 * - ToonModel renders any model from the 3D library
 *   (public/models/library/v1) in this style, part by part, with casings
 *   that can fade to show what is inside.
 * - WaterMaterial is the flowing, banded water used for pipes and streams.
 *
 * Library files are Meshopt compressed with quantised attributes; parts are
 * dequantised into float geometry once per file so outlines, which extrude
 * along normals, are not distorted by the quantisation scale.
 */

export const TOON = {
  ink: '#0e4f73',
  inkSoft: '#3d8fbf',
  body: '#e6f4fb',
  bodyShade: '#cfe6f3',
  accent: '#1d80b9',
  accentLight: '#afdbf4',
  green: '#54b54d',
  red: '#c34c4a',
  yellow: '#ffe313',
  water: '#6cc3ec',
  waterDeep: '#1d80b9',
  waterFoam: '#ffffff',
} as const

/** What a library part is for, which decides how it is drawn. */
export type PartRole = 'body' | 'casing' | 'insides' | 'accent' | 'inlet' | 'xray'

// ── toon ramp ───────────────────────────────────────────────────────

let rampTexture: THREE.DataTexture | null = null
/** Four hard light bands; the nearest filter is what makes it read as toon. */
export function toonRamp(): THREE.DataTexture {
  if (rampTexture) return rampTexture
  const steps = [128, 188, 228, 255]
  const data = new Uint8Array(steps.length * 4)
  steps.forEach((v, i) => data.set([v, v, v, 255], i * 4))
  rampTexture = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat)
  rampTexture.minFilter = THREE.NearestFilter
  rampTexture.magFilter = THREE.NearestFilter
  rampTexture.generateMipmaps = false
  rampTexture.needsUpdate = true
  return rampTexture
}

const ROLE_COLOUR: Record<PartRole, string> = {
  body: TOON.body,
  casing: TOON.body,
  insides: TOON.accentLight,
  accent: TOON.accent,
  inlet: TOON.green,
  xray: '#cdeaf8',
}

// ── library geometry ────────────────────────────────────────────────

export interface LibraryPart {
  /** The part's node name in the assembled file (e.g. "casing"). */
  name: string
  geometry: THREE.BufferGeometry
}

/** Copy an attribute out of its quantised form into plain floats. */
function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, size: number) {
  const out = new Float32Array(attr.count * size)
  for (let i = 0; i < attr.count; i++) {
    out[i * size] = attr.getX(i)
    if (size > 1) out[i * size + 1] = attr.getY(i)
    if (size > 2) out[i * size + 2] = attr.getZ(i)
  }
  return new THREE.BufferAttribute(out, size)
}

const partCache = new Map<string, LibraryPart[]>()

/**
 * The parts of a library file as float geometry in millimetres, grouped by
 * the part node they sit under. Cached per URL.
 */
export function useLibraryParts(url: string): LibraryPart[] {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const cached = partCache.get(url)
    if (cached) return cached
    scene.updateMatrixWorld(true)
    // Assembled files are root > product node > part nodes; part files are
    // root > part node. The part is the ancestor just below the product.
    const product = scene.children.length === 1 && !(scene.children[0] as THREE.Mesh).isMesh ? scene.children[0] : scene
    const byPart = new Map<string, THREE.BufferGeometry[]>()
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      let node: THREE.Object3D = mesh
      while (node.parent && node.parent !== product && node.parent !== scene) node = node.parent
      const name = node === mesh && product === scene ? mesh.name : node.name
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', toFloat(mesh.geometry.getAttribute('position'), 3))
      if (mesh.geometry.index) g.setIndex(mesh.geometry.index.clone())
      g.applyMatrix4(mesh.matrixWorld)
      g.computeVertexNormals()
      const list = byPart.get(name) ?? []
      list.push(g)
      byPart.set(name, list)
    })
    const parts = [...byPart.entries()].map(([name, geoms]) => ({
      name,
      geometry: geoms.length === 1 ? geoms[0] : mergeGeometries(geoms),
    }))
    partCache.set(url, parts)
    return parts
  }, [scene, url])
}

/** Minimal merge for float, indexed geometries (position + normal). */
function mergeGeometries(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let vCount = 0
  let iCount = 0
  list.forEach((g) => {
    vCount += g.getAttribute('position').count
    iCount += g.index ? g.index.count : g.getAttribute('position').count
  })
  const pos = new Float32Array(vCount * 3)
  const nor = new Float32Array(vCount * 3)
  const idx = new Uint32Array(iCount)
  let v = 0
  let i = 0
  list.forEach((g) => {
    const p = g.getAttribute('position').array as Float32Array
    const n = g.getAttribute('normal').array as Float32Array
    pos.set(p, v * 3)
    nor.set(n, v * 3)
    const count = g.getAttribute('position').count
    if (g.index) {
      const src = g.index.array
      for (let k = 0; k < src.length; k++) idx[i + k] = src[k] + v
      i += src.length
    } else {
      for (let k = 0; k < count; k++) idx[i + k] = v + k
      i += count
    }
    v += count
  })
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  out.setIndex(new THREE.BufferAttribute(idx, 1))
  return out
}

// ── drawing a part ──────────────────────────────────────────────────

export interface ToonMeshProps {
  geometry: THREE.BufferGeometry
  color?: string
  /** 0..1; below 1 the part turns see-through and its outline thins. */
  opacity?: number
  outline?: string
  /** Outline width in screen pixels. */
  thickness?: number
}

export function ToonMesh({ geometry, color = TOON.body, opacity = 1, outline = TOON.ink, thickness = 2.4 }: ToonMeshProps) {
  const see = opacity < 0.999
  return (
    <mesh geometry={geometry} renderOrder={see ? 2 : 0}>
      <meshToonMaterial
        color={color}
        gradientMap={toonRamp()}
        transparent={see}
        opacity={opacity}
        depthWrite={!see}
        side={see ? THREE.DoubleSide : THREE.FrontSide}
      />
      {/* drei 10.7's Outlines has its branches swapped: screenspace={true}
          extrudes in model units, false offsets in clip space by pixels.
          Pixels are what we want, so this is deliberately false. */}
      <Outlines
        screenspace={false}
        thickness={see ? thickness * 0.6 : thickness}
        color={outline}
        toneMapped={false}
        transparent={see}
        opacity={see ? Math.min(1, opacity * 2.5) : 1}
        angle={Math.PI / 5}
      />
    </mesh>
  )
}

// ── a whole library model ───────────────────────────────────────────

export interface ToonModelProps {
  url: string
  /** Part node name to role; unlisted parts are drawn as body. */
  roles?: Record<string, PartRole>
  /** 0 = casings solid, 1 = casings see-through to show the insides. */
  reveal?: number
  /** Uniform scale applied to the millimetre geometry. */
  scale?: number
  thickness?: number
  /** Called with the part name under the pointer, or null. */
  onPartHover?: (part: string | null) => void
}

export function ToonModel({ url, roles = {}, reveal = 0, scale = 0.001, thickness = 2.4, onPartHover }: ToonModelProps) {
  const parts = useLibraryParts(url)
  return (
    <group scale={scale}>
      {parts.map((part) => {
        const role = roles[part.name] ?? 'body'
        const opacity = role === 'casing' ? 1 - 0.86 * reveal : role === 'xray' ? 0.1 : 1
        return (
          <group
            key={part.name}
            onPointerOver={onPartHover ? (e) => { e.stopPropagation(); onPartHover(part.name) } : undefined}
            onPointerOut={onPartHover ? () => onPartHover(null) : undefined}
          >
            <ToonMesh
              geometry={part.geometry}
              color={ROLE_COLOUR[role]}
              opacity={opacity}
              outline={role === 'inlet' ? '#2f7c3a' : TOON.ink}
              thickness={thickness}
            />
          </group>
        )
      })}
    </group>
  )
}

// ── water ───────────────────────────────────────────────────────────

const waterVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const waterFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uFlow;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Toon light: three hard bands from a key light up and to the side.
    vec3 L = normalize(vec3(0.4, 0.8, 0.5));
    float d = dot(normalize(vNormal), L);
    float band = d > 0.55 ? 1.0 : d > 0.05 ? 0.72 : 0.5;
    vec3 col = mix(uDeep, uShallow, band);
    // Flow: soft streaks travelling along the pipe, and foam flecks.
    float along = vUv.x * uFlow - uTime * 0.9;
    float streak = smoothstep(0.82, 0.96, fract(along + sin(vUv.y * 6.2831) * 0.06));
    col = mix(col, uFoam, streak * 0.55);
    float fleck = step(0.985, fract(sin(floor(along * 3.0) * 12.9898 + floor(vUv.y * 8.0) * 78.233) * 43758.5453));
    col = mix(col, uFoam, fleck * 0.8);
    // Hard rim highlight, the Spline water's glassy edge.
    float rim = 1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0);
    col = mix(col, uFoam, step(0.72, rim) * 0.6);
    gl_FragColor = vec4(col, uOpacity * (0.82 + 0.18 * rim));
  }
`

/** Banded, flowing toon water. `flow` is how many streaks per pipe length. */
export function useWaterMaterial(flow = 18) {
  const mat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: waterVertex,
      fragmentShader: waterFragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.95 },
        uFlow: { value: flow },
        uShallow: { value: new THREE.Color(TOON.water) },
        uDeep: { value: new THREE.Color(TOON.waterDeep) },
        uFoam: { value: new THREE.Color(TOON.waterFoam) },
      },
    }),
    [flow],
  )
  const ref = useRef(mat)
  useFrame((_, dt) => {
    ref.current.uniforms.uTime.value += dt
  })
  return mat
}

// ── lighting ────────────────────────────────────────────────────────

/**
 * The light rig the toon ramp is tuned for. Use it with <Canvas flat> (no
 * tone mapping) so the bands land on the authored colours.
 */
export function ToonLights() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 6, 4]} intensity={1.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
    </>
  )
}
