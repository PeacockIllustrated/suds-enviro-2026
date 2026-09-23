'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import type { SEHDSDiameter as SEHDSDia, WizardAction } from '@/lib/types'

const DIAMETERS: SEHDSDia[] = [750, 1200, 1800, 2500]

export function SEHDSDiameter() {
  const { state, dispatch } = useWizardContext()
  const data = state.productData?.kind === 'rhinoceptor' ? state.productData.data : null
  const selected = data?.sehdsDiameter ?? null

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {DIAMETERS.map((d) => (
          <SizeCard
            key={d}
            value={String(d)}
            unit="mm"
            selected={selected === d}
            onClick={() =>
              dispatch({
                type: 'RHINO_SET_DIAMETER',
                payload: d,
              } as WizardAction)
            }
          />
        ))}
      </div>
      <div className="rounded-[10px] border border-border bg-white p-3.5 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-1.5 text-[11px] font-bold text-navy">
          Single-piece construction
        </div>
        <div className="text-[11px] text-muted">
          GRP to BS 4994:1987 from SEHDS1200; SEHDS750 is HDPE twinwall.
          Treatment flow runs from 32 to 259 L/s by model, so confirm the size
          against the design treatment flow rate.
        </div>
      </div>
    </>
  )
}
