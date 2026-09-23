'use client'

import { drawGully } from './Gully'
import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * A rainwater downpipe's fittings: the hopper head at the top, fixing
 * brackets up the wall, and the back-inlet gully it discharges into. Set
 * `pipe` to draw the pipe too; leave it off where the pipe is drawn as a
 * flowing drainage run (the Site Explorer's blue water pipes).
 *
 * Metres. `position` is the pipe's centre line at the ground; it rises to
 * `top`. `wall` is the direction (radians about +y from +z) of the wall
 * behind it, so the brackets and hopper sit against it.
 */

export interface DownpipeProps {
  position?: Vec3
  top?: number
  radius?: number
  /** Direction to the wall behind the pipe, radians about +y from +z (default: wall at -z). */
  wall?: number
  pipe?: boolean
  gully?: boolean
  ink?: string
}

export function drawDownpipe(s: Sketch, { position = [0, 0, 0], top = 6, radius = 0.075, wall = Math.PI, pipe = false, gully = true, ink = LA.ink }: DownpipeProps) {
  s.frame({ position, rotation: wall - Math.PI }, () => {
    // In this frame the wall is at -z behind the pipe.
    if (pipe) s.cylinder([0, 0, 0], radius, top, { fill: LA.paper, ink, segments: 10 })
    const r = radius + 0.025
    // Hopper head: a flared box on the wall, open at the top.
    const hw = r * 2.4
    s.prism([[-hw * 0.55, top], [hw * 0.55, top], [hw, top + 0.38], [-hw, top + 0.38]], -r - 0.2, r + 0.06, { fill: LA.paper, ink })
    // Brackets every 1.8 m: a band round the pipe and a stub to the wall.
    for (let y = 0.9; y < top - 0.3; y += 1.8) {
      const pts: Vec3[] = []
      for (let i = 0; i <= 16; i++) {
        const t = (i / 16) * Math.PI * 2
        pts.push([Math.cos(t) * r, y, Math.sin(t) * r])
      }
      s.polyline(pts, ink, 'line')
      s.box([-0.03, y - 0.03, -r - 0.2], [0.03, y + 0.03, -r], { fill: LA.paper, ink, weight: 'fine' })
    }
    // Shoe and gully at the foot.
    if (gully) drawGully(s, { position: [0, 0, 0.1], width: 0.5, depth: 0.5, ink })
  })
}

export function Downpipe(props: DownpipeProps) {
  return <LineArt drawing={kitDrawing('Downpipe', props, drawDownpipe)} />
}
