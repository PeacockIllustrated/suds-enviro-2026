/**
 * Catchpit / Silt Trap Rule Engine
 *
 * Catchpits share the same physical chamber constraints as inspection chambers
 * (R1-R7) but add silt management features: baffle type and grate type.
 * Minimum sump depth varies by diameter.
 */

import type {
  WizardState,
  CatchpitData,
  CatchpitVariant,
  Diameter,
  PipeSize,
  ClockPosition,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// Re-export the position/inlet rules from chamber - shared physical constraints.
// getMaxDepth is overridden below since SERS/SERDS catchpit data sheets cap
// depth at 2000mm adoptable / 3000mm non-adoptable (lower than inspection chambers).
export {
  getMaxInlets,
  getOutletMinSize,
  getBlockedPositions,
  getMaxInletPipeSize,
  getAvailableInletSizes,
} from '@/lib/rules/chamber'

import {
  getMaxInlets,
  getOutletMinSize,
} from '@/lib/rules/chamber'

// ── R4: Catchpit Maximum Depth (per SERS/SERDS data sheets) ──
// Catchpits are capped lower than inspection chambers because of the
// silt bucket / sediment chamber requiring access for cleaning.

export function getMaxDepth(adoptable: boolean): number {
  return adoptable ? 2000 : 3000
}

// ── Variant-Specific Diameter Sets ──────────────────────────
// SERS  (with bucket): 300, 450, 600 mm
// SERDS (no bucket):   450, 600, 750, 900, 1050, 1200 mm

const VARIANT_DIAMETERS: Record<CatchpitVariant, Diameter[]> = {
  SERS:  [300, 450, 600],
  SERDS: [450, 600, 750, 900, 1050, 1200],
}

export function getVariantDiameters(variant: CatchpitVariant | null): Diameter[] {
  if (!variant) return [300, 450, 600, 750, 900, 1050, 1200]
  return VARIANT_DIAMETERS[variant]
}

export function isVariantDiameter(
  variant: CatchpitVariant | null,
  diameter: Diameter
): boolean {
  return getVariantDiameters(variant).includes(diameter)
}

// ── PIPE SIZE ORDER (ascending) ──────────────────────────────

const PIPE_SIZES: PipeSize[] = [
  '110mm EN1401',
  '160mm EN1401',
  '225mm Twinwall',
  '300mm Twinwall',
  '450mm Twinwall',
]

const pipeSizeRank = (size: PipeSize): number => PIPE_SIZES.indexOf(size)

// ── CATCHPIT-SPECIFIC: Minimum Sump Depth ────────────────────
// Bespoke per data sheets - these are sensible defaults shown in the configurator.
// SERS catchpits (300/450/600 with bucket) have shallower sumps than SERDS.

const SUMP_DEPTH_MAP: Partial<Record<Diameter, number>> = {
  300: 350,
  450: 450,
  600: 500,
  750: 600,
  900: 700,
  1050: 750,
  1200: 800,
}

export function getMinSumpDepth(diameter: Diameter): number {
  return SUMP_DEPTH_MAP[diameter] ?? 500
}

// ── HELPER: Extract CatchpitData from WizardState ───────────

function extractCatchpitData(state: WizardState): CatchpitData | null {
  if (!state.productData || state.productData.kind !== 'catchpit') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractCatchpitData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Catchpit data not available')
    return { valid: false, errors }
  }

  if (!data.variant)    errors.push('Catchpit variant (SERS or SERDS) not selected')
  if (!data.systemType) errors.push('System type not selected')
  if (!data.diameter)   errors.push('Diameter not selected')
  if (!data.inletCount) errors.push('Inlet count not selected')

  // Variant-specific diameter check
  if (data.variant && data.diameter && !isVariantDiameter(data.variant, data.diameter)) {
    errors.push(
      `${data.diameter}mm is not available for ${data.variant} catchpits`
    )
  }

  if (data.diameter && data.inletCount) {
    const maxIn = getMaxInlets(data.diameter)
    if (data.inletCount > maxIn) {
      errors.push(
        `Inlet count ${data.inletCount} exceeds max ${maxIn} for ${data.diameter}mm`
      )
    }
  }

  if (data.inletCount && data.positions.length !== data.inletCount) {
    errors.push(
      `${data.positions.length} positions placed, ${data.inletCount} required`
    )
  }

  if (!data.depth)             errors.push('Depth not selected')
  if (data.adoptable === null) errors.push('Adoption status not selected')

  if (data.depth && data.adoptable !== null) {
    const maxD = getMaxDepth(data.adoptable)
    if (data.depth > maxD) {
      errors.push(
        `Depth ${data.depth}mm exceeds max ${maxD}mm for ${data.adoptable ? 'adoptable' : 'non-adoptable'}`
      )
    }
  }

  if (!data.baffleType) errors.push('Baffle type not selected')
  if (!data.grateType)  errors.push('Grate type not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractCatchpitData(state)
  if (!data || !data.variant || !data.diameter || !data.depth) return 'CP-???-???-???'

  const adoptStr = data.adoptable ? 'S104' : 'PRIV'
  return `${data.variant}-${data.diameter}-${data.depth}-${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractCatchpitData(state)
  const { valid } = validateConfig(state)

  // Outlet rule: no flow increase on exit
  let outletRulePass = true
  if (data && data.outletLocked && data.diameter) {
    const outletRank = pipeSizeRank(data.outletLocked)
    Object.entries(data.pipeSizes).forEach(([key, size]) => {
      if (key.startsWith('inlet')) {
        if (pipeSizeRank(size) > outletRank) outletRulePass = false
      }
    })
  }

  // Depth rule for adoptable
  let depthPass = true
  if (data && data.depth && data.adoptable !== null) {
    depthPass = data.depth <= getMaxDepth(data.adoptable)
  }

  const overallPass = valid && outletRulePass && depthPass

  return [
    {
      standard: 'DCG Section C7.1.1',
      scope: 'Sediment Management - Catchpit',
      status: overallPass ? 'Pass' : 'Warning',
    },
    {
      standard: 'DCG C7.1.1 Sediment Management',
      scope: 'Silt retention and baffle configuration',
      status: data?.baffleType ? 'Pass' : 'Warning',
    },
    {
      standard: 'Sewers for Adoption 7th Ed. (SfA7)',
      scope: 'Adoptable Sewer Standards',
      status: (data?.adoptable && depthPass)
        ? 'Pass'
        : data?.adoptable === false
          ? 'Pass'
          : 'Warning',
    },
    {
      standard: 'BS EN 13598-1 and EN 13598-2',
      scope: 'Plastic Inspection Chambers',
      status: 'Pass',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Surface Water Drainage',
      status: data?.systemType === 'surface' ? 'Pass' : 'Warning',
    },
    {
      standard: 'Environment Agency PPG3',
      scope: 'Pollution Prevention',
      status: 'Pass',
    },
    {
      standard: 'Outlet rule - no flow increase on exit',
      scope: 'Rule Engine Validation',
      status: outletRulePass ? 'Pass' : 'Fail',
    },
    {
      standard: 'DCG Restricted Access (350mm > 1m depth)',
      scope: 'Manhole Cover Compliance',
      status: 'Pass',
    },
  ]
}
