'use client'

import { useWizardContext } from '../../WizardContext'
import type { WizardAction } from '@/lib/types'

export function RWCatchmentArea() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rainwater' ? state.productData.data : null

  if (!data) return null

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
        Roof / catchment area
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={data.roofAreaM2}
          onChange={(e) =>
            dispatch({
              type: 'RW_SET_ROOF_AREA',
              payload: e.target.value,
            } as WizardAction)
          }
          placeholder="e.g. 120"
          min={0}
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
        />
        <span className="shrink-0 text-xs font-bold text-muted">
          m&sup2;
        </span>
      </div>
    </div>
  )
}
