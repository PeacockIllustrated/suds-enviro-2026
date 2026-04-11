'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function GSFlowSizing() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'grease-separator'
      ? state.productData.data
      : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Flow rate
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.flowRateLs}
            onChange={(e) =>
              dispatch({
                type: 'GS_SET_FLOW_RATE',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 2.0"
            min={0}
            step="0.1"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">L/s</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Auto-sizing"
        body="The separator size is automatically calculated based on your peak covers per day and application type. You can override the flow rate here if you have a specific hydraulic design value."
      />
    </>
  )
}
