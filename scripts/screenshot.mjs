import { mkdir } from 'node:fs/promises'

/**
 * Full-page screenshots at desktop and mobile, with a broken-image check.
 *
 *   node scripts/screenshot.mjs /preview home
 *
 * Writes into .screenshots/ (gitignored) unless OUT_DIR says otherwise.
 *
 * The page is scrolled before capture: Playwright's fullPage screenshot
 * does not trigger lazy-loaded images below the fold on its own, and
 * without the settle afterwards the check reports images as broken that
 * are merely still decoding.
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
const EXECUTABLE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const OUT = process.env.OUT_DIR ?? '.screenshots'

const path = process.argv[2] ?? '/preview'
const tag = process.argv[3] ?? 'page'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXECUTABLE })

for (const [name, width, height] of [
  ['desktop', 1440, 1000],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(ROOT + path, { waitUntil: 'domcontentloaded', timeout: 60000 })

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
  })
  await page.waitForTimeout(3000)

  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  )

  console.log(`${name}: broken images = ${broken.length}`, broken.slice(0, 3))
  if (broken.length) process.exitCode = 1

  await page.screenshot({ path: `${OUT}/${tag}-${name}.png`, fullPage: true })
  await page.close()
}

await browser.close()
