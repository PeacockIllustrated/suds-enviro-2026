'use client'

import { useWizardContext } from '../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import type { Diameter as DiameterVal } from '@/lib/types'

const diameters: DiameterVal[] = [450, 600, 750, 1050]

const diameterInfo: Record<
  DiameterVal,
  { maxInlets: number; maxPipe: string }
> = {
  450: { maxInlets: 2, maxPipe: '160mm' },
  600: { maxInlets: 4, maxPipe: '225mm' },
  750: { maxInlets: 5, maxPipe: '300mm' },
  1050: { maxInlets: 6, maxPipe: '450mm' },
}

export function Diameter() {
  const { state, dispatch } = useWizardContext()

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {diameters.map((d) => (
          <SizeCard
            key={d}
            value={String(d)}
            unit="mm"
            selected={state.diameter === d}
            onClick={() =>
              dispatch({ type: 'SET_DIAMETER', payload: d })
            }
          />
        ))}
      </div>

      {/* Info box */}
      <div className="mb-3.5 rounded-[10px] border border-border bg-white p-3.5 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-2 text-[11px] font-bold text-navy">
          Diameter reference
        </div>
        {diameters.map((d) => (
          <div key={d} className="mb-1 flex gap-2 text-[11px] text-muted">
            <strong className="text-ink">{d}mm</strong>
            <span>
              max {diameterInfo[d].maxInlets} inlets, max {diameterInfo[d].maxPipe} pipe
            </span>
          </div>
        ))}
      </div>

      <AlertBox
        type="info"
        title="3D Preview available"
        body="Use the green button at the bottom right to preview your chamber in 3D as you build your configuration."
      />
    </>
  )
}
