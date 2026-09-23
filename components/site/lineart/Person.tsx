'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec2, Vec3 } from './sketch'

/**
 * A small person, drawn as a flat cut-out turned square to the viewer,
 * the way an architectural illustrator drops figures in for scale.
 *
 * Metres. `position` is between their feet; `height` defaults to 1.75.
 */

export interface PersonProps {
  position?: Vec3
  height?: number
  pose?: 'stand' | 'walk'
  shirt?: string
  trousers?: string
  /** Flip the figure left to right. */
  flip?: boolean
  ink?: string
}

export function drawPerson(s: Sketch, { position = [0, 0, 0], height = 1.75, pose = 'stand', shirt = LA.shirtBlue, trousers = LA.trousers, flip = false, ink = LA.ink }: PersonProps) {
  const k = height / 1.75
  const f = flip ? -1 : 1
  const P = (pts: Vec2[]): Vec2[] => pts.map(([a, b]) => [a * k * f, b * k])
  const legs: Vec2[] =
    pose === 'walk'
      ? [[-0.24, 0], [-0.12, 0], [0.0, 0.5], [0.1, 0], [0.22, 0], [0.13, 0.9], [-0.13, 0.9]]
      : [[-0.15, 0], [-0.04, 0], [0, 0.66], [0.04, 0], [0.15, 0], [0.14, 0.9], [-0.14, 0.9]]
  const body: Vec2[] = [[-0.19, 0.86], [0.19, 0.86], [0.23, 1.38], [0.11, 1.47], [-0.11, 1.47], [-0.23, 1.38]]
  const armA: Vec2[] = pose === 'walk' ? [[0.19, 1.38], [0.25, 1.35], [0.34, 1.0], [0.28, 0.97]] : [[0.19, 1.38], [0.25, 1.36], [0.26, 0.96], [0.2, 0.95]]
  const armB: Vec2[] = pose === 'walk' ? [[-0.19, 1.38], [-0.25, 1.35], [-0.3, 1.0], [-0.24, 0.98]] : [[-0.19, 1.38], [-0.25, 1.36], [-0.26, 0.96], [-0.2, 0.95]]
  const head: Vec2[] = []
  for (let i = 0; i < 14; i++) {
    const t = (i / 14) * Math.PI * 2
    head.push([Math.cos(t) * 0.11, 1.6 + Math.sin(t) * 0.12])
  }
  s.billboard(position, P(legs), { fill: trousers, ink, weight: 'fine' }, 0)
  s.billboard(position, P(armB), { fill: shirt, ink, weight: 'fine' }, 1)
  s.billboard(position, P(body), { fill: shirt, ink, weight: 'fine' }, 2)
  s.billboard(position, P(armA), { fill: shirt, ink, weight: 'fine' }, 3)
  s.billboard(position, P(head), { fill: LA.skin, ink, weight: 'fine' }, 3)
}

export function Person(props: PersonProps) {
  return <LineArt drawing={kitDrawing('Person', props, drawPerson)} />
}
