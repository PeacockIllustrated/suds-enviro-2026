'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {
      // Proceed to redirect even on fetch error
    }
    router.push('/admin')
  }

  return (
    <header className="flex shrink-0 items-center justify-between bg-gradient-to-br from-navy to-[#005f8c] px-6 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-3">
        <Image
          src="/logos/suds/horizontal-white.png"
          alt="SuDS Enviro"
          width={120}
          height={32}
          className="object-contain"
        />
        <span className="block text-[10px] font-medium uppercase tracking-widest text-white/55">
          Admin Dashboard
        </span>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-bold text-white/80 transition-colors hover:bg-white/15"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </button>
    </header>
  )
}
