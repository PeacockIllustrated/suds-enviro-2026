'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Server, AlertTriangle, Database, Inbox, Archive } from 'lucide-react'

interface SystemInfo {
  version: string
  supabaseConnected: boolean
  configCount: number
  enquiryCount: number
}

export default function SettingsPage() {
  const router = useRouter()

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // System info
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [systemLoading, setSystemLoading] = useState(true)

  // Archive
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [archiveMessage, setArchiveMessage] = useState<string | null>(null)

  const loadSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      if (!res.ok) throw new Error('Failed to load')

      const stats: {
        total_configurations: number
        total_enquiries: number
      } = await res.json()

      setSystemInfo({
        version: '1.0.0',
        supabaseConnected: true,
        configCount: stats.total_configurations,
        enquiryCount: stats.total_enquiries,
      })
    } catch {
      setSystemInfo({
        version: '1.0.0',
        supabaseConnected: false,
        configCount: 0,
        enquiryCount: 0,
      })
    } finally {
      setSystemLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadSystemInfo()
  }, [loadSystemInfo])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      const data: { success?: boolean; error?: string } = await res.json()

      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' })
      } else {
        setPasswordMessage({ type: 'success', text: 'Password validated successfully. Note: runtime password changes require environment variable updates.' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleArchive = async () => {
    setArchiveLoading(true)
    setArchiveMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'DELETE',
      })

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      const data: { archived?: number; error?: string } = await res.json()

      if (!res.ok) {
        setArchiveMessage(data.error || 'Failed to archive configurations')
      } else {
        setArchiveMessage(`Archived ${data.archived ?? 0} draft configurations older than 30 days`)
        setArchiveConfirmOpen(false)
        loadSystemInfo()
      }
    } catch {
      setArchiveMessage('Failed to archive configurations')
    } finally {
      setArchiveLoading(false)
    }
  }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-muted">
          Admin account and system configuration
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Account section */}
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-navy" />
              <h2 className="text-[14px] font-extrabold text-ink">Account</h2>
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Change your admin password
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-blue"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-blue"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-blue"
                  required
                />
              </div>

              {passwordMessage && (
                <div
                  className={`rounded-lg border px-3.5 py-2.5 text-[12px] font-semibold ${
                    passwordMessage.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-green/25 bg-green/10 text-green-d'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="rounded-lg bg-navy px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#003a55] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* System info */}
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-navy" />
              <h2 className="text-[14px] font-extrabold text-ink">System Info</h2>
            </div>
          </div>
          <div className="p-6">
            {systemLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                Loading...
              </div>
            ) : systemInfo ? (
              <div className="space-y-3">
                <InfoRow label="App Version" value={systemInfo.version} />
                <InfoRow
                  label="Supabase Connection"
                  value={
                    <span className={`flex items-center gap-1.5 text-[13px] font-bold ${
                      systemInfo.supabaseConnected ? 'text-green-d' : 'text-red-600'
                    }`}>
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        systemInfo.supabaseConnected ? 'bg-green' : 'bg-red-500'
                      }`} />
                      {systemInfo.supabaseConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  }
                />
                <InfoRow
                  label="Configurations"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-muted" />
                      {systemInfo.configCount}
                    </span>
                  }
                />
                <InfoRow
                  label="Enquiries"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Inbox className="h-3.5 w-3.5 text-muted" />
                      {systemInfo.enquiryCount}
                    </span>
                  }
                />
                <InfoRow label="Last Backup" value="N/A" />
              </div>
            ) : null}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border-2 border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-[14px] font-extrabold text-red-700">Danger Zone</h2>
            </div>
            <p className="mt-1 text-[12px] text-red-600/70">
              These actions are destructive and cannot be undone
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] font-bold text-ink">
                  Archive Draft Configurations
                </div>
                <div className="mt-0.5 text-[12px] text-muted">
                  Archive all draft configurations older than 30 days. This helps clean up abandoned sessions.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArchiveConfirmOpen(true)}
                className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                <span className="flex items-center gap-1.5">
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </span>
              </button>
            </div>

            {archiveMessage && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] font-semibold text-amber-800">
                {archiveMessage}
              </div>
            )}
          </div>
        </section>

        {/* Archive confirmation dialog */}
        {archiveConfirmOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setArchiveConfirmOpen(false)}
            />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-6 shadow-xl">
              <h3 className="text-[15px] font-extrabold text-ink">
                Confirm Archive
              </h3>
              <p className="mt-2 text-[13px] text-muted">
                This will archive all draft configurations that are older than 30 days.
                Archived configurations will be marked as &quot;archived&quot; and will no longer appear in the main list.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setArchiveConfirmOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-light"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={archiveLoading}
                  onClick={handleArchive}
                  className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {archiveLoading ? 'Archiving...' : 'Yes, Archive'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-[12px] font-semibold text-muted">{label}</span>
      <span className="text-[13px] font-bold text-ink">{typeof value === 'string' ? value : value}</span>
    </div>
  )
}
