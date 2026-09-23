'use client'

import { seeded } from './details'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A clipped hedge: a green block with a softly scalloped top and a few
 * leaf ticks on its face, so it reads as planting rather than a box.
 *
 * Metres. `position` is the centre of its foot on the front (+z) side; it
 * runs along x for `length` before `rotation`.
 */

export interface HedgeProps {
  position?: Vec3
  rotation?: number
  length?: number
  height?: number
  depth?: number
  seed?: number
}

export function drawHedge(s: Sketch, { position = [0, 0, 0], rotation = 0, length = 4, height = 1.0, depth = 0.8, seed = 1 }: HedgeProps) {
  const rand = seeded(seed)
  const half = length / 2
  s.frame({ position, rotation }, () => {
    const bumps = Math.max(2, Math.round(length / 0.55))
    const w = length / bumps
    const profile: Vec2[] = [[-half, 0], [half, 0]]
    for (let i = bumps; i > 0; i--) {
      const xb = -half + i * w
      for (let k = 0; k < 4; k++) {
        const t = k / 4
        profile.push([xb - w * t, height - 0.1 + Math.sin(t * Math.PI) * 0.1])
      }
    }
    profile.push([-half, height - 0.1])
    s.prism(profile, -depth, 0, { fill: LA.hedge, ink: LA.hedgeInk }, 50)
    // Leaf ticks scattered over the front face.
    const ticks = Math.round(length * 3)
    for (let i = 0; i < ticks; i++) {
      const x = -half + 0.15 + rand() * (length - 0.3)
      const y = 0.15 + rand() * (height - 0.35)
      s.polyline([[x - 0.06, y + 0.05, 0.004], [x, y, 0.004], [x + 0.06, y + 0.05, 0.004]], LA.hedgeInk, 'fine')
    }
  })
}

export function Hedge(props: HedgeProps) {
  return <LineArt drawing={kitDrawing('Hedge', props, drawHedge)} />
}
