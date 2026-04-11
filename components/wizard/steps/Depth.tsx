'use client'

import { useWizardContext } from '../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getMaxDepth } from '@/lib/rule-engine'
import type { DepthMm } from '@/lib/types'

const depths: DepthMm[] = [1000, 1500, 2000, 2500, 3000]

export function Depth() {
  const { state, dispatch } = useWizardContext()
  const maxDepth =
    state.adoptable !== null ? getMaxDepth(state.adoptable) : 3000

  return (
    <>
      {/* Adoptable toggle */}
      <div className="mb-2 text-xs font-bold text-navy">
        Will this chamber be adopted?
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'SET_ADOPTABLE', payload: true })
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              state.adoptable === true
                ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                : 'border-border bg-white text-muted'
            }
          `}
        >
          Yes (S104)
        </button>
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'SET_ADOPTABLE', payload: false })
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              state.adoptable === false
                ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                : 'border-border bg-white text-muted'
            }
          `}
        >
          No (Private)
        </button>
      </div>

      {/* Depth selection */}
      <div className="mb-2 text-xs font-bold text-navy">Chamber depth</div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {depths.map((d) => {
          const label = `${(d / 1000).toFixed(1)}`
          return (
            <SizeCard
              key={d}
              value={label}
              unit="m"
              selected={state.depth === d}
              disabled={d > maxDepth}
              onClick={() =>
                dispatch({ type: 'SET_DEPTH', payload: d })
              }
            />
          )
        })}
      </div>

      {/* Constraint alert */}
      {state.adoptable === true && (
        <AlertBox
          type="info"
          title="Adoptable depth limit"
          body="Adoptable chambers under DCG / SfA7 are limited to a maximum depth of 2000mm."
        />
      )}

      {/* Valid selection alert */}
      {state.depth !== null && state.adoptable !== null && (
        <AlertBox
          type="ok"
          title="Depth valid"
          body={`${state.depth}mm depth for a${state.adoptable ? 'n adoptable' : ' private'} installation is within specification.`}
        />
      )}
    </>
  )
}
