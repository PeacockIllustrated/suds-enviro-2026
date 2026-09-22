'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Menu, X } from 'lucide-react'
import { PRIMARY_NAV } from '@/lib/content/navigation'
import { SiteButton } from './SiteButton'
import { useSitePath } from './SitePath'

/**
 * The Webflow `NavFinal` bar: solid dark blue, white mark and strapline on
 * the left, the RHINO Range mega menu and Contact in the middle, two pills
 * on the right.
 */
export function SiteHeader() {
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { brand, megaMenu, links, actions } = PRIMARY_NAV
  const sitePath = useSitePath()

  return (
    <header className="sticky top-0 z-50 bg-site-blue-dark text-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5">
        <Link href={sitePath(brand.href)} className="flex shrink-0 items-center gap-4">
          <Image
            src={brand.mark}
            alt="SuDS Enviro"
            width={120}
            height={44}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden border-l border-white/40 pl-4 text-[13px] leading-tight tracking-wide uppercase max-site-tablet:hidden lg:block">
            <span className="block">{brand.strapline.lead}</span>
            <span className="block italic">{brand.strapline.trail}</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-8 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              onClick={() => setMegaOpen((open) => !open)}
              className="flex items-center gap-1.5 text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            >
              {megaMenu.label}
              <ChevronDown className="size-4" aria-hidden />
            </button>

            {megaOpen ? (
              <div className="absolute left-1/2 top-full w-[min(1100px,90vw)] -translate-x-1/2 pt-4">
                <div className="grid grid-cols-4 gap-x-8 gap-y-7 rounded-2xl bg-white p-8 text-site-blue-dark shadow-2xl">
                  {megaMenu.columns.map((column) => (
                    <div key={column.heading}>
                      <h2 className="mb-3 text-xs font-bold tracking-widest text-site-green uppercase">
                        {column.heading}
                      </h2>
                      <ul className="space-y-3">
                        {column.links.map((link) => (
                          <li key={`${column.heading}-${link.label}`}>
                            <Link
                              href={sitePath(link.href)}
                              className="group block"
                              aria-disabled={link.comingSoon}
                            >
                              <span className="text-sm font-bold group-hover:text-site-blue">
                                {link.label}
                              </span>
                              {link.comingSoon ? (
                                <span className="ml-2 align-middle text-[10px] font-bold tracking-wider text-site-ui-blue uppercase">
                                  Soon
                                </span>
                              ) : null}
                              {link.description ? (
                                <span className="mt-0.5 block text-xs leading-snug text-site-blue-dark/70">
                                  {link.description}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="border-t border-site-ui-blue/50 pt-5 md:col-span-4">
                    <h2 className="mb-3 text-xs font-bold tracking-widest text-site-green uppercase">
                      {megaMenu.sidebar.heading}
                    </h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {megaMenu.sidebar.links.map((link) => (
                        <Link
                          key={link.label}
                          href={sitePath(link.href)}
                          className="text-sm font-bold hover:text-site-blue"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {links.map((link) => (
            <Link
              key={link.href}
              href={sitePath(link.href)}
              className="text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:ml-0 lg:flex">
          <SiteButton href={actions[0].href}>{actions[0].label}</SiteButton>
          <SiteButton href={actions[1].href} variant="outline">
            {actions[1].label}
          </SiteButton>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Menu"
          className="ml-auto lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/15 px-5 pb-6 lg:hidden">
          <div className="grid gap-5 pt-5 sm:grid-cols-2">
            {megaMenu.columns.map((column) => (
              <div key={column.heading}>
                <h2 className="mb-2 text-xs font-bold tracking-widest text-site-ui-green uppercase">
                  {column.heading}
                </h2>
                <ul className="space-y-1.5">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.label}`}>
                      <Link
                        href={sitePath(link.href)}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={sitePath(link.href)}
                onClick={() => setMobileOpen(false)}
                className="text-sm tracking-wider uppercase"
              >
                {link.label}
              </Link>
            ))}
            <SiteButton href={actions[0].href}>{actions[0].label}</SiteButton>
            <SiteButton href={actions[1].href} variant="outline">
              {actions[1].label}
            </SiteButton>
          </div>
        </div>
      ) : null}
    </header>
  )
}
