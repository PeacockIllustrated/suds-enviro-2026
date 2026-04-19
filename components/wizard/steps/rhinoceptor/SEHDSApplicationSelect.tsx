'use client'

import { useWizardContext } from '../../WizardContext'
import type { SEHDSApplication, WizardAction } from '@/lib/types'

interface AppOption {
  id: SEHDSApplication
  label: string
  description: string
}

const OPTIONS: AppOption[] = [
  { id: 'highway', label: 'Highway Drainage', description: 'Adoptable highway runoff' },
  { id: 'commercial', label: 'Commercial / Retail', description: 'Car parks, retail parks' },
  { id: 'industrial', label: 'Industrial Site', description: 'Factory yards, depots' },
  { id: 'forecourt', label: 'Petrol Forecourt', description: 'Class 1 hydrocarbon risk' },
  { id: 'other', label: 'Other', description: 'Bespoke application' },
]

export function SEHDSApplicationSelect() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const selected = data?.variant ?? null

  return (
    <div className="space-y-2">
      {OPTIONS.map((opt) => {
        const isSelected = selected === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              dispatch({
                type: 'RHINO_SET_VARIANT',
                payload: opt.id,
              } as WizardAction)
            }
            className={`block w-full rounded-[10px] border-[1.5px] p-3.5 text-left transition-all
              ${isSelected
                ? 'border-navy border-2 bg-[#f0f7fb]'
                : 'border-border bg-white hover:border-navy/40'
              }
            `}
          >
            <div className="text-[13px] font-bold text-navy">{opt.label}</div>
            <div className="mt-0.5 text-[11px] text-muted">{opt.description}</div>
          </button>
        )
      })}
    </div>
  )
}
