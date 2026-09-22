import type { PartRole } from '@/components/site/three/toon'

/**
 * Which 3D library models appear on each product page, and how.
 *
 * Keyed by the product catalogue slug (lib/product-catalog.ts). Models come
 * from public/models/library/v1 (see its manifest.json); part names are the
 * part node names listed there per product.
 *
 * Roles decide how a part is drawn and what the page's interaction does:
 *   casing  the outer shell; hovering (or the reveal control on touch)
 *           fades it so the insides show
 *   insides what the casing hides; drawn in the light accent colour
 *   inlet   pipe connections; green, as on the Webflow drawings
 *   accent  details worth picking out in brand blue
 *   xray    a presentation shell that is always see-through
 *   body    everything else (the default for unlisted parts)
 */

export interface ProductModel {
  /** Stable id, unique within the product. */
  id: string
  /** Short name shown with the model, e.g. "SERSIC 600". */
  label: string
  /** Assembled glb, relative to the site root: /models/library/v1/<slug>/<file>.glb */
  url: string
  /** Largest dimension of the product in mm (manifest bboxMm.size max), used to fit the view. */
  span: number
  roles: Record<string, PartRole>
  /** One line on what the viewer is showing; plain, no marketing. */
  caption?: string
  /** Camera start: degrees round from the front and above the horizon. */
  view?: { azimuth: number; elevation: number }
}

export interface ProductModelSet {
  /** The model shown in the page hero. */
  hero: ProductModel
  /** Further models for the lower "in 3D" section (variants, cut-aways, family members). */
  more?: ProductModel[]
}

const LIB = '/models/library/v1'

/*
 * View angles assume azimuth 0 looks at the model from +z and positive
 * azimuth swings round towards +x (three.js Spherical theta), with the
 * library's Y-up, base-at-zero convention.
 *
 * Not mapped, so those pages render without a model:
 *   grease-separator      the only grease asset is the Jumbo Micro, a small
 *                         floor-standing trap; it does not represent a
 *                         below-ground multi-chamber separator
 *   rainwater-harvesting  no library asset
 *   septic-tank           no library asset
 */
export const PRODUCT_MODELS: Partial<Record<string, ProductModelSet>> = {
  // SERSIC 600: "body" is the full-height ribbed shell and "body-bottom" a
  // band of the same 353 mm radius, so both are the casing. The moulded base
  // and the benching disc ("lid", which sits inside at about 740 mm) are the
  // insides; the inlet stub sits within the shell and shows once it fades.
  // The SERCIC 5-inlet keeps its external rim band in brand blue.
  'inspection-chamber': {
    hero: {
      id: 'sersic600',
      label: 'Rhino inspection chamber SERSIC600',
      url: `${LIB}/rhino-inspection-chamber/rhino-inspection-chamber-sersic600.glb`,
      span: 1950,
      roles: {
        body: 'casing',
        'body-bottom': 'casing',
        base: 'insides',
        lid: 'insides',
        inlet: 'inlet',
      },
      caption: 'A 600 mm surface water chamber; lift the shell away to see the moulded base and inlet.',
      view: { azimuth: 35, elevation: 18 },
    },
    more: [
      {
        id: 'sercic600-5-inlet',
        label: 'Rhino inspection chamber SERCIC600, 5-inlet base',
        url: `${LIB}/rhino-inspection-chamber-5-inlet/rhino-inspection-chamber-sercic600-5-inlet.glb`,
        span: 1556.3,
        roles: {
          body: 'casing',
          rim: 'accent',
          base: 'insides',
          inlet: 'inlet',
        },
        caption: 'The 600 mm chamber on the 5-inlet base, with the base visible through the shell.',
        view: { azimuth: 35, elevation: 18 },
      },
      {
        id: 'seb1050',
        label: 'Rhino moulded base SEB1050',
        url: `${LIB}/rhino-inspection-chamber-base/rhino-inspection-chamber-base-seb1050.glb`,
        span: 1071.9,
        roles: {},
        caption: 'The 1050 mm moulded chamber base on its own, before a riser is fitted.',
        view: { azimuth: 35, elevation: 28 },
      },
    ],
  },

  // RhinoPit: the "cube" is the presentation x-ray box from the source scene.
  // The ribbed tubing is already drawn cut open, so there is no casing to
  // fade; the inlet and outlet stubs are the pipe connections. RhinoShield
  // (degraded, scale approximate) is the filter variant: its base, tubing and
  // two riser levels are the casing, the filter holder and cartridges inside.
  'catchpit-silt-trap': {
    hero: {
      id: 'serpt600',
      label: 'RhinoPit SERPT600',
      url: `${LIB}/rhinopit/rhinopit-serpt600.glb`,
      span: 1541.7,
      roles: {
        cube: 'xray',
        'serpt-inlet': 'inlet',
        serptoutlet: 'inlet',
      },
      caption: 'A 600 mm catchpit shown cut open inside a see-through ground block, with its inlet and outlet.',
      view: { azimuth: 35, elevation: 18 },
    },
    more: [
      {
        id: 'sersd500',
        label: 'RhinoShield SERSD500',
        url: `${LIB}/rhinoshield/rhinoshield-sersd500.glb`,
        span: 1227,
        roles: {
          base: 'casing',
          'base-tubing': 'casing',
          'top-level-1': 'casing',
          'top-level-2': 'casing',
          'filter-holder': 'insides',
          'filter-long': 'insides',
          'filter-short': 'insides',
        },
        caption: 'The chamber with its riser levels; fade the shell to see the filter holder and cartridges.',
        view: { azimuth: 35, elevation: 20 },
      },
    ],
  },

  // SudSceptor 1800: "casing" is the full GRP shell. The inlet and outlet
  // stubs pass through it (inlet on -x, outlet on -z), so they are the pipe
  // connections. Centre pipe, both curved baffles and the water track are the
  // insides. The bottom bowl sits inside the shell at 450 to 980 mm, below the
  // baffles, so it hides nothing and stays body. The perforated stand is brand
  // blue as in the source. The view looks from the inlet side. RhinoPod is
  // offered on this page as the optional polishing filter.
  rhinoceptor: {
    hero: {
      id: 'sehds1800',
      label: 'SudSceptor SEHDS1800',
      url: `${LIB}/sudsceptor/sudsceptor-sehds1800.glb`,
      span: 4290,
      roles: {
        casing: 'casing',
        inlet: 'inlet',
        outlet: 'inlet',
        'center-pipe': 'insides',
        'inner-curved-baffle': 'insides',
        'outer-curved-baffle': 'insides',
        'water-track': 'insides',
        stand: 'accent',
      },
      caption: 'The 1800 mm separator; fade the shell to see the centre pipe, curved baffles and water track.',
      view: { azimuth: -120, elevation: 15 },
    },
    more: [
      {
        id: 'serpod1850',
        label: 'RhinoPod SERPOD1850',
        url: `${LIB}/rhinopod/rhinopod-serpod1850.glb`,
        span: 579.4,
        roles: {
          casing: 'casing',
          top: 'insides',
          mid: 'insides',
          bottom: 'insides',
        },
        caption: 'The optional RhinoPod filter; fade the cage to see the filter media inside.',
        view: { azimuth: 35, elevation: 20 },
      },
    ],
  },

  // RhinoRoFlo POC600 (orifice, the SERF range): the ribbed tube and the
  // smooth lower band ("poc-base", which carries the outlet stub) form the
  // shell. Divider, pull string and clips are the insides; the orifice plate
  // and its latch stay brand blue so they read as the working parts. The
  // RoTex models have no shell: the 2024 set is laid out as separate parts
  // and is degraded; the 2025 unit is a wall-mounted regulator whose outlet
  // pipe is the pipe connection.
  'flow-control': {
    hero: {
      id: 'poc600',
      label: 'RhinoRoFlo POC600',
      url: `${LIB}/rhinoroflo/rhinoroflo-poc600.glb`,
      span: 1495,
      roles: {
        'poc-tube': 'casing',
        'poc-base': 'casing',
        'poc-divider': 'insides',
        'poc-string': 'insides',
        'poc-string-clips': 'insides',
        'poc-orifice': 'accent',
        'poc-orifice-latch': 'accent',
      },
      caption: 'A 600 mm orifice chamber; fade the shell to see the divider wall and the orifice plate on its pull string.',
      view: { azimuth: 35, elevation: 18 },
    },
    more: [
      {
        id: 'rotex-2025',
        label: 'RhinoRoTex, April 2025 parts',
        url: `${LIB}/rhinorotex-2025/rhinorotex-2025-parts.glb`,
        span: 1020.1,
        roles: {
          'snail-3-4': 'accent',
          'bypass-arm': 'accent',
          'bypass-cap': 'accent',
          'siphon-pipe': 'accent',
          'outlet-pipe': 'inlet',
        },
        caption: 'The vortex regulator on its back plate, with the bypass arm and outlet pipe.',
        view: { azimuth: 35, elevation: 18 },
      },
      {
        id: 'rotex-c1200',
        label: 'RhinoRoTex RoTex-C1200',
        url: `${LIB}/rhinorotex/rhinorotex-c1200.glb`,
        span: 1192.3,
        roles: {
          rotex: 'accent',
        },
        caption: 'The vortex unit and its chamber riser shown side by side as separate parts.',
        view: { azimuth: 35, elevation: 22 },
      },
    ],
  },

  // RhinoLift: every model has a "casing" wet well with the pumps, pipework
  // and floats as the insides. The MINI 2000 D is the hero: at 1000 mm across
  // it sits inside the 600 to 1200 mm wet well range and, being tall, reads
  // clearly once the casing fades. Its inlet stub is modelled as part of
  // "insides-2", so it shows in the insides colour. The PS-50 tank and the
  // AQUA sump are already cut away in the source; their casings still fade.
  'pump-station': {
    hero: {
      id: 'mini2000d',
      label: 'RhinoLift MINI 2000 D',
      url: `${LIB}/rhinolift-mini/rhinolift-mini2000d.glb`,
      span: 2000,
      roles: {
        casing: 'casing',
        insides: 'insides',
        'insides-2': 'insides',
        floats: 'accent',
      },
      caption: 'A 2000 mm deep wet well; fade the casing to see the pump pipework and float switches.',
      view: { azimuth: 20, elevation: 18 },
    },
    more: [
      {
        id: 'maxi1600d',
        label: 'RhinoLift MAXI 1600 D',
        url: `${LIB}/rhinolift-maxi/rhinolift-maxi1600d.glb`,
        span: 1500,
        roles: {
          casing: 'casing',
          insides: 'insides',
          'insides-1': 'insides',
          'insides-2': 'insides',
          floats: 'accent',
        },
        caption: 'The wider 1200 mm wet well, with two sets of pump pipework inside.',
        view: { azimuth: 30, elevation: 20 },
      },
      {
        id: 'ps50',
        label: 'RhinoLift pump tank PS-50',
        url: `${LIB}/rhinolift-pump-tank/rhinolift-ps50.glb`,
        span: 5082.7,
        roles: {
          casing: 'casing',
          insides: 'insides',
          'insides-2': 'insides',
        },
        caption: 'A storage tank with its pump chamber, shown cut open to the pumps and pipework.',
        view: { azimuth: 35, elevation: 22 },
      },
      {
        id: 'aqua190s',
        label: 'RhinoLift AQUA 190S',
        url: `${LIB}/rhinolift-aqua/rhinolift-aqua190s.glb`,
        span: 708,
        roles: {
          'aqua-casing': 'casing',
          aqua190s: 'insides',
          'aqua-plastic-connectors': 'insides',
          'aqua-handle': 'accent',
          'aqua-nut': 'accent',
        },
        caption: 'A small sump pump in its cut-away housing, with the discharge pipe leaving through the wall.',
        view: { azimuth: 35, elevation: 22 },
      },
    ],
  },

  // Jumbo Micro: "jumbo-micro-casing" and "jumbo-micro-casing-xray" are near
  // identical coincident shells (5232 and 5226 triangles, same bounds), so
  // both are casing; otherwise the second would block the reveal. There are
  // no internal baffles in the model, so fading the casing shows only the
  // pipe stubs and cover housing. The separate "-xray" library item is one
  // merged mesh of this same trap and adds nothing, so it is left out.
  'grease-trap': {
    hero: {
      id: 'jumbo-micro',
      label: 'Grease trap Jumbo Micro',
      url: `${LIB}/grease-trap-jumbo-micro/grease-trap-jumbo-micro.glb`,
      span: 829.8,
      roles: {
        'jumbo-micro-casing': 'casing',
        'jumbo-micro-casing-xray': 'casing',
        'jumbo-micro-cover': 'accent',
        'jumbo-micro-inlet-1': 'inlet',
        'jumbo-micro-inlet-2': 'inlet',
      },
      caption: 'A floor-standing grease trap with its access cover and inlet and outlet connections.',
      view: { azimuth: 35, elevation: 22 },
    },
  },

  // RhinoPod (degraded: scale unverified). The grid "casing" cage wraps the
  // filter media, so it is the casing and the three media sections the insides.
  rhinopod: {
    hero: {
      id: 'serpod1850',
      label: 'RhinoPod SERPOD1850',
      url: `${LIB}/rhinopod/rhinopod-serpod1850.glb`,
      span: 579.4,
      roles: {
        casing: 'casing',
        top: 'insides',
        mid: 'insides',
        bottom: 'insides',
      },
      caption: 'The floating filter; fade the outer cage to see the filter media inside.',
      view: { azimuth: 35, elevation: 20 },
    },
  },

  // RhinoDuct: an open drawpit with nothing inside, so no casing. The cover
  // and frame stay brand blue on the hero; the bare duct is the alternative.
  drawpit: {
    hero: {
      id: 'serd-cover',
      label: 'RhinoDuct with cover',
      url: `${LIB}/rhinoduct-with-cover/rhinoduct-serd-cover.glb`,
      span: 930,
      roles: {
        cover: 'accent',
      },
      caption: 'A rectangular drawpit with its cover and frame in place.',
      view: { azimuth: 35, elevation: 25 },
    },
    more: [
      {
        id: 'serd',
        label: 'RhinoDuct',
        url: `${LIB}/rhinoduct/rhinoduct-serd.glb`,
        span: 930,
        roles: {},
        caption: 'The drawpit body without its cover, showing the interlocking wall sections.',
        view: { azimuth: 35, elevation: 30 },
      },
    ],
  },
}
