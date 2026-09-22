'use client'

import { useWizardContext } from '../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import { AlertBox } from '@/components/ui/AlertBox'
import { getSystemTypeValue, getSystemActionType } from './helpers'
import { CATCHPIT_SYSTEM_TYPES } from '@/lib/rules/catchpit'
import { FLOW_CONTROL_SYSTEM_TYPES } from '@/lib/rules/flow-control'
import type { ProductId, SystemType as SystemTypeVal, WizardAction } from '@/lib/types'

// Catchpits (SERS / SERDS) and flow controls (SERF / ROTEX) are
// stormwater products on their data sheets; the rest take any system.
function allowedSystems(product: ProductId | null): SystemTypeVal[] | null {
  if (product === 'catchpit') return CATCHPIT_SYSTEM_TYPES
  if (product === 'flow-control') return FLOW_CONTROL_SYSTEM_TYPES
  return null
}

const systems: {
  id: SystemTypeVal
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'surface',
    title: 'Surface Water',
    subtitle: 'Rainwater and surface runoff drainage',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="#1a82a2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="#1a82a2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="#1a82a2" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'foul',
    title: 'Foul Drainage',
    subtitle: 'Domestic and commercial waste drainage',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="8" width="18" height="8" rx="4" stroke="#5a7a90" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="#5a7a90" />
      </svg>
    ),
  },
  {
    id: 'combined',
    title: 'Combined',
    subtitle: 'Surface water and foul in a single system',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v4M12 7l-5 5H3M12 7l5 5h4M7 12v6M17 12v6" stroke="#5a7a90" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function SystemType() {
  const { state, dispatch } = useWizardContext()
  const systemType = getSystemTypeValue(state)
  const actionType = getSystemActionType(state.product)
  const allowed = allowedSystems(state.product)

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        {systems.map((s) => (
          <OptionCard
            key={s.id}
            icon={s.icon}
            title={s.title}
            subtitle={s.subtitle}
            selected={systemType === s.id}
            disabled={allowed !== null && !allowed.includes(s.id)}
            onClick={() =>
              dispatch({
                type: actionType,
                payload: s.id,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {allowed !== null && (
        <AlertBox
          type="info"
          title="Surface water product"
          body={state.product === 'catchpit'
            ? 'SERS and SERDS catchpits capture silt from surface water runoff, so they are specified for surface water systems only.'
            : 'SERF and ROTEX flow controls regulate stormwater discharge, so they are specified for surface water systems only.'}
        />
      )}

      {allowed === null && (systemType === 'foul' || systemType === 'combined') && (
        <div className="rounded-lg border border-dashed border-blue/25 bg-blue/6 p-3 text-[11px] leading-relaxed text-muted">
          <strong className="text-blue">Branch note:</strong> Foul and combined
          systems follow the same configurator path. Compliance
          standards are adjusted automatically based on your selection.
        </div>
      )}
    </>
  )
}
