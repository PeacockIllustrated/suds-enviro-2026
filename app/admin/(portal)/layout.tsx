'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'

function usePageTitle(): string {
  // Derive title from pathname for the shell header
  if (typeof window === 'undefined') return 'Admin'

  const path = window.location.pathname
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/enquiries')) return 'Enquiries'
  if (path.includes('/configurations')) return 'Configurations'
  if (path.includes('/quotes')) return 'Quotes'
  if (path.includes('/settings')) return 'Settings'
  return 'Admin'
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const title = usePageTitle()

  useEffect(() => {
    // Auth check via a lightweight stats call
    fetch('/api/admin/stats')
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin')
          return
        }
        setAuthed(true)
      })
      .catch(() => {
        router.push('/admin')
      })
      .finally(() => {
        setChecking(false)
      })
  }, [router])

  if (checking || !authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-light">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-[13px] font-semibold text-muted">
            Verifying access...
          </p>
        </div>
      </div>
    )
  }

  return <AdminShell title={title}>{children}</AdminShell>
}
