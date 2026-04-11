'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function DischargeRate() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'flow-control' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Target discharge rate
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.dischargeRateLs}
            onChange={(e) =>
              dispatch({
                type: 'FC_SET_DISCHARGE_RATE',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 5.0"
            min={0}
            step="0.1"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">L/s</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Planning conditions"
        body="The target discharge rate is typically set by the local planning authority or Lead Local Flood Authority (LLFA) as a condition of planning consent. Check your drainage strategy or planning conditions for the required value."
      />
    </>
  )
}
