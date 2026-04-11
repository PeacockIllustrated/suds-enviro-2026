'use client'

import { useState, useRef, useEffect, type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, ChevronDown, Layers, Bookmark } from 'lucide-react'
import { useWizardContext } from './WizardContext'
import {
  getProductConfig,
  getReviewStepIndex,
  getOutputStepIndex,
} from '@/lib/products/registry'
import '@/lib/products/register-all'
import type { SummaryField } from '@/lib/types'

// Step components - shared steps
import { ProductSelect } from './steps/ProductSelect'
import { SystemType } from './steps/SystemType'
import { Diameter } from './steps/Diameter'
import { InletCount } from './steps/InletCount'
import { ClockFace } from './steps/ClockFace'
import { PipeSizes } from './steps/PipeSizes'
import { FlowControl } from './steps/FlowControl'
import { Depth } from './steps/Depth'
import { Review } from './steps/Review'
import { Output } from './steps/Output'

// 3D viewer (lazy loaded)
const ChamberViewer = dynamic(
  () => import('@/components/viewer3d/ChamberViewer').then((m) => m.ChamberViewer),
  { ssr: false }
)

// ── PLACEHOLDER STEP ────────────────────────────────────────
// Used for product-specific steps that don't have components yet.

function PlaceholderStep({ stepId }: { stepId: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-blue/25 bg-blue/6 px-4 py-10 text-center">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue">
        Coming Soon
      </div>
      <div className="text-sm font-bold text-ink">{stepId}</div>
      <div className="mt-1 text-[11px] text-muted">
        This step is not yet implemented. It will be available in a future update.
      </div>
    </div>
  )
}

// ── STEP COMPONENT MAP ──────────────────────────────────────
// Maps step IDs to their component implementations.
// Shared steps are mapped to their real components.
// Product-specific steps that don't exist yet get null (resolved to PlaceholderStep at render).

const STEP_COMPONENT_MAP: Record<string, ComponentType | null> = {
  // Shared steps (chamber, catchpit, etc.)
  'system-type': SystemType,
  'diameter': Diameter,
  'inlet-count': InletCount,
  'clock-face': ClockFace,
  'pipe-sizes': PipeSizes,
  'flow-control': FlowControl,
  'depth': Depth,

  // Catchpit-specific
  'silt-options': null,

  // RhinoCeptor-specific
  'variant-select': null,
  'drainage-area': null,
  'flow-sizing': null,
  'class-select': null,

  // Flow Control product-specific
  'fc-system-type': SystemType,
  'fc-application': null,
  'head-depth': null,
  'discharge-rate': null,
  'fc-chamber-size': Diameter,

  // Pump Station-specific
  'pump-system-type': SystemType,
  'pump-flow': null,
  'pump-head': null,
  'pump-config': null,
  'pump-well-sizing': null,
  'pump-pipe-sizing': null,

  // Grease Trap-specific
  'gt-model-select': null,
  'gt-connections': null,

  // Grease Separator-specific
  'gs-application': null,
  'gs-covers': null,
  'gs-flow-sizing': null,

  // RhinoPod-specific
  'pod-type-select': null,
  'pod-chamber-compat': null,

  // Rainwater-specific
  'rw-system-type': null,
  'rw-catchment-area': null,
  'rw-capacity': null,
  'rw-rainfall': null,

  // Septic Tank-specific
  'st-treatment': null,
  'st-population': null,
  'st-discharge': null,

  // Drawpit-specific
  'dp-dimensions': null,
  'dp-depth-rings': null,
  'dp-load-rating': null,
  'dp-cover-type': null,
}

// ── WIZARD SHELL ────────────────────────────────────────────

export function WizardShell() {
  const { state, canProceed, goNext, goBack } = useWizardContext()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [fading, setFading] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const contentRef = useRef<HTMLDivElement>(null)
  const prevStep = useRef(state.step)

  // Handle step transition animation
  useEffect(() => {
    if (prevStep.current !== state.step) {
      setDirection(state.step > prevStep.current ? 'forward' : 'back')
      setFading(true)
      const timer = setTimeout(() => {
        setFading(false)
        prevStep.current = state.step
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [state.step])

  // Scroll to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [state.step])

  // ── Derive step data from registry ────────────────────────

  const hasProduct = state.product !== null
  const config = hasProduct ? getProductConfig(state.product!) : null
  const reviewStepIndex = hasProduct ? getReviewStepIndex(state.product!) : -1
  const outputStepIndex = hasProduct ? getOutputStepIndex(state.product!) : -1
  const configStepCount = config ? config.steps.length : 0

  // Resolve the current step component and metadata
  let StepComponent: ComponentType | null = null
  let placeholderStepId: string | null = null
  let stepHeading = ''
  let stepSubheading: string | ((s: typeof state) => string) = ''
  let stepEyebrow = ''
  let stepLabel = ''

  if (state.step === 0) {
    // Product selection
    StepComponent = ProductSelect
    stepEyebrow = 'Step 0'
    stepHeading = 'Select Product'
    stepSubheading = 'Choose the product you want to configure.'
    stepLabel = 'Product'
  } else if (hasProduct && state.step === reviewStepIndex) {
    // Review step
    StepComponent = Review
    stepEyebrow = 'Review'
    stepHeading = 'Configuration Review'
    stepSubheading = 'Check your specification before generating the output.'
    stepLabel = 'Review'
  } else if (hasProduct && state.step === outputStepIndex) {
    // Output step
    StepComponent = Output
    stepEyebrow = 'Output'
    stepHeading = 'Your Specification'
    stepSubheading = ''
    stepLabel = 'Output'
  } else if (config) {
    // Product config step (step index 1..N maps to config.steps[0..N-1])
    const configStepIndex = state.step - 1
    if (configStepIndex >= 0 && configStepIndex < config.steps.length) {
      const stepDef = config.steps[configStepIndex]
      const stepId = stepDef.id

      // Resolve from component map, fall back to placeholder
      const mapped = STEP_COMPONENT_MAP[stepId]
      if (mapped) {
        StepComponent = mapped
      } else {
        placeholderStepId = stepId
      }

      stepEyebrow = `Step ${state.step}`
      stepHeading = stepDef.heading
      stepSubheading = stepDef.subheading
      stepLabel = stepDef.label
    } else {
      StepComponent = ProductSelect
    }
  } else {
    StepComponent = ProductSelect
  }

  // Resolve dynamic subheading
  const resolvedSubheading =
    typeof stepSubheading === 'function'
      ? stepSubheading(state)
      : stepSubheading

  // Progress bar visibility
  const isConfigStep = state.step >= 1 && state.step <= (configStepCount)
  const isReviewStep = state.step === reviewStepIndex
  const showProgress = hasProduct && (isConfigStep || isReviewStep)

  // Nav bar visibility
  const showNav = state.step < outputStepIndex || !hasProduct

  // 3D button visibility
  const show3dButton = hasProduct && config?.has3dViewer === true && state.step >= 2 && state.step <= reviewStepIndex

  // Summary fields from product config
  const summaryFields: SummaryField[] =
    hasProduct && config ? config.getSummaryFields(state) : []

  const handleNext = () => {
    if (canProceed()) {
      goNext()
    }
  }

  const nextLabel = state.step === reviewStepIndex ? 'Generate Output' : 'Next'

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-light">
      {/* App Header */}
      <header className="flex shrink-0 items-center justify-between bg-gradient-to-br from-navy to-[#005f8c] px-[18px] py-3 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/20 bg-white/12">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C8 3 5 6 5 9c0 2 1 3.5 2.5 4.5L6 18h12l-1.5-4.5C18 12.5 19 11 19 9c0-3-3-6-7-6z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 9c0 1.66 1.34 3 3 3s3-1.34 3-3"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M5 9L3 7M19 9l2-2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <strong className="block text-[13px] font-extrabold tracking-tight text-white">
              SuDS Enviro
            </strong>
            <span className="block text-[9px] font-medium uppercase tracking-widest text-white/55">
              Configurator
            </span>
          </div>
        </div>
        <button
          type="button"
          className="text-[11px] font-semibold text-white/50"
          disabled
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </header>

      {/* Progress Bar */}
      {showProgress && (
        <div className="shrink-0 bg-navy px-[18px] pb-3 pt-2.5">
          <div className="flex items-center gap-0">
            {Array.from({ length: configStepCount }, (_, i) => {
              const stepNum = i + 1
              const isDone = state.step > stepNum
              const isActive = state.step === stepNum
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300
                    ${isDone ? 'bg-green' : isActive ? 'bg-green/60' : 'bg-white/15'}
                  `}
                />
              )
            })}
            <span className="ml-2.5 whitespace-nowrap text-[10px] font-bold text-white/45">
              {Math.min(state.step, configStepCount)}/{configStepCount}
            </span>
          </div>
        </div>
      )}

      {/* Summary Accordion */}
      {showProgress && summaryFields.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="flex shrink-0 items-center justify-between border-b border-white/6 bg-navy-d px-[18px] py-2.5"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-white/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                Configuration
              </span>
              {config && (
                <span className="text-[11px] font-semibold text-white/75">
                  {config.name}
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-white/35 transition-transform duration-250 ${
                summaryOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`shrink-0 overflow-hidden bg-navy-d transition-[max-height] duration-300 ease-out
              ${summaryOpen ? 'max-h-[200px]' : 'max-h-0'}
            `}
          >
            <SummaryGrid fields={summaryFields} />
          </div>
        </>
      )}

      {/* Screen Content */}
      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto px-[18px] pt-5 pb-2 transition-all duration-200
          ${
            fading
              ? direction === 'forward'
                ? 'translate-x-4 opacity-0'
                : '-translate-x-4 opacity-0'
              : 'translate-x-0 opacity-100'
          }
        `}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Step typography */}
        <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue">
          {stepEyebrow}
        </div>
        <h2 className="mb-1 text-xl font-extrabold leading-tight tracking-tight text-ink">
          {stepHeading}
        </h2>
        {resolvedSubheading && (
          <p className="mb-5 text-xs font-normal leading-relaxed text-muted">
            {resolvedSubheading}
          </p>
        )}

        {StepComponent ? <StepComponent /> : <PlaceholderStep stepId={placeholderStepId ?? 'unknown'} />}
      </div>

      {/* 3D Float Button */}
      {show3dButton && (
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          className="absolute bottom-[76px] right-3.5 z-[100] flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-green-d bg-green shadow-[0_4px_16px_rgba(68,175,67,0.45)] transition-all active:scale-[0.92]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M2 17l10 5 10-5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="flex h-[58px] shrink-0 items-center gap-2.5 border-t border-border bg-white px-3.5">
          {state.step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2.5 text-xs font-bold text-muted transition-colors active:bg-light"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <span className="flex-1 text-center text-[10px] font-semibold text-muted whitespace-nowrap">
            {stepLabel}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-bold transition-opacity active:opacity-85
              ${
                canProceed()
                  ? 'bg-navy text-white shadow-[0_2px_8px_rgba(0,77,112,0.3)]'
                  : 'pointer-events-none bg-border text-muted shadow-none'
              }
            `}
          >
            {nextLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}

      {/* Home Indicator */}
      <div className="flex h-[22px] shrink-0 items-center justify-center border-t border-border bg-white">
        <div className="h-1 w-[110px] rounded-full bg-ink/15" />
      </div>

      {/* 3D Viewer Panel */}
      {viewerOpen && (
        <ChamberViewer open={viewerOpen} onClose={() => setViewerOpen(false)} />
      )}
    </div>
  )
}

// ── SUMMARY GRID ─────────────────────────────────────────────

function SummaryGrid({ fields }: { fields: SummaryField[] }) {
  if (fields.length === 0) return null

  return (
    <div className="mx-[18px] mb-2.5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/6 bg-white/6">
      {fields.map((cell) => (
        <div key={cell.label} className="bg-white/4 px-2.5 py-[7px]">
          <div className="text-[9px] uppercase tracking-wide text-white/35">
            {cell.label}
          </div>
          <div
            className={`text-[11px] font-bold ${
              cell.locked
                ? 'text-green/80'
                : cell.value === '--' || cell.value === '-'
                  ? 'text-white/20 font-normal italic'
                  : 'text-white/80'
            }`}
          >
            {cell.value}
          </div>
        </div>
      ))}
    </div>
  )
}
