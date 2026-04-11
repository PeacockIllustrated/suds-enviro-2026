/**
 * Shared rule engine interfaces.
 * Each product implements ProductRuleModule.
 */

import type { WizardState, ValidationResult, ComplianceResult } from '@/lib/types'

export interface ProductRuleModule {
  validateConfig: (state: WizardState) => ValidationResult
  generateProductCode: (state: WizardState) => string
  generateCompliance: (state: WizardState) => ComplianceResult[]
}
