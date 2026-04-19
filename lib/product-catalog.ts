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
      'Compatible with 110, 160, 225, 300 and 450 mm EN1401 / Twinwall pipework',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Diameters', value: '450, 600, 750, 900, 1050, 1200 mm' },
      { label: 'Depth (adoptable)', value: 'Up to 3000 mm (DCG / SfA7)' },
      { label: 'Depth (non-adoptable)', value: 'Up to 6000 mm' },
      { label: 'Sump', value: '350 mm integral' },
      { label: 'Pipe Sizes', value: '110 / 160 / 225 / 300 / 450 mm' },
      { label: 'Max Inlets', value: 'Up to 5 (3, 5, 6, 7, 9 o\u2019clock)' },
      { label: 'Outlet', value: 'Fixed at 12 o\u2019clock' },
    ],
    compliance: [
      'BS EN 13598-2 (2009)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'Building Regulations Part H1',
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
    tagline: 'SERS (with bucket) and SERDS (built-in settling) catchpits',
    description:
      'Two HDPE catchpit ranges. SERS uses a removable silt bucket in 300, 450 and 600 mm chambers - quick to clean, ideal for driveways and light-traffic areas. SERDS uses larger 450 to 1200 mm chambers with built-in primary and secondary settling, suited to highway, commercial and industrial drainage.',
    features: [
      'Two ranges: SERS (300/450/600) with silt bucket, SERDS (450-1200) with built-in settling',
      'Up to five inlets at the manufactured 3, 5, 6, 7 and 9 o\u2019clock positions',
      'Outlet fixed at 12 o\u2019clock (north)',
      'Reduces maintenance costs on downstream drainage and attenuation',
      'Customisable sump depths to suit catchment and silt loading',
      'Compatible with EN1401 and Twinwall pipework',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'SERS diameters', value: '300, 450, 600 mm (with silt bucket)' },
      { label: 'SERDS diameters', value: '450, 600, 750, 900, 1050, 1200 mm (settling)' },
      { label: 'Depth (adoptable)', value: 'Up to 2000 mm' },
      { label: 'Depth (non-adoptable)', value: 'Up to 3000 mm' },
      { label: 'Pipe Sizes', value: '110 / 160 / 225 / 300 / 450 mm' },
      { label: 'Filtration', value: 'Removable bucket (SERS) or settling chambers (SERDS)' },
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
      'Construction site temporary drainage',
    ],
    brochures: [
      { label: 'SERS - Catchpit with Silt Bucket (300/450/600)', href: '/brochures/rhino-sers.html' },
      { label: 'SERDS - Catchpit with Built-in Settling (450-1200)', href: '/brochures/rhino-serds.html' },
    ],
    category: 'silt',
    categoryLabel: 'Silt Management',
  },
  {
    id: 'rhinoceptor',
    slug: 'rhinoceptor',
    name: 'RHINO SEHDS Hydrodynamic Separator',
    tagline: 'GRP one-piece hydrodynamic separator (5-4-5 mitigation indices)',
    description:
      'A one-piece GRP hydrodynamic separator for stormwater pollutant removal. Removes suspended solids, hydrocarbons and debris from surface water runoff using a passive vortex chamber - no moving parts. 360-degree inlet positioning, four diameters from 750 to 2500 mm, and an optional RHINO POD polishing filter for full WFD compliance.',
    features: [
      'One-piece GRP construction per BS EN 13121',
      'Four diameters: 750, 1200, 1800 and 2500 mm',
      '360-degree inlet positioning - any angle, fitted to suit the site',
      'Passive vortex separation, no moving parts to maintain',
      'CIRIA C753 mitigation indices: 5 / 4 / 5 (suspended solids / hydrocarbons / debris)',
      'Optional RHINO POD polishing filter for 33 WFD priority substances',
    ],
    specifications: [
      { label: 'Material', value: 'GRP (one-piece, BS EN 13121)' },
      { label: 'Diameters', value: '750, 1200, 1800, 2500 mm' },
      { label: 'Inlet positioning', value: '360-degree (free angle 0-359\u00B0)' },
      { label: 'Mitigation indices', value: '5 / 4 / 5 (SS / HC / Debris)' },
      { label: 'POD add-on', value: 'Optional RHINO POD polishing filter' },
      { label: 'Standards', value: 'EN 858-1, BS EN 13121, SfA7, DCG' },
    ],
    compliance: [
      'BS EN 858-1',
      'BS EN 13121 (GRP tanks and vessels)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'CIRIA C753 SuDS Manual',
      'WFD priority substances (with optional RHINO POD)',
    ],
    applications: [
      'Highway and trunk-road drainage',
      'Commercial / retail car parks and forecourts',
      'Industrial yards and depots',
      'Petrol station and forecourt runoff',
      'Surface water discharge to sensitive receiving waters',
    ],
    brochures: [
      { label: 'RHINO SEHDS - Hydrodynamic Separator', href: '/brochures/rhino-sehds.html' },
    ],
    category: 'stormwater',
    categoryLabel: 'Stormwater Treatment',
  },
  {
    id: 'flow-control',
    slug: 'flow-control',
    name: 'Flow Control',
    tagline: 'SERF orifice plates and ROTEX vortex regulators',
    description:
      'Two passive flow-control ranges for stormwater attenuation. SERF uses a pre-set orifice plate inside a 300, 450 or 600 mm HDPE chamber - simple flow restriction sized to a design head. ROTEX uses a vortex regulator inside a 600 to 1200 mm chamber - higher discharge for the same head, ideal for adoptable highway drainage.',
    features: [
      'Two ranges: SERF (orifice, 300/450/600) and ROTEX (vortex, 600-1200)',
      'No moving parts and no power supply on either device',
      'SERF: discharge derived from design head and orifice size',
      'ROTEX: factory-set discharge rate at design head, sized to suit consent',
      'Drains down from ground level for easy inspection and maintenance',
      'HDPE chamber bodies; ROTEX also available as a standalone unit for concrete chambers',
    ],
    specifications: [
      { label: 'Control Types', value: 'SERF orifice / ROTEX vortex' },
      { label: 'SERF diameters', value: '300, 450, 600 mm' },
      { label: 'ROTEX diameters', value: '600, 750, 900, 1050, 1200 mm' },
      { label: 'Depth (adoptable)', value: 'Up to 2000 mm' },
      { label: 'Depth (non-adoptable)', value: 'Up to 3000 mm' },
      { label: 'Material', value: 'HDPE chamber with stainless steel internals' },
      { label: 'Required design input', value: 'Design head (m); discharge rate (L/s) for ROTEX' },
    ],
    compliance: [
      'BS EN 13598-2 (2009)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG) Type D and E',
      'Building Regulations Part H1',
      'CIRIA C753 SuDS Manual',
    ],
    applications: [
      'Attenuation tank discharge control',
      'Swale and detention basin outlets',
      'Pond and wetland outflow regulation',
      'S104 adoptable drainage systems',
    ],
    brochures: [
      { label: 'SERF - Orifice Flow Control (300/450/600)', href: '/brochures/rhino-serf.html' },
      { label: 'ROTEX - Vortex Flow Control (600-1200)', href: '/brochures/rhino-rotex.html' },
    ],
    category: 'flow',
    categoryLabel: 'Flow Control',
  },
  {
    id: 'pump-station',
    slug: 'pump-station',
    name: 'RHINOLIFT Pumping Station',
    tagline: 'Packaged MDPE / GRP pump station - vortex or macerator',
    description:
      'Custom-built packaged pumping stations in MDPE or GRP. Wet wells from 600 to 1200 mm with single or duty/standby pumps, vortex (50 mm solids) or macerator. Pre-assembled, pre-wired and lifecycle-tested in the factory; typical lead time 24-48 hours.',
    features: [
      'MDPE or GRP wet well construction',
      'Wet well diameters: 600, 750, 900, 1050 and 1200 mm',
      'Single pump or duty / standby twin-pump configuration',
      'Vortex pumps (50 mm solids) or macerator pumps for fine grind',
      'Optional high-level alarms, telemetry and Bluetooth controllers',
      '24-48 hour lead time on standard configurations',
    ],
    specifications: [
      { label: 'Material', value: 'MDPE or GRP wet well' },
      { label: 'Wet Well Diameters', value: '600, 750, 900, 1050, 1200 mm' },
      { label: 'Pump Count', value: '1 or 2 (duty / standby)' },
      { label: 'Pump Type', value: 'Vortex (50 mm solids) or macerator' },
      { label: 'Controllers', value: 'Standard, alarm, telemetry, Bluetooth' },
      { label: 'Depth (adoptable)', value: 'Up to 2000 mm' },
      { label: 'Depth (non-adoptable)', value: 'Up to 3000 mm' },
    ],
    compliance: [
      'BS EN 12050-1 (lifting plants for wastewater containing faecal matter)',
      'Building Regulations Part H',
      'Water Industry Act 1991',
      'Electrical Equipment (Safety) Regulations',
      'DCG Restricted Access (350 mm cover when depth > 1 m)',
    ],
    applications: [
      'Basement drainage pumping',
      'Low-lying site foul water discharge',
      'Surface water pumping where gravity outfall is unavailable',
      'Adoptable pumping stations under S104',
      'Commercial and industrial waste pumping',
    ],
    brochures: [
      { label: 'RHINOLIFT - Packaged Pumping Station', href: '/brochures/rhinolift.html' },
    ],
    category: 'pumps',
    categoryLabel: 'Pumping',
  },
  {
    id: 'grease-trap',
    slug: 'grease-trap',
    name: 'Grease Trap (Rhino GT)',
    tagline: 'Under-sink and floor-mounted grease management',
    description:
      'Compact HDPE grease traps in four sizes designed for commercial kitchens. The Rhino GT range handles between 150 and 600 covers per day, providing effective fats, oils and grease (FOG) separation before discharge to sewer.',
    features: [
      'Four models: Micro (150), Mini (300), Midi (300), Jumbo (600 covers/day)',
      'One-piece HDPE construction for hygiene and durability',
      'Under-sink or floor-mounted installation options',
      'Easy access for cleaning and FOG removal',
      'Integral internal baffle system',
      'Suitable for direct connection to kitchen waste pipes',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Models', value: 'Micro, Mini, Midi, Jumbo' },
      { label: 'Capacity Range', value: '150 - 600 covers per day' },
      { label: 'Inlet Connection', value: '60mm or 100mm' },
      { label: 'Outlet Connection', value: '60mm or 100mm' },
      { label: 'Installation', value: 'Under-sink or floor-mounted' },
    ],
    compliance: [
      'BS EN 1825-1 and BS EN 1825-2',
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
    category: 'silt',
    categoryLabel: 'Silt Management',
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
      'BS EN 1825-1 and BS EN 1825-2',
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
    category: 'silt',
    categoryLabel: 'Silt Management',
  },
  {
    id: 'rhinopod',
    slug: 'rhinopod',
    name: 'RhinoPod',
    tagline: 'Patented floating stormwater filter',
    description:
      'Patented floating filter technology for stormwater treatment. Deploys in under 5 minutes with no tools required. Absorbs hydrocarbons, heavy metals and organic pollutants from surface water runoff in chambers, manholes and catch basins.',
    features: [
      'Patented floating filter technology',
      'Deploys in under 5 minutes with no tools',
      'Standalone or Plus (factory-fitted to chamber) options',
      'Absorbs oil, hydrocarbons, heavy metals and organics',
      'Can be retrofitted to existing chambers and manholes',
      'Visible saturation indicator for replacement timing',
    ],
    specifications: [
      { label: 'Variants', value: 'Standalone, or factory-fitted to RHINO SEHDS' },
      { label: 'Compatible chambers', value: 'SEHDS 750-2500 mm and standard 450-1200 mm chambers' },
      { label: 'Deployment Time', value: 'Under 5 minutes' },
      { label: 'Filter Media', value: 'Polishing media targeting 33 WFD priority substances' },
      { label: 'Retrofit', value: 'Yes - drops into existing chambers and manholes' },
    ],
    compliance: [
      'EA PPG3 Pollution Prevention Guidelines',
      'CIRIA C753 SuDS Manual',
      'The Water Environment (Controlled Activities) Regulations',
    ],
    applications: [
      'Car park drainage pre-treatment',
      'Road and highway runoff filtration',
      'Construction site temporary treatment',
      'Retrofit pollution control for existing systems',
      'Industrial yard surface water management',
    ],
    category: 'stormwater',
    categoryLabel: 'Stormwater Treatment',
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
      { label: 'Filter', value: 'Pre-tank filtration included' },
    ],
    compliance: [
      'BS 8515:2009 (Rainwater harvesting)',
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
    category: 'stormwater',
    categoryLabel: 'Stormwater Treatment',
  },
  {
    id: 'septic-tank',
    slug: 'septic-tank',
    name: 'Septic Tank',
    tagline: 'Underground wastewater treatment for off-mains sites',
    description:
      'HDPE rotomoulded septic tanks for primary and secondary wastewater treatment at properties without mains sewer connection. Designed for domestic and small commercial applications with discharge to soakaway, drainfield or watercourse.',
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
      { label: 'Sizing', value: 'By population equivalent and daily flow' },
      { label: 'Discharge', value: 'Watercourse, Soakaway, Drainfield' },
      { label: 'Installation', value: 'Below ground' },
      { label: 'Desludging', value: 'Annual recommended' },
    ],
    compliance: [
      'BS EN 12566-1 (small wastewater treatment systems)',
      'BS 6297 (design and installation of drainage fields)',
      'General Binding Rules / Environmental Permitting',
      'Building Regulations Part H2',
    ],
    applications: [
      'Rural domestic properties without mains sewer',
      'Farm buildings and agricultural dwellings',
      'Holiday homes and lodges',
      'Small commercial premises in rural areas',
    ],
    category: 'bespoke',
    categoryLabel: 'Bespoke Solutions',
  },
  {
    id: 'drawpit',
    slug: 'drawpit',
    name: 'Drawpit',
    tagline: 'Interlocking rectangular access chambers from recycled polymers',
    description:
      'Interlocking rectangular access chambers manufactured from recycled polymers. Available with load ratings from A15 to F900 for utility, telecoms and ducted network applications. Modular ring system allows depth adjustment on site.',
    features: [
      'Manufactured from recycled polymers',
      'Interlocking modular ring system for variable depths',
      'Load ratings from A15 (pedestrian) to F900 (airport)',
      'Solid or grated cover options',
      'Lightweight compared to concrete equivalents',
      'Chemical resistant and corrosion proof',
    ],
    specifications: [
      { label: 'Material', value: 'Recycled polymer' },
      { label: 'Load Ratings', value: 'A15, B125, C250, D400, E600, F900' },
      { label: 'Cover Types', value: 'Solid, Grated' },
      { label: 'Construction', value: 'Interlocking ring system' },
      { label: 'Dimensions', value: 'Custom length, width and depth' },
    ],
    compliance: [
      'BS EN 124-1 (gully tops and manhole covers)',
      'NJUG Guidelines Vol 4',
      'Highways Agency DMRB',
    ],
    applications: [
      'Telecoms and fibre-optic ducting access',
      'Electrical and utility cable access',
      'Highway and pavement service chambers',
      'Airport and airfield infrastructure',
      'Railway and tramway utility access',
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
