/**
 * RhinoPod Filtration Unit Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the RhinoPod product. Two variants: standalone and plus
 * (integrated with a SuDS Enviro chamber).
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  RhinoPodData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as podGenerateProductCode,
  generateCompliance as podGenerateCompliance,
} from '@/lib/rules/rhinopod'

// -- INITIAL DATA -----------------------------------------------------

export const RHINOPOD_INITIAL_DATA: ProductData = {
  kind: 'rhinopod',
  data: {
    podType: null,
    chamberDiameter: null,
    retrofitExisting: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const RHINOPOD_STEP_IDS = [
  'pod-type-select',
  'pod-chamber-compat',
] as const

export type RhinoPodStepId = (typeof RHINOPOD_STEP_IDS)[number]

// -- HELPER: Extract RhinoPodData -------------------------------------

function getRhinoPodData(state: WizardState): RhinoPodData | null {
  if (!state.productData || state.productData.kind !== 'rhinopod') return null
  return state.productData.data
}

// -- HELPER: Pod type display label -----------------------------------

function podTypeLabel(val: string | null): string {
  switch (val) {
    case 'standalone': return 'Standalone'
    case 'plus':       return 'RhinoPod Plus'
    default:           return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const rhinoPodSteps: StepDefinition[] = [
  {
    id: 'pod-type-select',
    label: 'Pod Type',
    heading: 'RhinoPod Type',
    subheading: 'Select the RhinoPod variant for your application.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoPodData(state)
      return d !== null && d.podType !== null
    },
  },
  {
    id: 'pod-chamber-compat',
    label: 'Compatibility',
    heading: 'Chamber Compatibility',
    subheading: (state: WizardState) => {
      const d = getRhinoPodData(state)
      if (d?.podType === 'plus') {
        return 'Select the chamber diameter for the integrated RhinoPod Plus.'
      }
      return 'Is this a retrofit to an existing chamber?'
    },
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoPodData(state)
      if (!d || !d.podType) return false

      if (d.podType === 'plus') {
        return d.chamberDiameter !== null
      }

      // standalone: needs retrofit decision
      return d.retrofitExisting !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function rhinopodReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'rhinopod') return productData

  const data = productData.data

  switch (action.type) {
    case 'POD_SET_TYPE': {
      // When switching type, reset type-specific fields
      const newType = action.payload
      return {
        kind: 'rhinopod',
        data: {
          ...data,
          podType: newType,
          chamberDiameter: newType === 'plus' ? data.chamberDiameter : null,
          retrofitExisting: newType === 'standalone' ? data.retrofitExisting : null,
        },
      }
    }

    case 'POD_SET_DIAMETER':
      return {
        kind: 'rhinopod',
        data: { ...data, chamberDiameter: action.payload },
      }

    case 'POD_SET_RETROFIT':
      return {
        kind: 'rhinopod',
        data: { ...data, retrofitExisting: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getRhinoPodData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.podType) {
    fields.push({ label: 'Pod Type', value: podTypeLabel(d.podType) })
  }
  if (d.podType === 'plus' && d.chamberDiameter) {
    fields.push({ label: 'Chamber Diameter', value: `${d.chamberDiameter}mm` })
  }
  if (d.podType === 'standalone' && d.retrofitExisting !== null) {
    fields.push({ label: 'Retrofit', value: d.retrofitExisting ? 'Yes' : 'No' })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'RhinoPod Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getRhinoPodData(s)
        if (!d) return []

        const rows: { label: string; value: string }[] = [
          { label: 'Pod Type', value: podTypeLabel(d.podType) },
        ]

        if (d.podType === 'plus') {
          rows.push({
            label: 'Chamber Diameter',
            value: d.chamberDiameter ? `${d.chamberDiameter}mm` : '-',
          })
        }

        if (d.podType === 'standalone') {
          rows.push({
            label: 'Retrofit',
            value: d.retrofitExisting === null ? '-' : d.retrofitExisting ? 'Yes' : 'No',
          })
        }

        return rows
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const rhinopodConfig: ProductConfig = {
  id: 'rhinopod',
  name: 'RhinoPod',
  subtitle: 'Silt filtration unit for chamber integration or standalone use',
  category: 'silt',
  icon: 'rhinopod',
  steps: rhinoPodSteps,
  initialData: RHINOPOD_INITIAL_DATA,
  generateProductCode: podGenerateProductCode,
  generateCompliance: podGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
