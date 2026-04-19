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
    tagline: 'HDPE rotationally moulded drainage chamber',
    description:
      'One-piece rotationally moulded HDPE inspection chambers for surface water and foul drainage systems. Available in four diameters with configurable inlet and outlet connections, designed for adoptable and non-adoptable installations.',
    features: [
      'One-piece HDPE construction with no joints or weak points',
      'Configurable inlet positions using clock-face notation',
      'Available in 450, 600, 750 and 1050mm diameters',
      'Depths from 1000mm to 3000mm with 350mm integral sump',
      'Lightweight for manual handling without lifting equipment',
      'Compatible with EN1401 and Twinwall pipe systems',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Diameters', value: '450, 600, 750, 1050mm' },
      { label: 'Depths', value: '1000 - 3000mm' },
      { label: 'Sump', value: '350mm integral' },
      { label: 'Pipe Sizes', value: '110mm to 450mm' },
      { label: 'Max Inlets', value: 'Up to 6 (diameter dependent)' },
    ],
    compliance: [
      'BS EN 13598-1 and BS EN 13598-2',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'Building Regulations Part H1',
      'BBA certified',
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
    tagline: 'Silt management chamber for drainage protection',
    description:
      'Purpose-built silt management chambers that prevent debris, sediment and particulate matter from entering downstream drainage infrastructure. Features configurable baffle and grate options for effective sediment capture.',
    features: [
      'Integrated silt collection zone with easy cleanout access',
      'Optional internal or external baffle configurations',
      'Hinged or sealed grate options for surface access',
      'Same diameter range as inspection chambers for system compatibility',
      'Reduces maintenance costs on downstream drainage',
      'Prevents blockages in pipe networks and attenuation systems',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Diameters', value: '450, 600, 750, 1050mm' },
      { label: 'Depths', value: '1000 - 3000mm' },
      { label: 'Baffle Types', value: 'Internal, External, None' },
      { label: 'Grate Types', value: 'Hinged, Sealed' },
      { label: 'Silt Volume', value: 'Dependent on diameter and depth' },
    ],
    compliance: [
      'BS EN 13598-1 and BS EN 13598-2',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'CIRIA C753 SuDS Manual',
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
    name: 'RhinoCeptor',
    tagline: 'Full retention oil and water separator',
    description:
      'High-performance oil/water separator available in Forecourt, Full Retention and Bypass configurations. Designed for the removal of light liquids from surface water runoff before discharge to watercourse or sewer.',
    features: [
      'Three configurations: Forecourt, Full Retention, Bypass',
      'No moving parts for minimal maintenance',
      'Integrated coalescing media for enhanced separation',
      'Automatic shut-off to prevent oil discharge',
      'Flow rates suitable for sites up to 500+ L/s',
      'One-piece HDPE construction for leak-free installation',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE (rotationally moulded)' },
      { label: 'Variants', value: 'Forecourt, Full Retention, Bypass' },
      { label: 'Classes', value: 'Class 1 (<5mg/l), Class 2 (<100mg/l)' },
      { label: 'Flow Rates', value: 'Up to 500+ L/s' },
      { label: 'Oil Storage', value: 'Model dependent' },
      { label: 'Installation', value: 'Below ground, no lifting equipment required' },
    ],
    compliance: [
      'BS EN 858-1 and BS EN 858-2',
      'EA PPG3 Pollution Prevention Guidelines',
      'The Water Environment (Controlled Activities) Regulations',
      'Building Regulations Part H3',
      'CIRIA C753 SuDS Manual',
    ],
    applications: [
      'Petrol station forecourts',
      'Car parks and loading bays',
      'Industrial and commercial yards',
      'Vehicle wash facilities',
      'Workshop and depot drainage',
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
    tagline: 'Vortex valve chambers for stormwater attenuation',
    description:
      'Vortex valve and orifice plate flow control chambers that limit stormwater discharge rates to greenfield runoff levels. No moving parts, no power supply required, with predictable hydraulic performance across varying head conditions.',
    features: [
      'No moving parts for maintenance-free operation',
      'Vortex and orifice plate configurations available',
      'Predictable flow regulation across varying head depths',
      'No external power supply required',
      'Sized to match specific site discharge consents',
      'Compatible with all SuDS Enviro chamber diameters',
    ],
    specifications: [
      { label: 'Control Types', value: 'Vortex valve, Orifice plate' },
      { label: 'Chamber Diameters', value: '450, 600, 750, 1050mm' },
      { label: 'Flow Range', value: 'Site specific (L/s)' },
      { label: 'Head Depth', value: 'Site specific (mm)' },
      { label: 'Material', value: 'HDPE chamber with stainless steel internals' },
    ],
    compliance: [
      'Sewers for Adoption 7th Edition (SfA7)',
      'Design and Construction Guidance (DCG)',
      'CIRIA C753 SuDS Manual',
      'Building Regulations Part H3',
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
    name: 'Package Pump Station',
    tagline: 'Complete wet well pumping solution',
    description:
      'Pre-assembled package pump stations with programmable controls, single or twin pump configurations, and integrated wet well chamber. Designed for foul, surface water and combined drainage applications where gravity discharge is not achievable.',
    features: [
      'Pre-wired and factory-tested for rapid installation',
      'Single or twin pump configurations for duty/standby',
      'Programmable controller options including PLC',
      'Anti-flood alarm systems as standard',
      'Removable pump rails for easy maintenance',
      'Integrated guide rails and chain lifting points',
    ],
    specifications: [
      { label: 'Material', value: 'HDPE wet well (rotationally moulded)' },
      { label: 'Wet Well Diameters', value: '450, 600, 750, 1050mm' },
      { label: 'Pump Count', value: '1 or 2 (duty/standby)' },
      { label: 'Controllers', value: 'Manual, Auto-float, Auto-level, PLC' },
      { label: 'Depths', value: '1000 - 3000mm' },
      { label: 'Power Supply', value: 'Single or three phase' },
    ],
    compliance: [
      'BS EN 12050 (wastewater lifting plants)',
      'BS EN 752 (drain and sewer systems)',
      'Sewers for Adoption 7th Edition (SfA7)',
      'Building Regulations Part H',
      'WRAS approved components',
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
      { label: 'Variants', value: 'Standalone, Plus (factory-fitted)' },
      { label: 'Compatible Diameters', value: '450, 600, 750, 1050mm' },
      { label: 'Deployment Time', value: 'Under 5 minutes' },
      { label: 'Filter Media', value: 'Hydrocarbon-absorbing polymer' },
      { label: 'Retrofit', value: 'Yes, to existing chambers' },
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
