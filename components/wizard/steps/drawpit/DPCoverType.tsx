'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { DrawpitCoverType, WizardAction } from '@/lib/types'
import { Square, Grid2X2 } from 'lucide-react'

const coverTypes: {
  id: DrawpitCoverType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'solid',
    title: 'Solid',
    subtitle: 'Sealed solid cover for protected installations',
    icon: <Square className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'grated',
    title: 'Grated',
    subtitle: 'Ventilated grated cover for drainage access',
    icon: <Grid2X2 className="h-[22px] w-[22px] text-blue" />,
  },
]

export function DPCoverType() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'drawpit' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {coverTypes.map((ct) => (
        <OptionCard
          key={ct.id}
          icon={ct.icon}
          title={ct.title}
          subtitle={ct.subtitle}
          selected={data.coverType === ct.id}
          onClick={() =>
            dispatch({
              type: 'DP_SET_COVER',
              payload: ct.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
