'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lock } from 'lucide-react'

export function WelcomeLogin() {
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
        const data: { error?: string } = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Invalid password')
      }

      // Reload so the server-rendered welcome page can re-evaluate auth
      window.location.reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-d to-[#001f30] p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-green/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <Image
            src="/logos/suds/logo-slogan-white.png"
            alt="SuDS Enviro - Bespoke, Standardised"
            width={220}
            height={132}
            className="mx-auto object-contain"
            priority
          />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur">
            Client Hub
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
          <h1 className="text-[22px] font-extrabold leading-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/60">
            Sign in with the team password to access the configurator hub, admin portal and live review tools.
          </p>

          <label className="mt-6 mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/45">
            Password
          </label>
          <div className="relative mb-4">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/8 py-3 pl-10 pr-4 text-[14px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-green focus:bg-white/12"
              placeholder="Enter team password"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300/30 bg-red-400/10 px-3.5 py-2.5 text-[12px] font-semibold text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`block w-full rounded-xl py-3 text-center text-[14px] font-bold transition-all
              ${loading || !password
                ? 'cursor-not-allowed bg-white/10 text-white/40'
                : 'bg-green text-white shadow-[0_4px_24px_rgba(68,175,67,0.35)] hover:bg-green-d'}
            `}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/35">
          SuDS Enviro Configurator - Client Welcome Pack
        </p>
      </div>
    </div>
  )
}
