'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import type { WizardAction } from '@/lib/types'

const connectionSizes: ('100mm' | '60mm')[] = ['100mm', '60mm']

export function GTConnections() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'grease-trap' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Inlet connection */}
      <div className="mb-2 text-xs font-bold text-navy">Inlet connection</div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {connectionSizes.map((size) => (
          <SizeCard
            key={`inlet-${size}`}
            value={size.replace('mm', '')}
            unit="mm"
            selected={data.connectionInlet === size}
            onClick={() =>
              dispatch({
                type: 'GT_SET_INLET',
                payload: size,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* Outlet connection */}
      <div className="mb-2 text-xs font-bold text-navy">Outlet connection</div>
      <div className="grid grid-cols-2 gap-2">
        {connectionSizes.map((size) => (
          <SizeCard
            key={`outlet-${size}`}
            value={size.replace('mm', '')}
            unit="mm"
            selected={data.connectionOutlet === size}
            onClick={() =>
              dispatch({
                type: 'GT_SET_OUTLET',
                payload: size,
              } as WizardAction)
            }
          />
        ))}
      </div>
    </>
  )
}
