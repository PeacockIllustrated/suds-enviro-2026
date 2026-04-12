'use client'

import dynamic from 'next/dynamic'

const ChamberModel = dynamic(
  () => import('@/components/three/WireframeChamberCanvas'),
  { ssr: false }
)

interface ProductModelProps {
  productSlug: string
}

/** Slugs that have real STL models available */
const SLUGS_WITH_MODELS = ['inspection-chamber', 'catchpit-silt-trap']

export function ProductModel({ productSlug }: ProductModelProps) {
  if (!SLUGS_WITH_MODELS.includes(productSlug)) {
    // Gradient sphere placeholder for products without 3D models
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-56 w-56 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-navy/10 to-blue/10 border border-border/20 shadow-[0_0_80px_rgba(26,130,162,0.1)]" />
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-full max-w-[400px] mx-auto">
      <ChamberModel />
    </div>
  )
}
