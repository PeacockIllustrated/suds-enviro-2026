'use client'

import { useState } from 'react'
import { useWizardContext } from '../WizardContext'
import { PipeRow } from '@/components/ui/PipeRow'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { AlertBox } from '@/components/ui/AlertBox'
import { getAvailableInletSizes, clockToDegrees } from '@/lib/rule-engine'
import type { PipeSize } from '@/lib/types'

export function PipeSizes() {
  const { state, dispatch } = useWizardContext()
  const [activeSlot, setActiveSlot] = useState<string | null>(null)

  const inletCount = state.inletCount ?? 0
  const available = getAvailableInletSizes(state.diameter, state.outletLocked)

  const handleSelect = (size: PipeSize) => {
    if (activeSlot) {
      dispatch({
        type: 'SET_PIPE_SIZE',
        payload: { slot: activeSlot, size },
      })
      setActiveSlot(null)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 mb-3.5">
        {Array.from({ length: inletCount }, (_, i) => {
          const slot = `inlet${i + 1}`
          const pos = state.positions[i]
          const angle = pos ? `${clockToDegrees(parseInt(pos))}deg` : '--'
          const size = state.pipeSizes[slot] ?? '160mm EN1401'

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

        {/* Outlet row - always locked */}
        <PipeRow
          label="Outlet"
          sublabel="Position 6 o'clock (180deg) - fixed"
          size={state.outletLocked ?? '160mm EN1401'}
          locked={!!state.outletLocked}
          onTap={
            state.outletLocked
              ? undefined
              : () => setActiveSlot('outlet')
          }
        />
      </div>

      <AlertBox
        type="ok"
        title="Pipe sizes valid"
        body="All inlet pipe sizes are within the allowed range for your chamber diameter and outlet configuration."
      />

      {/* Pipe size picker bottom sheet */}
      <BottomSheet
        open={activeSlot !== null}
        title="Select pipe size"
        onClose={() => setActiveSlot(null)}
      >
        {available.map((size) => {
          const isSelected =
            activeSlot && state.pipeSizes[activeSlot] === size
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
