'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { BaffleType, GrateType, WizardAction } from '@/lib/types'
import { Filter, Grid3X3, ShieldCheck, Lock, Layers } from 'lucide-react'

const baffleOptions: {
  id: BaffleType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'none',
    title: 'None',
    subtitle: 'No baffle fitted to the catchpit',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#5a7a90" strokeWidth="1.5" />
        <path d="M7 7l10 10" stroke="#5a7a90" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'internal',
    title: 'Internal baffle',
    subtitle: 'Baffle plate fitted inside the chamber body',
    icon: <Filter className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'external',
    title: 'External baffle',
    subtitle: 'Baffle plate fitted externally to the outlet',
    icon: <ShieldCheck className="h-[22px] w-[22px] text-blue" />,
  },
]

const grateOptions: {
  id: GrateType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'hinged',
    title: 'Hinged grate',
    subtitle: 'Hinged access grate for easy maintenance',
    icon: <Grid3X3 className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'sealed',
    title: 'Sealed grate',
    subtitle: 'Fixed sealed grate for secure installations',
    icon: <Lock className="h-[22px] w-[22px] text-blue" />,
  },
]

export function SiltOptions() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'catchpit' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Baffle type */}
      <div className="mb-2 text-xs font-bold text-navy">Baffle type</div>
      <div className="mb-5 flex flex-col gap-2">
        {baffleOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={data.baffleType === opt.id}
            onClick={() =>
              dispatch({
                type: 'CATCHPIT_SET_BAFFLE',
                payload: opt.id,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* Grate type */}
      <div className="mb-2 text-xs font-bold text-navy">Grate type</div>
      <div className="flex flex-col gap-2">
        {grateOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={data.grateType === opt.id}
            onClick={() =>
              dispatch({
                type: 'CATCHPIT_SET_GRATE',
                payload: opt.id,
              } as WizardAction)
            }
          />
        ))}
      </div>
    </>
  )
}
