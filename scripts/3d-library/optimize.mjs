// Compress a raw Blender glb for the web with glTF-Transform + Meshopt.
//
//   node optimize.mjs <in.glb> <out.glb>
//
// Deliberately not `gltf-transform optimize`: that flattens and joins the
// node tree, and the assembled files need their parts kept as named nodes
// so a viewer can explode or hide them. Only lossless-to-the-eye steps run
// here; decimation already happened in Blender against a known budget.
//
// Prints JSON: bytes, triangle count and the node names that survived.

import { NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { dedup, prune, weld, reorder, quantize, meshopt } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import { statSync } from 'node:fs'

const [input, output] = process.argv.slice(2)
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({
  'meshopt.encoder': MeshoptEncoder,
})

const doc = await io.read(input)
await doc.transform(
  dedup(),
  prune({ keepLeaves: false, keepAttributes: false }),
  weld(),
  reorder({ encoder: MeshoptEncoder }),
  // 14-bit positions: at a 3 m product that is a 0.2 mm step, below what
  // any render or dimension readout will show.
  quantize({ quantizePosition: 14, quantizeNormal: 10 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)
await io.write(output, doc)

let tris = 0
for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const idx = prim.getIndices()
    tris += (idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3
  }
}
console.log(JSON.stringify({
  bytes: statSync(output).size,
  tris,
  nodes: doc.getRoot().listNodes().map((n) => n.getName()),
}))
