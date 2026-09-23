import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { HomeContent } from '@/lib/site-content/defaults'

/**
 * The foul-water / surface-water split, as two cards.
 *
 * Each card is marked with its stream's colour (red for foul, blue for
 * surface, as in the scroll scene's pipes) and lists its products as rows
 * with a chevron, so a longer list reads as a menu rather than a stack of
 * identical pills. The cards share rows through subgrid, so the headings
 * and lists line up whatever the heading length.
 */
export function SolutionRoutes({ content }: { content: Pick<HomeContent, 'SOLUTION_ROUTES'> }) {
  const { SOLUTION_ROUTES } = content
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto grid max-w-[1180px] gap-6 px-5 md:grid-cols-2 md:grid-rows-[auto_auto_1fr] md:gap-x-8 md:gap-y-0">
        {SOLUTION_ROUTES.map((route) => {
          const foul = route.id === 'foul'
          return (
            <div
              key={route.id}
              className="relative grid overflow-hidden rounded-[2rem] bg-[#f1f7fa] p-7 md:row-span-3 md:grid-rows-subgrid md:p-10"
            >
              <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${foul ? 'bg-site-red' : 'bg-site-blue'}`} />
              <div className="flex items-center justify-between gap-4">
                <Image src={route.logo} alt="RHINO by SuDS Enviro" width={320} height={120} sizes="160px" className="h-11 w-auto" />
                <span aria-hidden className={`size-3 rounded-full ${foul ? 'bg-site-red' : 'bg-site-blue'}`} />
              </div>

              <h2 className="mt-6 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.05] tracking-[-0.01em] text-balance uppercase">
                <span className="font-bold text-site-blue">{route.heading.lead}</span>{' '}
                <span className="font-light text-site-green">{route.heading.trail}</span>
              </h2>

              <ul className="mt-6 self-start divide-y divide-site-blue/10 border-y border-site-blue/10">
                {route.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between gap-4 py-3.5 text-sm font-bold tracking-wider text-site-blue-dark uppercase italic transition-colors duration-150 hover:text-site-blue md:text-base"
                    >
                      {link.label}
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-site-blue shadow-sm transition-transform duration-200 group-hover:translate-x-1">
                        <ChevronRight className="size-4" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
