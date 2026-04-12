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
    <section className="py-16 md:py-20 bg-[#f8fafb]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {FEATURES.map((feature, index) => (
            <div key={feature.label} className="flex items-center gap-x-8 md:gap-x-12">
              <div className="inline-flex items-center gap-2.5 text-ink/70">
                <span className="text-navy">{feature.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {feature.label}
                </span>
              </div>
              {index < FEATURES.length - 1 && (
                <div className="hidden md:block h-5 w-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
