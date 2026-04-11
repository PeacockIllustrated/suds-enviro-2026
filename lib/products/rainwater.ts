/**
 * Rainwater Harvesting Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Rainwater Harvesting system product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  RainwaterData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as rwGenerateProductCode,
  generateCompliance as rwGenerateCompliance,
} from '@/lib/rules/rainwater'

// -- INITIAL DATA -----------------------------------------------------

export const RAINWATER_INITIAL_DATA: ProductData = {
  kind: 'rainwater',
  data: {
    systemType: null,
    roofAreaM2: '',
    capacityLitres: null,
    annualRainfallMm: '',
  },
}

// -- STEP IDS ---------------------------------------------------------

export const RAINWATER_STEP_IDS = [
  'rw-system-type',
  'rw-catchment-area',
  'rw-capacity',
  'rw-rainfall',
] as const

export type RainwaterStepId = (typeof RAINWATER_STEP_IDS)[number]

// -- HELPER: Extract RainwaterData ------------------------------------

function getRainwaterData(state: WizardState): RainwaterData | null {
  if (!state.productData || state.productData.kind !== 'rainwater') return null
  return state.productData.data
}

// -- HELPER: System type display label --------------------------------

function systemTypeLabel(val: string | null): string {
  switch (val) {
    case 'direct':   return 'Direct Feed'
    case 'indirect': return 'Indirect (Header Tank)'
    case 'gravity':  return 'Gravity Fed'
    default:         return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const rainwaterSteps: StepDefinition[] = [
  {
    id: 'rw-system-type',
    label: 'System Type',
    heading: 'System Type',
    subheading: 'Select the type of rainwater harvesting system.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRainwaterData(state)
      return d !== null && d.systemType !== null
    },
  },
  {
    id: 'rw-catchment-area',
    label: 'Catchment Area',
    heading: 'Roof Catchment Area',
    subheading: 'Enter the effective roof catchment area in square metres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRainwaterData(state)
      return d !== null && d.roofAreaM2 !== ''
    },
  },
  {
    id: 'rw-capacity',
    label: 'Tank Capacity',
    heading: 'Tank Capacity',
    subheading: 'Select the tank capacity in litres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRainwaterData(state)
      return d !== null && d.capacityLitres !== null
    },
  },
  {
    id: 'rw-rainfall',
    label: 'Rainfall',
    heading: 'Annual Rainfall',
    subheading: 'Enter the average annual rainfall in millimetres (optional).',
    component: null as unknown as ComponentType,
    canProceed: () => {
      // Rainfall is optional, always allow proceeding
      return true
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function rainwaterReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'rainwater') return productData

  const data = productData.data

  switch (action.type) {
    case 'RW_SET_SYSTEM':
      return {
        kind: 'rainwater',
        data: { ...data, systemType: action.payload },
      }

    case 'RW_SET_ROOF_AREA':
      return {
        kind: 'rainwater',
        data: { ...data, roofAreaM2: action.payload },
      }

    case 'RW_SET_CAPACITY':
      return {
        kind: 'rainwater',
        data: { ...data, capacityLitres: action.payload },
      }

    case 'RW_SET_RAINFALL':
      return {
        kind: 'rainwater',
        data: { ...data, annualRainfallMm: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getRainwaterData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.systemType) {
    fields.push({ label: 'System', value: systemTypeLabel(d.systemType) })
  }
  if (d.roofAreaM2) {
    fields.push({ label: 'Roof Area', value: `${d.roofAreaM2} m2` })
  }
  if (d.capacityLitres) {
    fields.push({ label: 'Capacity', value: `${d.capacityLitres}L` })
  }
  if (d.annualRainfallMm) {
    fields.push({ label: 'Rainfall', value: `${d.annualRainfallMm}mm/yr` })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Rainwater Harvesting Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getRainwaterData(s)
        if (!d) return []
        return [
          { label: 'System Type', value: systemTypeLabel(d.systemType) },
          { label: 'Roof Area', value: d.roofAreaM2 ? `${d.roofAreaM2} m2` : '-' },
          { label: 'Tank Capacity', value: d.capacityLitres ? `${d.capacityLitres}L` : '-' },
          { label: 'Annual Rainfall', value: d.annualRainfallMm ? `${d.annualRainfallMm}mm/yr` : '-' },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const rainwaterConfig: ProductConfig = {
  id: 'rainwater',
  name: 'Rainwater Harvesting',
  subtitle: 'Rainwater collection and reuse systems',
  category: 'stormwater',
  icon: 'rainwater',
  steps: rainwaterSteps,
  initialData: RAINWATER_INITIAL_DATA,
  generateProductCode: rwGenerateProductCode,
  generateCompliance: rwGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
