/**
 * Writes the spec sheet HTML (technical specification + engineering
 * drawing) for a set of sample configurations, without Supabase. Uses
 * the same builder as /api/pdf/[configId].
 *
 *   npx tsx scripts/spec-sheet-samples.ts <out-dir>
 *   node scripts/render-spec-sheets.mjs <out-dir>     # HTML -> PDF + checks
 */

import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { buildSpecSheetData } from '@/lib/pdf/spec-sheet-data'
import { generateSpecSheetHTML } from '@/lib/pdf/spec-sheet'
import type { CatchpitData, ChamberData, ProductData } from '@/lib/types'

const noFlow = { flowControl: false, flowType: null, flowRate: '' } as const

function chamber(d: Omit<ChamberData, 'flowControl' | 'flowType' | 'flowRate'> & Partial<ChamberData>): ProductData {
  return { kind: 'chamber', data: { ...noFlow, ...d } }
}

function catchpit(d: Omit<CatchpitData, 'flowControl' | 'flowType' | 'flowRate'>): ProductData {
  return { kind: 'catchpit', data: { ...noFlow, ...d } }
}

const SAMPLES: { name: string; pd: ProductData }[] = [
  {
    name: 'SERSIC1050-3000-S104-5-inlets',
    pd: chamber({
      systemType: 'surface',
      diameter: 1050,
      inletCount: 5,
      positions: ['3', '5', '6', '7', '9'],
      pipeSizes: {
        inlet1: '225mm Twinwall',
        inlet2: '160mm EN1401',
        inlet3: '160mm EN1401',
        inlet4: '110mm EN1401',
        inlet5: '160mm EN1401',
      },
      outletLocked: '225mm Twinwall',
      depth: 3000,
      adoptable: true,
    }),
  },
  {
    name: 'SERSIC450-1500-S104-1-inlet',
    pd: chamber({
      systemType: 'surface',
      diameter: 450,
      inletCount: 1,
      positions: ['6'],
      pipeSizes: { inlet1: '160mm EN1401' },
      outletLocked: null,
      depth: 1500,
      adoptable: true,
    }),
  },
  {
    // R2 does not lock a 750 with 3 inlets, so the 225 outlet is chosen.
    name: 'SERFIC750-2500-PRIV-3-inlets-225-outlet',
    pd: chamber({
      systemType: 'foul',
      diameter: 750,
      inletCount: 3,
      positions: ['3', '6', '9'],
      pipeSizes: { inlet1: '160mm EN1401', inlet2: '225mm Twinwall', inlet3: '160mm EN1401', outlet: '225mm Twinwall' },
      outletLocked: null,
      depth: 2500,
      adoptable: false,
    }),
  },
  {
    // 3 inlets in a 600 chamber: R2 locks the outlet at 225 twinwall.
    name: 'SERFIC600-2500-PRIV-3-inlets-R2-locked',
    pd: chamber({
      systemType: 'foul',
      diameter: 600,
      inletCount: 3,
      positions: ['5', '6', '7'],
      pipeSizes: { inlet1: '160mm EN1401', inlet2: '160mm EN1401', inlet3: '110mm EN1401' },
      outletLocked: '225mm Twinwall',
      depth: 2500,
      adoptable: false,
    }),
  },
  {
    name: 'SERSIC1200-6000-PRIV-5-inlets-vortex',
    pd: chamber({
      systemType: 'surface',
      diameter: 1200,
      inletCount: 5,
      positions: ['3', '5', '6', '7', '9'],
      pipeSizes: {
        inlet1: '300mm Twinwall',
        inlet2: '225mm Twinwall',
        inlet3: '300mm Twinwall',
        inlet4: '160mm EN1401',
        inlet5: '225mm Twinwall',
        outlet: '300mm Twinwall',
      },
      outletLocked: '225mm Twinwall',
      depth: 6000,
      adoptable: false,
      flowControl: true,
      flowType: 'Vortex',
      flowRate: '12',
    }),
  },
  {
    name: 'SERSIC600-1000-S104-2-inlets-orifice',
    pd: chamber({
      systemType: 'surface',
      diameter: 600,
      inletCount: 2,
      positions: ['3', '9'],
      pipeSizes: { inlet1: '160mm EN1401', inlet2: '110mm EN1401' },
      outletLocked: null,
      depth: 1000,
      adoptable: true,
      flowControl: true,
      flowType: 'Orifice plate',
      flowRate: '3.5',
    }),
  },
  {
    name: 'SERFIC900-4000-PRIV-4-inlets',
    pd: chamber({
      systemType: 'foul',
      diameter: 900,
      inletCount: 4,
      positions: ['3', '5', '7', '9'],
      pipeSizes: { inlet1: '160mm EN1401', inlet2: '225mm Twinwall', inlet3: '225mm Twinwall', inlet4: '160mm EN1401' },
      outletLocked: '225mm Twinwall',
      depth: 4000,
      adoptable: false,
    }),
  },
  {
    name: 'SERS450-1000-PRIV-catchpit',
    pd: catchpit({
      variant: 'SERS',
      baffleType: 'internal',
      grateType: 'hinged',
      systemType: 'surface',
      diameter: 450,
      inletCount: 1,
      positions: ['6'],
      pipeSizes: { inlet1: '110mm EN1401' },
      outletLocked: null,
      depth: 1000,
      adoptable: false,
    }),
  },
  {
    name: 'SERDS1200-2000-S104-catchpit',
    pd: catchpit({
      variant: 'SERDS',
      baffleType: 'external',
      grateType: 'sealed',
      systemType: 'surface',
      diameter: 1200,
      inletCount: 2,
      positions: ['3', '9'],
      pipeSizes: { inlet1: '160mm EN1401', inlet2: '225mm Twinwall' },
      outletLocked: null,
      depth: 2000,
      adoptable: true,
    }),
  },
]

const outDir = process.argv[2]
if (!outDir) {
  console.error('Usage: npx tsx scripts/spec-sheet-samples.ts <out-dir>')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

for (const s of SAMPLES) {
  const sheet = buildSpecSheetData(s.pd, {
    configId: '3f9c2a71-0000-4000-8000-000000000000',
    quoteRef: null,
    productCode: null,
    date: '2026-09-23T12:00:00Z',
  })
  if (!sheet) throw new Error(`No drawing for ${s.name}`)
  writeFileSync(join(outDir, `${s.name}.html`), generateSpecSheetHTML(sheet))
  console.log(`${s.name}: ${sheet.productCode}${sheet.valid ? '' : `  (config issues: ${sheet.errors.join('; ')})`}`)
}
