/**
 * Drawpit Rule Engine
 *
 * Validates configuration for cable/service drawpits.
 * Checks physical dimensions (length, width, depth), ring count,
 * structural load rating, and cover type.
 */

import type {
  WizardState,
  DrawpitData,
  ValidationResult,
  ComplianceResult,
} from '@/lib/types'

// ── HELPER: Extract DrawpitData from WizardState ─────────────

function extractDrawpitData(state: WizardState): DrawpitData | null {
  if (!state.productData || state.productData.kind !== 'drawpit') return null
  return state.productData.data
}

// ── VALIDATION ───────────────────────────────────────────────

export function validateConfig(state: WizardState): ValidationResult {
  const errors: string[] = []
  const data = extractDrawpitData(state)

  if (!state.product) errors.push('Product not selected')
  if (!data) {
    errors.push('Drawpit data not available')
    return { valid: false, errors }
  }

  if (!data.lengthMm || data.lengthMm.trim() === '') {
    errors.push('Length not specified')
  } else {
    const length = parseFloat(data.lengthMm)
    if (isNaN(length) || length <= 0) {
      errors.push('Length must be a positive number')
    }
  }

  if (!data.widthMm || data.widthMm.trim() === '') {
    errors.push('Width not specified')
  } else {
    const width = parseFloat(data.widthMm)
    if (isNaN(width) || width <= 0) {
      errors.push('Width must be a positive number')
    }
  }

  if (!data.depthMm || data.depthMm.trim() === '') {
    errors.push('Depth not specified')
  } else {
    const depth = parseFloat(data.depthMm)
    if (isNaN(depth) || depth <= 0) {
      errors.push('Depth must be a positive number')
    }
  }

  if (!data.loadRating) errors.push('Load rating not selected')
  if (!data.coverType)  errors.push('Cover type not selected')

  return { valid: errors.length === 0, errors }
}

// ── PRODUCT CODE ─────────────────────────────────────────────

export function generateProductCode(state: WizardState): string {
  const data = extractDrawpitData(state)
  if (!data || !data.lengthMm || !data.widthMm || !data.loadRating) {
    return 'DP-???x???-???'
  }

  const length = parseFloat(data.lengthMm)
  const width = parseFloat(data.widthMm)
  if (isNaN(length) || isNaN(width)) return 'DP-???x???-???'

  return `DP-${Math.round(length)}x${Math.round(width)}-${data.loadRating}`
}

// ── COMPLIANCE CHECK ─────────────────────────────────────────

export function generateCompliance(state: WizardState): ComplianceResult[] {
  const data = extractDrawpitData(state)
  const { valid } = validateConfig(state)

  return [
    {
      standard: 'BS EN 124-1:2015',
      scope: 'Structural Load Rating - Gully Tops and Manhole Covers',
      status: (valid && data?.loadRating) ? 'Pass' : 'Fail',
    },
    {
      standard: 'Highways Act 1980',
      scope: 'Highway Authority Requirements - Cover Ratings',
      status: data?.loadRating ? 'Pass' : 'Warning',
    },
  ]
}
