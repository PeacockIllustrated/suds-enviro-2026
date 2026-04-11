'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { WizardProvider, useWizardContext } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useAutoSave } from '@/lib/use-auto-save'
import type { ProductId, ProductData } from '@/lib/types'
import { Loader2 } from 'lucide-react'

function AutoSaveRunner() {
  const { state, dispatch } = useWizardContext()
  useAutoSave(state, dispatch)
  return null
}

function ConfigLoader({ configId }: { configId: string }) {
  const { dispatch } = useWizardContext()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/configurations/${configId}`)
        if (!res.ok) {
          setError('Configuration not found')
          setLoading(false)
          return
        }
        const data = await res.json()
        const config = data.configuration

        // Hydrate wizard state from loaded config
        if (config.product) {
          dispatch({ type: 'SET_PRODUCT', payload: config.product as ProductId })
        }
        if (config.id) {
          dispatch({ type: 'SET_CONFIG_ID', payload: config.id })
        }
        if (config.product_data) {
          // Restore product-specific data by dispatching individual actions
          // For now, go to the review step to show the loaded config
          const productData = config.product_data as ProductData
          if (productData) {
            // The SET_PRODUCT action initializes fresh data,
            // so we need to restore the saved data after
            restoreProductData(dispatch, config.product as ProductId, productData)
          }
        }
        // Navigate to review step
        const stepCount = config.wizard_step ?? 0
        if (stepCount > 0) {
          dispatch({ type: 'GO_TO_STEP', payload: stepCount })
        }

        setLoading(false)
      } catch {
        setError('Failed to load configuration')
        setLoading(false)
      }
    }

    loadConfig()
  }, [configId, dispatch])

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-light">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-sm font-medium text-muted">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-dvh items-center justify-center bg-light">
        <div className="mx-4 max-w-sm rounded-xl border border-border bg-white p-6 text-center shadow-lg">
          <div className="mb-3 text-lg font-bold text-ink">Configuration not found</div>
          <p className="mb-4 text-sm text-muted">
            This configuration link may have expired or the configuration was removed.
          </p>
          <a
            href="/configurator"
            className="inline-block rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-white"
          >
            Start New Configuration
          </a>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Restore product data from a loaded configuration.
 * Dispatches the correct product-prefixed actions based on the product type.
 */
function restoreProductData(
  dispatch: React.Dispatch<import('@/lib/types').WizardAction>,
  product: ProductId,
  productData: ProductData
) {
  // The product-specific data needs to be restored via individual actions.
  // Since SET_PRODUCT already sets initial data, we need to override it.
  // The simplest approach: directly set product data fields via prefixed actions.

  if (productData.kind === 'chamber' || productData.kind === 'catchpit') {
    const d = productData.data
    const prefix = productData.kind === 'chamber' ? 'CHAMBER' : 'CATCHPIT'

    if (d.systemType) {
      dispatch({ type: `${prefix}_SET_SYSTEM`, payload: d.systemType } as import('@/lib/types').WizardAction)
    }
    if (d.diameter) {
      dispatch({ type: `${prefix}_SET_DIAMETER`, payload: d.diameter } as import('@/lib/types').WizardAction)
    }
    if (d.inletCount) {
      dispatch({ type: `${prefix}_SET_INLET_COUNT`, payload: d.inletCount } as import('@/lib/types').WizardAction)
    }
    if (d.positions.length > 0) {
      for (const pos of d.positions) {
        dispatch({ type: `${prefix}_TOGGLE_POSITION`, payload: pos } as import('@/lib/types').WizardAction)
      }
    }
    for (const [slot, size] of Object.entries(d.pipeSizes)) {
      dispatch({ type: `${prefix}_SET_PIPE_SIZE`, payload: { slot, size } } as import('@/lib/types').WizardAction)
    }
    if (d.adoptable !== null) {
      dispatch({ type: `${prefix}_SET_ADOPTABLE`, payload: d.adoptable } as import('@/lib/types').WizardAction)
    }
    if (d.depth) {
      dispatch({ type: `${prefix}_SET_DEPTH`, payload: d.depth } as import('@/lib/types').WizardAction)
    }
  }
  // For other product types, the basic SET_PRODUCT initializes defaults
  // and the user can continue from where the config left off
}

export default function SharedConfigPage() {
  const params = useParams()
  const configId = params.configId as string

  return (
    <WizardProvider>
      <ConfigLoader configId={configId} />
      <AutoSaveRunner />
      <WizardShell />
    </WizardProvider>
  )
}
