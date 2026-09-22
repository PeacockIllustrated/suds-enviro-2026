// Tile thumbnails into one PNG for a quick visual check: node contact_sheet.mjs out.png a.png b.png ...
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
const [out, ...imgs] = process.argv.slice(2)
const cells = imgs.map((p) => `<figure><img src="data:image/png;base64,${readFileSync(p).toString('base64')}"><figcaption>${basename(p, '.png')}</figcaption></figure>`).join('')
const html = `<style>body{margin:0;background:#eef2f5;font:11px sans-serif}main{display:grid;grid-template-columns:repeat(5,220px);gap:6px;padding:6px}figure{margin:0;background:#fff}img{width:220px;height:220px;display:block}figcaption{padding:3px;overflow:hidden;white-space:nowrap}</style><main>${cells}</main>`
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1146, height: 400 } })
await p.setContent(html)
await p.locator('main').screenshot({ path: out })
await b.close()
