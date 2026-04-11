'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { RainwaterSystemType, WizardAction } from '@/lib/types'
import { Zap, ArrowUpDown, ArrowDown } from 'lucide-react'

const systemTypes: {
  id: RainwaterSystemType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'direct',
    title: 'Direct',
    subtitle: 'Water pumped directly from storage to points of use',
    icon: <Zap className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'indirect',
    title: 'Indirect',
    subtitle: 'Water pumped to elevated cistern, then gravity-fed',
    icon: <ArrowUpDown className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'gravity',
    title: 'Gravity',
    subtitle: 'Water fed by gravity from storage to points of use',
    icon: <ArrowDown className="h-[22px] w-[22px] text-blue" />,
  },
]

export function RWSystemType() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rainwater' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="flex flex-col gap-2">
      {systemTypes.map((st) => (
        <OptionCard
          key={st.id}
          icon={st.icon}
          title={st.title}
          subtitle={st.subtitle}
          selected={data.systemType === st.id}
          onClick={() =>
            dispatch({
              type: 'RW_SET_SYSTEM',
              payload: st.id,
            } as WizardAction)
          }
        />
      ))}
    </div>
  )
}
