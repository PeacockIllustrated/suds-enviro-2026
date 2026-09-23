'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A street bollard with a reflective band and a domed cap.
 *
 * Metres. `position` is the centre of its foot; `height` defaults to 0.95.
 */

export interface BollardProps {
  position?: Vec3
  height?: number
  color?: string
  ink?: string
}

export function drawBollard(s: Sketch, { position = [0, 0, 0], height = 0.95, color = LA.paper, ink = LA.ink }: BollardProps) {
  s.frame({ position }, () => {
    s.cylinder([0, 0, 0], 0.1, height, { fill: color, ink, segments: 12 })
    s.cylinder([0, height, 0], 0.1, 0.06, { radiusTop: 0.05, fill: color, ink, weight: 'fine', segments: 12 })
    s.cylinder([0, height - 0.22, 0], 0.102, 0.07, { fill: LA.inkSoft, ink, weight: 'fine', segments: 12, caps: false })
  })
}

export function Bollard(props: BollardProps) {
  return <LineArt drawing={kitDrawing('Bollard', props, drawBollard)} />
}
