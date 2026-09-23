/**
 * Renders every spec sheet HTML file in a folder to PDF with headless
 * Chromium, the same way a browser prints /api/pdf/[configId], and checks
 * the layout: nothing may overflow a sheet, every drawing label must sit
 * inside its field, and no two labels may overlap.
 *
 *   npx tsx scripts/spec-sheet-samples.ts /tmp/sheets
 *   node scripts/render-spec-sheets.mjs /tmp/sheets
 *
 * Needs playwright-core and a Chromium build:
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright-core
 *   CHROMIUM_PATH=/path/to/chrome (default /opt/pw-browsers/chromium)
 *
 * Offline font cache (optional): FONT_DIR holding gf.css (the Google Fonts
 * stylesheet) and the font files named as the last part of their URLs.
 */

import { readdirSync, readFileSync, existsSync } from 'fs'
import { basename, join } from 'path'
import { pathToFileURL } from 'url'

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch {
  console.error('playwright-core is not installed. Run:\n  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright-core')
  process.exit(1)
}

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/render-spec-sheets.mjs <dir-with-html>')
  process.exit(1)
}
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'
const FONT_DIR = process.env.FONT_DIR

const browser = await chromium.launch({ executablePath: EXECUTABLE })
let problems = 0

for (const file of readdirSync(dir).filter((f) => f.endsWith('.html')).sort()) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
  if (FONT_DIR) {
    await page.route(/fonts\.googleapis\.com/, (r) =>
      r.fulfill({ contentType: 'text/css', body: readFileSync(join(FONT_DIR, 'gf.css')) }),
    )
    await page.route(/fonts\.gstatic\.com/, (r) => {
      const p = join(FONT_DIR, basename(new URL(r.request().url()).pathname))
      return existsSync(p) ? r.fulfill({ contentType: 'font/ttf', body: readFileSync(p) }) : r.abort()
    })
  }
  await page.goto(pathToFileURL(join(dir, file)).href, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
  await page.evaluate(() => document.fonts.ready)

  const report = await page.evaluate(() => {
    const issues = []
    const fontOk = document.fonts.check('700 10px Montserrat') && [...document.fonts].some((f) => f.status === 'loaded')
    if (!fontOk) issues.push('Montserrat did not load')

    // 1. Sheets: nothing may spill outside 297 x 210 mm.
    document.querySelectorAll('.sheet').forEach((sheet, i) => {
      const sr = sheet.getBoundingClientRect()
      sheet.querySelectorAll('.spec *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) return
        if (r.right > sr.right + 0.5 || r.bottom > sr.bottom + 0.5 || r.left < sr.left - 0.5 || r.top < sr.top - 0.5) {
          issues.push(`sheet ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> spills off the page`)
        }
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === 'hidden') {
          issues.push(`sheet ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> content cut off`)
        }
      })
    })

    // 2. Drawing: each label inside its field, no overlapping labels.
    const svg = document.querySelector('svg.dwg')
    if (!svg) return { issues, fontOk }
    const ctm = svg.getScreenCTM()
    const toSvg = (r) => {
      const inv = ctm.inverse()
      const p0 = new DOMPoint(r.left, r.top).matrixTransform(inv)
      const p1 = new DOMPoint(r.right, r.bottom).matrixTransform(inv)
      return { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y }
    }
    const zones = {
      header: [9, 9, 288, 16],
      plan: [9, 16, 124, 132],
      section: [124, 16, 288, 132],
      bom: [9, 132, 150, 171],
      notes: [150, 132, 288, 171],
      title: [9, 171, 288, 201],
    }
    const texts = [...svg.querySelectorAll('text')].map((t) => ({ t, r: toSvg(t.getBoundingClientRect()) }))
    for (const { t, r } of texts) {
      const cx = (r.x0 + r.x1) / 2
      const cy = (r.y0 + r.y1) / 2
      const zone = Object.entries(zones).find(([, z]) => cx >= z[0] && cx <= z[2] && cy >= z[1] && cy <= z[3])
      if (!zone) {
        issues.push(`label "${t.textContent}" is outside every field`)
        continue
      }
      const [name, z] = zone
      const tol = 0.25
      if (r.x0 < z[0] - tol || r.x1 > z[2] + tol || r.y0 < z[1] - tol || r.y1 > z[3] + tol) {
        issues.push(`label "${t.textContent}" crosses the edge of the ${name} field`)
      }
    }
    // Glyph boxes include ascender space, so shrink them a little before testing.
    const shrink = (r) => {
      const h = r.y1 - r.y0
      return { x0: r.x0 + 0.1, x1: r.x1 - 0.1, y0: r.y0 + h * 0.22, y1: r.y1 - h * 0.12 }
    }
    const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        if (hit(shrink(texts[i].r), shrink(texts[j].r))) {
          issues.push(`labels overlap: "${texts[i].t.textContent}" / "${texts[j].t.textContent}"`)
        }
      }
    }
    // Callout badges must not sit on other labels.
    const badges = [...svg.querySelectorAll('rect.cb-inlet, rect.cb-outlet')].map((b) => toSvg(b.getBoundingClientRect()))
    for (const b of badges) {
      for (const { t, r } of texts) {
        const s = shrink(r)
        const inside = s.x0 >= b.x0 - 0.2 && s.x1 <= b.x1 + 0.2 && s.y0 >= b.y0 - 0.2 && s.y1 <= b.y1 + 0.2
        if (!inside && hit(s, b)) issues.push(`badge covers label "${t.textContent}"`)
      }
      for (const c of badges) if (c !== b && hit(b, c)) issues.push('two badges overlap')
    }
    return { issues: [...new Set(issues)], fontOk }
  })

  const pdfPath = join(dir, file.replace(/\.html$/, '.pdf'))
  await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true })
  const status = report.issues.length ? 'ISSUES' : 'ok'
  console.log(`${status.padEnd(6)} ${file} -> ${basename(pdfPath)}`)
  for (const issue of report.issues) console.log(`       - ${issue}`)
  problems += report.issues.length
  await page.close()
}

await browser.close()
process.exit(problems ? 2 : 0)
