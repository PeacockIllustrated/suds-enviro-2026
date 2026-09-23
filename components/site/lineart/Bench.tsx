'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A park bench: timber seat and back slats on two cast end frames.
 *
 * Metres. `position` is the centre of the bench on the ground; the seat
 * faces +z before `rotation`. `length` defaults to 1.8.
 */

export interface BenchProps {
  position?: Vec3
  rotation?: number
  length?: number
  ink?: string
}

export function drawBench(s: Sketch, { position = [0, 0, 0], rotation = 0, length = 1.8, ink = LA.ink }: BenchProps) {
  const h = length / 2
  s.frame({ position, rotation }, () => {
    for (let i = 0; i < 3; i++) {
      const z = -0.2 + i * 0.15
      s.box([-h, 0.42, z], [h, 0.46, z + 0.11], { fill: LA.timber, ink: LA.timberInk, weight: 'fine' })
    }
    for (let i = 0; i < 2; i++) {
      const y = 0.58 + i * 0.16
      s.box([-h, y, -0.28], [h, y + 0.11, -0.24], { fill: LA.timber, ink: LA.timberInk, weight: 'fine' })
    }
    for (const x of [-h + 0.15, h - 0.15]) {
      s.polyline([[x, 0, 0.22], [x, 0.42, 0.18], [x, 0.42, -0.22], [x, 0, -0.2]], ink, 'line')
      s.line([x, 0.42, -0.24], [x, 0.9, -0.28], ink, 'line')
    }
  })
}

export function Bench(props: BenchProps) {
  return <LineArt drawing={kitDrawing('Bench', props, drawBench)} />
}
