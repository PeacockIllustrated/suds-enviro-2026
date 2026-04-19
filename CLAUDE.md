# SuDS Enviro Configurator — Claude Code Context

You are building the **SuDS Enviro Chamber Configurator**: a guided specification and sales tool for drainage chambers manufactured by SuDS Enviro Ltd. This is a standalone Next.js application, not part of the Onesign Portal monorepo.

Read this file fully before writing any code. Do not deviate from the stack, conventions, or rules defined here.

---

## Project Identity

| Field | Value |
|---|---|
| Client | SuDS Enviro Ltd |
| Product | Online Chamber Configurator |
| Repo | `suds-enviro-configurator` under `PeacockIllustrated` |
| Vercel project | `suds-enviro-configurator` |
| Supabase project | Shared Onesign instance, prefix `se_` |
| Live domain | TBC — set in Vercel once confirmed |
| Primary contact | Sean Taylor, SuDS Enviro |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | No Pages Router. Use server components by default, `'use client'` only where necessary |
| Language | TypeScript strict | No `any`. Use proper types throughout |
| Styling | Tailwind CSS | No CSS modules. Custom colours via `tailwind.config.ts` |
| Database | Supabase (shared instance) | All tables prefixed `se_`. RLS enabled on all tables |
| Auth | Supabase Auth | Public-facing configurator is unauthenticated. Admin requires Supabase auth |
| 3D | React Three Fiber + Drei | Chamber preview only. Lazy-loaded via `dynamic()` |
| State | React Context + useReducer | WizardContext is the single source of truth |
| Forms | React Hook Form | For enquiry submission step only |
| Deployment | Vercel | Auto-deploy from `main` branch |

---

## Brand

```
Primary navy:   #004d70
Mid blue:       #1a82a2
Accent green:   #44af43
Green dark:     #339932
Light bg:       #f0f6fa
Border:         #ccdde8
Text:           #0f2535
Muted:          #5a7a90
```

Font: **Montserrat** (Google Fonts). Weights used: 400, 500, 600, 700, 800.

Tailwind config must extend with these colours and Montserrat as the sans-serif default.

No em dashes in UI copy. Use hyphens or restructure sentences.
No emojis anywhere. Use SVG icons (Lucide React) throughout.

---

## Product Domain

SuDS Enviro manufactures HDPE / GRP / MDPE drainage products. The configurator handles:

- **Inspection Chamber** (RHINO SERSIC / SERFIC) - HDPE, 450/600/750/900/1050/1200 mm
- **Catchpit / Silt Trap** - SERS (300/450/600 with bucket) and SERDS (450-1200 with built-in settling)
- **Flow Control** - SERF (orifice, 300/450/600 mm) and ROTEX (vortex, 600-1200 mm)
- **RHINO SEHDS Hydrodynamic Separator** - GRP, 750/1200/1800/2500 mm, 360-degree inlet, optional RHINO POD
- **RHINOLIFT Pumping Station** - MDPE/GRP, 600-1200 mm wet wells, EN 12050-1
- **Grease Trap, Grease Separator, RhinoPod, Rainwater, Septic Tank, Drawpit** - additional product paths

### Chamber Terminology

| Term | Definition |
|---|---|
| Diameter | External chamber diameter (mm): 450, 600, 750, 900, 1050, 1200 (per SERSIC/SERFIC data sheets) |
| Depth | Shaft depth to pipe soffit (mm): 1000-6000 in 500mm increments |
| Inlet | Incoming pipe connection - manufactured at 5 clock positions only (3, 5, 6, 7, 9). Max 5 inlets total |
| Outlet | Outgoing pipe connection (always 1, fixed at 12 o'clock / north) |
| Sump | Sediment collection zone below outlet (always 350mm) |
| Clock position | Pipe position expressed as hour on a clock face (12 = North) |
| Angle from North | Clock position converted to degrees clockwise from 12 o'clock |
| H from base | Pipe centreline height above internal base of chamber (mm) |
| Adoptable | Whether the chamber will be adopted by the water authority under S104 |
| S104 | Sewer adoption route (Sewers for Adoption 7th Ed.) |

---

## The Rule Engine

The rule engine runs client-side and enforces physical and regulatory constraints. Every rule must be applied in real time as the user progresses through the wizard. All rules are in `lib/rule-engine.ts`.

### Rules

#### R1: Maximum Inlets by Diameter (per SERSIC/SERFIC data sheets)
```
450mm  → max 2 inlets
600mm  → max 4 inlets
750mm  → max 5 inlets
900mm  → max 5 inlets   (diameter cap higher, but capped to 5 by physical positions)
1050mm → max 5 inlets   (diameter cap higher, but capped to 5 by physical positions)
1200mm → max 5 inlets   (diameter cap higher, but capped to 5 by physical positions)
```
Hard ceiling of **5** total inlets because only 5 inlet positions are
manufactured on the chamber wall (3, 5, 6, 7, 9 o'clock).
When diameter changes, if current inletCount exceeds new max: reset inletCount, positions, pipeSizes, outletLocked.

#### R2: Outlet Minimum Size
```
inletCount >= 3 AND diameter === 600  → outlet min Ø225mm Twinwall
inletCount >= 4 (any diameter)        → outlet min Ø225mm Twinwall
```
Trigger: on inletCount selection. Lock outlet size. Show inline warning before user proceeds.

#### R3: Blocked Clock Positions (no-op for current product range)
With the outlet fixed at 12 o'clock and inlets only manufactured at 3, 5, 6,
7, 9 o'clock, no inlet position is physically affected by a 225mm twinwall
outlet stub. `getBlockedPositions(outletSize)` returns an empty array. The
hook is retained so future product variants with a different outlet location
can plug in their own blocking logic.

#### R4: Max Installation Depth (per data sheets, product-specific)
```
Inspection chamber (SERSIC/SERFIC):
  adoptable === true  → max 3000mm (DCG / SfA7)
  adoptable === false → max 6000mm

Catchpit (SERS/SERDS):
  adoptable === true  → max 2000mm
  adoptable === false → max 3000mm
```
Each product's rule module exports its own `getMaxDepth`. Disable depth options
that exceed the limit for the selected product and adoption status.

#### R5: Outlet Position (fixed)
The outlet is fixed at **12 o'clock** (north / 0 degrees) for every chamber.
It is not user-selectable. Display it on the clock face as a green locked node.
Inlet positions are constrained to **3, 5, 6, 7, 9** o'clock - the outlet hour
is never an inlet candidate.

#### R6: No Flow Increase on Exit
Inlet pipe sizes cannot exceed the outlet pipe size. If the outlet is locked to Ø225mm, inlets cannot be set to Ø300mm or Ø450mm. Enforce in the pipe size picker.

#### R7: Max Pipe Size by Diameter
```
450mm  → inlets max Ø160mm
600mm  → inlets max Ø225mm
750mm  → inlets max Ø300mm
900mm  → inlets max Ø300mm
1050mm → inlets max Ø450mm
1200mm → inlets max Ø450mm
```

### Rule Engine API

```typescript
// lib/rule-engine.ts
export function getMaxInlets(diameter: number): number
export function getOutletMinSize(inletCount: number, diameter: number): PipeSize | null
export function getBlockedPositions(outletSize: PipeSize | null): ClockPosition[]
export function getMaxDepth(adoptable: boolean): number  // product-specific
export function getMaxInletPipeSize(diameter: number): PipeSize
export function validateConfig(state: WizardState): ValidationResult
export function generateProductCode(state: WizardState): string
export function generateCompliance(state: WizardState): ComplianceResult[]
```

---

## Wizard Flow

The wizard has 10 screens (step 0 is product selection, steps 1-8 are configuration, step 9 is output).

```
Step 0: Product Select     → which product type (Inspection Chamber for Phase 1)
Step 1: System Type        → Surface Water | Foul | Combined
Step 2: Diameter           → 450 | 600 | 750 | 1050 mm
Step 3: Inlet Count        → 1-6 (constrained by R1). Rule R2 fires here.
Step 4: Clock Positions    → Interactive clock face. Outlet fixed at 6. R3 applies.
Step 5: Pipe Sizes         → Per-inlet picker. Outlet locked if R2 triggered. R6/R7 apply.
Step 6: Flow Control       → Yes/No. If Yes: type (Vortex | Orifice) + rate (L/s).
Step 7: Depth              → Adoptable status first, then depth selection. R4 applies.
Step 8: Review             → Full summary with compliance check. Edit links back to any step.
Step 9: Output             → PDF download | Enquiry form | Email link
```

### Navigation Rules
- Forward: only if current step passes `canProceed()` validation
- Back: always allowed, state preserved
- Transitions: slide animation (fade + translateX)
- Step 8 (Review) shows a compliance table generated by the rule engine
- Step 9 has no Back/Next nav bar - replaced by action cards

### Reference Implementation
The full branded interactive prototype is at:
`/reference/suds-wizard-branded-prototype.html` (provided separately by client)

The engineering drawing is at:
`/reference/suds-drawing-v4.html` (provided separately by client)

Do not recreate these from scratch. Use them as the exact visual and functional specification.

---

## 3D Chamber Preview

A floating green button (bottom-right, above the nav bar) appears from Step 2 onwards.

Tapping it opens a full-panel overlay (slides up from bottom) containing a Three.js/R3F chamber model that updates in real time as the user makes selections.

### What the model shows
- HDPE cylinder body (navy, correct diameter proportions, correct depth proportions)
- Cover plate at top (dark)
- Inlet pipes at selected clock positions (blue cylinders, correct angles)
- Outlet pipe at 6 o'clock (green cylinder)
- Sump zone at base (slightly different fill)
- Slow auto-rotation; drag/touch to rotate manually

### Implementation
- Component: `components/viewer3d/ChamberViewer.tsx`
- Lazy-loaded: `const ChamberViewer = dynamic(() => import('@/components/viewer3d/ChamberViewer'), { ssr: false })`
- Receives `WizardState` as props, derives all geometry from it
- Uses `@react-three/fiber` and `@react-three/drei`
- No OrbitControls from Three.js — use Drei's `OrbitControls`
- Canvas background: `#071828`
- Auto-rotate: slow Y axis rotation when not dragging

### Pipe positioning in 3D
```typescript
// Clock position to 3D direction vector
const clockToDirection = (clockHour: number): THREE.Vector3 => {
  const angle = (clockHour / 12) * Math.PI * 2  // radians, clockwise from north
  return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
}
```

---

## PDF Generation

On Step 9, the user can download a PDF specification sheet.

The PDF is generated server-side via a Next.js API route (`/api/pdf/route.ts`) using a headless Chromium approach (Playwright or `@sparticuz/chromium` + Puppeteer).

The PDF renders a server-side HTML template matching the design of the engineering drawing reference (`suds-drawing-v4.html`).

The API route accepts the serialised `WizardState` as JSON in the POST body and returns the PDF as a binary response.

Do not use ReportLab or any Python-based PDF generation. Use HTML-to-PDF only.

### PDF contents
Page 1: Technical Specification (project info, full spec table, compliance table, rule engine log)
Page 2: Engineering Drawing (plan view 1:10, front elevation 1:12, BOM, notes, title block)

All geometry computed mathematically from the config values, as in the reference drawing.

---

## Database Schema

All tables use the `se_` prefix on the shared Supabase instance.

```sql
-- Full schema in schema.sql
```

Key tables:
- `se_configurations` - saved wizard states (draft and submitted)
- `se_enquiries` - submitted enquiries with config reference
- `se_pdf_logs` - PDF generation log per config

RLS policy: public read/write on `se_configurations` (anonymous sessions). Enquiries are insert-only for public, full access for authenticated admin users.

---

## Environment Variables

```bash
# .env.local.example — copy to .env.local and fill in
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=                    # email delivery for enquiry notifications
ADMIN_EMAIL=hello@sudsenviro.com   # enquiry notification recipient
```

---

## Project Structure

```
suds-enviro-configurator/
  app/
    configurator/
      page.tsx                     # main wizard entry point
      [configId]/
        page.tsx                   # shareable config URL
    api/
      configurations/
        route.ts                   # POST save, GET by id
      enquiries/
        route.ts                   # POST submit enquiry
      pdf/
        route.ts                   # POST generate PDF
    admin/
      page.tsx                     # enquiry dashboard (auth required)
    layout.tsx
    page.tsx                       # marketing landing page (Phase 3)
    globals.css

  components/
    wizard/
      WizardShell.tsx              # outer frame (header, progress, summary, nav)
      WizardContext.tsx            # state + dispatch + rule engine integration
      steps/
        ProductSelect.tsx
        SystemType.tsx
        Diameter.tsx
        InletCount.tsx
        ClockFace.tsx
        PipeSizes.tsx
        FlowControl.tsx
        Depth.tsx
        Review.tsx
        Output.tsx
    viewer3d/
      ChamberViewer.tsx            # R3F canvas + panel overlay
      ChamberModel.tsx             # the actual 3D geometry
    ui/
      OptionCard.tsx
      SizeGrid.tsx
      PipeRow.tsx
      CalloutBadge.tsx             # coloured Ø pipe callout
      ProgressBar.tsx
      SummaryAccordion.tsx

  lib/
    rule-engine.ts                 # all rules (R1-R7) + validateConfig
    types.ts                       # WizardState, PipeSize, ClockPosition etc.
    supabase.ts                    # client + server clients
    pdf-template.ts                # HTML string template for PDF generation
    drawing-geometry.ts            # SVG coordinate calculations (ported from Python)

  reference/
    suds-wizard-branded-prototype.html   # provided by client
    suds-drawing-v4.html                 # provided by client

  public/
    fonts/ (Montserrat woff2 if self-hosting)

  schema.sql                       # Supabase migration
  .env.local.example
  tailwind.config.ts
  CLAUDE.md
```

---

## Types

Define these in `lib/types.ts` before building any component.

```typescript
export type Product = 'chamber' | 'catchpit' | 'flow-control' | 'rhino'
export type SystemType = 'surface' | 'foul' | 'combined'
export type Diameter = 450 | 600 | 750 | 1050
export type DepthMm = 1000 | 1500 | 2000 | 2500 | 3000
export type ClockPosition = '1'|'2'|'3'|'4'|'5'|'7'|'8'|'9'|'10'|'11'|'12'
export type PipeSize = '110mm EN1401'|'160mm EN1401'|'225mm Twinwall'|'300mm Twinwall'|'450mm Twinwall'
export type FlowType = 'Vortex' | 'Orifice plate'

export interface InletConfig {
  num: number
  position: ClockPosition
  size: PipeSize
}

export interface WizardState {
  step: number
  product: Product | null
  systemType: SystemType | null
  diameter: Diameter | null
  inletCount: number | null
  positions: ClockPosition[]
  pipeSizes: Record<string, PipeSize>   // key: 'inlet1' .. 'inlet6'
  outletLocked: PipeSize | null
  flowControl: boolean | null
  flowType: FlowType | null
  flowRate: string
  depth: DepthMm | null
  adoptable: boolean | null
  configId: string | null              // set after Supabase save
}

export type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PRODUCT'; payload: Product }
  | { type: 'SET_SYSTEM'; payload: SystemType }
  | { type: 'SET_DIAMETER'; payload: Diameter }
  | { type: 'SET_INLET_COUNT'; payload: number }
  | { type: 'TOGGLE_POSITION'; payload: ClockPosition }
  | { type: 'SET_PIPE_SIZE'; payload: { slot: string; size: PipeSize } }
  | { type: 'SET_FLOW_CONTROL'; payload: boolean }
  | { type: 'SET_FLOW_TYPE'; payload: FlowType }
  | { type: 'SET_FLOW_RATE'; payload: string }
  | { type: 'SET_DEPTH'; payload: DepthMm }
  | { type: 'SET_ADOPTABLE'; payload: boolean }
  | { type: 'SET_CONFIG_ID'; payload: string }
  | { type: 'GO_TO_STEP'; payload: number }

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ComplianceResult {
  standard: string
  scope: string
  status: 'Pass' | 'Fail' | 'Warning'
}
```

---

## Coding Conventions

### General
- App Router only. No `getServerSideProps` or `getStaticProps`.
- Server components fetch data. Client components handle interaction.
- Every client component starts with `'use client'`.
- No barrel `index.ts` files. Import directly from the file.
- All Supabase calls in server components or API routes use the service role client. Client-side uses the anon client.

### Naming
- Components: PascalCase
- Utilities and hooks: camelCase
- Files: match the export name (e.g. `WizardContext.tsx` exports `WizardContext`)
- Supabase table columns: snake_case
- TypeScript types: PascalCase

### Error handling
- API routes return `{ error: string }` with appropriate HTTP status on failure
- All Supabase calls destructure `{ data, error }` and handle both
- User-facing errors appear inline, not as alerts

### Styling
- Use Tailwind utility classes only
- Brand colours are defined as Tailwind tokens (navy, blue, green etc.)
- No inline `style={{}}` except for computed SVG geometry values
- Mobile-first: the wizard is primarily a mobile experience

### Components
- WizardShell handles the chrome (header, progress bar, summary accordion, 3D button, bottom nav)
- Each step component is a pure presentation component that reads from WizardContext and dispatches actions
- Steps do not navigate themselves. They call `canProceed()` which WizardShell reads to enable/disable the Next button
- The clock face (Step 4) is an SVG rendered via JSX, not a canvas

---

## Phase Map

### Phase 1 (current) - Wizard MVP
Build the complete wizard with all 10 screens, the rule engine, the 3D preview panel, and the output step with enquiry form. No backend in Phase 1 (state is local only). Reference the HTML prototype exactly.

Deliverables:
- Full wizard from Step 0 to Step 9
- Rule engine enforcing all 7 rules
- 3D chamber preview panel
- Output step with PDF download placeholder and enquiry form (no submission yet)
- Responsive for mobile and desktop

### Phase 2 - Backend Integration
- Supabase schema applied
- Config auto-saved as user progresses (debounced, anonymous session ID)
- Shareable URL: `/configurator/[configId]`
- Enquiry submission to `se_enquiries` + Resend email notification
- PDF generation API route (Playwright headless)

### Phase 3 - Admin + Polish
- Admin dashboard at `/admin` (authenticated)
- View all enquiries, link to config, mark as quoted/closed
- Marketing landing page at `/`
- Analytics via Odysseus (Onesign internal tool)

### Phase 4 - Additional Products
- Catchpit / Silt Trap wizard path
- RhinoCeptor oil separator path
- Product-specific rule engines
- Multi-product quote basket

---

## Key Reference Docs

- DCG (Design and Construction Guidance) Section C7.1.1 - chamber standards
- Sewers for Adoption 7th Edition (SfA7) - adoptable standards
- BS EN 13598-1 and EN 13598-2 - plastic inspection chambers
- EA PPG3 - pollution prevention guidance
- Building Regulations Part H1 - surface water drainage

---

## Do Not

- Do not use any third-party component library (no shadcn, no MUI, no Chakra)
- Do not use the Pages Router
- Do not use `getServerSideProps` or `getStaticProps`
- Do not use ReportLab or Python for PDF generation
- Do not hardcode Supabase credentials anywhere
- Do not use emojis in UI copy
- Do not use em dashes in UI copy
- Do not create barrel index.ts files
- Do not write `any` types
- Do not fetch data in client components (use server components or API routes)
- Do not add animation libraries (Framer Motion etc.) - CSS transitions only
