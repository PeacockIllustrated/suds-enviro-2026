'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function HeadDepth() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'flow-control' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Head depth
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.headDepthMm}
            onChange={(e) =>
              dispatch({
                type: 'FC_SET_HEAD_DEPTH',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 600"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">mm</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="What is head?"
        body="Head is the depth from invert level of outlet to top water level upstream. This determines the energy available to drive flow through the control device."
      />
    </>
  )
}
