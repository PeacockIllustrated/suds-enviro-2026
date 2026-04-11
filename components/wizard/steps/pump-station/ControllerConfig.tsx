'use client'

import { useWizardContext } from '../../WizardContext'
import { SizeCard } from '@/components/ui/SizeCard'
import { OptionCard } from '@/components/ui/OptionCard'
import type { ControllerType, WizardAction } from '@/lib/types'
import { Hand, Waves, BarChart3, Cpu } from 'lucide-react'

const controllerOptions: {
  id: ControllerType
  title: string
  subtitle: string
  icon: React.ReactNode
}[] = [
  {
    id: 'manual',
    title: 'Manual',
    subtitle: 'Manual start/stop via local control panel',
    icon: <Hand className="h-[22px] w-[22px] text-muted" />,
  },
  {
    id: 'auto-float',
    title: 'Auto Float',
    subtitle: 'Automatic operation via float switch levels',
    icon: <Waves className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'auto-level',
    title: 'Auto Level',
    subtitle: 'Automatic operation via pressure transducer',
    icon: <BarChart3 className="h-[22px] w-[22px] text-blue" />,
  },
  {
    id: 'plc',
    title: 'PLC',
    subtitle: 'Programmable logic controller with SCADA integration',
    icon: <Cpu className="h-[22px] w-[22px] text-navy" />,
  },
]

export function ControllerConfig() {
  const { state, dispatch } = useWizardContext()

  const data =
    state.productData?.kind === 'pump-station' ? state.productData.data : null

  if (!data) return null

  return (
    <>
      {/* Pump count */}
      <div className="mb-2 text-xs font-bold text-navy">Pump count</div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <SizeCard
          value="1"
          unit="pump"
          selected={data.pumpCount === 1}
          onClick={() =>
            dispatch({
              type: 'PUMP_SET_PUMP_COUNT',
              payload: 1,
            } as WizardAction)
          }
        />
        <SizeCard
          value="2"
          unit="pumps"
          selected={data.pumpCount === 2}
          onClick={() =>
            dispatch({
              type: 'PUMP_SET_PUMP_COUNT',
              payload: 2,
            } as WizardAction)
          }
        />
      </div>

      {/* Controller type */}
      <div className="mb-2 text-xs font-bold text-navy">Controller type</div>
      <div className="flex flex-col gap-2">
        {controllerOptions.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={data.controllerType === opt.id}
            onClick={() =>
              dispatch({
                type: 'PUMP_SET_CONTROLLER',
                payload: opt.id,
              } as WizardAction)
            }
          />
        ))}
      </div>
    </>
  )
}
