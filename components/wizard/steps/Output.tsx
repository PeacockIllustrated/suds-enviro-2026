'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Download, Mail, Copy, Check } from 'lucide-react'
import { useWizardContext } from '../WizardContext'
import { generateProductCode } from '@/lib/rule-engine'
import { getSessionId } from '@/lib/supabase'
import type { SubmitEnquiryPayload, SubmitEnquiryResponse } from '@/lib/types'

interface EnquiryForm {
  name: string
  company: string
  email: string
  phone: string
  notes: string
}

export function Output() {
  const { state, dispatch } = useWizardContext()
  const productCode = generateProductCode(state)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [quoteRef, setQuoteRef] = useState<string | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryForm>()

  const onSubmit = async (data: EnquiryForm) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      // Ensure we have a sessionId for tracking
      getSessionId()

      const payload: SubmitEnquiryPayload = {
        configurationId: state.configId,
        name: data.name,
        company: data.company || undefined,
        email: data.email,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      }

      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error((errorBody as { error?: string }).error || 'Failed to submit enquiry')
      }

      const result: SubmitEnquiryResponse = await response.json()
      console.log('Enquiry submitted:', result.enquiryId)

      // Try to get the quote reference for display
      if (state.configId) {
        try {
          const statusRes = await fetch(`/api/status/${encodeURIComponent(`SE-Q-${new Date().getFullYear()}-${state.configId.slice(0, 4).toUpperCase()}`)}`)
          if (statusRes.ok) {
            const statusData = await statusRes.json() as { quote_ref?: string }
            if (statusData.quote_ref) {
              setQuoteRef(statusData.quote_ref)
            }
          }
        } catch {
          // Non-critical - quote ref display is optional
        }
      }

      setSubmitted(true)
      setSuccessMessage('Your enquiry has been submitted. We will be in touch shortly.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
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
        {state.configId ? (
          <button
            type="button"
            onClick={() => {
              window.open(`/api/pdf/${state.configId}`, '_blank')
            }}
            className="block w-full rounded-lg bg-navy py-3 text-center text-[13px] font-bold text-white"
          >
            Download Spec Sheet
          </button>
        ) : (
          <div className="rounded-lg bg-light py-3 text-center text-[11px] font-semibold text-muted border border-border">
            Save your configuration first to download the spec sheet
          </div>
        )}
      </div>

      {/* Enquiry Card */}
      <div className="mb-2.5 rounded-xl border border-border bg-white p-4 shadow-[0_2px_12px_rgba(0,77,112,0.10)]">
        <div className="mb-3 flex gap-3">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-blue/10">
            <Image
              src="/logos/suds/icon-main.png"
              alt="SuDS Enviro"
              width={24}
              height={24}
              className="object-contain"
            />
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

        {/* Success message */}
        {successMessage && (
          <div className="mb-3 rounded-lg border border-green/30 bg-green/10 px-3.5 py-2.5 text-[12px] font-semibold text-green-d">
            {successMessage}
          </div>
        )}

        {/* Quote reference display */}
        {quoteRef && (
          <div className="mb-3 rounded-lg border border-navy/20 bg-navy/5 px-3.5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
              Your Reference Number
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-extrabold text-navy tracking-wide">
                {quoteRef}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(quoteRef).then(() => {
                    setCopiedRef(true)
                    setTimeout(() => setCopiedRef(false), 2000)
                  }).catch(() => { /* clipboard not available */ })
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-navy transition-colors"
                title="Copy reference"
              >
                {copiedRef ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-1 text-[10px] text-muted">
              Note this reference to check your configuration status later.
            </div>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={submitted}>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Name *
            </label>
            <input
              {...register('name', { required: true })}
              className={`mb-2.5 w-full rounded-lg border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue ${
                errors.name ? 'border-red-400' : 'border-border'
              } ${submitted ? 'opacity-60' : ''}`}
              placeholder="Your name"
            />

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Company
            </label>
            <input
              {...register('company')}
              className={`mb-2.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue ${
                submitted ? 'opacity-60' : ''
              }`}
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
              className={`mb-2.5 w-full rounded-lg border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue ${
                errors.email ? 'border-red-400' : 'border-border'
              } ${submitted ? 'opacity-60' : ''}`}
              placeholder="your@email.com"
            />

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className={`mb-2.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue ${
                submitted ? 'opacity-60' : ''
              }`}
              placeholder="Phone number"
            />

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted">
              Additional notes
            </label>
            <textarea
              {...register('notes')}
              className={`mb-3 h-[72px] w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 font-sans text-[13px] text-ink outline-none transition-colors focus:border-blue ${
                submitted ? 'opacity-60' : ''
              }`}
              placeholder="Any additional requirements..."
            />

            <button
              type="submit"
              disabled={submitting || submitted}
              className={`block w-full rounded-lg py-3 text-center text-[13px] font-bold border transition-colors ${
                submitted
                  ? 'border-green/30 bg-green/10 text-green-d cursor-default'
                  : submitting
                    ? 'border-border bg-light text-muted cursor-wait'
                    : 'border-border bg-light text-navy hover:bg-border/50'
              }`}
            >
              {submitted ? 'Enquiry Submitted' : submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </fieldset>
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
