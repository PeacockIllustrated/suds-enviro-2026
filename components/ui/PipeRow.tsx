'use client'

import { Lock, ChevronDown } from 'lucide-react'
import type { PipeSize } from '@/lib/types'

interface PipeRowProps {
  label: string
  sublabel: string
  size: PipeSize
  locked?: boolean
  onTap?: () => void
}

export function PipeRow({
  label,
  sublabel,
  size,
  locked = false,
  onTap,
}: PipeRowProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-[10px] border px-3.5 py-3 shadow-[0_2px_12px_rgba(0,77,112,0.10)]
        ${locked ? 'border-border bg-light' : 'border-border bg-white'}
      `}
    >
      <div>
        <div className="text-[13px] font-bold text-ink">{label}</div>
        <div className="mt-0.5 text-[10px] text-muted">{sublabel}</div>
      </div>
      <button
        type="button"
        onClick={locked ? undefined : onTap}
        disabled={locked}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors
          ${
            locked
              ? 'cursor-default border-green/25 bg-green/8 text-green-d'
              : 'cursor-pointer border-border bg-light text-navy'
          }
        `}
      >
        {locked && <Lock className="h-3 w-3" />}
        {size}
        {!locked && <ChevronDown className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
