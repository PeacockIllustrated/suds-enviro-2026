'use client'

import { useWizardContext } from '../WizardContext'
import { getBlockedPositions } from '@/lib/rule-engine'
import {
  getDiameterValue,
  getInletCountValue,
  getPositionsValue,
  getOutletLockedValue,
  getOutletPositionValue,
  getTogglePositionActionType,
  getOutletPositionActionType,
} from './helpers'
import type { ClockPosition, OutletPosition, WizardAction } from '@/lib/types'

// All 12 clock hours - the outlet hour is excluded dynamically based on
// the user's outlet position selection.
const ALL_HOURS: ClockPosition[] = [
  '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
]

// Outlet is offered at five manufactured positions only.
const OUTLET_OPTIONS: OutletPosition[] = ['3', '5', '6', '7', '9']

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
  const outletPosition = getOutletPositionValue(state)
  const toggleAction = getTogglePositionActionType(state.product)
  const outletAction = getOutletPositionActionType(state.product)
  const placed = positions.length
  const blocked = getBlockedPositions(outletLocked, outletPosition)

  return (
    <>
      <p className="mb-4 -mt-4 text-xs font-normal leading-relaxed text-muted">
        Choose where the outlet exits, then place each inlet on the clock face.
      </p>

      {/* Outlet position selector */}
      <div className="mb-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
          Outlet position
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {OUTLET_OPTIONS.map((opt) => {
            const selected = outletPosition === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  dispatch({
                    type: outletAction,
                    payload: opt,
                  } as WizardAction)
                }
                className={`rounded-lg border-[1.5px] py-2 text-center text-xs font-bold transition-all
                  ${selected
                    ? 'border-green border-2 bg-green/10 text-green-d shadow-[0_2px_8px_rgba(68,175,67,0.2)]'
                    : 'border-border bg-white text-muted hover:border-green/40'
                  }
                `}
              >
                {opt} o&apos;clock
              </button>
            )
          })}
        </div>
      </div>

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

          {/* Position nodes - render all 12 except the outlet hour */}
          {ALL_HOURS.filter((h) => h !== outletPosition).map((pos) => {
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

          {/* Outlet node at the chosen position */}
          {(() => {
            const { left, top } = getNodePosition(parseInt(outletPosition))
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
            Outlet
          </div>
          {blocked.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <div className="h-3 w-3 rounded-full border-border bg-light" />
              Blocked
            </div>
          )}
        </div>
      </div>
    </>
  )
}
