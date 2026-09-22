import Image from 'next/image'
import type { HomeContent } from '@/lib/site-content/defaults'
import { SiteButton } from './SiteButton'

/**
 * The foul-water / surface-water split. Each panel carries the RHINO
 * lockup, a two-voice heading and a stack of pill links.
 */
export function SolutionRoutes({ content }: { content: Pick<HomeContent, 'SOLUTION_ROUTES'> }) {
  const { SOLUTION_ROUTES } = content
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-2 md:gap-16">
        {SOLUTION_ROUTES.map((route) => (
          <div key={route.id}>
            <Image
              src={route.logo}
              alt="RHINO by SuDS Enviro"
              width={320}
              height={120}
              sizes="320px"
              className="h-14 w-auto"
            />

            <h2 className="mt-6 text-[clamp(1.75rem,4vw,2.75rem)] leading-tight uppercase">
              <span className="font-bold text-site-blue">{route.heading.lead}</span>{' '}
              <span className="text-site-green">{route.heading.trail}</span>
            </h2>

            <div className="mt-6 flex flex-col items-start gap-3">
              {route.links.map((link) => (
                <SiteButton key={link.label} href={link.href}>
                  {link.label}
                </SiteButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
