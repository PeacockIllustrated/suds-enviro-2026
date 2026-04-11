'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useWizardContext } from '../WizardContext'
import {
  generateProductCode,
  generateCompliance,
  clockToDegrees,
} from '@/lib/rule-engine'

export function Review() {
  const { state, goToStep } = useWizardContext()
  const compliance = generateCompliance(state)
  const productCode = generateProductCode(state)

  return (
    <>
      {/* Product code badge */}
      <div className="mb-4 inline-block rounded-full bg-green px-3 py-1 text-[11px] font-bold text-white">
        {productCode}
      </div>

      {/* Chamber block */}
      <ReviewBlock title="Chamber" onEdit={() => goToStep(2)}>
        <ReviewRow label="Product" value="Inspection Chamber" />
        <ReviewRow
          label="System"
          value={
            state.systemType === 'surface'
              ? 'Surface Water'
              : state.systemType === 'foul'
                ? 'Foul'
                : 'Combined'
          }
        />
        <ReviewRow label="Diameter" value={`${state.diameter}mm`} />
        <ReviewRow label="Depth" value={`${state.depth}mm`} />
        <ReviewRow
          label="Adoption"
          value={state.adoptable ? 'Adoptable (S104)' : 'Private'}
        />
      </ReviewBlock>

      {/* Pipework block */}
      <ReviewBlock title="Pipework" onEdit={() => goToStep(5)}>
        {Array.from({ length: state.inletCount ?? 0 }, (_, i) => {
          const slot = `inlet${i + 1}`
          const pos = state.positions[i]
          const size = state.pipeSizes[slot] ?? '--'
          const angle = pos ? `${clockToDegrees(parseInt(pos))}deg` : '--'
          return (
            <ReviewRow
              key={slot}
              label={`Inlet ${i + 1} (${pos ? pos + " o'clock" : '--'})`}
              value={`${size}`}
            />
          )
        })}
        <ReviewRow
          label="Outlet (6 o'clock)"
          value={state.outletLocked ?? 'Auto'}
          highlight={!!state.outletLocked}
        />
      </ReviewBlock>

      {/* Flow control block */}
      {state.flowControl && (
        <ReviewBlock title="Flow Control" onEdit={() => goToStep(6)}>
          <ReviewRow label="Type" value={state.flowType ?? '--'} />
          <ReviewRow
            label="Target rate"
            value={state.flowRate ? `${state.flowRate} L/s` : '--'}
          />
        </ReviewBlock>
      )}

      {/* Compliance table */}
      <div className="mt-2 mb-2 rounded-[10px] border border-border bg-white shadow-[0_2px_12px_rgba(0,77,112,0.10)] overflow-hidden">
        <div className="border-b border-border bg-light px-3.5 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Compliance Check
          </span>
        </div>
        {compliance.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 border-b border-black/4 px-3.5 py-2.5 text-xs last:border-b-0"
          >
            <div
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full
                ${c.status === 'Pass' ? 'bg-green' : c.status === 'Warning' ? 'bg-[#e0a02a]' : 'bg-[#c03030]'}
              `}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="flex-1 text-muted">{c.standard}</span>
            <span
              className={`text-[11px] font-bold
                ${c.status === 'Pass' ? 'text-green-d' : c.status === 'Warning' ? 'text-[#a06000]' : 'text-[#c03030]'}
              `}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

// ── SUB-COMPONENTS ───────────────────────────────────────────

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-2.5 overflow-hidden rounded-[10px] border border-border bg-white shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
      <div className="flex items-center justify-between border-b border-border bg-light px-3.5 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
          {title}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-bold text-blue"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function ReviewRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/4 px-3.5 py-2.5 text-xs last:border-b-0">
      <span className="text-muted">{label}</span>
      <span
        className={`font-bold ${highlight ? 'text-green-d' : 'text-ink'}`}
      >
        {value}
      </span>
    </div>
  )
}
