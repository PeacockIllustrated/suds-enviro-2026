'use client'

import { Suspense } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { Vec3 } from './sketch'

/**
 * Artwork (a logo, a fascia name) on a flat panel facing +z, for sign
 * boards drawn by the kit. One draw call; suspends while the image loads
 * and draws nothing until it has.
 *
 * Metres. `position` is the centre of the artwork; `width` its width, the
 * height following the image's `aspect` (width / height).
 */

export interface LogoPanelProps {
  url?: string
  position: Vec3
  rotation?: number
  width: number
  aspect?: number
}

function Artwork({ url, position, rotation = 0, width, aspect }: Required<Omit<LogoPanelProps, 'rotation'>> & { rotation?: number }) {
  const texture = useTexture(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
  })
  return (
    <mesh position={position} rotation={[0, rotation, 0]} raycast={() => {}}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

export function LogoPanel({ url = '/logos/suds/horizontal-main.png', position, rotation, width, aspect = 993 / 154 }: LogoPanelProps) {
  return (
    <Suspense fallback={null}>
      <Artwork url={url} position={position} rotation={rotation} width={width} aspect={aspect} />
    </Suspense>
  )
}
