'use client'

import { useWizardContext } from '../WizardContext'
import { getBlockedPositions } from '@/lib/rule-engine'
import {
  getDiameterValue,
  getInletCountValue,
  getPositionsValue,
  getOutletLockedValue,
  getTogglePositionActionType,
} from './helpers'
import type { ClockPosition, WizardAction } from '@/lib/types'

// Inlets are physically manufactured at five clock positions only.
// Outlet is fixed at 12 o'clock.
const INLET_POSITIONS: ClockPosition[] = ['3', '5', '6', '7', '9']
const OUTLET_HOUR = 12

const CLOCK_SIZE = 230
const CENTER = CLOCK_SIZE / 2
const RING_RADIUS = 80
const NODE_SIZE = 38

function getNodePosition(hour: number): { left: string; top: string } {
  const angleRad = ((hour / 12) * 360) * (Math.PI / 180)
  const x = CENTER + RING_RADIUS * Math.sin(angleRad)
  const y = CENTER - RING_RADIUS * Math.cos(angleRad)
  return {
    left: `${x}px`,
    top: `${y}px`,
  }
}

export function ClockFace() {
  const { state, dispatch } = useWizardContext()
  const diameter = getDiameterValue(state)
  const inletCount = getInletCountValue(state) ?? 0
  const positions = getPositionsValue(state)
  const outletLocked = getOutletLockedValue(state)
  const toggleAction = getTogglePositionActionType(state.product)
  const placed = positions.length
  const blocked = getBlockedPositions(outletLocked)

  return (
    <>
      <p className="mb-4 -mt-4 text-xs font-normal leading-relaxed text-muted">
        Tap up to {Math.min(inletCount, INLET_POSITIONS.length)} inlet position{inletCount === 1 ? '' : 's'} on the clock face. The outlet is fixed at 12 o&apos;clock.
      </p>

      <div className="flex flex-col items-center">
        {/* Counter badge */}
        <div className="mb-3 flex items-center gap-1.5 rounded-full border border-border bg-light px-3.5 py-1.5 text-xs font-bold text-navy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {placed} of {inletCount} inlets placed
        </div>

        {/* Clock face */}
        <div
          className="relative mb-3.5 rounded-full border-2 border-border bg-white shadow-[0_4px_20px_rgba(0,77,112,0.12)]"
          style={{
            width: CLOCK_SIZE,
            height: CLOCK_SIZE,
            boxShadow: `0 4px 20px rgba(0,77,112,0.12), inset 0 0 0 6px var(--color-light)`,
          }}
        >
          {/* Dashed inner ring */}
          <div
            className="absolute rounded-full border border-dashed border-navy/12"
            style={{ inset: 16 }}
          />

          {/* Centre hub */}
          <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-navy shadow-[0_2px_8px_rgba(0,77,112,0.3)]">
            <span className="text-center text-[8px] font-extrabold leading-tight tracking-tight text-white">
              {diameter ?? '---'}
              <br />
              mm
            </span>
          </div>

          {/* Inlet position nodes (5 only) */}
          {INLET_POSITIONS.map((pos) => {
            const hour = parseInt(pos)
            const { left, top } = getNodePosition(hour)
            const isInlet = positions.includes(pos)
            const isBlocked = blocked.includes(pos)

            return (
              <button
                key={pos}
                type="button"
                onClick={() =>
                  dispatch({
                    type: toggleAction,
                    payload: pos,
                  } as WizardAction)
                }
                disabled={isBlocked || (!isInlet && placed >= inletCount)}
                className={`absolute flex items-center justify-center rounded-full text-[11px] font-bold transition-all
                  ${isInlet
                    ? 'border-navy bg-navy text-white shadow-[0_2px_8px_rgba(0,77,112,0.35)]'
                    : isBlocked
                      ? 'border-border bg-light text-black/15 pointer-events-none shadow-none'
                      : 'border-[1.5px] border-border bg-white text-muted shadow-[0_1px_4px_rgba(0,77,112,0.1)]'
                  }
                  ${!isBlocked && !isInlet && placed >= inletCount ? 'opacity-50' : ''}
                `}
                style={{
                  left,
                  top,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {pos}
              </button>
            )
          })}

          {/* Outlet node fixed at 12 o'clock */}
          {(() => {
            const { left, top } = getNodePosition(OUTLET_HOUR)
            return (
              <div
                className="absolute flex items-center justify-center rounded-full border-green-d bg-green text-[8px] font-bold text-white shadow-[0_2px_8px_rgba(68,175,67,0.35)]"
                style={{
                  left,
                  top,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                OUT
              </div>
            )
          })()}
        </div>

        {/* Key */}
        <div className="flex flex-wrap justify-center gap-3.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <div className="h-3 w-3 rounded-full border-[1.5px] border-border" />
            Available
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <div className="h-3 w-3 rounded-full border-navy bg-navy" />
            Inlet
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <div className="h-3 w-3 rounded-full border-green-d bg-green" />
            Outlet (12)
          </div>
        </div>
      </div>
    </>
  )
}
