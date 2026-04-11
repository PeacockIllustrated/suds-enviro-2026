'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'

interface AdminShellProps {
  children: React.ReactNode
  title: string
}

export function AdminShell({ children, title }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-light">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile header bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-light"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <Image
            src="/logos/suds/icon-main.png"
            alt="SuDS Enviro"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="text-[14px] font-bold text-ink">{title}</span>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
