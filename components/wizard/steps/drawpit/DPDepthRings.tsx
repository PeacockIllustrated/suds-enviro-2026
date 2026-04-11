'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function DPDepthRings() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'drawpit' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Total depth */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Total depth
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.depthMm}
            onChange={(e) =>
              dispatch({
                type: 'DP_SET_DEPTH',
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

      {/* Ring count */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Ring count
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.ringCount}
            onChange={(e) =>
              dispatch({
                type: 'DP_SET_RINGS',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 4"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">rings</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Ring sizing"
        body="Standard rings are 150mm deep. Divide total depth by 150 for ring count. For example, a 600mm deep drawpit requires 4 rings."
      />
    </>
  )
}
