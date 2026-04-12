import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="py-8 px-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-r from-green to-green-d py-16 px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Ready to configure your drainage solution?
        </h2>
        <p className="text-white/80 mt-3 text-base max-w-xl mx-auto">
          Use our guided configurator to specify chambers, separators and treatment systems to
          your exact requirements.
        </p>
        <Link
          href="/configurator"
          className="inline-flex mt-8 rounded-lg bg-white text-green-d px-8 py-4 text-base font-bold hover:bg-white/90 transition-colors"
        >
          Start Configurator
        </Link>
      </div>
    </section>
  )
}
