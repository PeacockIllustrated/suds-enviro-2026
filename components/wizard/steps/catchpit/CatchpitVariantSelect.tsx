'use client'

import { useWizardContext } from '../../WizardContext'
import type { CatchpitVariant, WizardAction } from '@/lib/types'

interface VariantOption {
  id: CatchpitVariant
  title: string
  diameters: string
  description: string
  features: string[]
}

const OPTIONS: VariantOption[] = [
  {
    id: 'SERS',
    title: 'SERS Series',
    diameters: '300 / 450 / 600 mm',
    description:
      'Smaller-diameter catchpit with a removable silt bucket for primary and secondary sediment capture.',
    features: [
      'Removable silt bucket',
      'Quick maintenance access',
      'Suited to driveways, courtyards, light-traffic areas',
    ],
  },
  {
    id: 'SERDS',
    title: 'SERDS Series',
    diameters: '450 / 600 / 750 / 900 / 1050 / 1200 mm',
    description:
      'Larger-diameter catchpit with built-in primary and secondary settling chambers.',
    features: [
      'No bucket - settling chambers built in',
      'Higher silt capacity',
      'Suited to highway, commercial, industrial drainage',
    ],
  },
]

export function CatchpitVariantSelect() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'catchpit' ? state.productData.data : null
  const selected = data?.variant ?? null

  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => {
        const isSelected = selected === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              dispatch({
                type: 'CATCHPIT_SET_VARIANT',
                payload: opt.id,
              } as WizardAction)
            }
            className={`block w-full rounded-[12px] border-[1.5px] p-4 text-left transition-all
              ${isSelected
                ? 'border-navy border-2 bg-[#f0f7fb] shadow-[0_4px_16px_rgba(0,77,112,0.18)]'
                : 'border-border bg-white hover:border-navy/40 shadow-[0_2px_12px_rgba(0,77,112,0.08)]'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold leading-tight text-navy">
                  {opt.title}
                </div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-green-d">
                  {opt.diameters}
                </div>
              </div>
              <div
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${isSelected ? 'border-navy bg-navy' : 'border-border bg-white'}
                `}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              {opt.description}
            </p>
            <ul className="mt-2.5 space-y-1">
              {opt.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-[11px] text-ink/80"
                >
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-green" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        )
      })}
    </div>
  )
}
