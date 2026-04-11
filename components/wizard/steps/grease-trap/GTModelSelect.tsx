'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { GreaseTrapModel, WizardAction } from '@/lib/types'
import { Box } from 'lucide-react'

const models: {
  id: GreaseTrapModel
  title: string
  subtitle: string
}[] = [
  {
    id: 'micro',
    title: 'GT Micro',
    subtitle: 'Up to 150 covers/day, 100L sludge capacity',
  },
  {
    id: 'mini',
    title: 'GT Mini',
    subtitle: 'Up to 300 covers/day, 250L sludge capacity',
  },
  {
    id: 'midi',
    title: 'GT Midi',
    subtitle: 'Up to 300 covers/day, 180L sludge capacity',
  },
  {
    id: 'jumbo',
    title: 'GT Jumbo',
    subtitle: 'Up to 600 covers/day, 400L sludge capacity',
  },
]

export function GTModelSelect() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'grease-trap' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {models.map((m) => (
        <OptionCard
          key={m.id}
          icon={<Box className="h-[22px] w-[22px] text-blue" />}
          title={m.title}
          subtitle={m.subtitle}
          selected={data.model === m.id}
          onClick={() =>
            dispatch({
              type: 'GT_SET_MODEL',
              payload: m.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
