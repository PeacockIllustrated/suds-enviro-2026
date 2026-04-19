/**
 * Shared rule engine interfaces.
 * Each product implements ProductRuleModule.
 */

import type { WizardState, ValidationResult, ComplianceResult } from '@/lib/types'

export interface ProductRuleModule {
  validateConfig: (state: WizardState) => ValidationResult
  generateProductCode: (state: WizardState) => string
  generateCompliance: (state: WizardState) => ComplianceResult[]
  // Optional - only products with a depth concept (chamber, catchpit, pump-station)
  // expose this. Returns the max depth in mm for the chosen adoption status.
  getMaxDepth?: (adoptable: boolean) => number
}
