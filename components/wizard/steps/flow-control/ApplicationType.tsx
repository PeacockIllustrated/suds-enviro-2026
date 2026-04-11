'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { FlowControlApplication, WizardAction } from '@/lib/types'
import { Container, Waves, Droplet, MoreHorizontal } from 'lucide-react'

const applications: {
  id: FlowControlApplication
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'attenuation',
    title: 'Attenuation storage',
    subtitle: 'Flow control from attenuation tanks or crates',
    icon: <Container className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'swale',
    title: 'Swale',
    subtitle: 'Flow control from a swale or linear channel',
    icon: <Waves className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'pond',
    title: 'Pond',
    subtitle: 'Flow control from a detention or retention pond',
    icon: <Droplet className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'other',
    title: 'Other',
    subtitle: 'Flow control for other SuDS features or bespoke applications',
    icon: <MoreHorizontal className="h-[22px] w-[22px] text-muted" />,
  },
]

export function ApplicationType() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'flow-control' ? state.productData.data : null

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
              type: 'FC_SET_APPLICATION',
              payload: app.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
