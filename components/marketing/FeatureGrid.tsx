import { Factory, Cog, Shield, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

interface FeatureItem {
  icon: ReactNode
  title: string
  description: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Factory size={28} />,
    title: 'UK Manufactured',
    description: 'All products manufactured in the UK from HDPE',
  },
  {
    icon: <Cog size={28} />,
    title: 'Rotational Moulding',
    description: 'One-piece construction, no joints or weak points',
  },
  {
    icon: <Shield size={28} />,
    title: 'Compliance Built-In',
    description: 'Meets SfA7, DCG, BS EN 13598 and more',
  },
  {
    icon: <Clock size={28} />,
    title: 'Quick Installation',
    description: 'Lightweight, no machinery or lifting equipment needed',
  },
]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-xl bg-white/10 p-6 border border-white/10"
        >
          <div className="text-green mb-4">{feature.icon}</div>
          <h3 className="font-bold text-white text-base">{feature.title}</h3>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}
