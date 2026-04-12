import Link from 'next/link'
import Image from 'next/image'
import { getAllCatalogCategories } from '@/lib/product-catalog'

export function Footer() {
  const categories = getAllCatalogCategories()

  return (
    <footer className="bg-navy-d text-white py-16">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Logo + description */}
        <div>
          <Image
            src="/logos/suds/logo-slogan-white.png"
            alt="SuDS Enviro"
            width={160}
            height={80}
          />
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            UK manufacturer of HDPE rotationally moulded drainage chambers, separators
            and treatment systems. Built to specification, delivered nationwide.
          </p>
        </div>

        {/* Column 2: Products */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
            Products
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.category}>
                <Link
                  href={`/products#category-${cat.category}`}
                  className="text-sm text-white/60 hover:text-green transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
            Company
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="text-sm text-white/60 hover:text-green transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-sm text-white/60 hover:text-green transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/configurator"
                className="text-sm text-white/60 hover:text-green transition-colors"
              >
                Configurator
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
            Contact
          </h3>
          <address className="not-italic space-y-2 text-sm text-white/60">
            <p>9 Ambleside Court</p>
            <p>Chester-le-Street</p>
            <p>DH3 2EB</p>
            <p className="pt-2">
              <a
                href="tel:01224057700"
                className="hover:text-green transition-colors"
              >
                01224 057 700
              </a>
            </p>
            <p>
              <a
                href="mailto:hello@sudsenviro.com"
                className="hover:text-green transition-colors"
              >
                hello@sudsenviro.com
              </a>
            </p>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 mt-12 pt-6 border-t border-white/10">
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} SuDS Enviro Ltd. Company No. SC682733
        </p>
      </div>
    </footer>
  )
}
