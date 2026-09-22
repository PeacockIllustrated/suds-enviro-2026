'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { WizardProvider, useWizardContext } from '@/components/wizard/WizardContext'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useAutoSave } from '@/lib/use-auto-save'
import { isProductRegistered } from '@/lib/products/registry'
import '@/lib/products/register-all'
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

        // Hydrate the whole wizard state from the loaded config in one
        // action, so every product (not just chambers) keeps all of its
        // saved fields and the auto-saver never sees a half-restored state.
        if (config.product && isProductRegistered(config.product as ProductId)) {
          dispatch({
            type: 'HYDRATE',
            payload: {
              product: config.product as ProductId,
              productData: (config.product_data as ProductData | null) ?? null,
              step: typeof config.wizard_step === 'number' ? config.wizard_step : 0,
              configId: (config.id as string | undefined) ?? configId,
            },
          })
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
          <Link
            href="/configurator"
            className="inline-block rounded-lg bg-navy px-6 py-2.5 text-sm font-bold text-white"
          >
            Start New Configuration
          </Link>
        </div>
      </div>
    )
  }

  return null
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
