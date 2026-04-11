/**
 * Drawpit Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Drawpit (cable/service access chamber) product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  DrawpitData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  generateProductCode as dpGenerateProductCode,
  generateCompliance as dpGenerateCompliance,
} from '@/lib/rules/drawpit'

// -- INITIAL DATA -----------------------------------------------------

export const DRAWPIT_INITIAL_DATA: ProductData = {
  kind: 'drawpit',
  data: {
    lengthMm: '',
    widthMm: '',
    depthMm: '',
    ringCount: '',
    loadRating: null,
    coverType: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const DRAWPIT_STEP_IDS = [
  'dp-dimensions',
  'dp-depth-rings',
  'dp-load-rating',
  'dp-cover-type',
] as const

export type DrawpitStepId = (typeof DRAWPIT_STEP_IDS)[number]

// -- HELPER: Extract DrawpitData --------------------------------------

function getDrawpitData(state: WizardState): DrawpitData | null {
  if (!state.productData || state.productData.kind !== 'drawpit') return null
  return state.productData.data
}

// -- HELPER: Load rating display label --------------------------------

function loadRatingLabel(val: string | null): string {
  switch (val) {
    case 'A15':  return 'A15 (Pedestrian)'
    case 'B125': return 'B125 (Light Traffic)'
    case 'C250': return 'C250 (Medium Traffic)'
    case 'D400': return 'D400 (Heavy Traffic)'
    case 'E600': return 'E600 (Very Heavy)'
    case 'F900': return 'F900 (Aircraft)'
    default:     return '-'
  }
}

// -- HELPER: Cover type display label ---------------------------------

function coverTypeLabel(val: string | null): string {
  switch (val) {
    case 'solid':  return 'Solid'
    case 'grated': return 'Grated'
    default:       return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const drawpitSteps: StepDefinition[] = [
  {
    id: 'dp-dimensions',
    label: 'Dimensions',
    heading: 'Plan Dimensions',
    subheading: 'Enter the internal length and width in millimetres.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getDrawpitData(state)
      return d !== null && d.lengthMm !== '' && d.widthMm !== ''
    },
  },
  {
    id: 'dp-depth-rings',
    label: 'Depth',
    heading: 'Depth and Ring Count',
    subheading: 'Enter the installation depth and number of interlocking rings.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getDrawpitData(state)
      return d !== null && d.depthMm !== '' && d.ringCount !== ''
    },
  },
  {
    id: 'dp-load-rating',
    label: 'Load Rating',
    heading: 'Load Rating',
    subheading: 'Select the structural load rating for the cover.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getDrawpitData(state)
      return d !== null && d.loadRating !== null
    },
  },
  {
    id: 'dp-cover-type',
    label: 'Cover Type',
    heading: 'Cover Type',
    subheading: 'Select the cover type for this drawpit.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getDrawpitData(state)
      return d !== null && d.coverType !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function drawpitReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'drawpit') return productData

  const data = productData.data

  switch (action.type) {
    case 'DP_SET_LENGTH':
      return {
        kind: 'drawpit',
        data: { ...data, lengthMm: action.payload },
      }

    case 'DP_SET_WIDTH':
      return {
        kind: 'drawpit',
        data: { ...data, widthMm: action.payload },
      }

    case 'DP_SET_DEPTH':
      return {
        kind: 'drawpit',
        data: { ...data, depthMm: action.payload },
      }

    case 'DP_SET_RINGS':
      return {
        kind: 'drawpit',
        data: { ...data, ringCount: action.payload },
      }

    case 'DP_SET_LOAD_RATING':
      return {
        kind: 'drawpit',
        data: { ...data, loadRating: action.payload },
      }

    case 'DP_SET_COVER':
      return {
        kind: 'drawpit',
        data: { ...data, coverType: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getDrawpitData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.lengthMm && d.widthMm) {
    fields.push({ label: 'Dimensions', value: `${d.lengthMm} x ${d.widthMm}mm` })
  }
  if (d.depthMm) {
    fields.push({ label: 'Depth', value: `${d.depthMm}mm` })
  }
  if (d.ringCount) {
    fields.push({ label: 'Rings', value: d.ringCount })
  }
  if (d.loadRating) {
    fields.push({ label: 'Load Rating', value: loadRatingLabel(d.loadRating) })
  }
  if (d.coverType) {
    fields.push({ label: 'Cover Type', value: coverTypeLabel(d.coverType) })
  }

  return fields
}

// -- REVIEW BLOCKS ----------------------------------------------------

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Drawpit Dimensions',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getDrawpitData(s)
        if (!d) return []
        return [
          { label: 'Length', value: d.lengthMm ? `${d.lengthMm}mm` : '-' },
          { label: 'Width', value: d.widthMm ? `${d.widthMm}mm` : '-' },
          { label: 'Depth', value: d.depthMm ? `${d.depthMm}mm` : '-' },
          { label: 'Ring Count', value: d.ringCount || '-' },
        ]
      },
    },
    {
      title: 'Cover Specification',
      editStep: 3,
      fields: (s: WizardState) => {
        const d = getDrawpitData(s)
        if (!d) return []
        return [
          { label: 'Load Rating', value: loadRatingLabel(d.loadRating) },
          { label: 'Cover Type', value: coverTypeLabel(d.coverType) },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const drawpitConfig: ProductConfig = {
  id: 'drawpit',
  name: 'Drawpit',
  subtitle: 'Interlocking structural access chambers for utilities',
  category: 'drawpits',
  icon: 'drawpit',
  steps: drawpitSteps,
  initialData: DRAWPIT_INITIAL_DATA,
  generateProductCode: dpGenerateProductCode,
  generateCompliance: dpGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: false,
}
