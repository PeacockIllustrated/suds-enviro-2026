import Link from 'next/link'
import Image from 'next/image'
import { getAllCatalogCategories } from '@/lib/product-catalog'

export function Footer() {
  const categories = getAllCatalogCategories()

  return (
    <footer className="bg-navy-d text-white">
      {/* Thin separator */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-white/10" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Column 1: Logo + description */}
          <div>
            <Image
              src="/logos/suds/logo-slogan-white.png"
              alt="SuDS Enviro"
              width={160}
              height={80}
            />
            <p className="mt-6 text-sm text-white/50 leading-relaxed">
              UK manufacturer of HDPE rotationally moulded drainage chambers,
              separators and treatment systems. Built to specification, delivered
              nationwide.
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-5">
              Products
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.category}>
                  <Link
                    href={`/products#category-${cat.category}`}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/configurator"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Configurator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-5">
              Contact
            </h3>
            <address className="not-italic space-y-3 text-sm text-white/60">
              <p>9 Ambleside Court</p>
              <p>Chester-le-Street</p>
              <p>DH3 2EB</p>
              <div className="h-px w-8 bg-white/10 my-4" />
              <p>
                <a
                  href="tel:01224057700"
                  className="hover:text-white transition-colors"
                >
                  01224 057 700
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@sudsenviro.com"
                  className="hover:text-white transition-colors"
                >
                  hello@sudsenviro.com
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        <div className="h-px bg-white/10 mb-6" />
        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} SuDS Enviro Ltd. Company No. SC682733
        </p>
      </div>
    </footer>
  )
}
