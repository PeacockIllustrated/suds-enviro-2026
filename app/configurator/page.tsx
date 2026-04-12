'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { WizardProvider, useWizardContext } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'
import { SplashScreen } from '@/components/SplashScreen'
import { useAutoSave } from '@/lib/use-auto-save'
import { isProductRegistered } from '@/lib/products/registry'
import '@/lib/products/register-all'
import type { ProductId } from '@/lib/types'

function AutoSaveRunner() {
  const { state, dispatch } = useWizardContext()
  useAutoSave(state, dispatch)
  return null
}

function ProductPreSelector() {
  const searchParams = useSearchParams()
  const { state, dispatch } = useWizardContext()
  const appliedRef = useRef(false)

  useEffect(() => {
    if (appliedRef.current || state.product) return
    const productParam = searchParams.get('product')
    if (productParam && isProductRegistered(productParam as ProductId)) {
      dispatch({ type: 'SET_PRODUCT', payload: productParam as ProductId })
      dispatch({ type: 'SET_STEP', payload: 1 })
      appliedRef.current = true
    }
  }, [searchParams, state.product, dispatch])

  return null
}

export default function ConfiguratorPage() {
  const [showSplash, setShowSplash] = useState(true)
  const hasShownRef = useRef(false)

  const handleSplashComplete = () => {
    hasShownRef.current = true
    setShowSplash(false)
  }

  return (
    <WizardProvider>
      <AutoSaveRunner />
      <Suspense fallback={null}>
        <ProductPreSelector />
      </Suspense>
      {showSplash && !hasShownRef.current && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <WizardShell />
    </WizardProvider>
  )
}
