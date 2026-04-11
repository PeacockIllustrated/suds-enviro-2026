'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

export function RWRainfall() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rainwater' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Annual rainfall (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.annualRainfallMm}
            onChange={(e) =>
              dispatch({
                type: 'RW_SET_RAINFALL',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 800"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">mm</span>
        </div>
      </div>

      <AlertBox
        type="info"
        title="UK regional averages"
        body="Typical annual rainfall in the UK ranges from around 600mm in East Anglia to over 1500mm in western Scotland and Wales. An average of 800-900mm is typical for central and southern England. Leave blank if unknown."
      />
    </>
  )
}
