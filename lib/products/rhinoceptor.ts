/**
 * RhinoCeptor Oil Separator Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the RhinoCeptor oil/water separator product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  RhinoCeptorData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as rhinoGenerateProductCode,
  generateCompliance as rhinoGenerateCompliance,
} from '@/lib/rules/rhinoceptor'

// -- INITIAL DATA -----------------------------------------------------

export const RHINOCEPTOR_INITIAL_DATA: ProductData = {
  kind: 'rhinoceptor',
  data: {
    variant: null,
    drainageAreaM2: '',
    flowRateLs: '',
    retentionVolumeLitres: '',
    rhinoClass: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const RHINOCEPTOR_STEP_IDS = [
  'variant-select',
  'drainage-area',
  'flow-sizing',
  'class-select',
] as const

export type RhinoCeptorStepId = (typeof RHINOCEPTOR_STEP_IDS)[number]

// -- HELPER: Extract RhinoCeptorData ----------------------------------

function getRhinoData(state: WizardState): RhinoCeptorData | null {
  if (!state.productData || state.productData.kind !== 'rhinoceptor') return null
  return state.productData.data
}

// -- HELPER: Variant display label ------------------------------------

function variantLabel(val: string | null): string {
  switch (val) {
    case 'forecourt':       return 'Forecourt'
    case 'full-retention':  return 'Full Retention'
    case 'bypass':          return 'Bypass'
    default:                return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const rhinoSteps: StepDefinition[] = [
  {
    id: 'variant-select',
    label: 'Variant',
    heading: 'RhinoCeptor Variant',
    subheading: 'Select the type of oil separator required.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.variant !== null
    },
  },
  {
    id: 'drainage-area',
    label: 'Drainage Area',
    heading: 'Drainage Area',
    subheading: 'Enter the total impermeable drainage area in square metres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.drainageAreaM2 !== ''
    },
  },
  {
    id: 'flow-sizing',
    label: 'Flow Sizing',
    heading: 'Flow Rate and Retention',
    subheading: 'Enter the design flow rate for the separator.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.flowRateLs !== ''
    },
  },
  {
    id: 'class-select',
    label: 'Class',
    heading: 'Separator Class',
    subheading: 'Select the environmental class for this installation.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.rhinoClass !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function rhinoceptorReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'rhinoceptor') return productData

  const data = productData.data

  switch (action.type) {
    case 'RHINO_SET_VARIANT':
      return {
        kind: 'rhinoceptor',
        data: { ...data, variant: action.payload },
      }

    case 'RHINO_SET_DRAINAGE_AREA':
      return {
        kind: 'rhinoceptor',
        data: { ...data, drainageAreaM2: action.payload },
      }

    case 'RHINO_SET_FLOW_RATE':
      return {
        kind: 'rhinoceptor',
        data: { ...data, flowRateLs: action.payload },
      }

    case 'RHINO_SET_RETENTION':
      return {
        kind: 'rhinoceptor',
        data: { ...data, retentionVolumeLitres: action.payload },
      }

    case 'RHINO_SET_CLASS':
      return {
        kind: 'rhinoceptor',
        data: { ...data, rhinoClass: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getRhinoData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.variant) {
    fields.push({ label: 'Variant', value: variantLabel(d.variant) })
  }
  if (d.drainageAreaM2) {
    fields.push({ label: 'Drainage Area', value: `${d.drainageAreaM2} m2` })
  }
  if (d.flowRateLs) {
    fields.push({ label: 'Flow Rate', value: `${d.flowRateLs} L/s` })
  }
  if (d.rhinoClass !== null) {
    fields.push({ label: 'Class', value: `Class ${d.rhinoClass}` })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'RhinoCeptor Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getRhinoData(s)
        if (!d) return []
        return [
          { label: 'Variant', value: variantLabel(d.variant) },
          { label: 'Drainage Area', value: d.drainageAreaM2 ? `${d.drainageAreaM2} m2` : '-' },
          { label: 'Flow Rate', value: d.flowRateLs ? `${d.flowRateLs} L/s` : '-' },
          { label: 'Retention Volume', value: d.retentionVolumeLitres ? `${d.retentionVolumeLitres} L` : '-' },
          { label: 'Class', value: d.rhinoClass !== null ? `Class ${d.rhinoClass}` : '-' },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const rhinoceptorConfig: ProductConfig = {
  id: 'rhinoceptor',
  name: 'RhinoCeptor',
  subtitle: 'Oil/water separator for pollution prevention',
  category: 'stormwater',
  icon: 'rhinoceptor',
  steps: rhinoSteps,
  initialData: RHINOCEPTOR_INITIAL_DATA,
  generateProductCode: rhinoGenerateProductCode,
  generateCompliance: rhinoGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
