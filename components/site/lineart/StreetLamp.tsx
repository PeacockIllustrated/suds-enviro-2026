'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A lamp column: a tapered pole on a base with its access door, a
 * slender outreach arm and a flat LED lantern (one or two heads).
 *
 * Metres. `position` is the foot of the column; the arm reaches along +x
 * before `rotation`. `height` is to the lantern (default 6).
 */

export interface StreetLampProps {
  position?: Vec3
  rotation?: number
  height?: number
  /** One head, or two back to back. */
  double?: boolean
  ink?: string
}

export function drawStreetLamp(s: Sketch, { position = [0, 0, 0], rotation = 0, height = 6, double = false, ink = LA.ink }: StreetLampProps) {
  s.frame({ position, rotation }, () => {
    s.cylinder([0, 0, 0], 0.13, 0.7, { fill: LA.paper, ink, segments: 12 })
    s.line([0.07, 0.25, 0.1], [0.07, 0.55, 0.1], ink, 'fine')
    s.cylinder([0, 0.7, 0], 0.08, height - 0.7 + 0.1, { radiusTop: 0.05, fill: LA.paper, ink, segments: 10 })
    for (const dir of double ? [1, -1] : [1]) {
      const reach = 1.1
      // The arm rises a little to the lantern.
      s.line([0, height - 0.05, 0], [dir * reach, height + 0.12, 0], ink, 'line')
      s.line([0, height - 0.12, 0], [dir * reach * 0.6, height + 0.03, 0], ink, 'fine')
      const lx = dir * (reach + 0.28)
      s.box([lx - 0.34, height + 0.04, -0.14], [lx + 0.34, height + 0.16, 0.14], { fill: LA.paper, ink, weight: 'fine' })
      s.box([lx - 0.28, height - 0.0, -0.1], [lx + 0.28, height + 0.04, 0.1], { fill: LA.glass, ink, weight: 'fine' })
    }
  })
}

export function StreetLamp(props: StreetLampProps) {
  return <LineArt drawing={kitDrawing('StreetLamp', props, drawStreetLamp)} />
}
