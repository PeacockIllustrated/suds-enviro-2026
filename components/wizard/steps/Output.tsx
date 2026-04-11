'use client'

import { useForm } from 'react-hook-form'
import { Download, Send, Mail } from 'lucide-react'
import { useWizardContext } from '../WizardContext'
import { generateProductCode } from '@/lib/rule-engine'

interface EnquiryForm {
  name: string
  company: string
  email: string
  notes: string
}

export function Output() {
  const { state, dispatch } = useWizardContext()
  const productCode = generateProductCode(state)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryForm>()

  const onSubmit = (data: EnquiryForm) => {
    // Phase 1: log to console
    console.log('Enquiry submitted:', { ...data, productCode, state })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <>
      <p className="-mt-4 mb-5 text-xs font-normal leading-relaxed text-muted">
        Your {productCode} specification is ready. Choose an option below.
      </p>

      {/* PDF Download Card */}
      <div className="mb-2.5 rounded-xl border border-border bg-white p-4 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-3 flex gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-navy/10">
            <Download className="h-5 w-5 text-navy" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-ink">
              Specification Sheet
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Download the full technical spec and engineering drawing as a PDF.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            // Phase 1 placeholder: open reference drawing
            window.open('/reference/suds-drawing-v4.html', '_blank')
          }}
          className="block w-full rounded-lg bg-navy py-3 text-center text-[13px] font-bold text-white"
        >
          Download Spec Sheet
        </button>
      </div>

      {/* Enquiry Card */}
      <div className="mb-2.5 rounded-xl border border-border bg-white p-4 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-3 flex gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-blue/10">
            <Send className="h-5 w-5 text-blue" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-ink">
              Submit Enquiry
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Send your configuration to SuDS Enviro for a quote. Your spec is
              automatically attached.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Name *
          </label>
          <input
            {...register('name', { required: true })}
            className="mb-2.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="Your name"
          />

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Company
          </label>
          <input
            {...register('company')}
            className="mb-2.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="Company name"
          />

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Email *
          </label>
          <input
            {...register('email', {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
            type="email"
            className="mb-2.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="your@email.com"
          />

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
            Additional notes
          </label>
          <textarea
            {...register('notes')}
            className="mb-3 h-[72px] w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue"
            placeholder="Any additional requirements..."
          />

          <button
            type="submit"
            className="block w-full rounded-lg bg-light py-3 text-center text-[13px] font-bold text-navy border border-border"
          >
            Submit Enquiry
          </button>
        </form>
      </div>

      {/* Share Card */}
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-[0_2px_12px_rgba(0,77,112,0.10)] opacity-60">
        <div className="mb-3 flex gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-green/10">
            <Mail className="h-5 w-5 text-green" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-extrabold text-ink">
              Share via Email
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Send a link to this configuration to a colleague or client.
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-light py-3 text-center text-[11px] font-semibold text-muted border border-border">
          Coming in Phase 2
        </div>
      </div>

      {/* Reset link */}
      <button
        type="button"
        onClick={handleReset}
        className="mb-4 block w-full text-center text-xs font-bold text-blue"
      >
        Start a new configuration
      </button>
    </>
  )
}
