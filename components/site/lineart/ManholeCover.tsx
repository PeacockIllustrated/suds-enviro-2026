'use client'

import { LineArt } from './LineArt'
import { kitDrawing } from './materials'
import { LA } from './palette'
import type { Sketch, Vec3 } from './sketch'

/**
 * An access cover flush with the surface, over a chamber below: a square
 * frame with a round or square lid, patterned with a chequer of fine
 * lines, and optionally cut in half where a section runs through it.
 *
 * Metres. `position` is the centre of the cover on the ground; `size` is
 * the clear opening (default 0.6). `cut` keeps only the part behind z = 0
 * of its own frame, for covers on a section line.
 */

export interface ManholeCoverProps {
  position?: Vec3
  rotation?: number
  size?: number
  shape?: 'round' | 'square'
  cut?: boolean
  ink?: string
}

export function drawManholeCover(s: Sketch, { position = [0, 0, 0], rotation = 0, size = 0.6, shape = 'round', cut = false, ink = LA.ink }: ManholeCoverProps) {
  const r = size / 2
  const f = r + 0.1
  const zMax = cut ? 0 : f
  const y = 0.008
  s.frame({ position, rotation }, () => {
    s.patch(-f, -f, f, zMax, y, { fill: LA.metal, ink, weight: 'fine' })
    if (shape === 'round') {
      const pts: Vec3[] = []
      const steps = 28
      for (let i = 0; i <= steps; i++) {
        const t = cut ? Math.PI + (i / steps) * Math.PI : (i / steps) * Math.PI * 2
        pts.push([Math.cos(t) * r, y + 0.001, Math.sin(t) * r])
      }
      s.polygon(pts, { fill: '#cfd9e0', ink, weight: 'fine', shade: false })
    } else {
      s.patch(-r, -r, r, Math.min(r, zMax), y + 0.001, { fill: '#cfd9e0', ink, weight: 'fine' })
    }
    // Chequer pattern.
    for (let k = -r + 0.08; k < r - 0.04; k += 0.08) {
      const span = shape === 'round' ? Math.sqrt(Math.max(0, r * r - k * k)) - 0.03 : r - 0.03
      if (span <= 0) continue
      s.line([k, y + 0.003, -span], [k, y + 0.003, Math.min(span, zMax)], LA.metalDark, 'fine')
      if (!cut || k < 0) s.line([-span, y + 0.003, k], [span, y + 0.003, k], LA.metalDark, 'fine')
    }
  })
}

export function ManholeCover(props: ManholeCoverProps) {
  return <LineArt drawing={kitDrawing('ManholeCover', props, drawManholeCover)} />
}
