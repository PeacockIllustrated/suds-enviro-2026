'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function DPDimensions() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'drawpit' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Length */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Length
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.lengthMm}
            onChange={(e) =>
              dispatch({
                type: 'DP_SET_LENGTH',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 430"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">mm</span>
        </div>
      </div>

      {/* Width */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Width
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.widthMm}
            onChange={(e) =>
              dispatch({
                type: 'DP_SET_WIDTH',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 280"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">mm</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="Common sizes"
        body="Standard drawpit dimensions include 150x150mm and 430x280mm. Check your installation requirements for the correct size."
      />
    </>
  )
}
