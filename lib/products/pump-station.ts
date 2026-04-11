/**
 * Pump Station Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Package Pump Station product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  PumpStationData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as pumpGenerateProductCode,
  generateCompliance as pumpGenerateCompliance,
} from '@/lib/rules/pump-station'

// -- INITIAL DATA -----------------------------------------------------

export const PUMP_STATION_INITIAL_DATA: ProductData = {
  kind: 'pump-station',
  data: {
    systemType: null,
    flowRateLs: '',
    totalHeadM: '',
    pumpCount: null,
    pipeSizeOutlet: null,
    controllerType: null,
    wetWellDiameter: null,
    depth: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const PUMP_STATION_STEP_IDS = [
  'pump-system-type',
  'pump-flow',
  'pump-head',
  'pump-config',
  'pump-well-sizing',
  'pump-pipe-sizing',
] as const

export type PumpStationStepId = (typeof PUMP_STATION_STEP_IDS)[number]

// -- HELPER: Extract PumpStationData ----------------------------------

function getPumpData(state: WizardState): PumpStationData | null {
  if (!state.productData || state.productData.kind !== 'pump-station') return null
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

// -- HELPER: Controller type display label ----------------------------

function controllerLabel(val: string | null): string {
  switch (val) {
    case 'manual':      return 'Manual'
    case 'auto-float':  return 'Auto (Float Switch)'
    case 'auto-level':  return 'Auto (Level Sensor)'
    case 'plc':         return 'PLC'
    default:            return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const pumpSteps: StepDefinition[] = [
  {
    id: 'pump-system-type',
    label: 'System Type',
    heading: 'System Type',
    subheading: 'What type of drainage system is this pump station for?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.systemType !== null
    },
  },
  {
    id: 'pump-flow',
    label: 'Flow Rate',
    heading: 'Design Flow Rate',
    subheading: 'Enter the required pump flow rate in litres per second.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.flowRateLs !== ''
    },
  },
  {
    id: 'pump-head',
    label: 'Total Head',
    heading: 'Total Dynamic Head',
    subheading: 'Enter the total dynamic head in metres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.totalHeadM !== ''
    },
  },
  {
    id: 'pump-config',
    label: 'Pump Config',
    heading: 'Pump Configuration',
    subheading: 'Select the number of pumps and controller type.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.pumpCount !== null && d.controllerType !== null
    },
  },
  {
    id: 'pump-well-sizing',
    label: 'Well Sizing',
    heading: 'Wet Well Sizing',
    subheading: 'Select the wet well diameter and installation depth.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.wetWellDiameter !== null && d.depth !== null
    },
  },
  {
    id: 'pump-pipe-sizing',
    label: 'Pipe Sizing',
    heading: 'Outlet Pipe Sizing',
    subheading: 'Select the outlet pipe size for the pump station.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getPumpData(state)
      return d !== null && d.pipeSizeOutlet !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function pumpStationReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'pump-station') return productData

  const data = productData.data

  switch (action.type) {
    case 'PUMP_SET_SYSTEM':
      return {
        kind: 'pump-station',
        data: { ...data, systemType: action.payload },
      }

    case 'PUMP_SET_FLOW_RATE':
      return {
        kind: 'pump-station',
        data: { ...data, flowRateLs: action.payload },
      }

    case 'PUMP_SET_HEAD':
      return {
        kind: 'pump-station',
        data: { ...data, totalHeadM: action.payload },
      }

    case 'PUMP_SET_PUMP_COUNT':
      return {
        kind: 'pump-station',
        data: { ...data, pumpCount: action.payload },
      }

    case 'PUMP_SET_CONTROLLER':
      return {
        kind: 'pump-station',
        data: { ...data, controllerType: action.payload },
      }

    case 'PUMP_SET_DIAMETER':
      return {
        kind: 'pump-station',
        data: { ...data, wetWellDiameter: action.payload },
      }

    case 'PUMP_SET_DEPTH':
      return {
        kind: 'pump-station',
        data: { ...data, depth: action.payload },
      }

    case 'PUMP_SET_PIPE_SIZE':
      return {
        kind: 'pump-station',
        data: { ...data, pipeSizeOutlet: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getPumpData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.systemType) {
    fields.push({ label: 'System', value: systemTypeLabel(d.systemType) })
  }
  if (d.flowRateLs) {
    fields.push({ label: 'Flow Rate', value: `${d.flowRateLs} L/s` })
  }
  if (d.totalHeadM) {
    fields.push({ label: 'Total Head', value: `${d.totalHeadM}m` })
  }
  if (d.pumpCount !== null) {
    fields.push({ label: 'Pumps', value: `${d.pumpCount}` })
  }
  if (d.controllerType) {
    fields.push({ label: 'Controller', value: controllerLabel(d.controllerType) })
  }
  if (d.wetWellDiameter) {
    fields.push({ label: 'Well Diameter', value: `${d.wetWellDiameter}mm` })
  }
  if (d.depth) {
    fields.push({ label: 'Depth', value: `${d.depth}mm` })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Pump Station Configuration',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getPumpData(s)
        if (!d) return []
        return [
          { label: 'System Type', value: systemTypeLabel(d.systemType) },
          { label: 'Flow Rate', value: d.flowRateLs ? `${d.flowRateLs} L/s` : '-' },
          { label: 'Total Head', value: d.totalHeadM ? `${d.totalHeadM}m` : '-' },
          { label: 'Pump Count', value: d.pumpCount !== null ? `${d.pumpCount}` : '-' },
          { label: 'Controller', value: controllerLabel(d.controllerType) },
          { label: 'Well Diameter', value: d.wetWellDiameter ? `${d.wetWellDiameter}mm` : '-' },
          { label: 'Depth', value: d.depth ? `${d.depth}mm` : '-' },
          { label: 'Outlet Pipe', value: d.pipeSizeOutlet ?? '-' },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const pumpStationConfig: ProductConfig = {
  id: 'pump-station',
  name: 'Package Pump Station',
  subtitle: 'Wet well pumping stations for wastewater distribution',
  category: 'pumps',
  icon: 'pump-station',
  steps: pumpSteps,
  initialData: PUMP_STATION_INITIAL_DATA,
  generateProductCode: pumpGenerateProductCode,
  generateCompliance: pumpGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
