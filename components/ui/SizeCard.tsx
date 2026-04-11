'use client'

interface SizeCardProps {
  value: string
  unit: string
  selected: boolean
  disabled?: boolean
  onClick: () => void
}

export function SizeCard({
  value,
  unit,
  selected,
  disabled = false,
  onClick,
}: SizeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-[10px] border-[1.5px] px-2.5 py-3.5 text-center
        transition-all duration-150 active:scale-[0.96]
        ${
          selected
            ? 'border-navy border-2 bg-[#f0f7fb] shadow-[0_0_0_3px_rgba(0,77,112,0.08)]'
            : 'border-border bg-white shadow-[0_2px_12px_rgba(0,77,112,0.10)]'
        }
        ${disabled ? 'pointer-events-none opacity-35 bg-light' : 'cursor-pointer'}
      `}
    >
      <span
        className={`block text-[26px] font-extrabold leading-none tracking-tight ${
          selected ? 'text-navy' : 'text-ink'
        }`}
      >
        {value}
      </span>
      <span
        className={`mt-1 block text-[11px] font-medium ${
          selected ? 'text-blue' : 'text-muted'
        }`}
      >
        {unit}
      </span>
    </button>
  )
}
