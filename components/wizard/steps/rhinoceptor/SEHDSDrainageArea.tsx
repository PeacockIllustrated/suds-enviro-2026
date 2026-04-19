'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function SEHDSDrainageArea() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const area = data?.drainageAreaM2 ?? ''

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Impermeable drainage area
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            step={1}
            value={area}
            onChange={(e) =>
              dispatch({
                type: 'RHINO_SET_DRAINAGE_AREA',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 5000"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-3 text-[14px] font-bold text-ink outline-none transition-colors focus:border-navy"
          />
          <span className="text-[14px] font-bold text-muted">m&sup2;</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Total catchment"
        body="Enter the total impermeable surface (roads, roofs, hardstanding) discharging to this separator. Permeable areas should not be included."
      />
    </>
  )
}
