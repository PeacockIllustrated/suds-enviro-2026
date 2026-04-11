'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function PumpHead() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'pump-station' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Total head
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.totalHeadM}
            onChange={(e) =>
              dispatch({
                type: 'PUMP_SET_HEAD',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 8.0"
            min={0}
            step="0.1"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">m</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Total head calculation"
        body="Total head is the sum of static head (vertical lift from pump to discharge point) and friction losses in the pipework. Consult your hydraulic design for accurate values."
      />
    </>
  )
}
