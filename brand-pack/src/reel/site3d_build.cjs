// node site3d_build.cjs -> site3d/: the website's own 3D modules (part roles, assembly fixes) as browser ES modules,
// so the cut draws the products exactly as the site does. Follows imports from the entry files; '@/' is the repo root.
const ts = require('typescript'); const fs = require('fs'); const path = require('path');
const REPO = path.resolve(__dirname, '../../..'), OUT = path.join(__dirname, 'site3d');
const ENTRY = ['components/site/three/assembly.ts', 'lib/content/product-models.ts'];
const seen = new Set();
function build(rel) {
  if (seen.has(rel)) return; seen.add(rel);
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8');
  let js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, verbatimModuleSyntax: false } }).outputText;
  js = js.replace(/(from\s+|import\s+)(['"])([^'"]+)\2/g, (all, kw, qt, spec) => {
    let target = null;
    if (spec.startsWith('@/')) target = spec.slice(2);
    else if (spec.startsWith('.')) target = path.posix.join(path.posix.dirname(rel), spec);
    if (!target) return all;   // 'three' and 'three/examples/...' resolve through the page's importmap
    const file = ['.ts', '.tsx', '/index.ts'].map(e => target + e).find(f => fs.existsSync(path.join(REPO, f)));
    if (!file) throw new Error('cannot resolve ' + spec + ' from ' + rel);
    build(file);
    const outRel = file.replace(/\.tsx?$/, '.js');
    return kw + qt + path.posix.relative(path.posix.dirname(rel), outRel).replace(/^(?!\.)/, './') + qt;
  });
  const out = path.join(OUT, rel.replace(/\.tsx?$/, '.js'));
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, js);
}
ENTRY.forEach(build);
console.log([...seen].join('\n'));
