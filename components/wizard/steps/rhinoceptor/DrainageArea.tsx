'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function DrainageArea() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rhinoceptor' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Drainage area
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.drainageAreaM2}
            onChange={(e) =>
              dispatch({
                type: 'RHINO_SET_DRAINAGE_AREA',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 500"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">
            m&sup2;
          </span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Drainage area sizing"
        body="The drainage area determines the volume of runoff flowing into the separator. Enter the total impermeable area draining to this unit. This is used alongside rainfall intensity to calculate the required separator size."
      />
    </>
  )
}
