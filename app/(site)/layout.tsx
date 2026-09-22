import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { getSection } from '@/lib/site-content/store'

/** Chrome for the marketing site. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navigation = await getSection('navigation')
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader content={{ PRIMARY_NAV: navigation.PRIMARY_NAV }} />
      <main className="flex-1">{children}</main>
      <SiteFooter content={{ FOOTER: navigation.FOOTER }} />
    </div>
  )
}
