'use client'

import { useWizardContext } from '../../WizardContext'
import { AlertBox } from '@/components/ui/AlertBox'
import type { WizardAction } from '@/lib/types'

const PRESET_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

export function SEHDSInletAngle() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const angle = data?.inletAngleDeg ?? null

  const setAngle = (deg: number) =>
    dispatch({
      type: 'RHINO_SET_INLET_ANGLE',
      payload: deg,
    } as WizardAction)

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Custom angle (degrees from north, clockwise)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={359}
            step={1}
            value={angle ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? null : parseInt(e.target.value, 10)
              if (v === null) return
              if (!isNaN(v)) setAngle(v)
            }}
            placeholder="0 - 359"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-3 text-[14px] font-bold text-ink outline-none transition-colors focus:border-navy"
          />
          <span className="text-[14px] font-bold text-muted">&deg;</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
          Common presets
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_ANGLES.map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => setAngle(deg)}
              className={`rounded-lg border-[1.5px] py-2 text-center text-xs font-bold transition-all
                ${angle === deg
                  ? 'border-navy border-2 bg-[#f0f7fb] text-navy'
                  : 'border-border bg-white text-muted hover:border-navy/40'
                }
              `}
            >
              {deg}&deg;
            </button>
          ))}
        </div>
      </div>

      <AlertBox
        type="info"
        title="360-degree inlet positioning"
        body="The SEHDS separator supports any inlet angle. Use the design pipe alignment from the upstream catchment to set the inlet position."
      />
    </>
  )
}
