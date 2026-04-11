'use client'

import { useWizardContext } from '../../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import type { RhinoClass, WizardAction } from '@/lib/types'
import { ShieldCheck, Shield } from 'lucide-react'

const classOptions: {
  id: RhinoClass
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 1,
    title: 'Class 1',
    subtitle: 'Discharge concentration of less than 5 mg/l',
    icon: <ShieldCheck className="h-[22px] w-[22px] text-green" />,
  },
  {
    id: 2,
    title: 'Class 2',
    subtitle: 'Discharge concentration of less than 100 mg/l',
    icon: <Shield className="h-[22px] w-[22px] text-blue" />,
  },
]

export function ClassSelect() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'rhinoceptor' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      <div className="mb-5 flex flex-col gap-2">
        {classOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={data.rhinoClass === opt.id}
            onClick={() =>
              dispatch({
                type: 'RHINO_SET_CLASS',
                payload: opt.id,
              } as WizardAction)
            }
          />
        ))}
      </div>

      {/* Flow rate input */}
      <div className="rounded-[10px] border border-border bg-white p-3.5 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
          Flow rate
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={data.flowRateLs}
            onChange={(e) =>
              dispatch({
                type: 'RHINO_SET_FLOW_RATE',
                payload: e.target.value,
              } as WizardAction)
            }
            placeholder="e.g. 2.5"
            min={0}
            step="0.1"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
          />
          <span className="shrink-0 text-xs font-bold text-muted">L/s</span>
        </div>
      </div>
    </>
  )
}
