import { draftMode } from 'next/headers'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { EditBridge } from '@/components/site/EditBridge'
import { getSection } from '@/lib/site-content/store'

/** Chrome for the marketing site. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navigation = await getSection('navigation')
  // Draft mode is only ever on for a signed-in editor (see
  // app/admin/content/preview); the bridge connects the page to the editor.
  const { isEnabled: preview } = await draftMode()
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader content={{ PRIMARY_NAV: navigation.PRIMARY_NAV }} />
      <main className="flex-1">{children}</main>
      <SiteFooter content={{ FOOTER: navigation.FOOTER }} />
      {preview ? <EditBridge /> : null}
    </div>
  )
}
