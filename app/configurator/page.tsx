'use client'

import { useState, useRef } from 'react'
import { WizardProvider, useWizardContext } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'
import { SplashScreen } from '@/components/SplashScreen'
import { useAutoSave } from '@/lib/use-auto-save'

function AutoSaveRunner() {
  const { state, dispatch } = useWizardContext()
  useAutoSave(state, dispatch)
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
      {showSplash && !hasShownRef.current && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <WizardShell />
    </WizardProvider>
  )
}
