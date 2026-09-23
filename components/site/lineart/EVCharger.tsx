'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * An electric vehicle charge point: a slim pedestal on a plinth with a
 * screen, a green status light, a holstered connector and a coiled cable.
 * Or `mount: 'wall'` for a wallbox fixed to a face.
 *
 * Metres. `position` is the centre of its foot (or the back of the
 * wallbox at `height`); the screen faces +z before `rotation`.
 */

export interface EVChargerProps {
  position?: Vec3
  rotation?: number
  mount?: 'post' | 'wall'
  /** Wallbox mounting height. */
  height?: number
  ink?: string
}

function drawUnit(s: Sketch, y: number, ink: string) {
  // Unit body with a rounded-off top edge.
  s.prism([[-0.16, y], [0.16, y], [0.16, y + 0.46], [0.12, y + 0.52], [-0.12, y + 0.52], [-0.16, y + 0.46]], -0.12, 0.12, { fill: LA.paper, ink })
  s.rect(-0.1, y + 0.26, 0.2, 0.16, 0.124, { fill: LA.asphaltLight, ink, weight: 'fine', shade: false })
  s.rect(-0.1, y + 0.18, 0.2, 0.035, 0.124, { fill: LA.green, ink: null, shade: false })
  // Holster and connector on the side, cable looping down.
  s.box([0.16, y + 0.12, -0.05], [0.22, y + 0.3, 0.05], { fill: LA.asphaltLight, ink: LA.asphaltInk, weight: 'fine' })
  const loop: Vec3[] = []
  for (let i = 0; i <= 14; i++) {
    const t = (i / 14) * Math.PI * 1.7
    loop.push([0.22 + Math.sin(t) * 0.12, y + 0.1 - (1 - Math.cos(t)) * 0.22, 0.02 + Math.sin(t * 0.5) * 0.04])
  }
  s.polyline(loop, LA.asphaltInk, 'line')
}

export function drawEVCharger(s: Sketch, { position = [0, 0, 0], rotation = 0, mount = 'post', height = 1.0, ink = LA.ink }: EVChargerProps) {
  s.frame({ position, rotation }, () => {
    if (mount === 'post') {
      s.box([-0.2, 0, -0.16], [0.2, 0.12, 0.16], { fill: LA.concrete, ink, weight: 'fine' })
      s.box([-0.08, 0.12, -0.07], [0.08, 0.85, 0.07], { fill: LA.paper, ink })
      drawUnit(s, 0.85, ink)
    } else {
      drawUnit(s, height, ink)
    }
  })
}

export function EVCharger(props: EVChargerProps) {
  return <LineArt drawing={kitDrawing('EVCharger', props, drawEVCharger)} />
}
