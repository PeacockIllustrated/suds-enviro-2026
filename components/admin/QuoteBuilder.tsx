'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface QuoteData {
  id: string
  quote_ref: string
  customer_name: string
  customer_email: string
  customer_company: string | null
  line_items: LineItem[]
  subtotal: number
  vat_rate: number
  vat: number
  total: number
  valid_until: string | null
  notes: string | null
  terms: string
  status: string
  configuration_id: string | null
  enquiry_id: string | null
}

interface QuoteBuilderProps {
  quoteId: string | null
  onClose: () => void
  onSaved: () => void
}

const DEFAULT_LINE_ITEMS: LineItem[] = [
  { description: 'HDPE Chamber Body - Rotationally Moulded', quantity: 1, unitPrice: 0, total: 0 },
  { description: 'Shaft Extension Rings - HDPE', quantity: 1, unitPrice: 0, total: 0 },
  { description: 'D400 Cover and Frame - Ductile Iron BS EN 124', quantity: 1, unitPrice: 0, total: 0 },
  { description: 'EPDM Pipe Sealing Rings', quantity: 4, unitPrice: 0, total: 0 },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

export function QuoteBuilder({ quoteId, onClose, onSaved }: QuoteBuilderProps) {
  const [loading, setLoading] = useState(!!quoteId)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>(DEFAULT_LINE_ITEMS)
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState(
    'Payment terms: 30 days from date of invoice. Prices exclude delivery unless stated. Quote valid for the period shown above.'
  )
  const [validDays, setValidDays] = useState(30)
  const [quoteRef, setQuoteRef] = useState('')
  const [status, setStatus] = useState('draft')
  const [configurationId, setConfigurationId] = useState<string | null>(null)
  const [enquiryId, setEnquiryId] = useState<string | null>(null)

  const loadQuote = useCallback(async () => {
    if (!quoteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`)
      if (!res.ok) throw new Error('Failed to load quote')
      const data = await res.json() as { quote: QuoteData }
      const q = data.quote
      setCustomerName(q.customer_name)
      setCustomerEmail(q.customer_email)
      setCustomerCompany(q.customer_company || '')
      setLineItems(q.line_items)
      setNotes(q.notes || '')
      setTerms(q.terms)
      setQuoteRef(q.quote_ref)
      setStatus(q.status)
      setConfigurationId(q.configuration_id)
      setEnquiryId(q.enquiry_id)
      if (q.valid_until) {
        const validDate = new Date(q.valid_until)
        const now = new Date()
        const diffMs = validDate.getTime() - now.getTime()
        setValidDays(Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote')
    } finally {
      setLoading(false)
    }
  }, [quoteId])

  useEffect(() => {
    loadQuote()
  }, [loadQuote])

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const vatRate = 20
  const vat = Math.round(subtotal * (vatRate / 100) * 100) / 100
  const total = Math.round((subtotal + vat) * 100) / 100

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index] }

      if (field === 'description') {
        item.description = value as string
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0
        item.total = Math.round(item.quantity * item.unitPrice * 100) / 100
      } else if (field === 'unitPrice') {
        item.unitPrice = Number(value) || 0
        item.total = Math.round(item.quantity * item.unitPrice * 100) / 100
      }

      updated[index] = item
      return updated
    })
  }

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ])
  }

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError(null)
    setSaving(true)

    try {
      if (!customerName.trim() || !customerEmail.trim()) {
        throw new Error('Customer name and email are required')
      }

      if (lineItems.length === 0) {
        throw new Error('At least one line item is required')
      }

      if (quoteId) {
        // Update existing quote
        const res = await fetch(`/api/admin/quotes/${quoteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineItems,
            notes: notes || null,
            terms,
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: string }).error || 'Failed to update quote')
        }
      } else {
        // Create new quote
        const res = await fetch('/api/admin/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            configurationId,
            enquiryId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerCompany: customerCompany.trim() || undefined,
            lineItems,
            notes: notes || undefined,
            validDays,
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: string }).error || 'Failed to create quote')
        }
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!quoteId) return
    if (!confirm('Send this quote to the customer via email?')) return

    setSending(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Failed to send quote')
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quote')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          <p className="text-[13px] font-semibold text-muted">Loading quote...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-light hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-ink">
              {quoteId ? `Edit Quote${quoteRef ? ` - ${quoteRef}` : ''}` : 'Create Quote'}
            </h2>
            {status !== 'draft' && (
              <span className="text-xs font-semibold text-muted">
                Status: {status}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quoteId && status === 'draft' && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-green-d disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {sending ? 'Sending...' : 'Send to Customer'}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer info */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="mb-4 text-[13px] font-extrabold text-ink">Customer Details</h3>

            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={!!quoteId}
              className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-blue disabled:opacity-60"
              placeholder="Customer name"
            />

            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Email *
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              disabled={!!quoteId}
              className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-blue disabled:opacity-60"
              placeholder="customer@example.com"
            />

            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Company
            </label>
            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              disabled={!!quoteId}
              className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-blue disabled:opacity-60"
              placeholder="Company name"
            />

            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Valid for (days)
            </label>
            <input
              type="number"
              value={validDays}
              onChange={(e) => setValidDays(Math.max(1, parseInt(e.target.value) || 30))}
              className="mb-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-blue"
              min={1}
            />

            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mb-3 h-20 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-blue"
              placeholder="Internal or customer-facing notes..."
            />
          </div>
        </div>

        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[13px] font-extrabold text-ink">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1.5 rounded-lg bg-light px-3 py-1.5 text-[11px] font-bold text-navy transition-colors hover:bg-border/50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                      Description
                    </th>
                    <th className="w-20 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted">
                      Qty
                    </th>
                    <th className="w-28 px-2 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                      Unit Price
                    </th>
                    <th className="w-28 px-2 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                      Total
                    </th>
                    <th className="w-10 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(idx, 'description', e.target.value)
                          }
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-ink outline-none transition-colors hover:border-border focus:border-blue"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(idx, 'quantity', e.target.value)
                          }
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-center text-[13px] text-ink outline-none transition-colors hover:border-border focus:border-blue"
                          min={0}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(idx, 'unitPrice', e.target.value)
                          }
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-right text-[13px] text-ink outline-none transition-colors hover:border-border focus:border-blue"
                          min={0}
                          step={0.01}
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-[13px] font-semibold text-ink">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="flex h-7 w-7 items-center justify-center rounded text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted font-semibold">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted font-semibold">VAT (20%)</span>
                    <span className="font-semibold">{formatCurrency(vat)}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-navy px-3 py-2.5 text-white">
                    <span className="text-[15px] font-extrabold">Total</span>
                    <span className="text-[15px] font-extrabold">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4 rounded-xl border border-border bg-white p-5">
            <h3 className="mb-3 text-[13px] font-extrabold text-ink">Terms and Conditions</h3>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="h-20 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[12px] text-ink outline-none focus:border-blue"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
