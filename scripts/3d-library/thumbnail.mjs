// Render a 512 px thumbnail of an assembled glb in headless Chromium.
//
//   node thumbnail.mjs <in.glb> <out.png> '<json roles>'
//
// roles maps part node names to "body" or "accent". It is only used when
// the glb carries no materials of its own: then body parts take ink-600
// and accent parts take brand-blue #1E80BA, per the brand tokens. When the
// source had materials they are rendered as they are.
//
// Rendering the finished file in three.js, rather than in Blender, is also
// the check that it decodes the way a web viewer will load it (Meshopt,
// quantised attributes and all).

import { chromium } from 'playwright-core'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const [input, output, rolesArg = '{}'] = process.argv.slice(2)
const threeRoot = join(dirname(fileURLToPath(import.meta.url)), 'node_modules', 'three')
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
if (!existsSync(executablePath)) throw new Error(`No Chromium at ${executablePath}; set CHROMIUM_PATH`)

const page_html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
</head><body><script type="module">
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
const roles = ${JSON.stringify(JSON.parse(rolesArg))}
const size = 512
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(1); renderer.setSize(size, size); renderer.setClearColor(0x000000, 0)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.NeutralToneMapping
document.body.appendChild(renderer.domElement)
const scene = new THREE.Scene()
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a949b, 1.6))
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(1, 1.6, 1.2); scene.add(key)
const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(-1.2, 0.6, -1); scene.add(rim)
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
loader.load('/model.glb', (gltf) => {
  const hasMaterials = (gltf.parser.json.materials || []).length > 0
  const body = new THREE.MeshStandardMaterial({ color: 0x4d5760, roughness: 0.55, metalness: 0.05 })
  const accent = new THREE.MeshStandardMaterial({ color: 0x1e80ba, roughness: 0.45, metalness: 0.05 })
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return
    if (!hasMaterials) {
      let n = o, role
      while (n && !role) { role = roles[n.name]; n = n.parent }
      o.material = role === 'accent' ? accent : body
    }
  })
  scene.add(gltf.scene)
  const box = new THREE.Box3().setFromObject(gltf.scene)
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  // Three-quarter view: 45 degrees round from the front, 25 degrees above.
  const cam = new THREE.PerspectiveCamera(30, 1, sphere.radius / 100, sphere.radius * 100)
  const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(15)) * 1.02
  const az = THREE.MathUtils.degToRad(45), el = THREE.MathUtils.degToRad(25)
  cam.position.set(
    sphere.center.x + dist * Math.cos(el) * Math.sin(az),
    sphere.center.y + dist * Math.sin(el),
    sphere.center.z + dist * Math.cos(el) * Math.cos(az))
  cam.lookAt(sphere.center)
  renderer.render(scene, cam)
  window.__done = { hasMaterials, meshes: gltf.scene.children.length }
}, undefined, (e) => { window.__done = { error: String(e && e.message || e) } })
</script></body></html>`

const browser = await chromium.launch({ executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 512, height: 512 } })
await page.route('http://thumb.local/**', async (route) => {
  const path = new URL(route.request().url()).pathname
  if (path === '/') return route.fulfill({ contentType: 'text/html', body: page_html })
  if (path === '/model.glb') return route.fulfill({ contentType: 'model/gltf-binary', body: readFileSync(input) })
  if (path.startsWith('/three/')) {
    return route.fulfill({ contentType: 'text/javascript', body: readFileSync(join(threeRoot, path.slice(7))) })
  }
  return route.fulfill({ status: 404, body: '' })
})
await page.goto('http://thumb.local/')
await page.waitForFunction(() => window.__done, null, { timeout: 120000 })
const result = await page.evaluate(() => window.__done)
if (!result.error) await page.locator('canvas').screenshot({ path: output, omitBackground: true })
await browser.close()
console.log(JSON.stringify(result))
if (result.error) process.exit(1)
