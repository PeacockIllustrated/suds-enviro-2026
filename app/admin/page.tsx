'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || 'Invalid password')
      }

      router.push('/admin/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-light p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-[#005f8c] shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C8 3 5 6 5 9c0 2 1 3.5 2.5 4.5L6 18h12l-1.5-4.5C18 12.5 19 11 19 9c0-3-3-6-7-6z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 9c0 1.66 1.34 3 3 3s3-1.34 3-3"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M5 9L3 7M19 9l2-2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink">
            SuDS Enviro Admin
          </h1>
          <p className="mt-1 text-[12px] font-medium text-muted">
            Sign in to manage enquiries and configurations
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Password
            </label>
            <div className="relative mb-4">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-[14px] text-ink outline-none transition-colors focus:border-blue"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className={`block w-full rounded-lg py-3 text-center text-[14px] font-bold transition-colors ${
                loading || !password
                  ? 'bg-border text-muted cursor-not-allowed'
                  : 'bg-navy text-white shadow-[0_2px_8px_rgba(0,77,112,0.3)] hover:bg-navy-d'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted/60">
          SuDS Enviro Configurator - Admin Portal
        </p>
      </div>
    </div>
  )
}
