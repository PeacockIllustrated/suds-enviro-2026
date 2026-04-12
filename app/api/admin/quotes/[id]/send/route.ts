import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { generateQuoteHTML } from '@/lib/pdf/quote-template'
import { Resend } from 'resend'
import type { QuoteLineItem } from '@/lib/pdf/quote-template'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const { id } = await params
  const supabase = getSupabaseServer()

  // Fetch the quote
  const { data: quote, error } = await supabase
    .from('se_quotes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  // Check Resend API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Email service not configured. Set RESEND_API_KEY.' },
      { status: 500 }
    )
  }

  // Get product code from linked configuration
  let productCode = 'N/A'
  let productSummary = ''
  if (quote.configuration_id) {
    const { data: config } = await supabase
      .from('se_configurations')
      .select('product_code, product_data')
      .eq('id', quote.configuration_id as string)
      .single()

    if (config) {
      productCode = (config.product_code as string) || 'N/A'
      const pd = config.product_data as { kind?: string; data?: { diameter?: number; depth?: number; inletCount?: number } } | null
      if (pd?.data) {
        const parts: string[] = []
        if (pd.data.diameter) parts.push(`${pd.data.diameter}mm`)
        if (pd.kind) {
          const labels: Record<string, string> = { chamber: 'Inspection Chamber', catchpit: 'Catchpit' }
          parts.push(labels[pd.kind] || pd.kind)
        }
        if (pd.data.depth) parts.push(`${pd.data.depth}mm depth`)
        if (pd.data.inletCount) parts.push(`${pd.data.inletCount} inlet${pd.data.inletCount > 1 ? 's' : ''}`)
        productSummary = parts.join(', ')
      }
    }
  }

  // Generate quote HTML
  const lineItems = (quote.line_items as QuoteLineItem[]) || []
  const quoteHTML = generateQuoteHTML({
    quoteRef: quote.quote_ref as string,
    date: new Date().toISOString(),
    validUntil: (quote.valid_until as string) || '',
    customerName: quote.customer_name as string,
    customerEmail: quote.customer_email as string,
    customerCompany: (quote.customer_company as string) || null,
    productCode,
    productSummary,
    lineItems,
    subtotal: Number(quote.subtotal) || 0,
    vatRate: Number(quote.vat_rate) || 20,
    vat: Number(quote.vat) || 0,
    total: Number(quote.total) || 0,
    notes: (quote.notes as string) || null,
    terms: (quote.terms as string) || '',
  })

  // Send email
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://configurator.sudsenviro.com'

  try {
    await resend.emails.send({
      from: 'SuDS Enviro <noreply@sudsenviro.com>',
      to: quote.customer_email as string,
      subject: `Your Quote from SuDS Enviro - ${quote.quote_ref as string}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Montserrat',Helvetica,Arial,sans-serif;background:#f0f6fa;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#004d70;padding:20px 24px;border-radius:10px 10px 0 0;">
      <div style="font-size:20px;font-weight:800;color:white;">SuDS Enviro</div>
      <div style="font-size:12px;color:#7ab8d4;margin-top:2px;">Chamber Configurator</div>
    </div>
    <div style="background:white;padding:24px;border:1px solid #ccdde8;border-top:none;border-radius:0 0 10px 10px;">
      <h2 style="margin:0 0 4px;font-size:18px;color:#004d70;">Your Quotation is Ready</h2>
      <p style="margin:0 0 16px;font-size:13px;color:#5a7a90;">
        Dear ${quote.customer_name as string}, please find your quotation details below.
      </p>
      <div style="background:#44af43;color:white;padding:8px 14px;border-radius:6px;display:inline-block;font-weight:700;font-size:13px;margin-bottom:16px;">
        ${quote.quote_ref as string}
      </div>
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#5a7a90;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Total</div>
        <div style="font-size:24px;font-weight:800;color:#004d70;">&pound;${Number(quote.total).toFixed(2)}</div>
        <div style="font-size:12px;color:#5a7a90;">Valid until ${(quote.valid_until as string) || 'N/A'}</div>
      </div>
      <p style="font-size:13px;color:#5a7a90;margin-bottom:16px;">
        You can track the status of your configuration using your reference number.
      </p>
      <a href="${siteUrl}/status" style="display:inline-block;padding:10px 20px;background:#004d70;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;">
        Check Configuration Status
      </a>
    </div>
    <div style="text-align:center;padding:16px;font-size:11px;color:#5a7a90;">
      SuDS Enviro Ltd | 9 Ambleside Court, Chester-le-Street DH3 2EB | 01224 057 700
    </div>
  </div>
</body>
</html>`,
      attachments: [
        {
          filename: `Quote-${quote.quote_ref as string}.html`,
          content: Buffer.from(quoteHTML).toString('base64'),
        },
      ],
    })
  } catch (emailErr) {
    console.error('Failed to send quote email:', emailErr)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }

  // Update quote status
  await supabase
    .from('se_quotes')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
