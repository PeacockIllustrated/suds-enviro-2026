'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function SEHDSFlowRate() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const rate = data?.flowRateLs ?? ''

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Treatment flow rate
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={(e) =>
              dispatch({
                type: 'RHINO_SET_FLOW_RATE',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 25.5"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-3 text-[14px] font-bold text-ink outline-none transition-colors focus:border-navy"
          />
          <span className="text-[14px] font-bold text-muted">L/s</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Design treatment flow"
        body="The treatment flow rate is the design throughput for primary pollutant removal. Higher flows bypass via the integral overflow."
      />
    </>
  )
}
