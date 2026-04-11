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
  ProductId,
  ProductData,
} from '@/lib/types'
import { INITIAL_WIZARD_STATE } from '@/lib/types'
import {
  getProductConfig,
  isProductRegistered,
  getReviewStepIndex,
  getOutputStepIndex,
  getTotalSteps,
} from '@/lib/products/registry'

// Import sub-reducers
import { chamberReducer } from '@/lib/products/chamber'
import { catchpitReducer } from '@/lib/products/catchpit'
import { rhinoceptorReducer } from '@/lib/products/rhinoceptor'
import { flowControlReducer } from '@/lib/products/flow-control'
import { pumpStationReducer } from '@/lib/products/pump-station'
import { greaseTrapReducer } from '@/lib/products/grease-trap'
import { greaseSeparatorReducer } from '@/lib/products/grease-separator'
import { rhinopodReducer } from '@/lib/products/rhinopod'
import { rainwaterReducer } from '@/lib/products/rainwater'
import { septicTankReducer } from '@/lib/products/septic-tank'
import { drawpitReducer } from '@/lib/products/drawpit'

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

// ── SUB-REDUCER DISPATCH ─────────────────────────────────────

type SubReducer = (
  productData: ProductData,
  action: WizardAction
) => ProductData

const subReducers: Record<ProductId, SubReducer> = {
  'chamber': chamberReducer,
  'catchpit': catchpitReducer,
  'rhinoceptor': rhinoceptorReducer,
  'flow-control': flowControlReducer,
  'pump-station': pumpStationReducer,
  'grease-trap': greaseTrapReducer,
  'grease-separator': greaseSeparatorReducer,
  'rhinopod': rhinopodReducer,
  'rainwater': rainwaterReducer,
  'septic-tank': septicTankReducer,
  'drawpit': drawpitReducer,
}

// ── REDUCER ──────────────────────────────────────────────────

function wizardReducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  // Handle shared actions
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }

    case 'SET_PRODUCT': {
      const productId = action.payload
      if (!isProductRegistered(productId)) return state
      const config = getProductConfig(productId)
      return {
        ...state,
        product: productId,
        productData: config.initialData,
        step: 0,
      }
    }

    case 'SET_CONFIG_ID':
      return { ...state, configId: action.payload }

    case 'GO_TO_STEP':
      return { ...state, step: action.payload }

    case 'RESET':
      return { ...INITIAL_WIZARD_STATE }
  }

  // Delegate to product-specific sub-reducer
  if (!state.product || !state.productData) return state

  const subReducer = subReducers[state.product]
  if (!subReducer) return state

  const newProductData = subReducer(state.productData, action)
  if (newProductData === state.productData) return state

  return { ...state, productData: newProductData }
}

// ── PROVIDER ─────────────────────────────────────────────────

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_WIZARD_STATE)

  const canProceed = useCallback((): boolean => {
    // Step 0: product selection
    if (state.step === 0) {
      return state.product !== null
    }

    if (!state.product || !isProductRegistered(state.product)) return false

    const config = getProductConfig(state.product)
    const reviewStep = getReviewStepIndex(state.product)
    const outputStep = getOutputStepIndex(state.product)

    // Review step - always passable
    if (state.step === reviewStep) return true

    // Output step - no next
    if (state.step >= outputStep) return false

    // Product config steps (1-indexed, step 0 is product select)
    const stepIndex = state.step - 1
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      return config.steps[stepIndex].canProceed(state)
    }

    return false
  }, [state])

  const goNext = useCallback(() => {
    if (!state.product) return
    const total = getTotalSteps(state.product)
    if (state.step < total - 1) {
      dispatch({ type: 'SET_STEP', payload: state.step + 1 })
    }
  }, [state.step, state.product])

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
