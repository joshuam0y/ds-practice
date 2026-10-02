'use strict'
// Templates for endless coding questions: Python in HackerRank's stdin/stdout format, and SQL queries with fresh
// sample tables. Each template computes the expected output here in JavaScript AND ships a reference solution in
// Python or SQL; verify.py builds hundreds of each and checks that the two always agree.
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
  const lines = (s) => s.split('\n')
  const HEADER = '#!/bin/python3\n\nimport math\nimport os\nimport random\nimport re\nimport sys\n\n'

  // HackerRank file layout: header, comment block, the function (stub or solved), then the main block
  function hr(comment, signature, main, body) {
    return lines(`${HEADER}${comment}\n${`def ${signature}:\n${body || '    # Write your code here\n'}`}\n${main}`)
  }
  const stdin = (...rows) => `${rows.flat().join('\n')}\n`
  const out = (rows) => (rows.length ? `${rows.join('\n')}\n` : '')

  // ===================================================================== Python

  T.push({
    key: 'code-py-alerts', section: 'python', kind: 'code',
    make(rand) {
      const T0 = pick(rand, [1000, 2000, 2500, 5000, 10000])
      const M = pick(rand, [100, 500, 1000].filter((m) => T0 % m === 0 && m < T0))
      const [neg, special, large, normal] = [pick(rand, ['REFUND', 'REVERSAL', 'CREDIT']), pick(rand, ['REVIEW', 'FRAUD CHECK', 'HOLD']),
        pick(rand, ['LARGE', 'HIGH', 'BIG']), pick(rand, ['OK', 'NORMAL', 'CLEAR'])]
      const label = (a) => (a < 0 ? neg : a >= T0 && a % M === 0 ? special : a >= T0 ? large : normal)
      const rnd = () => pick(rand, [between(rand, 1, T0 - 1), between(rand, T0, 3 * T0), -between(rand, 1, 2 * T0), 0, T0 + M * between(rand, 0, 3)])
      const cases = [
        ['Sample case 0', [between(rand, 1, T0 - 1), T0, T0 + between(rand, 1, M - 1), -between(rand, 1, 500), 0]],
        ['Just around the threshold', [T0 - 1, T0, T0 + 1, T0 + M]],
        ['No transactions', []],
        ['Negative multiples are still negative', [-T0, -M, -1]],
        ['Several large amounts', [2 * T0, 2 * T0 + 1, 3 * T0 + M]],
        ['Random mix', Array.from({ length: 6 }, rnd)],
      ]
      const main = "if __name__ == '__main__':\n    amounts_count = int(input().strip())\n\n    amounts = []\n\n    for _ in range(amounts_count):\n        amounts_item = int(input().strip())\n        amounts.append(amounts_item)\n\n    transactionAlerts(amounts)\n"
      const body = `    for amount in amounts:\n        if amount < 0:\n            print('${neg}')\n        elif amount >= ${T0} and amount % ${M} == 0:\n            print('${special}')\n        elif amount >= ${T0}:\n            print('${large}')\n        else:\n            print('${normal}')\n`
      return {
        type: 'python', difficulty: 'Easy', topic: 'Conditionals and printed output (HackerRank style)', title: 'Transaction alerts',
        prompt: lines(`For each transaction amount (whole dollars), in order, print one line:\n\n- \`${neg}\` if the amount is negative\n- \`${special}\` if the amount is at least ${T0} and is a multiple of ${M}\n- \`${large}\` if the amount is at least ${T0} otherwise\n- \`${normal}\` for everything else, including 0\n\nComplete \`transactionAlerts\`. It prints; it returns nothing. If there are no transactions, print nothing.\n\n**Input format:** n, then n amounts, one per line. The input code is already written.`),
        starter: hr("#\n# Complete the 'transactionAlerts' function below.\n#\n# The function accepts INTEGER_ARRAY amounts as parameter.\n#\n", 'transactionAlerts(amounts)', main),
        solution: hr('', 'transactionAlerts(amounts)', main, body),
        tests: cases.map(([name, xs]) => ({ name, stdin: stdin(String(xs.length), xs.map(String)), stdout: out(xs.map(label)) })),
        approach: [
          'An if/elif chain where order matters: put the most specific rule first.',
          `Negative amounts first (so ${-T0} isn't treated as a multiple of ${M}), then the special large case, then the general large case, then everything else.`,
          `Read the boundaries: "at least ${T0}" is >= ${T0}.`,
          'Print exactly the words asked for, one per line. HackerRank compares output line by line.',
        ],
        walkthrough: [
          '`for amount in amounts:`: one line of output per amount, in input order.',
          `\`if amount < 0:\`: the sign check comes first, because ${-T0} % ${M} == 0 in Python too.`,
          `\`elif amount >= ${T0} and amount % ${M} == 0:\`: % gives the remainder, which is 0 for multiples of ${M}.`,
          `\`elif amount >= ${T0}:\`: the general large case, reached only if the special case didn't match.`,
          `\`else: print('${normal}')\`: everything else, including 0.`,
        ],
        mistakes: [
          `Checking >= ${T0} before the multiple-of-${M} rule, so ${T0} prints ${large} instead of ${special}.`,
          `Using > ${T0}, which misses exactly ${T0}.`,
          'Calling print(transactionAlerts(amounts)), which prints an extra None line.',
          'Leaving the stub\'s "# Write your code here" with no code under it: IndentationError.',
        ],
        params: { T0, M, neg, special, large, normal },
      }
    },
  })

  const MERCHANTS = ['amazon', 'target', 'shell', 'uber', 'lyft', 'starbucks', 'netflix', 'costco', 'chipotle']
  T.push({
    key: 'code-py-topk', section: 'python', kind: 'code',
    make(rand) {
      const PUNCT = '.,!?'
      const strip = (w) => w.replace(/^[.,!?]+|[.,!?]+$/g, '')
      const vary = (w) => {
        const cased = pick(rand, [w, w.toUpperCase(), w[0].toUpperCase() + w.slice(1)])
        return pick(rand, ['', '', '.', ',', '!']) + cased + pick(rand, ['', '', '.', ',', '?'])
      }
      const top = (memos, k) => {
        const counts = new Map()
        for (const m of memos) for (const raw of m.split(/\s+/).filter(Boolean)) {
          const w = strip(raw).toLowerCase()
          if (w) counts.set(w, (counts.get(w) || 0) + 1)
        }
        return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, k).map(([w, c]) => `${w} ${c}`)
      }
      const memo = (words) => words.map(vary).join(' ')
      const vocab = sample(rand, MERCHANTS, 5)
      const k = between(rand, 2, 3)
      const cases = [
        ['Sample case 0', [memo([vocab[0], vocab[1]]), memo([vocab[0], vocab[2]]), memo([vocab[3]])], k],
        ['k larger than the number of words', [memo([vocab[1], vocab[1]])], 5],
        ['All tied: alphabetical', [memo(sample(rand, vocab, 4))], 3],
        ['Case and punctuation are ignored', [`${vocab[2].toUpperCase()}! ${vocab[2]}`, `${vocab[2]}.`], 1],
        ['k is zero', [memo([vocab[4]])], 0],
        ['Random memos', Array.from({ length: 4 }, () => memo(Array.from({ length: between(rand, 1, 4) }, () => pick(rand, vocab)))), between(rand, 1, 4)],
      ]
      cases[3][1].push(PUNCT[0] + PUNCT[0] + PUNCT[0])
      const main = "if __name__ == '__main__':\n    fptr = open(os.environ['OUTPUT_PATH'], 'w')\n\n    memos_count = int(input().strip())\n\n    memos = []\n\n    for _ in range(memos_count):\n        memos_item = input()\n        memos.append(memos_item)\n\n    k = int(input().strip())\n\n    result = topWords(memos, k)\n\n    fptr.write('\\n'.join(result))\n    fptr.write('\\n')\n\n    fptr.close()\n"
      const body = "    counts = Counter()\n    for memo in memos:\n        for word in memo.split():\n            w = word.strip('.,!?').lower()\n            if w:\n                counts[w] += 1\n    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))\n    return [f'{w} {c}' for w, c in ranked[:k]]\n"
      const solution = hr('', 'topWords(memos, k)', main, body)
      solution.splice(solution.indexOf('import sys') + 1, 0, 'from collections import Counter')
      return {
        type: 'python', difficulty: 'Medium', topic: 'Counting with dictionaries and sorting ties (HackerRank style)', title: 'Most common merchants in memos',
        prompt: lines('Complete `topWords(memos, k)`, which returns the `k` most common words across all memos as strings `"word count"`.\n\n- Words are separated by spaces. Remove `.`, `,`, `!` and `?` from the start and end of each word, then make it lower case. Skip anything that becomes empty.\n- Order by count, highest first, then alphabetically.\n- If there are fewer than `k` different words, return them all. If `k` is 0, return an empty list.\n\n**Input format:** n, then n memo lines, then k. The input and output code is already written.'),
        starter: hr("#\n# Complete the 'topWords' function below.\n#\n# The function is expected to return a STRING_ARRAY.\n# The function accepts following parameters:\n#  1. STRING_ARRAY memos\n#  2. INTEGER k\n#\n", 'topWords(memos, k)', main),
        solution,
        tests: cases.map(([name, memos, kk]) => ({ name, stdin: stdin(String(memos.length), memos, String(kk)), stdout: out(top(memos, kk)) })),
        approach: [
          'Counting is a dictionary job: collections.Counter or dict.get(word, 0) + 1.',
          'Normalize every word the same way before counting: strip punctuation from both ends, lower-case, skip empties.',
          'Sort with one tuple key, (-count, word), then slice the first k.',
        ],
        walkthrough: [
          '`counts = Counter()`: a dict that starts missing keys at 0.',
          '`word.strip(\'.,!?\').lower()`: strip removes those characters from the ends only.',
          '`if w:`: skips words that were only punctuation.',
          '`sorted(counts.items(), key=lambda item: (-item[1], item[0]))`: most common first, alphabetical for ties.',
          '`ranked[:k]`: slicing handles k = 0 and k larger than the list.',
        ],
        mistakes: [
          'Counter.most_common(k), which breaks ties by first appearance, not alphabetically.',
          'reverse=True on (count, word), which also reverses tied words.',
          'Forgetting lower() or the punctuation strip, so the same merchant counts as several words.',
        ],
        params: { k, vocab },
      }
    },
  })

  T.push({
    key: 'code-py-days-below', section: 'python', kind: 'code',
    make(rand) {
      const L = pick(rand, [0, 100, 500, -50])
      const days = (start, changes) => {
        let b = start
        const hit = []
        changes.forEach((c, i) => {
          b += c
          if (b < L) hit.push(i + 1)
        })
        return hit.length ? hit.join(' ') : 'NONE'
      }
      const rc = () => pick(rand, [-between(rand, 1, 300), between(rand, 1, 300)])
      const cases = [
        ['Sample case 0', [L + 200, [-150, -100, 300, -400]]],
        ['Never below', [L + 1000, [-10, 20, -30]]],
        ['Exactly the limit is not below', [L + 50, [-50, 0]]],
        ['No changes', [L - 100, []]],
        ['Below every day', [L - 10, [-1, 0, 5]]],
        ['Random days', [L + between(rand, -100, 300), Array.from({ length: 6 }, rc)]],
      ]
      const main = "if __name__ == '__main__':\n    start = int(input().strip())\n\n    n = int(input().strip())\n\n    changes = []\n\n    for _ in range(n):\n        changes.append(int(input().strip()))\n\n    print(daysBelow(start, changes))\n"
      const body = `    balance = start\n    days = []\n    for day, change in enumerate(changes, start=1):\n        balance += change\n        if balance < ${L}:\n            days.append(str(day))\n    return ' '.join(days) if days else 'NONE'\n`
      return {
        type: 'python', difficulty: 'Easy', topic: 'Loops, enumerate and output format (HackerRank style)', title: `Days below ${L}`,
        prompt: lines(`An account starts with balance \`start\`. Each day, one change is added. Complete \`daysBelow(start, changes)\`, which returns the day numbers (starting at 1) whose end-of-day balance is **below ${L}**, separated by single spaces. If there are none, return \`NONE\`. The starting balance itself is not a day.\n\n**Input format:** start, then n, then n changes. The code that reads input and prints your result is already written.`),
        starter: hr("#\n# Complete the 'daysBelow' function below.\n#\n# The function is expected to return a STRING.\n# The function accepts INTEGER start and INTEGER_ARRAY changes as parameters.\n#\n", 'daysBelow(start, changes)', main),
        solution: hr('', 'daysBelow(start, changes)', main, body),
        tests: cases.map(([name, [start, ch]]) => ({ name, stdin: stdin(String(start), String(ch.length), ch.map(String)), stdout: out([days(start, ch)]) })),
        approach: [
          'Keep a running balance and collect the day numbers that match.',
          'enumerate(changes, start=1) gives 1-based day numbers directly.',
          `"Below ${L}" is strict: a balance of exactly ${L} doesn't count.`,
          'Join with single spaces at the end, and handle the empty case with NONE.',
        ],
        walkthrough: [
          '`for day, change in enumerate(changes, start=1):`: day counts 1, 2, 3 alongside each change.',
          '`balance += change`: end-of-day balance.',
          `\`if balance < ${L}: days.append(str(day))\`: strings, so they can be joined.`,
          "`' '.join(days) if days else 'NONE'`: one line of output, or the NONE fallback.",
        ],
        mistakes: [
          'Counting days from 0.',
          `Using <= ${L}, which includes days exactly at the limit.`,
          'Printing each day on its own line instead of one space-separated line.',
          'Returning an empty string instead of NONE when no day matches.',
        ],
        params: { L },
      }
    },
  })

  T.push({
    key: 'code-py-validate', section: 'python', kind: 'code',
    make(rand) {
      const P = pick(rand, [2, 3])
      const D = pick(rand, [5, 6, 7])
      const rule = pick(rand, [
        { text: 'the last digit is even', py: "int(digits[-1]) % 2 == 0", js: (d) => +d[d.length - 1] % 2 === 0, fix: (d) => d.slice(0, -1) + '4', bad: (d) => d.slice(0, -1) + '7' },
        { text: 'the digits are not all the same', py: 'len(set(digits)) > 1', js: (d) => new Set(d).size > 1, fix: (d) => d.slice(0, -1) + (d[0] === '1' ? '2' : '1'), bad: (d) => d[0].repeat(d.length) },
        { text: 'the digits add up to a multiple of 3', py: 'sum(int(c) for c in digits) % 3 == 0', js: (d) => [...d].reduce((s, c) => s + +c, 0) % 3 === 0,
          fix: (d) => { const s = [...d.slice(0, -1)].reduce((a, c) => a + +c, 0); return d.slice(0, -1) + String((3 - (s % 3)) % 3) },
          bad: (d) => { const s = [...d.slice(0, -1)].reduce((a, c) => a + +c, 0); return d.slice(0, -1) + String((4 - (s % 3)) % 3 === 0 ? 1 : (4 - (s % 3)) % 3) } },
      ])
      const letters = () => Array.from({ length: P }, () => String.fromCharCode(65 + between(rand, 0, 25))).join('')
      const digits = () => Array.from({ length: D }, () => String(between(rand, 0, 9))).join('')
      const valid = () => letters() + rule.fix(digits())
      const check = (raw) => {
        const s = raw.trim()
        if (s.length !== P + D) return false
        if (![...s.slice(0, P)].every((c) => c >= 'A' && c <= 'Z')) return false
        const d = s.slice(P)
        if (![...d].every((c) => c >= '0' && c <= '9')) return false
        return rule.js(d)
      }
      const v = valid()
      const cases = [
        ['Sample case 0', [v, v.toLowerCase(), v.slice(0, -1), letters() + rule.bad(digits())]],
        ['Surrounding spaces are ignored', [`  ${valid()}  `, `${letters().slice(0, P - 1)}9${rule.fix(digits())}`]],
        ['Letter in the digit part', [`${letters()}${rule.fix(digits()).slice(0, -1)}X`]],
        ['Too long and too short', [valid() + '1', valid().slice(1)]],
        ['The extra rule decides', [letters() + rule.fix(digits()), letters() + rule.bad(digits())]],
        ['No IDs', []],
      ]
      const main = "if __name__ == '__main__':\n    ids_count = int(input().strip())\n\n    ids = []\n\n    for _ in range(ids_count):\n        ids_item = input()\n        ids.append(ids_item)\n\n    validateIds(ids)\n"
      const body = `    for raw in ids:\n        s = raw.strip()\n        digits = s[${P}:]\n        ok = (\n            len(s) == ${P + D}\n            and all('A' <= c <= 'Z' for c in s[:${P}])\n            and all(c in '0123456789' for c in digits)\n            and ${rule.py}\n        )\n        print('VALID' if ok else 'INVALID')\n`
      return {
        type: 'python', difficulty: 'Easy', topic: 'String checks (HackerRank style)', title: 'Validate reference codes',
        prompt: lines(`Complete \`validateIds(ids)\`, which prints \`VALID\` or \`INVALID\` for each ID, one per line, in order. Ignore spaces before or after an ID. An ID is valid when all of these hold:\n\n- It is exactly ${P + D} characters long\n- The first ${P} characters are capital letters A to Z\n- The last ${D} characters are digits 0 to 9\n- ${rule.text[0].toUpperCase() + rule.text.slice(1)}\n\n**Input format:** n, then n IDs. The input code is already written.`),
        starter: hr("#\n# Complete the 'validateIds' function below.\n#\n# The function accepts STRING_ARRAY ids as parameter.\n#\n", 'validateIds(ids)', main),
        solution: hr('', 'validateIds(ids)', main, body),
        tests: cases.map(([name, ids]) => ({ name, stdin: stdin(String(ids.length), ids), stdout: out(ids.map((i) => (check(i) ? 'VALID' : 'INVALID'))) })),
        approach: [
          'Strip first, then check every rule on the stripped string, joined with and.',
          'Check the length before looking at slices.',
          "Use explicit character ranges ('A' <= c <= 'Z', c in '0123456789'): isupper() and isdigit() accept some non-ASCII characters.",
          `Then apply the extra rule: ${rule.text}.`,
        ],
        walkthrough: [
          '`s = raw.strip()`: removes spaces at the ends only, never in the middle.',
          `\`len(s) == ${P + D}\`: and stops at the first false part, so later slices are safe to reason about.`,
          `\`all('A' <= c <= 'Z' for c in s[:${P}])\`: only capital A to Z.`,
          "`all(c in '0123456789' for c in digits)`: only ASCII digits.",
          `\`${rule.py}\`: the extra rule.`,
          "`print('VALID' if ok else 'INVALID')`: exactly one word per line.",
        ],
        mistakes: [
          'Not stripping, so IDs with surrounding spaces fail the length check.',
          'Using isalpha(), which accepts lower case.',
          `Forgetting the extra rule (${rule.text}).`,
          'Returning a list instead of printing; the starter calls the function without printing.',
        ],
        params: { P, D, rule: rule.text },
      }
    },
  })

  T.push({
    key: 'code-py-sort', section: 'python', kind: 'code',
    make(rand) {
      const specs = [
        { text: ['amount, largest first', 'then date, earliest first', 'then id, in string order'], cmp: (a, b) => b.amount - a.amount || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.id < b.id ? -1 : 1),
          py: '    ordered = sorted(rows, key=lambda r: (-r[2], r[1], r[0]))\n', walk: '`sorted(rows, key=lambda r: (-r[2], r[1], r[0]))`: negate the amount for largest-first; date and id stay ascending.' },
        { text: ['date, earliest first', 'then amount, largest first', 'then id, in string order'], cmp: (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || b.amount - a.amount || (a.id < b.id ? -1 : 1),
          py: '    ordered = sorted(rows, key=lambda r: (r[1], -r[2], r[0]))\n', walk: '`sorted(rows, key=lambda r: (r[1], -r[2], r[0]))`: date first, then amount largest-first by negating.' },
        { text: ['amount, smallest first', 'then date, latest first', 'then id, in string order'], cmp: (a, b) => a.amount - b.amount || (a.date > b.date ? -1 : a.date < b.date ? 1 : 0) || (a.id < b.id ? -1 : 1),
          py: '    ordered = sorted(rows, key=lambda r: r[0])\n    ordered = sorted(ordered, key=lambda r: r[1], reverse=True)\n    ordered = sorted(ordered, key=lambda r: r[2])\n',
          walk: "Dates are text, so they can't be negated. Sort in passes from the least important key to the most important: id, then date with reverse=True, then amount. Python's sort is stable, so earlier orders survive within ties." },
      ]
      const spec = pick(rand, specs)
      const day = () => `2025-0${between(rand, 1, 3)}-${String(between(rand, 1, 28)).padStart(2, '0')}`
      const amt = () => pick(rand, [5, 10, 20.5, 99.99, 100, 250, 0, -5])
      const row = (i) => ({ id: `T${i}`, date: day(), amount: amt() })
      const fmt = (r) => `${r.id} ${r.date} ${r.amount.toFixed(2)}`
      const sortOut = (rows) => [...rows].sort(spec.cmp).map(fmt)
      const d = day()
      const cases = [
        ['Sample case 0', Array.from({ length: 5 }, (_, i) => row(i + 1))],
        ['Ties on the first key', [{ id: 'A2', date: d, amount: 10 }, { id: 'A1', date: d, amount: 10 }, { id: 'B', date: day(), amount: 10 }]],
        ['Negative and zero amounts', [{ id: 'X', date: d, amount: -5 }, { id: 'Y', date: d, amount: 0 }, { id: 'Z', date: day(), amount: -5 }]],
        ['One row', [row(7)]],
        ['No rows', []],
        ['IDs compare as strings', [{ id: 'T9', date: d, amount: 7 }, { id: 'T10', date: d, amount: 7 }]],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    rows = []\n\n    for _ in range(n):\n        txn_id, date, amount = input().split()\n        rows.append((txn_id, date, float(amount)))\n\n    for line in sortTransactions(rows):\n        print(line)\n"
      const body = `${spec.py}    return [f'{txn_id} {date} {amount:.2f}' for txn_id, date, amount in ordered]\n`
      return {
        type: 'python', difficulty: 'Medium', topic: 'Sorting with keys and formatting (HackerRank style)', title: 'Sort transactions for review',
        prompt: lines(`Complete \`sortTransactions(rows)\`. Each row is \`(txn_id, date, amount)\` with date as \`YYYY-MM-DD\` text and amount a float. Return lines \`"txn_id date amount"\` (amount with exactly 2 decimals), ordered by:\n\n${spec.text.map((t) => `- ${t}`).join('\n')}\n\n**Input format:** n, then n lines of \`txn_id date amount\`. The input code and the printing are already written.`),
        starter: hr("#\n# Complete the 'sortTransactions' function below.\n#\n# The function is expected to return a STRING_ARRAY.\n# The function accepts a LIST of (STRING, STRING, FLOAT) tuples as parameter.\n#\n", 'sortTransactions(rows)', main),
        solution: hr('', 'sortTransactions(rows)', main, body),
        tests: cases.map(([name, rows]) => ({ name, stdin: stdin(String(rows.length), rows.map((r) => `${r.id} ${r.date} ${r.amount}`)), stdout: out(sortOut(rows)) })),
        approach: [
          'Build one sort key that encodes every rule, or sort in several stable passes from the least to the most important key.',
          'Negating works for numbers; for a descending text key (like a date), use a separate pass with reverse=True.',
          'Format with {amount:.2f} so 10 prints as 10.00.',
        ],
        walkthrough: [
          spec.walk,
          "`f'{txn_id} {date} {amount:.2f}'`: exactly two decimals and single spaces.",
          "'T10' < 'T9' as strings, because '1' < '9'; the prompt asks for string order.",
        ],
        mistakes: [
          'reverse=True on a whole tuple key, which reverses the tie-breaks too.',
          'Comparing IDs as numbers when the prompt says string order.',
          'Printing str(amount), which gives 10.0 instead of 10.00.',
        ],
        params: { spec: spec.text.join('; ') },
      }
    },
  })

  T.push({
    key: 'code-py-commands', section: 'python', kind: 'code',
    make(rand) {
      const W = pick(rand, [200, 300, 500, 1000])
      const F = pick(rand, [0, 1, 2, 5])
      const run = (cmds) => {
        let balance = 0
        let withdrawn = 0
        return cmds.map((line) => {
          const parts = line.split(/\s+/).filter(Boolean)
          if (parts.length === 1 && parts[0] === 'BALANCE') return String(balance)
          if (parts.length !== 2 || !['DEPOSIT', 'WITHDRAW'].includes(parts[0]) || !/^[+-]?\d+$/.test(parts[1])) return 'ERROR bad command'
          const x = parseInt(parts[1], 10)
          if (x <= 0) return 'ERROR invalid amount'
          if (parts[0] === 'DEPOSIT') {
            balance += x
            return 'OK'
          }
          if (withdrawn + x > W) return 'ERROR limit exceeded'
          if (x + F > balance) return 'ERROR insufficient funds'
          balance -= x + F
          withdrawn += x
          return 'OK'
        })
      }
      const cases = [
        ['Sample case 0', ['DEPOSIT 1000', `WITHDRAW ${Math.min(W, 100)}`, 'BALANCE', 'WITHDRAW 2000', 'BALANCE']],
        ['Daily limit boundary', ['DEPOSIT 5000', `WITHDRAW ${W}`, 'WITHDRAW 1', 'BALANCE']],
        ['Fee makes it insufficient', [`DEPOSIT ${50 + F}`, `WITHDRAW ${50 + F}`, 'WITHDRAW 50', 'BALANCE']],
        ['Zero and negative amounts', ['DEPOSIT 0', 'WITHDRAW -5', 'BALANCE']],
        ['Malformed commands', ['DEPOSIT ten', 'deposit 5', 'TRANSFER 5', 'BALANCE 1', 'WITHDRAW']],
        ['Random session', Array.from({ length: 6 }, () => pick(rand, [`DEPOSIT ${between(rand, 1, 400)}`, `WITHDRAW ${between(rand, 1, 300)}`, 'BALANCE', 'DEPOSIT -3']))],
      ]
      const main = "if __name__ == '__main__':\n    fptr = open(os.environ['OUTPUT_PATH'], 'w')\n\n    commands_count = int(input().strip())\n\n    commands = []\n\n    for _ in range(commands_count):\n        commands_item = input()\n        commands.append(commands_item)\n\n    result = processCommands(commands)\n\n    fptr.write('\\n'.join(result))\n    fptr.write('\\n')\n\n    fptr.close()\n"
      const body = `    balance = 0\n    withdrawn = 0\n    out = []\n    for line in commands:\n        parts = line.split()\n        if parts == ['BALANCE']:\n            out.append(str(balance))\n            continue\n        if len(parts) != 2 or parts[0] not in ('DEPOSIT', 'WITHDRAW'):\n            out.append('ERROR bad command')\n            continue\n        try:\n            amount = int(parts[1])\n        except ValueError:\n            out.append('ERROR bad command')\n            continue\n        if amount <= 0:\n            out.append('ERROR invalid amount')\n        elif parts[0] == 'DEPOSIT':\n            balance += amount\n            out.append('OK')\n        elif withdrawn + amount > ${W}:\n            out.append('ERROR limit exceeded')\n        elif amount + ${F} > balance:\n            out.append('ERROR insufficient funds')\n        else:\n            balance -= amount + ${F}\n            withdrawn += amount\n            out.append('OK')\n    return out\n`
      return {
        type: 'python', difficulty: 'Medium', topic: 'Parsing commands and handling errors (HackerRank style)', title: 'ATM session',
        prompt: lines(`An account starts at balance 0. Complete \`processCommands(commands)\`, which handles each command in order and returns one output line per command.\n\n| Command | Effect | Output |\n|---|---|---|\n| \`DEPOSIT x\` | add x | \`OK\` |\n| \`WITHDRAW x\` | subtract x plus a $${F} fee | \`OK\` |\n| \`BALANCE\` | none | the balance, as a whole number |\n\nErrors leave everything unchanged. Check them in this order:\n\n1. \`ERROR bad command\`: anything that isn't exactly one of the three forms above (unknown or lower-case command, missing, extra or non-integer amount)\n2. \`ERROR invalid amount\`: x is 0 or negative\n3. \`ERROR limit exceeded\`: this withdrawal would make the session's total withdrawn (not counting fees) more than ${W}\n4. \`ERROR insufficient funds\`: x plus the fee is more than the balance\n\n**Input format:** n, then n commands. The input and output code is already written.`),
        starter: hr("#\n# Complete the 'processCommands' function below.\n#\n# The function is expected to return a STRING_ARRAY.\n# The function accepts STRING_ARRAY commands as parameter.\n#\n", 'processCommands(commands)', main),
        solution: hr('', 'processCommands(commands)', main, body),
        tests: cases.map(([name, cmds]) => ({ name, stdin: stdin(String(cmds.length), cmds), stdout: out(run(cmds)) })),
        approach: [
          'Classify each line before acting on it: split into words and check the exact shape first.',
          'Convert the amount inside try/except ValueError so bad text becomes an error message, not a crash.',
          'Apply the checks in the order given, and only change state on the success path.',
          `Track two numbers: the balance, and the total withdrawn so far for the ${W} limit.`,
        ],
        walkthrough: [
          "`parts = line.split()` and `if parts == ['BALANCE']`: exact matching rejects 'BALANCE 1' and 'balance'.",
          "`if len(parts) != 2 or parts[0] not in ('DEPOSIT', 'WITHDRAW')`: any other shape is a bad command.",
          '`try: amount = int(parts[1]) except ValueError:`: catches non-integer amounts like "ten".',
          `\`elif withdrawn + amount > ${W}\`: the limit is checked before funds, as the prompt orders.`,
          `\`elif amount + ${F} > balance\`: the fee counts toward what's needed.`,
          `\`balance -= amount + ${F}\` and \`withdrawn += amount\`: update both only after every check passed.`,
        ],
        mistakes: [
          'Checking funds before the limit, which prints the wrong error when both fail.',
          'Forgetting the fee in the funds check or in the new balance.',
          'Counting the fee toward the withdrawal limit, which the prompt excludes.',
          "Calling int() without try/except, so 'DEPOSIT ten' crashes.",
        ],
        params: { W, F },
      }
    },
  })

  // ===================================================================== SQL

  const BRANCHES = ['Back Bay', 'Cambridge', 'Providence', 'Worcester', 'Hartford', 'Albany']
  const NAMES = ['Ava Chen', 'Ben Ortiz', 'Chloe Park', 'Dev Patel', 'Emma Ross', 'Finn Walsh', 'Gia Rossi', 'Hugo Lim', 'Iris Moss']
  const SQL_STARTER = ['/*', 'Enter your query below.', 'Please append a semicolon ";" at the end of the query', '*/', '']
  const byKeys = (...fns) => (a, b) => {
    for (const f of fns) {
      const r = f(a, b)
      if (r) return r
    }
    return 0
  }
  const asc = (f) => (a, b) => (f(a) < f(b) ? -1 : f(a) > f(b) ? 1 : 0)
  const desc = (f) => (a, b) => (f(a) > f(b) ? -1 : f(a) < f(b) ? 1 : 0)
  const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100

  T.push({
    key: 'code-sql-high-total', section: 'sqlint', kind: 'code',
    make(rand) {
      const T0 = pick(rand, [5000, 10000, 20000])
      const custs = sample(rand, [101, 102, 103, 104, 105, 106, 107], 6).sort((a, b) => a - b)
      const rows = []
      let id = 1
      const add = (c, b) => rows.push([id++, c, b])
      add(custs[0], T0 / 2 + 1000); add(custs[0], T0 / 2) // over
      add(custs[1], T0) // exactly: excluded
      add(custs[2], T0 + 2000); add(custs[2], -1500) // over after a negative
      add(custs[3], T0 / 2); add(custs[3], null) // under, NULL ignored
      add(custs[4], T0 / 2); add(custs[4], T0 / 2 + 0.01) // just over
      add(custs[5], between(rand, 1, T0 - 1))
      const shuffled = shuffle(rand, rows).map((r, i) => [i + 1, r[1], r[2]])
      const totals = new Map()
      for (const [, c, b] of shuffled) totals.set(c, (totals.get(c) || 0) + (b ?? 0))
      const expected = [...totals].filter(([, t]) => t > T0 + 1e-9).map(([c]) => [c]).sort((a, b) => a[0] - b[0])
      return {
        type: 'sql', difficulty: 'Easy', topic: 'GROUP BY with HAVING', title: 'Customers with high total balances',
        prompt: [`Each customer can have several accounts. Print the IDs of customers whose **total balance across all their accounts is more than ${T0}**. An account with a NULL balance is being opened and adds nothing.`, '', '**Output columns:** `customer_id`', '', '**Sort by:** `customer_id` ascending.'],
        tables: [{ name: 'accounts', columns: [['account_id', 'INTEGER'], ['customer_id', 'INTEGER'], ['balance', 'REAL']], rows: shuffled }],
        solution: ['SELECT customer_id', 'FROM accounts', 'GROUP BY customer_id', `HAVING SUM(balance) > ${T0}`, 'ORDER BY customer_id;'],
        starter: SQL_STARTER,
        expected: { columns: ['customer_id'], rows: expected },
        approach: ['"Total per customer" means GROUP BY customer_id with SUM(balance).', 'Conditions on totals go in HAVING.', `"More than ${T0}" is strict: a total of exactly ${T0} is out.`, 'SUM skips NULLs; negative balances lower the total.'],
        walkthrough: ['`GROUP BY customer_id`: one group per customer.', `\`HAVING SUM(balance) > ${T0}\`: keep groups whose total is over the threshold. Customer ${custs[1]} has exactly ${T0}, so it is excluded.`, '`ORDER BY customer_id;`: the required order.'],
        mistakes: [`WHERE balance > ${T0}, which tests single accounts, not totals.`, `>= ${T0}, which wrongly includes customer ${custs[1]}.`, 'Forgetting ORDER BY.'],
        params: { T0 },
      }
    },
  })

  T.push({
    key: 'code-sql-top-per-group', section: 'sqlint', kind: 'code',
    make(rand) {
      const br = sample(rand, BRANCHES, 3)
      const names = sample(rand, NAMES, 7)
      const branches = br.map((b, i) => [i + 1, b])
      const customers = names.map((n, i) => [i + 1, n, (i % 3) + 1])
      const txns = []
      let id = 1
      const amounts = [100, 200, 300, 400, 500]
      for (const [cid] of customers) {
        for (let k = 0; k < between(rand, 1, 3); k++) txns.push([id++, cid, 'deposit', pick(rand, amounts)])
        if (rand() < 0.5) txns.push([id++, cid, 'withdrawal', pick(rand, [600, 900])])
      }
      // Force a tie for first place in branch 1
      const b1 = customers.filter((c) => c[2] === 1).map((c) => c[0])
      const totals = () => {
        const t = new Map()
        for (const [, c, type, a] of txns) if (type === 'deposit' && a !== null) t.set(c, (t.get(c) || 0) + a)
        return t
      }
      let t = totals()
      const top1 = Math.max(...b1.map((c) => t.get(c) || 0))
      const leader = b1.find((c) => (t.get(c) || 0) === top1)
      const other = b1.find((c) => c !== leader)
      txns.push([id++, other, 'deposit', top1 - (t.get(other) || 0) || 100])
      if (top1 - (t.get(other) || 0) === 0) txns.push([id++, leader, 'deposit', 100])
      txns.push([id++, pick(rand, customers)[0], 'deposit', null])
      t = totals()
      const expected = []
      for (const [bid, bname] of branches) {
        const members = customers.filter((c) => c[2] === bid && t.has(c[0]))
        if (!members.length) continue
        const best = Math.max(...members.map((c) => t.get(c[0])))
        for (const c of members) if (t.get(c[0]) === best) expected.push([bname, c[1], best])
      }
      expected.sort(byKeys(asc((r) => r[0]), asc((r) => r[1])))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window functions: ranking with ties', title: 'Top depositor in each branch',
        prompt: ["For every branch, find the customer (or customers) with the highest **total deposit amount**. Only count rows where `txn_type` is `'deposit'`; a NULL amount adds nothing. If customers tie for the highest total in a branch, return all of them.", '', '**Output columns:** `branch_name`, `customer_name`, `total_deposits`', '', '**Sort by:** `branch_name` ascending, then `customer_name` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: branches },
          { name: 'customers', columns: [['customer_id', 'INTEGER'], ['customer_name', 'TEXT'], ['branch_id', 'INTEGER']], rows: customers },
          { name: 'transactions', columns: [['txn_id', 'INTEGER'], ['customer_id', 'INTEGER'], ['txn_type', 'TEXT'], ['amount', 'REAL']], rows: txns },
        ],
        solution: ['WITH totals AS (', '    SELECT c.branch_id, c.customer_name, SUM(t.amount) AS total_deposits', '    FROM transactions t', '    JOIN customers c ON c.customer_id = t.customer_id', "    WHERE t.txn_type = 'deposit'", '    GROUP BY c.branch_id, c.customer_id, c.customer_name', '),', 'ranked AS (', '    SELECT branch_id, customer_name, total_deposits,', '           RANK() OVER (PARTITION BY branch_id ORDER BY total_deposits DESC) AS rnk', '    FROM totals', ')', 'SELECT b.branch_name, r.customer_name, r.total_deposits', 'FROM ranked r', 'JOIN branches b ON b.branch_id = r.branch_id', 'WHERE r.rnk = 1', 'ORDER BY b.branch_name, r.customer_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'customer_name', 'total_deposits'], rows: expected },
        approach: ['"Top per group, keep ties" means RANK or DENSE_RANK, never ROW_NUMBER.', 'Filter to deposits and total per customer in one CTE, rank inside each branch in a second, keep rank 1.', 'Join to branches for names last, then sort.'],
        walkthrough: ["`WHERE t.txn_type = 'deposit'` before `GROUP BY`: withdrawals never reach the SUM.", '`RANK() OVER (PARTITION BY branch_id ORDER BY total_deposits DESC)`: ranks inside each branch; tied totals share rank 1.', '`WHERE r.rnk = 1`: every top customer, including ties.'],
        mistakes: ['ROW_NUMBER(), which keeps only one of the tied customers.', 'Forgetting the deposit filter, so withdrawals inflate totals.', 'Filtering the rank in the same SELECT that computes it.'],
        params: {},
      }
    },
  })

  T.push({
    key: 'code-sql-rate-having', section: 'sqlint', kind: 'code',
    make(rand) {
      const minLoans = pick(rand, [3, 4])
      const R = pick(rand, [0.25, 0.3, 0.4, 0.5])
      const br = sample(rand, BRANCHES, 5).map((b, i) => [i + 1, b])
      const loans = []
      let id = 101
      const statuses = ['default', 'current', 'paid', null]
      for (const [bid] of br) for (let k = 0; k < between(rand, minLoans - 1, minLoans + 3); k++) loans.push([id++, bid, pick(rand, [5000, 8000, 12000]), pick(rand, statuses)])
      // Make sure at least one branch qualifies
      for (let k = 0; k < minLoans; k++) loans.push([id++, br[0][0], 9000, 'default'])
      const expected = []
      for (const [bid, name] of br) {
        const mine = loans.filter((l) => l[1] === bid)
        const d = mine.filter((l) => l[3] === 'default').length
        if (mine.length >= minLoans && d / mine.length > R + 1e-12) expected.push([name, mine.length, d, round2(d / mine.length)])
      }
      expected.sort(byKeys(desc((r) => r[3]), asc((r) => r[0])))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'GROUP BY with HAVING, NULLs and integer division', title: 'Branches with a high default rate',
        prompt: [`For each branch, count its loans and how many have \`status = 'default'\`. A NULL status still counts as a loan but not as a default. Return only branches with **at least ${minLoans} loans** and a **default rate above ${R}** (defaults divided by loans), with the rate rounded to 2 decimal places.`, '', '**Output columns:** `branch_name`, `total_loans`, `defaulted_loans`, `default_rate`', '', '**Sort by:** `default_rate` descending, then `branch_name` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'loans', columns: [['loan_id', 'INTEGER'], ['branch_id', 'INTEGER'], ['amount', 'REAL'], ['status', 'TEXT']], rows: shuffle(rand, loans) },
        ],
        solution: ['SELECT b.branch_name,', '       COUNT(l.loan_id) AS total_loans,', "       SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) AS defaulted_loans,", "       ROUND(1.0 * SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) / COUNT(l.loan_id), 2) AS default_rate", 'FROM branches b', 'JOIN loans l ON l.branch_id = b.branch_id', 'GROUP BY b.branch_id, b.branch_name', `HAVING COUNT(l.loan_id) >= ${minLoans}`, `   AND 1.0 * SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) / COUNT(l.loan_id) > ${R}`, 'ORDER BY default_rate DESC, b.branch_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'total_loans', 'defaulted_loans', 'default_rate'], rows: expected },
        approach: ['GROUP BY branch, then HAVING for conditions on counts and rates.', "Conditional count: SUM(CASE WHEN status = 'default' THEN 1 ELSE 0 END).", 'Count loans with COUNT(loan_id), never COUNT(status), which skips NULLs.', 'Multiply by 1.0 before dividing to avoid integer division.'],
        walkthrough: ['`COUNT(l.loan_id)`: every loan, NULL status included.', "`SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END)`: counts defaults; NULL falls to 0.", `\`HAVING COUNT(l.loan_id) >= ${minLoans} AND ... > ${R}\`: both conditions are on aggregates.`, '`ORDER BY default_rate DESC, b.branch_name`: name breaks rate ties.'],
        mistakes: ['COUNT(status), which undercounts loans with NULL status.', 'Integer division: 2 / 4 is 0 in SQLite.', `Using >= ${R} instead of > ${R}.`, 'Missing the name tie-breaker.'],
        params: { minLoans, R },
      }
    },
  })

  T.push({
    key: 'code-sql-left-join-zero', section: 'sqlint', kind: 'code',
    make(rand) {
      const Y = pick(rand, [2023, 2024, 2025])
      const br = sample(rand, BRANCHES, 4).map((b, i) => [i + 1, b])
      const accts = []
      let id = 1
      const dates = [`${Y - 1}-12-31`, `${Y}-01-01`, `${Y}-06-15`, `${Y}-12-31`, `${Y + 1}-01-01`]
      for (const [bid] of br.slice(0, 3)) for (let k = 0; k < between(rand, 1, 4); k++) accts.push([id++, bid, pick(rand, dates), pick(rand, [250, 500, 1000, null])])
      accts.push([id++, br[0][0], `${Y}-03-03`, 300])
      accts.push([id++, br[3][0], `${Y - 1}-05-05`, 700]) // the last branch has nothing in Y
      const inYear = (d) => d >= `${Y}-01-01` && d < `${Y + 1}-01-01`
      const expected = br.map(([bid, name]) => {
        const mine = accts.filter((a) => a[1] === bid && inYear(a[2]))
        return [name, mine.length, mine.reduce((s, a) => s + (a[3] ?? 0), 0)]
      }).sort(byKeys(desc((r) => r[1]), asc((r) => r[0])))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'LEFT JOIN with a filter, COUNT and COALESCE', title: `Accounts opened per branch in ${Y}`,
        prompt: [`For every branch, report how many accounts were opened in ${Y} and the total of their opening deposits. Every branch must appear, even with no accounts opened in ${Y} (show 0 and 0). A NULL opening deposit still counts as an opened account and adds 0.`, '', '**Output columns:** `branch_name`, `accounts_opened`, `total_opening_deposit`', '', '**Sort by:** `accounts_opened` descending, then `branch_name` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'accounts', columns: [['account_id', 'INTEGER'], ['branch_id', 'INTEGER'], ['opened_date', 'TEXT'], ['opening_deposit', 'REAL']], rows: accts },
        ],
        solution: ['SELECT b.branch_name,', '       COUNT(a.account_id) AS accounts_opened,', '       COALESCE(SUM(a.opening_deposit), 0) AS total_opening_deposit', 'FROM branches b', 'LEFT JOIN accounts a', '       ON a.branch_id = b.branch_id', `      AND a.opened_date >= '${Y}-01-01'`, `      AND a.opened_date < '${Y + 1}-01-01'`, 'GROUP BY b.branch_id, b.branch_name', 'ORDER BY accounts_opened DESC, b.branch_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'accounts_opened', 'total_opening_deposit'], rows: expected },
        approach: ['"Every branch must appear" means start from branches and LEFT JOIN.', 'Put the year filter in ON; in WHERE it removes the NULL rows the LEFT JOIN created.', 'COUNT(a.account_id) gives 0 for no match; COUNT(*) would give 1.', 'COALESCE(SUM(...), 0) turns a SUM over nothing into 0.'],
        walkthrough: [`\`LEFT JOIN accounts a ON a.branch_id = b.branch_id AND a.opened_date >= '${Y}-01-01' AND a.opened_date < '${Y + 1}-01-01'\`: only ${Y} accounts match, but every branch keeps a row.`, '`COUNT(a.account_id)`: counts matches only.', '`COALESCE(SUM(a.opening_deposit), 0)`: 0 instead of NULL.'],
        mistakes: [`Filtering the year in WHERE, so ${br[3][1]} disappears.`, `COUNT(*), which shows 1 for ${br[3][1]}.`, `Off-by-one boundaries around ${Y}-01-01 and ${Y + 1}-01-01.`],
        params: { Y },
      }
    },
  })

  T.push({
    key: 'code-sql-running', section: 'sqlint', kind: 'code',
    make(rand) {
      const txns = []
      let id = 1
      for (const acct of sample(rand, [10, 20, 30], 2).sort((a, b) => a - b)) {
        const days = sample(rand, ['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-05', '2025-03-08'], 3).sort()
        for (const d of days) txns.push([id++, acct, d, pick(rand, [500, -200, 50, -100, 1000])])
        txns.push([id++, acct, days[1], pick(rand, [25, -25])]) // same-day pair
        if (rand() < 0.6) txns.push([id++, acct, days[2], null])
      }
      const rows = shuffle(rand, txns)
      const expected = []
      for (const acct of [...new Set(rows.map((r) => r[1]))].sort((a, b) => a - b)) {
        let run = 0
        for (const r of rows.filter((x) => x[1] === acct).sort(byKeys(asc((x) => x[2]), asc((x) => x[0])))) {
          run += r[3] ?? 0
          expected.push([acct, r[0], r[2], r[3] ?? 0, run])
        }
      }
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window functions: running totals', title: 'Running balance per account',
        prompt: ['Show a running balance for every transaction. Deposits are positive and withdrawals negative. A NULL amount means the transaction was reversed: show its amount as 0 and leave the balance unchanged. Each account starts at 0 and adds transactions in date order; on the same date, in `txn_id` order.', '', '**Output columns:** `account_id`, `txn_id`, `txn_date`, `amount`, `running_balance`', '', '**Sort by:** `account_id`, then `txn_date`, then `txn_id`, all ascending.'],
        tables: [{ name: 'transactions', columns: [['txn_id', 'INTEGER'], ['account_id', 'INTEGER'], ['txn_date', 'TEXT'], ['amount', 'REAL']], rows }],
        solution: ['SELECT account_id,', '       txn_id,', '       txn_date,', '       COALESCE(amount, 0) AS amount,', '       SUM(COALESCE(amount, 0)) OVER (', '           PARTITION BY account_id', '           ORDER BY txn_date, txn_id', '       ) AS running_balance', 'FROM transactions', 'ORDER BY account_id, txn_date, txn_id;'],
        starter: SQL_STARTER,
        expected: { columns: ['account_id', 'txn_id', 'txn_date', 'amount', 'running_balance'], rows: expected },
        approach: ['Running total per group: SUM(...) OVER (PARTITION BY group ORDER BY time).', "Make the window's ORDER BY unique (date, then txn_id), or same-day rows share the end-of-day total.", 'COALESCE the NULL amounts both for display and inside the SUM.'],
        walkthrough: ['`SUM(COALESCE(amount, 0)) OVER (PARTITION BY account_id ORDER BY txn_date, txn_id)`: adds up from the first row to the current one, per account.', 'txn_id in the window order makes each same-day row get its own running total.', '`ORDER BY account_id, txn_date, txn_id;`: the output order is separate from the window order.'],
        mistakes: ['ORDER BY txn_date alone inside OVER: same-day rows show the same total.', 'Leaving NULL in the amount column.', 'Missing PARTITION BY, so balances carry over between accounts.'],
        params: {},
      }
    },
  })

  T.push({
    key: 'code-sql-bands', section: 'sqlint', kind: 'code',
    make(rand) {
      const c1 = pick(rand, [560, 580, 600])
      const c2 = c1 + pick(rand, [60, 80, 90])
      const c3 = c2 + pick(rand, [50, 70])
      const band = (s) => (s === null ? 'Unknown' : s < c1 ? 'Poor' : s < c2 ? 'Fair' : s < c3 ? 'Good' : 'Excellent')
      const scores = shuffle(rand, [c1 - 1, c1, c2 - 1, c2, c3 - 1, c3, null, between(rand, 300, c1 - 2), between(rand, c3 + 1, 850), between(rand, c1 + 1, c2 - 2)])
      const people = sample(rand, ['Ana', 'Ben', 'Cy', 'Dee', 'Eve', 'Finn', 'Gus', 'Hal', 'Ivy', 'Jo', 'Kai'], scores.length)
      const rows = scores.map((s, i) => [i + 1, people[i], s])
      const counts = new Map()
      for (const s of scores) counts.set(band(s), (counts.get(band(s)) || 0) + 1)
      const expected = [...counts].sort(byKeys(desc((r) => r[1]), asc((r) => r[0])))
      return {
        type: 'sql', difficulty: 'Easy', topic: 'CASE expressions with GROUP BY', title: 'Customers per credit score band',
        prompt: ['Group customers into credit score bands and count them:', '', '| Band | Scores |', '|---|---|', `| \`Poor\` | below ${c1} |`, `| \`Fair\` | ${c1} to ${c2 - 1} |`, `| \`Good\` | ${c2} to ${c3 - 1} |`, `| \`Excellent\` | ${c3} and above |`, '| `Unknown` | score is NULL |', '', 'Only list bands that have at least one customer.', '', '**Output columns:** `band`, `customers`', '', '**Sort by:** `customers` descending, then `band` ascending.'],
        tables: [{ name: 'customers', columns: [['customer_id', 'INTEGER'], ['name', 'TEXT'], ['credit_score', 'INTEGER']], rows }],
        solution: ['SELECT CASE', "           WHEN credit_score IS NULL THEN 'Unknown'", `           WHEN credit_score < ${c1} THEN 'Poor'`, `           WHEN credit_score < ${c2} THEN 'Fair'`, `           WHEN credit_score < ${c3} THEN 'Good'`, "           ELSE 'Excellent'", '       END AS band,', '       COUNT(*) AS customers', 'FROM customers', 'GROUP BY band', 'ORDER BY customers DESC, band;'],
        starter: SQL_STARTER,
        expected: { columns: ['band', 'customers'], rows: expected },
        approach: ['Ranges into labels: CASE, checked top to bottom, first match wins.', 'Order the WHENs so each needs only an upper bound.', 'Check NULL first; NULL < x is unknown and would fall to ELSE.', 'GROUP BY the CASE alias and count.'],
        walkthrough: ["`WHEN credit_score IS NULL THEN 'Unknown'`: before any comparison.", `\`WHEN credit_score < ${c1}\` then \`< ${c2}\` then \`< ${c3}\`: each branch is only reached by higher scores, so ${c1} lands in Fair and ${c3} in Excellent.`, '`COUNT(*) ... GROUP BY band`: one row per band that has customers.', '`ORDER BY customers DESC, band`: alphabetical tie-break.'],
        mistakes: ['Leaving out the NULL branch, so NULL scores count as Excellent.', 'BETWEEN ranges that overlap at the boundaries.', 'COUNT(credit_score), which counts 0 for the Unknown band.'],
        params: { c1, c2, c3 },
      }
    },
  })

  // Coding templates build a full question directly
  const baseBuild = api.build
  api.build = function build(template, rand = Math.random) {
    if (template.kind !== 'code') return baseBuild(template, rand)
    const g = template.make(rand)
    return { id: `gen-${template.key}-${Math.floor(rand() * 1e9).toString(36)}`, section: template.section, generated: template.key, ...g }
  }
})()
