'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { RhinoPodType, WizardAction } from '@/lib/types'
import { CircleDot, PackagePlus } from 'lucide-react'

const podTypes: {
  id: RhinoPodType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'standalone',
    title: 'Standalone',
    subtitle:
      'Retrofittable floating filter for existing catchpits and road gullies',
    icon: <CircleDot className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'plus',
    title: 'Plus',
    subtitle:
      'Factory-fitted chamber with integrated RhinoPod filtration',
    icon: <PackagePlus className="h-[22px] w-[22px] text-green" />,
  },
]

export function PodTypeSelect() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rhinopod' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {podTypes.map((pt) => (
        <OptionCard
          key={pt.id}
          icon={pt.icon}
          title={pt.title}
          subtitle={pt.subtitle}
          selected={data.podType === pt.id}
          onClick={() =>
            dispatch({
              type: 'POD_SET_TYPE',
              payload: pt.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
