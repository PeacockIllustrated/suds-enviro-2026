/**
 * Grease Trap Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Grease Trap product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  GreaseTrapData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  GREASE_TRAP_SPECS,
  generateProductCode as gtGenerateProductCode,
  generateCompliance as gtGenerateCompliance,
} from '@/lib/rules/grease-trap'

// -- INITIAL DATA -----------------------------------------------------

export const GREASE_TRAP_INITIAL_DATA: ProductData = {
  kind: 'grease-trap',
  data: {
    model: null,
    connectionInlet: null,
    connectionOutlet: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const GREASE_TRAP_STEP_IDS = [
  'gt-model-select',
  'gt-connections',
] as const

export type GreaseTrapStepId = (typeof GREASE_TRAP_STEP_IDS)[number]

// -- HELPER: Extract GreaseTrapData -----------------------------------

function getGreaseTrapData(state: WizardState): GreaseTrapData | null {
  if (!state.productData || state.productData.kind !== 'grease-trap') return null
  return state.productData.data
}

// -- HELPER: Model display label --------------------------------------

function modelLabel(val: string | null): string {
  switch (val) {
    case 'micro': return 'Micro'
    case 'mini':  return 'Mini'
    case 'midi':  return 'Midi'
    case 'jumbo': return 'Jumbo'
    default:      return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const greaseTrapSteps: StepDefinition[] = [
  {
    id: 'gt-model-select',
    label: 'Model',
    heading: 'Grease Trap Model',
    subheading: 'Select the grease trap model based on your capacity requirements.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getGreaseTrapData(state)
      return d !== null && d.model !== null
    },
  },
  {
    id: 'gt-connections',
    label: 'Connections',
    heading: 'Pipe Connections',
    subheading: 'Select the inlet and outlet connection sizes.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getGreaseTrapData(state)
      return d !== null && d.connectionInlet !== null && d.connectionOutlet !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function greaseTrapReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'grease-trap') return productData

  const data = productData.data

  switch (action.type) {
    case 'GT_SET_MODEL':
      return {
        kind: 'grease-trap',
        data: { ...data, model: action.payload },
      }

    case 'GT_SET_INLET':
      return {
        kind: 'grease-trap',
        data: { ...data, connectionInlet: action.payload },
      }

    case 'GT_SET_OUTLET':
      return {
        kind: 'grease-trap',
        data: { ...data, connectionOutlet: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getGreaseTrapData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.model) {
    fields.push({ label: 'Model', value: modelLabel(d.model) })
    const spec = GREASE_TRAP_SPECS[d.model]
    if (spec) {
      fields.push({ label: 'Capacity', value: `${spec.coversPerDay} covers/day` })
    }
  }
  if (d.connectionInlet) {
    fields.push({ label: 'Inlet', value: d.connectionInlet })
  }
  if (d.connectionOutlet) {
    fields.push({ label: 'Outlet', value: d.connectionOutlet })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Grease Trap Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getGreaseTrapData(s)
        if (!d) return []

        const rows: { label: string; value: string }[] = [
          { label: 'Model', value: modelLabel(d.model) },
        ]

        if (d.model) {
          const spec = GREASE_TRAP_SPECS[d.model]
          if (spec) {
            rows.push({ label: 'Covers/Day', value: `${spec.coversPerDay}` })
            rows.push({ label: 'Sludge Capacity', value: `${spec.sludgeCapacityLitres}L` })
            rows.push({ label: 'Dimensions', value: `${spec.lengthMm} x ${spec.widthMm} x ${spec.heightMm}mm` })
          }
        }

        rows.push({ label: 'Inlet Connection', value: d.connectionInlet ?? '-' })
        rows.push({ label: 'Outlet Connection', value: d.connectionOutlet ?? '-' })

        return rows
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const greaseTrapConfig: ProductConfig = {
  id: 'grease-trap',
  name: 'Grease Trap',
  subtitle: 'Under-counter and freestanding grease traps',
  category: 'bespoke',
  icon: 'grease-trap',
  steps: greaseTrapSteps,
  initialData: GREASE_TRAP_INITIAL_DATA,
  generateProductCode: gtGenerateProductCode,
  generateCompliance: gtGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
