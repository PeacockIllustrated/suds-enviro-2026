'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { DrawpitLoadRating, WizardAction } from '@/lib/types'
import { Shield } from 'lucide-react'

const loadRatings: {
  id: DrawpitLoadRating
  title: string
  subtitle: string
}[] = [
  {
    id: 'A15',
    title: 'A15',
    subtitle: 'Pedestrian areas only',
  },
  {
    id: 'B125',
    title: 'B125',
    subtitle: 'Light vehicle areas, footways',
  },
  {
    id: 'C250',
    title: 'C250',
    subtitle: 'Kerbside channels, car parks',
  },
  {
    id: 'D400',
    title: 'D400',
    subtitle: 'Carriageways, hard shoulders',
  },
  {
    id: 'E600',
    title: 'E600',
    subtitle: 'Docks, aircraft pavements',
  },
  {
    id: 'F900',
    title: 'F900',
    subtitle: 'Aircraft runways, heavy industrial',
  },
]

export function DPLoadRating() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'drawpit' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {loadRatings.map((lr) => (
        <OptionCard
          key={lr.id}
          icon={<Shield className="h-[22px] w-[22px] text-blue" />}
          title={lr.title}
          subtitle={lr.subtitle}
          selected={data.loadRating === lr.id}
          onClick={() =>
            dispatch({
              type: 'DP_SET_LOAD_RATING',
              payload: lr.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
