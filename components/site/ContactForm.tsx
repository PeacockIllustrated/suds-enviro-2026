'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CONTACT_FORM } from '@/lib/content/contact'

/**
 * The Webflow contact form, posting to this app's existing
 * `/api/enquiries` route.
 *
 * That route takes `{ name, email, company?, phone?, notes? }`, so the
 * fields Webflow collects that it has no column for - postcode, the
 * commercial/domestic split and the adoption route - are folded into
 * `notes` rather than changing the enquiries schema.
 */

type Status = 'idle' | 'submitting' | 'sent' | 'error'

const FIELD =
  'w-full rounded-lg border-2 border-site-ui-blue bg-white px-4 py-2.5 text-site-blue-dark outline-none transition-colors focus:border-site-blue'
const LABEL = 'block text-sm font-bold tracking-wide text-white uppercase'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')

    const data = new FormData(event.currentTarget)
    const firstName = String(data.get('firstName') ?? '').trim()
    const lastName = String(data.get('lastName') ?? '').trim()
    const postcode = String(data.get('postcode') ?? '').trim()
    const premises = String(data.get('premises') ?? '')
    const adoption = String(data.get('adoption') ?? '')
    const enquiry = String(data.get('enquiry') ?? '').trim()

    const notes = [
      enquiry,
      postcode ? `Postcode: ${postcode}` : null,
      premises ? `Premises: ${premises}` : null,
      adoption ? `Adoption: ${adoption}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: [firstName, lastName].filter(Boolean).join(' '),
          email: String(data.get('email') ?? '').trim(),
          notes,
        }),
      })

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null)
        const detail =
          body && typeof body === 'object' && 'error' in body
            ? String((body as { error: unknown }).error)
            : CONTACT_FORM.error
        setMessage(detail)
        setStatus('error')
        return
      }

      setStatus('sent')
    } catch {
      setMessage(CONTACT_FORM.error)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-white/10 p-8 text-center text-white">
        <p className="text-xl font-bold">{CONTACT_FORM.success.title}</p>
        <p className="mx-auto mt-3 max-w-xl text-base/relaxed text-white/90">
          {CONTACT_FORM.success.body}
        </p>
        <Link
          href={CONTACT_FORM.success.cta.href}
          className="mt-6 inline-flex rounded-full border-[3px] border-site-green px-7 py-2.5 text-sm font-bold italic tracking-wider text-white uppercase transition-colors hover:bg-site-green"
        >
          {CONTACT_FORM.success.cta.label}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 text-left">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="firstName">
            First name
          </label>
          <input id="firstName" name="firstName" type="text" className={`${FIELD} mt-2`} />
        </div>
        <div>
          <label className={LABEL} htmlFor="lastName">
            Last name
          </label>
          <input id="lastName" name="lastName" type="text" className={`${FIELD} mt-2`} />
        </div>
        <div>
          <label className={LABEL} htmlFor="email">
            Email address
          </label>
          <input id="email" name="email" type="email" required className={`${FIELD} mt-2`} />
        </div>
        <div>
          <label className={LABEL} htmlFor="postcode">
            Postcode
          </label>
          <input id="postcode" name="postcode" type="text" className={`${FIELD} mt-2`} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className={LABEL}>Commercial or domestic?</legend>
          <div className="mt-2 flex gap-6 text-white">
            {['Commercial', 'Domestic'].map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input type="radio" name="premises" value={option} className="accent-site-green" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={LABEL}>Choose your solution</legend>
          <div className="mt-2 flex gap-6 text-white">
            {['Adoptable', 'Non-adoptable'].map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input type="radio" name="adoption" value={option} className="accent-site-green" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label className={LABEL} htmlFor="enquiry">
          How can we help?
        </label>
        <textarea id="enquiry" name="enquiry" rows={5} className={`${FIELD} mt-2`} />
      </div>

      {status === 'error' ? (
        <p role="alert" className="rounded-lg bg-site-red/20 px-4 py-3 text-sm text-white">
          {message}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex rounded-full border-[3px] border-white bg-white px-8 py-2.5 text-sm font-bold italic tracking-wider text-site-blue uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending' : 'Send enquiry'}
        </button>
      </div>
    </form>
  )
}
