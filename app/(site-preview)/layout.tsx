import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SitePathProvider } from '@/components/site/SitePath'

/** Chrome for the work-in-progress rebuild of the marketing site. */
export default function SitePreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    // Every internal link the site components emit is rewritten onto
    // /preview, so the rebuild is navigable without leaking back to the
    // original marketing pages. Drop this when it takes over the real
    // routes.
    <SitePathProvider prefix="/preview">
      <div className="flex min-h-screen flex-col bg-white">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SitePathProvider>
  )
}
