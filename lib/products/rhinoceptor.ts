/**
 * RHINO SEHDS Hydrodynamic Separator Product Configuration
 *
 * One-piece GRP separator for stormwater pollutant removal.
 * Diameters 750/1200/1800/2500 mm. 360-degree inlet positioning.
 * Optional RHINO POD polishing filter.
 *
 * Internal product id retained as `rhinoceptor` for backward compatibility
 * with saved configurations and admin URLs.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  RhinoCeptorData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
  SEHDSApplication,
  SEHDSDiameter,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as rhinoGenerateProductCode,
  generateCompliance as rhinoGenerateCompliance,
  SEHDS_MITIGATION,
} from '@/lib/rules/rhinoceptor'

// -- INITIAL DATA -----------------------------------------------------

export const RHINOCEPTOR_INITIAL_DATA: ProductData = {
  kind: 'rhinoceptor',
  data: {
    variant: null,
    sehdsDiameter: null,
    inletAngleDeg: null,
    drainageAreaM2: '',
    flowRateLs: '',
    rhinoPodAddOn: null,
    retentionVolumeLitres: '',
    rhinoClass: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const RHINOCEPTOR_STEP_IDS = [
  'sehds-application',
  'sehds-diameter',
  'sehds-inlet-angle',
  'sehds-drainage-area',
  'sehds-flow-rate',
  'sehds-pod-addon',
] as const

export type RhinoCeptorStepId = (typeof RHINOCEPTOR_STEP_IDS)[number]

// -- HELPER: Extract data --------------------------------------------

function getRhinoData(state: WizardState): RhinoCeptorData | null {
  if (!state.productData || state.productData.kind !== 'rhinoceptor') return null
  return state.productData.data
}

// -- HELPER: Application display label --------------------------------

function applicationLabel(val: string | null): string {
  switch (val) {
    case 'highway':     return 'Highway Drainage'
    case 'commercial':  return 'Commercial / Retail'
    case 'industrial':  return 'Industrial Site'
    case 'forecourt':   return 'Petrol Forecourt'
    case 'other':       return 'Other'
    default:            return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const rhinoSteps: StepDefinition[] = [
  {
    id: 'sehds-application',
    label: 'Application',
    heading: 'Application Context',
    subheading: 'Where will this hydrodynamic separator be installed?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.variant !== null
    },
  },
  {
    id: 'sehds-diameter',
    label: 'Diameter',
    heading: 'Separator Diameter',
    subheading: 'Choose the GRP separator diameter (750-2500 mm).',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.sehdsDiameter !== null
    },
  },
  {
    id: 'sehds-inlet-angle',
    label: 'Inlet',
    heading: 'Inlet Angle',
    subheading: 'SEHDS supports 360-degree inlet positioning. Enter the angle clockwise from north (0-359 degrees).',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.inletAngleDeg !== null
    },
  },
  {
    id: 'sehds-drainage-area',
    label: 'Drainage Area',
    heading: 'Drainage Area',
    subheading: 'Enter the total impermeable area discharging to this separator (m2).',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.drainageAreaM2 !== ''
    },
  },
  {
    id: 'sehds-flow-rate',
    label: 'Flow Rate',
    heading: 'Treatment Flow Rate',
    subheading: 'Enter the design treatment flow rate (L/s).',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.flowRateLs !== ''
    },
  },
  {
    id: 'sehds-pod-addon',
    label: 'POD Add-on',
    heading: 'RHINO POD Add-on',
    subheading: 'Add a RHINO POD polishing filter for removal of 33 WFD priority substances?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getRhinoData(state)
      return d !== null && d.rhinoPodAddOn !== null
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
        data: { ...data, variant: action.payload as SEHDSApplication },
      }

    case 'RHINO_SET_DIAMETER':
      return {
        kind: 'rhinoceptor',
        data: { ...data, sehdsDiameter: action.payload as SEHDSDiameter },
      }

    case 'RHINO_SET_INLET_ANGLE': {
      const raw = action.payload
      const norm = ((raw % 360) + 360) % 360 // wrap to 0-359
      return {
        kind: 'rhinoceptor',
        data: { ...data, inletAngleDeg: norm },
      }
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

    case 'RHINO_SET_POD_ADDON':
      return {
        kind: 'rhinoceptor',
        data: { ...data, rhinoPodAddOn: action.payload },
      }

    // Legacy actions accepted but no-op (data fields removed from wizard).
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
    fields.push({ label: 'Application', value: applicationLabel(d.variant) })
  }
  if (d.sehdsDiameter) {
    fields.push({ label: 'Diameter', value: `${d.sehdsDiameter}mm GRP` })
  }
  if (d.inletAngleDeg !== null) {
    fields.push({ label: 'Inlet Angle', value: `${d.inletAngleDeg}\u00B0 from N` })
  }
  if (d.drainageAreaM2) {
    fields.push({ label: 'Drainage Area', value: `${d.drainageAreaM2} m2` })
  }
  if (d.flowRateLs) {
    fields.push({ label: 'Treatment Flow', value: `${d.flowRateLs} L/s` })
  }
  if (d.rhinoPodAddOn !== null) {
    fields.push({ label: 'RHINO POD', value: d.rhinoPodAddOn ? 'Included' : 'Not included' })
  }
  fields.push({
    label: 'Mitigation Index',
    value: `${SEHDS_MITIGATION.suspendedSolids}-${SEHDS_MITIGATION.hydrocarbons}-${SEHDS_MITIGATION.debris} (SS/HC/Debris)`,
  })

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Hydrodynamic Separator',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getRhinoData(s)
        if (!d) return []
        return [
          { label: 'Application', value: applicationLabel(d.variant) },
          { label: 'Diameter (GRP)', value: d.sehdsDiameter ? `${d.sehdsDiameter}mm` : '-' },
          { label: 'Inlet Angle', value: d.inletAngleDeg !== null ? `${d.inletAngleDeg}\u00B0 from N` : '-' },
          { label: 'Drainage Area', value: d.drainageAreaM2 ? `${d.drainageAreaM2} m2` : '-' },
          { label: 'Treatment Flow', value: d.flowRateLs ? `${d.flowRateLs} L/s` : '-' },
          {
            label: 'RHINO POD',
            value: d.rhinoPodAddOn === null ? '-' : d.rhinoPodAddOn ? 'Included' : 'Not included',
            highlight: d.rhinoPodAddOn === true,
          },
          {
            label: 'Mitigation Indices',
            value: `SS ${SEHDS_MITIGATION.suspendedSolids} | HC ${SEHDS_MITIGATION.hydrocarbons} | Debris ${SEHDS_MITIGATION.debris}`,
          },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const rhinoceptorConfig: ProductConfig = {
  id: 'rhinoceptor',
  name: 'RHINO SEHDS Hydrodynamic Separator',
  subtitle: 'GRP stormwater pollutant removal (SS/HC/Debris)',
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
