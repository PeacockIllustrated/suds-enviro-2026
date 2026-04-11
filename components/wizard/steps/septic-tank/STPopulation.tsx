'use client'

import { useWizardContext } from '../../WizardContext'
import type { WizardAction } from '@/lib/types'

export function STPopulation() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'septic-tank' ? state.productData.data : null

  if (!data) return null

  // Calculate hint for daily flow (typical 150 L/person/day)
  const popNum = parseFloat(data.populationEquivalent)
  const autoFlowHint =
    !isNaN(popNum) && popNum > 0 ? `Estimated: ${(popNum * 150).toFixed(0)} L/day` : ''

  return (
    <>
      {/* Population equivalent */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Population equivalent
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.populationEquivalent}
            onChange={(e) =>
              dispatch({
                type: 'ST_SET_POPULATION',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 6"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">
            persons
          </span>
        </div>
      </div>

      {/* Daily flow (optional) */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Daily flow (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.dailyFlowLitres}
            onChange={(e) =>
              dispatch({
                type: 'ST_SET_FLOW',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 900"
            min={0}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">L/day</span>
        </div>
        {autoFlowHint && (
          <div className="mt-1 text-[11px] text-muted">{autoFlowHint}</div>
        )}
      </div>
    </>
  )
}
