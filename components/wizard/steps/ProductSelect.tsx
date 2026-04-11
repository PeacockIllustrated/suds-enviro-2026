'use client'

import { useWizardContext } from '../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { Product } from '@/lib/types'

const products: {
  id: Product
  title: string
  subtitle: string
  icon: React.ReactNode
  enabled: boolean
}[] = [
  {
    id: 'chamber',
    title: 'Inspection Chamber',
    subtitle: 'HDPE rotationally moulded drainage chamber',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="7" rx="7" ry="3" stroke="#004d70" strokeWidth="1.5" />
        <path d="M5 7v10c0 1.66 3.13 3 7 3s7-1.34 7-3V7" stroke="#004d70" strokeWidth="1.5" />
      </svg>
    ),
    enabled: true,
  },
  {
    id: 'catchpit',
    title: 'Catchpit / Silt Trap',
    subtitle: 'Silt management for surface water systems',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="#004d70" strokeWidth="1.5" />
        <path d="M12 3v5M9 5l3-2 3 2" stroke="#004d70" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    enabled: false,
  },
  {
    id: 'flow-control',
    title: 'Flow Control',
    subtitle: 'Vortex and orifice flow control devices',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#1a82a2" strokeWidth="1.5" />
        <path d="M12 12c0-3 2-5 4-4s3 4 1 6-5 2-6 0 0-4 2-4" stroke="#1a82a2" strokeWidth="1.5" />
      </svg>
    ),
    enabled: false,
  },
  {
    id: 'rhino',
    title: 'RhinoCeptor',
    subtitle: 'Oil and fuel separator system',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 4C9 4 7 6.5 7 9c0 1.5.6 2.8 1.5 3.7L7 18h10l-1.5-5.3C16.4 11.8 17 10.5 17 9c0-2.5-2-5-5-5z" stroke="#004d70" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 9l-2.5-2M17 9l2.5-2" stroke="#004d70" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    enabled: false,
  },
  {
    id: 'pump',
    title: 'Pump Station',
    subtitle: 'Packaged pumping stations',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="6" stroke="#5a7a90" strokeWidth="1.5" />
        <path d="M12 8v4l3 2" stroke="#5a7a90" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 12H3M18 12h3M12 6V3M12 18v3" stroke="#5a7a90" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    enabled: false,
  },
]

export function ProductSelect() {
  const { state, dispatch } = useWizardContext()

  return (
    <div className="flex flex-col gap-2">
      {products.map((p) => (
        <OptionCard
          key={p.id}
          icon={p.icon}
          title={p.title}
          subtitle={p.subtitle}
          selected={state.product === p.id}
          disabled={!p.enabled}
          badge={p.enabled ? undefined : 'Coming soon'}
          onClick={() => dispatch({ type: 'SET_PRODUCT', payload: p.id })}
        />
      ))}
    </div>
  )
}
