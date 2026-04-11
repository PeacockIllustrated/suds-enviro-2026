'use client'

import { WizardProvider, useWizardContext } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useAutoSave } from '@/lib/use-auto-save'

function AutoSaveRunner() {
  const { state, dispatch } = useWizardContext()
  useAutoSave(state, dispatch)
  return null
}

export default function ConfiguratorPage() {
  return (
    <WizardProvider>
      <AutoSaveRunner />
      <WizardShell />
    </WizardProvider>
  )
}
