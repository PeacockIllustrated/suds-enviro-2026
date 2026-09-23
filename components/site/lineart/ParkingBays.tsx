'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A row of marked parking bays: painted dividing lines with a closing
 * line at the head, and optional bays tinted and lettered for electric
 * vehicle charging.
 *
 * Metres. `position` is the front-left corner of the first bay at ground
 * level; bays run along +x, `length` deep towards -z, before `rotation`.
 */

export interface ParkingBaysProps {
  position?: Vec3
  rotation?: number
  count?: number
  bayWidth?: number
  length?: number
  /** Indices of bays marked for EV charging. */
  ev?: number[]
  ink?: string
}

export function drawParkingBays(s: Sketch, { position = [0, 0, 0], rotation = 0, count = 4, bayWidth = 2.5, length = 4.8, ev = [], ink = LA.ink }: ParkingBaysProps) {
  const y = 0.006
  const lw = 0.1
  s.frame({ position, rotation }, () => {
    for (const i of ev) {
      s.patch(i * bayWidth + lw, -length, (i + 1) * bayWidth - lw, -0.3, y - 0.001, { fill: '#e3f3df', ink: null })
      // A lightning flash in the bay.
      const cx = (i + 0.5) * bayWidth
      const cz = -length * 0.35
      s.polygon([[cx - 0.1, y, cz - 0.5], [cx + 0.25, y, cz - 0.05], [cx + 0.02, y, cz - 0.05], [cx + 0.12, y, cz + 0.5], [cx - 0.25, y, cz + 0.05], [cx - 0.02, y, cz + 0.05]], { fill: LA.green, ink: null, shade: false })
    }
    for (let i = 0; i <= count; i++) {
      const x = i * bayWidth
      s.patch(x - lw / 2, -length, x + lw / 2, 0, y, { fill: LA.paper, ink, weight: 'fine' })
    }
    s.patch(0, -length - lw, count * bayWidth, -length, y, { fill: LA.paper, ink, weight: 'fine' })
  })
}

export function ParkingBays(props: ParkingBaysProps) {
  return <LineArt drawing={kitDrawing('ParkingBays', props, drawParkingBays)} />
}
