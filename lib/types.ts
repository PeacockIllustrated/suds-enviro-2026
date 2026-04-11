/**
 * SuDS Enviro Configurator - Type Definitions
 * Supports all 11 products with discriminated union state.
 */

// ── PRODUCT IDENTITY ─────────────────────────────────────────

export type ProductId =
  | 'chamber'
  | 'catchpit'
  | 'rhinoceptor'
  | 'flow-control'
  | 'pump-station'
  | 'grease-trap'
  | 'grease-separator'
  | 'rhinopod'
  | 'rainwater'
  | 'septic-tank'
  | 'drawpit'

export type ProductCategory =
  | 'stormwater'
  | 'chambers'
  | 'silt'
  | 'pumps'
  | 'flow'
  | 'drawpits'
  | 'bespoke'

// ── SHARED DOMAIN TYPES ──────────────────────────────────────

export type SystemType = 'surface' | 'foul' | 'combined'
export type Diameter = 450 | 600 | 750 | 1050
export type DepthMm = 1000 | 1500 | 2000 | 2500 | 3000

export type ClockPosition =
  | '1' | '2' | '3' | '4' | '5'
  | '7' | '8' | '9' | '10' | '11' | '12'

export type PipeSize =
  | '110mm EN1401'
  | '160mm EN1401'
  | '225mm Twinwall'
  | '300mm Twinwall'
  | '450mm Twinwall'

export type FlowType = 'Vortex' | 'Orifice plate'

// ── PRODUCT-SPECIFIC DATA ────────────────────────────────────

// Shared base for chamber-like products (chamber + catchpit)
export interface ChamberBaseFields {
  systemType: SystemType | null
  diameter: Diameter | null
  inletCount: number | null
  positions: ClockPosition[]
  pipeSizes: Record<string, PipeSize>
  outletLocked: PipeSize | null
  flowControl: boolean | null
  flowType: FlowType | null
  flowRate: string
  depth: DepthMm | null
  adoptable: boolean | null
}

export interface ChamberData extends ChamberBaseFields {}

export type BaffleType = 'none' | 'internal' | 'external'
export type GrateType = 'hinged' | 'sealed'

export interface CatchpitData extends ChamberBaseFields {
  baffleType: BaffleType | null
  grateType: GrateType | null
}

export type RhinoVariant = 'forecourt' | 'full-retention' | 'bypass'
export type RhinoClass = 1 | 2

export interface RhinoCeptorData {
  variant: RhinoVariant | null
  drainageAreaM2: string
  flowRateLs: string
  retentionVolumeLitres: string
  rhinoClass: RhinoClass | null
}

export type FlowControlApplication = 'attenuation' | 'swale' | 'pond' | 'other'

export interface FlowControlData {
  systemType: SystemType | null
  application: FlowControlApplication | null
  headDepthMm: string
  dischargeRateLs: string
  chamberDiameter: Diameter | null
}

export type ControllerType = 'manual' | 'auto-float' | 'auto-level' | 'plc'

export interface PumpStationData {
  systemType: SystemType | null
  flowRateLs: string
  totalHeadM: string
  pumpCount: 1 | 2 | null
  pipeSizeOutlet: PipeSize | null
  controllerType: ControllerType | null
  wetWellDiameter: Diameter | null
  depth: DepthMm | null
}

export type GreaseTrapModel = 'micro' | 'mini' | 'midi' | 'jumbo'

export interface GreaseTrapData {
  model: GreaseTrapModel | null
  connectionInlet: '100mm' | '60mm' | null
  connectionOutlet: '100mm' | '60mm' | null
}

export type GreaseSepApplication = 'restaurant' | 'hotel' | 'catering' | 'food-processing'

export interface GreaseSeparatorData {
  application: GreaseSepApplication | null
  peakCoversPerDay: string
  flowRateLs: string
}

export type RhinoPodType = 'standalone' | 'plus'

export interface RhinoPodData {
  podType: RhinoPodType | null
  chamberDiameter: Diameter | null
  retrofitExisting: boolean | null
}

export type RainwaterSystemType = 'direct' | 'indirect' | 'gravity'
export type RainwaterCapacity = 1000 | 1400 | 2200 | 2400 | 3300

export interface RainwaterData {
  systemType: RainwaterSystemType | null
  roofAreaM2: string
  capacityLitres: RainwaterCapacity | null
  annualRainfallMm: string
}

export type SepticTreatment = 'primary' | 'secondary'
export type DischargePoint = 'watercourse' | 'soakaway' | 'drainfield'

export interface SepticTankData {
  treatmentLevel: SepticTreatment | null
  populationEquivalent: string
  dailyFlowLitres: string
  dischargePoint: DischargePoint | null
}

export type DrawpitLoadRating = 'A15' | 'B125' | 'C250' | 'D400' | 'E600' | 'F900'
export type DrawpitCoverType = 'solid' | 'grated'

export interface DrawpitData {
  lengthMm: string
  widthMm: string
  depthMm: string
  ringCount: string
  loadRating: DrawpitLoadRating | null
  coverType: DrawpitCoverType | null
}

// ── DISCRIMINATED UNION ──────────────────────────────────────

export type ProductData =
  | { kind: 'chamber'; data: ChamberData }
  | { kind: 'catchpit'; data: CatchpitData }
  | { kind: 'rhinoceptor'; data: RhinoCeptorData }
  | { kind: 'flow-control'; data: FlowControlData }
  | { kind: 'pump-station'; data: PumpStationData }
  | { kind: 'grease-trap'; data: GreaseTrapData }
  | { kind: 'grease-separator'; data: GreaseSeparatorData }
  | { kind: 'rhinopod'; data: RhinoPodData }
  | { kind: 'rainwater'; data: RainwaterData }
  | { kind: 'septic-tank'; data: SepticTankData }
  | { kind: 'drawpit'; data: DrawpitData }

// ── WIZARD STATE ─────────────────────────────────────────────

export interface WizardState {
  step: number
  product: ProductId | null
  productData: ProductData | null
  configId: string | null
}

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 0,
  product: null,
  productData: null,
  configId: null,
}

// ── ACTIONS ──────────────────────────────────────────────────

// Shared actions (all products)
export type SharedAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PRODUCT'; payload: ProductId }
  | { type: 'SET_CONFIG_ID'; payload: string }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'RESET' }

// Chamber actions
export type ChamberAction =
  | { type: 'CHAMBER_SET_SYSTEM'; payload: SystemType }
  | { type: 'CHAMBER_SET_DIAMETER'; payload: Diameter }
  | { type: 'CHAMBER_SET_INLET_COUNT'; payload: number }
  | { type: 'CHAMBER_TOGGLE_POSITION'; payload: ClockPosition }
  | { type: 'CHAMBER_SET_PIPE_SIZE'; payload: { slot: string; size: PipeSize } }
  | { type: 'CHAMBER_SET_FLOW_CONTROL'; payload: boolean }
  | { type: 'CHAMBER_SET_FLOW_TYPE'; payload: FlowType }
  | { type: 'CHAMBER_SET_FLOW_RATE'; payload: string }
  | { type: 'CHAMBER_SET_DEPTH'; payload: DepthMm }
  | { type: 'CHAMBER_SET_ADOPTABLE'; payload: boolean }

// Catchpit actions (inherits most chamber actions via prefix)
export type CatchpitAction =
  | { type: 'CATCHPIT_SET_SYSTEM'; payload: SystemType }
  | { type: 'CATCHPIT_SET_DIAMETER'; payload: Diameter }
  | { type: 'CATCHPIT_SET_INLET_COUNT'; payload: number }
  | { type: 'CATCHPIT_TOGGLE_POSITION'; payload: ClockPosition }
  | { type: 'CATCHPIT_SET_PIPE_SIZE'; payload: { slot: string; size: PipeSize } }
  | { type: 'CATCHPIT_SET_DEPTH'; payload: DepthMm }
  | { type: 'CATCHPIT_SET_ADOPTABLE'; payload: boolean }
  | { type: 'CATCHPIT_SET_BAFFLE'; payload: BaffleType }
  | { type: 'CATCHPIT_SET_GRATE'; payload: GrateType }

// RhinoCeptor actions
export type RhinoCeptorAction =
  | { type: 'RHINO_SET_VARIANT'; payload: RhinoVariant }
  | { type: 'RHINO_SET_DRAINAGE_AREA'; payload: string }
  | { type: 'RHINO_SET_FLOW_RATE'; payload: string }
  | { type: 'RHINO_SET_RETENTION'; payload: string }
  | { type: 'RHINO_SET_CLASS'; payload: RhinoClass }

// Flow Control actions
export type FlowControlAction =
  | { type: 'FC_SET_SYSTEM'; payload: SystemType }
  | { type: 'FC_SET_APPLICATION'; payload: FlowControlApplication }
  | { type: 'FC_SET_HEAD_DEPTH'; payload: string }
  | { type: 'FC_SET_DISCHARGE_RATE'; payload: string }
  | { type: 'FC_SET_CHAMBER_DIAMETER'; payload: Diameter }

// Pump Station actions
export type PumpStationAction =
  | { type: 'PUMP_SET_SYSTEM'; payload: SystemType }
  | { type: 'PUMP_SET_FLOW_RATE'; payload: string }
  | { type: 'PUMP_SET_HEAD'; payload: string }
  | { type: 'PUMP_SET_PUMP_COUNT'; payload: 1 | 2 }
  | { type: 'PUMP_SET_PIPE_SIZE'; payload: PipeSize }
  | { type: 'PUMP_SET_CONTROLLER'; payload: ControllerType }
  | { type: 'PUMP_SET_DIAMETER'; payload: Diameter }
  | { type: 'PUMP_SET_DEPTH'; payload: DepthMm }

// Grease Trap actions
export type GreaseTrapAction =
  | { type: 'GT_SET_MODEL'; payload: GreaseTrapModel }
  | { type: 'GT_SET_INLET'; payload: '100mm' | '60mm' }
  | { type: 'GT_SET_OUTLET'; payload: '100mm' | '60mm' }

// Grease Separator actions
export type GreaseSeparatorAction =
  | { type: 'GS_SET_APPLICATION'; payload: GreaseSepApplication }
  | { type: 'GS_SET_COVERS'; payload: string }
  | { type: 'GS_SET_FLOW_RATE'; payload: string }

// RhinoPod actions
export type RhinoPodAction =
  | { type: 'POD_SET_TYPE'; payload: RhinoPodType }
  | { type: 'POD_SET_DIAMETER'; payload: Diameter }
  | { type: 'POD_SET_RETROFIT'; payload: boolean }

// Rainwater actions
export type RainwaterAction =
  | { type: 'RW_SET_SYSTEM'; payload: RainwaterSystemType }
  | { type: 'RW_SET_ROOF_AREA'; payload: string }
  | { type: 'RW_SET_CAPACITY'; payload: RainwaterCapacity }
  | { type: 'RW_SET_RAINFALL'; payload: string }

// Septic Tank actions
export type SepticTankAction =
  | { type: 'ST_SET_TREATMENT'; payload: SepticTreatment }
  | { type: 'ST_SET_POPULATION'; payload: string }
  | { type: 'ST_SET_FLOW'; payload: string }
  | { type: 'ST_SET_DISCHARGE'; payload: DischargePoint }

// Drawpit actions
export type DrawpitAction =
  | { type: 'DP_SET_LENGTH'; payload: string }
  | { type: 'DP_SET_WIDTH'; payload: string }
  | { type: 'DP_SET_DEPTH'; payload: string }
  | { type: 'DP_SET_RINGS'; payload: string }
  | { type: 'DP_SET_LOAD_RATING'; payload: DrawpitLoadRating }
  | { type: 'DP_SET_COVER'; payload: DrawpitCoverType }

// Union of all actions
export type WizardAction =
  | SharedAction
  | ChamberAction
  | CatchpitAction
  | RhinoCeptorAction
  | FlowControlAction
  | PumpStationAction
  | GreaseTrapAction
  | GreaseSeparatorAction
  | RhinoPodAction
  | RainwaterAction
  | SepticTankAction
  | DrawpitAction

// ── RULE ENGINE RESULTS ──────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ComplianceResult {
  standard: string
  scope: string
  status: 'Pass' | 'Fail' | 'Warning'
}

// ── PRODUCT REGISTRY TYPES ───────────────────────────────────

export interface StepMeta {
  id: string
  label: string
  eyebrow: string
  heading: string
  subheading: string | ((state: WizardState) => string)
}

export interface SummaryField {
  label: string
  value: string
  locked?: boolean
}

export interface ReviewBlockDef {
  title: string
  editStep: number
  fields: (state: WizardState) => { label: string; value: string; highlight?: boolean }[]
}

// ── API PAYLOADS ─────────────────────────────────────────────

export interface SaveConfigPayload {
  sessionId: string
  state: WizardState
}

export interface SaveConfigResponse {
  configId: string
  productCode: string
}

export interface SubmitEnquiryPayload {
  configurationId: string | null
  name: string
  company?: string
  email: string
  phone?: string
  notes?: string
}

export interface SubmitEnquiryResponse {
  enquiryId: string
}

export interface GeneratePdfPayload {
  state: WizardState
}
