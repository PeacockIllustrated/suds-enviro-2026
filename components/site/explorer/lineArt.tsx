'use client'

import { useMemo, type ReactNode } from 'react'
import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec3 } from './explorerLayout'

/**
 * The line-art kit for the Site Explorer: white volumes with thin
 * site-blue ink edges and pale blue glazing, the look of the isometric
 * drawing on the old Webflow site.
 *
 * Fills sit back a touch (polygon offset) so the ink lines that share
 * their edges always draw on top instead of flickering through them.
 */

export const ART = {
  ink: '#1d80b9',
  inkDark: '#005576',
  paper: '#ffffff',
  paperShade: '#f5f9fb',
  glass: '#cfe8f7',
  glassInk: '#5aa6d3',
  ground: '#f1f4f6',
  asphalt: '#3a3a3c',
  asphaltInk: '#232325',
  soil: ['#c29a6b', '#a4764b', '#825633'] as const,
  soilInk: '#5e3d22',
  grass: '#d6edcf',
  grassInk: '#54b54d',
  tree: '#7cc36f',
  treeInk: '#2f8a3a',
  trunk: '#8a6a4a',
  timber: '#f1e2c8',
  timberInk: '#a07a4c',
  red: '#c34c4a',
  tyre: '#3a3a3c',
} as const

export const LINE = 1.15

/**
 * A flat, unlit fill: the drawing's paper. Unlit so fills land exactly on
 * their colours under the toon light rig the product models need.
 */
export function Paper({ color = ART.paper, opacity = 1, side }: { color?: string; opacity?: number; side?: THREE.Side }) {
  return (
    <meshBasicMaterial
      color={color}
      polygonOffset
      polygonOffsetFactor={1}
      polygonOffsetUnits={1}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 1}
      side={side}
    />
  )
}

export interface InkBoxProps {
  position: Vec3
  size: Vec3
  color?: string
  ink?: string
  rotation?: Vec3
  lineWidth?: number
  children?: ReactNode
}

/** A box drawn as line art. `position` is its centre. */
export function InkBox({ position, size, color = ART.paper, ink = ART.ink, rotation, lineWidth = LINE, children }: InkBoxProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <Paper color={color} />
      <Edges color={ink} lineWidth={lineWidth} threshold={20} />
      {children}
    </mesh>
  )
}

/** A box given by two corners rather than a centre and size. */
export function InkSlab({ from, to, color, ink, lineWidth }: { from: Vec3; to: Vec3; color?: string; ink?: string; lineWidth?: number }) {
  const position: Vec3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]
  const size: Vec3 = [Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), Math.abs(to[2] - from[2])]
  return <InkBox position={position} size={size} color={color} ink={ink} lineWidth={lineWidth} />
}

/** Rectangles in a plane, as [x, y, width, height] from the bottom-left. */
export type Rect = [number, number, number, number]

function panelGeometry(rects: Rect[]): THREE.BufferGeometry {
  const pos: number[] = []
  const idx: number[] = []
  rects.forEach(([x, y, w, h], i) => {
    pos.push(x, y, 0, x + w, y, 0, x + w, y + h, 0, x, y + h, 0)
    const o = i * 4
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3)
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/**
 * Flat panels (windows, doors, signs) on a face, merged into one mesh.
 * The group's own +z is the face normal; rects are laid out in its x/y.
 */
export function Panels({ rects, position, rotation = [0, 0, 0], color = ART.glass, ink = ART.ink }: {
  rects: Rect[]
  position: Vec3
  rotation?: Vec3
  color?: string
  ink?: string
}) {
  const geometry = useMemo(() => panelGeometry(rects), [rects])
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        <Edges color={ink} lineWidth={LINE} threshold={20} />
      </mesh>
    </group>
  )
}

/** A regular grid of windows: cols x rows, each w x h, pitched px x py, from ox, oy. */
export function windowGrid(cols: number, rows: number, w: number, h: number, px: number, py: number, ox: number, oy: number): Rect[] {
  const out: Rect[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push([ox + c * px, oy + r * py, w, h])
  return out
}

/** Hover and click handling for anything that selects a plot. */
export function selectHandlers(onSelect: () => void) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onSelect()
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setCursor(e, 'pointer')
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => setCursor(e, ''),
  }
}

function setCursor(e: ThreeEvent<PointerEvent>, cursor: string) {
  const target = e.nativeEvent.target
  if (target instanceof HTMLElement) target.style.cursor = cursor
}
