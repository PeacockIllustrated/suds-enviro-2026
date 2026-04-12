'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/92 backdrop-blur-xl shadow-sm border-b border-border/40'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-20">
        <Link href="/" className="shrink-0">
          <Image
            src="/logos/suds/horizontal-main.png"
            alt="SuDS Enviro"
            width={130}
            height={34}
            priority
            className="w-[110px] md:w-[130px] h-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/60 hover:text-navy transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/configurator"
            className="hidden sm:inline-flex rounded-full bg-green px-6 py-2.5 text-sm font-bold text-white hover:bg-green-d transition-colors duration-200 shadow-sm"
          >
            Start Configurator
          </Link>

          <button
            type="button"
            className="md:hidden p-2 text-ink/70 hover:text-ink transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border/30">
          <div className="px-6 py-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-ink/80 hover:text-navy transition-colors duration-200 py-2.5"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/configurator"
              className="sm:hidden mt-3 rounded-full bg-green px-5 py-3 text-sm font-bold text-white text-center hover:bg-green-d transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Start Configurator
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
