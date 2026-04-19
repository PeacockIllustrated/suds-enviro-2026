'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, Send } from 'lucide-react'
import { PRIORITY_ORDER, getPriorityStyle } from '@/lib/review-colors'

interface StructuredRow {
  field: string
  current: string
  suggested: string
}

interface FeedbackSubmission {
  page_url: string
  pin_x: number
  pin_y: number
  comment: string
  priority: string
  category: string
  section: string
  structured_data: StructuredRow[] | null
}

interface CommentFormProps {
  pageUrl: string
  pinX: number
  pinY: number
  author: string
  /**
   * Submit handler. Should return true on success, false (or throw) on failure
   * so the form can re-enable the submit button after an error.
   */
  onSubmit: (data: FeedbackSubmission) => Promise<boolean>
  onCancel: () => void
}

const SECTIONS = [
  'Auto',
  'Hero',
  'Navigation',
  'Products',
  'Footer',
  'Sidebar',
  'Form',
  'Other',
]

const CATEGORIES = [
  { value: 'design', label: 'Design' },
  { value: 'content', label: 'Content' },
  { value: 'product-data', label: 'Product Data' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General' },
]

export function CommentForm({
  pageUrl,
  pinX,
  pinY,
  author,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general')
  const [section, setSection] = useState('Auto')
  const [showStructured, setShowStructured] = useState(false)
  const [structuredRows, setStructuredRows] = useState<StructuredRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the comment field when the form opens
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Esc to cancel anywhere in the form (unless typing in a multi-line textarea
  // and there's content - we don't want to lose work accidentally)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
      // Cmd/Ctrl + Enter submits from anywhere in the form
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (comment.trim() && !submitting) {
          submit()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment, submitting])

  const addStructuredRow = () => {
    setStructuredRows((prev) => [...prev, { field: '', current: '', suggested: '' }])
  }
  const removeStructuredRow = (index: number) => {
    setStructuredRows((prev) => prev.filter((_, i) => i !== index))
  }
  const updateStructuredRow = (
    index: number,
    key: keyof StructuredRow,
    value: string
  ) => {
    setStructuredRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    )
  }

  const submit = async () => {
    if (!comment.trim()) return
    setSubmitting(true)

    const validRows = structuredRows.filter(
      (r) => r.field.trim() || r.current.trim() || r.suggested.trim()
    )

    try {
      const ok = await onSubmit({
        page_url: pageUrl,
        pin_x: pinX,
        pin_y: pinY,
        comment: comment.trim(),
        priority,
        category,
        section,
        structured_data: validRows.length > 0 ? validRows : null,
      })
      // If parent reports a failure, re-enable the button so the user can retry.
      if (!ok) setSubmitting(false)
    } catch {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  return (
    <div className="border-t border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div>
          <h3 className="text-[14px] font-bold text-ink">New Comment</h3>
          <p className="text-[11px] text-muted">
            Pin at ({pinX.toFixed(1)}%, {pinY.toFixed(1)}%) - {author}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          title="Cancel (Esc)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-light hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-h-[400px] overflow-y-auto p-5">
        {/* Page (read-only) */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Page
          </label>
          <div
            className="truncate rounded-lg border border-border bg-light px-3 py-2 text-[12px] text-muted"
            title={pageUrl}
          >
            {pageUrl}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Comment
          </label>
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe the change or issue..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-blue"
            required
          />
          <p className="mt-1 text-[10px] text-muted/60">
            Cmd/Ctrl + Enter to submit, Esc to cancel
          </p>
        </div>

        {/* Priority pills */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_ORDER.map((p) => {
              const style = getPriorityStyle(p)
              const selected = priority === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-bold transition-all
                    ${selected
                      ? `${style.pill} ring-2 ring-offset-1`
                      : 'border-border bg-white text-muted hover:bg-light'}
                  `}
                >
                  {style.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category + Section side-by-side */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-blue"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-blue"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Structured data (collapsible) */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              setShowStructured(!showStructured)
              if (!showStructured && structuredRows.length === 0) addStructuredRow()
            }}
            className="text-[12px] font-semibold text-blue transition-colors hover:text-navy"
          >
            {showStructured ? 'Hide specific detail' : '+ Add specific detail (e.g. spec correction)'}
          </button>

          {showStructured && (
            <div className="mt-3 space-y-3">
              {structuredRows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-light/50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      Detail {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStructuredRow(index)}
                      className="text-muted transition-colors hover:text-red-500"
                      title="Remove detail"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Field (e.g. Diameter)"
                    value={row.field}
                    onChange={(e) => updateStructuredRow(index, 'field', e.target.value)}
                    className="mb-2 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] text-ink outline-none focus:border-blue"
                  />
                  <input
                    type="text"
                    placeholder="Current value"
                    value={row.current}
                    onChange={(e) => updateStructuredRow(index, 'current', e.target.value)}
                    className="mb-2 w-full rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] text-ink outline-none focus:border-blue"
                  />
                  <input
                    type="text"
                    placeholder="Suggested value"
                    value={row.suggested}
                    onChange={(e) => updateStructuredRow(index, 'suggested', e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] text-ink outline-none focus:border-blue"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addStructuredRow}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-blue transition-colors hover:text-navy"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold transition-colors
            ${submitting || !comment.trim()
              ? 'cursor-not-allowed bg-border text-muted'
              : 'bg-green text-white hover:bg-green-d'}
          `}
        >
          <Send className="h-4 w-4" />
          {submitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  )
}
