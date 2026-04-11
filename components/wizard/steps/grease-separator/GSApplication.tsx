'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { GreaseSepApplication, WizardAction } from '@/lib/types'
import { UtensilsCrossed, Building2, ChefHat, Factory } from 'lucide-react'

const applications: {
  id: GreaseSepApplication
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    subtitle: 'Commercial restaurant kitchen',
    icon: <UtensilsCrossed className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'hotel',
    title: 'Hotel',
    subtitle: 'Hotel kitchen and food service',
    icon: <Building2 className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'catering',
    title: 'Catering',
    subtitle: 'Commercial catering or canteen',
    icon: <ChefHat className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'food-processing',
    title: 'Food Processing',
    subtitle: 'Food processing or manufacturing facility',
    icon: <Factory className="h-[22px] w-[22px] text-blue" />,
  },
]

export function GSApplication() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'grease-separator'
      ? state.productData.data
      : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {applications.map((app) => (
        <OptionCard
          key={app.id}
          icon={app.icon}
          title={app.title}
          subtitle={app.subtitle}
          selected={data.application === app.id}
          onClick={() =>
            dispatch({
              type: 'GS_SET_APPLICATION',
              payload: app.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
