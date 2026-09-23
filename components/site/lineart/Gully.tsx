'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A gully grating flush with the surface: a cast frame with dark slots
 * between the bars. Put one at the foot of a downpipe or in a channel
 * over a gully pot.
 *
 * Metres. `position` is the centre of the grating on the ground; bars run
 * along z before `rotation`. Default 0.6 x 0.35.
 */

export interface GullyProps {
  position?: Vec3
  rotation?: number
  width?: number
  depth?: number
  ink?: string
}

export function drawGully(s: Sketch, { position = [0, 0, 0], rotation = 0, width: w = 0.6, depth: d = 0.35, ink = LA.ink }: GullyProps) {
  s.frame({ position, rotation }, () => {
    const y = 0.008
    s.patch(-w / 2, -d / 2, w / 2, d / 2, y, { fill: LA.metal, ink, weight: 'fine' })
    s.patch(-w / 2 + 0.05, -d / 2 + 0.05, w / 2 - 0.05, d / 2 - 0.05, y + 0.001, { fill: LA.metalDark, ink: null })
    for (let bx = -w / 2 + 0.1; bx < w / 2 - 0.06; bx += 0.07) s.line([bx, y + 0.003, -d / 2 + 0.05], [bx, y + 0.003, d / 2 - 0.05], LA.metal, 'line')
  })
}

export function Gully(props: GullyProps) {
  return <LineArt drawing={kitDrawing('Gully', props, drawGully)} />
}
