/**
 * Grease Separator Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the full Grease Separator system product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  GreaseSeparatorData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as gsGenerateProductCode,
  generateCompliance as gsGenerateCompliance,
} from '@/lib/rules/grease-separator'

// -- INITIAL DATA -----------------------------------------------------

export const GREASE_SEPARATOR_INITIAL_DATA: ProductData = {
  kind: 'grease-separator',
  data: {
    application: null,
    peakCoversPerDay: '',
    flowRateLs: '',
  },
}

// -- STEP IDS ---------------------------------------------------------

export const GREASE_SEPARATOR_STEP_IDS = [
  'gs-application',
  'gs-covers',
  'gs-flow-sizing',
] as const

export type GreaseSeparatorStepId = (typeof GREASE_SEPARATOR_STEP_IDS)[number]

// -- HELPER: Extract GreaseSeparatorData ------------------------------

function getGreaseSepData(state: WizardState): GreaseSeparatorData | null {
  if (!state.productData || state.productData.kind !== 'grease-separator') return null
  return state.productData.data
}

// -- HELPER: Application display label --------------------------------

function applicationLabel(val: string | null): string {
  switch (val) {
    case 'restaurant':       return 'Restaurant'
    case 'hotel':            return 'Hotel'
    case 'catering':         return 'Catering'
    case 'food-processing':  return 'Food Processing'
    default:                 return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const greaseSepSteps: StepDefinition[] = [
  {
    id: 'gs-application',
    label: 'Application',
    heading: 'Application Type',
    subheading: 'Select the type of commercial kitchen or food preparation facility.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getGreaseSepData(state)
      return d !== null && d.application !== null
    },
  },
  {
    id: 'gs-covers',
    label: 'Covers/Day',
    heading: 'Peak Covers Per Day',
    subheading: 'Enter the peak number of covers (meals served) per day.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getGreaseSepData(state)
      return d !== null && d.peakCoversPerDay !== ''
    },
  },
  {
    id: 'gs-flow-sizing',
    label: 'Flow Rate',
    heading: 'Flow Rate',
    subheading: 'Enter the design flow rate in litres per second.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getGreaseSepData(state)
      return d !== null && d.flowRateLs !== ''
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function greaseSeparatorReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'grease-separator') return productData

  const data = productData.data

  switch (action.type) {
    case 'GS_SET_APPLICATION':
      return {
        kind: 'grease-separator',
        data: { ...data, application: action.payload },
      }

    case 'GS_SET_COVERS':
      return {
        kind: 'grease-separator',
        data: { ...data, peakCoversPerDay: action.payload },
      }

    case 'GS_SET_FLOW_RATE':
      return {
        kind: 'grease-separator',
        data: { ...data, flowRateLs: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getGreaseSepData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.application) {
    fields.push({ label: 'Application', value: applicationLabel(d.application) })
  }
  if (d.peakCoversPerDay) {
    fields.push({ label: 'Covers/Day', value: d.peakCoversPerDay })
  }
  if (d.flowRateLs) {
    fields.push({ label: 'Flow Rate', value: `${d.flowRateLs} L/s` })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Grease Separator Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getGreaseSepData(s)
        if (!d) return []
        return [
          { label: 'Application', value: applicationLabel(d.application) },
          { label: 'Covers/Day', value: d.peakCoversPerDay || '-' },
          { label: 'Flow Rate', value: d.flowRateLs ? `${d.flowRateLs} L/s` : '-' },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const greaseSeparatorConfig: ProductConfig = {
  id: 'grease-separator',
  name: 'Grease Separator',
  subtitle: 'Full grease separation systems for commercial kitchens',
  category: 'bespoke',
  icon: 'grease-separator',
  steps: greaseSepSteps,
  initialData: GREASE_SEPARATOR_INITIAL_DATA,
  generateProductCode: gsGenerateProductCode,
  generateCompliance: gsGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
