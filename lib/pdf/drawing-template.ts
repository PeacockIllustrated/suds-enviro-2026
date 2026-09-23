/**
 * Engineering drawing sheet - an A4 landscape SVG in millimetres
 * (viewBox 297 x 210), styled after reference/suds-drawing-v4.html.
 *
 * Layout (mm):
 *   frame        9..288 x 9..201
 *   view titles  y 9..16
 *   plan view    x 9..124,   y 16..132
 *   section A-A  x 124..288, y 16..132 (with the pipe schedule)
 *   BOM          x 9..150,   y 132..171
 *   notes        x 150..288, y 132..171
 *   title block  y 171..201
 *
 * Every view picks a standard scale so the chamber fits its field for
 * any diameter (450 - 1200) and depth (1000 - 6000). Deep chambers are
 * drawn with a broken shaft; the dimensions always state true values.
 */

import {
  CAP_THICKNESS,
  COVER_HEIGHT,
  FLOOR_THICKNESS,
  REDUCED_OPENING,
  WALL_THICKNESS,
  pipeLabel,
  type SheetPipe,
  type SpecSheetData,
} from '@/lib/pdf/spec-sheet-data'

// ── Layout ──────────────────────────────────────────────────

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const FRAME: Box = { x: 9, y: 9, w: 279, h: 192 }
const VIEW_TOP = 16
const BAND_TOP = 132
const TITLE_TOP = 171
const SPLIT_X = 124
const PLAN: Box = { x: 9, y: VIEW_TOP, w: SPLIT_X - 9, h: BAND_TOP - VIEW_TOP }
const ELEV: Box = { x: SPLIT_X, y: VIEW_TOP, w: 288 - SPLIT_X, h: BAND_TOP - VIEW_TOP }
const BOM: Box = { x: 9, y: BAND_TOP, w: 141, h: TITLE_TOP - BAND_TOP }
const NOTES: Box = { x: 150, y: BAND_TOP, w: 138, h: TITLE_TOP - BAND_TOP }
const TB: Box = { x: 9, y: TITLE_TOP, w: 279, h: 201 - TITLE_TOP }

const SCALES = [10, 15, 20, 25, 30]

// ── SVG helpers ─────────────────────────────────────────────

const f = (n: number): string => (Math.round(n * 100) / 100).toString()

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function text(
  x: number,
  y: number,
  str: string,
  cls: string,
  size: number,
  anchor: 'start' | 'middle' | 'end' = 'start',
  extra = '',
): string {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" text-anchor="${anchor}" class="${cls}"${extra}>${escapeXml(str)}</text>`
}

function line(x1: number, y1: number, x2: number, y2: number, cls: string): string {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}"/>`
}

function rect(x: number, y: number, w: number, h: number, cls: string, rx = 0): string {
  const x0 = Math.min(x, x + w)
  const y0 = Math.min(y, y + h)
  return `<rect x="${f(x0)}" y="${f(y0)}" width="${f(Math.abs(w))}" height="${f(Math.abs(h))}"${rx ? ` rx="${rx}"` : ''} class="${cls}"/>`
}

/** Arrowhead with its tip at (x, y), pointing along (dx, dy). */
function arrow(x: number, y: number, dx: number, dy: number, cls = 'darrow', len = 1.8, half = 0.55): string {
  const m = Math.hypot(dx, dy) || 1
  const ux = dx / m
  const uy = dy / m
  const bx = x - ux * len
  const by = y - uy * len
  return `<polygon points="${f(x)},${f(y)} ${f(bx - uy * half)},${f(by + ux * half)} ${f(bx + uy * half)},${f(by - ux * half)}" class="${cls}"/>`
}

/** Approximate rendered width of Montserrat text, mm. */
function textWidth(str: string, size: number, bold = false): number {
  let w = 0
  for (const ch of str) {
    if (ch === ' ') w += 0.28
    else if ('.,:;|\'!il1'.includes(ch)) w += 0.3
    else if ('MWmw'.includes(ch)) w += 0.9
    else if (ch >= 'A' && ch <= 'Z') w += 0.7
    else if (ch >= '0' && ch <= '9') w += 0.62
    else w += 0.58
  }
  return w * size * (bold ? 1.05 : 1)
}

interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}

const overlaps = (a: Rect, b: Rect, pad = 0.6): boolean =>
  a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad

/** Vertical dimension at x from y1 to y2 with the value written along it. */
function vDim(x: number, y1: number, y2: number, label: string, size = 1.9): string {
  const top = Math.min(y1, y2)
  const bot = Math.max(y1, y2)
  const mid = (top + bot) / 2
  const out = [
    line(x, top, x, bot, 'dl'),
    arrow(x, top, 0, -1),
    arrow(x, bot, 0, 1),
    text(x - 0.9, mid, label, 'dt', size, 'middle', ` transform="rotate(-90 ${f(x - 0.9)} ${f(mid)})"`),
  ]
  return out.join('\n')
}

/** Horizontal dimension at y from x1 to x2 with the value below it. */
function hDim(y: number, x1: number, x2: number, label: string, size = 2.1): string {
  return [
    line(x1, y, x2, y, 'dl'),
    arrow(x1, y, -1, 0),
    arrow(x2, y, 1, 0),
    text((x1 + x2) / 2, y + size + 0.8, label, 'dt', size, 'middle'),
  ].join('\n')
}

// ── Styles ──────────────────────────────────────────────────

export const DRAWING_STYLES = `
.dwg text{font-family:'Montserrat',Arial,sans-serif;}
.bdr-out{fill:none;stroke:#0a1e2e;stroke-width:0.7;}
.zdiv{fill:none;stroke:#9fbccf;stroke-width:0.3;}
.zdiv-h{fill:none;stroke:#0a1e2e;stroke-width:0.6;}
.zone-bg{fill:#f7fbfd;}
.zhdr{font-weight:700;fill:#004d70;letter-spacing:0.15px;}
.zhdr-s{font-weight:500;fill:#5a7a90;}
.obj-h{fill:none;stroke:#0a1e2e;stroke-width:0.45;}
.obj-t{fill:none;stroke:#0a1e2e;stroke-width:0.22;}
.hidden{fill:none;stroke:#4a6a88;stroke-width:0.2;stroke-dasharray:1.6,1;}
.wall-fill{fill:#c8dde8;}
.int-fill{fill:#eef6fa;}
.sump-fill{fill:#d9e8f1;}
.cover-fill{fill:#1a3a50;}
.ctr{stroke:#c0392b;stroke-width:0.16;stroke-dasharray:4,1.2,0.8,1.2;fill:none;}
.pcl-in{stroke:#1a82a2;stroke-width:0.16;stroke-dasharray:4,1.2,0.8,1.2;fill:none;}
.pcl-out{stroke:#339932;stroke-width:0.16;stroke-dasharray:4,1.2,0.8,1.2;fill:none;}
.de{fill:none;stroke:#004d70;stroke-width:0.15;}
.dl{fill:none;stroke:#004d70;stroke-width:0.2;}
.darrow{fill:#004d70;}
.dt{font-weight:700;fill:#004d70;}
.pipe-in{fill:#dcebf3;stroke:#1a82a2;stroke-width:0.35;}
.pipe-out{fill:#e2f2e1;stroke:#339932;stroke-width:0.35;}
.open-in{fill:#dcebf3;stroke:#1a82a2;stroke-width:0.3;}
.open-hid{fill:none;stroke:#1a82a2;stroke-width:0.22;stroke-dasharray:1.2,0.8;}
.farr-in{fill:none;stroke:#1a82a2;stroke-width:0.3;}
.farr-out{fill:none;stroke:#339932;stroke-width:0.3;}
.fhead-in{fill:#1a82a2;}
.fhead-out{fill:#339932;}
.cb-inlet{fill:#1a82a2;}
.cb-outlet{fill:#339932;}
.cb-ref{font-weight:600;fill:rgba(255,255,255,0.92);}
.cb-dia{font-weight:800;fill:#fff;}
.cb-std{font-weight:500;fill:rgba(255,255,255,0.92);}
.halo{paint-order:stroke;stroke:#eef6fa;stroke-width:0.6;stroke-linejoin:round;}
.tag-in{font-weight:700;fill:#1a82a2;}
.tag-out{font-weight:700;fill:#339932;}
.tag-x{font-weight:700;fill:#b35f16;}
.lead{fill:none;stroke:#5a7a90;stroke-width:0.15;}
.north-fill{fill:#0a1e2e;}
.north-lbl{font-weight:800;fill:#0a1e2e;}
.sec-thick{stroke:#e07b2a;stroke-width:0.7;fill:none;}
.sec-arr{stroke:#e07b2a;stroke-width:0.3;fill:none;}
.sec-head{fill:#e07b2a;}
.sec-ltr{font-weight:800;fill:#e07b2a;}
.gline{stroke:#4a8a68;stroke-width:0.45;fill:none;}
.ghatch{stroke:#7aaa88;stroke-width:0.2;fill:none;}
.ffl-lbl{font-weight:700;fill:#2a5a40;}
.cover-lbl{font-weight:700;fill:#fff;}
.sump-lbl{font-weight:700;fill:#004d70;}
.device{fill:#fbe9d8;stroke:#e07b2a;stroke-width:0.3;}
.brk{fill:#f7fbfd;stroke:none;}
.brk-line{fill:none;stroke:#0a1e2e;stroke-width:0.25;}
.tbl-title{font-weight:800;fill:#004d70;letter-spacing:0.15px;}
.tbl-hdr-bg{fill:#004d70;}
.tbl-hdr{font-weight:700;fill:#fff;}
.row-a{fill:#f0f6fa;}
.row-b{fill:#fff;}
.cell{font-weight:500;fill:#0f2535;}
.cell-b{font-weight:700;fill:#004d70;}
.cell-in{font-weight:700;fill:#1a82a2;}
.cell-out{font-weight:700;fill:#339932;}
.cell-pno{font-weight:600;fill:#1a82a2;}
.cell-m{font-weight:500;fill:#5a7a90;}
.grid{stroke:#ccdde8;stroke-width:0.15;fill:none;}
.note-n{font-weight:700;fill:#004d70;}
.note-t{font-weight:500;fill:#2a4a5e;}
.tb-co-bg{fill:#004d70;}
.tb-ttl-bg{fill:#f0f6fa;}
.tb-logo-mk{fill:#1a82a2;}
.tb-logo-t{font-weight:800;fill:#fff;}
.tb-co-name{font-weight:800;fill:#fff;}
.tb-co-sub{font-weight:500;fill:#9ccbe0;}
.tb-drw-t{font-weight:800;fill:#004d70;}
.tb-drw-s2{font-weight:700;fill:#1a82a2;}
.tb-drw-s{font-weight:600;fill:#0f2535;}
.tb-drw-m{font-weight:500;fill:#5a7a90;}
.tb-f1{fill:#f0f6fa;}
.tb-f2{fill:#e4eff6;}
.tb-flbl{font-weight:700;fill:#5a7a90;letter-spacing:0.15px;}
.tb-fval{font-weight:700;fill:#0f2535;}
.tb-code-bg{fill:#44af43;}
.tb-code-t{font-weight:700;fill:#fff;}
.proj{fill:none;stroke:#0a1e2e;stroke-width:0.22;}
`

// ── Plan view ───────────────────────────────────────────────

interface PlanResult {
  svg: string
  scale: number
}

function planScale(diameter: number): number {
  return SCALES.find((n) => diameter / n <= 56) ?? 30
}

function generatePlanView(s: SpecSheetData): PlanResult {
  const N = planScale(s.diameter)
  const R = s.diameter / 2 / N
  const Ri = (s.diameter / 2 - WALL_THICKNESS) / N
  const cx = PLAN.x + PLAN.w / 2
  const cy = PLAN.y + PLAN.h / 2 + 0.5
  const stub = Math.min(Math.max(150 / N, 5), 8)
  const out: string[] = []
  const obstacles: Rect[] = []

  // Chamber body
  out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" class="wall-fill"/>`)
  out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Ri)}" class="int-fill"/>`)
  out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" class="obj-h"/>`)
  out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(Ri)}" class="obj-t"/>`)
  if (s.reduced) {
    // Reducing cap opening above, shown hidden.
    out.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(REDUCED_OPENING / 2 / N)}" class="hidden"/>`)
  }

  // Centre lines
  out.push(line(cx - R - 3.5, cy, cx + R + 3.5, cy, 'ctr'))
  out.push(line(cx, cy - R - 3.5, cx, cy + R + 3.5, 'ctr'))

  // North arrow, top right of the field
  const naX = PLAN.x + PLAN.w - 7
  const naY = PLAN.y + 5.5
  out.push(line(naX, naY + 12, naX, naY, 'obj-t'))
  out.push(`<polygon points="${f(naX)},${f(naY)} ${f(naX - 1.8)},${f(naY + 5.5)} ${f(naX)},${f(naY + 4.3)}" class="north-fill"/>`)
  out.push(`<polygon points="${f(naX)},${f(naY)} ${f(naX + 1.8)},${f(naY + 5.5)} ${f(naX)},${f(naY + 4.3)}" class="obj-t"/>`)
  out.push(text(naX, naY - 1.2, 'N', 'north-lbl', 3.2, 'middle'))
  obstacles.push({ x0: naX - 3, y0: naY - 4.5, x1: naX + 3, y1: naY + 12 })

  // Diameter callout on a leader at 10:30, a sector no pipe uses.
  {
    const k = Math.SQRT1_2
    const p0x = cx - R * k
    const p0y = cy - R * k
    const p1x = p0x - 5
    const p1y = p0y - 5
    const label = `Ø${s.diameter} EXT`
    const w = textWidth(label, 2.1, true)
    out.push(line(p0x, p0y, p1x, p1y, 'de'))
    out.push(line(p1x, p1y, p1x - 2.5, p1y, 'de'))
    out.push(arrow(p0x, p0y, k, k))
    out.push(text(p1x - 3.2, p1y + 0.75, label, 'dt', 2.1, 'end'))
    obstacles.push({ x0: p1x - 3.2 - w, y0: p1y - 1.8, x1: p1x, y1: p1y + 1.2 })
  }

  const pipes: SheetPipe[] = [s.outlet, ...s.inlets]
  const BW = 17.5
  const BH = 11

  const dirOf = (p: SheetPipe) => {
    const a = (p.angle * Math.PI) / 180
    return { dx: Math.sin(a), dy: -Math.cos(a) }
  }

  // Pipe stubs and centre lines
  for (const p of pipes) {
    const { dx, dy } = dirOf(p)
    const hw = p.od / 2 / N
    const r0 = Ri
    const r1 = R + stub
    const px = -dy
    const py = dx
    const pts = [
      [cx + dx * r0 + px * hw, cy + dy * r0 + py * hw],
      [cx + dx * r1 + px * hw, cy + dy * r1 + py * hw],
      [cx + dx * r1 - px * hw, cy + dy * r1 - py * hw],
      [cx + dx * r0 - px * hw, cy + dy * r0 - py * hw],
    ]
    const isOut = p.ref === 'OUT'
    out.push(`<polygon points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" class="${isOut ? 'pipe-out' : 'pipe-in'}"/>`)
    out.push(line(cx + dx * (Ri * 0.55), cy + dy * (Ri * 0.55), cx + dx * (r1 + 1.5), cy + dy * (r1 + 1.5), isOut ? 'pcl-out' : 'pcl-in'))
    // Flow direction: into the chamber for inlets, out for the outlet.
    const mid = R + stub * 0.55
    const tipR = isOut ? mid + 1 : mid - 1
    out.push(arrow(cx + dx * tipR, cy + dy * tipR, isOut ? dx : -dx, isOut ? dy : -dy, isOut ? 'fhead-out' : 'fhead-in', 1.6, 0.6))
  }

  // Callout badges, pushed outward until clear of each other.
  const placed: { p: SheetPipe; bx: number; by: number }[] = []
  const placeBadge = (p: SheetPipe): Rect => {
    const { dx, dy } = dirOf(p)
    const ext = Math.abs(dx) * (BW / 2) + Math.abs(dy) * (BH / 2)
    let rb = R + stub + 1.8 + ext
    let r: Rect = { x0: 0, y0: 0, x1: 0, y1: 0 }
    for (let i = 0; i < 80; i++) {
      const bx = cx + dx * rb
      const by = cy + dy * rb
      r = { x0: bx - BW / 2, y0: by - BH / 2, x1: bx + BW / 2, y1: by + BH / 2 }
      if (!obstacles.some((o) => overlaps(o, r))) break
      rb += 0.5
    }
    obstacles.push(r)
    placed.push({ p, bx: (r.x0 + r.x1) / 2, by: (r.y0 + r.y1) / 2 })
    return r
  }

  const outletBadge = placeBadge(s.outlet)
  const six = s.inlets.find((i) => i.hour === 6)
  const sixBadge = six ? placeBadge(six) : null
  for (const p of s.inlets) {
    if (p !== six) placeBadge(p)
  }

  // Section A-A cutting plane (north-south through the centre), viewed
  // looking west. Marked at both ends, beyond the badges on that axis.
  const bottomBadges = placed.filter(({ p }) => p.hour >= 5 && p.hour <= 7)
  const lowest = Math.max(
    cy + R + stub,
    ...bottomBadges.map(({ by }) => by + BH / 2),
    sixBadge ? sixBadge.y1 : 0,
  )
  const secTop = Math.max(outletBadge.y0 - 3.2, PLAN.y + 3)
  const secBot = Math.min(lowest + 3.2, PLAN.y + PLAN.h - 2.2)
  const secMark = (y: number, inward: number) => {
    out.push(line(cx, y, cx, y + inward * 2.6, 'sec-thick'))
    out.push(line(cx, y, cx - 5.5, y, 'sec-arr'))
    out.push(arrow(cx - 6.2, y, -1, 0, 'sec-head', 1.6, 0.65))
    out.push(text(cx - 7.6, y + 1, 'A', 'sec-ltr', 2.8, 'end'))
  }
  secMark(secTop, 1)
  secMark(secBot, -1)

  for (const { p, bx, by } of placed) {
    const isOut = p.ref === 'OUT'
    const lbl = pipeLabel(p.size)
    out.push(rect(bx - BW / 2, by - BH / 2, BW, BH, isOut ? 'cb-outlet' : 'cb-inlet', 1.2))
    out.push(text(bx, by - 2.2, `${p.ref}  ${p.angle}°`, 'cb-ref', 1.75, 'middle'))
    out.push(text(bx, by + 1.4, lbl.dia, 'cb-dia', 3.0, 'middle'))
    out.push(text(bx, by + 4.3, isOut && s.outletLockSize === s.outlet.size ? `${lbl.std === 'TWINWALL' ? 'TW' : lbl.std}  LOCKED` : lbl.std, 'cb-std', 1.6, 'middle'))
  }

  return { svg: out.join('\n'), scale: N }
}

// ── Section A-A (front elevation) ───────────────────────────

interface ElevResult {
  svg: string
  scale: number
  broken: boolean
}

function generateElevation(s: SpecSheetData): ElevResult {
  const out: string[] = []
  const D = s.diameter
  const Ro = D / 2
  const Ri = Ro - WALL_THICKNESS
  const floorTop = FLOOR_THICKNESS
  const invert = floorTop + s.outlet.invertH
  const soffit = invert + s.outlet.bore
  const coverTop = soffit + s.depth
  const capT = s.reduced ? CAP_THICKNESS : 0
  const bodyTop = coverTop - COVER_HEIGHT - capT
  const coverW = s.reduced ? REDUCED_OPENING + 120 : D

  // Highest element in the lower part of the chamber
  const outC = floorTop + s.outlet.centreH
  let lowTop = Math.max(outC + s.outlet.od / 2, ...s.inlets.map((i) => floorTop + i.centreH + i.od / 2))
  if (s.flow?.type === 'Vortex') lowTop = Math.max(lowTop, outC + s.outlet.od / 2 + 120)
  if (s.baffle === 'internal') lowTop = Math.max(lowTop, invert + s.outlet.bore + 160)
  if (s.baffle === 'external') lowTop = Math.max(lowTop, invert + s.outlet.bore + 120)
  const lowHi = lowTop + 250
  const upLo = bodyTop - 220

  // ── scale and break ──
  const avail = ELEV.h - 11 - 10
  const GAP = 8
  const widthOk = (n: number) => D / n <= 56
  let N = SCALES.find((n) => widthOk(n) && coverTop / n <= avail) ?? 0
  let broken = false
  if (!N && upLo - lowHi > 400) {
    N = SCALES.find((n) => widthOk(n) && (coverTop - upLo + lowHi) / n + GAP <= avail) ?? 0
    broken = N > 0
  }
  if (!N) N = [40, 50, 60, 75, 100].find((n) => coverTop / n <= avail) ?? 100

  // Centre the drawing vertically in the space left for it.
  const drawnH = broken ? (coverTop - upLo + lowHi) / N + GAP : coverTop / N
  const topY = ELEV.y + 11 + Math.max(0, (avail - drawnH) / 2)
  const yOf = (real: number): number => {
    if (!broken || real >= upLo) return topY + (coverTop - real) / N
    return topY + (coverTop - upLo) / N + GAP + (lowHi - real) / N
  }

  const has6 = s.inlets.some((i) => i.hour === 6)
  const stub = Math.min(Math.max(200 / N, 5), 9)
  // Left of the chamber: the 6 o'clock stub and flow arrow, then the
  // overall height dimension.
  const dimOffset = has6 ? stub + 9.5 : 7
  const cx = ELEV.x + 6 + dimOffset + Ro / N
  const xOf = (sN: number): number => cx + sN / N
  const groundY = yOf(coverTop)
  const baseY = yOf(0)
  const xl = xOf(-Ro) - dimOffset

  // ── ground / cover level ──
  const gL = xl - 2
  const gR = xOf(Ro) + 9
  out.push(line(gL, groundY, gR, groundY, 'gline'))
  for (let hx = gL + 0.5; hx < xOf(-Ro) - 1; hx += 1.8) out.push(line(hx, groundY + 2.2, hx + 1.4, groundY, 'ghatch'))
  for (let hx = xOf(Ro) + 0.5; hx < gR - 1; hx += 1.8) out.push(line(hx, groundY + 2.2, hx + 1.4, groundY, 'ghatch'))
  out.push(text(xl + 0.9, groundY - 1.1, 'F.F.L.', 'ffl-lbl', 1.6, 'start'))

  // ── chamber body, one pass per drawn segment ──
  const segments: [number, number][] = broken ? [[0, lowHi], [upLo, coverTop]] : [[0, coverTop]]
  for (const [lo, hi] of segments) {
    const wLo = Math.max(lo, 0)
    const wHi = Math.min(hi, bodyTop)
    if (wHi > wLo) {
      // walls in section
      out.push(rect(xOf(-Ro), yOf(wHi), (Ro - Ri) / N, yOf(wLo) - yOf(wHi), 'wall-fill'))
      out.push(rect(xOf(Ri), yOf(wHi), (Ro - Ri) / N, yOf(wLo) - yOf(wHi), 'wall-fill'))
      const iLo = Math.max(lo, floorTop)
      out.push(rect(xOf(-Ri), yOf(wHi), (2 * Ri) / N, yOf(iLo) - yOf(wHi), 'int-fill'))
      out.push(line(xOf(-Ro), yOf(wHi), xOf(-Ro), yOf(wLo), 'obj-h'))
      out.push(line(xOf(Ro), yOf(wHi), xOf(Ro), yOf(wLo), 'obj-h'))
      out.push(line(xOf(-Ri), yOf(wHi), xOf(-Ri), yOf(iLo), 'obj-t'))
      out.push(line(xOf(Ri), yOf(wHi), xOf(Ri), yOf(iLo), 'obj-t'))
    }
    if (lo === 0) {
      out.push(rect(xOf(-Ri), yOf(invert), (2 * Ri) / N, yOf(floorTop) - yOf(invert), 'sump-fill'))
      out.push(rect(xOf(-Ro), yOf(floorTop), D / N, floorTop / N, 'wall-fill'))
      out.push(line(xOf(-Ro), baseY, xOf(Ro), baseY, 'obj-h'))
      out.push(line(xOf(-Ri), yOf(floorTop), xOf(Ri), yOf(floorTop), 'obj-t'))
      out.push(line(xOf(-Ri), yOf(invert), xOf(Ri), yOf(invert), 'hidden'))
    }
    if (hi === coverTop) {
      // body top, reducing cap, cover and frame
      if (s.reduced) {
        const capY0 = yOf(bodyTop + capT)
        const capY1 = yOf(bodyTop)
        out.push(rect(xOf(-Ro), capY0, (Ro - REDUCED_OPENING / 2) / N, capY1 - capY0, 'wall-fill'))
        out.push(rect(xOf(REDUCED_OPENING / 2), capY0, (Ro - REDUCED_OPENING / 2) / N, capY1 - capY0, 'wall-fill'))
        out.push(rect(xOf(-REDUCED_OPENING / 2), capY0, REDUCED_OPENING / N, capY1 - capY0, 'int-fill'))
        out.push(`<polyline points="${f(xOf(-REDUCED_OPENING / 2))},${f(capY0)} ${f(xOf(-Ro))},${f(capY0)} ${f(xOf(-Ro))},${f(capY1)}" class="obj-h"/>`)
        out.push(`<polyline points="${f(xOf(REDUCED_OPENING / 2))},${f(capY0)} ${f(xOf(Ro))},${f(capY0)} ${f(xOf(Ro))},${f(capY1)}" class="obj-h"/>`)
        out.push(line(xOf(-REDUCED_OPENING / 2), capY0, xOf(-REDUCED_OPENING / 2), capY1, 'obj-t'))
        out.push(line(xOf(REDUCED_OPENING / 2), capY0, xOf(REDUCED_OPENING / 2), capY1, 'obj-t'))
        out.push(line(xOf(-Ro), capY1, xOf(-Ri), capY1, 'obj-t'))
        out.push(line(xOf(Ri), capY1, xOf(Ro), capY1, 'obj-t'))
      }
      const cY0 = yOf(coverTop)
      const cY1 = yOf(bodyTop + capT)
      out.push(rect(xOf(-coverW / 2), cY0, coverW / N, cY1 - cY0, 'cover-fill'))
      const cLbl = s.top === 'cover' ? 'D400' : 'GRATE'
      if (cY1 - cY0 >= 2.4) out.push(text(cx, (cY0 + cY1) / 2 + 0.6, cLbl, 'cover-lbl', Math.min(1.8, (cY1 - cY0) * 0.7), 'middle'))
    }
  }

  // Break lines across the shaft
  if (broken) {
    const yA = yOf(upLo)
    const yB = yOf(lowHi)
    const brk = (y: number) => {
      const a = xOf(-Ro) - 1.5
      const b = xOf(Ro) + 1.5
      const m = cx
      return `<path d="M${f(a)},${f(y)} L${f(m - 2)},${f(y)} L${f(m - 0.8)},${f(y - 1.6)} L${f(m + 0.8)},${f(y + 1.6)} L${f(m + 2)},${f(y)} L${f(b)},${f(y)}" class="brk-line"/>`
    }
    out.push(brk(yA))
    out.push(brk(yB))
  }

  // Centre line
  // Centre line, broken where it would cross the cover label.
  out.push(line(cx, groundY - 2.5, cx, groundY, 'ctr'))
  out.push(line(cx, yOf(bodyTop + capT), cx, baseY + 2.5, 'ctr'))

  // ── pipes ──
  interface Tag {
    x: number
    y: number
    str: string
    cls: string
    anchor: 'start' | 'middle' | 'end'
    /** Point the tag labels; a leader is drawn if the tag has to move. */
    ax: number
    ay: number
    /** Keep the tag between the chamber walls. */
    inside?: boolean
  }
  const tags: Tag[] = []

  // Outlet, cut on the north (right) wall
  {
    const yc = yOf(outC)
    const hw = s.outlet.od / 2 / N
    const x0 = xOf(Ri)
    const x1 = xOf(Ro) + stub
    out.push(rect(x0, yc - hw, x1 - x0, 2 * hw, 'pipe-out'))
    out.push(line(x0 - 1.5, yc, x1 + 7, yc, 'pcl-out'))
    out.push(line(x1 + 0.8, yc, x1 + 5.2, yc, 'farr-out'))
    out.push(arrow(x1 + 6.4, yc, 1, 0, 'fhead-out', 1.5, 0.6))
    tags.push({ x: (xOf(Ro) + x1) / 2, y: yc - hw - 1.1, str: 'OUT', cls: 'tag-out', anchor: 'middle', ax: 0, ay: 0 })
  }

  // Inlets: 6 o'clock is cut on the south (left) wall. The others are
  // openings in the far (west) wall, or hidden in the removed east half.
  const openings = new Map<number, SheetPipe[]>()
  for (const p of s.inlets) {
    const yc = yOf(floorTop + p.centreH)
    const hw = p.od / 2 / N
    if (p.hour === 6) {
      const x0 = xOf(-Ro) - stub
      const x1 = xOf(-Ri)
      out.push(rect(x0, yc - hw, x1 - x0, 2 * hw, 'pipe-in'))
      out.push(line(x0 - 7, yc, x1 + 1.5, yc, 'pcl-in'))
      out.push(line(x0 - 5.6, yc, x0 - 1.4, yc, 'farr-in'))
      out.push(arrow(x0 - 0.4, yc, 1, 0, 'fhead-in', 1.5, 0.6))
      tags.push({ x: (x0 + xOf(-Ro)) / 2, y: yc - hw - 1.1, str: p.ref, cls: 'tag-in', anchor: 'middle', ax: 0, ay: 0 })
    } else {
      const key = Math.abs(p.hour - 6)
      openings.set(key, [...(openings.get(key) ?? []), p])
    }
  }
  for (const group of openings.values()) {
    let tagTop = Infinity
    let ox = cx
    for (const p of group) {
      // Outline of the pipe hole in the curved wall, projected onto the
      // section plane: offset u along the wall, v up the wall.
      const a = (p.angle * Math.PI) / 180
      const r = p.od / 2
      const pts: string[] = []
      for (let k = 0; k < 48; k++) {
        const t = (k / 48) * Math.PI * 2
        const u = r * Math.cos(t)
        const v = r * Math.sin(t)
        const phi = a + Math.asin(Math.max(-1, Math.min(1, u / Ri)))
        pts.push(`${f(xOf(Ri * Math.cos(phi)))},${f(yOf(floorTop + p.centreH + v))}`)
      }
      const visible = p.hour === 7 || p.hour === 9
      out.push(`<polygon points="${pts.join(' ')}" class="${visible ? 'open-in' : 'open-hid'}"/>`)
      ox = xOf(Ri * Math.cos(a))
      tagTop = Math.min(tagTop, yOf(floorTop + p.centreH + r))
    }
    const label = group
      .slice()
      .sort((a, b) => a.hour - b.hour)
      .map((p) => p.ref)
      .join(' / ')
    tags.push({ x: ox, y: tagTop - 1.1, str: label, cls: 'tag-in', anchor: 'middle', ax: ox, ay: tagTop, inside: true })
  }

  // ── flow control and catchpit internals ──
  if (s.flow) {
    const oh = s.outlet.od / 2
    if (s.flow.type === 'Vortex') {
      const w = Math.min(320, Ri * 0.6)
      const y0 = yOf(outC + oh + 120)
      const y1 = yOf(outC - oh - 120)
      out.push(rect(xOf(Ri - w), y0, w / N, y1 - y0, 'device', 0.6))
      tags.push({ x: xOf(Ri) - 0.6, y: y0 - 1.1, str: `VORTEX${s.flow.rate ? ` ${s.flow.rate} L/s` : ''}`, cls: 'tag-x', anchor: 'end', ax: 0, ay: 0 })
    } else {
      const y0 = yOf(outC + oh * 1.35)
      const y1 = yOf(outC - oh * 1.35)
      out.push(rect(xOf(Ri - 14), y0, Math.max(14 / N, 0.5), y1 - y0, 'device'))
      tags.push({ x: xOf(Ri) - 0.6, y: y0 - 1.1, str: `ORIFICE${s.flow.rate ? ` ${s.flow.rate} L/s` : ''}`, cls: 'tag-x', anchor: 'end', ax: 0, ay: 0 })
    }
  }
  if (s.variant === 'SERS') {
    const top = invert - 60
    const y0 = yOf(top)
    const y1 = yOf(floorTop + 12)
    out.push(rect(xOf(-(Ri - 20)), y0, (2 * (Ri - 20)) / N, y1 - y0, 'hidden'))
    // Below the internal baffle when there is one, so the two do not cross.
    const ty = s.baffle === 'internal' ? Math.min(yOf(invert - 220) + 3.2, y1 - 1) : y0 + 3.4
    tags.push({ x: cx - (Ri - 30) / N, y: ty, str: 'SILT BUCKET', cls: 'tag-x', anchor: 'start', ax: 0, ay: 0 })
  } else if (s.variant === 'SERDS') {
    const z = Ri * 0.12
    const y0 = yOf(invert - 110)
    out.push(rect(xOf(z - 11), y0, 22 / N, yOf(floorTop) - y0, 'wall-fill'))
    out.push(rect(xOf(z - 11), y0, 22 / N, yOf(floorTop) - y0, 'obj-t'))
    tags.push({ x: xOf(z) + 0.8, y: y0 + 3.4, str: 'WEIR', cls: 'tag-x', anchor: 'start', ax: 0, ay: 0 })
  }
  if (s.baffle === 'internal') {
    const bx = Ri - s.outlet.od * 0.9
    const y0 = yOf(invert + s.outlet.bore + 160)
    const y1 = yOf(invert - 220)
    out.push(rect(xOf(bx - 8), y0, Math.max(16 / N, 0.5), y1 - y0, 'device'))
    tags.push({ x: xOf(bx) - 0.8, y: y0 - 1.1, str: 'BAFFLE', cls: 'tag-x', anchor: 'end', ax: 0, ay: 0 })
  } else if (s.baffle === 'external') {
    const bx = Ri - s.outlet.od / 2 - 14
    const y0 = yOf(invert + s.outlet.bore + 120)
    const y1 = yOf(invert - 260)
    out.push(rect(xOf(bx - s.outlet.od / 2), y0, s.outlet.od / N, y1 - y0, 'open-hid'))
    tags.push({ x: xOf(bx) - 0.8, y: y0 - 1.1, str: 'DIP PIPE', cls: 'tag-x', anchor: 'end', ax: 0, ay: 0 })
  }

  // Sump label
  {
    const y0 = yOf(invert)
    const y1 = yOf(floorTop)
    if (y1 - y0 >= 3.2 && s.variant !== 'SERS') {
      out.push(text(cx - (s.variant === 'SERDS' ? 1.2 : 0), y1 - Math.min(1.2, (y1 - y0) * 0.25), 'SUMP', 'sump-lbl halo', 1.8, s.variant === 'SERDS' ? 'end' : 'middle'))
    }
  }

  // Place tags: keep inside tags between the walls and lift any that
  // collide. A leader joins a tag that had to move to what it labels.
  const placedTags: Rect[] = []
  const wallL = xOf(-Ri) + 0.6
  const wallR = xOf(Ri) - 0.6
  for (const t of tags) {
    const w = textWidth(t.str, 1.8, true)
    let x0 = t.anchor === 'middle' ? t.x - w / 2 : t.anchor === 'end' ? t.x - w : t.x
    if (t.inside) x0 = Math.min(Math.max(x0, wallL), wallR - w)
    let y = t.y
    const mk = (yy: number): Rect => ({ x0, y0: yy - 1.5, x1: x0 + w, y1: yy + 0.3 })
    let r = mk(y)
    for (let i = 0; i < 12 && placedTags.some((o) => overlaps(o, r, 0.3)); i++) {
      y -= 2.4
      r = mk(y)
    }
    placedTags.push(r)
    const moved = y !== t.y || Math.abs(x0 + w / 2 - t.x) > w / 2
    if (moved && t.ay) {
      const lx = Math.min(Math.max(t.ax, x0 + 0.5), x0 + w - 0.5)
      out.push(line(t.ax, t.ay, lx, y + 0.6, 'lead'))
    }
    out.push(text(x0, y, t.str, `${t.cls} halo`, 1.8, 'start'))
  }

  // ── dimensions ──
  // Right: depth to outlet soffit and sump, on one line.
  const xd = xOf(Ro) + stub + 9.5
  const yCover = groundY
  const ySoffit = yOf(soffit)
  const yInvert = yOf(invert)
  const yFloor = yOf(floorTop)
  out.push(line(xOf(coverW / 2) + 0.6, yCover, xd + 1, yCover, 'de'))
  out.push(line(xOf(Ro) + stub + 0.6, ySoffit, xd + 1, ySoffit, 'de'))
  out.push(line(xOf(Ro) + stub + 0.6, yInvert, xd + 1, yInvert, 'de'))
  out.push(line(xOf(Ro) + 0.6, yFloor, xd + 1, yFloor, 'de'))
  out.push(vDim(xd, yCover, ySoffit, `${s.depth} TO OUTLET SOFFIT`))
  out.push(vDim(xd, yInvert, yFloor, yFloor - yInvert >= 10 ? `SUMP ${s.sump}` : `${s.sump}`))

  // Left: overall height, cover level to the underside of the base.
  out.push(line(xOf(-coverW / 2) - 0.6, yCover, xl - 1, yCover, 'de'))
  out.push(line(xOf(-Ro) - 0.6, baseY, xl - 1, baseY, 'de'))
  out.push(vDim(xl, yCover, baseY, `OVERALL ${s.overallHeight}`))

  // Bottom: external diameter.
  const yd = baseY + 4.5
  out.push(line(xOf(-Ro), baseY + 0.6, xOf(-Ro), yd + 1, 'de'))
  out.push(line(xOf(Ro), baseY + 0.6, xOf(Ro), yd + 1, 'de'))
  out.push(hDim(yd, xOf(-Ro), xOf(Ro), `Ø${D} EXT`, 2.0))

  if (s.reduced) {
    // Clear opening above the cap
    const yo = groundY - 3.2
    out.push(line(xOf(-REDUCED_OPENING / 2), groundY - 0.4, xOf(-REDUCED_OPENING / 2), yo - 0.8, 'de'))
    out.push(line(xOf(REDUCED_OPENING / 2), groundY - 0.4, xOf(REDUCED_OPENING / 2), yo - 0.8, 'de'))
    out.push(line(xOf(-REDUCED_OPENING / 2), yo, xOf(REDUCED_OPENING / 2), yo, 'dl'))
    out.push(arrow(xOf(-REDUCED_OPENING / 2), yo, -1, 0))
    out.push(arrow(xOf(REDUCED_OPENING / 2), yo, 1, 0))
    out.push(text(xOf(REDUCED_OPENING / 2) + 1.2, yo + 0.7, `Ø${REDUCED_OPENING} OPENING`, 'dt', 1.8, 'start'))
  }

  // ── pipe schedule (top right of the field) ──
  out.push(pipeSchedule(s))

  return { svg: out.join('\n'), scale: N, broken }
}

function pipeSchedule(s: SpecSheetData): string {
  const w = 58
  const x = ELEV.x + ELEV.w - w - 3
  let y = ELEV.y + 3
  const out: string[] = []
  out.push(text(x, y + 2.4, 'PIPE SCHEDULE', 'tbl-title', 2.2))
  y += 3.6
  const cols = [
    { h: 'REF', x: 1.5 },
    { h: 'POSITION', x: 9.5 },
    { h: 'ANGLE', x: 23 },
    { h: 'SIZE', x: 32 },
    { h: 'H', x: 56.5, end: true },
  ]
  out.push(rect(x, y, w, 4, 'tbl-hdr-bg'))
  for (const c of cols) out.push(text(x + c.x, y + 2.8, c.h, 'tbl-hdr', 1.7, c.end ? 'end' : 'start'))
  y += 4
  const rows = [s.outlet, ...s.inlets]
  const rh = 3.5
  rows.forEach((p, i) => {
    out.push(rect(x, y, w, rh, i % 2 === 0 ? 'row-a' : 'row-b'))
    const isOut = p.ref === 'OUT'
    const by = y + 2.45
    out.push(text(x + cols[0].x, by, p.ref, isOut ? 'cell-out' : 'cell-in', 1.75))
    out.push(text(x + cols[1].x, by, `${p.hour} o'clock`, 'cell', 1.75))
    out.push(text(x + cols[2].x, by, `${p.angle}°`, 'cell', 1.75))
    out.push(text(x + cols[3].x, by, `${pipeLabel(p.size).short}${isOut && s.outletLockSize === s.outlet.size ? ' (R2)' : ''}`, 'cell', 1.75))
    out.push(text(x + cols[4].x, by, `${Math.round(p.centreH)}`, 'cell-b', 1.75, 'end'))
    y += rh
  })
  out.push(rect(x, ELEV.y + 6.6, w, y - (ELEV.y + 6.6), 'grid'))
  y += 2.8
  out.push(text(x, y, 'H = CENTRELINE ABOVE INTERNAL BASE (mm).', 'cell-m', 1.55))
  y += 2.5
  out.push(text(x, y, 'INLET SOFFITS ALIGNED WITH OUTLET SOFFIT.', 'cell-m', 1.55))
  if (s.flow) {
    y += 3.6
    out.push(text(x, y, 'FLOW CONTROL', 'tbl-title', 1.9))
    y += 2.8
    out.push(
      text(
        x,
        y,
        `${s.flow.type === 'Vortex' ? 'Vortex unit' : 'Orifice plate'} on the outlet, ${s.flow.rate ? `${s.flow.rate} L/s` : 'rate to be confirmed'}.`,
        'cell',
        1.75,
      ),
    )
  }
  return out.join('\n')
}

// ── Bill of materials ───────────────────────────────────────

function generateBOM(s: SpecSheetData): string {
  const out: string[] = []
  const { x, y, w, h } = BOM
  out.push(text(x + 3, y + 4.3, 'BILL OF MATERIALS', 'tbl-title', 2.4))
  const hy = y + 6
  const cols = [
    { h: '#', x: 3 },
    { h: 'DESCRIPTION', x: 9 },
    { h: 'MATERIAL', x: 60 },
    { h: 'QTY', x: 98 },
    { h: 'PART NO.', x: 107 },
  ]
  const tx = x + 1.5
  const tw = w - 3
  out.push(rect(tx, hy, tw, 4.2, 'tbl-hdr-bg'))
  for (const c of cols) out.push(text(x + c.x, hy + 2.95, c.h, 'tbl-hdr', 1.8))
  const rh = Math.min(3.6, (y + h - 1.5 - (hy + 4.2)) / Math.max(s.bom.length, 1))
  let ry = hy + 4.2
  s.bom.forEach((row, i) => {
    out.push(rect(tx, ry, tw, rh, i % 2 === 0 ? 'row-a' : 'row-b'))
    const by = ry + rh * 0.5 + 0.65
    out.push(text(x + cols[0].x, by, `${i + 1}`, 'cell-b', 1.85))
    out.push(text(x + cols[1].x, by, row.description, 'cell', 1.85))
    out.push(text(x + cols[2].x, by, row.material, 'cell', 1.85))
    out.push(text(x + cols[3].x, by, row.qty, 'cell', 1.85))
    out.push(text(x + cols[4].x, by, row.partNo, 'cell-pno', 1.85))
    ry += rh
  })
  out.push(rect(tx, hy, tw, ry - hy, 'grid'))
  for (const c of cols.slice(1)) out.push(line(x + c.x - 1.5, hy, x + c.x - 1.5, ry, 'grid'))
  return out.join('\n')
}

// ── General notes ───────────────────────────────────────────

function wrap(str: string, width: number, size: number): string[] {
  const words = str.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word
    if (textWidth(next, size) > width && cur) {
      lines.push(cur)
      cur = word
    } else {
      cur = next
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function generateNotes(s: SpecSheetData): string {
  const out: string[] = []
  const { x, y, w, h } = NOTES
  out.push(text(x + 3, y + 4.3, 'GENERAL NOTES', 'tbl-title', 2.4))
  // Shrink the type only if the notes would not otherwise fit.
  let size = 1.75
  let lh = 2.7
  let wrapped: string[][] = []
  for (let i = 0; i < 6; i++) {
    wrapped = s.notes.map((n) => wrap(n, w - 10, size))
    const total = wrapped.reduce((a, l) => a + l.length, 0)
    if (7.6 + total * lh <= h - 0.8) break
    size -= 0.08
    lh -= 0.12
  }
  let ly = y + 8.4
  wrapped.forEach((lines, i) => {
    out.push(text(x + 3, ly, `${i + 1}.`, 'note-n', size))
    lines.forEach((l) => {
      out.push(text(x + 7, ly, l, 'note-t', size))
      ly += lh
    })
  })
  return out.join('\n')
}

// ── Title block ─────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function generateTitleBlock(
  s: SpecSheetData,
  planN: number,
  elevN: number,
  sheet: { num: number; of: number },
): string {
  const out: string[] = []
  const { x, y, h } = TB
  const coW = 54
  const tX = x + coW
  const tW = 98
  const fX = tX + tW
  const fW = 288 - fX
  const cw = fW / 5
  const rh = h / 2

  // Company
  out.push(rect(x, y, coW, h, 'tb-co-bg'))
  out.push(rect(x + 3, y + 3, 9.5, 9.5, 'tb-logo-mk', 1.8))
  out.push(text(x + 7.75, y + 9.1, 'SE', 'tb-logo-t', 3.6, 'middle'))
  out.push(text(x + 15, y + 7.4, 'SuDS Enviro Ltd', 'tb-co-name', 3.3))
  out.push(text(x + 15, y + 11.4, 'The Home of SuDS Rhino', 'tb-co-sub', 2.0))
  out.push(text(x + 3, y + 18.6, '01224 057 700  |  hello@sudsenviro.com', 'tb-co-sub', 1.85))
  out.push(text(x + 3, y + 22.3, '9 Ambleside Court', 'tb-co-sub', 1.85))
  out.push(text(x + 3, y + 26, 'Chester-le-Street  DH3 2EB', 'tb-co-sub', 1.85))

  // Title
  out.push(rect(tX, y, tW, h, 'tb-ttl-bg'))
  out.push(line(tX, y, tX, y + h, 'zdiv-h'))
  out.push(line(fX, y, fX, y + h, 'zdiv-h'))
  out.push(text(tX + 3, y + 6.2, s.title, 'tb-drw-t', 4.0))
  out.push(text(tX + 3, y + 10.4, s.seriesLine, 'tb-drw-s2', 2.3))
  out.push(
    text(
      tX + 3,
      y + 14.4,
      `Ø${s.diameter}mm x ${s.depth}mm to outlet soffit  |  HDPE, BS EN 13598-2`,
      'tb-drw-s',
      2.0,
    ),
  )
  const meta = [
    s.systemLabel,
    s.adoptionLabel,
    `${s.inlets.length} inlet${s.inlets.length === 1 ? '' : 's'}`,
    s.quoteRef ? `Ref ${s.quoteRef}` : null,
  ]
    .filter((v): v is string => Boolean(v))
    .join('  |  ')
  out.push(text(tX + 3, y + 18.1, meta, 'tb-drw-m', 1.85))
  const codeLbl = `CODE  ${s.productCode}`
  const codeW = textWidth(codeLbl, 2.0, true) + 5
  out.push(rect(tX + 3, y + 21.3, codeW, 5.2, 'tb-code-bg', 1))
  out.push(text(tX + 5.5, y + 24.7, codeLbl, 'tb-code-t', 2.0))

  // Fields
  const field = (col: number, row: number, span: number, label: string, values: string[], fill: string) => {
    const fx = fX + col * cw
    const fy = y + row * rh
    out.push(rect(fx, fy, cw * span, rh, fill))
    out.push(text(fx + 1.8, fy + 3.4, label, 'tb-flbl', 1.55))
    if (values.length === 1) {
      const size = Math.min(2.4, ((cw * span - 3.6) / textWidth(values[0], 1, true)) * 0.98)
      out.push(text(fx + 1.8, fy + 10.2, values[0], 'tb-fval', size))
    } else {
      values.forEach((v, i) => out.push(text(fx + 1.8, fy + 7.8 + i * 3.4, v, 'tb-fval', 2.0)))
    }
  }
  field(0, 0, 2, 'DRG NO.', [s.drawingNo], 'tb-f1')
  field(2, 0, 1, 'DATE', [formatDate(s.date)], 'tb-f2')
  field(3, 0, 1, 'SHEET', [`${sheet.num} of ${sheet.of}`], 'tb-f1')
  field(4, 0, 1, 'REVISION', ['A'], 'tb-f2')
  field(0, 1, 1, 'SCALE (A4)', [`PLAN 1:${planN}`, `SECTION 1:${elevN}`], 'tb-f2')
  field(1, 1, 1, 'PROJECTION', [], 'tb-f1')
  field(2, 1, 1, 'DRAWN BY', ['Configurator'], 'tb-f2')
  field(3, 1, 1, 'CHECKED', ['Review required'], 'tb-f1')
  field(4, 1, 1, 'APPROVED', ['Pending'], 'tb-f2')

  // Third angle projection symbol
  {
    const px = fX + cw + 4
    const py = y + rh + 9
    // Third angle: the small end of the cone faces the end view.
    out.push(`<polygon points="${f(px)},${f(py - 2.8)} ${f(px + 6)},${f(py - 1.6)} ${f(px + 6)},${f(py + 1.6)} ${f(px)},${f(py + 2.8)}" class="proj"/>`)
    out.push(line(px - 1, py, px + 7, py, 'ctr'))
    out.push(`<circle cx="${f(px + 11)}" cy="${f(py)}" r="2.8" class="proj"/>`)
    out.push(`<circle cx="${f(px + 11)}" cy="${f(py)}" r="1.6" class="proj"/>`)
    out.push(line(px + 7.5, py, px + 14.5, py, 'ctr'))
    out.push(text(px - 1, py + 4.9, 'THIRD ANGLE', 'tb-flbl', 1.35))
  }

  // Field grid
  out.push(line(fX, y + rh, 288, y + rh, 'grid'))
  for (let c = 1; c < 5; c++) {
    if (c === 1) out.push(line(fX + c * cw, y + rh, fX + c * cw, y + h, 'grid'))
    else out.push(line(fX + c * cw, y, fX + c * cw, y + h, 'grid'))
  }
  return out.join('\n')
}

// ── Sheet ───────────────────────────────────────────────────

/** The drawing sheet as an inline SVG sized 297 x 210 mm. */
export function generateDrawingSVG(s: SpecSheetData, sheet: { num: number; of: number }): string {
  const plan = generatePlanView(s)
  const elev = generateElevation(s)

  const planTitle = `PLAN VIEW (COVER REMOVED)  |  SCALE 1:${plan.scale}`
  const elevTitle = `SECTION A-A LOOKING WEST  |  SCALE 1:${elev.scale}${elev.broken ? '  |  SHAFT SHOWN BROKEN' : ''}`

  return `<svg xmlns="http://www.w3.org/2000/svg" class="dwg" viewBox="0 0 297 210" width="297mm" height="210mm" style="display:block">
<defs>
  <clipPath id="cp-plan"><rect x="${PLAN.x}" y="${PLAN.y}" width="${PLAN.w}" height="${PLAN.h}"/></clipPath>
  <clipPath id="cp-elev"><rect x="${ELEV.x}" y="${ELEV.y}" width="${ELEV.w}" height="${ELEV.h}"/></clipPath>
</defs>
<rect x="0" y="0" width="297" height="210" fill="#fff"/>
${rect(PLAN.x, PLAN.y, PLAN.w, PLAN.h, 'zone-bg')}
${rect(ELEV.x, ELEV.y, ELEV.w, ELEV.h, 'zone-bg')}
${line(FRAME.x, VIEW_TOP, 288, VIEW_TOP, 'zdiv')}
${line(SPLIT_X, FRAME.y, SPLIT_X, BAND_TOP, 'zdiv')}
${line(FRAME.x, BAND_TOP, 288, BAND_TOP, 'zdiv')}
${line(NOTES.x, BAND_TOP, NOTES.x, TITLE_TOP, 'zdiv')}
${text(PLAN.x + 3, FRAME.y + 4.6, planTitle, 'zhdr', 2.2)}
${text(ELEV.x + 3, FRAME.y + 4.6, elevTitle, 'zhdr', 2.2)}
<g clip-path="url(#cp-plan)">
${plan.svg}
</g>
<g clip-path="url(#cp-elev)">
${elev.svg}
</g>
${generateBOM(s)}
${generateNotes(s)}
${generateTitleBlock(s, plan.scale, elev.scale, sheet)}
${line(FRAME.x, TITLE_TOP, 288, TITLE_TOP, 'zdiv-h')}
${rect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, 'bdr-out')}
</svg>`
}
