// Prints generated coding questions as JSON so verify.py can run them through real Python and SQLite.
// Usage: node tools/dump_code.mjs [count per template]
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const api = require('../generators.js')
require('../generators_code.js')

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const count = Number(process.argv[2] || 60)
const out = []
for (const t of api.templates.filter((x) => x.kind === 'code')) {
  const rand = seeded(t.key.length * 7907 + 11)
  for (let i = 0; i < count; i++) out.push(api.build(t, rand))
}
process.stdout.write(JSON.stringify(out))
