/**
 * Shared helpers for step components.
 * Provides type-safe extraction of product data fields
 * and product-prefixed action type resolution.
 */

import type {
  WizardState,
  ProductId,
  SystemType,
  Diameter,
  DepthMm,
  PipeSize,
  ClockPosition,
  FlowType,
  ChamberBaseFields,
} from '@/lib/types'

// ── CHAMBER-LIKE DATA EXTRACTION ────────────────────────────

/**
 * Returns the underlying data for chamber-like products
 * (chamber, catchpit) which share ChamberBaseFields.
 */
export function getChamberLikeData(state: WizardState): ChamberBaseFields | null {
  if (!state.productData) return null
  const kind = state.productData.kind
  if (kind === 'chamber' || kind === 'catchpit') {
    return state.productData.data
  }
  return null
}

// ── FIELD EXTRACTORS ────────────────────────────────────────

/**
 * Safely extract the product data as a record for field checking.
 * The double cast (unknown -> Record) avoids strict TS errors
 * when interfaces don't have index signatures.
 */
function asRecord(state: WizardState): Record<string, unknown> | null {
  if (!state.productData) return null
  return state.productData.data as unknown as Record<string, unknown>
}

export function getSystemTypeValue(state: WizardState): SystemType | null {
  const d = asRecord(state)
  if (!d) return null
  if ('systemType' in d && d.systemType !== undefined) {
    return d.systemType as SystemType | null
  }
  return null
}

export function getDiameterValue(state: WizardState): Diameter | null {
  const d = asRecord(state)
  if (!d) return null
  if ('diameter' in d && d.diameter !== undefined) {
    return d.diameter as Diameter | null
  }
  return null
}

export function getDepthValue(state: WizardState): DepthMm | null {
  const d = asRecord(state)
  if (!d) return null
  if ('depth' in d && d.depth !== undefined) {
    return d.depth as DepthMm | null
  }
  return null
}

export function getAdoptableValue(state: WizardState): boolean | null {
  const d = asRecord(state)
  if (!d) return null
  if ('adoptable' in d && d.adoptable !== undefined) {
    return d.adoptable as boolean | null
  }
  return null
}

export function getInletCountValue(state: WizardState): number | null {
  const d = asRecord(state)
  if (!d) return null
  if ('inletCount' in d && d.inletCount !== undefined) {
    return d.inletCount as number | null
  }
  return null
}

export function getPositionsValue(state: WizardState): ClockPosition[] {
  const d = asRecord(state)
  if (!d) return []
  if ('positions' in d && Array.isArray(d.positions)) {
    return d.positions as ClockPosition[]
  }
  return []
}

export function getOutletLockedValue(state: WizardState): PipeSize | null {
  const d = asRecord(state)
  if (!d) return null
  if ('outletLocked' in d && d.outletLocked !== undefined) {
    return d.outletLocked as PipeSize | null
  }
  return null
}


export function getPipeSizesValue(state: WizardState): Record<string, PipeSize> {
  const d = asRecord(state)
  if (!d) return {}
  if ('pipeSizes' in d && d.pipeSizes !== undefined) {
    return d.pipeSizes as Record<string, PipeSize>
  }
  return {}
}

export function getFlowControlValue(state: WizardState): boolean | null {
  const d = asRecord(state)
  if (!d) return null
  if ('flowControl' in d && d.flowControl !== undefined) {
    return d.flowControl as boolean | null
  }
  return null
}

export function getFlowTypeValue(state: WizardState): FlowType | null {
  const d = asRecord(state)
  if (!d) return null
  if ('flowType' in d && d.flowType !== undefined) {
    return d.flowType as FlowType | null
  }
  return null
}

export function getFlowRateValue(state: WizardState): string {
  const d = asRecord(state)
  if (!d) return ''
  if ('flowRate' in d && typeof d.flowRate === 'string') {
    return d.flowRate
  }
  return ''
}

// ── ACTION TYPE RESOLUTION ──────────────────────────────────

type SystemActionType =
  | 'CHAMBER_SET_SYSTEM'
  | 'CATCHPIT_SET_SYSTEM'
  | 'FC_SET_SYSTEM'
  | 'PUMP_SET_SYSTEM'

export function getSystemActionType(product: ProductId | null): SystemActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_SYSTEM'
    case 'flow-control': return 'FC_SET_SYSTEM'
    case 'pump-station': return 'PUMP_SET_SYSTEM'
    default: return 'CHAMBER_SET_SYSTEM'
  }
}

type DiameterActionType =
  | 'CHAMBER_SET_DIAMETER'
  | 'CATCHPIT_SET_DIAMETER'
  | 'FC_SET_CHAMBER_DIAMETER'
  | 'PUMP_SET_DIAMETER'

export function getDiameterActionType(product: ProductId | null): DiameterActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_DIAMETER'
    case 'flow-control': return 'FC_SET_CHAMBER_DIAMETER'
    case 'pump-station': return 'PUMP_SET_DIAMETER'
    default: return 'CHAMBER_SET_DIAMETER'
  }
}

type InletCountActionType =
  | 'CHAMBER_SET_INLET_COUNT'
  | 'CATCHPIT_SET_INLET_COUNT'

export function getInletCountActionType(product: ProductId | null): InletCountActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_INLET_COUNT'
    default: return 'CHAMBER_SET_INLET_COUNT'
  }
}

type TogglePositionActionType =
  | 'CHAMBER_TOGGLE_POSITION'
  | 'CATCHPIT_TOGGLE_POSITION'

export function getTogglePositionActionType(product: ProductId | null): TogglePositionActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_TOGGLE_POSITION'
    default: return 'CHAMBER_TOGGLE_POSITION'
  }
}


type PipeSizeActionType =
  | 'CHAMBER_SET_PIPE_SIZE'
  | 'CATCHPIT_SET_PIPE_SIZE'

export function getPipeSizeActionType(product: ProductId | null): PipeSizeActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_PIPE_SIZE'
    default: return 'CHAMBER_SET_PIPE_SIZE'
  }
}

type FlowControlActionType = 'CHAMBER_SET_FLOW_CONTROL'

export function getFlowControlActionType(_product: ProductId | null): FlowControlActionType {
  return 'CHAMBER_SET_FLOW_CONTROL'
}

type FlowTypeActionType = 'CHAMBER_SET_FLOW_TYPE'

export function getFlowTypeActionType(_product: ProductId | null): FlowTypeActionType {
  return 'CHAMBER_SET_FLOW_TYPE'
}

type FlowRateActionType = 'CHAMBER_SET_FLOW_RATE'

export function getFlowRateActionType(_product: ProductId | null): FlowRateActionType {
  return 'CHAMBER_SET_FLOW_RATE'
}

type DepthActionType =
  | 'CHAMBER_SET_DEPTH'
  | 'CATCHPIT_SET_DEPTH'
  | 'PUMP_SET_DEPTH'

export function getDepthActionType(product: ProductId | null): DepthActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_DEPTH'
    case 'pump-station': return 'PUMP_SET_DEPTH'
    default: return 'CHAMBER_SET_DEPTH'
  }
}

type AdoptableActionType =
  | 'CHAMBER_SET_ADOPTABLE'
  | 'CATCHPIT_SET_ADOPTABLE'

export function getAdoptableActionType(product: ProductId | null): AdoptableActionType {
  switch (product) {
    case 'catchpit': return 'CATCHPIT_SET_ADOPTABLE'
    default: return 'CHAMBER_SET_ADOPTABLE'
  }
}
