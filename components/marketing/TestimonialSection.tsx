export function TestimonialSection() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* Large decorative quote mark */}
        <span
          className="block text-7xl md:text-8xl font-serif text-green/15 leading-none select-none -mb-4 md:-mb-6"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <blockquote>
          <p className="text-xl md:text-2xl font-medium italic text-ink leading-relaxed">
            Sustainable drainage systems are the most effective means of making
            space for water, allowing communities to adapt to climate change and
            become more flood and drought resilient.
          </p>
        </blockquote>

        {/* Attribution */}
        <div className="mt-10">
          <div className="mx-auto mb-5 h-[3px] w-10 rounded-full bg-green" />
          <p className="text-sm font-bold text-ink">Sean Taylor</p>
          <p className="text-xs text-muted mt-1.5">
            Managing Director, SuDS Enviro Ltd
          </p>
        </div>
      </div>
    </section>
  )
}
