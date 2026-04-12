import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  dark?: boolean
  light?: boolean
  className?: string
  id?: string
  narrow?: boolean
}

export function Section({ children, dark, light, className, id, narrow }: SectionProps) {
  let bg = 'bg-white'
  if (dark) bg = 'bg-navy text-white'
  else if (light) bg = 'bg-[#f8fafb]'

  const maxWidth = narrow ? 'max-w-4xl' : 'max-w-7xl'

  return (
    <section
      className={`py-24 md:py-32 ${bg} ${className ?? ''}`}
      id={id}
    >
      <div className={`mx-auto ${maxWidth} px-6`}>{children}</div>
    </section>
  )
}
