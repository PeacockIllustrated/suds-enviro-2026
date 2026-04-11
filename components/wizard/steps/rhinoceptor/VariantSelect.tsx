'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { RhinoVariant, WizardAction } from '@/lib/types'
import { Fuel, Droplets, GitBranch } from 'lucide-react'

const variants: {
  id: RhinoVariant
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'forecourt',
    title: 'Forecourt',
    subtitle: 'Retains entire fuel spill up to predicted maximum capacity',
    icon: <Fuel className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'full-retention',
    title: 'Full Retention',
    subtitle: 'Treats flows from rainfall rates up to 65mm/hr',
    icon: <Droplets className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'bypass',
    title: 'Bypass',
    subtitle: 'Treats flows from rainfall rates up to 6.5mm/hr',
    icon: <GitBranch className="h-[22px] w-[22px] text-blue" />,
  },
]

export function VariantSelect() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rhinoceptor' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {variants.map((v) => (
        <OptionCard
          key={v.id}
          icon={v.icon}
          title={v.title}
          subtitle={v.subtitle}
          selected={data.variant === v.id}
          onClick={() =>
            dispatch({
              type: 'RHINO_SET_VARIANT',
              payload: v.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
