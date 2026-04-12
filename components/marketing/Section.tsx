import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  dark?: boolean
  className?: string
  id?: string
}

export function Section({ children, dark, className, id }: SectionProps) {
  return (
    <section
      className={`py-20 ${dark ? 'bg-navy text-white' : 'bg-white'} ${className ?? ''}`}
      id={id}
    >
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </section>
  )
}
