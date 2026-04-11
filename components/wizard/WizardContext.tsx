'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  WizardState,
  WizardAction,
  Diameter,
  PipeSize,
} from '@/lib/types'
import { INITIAL_WIZARD_STATE } from '@/lib/types'
import {
  getMaxInlets,
  getOutletMinSize,
  getAvailableInletSizes,
} from '@/lib/rule-engine'

// ── CONTEXT ──────────────────────────────────────────────────

interface WizardContextValue {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  canProceed: () => boolean
  goNext: () => void
  goBack: () => void
  goToStep: (step: number) => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizardContext(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) {
    throw new Error('useWizardContext must be used within a WizardProvider')
  }
  return ctx
}

// ── HELPERS ──────────────────────────────────────────────────

function getDefaultPipeSize(diameter: Diameter): PipeSize {
  switch (diameter) {
    case 450:
      return '110mm EN1401'
    case 600:
      return '160mm EN1401'
    case 750:
      return '160mm EN1401'
    case 1050:
      return '160mm EN1401'
  }
}

function buildDefaultPipeSizes(
  inletCount: number,
  diameter: Diameter
): Record<string, PipeSize> {
  const sizes: Record<string, PipeSize> = {}
  const defaultSize = getDefaultPipeSize(diameter)
  for (let i = 1; i <= inletCount; i++) {
    sizes[`inlet${i}`] = defaultSize
  }
  return sizes
}

// ── REDUCER ──────────────────────────────────────────────────

function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }

    case 'SET_PRODUCT':
      return { ...state, product: action.payload }

    case 'SET_SYSTEM':
      return { ...state, systemType: action.payload }

    case 'SET_DIAMETER': {
      const diameter = action.payload
      const maxInlets = getMaxInlets(diameter)
      const currentCount = state.inletCount

      // R1: if current inlet count exceeds new max, reset downstream
      if (currentCount !== null && currentCount > maxInlets) {
        return {
          ...state,
          diameter,
          inletCount: null,
          positions: [],
          pipeSizes: {},
          outletLocked: null,
        }
      }

      // If inlet count is still valid, revalidate pipe sizes against new diameter max
      if (currentCount !== null) {
        const available = getAvailableInletSizes(diameter, state.outletLocked)
        const newPipeSizes: Record<string, PipeSize> = {}
        for (const [key, size] of Object.entries(state.pipeSizes)) {
          newPipeSizes[key] = available.includes(size)
            ? size
            : available[available.length - 1]
        }
        return { ...state, diameter, pipeSizes: newPipeSizes }
      }

      return { ...state, diameter }
    }

    case 'SET_INLET_COUNT': {
      const inletCount = action.payload
      const diameter = state.diameter

      if (!diameter) return state

      // R2: compute outlet lock
      const outletLocked = getOutletMinSize(inletCount, diameter)

      // Build default pipe sizes for new count
      const pipeSizes = buildDefaultPipeSizes(inletCount, diameter)

      return {
        ...state,
        inletCount,
        positions: [], // clear positions - user must re-select
        pipeSizes,
        outletLocked,
      }
    }

    case 'TOGGLE_POSITION': {
      const pos = action.payload
      const current = state.positions
      const maxCount = state.inletCount ?? 0

      if (current.includes(pos)) {
        // Deselect
        return { ...state, positions: current.filter((p) => p !== pos) }
      }

      // Don't exceed inlet count
      if (current.length >= maxCount) return state

      return { ...state, positions: [...current, pos] }
    }

    case 'SET_PIPE_SIZE':
      return {
        ...state,
        pipeSizes: {
          ...state.pipeSizes,
          [action.payload.slot]: action.payload.size,
        },
      }

    case 'SET_FLOW_CONTROL':
      return {
        ...state,
        flowControl: action.payload,
        // Reset sub-fields when toggling off
        flowType: action.payload ? state.flowType : null,
        flowRate: action.payload ? state.flowRate : '',
      }

    case 'SET_FLOW_TYPE':
      return { ...state, flowType: action.payload }

    case 'SET_FLOW_RATE':
      return { ...state, flowRate: action.payload }

    case 'SET_DEPTH':
      return { ...state, depth: action.payload }

    case 'SET_ADOPTABLE': {
      const adoptable = action.payload
      // R4: if current depth exceeds new max, clear it
      const maxDepth = adoptable ? 2000 : 3000
      const depth =
        state.depth !== null && state.depth > maxDepth ? null : state.depth
      return { ...state, adoptable, depth }
    }

    case 'SET_CONFIG_ID':
      return { ...state, configId: action.payload }

    case 'GO_TO_STEP':
      return { ...state, step: action.payload }

    case 'RESET':
      return { ...INITIAL_WIZARD_STATE }

    default:
      return state
  }
}

// ── PROVIDER ─────────────────────────────────────────────────

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE)

  const canProceed = useCallback((): boolean => {
    switch (state.step) {
      case 0:
        return state.product !== null
      case 1:
        return state.systemType !== null
      case 2:
        return state.diameter !== null
      case 3:
        return state.inletCount !== null
      case 4:
        return state.positions.length === (state.inletCount ?? 0)
      case 5:
        return true // pipe sizes always have defaults
      case 6:
        if (state.flowControl === null) return false
        if (state.flowControl) {
          return state.flowType !== null && state.flowRate !== ''
        }
        return true
      case 7:
        return state.depth !== null && state.adoptable !== null
      case 8:
        return true // review is always passable
      default:
        return false
    }
  }, [state])

  const goNext = useCallback(() => {
    if (state.step < 9) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 })
    }
  }, [state.step])

  const goBack = useCallback(() => {
    if (state.step > 0) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 })
    }
  }, [state.step])

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  return (
    <WizardContext.Provider
      value={{ state, dispatch, canProceed, goNext, goBack, goToStep }}
    >
      {children}
    </WizardContext.Provider>
  )
}
