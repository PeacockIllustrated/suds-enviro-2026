import Link from 'next/link'
import Image from 'next/image'
import { FOOTER } from '@/lib/content/navigation'

/** The Webflow `NewFooter` component: mark, strapline, three links. */
export function SiteFooter() {
  return (
    <footer className="bg-site-blue-dark text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={FOOTER.logo}
            alt="SuDS Enviro"
            width={120}
            height={44}
            className="h-10 w-auto"
          />
          <span className="border-l border-white/40 pl-4 text-sm leading-tight tracking-wide uppercase">
            <span className="block">{FOOTER.strapline.lead}</span>
            <span className="block italic">{FOOTER.strapline.trail}</span>
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {FOOTER.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
