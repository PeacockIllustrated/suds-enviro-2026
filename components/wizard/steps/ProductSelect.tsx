'use client'

import { useWizardContext } from '../WizardContext'
import { OptionCard } from '@/components/ui/OptionCard'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { CATEGORIES, getProductsByCategory } from '@/lib/products/registry'
import '@/lib/products/register-all'
import type { ProductId } from '@/lib/types'
import type { ReactNode } from 'react'

// ── PRODUCT ICONS ───────────────────────────────────────────

const PRODUCT_ICONS: Record<ProductId, ReactNode> = {
  chamber: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="7" rx="7" ry="3" stroke="#004d70" strokeWidth="1.5" />
      <path d="M5 7v10c0 1.66 3.13 3 7 3s7-1.34 7-3V7" stroke="#004d70" strokeWidth="1.5" />
    </svg>
  ),
  catchpit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="#004d70" strokeWidth="1.5" />
      <path d="M12 3v5M9 5l3-2 3 2" stroke="#004d70" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  rhinoceptor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l-7 4v6c0 4 3.5 7.5 7 8.5 3.5-1 7-4.5 7-8.5V7l-7-4z" stroke="#004d70" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 10c.5 0 1.5.5 1.5 2s-1 3-1.5 4c-.5-1-1.5-2.5-1.5-4s1-2 1.5-2z" fill="#1a82a2" />
    </svg>
  ),
  'flow-control': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#1a82a2" strokeWidth="1.5" />
      <path d="M12 12c0-3 2-5 4-4s3 4 1 6-5 2-6 0 0-4 2-4" stroke="#1a82a2" strokeWidth="1.5" />
    </svg>
  ),
  'pump-station': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="6" stroke="#004d70" strokeWidth="1.5" />
      <path d="M12 8v4l3 2" stroke="#004d70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 12H3M18 12h3M12 6V3M12 18v3" stroke="#004d70" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'grease-trap': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="13" rx="2" stroke="#5a7a90" strokeWidth="1.5" />
      <line x1="4" y1="11" x2="20" y2="11" stroke="#5a7a90" strokeWidth="1.5" />
      <line x1="4" y1="15" x2="20" y2="15" stroke="#5a7a90" strokeWidth="1.5" />
    </svg>
  ),
  'grease-separator': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="#5a7a90" strokeWidth="1.5" />
      <line x1="12" y1="6" x2="12" y2="19" stroke="#5a7a90" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M7 10h3M14 10h3" stroke="#5a7a90" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  rhinopod: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="8" width="14" height="12" rx="2" stroke="#004d70" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="3" stroke="#1a82a2" strokeWidth="1.5" />
      <path d="M12 10v-4" stroke="#1a82a2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  rainwater: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 10c0-2.5 2-4.5 4-5 .5-.1 1.3-.2 2-.2s1.5.1 2 .2c2 .5 4 2.5 4 5 0 1.5-.5 2.5-1.5 3h-9C6.5 12.5 6 11.5 6 10z" stroke="#1a82a2" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 14v4M9 15v3M15 15v3" stroke="#1a82a2" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="7" y="18" width="10" height="3" rx="1" stroke="#004d70" strokeWidth="1.5" />
    </svg>
  ),
  'septic-tank': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="18" height="10" rx="2" stroke="#5a7a90" strokeWidth="1.5" />
      <path d="M3 10c0-2 3-4 9-4s9 2 9 4" stroke="#5a7a90" strokeWidth="1.5" />
      <line x1="10" y1="10" x2="10" y2="20" stroke="#5a7a90" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="14" y1="10" x2="14" y2="20" stroke="#5a7a90" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
  drawpit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="12" height="5" rx="1" stroke="#004d70" strokeWidth="1.5" />
      <rect x="6" y="10" width="12" height="5" rx="1" stroke="#004d70" strokeWidth="1.5" />
      <rect x="6" y="16" width="12" height="5" rx="1" stroke="#004d70" strokeWidth="1.5" />
    </svg>
  ),
}

// ── COMPONENT ───────────────────────────────────────────────

export function ProductSelect() {
  const { state, dispatch } = useWizardContext()

  return (
    <div className="flex flex-col">
      {CATEGORIES.map((cat) => {
        const products = getProductsByCategory(cat.id)
        if (products.length === 0) return null

        return (
          <div key={cat.id}>
            <CategoryCard
              label={cat.label}
              description={cat.description}
              count={products.length}
            />
            <div className="flex flex-col gap-2 mb-2">
              {products.map((p) => (
                <OptionCard
                  key={p.id}
                  icon={PRODUCT_ICONS[p.id]}
                  title={p.name}
                  subtitle={p.subtitle}
                  selected={state.product === p.id}
                  onClick={() =>
                    dispatch({ type: 'SET_PRODUCT', payload: p.id })
                  }
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
