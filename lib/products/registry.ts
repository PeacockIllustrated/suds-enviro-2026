/**
 * Product Configuration Registry
 * Maps each product to its step sequence, initial data, and metadata.
 */

import type { ComponentType } from 'react'
import type {
  ProductId,
  ProductCategory,
  ProductData,
  WizardState,
  ValidationResult,
  ComplianceResult,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'

// ── INTERFACES ───────────────────────────────────────────────

export interface StepDefinition {
  id: string
  label: string
  heading: string
  subheading: string | ((state: WizardState) => string)
  component: ComponentType
  canProceed: (state: WizardState) => boolean
}

export interface ProductConfig {
  id: ProductId
  name: string
  subtitle: string
  category: ProductCategory
  icon: string
  steps: StepDefinition[]
  initialData: ProductData
  generateProductCode: (state: WizardState) => string
  generateCompliance: (state: WizardState) => ComplianceResult[]
  getSummaryFields: (state: WizardState) => SummaryField[]
  getReviewBlocks: (state: WizardState) => ReviewBlockDef[]
  has3dViewer?: boolean
}

export interface CategoryDef {
  id: ProductCategory
  label: string
  description: string
  productIds: ProductId[]
}

// ── CATEGORIES ───────────────────────────────────────────────

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'chambers',
    label: 'Inspection Chambers and Manholes',
    description: 'HDPE rotationally moulded drainage chambers for surface and foul water systems.',
    productIds: ['chamber', 'catchpit'],
  },
  {
    id: 'silt',
    label: 'Silt Management',
    description: 'Filtering and silt capture to protect downstream drainage infrastructure.',
    productIds: ['rhinopod'],
  },
  {
    id: 'stormwater',
    label: 'Stormwater and Rainwater Harvesting',
    description: 'Oil separation, pollution prevention, and rainwater collection systems.',
    productIds: ['rhinoceptor', 'rainwater'],
  },
  {
    id: 'flow',
    label: 'Flow Control Systems',
    description: 'Vortex and orifice flow control devices to limit stormwater discharge.',
    productIds: ['flow-control'],
  },
  {
    id: 'pumps',
    label: 'Package Pump Stations',
    description: 'Wet well pumping stations for wastewater distribution.',
    productIds: ['pump-station'],
  },
  {
    id: 'drawpits',
    label: 'Drawpits',
    description: 'Interlocking structural access chambers for utility installations.',
    productIds: ['drawpit'],
  },
  {
    id: 'bespoke',
    label: 'Grease Management and Bespoke',
    description: 'Grease traps, separators, septic tanks, and custom solutions.',
    productIds: ['grease-trap', 'grease-separator', 'septic-tank'],
  },
]

// ── REGISTRY ─────────────────────────────────────────────────

const registry = new Map<ProductId, ProductConfig>()

export function registerProduct(config: ProductConfig): void {
  registry.set(config.id, config)
}

export function getProductConfig(id: ProductId): ProductConfig {
  const config = registry.get(id)
  if (!config) {
    throw new Error(`No product config registered for "${id}"`)
  }
  return config
}

export function getProductsByCategory(category: ProductCategory): ProductConfig[] {
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return []
  return cat.productIds
    .map((id) => registry.get(id))
    .filter((c): c is ProductConfig => c !== undefined)
}

export function getAllProducts(): ProductConfig[] {
  return Array.from(registry.values())
}

export function isProductRegistered(id: ProductId): boolean {
  return registry.has(id)
}

/**
 * Get the total number of steps for a product.
 * Step 0 = ProductSelect (shared), then product steps, then Review + Output.
 */
export function getTotalSteps(id: ProductId): number {
  const config = registry.get(id)
  if (!config) return 1
  return config.steps.length + 3 // +1 for ProductSelect, +1 for Review, +1 for Output
}

/**
 * Get the step index for the Review step.
 */
export function getReviewStepIndex(id: ProductId): number {
  const config = registry.get(id)
  if (!config) return 1
  return config.steps.length + 1
}

/**
 * Get the step index for the Output step.
 */
export function getOutputStepIndex(id: ProductId): number {
  const config = registry.get(id)
  if (!config) return 2
  return config.steps.length + 2
}
