import type { ProductId, ProductCategory } from '@/lib/types'

export interface BrochureLink {
  /** Display label, e.g. "SERSIC - Surface Water Inspection Chamber" */
  label: string
  /** Public URL of the HTML brochure (opens in a new tab; has Save-as-PDF) */
  href: string
}

export interface ProductCatalogEntry {
  id: ProductId
  slug: string
  name: string
  tagline: string
  description: string
  features: string[]
  specifications: { label: string; value: string }[]
  compliance: string[]
  applications: string[]
  /** Optional list of downloadable HTML brochures (each has Save-as-PDF) */
  brochures?: BrochureLink[]
  category: ProductCategory
  categoryLabel: string
}

export const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    id: 'chamber',
    slug: 'inspection-chamber',
    name: 'Inspection Chamber',
    tagline: 'RHINO SERSIC and SERFIC benched and channelled chambers',
    description:
      'One-piece HDPE benched and channelled inspection chambers for surface water (SERSIC) and foul (SERFIC) drainage systems. Six diameters from 450 to 1200 mm with configurable inlet positions and a fixed outlet at 12 o\u2019clock, suitable for adoptable and non-adoptable installations down to 6 metres.',
    features: [
      'One-piece HDPE construction with no joints or weak points',
      'Up to five inlets at the manufactured 3, 5, 6, 7 and 9 o\u2019clock positions',
      'Outlet fixed at 12 o\u2019clock (north) on every chamber',
      'Six diameters: 450, 600, 750, 900, 1050 and 1200 mm',
      'Depths from 1000 mm up to 3000 mm adoptable or 6000 mm non-adoptable',
      'Main channel and side connections from 110 to 300 mm (EN1401 / Twinwall)',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (extrusion and thermoformed)' },
      { label: 'Diameters', value: '450, 600, 750, 900, 1050, 1200 mm' },
      { label: 'Depth (adoptable)', value: 'Up to 3000 mm to pipe soffit (DCG / SfA7)' },
      { label: 'Depth (non-adoptable)', value: 'Up to 6000 mm' },
      { label: 'Sump', value: '350 mm integral' },
      { label: 'Pipe Sizes', value: '110 / 160 / 225 / 300 mm' },
      { label: 'Max Inlets', value: 'Up to 5 (3, 5, 6, 7, 9 o\u2019clock)' },
      { label: 'Outlet', value: 'Fixed at 12 o\u2019clock' },
    ],
    compliance: [
      'BS EN 13598-2 (2009)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'Building Regulations Part H1',
      'DCG Parts B and C (minimum 50 mm fall from side inlets)',
      'DCG Restricted Access (350 mm cover when depth > 1 m)',
    ],
    applications: [
      'Residential housing developments',
      'Commercial and industrial drainage',
      'Highway drainage systems',
      'S104 adoptable sewer networks',
      'Private drainage installations',
    ],
    brochures: [
      { label: 'RHINO SERSIC - Surface Water Inspection Chamber', href: '/brochures/rhino-sersic.html' },
      { label: 'RHINO SERFIC - Foul Water Inspection Chamber', href: '/brochures/rhino-serfic.html' },
    ],
    category: 'chambers',
    categoryLabel: 'Chambers',
  },
  {
    id: 'catchpit',
    slug: 'catchpit-silt-trap',
    name: 'Catchpit / Silt Trap',
    tagline: 'RHINO SERS (silt bucket) and SERDS Advanced Plus 600 Series catch-pits',
    description:
      'Two HDPE catch-pit ranges for silt and debris removal from paths, driveways, roofs, car parks, roads and highways. The RHINO SERS Series uses a removable silt bucket in 300, 450 and 600 mm chambers, lifted out and emptied from above ground. RHINO SERDS, the Advanced Plus 600 Series, uses 450 to 1200 mm chambers with primary and secondary filtration and a sump below the pipe inverts where solids settle out. Both suit light-duty to full-traffic loading.',
    features: [
      'Two ranges: SERS (300/450/600) with silt bucket, SERDS Advanced Plus 600 Series (450-1200) with settling sump',
      'Up to five inlets at the manufactured 3, 5, 6, 7 and 9 o\u2019clock positions',
      'Outlet fixed at 12 o\u2019clock (north)',
      'Primary and secondary filtration protects downstream drainage and attenuation',
      'Standard or bespoke sump depths to suit catchment and silt loading',
      'Compatible with EN1401 and Twinwall pipework',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (extrusion and thermoformed)' },
      { label: 'SERS diameters', value: '300, 450, 600 mm (with silt bucket)' },
      { label: 'SERDS diameters', value: '450, 600, 750, 900, 1050, 1200 mm (Advanced Plus 600 Series)' },
      { label: 'Depth (adoptable)', value: 'Up to 2000 mm to pipe soffit' },
      { label: 'Depth (non-adoptable)', value: 'Up to 3000 mm to pipe soffit' },
      { label: 'Pipe Sizes', value: '110 / 160 / 225 / 300 mm' },
      { label: 'Filtration', value: 'Primary and secondary; removable silt bucket (SERS) or settling sump (SERDS)' },
      { label: 'Loading', value: 'Light-duty to full-traffic' },
    ],
    compliance: [
      'BS EN 13598-2 (2009)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'Building Regulations Part H1',
      'DCG Restricted Access (350 mm cover when depth > 1 m)',
    ],
    applications: [
      'Highway and road drainage',
      'Car park surface water management',
      'Upstream of attenuation tanks',
      'Industrial yard drainage',
      'Paths, driveways, patios and roofs',
    ],
    brochures: [
      { label: 'RHINO SERS - Catch-pit with Silt Bucket (300/450/600)', href: '/brochures/rhino-sers.html' },
      { label: 'RHINO SERDS - Advanced Plus 600 Series Catch-pit (450-1200)', href: '/brochures/rhino-serds.html' },
    ],
    category: 'silt',
    categoryLabel: 'Silt Management',
  },
  {
    id: 'rhinoceptor',
    slug: 'rhinoceptor',
    name: 'SudSceptor Hydrodynamic Separator',
    tagline: 'SEHDS750 to SEHDS3000 hydrodynamic separators for SuDS treatment trains',
    description:
      'SudSceptor is a hydrodynamic separator of proven and tested performance, sold as SEHDS750 to SEHDS3000. It removes sediment-bound pollutants from surface water runoff: over 50% of fine suspended solids (0 to 200 microns) at design flows and up to 99% of coarse solids of 0.1 to 0.4 mm. Units are designed in accordance with the NJDEP protocol and the British Water Code of Practice, can be used on-line or off-line, and take an optional RhinoPod polishing filter for dissolved pollutants.',
    features: [
      'Single-piece unit that cannot air lock',
      'Inlet deflector plate promotes the cyclic separation process',
      'Floatable materials and liquids are retained; settled solids are prevented from remobilising',
      'Wide variety of connection options, up to \u00D81200 mm inlet and outlet',
      'Mitigation indices: TSS 0.5, metals 0.40, hydrocarbons 0.40',
      'Optional RhinoPod polishing filter for dissolved zinc, copper, phosphate and PAHs',
    ],
    specifications: [
      { label: 'Range', value: 'SEHDS750, 1200, 1800, 2500, 3000' },
      { label: 'Material', value: 'GRP from SEHDS1200; HDPE twinwall for SEHDS750' },
      { label: 'Treatment flow', value: '32 to 259 L/s, by model' },
      { label: 'Connections', value: 'Up to \u00D81200 mm inlet and outlet' },
      { label: 'Head loss', value: '500 to 515 mm maximum' },
      { label: 'Mitigation indices', value: 'TSS 0.5 / metals 0.40 / hydrocarbons 0.40' },
      { label: 'Filter', value: 'Optional RhinoPod polishing filter' },
      { label: 'Warranty', value: '10 years' },
    ],
    compliance: [
      'NJDEP protocol 2015 and 2020',
      'DIBt',
      'British Water Code of Practice',
      'CIRIA C753 Simple Index Approach',
      'GRP models to BS 4994:1987',
    ],
    applications: [
      'SuDS treatment trains upstream of attenuation or discharge',
      'Highway and road drainage',
      'Commercial and retail car parks',
      'Industrial yards and depots',
      'Surface water discharge to controlled waters',
    ],
    brochures: [
      { label: 'SudSceptor - Hydrodynamic Separator (SEHDS750 to SEHDS3000)', href: '/brochures/rhino-sehds.html' },
    ],
    category: 'stormwater',
    categoryLabel: 'Stormwater Treatment',
  },
  {
    id: 'flow-control',
    slug: 'flow-control',
    name: 'Flow Control',
    tagline: 'RhinoRoFlo orifice and RhinoRoTex vortex flow control chambers',
    description:
      'Two passive flow control ranges for stormwater attenuation. RhinoRoFlo (SERF300, SERF450, SERF600) uses a removable orifice plate cap sized to the site design head, with a ground-level drain-down. RhinoRoTex (ROTEX600 to ROTEX1200) uses a passive vortex regulator set to a pre-set discharge rate, supplied factory-fitted in an HDPE twinwall chamber or as a standalone unit for an existing concrete chamber.',
    features: [
      'Two ranges: RhinoRoFlo SERF (orifice, 300/450/600) and RhinoRoTex ROTEX (vortex, 600-1200)',
      'No moving parts and no power supply on either device',
      'SERF: discharge derived from design head and orifice size',
      'ROTEX: factory-set discharge rate at design head, sized to suit consent',
      'SERF: integral drain-down, operated from ground level',
      'HDPE chamber bodies; ROTEX also available as a standalone unit for concrete chambers',
    ],
    specifications: [
      { label: 'Control Types', value: 'RhinoRoFlo orifice / RhinoRoTex vortex' },
      { label: 'SERF diameters', value: '300, 450, 600 mm' },
      { label: 'ROTEX diameters', value: '600, 750, 900, 1050, 1200 mm' },
      { label: 'Depth (adoptable)', value: 'Up to 2000 mm' },
      { label: 'Depth (non-adoptable)', value: 'Up to 3000 mm' },
      { label: 'Material', value: 'HDPE twinwall chamber, extruded and thermoformed' },
      { label: 'Required design input', value: 'Design head (m); discharge rate (L/s) for ROTEX' },
    ],
    compliance: [
      'BS EN 13598-2 (2009)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG) Type D and E',
      'Building Regulations Part H1',
      'DCG restricted access (max 350 mm opening over 1 m depth)',
    ],
    applications: [
      'Attenuation tank discharge control',
      'Swale and detention basin outlets',
      'Pond and wetland outflow regulation',
      'S104 adoptable drainage systems',
    ],
    brochures: [
      { label: 'RhinoRoFlo - Orifice Flow Control (SERF300/450/600)', href: '/brochures/rhino-serf.html' },
      { label: 'RhinoRoTex - Vortex Flow Control (ROTEX600-1200)', href: '/brochures/rhino-rotex.html' },
    ],
    category: 'flow',
    categoryLabel: 'Flow Control',
  },
  {
    id: 'pump-station',
    slug: 'pump-station',
    name: 'RhinoLift Pumping Station',
    tagline: 'Packaged MDPE or GRP pumping stations - vortex or macerator',
    description:
      'RhinoLift packaged pumping stations move foul water, stormwater and grey water where gravity drainage is impractical. Each station is custom-built to the flow and storage the project needs, in an MDPE or GRP chamber from 600 to 1200 mm, with vortex (solids to 50 mm) or macerator pumps as a single pump or a duty-standby pair. Larger bespoke stations are built to order.',
    features: [
      'MDPE or GRP wet well construction',
      'Wet well diameters: 600, 750, 900, 1050 and 1200 mm',
      'Single pump or duty / standby twin-pump configuration',
      'Vortex pumps (50 mm solids) or macerator pumps for fine grind',
      'Optional high-level alarms, telemetry and Bluetooth monitoring',
      'Built to order for each site',
    ],
    specifications: [
      { label: 'Material', value: 'MDPE or GRP wet well' },
      { label: 'Chamber sizes', value: '600, 750, 900, 1050, 1200 mm' },
      { label: 'Pump Count', value: '1 or 2 (duty / standby)' },
      { label: 'Pump Type', value: 'Vortex (50 mm solids) or macerator' },
      { label: 'Controllers', value: 'Standard, alarm, telemetry, Bluetooth' },
      { label: 'Invert depth (adoptable)', value: 'Up to 2000 mm to pipe soffit' },
      { label: 'Invert depth (non-adoptable)', value: 'Up to 3000 mm; deeper stations designed to order' },
    ],
    compliance: [
      'BS EN 12050-1 (lifting plants for wastewater containing faecal matter)',
      'Building Regulations Part H',
      'Water Industry Act 1991',
      'Electrical Equipment (Safety) Regulations',
    ],
    applications: [
      'Basement drainage pumping',
      'Low-lying site foul water discharge',
      'Surface water pumping where gravity outfall is unavailable',
      'Adoptable pumping stations under S104',
      'Commercial and industrial waste pumping',
    ],
    brochures: [
      { label: 'RhinoLift - Packaged Pumping Stations', href: '/brochures/rhinolift.html' },
    ],
    category: 'pumps',
    categoryLabel: 'Pumping',
  },
  {
    id: 'grease-trap',
    slug: 'grease-trap',
    name: 'Grease Trap (RHINO GT)',
    tagline: 'Under-sink and floor-mounted grease management',
    description:
      'Compact HDPE grease traps in four models for commercial kitchens. The RHINO GT range covers kitchens from 150 to 600 covers per day, capturing fats, oils and grease (FOG) before discharge to the drain.',
    features: [
      'Four models: Micro (150), Mini (300), Midi (300), Jumbo (600 covers/day)',
      'One-piece HDPE construction for hygiene and durability',
      'Under-sink or floor-mounted installation options',
      'Round access cover for cleaning and FOG removal',
      'Integral internal baffle system',
      'Suitable for direct connection to kitchen waste pipes',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Models', value: 'Micro, Mini, Midi, Jumbo' },
      { label: 'Capacity Range', value: '150 - 600 covers per day' },
      { label: 'Access', value: 'Round access cover on raised collar' },
      { label: 'Connections', value: 'Inlet and outlet sizes confirmed at order' },
      { label: 'Installation', value: 'Under-sink or floor-mounted' },
    ],
    compliance: [
      'BS EN 1825-1:2004 and BS EN 1825-2:2002',
      'Building Regulations Part H1',
      'Water Industry Act 1991 (trade effluent consent)',
    ],
    applications: [
      'Restaurant and takeaway kitchens',
      'Hotel and hospitality catering',
      'School and hospital kitchens',
      'Food preparation areas',
      'Canteen and staff kitchen facilities',
    ],
    brochures: [
      { label: 'RHINO GT - Grease Trap', href: '/brochures/rhino-gt.html' },
    ],
    category: 'bespoke',
    categoryLabel: 'Grease Management',
  },
  {
    id: 'grease-separator',
    slug: 'grease-separator',
    name: 'Grease Separator',
    tagline: 'Large-scale FOG management for commercial operations',
    description:
      'Below-ground grease separators for larger-scale fats, oils and grease management. Designed for high-output commercial kitchens, food processing facilities and catering operations requiring compliant pre-treatment before sewer discharge.',
    features: [
      'Sized by peak covers per day and flow rate',
      'Below-ground installation for unobtrusive operation',
      'Multi-chamber design for enhanced FOG separation',
      'Large grease storage capacity reduces emptying frequency',
      'Compatible with grease management dosing systems',
      'Integral sample point for trade effluent monitoring',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Sizing', value: 'By peak covers/day and flow rate' },
      { label: 'Installation', value: 'Below ground' },
      { label: 'Applications', value: 'Restaurant, Hotel, Catering, Food Processing' },
      { label: 'Sample Point', value: 'Integral' },
    ],
    compliance: [
      'BS EN 1825-1:2004 and BS EN 1825-2:2002',
      'BS EN 12056-1',
      'Building Regulations Part H1',
      'Water Industry Act 1991',
    ],
    applications: [
      'Large restaurant and hotel complexes',
      'Food processing and manufacturing plants',
      'Hospital and institutional catering',
      'Event and festival catering operations',
    ],
    brochures: [
      { label: 'RHINO Grease Separator', href: '/brochures/rhino-grease-separator.html' },
    ],
    category: 'bespoke',
    categoryLabel: 'Grease Management',
  },
  {
    id: 'rhinopod',
    slug: 'rhinopod',
    name: 'RhinoPod',
    tagline: 'Floating cartridge filter for dissolved-phase pollutants',
    description:
      'RhinoPod is a floating cartridge filter that intercepts dissolved-phase pollutants in surface water runoff, including zinc, copper, phosphate and polycyclic aromatic hydrocarbons (PAHs). It needs no mounting: the pod is gravity-held in standing water and self-guided flow channels carry water through the cartridge. Paired with the SudSceptor hydrodynamic separator upstream, it forms a two-stage treatment train covering both gross and dissolved pollutants.',
    features: [
      'Targets dissolved zinc, copper, phosphate and PAHs',
      'No mounting, gravity-held in standing water',
      'Self-guided flow channels',
      'No electrical demand, low head loss',
      'Retrofit-ready, no disruption to surface finishes',
      'Surface or subsurface installation',
    ],
    specifications: [
      { label: 'Product', value: 'Floating cartridge filter' },
      { label: 'Size', value: '\u00D8325 mm, 579 mm high' },
      { label: 'Targets', value: 'Zinc, copper, phosphate, PAHs' },
      { label: 'Fixing', value: 'None, gravity-held in standing water' },
      { label: 'Power', value: 'None' },
      { label: 'Hosts', value: 'Road gullies, GRP or precast chambers, oil interceptors, SERPOD1850 filter tank' },
      { label: 'Install', value: 'New build or retrofit' },
    ],
    compliance: [
      'Tested against pollutants relevant to the EU Water Framework Directive (2000/60/EC)',
      'Supports Schedule 3 SuDS design guidance',
    ],
    applications: [
      'Petrol stations and forecourts',
      'Logistics yards and depots',
      'Commercial estates and car parks',
      'Retrofit to existing gullies, chambers and oil interceptors',
      'Second stage after a SudSceptor separator',
    ],
    brochures: [
      { label: 'RhinoPod - Floating Cartridge Filter', href: '/brochures/rhino-pod.html' },
    ],
    category: 'silt',
    categoryLabel: 'Pollution Control',
  },
  {
    id: 'rainwater',
    slug: 'rainwater-harvesting',
    name: 'Rainwater Harvesting',
    tagline: 'Collection and reuse systems for sustainable water management',
    description:
      'Complete rainwater harvesting systems for collecting, storing and reusing rainwater from roof areas. Available in capacities from 1000 to 3300 litres with direct, indirect and gravity-fed system configurations.',
    features: [
      'Capacities from 1000 to 3300 litres',
      'Three system types: Direct, Indirect, Gravity',
      'Below-ground HDPE storage tanks',
      'Integral first-flush diverter and filter',
      'Mains water backup for dry periods',
      'Reduces mains water consumption and drainage loading',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Capacities', value: '1000, 1400, 2200, 2400, 3300 litres' },
      { label: 'System Types', value: 'Direct, Indirect, Gravity' },
      { label: 'Installation', value: 'Below ground' },
      { label: 'Mains Backup', value: 'Integral mains water top-up' },
      { label: 'Filter', value: 'Pre-tank filter, first-flush diverter' },
    ],
    compliance: [
      'BS EN 16941-1:2018 (on-site non-potable water systems, rainwater)',
      'Water Supply (Water Fittings) Regulations 1999',
      'Building Regulations Part G and Part H',
      'WRAS approved components',
    ],
    applications: [
      'Toilet flushing and WC supply',
      'Garden and landscape irrigation',
      'Vehicle washing and washdown',
      'Laundry and non-potable domestic use',
      'Commercial building water reduction strategies',
    ],
    brochures: [
      { label: 'RHINO Rainwater Harvesting', href: '/brochures/rhino-rainwater.html' },
    ],
    category: 'stormwater',
    categoryLabel: 'Rainwater Harvesting',
  },
  {
    id: 'septic-tank',
    slug: 'septic-tank',
    name: 'Septic Tank',
    tagline: 'Underground wastewater treatment for off-mains sites',
    description:
      'Rotationally moulded HDPE septic tanks for primary and secondary wastewater treatment at properties without a mains sewer connection. Designed for domestic and small commercial applications, sized by population equivalent (PE), discharging to a soakaway, drainage field or, with secondary treatment, a watercourse.',
    features: [
      'One-piece HDPE construction eliminates leakage risk',
      'Primary and secondary treatment options',
      'Lightweight for installation without heavy plant',
      'Integral dip pipes and internal baffles',
      'Low maintenance with infrequent desludging',
      'Suitable for variable ground conditions',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Treatment', value: 'Primary, Secondary' },
      { label: 'Sizing', value: 'Population equivalent (PE) and daily flow' },
      { label: 'Discharge', value: 'Soakaway, drainage field, watercourse (secondary treatment)' },
      { label: 'Installation', value: 'Below ground' },
      { label: 'Desludging', value: 'Annual recommended' },
    ],
    compliance: [
      'BS EN 12566-1:2016 (prefabricated septic tanks)',
      'BS 6297:2007+A1:2008 (drainage fields)',
      'Environment Agency General Binding Rules',
      'Building Regulations Approved Document H2',
    ],
    applications: [
      'Rural domestic properties without mains sewer',
      'Farm buildings and agricultural dwellings',
      'Holiday homes and lodges',
      'Small commercial premises in rural areas',
    ],
    brochures: [
      { label: 'RHINO Septic Tank', href: '/brochures/rhino-septic.html' },
    ],
    category: 'bespoke',
    categoryLabel: 'Off-mains Wastewater',
  },
  {
    id: 'drawpit',
    slug: 'drawpit',
    name: 'RhinoDuct Drawpit',
    tagline: 'Modular rectangular drawpits built from interlocking 150 mm sections',
    description:
      'RhinoDuct is a range of rectangular drawpit chambers for ducted utility, telecoms and cable networks. Each chamber is built from interlocking 150 mm deep sections, stacked on site to reach the depth required, with footprints from 450 x 450 mm (Standard) to 1500 x 1500 mm (Plus and Plus + Reinforcing). The general arrangement drawings classify every range E600; any other load class is confirmed with SuDS Enviro at order.',
    features: [
      'Interlocking 150 mm sections, depth set on site without cutting',
      '19 footprints from 450 x 450 to 1500 x 1500 mm',
      'Standard (SERD), Plus (SERDP) and Plus + Reinforcing (SERDPR) ranges',
      'Classified E600 on the RhinoDuct drawings',
      'Manufactured from recycled polymer',
      'Lighter than concrete to handle and install',
    ],
    specifications: [
      { label: 'Type', value: 'Rectangular modular drawpit' },
      { label: 'Section', value: '150 mm deep, interlocking' },
      { label: 'Footprints', value: '450 x 450 to 1500 x 1500 mm' },
      { label: 'Depth', value: 'Stack sections to suit' },
      { label: 'Load class', value: 'E600 as drawn; other classes confirmed at order' },
      { label: 'Material', value: 'Recycled polymer' },
      { label: 'Covers', value: 'Solid or grated' },
    ],
    compliance: [
      'Tested in accordance with EN 124, classified E600',
      'NJUG Volume 4 guidelines',
      'Design Manual for Roads and Bridges (DMRB), National Highways',
    ],
    applications: [
      'Telecoms and fibre-optic ducting access',
      'Electrical and utility cable access',
      'Service chambers in footways and highways',
    ],
    brochures: [
      { label: 'RhinoDuct - Modular Drawpits (SERD, SERDP, SERDPR)', href: '/brochures/rhino-drawpit.html' },
    ],
    category: 'drawpits',
    categoryLabel: 'Drawpits',
  },
]

export function getProductBySlug(slug: string): ProductCatalogEntry | undefined {
  return PRODUCT_CATALOG.find((p) => p.slug === slug)
}

export function getProductById(id: ProductId): ProductCatalogEntry | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id)
}

export function getCatalogByCategory(category: ProductCategory): ProductCatalogEntry[] {
  return PRODUCT_CATALOG.filter((p) => p.category === category)
}

export function getAllCatalogCategories(): {
  category: ProductCategory
  label: string
  count: number
}[] {
  const categoryMap = new Map<ProductCategory, { label: string; count: number }>()

  for (const product of PRODUCT_CATALOG) {
    const existing = categoryMap.get(product.category)
    if (existing) {
      existing.count += 1
    } else {
      categoryMap.set(product.category, {
        label: product.categoryLabel,
        count: 1,
      })
    }
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    label: data.label,
    count: data.count,
  }))
}
