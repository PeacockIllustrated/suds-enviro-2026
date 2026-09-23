/**
 * Spec sheet document: sheet 1 technical specification, sheet 2
 * engineering drawing. Both sheets are exactly 297 x 210 mm and the
 * document sets @page to the same size with no margin, so printing or
 * saving as PDF gives two A4 landscape pages with nothing clipped.
 * On screen the sheets are scaled to fit the window.
 */

import { DRAWING_STYLES, escapeXml, generateDrawingSVG } from '@/lib/pdf/drawing-template'
import { SPEC_PAGE_STYLES, generateSpecPage } from '@/lib/pdf/spec-page-template'
import type { SpecSheetData } from '@/lib/pdf/spec-sheet-data'

const DOC_STYLES = `
@page{size:297mm 210mm;margin:0;}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{background:#dfe8ee;font-family:'Montserrat',Arial,sans-serif;}
.sheet{width:297mm;height:210mm;overflow:hidden;background:#fff;position:relative;}
.bar{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:#004d70;color:#fff;font-size:13px;font-weight:600;}
.bar button{font:inherit;font-weight:700;background:#44af43;color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer;}
.stack{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;}
@media screen{.sheet{zoom:var(--fit,1);box-shadow:0 2px 14px rgba(0,77,112,0.18);}}
@media print{
  body{background:#fff;}
  .bar{display:none;}
  .stack{display:block;padding:0;}
  .sheet{break-after:page;page-break-after:always;}
  .sheet:last-child{break-after:auto;page-break-after:auto;}
}
`

// Scales the sheets to the window width on screen (not in print).
const FIT_SCRIPT = `(function(){function fit(){var w=Math.min(1,(window.innerWidth-32)/1123);document.documentElement.style.setProperty('--fit',String(w>0.2?w:0.2));}fit();window.addEventListener('resize',fit);})();`

export function generateSpecSheetHTML(s: SpecSheetData): string {
  const total = 2
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SuDS Enviro - ${escapeXml(s.drawingNo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${DOC_STYLES}${SPEC_PAGE_STYLES}${DRAWING_STYLES}</style>
<script>${FIT_SCRIPT}</script>
</head>
<body>
<div class="bar"><span>Spec sheet ${escapeXml(s.productCode)} - 2 pages, A4 landscape</span><button type="button" onclick="window.print()">Print or save as PDF</button></div>
<div class="stack">
<section class="sheet">${generateSpecPage(s, { num: 1, of: total })}</section>
<section class="sheet">${generateDrawingSVG(s, { num: 2, of: total })}</section>
</div>
</body>
</html>`
}
