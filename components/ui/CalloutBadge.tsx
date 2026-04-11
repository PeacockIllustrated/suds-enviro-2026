'use client'

import { Lock } from 'lucide-react'

interface CalloutBadgeProps {
  dia: number
  std: string
  color: 'inlet' | 'outlet'
  locked?: boolean
}

export function CalloutBadge({
  dia,
  std,
  color,
  locked = false,
}: CalloutBadgeProps) {
  const bg = color === 'inlet' ? 'bg-blue' : 'bg-green-d'
  const border = color === 'inlet' ? 'border-[#005f8c]' : 'border-[#227a22]'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${bg} ${border} px-2 py-1`}
    >
      <span className="text-[11px] font-extrabold text-white">
        {dia}
      </span>
      <span className="text-[8px] font-medium text-white/90">{std}</span>
      {locked && <Lock className="h-2.5 w-2.5 text-white/80" />}
    </span>
  )
}
