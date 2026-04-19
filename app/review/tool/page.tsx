'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, AlertTriangle } from 'lucide-react'
import { PhoneFrame } from '@/components/review/PhoneFrame'
import { FeedbackPanel } from '@/components/review/FeedbackPanel'
import { CommentForm } from '@/components/review/CommentForm'

interface FeedbackItem {
  id: string
  created_at: string
  author: string
  page_url: string
  page_title: string | null
  section: string | null
  pin_x: number | null
  pin_y: number | null
  comment: string
  priority: string
  category: string
  status: string
  structured_data: Array<{
    field: string
    current: string
    suggested: string
  }> | null
}

interface FeedbackSubmission {
  page_url: string
  pin_x: number
  pin_y: number
  comment: string
  priority: string
  category: string
  section: string
  structured_data: Array<{
    field: string
    current: string
    suggested: string
  }> | null
}

interface Toast {
  message: string
  type: 'error' | 'success'
}

export default function ReviewToolPage() {
  const router = useRouter()
  const [author, setAuthor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState('/')
  const [commentMode, setCommentMode] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  // Auto-dismiss toasts after 4s
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Server-verified auth check (cookie is the source of truth, not sessionStorage)
  useEffect(() => {
    let cancelled = false
    const verify = async () => {
      try {
        const res = await fetch('/api/review/auth')
        if (cancelled) return
        if (!res.ok) {
          sessionStorage.removeItem('se-reviewer-name')
          router.push('/review')
          return
        }
        const data: { author?: string } = await res.json().catch(() => ({}))
        if (!data.author) {
          router.push('/review')
          return
        }
        setAuthor(data.author)
        // Keep sessionStorage in sync for the login page UX
        sessionStorage.setItem('se-reviewer-name', data.author)
        setLoading(false)
      } catch {
        if (!cancelled) router.push('/review')
      }
    }
    void verify()
    return () => {
      cancelled = true
    }
  }, [router])

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch('/api/review/feedback')
      if (res.status === 401) {
        router.push('/review')
        return
      }
      if (!res.ok) return
      const data: { feedback: FeedbackItem[] } = await res.json()
      setFeedback(data.feedback)
    } catch {
      // Silent
    }
  }, [router])

  useEffect(() => {
    if (!loading && author) {
      void fetchFeedback()
    }
  }, [loading, author, fetchFeedback])

  const handlePinPlace = (x: number, y: number) => {
    setPendingPin({ x, y })
    setShowCommentForm(true)
    setCommentMode(false)
    setExpandedId(null)
  }

  const handleUrlChange = useCallback((url: string) => {
    setCurrentUrl(url)
    // Clear any selected pin when navigating to a new page
    setExpandedId(null)
  }, [])

  const handleToggleCommentMode = () => {
    setCommentMode((prev) => !prev)
    if (showCommentForm) {
      setShowCommentForm(false)
      setPendingPin(null)
    }
    if (!commentMode) setExpandedId(null)
  }

  const handlePinClick = (id: string) => {
    setExpandedId(id)
    setShowCommentForm(false)
  }

  const handleCommentSubmit = useCallback(
    async (data: FeedbackSubmission): Promise<boolean> => {
      if (!author) return false
      try {
        const res = await fetch('/api/review/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, author }),
        })

        if (res.status === 401) {
          router.push('/review')
          return false
        }
        if (res.ok) {
          setShowCommentForm(false)
          setPendingPin(null)
          setToast({ message: 'Comment saved', type: 'success' })
          await fetchFeedback()
          return true
        }
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        setToast({ message: errData.error || 'Failed to save comment', type: 'error' })
        return false
      } catch {
        setToast({ message: 'Network error - could not save comment', type: 'error' })
        return false
      }
    },
    [author, fetchFeedback, router]
  )

  const handleCommentCancel = () => {
    setShowCommentForm(false)
    setPendingPin(null)
  }

  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/review/feedback/${id}`, { method: 'DELETE' })
        if (res.status === 401) {
          router.push('/review')
          return false
        }
        if (res.ok) {
          setToast({ message: 'Comment deleted', type: 'success' })
          await fetchFeedback()
          return true
        }
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        setToast({ message: errData.error || 'Failed to delete', type: 'error' })
        return false
      } catch {
        setToast({ message: 'Network error - could not delete', type: 'error' })
        return false
      }
    },
    [fetchFeedback, router]
  )

  const handleLogout = async () => {
    try {
      await fetch('/api/review/auth', { method: 'DELETE' })
    } catch {
      // Proceed regardless
    }
    sessionStorage.removeItem('se-reviewer-name')
    router.push('/review')
  }

  // Build pins for the phone frame (current page only)
  const phonePins = feedback
    .filter(
      (f) =>
        f.page_url === currentUrl &&
        f.pin_x !== null &&
        f.pin_y !== null
    )
    .map((f) => ({
      id: f.id,
      x: f.pin_x as number,
      y: f.pin_y as number,
      priority: f.priority,
    }))

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-light">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-[13px] font-semibold text-muted">
            Loading review tool...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col bg-light">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/suds/horizontal-colour.png"
            alt="SuDS Enviro"
            width={120}
            height={32}
            className="object-contain"
          />
          <div className="h-5 w-px bg-border" />
          <span className="text-[13px] font-bold text-ink">Review Tool</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-muted">
            {author}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-[12px] font-semibold text-muted transition-colors hover:bg-light hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* Phone frame area */}
        <div className="flex shrink-0 items-start justify-center overflow-y-auto px-6 py-6">
          <PhoneFrame
            src="/"
            commentMode={commentMode}
            pins={phonePins}
            selectedPinId={expandedId}
            onPinPlace={handlePinPlace}
            onPinClick={handlePinClick}
            onUrlChange={handleUrlChange}
          />
        </div>

        {/* Feedback panel */}
        <div className="flex min-w-0 flex-1 flex-col border-l border-border">
          <div className="flex-1 overflow-hidden">
            <FeedbackPanel
              currentUrl={currentUrl}
              author={author || ''}
              commentMode={commentMode}
              onToggleCommentMode={handleToggleCommentMode}
              pins={feedback}
              onRefresh={fetchFeedback}
              expandedId={expandedId}
              onSetExpandedId={setExpandedId}
              onDelete={handleDelete}
            />
          </div>

          {/* Comment form (slides up from bottom of panel) */}
          {showCommentForm && pendingPin && author && (
            <CommentForm
              key={`${pendingPin.x}-${pendingPin.y}`}
              pageUrl={currentUrl}
              pinX={pendingPin.x}
              pinY={pendingPin.y}
              author={author}
              onSubmit={handleCommentSubmit}
              onCancel={handleCommentCancel}
            />
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-4 py-2.5 shadow-lg
            ${toast.type === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-green/30 bg-green/10 text-green-d'}
          `}
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
