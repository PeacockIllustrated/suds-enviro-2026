'use client'

import { createContext, useContext } from 'react'

/**
 * Prefix applied to internal links rendered by the site components.
 *
 * The rebuild currently lives under `/preview` while the original
 * marketing pages still own `/`, `/contact` and `/products`. The content
 * files store the final paths, so without a prefix every link in the
 * preview would drop the reader onto the old site.
 *
 * When the rebuild takes over those routes, delete the provider and this
 * collapses to the identity function.
 */
const SitePathContext = createContext('')

/**
 * The routes the marketing rebuild will own.
 *
 * Only these move under the prefix. Everything else has to pass through
 * untouched: `/configurator` and `/admin` are existing app routes that
 * the rebuild does not replace, and files under `public/` - the brochure
 * HTML, images - are not routes at all. Prefixing either gives a 404.
 */
const OWNED_ROUTES = ['/contact', '/products', '/rhino-range']

export function SitePathProvider({
  prefix,
  children,
}: {
  prefix: string
  children: React.ReactNode
}) {
  return <SitePathContext.Provider value={prefix}>{children}</SitePathContext.Provider>
}

export function useSitePath(): (href: string) => string {
  const prefix = useContext(SitePathContext)

  return (href: string) => {
    if (!prefix) return href
    if (!href.startsWith('/') || href.startsWith('//')) return href

    // `/` + `/preview` would give `/preview/`, which redirects.
    if (href === '/') return prefix

    const path = href.split(/[?#]/)[0]
    const owned = OWNED_ROUTES.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )

    return owned ? `${prefix}${href}` : href
  }
}
