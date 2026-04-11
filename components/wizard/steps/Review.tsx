'use client'

import { Check } from 'lucide-react'
import { useWizardContext } from '../WizardContext'
import { generateProductCode, generateCompliance } from '@/lib/rule-engine'
import { getProductConfig } from '@/lib/products/registry'

export function Review() {
  const { state, goToStep } = useWizardContext()

  if (!state.product) return null

  const config = getProductConfig(state.product)
  const compliance = generateCompliance(state)
  const productCode = generateProductCode(state)
  const reviewBlocks = config.getReviewBlocks(state)

  return (
    <>
      {/* Product code badge */}
      <div className="mb-4 inline-block rounded-full bg-green px-3 py-1 text-[11px] font-bold text-white">
        {productCode}
      </div>

      {/* Dynamic review blocks from product config */}
      {reviewBlocks.map((block, blockIndex) => {
        const fields = block.fields(state)
        return (
          <ReviewBlock
            key={blockIndex}
            title={block.title}
            onEdit={() => goToStep(block.editStep)}
          >
            {fields.map((field, fieldIndex) => (
              <ReviewRow
                key={fieldIndex}
                label={field.label}
                value={field.value}
                highlight={field.highlight}
              />
            ))}
          </ReviewBlock>
        )
      })}

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
