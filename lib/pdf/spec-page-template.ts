/**
 * Technical specification page - sheet 1 of the spec sheet. Plain HTML
 * laid out on a fixed 297 x 210 mm landscape page.
 */

import { escapeXml, formatDate } from '@/lib/pdf/drawing-template'
import { pipeLabel, type SheetStatus, type SpecSheetData } from '@/lib/pdf/spec-sheet-data'

export const SPEC_PAGE_STYLES = `
.spec{font-family:'Montserrat',Arial,sans-serif;color:#0f2535;padding:9mm;height:100%;display:flex;flex-direction:column;gap:4mm;}
.spec *{box-sizing:border-box;}
.sp-head{display:flex;align-items:stretch;border:0.6mm solid #004d70;border-radius:1.2mm;overflow:hidden;min-height:22mm;}
.sp-co{background:#004d70;color:#fff;display:flex;align-items:center;gap:3mm;padding:0 5mm;width:62mm;}
.sp-mark{width:10mm;height:10mm;border-radius:1.8mm;background:#1a82a2;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:3.8mm;}
.sp-co-name{font-weight:800;font-size:3.6mm;line-height:1.1;}
.sp-co-sub{font-size:2.3mm;color:#9ccbe0;margin-top:0.6mm;}
.sp-title{flex:1;padding:3mm 5mm;background:#f0f6fa;display:flex;flex-direction:column;justify-content:center;}
.sp-doc{font-size:2.4mm;font-weight:700;letter-spacing:0.3mm;color:#5a7a90;}
.sp-prod{font-size:5mm;font-weight:800;color:#004d70;line-height:1.15;margin-top:0.6mm;}
.sp-series{font-size:2.6mm;font-weight:700;color:#1a82a2;margin-top:0.4mm;}
.sp-meta{width:72mm;display:grid;grid-template-columns:1fr 1fr;border-left:0.3mm solid #ccdde8;}
.sp-meta>div{padding:1.6mm 3mm;border-bottom:0.3mm solid #ccdde8;}
.sp-meta>div:nth-child(odd){border-right:0.3mm solid #ccdde8;}
.sp-meta>div:nth-last-child(-n+2){border-bottom:none;}
.sp-k{font-size:1.9mm;font-weight:700;color:#5a7a90;letter-spacing:0.2mm;text-transform:uppercase;}
.sp-v{font-size:2.8mm;font-weight:700;color:#0f2535;margin-top:0.3mm;white-space:nowrap;}
.sp-code{display:inline-block;background:#44af43;color:#fff;border-radius:0.8mm;padding:0.3mm 1.6mm;font-size:2.6mm;}
.sp-grid{display:grid;gap:4mm;}
.sp-g3{grid-template-columns:1fr 1fr 1.25fr;}
.sp-g2{grid-template-columns:1fr 1.25fr;}
.sp-card{border:0.3mm solid #ccdde8;border-radius:1.2mm;overflow:hidden;background:#fff;}
.sp-card h3{margin:0;background:#004d70;color:#fff;font-size:2.5mm;font-weight:800;letter-spacing:0.3mm;padding:1.6mm 3mm;text-transform:uppercase;}
.sp-card table{width:100%;border-collapse:collapse;font-size:2.45mm;}
.sp-card td,.sp-card th{padding:1.15mm 3mm;border-bottom:0.2mm solid #e1ebf2;text-align:left;vertical-align:top;line-height:1.3;}
.sp-card tr:last-child td{border-bottom:none;}
.sp-card tr:nth-child(even) td{background:#f7fbfd;}
.sp-card th{font-size:1.95mm;color:#5a7a90;font-weight:700;letter-spacing:0.2mm;text-transform:uppercase;background:#f0f6fa;}
.sp-card td.k{color:#5a7a90;font-weight:600;width:44%;}
.sp-card td.v{font-weight:700;}
.sp-card td.num{text-align:right;font-weight:700;white-space:nowrap;}
.sp-card th.num{text-align:right;}
.sp-in{color:#1a82a2;font-weight:800;}
.sp-out{color:#339932;font-weight:800;}
.sp-pill{display:inline-block;border-radius:0.8mm;padding:0.2mm 1.6mm;font-size:2mm;font-weight:800;letter-spacing:0.2mm;text-transform:uppercase;white-space:nowrap;}
.sp-pass{background:#e2f2e1;color:#2a7a29;}
.sp-fail{background:#fbe0dd;color:#b3261e;}
.sp-warn{background:#fdf0d9;color:#9a5b00;}
.sp-lock{display:inline-block;margin-left:1.2mm;font-size:1.9mm;font-weight:800;color:#339932;border:0.25mm solid #339932;border-radius:0.6mm;padding:0 0.8mm;}
.sp-note{padding:1.6mm 3mm;font-size:2.2mm;color:#5a7a90;line-height:1.35;border-top:0.2mm solid #e1ebf2;}
.sp-foot{margin-top:auto;display:flex;justify-content:space-between;gap:6mm;font-size:2.1mm;color:#5a7a90;border-top:0.3mm solid #ccdde8;padding-top:2mm;}
.sp-foot b{color:#004d70;}
`

function pill(status: SheetStatus): string {
  const cls = status === 'Pass' ? 'sp-pass' : status === 'Fail' ? 'sp-fail' : 'sp-warn'
  return `<span class="sp-pill ${cls}">${status}</span>`
}

const e = escapeXml

function row(k: string, v: string): string {
  return `<tr><td class="k">${e(k)}</td><td class="v">${v}</td></tr>`
}

export function generateSpecPage(s: SpecSheetData, sheet: { num: number; of: number }): string {
  const overall = s.valid && s.compliance.every((c) => c.status === 'Pass') && s.ruleLog.every((r) => r.status === 'Pass')
  const statusText = overall ? 'Rule checks passed' : 'Needs technical review'

  const projectRows = [
    row('Configuration ref', e(s.configRef ?? 'Not saved')),
    row('Quote ref', e(s.quoteRef ?? 'Not yet quoted')),
    row('Date issued', e(formatDate(s.date))),
    row('Drawing no.', e(s.drawingNo)),
    row('Product', e(s.kind === 'catchpit' ? 'Catchpit / silt trap' : 'Inspection chamber')),
    row('Series', e(s.seriesLine)),
    row('Status', overall ? pill('Pass') + ` <span style="font-weight:600;color:#5a7a90">${e(statusText)}</span>` : pill('Warning') + ` <span style="font-weight:600;color:#5a7a90">${e(statusText)}</span>`),
  ]

  const specRows = [
    row('System', e(s.systemLabel)),
    row('External diameter', `${s.diameter} mm`),
    row('Depth to outlet soffit', `${s.depth} mm`),
    row('Overall height', `${s.overallHeight} mm`),
    row('Sump below outlet invert', `${s.sump} mm`),
    row('Adoption', e(s.adoptionLabel)),
    row('Maximum depth', `${s.maxDepth} mm (${s.adoptable ? 'S104' : 'private'})`),
    row('Access', e(s.reduced ? `Reducing cap, Ø600 clear opening` : 'Full bore opening')),
    row('Cover', e(s.topLabel)),
    row('Material', 'HDPE, BS EN 13598-2'),
  ]
  if (s.variant) {
    specRows.push(row('Silt capture', e(s.variant === 'SERS' ? 'Removable silt bucket' : 'Built-in settling chambers')))
    specRows.push(
      row('Baffle', e(s.baffle === 'internal' ? 'Internal baffle plate' : s.baffle === 'external' ? 'Outlet dip pipe' : 'None')),
    )
  }

  const pipes = [s.outlet, ...s.inlets]
    .map((p) => {
      const isOut = p.ref === 'OUT'
      const lbl = pipeLabel(p.size)
      return `<tr><td class="${isOut ? 'sp-out' : 'sp-in'}">${p.ref}</td><td>${p.hour} o'clock</td><td class="num">${p.angle}°</td><td>${e(`${lbl.dia} ${lbl.std === 'TWINWALL' ? 'Twinwall' : 'EN1401'}`)}${isOut && s.outletLockSize ? `<span class="sp-lock">${s.outletLockSize === p.size ? 'LOCKED R2' : `R2 MIN ${pipeLabel(s.outletLockSize).dia}`}</span>` : ''}</td><td class="num">${Math.round(p.invertH)}</td><td class="num">${Math.round(p.centreH)}</td></tr>`
    })
    .join('')

  const flowLine = s.flow
    ? `${s.flow.type === 'Vortex' ? 'Vortex flow control' : 'Orifice plate'} on the outlet, ${s.flow.rate ? `${s.flow.rate} L/s` : 'rate to be confirmed'}.`
    : 'No flow control selected.'

  const compliance = s.compliance
    .map((c) => `<tr><td class="v">${e(c.standard)}</td><td>${e(c.scope)}</td><td class="num">${pill(c.status)}</td></tr>`)
    .join('')

  const ruleLog = s.ruleLog
    .map((r) => `<tr><td class="v" style="white-space:nowrap">${r.rule}</td><td class="v" style="white-space:nowrap">${e(r.title)}</td><td>${e(r.detail)}</td><td class="num">${pill(r.status)}</td></tr>`)
    .join('')

  const errors = s.errors.length
    ? `<div class="sp-note"><b style="color:#b3261e">Open items:</b> ${e(s.errors.join('. '))}.</div>`
    : ''

  return `<div class="spec">
  <div class="sp-head">
    <div class="sp-co">
      <div class="sp-mark">SE</div>
      <div><div class="sp-co-name">SuDS Enviro Ltd</div><div class="sp-co-sub">The Home of SuDS Rhino</div></div>
    </div>
    <div class="sp-title">
      <div class="sp-doc">TECHNICAL SPECIFICATION</div>
      <div class="sp-prod">${e(s.title)}</div>
      <div class="sp-series">${e(s.seriesLine)}</div>
    </div>
    <div class="sp-meta">
      <div><div class="sp-k">Product code</div><div class="sp-v"><span class="sp-code">${e(s.productCode)}</span></div></div>
      <div><div class="sp-k">Date</div><div class="sp-v">${e(formatDate(s.date))}</div></div>
      <div><div class="sp-k">Size</div><div class="sp-v">Ø${s.diameter} x ${s.depth} mm</div></div>
      <div><div class="sp-k">Sheet</div><div class="sp-v">${sheet.num} of ${sheet.of}</div></div>
    </div>
  </div>

  <div class="sp-grid sp-g3">
    <div class="sp-card"><h3>Project information</h3><table>${projectRows.join('')}</table></div>
    <div class="sp-card"><h3>Chamber specification</h3><table>${specRows.join('')}</table></div>
    <div class="sp-card"><h3>Compliance</h3><table><tr><th>Standard</th><th>Scope</th><th class="num">Status</th></tr>${compliance}</table>${errors}</div>
  </div>

  <div class="sp-grid sp-g2">
    <div class="sp-card"><h3>Pipework</h3>
      <table><tr><th>Ref</th><th>Position</th><th class="num">Angle</th><th>Size</th><th class="num">Invert H</th><th class="num">Centre H</th></tr>${pipes}</table>
      <div class="sp-note">Heights in mm above the internal base. Outlet fixed at 12 o'clock (0°, north); angles clockwise from north. Inlet soffits aligned with the outlet soffit. ${e(flowLine)}</div>
    </div>
    <div class="sp-card"><h3>Rule engine log</h3><table><tr><th>Rule</th><th>Check</th><th>Result</th><th class="num">Status</th></tr>${ruleLog}</table></div>
  </div>

  <div class="sp-foot">
    <span>Generated by the SuDS Enviro configurator. Subject to technical review by SuDS Enviro before manufacture. Engineering drawing on sheet ${sheet.of}.</span>
    <span><b>SuDS Enviro Ltd</b>  |  9 Ambleside Court, Chester-le-Street DH3 2EB  |  01224 057 700  |  hello@sudsenviro.com</span>
  </div>
</div>`
}
