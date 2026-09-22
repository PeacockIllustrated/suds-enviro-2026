'use client'

import { useState } from 'react'
import { useWizardContext } from '../WizardContext'
import { PipeRow } from '@/components/ui/PipeRow'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { AlertBox } from '@/components/ui/AlertBox'
import {
  getAvailableInletSizes,
  getAvailableOutletSizes,
  getEffectiveOutletSize,
  clockToDegrees,
} from '@/lib/rules/chamber'
import {
  getDiameterValue,
  getInletCountValue,
  getPositionsValue,
  getOutletLockedValue,
  getPipeSizesValue,
  getPipeSizeActionType,
} from './helpers'
import type { PipeSize, WizardAction } from '@/lib/types'

export function PipeSizes() {
  const { state, dispatch } = useWizardContext()
  const [activeSlot, setActiveSlot] = useState<string | null>(null)

  const diameter = getDiameterValue(state)
  const inletCount = getInletCountValue(state) ?? 0
  const positions = getPositionsValue(state)
  const outletLocked = getOutletLockedValue(state)
  const pipeSizes = getPipeSizesValue(state)
  const actionType = getPipeSizeActionType(state.product)

  // R6: inlets may not exceed the outlet that has been set (R2 lock or the
  // user's pick). R7: nothing may exceed the diameter maximum.
  const explicitOutlet = pipeSizes.outlet ?? outletLocked
  const inletOptions = getAvailableInletSizes(diameter, explicitOutlet)
  const outletOptions = getAvailableOutletSizes(diameter, outletLocked, pipeSizes)
  const effectiveOutlet = getEffectiveOutletSize({ outletLocked, pipeSizes })

  const options = activeSlot === 'outlet' ? outletOptions : inletOptions

  let allSet = inletCount > 0
  for (let i = 1; i <= inletCount; i++) {
    if (!pipeSizes[`inlet${i}`]) allSet = false
  }

  const handleSelect = (size: PipeSize) => {
    if (activeSlot) {
      dispatch({
        type: actionType,
        payload: { slot: activeSlot, size },
      } as WizardAction)
      setActiveSlot(null)
    }
  }

  // The R2 lock is a minimum, so the outlet stays editable above it
  // unless the lock is already the largest size this diameter allows.
  const outletFixed = outletOptions.length <= 1 && effectiveOutlet !== null

  return (
    <>
      <div className="flex flex-col gap-2 mb-3.5">
        {Array.from({ length: inletCount }, (_, i) => {
          const slot = `inlet${i + 1}`
          const pos = positions[i]
          const angle = pos ? `${clockToDegrees(parseInt(pos))}deg` : '--'
          const size = pipeSizes[slot] ?? 'Select size'

          return (
            <PipeRow
              key={slot}
              label={`Inlet ${i + 1}`}
              sublabel={pos ? `Position ${pos} o'clock (${angle})` : 'No position'}
              size={size}
              onTap={() => setActiveSlot(slot)}
            />
          )
        })}

        {/* Outlet row - fixed at 12 o'clock; size follows R2 / R6 / R7 */}
        <PipeRow
          label="Outlet"
          sublabel={
            outletLocked
              ? `Position 12 o'clock (0deg) - min. ${outletLocked} locked`
              : pipeSizes.outlet
                ? "Position 12 o'clock (0deg)"
                : "Position 12 o'clock (0deg) - matches largest inlet"
          }
          size={effectiveOutlet ?? 'Select size'}
          locked={outletFixed}
          onTap={outletFixed ? undefined : () => setActiveSlot('outlet')}
        />
      </div>

      {allSet ? (
        <AlertBox
          type="ok"
          title="Pipe sizes valid"
          body="All inlet pipe sizes are within the allowed range for your chamber diameter and outlet configuration."
        />
      ) : (
        <AlertBox
          type="info"
          title="Pipe size limits"
          body={`Inlets can be up to ${inletOptions[inletOptions.length - 1]} on this configuration and may not be larger than the outlet.`}
        />
      )}

      {/* Pipe size picker bottom sheet */}
      <BottomSheet
        open={activeSlot !== null}
        title={activeSlot === 'outlet' ? 'Select outlet size' : 'Select pipe size'}
        onClose={() => setActiveSlot(null)}
      >
        {options.map((size) => {
          const isSelected =
            activeSlot !== null &&
            (activeSlot === 'outlet' ? effectiveOutlet : pipeSizes[activeSlot]) === size
          return (
            <button
              key={size}
              type="button"
              onClick={() => handleSelect(size)}
              className={`mb-1.5 flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-[13px] font-semibold transition-all
                ${
                  isSelected
                    ? 'border-navy bg-[#f0f7fb] text-navy'
                    : 'border-border text-ink active:bg-light'
                }
              `}
            >
              {size}
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </BottomSheet>
    </>
  )
}
