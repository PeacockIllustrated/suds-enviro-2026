'use client'

import { useWizardContext } from '../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getDiameterValue, getDiameterActionType } from './helpers'
import { getVariantDiameters as getCatchpitVariantDiameters } from '@/lib/rules/catchpit'
import { getVariantDiameters as getFCVariantDiameters } from '@/lib/rules/flow-control'
import type {
  Diameter as DiameterVal,
  WizardAction,
  CatchpitVariant,
  FlowControlVariant,
} from '@/lib/types'


const diameterInfo: Partial<Record<
  DiameterVal,
  { maxInlets: number; maxPipe: string }
>> = {
  300:  { maxInlets: 1, maxPipe: '110mm' },
  450:  { maxInlets: 2, maxPipe: '160mm' },
  600:  { maxInlets: 4, maxPipe: '225mm' },
  750:  { maxInlets: 5, maxPipe: '300mm' },
  900:  { maxInlets: 6, maxPipe: '300mm' },
  1050: { maxInlets: 6, maxPipe: '450mm' },
  1200: { maxInlets: 8, maxPipe: '450mm' },
}

// Default chamber diameters (no SERS-style 300mm)
const chamberDiameters: DiameterVal[] = [450, 600, 750, 900, 1050, 1200]

export function Diameter() {
  const { state, dispatch } = useWizardContext()
  const diameter = getDiameterValue(state)
  const actionType = getDiameterActionType(state.product)

  // Available diameters depend on product (and variant where applicable).
  let diameters: DiameterVal[] = chamberDiameters
  if (state.product === 'catchpit' && state.productData?.kind === 'catchpit') {
    const variant = state.productData.data.variant as CatchpitVariant | null
    diameters = getCatchpitVariantDiameters(variant)
  } else if (state.product === 'flow-control' && state.productData?.kind === 'flow-control') {
    const variant = state.productData.data.variant as FlowControlVariant | null
    diameters = getFCVariantDiameters(variant)
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {diameters.map((d) => (
          <SizeCard
            key={d}
            value={String(d)}
            unit="mm"
            selected={diameter === d}
            onClick={() =>
              dispatch({
                type: actionType,
                payload: d,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* Info box */}
      <div className="mb-3.5 rounded-[10px] border border-border bg-white p-3.5 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-2 text-[11px] font-bold text-navy">
          Diameter reference
        </div>
        {diameters.map((d) => {
          const info = diameterInfo[d]
          if (!info) return null
          return (
            <div key={d} className="mb-1 flex gap-2 text-[11px] text-muted">
              <strong className="text-ink">{d}mm</strong>
              <span>
                max {info.maxInlets} inlets, max {info.maxPipe} pipe
              </span>
            </div>
          )
        })}
      </div>

      <AlertBox
        type="info"
        title="3D Preview available"
        body="Use the green button at the bottom right to preview your chamber in 3D as you build your configuration."
      />
    </>
  )
}
