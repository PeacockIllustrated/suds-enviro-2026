'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { Lock } from 'lucide-react'
import { login, type LoginState } from '@/app/admin/content/actions'

export function ContentLogin() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null, username: '' })
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-site-blue-dark px-5 py-16">
      <form action={action} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Image src="/logos/suds/icon-main.png" alt="" width={48} height={48} className="h-12 w-12" />
        <h1 className="mt-5 text-2xl font-bold text-site-blue-dark">Site content</h1>
        <p className="mt-1 text-sm text-site-blue-dark/70">Sign in to edit the wording on the SuDS Enviro website.</p>

        <label className="mt-6 block text-xs font-bold tracking-wider text-site-blue-dark uppercase" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          defaultValue={state.username}
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-lg border border-site-blue/30 px-3 py-2.5 text-base text-site-blue-dark outline-none focus:border-site-blue focus:ring-2 focus:ring-site-blue/20"
        />

        <label className="mt-4 block text-xs font-bold tracking-wider text-site-blue-dark uppercase" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-site-blue/30 px-3 py-2.5 text-base text-site-blue-dark outline-none focus:border-site-blue focus:ring-2 focus:ring-site-blue/20"
        />

        {state.error ? (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-site-blue px-5 py-3 text-sm font-bold tracking-wider text-white uppercase transition-colors hover:bg-site-blue-dark disabled:opacity-60"
        >
          <Lock className="h-4 w-4" aria-hidden />
          {pending ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
