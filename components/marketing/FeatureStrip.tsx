import { Factory, Cog, Shield, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

interface FeatureBadge {
  icon: ReactNode
  label: string
}

const FEATURES: FeatureBadge[] = [
  { icon: <Factory size={20} />, label: 'UK Manufactured' },
  { icon: <Cog size={20} />, label: 'Rotational Moulding' },
  { icon: <Shield size={20} />, label: 'SfA7 Compliant' },
  { icon: <Clock size={20} />, label: 'Quick Installation' },
]

export function FeatureStrip() {
  return (
    <section className="py-14 md:py-16 bg-[#f8fafb] border-y border-border/40">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-y-4">
          {FEATURES.map((feature, index) => (
            <div key={feature.label} className="flex items-center">
              {index > 0 && (
                <div className="hidden md:block h-5 w-px bg-border/80 mx-6 lg:mx-10" />
              )}
              <div className="inline-flex items-center gap-2.5 px-3 md:px-0">
                <span className="text-navy">{feature.icon}</span>
                <span className="text-sm font-medium text-ink/70 whitespace-nowrap">
                  {feature.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
