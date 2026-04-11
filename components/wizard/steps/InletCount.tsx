'use client'

import { useWizardContext } from '../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getMaxInlets } from '@/lib/rule-engine'
import {
  getDiameterValue,
  getInletCountValue,
  getOutletLockedValue,
  getInletCountActionType,
} from './helpers'
import type { WizardAction } from '@/lib/types'

export function InletCount() {
  const { state, dispatch } = useWizardContext()
  const diameter = getDiameterValue(state)
  const inletCount = getInletCountValue(state)
  const outletLocked = getOutletLockedValue(state)
  const actionType = getInletCountActionType(state.product)
  const maxInlets = diameter ? getMaxInlets(diameter) : 0

  const subheading = diameter
    ? `${diameter}mm supports max ${maxInlets} inlets`
    : 'How many inlet connections does this unit need?'

  return (
    <>
      {subheading && (
        <p className="mb-5 -mt-4 text-xs font-normal leading-relaxed text-muted">
          {subheading}
        </p>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <SizeCard
            key={n}
            value={String(n)}
            unit={n === 1 ? 'inlet' : 'inlets'}
            selected={inletCount === n}
            disabled={n > maxInlets}
            onClick={() =>
              dispatch({
                type: actionType,
                payload: n,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* R2 warning when outlet is locked */}
      {inletCount !== null && outletLocked && (
        <AlertBox
          type="warn"
          title="Outlet size locked"
          body={`With ${inletCount} inlets on a ${diameter}mm chamber, the outlet must be minimum ${outletLocked}. This is set automatically.`}
        />
      )}

      {/* Info when selection is valid and no outlet lock */}
      {inletCount !== null && !outletLocked && (
        <AlertBox
          type="ok"
          title="Within adoptable spec"
          body={`${inletCount} inlet${inletCount > 1 ? 's' : ''} on a ${diameter}mm chamber is within standard specification.`}
        />
      )}

      {/* Hint about outlet lock for eligible counts */}
      {inletCount === null && diameter && (
        <div className="rounded-lg border border-dashed border-blue/25 bg-blue/6 p-3 text-[11px] leading-relaxed text-muted">
          <strong className="text-blue">Note:</strong> Selecting{' '}
          {diameter === 600 ? '3 or more' : '4 or more'} inlets will
          automatically lock the outlet to a minimum of 225mm Twinwall.
        </div>
      )}
    </>
  )
}
