/**
 * Flow Control Unit Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Flow Control unit product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  FlowControlData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as fcGenerateProductCode,
  generateCompliance as fcGenerateCompliance,
} from '@/lib/rules/flow-control'

// -- INITIAL DATA -----------------------------------------------------

export const FLOW_CONTROL_INITIAL_DATA: ProductData = {
  kind: 'flow-control',
  data: {
    systemType: null,
    application: null,
    headDepthMm: '',
    dischargeRateLs: '',
    chamberDiameter: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const FLOW_CONTROL_STEP_IDS = [
  'fc-system-type',
  'fc-application',
  'head-depth',
  'discharge-rate',
  'fc-chamber-size',
] as const

export type FlowControlStepId = (typeof FLOW_CONTROL_STEP_IDS)[number]

// -- HELPER: Extract FlowControlData ---------------------------------

function getFlowControlData(state: WizardState): FlowControlData | null {
  if (!state.productData || state.productData.kind !== 'flow-control') return null
  return state.productData.data
}

// -- HELPER: System type display label --------------------------------

function systemTypeLabel(val: string | null): string {
  switch (val) {
    case 'surface':  return 'Surface Water'
    case 'foul':     return 'Foul'
    case 'combined': return 'Combined'
    default:         return '-'
  }
}

// -- HELPER: Application display label --------------------------------

function applicationLabel(val: string | null): string {
  switch (val) {
    case 'attenuation': return 'Attenuation'
    case 'swale':       return 'Swale'
    case 'pond':        return 'Pond'
    case 'other':       return 'Other'
    default:            return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const flowControlSteps: StepDefinition[] = [
  {
    id: 'fc-system-type',
    label: 'System Type',
    heading: 'System Type',
    subheading: 'What type of drainage system is this flow control device for?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getFlowControlData(state)
      return d !== null && d.systemType !== null
    },
  },
  {
    id: 'fc-application',
    label: 'Application',
    heading: 'Application Type',
    subheading: 'Select the upstream application for this flow control device.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getFlowControlData(state)
      return d !== null && d.application !== null
    },
  },
  {
    id: 'head-depth',
    label: 'Head Depth',
    heading: 'Head Depth',
    subheading: 'Enter the maximum design head depth in millimetres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getFlowControlData(state)
      return d !== null && d.headDepthMm !== ''
    },
  },
  {
    id: 'discharge-rate',
    label: 'Discharge Rate',
    heading: 'Discharge Rate',
    subheading: 'Enter the required discharge rate in litres per second.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getFlowControlData(state)
      return d !== null && d.dischargeRateLs !== ''
    },
  },
  {
    id: 'fc-chamber-size',
    label: 'Chamber Size',
    heading: 'Chamber Diameter',
    subheading: 'Select the housing chamber diameter for the flow control device.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getFlowControlData(state)
      return d !== null && d.chamberDiameter !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function flowControlReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'flow-control') return productData

  const data = productData.data

  switch (action.type) {
    case 'FC_SET_SYSTEM':
      return {
        kind: 'flow-control',
        data: { ...data, systemType: action.payload },
      }

    case 'FC_SET_APPLICATION':
      return {
        kind: 'flow-control',
        data: { ...data, application: action.payload },
      }

    case 'FC_SET_HEAD_DEPTH':
      return {
        kind: 'flow-control',
        data: { ...data, headDepthMm: action.payload },
      }

    case 'FC_SET_DISCHARGE_RATE':
      return {
        kind: 'flow-control',
        data: { ...data, dischargeRateLs: action.payload },
      }

    case 'FC_SET_CHAMBER_DIAMETER':
      return {
        kind: 'flow-control',
        data: { ...data, chamberDiameter: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getFlowControlData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.systemType) {
    fields.push({ label: 'System', value: systemTypeLabel(d.systemType) })
  }
  if (d.application) {
    fields.push({ label: 'Application', value: applicationLabel(d.application) })
  }
  if (d.headDepthMm) {
    fields.push({ label: 'Head Depth', value: `${d.headDepthMm}mm` })
  }
  if (d.dischargeRateLs) {
    fields.push({ label: 'Discharge Rate', value: `${d.dischargeRateLs} L/s` })
  }
  if (d.chamberDiameter) {
    fields.push({ label: 'Chamber Diameter', value: `${d.chamberDiameter}mm` })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Flow Control Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getFlowControlData(s)
        if (!d) return []
        return [
          { label: 'System Type', value: systemTypeLabel(d.systemType) },
          { label: 'Application', value: applicationLabel(d.application) },
          { label: 'Head Depth', value: d.headDepthMm ? `${d.headDepthMm}mm` : '-' },
          { label: 'Discharge Rate', value: d.dischargeRateLs ? `${d.dischargeRateLs} L/s` : '-' },
          { label: 'Chamber Diameter', value: d.chamberDiameter ? `${d.chamberDiameter}mm` : '-' },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const flowControlConfig: ProductConfig = {
  id: 'flow-control',
  name: 'Flow Control',
  subtitle: 'Vortex and orifice flow control devices',
  category: 'flow',
  icon: 'flow-control',
  steps: flowControlSteps,
  initialData: FLOW_CONTROL_INITIAL_DATA,
  generateProductCode: fcGenerateProductCode,
  generateCompliance: fcGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
