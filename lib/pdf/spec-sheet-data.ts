/**
 * Spec sheet data - turns a saved chamber or catchpit configuration into
 * every value the specification page and the engineering drawing print.
 *
 * All geometry follows the same model as the 3D viewer
 * (components/viewer3d/build-model.ts):
 *   - the outlet is fixed at 12 o'clock (0 degrees, north)
 *   - the outlet invert sits `sump` mm above the internal base
 *   - inlet soffits are aligned with the outlet soffit
 *   - depth is measured from cover level to the outlet soffit
 *   - chambers wider than 600 mm take a reducing cap to a 600 mm opening
 */

import type {
  CatchpitData,
  CatchpitVariant,
  ChamberData,
  ComplianceResult,
  Diameter,
  FlowType,
  PipeSize,
  ProductData,
  SystemType,
  WizardState,
} from '@/lib/types'
import { generateCompliance, generateProductCode, getRuleModule, validateConfig } from '@/lib/rule-engine'
import {
  getChamberSeries,
  getEffectiveOutletSize,
  getMaxInletPipeSize,
  getMaxInlets,
  getOutletMinSize,
  VALID_INLET_POSITIONS,
} from '@/lib/rules/chamber'
import { getMinSumpDepth } from '@/lib/rules/catchpit'
import { PIPE_DIMS } from '@/lib/pipe-dims'

// ── Constants shared with the 3D model ──────────────────────

/** Base slab under the internal floor, mm. */
export const FLOOR_THICKNESS = 40
/** Chamber wall (rib tip to bore), mm. */
export const WALL_THICKNESS = 30
/** Cover and frame height, mm. */
export const COVER_HEIGHT = 110
/** Reducing cap thickness on chambers wider than 600 mm, mm. */
export const CAP_THICKNESS = 80
/** Clear opening of the reducing cap, mm. */
export const REDUCED_OPENING = 600
/** Inspection chamber sump below the outlet invert, mm. */
export const CHAMBER_SUMP = 350

const PIPE_ORDER: PipeSize[] = [
  '110mm EN1401',
  '160mm EN1401',
  '225mm Twinwall',
  '300mm Twinwall',
  '450mm Twinwall',
]
const rank = (size: PipeSize): number => PIPE_ORDER.indexOf(size)

// ── Types ───────────────────────────────────────────────────

export type SheetStatus = 'Pass' | 'Fail' | 'Warning'

export interface SheetPipe {
  /** 'OUT' or 'IN1' .. 'IN5'. */
  ref: string
  /** Clock hour: 12 for the outlet, 3 / 5 / 6 / 7 / 9 for inlets. */
  hour: number
  /** Degrees clockwise from north. */
  angle: number
  size: PipeSize
  od: number
  bore: number
  /** Invert above the internal base, mm. */
  invertH: number
  /** Centreline above the internal base, mm. */
  centreH: number
}

export interface BomRow {
  description: string
  material: string
  qty: string
  partNo: string
}

export interface RuleLogEntry {
  rule: string
  title: string
  detail: string
  status: SheetStatus
}

export type ChamberTop = 'cover' | 'hinged-grate' | 'sealed-grate'

export interface SpecSheetData {
  kind: 'chamber' | 'catchpit'
  /** Drawing title, e.g. INSPECTION CHAMBER. */
  title: string
  /** Series line, e.g. RHINO SERSIC SERIES. */
  seriesLine: string
  /** Series code used in part numbers, e.g. SERSIC. */
  series: string
  productCode: string
  drawingNo: string
  configRef: string | null
  quoteRef: string | null
  date: string

  systemType: SystemType | null
  systemLabel: string
  adoptable: boolean
  adoptionLabel: string

  diameter: number
  depth: number
  sump: number
  /** Cover level to the underside of the base, mm. */
  overallHeight: number
  reduced: boolean
  top: ChamberTop
  topLabel: string

  outlet: SheetPipe
  /** R2 has locked a minimum outlet size. */
  outletLocked: boolean
  outletLockSize: PipeSize | null
  inlets: SheetPipe[]

  flow: { type: FlowType; rate: string } | null
  variant: CatchpitVariant | null
  baffle: 'none' | 'internal' | 'external'

  maxDepthAdoptable: number
  maxDepthPrivate: number
  maxDepth: number

  compliance: ComplianceResult[]
  ruleLog: RuleLogEntry[]
  valid: boolean
  errors: string[]

  bom: BomRow[]
  notes: string[]
}

export interface SpecSheetMeta {
  configId: string | null
  quoteRef: string | null
  /** Stored product code; regenerated from the config when missing. */
  productCode: string | null
  date: string
}

// ── Labels ──────────────────────────────────────────────────

function systemLabel(t: SystemType | null): string {
  switch (t) {
    case 'surface': return 'Surface water'
    case 'foul': return 'Foul'
    case 'combined': return 'Combined'
    default: return 'Not selected'
  }
}

/** Short pipe label for drawings, e.g. { dia: 'Ø225', std: 'TWINWALL' }. */
export function pipeLabel(size: PipeSize): { dia: string; std: string; short: string } {
  const mm = parseInt(size, 10)
  const twin = size.includes('Twinwall')
  return {
    dia: `Ø${mm}`,
    std: twin ? 'TWINWALL' : 'EN1401',
    short: `Ø${mm} ${twin ? 'TW' : 'EN1401'}`,
  }
}

function formatRate(rate: string): string {
  const n = parseFloat(rate)
  return Number.isFinite(n) && n > 0 ? `${n}` : ''
}

// ── Builder ─────────────────────────────────────────────────

/**
 * Builds the spec sheet for a chamber or catchpit. Returns null for any
 * other product: the drawing models a round chamber with clock-position
 * inlets, so other products would get misleading geometry.
 */
export function buildSpecSheetData(saved: ProductData, meta: SpecSheetMeta): SpecSheetData | null {
  if (saved.kind !== 'chamber' && saved.kind !== 'catchpit') return null

  // Saved configurations can predate fields, so fill the collections the
  // rule engine iterates before using them.
  const fill = <T extends ChamberData>(raw: T): T => ({
    ...raw,
    positions: raw.positions ?? [],
    pipeSizes: raw.pipeSizes ?? {},
    outletLocked: raw.outletLocked ?? null,
    flowRate: raw.flowRate ?? '',
  })
  const productData: ProductData =
    saved.kind === 'catchpit' ? { kind: 'catchpit', data: fill(saved.data) } : { kind: 'chamber', data: fill(saved.data) }

  const kind = saved.kind
  const d: ChamberData | CatchpitData = productData.data
  const catchpit: CatchpitData | null = productData.kind === 'catchpit' ? productData.data : null

  const state: WizardState = {
    step: 9,
    product: kind,
    productData,
    configId: meta.configId,
  }

  const variant: CatchpitVariant | null = catchpit ? (catchpit.variant ?? 'SERDS') : null
  const diameter: number = d.diameter ?? (variant === 'SERS' ? 450 : 600)
  const depth: number = d.depth ?? 1500
  const adoptable = d.adoptable ?? false
  const sump = catchpit ? getMinSumpDepth(diameter as Diameter) : CHAMBER_SUMP

  // Outlet: R2 lock, user pick, or the largest inlet (R6).
  const outletSize: PipeSize =
    getEffectiveOutletSize({ outletLocked: d.outletLocked ?? null, pipeSizes: d.pipeSizes ?? {} }) ?? '160mm EN1401'
  const out = PIPE_DIMS[outletSize]
  const outletSoffitH = sump + out.bore
  const outlet: SheetPipe = {
    ref: 'OUT',
    hour: 12,
    angle: 0,
    size: outletSize,
    od: out.od,
    bore: out.bore,
    invertH: sump,
    centreH: sump + out.bore / 2,
  }

  // Inlets: soffit aligned with the outlet, so a smaller inlet sits higher.
  const inlets: SheetPipe[] = (d.positions ?? []).map((pos, i) => {
    const size: PipeSize = d.pipeSizes?.[`inlet${i + 1}`] ?? '160mm EN1401'
    const p = PIPE_DIMS[size]
    const hour = parseInt(pos, 10)
    const invertH = outletSoffitH - p.bore
    return {
      ref: `IN${i + 1}`,
      hour,
      angle: ((hour % 12) / 12) * 360,
      size,
      od: p.od,
      bore: p.bore,
      invertH,
      centreH: invertH + p.bore / 2,
    }
  })

  const reduced = diameter > 600
  const top: ChamberTop =
    catchpit?.grateType === 'hinged' ? 'hinged-grate' : catchpit?.grateType === 'sealed' ? 'sealed-grate' : 'cover'
  const topLabel =
    top === 'hinged-grate' ? 'Hinged grating and frame' : top === 'sealed-grate' ? 'Sealed grating and frame' : 'D400 cover and frame'

  const flow =
    d.flowControl && d.flowType ? { type: d.flowType, rate: formatRate(d.flowRate ?? '') } : null

  const series = catchpit ? (variant ?? 'SERDS') : getChamberSeries(d.systemType)
  const title = catchpit ? 'CATCHPIT / SILT TRAP' : 'INSPECTION CHAMBER'
  const seriesLine = catchpit
    ? variant === 'SERS'
      ? 'RHINO SERS - REMOVABLE SILT BUCKET'
      : 'RHINO SERDS - BUILT-IN SETTLING'
    : series === 'IC'
      ? 'RHINO INSPECTION CHAMBER SERIES'
      : `RHINO ${series} SERIES`

  const productCode = meta.productCode || generateProductCode(state)
  const rules = getRuleModule(kind)
  const maxDepthAdoptable = rules.getMaxDepth ? rules.getMaxDepth(true) : 3000
  const maxDepthPrivate = rules.getMaxDepth ? rules.getMaxDepth(false) : 6000
  const maxDepth = adoptable ? maxDepthAdoptable : maxDepthPrivate

  const { valid, errors } = validateConfig(state)
  const compliance = generateCompliance(state)
  const outletLocked = d.outletLocked !== null && d.outletLocked !== undefined

  const ruleLog = buildRuleLog({
    diameter,
    depth,
    adoptable,
    maxDepth,
    inlets,
    outlet,
    outletLocked,
    positions: (d.positions ?? []).map((p) => parseInt(p, 10)),
  })

  const baffle = catchpit?.baffleType ?? 'none'

  const sheet: SpecSheetData = {
    kind,
    title,
    seriesLine,
    series,
    productCode,
    drawingNo: `SE-DRG-${productCode}`,
    configRef: meta.configId ? meta.configId.slice(0, 8).toUpperCase() : null,
    quoteRef: meta.quoteRef,
    date: meta.date,
    systemType: d.systemType,
    systemLabel: systemLabel(d.systemType),
    adoptable,
    adoptionLabel: adoptable ? 'S104 adoptable' : 'Private (non-adoptable)',
    diameter,
    depth,
    sump,
    overallHeight: FLOOR_THICKNESS + outletSoffitH + depth,
    reduced,
    top,
    topLabel,
    outlet,
    outletLocked,
    outletLockSize: d.outletLocked ?? null,
    inlets,
    flow,
    variant,
    baffle,
    maxDepthAdoptable,
    maxDepthPrivate,
    maxDepth,
    compliance,
    ruleLog,
    valid,
    errors,
    bom: [],
    notes: [],
  }
  sheet.bom = buildBom(sheet)
  sheet.notes = buildNotes(sheet)
  return sheet
}

// ── Rule log (R1 - R7) ──────────────────────────────────────

function buildRuleLog(c: {
  diameter: number
  depth: number
  adoptable: boolean
  maxDepth: number
  inlets: SheetPipe[]
  outlet: SheetPipe
  outletLocked: boolean
  positions: number[]
}): RuleLogEntry[] {
  const n = c.inlets.length
  const maxInlets = getMaxInlets(c.diameter)
  const minOutlet = getOutletMinSize(n, c.diameter)
  const maxPipe = getMaxInletPipeSize(c.diameter)
  const validHours = VALID_INLET_POSITIONS.map((p) => parseInt(p, 10))
  const badHours = c.positions.filter((h) => !validHours.includes(h))
  const tooBig = c.inlets.filter((i) => rank(i.size) > rank(c.outlet.size))
  const overMax = [...c.inlets, c.outlet].filter((p) => rank(p.size) > rank(maxPipe))
  const outletOk = minOutlet === null || rank(c.outlet.size) >= rank(minOutlet)

  return [
    {
      rule: 'R1',
      title: 'Maximum inlets',
      detail: `${n} of ${maxInlets} inlets allowed for a ${c.diameter}mm chamber.`,
      status: n >= 1 && n <= maxInlets ? 'Pass' : 'Fail',
    },
    {
      rule: 'R2',
      title: 'Outlet minimum size',
      detail: minOutlet
        ? `${n} inlets${c.diameter === 600 && n === 3 ? ' in a 600mm chamber' : ''} need at least a ${pipeLabel(minOutlet).dia} twinwall outlet. Outlet ${c.outletLocked ? 'locked' : 'set'} at ${pipeLabel(c.outlet.size).short}.`
        : 'No minimum outlet size applies.',
      status: outletOk ? 'Pass' : 'Fail',
    },
    {
      rule: 'R3',
      title: 'Blocked positions',
      detail: 'None. The outlet at 12 o\'clock does not block any inlet position.',
      status: 'Pass',
    },
    {
      rule: 'R4',
      title: 'Maximum depth',
      detail: `${c.depth}mm selected, ${c.maxDepth}mm maximum (${c.adoptable ? 'S104 adoptable' : 'private'}).`,
      status: c.depth <= c.maxDepth ? 'Pass' : 'Fail',
    },
    {
      rule: 'R5',
      title: 'Outlet position',
      detail: `Outlet fixed at 12 o'clock (0°). Inlets at ${c.positions.length ? c.positions.map((h) => `${h}`).join(', ') + " o'clock" : 'none'}.`,
      status: badHours.length === 0 ? 'Pass' : 'Fail',
    },
    {
      rule: 'R6',
      title: 'No flow increase on exit',
      detail: tooBig.length
        ? `${tooBig.map((i) => i.ref).join(', ')} larger than the ${pipeLabel(c.outlet.size).short} outlet.`
        : `No inlet is larger than the ${pipeLabel(c.outlet.size).short} outlet.`,
      status: tooBig.length ? 'Fail' : 'Pass',
    },
    {
      rule: 'R7',
      title: 'Maximum pipe size',
      detail: overMax.length
        ? `${overMax.map((i) => i.ref).join(', ')} over the ${pipeLabel(maxPipe).dia} maximum for ${c.diameter}mm.`
        : `All pipes within the ${pipeLabel(maxPipe).dia} maximum for a ${c.diameter}mm chamber.`,
      status: overMax.length ? 'Fail' : 'Pass',
    },
  ]
}

// ── Bill of materials ───────────────────────────────────────

function buildBom(s: SpecSheetData): BomRow[] {
  const code = `SE-${s.series}${s.diameter}`
  const rows: BomRow[] = [
    {
      description: s.kind === 'catchpit' ? 'Catchpit body' : 'Chamber body and base',
      material: 'HDPE, BS EN 13598-2',
      qty: '1',
      partNo: `${code}-BODY`,
    },
    { description: 'Riser shaft sections', material: 'HDPE', qty: 'A/R', partNo: `${code}-RISER` },
  ]
  if (s.reduced) {
    rows.push({
      description: `Reducing cap to Ø${REDUCED_OPENING} opening`,
      material: 'HDPE',
      qty: '1',
      partNo: `SE-CAP-${s.diameter}-${REDUCED_OPENING}`,
    })
  }
  rows.push({
    description: s.topLabel,
    material: 'Ductile iron, BS EN 124',
    qty: '1',
    partNo: s.top === 'cover' ? 'SE-COVER-D400' : s.top === 'hinged-grate' ? 'SE-GRATE-HINGED' : 'SE-GRATE-SEALED',
  })
  rows.push({
    description: 'Pipe sealing rings',
    material: 'EPDM, BS EN 681-1',
    qty: `${s.inlets.length + 1}`,
    partNo: 'SE-SEAL-EPDM',
  })
  if (s.variant === 'SERS') {
    rows.push({ description: 'Removable silt bucket', material: 'HDPE', qty: '1', partNo: `${code}-BUCKET` })
  }
  if (s.baffle === 'internal') {
    rows.push({ description: 'Internal baffle plate', material: 'HDPE', qty: '1', partNo: 'SE-BAFFLE-INT' })
  } else if (s.baffle === 'external') {
    rows.push({ description: 'Outlet dip pipe baffle', material: 'HDPE', qty: '1', partNo: 'SE-BAFFLE-EXT' })
  }
  if (s.flow) {
    const rate = s.flow.rate ? `${s.flow.rate} L/s` : 'rate TBC'
    const rateCode = s.flow.rate ? `${s.flow.rate.replace('.', 'P')}LS` : 'TBC'
    rows.push(
      s.flow.type === 'Vortex'
        ? { description: `Vortex flow control, ${rate}`, material: 'Stainless steel 316', qty: '1', partNo: `SE-VFC-${rateCode}` }
        : { description: `Orifice plate, ${rate}`, material: 'Stainless steel 316', qty: '1', partNo: `SE-OFC-${rateCode}` },
    )
  }
  // Step irons only for man-entry sizes.
  if (s.diameter >= 1050) {
    rows.push({ description: 'Access steps', material: 'GRP, BS EN 13101', qty: 'Set', partNo: 'SE-STEP-GRP' })
  }
  return rows
}

// ── General notes ───────────────────────────────────────────

function buildNotes(s: SpecSheetData): string[] {
  const pipeName = (size: PipeSize) => `${pipeLabel(size).dia} ${pipeLabel(size).std}`
  const outName = pipeName(s.outlet.size)
  const notes: string[] = [
    'ALL DIMENSIONS IN MILLIMETRES UNLESS STATED. DO NOT SCALE FROM THIS DRAWING.',
    "OUTLET FIXED AT 12 O'CLOCK (0°, NORTH). INLET ANGLES ARE MEASURED CLOCKWISE FROM NORTH. INLETS ARE MANUFACTURED AT 3, 5, 6, 7 AND 9 O'CLOCK ONLY.",
    s.outletLockSize && s.outletLockSize !== s.outlet.size
      ? `OUTLET MINIMUM ${pipeName(s.outletLockSize)} IS RULE-ENGINE LOCKED (R2, ${s.inlets.length} INLETS). ${outName} SPECIFIED. DO NOT REDUCE.`
      : s.outletLocked
        ? `OUTLET SIZE ${outName} IS RULE-ENGINE LOCKED (R2, ${s.inlets.length} INLETS). DO NOT REDUCE.`
        : `OUTLET SIZE ${outName}. NO INLET IS LARGER THAN THE OUTLET (R6).`,
    'INLET SOFFITS ARE ALIGNED WITH THE OUTLET SOFFIT. H IS THE PIPE CENTRELINE HEIGHT ABOVE THE INTERNAL BASE.',
    `SUMP DEPTH ${s.sump}mm IS MEASURED FROM THE OUTLET INVERT TO THE INTERNAL BASE.`,
    `DEPTH IS MEASURED FROM COVER LEVEL TO THE OUTLET SOFFIT. MAXIMUM ${s.maxDepthAdoptable}mm S104 ADOPTABLE, ${s.maxDepthPrivate}mm PRIVATE.`,
  ]
  if (s.flow) {
    notes.push(
      `${s.flow.type === 'Vortex' ? 'VORTEX FLOW CONTROL' : 'ORIFICE PLATE'} ON THE OUTLET, ${s.flow.rate ? `${s.flow.rate} L/s` : 'RATE TO BE CONFIRMED'}. DESIGN HEAD TO BE CONFIRMED WITH SuDS ENVIRO.`,
    )
  }
  notes.push('PIPE JOINT SEALS TO BS EN 681-1. LUBRICATE TO THE MANUFACTURER\'S SPECIFICATION.')
  notes.push('TOLERANCES: LINEAR +/-5mm, ANGULAR +/-1°. THIRD ANGLE PROJECTION.')
  return notes
}
