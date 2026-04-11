'use client'

import { useWizardContext } from '../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import { AlertBox } from '@/components/ui/AlertBox'
import type { FlowType } from '@/lib/types'

export function FlowControl() {
  const { state, dispatch } = useWizardContext()

  return (
    <>
      {/* Yes/No toggle */}
      <div className="mb-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: 'SET_FLOW_CONTROL', payload: true })
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              state.flowControl === true
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
            dispatch({ type: 'SET_FLOW_CONTROL', payload: false })
          }
          className={`rounded-[10px] border-[1.5px] py-3.5 text-center text-sm font-bold transition-all shadow-[0_2px_12px_rgba(0,77,112,0.10)]
            ${
              state.flowControl === false
                ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                : 'border-border bg-white text-muted'
            }
          `}
        >
          No
        </button>
      </div>

      {/* Flow control sub-section */}
      {state.flowControl === true && (
        <div className="rounded-[10px] border border-border bg-white p-3.5 shadow-[0_2px_12px_rgba(0,77,112,0.10)] mb-3.5">
          <div className="mb-3 text-xs font-bold text-navy">
            Flow control type
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <OptionCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#1a82a2" strokeWidth="1.5" />
                  <path d="M12 12c0-3 2-5 4-4s3 4 1 6-5 2-6 0 0-4 2-4" stroke="#1a82a2" strokeWidth="1.5" />
                </svg>
              }
              title="Vortex"
              subtitle="Hydrodynamic vortex flow control"
              selected={state.flowType === 'Vortex'}
              onClick={() =>
                dispatch({ type: 'SET_FLOW_TYPE', payload: 'Vortex' })
              }
            />
            <OptionCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#5a7a90" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="#5a7a90" strokeWidth="1.5" />
                </svg>
              }
              title="Orifice plate"
              subtitle="Fixed orifice flow restriction"
              selected={state.flowType === 'Orifice plate'}
              onClick={() =>
                dispatch({
                  type: 'SET_FLOW_TYPE',
                  payload: 'Orifice plate',
                })
              }
            />
          </div>

          <div className="mb-1">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Target flow rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={state.flowRate}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FLOW_RATE',
                    payload: e.target.value,
                  })
                }
                placeholder="e.g. 5.0"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
              />
              <span className="shrink-0 text-xs font-bold text-muted">
                L/s
              </span>
            </div>
          </div>
        </div>
      )}

      {state.flowControl === false && (
        <AlertBox
          type="ok"
          title="Pass-through configuration"
          body="No flow control device will be included. The chamber will operate as a standard pass-through inspection chamber."
        />
      )}

      <div className="rounded-lg border border-dashed border-blue/25 bg-blue/6 p-3 text-[11px] leading-relaxed text-muted">
        <strong className="text-blue">Branch note:</strong> Flow control
        options are presented inline rather than as a separate wizard path.
        This keeps the configuration focused on a single chamber.
      </div>
    </>
  )
}
