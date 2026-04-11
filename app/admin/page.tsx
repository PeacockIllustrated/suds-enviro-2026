'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
          <div className="mx-auto mb-4">
            <Image
              src="/logos/suds/logo-slogan-main.png"
              alt="SuDS Enviro - Bespoke, Standardised"
              width={200}
              height={120}
              className="mx-auto object-contain"
              priority
            />
          </div>
          <h2 className="text-sm font-bold tracking-tight text-muted">
            Admin Access
          </h2>
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
