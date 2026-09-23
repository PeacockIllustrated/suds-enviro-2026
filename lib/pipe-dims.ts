/**
 * Physical pipe dimensions used to draw chambers, shared by the 3D viewer
 * and the engineering drawing so both place pipes at the same heights.
 */

import type { PipeSize } from '@/lib/types'

export interface PipeDims {
  /** Outside diameter drawn, mm. */
  od: number
  /** Bore, mm. */
  bore: number
}

/**
 * EN 1401 sizes are outside diameters (SN4 walls); twinwall sizes are
 * nominal bores, with the typical corrugated outside diameter.
 */
export const PIPE_DIMS: Record<PipeSize, PipeDims> = {
  '110mm EN1401': { od: 110, bore: 104 },
  '160mm EN1401': { od: 160, bore: 151 },
  '225mm Twinwall': { od: 270, bore: 225 },
  '300mm Twinwall': { od: 350, bore: 300 },
  '450mm Twinwall': { od: 520, bore: 450 },
}
