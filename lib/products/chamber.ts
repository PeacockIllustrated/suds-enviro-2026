/**
 * Chamber Product Configuration
 *
 * Defines the product config, sub-reducer, and step definitions
 * for the Inspection Chamber product.
 */

import type { ComponentType } from 'react'
import type {
  ProductData,
  ChamberData,
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
  generateProductCode as chamberGenerateProductCode,
  generateCompliance as chamberGenerateCompliance,
} from '@/lib/rules/chamber'

// ── INITIAL DATA ─────────────────────────────────────────────

export const CHAMBER_INITIAL_DATA: ProductData = {
  kind: 'chamber',
  data: {
    systemType: null,
    diameter: null,
    inletCount: null,
    positions: [],
    pipeSizes: {},
    outletLocked: null,
    flowControl: null,
    flowType: null,
    flowRate: '',
    depth: null,
    adoptable: null,
  },
}

// ── STEP IDS ─────────────────────────────────────────────────

export const CHAMBER_STEP_IDS = [
  'system-type',
  'diameter',
  'inlet-count',
  'clock-face',
  'pipe-sizes',
  'flow-control',
  'depth',
] as const

export type ChamberStepId = (typeof CHAMBER_STEP_IDS)[number]

// ── HELPER: Extract ChamberData ──────────────────────────────

function getChamberData(state: WizardState): ChamberData | null {
  if (!state.productData || state.productData.kind !== 'chamber') return null
  return state.productData.data
}

// ── HELPER: System type display label ────────────────────────

function systemTypeLabel(val: string | null): string {
  switch (val) {
    case 'surface':  return 'Surface Water'
    case 'foul':     return 'Foul'
    case 'combined': return 'Combined'
    default:         return '-'
  }
}

// ── HELPER: Flow type display label ──────────────────────────

function flowTypeLabel(val: string | null): string {
  switch (val) {
    case 'Vortex':        return 'Vortex'
    case 'Orifice plate': return 'Orifice Plate'
    default:              return '-'
  }
}

// ── STEP DEFINITIONS ─────────────────────────────────────────

const chamberSteps: StepDefinition[] = [
  {
    id: 'system-type',
    label: 'System Type',
    heading: 'System Type',
    subheading: 'What type of drainage system is this chamber for?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
      return d !== null && d.systemType !== null
    },
  },
  {
    id: 'diameter',
    label: 'Diameter',
    heading: 'Chamber Diameter',
    subheading: 'Select the external diameter of the chamber body.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
      return d !== null && d.diameter !== null
    },
  },
  {
    id: 'inlet-count',
    label: 'Inlets',
    heading: 'Number of Inlets',
    subheading: (state: WizardState) => {
      const d = getChamberData(state)
      if (!d?.diameter) return 'How many inlet connections does this chamber need?'
      const max = getMaxInlets(d.diameter)
      return `How many inlet connections? (max ${max} for ${d.diameter}mm)`
    },
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
      return d !== null && d.inletCount !== null
    },
  },
  {
    id: 'clock-face',
    label: 'Positions',
    heading: 'Inlet Positions',
    subheading: (state: WizardState) => {
      const d = getChamberData(state)
      if (!d?.inletCount) return 'Place each inlet on the clock face.'
      const remaining = d.inletCount - d.positions.length
      if (remaining <= 0) return 'All inlets placed. Tap a position to remove it.'
      return `Place ${remaining} more inlet${remaining > 1 ? 's' : ''} on the clock face.`
    },
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
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
      const d = getChamberData(state)
      if (!d || !d.inletCount) return false
      // Check each inlet has a pipe size assigned
      for (let i = 1; i <= d.inletCount; i++) {
        if (!d.pipeSizes[`inlet${i}`]) return false
      }
      return true
    },
  },
  {
    id: 'flow-control',
    label: 'Flow Control',
    heading: 'Flow Control',
    subheading: 'Does this chamber require a flow control device?',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
      if (!d || d.flowControl === null) return false
      if (d.flowControl) {
        return d.flowType !== null && d.flowRate !== ''
      }
      return true
    },
  },
  {
    id: 'depth',
    label: 'Depth',
    heading: 'Installation Depth',
    subheading: 'Select the adoption status and shaft depth.',
    component: null as unknown as ComponentType,
    canProceed: (state: WizardState) => {
      const d = getChamberData(state)
      return d !== null && d.adoptable !== null && d.depth !== null
    },
  },
]

// ── SUB-REDUCER ──────────────────────────────────────────────

export function chamberReducer(
  productData: ProductData,
  action: WizardAction
): ProductData {
  if (productData.kind !== 'chamber') return productData

  const data = productData.data

  switch (action.type) {
    case 'CHAMBER_SET_SYSTEM':
      return {
        kind: 'chamber',
        data: { ...data, systemType: action.payload },
      }

    case 'CHAMBER_SET_DIAMETER': {
      const newDiameter = action.payload
      const maxInlets = getMaxInlets(newDiameter)

      // R1: if current inlet count exceeds new max, reset downstream state
      if (data.inletCount !== null && data.inletCount > maxInlets) {
        return {
          kind: 'chamber',
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
        kind: 'chamber',
        data: {
          ...data,
          diameter: newDiameter,
          outletLocked,
          pipeSizes: cleanedPipeSizes,
        },
      }
    }

    case 'CHAMBER_SET_INLET_COUNT': {
      const newCount = action.payload

      // R2: check if outlet needs locking
      const outletLocked = data.diameter !== null
        ? getOutletMinSize(newCount, data.diameter)
        : null

      // R3 is a no-op when outlet is fixed at 12 - kept for future variants
      const blocked = getBlockedPositions(outletLocked)
      const validPositions = data.positions.filter((pos) => !blocked.includes(pos))

      // If reducing inlet count, trim positions to new count
      const trimmedPositions = validPositions.slice(0, newCount)

      // Clean pipe sizes: remove entries for inlets beyond new count
      const cleanedPipeSizes: Record<string, typeof data.pipeSizes[string]> = {}
      for (let i = 1; i <= newCount; i++) {
        const key = `inlet${i}`
        if (data.pipeSizes[key]) {
          // Also verify the size is still valid with the new outlet lock
          const available = getAvailableInletSizes(data.diameter, outletLocked)
          if (available.includes(data.pipeSizes[key])) {
            cleanedPipeSizes[key] = data.pipeSizes[key]
          }
        }
      }

      return {
        kind: 'chamber',
        data: {
          ...data,
          inletCount: newCount,
          outletLocked,
          positions: trimmedPositions,
          pipeSizes: cleanedPipeSizes,
        },
      }
    }

    case 'CHAMBER_TOGGLE_POSITION': {
      const pos = action.payload
      const existing = data.positions.indexOf(pos)

      if (existing >= 0) {
        // Remove the position
        const newPositions = data.positions.filter((p) => p !== pos)
        return {
          kind: 'chamber',
          data: { ...data, positions: newPositions },
        }
      }

      // Add the position if under the limit
      if (data.inletCount !== null && data.positions.length >= data.inletCount) {
        return productData // at capacity, no change
      }

      return {
        kind: 'chamber',
        data: { ...data, positions: [...data.positions, pos] },
      }
    }

    case 'CHAMBER_SET_PIPE_SIZE':
      return {
        kind: 'chamber',
        data: {
          ...data,
          pipeSizes: {
            ...data.pipeSizes,
            [action.payload.slot]: action.payload.size,
          },
        },
      }

    case 'CHAMBER_SET_FLOW_CONTROL':
      return {
        kind: 'chamber',
        data: {
          ...data,
          flowControl: action.payload,
          // Reset flow sub-fields when toggling off
          flowType: action.payload ? data.flowType : null,
          flowRate: action.payload ? data.flowRate : '',
        },
      }

    case 'CHAMBER_SET_FLOW_TYPE':
      return {
        kind: 'chamber',
        data: { ...data, flowType: action.payload },
      }

    case 'CHAMBER_SET_FLOW_RATE':
      return {
        kind: 'chamber',
        data: { ...data, flowRate: action.payload },
      }

    case 'CHAMBER_SET_DEPTH':
      return {
        kind: 'chamber',
        data: { ...data, depth: action.payload },
      }

    case 'CHAMBER_SET_ADOPTABLE': {
      const newAdoptable = action.payload
      const maxD = getMaxDepth(newAdoptable)

      // R4: if current depth exceeds new max, reset it
      const newDepth = data.depth !== null && data.depth > maxD
        ? null
        : data.depth

      return {
        kind: 'chamber',
        data: {
          ...data,
          adoptable: newAdoptable,
          depth: newDepth,
        },
      }
    }

    default:
      return productData
  }
}

// ── SUMMARY FIELDS ───────────────────────────────────────────

function getSummaryFields(state: WizardState): SummaryField[] {
  const d = getChamberData(state)
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
  // Outlet always at 12 o'clock. If R2 has locked the size, mark it.
  fields.push({
    label: 'Outlet',
    value: d.outletLocked
      ? `12 o'clock - ${d.outletLocked}`
      : `12 o'clock`,
    locked: d.outletLocked !== null,
  })
  if (d.flowControl !== null) {
    fields.push({
      label: 'Flow Control',
      value: d.flowControl
        ? `${flowTypeLabel(d.flowType)} @ ${d.flowRate || '?'} L/s`
        : 'None',
    })
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

// ── REVIEW BLOCKS ────────────────────────────────────────────

function getReviewBlocks(_state: WizardState): ReviewBlockDef[] {
  return [
    {
      title: 'Chamber',
      editStep: 1, // system-type is step index 1 (after product select at 0)
      fields: (s: WizardState) => {
        const d = getChamberData(s)
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
      editStep: 3, // inlet-count is step index 3
      fields: (s: WizardState) => {
        const d = getChamberData(s)
        if (!d) return []
        const rows: { label: string; value: string; highlight?: boolean }[] = []

        rows.push({
          label: 'Inlet Count',
          value: d.inletCount !== null ? `${d.inletCount}` : '-',
        })

        // List each inlet with position and size
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
            ? `12 o'clock - ${d.outletLocked} (locked)`
            : `12 o'clock - Standard`,
          highlight: d.outletLocked !== null,
        })

        return rows
      },
    },
    {
      title: 'Flow Control',
      editStep: 6, // flow-control is step index 6
      fields: (s: WizardState) => {
        const d = getChamberData(s)
        if (!d) return []
        if (!d.flowControl) {
          return [{ label: 'Flow Control', value: 'Not required' }]
        }
        return [
          { label: 'Flow Control', value: 'Required' },
          { label: 'Type', value: flowTypeLabel(d.flowType) },
          { label: 'Rate', value: d.flowRate ? `${d.flowRate} L/s` : '-' },
        ]
      },
    },
  ]
}

// ── PRODUCT CONFIG ───────────────────────────────────────────

export const chamberConfig: ProductConfig = {
  id: 'chamber',
  name: 'Inspection Chamber',
  subtitle: 'HDPE rotationally moulded drainage chamber',
  category: 'chambers',
  icon: 'chamber',
  steps: chamberSteps,
  initialData: CHAMBER_INITIAL_DATA,
  generateProductCode: chamberGenerateProductCode,
  generateCompliance: chamberGenerateCompliance,
  getSummaryFields,
  getReviewBlocks,
  has3dViewer: true,
}
