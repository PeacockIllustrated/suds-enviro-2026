'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import { AlertBox } from '@/components/ui/AlertBox'
import type { DischargePoint, WizardAction } from '@/lib/types'
import { Waves, Circle, LayoutGrid } from 'lucide-react'

const dischargeOptions: {
  id: DischargePoint
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'watercourse',
    title: 'Watercourse',
    subtitle: 'Discharge to river or stream (requires secondary treatment)',
    icon: <Waves className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'soakaway',
    title: 'Soakaway',
    subtitle: 'Discharge to soakaway system',
    icon: <Circle className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'drainfield',
    title: 'Drainfield',
    subtitle: 'Discharge to drainage field / infiltration system',
    icon: <LayoutGrid className="h-[22px] w-[22px] text-blue" />,
  },
]

export function STDischarge() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'septic-tank' ? state.productData.data : null

  if (!data) return null

  const showWarning =
    data.treatmentLevel === 'primary' && data.dischargePoint === 'watercourse'

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        {dischargeOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={data.dischargePoint === opt.id}
            onClick={() =>
              dispatch({
                type: 'ST_SET_DISCHARGE',
                payload: opt.id,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {showWarning && (
        <AlertBox
          type="warn"
          title="Secondary treatment required"
          body="Discharge to a watercourse from a primary treatment system does not meet the General Binding Rules. You must upgrade to secondary treatment or select a different discharge point."
        />
      )}
    </>
  )
}
