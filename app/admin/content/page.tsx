import type { Metadata } from 'next'
import { isSignedIn } from '@/lib/site-content/auth'
import { CONTENT_DEFAULTS, SECTION_IDS, type SectionId } from '@/lib/site-content/defaults'
import { getDraftSection, getPublishedSection } from '@/lib/site-content/store'
import type { Json } from '@/lib/site-content/merge'
import { PRODUCT_CATALOG } from '@/lib/product-catalog'
import { ContentLogin } from '@/components/admin/content/ContentLogin'
import { VisualEditor, type EditorPage, type EditorSection } from '@/components/admin/content/VisualEditor'

export const metadata: Metadata = {
  title: 'Site editor - SuDS Enviro',
  robots: { index: false, follow: false },
}

/**
 * The visual site editor. One hard-coded account (lib/site-content/auth.ts).
 * The real pages load in a canvas in draft mode; Sean clicks the words he
 * wants to change, edits them in the side panel, and publishes when happy.
 */
export default async function ContentAdminPage() {
  if (!(await isSignedIn())) return <ContentLogin />

  const sections: EditorSection[] = await Promise.all(
    SECTION_IDS.map(async (id: SectionId) => {
      const [published, draft] = await Promise.all([getPublishedSection(id, { fresh: true }), getDraftSection(id)])
      return {
        id,
        defaults: CONTENT_DEFAULTS[id] as unknown as Json,
        published: published as unknown as Json,
        working: draft.value as unknown as Json,
        hasDraft: draft.hasDraft,
      }
    }),
  )

  const pages: EditorPage[] = [
    { path: '/', label: 'Home' },
    { path: '/rhino-range', label: 'The RHINO Range' },
    { path: '/products', label: 'Products' },
    ...PRODUCT_CATALOG.map((p) => ({ path: `/products/${p.slug}`, label: p.name, group: 'Product pages' })),
    { path: '/builder', label: 'Builder hub' },
    { path: '/contact', label: 'Contact' },
  ]

  return <VisualEditor sections={sections} pages={pages} />
}
