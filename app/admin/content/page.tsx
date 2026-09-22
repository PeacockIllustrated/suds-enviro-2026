import type { Metadata } from 'next'
import { isSignedIn } from '@/lib/site-content/auth'
import { CONTENT_DEFAULTS, SECTION_IDS, SECTION_META, isSectionId } from '@/lib/site-content/defaults'
import { getSection, readSaved } from '@/lib/site-content/store'
import type { Json } from '@/lib/site-content/merge'
import { ContentLogin } from '@/components/admin/content/ContentLogin'
import { ContentEditor } from '@/components/admin/content/ContentEditor'

export const metadata: Metadata = {
  title: 'Site content - SuDS Enviro',
  robots: { index: false, follow: false },
}

/**
 * The site copy editor. One hard-coded account (lib/site-content/auth.ts);
 * everything saved here is merged over the wording in lib/content/.
 */
export default async function ContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  if (!(await isSignedIn())) return <ContentLogin />

  const { section: requested } = await searchParams
  const section = requested && isSectionId(requested) ? requested : 'home'
  const [current, saved] = await Promise.all([
    getSection(section, { fresh: true }),
    readSaved(section, { fresh: true }),
  ])

  return (
    <ContentEditor
      key={section}
      section={section}
      sections={SECTION_IDS.map((id) => ({ id, ...SECTION_META[id] }))}
      defaults={CONTENT_DEFAULTS[section] as unknown as Json}
      current={current as unknown as Json}
      hasSaved={saved !== null}
    />
  )
}
