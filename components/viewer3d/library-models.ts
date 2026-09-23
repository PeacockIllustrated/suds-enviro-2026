import type { LibraryPartSpec } from './viewer-model'

/**
 * The 3D library files the configurator preview uses, with a name, a role
 * and a breakout offset for every part it draws.
 *
 * Files and part names come from public/models/library/v1/manifest.json
 * (all millimetres, Y up, base at y = 0). Breakout offsets are in each
 * file's own axes and were set from the part bounds listed there.
 */

const LIB = '/models/library/v1'

export interface LibraryEntry {
  url: string
  /** Name for the match banner, e.g. "SudSceptor SEHDS1800". */
  name: string
  parts: Record<string, LibraryPartSpec>
}

// SudSceptor SEHDS1800: 2105 x 4290 x 2155 mm. In breakout the shell lifts
// clear of the internals (top of the baffles is 3820 mm). The shell's axis is at
// x 146.9, z 172.5; the outlet stub is due -Z of it (north), the inlet stub
// on -X (bearing about 277 degrees).
export const SEHDS_AXIS = [146.9, 172.5] as const
export const SEHDS_INLET_BEARING = 277.2
export const SEHDS_DIAMETER = 1800

export const SEHDS1800: LibraryEntry = {
  url: `${LIB}/sudsceptor/sudsceptor-sehds1800.glb`,
  name: 'SudSceptor SEHDS1800',
  parts: {
    casing: { label: 'GRP separator shell', role: 'casing', explode: [0, 4450, 0] },
    stand: { label: 'Base stand', role: 'accent', explode: [0, 0, 0] },
    'bottom-bowl': { label: 'Bottom bowl', role: 'insides', explode: [0, 0, 0] },
    'water-track': { label: 'Water track', role: 'insides', explode: [0, 0, 0] },
    'center-pipe': { label: 'Centre pipe', role: 'insides', explode: [0, 380, 0] },
    'inner-curved-baffle': { label: 'Inner curved baffle', role: 'accent', explode: [600, 200, -100] },
    'outer-curved-baffle': { label: 'Outer curved baffle', role: 'accent', explode: [850, 360, -420] },
    // Radially out from the shell axis, in the unswung frame.
    inlet: { label: 'Inlet', role: 'inlet', explode: [-794, 0, -101], labelled: false },
    outlet: { label: 'Outlet', role: 'outlet', explode: [0, 0, -800], labelled: false },
  },
}

// RhinoPod (scale unverified in the library): 325 x 579 x 325 mm, a grid
// cage round three sections of filter media.
export const RHINOPOD: LibraryEntry = {
  url: `${LIB}/rhinopod/rhinopod-serpod1850.glb`,
  name: 'RhinoPod',
  parts: {
    casing: { label: 'Filter cage', role: 'casing', explode: [0, 520, 0] },
    top: { label: 'Upper filter media', role: 'insides', explode: [0, 260, 0] },
    mid: { label: 'Media divider', role: 'accent', explode: [0, 130, 0] },
    bottom: { label: 'Lower filter media', role: 'insides', explode: [0, 0, 0] },
  },
}

// RhinoRoFlo POC600 (SERF orifice chamber): 904 x 1495 x 708 mm. The
// orifice plate hangs on a pull string and lifts out for maintenance; in the
// breakout the plate, string, clips and latch move out together, clear of
// the riser.
export const POC600: LibraryEntry = {
  url: `${LIB}/rhinoroflo/rhinoroflo-poc600.glb`,
  name: 'RhinoRoFlo POC600',
  parts: {
    'poc-tube': { label: 'Chamber riser', role: 'casing', explode: [0, 900, 0] },
    'poc-base': { label: 'Chamber base and outlet', role: 'casing', explode: [0, 0, 0] },
    'poc-divider': { label: 'Divider wall', role: 'insides', explode: [0, 0, 0] },
    'poc-orifice': { label: 'Orifice plate', role: 'accent', explode: [-480, 260, 0] },
    'poc-orifice-latch': { label: 'Orifice latch', role: 'accent', explode: [-480, 260, 0] },
    'poc-string': { label: 'Pull string', role: 'insides', explode: [-480, 260, 0] },
    'poc-string-clips': { label: 'String clips', role: 'insides', explode: [-480, 260, 0], labelled: false },
  },
}
export const POC600_DIAMETER = 600

// RhinoRoTex vortex regulator (April 2025 parts): 415 x 1020 x 419 mm on a
// back plate. The outlet spigot points -Z, so the unit hangs on the north
// wall with +Z facing into the chamber.
export const ROTEX_UNIT: LibraryEntry = {
  url: `${LIB}/rhinorotex-2025/rhinorotex-2025-parts.glb`,
  name: 'RhinoRoTex vortex regulator',
  parts: {
    'back-case': { label: 'Back plate', role: 'body', explode: [0, 0, 0] },
    'snail-3-4': { label: 'Vortex chamber', role: 'accent', explode: [0, 0, 300] },
    bracket: { label: 'Bracket', role: 'body', explode: [0, 160, 140] },
    'bypass-arm': { label: 'Bypass arm', role: 'accent', explode: [0, 300, 200] },
    'bypass-cap': { label: 'Bypass cap', role: 'accent', explode: [0, 520, 200] },
    'siphon-pipe': { label: 'Siphon pipe', role: 'accent', explode: [0, 140, 420] },
    'outlet-pipe': { label: 'Outlet spigot', role: 'outlet', explode: [0, 0, 0] },
  },
}
/** Where the RoTex outlet spigot sits in the unit's own axes. */
export const ROTEX_SPIGOT = { centreY: 226.5, tipZ: -210, halfWidth: 208, backZ: -103 } as const

// RhinoLift wet wells. MINI 2000 D: 1000 mm across, 2000 mm deep.
// MAXI 1600 D: 1200 mm across, 1500 mm deep, two sets of pump pipework.
export const LIFT_MINI: LibraryEntry = {
  url: `${LIB}/rhinolift-mini/rhinolift-mini2000d.glb`,
  name: 'RhinoLift MINI 2000 D',
  parts: {
    casing: { label: 'Wet well', role: 'casing', explode: [0, 1400, 0] },
    insides: { label: 'Pump and discharge pipework', role: 'insides', explode: [0, 0, 0] },
    'insides-2': { label: 'Inlet and pipework', role: 'insides', explode: [0, 0, 380] },
    floats: { label: 'Float switches', role: 'accent', explode: [320, 0, 0] },
  },
}
export const LIFT_MAXI: LibraryEntry = {
  url: `${LIB}/rhinolift-maxi/rhinolift-maxi1600d.glb`,
  name: 'RhinoLift MAXI 1600 D',
  parts: {
    casing: { label: 'Wet well', role: 'casing', explode: [0, 1200, 0] },
    insides: { label: 'Inlet and pipework', role: 'insides', explode: [0, 0, 420] },
    'insides-1': { label: 'Pump pipework 1', role: 'insides', explode: [-260, 0, -260] },
    'insides-2': { label: 'Pump pipework 2', role: 'insides', explode: [260, 0, -260] },
    floats: { label: 'Float switches', role: 'accent', explode: [-360, 0, 0] },
  },
}
export const LIFT_SIZES = {
  mini: { diameter: 1000, depth: 2000 },
  maxi: { diameter: 1200, depth: 1500 },
} as const

// RhinoDuct (SERD) drawpit section: an open box 930 x 780 mm in plan, lying
// on its side in the file with its axis along Z. The box runs from z -191
// to 244 (435 mm, the stacking pitch) with a narrower spigot from -244 to
// -191 that nests in the section below. The cover file's grating is
// 908 x 758 mm, 63 mm deep, from y 570.6.
export const RHINODUCT = {
  url: `${LIB}/rhinoduct/parts/rhinoduct-serd--duct.glb`,
  part: 'duct',
  name: 'RhinoDuct',
  length: 930,
  width: 780,
  pitch: 435,
  spigot: 53,
  /** Native z of the box's lower end once stood up (the spigot's top). */
  boxFrom: -191,
  /** Native y of the plan centre. */
  centreY: 390,
} as const
export const RHINODUCT_COVER = {
  url: `${LIB}/rhinoduct-with-cover/parts/rhinoduct-serd-cover--cover.glb`,
  part: 'cover',
  length: 908,
  width: 758,
  underside: 570.6,
} as const

// Grease trap Jumbo Micro: 640 x 644 x 830 mm. The higher stub (+Z) is the
// inlet, the lower (-Z) the outlet. The "-xray" casing is a coincident copy
// of the casing and is left out so the reveal is not blocked.
export const JUMBO_MICRO: LibraryEntry = {
  url: `${LIB}/grease-trap-jumbo-micro/grease-trap-jumbo-micro.glb`,
  name: 'Grease trap Micro',
  parts: {
    'jumbo-micro-casing': { label: 'Trap body', role: 'casing', explode: [0, 0, 0] },
    'jumbo-micro-cover-housing': { label: 'Cover housing', role: 'body', explode: [0, 220, 0] },
    'jumbo-micro-cover': { label: 'Access cover', role: 'cover', explode: [0, 420, 0] },
    'jumbo-micro-inlet-1': { label: 'Inlet', role: 'inlet', explode: [0, 0, 260], labelled: false },
    'jumbo-micro-inlet-2': { label: 'Outlet', role: 'outlet', explode: [0, 0, -260], labelled: false },
  },
}
