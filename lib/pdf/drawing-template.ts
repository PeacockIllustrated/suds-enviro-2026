/**
 * Engineering Drawing Template - generates a parameterised A4 landscape SVG
 * as a complete HTML document, matching the reference at suds-drawing-v4.html.
 */

import type { ComplianceResult } from '@/lib/types'

export interface DrawingParams {
  productCode: string
  quoteRef: string | null
  diameter: number
  depth: number
  inletCount: number
  positions: string[]
  pipeSizes: Record<string, string>
  outletSize: string
  outletLocked: boolean
  systemType: string
  adoptable: boolean
  flowControl: boolean
  flowType: string | null
  flowRate: string
  compliance: ComplianceResult[]
  date: string
}

// ── Geometry Helpers ────────────────────────────────────────

function clockToDegrees(clockHour: number): number {
  return (clockHour / 12) * 360
}

function clockToRadians(clockHour: number): number {
  return (clockHour / 12) * Math.PI * 2
}

function pipeSizeMm(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+)mm/)
  return match ? parseInt(match[1], 10) : 160
}

function pipeSizeLabel(sizeStr: string): { diameter: string; standard: string } {
  const mm = pipeSizeMm(sizeStr)
  const standard = sizeStr.includes('Twinwall') ? 'TW' : 'EN1401'
  return { diameter: `\u00D8${mm}`, standard }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

// ── CSS Styles ──────────────────────────────────────────────

function getStyles(): string {
  return `*{box-sizing:border-box;margin:0;padding:0;}
@page{size:A4 landscape;margin:0;}
html,body{width:297mm;height:210mm;overflow:hidden;margin:0;padding:0;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;}

.bdr-out{fill:none;stroke:#0a1e2e;stroke-width:0.9;}
.bdr-in {fill:none;stroke:#0a1e2e;stroke-width:0.25;}
.zdiv   {fill:none;stroke:#b0c8d8;stroke-width:0.3;}
.zdiv-h {fill:none;stroke:#0a1e2e;stroke-width:0.7;}
.zone-bg{fill:#f7fbfd;}
.zhdr   {font-family:'Montserrat',sans-serif;font-weight:700;fill:#5a7a90;letter-spacing:0.3px;}

.obj-h  {fill:none;stroke:#0a1e2e;stroke-width:0.55;}
.obj-t  {fill:none;stroke:#0a1e2e;stroke-width:0.28;}
.hidden {fill:none;stroke:#4a6a88;stroke-width:0.22;stroke-dasharray:2.5,1.5;}

.wall-fill {fill:#c8dde8;}   .int-fill  {fill:#eef6fa;}
.sump-fill {fill:#bed6e6;}   .shaft-fill{fill:#e4f0f6;}
.cover-fill{fill:#1a3a50;}

.ctr    {stroke:#c0392b;stroke-width:0.20;stroke-dasharray:5,1.8,1.2,1.8;fill:none;}
.inlet-cle {stroke:#1a82a2;stroke-width:0.18;stroke-dasharray:5,1.8,1.2,1.8;fill:none;}
.outlet-cle{stroke:#339932;stroke-width:0.18;stroke-dasharray:5,1.8,1.2,1.8;fill:none;}
.pcl    {fill:none;stroke-width:0.16;stroke-dasharray:5,1.8,1.2,1.8;}
.inlet-cl {stroke:#1a82a2;} .outlet-cl{stroke:#339932;}

.de     {fill:none;stroke:#004d70;stroke-width:0.18;}
.dl     {fill:none;stroke:#004d70;stroke-width:0.22;}
.darrow {fill:#004d70;}
.dt     {font-family:'Montserrat',sans-serif;font-weight:700;fill:#004d70;}

.pw     {fill:none;stroke-width:0.40;}
.pw-cap {fill:none;stroke-width:0.55;}
.inlet-c {stroke:#1a82a2;}  .outlet-c{stroke:#339932;}
.outlet-t{fill:#339932;}    .farr{fill:none;stroke:#339932;stroke-width:0.35;}

.cb-inlet {fill:#1a82a2;stroke:#005f8c;stroke-width:0.3;}
.cb-outlet{fill:#339932;stroke:#227a22;stroke-width:0.3;}
.cb-dia   {font-family:'Montserrat',sans-serif;font-weight:800;fill:white;}
.cb-std   {font-family:'Montserrat',sans-serif;font-weight:500;fill:rgba(255,255,255,0.9);}

.ang-lbl  {font-family:'Montserrat',sans-serif;font-weight:700;fill:#004d70;}
.id-lbl   {font-family:'Montserrat',sans-serif;font-weight:500;fill:#5a7a90;}
.north-fill{fill:#0a1e2e;}
.north-lbl {font-family:'Montserrat',sans-serif;font-weight:800;fill:#0a1e2e;}

.sec-line  {stroke:#e07b2a;stroke-width:0.30;stroke-dasharray:5.5,2;fill:none;}
.sec-circ  {fill:none;stroke:#e07b2a;stroke-width:0.35;}
.sec-ltr   {font-family:'Montserrat',sans-serif;font-weight:800;fill:#e07b2a;}
.sec-ext   {fill:none;stroke:#e07b2a;stroke-width:0.25;}
.sec-vlbl  {font-family:'Montserrat',sans-serif;font-weight:800;fill:#e07b2a;}
.sec-vsub  {font-family:'Montserrat',sans-serif;font-weight:400;fill:#5a7a90;}

.gline  {stroke:#4a8a68;stroke-width:0.55;fill:none;}
.ghatch {stroke:#7aaa88;stroke-width:0.25;fill:none;}
.ffl-lbl{font-family:'Montserrat',sans-serif;font-weight:700;fill:#2a5a40;}
.cover-lbl{font-family:'Montserrat',sans-serif;font-weight:700;fill:white;}
.sump-lbl {font-family:'Montserrat',sans-serif;font-weight:700;fill:#004d70;}
.sump-sub {font-family:'Montserrat',sans-serif;font-weight:400;fill:#5a7a90;}

.in-lbl {font-family:'Montserrat',sans-serif;font-weight:700;fill:#1a82a2;}
.in-sub {font-family:'Montserrat',sans-serif;font-weight:400;fill:#5a7a90;}
.out-lbl{font-family:'Montserrat',sans-serif;font-weight:700;fill:#339932;}
.out-sub{font-family:'Montserrat',sans-serif;font-weight:400;fill:#5a7a90;}

.proj-sym  {fill:none;stroke:#0a1e2e;stroke-width:0.28;}
.proj-line {fill:none;stroke:#0a1e2e;stroke-width:0.28;}
.proj-lbl  {font-family:'Montserrat',sans-serif;font-weight:600;fill:#5a7a90;}

.bom-title {font-family:'Montserrat',sans-serif;font-weight:800;fill:#004d70;letter-spacing:0.3px;}
.bom-hdr-bg{fill:#004d70;}
.bom-even  {fill:#f0f6fa;}   .bom-odd{fill:white;}
.bom-hdr   {font-family:'Montserrat',sans-serif;font-weight:700;fill:white;}
.bom-cell  {font-family:'Montserrat',sans-serif;font-weight:500;fill:#0f2535;}
.bom-num   {font-family:'Montserrat',sans-serif;font-weight:700;fill:#004d70;}
.bom-pno   {font-family:'Montserrat',sans-serif;font-weight:600;fill:#1a82a2;}
.bg        {stroke:#ccdde8;stroke-width:0.2;fill:none;}

.notes-hdr {font-family:'Montserrat',sans-serif;font-weight:800;fill:#004d70;letter-spacing:0.3px;}
.note-txt  {font-family:'Montserrat',sans-serif;font-weight:500;fill:#2a4a5e;}

.tb-co-bg  {fill:#004d70;}   .tb-ttl-bg{fill:#f0f6fa;}
.tb-logo-mk{fill:#005f8c;}
.tb-logo-t {font-family:'Montserrat',sans-serif;font-weight:800;fill:white;}
.tb-co-name{font-family:'Montserrat',sans-serif;font-weight:800;fill:white;}
.tb-co-sub {font-family:'Montserrat',sans-serif;font-weight:400;fill:#7ab8d4;}
.tb-drw-t  {font-family:'Montserrat',sans-serif;font-weight:800;fill:#004d70;}
.tb-drw-s  {font-family:'Montserrat',sans-serif;font-weight:600;fill:#0f2535;}
.tb-drw-s2 {font-family:'Montserrat',sans-serif;font-weight:600;fill:#1a82a2;}
.tb-drw-m  {font-family:'Montserrat',sans-serif;font-weight:400;fill:#5a7a90;}
.tb-f1{fill:#f0f6fa;} .tb-f2{fill:#e4eff6;}
.tb-flbl{font-family:'Montserrat',sans-serif;font-weight:700;fill:#5a7a90;text-transform:uppercase;letter-spacing:0.3px;}
.tb-fval{font-family:'Montserrat',sans-serif;font-weight:700;fill:#0f2535;}
.tb-code-bg{fill:#44af43;}
.tb-code-t {font-family:'Montserrat',sans-serif;font-weight:700;fill:white;}`
}

// ── Plan View ───────────────────────────────────────────────

function generatePlanView(p: DrawingParams): string {
  const cx = 79.5
  const cy = 78.0
  const scale = 0.1 // 1mm = 0.1 SVG units
  const extR = (p.diameter / 2) * scale
  const wallThickness = 12
  const intR = ((p.diameter / 2) - wallThickness) * scale

  const lines: string[] = []

  // Chamber circles
  lines.push(`<circle cx="${cx}" cy="${cy}" r="${extR.toFixed(3)}" class="wall-fill"/>`)
  lines.push(`<circle cx="${cx}" cy="${cy}" r="${intR.toFixed(3)}" class="int-fill"/>`)
  lines.push(`<circle cx="${cx}" cy="${cy}" r="${extR.toFixed(3)}" class="obj-h"/>`)
  lines.push(`<circle cx="${cx}" cy="${cy}" r="${intR.toFixed(3)}" class="obj-t"/>`)

  // Centre cross
  lines.push(`<line x1="${cx - extR - 22}" y1="${cy}" x2="${cx + extR + 22}" y2="${cy}" class="ctr"/>`)
  lines.push(`<line x1="${cx}" y1="${cy - extR - 22}" x2="${cx}" y2="${cy + extR + 22}" class="ctr"/>`)

  // North arrow (top right area)
  const naX = cx + extR + 16
  const naTop = cy - 19
  lines.push(`<line x1="${naX}" y1="${naTop + 18}" x2="${naX}" y2="${naTop}" class="obj-t"/>`)
  lines.push(`<polygon points="${naX},${naTop} ${naX - 2},${naTop + 6.5} ${naX + 2},${naTop + 6.5}" class="north-fill"/>`)
  lines.push(`<text x="${naX}" y="${naTop - 1.5}" text-anchor="middle" font-size="3.5" class="north-lbl">N</text>`)

  // Inlet pipes
  p.positions.forEach((pos, idx) => {
    const clockHour = parseInt(pos, 10)
    const angle = clockToRadians(clockHour)
    const degrees = clockToDegrees(clockHour)

    const sizeKey = `inlet${idx + 1}`
    const sizeStr = p.pipeSizes[sizeKey] || '160mm EN1401'
    const pipeMm = pipeSizeMm(sizeStr)
    const pipeR = (pipeMm / 2) * scale
    const label = pipeSizeLabel(sizeStr)

    // Direction from centre
    const dx = Math.sin(angle)
    const dy = -Math.cos(angle)

    // Pipe start point (on chamber wall)
    const startX = cx + dx * extR
    const startY = cy + dy * extR

    // Pipe end point (extending outward)
    const pipeLen = 8
    const endX = startX + dx * pipeLen
    const endY = startY + dy * pipeLen

    // Perpendicular direction for pipe width
    const px = -dy
    const py = dx

    // Pipe walls
    const w1sx = startX + px * pipeR
    const w1sy = startY + py * pipeR
    const w1ex = endX + px * pipeR
    const w1ey = endY + py * pipeR

    const w2sx = startX - px * pipeR
    const w2sy = startY - py * pipeR
    const w2ex = endX - px * pipeR
    const w2ey = endY - py * pipeR

    lines.push(`<line x1="${w1sx.toFixed(3)}" y1="${w1sy.toFixed(3)}" x2="${w1ex.toFixed(3)}" y2="${w1ey.toFixed(3)}" class="pw inlet-c"/>`)
    lines.push(`<line x1="${w2sx.toFixed(3)}" y1="${w2sy.toFixed(3)}" x2="${w2ex.toFixed(3)}" y2="${w2ey.toFixed(3)}" class="pw inlet-c"/>`)
    // Cap
    lines.push(`<line x1="${w1ex.toFixed(3)}" y1="${w1ey.toFixed(3)}" x2="${w2ex.toFixed(3)}" y2="${w2ey.toFixed(3)}" class="pw-cap inlet-c"/>`)

    // Centre line extending further
    const clLen = pipeLen + 18
    const clX = startX + dx * clLen
    const clY = startY + dy * clLen
    const clStartX = cx + dx * (intR - 5)
    const clStartY = cy + dy * (intR - 5)
    lines.push(`<line x1="${clStartX.toFixed(3)}" y1="${clStartY.toFixed(3)}" x2="${clX.toFixed(3)}" y2="${clY.toFixed(3)}" class="pcl inlet-cl"/>`)

    // Callout badge
    const badgeX = endX + dx * 12
    const badgeY = endY + dy * 12
    const badgeW = 28
    const badgeH = 10.5
    lines.push(`<rect x="${(badgeX - badgeW / 2).toFixed(3)}" y="${(badgeY - badgeH / 2).toFixed(3)}" width="${badgeW}" height="${badgeH}" rx="1.5" class="cb-inlet"/>`)
    lines.push(`<text x="${badgeX.toFixed(3)}" y="${(badgeY + 0.8).toFixed(3)}" text-anchor="middle" font-size="3.0" class="cb-dia">${label.diameter}</text>`)
    lines.push(`<text x="${badgeX.toFixed(3)}" y="${(badgeY + 4.5).toFixed(3)}" text-anchor="middle" font-size="2.0" class="cb-std">${label.standard}</text>`)

    // Angle label near pipe
    const lblX = startX + dx * 2
    const lblY = startY + dy * 2
    lines.push(`<text x="${lblX.toFixed(3)}" y="${lblY.toFixed(3)}" text-anchor="middle" font-size="2.2" class="ang-lbl">${degrees.toFixed(0)}\u00B0</text>`)
    lines.push(`<text x="${lblX.toFixed(3)}" y="${(lblY + 3.5).toFixed(3)}" text-anchor="middle" font-size="2.0" class="id-lbl">IN${idx + 1}</text>`)
  })

  // Outlet pipe fixed at 12 o'clock (north)
  {
    const outletHour = 12
    const outletDeg = clockToDegrees(outletHour)
    const outletAngle = clockToRadians(outletHour)
    const outletDx = Math.sin(outletAngle)
    const outletDy = -Math.cos(outletAngle)

    const outletMm = pipeSizeMm(p.outletSize)
    const outletR = (outletMm / 2) * scale
    const outLabel = pipeSizeLabel(p.outletSize)

    const startX = cx + outletDx * extR
    const startY = cy + outletDy * extR
    const pipeLen = 8
    const endX = startX + outletDx * pipeLen
    const endY = startY + outletDy * pipeLen

    // Perpendicular direction for pipe walls
    const px = -outletDy
    const py = outletDx

    const w1sx = startX + px * outletR
    const w1sy = startY + py * outletR
    const w1ex = endX + px * outletR
    const w1ey = endY + py * outletR
    const w2sx = startX - px * outletR
    const w2sy = startY - py * outletR
    const w2ex = endX - px * outletR
    const w2ey = endY - py * outletR

    lines.push(`<line x1="${w1sx.toFixed(3)}" y1="${w1sy.toFixed(3)}" x2="${w1ex.toFixed(3)}" y2="${w1ey.toFixed(3)}" class="pw outlet-c"/>`)
    lines.push(`<line x1="${w2sx.toFixed(3)}" y1="${w2sy.toFixed(3)}" x2="${w2ex.toFixed(3)}" y2="${w2ey.toFixed(3)}" class="pw outlet-c"/>`)
    lines.push(`<line x1="${w1ex.toFixed(3)}" y1="${w1ey.toFixed(3)}" x2="${w2ex.toFixed(3)}" y2="${w2ey.toFixed(3)}" class="pw-cap outlet-c"/>`)

    // Centre line
    const clLen = pipeLen + 22
    const clEndX = startX + outletDx * clLen
    const clEndY = startY + outletDy * clLen
    const clStartX = cx + outletDx * (intR - 5)
    const clStartY = cy + outletDy * (intR - 5)
    lines.push(`<line x1="${clStartX.toFixed(3)}" y1="${clStartY.toFixed(3)}" x2="${clEndX.toFixed(3)}" y2="${clEndY.toFixed(3)}" class="pcl outlet-cl"/>`)

    // Callout badge
    const badgeX = endX + outletDx * 14
    const badgeY = endY + outletDy * 14
    const badgeW = 32
    const badgeH = 10.5
    lines.push(`<rect x="${(badgeX - badgeW / 2).toFixed(3)}" y="${(badgeY - badgeH / 2).toFixed(3)}" width="${badgeW}" height="${badgeH}" rx="1.5" class="cb-outlet"/>`)
    lines.push(`<text x="${badgeX.toFixed(3)}" y="${(badgeY + 0.8).toFixed(3)}" text-anchor="middle" font-size="3.0" class="cb-dia">${outLabel.diameter}</text>`)
    lines.push(`<text x="${badgeX.toFixed(3)}" y="${(badgeY + 4.5).toFixed(3)}" text-anchor="middle" font-size="2.0" class="cb-std">${outLabel.standard}${p.outletLocked ? '  LOCKED' : ''}</text>`)

    // Angle and ID labels near pipe
    const lblX = startX + outletDx * 2
    const lblY = startY + outletDy * 2
    lines.push(`<text x="${lblX.toFixed(3)}" y="${lblY.toFixed(3)}" text-anchor="middle" font-size="2.2" class="ang-lbl outlet-t">${outletDeg.toFixed(0)}\u00B0</text>`)
    lines.push(`<text x="${lblX.toFixed(3)}" y="${(lblY + 3.5).toFixed(3)}" text-anchor="middle" font-size="2.0" class="id-lbl outlet-t">OUT</text>`)
  }

  // Section line A-A
  const secY = cy - 7.5
  const secLeftX = cx - extR - 8
  const secRightX = cx + extR + 8
  lines.push(`<line x1="${secLeftX}" y1="${secY}" x2="${secRightX}" y2="${secY}" class="sec-line"/>`)
  // Left A circle
  lines.push(`<circle cx="${secLeftX}" cy="${secY}" r="3" class="sec-circ"/>`)
  lines.push(`<text x="${secLeftX}" y="${secY + 1}" text-anchor="middle" font-size="2.2" class="sec-ltr">A</text>`)
  lines.push(`<line x1="${secLeftX}" y1="${secY + 3}" x2="${secLeftX}" y2="${secY + 6.5}" class="sec-ext"/>`)
  lines.push(`<polygon points="${secLeftX},${secY + 8.1} ${secLeftX - 0.512},${secY + 6.5} ${secLeftX + 0.512},${secY + 6.5}" class="darrow"/>`)
  // Right A circle
  lines.push(`<circle cx="${secRightX}" cy="${secY}" r="3" class="sec-circ"/>`)
  lines.push(`<text x="${secRightX}" y="${secY + 1}" text-anchor="middle" font-size="2.2" class="sec-ltr">A</text>`)
  lines.push(`<line x1="${secRightX}" y1="${secY + 3}" x2="${secRightX}" y2="${secY + 6.5}" class="sec-ext"/>`)
  lines.push(`<polygon points="${secRightX},${secY + 8.1} ${secRightX - 0.512},${secY + 6.5} ${secRightX + 0.512},${secY + 6.5}" class="darrow"/>`)

  // Diameter dimension below plan view
  const dimY = 158
  const dimLeftX = cx - extR
  const dimRightX = cx + extR
  lines.push(`<line x1="${dimLeftX}" y1="${dimY - 7}" x2="${dimLeftX}" y2="${dimY + 3}" class="de"/>`)
  lines.push(`<line x1="${dimRightX}" y1="${dimY - 7}" x2="${dimRightX}" y2="${dimY + 3}" class="de"/>`)
  lines.push(`<line x1="${dimLeftX}" y1="${dimY}" x2="${dimRightX}" y2="${dimY}" class="dl"/>`)
  lines.push(`<polygon points="${(dimLeftX + 1.8).toFixed(3)},${dimY} ${dimLeftX},${dimY - 0.576} ${dimLeftX},${dimY + 0.576}" class="darrow"/>`)
  lines.push(`<polygon points="${(dimRightX - 1.8).toFixed(3)},${dimY} ${dimRightX},${dimY - 0.576} ${dimRightX},${dimY + 0.576}" class="darrow"/>`)
  lines.push(`<text x="${cx}" y="${dimY + 4.5}" text-anchor="middle" font-size="2.4" class="dt">\u00D8${p.diameter}mm EXT</text>`)

  // Wall thickness dimension
  const wtAngle = Math.PI / 4 // 45 degrees
  const wtOx = cx + Math.cos(wtAngle) * extR
  const wtOy = cy - Math.sin(wtAngle) * extR
  const wtIx = cx + Math.cos(wtAngle) * intR
  const wtIy = cy - Math.sin(wtAngle) * intR
  const wtMidY = (wtOy + wtIy) / 2 - 1.4
  lines.push(`<line x1="${wtOx.toFixed(3)}" y1="${wtOy.toFixed(3)}" x2="${wtOx.toFixed(3)}" y2="${(wtOy - 5).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${wtIx.toFixed(3)}" y1="${wtIy.toFixed(3)}" x2="${wtIx.toFixed(3)}" y2="${(wtIy - 5).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${wtOx.toFixed(3)}" y1="${(wtMidY).toFixed(3)}" x2="${wtIx.toFixed(3)}" y2="${(wtMidY).toFixed(3)}" class="dl"/>`)
  lines.push(`<text x="${((wtOx + wtIx) / 2).toFixed(3)}" y="${(wtMidY - 1.1).toFixed(3)}" text-anchor="middle" font-size="1.9" class="dt">t=${wallThickness}</text>`)

  return `<g clip-path="url(#cp-plan)">
<text x="12" y="14.2" text-anchor="start" font-size="2.5" class="zhdr">PLAN VIEW  (SCALE 1:10)  -  SECTION A-A LOOKING NORTH</text>
</g>
<g clip-path="url(#cp-plan)">
${lines.join('\n')}
</g>`
}

// ── Front Elevation ─────────────────────────────────────────

function generateElevation(p: DrawingParams): string {
  const lines: string[] = []

  // Elevation geometry (scaled to fit in the right zone)
  const elevScale = 0.1 // 1mm = 0.1 SVG units
  const totalHeight = p.depth * elevScale
  const sumpHeight = 350 * elevScale // 35 SVG units always
  const wallWidth = p.diameter * elevScale
  const wallThickness = 1.0 // visual thickness in SVG units

  // Shaft diameter is smaller - 450mm for 600mm chamber, proportional for others
  const shaftRatio = 0.75
  const shaftWidth = wallWidth * shaftRatio
  const shaftHeight = Math.min(totalHeight * 0.38, 47.5) // proportional shaft

  // Centre of elevation zone
  const elevCx = 210.0
  const groundY = 21.0 // FFL / ground level
  const baseY = groundY + totalHeight
  const sumpTopY = baseY - sumpHeight
  const coverHeight = 3.333

  // Wall extents
  const wallLeft = elevCx - wallWidth / 2
  const wallRight = elevCx + wallWidth / 2
  const shaftLeft = elevCx - shaftWidth / 2
  const shaftRight = elevCx + shaftWidth / 2

  // Ground line and hatching
  for (let hx = wallLeft - 12; hx < wallRight + 12; hx += 4.5) {
    lines.push(`<line x1="${hx.toFixed(3)}" y1="${groundY}" x2="${(hx + 3.5).toFixed(3)}" y2="${(groundY - 5.5).toFixed(3)}" class="ghatch"/>`)
  }
  lines.push(`<line x1="${(wallLeft - 17).toFixed(3)}" y1="${groundY}" x2="${(wallRight + 17).toFixed(3)}" y2="${groundY}" class="gline"/>`)
  lines.push(`<text x="${(wallLeft - 19).toFixed(3)}" y="${(groundY - 1).toFixed(3)}" text-anchor="end" font-size="2.2" class="ffl-lbl">F.F.L.</text>`)

  // Main wall
  lines.push(`<rect x="${wallLeft.toFixed(3)}" y="${groundY}" width="${wallWidth.toFixed(3)}" height="${totalHeight.toFixed(3)}" rx="0" class="wall-fill"/>`)
  lines.push(`<rect x="${(wallLeft + wallThickness).toFixed(3)}" y="${groundY}" width="${(wallWidth - wallThickness * 2).toFixed(3)}" height="${totalHeight.toFixed(3)}" rx="0" class="int-fill"/>`)

  // Sump zone
  lines.push(`<rect x="${(wallLeft + wallThickness).toFixed(3)}" y="${sumpTopY.toFixed(3)}" width="${(wallWidth - wallThickness * 2).toFixed(3)}" height="${sumpHeight.toFixed(3)}" rx="0" class="sump-fill"/>`)

  // Shaft
  lines.push(`<rect x="${shaftLeft.toFixed(3)}" y="${groundY}" width="${shaftWidth.toFixed(3)}" height="${shaftHeight.toFixed(3)}" rx="0" class="shaft-fill"/>`)

  // Wall outline
  lines.push(`<rect x="${wallLeft.toFixed(3)}" y="${groundY}" width="${wallWidth.toFixed(3)}" height="${totalHeight.toFixed(3)}" rx="0" class="obj-h"/>`)

  // Shaft lines
  lines.push(`<line x1="${shaftLeft.toFixed(3)}" y1="${groundY}" x2="${shaftLeft.toFixed(3)}" y2="${(groundY + shaftHeight).toFixed(3)}" class="obj-t"/>`)
  lines.push(`<line x1="${shaftRight.toFixed(3)}" y1="${groundY}" x2="${shaftRight.toFixed(3)}" y2="${(groundY + shaftHeight).toFixed(3)}" class="obj-t"/>`)

  // Cover plate
  const coverTop = groundY - coverHeight
  lines.push(`<rect x="${shaftLeft.toFixed(3)}" y="${coverTop.toFixed(3)}" width="${shaftWidth.toFixed(3)}" height="${coverHeight.toFixed(3)}" rx="0" class="cover-fill"/>`)
  lines.push(`<rect x="${shaftLeft.toFixed(3)}" y="${coverTop.toFixed(3)}" width="${shaftWidth.toFixed(3)}" height="${coverHeight.toFixed(3)}" rx="0" class="obj-t"/>`)
  lines.push(`<text x="${elevCx}" y="${(coverTop + coverHeight * 0.8).toFixed(3)}" text-anchor="middle" font-size="1.8" class="cover-lbl">D400</text>`)

  // Sump divider line (hidden)
  lines.push(`<line x1="${(wallLeft + wallThickness).toFixed(3)}" y1="${sumpTopY.toFixed(3)}" x2="${(wallRight - wallThickness).toFixed(3)}" y2="${sumpTopY.toFixed(3)}" class="hidden"/>`)

  // Centre line
  lines.push(`<line x1="${elevCx}" y1="${(coverTop - 6).toFixed(3)}" x2="${elevCx}" y2="${(baseY + 7).toFixed(3)}" class="ctr"/>`)

  // Sump label
  const sumpMidY = (sumpTopY + baseY) / 2
  lines.push(`<text x="${elevCx}" y="${(sumpMidY - 2).toFixed(3)}" text-anchor="middle" font-size="2.5" class="sump-lbl">SUMP</text>`)
  lines.push(`<text x="${elevCx}" y="${(sumpMidY + 2).toFixed(3)}" text-anchor="middle" font-size="2.0" class="sump-sub">350mm</text>`)

  // Section A-A label
  const secLblY = groundY + totalHeight * 0.45
  lines.push(`<text x="${elevCx}" y="${secLblY.toFixed(3)}" text-anchor="middle" font-size="3.2" class="sec-vlbl">SECTION A-A</text>`)
  lines.push(`<text x="${elevCx}" y="${(secLblY + 5).toFixed(3)}" text-anchor="middle" font-size="2.0" class="sec-vsub">(Viewed from North)</text>`)

  // Inlet pipes on right side (staggered heights)
  const pipeSpacing = Math.min(13.333, totalHeight * 0.12)
  p.positions.forEach((pos, idx) => {
    const clockHour = parseInt(pos, 10)
    const degrees = clockToDegrees(clockHour)
    const sizeKey = `inlet${idx + 1}`
    const sizeStr = p.pipeSizes[sizeKey] || '160mm EN1401'
    const pipeMm = pipeSizeMm(sizeStr)
    const pipeVisH = pipeMm * elevScale

    // Stagger from top down
    const pipeCentreY = groundY + shaftHeight + 6 + idx * pipeSpacing
    const pipeTop = pipeCentreY - pipeVisH / 2
    const pipeBot = pipeCentreY + pipeVisH / 2

    // Pipe on right side
    lines.push(`<line x1="${wallRight.toFixed(3)}" y1="${pipeTop.toFixed(3)}" x2="${(wallRight + 8).toFixed(3)}" y2="${pipeTop.toFixed(3)}" class="pw inlet-c"/>`)
    lines.push(`<line x1="${wallRight.toFixed(3)}" y1="${pipeBot.toFixed(3)}" x2="${(wallRight + 8).toFixed(3)}" y2="${pipeBot.toFixed(3)}" class="pw inlet-c"/>`)
    lines.push(`<line x1="${(wallRight + 8).toFixed(3)}" y1="${pipeTop.toFixed(3)}" x2="${(wallRight + 8).toFixed(3)}" y2="${pipeBot.toFixed(3)}" class="pw-cap inlet-c"/>`)

    // Hidden lines on left
    lines.push(`<line x1="${(wallLeft - 7).toFixed(3)}" y1="${pipeTop.toFixed(3)}" x2="${wallLeft.toFixed(3)}" y2="${pipeTop.toFixed(3)}" class="hidden"/>`)
    lines.push(`<line x1="${(wallLeft - 7).toFixed(3)}" y1="${pipeBot.toFixed(3)}" x2="${wallLeft.toFixed(3)}" y2="${pipeBot.toFixed(3)}" class="hidden"/>`)

    // Centre line
    lines.push(`<line x1="${(wallLeft - 9).toFixed(3)}" y1="${pipeCentreY.toFixed(3)}" x2="${(wallRight + 10).toFixed(3)}" y2="${pipeCentreY.toFixed(3)}" class="ctr inlet-cle"/>`)

    // Height from base
    const hFromBase = Math.round(p.depth - 350 - (idx * pipeSpacing * 10))

    // Label
    lines.push(`<text x="${(wallRight + 11).toFixed(3)}" y="${(pipeCentreY + 1).toFixed(3)}" text-anchor="start" font-size="2.4" class="in-lbl">IN${idx + 1}  \u00D8${pipeMm} ${sizeStr.includes('Twinwall') ? 'TW' : 'EN1401'}</text>`)
    lines.push(`<text x="${(wallRight + 11).toFixed(3)}" y="${(pipeCentreY + 5).toFixed(3)}" text-anchor="start" font-size="2.0" class="in-sub">H = ${hFromBase}mm  |  ${degrees.toFixed(0)}\u00B0 from N</text>`)
  })

  // Outlet pipe on left side
  {
    const outletMm = pipeSizeMm(p.outletSize)
    const outletVisH = outletMm * elevScale
    // Outlet at sump top level
    const outletCentreY = sumpTopY
    const outletTop = outletCentreY - outletVisH / 2
    const outletBot = outletCentreY + outletVisH / 2

    lines.push(`<line x1="${(wallLeft - 8).toFixed(3)}" y1="${outletTop.toFixed(3)}" x2="${wallLeft.toFixed(3)}" y2="${outletTop.toFixed(3)}" class="pw outlet-c"/>`)
    lines.push(`<line x1="${(wallLeft - 8).toFixed(3)}" y1="${outletBot.toFixed(3)}" x2="${wallLeft.toFixed(3)}" y2="${outletBot.toFixed(3)}" class="pw outlet-c"/>`)
    lines.push(`<line x1="${(wallLeft - 8).toFixed(3)}" y1="${outletTop.toFixed(3)}" x2="${(wallLeft - 8).toFixed(3)}" y2="${outletBot.toFixed(3)}" class="pw-cap outlet-c"/>`)

    // Hidden on right
    lines.push(`<line x1="${wallRight.toFixed(3)}" y1="${outletTop.toFixed(3)}" x2="${(wallRight + 6).toFixed(3)}" y2="${outletTop.toFixed(3)}" class="hidden"/>`)
    lines.push(`<line x1="${wallRight.toFixed(3)}" y1="${outletBot.toFixed(3)}" x2="${(wallRight + 6).toFixed(3)}" y2="${outletBot.toFixed(3)}" class="hidden"/>`)

    // Centre line
    lines.push(`<line x1="${(wallLeft - 15).toFixed(3)}" y1="${outletCentreY.toFixed(3)}" x2="${(wallRight + 8).toFixed(3)}" y2="${outletCentreY.toFixed(3)}" class="ctr outlet-cle"/>`)

    // Flow arrow
    lines.push(`<line x1="${(wallLeft - 8).toFixed(3)}" y1="${outletCentreY.toFixed(3)}" x2="${(wallLeft - 13).toFixed(3)}" y2="${outletCentreY.toFixed(3)}" class="farr"/>`)
    lines.push(`<polygon points="${(wallLeft - 15.5).toFixed(3)},${outletCentreY} ${(wallLeft - 13).toFixed(3)},${(outletCentreY - 0.8).toFixed(3)} ${(wallLeft - 13).toFixed(3)},${(outletCentreY + 0.8).toFixed(3)}" class="darrow"/>`)

    // Label - outlet is fixed at 12 o'clock
    lines.push(`<text x="${(wallLeft - 11).toFixed(3)}" y="${(outletCentreY + 1).toFixed(3)}" text-anchor="end" font-size="2.4" class="out-lbl">OUT  \u00D8${outletMm} ${p.outletSize.includes('Twinwall') ? 'TW' : 'EN1401'}  @ 12 O'CLOCK</text>`)
    lines.push(`<text x="${(wallLeft - 11).toFixed(3)}" y="${(outletCentreY + 5).toFixed(3)}" text-anchor="end" font-size="2.0" class="out-sub">${p.outletLocked ? 'RULE-ENGINE LOCKED' : ''}</text>`)
  }

  // Total depth dimension (right side)
  const dimRightX = wallRight + 26
  lines.push(`<line x1="${(dimRightX - 2.5).toFixed(3)}" y1="${groundY}" x2="${(dimRightX + 2.5).toFixed(3)}" y2="${groundY}" class="de"/>`)
  lines.push(`<line x1="${(dimRightX - 2.5).toFixed(3)}" y1="${baseY.toFixed(3)}" x2="${(dimRightX + 2.5).toFixed(3)}" y2="${baseY.toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${dimRightX}" y1="${groundY}" x2="${dimRightX}" y2="${baseY.toFixed(3)}" class="dl"/>`)
  lines.push(`<polygon points="${dimRightX},${(groundY + 1.8).toFixed(3)} ${dimRightX - 0.576},${groundY} ${dimRightX + 0.576},${groundY}" class="darrow"/>`)
  lines.push(`<polygon points="${dimRightX},${(baseY - 1.8).toFixed(3)} ${dimRightX - 0.576},${baseY.toFixed(3)} ${dimRightX + 0.576},${baseY.toFixed(3)}" class="darrow"/>`)
  lines.push(`<text x="${(dimRightX + 2.5).toFixed(3)}" y="${((groundY + baseY) / 2).toFixed(3)}" text-anchor="middle" font-size="2.4" transform="rotate(-90 ${(dimRightX + 2.5).toFixed(3)} ${((groundY + baseY) / 2).toFixed(3)})" class="dt">${p.depth}mm TOTAL</text>`)

  // Sump dimension
  const sumpDimX = wallRight + 18
  lines.push(`<line x1="${(sumpDimX - 2).toFixed(3)}" y1="${sumpTopY.toFixed(3)}" x2="${(sumpDimX + 2).toFixed(3)}" y2="${sumpTopY.toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${(sumpDimX - 2).toFixed(3)}" y1="${baseY.toFixed(3)}" x2="${(sumpDimX + 2).toFixed(3)}" y2="${baseY.toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${sumpDimX}" y1="${sumpTopY.toFixed(3)}" x2="${sumpDimX}" y2="${baseY.toFixed(3)}" class="dl"/>`)
  lines.push(`<polygon points="${sumpDimX},${(sumpTopY + 1.8).toFixed(3)} ${sumpDimX - 0.576},${sumpTopY.toFixed(3)} ${sumpDimX + 0.576},${sumpTopY.toFixed(3)}" class="darrow"/>`)
  lines.push(`<polygon points="${sumpDimX},${(baseY - 1.8).toFixed(3)} ${sumpDimX - 0.576},${baseY.toFixed(3)} ${sumpDimX + 0.576},${baseY.toFixed(3)}" class="darrow"/>`)
  lines.push(`<text x="${(sumpDimX + 2.5).toFixed(3)}" y="${((sumpTopY + baseY) / 2).toFixed(3)}" text-anchor="middle" font-size="2.0" transform="rotate(-90 ${(sumpDimX + 2.5).toFixed(3)} ${((sumpTopY + baseY) / 2).toFixed(3)})" class="dt">350mm SUMP</text>`)

  // Diameter dimension below elevation
  const elevDimY = baseY + 12
  lines.push(`<line x1="${wallLeft.toFixed(3)}" y1="${(baseY + 4).toFixed(3)}" x2="${wallLeft.toFixed(3)}" y2="${(elevDimY + 3).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${wallRight.toFixed(3)}" y1="${(baseY + 4).toFixed(3)}" x2="${wallRight.toFixed(3)}" y2="${(elevDimY + 3).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${wallLeft.toFixed(3)}" y1="${elevDimY.toFixed(3)}" x2="${wallRight.toFixed(3)}" y2="${elevDimY.toFixed(3)}" class="dl"/>`)
  lines.push(`<polygon points="${(wallLeft + 1.8).toFixed(3)},${elevDimY} ${wallLeft.toFixed(3)},${(elevDimY - 0.576).toFixed(3)} ${wallLeft.toFixed(3)},${(elevDimY + 0.576).toFixed(3)}" class="darrow"/>`)
  lines.push(`<polygon points="${(wallRight - 1.8).toFixed(3)},${elevDimY} ${wallRight.toFixed(3)},${(elevDimY - 0.576).toFixed(3)} ${wallRight.toFixed(3)},${(elevDimY + 0.576).toFixed(3)}" class="darrow"/>`)
  lines.push(`<text x="${elevCx}" y="${(elevDimY + 4.5).toFixed(3)}" text-anchor="middle" font-size="2.4" class="dt">\u00D8${p.diameter}mm EXT</text>`)

  // Shaft dimension at top
  const shaftDimY = coverTop - 5
  lines.push(`<line x1="${shaftLeft.toFixed(3)}" y1="${(coverTop - 1).toFixed(3)}" x2="${shaftLeft.toFixed(3)}" y2="${(shaftDimY - 1).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${shaftRight.toFixed(3)}" y1="${(coverTop - 1).toFixed(3)}" x2="${shaftRight.toFixed(3)}" y2="${(shaftDimY - 1).toFixed(3)}" class="de"/>`)
  lines.push(`<line x1="${shaftLeft.toFixed(3)}" y1="${shaftDimY.toFixed(3)}" x2="${shaftRight.toFixed(3)}" y2="${shaftDimY.toFixed(3)}" class="dl"/>`)
  lines.push(`<polygon points="${(shaftLeft + 1.8).toFixed(3)},${shaftDimY} ${shaftLeft.toFixed(3)},${(shaftDimY - 0.576).toFixed(3)} ${shaftLeft.toFixed(3)},${(shaftDimY + 0.576).toFixed(3)}" class="darrow"/>`)
  lines.push(`<polygon points="${(shaftRight - 1.8).toFixed(3)},${shaftDimY} ${shaftRight.toFixed(3)},${(shaftDimY - 0.576).toFixed(3)} ${shaftRight.toFixed(3)},${(shaftDimY + 0.576).toFixed(3)}" class="darrow"/>`)
  lines.push(`<text x="${elevCx}" y="${(shaftDimY - 1).toFixed(3)}" text-anchor="middle" font-size="2.0" class="dt">\u00D8${Math.round(p.diameter * shaftRatio)}mm SHAFT</text>`)

  // 3rd angle projection symbol
  lines.push(`<circle cx="278" cy="170" r="3.2" class="proj-sym"/>`)
  lines.push(`<line x1="276.2" y1="166.8" x2="279.8" y2="166.8" class="proj-line"/>`)
  lines.push(`<line x1="275" y1="164.5" x2="281" y2="164.5" class="proj-line"/>`)
  lines.push(`<text x="283" y="170" text-anchor="start" font-size="1.9" class="proj-lbl">3RD ANGLE</text>`)
  lines.push(`<text x="283" y="174" text-anchor="start" font-size="1.9" class="proj-lbl">PROJECTION</text>`)

  return `<g clip-path="url(#cp-elev)">
<text x="153" y="14.2" text-anchor="start" font-size="2.5" class="zhdr">FRONT ELEVATION  (SCALE 1:12)  -  ALL DIMS IN mm</text>
</g>
<g clip-path="url(#cp-elev)">
${lines.join('\n')}
</g>`
}

// ── BOM Table ───────────────────────────────────────────────

function generateBOM(p: DrawingParams): string {
  const lines: string[] = []

  const sealQty = `${p.inletCount + 1}`
  const productPrefix = p.productCode.startsWith('IC') ? 'IC' : 'IC'

  interface BOMRow {
    num: number
    description: string
    material: string
    qty: string
    partNo: string
  }

  const rows: BOMRow[] = [
    { num: 1, description: 'Chamber Body', material: 'HDPE Rotationally Moulded', qty: '1', partNo: `SE-${productPrefix}-${p.diameter}-BODY` },
    { num: 2, description: 'Shaft Extension Rings', material: 'HDPE', qty: 'A/R', partNo: `SE-${productPrefix}-${p.diameter}-SHAFT` },
    { num: 3, description: 'D400 Cover and Frame', material: 'Ductile Iron BS EN 124', qty: '1', partNo: 'SE-COVER-D400' },
    { num: 4, description: 'EPDM Pipe Sealing Rings', material: 'Elastomer BS EN 681-1', qty: sealQty, partNo: 'SE-SEAL-EPDM' },
  ]

  if (p.flowControl) {
    const fcType = p.flowType === 'Vortex' ? 'Vortex Flow Control' : 'Orifice Flow Control'
    const fcMat = p.flowType === 'Vortex' ? 'SS316 Body' : 'SS316 Plate'
    const fcRate = p.flowRate ? `${p.flowRate}LS` : ''
    rows.push({
      num: 5,
      description: fcType,
      material: fcMat,
      qty: '1',
      partNo: `SE-VFC-${fcRate}`,
    })
  }

  rows.push({
    num: rows.length + 1,
    description: 'GRP Access Steps',
    material: 'BS EN 13101',
    qty: 'Set',
    partNo: 'SE-STEP-GRP',
  })

  // Header
  lines.push(`<text x="12" y="151.5" text-anchor="start" font-size="2.5" class="bom-title">BILL OF MATERIALS</text>`)
  lines.push(`<rect x="9" y="152" width="139" height="5.5" rx="0" class="bom-hdr-bg"/>`)
  lines.push(`<text x="12" y="155.7" text-anchor="start" font-size="2.3" class="bom-hdr">#</text>`)
  lines.push(`<text x="20" y="155.7" text-anchor="start" font-size="2.3" class="bom-hdr">DESCRIPTION</text>`)
  lines.push(`<text x="64" y="155.7" text-anchor="start" font-size="2.3" class="bom-hdr">MATERIAL</text>`)
  lines.push(`<text x="112" y="155.7" text-anchor="start" font-size="2.3" class="bom-hdr">QTY</text>`)
  lines.push(`<text x="123" y="155.7" text-anchor="start" font-size="2.3" class="bom-hdr">PART NO.</text>`)

  const rowH = 3.4
  let y = 157.5

  rows.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? 'bom-even' : 'bom-odd'
    lines.push(`<rect x="9" y="${y.toFixed(1)}" width="139" height="${rowH}" rx="0" class="${bg}"/>`)
    lines.push(`<text x="12" y="${(y + 2.2).toFixed(1)}" text-anchor="start" font-size="2.1" class="bom-num">${row.num}</text>`)
    lines.push(`<text x="20" y="${(y + 2.2).toFixed(1)}" text-anchor="start" font-size="2.1" class="bom-cell">${row.description}</text>`)
    lines.push(`<text x="64" y="${(y + 2.2).toFixed(1)}" text-anchor="start" font-size="2.1" class="bom-cell">${row.material}</text>`)
    lines.push(`<text x="112" y="${(y + 2.2).toFixed(1)}" text-anchor="start" font-size="2.1" class="bom-cell">${row.qty}</text>`)
    lines.push(`<text x="123" y="${(y + 2.2).toFixed(1)}" text-anchor="start" font-size="2.1" class="bom-pno">${row.partNo}</text>`)
    y += rowH
  })

  // Grid lines
  lines.push(`<line x1="18" y1="152" x2="18" y2="${y.toFixed(1)}" class="bg"/>`)
  lines.push(`<line x1="62" y1="152" x2="62" y2="${y.toFixed(1)}" class="bg"/>`)
  lines.push(`<line x1="110" y1="152" x2="110" y2="${y.toFixed(1)}" class="bg"/>`)
  lines.push(`<line x1="121" y1="152" x2="121" y2="${y.toFixed(1)}" class="bg"/>`)

  for (let gy = 157.5; gy <= y; gy += rowH) {
    lines.push(`<line x1="9" y1="${gy.toFixed(1)}" x2="148" y2="${gy.toFixed(1)}" class="bg"/>`)
  }
  lines.push(`<line x1="9" y1="152" x2="9" y2="${y.toFixed(1)}" class="bg"/>`)
  lines.push(`<line x1="148" y1="152" x2="148" y2="${y.toFixed(1)}" class="bg"/>`)

  return `<g clip-path="url(#cp-bom)">
${lines.join('\n')}
</g>`
}

// ── Notes Section ───────────────────────────────────────────

function generateNotes(p: DrawingParams): string {
  const notes: string[] = [
    '1.  ALL DIMENSIONS IN MILLIMETRES UNLESS STATED.',
    "2.  INLET POSITIONS ARE DEFINED BY ANGLE FROM NORTH (12 O'CLOCK) CLOCKWISE AND",
    '    HEIGHT FROM INTERNAL BASE.',
  ]

  if (p.outletLocked) {
    const outMm = pipeSizeMm(p.outletSize)
    notes.push(`3.  OUTLET SIZE O${outMm} ${p.outletSize.includes('Twinwall') ? 'TWINWALL' : 'EN1401'} IS RULE-ENGINE LOCKED. DO NOT REDUCE.`)
  } else {
    notes.push('3.  OUTLET SIZE AS SPECIFIED. VERIFY ON SITE BEFORE INSTALLATION.')
  }

  notes.push(
    '4.  SUMP DEPTH 350mm IS MEASURED FROM OUTLET PIPE SOFFIT CENTRELINE TO INTERNAL',
    '    BASE.',
    `5.  MAX ADOPTABLE DEPTH: 2000mm TO PIPE SOFFIT. MAX NON-ADOPTABLE: 3000mm TOTAL`,
    '    DEPTH.',
    '6.  ALL PIPE JOINT SEALS TO BS EN 681-1. LUBRICANT TO MANUFACTURERS',
    '    SPECIFICATION.',
    '7.  GENERAL TOLERANCES: LINEAR +/-5mm, ANGULAR +/-1 DEGREE. THIRD ANGLE',
    '    PROJECTION.',
  )

  let y = 159
  const noteLines = notes.map((note) => {
    const line = `<text x="154" y="${y}" text-anchor="start" font-size="1.9" class="note-txt">${escapeXml(note)}</text>`
    y += 4
    return line
  })

  return `<g clip-path="url(#cp-notes)">
<text x="154" y="153" text-anchor="start" font-size="2.8" class="notes-hdr">GENERAL NOTES:</text>
${noteLines.join('\n')}
</g>`
}

// ── Title Block ─────────────────────────────────────────────

function generateTitleBlock(p: DrawingParams): string {
  const lines: string[] = []
  const formattedDate = formatDate(p.date)
  const drgNo = `SE-DRG-${p.productCode}`
  const systemLabel = p.systemType === 'surface' ? 'Surface Water' : p.systemType === 'foul' ? 'Foul' : 'Combined'
  const adoptLabel = p.adoptable ? 'S104 Adoptable' : 'Non-adoptable'

  // Company block (left)
  lines.push(`<rect x="9" y="176" width="44" height="25" rx="0" class="tb-co-bg"/>`)
  lines.push(`<rect x="53" y="176" width="77" height="25" rx="0" class="tb-ttl-bg"/>`)
  lines.push(`<line x1="53" y1="176" x2="53" y2="201" class="zdiv-h"/>`)
  lines.push(`<line x1="130" y1="176" x2="130" y2="201" class="zdiv-h"/>`)

  // Field dividers
  lines.push(`<line x1="169.5" y1="176" x2="169.5" y2="201" class="bg"/>`)
  lines.push(`<line x1="209" y1="176" x2="209" y2="201" class="bg"/>`)
  lines.push(`<line x1="248.5" y1="176" x2="248.5" y2="201" class="bg"/>`)
  lines.push(`<line x1="130" y1="188.5" x2="288" y2="188.5" class="bg"/>`)

  // Logo
  lines.push(`<rect x="11" y="179" width="10" height="10" rx="2" class="tb-logo-mk"/>`)
  lines.push(`<text x="16" y="185.5" text-anchor="middle" font-size="3.8" class="tb-logo-t">SE</text>`)

  // Company text
  lines.push(`<text x="23" y="183" text-anchor="start" font-size="3.8" class="tb-co-name">SuDS Enviro Ltd</text>`)
  lines.push(`<text x="23" y="188" text-anchor="start" font-size="2.4" class="tb-co-sub">The Home of SuDS Rhino</text>`)
  lines.push(`<text x="23" y="192.5" text-anchor="start" font-size="2.2" class="tb-co-sub">01224 057 700  |  hello@sudsenviro.com</text>`)
  lines.push(`<text x="23" y="197" text-anchor="start" font-size="2.0" class="tb-co-sub">9 Ambleside Court, Chester-le-Street  DH3 2EB</text>`)

  // Product code badge
  lines.push(`<rect x="11" y="194.5" width="40" height="5.5" rx="1" class="tb-code-bg"/>`)
  lines.push(`<text x="31" y="198.2" text-anchor="middle" font-size="2.2" class="tb-code-t">Code: ${p.productCode}</text>`)

  // Title area
  lines.push(`<g clip-path="url(#cp-tbtitle)">`)
  lines.push(`<text x="56" y="183" text-anchor="start" font-size="4.5" class="tb-drw-t">INSPECTION CHAMBER</text>`)
  lines.push(`<text x="56" y="188.5" text-anchor="start" font-size="3.5" class="tb-drw-s2">RHINO SERIES</text>`)
  lines.push(`<text x="56" y="190" text-anchor="start" font-size="3.0" class="tb-drw-s">\u00D8${p.diameter}mm x ${p.depth}mm  |  HDPE Rotationally Moulded (BS EN 13598)</text>`)
  lines.push(`<text x="56" y="195" text-anchor="start" font-size="2.2" class="tb-drw-m">${systemLabel}  |  ${adoptLabel}${p.quoteRef ? `  |  Ref: ${p.quoteRef}` : ''}</text>`)
  lines.push(`<text x="56" y="199" text-anchor="start" font-size="2.0" class="tb-drw-m">3rd Angle Projection  |  Plan 1:10  |  Elev 1:12  |  DXF/DWG on request</text>`)
  lines.push(`</g>`)

  // Field row 1
  lines.push(`<rect x="130" y="176" width="39.5" height="12.5" rx="0" class="tb-f1"/>`)
  lines.push(`<text x="132" y="179.5" text-anchor="start" font-size="1.8" class="tb-flbl">DRG NO.</text>`)
  lines.push(`<text x="132" y="185" text-anchor="start" font-size="3.0" class="tb-fval">${drgNo}</text>`)

  lines.push(`<rect x="169.5" y="176" width="39.5" height="12.5" rx="0" class="tb-f2"/>`)
  lines.push(`<text x="171.5" y="179.5" text-anchor="start" font-size="1.8" class="tb-flbl">DATE</text>`)
  lines.push(`<text x="171.5" y="185" text-anchor="start" font-size="3.0" class="tb-fval">${formattedDate}</text>`)

  lines.push(`<rect x="209" y="176" width="39.5" height="12.5" rx="0" class="tb-f1"/>`)
  lines.push(`<text x="211" y="179.5" text-anchor="start" font-size="1.8" class="tb-flbl">SCALE</text>`)
  lines.push(`<text x="211" y="185" text-anchor="start" font-size="3.0" class="tb-fval">1:10 / 1:12</text>`)

  lines.push(`<rect x="248.5" y="176" width="39.5" height="12.5" rx="0" class="tb-f2"/>`)
  lines.push(`<text x="250.5" y="179.5" text-anchor="start" font-size="1.8" class="tb-flbl">SHEET</text>`)
  lines.push(`<text x="250.5" y="185" text-anchor="start" font-size="3.0" class="tb-fval">1 of 1</text>`)

  // Field row 2
  lines.push(`<rect x="130" y="188.5" width="39.5" height="12.5" rx="0" class="tb-f2"/>`)
  lines.push(`<text x="132" y="192" text-anchor="start" font-size="1.8" class="tb-flbl">DRAWN BY</text>`)
  lines.push(`<text x="132" y="197.5" text-anchor="start" font-size="3.0" class="tb-fval">SuDS Configurator v1</text>`)

  lines.push(`<rect x="169.5" y="188.5" width="39.5" height="12.5" rx="0" class="tb-f1"/>`)
  lines.push(`<text x="171.5" y="192" text-anchor="start" font-size="1.8" class="tb-flbl">CHECKED</text>`)
  lines.push(`<text x="171.5" y="197.5" text-anchor="start" font-size="3.0" class="tb-fval">Review Required</text>`)

  lines.push(`<rect x="209" y="188.5" width="39.5" height="12.5" rx="0" class="tb-f2"/>`)
  lines.push(`<text x="211" y="192" text-anchor="start" font-size="1.8" class="tb-flbl">APPROVED</text>`)
  lines.push(`<text x="211" y="197.5" text-anchor="start" font-size="3.0" class="tb-fval">Pending Sign-off</text>`)

  lines.push(`<rect x="248.5" y="188.5" width="39.5" height="12.5" rx="0" class="tb-f1"/>`)
  lines.push(`<text x="250.5" y="192" text-anchor="start" font-size="1.8" class="tb-flbl">REVISION</text>`)
  lines.push(`<text x="250.5" y="197.5" text-anchor="start" font-size="3.0" class="tb-fval">A</text>`)

  return lines.join('\n')
}

// ── Utility ─────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ── Main Export ─────────────────────────────────────────────

export function generateDrawingHTML(params: DrawingParams): string {
  const styles = getStyles()
  const planView = generatePlanView(params)
  const elevation = generateElevation(params)
  const bom = generateBOM(params)
  const notes = generateNotes(params)
  const titleBlock = generateTitleBlock(params)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SuDS Enviro - SE-DRG-${escapeXml(params.productCode)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>${styles}</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 297 210" width="297mm" height="210mm" style="display:block;">
<defs>
  <clipPath id="cp-plan">
    <rect x="9" y="16" width="141" height="132"/>
  </clipPath>
  <clipPath id="cp-elev">
    <rect x="150" y="16" width="138" height="132"/>
  </clipPath>
  <clipPath id="cp-bom">
    <rect x="9" y="148" width="141" height="29"/>
  </clipPath>
  <clipPath id="cp-notes">
    <rect x="150" y="148" width="138" height="29"/>
  </clipPath>
  <clipPath id="cp-tbtitle">
    <rect x="53" y="176" width="77" height="25"/>
  </clipPath>
</defs>
  <rect x="9" y="9" width="279" height="192" rx="0" class="bdr-out"/>
  <rect x="10.5" y="10.5" width="276" height="189" rx="0" class="bdr-in"/>
  <rect x="9" y="16" width="141" height="132" rx="0" class="zone-bg"/>
  <rect x="150" y="16" width="138" height="132" rx="0" class="zone-bg"/>
  <line x1="150" y1="9" x2="150" y2="176" class="zdiv"/>
  <line x1="9" y1="16" x2="288" y2="16" class="zdiv"/>
  <line x1="9" y1="148" x2="288" y2="148" class="zdiv"/>
  <line x1="9" y1="176" x2="288" y2="176" class="zdiv-h"/>
  <line x1="150" y1="148" x2="150" y2="176" class="zdiv"/>
${planView}
${elevation}
${bom}
${notes}
${titleBlock}
</svg>
</body>
</html>`
}
