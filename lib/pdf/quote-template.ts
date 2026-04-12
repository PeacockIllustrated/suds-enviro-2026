/**
 * Quote PDF Template - generates a branded A4 portrait quotation as HTML.
 */

export interface QuoteLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuoteParams {
  quoteRef: string
  date: string
  validUntil: string
  customerName: string
  customerEmail: string
  customerCompany: string | null
  productCode: string
  productSummary: string
  lineItems: QuoteLineItem[]
  subtotal: number
  vatRate: number
  vat: number
  total: number
  notes: string | null
  terms: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function generateQuoteHTML(params: QuoteParams): string {
  const lineItemRows = params.lineItems
    .map(
      (item, idx) => `
    <tr style="${idx % 2 === 0 ? 'background:#f0f6fa;' : 'background:white;'}">
      <td style="padding:10px 12px;font-size:13px;color:#5a7a90;font-weight:600;">${idx + 1}</td>
      <td style="padding:10px 12px;font-size:13px;color:#0f2535;">${escapeHtml(item.description)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#0f2535;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;font-size:13px;color:#0f2535;text-align:right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#0f2535;text-align:right;font-weight:600;">${formatCurrency(item.total)}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Quote ${escapeHtml(params.quoteRef)} - SuDS Enviro</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 210mm; min-height: 297mm;
    font-family: 'Montserrat', sans-serif;
    color: #0f2535; font-size: 13px; line-height: 1.5;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .page { width: 210mm; min-height: 297mm; padding: 0; position: relative; }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:#004d70;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <div style="background:#005f8c;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-weight:800;font-size:14px;">SE</span>
        </div>
        <span style="color:white;font-weight:800;font-size:22px;">SuDS Enviro Ltd</span>
      </div>
      <div style="color:#7ab8d4;font-size:12px;">The Home of SuDS Rhino</div>
      <div style="color:#7ab8d4;font-size:11px;margin-top:4px;">9 Ambleside Court, Chester-le-Street DH3 2EB</div>
      <div style="color:#7ab8d4;font-size:11px;">01224 057 700 | hello@sudsenviro.com</div>
    </div>
    <div style="text-align:right;">
      <div style="color:white;font-weight:800;font-size:28px;letter-spacing:1px;">QUOTATION</div>
      <div style="background:#44af43;color:white;padding:6px 14px;border-radius:6px;font-weight:700;font-size:13px;display:inline-block;margin-top:4px;">
        ${escapeHtml(params.quoteRef)}
      </div>
    </div>
  </div>

  <div style="padding:28px 32px;">
    <!-- Date and customer info -->
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;margin-bottom:4px;">QUOTE TO</div>
        <div style="font-weight:700;font-size:15px;color:#0f2535;">${escapeHtml(params.customerName)}</div>
        ${params.customerCompany ? `<div style="font-size:13px;color:#5a7a90;">${escapeHtml(params.customerCompany)}</div>` : ''}
        <div style="font-size:13px;color:#5a7a90;">${escapeHtml(params.customerEmail)}</div>
      </div>
      <div style="text-align:right;">
        <div style="margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;">DATE</div>
          <div style="font-weight:600;color:#0f2535;">${formatDate(params.date)}</div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;">VALID UNTIL</div>
          <div style="font-weight:600;color:#0f2535;">${formatDate(params.validUntil)}</div>
        </div>
      </div>
    </div>

    <!-- Configuration summary -->
    <div style="background:#f0f6fa;border:1px solid #ccdde8;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;margin-bottom:4px;">CONFIGURATION</div>
      <div style="font-weight:700;font-size:15px;color:#004d70;margin-bottom:2px;">${escapeHtml(params.productCode)}</div>
      <div style="font-size:12px;color:#5a7a90;">${escapeHtml(params.productSummary)}</div>
    </div>

    <!-- Line items -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#004d70;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:white;width:40px;">#</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:white;">DESCRIPTION</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;color:white;width:60px;">QTY</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:white;width:100px;">UNIT PRICE</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;color:white;width:100px;">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:24px;">
      <div style="width:260px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e8f0f5;">
          <span style="font-size:13px;color:#5a7a90;font-weight:600;">Subtotal</span>
          <span style="font-size:13px;font-weight:600;">${formatCurrency(params.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e8f0f5;">
          <span style="font-size:13px;color:#5a7a90;font-weight:600;">VAT (${params.vatRate}%)</span>
          <span style="font-size:13px;font-weight:600;">${formatCurrency(params.vat)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;background:#004d70;margin-top:4px;padding:10px 12px;border-radius:6px;">
          <span style="font-size:15px;color:white;font-weight:800;">TOTAL</span>
          <span style="font-size:15px;color:white;font-weight:800;">${formatCurrency(params.total)}</span>
        </div>
      </div>
    </div>

    ${params.notes ? `
    <!-- Notes -->
    <div style="margin-bottom:20px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;margin-bottom:4px;">NOTES</div>
      <div style="font-size:12px;color:#0f2535;line-height:1.6;background:#f0f6fa;padding:12px 14px;border-radius:6px;border:1px solid #ccdde8;">${escapeHtml(params.notes)}</div>
    </div>
    ` : ''}

    <!-- Terms -->
    <div style="margin-bottom:20px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#5a7a90;margin-bottom:4px;">TERMS AND CONDITIONS</div>
      <div style="font-size:11px;color:#5a7a90;line-height:1.6;">${escapeHtml(params.terms)}</div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #ccdde8;padding-top:16px;text-align:center;">
      <div style="font-size:10px;color:#5a7a90;">
        SuDS Enviro Ltd | Company No. 12345678 | VAT No. GB 123 4567 89
      </div>
      <div style="font-size:10px;color:#5a7a90;margin-top:2px;">
        9 Ambleside Court, Chester-le-Street DH3 2EB | 01224 057 700 | hello@sudsenviro.com
      </div>
    </div>
  </div>
</div>
</body>
</html>`
}
