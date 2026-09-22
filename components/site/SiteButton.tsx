'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * The `.button1` pill from the Webflow site: blue fill, lighter blue
 * outline, white bold italic uppercase label, wide letter spacing.
 */

export type SiteButtonVariant =
  /** Filled blue. The default call to action. */
  | 'primary'
  /** Transparent with a green outline, used for the nav's second action. */
  | 'outline'
  /** Small, with a trailing chevron. Used inside product cards. */
  | 'card'

interface SiteButtonProps {
  href: string
  children: React.ReactNode
  variant?: SiteButtonVariant
  className?: string
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold italic uppercase tracking-wider transition-colors duration-200'

const VARIANTS: Record<SiteButtonVariant, string> = {
  primary:
    'border-[3px] border-site-blue-light bg-site-blue text-white px-7 py-2.5 text-sm shadow-md hover:bg-site-blue-dark',
  outline:
    'border-[3px] border-site-green bg-transparent text-site-green px-7 py-2.5 text-sm hover:bg-site-green hover:text-white',
  card: 'border-[3px] border-site-blue-light bg-site-blue text-white pl-4 pr-3 py-1.5 text-xs shadow-sm hover:bg-site-blue-dark',
}

export function SiteButton({
  href,
  children,
  variant = 'primary',
  className,
}: SiteButtonProps) {

  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`}>
      <span>{children}</span>
      {variant === 'card' ? <ChevronRight className="size-3.5" aria-hidden /> : null}
    </Link>
  )
}
