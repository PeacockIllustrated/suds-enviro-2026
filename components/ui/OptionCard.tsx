'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface OptionCardProps {
  icon: ReactNode
  title: string
  subtitle: string
  selected: boolean
  disabled?: boolean
  badge?: string
  onClick: () => void
}

export function OptionCard({
  icon,
  title,
  subtitle,
  selected,
  disabled = false,
  badge,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-full items-center gap-3.5 rounded-[10px] border-[1.5px] p-3.5
        text-left transition-all duration-150 active:scale-[0.98]
        ${
          selected
            ? 'border-navy border-2 bg-[#f0f7fb] shadow-[0_0_0_3px_rgba(0,77,112,0.08),0_2px_12px_rgba(0,77,112,0.10)]'
            : 'border-border bg-white shadow-[0_2px_12px_rgba(0,77,112,0.10)]'
        }
        ${disabled ? 'pointer-events-none opacity-40 bg-light' : 'cursor-pointer'}
      `}
    >
      <div
        className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] transition-colors duration-150
          ${selected ? 'bg-navy/8' : 'bg-light'}
        `}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-bold ${selected ? 'text-navy' : 'text-ink'}`}
        >
          {title}
        </div>
        <div className="mt-0.5 text-[11px] text-muted">{subtitle}</div>
        {badge && (
          <span className="mt-1 inline-block rounded-full bg-border/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
            {badge}
          </span>
        )}
      </div>
      <div
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-150
          ${
            selected
              ? 'border-navy bg-navy'
              : 'border-border bg-white'
          }
        `}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={2.5} />}
      </div>
    </button>
  )
}
