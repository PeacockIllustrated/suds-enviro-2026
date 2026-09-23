'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A litter bin: a round body with a banded rim and a domed lid.
 *
 * Metres. `position` is the centre of its foot on the ground.
 */

export interface LitterBinProps {
  position?: Vec3
  color?: string
  ink?: string
}

export function drawLitterBin(s: Sketch, { position = [0, 0, 0], color = LA.paperCool, ink = LA.ink }: LitterBinProps) {
  s.frame({ position }, () => {
    s.cylinder([0, 0, 0], 0.24, 0.85, { radiusTop: 0.26, fill: color, ink, segments: 16 })
    s.cylinder([0, 0.85, 0], 0.28, 0.1, { fill: color, ink, weight: 'fine', segments: 16 })
    s.cylinder([0, 0.95, 0], 0.26, 0.1, { radiusTop: 0.12, fill: color, ink, weight: 'fine', segments: 16 })
    s.cylinder([0, 0.6, 0], 0.255, 0.08, { fill: LA.green, ink: LA.greenDark, weight: 'fine', segments: 16, caps: false })
  })
}

export function LitterBin(props: LitterBinProps) {
  return <LineArt drawing={kitDrawing('LitterBin', props, drawLitterBin)} />
}
