'use client'

import { useWizardContext } from '../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getMaxDepth } from '@/lib/rule-engine'
import {
  getDepthValue,
  getAdoptableValue,
  getDepthActionType,
  getAdoptableActionType,
} from './helpers'
import type { DepthMm, WizardAction } from '@/lib/types'

const depths: DepthMm[] = [1000, 1500, 2000, 2500, 3000]

export function Depth() {
  const { state, dispatch } = useWizardContext()
  const depth = getDepthValue(state)
  const adoptable = getAdoptableValue(state)
  const depthAction = getDepthActionType(state.product)
  const adoptableAction = getAdoptableActionType(state.product)
  const maxDepth = adoptable !== null ? getMaxDepth(adoptable) : 3000

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
            dispatch({
              type: adoptableAction,
              payload: true,
            } as WizardAction)
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              adoptable === true
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
            dispatch({
              type: adoptableAction,
              payload: false,
            } as WizardAction)
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              adoptable === false
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
              selected={depth === d}
              disabled={d > maxDepth}
              onClick={() =>
                dispatch({
                  type: depthAction,
                  payload: d,
                } as WizardAction)
              }
            />
          )
        })}
      </div>

      {/* Constraint alert */}
      {adoptable === true && (
        <AlertBox
          type="info"
          title="Adoptable depth limit"
          body="Adoptable chambers under DCG / SfA7 are limited to a maximum depth of 2000mm."
        />
      )}

      {/* Valid selection alert */}
      {depth !== null && adoptable !== null && (
        <AlertBox
          type="ok"
          title="Depth valid"
          body={`${depth}mm depth for a${adoptable ? 'n adoptable' : ' private'} installation is within specification.`}
        />
      )}
    </>
  )
}
