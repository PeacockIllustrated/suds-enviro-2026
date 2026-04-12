import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="py-24 md:py-32 bg-navy-d">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Need our help?
        </h2>
        <p className="mt-4 text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
          Get to know us better and discover why SuDS Enviro is the number one
          choice for your water management needs.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/configurator"
            className="rounded-full bg-green hover:bg-green-d text-white px-8 py-4 text-base font-bold transition-colors"
          >
            Start Configurator
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/30 hover:border-white/60 text-white px-8 py-4 text-base font-bold transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  )
}
