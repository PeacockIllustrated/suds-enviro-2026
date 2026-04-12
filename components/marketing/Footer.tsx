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

      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Column 1: Logo + description */}
          <div>
            <Image
              src="/logos/suds/logo-slogan-white.png"
              alt="SuDS Enviro"
              width={160}
              height={80}
            />
            <p className="mt-6 text-sm text-white/45 leading-relaxed max-w-xs">
              UK manufacturer of HDPE rotationally moulded drainage chambers,
              separators and treatment systems. Built to specification, delivered
              nationwide.
            </p>
          </div>

          {/* Column 2: Products */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/35 mb-5">
              Products
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.category}>
                  <Link
                    href={`/products#category-${cat.category}`}
                    className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/35 mb-5">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/configurator"
                  className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                >
                  Configurator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/35 mb-5">
              Contact
            </h3>
            <address className="not-italic space-y-2 text-sm text-white/55">
              <p>9 Ambleside Court</p>
              <p>Chester-le-Street</p>
              <p>DH3 2EB</p>
              <div className="h-px w-8 bg-white/10 my-4" />
              <p>
                <a
                  href="tel:01224057700"
                  className="hover:text-white transition-colors duration-200"
                >
                  01224 057 700
                </a>
              </p>
              <p>
                <a
                  href="mailto:hello@sudsenviro.com"
                  className="hover:text-white transition-colors duration-200"
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
        <div className="h-px bg-white/8 mb-6" />
        <p className="text-[11px] text-white/25 tracking-wide">
          &copy; {new Date().getFullYear()} SuDS Enviro Ltd. Company No. SC682733
        </p>
      </div>
    </footer>
  )
}
