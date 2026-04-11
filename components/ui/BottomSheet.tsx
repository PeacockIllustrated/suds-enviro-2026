'use client'

import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  return (
    <>
      {/* Scrim overlay */}
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[201] max-h-[55%] overflow-y-auto rounded-t-2xl bg-white p-4 transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-border" />
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          {title}
        </div>
        {children}
      </div>
    </>
  )
}
