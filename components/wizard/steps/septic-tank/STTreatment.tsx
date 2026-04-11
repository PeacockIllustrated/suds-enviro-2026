'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { SepticTreatment, WizardAction } from '@/lib/types'
import { ArrowDown, Layers } from 'lucide-react'

const treatments: {
  id: SepticTreatment
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'primary',
    title: 'Primary',
    subtitle:
      'Gravity-based system with septic tank connected to drainage field',
    icon: <ArrowDown className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'secondary',
    title: 'Secondary',
    subtitle:
      'Septic tank with sand filter or packaged treatment plant',
    icon: <Layers className="h-[22px] w-[22px] text-green" />,
  },
]

export function STTreatment() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'septic-tank' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {treatments.map((t) => (
        <OptionCard
          key={t.id}
          icon={t.icon}
          title={t.title}
          subtitle={t.subtitle}
          selected={data.treatmentLevel === t.id}
          onClick={() =>
            dispatch({
              type: 'ST_SET_TREATMENT',
              payload: t.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
