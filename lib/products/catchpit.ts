/**
 * Catchpit / Silt Trap Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Catchpit product. Shares chamber-like physical constraints
 * (R1-R7) and adds silt management options (baffle + grate).
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  CatchpitData,
  WizardState,
  WizardAction,
  SummaryField,
  ReviewBlockDef,
} from '@/lib/types'
import type { ProductConfig, StepDefinition } from '@/lib/products/registry'
import {
  getMaxInlets,
  getOutletMinSize,
  getBlockedPositions,
  getMaxDepth,
  getAvailableInletSizes,
  generateProductCode as catchpitGenerateProductCode,
  generateCompliance as catchpitGenerateCompliance,
} from '@/lib/rules/catchpit'

// -- INITIAL DATA -----------------------------------------------------

export const CATCHPIT_INITIAL_DATA: ProductData = {
  kind: 'catchpit',
  data: {
    systemType: null,
    diameter: null,
    inletCount: null,
    positions: [],
    pipeSizes: {},
    outletLocked: null,
    outletPosition: '6',
    flowControl: null,
    flowType: null,
    flowRate: '',
    depth: null,
    adoptable: null,
    baffleType: null,
    grateType: null,
  },
}

// -- STEP IDS ---------------------------------------------------------

export const CATCHPIT_STEP_IDS = [
  'system-type',
  'diameter',
  'inlet-count',
  'clock-face',
  'pipe-sizes',
  'silt-options',
  'depth',
] as const

export type CatchpitStepId = (typeof CATCHPIT_STEP_IDS)[number]

// -- HELPER: Extract CatchpitData ------------------------------------

function getCatchpitData(state: WizardState): CatchpitData | null {
  if (!state.productData || state.productData.kind !== 'catchpit') return null
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

// -- HELPER: Baffle type display label --------------------------------

function baffleTypeLabel(val: string | null): string {
  switch (val) {
    case 'none':     return 'None'
    case 'internal': return 'Internal'
    case 'external': return 'External'
    default:         return '-'
  }
}

// -- HELPER: Grate type display label ---------------------------------

function grateTypeLabel(val: string | null): string {
  switch (val) {
    case 'hinged': return 'Hinged'
    case 'sealed': return 'Sealed'
    default:       return '-'
  }
}

// -- STEP DEFINITIONS -------------------------------------------------

const catchpitSteps: StepDefinition[] = [
  {
    id: 'system-type',
    label: 'System Type',
    heading: 'System Type',
    subheading: 'What type of drainage system is this catchpit for?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.systemType !== null
    },
  },
  {
    id: 'diameter',
    label: 'Diameter',
    heading: 'Catchpit Diameter',
    subheading: 'Select the external diameter of the catchpit body.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.diameter !== null
    },
  },
  {
    id: 'inlet-count',
    label: 'Inlets',
    heading: 'Number of Inlets',
    subheading: (state: WizardState) => {
      const d = getCatchpitData(state)
      if (!d?.diameter) return 'How many inlet connections does this catchpit need?'
      const max = getMaxInlets(d.diameter)
      return `How many inlet connections? (max ${max} for ${d.diameter}mm)`
    },
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.inletCount !== null
    },
  },
  {
    id: 'clock-face',
    label: 'Positions',
    heading: 'Inlet Positions',
    subheading: (state: WizardState) => {
      const d = getCatchpitData(state)
      if (!d?.inletCount) return 'Place each inlet on the clock face.'
      const remaining = d.inletCount - d.positions.length
      if (remaining <= 0) return 'All inlets placed. Tap a position to remove it.'
      return `Place ${remaining} more inlet${remaining > 1 ? 's' : ''} on the clock face.`
    },
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.inletCount !== null && d.positions.length === d.inletCount
    },
  },
  {
    id: 'pipe-sizes',
    label: 'Pipe Sizes',
    heading: 'Pipe Sizes',
    subheading: 'Select the pipe size for each connection.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      if (!d || !d.inletCount) return false
      for (let i = 1; i <= d.inletCount; i++) {
        if (!d.pipeSizes[`inlet${i}`]) return false
      }
      return true
    },
  },
  {
    id: 'silt-options',
    label: 'Silt Options',
    heading: 'Silt Management',
    subheading: 'Select the baffle and grate configuration for silt retention.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.baffleType !== null && d.grateType !== null
    },
  },
  {
    id: 'depth',
    label: 'Depth',
    heading: 'Installation Depth',
    subheading: 'Select the adoption status and shaft depth.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getCatchpitData(state)
      return d !== null && d.adoptable !== null && d.depth !== null
    },
  },
]

// -- SUB-REDUCER ------------------------------------------------------

export function catchpitReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'catchpit') return productData

  const data = productData.data

  switch (action.type) {
    case 'CATCHPIT_SET_SYSTEM':
      return {
        kind: 'catchpit',
        data: { ...data, systemType: action.payload },
      }

    case 'CATCHPIT_SET_DIAMETER': {
      const newDiameter = action.payload
      const maxInlets = getMaxInlets(newDiameter)

      // R1: if current inlet count exceeds new max, reset downstream state
      if (data.inletCount !== null && data.inletCount > maxInlets) {
        return {
          kind: 'catchpit',
          data: {
            ...data,
            diameter: newDiameter,
            inletCount: null,
            positions: [],
            pipeSizes: {},
            outletLocked: null,
          },
        }
      }

      // Re-evaluate R2 outlet lock with new diameter
      const outletLocked = data.inletCount !== null
        ? getOutletMinSize(data.inletCount, newDiameter)
        : null

      // Re-evaluate pipe sizes: remove any that exceed new limits
      const availableSizes = getAvailableInletSizes(newDiameter, outletLocked)
      const cleanedPipeSizes: Record<string, typeof data.pipeSizes[string]> = {}
      for (const [slot, size] of Object.entries(data.pipeSizes)) {
        if (availableSizes.includes(size)) {
          cleanedPipeSizes[slot] = size
        }
      }

      return {
        kind: 'catchpit',
        data: {
          ...data,
          diameter: newDiameter,
          outletLocked,
          pipeSizes: cleanedPipeSizes,
        },
      }
    }

    case 'CATCHPIT_SET_INLET_COUNT': {
      const newCount = action.payload

      // R2: check if outlet needs locking
      const outletLocked = data.diameter !== null
        ? getOutletMinSize(newCount, data.diameter)
        : null

      // R3: blocked positions may have changed (account for outlet position)
      const blocked = getBlockedPositions(outletLocked, data.outletPosition)
      const validPositions = data.positions.filter(
        (pos) => !blocked.includes(pos) && pos !== data.outletPosition
      )
      const trimmedPositions = validPositions.slice(0, newCount)

      // Clean pipe sizes
      const cleanedPipeSizes: Record<string, typeof data.pipeSizes[string]> = {}
      for (let i = 1; i <= newCount; i++) {
        const key = `inlet${i}`
        if (data.pipeSizes[key]) {
          const available = getAvailableInletSizes(data.diameter, outletLocked)
          if (available.includes(data.pipeSizes[key])) {
            cleanedPipeSizes[key] = data.pipeSizes[key]
          }
        }
      }

      return {
        kind: 'catchpit',
        data: {
          ...data,
          inletCount: newCount,
          outletLocked,
          positions: trimmedPositions,
          pipeSizes: cleanedPipeSizes,
        },
      }
    }

    case 'CATCHPIT_SET_OUTLET_POSITION': {
      const newOutletPos = action.payload
      const blocked = getBlockedPositions(data.outletLocked, newOutletPos)
      const validPositions = data.positions.filter(
        (pos) => pos !== newOutletPos && !blocked.includes(pos)
      )
      return {
        kind: 'catchpit',
        data: {
          ...data,
          outletPosition: newOutletPos,
          positions: validPositions,
        },
      }
    }

    case 'CATCHPIT_TOGGLE_POSITION': {
      const pos = action.payload
      if (pos === data.outletPosition) return productData
      const existing = data.positions.indexOf(pos)

      if (existing >= 0) {
        const newPositions = data.positions.filter((p) => p !== pos)
        return {
          kind: 'catchpit',
          data: { ...data, positions: newPositions },
        }
      }

      if (data.inletCount !== null && data.positions.length >= data.inletCount) {
        return productData
      }

      return {
        kind: 'catchpit',
        data: { ...data, positions: [...data.positions, pos] },
      }
    }

    case 'CATCHPIT_SET_PIPE_SIZE':
      return {
        kind: 'catchpit',
        data: {
          ...data,
          pipeSizes: {
            ...data.pipeSizes,
            [action.payload.slot]: action.payload.size,
          },
        },
      }

    case 'CATCHPIT_SET_DEPTH':
      return {
        kind: 'catchpit',
        data: { ...data, depth: action.payload },
      }

    case 'CATCHPIT_SET_ADOPTABLE': {
      const newAdoptable = action.payload
      const maxD = getMaxDepth(newAdoptable)
      const newDepth = data.depth !== null && data.depth > maxD ? null : data.depth

      return {
        kind: 'catchpit',
        data: {
          ...data,
          adoptable: newAdoptable,
          depth: newDepth,
        },
      }
    }

    case 'CATCHPIT_SET_BAFFLE':
      return {
        kind: 'catchpit',
        data: { ...data, baffleType: action.payload },
      }

    case 'CATCHPIT_SET_GRATE':
      return {
        kind: 'catchpit',
        data: { ...data, grateType: action.payload },
      }

    default:
      return productData
  }
}

// -- SUMMARY FIELDS ---------------------------------------------------

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getCatchpitData(state)
  if (!d) return []

  const fields: SummaryField[] = []

  if (d.systemType) {
    fields.push({ label: 'System', value: systemTypeLabel(d.systemType) })
  }
  if (d.diameter) {
    fields.push({ label: 'Diameter', value: `${d.diameter}mm` })
  }
  if (d.inletCount !== null) {
    fields.push({ label: 'Inlets', value: `${d.inletCount}` })
  }
  if (d.positions.length > 0) {
    fields.push({
      label: 'Positions',
      value: d.positions.map((p) => `${p} o'clock`).join(', '),
    })
  }
  fields.push({
    label: 'Outlet',
    value: d.outletLocked
      ? `${d.outletPosition} o'clock - ${d.outletLocked}`
      : `${d.outletPosition} o'clock`,
    locked: d.outletLocked !== null,
  })
  if (d.baffleType) {
    fields.push({ label: 'Baffle', value: baffleTypeLabel(d.baffleType) })
  }
  if (d.grateType) {
    fields.push({ label: 'Grate', value: grateTypeLabel(d.grateType) })
  }
  if (d.adoptable !== null) {
    fields.push({
      label: 'Adoption',
      value: d.adoptable ? 'Adoptable (S104)' : 'Private',
    })
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
      title: 'Chamber',
      editStep: 1,
      fields: (s: WizardState) => {
        const d = getCatchpitData(s)
        if (!d) return []
        return [
          { label: 'System Type', value: systemTypeLabel(d.systemType) },
          { label: 'Diameter', value: d.diameter ? `${d.diameter}mm` : '-' },
          {
            label: 'Adoption Status',
            value: d.adoptable === null
              ? '-'
              : d.adoptable
                ? 'Adoptable (S104)'
                : 'Private',
          },
          { label: 'Depth', value: d.depth ? `${d.depth}mm` : '-' },
        ]
      },
    },
    {
      title: 'Pipework',
      editStep: 3,
      fields: (s: WizardState) => {
        const d = getCatchpitData(s)
        if (!d) return []
        const rows: { label: string; value: string; highlight?: boolean }[] = []

        rows.push({
          label: 'Inlet Count',
          value: d.inletCount !== null ? `${d.inletCount}` : '-',
        })

        for (let i = 0; i < d.positions.length; i++) {
          const pos = d.positions[i]
          const size = d.pipeSizes[`inlet${i + 1}`] ?? '-'
          rows.push({
            label: `Inlet ${i + 1}`,
            value: `${pos} o'clock - ${size}`,
          })
        }

        rows.push({
          label: 'Outlet',
          value: d.outletLocked
            ? `${d.outletPosition} o'clock - ${d.outletLocked} (locked)`
            : `${d.outletPosition} o'clock - Standard`,
          highlight: d.outletLocked !== null,
        })

        return rows
      },
    },
    {
      title: 'Silt Options',
      editStep: 6,
      fields: (s: WizardState) => {
        const d = getCatchpitData(s)
        if (!d) return []
        return [
          { label: 'Baffle Type', value: baffleTypeLabel(d.baffleType) },
          { label: 'Grate Type', value: grateTypeLabel(d.grateType) },
        ]
      },
    },
  ]
}

// -- PRODUCT CONFIG ---------------------------------------------------

export const catchpitConfig: ProductConfig = {
  id: 'catchpit',
  name: 'Catchpit / Silt Trap',
  subtitle: 'HDPE catchpit with integrated silt management',
  category: 'chambers',
  icon: 'catchpit',
  steps: catchpitSteps,
  initialData: CATCHPIT_INITIAL_DATA,
  generateProductCode: catchpitGenerateProductCode,
  generateCompliance: catchpitGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: true,
}
