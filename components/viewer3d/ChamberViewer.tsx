'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { X } from 'lucide-react'
import { ChamberModel } from './ChamberModel'
import { useWizardContext } from '@/components/wizard/WizardContext'

interface ChamberViewerProps {
  open: boolean
  onClose: () => void
}

export function ChamberViewer({ open, onClose }: ChamberViewerProps) {
  const { state } = useWizardContext()

  const chips: { label: string; variant?: 'green' | 'blue' }[] = []

  if (state.diameter) {
    chips.push({ label: `${state.diameter}mm` })
  }
  if (state.inletCount) {
    chips.push({ label: `${state.inletCount} inlet${state.inletCount > 1 ? 's' : ''}`, variant: 'blue' })
  }
  if (state.outletLocked) {
    chips.push({ label: `Outlet: ${state.outletLocked}`, variant: 'green' })
  }
  if (state.depth) {
    chips.push({ label: `${state.depth}mm deep` })
  }
  if (state.adoptable !== null) {
    chips.push({ label: state.adoptable ? 'Adoptable' : 'Private', variant: 'green' })
  }

  return (
    <div
      className={`absolute inset-0 z-[300] flex flex-col bg-navy-d transition-transform duration-350
        ${open ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between bg-gradient-to-br from-navy to-[#005f8c] px-[18px] py-3.5">
        <div className="flex flex-col gap-px">
          <strong className="text-sm font-extrabold text-white">
            3D Chamber Preview
          </strong>
          <span className="text-[10px] font-medium text-white/50">
            Live - updates with your selections
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <Canvas
          camera={{ position: [12, 8, 12], fov: 45 }}
          style={{ background: '#071828' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 10]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          <ChamberModel />
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.5}
            enablePan={false}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1.5 text-[10px] font-semibold text-white/35 whitespace-nowrap">
          Drag to rotate
        </div>
      </div>

      {/* Spec chips */}
      <div className="shrink-0 border-t border-white/6 bg-black/25 px-[18px] py-3">
        <div className="flex flex-wrap gap-1.5">
          {chips.length === 0 ? (
            <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/70">
              Select options to see your chamber
            </span>
          ) : (
            chips.map((chip, i) => (
              <span
                key={i}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold
                  ${
                    chip.variant === 'green'
                      ? 'border-green/30 bg-green/15 text-green/90'
                      : chip.variant === 'blue'
                        ? 'border-blue/35 bg-blue/20 text-[rgba(100,180,210,0.9)]'
                        : 'border-white/12 bg-white/8 text-white/70'
                  }
                `}
              >
                {chip.label}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
