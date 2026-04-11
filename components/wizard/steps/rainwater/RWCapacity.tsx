'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import type { RainwaterCapacity, WizardAction } from '@/lib/types'

const capacities: RainwaterCapacity[] = [1000, 1400, 2200, 2400, 3300]

export function RWCapacity() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rainwater' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {capacities.map((c) => (
        <SizeCard
          key={c}
          value={String(c)}
          unit="litres"
          selected={data.capacityLitres === c}
          onClick={() =>
            dispatch({
              type: 'RW_SET_CAPACITY',
              payload: c,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
