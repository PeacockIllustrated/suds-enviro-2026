'use client'

interface StatusBadgeProps {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue/15 text-blue border-blue/25',
  reviewed: 'bg-amber-100 text-amber-700 border-amber-200',
  quoted: 'bg-green/15 text-green-d border-green/25',
  closed: 'bg-muted/15 text-muted border-muted/25',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  quoted: 'Quoted',
  closed: 'Closed',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.closed
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${style}`}
    >
      {label}
    </span>
  )
}
