/**
 * Send email notification to admin when a new enquiry is submitted.
 * Uses Resend for email delivery.
 */

import { Resend } from 'resend'

interface EnquiryNotificationParams {
  enquiryId: string
  name: string
  email: string
  company: string | null
  phone: string | null
  notes: string | null
  productCode: string
  quoteRef: string | null
  configId: string | null
}

function buildEmailHTML(params: EnquiryNotificationParams): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://configurator.sudsenviro.com'

  const rows = [
    { label: 'Name', value: params.name },
    { label: 'Email', value: params.email },
    { label: 'Company', value: params.company || '-' },
    { label: 'Phone', value: params.phone || '-' },
    { label: 'Notes', value: params.notes || '-' },
  ]

  const customerRows = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;font-weight:600;color:#5a7a90;border-bottom:1px solid #e8f0f5;width:120px;">${r.label}</td>
          <td style="padding:8px 12px;color:#0f2535;border-bottom:1px solid #e8f0f5;">${escapeHtml(r.value)}</td>
        </tr>`
    )
    .join('')

  const links: string[] = []
  links.push(`<a href="${siteUrl}/admin/dashboard" style="display:inline-block;padding:10px 20px;background:#004d70;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">View in Dashboard</a>`)
  if (params.configId) {
    links.push(`<a href="${siteUrl}/api/pdf/${params.configId}" style="display:inline-block;padding:10px 20px;background:#1a82a2;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-left:8px;">View Spec Sheet</a>`)
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Montserrat',Helvetica,Arial,sans-serif;background:#f0f6fa;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#004d70;padding:20px 24px;border-radius:10px 10px 0 0;">
      <div style="font-size:20px;font-weight:800;color:white;">SuDS Enviro</div>
      <div style="font-size:12px;color:#7ab8d4;margin-top:2px;">Chamber Configurator</div>
    </div>
    <div style="background:white;padding:24px;border:1px solid #ccdde8;border-top:none;border-radius:0 0 10px 10px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#004d70;">New Enquiry Received</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#5a7a90;">A new enquiry has been submitted via the configurator.</p>

      ${params.quoteRef ? `<div style="background:#44af43;color:white;padding:8px 14px;border-radius:6px;display:inline-block;font-weight:700;font-size:13px;margin-bottom:16px;">Ref: ${escapeHtml(params.quoteRef)}</div>` : ''}

      <div style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#5a7a90;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Product</div>
        <div style="font-size:15px;font-weight:700;color:#0f2535;">${escapeHtml(params.productCode)}</div>
      </div>

      <div style="font-size:11px;font-weight:700;color:#5a7a90;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Customer Details</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
        ${customerRows}
      </table>

      <div style="margin-top:20px;">
        ${links.join('\n        ')}
      </div>
    </div>
    <div style="text-align:center;padding:16px;font-size:11px;color:#5a7a90;">
      SuDS Enviro Ltd | 9 Ambleside Court, Chester-le-Street DH3 2EB | 01224 057 700
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendEnquiryNotification(
  params: EnquiryNotificationParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - skipping enquiry notification email')
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'hello@sudsenviro.com'
  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: 'SuDS Enviro Configurator <noreply@sudsenviro.com>',
      to: adminEmail,
      subject: `New Enquiry: ${params.productCode}${params.quoteRef ? ` (${params.quoteRef})` : ''} - ${params.name}`,
      html: buildEmailHTML(params),
    })
  } catch (err) {
    console.error('Failed to send enquiry notification:', err)
  }
}
