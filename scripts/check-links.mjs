/**
 * Crawl the rebuilt marketing pages and request every internal link.
 *
 * Catches the class of bug that reading a diff does not: links that are
 * well-formed but resolve to nothing. It found two real ones - the
 * "Download datasheet" button and every /configurator link - after the
 * preview path prefix was introduced.
 *
 *   npm run build && npm start        # in one shell
 *   node scripts/check-links.mjs      # in another
 *
 * Exits non-zero if any internal link returns >= 400.
 */
/**
 * Playwright is not a project dependency - it is only needed for these
 * ad-hoc checks, and adding it would pull it into every Vercel build for
 * no production benefit. Install it on demand:
 *
 *   PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright
 *
 * The browser itself is already present in this environment; point
 * CHROMIUM_PATH at it if the default below is wrong.
 */
let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error(
    'playwright is not installed. Run:\n' +
      '  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright',
  )
  process.exit(1)
}

const ROOT = process.env.BASE_URL ?? 'http://localhost:3000'
const PREFIX = process.env.PREVIEW_PREFIX ?? '/preview'
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

const SEEDS = [
  PREFIX,
  `${PREFIX}/contact`,
  `${PREFIX}/rhino-range`,
  `${PREFIX}/products`,
  `${PREFIX}/products/inspection-chamber`,
  `${PREFIX}/builder`,
]

const browser = await chromium.launch({ executablePath: EXECUTABLE })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

const found = new Set()
for (const path of SEEDS) {
  const response = await page.goto(ROOT + path, { waitUntil: 'domcontentloaded' })
  if (!response || response.status() !== 200) {
    console.error(`seed ${path} returned ${response?.status()}`)
    process.exitCode = 1
    continue
  }
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
  )
  for (const href of hrefs) {
    if (href?.startsWith('/')) found.add(href.split('#')[0])
  }
}

const broken = []
for (const href of [...found].sort()) {
  if (!href) continue
  const response = await page.request.get(ROOT + href)
  if (response.status() >= 400) broken.push([response.status(), href])
}

console.log(`checked ${found.size} internal links`)
if (broken.length) {
  console.error('BROKEN:', broken)
  process.exitCode = 1
} else {
  console.log('none broken')
}

await browser.close()
