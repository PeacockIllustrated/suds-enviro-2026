'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useSitePath } from './SitePath'

/**
 * `next/link` with the site path prefix applied.
 *
 * Reading the prefix needs a hook, so this is a client component - but it
 * can be dropped straight into a server component, which keeps pages able
 * to export `metadata`.
 */
export function SiteLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const sitePath = useSitePath()
  return <Link href={sitePath(href)} {...props} />
}
