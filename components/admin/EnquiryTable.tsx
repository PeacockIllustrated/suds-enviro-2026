'use client'

import { StatusBadge } from './StatusBadge'

export interface EnquiryRow {
  id: string
  created_at: string
  name: string
  email: string
  company: string | null
  product_code: string | null
  product_type: string | null
  status: string
  admin_notes: string | null
}

interface EnquiryTableProps {
  enquiries: EnquiryRow[]
  onSelect: (enquiry: EnquiryRow) => void
  onStatusChange: (id: string, status: string) => void
}

const STATUS_OPTIONS = ['new', 'reviewed', 'quoted', 'closed']

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function EnquiryTable({ enquiries, onSelect, onStatusChange }: EnquiryTableProps) {
  if (enquiries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-12 text-center">
        <div className="text-sm font-semibold text-muted">
          No enquiries found
        </div>
        <div className="mt-1 text-[12px] text-muted/70">
          Enquiries will appear here when customers submit configurations.
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-border bg-light">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Date
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Email
              </th>
              <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted md:table-cell">
                Company
              </th>
              <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted lg:table-cell">
                Product
              </th>
              <th className="hidden px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted lg:table-cell">
                Code
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry, index) => (
              <tr
                key={enquiry.id}
                onClick={() => onSelect(enquiry)}
                className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-blue/5 ${
                  index % 2 === 1 ? 'bg-light/50' : 'bg-white'
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(enquiry.created_at)}
                </td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {enquiry.name}
                </td>
                <td className="px-4 py-3 text-muted">
                  {enquiry.email}
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {enquiry.company || '-'}
                </td>
                <td className="hidden px-4 py-3 text-muted capitalize lg:table-cell">
                  {enquiry.product_type || '-'}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  {enquiry.product_code ? (
                    <span className="rounded bg-navy/8 px-2 py-0.5 font-mono text-[11px] font-bold text-navy">
                      {enquiry.product_code}
                    </span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={enquiry.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={enquiry.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation()
                      onStatusChange(enquiry.id, e.target.value)
                    }}
                    className="rounded-md border border-border bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none transition-colors focus:border-blue"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
