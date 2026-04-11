/**
 * Rule Engine Orchestrator
 * Delegates to product-specific rule modules.
 * Re-exports chamber rules for backward compatibility.
 */

import type { ProductId, WizardState, ValidationResult, ComplianceResult } from './types'
import type { ProductRuleModule } from './rules/types'

import * as chamberRules from './rules/chamber'
import * as catchpitRules from './rules/catchpit'
import * as rhinoceptorRules from './rules/rhinoceptor'
import * as flowControlRules from './rules/flow-control'
import * as pumpStationRules from './rules/pump-station'
import * as greaseTrapRules from './rules/grease-trap'
import * as greaseSeparatorRules from './rules/grease-separator'
import * as rhinopodRules from './rules/rhinopod'
import * as rainwaterRules from './rules/rainwater'
import * as septicTankRules from './rules/septic-tank'
import * as drawpitRules from './rules/drawpit'

// ── MODULE DISPATCH ──────────────────────────────────────────

const modules: Record<ProductId, ProductRuleModule> = {
  'chamber': chamberRules,
  'catchpit': catchpitRules,
  'rhinoceptor': rhinoceptorRules,
  'flow-control': flowControlRules,
  'pump-station': pumpStationRules,
  'grease-trap': greaseTrapRules,
  'grease-separator': greaseSeparatorRules,
  'rhinopod': rhinopodRules,
  'rainwater': rainwaterRules,
  'septic-tank': septicTankRules,
  'drawpit': drawpitRules,
}

export function getRuleModule(product: ProductId): ProductRuleModule {
  return modules[product]
}

export function validateConfig(state: WizardState): ValidationResult {
  if (!state.product) return { valid: false, errors: ['Product not selected'] }
  return modules[state.product].validateConfig(state)
}

export function generateProductCode(state: WizardState): string {
  if (!state.product) return '???'
  return modules[state.product].generateProductCode(state)
}

export function generateCompliance(state: WizardState): ComplianceResult[] {
  if (!state.product) return []
  return modules[state.product].generateCompliance(state)
}

// ── CHAMBER RULE RE-EXPORTS (backward compatibility) ─────────

export {
  getMaxInlets,
  getOutletMinSize,
  getBlockedPositions,
  getMaxDepth,
  getMaxInletPipeSize,
  getAvailableInletSizes,
  clockToDegrees,
  clockToDirection,
  getDefaultInletHeights,
} from './rules/chamber'
