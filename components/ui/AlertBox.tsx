'use client'

import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'

interface AlertBoxProps {
  type: 'warn' | 'ok' | 'info' | 'error'
  title: string
  body: string
  link?: string
  onLinkClick?: () => void
}

const styles = {
  warn: {
    bg: 'bg-[rgba(224,160,42,0.08)]',
    border: 'border-[rgba(224,160,42,0.25)]',
    titleColor: 'text-[#a06000]',
    icon: <AlertTriangle className="h-4 w-4 text-[#a06000]" />,
  },
  ok: {
    bg: 'bg-green/8',
    border: 'border-green/25',
    titleColor: 'text-green-d',
    icon: <CheckCircle className="h-4 w-4 text-green-d" />,
  },
  info: {
    bg: 'bg-blue/8',
    border: 'border-blue/20',
    titleColor: 'text-blue',
    icon: <Info className="h-4 w-4 text-blue" />,
  },
  error: {
    bg: 'bg-[rgba(200,60,60,0.08)]',
    border: 'border-[rgba(200,60,60,0.25)]',
    titleColor: 'text-[#c03030]',
    icon: <AlertCircle className="h-4 w-4 text-[#c03030]" />,
  },
}

export function AlertBox({ type, title, body, link, onLinkClick }: AlertBoxProps) {
  const s = styles[type]

  return (
    <div
      className={`flex gap-2.5 rounded-lg border p-3 ${s.bg} ${s.border} mb-3`}
    >
      <div className="mt-px shrink-0">{s.icon}</div>
      <div className="flex-1">
        <div className={`text-xs font-bold ${s.titleColor}`}>{title}</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
          {body}
        </div>
        {link && (
          <button
            type="button"
            onClick={onLinkClick}
            className="mt-1 block text-[11px] font-bold text-blue"
          >
            {link}
          </button>
        )}
      </div>
    </div>
  )
}
