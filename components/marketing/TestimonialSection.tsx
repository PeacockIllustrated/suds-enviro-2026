export function TestimonialSection() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Large decorative quote mark */}
        <span
          className="block text-6xl md:text-7xl font-serif text-green/20 leading-none select-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <blockquote className="mt-4">
          <p className="text-xl md:text-2xl font-medium italic text-ink leading-relaxed">
            Sustainable drainage systems are the most effective means of making
            space for water, allowing communities to adapt to climate change and
            become more flood and drought resilient.
          </p>
        </blockquote>

        {/* Attribution */}
        <div className="mt-8">
          <div className="mx-auto mb-4 h-0.5 w-10 bg-green" />
          <p className="text-sm font-semibold text-ink">Sean Taylor</p>
          <p className="text-xs text-muted mt-1">
            Managing Director, SuDS Enviro Ltd
          </p>
        </div>
      </div>
    </section>
  )
}
