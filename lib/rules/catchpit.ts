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
  SystemType,
  BaffleType,
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
  validatePipework,
  pipeworkRulesPass,
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

// ── SYSTEM TYPE ──────────────────────────────────────────────
// SERS and SERDS are silt and debris catchpits for runoff from hard
// surfaces (paths, roofs, car parks, highways) per both data sheets, so
// they are surface water products only.

export const CATCHPIT_SYSTEM_TYPES: SystemType[] = ['surface']

// ── BAFFLE ───────────────────────────────────────────────────
// The SERS data sheet specifies "Primary baffle plus removable silt
// bucket", so a SERS catchpit always has a baffle.

export function getAllowedBaffles(variant: CatchpitVariant | null): BaffleType[] {
  if (variant === 'SERS') return ['internal', 'external']
  return ['none', 'internal', 'external']
}

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

  if (data.systemType && !CATCHPIT_SYSTEM_TYPES.includes(data.systemType)) {
    errors.push('SERS and SERDS catchpits are for surface water systems only')
  }

  validatePipework(data, errors)

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

  if (!data.baffleType) {
    errors.push('Baffle type not selected')
  } else if (!getAllowedBaffles(data.variant).includes(data.baffleType)) {
    errors.push('SERS catchpits are supplied with a primary baffle')
  }
  if (!data.grateType)  errors.push('Grate type not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────
// {SERS|SERDS}{diameter}-{depth}-{S104|PRIV}. Series and diameter are
// joined as in the model library codes (SEHDS1800, SERSIC600300).

export function generateProductCode(state: WizardState): string {
  const data = extractCatchpitData(state)
  if (!data || !data.variant || !data.diameter || !data.depth) {
    return `${data?.variant ?? 'CP'}???-???`
  }

  const adoptStr = data.adoptable ? 'S104' : 'PRIV'
  return `${data.variant}${data.diameter}-${data.depth}-${adoptStr}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────
// Standards follow the Compliance section of the SERS and SERDS data
// sheets: EN 13598-2, DCG (Type D and E for SERS), SfA7, Building Regs
// Part H1 and the DCG restricted access requirement.

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractCatchpitData(state)
  const { valid } = validateConfig(state)

  // Outlet rule: no flow increase on exit (R6) and size caps (R7)
  const outletRulePass = data ? pipeworkRulesPass(data) : true

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
      standard: data?.variant === 'SERS'
        ? 'DCG Type D and E Chambers'
        : 'Design and Construction Guidance (DCG)',
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
      standard: 'BS EN 13598-2 (2009)',
      scope: 'Plastic Inspection Chambers',
      status: 'Pass',
    },
    {
      standard: 'Building Regulations Part H1',
      scope: 'Surface Water Drainage',
      status: data?.systemType === 'surface' ? 'Pass' : 'Warning',
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
