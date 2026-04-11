'use client'

interface CategoryCardProps {
  label: string
  description: string
  count: number
}

export function CategoryCard({ label, description, count }: CategoryCardProps) {
  return (
    <div className="mb-1 mt-4 first:mt-0">
      <div className="flex items-center gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
          {label}
        </h3>
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-navy/10 px-1.5 text-[9px] font-bold text-navy">
          {count}
        </span>
      </div>
      <p className="mt-0.5 mb-2 text-[11px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  )
}
