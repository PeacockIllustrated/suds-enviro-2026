'use client'

import { useEffect, useRef } from 'react'
import type { WizardState, WizardAction, SaveConfigResponse } from '@/lib/types'
import { getSessionId } from '@/lib/supabase'

const DEBOUNCE_MS = 2000

/**
 * Auto-saves wizard state to the server as the user progresses.
 * Debounces changes by 2 seconds. Only saves once a product is selected (step >= 1).
 * On first save, stores the returned configId back into state via dispatch.
 * Errors are logged silently (console.warn).
 */
export function useAutoSave(
  state: WizardState,
  dispatch: React.Dispatch<WizardAction>
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    // Only save if a product is selected (step >= 1)
    if (!state.product) return

    // Serialize state for comparison (skip configId to avoid save loops)
    const { configId: _configId, ...stateWithoutConfigId } = state
    const serialized = JSON.stringify(stateWithoutConfigId)

    // Skip if nothing has changed
    if (serialized === lastSavedRef.current) return

    // Clear any existing debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      if (savingRef.current) return
      savingRef.current = true

      try {
        const sessionId = getSessionId()
        if (!sessionId) return

        const response = await fetch('/api/configurations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, state }),
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          console.warn('Auto-save failed:', (errorBody as { error?: string }).error || response.statusText)
          return
        }

        const data: SaveConfigResponse = await response.json()

        // Store the configId on first save
        if (data.configId && !state.configId) {
          dispatch({ type: 'SET_CONFIG_ID', payload: data.configId })
        }

        lastSavedRef.current = serialized
      } catch (err) {
        console.warn('Auto-save error:', err)
      } finally {
        savingRef.current = false
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [state, dispatch])
}
