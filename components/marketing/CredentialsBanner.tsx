export function CredentialsBanner() {
  return (
    <section className="py-24 md:py-28 bg-navy">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Stats column */}
          <div>
            <div className="flex items-baseline gap-6 mb-8">
              <span className="text-7xl md:text-8xl font-extrabold text-green leading-none tracking-tight">
                40+
              </span>
              <span className="text-xl md:text-2xl font-bold text-white leading-tight">
                Years of
                <br />
                Experience
              </span>
            </div>

            <div className="flex items-baseline gap-6">
              <span className="text-4xl md:text-5xl font-extrabold text-green/80 leading-none tracking-tight">
                100%
              </span>
              <span className="text-base font-semibold text-white/70 leading-tight">
                UK Manufactured
              </span>
            </div>
          </div>

          {/* Text column */}
          <div>
            {/* Green accent */}
            <div className="h-[3px] w-10 rounded-full bg-green mb-6" />

            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              Over Four Decades of Experience and 21st Century Products
            </h2>
            <p className="mt-6 text-white/60 leading-relaxed max-w-lg">
              With a passionate heart and an ambition to completely change the way we
              handle water management, no one is better equipped to help you. Our
              products are designed and built in the UK, meeting the most demanding
              standards for adoptable and non-adoptable drainage.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
