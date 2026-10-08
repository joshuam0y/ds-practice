'use strict'
// Coding templates for the pandas and NumPy sections: filtering, groupby, merges, pivots, ranking within groups,
// boolean masks, axis aggregation, np.where, broadcasting and vectorized compound growth. Same contract as
// generators_code.js: every build gets fresh data, the expected output of every test is computed here in JavaScript,
// and a separately written Python reference solution ships with the question; verify.py runs both and checks they agree.
// Tests compare plain Python values (to_dict('records'), tolist(), round()) so they don't depend on library versions.
// Load after generators.js.

;(function () {
  const api = typeof window !== 'undefined' ? window.GENERATORS : require('./generators.js')
  const T = api.templates

  const pick = (rand, list) => list[Math.floor(rand() * list.length)]
  const between = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  const shuffle = (rand, list) => {
    const a = [...list]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const sample = (rand, list, k) => shuffle(rand, list).slice(0, k)
  const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)
  const sum = (xs) => xs.reduce((s, x) => s + x, 0)
  const FENCE = '```'

  // ---------- Python literals written from JavaScript values

  // Marks a number that must print as a Python float (20.0, not 20), and a tuple
  class Flt { constructor(x) { this.x = x } }
  class Tup { constructor(xs) { this.xs = xs } }
  const F = (x) => new Flt(x)
  const tup = (...xs) => new Tup(xs)
  const floats = (v) => (Array.isArray(v) ? v.map(floats) : F(v))

  function pyFloat(x) {
    if (!Number.isFinite(x)) throw new Error(`cannot write ${x} as a Python float`)
    if (x === 0) return '0.0'
    const s = String(x)
    if (/e/i.test(s)) throw new Error(`float ${s} would print in exponent form`)
    return Number.isInteger(x) ? `${s}.0` : s
  }
  function py(v) {
    if (v === null || v === undefined) return 'None'
    if (v === true) return 'True'
    if (v === false) return 'False'
    if (v instanceof Flt) return pyFloat(v.x)
    if (v instanceof Tup) return `(${v.xs.map(py).join(', ')}${v.xs.length === 1 ? ',' : ''})`
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : pyFloat(v)
    if (typeof v === 'string') return `'${v}'`
    if (Array.isArray(v)) return `[${v.map(py).join(', ')}]`
    return `{${Object.entries(v).map(([k, x]) => `'${k}': ${py(x)}`).join(', ')}}`
  }
  // df = pd.DataFrame({...}) from [[column, values, 'int' | 'float' | 'str']]
  const frame = (name, cols) => `${name} = pd.DataFrame({${cols.map(([c, vals, kind]) => `'${c}': ${py(kind === 'float' ? floats(vals) : vals)}`).join(', ')}})`

  // Rounding the way Python's round() and np.round do. A value sitting on a half (where half-up and half-to-even
  // disagree, or float noise could tip it either way) throws Retry, and the template draws fresh data.
  class Retry extends Error {}
  function roundTo(x, d) {
    const scaled = x * 10 ** d
    const frac = Math.abs(scaled - Math.trunc(scaled))
    if (Math.abs(frac - 0.5) < 1e-5) throw new Retry('rounding tie')
    const r = Math.round(scaled) / 10 ** d
    return r === 0 ? 0 : r
  }
  const r2 = (x) => roundTo(x, 2)
  const r4 = (x) => roundTo(x, 4)
  const retrying = (make) => (rand) => {
    for (let attempt = 0; attempt < 500; attempt++) {
      try {
        return make(rand)
      } catch (e) {
        if (!(e instanceof Retry)) throw e
      }
    }
    throw new Error('could not draw usable data')
  }
  const fn = (name, args, body) => ['', '', `def ${name}(${args}):`, ...body, '']
  const starter = (lib, name, args) => [lib, ...fn(name, args, ['    # Write your code here', '    pass'])]
  const PD = 'import pandas as pd'
  const NP = 'import numpy as np'

  // ===================================================================== pandas

  const FILTER_SCENES = [
    { id: 'txn_id', cat: 'channel', cats: ['online', 'branch', 'atm', 'mobile'], num: 'amount', noun: 'transactions', step: 25, lo: 1, hi: 80, ids: 100 },
    { id: 'loan_id', cat: 'grade', cats: ['A', 'B', 'C', 'D'], num: 'balance', noun: 'loans', step: 500, lo: 2, hi: 60, ids: 5000 },
    { id: 'card_id', cat: 'tier', cats: ['basic', 'gold', 'platinum'], num: 'credit_limit', noun: 'cards', step: 250, lo: 2, hi: 60, ids: 700 },
  ]
  const OPS = [
    { op: '>=', words: 'at least', ok: (x, c) => x >= c, wrong: '>', miss: 'drops rows exactly at the cutoff' },
    { op: '>', words: 'more than', ok: (x, c) => x > c, wrong: '>=', miss: 'keeps rows exactly at the cutoff' },
    { op: '<=', words: 'at most', ok: (x, c) => x <= c, wrong: '<', miss: 'drops rows exactly at the cutoff' },
    { op: '<', words: 'less than', ok: (x, c) => x < c, wrong: '<=', miss: 'keeps rows exactly at the cutoff' },
  ]

  T.push({
    key: 'code-pd-filter-sort', section: 'pandas', kind: 'code',
    make: retrying((rand) => {
      const s = pick(rand, FILTER_SCENES)
      const keep = pick(rand, s.cats)
      const others = s.cats.filter((c) => c !== keep)
      const rule = pick(rand, OPS)
      const desc = rand() < 0.5
      const name = `select_${s.noun}`
      const value = () => s.step * between(rand, s.lo, s.hi)

      // Four rows in the kept category (two of them tied), others elsewhere including both extremes
      const gen = (n) => {
        const kv = [value(), 0, value(), value()]
        kv[1] = kv[0]
        if (new Set(kv).size < 3) throw new Retry('need three distinct kept values')
        const rows = kv.map((v) => ({ cat: keep, num: v }))
        rows.push({ cat: pick(rand, others), num: s.step * s.lo }, { cat: pick(rand, others), num: s.step * s.hi })
        while (rows.length < n) rows.push({ cat: pick(rand, s.cats), num: value() })
        const ids = sample(rand, range(s.ids + 1, s.ids + 60), n)
        return { rows: shuffle(rand, rows).map((r, i) => ({ ...r, id: ids[i] })), kept: [...new Set(kv)].sort((a, b) => a - b), tied: kv[0] }
      }
      const solve = (rows, c) => rows.filter((r) => r.cat === keep && rule.ok(r.num, c))
        .sort((a, b) => (desc ? b.num - a.num : a.num - b.num) || a.id - b.id)
        .map((r) => ({ [s.id]: r.id, [s.num]: F(r.num) }))
      const setup = (d) => frame('df', [[s.id, d.rows.map((r) => r.id), 'int'], [s.cat, d.rows.map((r) => r.cat), 'str'], [s.num, d.rows.map((r) => r.num), 'float']])

      const A = gen(9)
      const B = gen(7)
      const cA = A.kept[1]
      const cTie = rule.op === '>' ? A.tied - 1 : rule.op === '<' ? A.tied + 1 : A.tied
      const all = A.rows.map((r) => r.num)
      const loose = rule.op[0] === '>' ? 0 : 10 ** 7
      const none = rule.op[0] === '>' ? Math.max(...all) + s.step : Math.min(...all) - s.step
      const cB = pick(rand, B.kept)
      const call = (c) => `${name}(df, ${c})`
      const cols = [s.id, s.num]
      const tests = [
        { name: 'Example rows', setup: setup(A), expr: `${call(cA)}.to_dict('records')`, expect: py(solve(A.rows, cA)) },
        { name: `Tied ${s.num} values sort by ${s.id}`, setup: setup(A), expr: `${call(cTie)}.to_dict('records')`, expect: py(solve(A.rows, cTie)) },
        { name: `Other ${s.cat} values never appear`, setup: setup(A), expr: `sorted(${call(loose)}['${s.id}'].tolist())`, expect: py(A.rows.filter((r) => r.cat === keep).map((r) => r.id).sort((a, b) => a - b)) },
        { name: 'Nothing qualifies', setup: setup(A), expr: `(lambda r: (len(r), list(r.columns)))(${call(none)})`, expect: py(tup(0, cols)) },
        { name: 'Two columns and a fresh index', setup: setup(A), expr: `(lambda r: (list(r.columns), list(r.index)))(${call(cA)})`, expect: py(tup(cols, range(0, solve(A.rows, cA).length - 1))) },
        { name: 'A different set of rows', setup: setup(B), expr: `${call(cB)}.to_dict('records')`, expect: py(solve(B.rows, cB)) },
      ]
      const order = desc ? 'largest first' : 'smallest first'
      return {
        type: 'python', packages: ['pandas'], difficulty: 'Easy', topic: 'Filtering and sorting', title: `Filter and sort ${s.noun}`,
        prompt: [
          `\`df\` has columns \`${s.id}\`, \`${s.cat}\` and \`${s.num}\`. Complete \`${name}(df, cutoff)\`, which returns the ${s.noun} with \`${s.cat}\` equal to \`'${keep}'\` and \`${s.num}\` **${rule.words}** \`cutoff\`.`,
          '',
          `- Keep only the columns \`${s.id}\` and \`${s.num}\`, in that order.`,
          `- Sort by \`${s.num}\` (${order}), then by \`${s.id}\` (smallest first).`,
          '- The index should run 0, 1, 2, ...',
          '- If nothing qualifies, return an empty DataFrame that still has those two columns.',
          '',
          FENCE,
          setup(A),
          `${call(cA)}.to_dict('records')`,
          `# ${py(solve(A.rows, cA))}`,
          FENCE,
        ],
        starter: starter(PD, name, 'df, cutoff'),
        solution: [PD, ...fn(name, 'df, cutoff', [
          `    keep = df[(df["${s.cat}"] == "${keep}") & (df["${s.num}"] ${rule.op} cutoff)]`,
          `    out = keep.sort_values(["${s.num}", "${s.id}"], ascending=[${desc ? 'False' : 'True'}, True])`,
          `    return out[["${s.id}", "${s.num}"]].reset_index(drop=True)`,
        ])],
        tests,
        approach: [
          'Build one boolean mask with &, each condition in its own parentheses, and index the DataFrame with it.',
          `Read the boundary word: "${rule.words}" is ${rule.op}.`,
          'sort_values takes a list of columns and a matching list for ascending, which is how you add the tie-break.',
          'Select the output columns with a list, then reset_index(drop=True).',
        ],
        walkthrough: [
          `\`(df["${s.cat}"] == "${keep}") & (df["${s.num}"] ${rule.op} cutoff)\`: both conditions per row; & is element-wise and.`,
          `\`sort_values(["${s.num}", "${s.id}"], ascending=[${desc ? 'False' : 'True'}, True])\`: ${order} by ${s.num}, ties by the smaller ${s.id}.`,
          `\`out[["${s.id}", "${s.num}"]]\`: double brackets select a list of columns, and an empty result keeps them.`,
          '`.reset_index(drop=True)`: renumbers 0, 1, 2 and throws the old row labels away.',
        ],
        mistakes: [
          'Writing `and` instead of `&`, or leaving out the parentheses: pandas raises "truth value of a Series is ambiguous".',
          `Using ${rule.wrong} instead of ${rule.op}, which ${rule.miss}.`,
          `Sorting by ${s.num} only, so tied rows come out in an arbitrary order.`,
          'Forgetting reset_index, so the index keeps the original row numbers.',
        ],
        params: { scene: s.noun, keep, op: rule.op, desc },
      }
    }),
  })

  const GROUP_SCENES = [
    { g: 'branch', names: ['Albany', 'Back Bay', 'Cambridge', 'Hartford', 'Newport', 'Providence'], v: 'amount', noun: 'deposits', one: 'deposit', step: 10 },
    { g: 'region', names: ['Central', 'East', 'North', 'South', 'West'], v: 'balance', noun: 'accounts', one: 'account', step: 50 },
    { g: 'product', names: ['auto', 'card', 'checking', 'mortgage', 'savings'], v: 'payment', noun: 'payments', one: 'payment', step: 5 },
  ]

  T.push({
    key: 'code-pd-groupby', section: 'pandas', kind: 'code',
    make: retrying((rand) => {
      const s = pick(rand, GROUP_SCENES)
      const AGGS = [
        { fn: 'sum', out: 'total', text: `the sum of \`${s.v}\``, calc: (xs) => sum(xs), isInt: false },
        { fn: 'mean', out: `avg_${s.v}`, text: `the average \`${s.v}\`, rounded to 2 decimals`, calc: (xs) => r2(sum(xs) / xs.length), isInt: false },
        { fn: 'count', out: `n_${s.noun}`, text: `how many ${s.noun} the ${s.g} has`, calc: (xs) => xs.length, isInt: true },
        { fn: 'max', out: `max_${s.v}`, text: `the largest \`${s.v}\``, calc: (xs) => Math.max(...xs), isInt: false },
      ]
      const agg = pick(rand, AGGS)
      const name = `${s.g}_summary`
      const value = () => s.step * between(rand, 1, 60)

      const solve = (rows, minRows) => {
        const groups = new Map()
        for (const r of rows) groups.set(r.g, [...(groups.get(r.g) || []), r.v])
        return [...groups].filter(([, xs]) => xs.length >= minRows).map(([g, xs]) => [g, agg.calc(xs)])
          .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
          .map(([g, x]) => ({ [s.g]: g, [agg.out]: agg.isInt ? x : F(x) }))
      }
      const gen = (names, sizes) => shuffle(rand, names.flatMap((g, i) => Array.from({ length: sizes[i] }, () => ({ g, v: value() }))))
      const setup = (rows) => frame('df', [[s.g, rows.map((r) => r.g), 'str'], [s.v, rows.map((r) => r.v), 'float']])

      const A = gen(sample(rand, s.names, 4), shuffle(rand, [1, 2, 3, 4]))
      // Two groups with the same values tie under any aggregation; a third differs
      const [x, y, z] = sample(rand, s.names, 3)
      const shared = Array.from({ length: between(rand, 2, 3) }, value)
      const zVals = [value(), value()]
      if (agg.calc(zVals) === agg.calc(shared)) throw new Retry('third group must differ')
      const tieRows = shuffle(rand, [...shared.map((v) => ({ g: x, v })), ...shared.map((v) => ({ g: y, v })), ...zVals.map((v) => ({ g: z, v }))])
      const B = gen(sample(rand, s.names, 3), [between(rand, 1, 4), between(rand, 1, 4), between(rand, 2, 4)])
      const cols = [s.g, agg.out]
      const call = (m) => `${name}(df, ${m})`
      const tests = [
        { name: 'Example rows', setup: setup(A), expr: `${call(1)}.to_dict('records')`, expect: py(solve(A, 1)) },
        { name: `Ties sort by ${s.g} name`, setup: setup(tieRows), expr: `${call(1)}.to_dict('records')`, expect: py(solve(tieRows, 1)) },
        { name: 'Small groups are left out', setup: setup(A), expr: `${call(3)}.to_dict('records')`, expect: py(solve(A, 3)) },
        { name: 'No group is big enough', setup: setup(A), expr: `(lambda r: (len(r), list(r.columns)))(${call(5)})`, expect: py(tup(0, cols)) },
        { name: 'Two columns and a fresh index', setup: setup(A), expr: `(lambda r: (list(r.columns), list(r.index)))(${call(2)})`, expect: py(tup(cols, range(0, solve(A, 2).length - 1))) },
        { name: 'A different set of rows', setup: setup(B), expr: `${call(2)}.to_dict('records')`, expect: py(solve(B, 2)) },
      ]
      return {
        type: 'python', packages: ['pandas'], difficulty: 'Easy', topic: 'groupby and aggregation', title: `${s.noun[0].toUpperCase()}${s.noun.slice(1)} per ${s.g}`,
        prompt: [
          `\`df\` has one row per ${s.one}, with columns \`${s.g}\` and \`${s.v}\`. Complete \`${name}(df, min_rows)\`, which returns one row per ${s.g} with these columns:`,
          '',
          `- \`${s.g}\``,
          `- \`${agg.out}\`: ${agg.text}`,
          '',
          `Only include a ${s.g} that has at least \`min_rows\` rows. Sort by \`${agg.out}\` (largest first), then by \`${s.g}\` (alphabetical). The index should run 0, 1, 2, ... If no ${s.g} qualifies, return an empty DataFrame with those two columns.`,
          '',
          FENCE,
          setup(A),
          `${call(1)}.to_dict('records')`,
          `# ${py(solve(A, 1))}`,
          FENCE,
        ],
        starter: starter(PD, name, 'df, min_rows'),
        solution: [PD, ...fn(name, 'df, min_rows', [
          `    out = df.groupby("${s.g}", as_index=False).agg(${agg.out}=("${s.v}", "${agg.fn}"), rows=("${s.v}", "size"))`,
          ...(agg.fn === 'mean' ? [`    out["${agg.out}"] = out["${agg.out}"].round(2)`] : []),
          '    out = out[out["rows"] >= min_rows]',
          `    out = out.sort_values(["${agg.out}", "${s.g}"], ascending=[False, True])`,
          `    return out[["${s.g}", "${agg.out}"]].reset_index(drop=True)`,
        ])],
        tests,
        approach: [
          'One row per group means groupby. Named aggregation, .agg(new_name=(column, function)), names the output column in the same step.',
          'Compute the group size alongside it so you can filter groups: the pandas version of SQL HAVING.',
          `Sort with a list of columns: ${agg.out} descending, then ${s.g} ascending for ties.`,
          'Finish with reset_index(drop=True) so the index is 0, 1, 2.',
        ],
        walkthrough: [
          `\`df.groupby("${s.g}", as_index=False)\`: keeps ${s.g} as a normal column instead of the index.`,
          `\`.agg(${agg.out}=("${s.v}", "${agg.fn}"), rows=("${s.v}", "size"))\`: the answer column and the row count in one pass.`,
          ...(agg.fn === 'mean' ? [`\`out["${agg.out}"].round(2)\`: round before sorting, so the sort uses the values you return.`] : []),
          '`out[out["rows"] >= min_rows]`: drops small groups after aggregating.',
          `\`sort_values(["${agg.out}", "${s.g}"], ascending=[False, True])\`: largest first, alphabetical on ties.`,
          `\`out[["${s.g}", "${agg.out}"]].reset_index(drop=True)\`: drops the helper column and renumbers.`,
        ],
        mistakes: [
          `Sorting by ${agg.out} only, so tied ${s.g} rows come out in whichever order the sort leaves them.`,
          'Returning the helper rows column along with the answer.',
          `Using groupby("${s.g}") without as_index=False or reset_index, so ${s.g} becomes the index and to_dict loses it.`,
          'Filtering rows before grouping instead of filtering groups after.',
        ],
        params: { scene: s.g, agg: agg.fn },
      }
    }),
  })

  const PEOPLE = ['Ava', 'Ben', 'Cara', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ira', 'Jon', 'Kim', 'Lu', 'Mo', 'Nia']

  T.push({
    key: 'code-pd-merge-fill', section: 'pandas', kind: 'code',
    make: retrying((rand) => {
      const byTotal = rand() < 0.5
      const kind = pick(rand, [{ col: 'total_spent', noun: 'card purchase' }, { col: 'total_deposited', noun: 'deposit' }, { col: 'total_paid', noun: 'loan payment' }])
      const name = 'customer_activity'
      const amount = () => between(rand, 5, 400) + pick(rand, [0, 0, 0.25, 0.5, 0.75])

      const gen = (nCust, nActive, orphans) => {
        const ids = sample(rand, range(101, 160), nCust)
        const names = sample(rand, PEOPLE, nCust)
        const active = sample(rand, ids, nActive)
        const txns = []
        for (const id of active) for (let k = between(rand, 1, 3); k > 0; k--) txns.push({ id, amt: amount() })
        for (let k = 0; k < orphans; k++) txns.push({ id: between(rand, 161, 199), amt: amount() })
        return { custs: ids.map((id, i) => ({ id, name: names[i] })), txns: shuffle(rand, txns) }
      }
      const solve = ({ custs, txns }) => custs.map((c) => {
        const mine = txns.filter((t) => t.id === c.id).map((t) => t.amt)
        return { id: c.id, name: c.name, n: mine.length, total: sum(mine) }
      }).sort((a, b) => (byTotal ? b.total - a.total : 0) || a.id - b.id)
        .map((r) => ({ customer_id: r.id, name: r.name, n_txns: r.n, [kind.col]: F(r.total) }))
      const setupLines = (d) => [
        frame('customers', [['customer_id', d.custs.map((c) => c.id), 'int'], ['name', d.custs.map((c) => c.name), 'str']]),
        d.txns.length
          ? frame('txns', [['customer_id', d.txns.map((t) => t.id), 'int'], ['amount', d.txns.map((t) => t.amt), 'float']])
          : "txns = pd.DataFrame({'customer_id': pd.Series([], dtype='int64'), 'amount': pd.Series([], dtype='float64')})",
      ]
      const setup = (d) => setupLines(d).join('; ')

      const A = gen(5, 3, 1)
      const quiet = A.custs.find((c) => !A.txns.some((t) => t.id === c.id))
      const empty = { custs: A.custs, txns: [] }
      const B = gen(4, between(rand, 2, 3), between(rand, 0, 2))
      const call = `${name}(customers, txns)`
      const tests = [
        { name: 'Example rows', setup: setup(A), expr: `${call}.to_dict('records')`, expect: py(solve(A)) },
        { name: 'A customer with no activity gets zeros', setup: setup(A), expr: `(lambda r: r[r['customer_id'] == ${quiet.id}].to_dict('records'))(${call})`, expect: py(solve(A).filter((r) => r.customer_id === quiet.id)) },
        { name: 'Unknown customer ids are dropped', setup: setup(A), expr: `(lambda r: (len(r), sorted(r['customer_id'].tolist())))(${call})`, expect: py(tup(5, A.custs.map((c) => c.id).sort((a, b) => a - b))) },
        { name: 'n_txns is a whole number column', setup: setup(A), expr: `bool(pd.api.types.is_integer_dtype(${call}['n_txns']))`, expect: 'True' },
        { name: 'No activity at all', setup: setup(empty), expr: `${call}.to_dict('records')`, expect: py(solve(empty)) },
        { name: 'A different set of customers', setup: setup(B), expr: `${call}.to_dict('records')`, expect: py(solve(B)) },
      ]
      const sortText = byTotal ? `by \`${kind.col}\` (largest first), then \`customer_id\` (smallest first)` : 'by `customer_id` (smallest first)'
      return {
        type: 'python', packages: ['pandas'], difficulty: 'Medium', topic: 'merge (joins) and missing values', title: `Every customer's ${kind.noun}s`,
        prompt: [
          `\`customers\` has columns \`customer_id\` and \`name\`. \`txns\` has one row per ${kind.noun} with columns \`customer_id\` and \`amount\`. Complete \`${name}(customers, txns)\`, which returns one row for **every** customer with columns:`,
          '',
          '- `customer_id`, `name`',
          '- `n_txns`: how many rows that customer has in `txns`, as whole numbers (0 if none)',
          `- \`${kind.col}\`: the sum of their amounts (0.0 if none)`,
          '',
          `Rows in \`txns\` whose \`customer_id\` is not in \`customers\` are ignored. Sort ${sortText}. The index should run 0, 1, 2, ...`,
          '',
          FENCE,
          ...setupLines(A),
          `${call}.to_dict('records')`,
          `# ${py(solve(A))}`,
          FENCE,
        ],
        starter: starter(PD, name, 'customers, txns'),
        solution: [PD, ...fn(name, 'customers, txns', [
          `    per = txns.groupby("customer_id", as_index=False).agg(n_txns=("amount", "count"), ${kind.col}=("amount", "sum"))`,
          '    out = customers.merge(per, on="customer_id", how="left")',
          '    out["n_txns"] = out["n_txns"].fillna(0).astype(int)',
          `    out["${kind.col}"] = out["${kind.col}"].fillna(0.0)`,
          byTotal ? `    out = out.sort_values(["${kind.col}", "customer_id"], ascending=[False, True])` : '    out = out.sort_values("customer_id")',
          `    return out[["customer_id", "name", "n_txns", "${kind.col}"]].reset_index(drop=True)`,
        ])],
        tests,
        approach: [
          'Aggregate first, join second: one row per customer in txns, then attach it to the customer list.',
          'Every customer must appear, so the customer table is the left side of a left merge. Unknown ids in txns fall away for free.',
          'Customers with no match get NaN. fillna(0) fixes the values, and astype(int) fixes the count, which the NaN turned into a float column.',
          'Sort with the tie-break, then reset the index.',
        ],
        walkthrough: [
          `\`txns.groupby("customer_id", as_index=False).agg(n_txns=("amount", "count"), ${kind.col}=("amount", "sum"))\`: one row per customer who has activity.`,
          '`customers.merge(per, on="customer_id", how="left")`: keeps every customer, and only matching txns rows.',
          '`out["n_txns"].fillna(0).astype(int)`: NaN becomes 0, and the column becomes integers again.',
          `\`out["${kind.col}"].fillna(0.0)\`: no activity means a total of 0.0, not missing.`,
          byTotal ? `\`sort_values(["${kind.col}", "customer_id"], ascending=[False, True])\`: biggest first, and customers tied at 0.0 by id.` : '`sort_values("customer_id")`: ascending by id.',
        ],
        mistakes: [
          'An inner merge (the default how), which silently drops customers with no activity.',
          'Merging before aggregating and then counting with size(), so a customer with no activity counts as 1 row.',
          'fillna(0) without astype(int), so n_txns comes back as 2.0 and 0.0.',
          'Starting from txns as the left table, which keeps the unknown customer ids.',
        ],
        params: { byTotal, col: kind.col },
      }
    }),
  })

  const CHANNELS = ['ach', 'card', 'check', 'wire', 'zelle']
  const pad = (n) => String(n).padStart(2, '0')
  const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate()
  const addMonth = ([y, m], k) => [y + Math.floor((m - 1 + k) / 12), ((m - 1 + k) % 12) + 1]

  T.push({
    key: 'code-pd-pivot-month', section: 'pandas', kind: 'code',
    make: retrying((rand) => {
      const count = rand() < 0.4
      const name = count ? 'monthly_counts' : 'monthly_totals'
      const amount = () => 5 * between(rand, 2, 180)
      const date = ([y, m], d) => `${y}-${pad(m)}-${pad(d)}`
      const month = (s) => s.slice(0, 7)

      const solve = (rows) => {
        const months = [...new Set(rows.map((r) => month(r.date)))].sort()
        const chans = [...new Set(rows.map((r) => r.ch))].sort()
        return months.map((mo) => {
          const rec = { month: mo }
          for (const c of chans) {
            const xs = rows.filter((r) => month(r.date) === mo && r.ch === c).map((r) => r.amt)
            rec[c] = count ? xs.length : F(sum(xs))
          }
          return rec
        })
      }
      const setup = (rows) => frame('df', [['date', rows.map((r) => r.date), 'str'], ['channel', rows.map((r) => r.ch), 'str'], ['amount', rows.map((r) => r.amt), 'float']])
      const row = (ym, d, ch) => ({ date: date(ym, d), ch, amt: amount() })
      const randomRows = (start, nMonths, chans, n) => Array.from({ length: n }, () => {
        const ym = addMonth(start, between(rand, 0, nMonths - 1))
        return row(ym, between(rand, 1, daysIn(...ym)), pick(rand, chans))
      })

      const start = [pick(rand, [2024, 2025, 2026]), between(rand, 1, 12)]
      const chans = sample(rand, CHANNELS, 3)
      const A = randomRows(start, 3, chans, 9)
      const tableA = solve(A)
      const sortedChans = [...chans].sort()
      if (tableA.length !== 3 || Object.keys(tableA[0]).length !== 4) throw new Retry('need every month and channel')
      const gaps = tableA.flatMap((r) => sortedChans.filter((c) => (count ? r[c] : r[c].x) === 0).map((c) => [r.month, c]))
      if (!gaps.length) throw new Retry('need an empty month and channel pair')
      const [gapMonth, gapChan] = pick(rand, gaps)

      const first = addMonth(start, 0)
      const next = addMonth(first, 1)
      const c0 = pick(rand, chans)
      const boundary = [row(first, daysIn(...first), c0), row(next, 1, c0), row(next, between(rand, 2, 28), c0)]
      const dec = [between(rand, 2024, 2026), 12]
      const jan = addMonth(dec, 1)
      const [ca, cb] = sample(rand, chans, 2)
      const yearEnd = [row(jan, between(rand, 1, 31), ca), row(dec, between(rand, 15, 31), cb), row(dec, between(rand, 1, 14), ca)]
      const B = randomRows(addMonth(start, 5), 2, sample(rand, chans, 2), 5)
      const call = `${name}(df)`
      const tests = [
        { name: 'Example rows', setup: setup(A), expr: `${call}.to_dict('records')`, expect: py(tableA) },
        { name: 'Columns: month, then channels alphabetically', setup: setup(A), expr: `list(${call}.columns)`, expect: py(['month', ...sortedChans]) },
        { name: 'A month and channel with no rows is 0', setup: setup(A), expr: `(lambda r: r.loc[r['month'] == '${gapMonth}', '${gapChan}'].tolist())(${call})`, expect: py([count ? 0 : F(0)]) },
        { name: 'Last and first day of a month', setup: setup(boundary), expr: `${call}.to_dict('records')`, expect: py(solve(boundary)) },
        { name: 'December sorts before January', setup: setup(yearEnd), expr: `${call}.to_dict('records')`, expect: py(solve(yearEnd)) },
        { name: 'Index runs 0, 1, 2', setup: setup(B), expr: `(lambda r: (list(r.index), r.to_dict('records')))(${call})`, expect: py(tup(range(0, solve(B).length - 1), solve(B))) },
      ]
      const valueText = count ? 'the **number** of transactions' : 'the **sum** of `amount`'
      return {
        type: 'python', packages: ['pandas'], difficulty: 'Medium', topic: 'pivot tables and dates', title: count ? 'Monthly transaction counts by channel' : 'Monthly totals by channel',
        prompt: [
          `\`df\` has columns \`date\` (strings like \`'2026-03-15'\`), \`channel\` and \`amount\`. Complete \`${name}(df)\`, which returns a table with one row per month and one column per channel, holding ${valueText} for that month and channel.`,
          '',
          "- The first column is `month`, written as strings like `'2026-03'`, in time order. Only months that appear in the data.",
          '- Then one column per channel that appears in the data, in alphabetical order.',
          `- A month and channel with no rows shows ${count ? '0' : '0.0'}, not NaN.`,
          '- The index should run 0, 1, 2, ...',
          '',
          FENCE,
          setup(A),
          `${call}.to_dict('records')`,
          `# ${py(tableA)}`,
          FENCE,
        ],
        starter: starter(PD, name, 'df'),
        solution: [PD, ...fn(name, 'df', [
          '    d = df.copy()',
          '    d["month"] = pd.to_datetime(d["date"]).dt.strftime("%Y-%m")',
          `    out = d.pivot_table(index="month", columns="channel", values="amount", aggfunc="${count ? 'count' : 'sum'}", fill_value=0)`,
          '    out = out.reset_index()',
          '    out.columns.name = None',
          '    return out',
        ])],
        tests,
        approach: [
          'Long rows to a grid of month by channel is a pivot: pivot_table(index=..., columns=..., values=..., aggfunc=...).',
          'Make the month key first. Parse the dates and format them as "%Y-%m"; that string also sorts in time order.',
          'fill_value=0 fills the empty cells; without it they are NaN.',
          'pivot_table puts month in the index, so reset_index turns it back into a column.',
        ],
        walkthrough: [
          '`pd.to_datetime(d["date"]).dt.strftime("%Y-%m")`: 2026-01-31 becomes 2026-01, and 2026-02-01 becomes 2026-02.',
          `\`pivot_table(index="month", columns="channel", values="amount", aggfunc="${count ? 'count' : 'sum'}", fill_value=0)\`: rows and columns come out sorted.`,
          '`out.reset_index()`: month becomes the first column and the index becomes 0, 1, 2.',
          '`out.columns.name = None`: removes the leftover "channel" label above the columns (cosmetic).',
        ],
        mistakes: [
          'Grouping by the full date instead of the month, so every day is its own row.',
          'Forgetting fill_value=0 (or fillna(0)), so empty cells are NaN.',
          `Using aggfunc="${count ? 'sum' : 'count'}" instead of "${count ? 'count' : 'sum'}".`,
          'Taking the month with .dt.month, which merges January 2025 with January 2026.',
          "Leaving month in the index, so to_dict('records') has no month key.",
        ],
        params: { count },
      }
    }),
  })

  const RANK_SCENES = [
    { g: 'branch', id: 'txn_id', v: 'amount', names: ['Albany', 'Back Bay', 'Cambridge', 'Hartford', 'Providence'], step: 50 },
    { g: 'officer', id: 'loan_id', v: 'principal', names: ['Diaz', 'Kim', 'Okafor', 'Patel', 'Wong'], step: 1000 },
  ]

  T.push({
    key: 'code-pd-top-per-group', section: 'pandas', kind: 'code',
    make: retrying((rand) => {
      const s = pick(rand, RANK_SCENES)
      const largest = rand() < 0.6
      const name = `${largest ? 'top' : 'bottom'}_n_per_${s.g}`
      const better = (a, b) => (largest ? a > b : a < b)
      const value = () => s.step * between(rand, 1, 30)
      // k distinct values, best first
      const levels = (k) => {
        const vs = new Set()
        while (vs.size < k) vs.add(value())
        return [...vs].sort((a, b) => (largest ? b - a : a - b))
      }
      const withIds = (rows) => {
        const ids = sample(rand, range(11, 99), rows.length)
        return shuffle(rand, rows).map((r, i) => ({ ...r, id: ids[i] }))
      }
      const solve = (rows, n) => rows.map((r) => ({ ...r, rank: 1 + rows.filter((o) => o.g === r.g && better(o.v, r.v)).length }))
        .filter((r) => r.rank <= n)
        .sort((a, b) => (a.g < b.g ? -1 : a.g > b.g ? 1 : 0) || a.rank - b.rank || a.id - b.id)
        .map((r) => ({ [s.g]: r.g, [s.id]: r.id, [s.v]: F(r.v), rank: r.rank }))
      const setup = (rows) => frame('df', [[s.g, rows.map((r) => r.g), 'str'], [s.id, rows.map((r) => r.id), 'int'], [s.v, rows.map((r) => r.v), 'float']])

      const [g1, g2, g3] = sample(rand, s.names, 3)
      const l1 = levels(3)
      const l2 = levels(3)
      const A = withIds([
        // a tie for first, then worse values
        ...[l1[0], l1[0], l1[1], ...(rand() < 0.5 ? [l1[2]] : [])].map((v) => ({ g: g1, v })),
        // one best, a tie for second, then a worse value
        ...[l2[0], l2[1], l2[1], l2[2]].map((v) => ({ g: g2, v })),
        { g: g3, v: value() },
      ])
      const small = [s.step, 2 * s.step, 3 * s.step, 4 * s.step]
      const B = withIds(sample(rand, s.names, 3).flatMap((g) => Array.from({ length: between(rand, 2, 4) }, () => ({ g, v: pick(rand, small) }))))
      const cols = [s.g, s.id, s.v, 'rank']
      const call = (n) => `${name}(df, ${n})`
      const all = solve(A, 99)
      const tests = [
        { name: 'Example, n = 1 (both rows tied for first stay)', setup: setup(A), expr: `${call(1)}.to_dict('records')`, expect: py(solve(A, 1)) },
        { name: 'A tie uses up the next rank', setup: setup(A), expr: `${call(2)}.to_dict('records')`, expect: py(solve(A, 2)) },
        { name: `n larger than every ${s.g}`, setup: setup(A), expr: `(lambda r: (len(r), r['rank'].tolist()))(${call(10)})`, expect: py(tup(all.length, all.map((r) => r.rank))) },
        { name: 'rank is a whole number column', setup: setup(A), expr: `bool(pd.api.types.is_integer_dtype(${call(1)}['rank']))`, expect: 'True' },
        { name: 'Columns and a fresh index', setup: setup(A), expr: `(lambda r: (list(r.columns), list(r.index)))(${call(1)})`, expect: py(tup(cols, range(0, solve(A, 1).length - 1))) },
        { name: 'A different set of rows, n = 2', setup: setup(B), expr: `${call(2)}.to_dict('records')`, expect: py(solve(B, 2)) },
      ]
      const word = largest ? 'largest' : 'smallest'
      return {
        type: 'python', packages: ['pandas'], difficulty: 'Hard', topic: 'Ranking within groups', title: `${largest ? 'Top' : 'Bottom'} n per ${s.g} with ties`,
        prompt: [
          `\`df\` has columns \`${s.g}\`, \`${s.id}\` and \`${s.v}\`. Complete \`${name}(df, n)\`, which ranks rows **within each ${s.g}** by \`${s.v}\` (${word} gets rank 1) and keeps the rows with rank at most \`n\`.`,
          '',
          `- Ties share a rank, and the next rank skips ahead (values ${largest ? '900, 900, 700' : '100, 100, 300'} get ranks 1, 1, 3). This is SQL's RANK().`,
          `- Return the columns \`${s.g}\`, \`${s.id}\`, \`${s.v}\` and \`rank\`, with \`rank\` as whole numbers.`,
          `- Sort by \`${s.g}\` (alphabetical), then \`rank\`, then \`${s.id}\` (smallest first). The index should run 0, 1, 2, ...`,
          '',
          FENCE,
          setup(A),
          `${call(1)}.to_dict('records')`,
          `# ${py(solve(A, 1))}`,
          FENCE,
        ],
        starter: starter(PD, name, 'df, n'),
        solution: [PD, ...fn(name, 'df, n', [
          '    d = df.copy()',
          `    d["rank"] = d.groupby("${s.g}")["${s.v}"].rank(method="min", ascending=${largest ? 'False' : 'True'}).astype(int)`,
          '    out = d[d["rank"] <= n]',
          `    out = out.sort_values(["${s.g}", "rank", "${s.id}"])`,
          `    return out[["${s.g}", "${s.id}", "${s.v}", "rank"]].reset_index(drop=True)`,
        ])],
        tests,
        approach: [
          'Top n per group with ties is a ranking question, not a head(n) question: head and nlargest cut ties off.',
          'groupby(...)[col].rank(...) ranks inside each group and returns a Series lined up with the original rows.',
          'method="min" gives tied rows the same rank and skips the next ones, like RANK() in SQL. method="dense" would not skip; method="first" would break ties by position.',
          'rank returns floats, so convert with astype(int), then filter, sort and reset the index.',
        ],
        walkthrough: [
          "`d = df.copy()`: adding a column to the caller's DataFrame would change their data.",
          `\`d.groupby("${s.g}")["${s.v}"].rank(method="min", ascending=${largest ? 'False' : 'True'})\`: ${word} first, ties share the lowest rank.`,
          '`.astype(int)`: 1.0 becomes 1.',
          '`d[d["rank"] <= n]`: keeps every tied row at the cutoff rank.',
          `\`sort_values(["${s.g}", "rank", "${s.id}"])\`: all ascending, so one list is enough.`,
        ],
        mistakes: [
          `sort_values then groupby(...).head(n), which keeps exactly n rows per ${s.g} and drops a row tied with the last one kept.`,
          'method="dense": after a tie for first the next value gets rank 2 instead of 3, so n = 2 keeps one row too many.',
          largest ? 'Leaving out ascending=False, so the smallest value gets rank 1.' : 'Passing ascending=False, so the largest value gets rank 1.',
          'Leaving rank as floats (1.0), which fails the whole number requirement.',
        ],
        params: { scene: s.g, largest },
      }
    }),
  })

  // ===================================================================== NumPy

  const MASK_RULES = [
    { key: 'ge', words: 'at least `cutoff`', ok: (x, c) => x >= c, py: 'a >= cutoff', wrong: 'Using > instead of >=, which drops amounts exactly at the cutoff.' },
    { key: 'gt', words: 'more than `cutoff`', ok: (x, c) => x > c, py: 'a > cutoff', wrong: 'Using >= instead of >, which keeps amounts exactly at the cutoff.' },
    { key: 'le', words: 'at most `cutoff`', ok: (x, c) => x <= c, py: 'a <= cutoff', wrong: 'Using < instead of <=, which drops amounts exactly at the cutoff.' },
    { key: 'lt', words: 'less than `cutoff`', ok: (x, c) => x < c, py: 'a < cutoff', wrong: 'Using <= instead of <, which keeps amounts exactly at the cutoff.' },
    { key: 'abs', words: 'at least `cutoff` in size, either sign (refunds are negative)', ok: (x, c) => Math.abs(x) >= c, py: 'np.abs(a) >= cutoff', wrong: 'Comparing a >= cutoff without np.abs, which misses large refunds.' },
  ]

  T.push({
    key: 'code-np-mask', section: 'numpy', kind: 'code',
    make: retrying((rand) => {
      const rule = pick(rand, MASK_RULES)
      const name = 'flag_amounts'
      const amt = () => (rand() < 0.25 ? -1 : 1) * (between(rand, 1, 400) * 5 + pick(rand, [0, 0, 0.5, 0.25]))
      const solve = (xs, c) => xs.filter((x) => rule.ok(x, c))
      const arr = (xs) => `np.array(${py(floats(xs))})`
      const c = 25 * between(rand, 8, 60)
      const A = shuffle(rand, [c, rule.key === 'abs' ? -c : c + 25, ...Array.from({ length: 5 }, amt)])
      const edges = rule.key === 'abs' ? [-c, -(c - 0.5), c - 0.5, c, c + 0.5] : [c - 0.5, c, c + 0.5]
      const nothing = rule.key === 'abs' ? [c - 1, -(c - 1), 0.5, -0.5] : rule.key[0] === 'g' ? [c - 1, c - 100, -c] : [c + 1, c + 100, 2 * c]
      const listIn = Array.from({ length: 5 }, amt)
      const cL = Math.abs(pick(rand, listIn))
      const B = Array.from({ length: 6 }, amt)
      const cB = Math.abs(pick(rand, B))
      if (!solve(A, c).length || !solve(B, cB).length || solve(B, cB).length === B.length) throw new Retry('want a partial match')
      if (solve(nothing, c).length) throw new Error('the nothing-matches case matched')
      const tests = [
        { name: 'Example amounts', setup: `a = ${arr(A)}`, expr: `${name}(a, ${c}).tolist()`, expect: py(floats(solve(A, c))) },
        { name: 'Right at the cutoff', setup: `a = ${arr(edges)}`, expr: `${name}(a, ${c}).tolist()`, expect: py(floats(solve(edges, c))) },
        { name: 'Nothing matches', setup: `a = ${arr(nothing)}`, expr: `${name}(a, ${c}).tolist()`, expect: '[]' },
        { name: 'A plain list works too', setup: `a = ${py(floats(listIn))}`, expr: `${name}(a, ${cL}).tolist()`, expect: py(floats(solve(listIn, cL))) },
        { name: 'The input is not changed', setup: `a = ${arr(A)}; r = ${name}(a, ${c})`, expr: '(a.tolist(), r.tolist())', expect: py(tup(floats(A), floats(solve(A, c)))) },
        { name: 'Count and total of the flagged amounts', setup: `a = ${arr(B)}`, expr: `(lambda r: (int(r.size), round(float(r.sum()), 2)))(${name}(a, ${cB}))`, expect: py(tup(solve(B, cB).length, F(r2(sum(solve(B, cB)))))) },
      ]
      return {
        type: 'python', packages: ['numpy'], difficulty: 'Easy', topic: 'Boolean masks', title: 'Flag amounts with a mask',
        prompt: [
          `\`amounts\` holds transaction amounts (a NumPy array or a plain list). Complete \`${name}(amounts, cutoff)\`, which returns a NumPy array of the amounts that are **${rule.words}**, in their original order. Use a boolean mask, not a loop, and don't change the input.`,
          '',
          FENCE,
          `a = ${arr(A)}`,
          `${name}(a, ${c}).tolist()`,
          `# ${py(floats(solve(A, c)))}`,
          FENCE,
        ],
        starter: starter(NP, name, 'amounts, cutoff'),
        solution: [NP, ...fn(name, 'amounts, cutoff', [
          '    a = np.asarray(amounts, dtype=float)',
          `    return a[${rule.py}]`,
        ])],
        tests,
        approach: [
          'A comparison on an array gives an array of True and False, one per element: the mask.',
          'Indexing with the mask, a[mask], keeps the True positions in order and returns a new array.',
          'Call np.asarray first, so a plain list works too (comparing a list with a number raises TypeError).',
        ],
        walkthrough: [
          '`a = np.asarray(amounts, dtype=float)`: converts a list; an existing float array is used as is.',
          `\`${rule.py}\`: the mask, computed for every element at once.`,
          `\`a[${rule.py}]\`: keeps the matching amounts; an all-False mask gives an empty array, not an error.`,
        ],
        mistakes: [
          rule.wrong,
          'Returning the mask itself (True and False values) instead of the selected amounts.',
          "Zeroing out the rest in place (a[~mask] = 0), which changes the caller's array and returns the wrong length.",
          'A Python loop with append, which works but is exactly what the question asks you to avoid.',
        ],
        params: { rule: rule.key },
      }
    }),
  })

  const AXIS_AGGS = [
    { fn: 'sum', calc: (xs) => sum(xs), title: { row: 'Total spend per customer', col: 'Total spend per month' }, text: { row: 'total spend of each customer', col: 'total spend in each month' } },
    { fn: 'mean', calc: (xs) => sum(xs) / xs.length, title: { row: 'Average spend per customer', col: 'Average spend per month' }, text: { row: 'average monthly spend of each customer', col: 'average spend per customer in each month' } },
    { fn: 'max', calc: (xs) => Math.max(...xs), title: { row: 'Largest monthly spend per customer', col: 'Largest spend in each month' }, text: { row: 'largest monthly spend of each customer', col: 'largest single customer spend in each month' } },
    { fn: 'argmax', calc: (xs) => xs.indexOf(Math.max(...xs)), title: { row: 'Peak month per customer', col: 'Top customer per month' }, text: { row: 'index of the month in which each customer spent the most (the earliest month on a tie)', col: 'index of the customer who spent the most in each month (the lowest index on a tie)' } },
  ]

  T.push({
    key: 'code-np-axis', section: 'numpy', kind: 'code',
    make: retrying((rand) => {
      const agg = pick(rand, AXIS_AGGS)
      const byRow = rand() < 0.5
      const name = byRow ? 'per_customer' : 'per_month'
      const axis = byRow ? 1 : 0
      const slices = (M) => (byRow ? M : M[0].map((_, j) => M.map((r) => r[j])))
      const solve = (M) => slices(M).map((xs) => { const v = agg.calc(xs); return agg.fn === 'argmax' ? v : F(r2(v)) })
      const mat = (M) => `S = np.array(${py(floats(M))})`
      const cell = () => 10 * between(rand, 0, 40)
      const grid = (r, c, f = cell) => Array.from({ length: r }, () => Array.from({ length: c }, f))
      const A = grid(3, 4)
      const ties = grid(3, 4, () => pick(rand, [0, 20, 50]))
      ties[0] = [0, 0, 0, 0]
      const oneRow = grid(1, 4)
      const oneCol = grid(3, 1)
      const refunds = grid(3, 3, () => 10 * between(rand, -20, 30))
      refunds[1] = refunds[1].map((x) => -Math.abs(x) - 10)
      const shape = grid(2, 5)
      const call = `np.round(${name}(S), 2).tolist()`
      const tests = [
        { name: 'Example matrix', setup: mat(A), expr: call, expect: py(solve(A)) },
        { name: 'Ties and a customer with no spend', setup: mat(ties), expr: call, expect: py(solve(ties)) },
        { name: 'One customer', setup: mat(oneRow), expr: call, expect: py(solve(oneRow)) },
        { name: 'One month', setup: mat(oneCol), expr: call, expect: py(solve(oneCol)) },
        { name: 'Refunds are negative', setup: mat(refunds), expr: call, expect: py(solve(refunds)) },
        { name: `One value per ${byRow ? 'customer' : 'month'}`, setup: mat(shape), expr: `tuple(int(d) for d in ${name}(S).shape)`, expect: py(tup(byRow ? 2 : 5)) },
      ]
      const per = byRow ? 'customer' : 'month'
      return {
        type: 'python', packages: ['numpy'], difficulty: 'Easy', topic: 'Aggregation by axis', title: agg.title[byRow ? 'row' : 'col'],
        prompt: [
          '`S` is a 2-D NumPy array of card spend: row `i` is a customer, column `j` is a month.',
          '',
          `Complete \`${name}(S)\`, which returns a 1-D NumPy array with the **${agg.text[byRow ? 'row' : 'col']}**, one value per ${byRow ? 'customer (row)' : 'month (column)'}. Use one NumPy call with the right axis, not a loop.${agg.fn === 'mean' ? ' The tests round to 2 decimals.' : ''}`,
          '',
          FENCE,
          mat(A),
          call,
          `# ${py(solve(A))}`,
          FENCE,
        ],
        starter: starter(NP, name, 'S'),
        solution: [NP, ...fn(name, 'S', [
          '    S = np.asarray(S, dtype=float)',
          `    return S.${agg.fn}(axis=${axis})`,
        ])],
        tests,
        approach: [
          'The axis you pass is the one that disappears: axis=0 collapses the rows (one answer per column), axis=1 collapses the columns (one answer per row).',
          `One value per ${per} means one per ${byRow ? 'row, so axis=1' : 'column, so axis=0'}.`,
          ...(agg.fn === 'argmax' ? ['argmax returns the first index of the maximum, which is exactly the tie rule asked for.'] : []),
          'Check the shape of your answer against the number of rows or columns.',
        ],
        walkthrough: [
          '`np.asarray(S, dtype=float)`: works for lists and integer arrays too.',
          `\`S.${agg.fn}(axis=${axis})\`: ${agg.fn} along axis ${axis}, leaving shape (${byRow ? 'n_customers' : 'n_months'},).`,
        ],
        mistakes: [
          `Using axis=${1 - axis}, which gives one value per ${byRow ? 'month' : 'customer'} instead.`,
          `Leaving out axis, which ${agg.fn === 'argmax' ? 'returns one index into the flattened array' : 'returns a single number for the whole matrix'}.`,
          ...(agg.fn === 'argmax' ? ['Using max instead of argmax, which returns the amount rather than its position.'] : []),
          ...(agg.fn === 'mean' ? ['Dividing the sum by the wrong dimension (S.shape[0] instead of S.shape[1], or the reverse).'] : []),
          'Looping over rows in Python and building a list.',
        ],
        params: { agg: agg.fn, axis },
      }
    }),
  })

  T.push({
    key: 'code-np-where', section: 'numpy', kind: 'code',
    make: retrying((rand) => {
      const fee = pick(rand, [25, 30, 35])
      const lowTier = rand() < 0.6
      const low = pick(rand, [100, 250, 500])
      const small = pick(rand, [5, 10, 12])
      const level = pick(rand, [2500, 5000, 10000])
      const inclusive = rand() < 0.5
      const rate = pick(rand, [0.005, 0.01, 0.015, 0.02])
      const name = 'month_end'
      const rich = (b) => (inclusive ? b >= level : b > level)
      const one = (b) => r2(b < 0 ? b - fee : lowTier && b < low ? b - small : rich(b) ? b * (1 + rate) : b)
      const solve = (v) => (Array.isArray(v) ? v.map(solve) : F(one(v)))
      const cents = (lo, hi) => between(rand, Math.round(lo * 100), Math.round(hi * 100)) / 100
      const bal = () => pick(rand, [cents(-500, -0.01), cents(0, low - 0.01), cents(low, level - 1), cents(level, 3 * level)])
      const arr = (v) => `b = np.array(${py(floats(v))})`
      const A = shuffle(rand, [cents(-500, -1), cents(0, low - 1), cents(low, level - 1), cents(level + 1, 2 * level), level, bal()])
      const edges = [-0.01, 0, ...(lowTier ? [low - 0.01, low] : []), level - 0.01, level, level + 0.01]
      const negatives = [-0.01, -fee, -cents(1, 999)]
      const ints = [between(rand, -300, -1), between(rand, 0, low - 1), between(rand, level, 2 * level), between(rand, low, level - 1)]
      const twoD = [[bal(), bal()], [bal(), bal()]]
      const B = [bal(), bal(), bal()]
      const call = `np.round(${name}(b), 2).tolist()`
      const tests = [
        { name: 'Example balances', setup: arr(A), expr: call, expect: py(solve(A)) },
        { name: 'Every boundary', setup: arr(edges), expr: call, expect: py(solve(edges)) },
        { name: 'Overdrawn accounts', setup: arr(negatives), expr: call, expect: py(solve(negatives)) },
        { name: 'Whole dollar input', setup: `b = np.array(${py(ints)})`, expr: call, expect: py(solve(ints)) },
        { name: 'A 2-D array keeps its shape', setup: arr(twoD), expr: call, expect: py(solve(twoD)) },
        { name: 'The input is not changed', setup: `${arr(B)}; r = ${name}(b)`, expr: '(b.tolist(), np.round(r, 2).tolist())', expect: py(tup(floats(B), solve(B))) },
      ]
      const richText = `${inclusive ? 'at least' : 'more than'} ${level}`
      const rules = [
        `- Below 0 (overdrawn): subtract an overdraft fee of ${fee}.`,
        ...(lowTier ? [`- From 0 up to but not including ${low}: subtract a low balance fee of ${small}.`] : []),
        `- ${richText[0].toUpperCase()}${richText.slice(1)}: add interest at ${+(rate * 100).toFixed(2)}%, so the balance becomes balance * ${1 + rate}.`,
        '- Anything else stays the same.',
      ]
      const pyRich = `b ${inclusive ? '>=' : '>'} ${level}`
      const nested = lowTier
        ? `np.where(b < 0, b - ${fee}, np.where(b < ${low}, b - ${small}, np.where(${pyRich}, b * (1 + ${rate}), b)))`
        : `np.where(b < 0, b - ${fee}, np.where(${pyRich}, b * (1 + ${rate}), b))`
      return {
        type: 'python', packages: ['numpy'], difficulty: 'Medium', topic: 'np.where', title: 'Month end fees and interest',
        prompt: [
          `\`balances\` is a NumPy array of account balances (any shape). Complete \`${name}(balances)\`, which returns a float array of the same shape after month end processing. Each balance gets exactly one rule, checked in this order:`,
          '',
          ...rules,
          '',
          "Don't loop and don't change the input. The tests round to 2 decimals.",
          '',
          FENCE,
          arr(A),
          call,
          `# ${py(solve(A))}`,
          FENCE,
        ],
        starter: starter(NP, name, 'balances'),
        solution: [NP, ...fn(name, 'balances', [
          '    b = np.asarray(balances, dtype=float)',
          `    return ${nested}`,
        ])],
        tests,
        approach: [
          'An if/elif chain applied to every element is np.where(condition, value_if_true, value_if_false), nested once per extra rule.',
          'The first rule goes in the outer np.where; each inner one only decides the elements the outer conditions left over.',
          `Read every boundary: 0 is not overdrawn, and "${richText}" is ${inclusive ? '>=' : '>'}.`,
          'np.where builds a new array, so the input stays as it was.',
        ],
        walkthrough: [
          '`b = np.asarray(balances, dtype=float)`: integer input becomes float, so fees and interest are not truncated.',
          `\`np.where(b < 0, b - ${fee}, ...)\`: overdrawn balances take the fee; everything else goes to the next test.`,
          ...(lowTier ? [`\`np.where(b < ${low}, b - ${small}, ...)\`: only balances of 0 or more get here, so this means 0 up to ${low}.`] : []),
          `\`np.where(${pyRich}, b * (1 + ${rate}), b)\`: interest for large balances, unchanged otherwise.`,
        ],
        mistakes: [
          'Writing `if b < 0:` on an array, which raises "truth value of an array is ambiguous".',
          `Checking the interest rule ${inclusive ? 'with > instead of >=' : 'with >= instead of >'}, which gets a balance of exactly ${level} wrong.`,
          "Updating in place with b[b < 0] -= fee, which changes the caller's data, and the next mask then sees the changed values.",
          'Putting the rules in a different order than listed, so a balance can match two of them.',
        ],
        params: { fee, lowTier, low, small, level, inclusive, rate },
      }
    }),
  })

  const SCALERS = [
    {
      key: 'zscore', name: 'standardize', title: 'Standardize each feature',
      text: 'standardize each **column**: subtract the column mean and divide by the column standard deviation (population, ddof=0). A column with zero standard deviation becomes all 0.0.',
      zero: 'A column with no spread',
      calc: (X) => {
        const cols = X[0].map((_, j) => X.map((r) => r[j]))
        const stats = cols.map((c) => { const m = sum(c) / c.length; return [m, Math.sqrt(sum(c.map((x) => (x - m) ** 2)) / c.length)] })
        return X.map((r) => r.map((x, j) => (stats[j][1] === 0 ? 0 : (x - stats[j][0]) / stats[j][1])))
      },
      body: ['    mu = X.mean(axis=0)', '    sd = X.std(axis=0)', '    safe = np.where(sd == 0, 1.0, sd)', '    return np.where(sd == 0, 0.0, (X - mu) / safe)'],
      walk: [
        '`mu = X.mean(axis=0)`: one mean per column, shape (n_cols,).',
        '`sd = X.std(axis=0)`: population standard deviation per column (NumPy uses ddof=0 by default).',
        '`(X - mu) / safe`: (n_rows, n_cols) against (n_cols,) broadcasts the column stats down every row.',
        '`np.where(sd == 0, 0.0, ...)`: zero-spread columns become 0.0 instead of NaN, and the safe divisor avoids a divide-by-zero warning.',
      ],
      mistakes: ['Using axis=1, which standardizes each customer instead of each feature.', 'Using ddof=1 (sample standard deviation) when the question says population.', 'Dividing by a zero standard deviation and returning NaN.'],
      fixture: (X) => X.map((r) => [r[0], 7, r[2]]),
    },
    {
      key: 'demean', name: 'vs_customer_average', title: "Spend against each customer's average",
      text: "subtract each **row's** mean from that row, so every value says how far that month is above or below the customer's own average.",
      zero: 'A customer who spends the same every month',
      calc: (X) => X.map((r) => { const m = sum(r) / r.length; return r.map((x) => x - m) }),
      body: ['    return X - X.mean(axis=1, keepdims=True)'],
      walk: [
        '`X.mean(axis=1, keepdims=True)`: one mean per row, kept as shape (n_rows, 1).',
        '`X - X.mean(axis=1, keepdims=True)`: (n_rows, n_cols) minus (n_rows, 1) stretches each row mean across its row.',
      ],
      mistakes: ['X - X.mean(axis=1) without keepdims: shape (n_rows,) lines up with the columns, so it fails or subtracts the wrong means.', 'Using axis=0, which subtracts column means instead.', 'Looping over rows in Python.'],
      fixture: (X) => [[9, 9, 9], ...X.slice(1)],
    },
    {
      key: 'share', name: 'column_shares', title: 'Share of each column total',
      text: 'divide every value by its **column** total, so each column adds up to 1. A column that adds up to 0 becomes all 0.0.',
      zero: 'A column that adds up to 0',
      calc: (X) => {
        const tot = X[0].map((_, j) => sum(X.map((r) => r[j])))
        return X.map((r) => r.map((x, j) => (tot[j] === 0 ? 0 : x / tot[j])))
      },
      body: ['    total = X.sum(axis=0)', '    safe = np.where(total == 0, 1.0, total)', '    return np.where(total == 0, 0.0, X / safe)'],
      walk: [
        '`total = X.sum(axis=0)`: one total per column, shape (n_cols,).',
        '`X / safe`: broadcasts the column totals down every row.',
        '`np.where(total == 0, 0.0, ...)`: an all-zero column becomes 0.0 instead of NaN.',
      ],
      mistakes: ['Dividing by X.sum() (the grand total), so columns no longer add up to 1.', 'Using row totals (axis=1) instead of column totals.', 'Letting 0 / 0 produce NaN for an empty column.'],
      fixture: (X) => X.map((r) => [r[0], 0, r[2]]),
    },
    {
      key: 'minmax', name: 'minmax_scale', title: 'Min-max scale each feature',
      text: 'rescale each **column** to run from 0 to 1: (value - column min) / (column max - column min). A column whose max equals its min becomes all 0.0.',
      zero: 'A column with no spread',
      calc: (X) => {
        const cols = X[0].map((_, j) => X.map((r) => r[j]))
        const lo = cols.map((c) => Math.min(...c))
        const span = cols.map((c, j) => Math.max(...c) - lo[j])
        return X.map((r) => r.map((x, j) => (span[j] === 0 ? 0 : (x - lo[j]) / span[j])))
      },
      body: ['    lo = X.min(axis=0)', '    span = X.max(axis=0) - lo', '    safe = np.where(span == 0, 1.0, span)', '    return np.where(span == 0, 0.0, (X - lo) / safe)'],
      walk: [
        '`lo = X.min(axis=0)`: per column minimum, shape (n_cols,).',
        '`span = X.max(axis=0) - lo`: per column range.',
        '`(X - lo) / safe`: broadcasts the column stats down every row.',
        '`np.where(span == 0, 0.0, ...)`: constant columns become 0.0 instead of NaN.',
      ],
      mistakes: ['Using the min and max of the whole matrix instead of each column.', 'Using axis=1, which scales each customer instead of each feature.', 'Dividing by a zero range and returning NaN.'],
      fixture: (X) => X.map((r) => [r[0], 4, r[2]]),
    },
  ]

  T.push({
    key: 'code-np-broadcast', section: 'numpy', kind: 'code',
    make: retrying((rand) => {
      const sc = pick(rand, SCALERS)
      const name = sc.name
      const solve = (X) => sc.calc(X).map((r) => r.map((x) => F(r4(x))))
      const cell = () => between(rand, 1, 40)
      const grid = (r, c) => Array.from({ length: r }, () => Array.from({ length: c }, cell))
      const mat = (X) => `X = np.array(${py(floats(X))})`
      const A = grid(4, 3)
      const flat = sc.fixture(grid(4, 3))
      const C = grid(3, 3)
      const ints = grid(3, 2)
      const B = grid(5, 2)
      const single = grid(1, 3)
      // Every column of the main examples has a real spread
      for (const X of [A, B, C]) for (let j = 0; j < X[0].length; j++) if (new Set(X.map((r) => r[j])).size < 2) throw new Retry('flat column')
      const call = `np.round(${name}(X), 4).tolist()`
      const tests = [
        { name: 'Example matrix', setup: mat(A), expr: call, expect: py(solve(A)) },
        { name: sc.zero, setup: mat(flat), expr: call, expect: py(solve(flat)) },
        { name: 'Shape kept and input unchanged', setup: `${mat(C)}; Z = ${name}(X)`, expr: '(tuple(int(d) for d in Z.shape), X.tolist())', expect: py(tup(tup(3, 3), floats(C))) },
        { name: 'Integer input', setup: `X = np.array(${py(ints)})`, expr: call, expect: py(solve(ints)) },
        { name: 'A taller matrix', setup: mat(B), expr: call, expect: py(solve(B)) },
        { name: 'A single row', setup: mat(single), expr: call, expect: py(solve(single)) },
      ]
      return {
        type: 'python', packages: ['numpy'], difficulty: 'Medium', topic: 'Broadcasting', title: sc.title,
        prompt: [
          '`X` is a 2-D NumPy array: each row is a customer and each column is a feature (monthly spend, balance, number of transactions, and so on).',
          '',
          `Complete \`${name}(X)\`, which returns a new float array of the same shape. It should ${sc.text}`,
          '',
          'Use broadcasting, not a loop, and leave `X` unchanged. The tests round to 4 decimals.',
          '',
          FENCE,
          mat(A),
          call,
          `# ${py(solve(A))}`,
          FENCE,
        ],
        starter: starter(NP, name, 'X'),
        solution: [NP, ...fn(name, 'X', ['    X = np.asarray(X, dtype=float)', ...sc.body])],
        tests,
        approach: [
          'Compute the statistic along the right axis: axis=0 for one value per column, axis=1 for one value per row.',
          'Broadcasting lines shapes up from the right: (n_rows, n_cols) works with (n_cols,) or with (n_rows, 1), and NumPy stretches the smaller one.',
          'Per column stats already have shape (n_cols,). Per row stats need keepdims=True (or [:, None]) to become (n_rows, 1).',
          'Handle any division by zero explicitly with np.where.',
        ],
        walkthrough: ["`X = np.asarray(X, dtype=float)`: integer input becomes float, and the caller's array is never written to.", ...sc.walk],
        mistakes: sc.mistakes,
        params: { scaler: sc.key },
      }
    }),
  })

  T.push({
    key: 'code-np-growth', section: 'numpy', kind: 'code',
    make: retrying((rand) => {
      const atStart = rand() < 0.5
      const name = 'balance_path'
      const path = (P, rates, D) => {
        let b = P
        return rates.map((r) => {
          b = atStart ? (b + D) * (1 + r) : b * (1 + r) + D
          return F(r2(b))
        })
      }
      const rate = () => pick(rand, [0, 0.0025, 0.005, 0.01, 0.0125, 0.015, 0.02])
      const P = pick(rand, [500, 1000, 2000, 2500, 5000])
      const D = pick(rand, [50, 100, 150, 200, 250])
      const ratesA = Array.from({ length: 4 }, rate)
      if (ratesA.every((r) => r === 0)) throw new Retry('want some interest')
      const ratesB = Array.from({ length: 3 }, rate)
      const loss = [rate(), -pick(rand, [0.01, 0.02, 0.03]), rate()]
      const year = pick(rand, [0.004, 0.005, 0.0075])
      const P2 = pick(rand, [1000, 3000, 10000])
      const D2 = pick(rand, [0, 100, 300])
      const zeros = [0, 0, 0]
      const call = (p, rs, d) => `np.round(${name}(${p}, ${py(floats(rs))}, ${d}), 2).tolist()`
      const yearEnd = path(P2, Array(12).fill(year), D2)
      const tests = [
        { name: 'Example months', setup: '', expr: call(P, ratesA, D), expect: py(path(P, ratesA, D)) },
        { name: 'No deposits: plain compounding', setup: '', expr: call(P, ratesB, 0), expect: py(path(P, ratesB, 0)) },
        { name: 'Zero interest just adds deposits', setup: '', expr: call(P, zeros, D), expect: py(path(P, zeros, D)) },
        { name: 'No months', setup: '', expr: call(P, [], D), expect: '[]' },
        { name: 'A month with a loss', setup: '', expr: call(P, loss, D), expect: py(path(P, loss, D)) },
        { name: 'A full year', setup: `rates = np.full(12, ${year})`, expr: `(lambda r: (int(r.size), round(float(r[-1]), 2)))(${name}(${P2}, rates, ${D2}))`, expect: py(tup(12, yearEnd[11])) },
      ]
      const ex = [1000, [0.01, 0.02], 100]
      const order = atStart ? "first add the deposit, then apply that month's rate to the result" : "first apply that month's rate, then add the deposit"
      const inner = atStart ? '(1 + r) / growth' : '1 / growth'
      return {
        type: 'python', packages: ['numpy'], difficulty: 'Hard', topic: 'Vectorizing loops', title: 'Savings balance with monthly deposits',
        prompt: [
          `A savings account starts at \`principal\`. Every month you deposit \`deposit\` and the account earns that month's rate from \`rates\` (0.01 means 1%, and a rate can be negative). Within a month, ${order}.`,
          '',
          `Complete \`${name}(principal, rates, deposit)\`, which returns a NumPy array with the balance at the end of each month (one value per rate, and an empty array if there are no rates). Use cumprod and cumsum instead of a Python loop. The tests round to 2 decimals.`,
          '',
          FENCE,
          `np.round(${name}(${ex[0]}, ${py(ex[1])}, ${ex[2]}), 2).tolist()`,
          `# ${py(path(...ex))}`,
          FENCE,
        ],
        starter: starter(NP, name, 'principal, rates, deposit'),
        solution: [NP, ...fn(name, 'principal, rates, deposit', [
          '    r = np.asarray(rates, dtype=float)',
          '    growth = np.cumprod(1 + r)',
          `    return growth * (principal + deposit * np.cumsum(${inner}))`,
        ])],
        tests,
        approach: [
          `Write the loop first: b = ${atStart ? '(b + deposit) * (1 + r)' : 'b * (1 + r) + deposit'}. It is correct, just not vectorized.`,
          'growth = cumprod(1 + r) is what 1 dollar held from the start has grown to by each month end, so principal * growth handles the starting balance.',
          `Each deposit grows only from the month it arrives: a deposit in month s is worth growth[t] / growth[${atStart ? 's - 1' : 's'}] at month t. Factor out growth[t] and the rest is a running sum: cumsum(${inner}).`,
          'cumprod and cumsum of an empty array are empty, so no months needs no special case.',
        ],
        walkthrough: [
          '`r = np.asarray(rates, dtype=float)`: lists and arrays both work.',
          '`growth = np.cumprod(1 + r)`: the running product, for example [1.01, 1.0302] for rates [0.01, 0.02].',
          `\`np.cumsum(${inner})\`: ${atStart ? 'a deposit made at the start of month s also earns month s, which is what the (1 + r) on top adds' : 'a deposit made at the end of month s has earned nothing yet, so at month s it is worth exactly 1 dollar per dollar'}.`,
          '`growth * (principal + deposit * ...)`: the starting balance and every deposit, each grown to every month end.',
        ],
        mistakes: [
          atStart ? 'Adding the deposit after the interest, so each deposit misses one month of growth.' : 'Adding the deposit before the interest, so each deposit earns one month too many.',
          'principal * cumprod(1 + r) + deposit * np.arange(1, n + 1), which forgets that deposits earn interest too.',
          'np.prod instead of np.cumprod, which gives only the final growth factor.',
          'Computing (1 + r) ** t with a single rate, when every month can have a different rate.',
        ],
        params: { atStart, P, D },
      }
    }),
  })
})()
