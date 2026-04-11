'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import type { Diameter, WizardAction } from '@/lib/types'

const diameters: Diameter[] = [450, 600, 750, 1050]

export function PodChamberCompat() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rhinopod' ? state.productData.data : null

  if (!data) return null

  // Plus variant: show diameter selection
  if (data.podType === 'plus') {
    return (
      <>
        <div className="mb-2 text-xs font-bold text-navy">Chamber diameter</div>
        <div className="grid grid-cols-2 gap-2">
          {diameters.map((d) => (
            <SizeCard
              key={d}
              value={String(d)}
              unit="mm"
              selected={data.chamberDiameter === d}
              onClick={() =>
                dispatch({
                  type: 'POD_SET_DIAMETER',
                  payload: d,
                } as WizardAction)
              }
            />
          ))}
        </div>
      </>
    )
  }

  // Standalone variant: retrofit toggle
  if (data.podType === 'standalone') {
    return (
      <>
        <div className="mb-2 text-xs font-bold text-navy">
          Retrofitting to existing chamber?
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'POD_SET_RETROFIT',
                payload: true,
              } as WizardAction)
            }
            className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
              ${
                data.retrofitExisting === true
                  ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                  : 'border-border bg-white text-muted'
              }
            `}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: 'POD_SET_RETROFIT',
                payload: false,
              } as WizardAction)
            }
            className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
              ${
                data.retrofitExisting === false
                  ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                  : 'border-border bg-white text-muted'
              }
            `}
          >
            No
          </button>
        </div>
      </>
    )
  }

  // No pod type selected yet
  return (
    <div className="rounded-lg border border-dashed border-blue/25 bg-blue/6 p-3 text-[11px] leading-relaxed text-muted">
      <strong className="text-blue">Select a pod type first.</strong> Go back to
      the previous step to choose between Standalone and Plus.
    </div>
  )
}
