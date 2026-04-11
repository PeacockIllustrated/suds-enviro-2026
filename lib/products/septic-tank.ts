/**
 * Septic Tank Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Septic Tank / Sewage Treatment product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  SepticTankData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as septicGenerateProductCode,
  generateCompliance as septicGenerateCompliance,
} from '@/lib/rules/septic-tank'

// -- INITIAL DATA -----------------------------------------------------

export const SEPTIC_TANK_INITIAL_DATA: ProductData = {
  kind: 'septic-tank',
  data: {
    treatmentLevel: null,
    populationEquivalent: '',
    dailyFlowLitres: '',
    dischargePoint: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const SEPTIC_TANK_STEP_IDS = [
  'st-treatment',
  'st-population',
  'st-discharge',
] as const

export type SepticTankStepId = (typeof SEPTIC_TANK_STEP_IDS)[number]

// -- HELPER: Extract SepticTankData -----------------------------------

function getSepticData(state: WizardState): SepticTankData | null {
  if (!state.productData || state.productData.kind !== 'septic-tank') return null
  return state.productData.data
}

// -- HELPER: Treatment level display label ----------------------------

function treatmentLabel(val: string | null): string {
  switch (val) {
    case 'primary':   return 'Primary'
    case 'secondary': return 'Secondary'
    default:          return '-'
  }
}

// -- HELPER: Discharge point display label ----------------------------

function dischargeLabel(val: string | null): string {
  switch (val) {
    case 'watercourse': return 'Watercourse'
    case 'soakaway':    return 'Soakaway'
    case 'drainfield':  return 'Drainfield'
    default:            return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const septicSteps: StepDefinition[] = [
  {
    id: 'st-treatment',
    label: 'Treatment',
    heading: 'Treatment Level',
    subheading: 'Select the required treatment level for this installation.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getSepticData(state)
      return d !== null && d.treatmentLevel !== null
    },
  },
  {
    id: 'st-population',
    label: 'Population',
    heading: 'Population and Flow',
    subheading: 'Enter the population equivalent and daily flow rate.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getSepticData(state)
      return d !== null && d.populationEquivalent !== ''
    },
  },
  {
    id: 'st-discharge',
    label: 'Discharge',
    heading: 'Discharge Point',
    subheading: 'Select the discharge destination for treated effluent.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getSepticData(state)
      return d !== null && d.dischargePoint !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function septicTankReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'septic-tank') return productData

  const data = productData.data

  switch (action.type) {
    case 'ST_SET_TREATMENT':
      return {
        kind: 'septic-tank',
        data: { ...data, treatmentLevel: action.payload },
      }

    case 'ST_SET_POPULATION':
      return {
        kind: 'septic-tank',
        data: { ...data, populationEquivalent: action.payload },
      }

    case 'ST_SET_FLOW':
      return {
        kind: 'septic-tank',
        data: { ...data, dailyFlowLitres: action.payload },
      }

    case 'ST_SET_DISCHARGE':
      return {
        kind: 'septic-tank',
        data: { ...data, dischargePoint: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getSepticData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.treatmentLevel) {
    fields.push({ label: 'Treatment', value: treatmentLabel(d.treatmentLevel) })
  }
  if (d.populationEquivalent) {
    fields.push({ label: 'Population', value: `PE ${d.populationEquivalent}` })
  }
  if (d.dailyFlowLitres) {
    fields.push({ label: 'Daily Flow', value: `${d.dailyFlowLitres} L/day` })
  }
  if (d.dischargePoint) {
    fields.push({ label: 'Discharge', value: dischargeLabel(d.dischargePoint) })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Septic Tank Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getSepticData(s)
        if (!d) return []
        return [
          { label: 'Treatment Level', value: treatmentLabel(d.treatmentLevel) },
          { label: 'Population Equivalent', value: d.populationEquivalent ? `PE ${d.populationEquivalent}` : '-' },
          { label: 'Daily Flow', value: d.dailyFlowLitres ? `${d.dailyFlowLitres} L/day` : '-' },
          { label: 'Discharge Point', value: dischargeLabel(d.dischargePoint) },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const septicTankConfig: ProductConfig = {
  id: 'septic-tank',
  name: 'Septic Tank',
  subtitle: 'Septic tanks and sewage treatment systems',
  category: 'bespoke',
  icon: 'septic-tank',
  steps: septicSteps,
  initialData: SEPTIC_TANK_INITIAL_DATA,
  generateProductCode: septicGenerateProductCode,
  generateCompliance: septicGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
