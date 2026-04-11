'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import type { Diameter, DepthMm, WizardAction } from '@/lib/types'

const diameters: Diameter[] = [450, 600, 750, 1050]
const depths: DepthMm[] = [1000, 1500, 2000, 2500, 3000]

export function PumpWellSizing() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'pump-station' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Diameter grid */}
      <div className="mb-2 text-xs font-bold text-navy">Wet well diameter</div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {diameters.map((d) => (
          <SizeCard
            key={d}
            value={String(d)}
            unit="mm"
            selected={data.wetWellDiameter === d}
            onClick={() =>
              dispatch({
                type: 'PUMP_SET_DIAMETER',
                payload: d,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* Depth grid */}
      <div className="mb-2 text-xs font-bold text-navy">Wet well depth</div>
      <div className="grid grid-cols-3 gap-2">
        {depths.map((d) => {
          const label = `${(d / 1000).toFixed(1)}`
          return (
            <SizeCard
              key={d}
              value={label}
              unit="m"
              selected={data.depth === d}
              onClick={() =>
                dispatch({
                  type: 'PUMP_SET_DEPTH',
                  payload: d,
                } as WizardAction)
              }
            />
          )
        })}
      </div>
    </>
  )
}
