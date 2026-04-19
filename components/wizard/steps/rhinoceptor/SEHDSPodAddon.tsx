'use client'

import { useWizardContext } from '../../WizardContext'
import type { WizardAction } from '@/lib/types'

export function SEHDSPodAddon() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const choice = data?.rhinoPodAddOn

  const set = (val: boolean) =>
    dispatch({
      type: 'RHINO_SET_POD_ADDON',
      payload: val,
    } as WizardAction)

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => set(true)}
        className={`block w-full rounded-[12px] border-[1.5px] p-4 text-left transition-all
          ${choice === true
            ? 'border-green border-2 bg-green/8 shadow-[0_4px_16px_rgba(68,175,67,0.18)]'
            : 'border-border bg-white hover:border-green/40 shadow-[0_2px_12px_rgba(0,77,112,0.08)]'
          }
        `}
      >
        <div className="text-[14px] font-extrabold leading-tight text-navy">
          Yes - include RHINO POD
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
          Polishing filter that adds removal of 33 WFD priority substances
          (heavy metals, hydrocarbons, nutrients). Recommended for highway and
          industrial discharges to sensitive receiving waters.
        </p>
      </button>

      <button
        type="button"
        onClick={() => set(false)}
        className={`block w-full rounded-[12px] border-[1.5px] p-4 text-left transition-all
          ${choice === false
            ? 'border-navy border-2 bg-[#f0f7fb] shadow-[0_4px_16px_rgba(0,77,112,0.18)]'
            : 'border-border bg-white hover:border-navy/40 shadow-[0_2px_12px_rgba(0,77,112,0.08)]'
          }
        `}
      >
        <div className="text-[14px] font-extrabold leading-tight text-navy">
          No - separator only
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
          Standard SEHDS separator without polishing filter. Suitable where
          downstream treatment is not required.
        </p>
      </button>
    </div>
  )
}
