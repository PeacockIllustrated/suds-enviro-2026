/**
 * SuDS Enviro Configurator — Type Definitions
 * Single source of truth for all TypeScript types.
 */

// ── DOMAIN ────────────────────────────────────────────────────

export type Product =
  | 'chamber'
  | 'catchpit'
  | 'flow-control'
  | 'rhino'
  | 'pump'

export type SystemType = 'surface' | 'foul' | 'combined'

export type Diameter = 450 | 600 | 750 | 1050

export type DepthMm = 1000 | 1500 | 2000 | 2500 | 3000

/**
 * Clock positions available for inlet placement.
 * 6 o'clock is always the outlet and is not in this type.
 */
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

// ── WIZARD STATE ──────────────────────────────────────────────

export interface WizardState {
  step: number

  // Step 0
  product: Product | null

  // Step 1
  systemType: SystemType | null

  // Step 2
  diameter: Diameter | null

  // Step 3
  inletCount: number | null

  // Step 4
  positions: ClockPosition[]

  // Step 5
  /** Keys: 'inlet1' .. 'inlet6'. Outlet is tracked separately. */
  pipeSizes: Record<string, PipeSize>
  outletLocked: PipeSize | null

  // Step 6
  flowControl: boolean | null
  flowType: FlowType | null
  flowRate: string

  // Step 7
  depth: DepthMm | null
  adoptable: boolean | null

  // Generated / meta
  configId: string | null
}

export const INITIAL_WIZARD_STATE: WizardState = {
  step: 0,
  product: null,
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
  configId: null,
}

// ── ACTIONS ───────────────────────────────────────────────────

export type WizardAction =
  | { type: 'SET_STEP';         payload: number }
  | { type: 'SET_PRODUCT';      payload: Product }
  | { type: 'SET_SYSTEM';       payload: SystemType }
  | { type: 'SET_DIAMETER';     payload: Diameter }
  | { type: 'SET_INLET_COUNT';  payload: number }
  | { type: 'TOGGLE_POSITION';  payload: ClockPosition }
  | { type: 'SET_PIPE_SIZE';    payload: { slot: string; size: PipeSize } }
  | { type: 'SET_FLOW_CONTROL'; payload: boolean }
  | { type: 'SET_FLOW_TYPE';    payload: FlowType }
  | { type: 'SET_FLOW_RATE';    payload: string }
  | { type: 'SET_DEPTH';        payload: DepthMm }
  | { type: 'SET_ADOPTABLE';    payload: boolean }
  | { type: 'SET_CONFIG_ID';    payload: string }
  | { type: 'GO_TO_STEP';       payload: number }
  | { type: 'RESET' }

// ── RULE ENGINE RESULTS ───────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ComplianceResult {
  standard: string
  scope: string
  status: 'Pass' | 'Fail' | 'Warning'
}

// ── API PAYLOADS ──────────────────────────────────────────────

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

// ── SUPABASE ROW TYPES ────────────────────────────────────────

export interface SeConfiguration {
  id: string
  created_at: string
  updated_at: string
  session_id: string | null
  product: Product | null
  system_type: SystemType | null
  diameter_mm: number | null
  inlet_count: number | null
  positions: ClockPosition[] | null
  pipe_sizes: Record<string, PipeSize> | null
  outlet_size_mm: number | null
  outlet_locked: boolean
  outlet_rule: string | null
  flow_control: boolean | null
  flow_type: string | null
  flow_rate_ls: number | null
  depth_mm: number | null
  adoptable: boolean | null
  product_code: string | null
  compliance: ComplianceResult[] | null
  wizard_step: number
  status: 'draft' | 'submitted' | 'quoted' | 'archived'
}

export interface SeEnquiry {
  id: string
  created_at: string
  updated_at: string
  configuration_id: string | null
  name: string
  company: string | null
  email: string
  phone: string | null
  notes: string | null
  status: 'new' | 'reviewed' | 'quoted' | 'closed'
  admin_notes: string | null
  quoted_at: string | null
  quoted_by: string | null
  notification_sent: boolean
  notification_sent_at: string | null
}

// ── UI HELPERS ────────────────────────────────────────────────

export interface StepMeta {
  number: number
  label: string
  eyebrow: string
  heading: string
  subheading: string
}

export const STEP_META: StepMeta[] = [
  {
    number: 0,
    label: 'Product',
    eyebrow: 'Start Here',
    heading: 'What are you configuring?',
    subheading: 'Choose a product type to begin your guided setup.',
  },
  {
    number: 1,
    label: 'System',
    eyebrow: 'Step 1 of 8',
    heading: 'What system is this for?',
    subheading: 'This sets the compliance standards and available products throughout the wizard.',
  },
  {
    number: 2,
    label: 'Diameter',
    eyebrow: 'Step 2 of 8',
    heading: 'Chamber diameter?',
    subheading: 'Diameter determines the maximum number of inlets and pipe size ranges available.',
  },
  {
    number: 3,
    label: 'Inlets',
    eyebrow: 'Step 3 of 8',
    heading: 'How many inlets?',
    subheading: '',   // generated dynamically: "{diameter}mm supports max {n} inlets"
  },
  {
    number: 4,
    label: 'Positions',
    eyebrow: 'Step 4 of 8',
    heading: 'Inlet positions',
    subheading: '',   // generated: "Tap {n} positions on the clock face."
  },
  {
    number: 5,
    label: 'Pipe Sizes',
    eyebrow: 'Step 5 of 8',
    heading: 'Inlet pipe sizes',
    subheading: 'Tap each inlet to change its pipe size. Outlet is pre-set.',
  },
  {
    number: 6,
    label: 'Flow',
    eyebrow: 'Step 6 of 8',
    heading: 'Flow control required?',
    subheading: 'Required if your planning condition specifies a maximum discharge rate.',
  },
  {
    number: 7,
    label: 'Depth',
    eyebrow: 'Step 7 of 8',
    heading: 'Depth and adoption status',
    subheading: 'Select whether this chamber will be adopted, then choose the required depth.',
  },
  {
    number: 8,
    label: 'Review',
    eyebrow: 'Review',
    heading: 'Your configuration',
    subheading: 'Check all details below. Tap Edit on any section to make changes.',
  },
  {
    number: 9,
    label: 'Output',
    eyebrow: 'Complete',
    heading: 'Specification ready',
    subheading: '',   // generated from config summary
  },
]
