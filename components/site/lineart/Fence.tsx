'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A close-boarded timber fence: square posts with caps, a gravel board
 * and boarded panels between, following a path of (x, z) points.
 *
 * Metres, at ground level, in the Sketch's frame (or moved by `position`).
 */

export interface FenceProps {
  points: Vec2[]
  position?: Vec3
  height?: number
  /** Post spacing. */
  pitch?: number
}

export function drawFence(s: Sketch, { points, position = [0, 0, 0], height = 1.5, pitch = 1.8 }: FenceProps) {
  const fill = LA.timber
  const ink = LA.timberInk
  s.frame({ position }, () => {
    for (let i = 1; i < points.length; i++) {
      const [ax, az] = points[i - 1]
      const [bx, bz] = points[i]
      const len = Math.hypot(bx - ax, bz - az)
      const angle = Math.atan2(-(bz - az), bx - ax)
      s.frame({ position: [ax, 0, az], rotation: angle }, () => {
        // Panel and gravel board, in the run's own frame (x along it).
        s.box([0, 0.15, -0.03], [len, height - 0.05, 0.03], { fill, ink, weight: 'fine' })
        s.box([0, 0, -0.04], [len, 0.15, 0.04], { fill: '#e7dccb', ink, weight: 'fine' })
        for (let x = 0.12; x < len - 0.05; x += 0.12) {
          s.line([x, 0.15, 0.032], [x, height - 0.05, 0.032], ink, 'fine')
          s.line([x, 0.15, -0.032], [x, height - 0.05, -0.032], ink, 'fine')
        }
        s.box([0, height - 0.12, 0.03], [len, height - 0.06, 0.06], { fill, ink, weight: 'fine' })
        const posts = Math.max(1, Math.round(len / pitch))
        for (let k = i === 1 ? 0 : 1; k <= posts; k++) {
          const px = (len * k) / posts
          s.box([px - 0.05, 0, -0.05], [px + 0.05, height + 0.05, 0.05], { fill, ink, weight: 'line' })
          s.box([px - 0.07, height + 0.05, -0.07], [px + 0.07, height + 0.09, 0.07], { fill, ink, weight: 'fine' })
        }
      })
    }
  })
}

export function Fence(props: FenceProps) {
  return <LineArt drawing={kitDrawing('Fence', props, drawFence)} />
}
