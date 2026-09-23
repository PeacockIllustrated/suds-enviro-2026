/**
 * Small illustrations for the four water-management streams, drawn in the
 * site's toon style: flat fills from the palette with a heavy ink outline,
 * the same look as the 3D scenes. Decorative; the tab copy carries the
 * meaning.
 */

const INK = '#0e4f73'
const WATER = '#9ad9f6'
const WATER_DEEP = '#3d9fd6'
const BODY = '#e6f4fb'
const GREEN = '#54b54d'
const RED = '#c34c4a'
const SILT = '#d8c79d'
const SILT_DARK = '#b7a174'

const stroke = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

function Stormwater() {
  return (
    <>
      {/* cloud */}
      <path d="M44 64c-11 0-18-8-18-17s8-17 18-16c3-11 13-18 25-17 12 1 21 10 22 21 10 0 17 7 17 15s-7 14-16 14H44Z" fill="#fff" {...stroke} />
      {/* rain */}
      {[
        [48, 84],
        [70, 92],
        [92, 84],
        [59, 108],
        [81, 114],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y}c0-5 6-11 6-11s6 6 6 11a6 6 0 0 1-12 0Z`} fill={WATER} {...stroke} strokeWidth={3} />
      ))}
      {/* gully grate */}
      <rect x="30" y="132" width="100" height="14" rx="4" fill={BODY} {...stroke} />
      {[46, 62, 78, 94, 110].map((x) => (
        <line key={x} x1={x} y1="135" x2={x} y2="143" {...stroke} strokeWidth={3} />
      ))}
    </>
  )
}

function Silt() {
  return (
    <>
      {/* chamber */}
      <path d="M36 30h88v106a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V30Z" fill={BODY} {...stroke} />
      {/* water */}
      <path d="M38 62h84v48H38Z" fill={WATER} />
      <path d="M38 62c14 5 28-5 42 0s28 5 42 0" fill="none" stroke={WATER_DEEP} strokeWidth={3} strokeLinecap="round" />
      {/* silt layers */}
      <path d="M38 110c16-6 30 4 42-2s28-4 42 2v26a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6v-26Z" fill={SILT} />
      <path d="M38 124c14-4 28 3 42-1s28-3 42 1v12a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6v-12Z" fill={SILT_DARK} />
      {[
        [56, 96],
        [84, 88],
        [100, 100],
      ].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="4" fill={SILT_DARK} {...stroke} strokeWidth={2.5} />
      ))}
      <path d="M36 30h88v106a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V30Z" fill="none" {...stroke} />
      {/* inlet and outlet */}
      <rect x="14" y="48" width="24" height="16" rx="3" fill={GREEN} {...stroke} />
      <rect x="122" y="48" width="24" height="16" rx="3" fill={GREEN} {...stroke} />
    </>
  )
}

function Rainwater() {
  return (
    <>
      {/* roof and gutter */}
      <path d="M18 54 60 24l42 30" fill="none" {...stroke} />
      <path d="M96 58h28v10" fill="none" {...stroke} />
      <path d="M124 68v34" fill="none" stroke={WATER_DEEP} strokeWidth={5} strokeLinecap="round" />
      {/* tank */}
      <rect x="98" y="100" width="48" height="46" rx="8" fill={BODY} {...stroke} />
      <path d="M100 120c7-3 14 3 21 0s14-3 23 0v18a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6v-18Z" fill={WATER} />
      <rect x="98" y="100" width="48" height="46" rx="8" fill="none" {...stroke} />
      {/* house */}
      <path d="M26 54h68v90H26Z" fill="#fff" {...stroke} />
      <rect x="40" y="70" width="16" height="16" rx="2" fill={WATER} {...stroke} strokeWidth={3} />
      <rect x="64" y="70" width="16" height="16" rx="2" fill={WATER} {...stroke} strokeWidth={3} />
      <rect x="50" y="108" width="20" height="36" rx="2" fill={GREEN} {...stroke} strokeWidth={3} />
      {/* drop */}
      <path d="M122 76c0-6 8-14 8-14s8 8 8 14a8 8 0 0 1-16 0Z" fill={WATER} {...stroke} strokeWidth={3} />
    </>
  )
}

function Foul() {
  return (
    <>
      {/* pipe run */}
      <path d="M14 58h56a14 14 0 0 1 14 14v58" fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 58h56a14 14 0 0 1 14 14v58" fill="none" stroke={BODY} strokeWidth={19} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 58h52a14 14 0 0 1 14 14v54" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" strokeDasharray="10 9" />
      {/* inspection chamber */}
      <rect x="98" y="46" width="44" height="98" rx="8" fill={BODY} {...stroke} />
      <rect x="92" y="38" width="56" height="12" rx="4" fill={GREEN} {...stroke} />
      <path d="M100 116c8-3 14 3 21 0s12-3 19 0v20a6 6 0 0 1-6 6h-28a6 6 0 0 1-6-6v-20Z" fill={RED} opacity="0.35" />
      <path d="M84 122h14" {...stroke} />
      <circle cx="120" cy="80" r="9" fill="#fff" {...stroke} strokeWidth={3} />
    </>
  )
}

const DRAWINGS: Record<string, () => React.ReactElement> = {
  stormwater: Stormwater,
  silt: Silt,
  rainwater: Rainwater,
  foul: Foul,
}

export function WaterIllustration({ id, className }: { id: string; className?: string }) {
  const Drawing = DRAWINGS[id] ?? Stormwater
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden focusable="false">
      <Drawing />
    </svg>
  )
}
