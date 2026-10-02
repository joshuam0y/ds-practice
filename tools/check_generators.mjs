// Builds many questions from every template in generators.js and checks each one independently.
// The answers are re-derived here a different way (brute-force counting, simulation, explicit joins)
// rather than with the template's own formula. Run: node tools/check_generators.mjs
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const api = require('../generators.js')
require('../generators_code.js')
require('../generators_more.js')
const { templates, build } = api

const PER_TEMPLATE = 400
const problems = []

// Seeded random numbers so a failure can be reproduced
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const popcount = (x) => x.toString(2).replace(/0/g, '').length

function subsets(n, k, test = () => true) {
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) if (popcount(mask) === k && test(mask)) count++
  return count
}

function permutations(items) {
  if (items.length <= 1) return [items]
  const out = []
  items.forEach((x, i) => {
    for (const rest of permutations([...items.slice(0, i), ...items.slice(i + 1)])) out.push([x, ...rest])
  })
  return out
}

const poissonP = (lam, k) => {
  let p = Math.exp(-lam)
  for (let i = 1; i <= k; i++) p *= lam / i
  return p
}

// Bands of the 68-95-99.7 rule, from below z = -3 to above z = 3
const BANDS = [0.0015, 0.0235, 0.135, 0.34, 0.34, 0.135, 0.0235, 0.0015]
const EDGES = [-Infinity, -3, -2, -1, 0, 1, 2, 3, Infinity]

const solve = {
  'combo-team': ({ n, k }) => subsets(n, k),
  'combo-at-least-one': ({ a, m, k }) => subsets(a + m, k, (mask) => mask >> a !== 0),
  'pin-no-repeat': ({ L }) => {
    let count = 0
    for (let code = 0; code < 10 ** L; code++) if (new Set(String(code).padStart(L, '0')).size === L) count++
    return count
  },
  'bayes-flag': ({ p, s, f }) => {
    const people = 1000000
    const sick = (people * p) / 100
    const flaggedSick = (sick * s) / 100
    const flaggedWell = ((people - sick) * f) / 100
    return flaggedSick / (flaggedSick + flaggedWell)
  },
  'poisson-at-least-one': ({ lam }) => {
    let total = 0
    for (let k = 1; k < 80; k++) total += poissonP(lam, k)
    return total
  },
  'poisson-exactly': ({ lam, k }) => poissonP(lam, k),
  'poisson-rescale': ({ rate, minutes }) => poissonP((rate / 60) * minutes, 0),
  'normal-interval': ({ a, b }) => {
    const lo = a === -9 ? -Infinity : a
    const hi = b === 9 ? Infinity : b
    return BANDS.reduce((sum, p, i) => sum + (EDGES[i] >= lo && EDGES[i + 1] <= hi ? p : 0), 0)
  },
  'expected-value': ({ W, L, p1, p2 }) => {
    // Ten equally likely slots
    const slots = [...Array(p1).fill(W), ...Array(p2).fill(-L), ...Array(10 - p1 - p2).fill(0)]
    return slots.reduce((s, v) => s + v, 0) / 10
  },
  'without-replacement': ({ N, D }) => {
    let good = 0
    let all = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) { all++; if (i < D && j < D) good++ }
    return good / all
  },
  'independent-either': ({ a, b }) => {
    let hit = 0
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if (i < a || j < b) hit++
    return hit / 100
  },
  'arrange-letters': ({ word }) => new Set(permutations([...word]).map((p) => p.join(''))).size,
  'conditional-counts': ({ A, B, both, T }) => {
    const people = Array.from({ length: T }, (_, i) => ({ a: i < A, b: i < both || (i >= A && i < A + B - both) }))
    const withB = people.filter((p) => p.b)
    return withB.filter((p) => p.a).length / withB.length
  },
  'standard-error': ({ sd, n }) => sd / Math.sqrt(n),
  'iqr-outlier': null, // checked with a threshold below
  'sd-transform': ({ sd, a, b }) => {
    const ys = [500 - sd, 500 + sd].map((x) => a * (x + b))
    const mean = (ys[0] + ys[1]) / 2
    return Math.sqrt(ys.reduce((s, y) => s + (y - mean) ** 2, 0) / 2)
  },
  'covariance-units': ({ k, m }) => {
    // Two points with covariance m * k^2 in dollars, then rescaled
    const d = Math.sqrt(m) * k
    const xs = [-d, d].map((x) => x / k)
    const ys = [-d, d].map((y) => y / k)
    return (xs[0] * ys[0] + xs[1] * ys[1]) / 2
  },
  'median-even': ({ vals }) => {
    const s = [...vals].sort((x, y) => x - y)
    return (s[s.length / 2 - 1] + s[s.length / 2]) / 2
  },
  'count-nulls': ({ vals }) => {
    const nonNull = vals.filter((v) => v !== null)
    return vals.length * 10000 + nonNull.length * 100 + new Set(nonNull).size
  },
  'avg-nulls': ({ vals }) => {
    const nonNull = vals.filter((v) => v !== null)
    return nonNull.reduce((s, v) => s + v, 0) / nonNull.length
  },
  'union-count': ({ A, B }) => new Set([...A, ...B]).size,
  'join-count': ({ perCust, orphans, kind }) => {
    const accounts = perCust.flatMap((c, i) => Array(c).fill(i + 1)).concat(Array(orphans).fill(null))
    let rows = 0
    perCust.forEach((_, i) => {
      const matches = accounts.filter((owner) => owner !== null && owner === i + 1).length
      rows += matches || (kind === 'LEFT JOIN' ? 1 : 0)
    })
    return rows
  },
}

const DASHES = /[–—]/
let built = 0
const positions = [0, 0, 0, 0]

// Multi-select: decide each option's truth from its displayed text, independently of the template
function evalExpr(text) {
  const js = text
    .replace(/(\d),(?=\d{3})/g, '$1')
    .replace(/C\((\d+), (\d+)\)/g, (_, a, b) => subsets(+a, +b))
    .replace(/P\((\d+), (\d+)\)/g, (_, a, b) => { let p = 1; for (let i = 0; i < +b; i++) p *= +a - i; return p })
    .replace(/(\d+)!/g, (_, a) => { let f = 1; for (let i = 2; i <= +a; i++) f *= i; return f })
    .replace(/×/g, '*').replace(/\^/g, '**')
  return Function(`return (${js})`)()
}
const truthOf = {
  'multi-combo-identities': (q) => q.options.map((o) => close(evalExpr(o), subsets(q.check.params.n, q.check.params.k))),
  'multi-independence': (q) => {
    const { a, b, ab } = q.check.params // tenths, tenths, hundredths
    const val = (o) => Math.round(parseFloat(o.split('= ')[1]) * 100)
    return q.options.map((o) => {
      if (o === 'A and B are independent') return ab === a * b
      if (o === 'A and B are mutually exclusive') return ab === 0
      if (o.startsWith('P(A or B)')) return val(o) === 10 * a + 10 * b - ab
      if (o.startsWith('P(B | A)')) return val(o) * a === 10 * ab
      if (o.startsWith('P(A | B)')) return val(o) * b === 10 * ab
      throw new Error(`unknown statement ${o}`)
    })
  },
  'multi-outliers': (q) => {
    const { q1, q3 } = q.check.params
    return q.options.map((o) => { const v = parseFloat(o.replace(/,/g, '')); return v > q3 + 1.5 * (q3 - q1) || v < q1 - 1.5 * (q3 - q1) })
  },
  'multi-sql-aggregates': (q) => {
    const vals = q.check.params.vals
    const nn = vals.filter((v) => v !== null)
    const facts = { 'COUNT(*)': vals.length, 'COUNT(balance)': nn.length, 'SUM(balance)': nn.reduce((s, v) => s + v, 0), 'MAX(balance)': Math.max(...nn) }
    facts['AVG(balance)'] = facts['SUM(balance)'] / nn.length
    return q.options.map((o) => {
      if (o.includes('NULL because')) return nn.length === 0
      const [fn, value] = o.split(' returns ')
      return close(facts[fn], parseFloat(value.replace(/,/g, '')))
    })
  },
}

for (const t of templates) {
  if (t.kind === 'code') continue
  if (t.kind === 'multi') {
    if (!(t.key in truthOf)) { problems.push(`${t.key}: no independent check written`); continue }
    const rand = seeded(t.key.length * 104729 + 3)
    for (let i = 0; i < PER_TEMPLATE; i++) {
      const q = build(t, rand)
      built++
      const truths = truthOf[t.key](q)
      const expected = truths.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
      const where = `${t.key} #${i}`
      if (JSON.stringify(expected) !== JSON.stringify(q.answers)) problems.push(`${where}: options judged true independently ${expected}, answers ${q.answers}\n    ${JSON.stringify({ prompt: q.prompt, options: q.options })}`)
      if (q.options.length < 4 || q.options.length > 7 || new Set(q.options).size !== q.options.length) problems.push(`${where}: needs 4 to 7 distinct options`)
      if (q.explanations.some((e, k) => e.startsWith('Correct') !== q.answers.includes(k))) problems.push(`${where}: explanations misaligned`)
      if (DASHES.test(JSON.stringify([q.prompt, q.options, q.explanations, q.approach]))) problems.push(`${where}: contains an em or en dash`)
      if (/NaN|undefined|Infinity/.test(JSON.stringify([q.prompt, q.options]))) problems.push(`${where}: rendered NaN, undefined or Infinity`)
    }
    continue
  }
  if (!(t.key in solve)) problems.push(`${t.key}: no independent check written`)
  const rand = seeded(t.key.length * 7919 + 17)
  for (let i = 0; i < PER_TEMPLATE; i++) {
    let q
    try {
      q = build(t, rand)
    } catch (e) {
      problems.push(`${t.key}: ${e.message}`)
      break
    }
    built++
    const where = `${t.key} #${i}`
    const fail = (msg) => problems.push(`${where}: ${msg}\n    ${JSON.stringify({ prompt: q.prompt, options: q.options, answer: q.answer })}`)
    if (q.options.length !== 4 || new Set(q.options).size !== 4) fail('needs 4 distinct options')
    if (!(q.answer >= 0 && q.answer < 4)) fail('bad answer index')
    if (q.explanations.length !== 4 || !q.explanations[q.answer].startsWith('Correct')) fail('explanations misaligned')
    if (q.explanations.some((e, k) => k !== q.answer && e.startsWith('Correct'))) fail('a wrong option is explained as correct')
    const allText = JSON.stringify([q.title, q.prompt, q.options, q.explanations, q.approach])
    if (DASHES.test(allText)) fail('contains an em or en dash')
    if (/NaN|undefined|Infinity/.test(JSON.stringify([q.prompt, q.options]))) fail('rendered NaN, undefined or Infinity')
    positions[q.answer]++
    const values = q.check.values
    if (q.check.rule === 'only_greater') {
      const { q1, q3 } = q.check.params
      const fence = q3 + 1.5 * (q3 - q1)
      const beyond = values.map((v, k) => (v > fence ? k : -1)).filter((k) => k >= 0)
      if (beyond.length !== 1 || beyond[0] !== q.answer) fail(`expected exactly the answer beyond the fence ${fence}, got options ${beyond}`)
      continue
    }
    const truth = solve[t.key](q.check.params)
    const hits = values.map((v, k) => (close(v, truth) ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1 || hits[0] !== q.answer) fail(`independent answer ${truth} matches options [${hits}], key is ${q.answer}`)
    if (values.some((v) => typeof v !== 'number' || Number.isNaN(v))) fail('an option value is not a number')
    if (values.some((v, k) => k !== q.answer && v >= 0 && v <= 1 && truth >= 0 && truth <= 1 && close(v, truth))) fail('a distractor equals the answer')
  }
}

const single = positions.reduce((x, y) => x + y, 0)
const share = positions.map((p) => Math.round((100 * p) / single))
console.log(`Built ${built} questions from ${templates.length} templates. Correct answer positions A-D: ${share.join('% ')}%`)
if (share.some((x) => x < 20 || x > 30)) problems.push(`correct answers are unevenly spread across positions: ${share.join('% ')}%`)
if (problems.length) {
  console.log(`FAILED: ${problems.length} problem(s)`)
  for (const p of problems.slice(0, 20)) console.log(`  - ${p}`)
  process.exit(1)
}
console.log('GENERATORS OK')
