import type * as THREE from 'three'
import { applyKitOps } from '@/components/viewer3d/kit-geometry'
import type { KitOp } from '@/components/viewer3d/viewer-model'
import { BASE5, BODY, CAP, SOCKETS, STUB } from '@/components/viewer3d/chamber-kit'

/**
 * Puts library parts where they sit on the real product.
 *
 * Several library files were built from part files that each kept their own
 * origin, so their parts arrive stacked round one point rather than
 * assembled: a cap half way down the shaft, a pipe stub inside the benching
 * rather than in its hole. This table moves each such part into place, in
 * the file's own millimetre frame (Y up, base at y = 0), and is applied once
 * when a file is loaded for the marketing site (useLibraryParts in toon.tsx),
 * so the product pages, the home page, the water journey and the site
 * explorer all draw the same assembly. The configurator reads the raw files
 * and places parts itself (chamber-kit.ts), so it is not affected.
 *
 * Positions were measured from the geometry: holes by casting rays out from
 * the shaft axis, sockets and seats from vertex rings. Files not listed here
 * were checked and are already assembled.
 */

const LIB = '/models/library/v1'

export interface PartFix {
  /** Applied in order to the part's geometry (see KitOp). */
  ops?: KitOp[]
  /** Leave the part out. */
  hide?: boolean
  /** Extra parts made from this one, e.g. a second pipe stub. */
  copies?: { name: string; ops: KitOp[] }[]
}

// ── Rhino inspection chamber SERSIC600 ──────────────────────────────
//
// Body: a 1950 mm ribbed shaft whose plain bottom section has two 280 mm
// pipe holes, centred 192.5 mm up, on the 12 and 6 o'clock line (-z and +z).
// Every other part was left on the body's origin, about 750 mm up, where the
// source also leaves a small origin marker in each part.

/** Centre height of the pipe holes in the SERSIC600 body. */
const SERSIC_HOLE_Y = 192.5
/** Bore of the SERSIC600 body; the stub's plain end finishes flush with it. */
const SERSIC_BORE = 300
/** Top of the SERSIC600 body. */
const SERSIC_TOP = 1950
/**
 * The SERSIC600 stub: 225 twinwall (265 mm across) on an axis at y 752.9
 * along z, the coupler end at z -176.7 and the plain twinwall end at 165.6.
 */
const SERSIC_STUB = { axisY: 752.9, couplerEnd: -176.7, plainEnd: 165.6 } as const

/** Drops the small origin marker the source leaves at (0, y, 0). */
const dropMarker = (y: number): KitOp => ({ op: 'dropBox', min: [-20, y - 25, -20], max: [20, y + 25, 20] })

const SERSIC600: Record<string, PartFix> = {
  body: { ops: [dropMarker(752)] },
  // The moulded benching: its underside to the bottom of the shaft, which
  // puts its main channel invert level with the bottom of the pipe holes.
  base: { ops: [dropMarker(755), { op: 'translate', v: [0, -669.8, 0] }] },
  // The cap (the file's "lid") seats on the top of the shaft.
  lid: { ops: [{ op: 'dropNear', radius: 40 }, { op: 'translate', v: [0, SERSIC_TOP - CAP.seat, 0] }] },
  // A plain 5 mm band with the same two holes as the body: wrapped round the
  // bottom section with its holes on the body's (centred 717.5 in the file),
  // and eased out 1% so it sits on the body skin rather than through it.
  'body-bottom': {
    ops: [
      { op: 'translate', v: [0, SERSIC_HOLE_Y - 717.5, 0] },
      { op: 'scale', v: [1.01, 1, 1.01] },
    ],
  },
  // The stub goes through the 6 o'clock hole (+z) with its coupler outside,
  // turned so the plain end points in and finishes flush with the bore. A
  // second stub fills the 12 o'clock outlet hole (-z) the same way.
  inlet: {
    ops: [
      dropMarker(SERSIC_STUB.axisY),
      { op: 'rotateY', angle: Math.PI },
      { op: 'translate', v: [0, SERSIC_HOLE_Y - SERSIC_STUB.axisY, SERSIC_BORE + SERSIC_STUB.plainEnd] },
    ],
    copies: [
      {
        name: 'outlet',
        ops: [
          dropMarker(SERSIC_STUB.axisY),
          { op: 'translate', v: [0, SERSIC_HOLE_Y - SERSIC_STUB.axisY, -SERSIC_BORE - SERSIC_STUB.plainEnd] },
        ],
      },
    ],
  },
}

// ── Rhino inspection chamber SERCIC600, 5-inlet base ───────────────
//
// The corrugated body stands from y 0. The moulded base sits inside its
// foot, turned half a turn so the outlet socket faces north (12 o'clock, -z)
// as in the configurator. The 225 twinwall stub is coaxial with the
// 3 o'clock socket, its coupler starting in the shaft wall as the
// configurator draws a pipe through the wall (the 6 o'clock socket is too
// low for a 276 mm coupler without the adapter the file does not include).
// The rim, one corrugation of the shaft profile, finishes the top.

const SIDE_SOCKET = SOCKETS[3]
const COUPLER_FROM = BODY.outer - 40
const stubBearing = (SIDE_SOCKET.bearing * Math.PI) / 180

/** The 5-inlet base, in the file's frame and in its own part file. */
const BASE5_OPS: KitOp[] = [
  { op: 'translate', v: [0, -BASE5.underside, 0] },
  { op: 'rotateY', angle: Math.PI },
]

const SERCIC600_5_INLET: Record<string, PartFix> = {
  base: { ops: BASE5_OPS },
  inlet: {
    ops: [
      { op: 'translate', v: [0, -STUB.axisY, 0] },
      // Native +z (coupler to twinwall) turns to point out along the bearing.
      { op: 'rotateY', angle: Math.PI - stubBearing },
      {
        op: 'translate',
        v: [
          Math.sin(stubBearing) * (COUPLER_FROM + STUB.coupler),
          SIDE_SOCKET.centre,
          -Math.cos(stubBearing) * (COUPLER_FROM + STUB.coupler),
        ],
      },
    ],
  },
  // The rim's bottom valley ring (y 322.7) meets the shaft's plain top end.
  rim: { ops: [{ op: 'translate', v: [0, BODY.headTo - 322.7, 0] }] },
}

// ── RhinoDuct with cover ────────────────────────────────────────────
//
// The duct part also carries a second copy of the cover (drawn over the
// separate cover part, so the two fight) and the cover frame, which floats
// 48 mm clear of the body. The copy is dropped and the frame lowered so its
// top is flush with the cover's (633.6 mm).

const FRAME_BOX = { min: [-470, 650, -400], max: [470, 710, 400] } as const
const COVER_COPY_BOX = { min: [-455, 569, -380], max: [455, 635, 380] } as const

const SERD_COVER: Record<string, PartFix> = {
  duct: {
    ops: [
      { op: 'dropBox', ...FRAME_BOX },
      { op: 'dropBox', ...COVER_COPY_BOX },
    ],
    copies: [
      {
        name: 'frame',
        ops: [
          { op: 'keepBox', ...FRAME_BOX },
          { op: 'translate', v: [0, 633.6 - 707.3, 0] },
        ],
      },
    ],
  },
}

// ── RhinoDuct ───────────────────────────────────────────────────────
//
// Converted without turning it upright: the cover faces -z and the open
// bottom +z. Stood up, it is 930 x 780 mm in plan like the covered duct and
// 488 mm deep.

const SERD: Record<string, PartFix> = {
  duct: {
    ops: [
      { op: 'rotateX', angle: Math.PI / 2 },
      { op: 'translate', v: [0, 244, -390] },
    ],
  },
}

/** Fixes by file URL, then part node name. */
export const MODEL_ASSEMBLY: Readonly<Record<string, Readonly<Record<string, PartFix>>>> = {
  [`${LIB}/rhino-inspection-chamber/rhino-inspection-chamber-sersic600.glb`]: SERSIC600,
  [`${LIB}/rhino-inspection-chamber-5-inlet/rhino-inspection-chamber-sercic600-5-inlet.glb`]: SERCIC600_5_INLET,
  // The home page draws the 5-inlet base from its own part file.
  [`${LIB}/rhino-inspection-chamber-5-inlet/parts/rhino-inspection-chamber-sercic600-5-inlet--base.glb`]: {
    'rhino-inspection-chamber-sercic600-5-inlet--base': { ops: BASE5_OPS },
    base: { ops: BASE5_OPS },
  },
  [`${LIB}/rhinoduct-with-cover/rhinoduct-serd-cover.glb`]: SERD_COVER,
  [`${LIB}/rhinoduct/rhinoduct-serd.glb`]: SERD,
}

/** How far the 5-inlet base part file drops once assembled, mm. */
export const BASE5_DROP = BASE5.underside

interface NamedGeometry {
  name: string
  geometry: THREE.BufferGeometry
}

/**
 * The parts of a library file in their assembled positions. Parts with no
 * fix are passed through untouched (the same geometry objects).
 */
export function assembleParts<T extends NamedGeometry>(url: string, parts: readonly T[], make: (name: string, geometry: THREE.BufferGeometry) => T): T[] {
  const fixes = MODEL_ASSEMBLY[url]
  if (!fixes) return [...parts]
  const out: T[] = []
  parts.forEach((part) => {
    const fix = fixes[part.name]
    if (!fix) {
      out.push(part)
      return
    }
    if (!fix.hide) out.push(fix.ops?.length ? make(part.name, applyKitOps(part.geometry, fix.ops)) : part)
    fix.copies?.forEach((copy) => out.push(make(copy.name, applyKitOps(part.geometry, copy.ops))))
  })
  return out
}
