import { WizardProvider } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'

export default function ConfiguratorPage() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  )
}
