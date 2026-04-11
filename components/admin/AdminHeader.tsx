'use client'

import { useRouter } from 'next/navigation'
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/12">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
        <div className="leading-tight">
          <strong className="block text-[15px] font-extrabold tracking-tight text-white">
            SuDS Enviro
          </strong>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-white/55">
            Admin Dashboard
          </span>
        </div>
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
