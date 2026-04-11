'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { PipeSize, WizardAction } from '@/lib/types'
import { Circle } from 'lucide-react'

const pipeSizes: {
  id: PipeSize
  title: string
  subtitle: string
}[] = [
  {
    id: '110mm EN1401',
    title: '110mm EN1401',
    subtitle: 'Standard single-wall uPVC pipe',
  },
  {
    id: '160mm EN1401',
    title: '160mm EN1401',
    subtitle: 'Single-wall uPVC pipe',
  },
  {
    id: '225mm Twinwall',
    title: '225mm Twinwall',
    subtitle: 'Structured-wall twinwall pipe',
  },
  {
    id: '300mm Twinwall',
    title: '300mm Twinwall',
    subtitle: 'Structured-wall twinwall pipe',
  },
  {
    id: '450mm Twinwall',
    title: '450mm Twinwall',
    subtitle: 'Large bore structured-wall pipe',
  },
]

export function PumpPipeSizing() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'pump-station' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {pipeSizes.map((p) => (
        <OptionCard
          key={p.id}
          icon={<Circle className="h-[22px] w-[22px] text-blue" />}
          title={p.title}
          subtitle={p.subtitle}
          selected={data.pipeSizeOutlet === p.id}
          onClick={() =>
            dispatch({
              type: 'PUMP_SET_PIPE_SIZE',
              payload: p.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
