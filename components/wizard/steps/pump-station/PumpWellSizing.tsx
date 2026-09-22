'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getAllowedDiameters, getMaxDepth } from '@/lib/rules/pump-station'
import type { DepthMm, WizardAction } from '@/lib/types'

// RHINOLIFT data sheet: 600-1200mm chambers, depth to pipe soffit up to
// 2000mm adoptable / 3000mm non-adoptable.
const diameters = getAllowedDiameters()
const depths: DepthMm[] = [1000, 1500, 2000, 2500, 3000]

export function PumpWellSizing() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'pump-station' ? state.productData.data : null

  if (!data) return null

  const adoptable = data.adoptable ?? null
  const maxDepth = adoptable === null ? getMaxDepth(false) : getMaxDepth(adoptable)

  const adoptButton = (value: boolean, label: string) => (
    <button
      type="button"
      onClick={() =>
        dispatch({
          type: 'PUMP_SET_ADOPTABLE',
          payload: value,
        } as WizardAction)
      }
      className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
        ${
          adoptable === value
            ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
            : 'border-border bg-white text-muted'
        }
      `}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* Diameter grid */}
      <div className="mb-2 text-xs font-bold text-navy">Wet well diameter</div>
      <div className="mb-5 grid grid-cols-3 gap-2">
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

      {/* Adoption status */}
      <div className="mb-2 text-xs font-bold text-navy">
        Will this pumping station be adopted?
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {adoptButton(true, 'Yes (S104)')}
        {adoptButton(false, 'No (Private)')}
      </div>

      {/* Depth grid */}
      <div className="mb-2 text-xs font-bold text-navy">Depth to pipe soffit</div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {depths.map((d) => {
          const label = `${(d / 1000).toFixed(1)}`
          return (
            <SizeCard
              key={d}
              value={label}
              unit="m"
              selected={data.depth === d}
              disabled={d > maxDepth}
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

      {adoptable === true && (
        <AlertBox
          type="info"
          title="Adoptable depth limit"
          body={`Adoptable RHINOLIFT installations are limited to ${getMaxDepth(true)}mm to pipe soffit.`}
        />
      )}
    </>
  )
}
