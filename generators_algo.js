'use strict'
// Problem Solving (section 'algo') coding templates in the interview style: a plain Python function, graded by
// function tests {name, setup, expr, expect} where expect is a Python literal. Every build draws fresh inputs and,
// where it fits, a different framing or a small rule change (tie-break, strict vs inclusive, k, window, limit).
// Expected values are computed here in JavaScript with a separate, usually brute-force implementation; the Python
// reference solution is written independently, and verify.py checks the two agree on many builds of each template.
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
  const randList = (rand, n, lo, hi) => Array.from({ length: n }, () => between(rand, lo, hi))
  const sortedList = (rand, n, lo, hi) => randList(rand, n, lo, hi).sort((x, y) => x - y)

  // A JavaScript value as a Python literal (the repr Python would print).
  // Floats that must keep a decimal point go in as {float: x}, tuples as {tuple: [...]}.
  function py(v) {
    if (v === null || v === undefined) return 'None'
    if (v === true) return 'True'
    if (v === false) return 'False'
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) throw new Error(`cannot write ${v} as a Python literal`)
      return Number.isInteger(v) ? String(v) : String(+v.toFixed(10))
    }
    if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
    if (Array.isArray(v)) return `[${v.map(py).join(', ')}]`
    if ('float' in v) return Number.isInteger(v.float) ? `${v.float}.0` : py(v.float)
    if ('tuple' in v) return `(${v.tuple.map(py).join(', ')}${v.tuple.length === 1 ? ',' : ''})`
    return `{${Object.entries(v).map(([k, x]) => `${py(k)}: ${py(x)}`).join(', ')}}`
  }

  const call = (fn, args) => `${fn}(${args.map(py).join(', ')})`
  // One function test. A None expectation would let the empty stub pass, so it is refused.
  function test(name, expr, want) {
    const expect = py(want)
    if (expect === 'None') throw new Error(`test '${name}' expects None`)
    return { name, setup: '', expr, expect }
  }
  const stub = (signature) => [`def ${signature}:`, '    # Write your code here', '    pass', '']
  const fence = (...rows) => ['```', ...rows, '```']
  const shown = (fn, args, want) => `${call(fn, args)}   # ${py(want)}`

  // ===================================================================== Arrays and hashing

  T.push({
    key: 'code-algo-first-repeat', section: 'algo', kind: 'code', type: 'python', topic: 'Arrays and hashing', difficulty: 'Easy',
    make(rand) {
      const frame = pick(rand, [
        { noun: 'card number', plural: 'card numbers', prefix: 'C', where: 'swiped at a store terminal today' },
        { noun: 'transaction ID', plural: 'transaction IDs', prefix: 'T', where: 'in one payment batch' },
        { noun: 'device ID', plural: 'device IDs', prefix: 'D', where: 'that signed in to online banking this hour' },
      ])
      const bySecond = rand() < 0.5 // true: the ID whose second appearance comes first; false: earliest first appearance
      const ids = new Set()
      while (ids.size < 5) ids.add(`${frame.prefix}${between(rand, 1000, 9999)}`)
      const [a, b, c, d, e] = [...ids]
      // Brute force with indexOf, nothing like the set or Counter the Python solution uses
      const solve = (xs) => {
        if (bySecond) {
          for (let j = 0; j < xs.length; j++) if (xs.indexOf(xs[j]) < j) return xs[j]
        } else {
          for (let i = 0; i < xs.length; i++) if (xs.indexOf(xs[i], i + 1) !== -1) return xs[i]
        }
        return 'NONE'
      }
      const sampleIds = [a, b, b, a, c]
      const cases = [
        ['Example', sampleIds],
        ['No IDs at all', []],
        ['A single ID', [a]],
        ['The two possible rules disagree here', [c, a, d, a, c]],
        ['The same ID twice in a row', [d, e, e]],
        ['Random batch', Array.from({ length: 8 }, () => pick(rand, [a, b, c, d]))],
      ]
      const rule = bySecond
        ? `that is the first to show up a **second** time: scan from the left and return the first one you have already seen`
        : `that repeats and whose **first** appearance is earliest: of the ${frame.plural} that appear more than once, the one that showed up first`
      const solution = bySecond
        ? ['def first_repeat(ids):', '    seen = set()', '    for x in ids:', '        if x in seen:', '            return x', '        seen.add(x)', "    return 'NONE'", '']
        : ['from collections import Counter', '', '', 'def first_repeat(ids):', '    counts = Counter(ids)', '    for x in ids:', '        if counts[x] > 1:', '            return x', "    return 'NONE'", '']
      return {
        type: 'python', difficulty: 'Easy', topic: 'Arrays and hashing', title: `First repeated ${frame.noun}`,
        prompt: [
          `\`ids\` lists the ${frame.plural} ${frame.where}, in the order they arrived. Return the ${frame.noun} ${rule}.`,
          '',
          "- If nothing repeats (including an empty list), return the string `'NONE'`.",
          '- Aim for O(n): one or two passes, not comparing every pair.',
          '',
          ...fence(shown('first_repeat', [sampleIds], solve(sampleIds))),
        ],
        starter: stub('first_repeat(ids)'),
        solution,
        tests: cases.map(([name, xs]) => test(name, call('first_repeat', [xs]), solve(xs))),
        approach: bySecond
          ? ['"Have I seen this before?" is a set lookup, O(1) each.', 'Walk the list once; the first ID already in the set is the answer.', "Add each ID after checking it. If the loop ends, return 'NONE'.", 'Time O(n), extra space O(n).']
          : ['You need to know whether an ID repeats anywhere, so count first: Counter(ids) is one O(n) pass.', 'Then walk the list in order and return the first ID whose count is above 1. That is the repeated ID that appeared earliest.', "If none has a count above 1, return 'NONE'.", 'Time O(n), extra space O(n).'],
        walkthrough: bySecond
          ? ['`seen = set()`: IDs met so far; membership checks are O(1).', '`if x in seen: return x`: the first time any ID shows up again, stop.', '`seen.add(x)`: remember it after the check, so an ID never matches itself.', "`return 'NONE'`: the loop finished without a repeat."]
          : ['`counts = Counter(ids)`: how many times each ID appears in the whole list.', '`for x in ids:`: walk in arrival order, so the earliest first appearance is found first.', '`if counts[x] > 1: return x`: the first ID that repeats somewhere later.', "`return 'NONE'`: no ID had a count above 1."],
        mistakes: [
          bySecond ? 'Returning the repeated ID that appeared first (Counter then scan): that answers a different question, and the "rules disagree" test catches it.' : 'Returning the first ID seen twice while scanning: that is the earliest second appearance, not the earliest first appearance.',
          'Two nested loops comparing every pair: correct but O(n squared).',
          "Returning None or '' instead of the string 'NONE'.",
          'Sorting the list, which loses the arrival order the answer depends on.',
        ],
        params: { bySecond, prefix: frame.prefix },
      }
    },
  })

  // ===================================================================== Two pointers

  T.push({
    key: 'code-algo-merge-feeds', section: 'algo', kind: 'code', type: 'python', topic: 'Two pointers', difficulty: 'Easy',
    make(rand) {
      const frame = pick(rand, [
        { a: 'the card network', b: 'the core ledger', unit: 'seconds after midnight', what: 'posting times' },
        { a: 'the mobile app', b: 'the branch system', unit: 'minutes after opening', what: 'deposit times' },
        { a: 'the east data center', b: 'the west data center', unit: 'milliseconds into the batch', what: 'event times' },
      ])
      const dedupe = rand() < 0.5
      const solve = (a, b) => {
        const all = [...a, ...b].sort((x, y) => x - y)
        return dedupe ? [...new Set(all)] : all
      }
      const x = sortedList(rand, 5, 1, 90)
      const sampleA = [x[0], x[2], x[4]]
      const sampleB = [x[1], x[2], x[3] + 100]
      const low = sortedList(rand, 3, 1, 40)
      const r = between(rand, 10, 60)
      const cases = [
        ['Example', [sampleA, sampleB]],
        ['One feed is empty', [[], sortedList(rand, 3, 1, 50)]],
        ['Both feeds empty', [[], []]],
        ['Every time in the first feed comes first', [low, low.map((v) => v + 100)]],
        ['Repeats inside one feed and across feeds', [[r, r, r + 4], [r, r + 9]]],
        ['Random feeds', [sortedList(rand, between(rand, 3, 6), 1, 20), sortedList(rand, between(rand, 3, 6), 1, 20)]],
      ]
      const take = dedupe ? 'add' : 'out.append'
      const solution = dedupe
        ? ['def merge_feeds(a, b):', '    out = []', '', '    def add(x):', '        if not out or out[-1] != x:     # sorted, so a repeat can only match the last value', '            out.append(x)', '',
          '    i = j = 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            add(a[i])', '            i += 1', '        else:', '            add(b[j])', '            j += 1',
          '    for x in a[i:] + b[j:]:          # only one side can have values left', '        add(x)', '    return out', '']
        : ['def merge_feeds(a, b):', '    out = []', '    i = j = 0', '    while i < len(a) and j < len(b):', '        if a[i] <= b[j]:', '            out.append(a[i])', '            i += 1', '        else:', '            out.append(b[j])', '            j += 1',
          '    out.extend(a[i:])                 # one side may have values left', '    out.extend(b[j:])', '    return out', '']
      return {
        type: 'python', difficulty: 'Easy', topic: 'Two pointers', title: dedupe ? 'Merge two sorted feeds without repeats' : 'Merge two sorted feeds',
        prompt: [
          `Two systems, ${frame.a} and ${frame.b}, each send a list of ${frame.what} (whole ${frame.unit}), already sorted from earliest to latest. Return one list with every time from both, sorted from earliest to latest.`,
          '',
          dedupe ? '- A time that appears more than once (in one feed or in both) is the same event: keep it **once**.' : '- Keep **every** time, including repeats: if both feeds have the same time, it appears twice.',
          '- Either list may be empty.',
          '- Use the fact that both lists are sorted: walk them with two pointers in O(n + m) rather than sorting everything again.',
          '',
          ...fence(shown('merge_feeds', [sampleA, sampleB], solve(sampleA, sampleB))),
        ],
        starter: stub('merge_feeds(a, b)'),
        solution,
        tests: cases.map(([name, [a, b]]) => test(name, call('merge_feeds', [a, b]), solve(a, b))),
        approach: [
          'Two sorted inputs means two pointers: compare a[i] with b[j] and take the smaller one.',
          'Move only the pointer you took from. When one list runs out, everything left in the other is already in order.',
          dedupe ? 'To drop repeats, only append a value if it differs from the last value in the output. Because the output is sorted, that one check is enough.' : 'Ties can go either way; taking from a first with <= keeps the merge stable.',
          'Time O(n + m), and the output list is the only extra space.',
        ],
        walkthrough: [
          '`i = j = 0`: one pointer into each list.',
          '`while i < len(a) and j < len(b):`: compare only while both lists still have values.',
          `\`if a[i] <= b[j]: ${take}(a[i])\`: the smaller front value goes next.`,
          dedupe ? '`if not out or out[-1] != x:`: a value equal to the last one written is a repeat, so it is skipped.' : '`out.extend(a[i:])` and `out.extend(b[j:])`: copy whatever is left; one of the two slices is empty.',
          '`return out`: an empty list when both inputs are empty, never None.',
        ],
        mistakes: [
          'return sorted(a + b): gives the right values but ignores the sorted inputs, O((n + m) log(n + m)).',
          'Forgetting the leftovers after the loop, so the tail of the longer list goes missing.',
          dedupe ? 'Using set(a + b) without sorting again: sets have no order.' : 'Dropping repeats with a set, when this version keeps every time.',
          'Advancing both pointers when the values are equal, which loses a copy in the keep-all version.',
        ],
        params: { dedupe },
      }
    },
  })

  // ===================================================================== Sliding window

  T.push({
    key: 'code-algo-shortest-streak', section: 'algo', kind: 'code', type: 'python', topic: 'Sliding window', difficulty: 'Medium',
    make(rand) {
      const frame = pick(rand, [
        { list: 'deposits', title: 'Fewest days to reach a savings goal', story: 'A customer makes one deposit a day into a savings goal (whole dollars, all positive).', goal: 'savings goal' },
        { list: 'spend', title: 'Shortest stretch of heavy card spend', story: 'A card shows one total spend per day (whole dollars, all positive). Fraud review looks for short bursts of spend.', goal: 'review threshold' },
        { list: 'inflows', title: 'Shortest run of inflows to cover a payment', story: 'A business account receives one inflow per day (whole dollars, all positive).', goal: 'payment amount' },
      ])
      const strict = rand() < 0.5
      const meets = (s, t) => (strict ? s > t : s >= t)
      // Brute force: every start, extend until the total meets the target
      const solve = (xs, t) => {
        let best = 0
        for (let i = 0; i < xs.length; i++) {
          let s = 0
          for (let j = i; j < xs.length; j++) {
            s += xs[j]
            if (meets(s, t)) {
              if (!best || j - i + 1 < best) best = j - i + 1
              break
            }
          }
        }
        return best
      }
      let sample = randList(rand, 7, 2, 15)
      let target = between(rand, 18, 35)
      for (let k = 0; k < 30 && solve(sample, target) < 2; k++) {
        sample = randList(rand, 7, 2, 15)
        target = between(rand, 18, 35)
      }
      const T0 = between(rand, 20, 60)
      const whole = randList(rand, 4, 1, 9)
      const total = whole.reduce((s, v) => s + v, 0)
      const tiny = randList(rand, 3, 1, 5)
      const cases = [
        ['Example', [sample, target]],
        ['No days at all', [[], T0]],
        [strict ? 'Landing exactly on the target is not enough' : 'Landing exactly on the target counts', [[T0, 1], T0]],
        ['The target is never reached', [tiny, tiny.reduce((s, v) => s + v, 0) + between(rand, 1, 10)]],
        ['Only the whole list works', [whole, strict ? total - 1 : total]],
        ['Random days', [randList(rand, 9, 1, 20), between(rand, 15, 60)]],
      ]
      const cmp = strict ? '>' : '>='
      const word = strict ? 'more than' : 'at least'
      const xs = frame.list
      return {
        type: 'python', difficulty: 'Medium', topic: 'Sliding window', title: frame.title,
        prompt: [
          `${frame.story} Given the list \`${xs}\` and the ${frame.goal} \`target\`, return the **smallest number of consecutive days** whose total is **${word}** \`target\`.`,
          '',
          '- If no run of days gets there (or the list is empty), return `0`.',
          '- Aim for O(n) with a sliding window, not every start and end pair.',
          '',
          ...fence(shown('shortest_streak', [sample, target], solve(sample, target))),
        ],
        starter: stub(`shortest_streak(${xs}, target)`),
        solution: [
          `def shortest_streak(${xs}, target):`,
          `    best = len(${xs}) + 1          # longer than any real window`,
          '    total = 0',
          '    left = 0',
          `    for right, x in enumerate(${xs}):`,
          '        total += x',
          `        while total ${cmp} target:         # shrink from the left while the window still qualifies`,
          '            best = min(best, right - left + 1)',
          `            total -= ${xs}[left]`,
          '            left += 1',
          `    return best if best <= len(${xs}) else 0`,
          '',
        ],
        tests: cases.map(([name, [vals, t]]) => test(name, call('shortest_streak', [vals, t]), solve(vals, t))),
        approach: [
          'Consecutive days plus all-positive values: a sliding window. Adding a day can only raise the total and dropping one can only lower it.',
          'Grow the window on the right. As soon as the total qualifies, record its length and shrink from the left while it still qualifies.',
          `Read the comparison: "${word}" is ${cmp}.`,
          'Each day enters and leaves the window once, so time is O(n) with O(1) extra space.',
        ],
        walkthrough: [
          `\`best = len(${xs}) + 1\`: a value no real window can reach, so you can tell "never found" apart at the end.`,
          '`total += x`: extend the window to include the new day.',
          `\`while total ${cmp} target:\`: the window qualifies; try to make it shorter.`,
          `\`total -= ${xs}[left]\`: drop the oldest day, then move left forward.`,
          `\`return best if best <= len(${xs}) else 0\`: 0 when nothing qualified, including the empty list.`,
        ],
        mistakes: [
          strict ? 'Using >= when the rule is "more than", so a day exactly at the target counts.' : 'Using > when the rule is "at least", so a day exactly at the target does not count.',
          'Using if instead of while to shrink, which can miss a shorter window after one big day.',
          'Returning len + 1 or infinity instead of 0 when the target is never reached.',
          'Checking every start and end pair: correct but O(n squared).',
        ],
        params: { strict },
      }
    },
  })

  // ===================================================================== Stack

  T.push({
    key: 'code-algo-wait-higher', section: 'algo', kind: 'code', type: 'python', topic: 'Stack', difficulty: 'Medium',
    make(rand) {
      const frame = pick(rand, [
        { what: 'closing balance of a savings account', values: 'balances', unit: 'dollars' },
        { what: "closing price of the bank's stock", values: 'prices', unit: 'dollars' },
        { what: 'mortgage rate offered that day', values: 'rates', unit: 'basis points' },
      ])
      const strict = rand() < 0.5
      const better = (later, now) => (strict ? later > now : later >= now)
      const solve = (xs) => xs.map((v, i) => {
        for (let j = i + 1; j < xs.length; j++) if (better(xs[j], v)) return j - i
        return 0
      })
      const sample = randList(rand, 6, 1, 9)
      const v = between(rand, 10, 99)
      const top = between(rand, 50, 99)
      const cases = [
        ['Example', sample],
        ['No days', []],
        ['A single day', [between(rand, 1, 99)]],
        ['Every day the same', [v, v, v, v]],
        ['Falling every day', [top, top - between(rand, 1, 9), top - 15, top - between(rand, 20, 30)]],
        ['Random days', randList(rand, 9, 1, 8)],
      ]
      const word = strict ? 'strictly higher than' : 'at least as high as'
      const pop = strict ? '<' : '<='
      const xs = frame.values
      return {
        type: 'python', difficulty: 'Medium', topic: 'Stack', title: strict ? 'Days until a higher value' : 'Days until the value is matched or beaten',
        prompt: [
          `\`${xs}\` holds the ${frame.what}, one number per day (in ${frame.unit}). For each day, return how many days you have to wait until a later day whose value is **${word}** that day's. If no later day qualifies, use \`0\`.`,
          '',
          '- Return a list the same length as the input; an empty input gives an empty list.',
          '- Aim for O(n) with a stack, not a scan forward from every day.',
          '',
          ...fence(shown('wait_days', [sample], solve(sample))),
        ],
        starter: stub(`wait_days(${xs})`),
        solution: [
          `def wait_days(${xs}):`,
          `    answer = [0] * len(${xs})`,
          '    stack = []                         # positions still waiting for an answer',
          `    for i, v in enumerate(${xs}):`,
          `        while stack and ${xs}[stack[-1]] ${pop} v:`,
          '            j = stack.pop()',
          '            answer[j] = i - j',
          '        stack.append(i)',
          '    return answer',
          '',
        ],
        tests: cases.map(([name, vals]) => test(name, call('wait_days', [vals]), solve(vals))),
        approach: [
          '"The next later item that beats this one" is the classic monotonic stack pattern.',
          "Keep a stack of days that have not found their answer yet. When today beats the day on top, today is that day's answer: pop it and record the gap. Keep popping while today still beats the top.",
          `The comparison decides ties: "${word}" means pop while the waiting value is ${pop} today's.`,
          'Each day is pushed and popped at most once, so time is O(n); the stack and answer use O(n) space.',
        ],
        walkthrough: [
          `\`answer = [0] * len(${xs})\`: days that never find a match keep their 0.`,
          '`stack = []`: positions, not values, so you can compute the gap.',
          `\`while stack and ${xs}[stack[-1]] ${pop} v:\`: today settles every waiting day it beats.`,
          '`answer[j] = i - j`: the number of days waited.',
          '`stack.append(i)`: today now waits for its own answer.',
        ],
        mistakes: [
          strict ? 'Popping on <= so an equal later value counts as higher; the "every day the same" test catches it.' : 'Popping only on <, so an equal later value is ignored even though "at least as high" should count it.',
          'Storing values on the stack instead of positions, so the gap cannot be computed.',
          'Returning the later value (or its position) instead of the number of days to wait.',
          'A nested loop forward from every day: O(n squared) on a long falling run.',
        ],
        params: { strict },
      }
    },
  })

  // ===================================================================== Binary search

  T.push({
    key: 'code-algo-daily-limit', section: 'algo', kind: 'code', type: 'python', topic: 'Binary search', difficulty: 'Medium',
    make(rand) {
      const frame = pick(rand, [
        { items: 'wire transfers', unit: 'thousand dollars', who: 'The treasury desk' },
        { items: 'payroll files', unit: 'thousand dollars', who: 'The payroll team' },
        { items: 'vendor invoices', unit: 'hundred dollars', who: 'Accounts payable' },
      ])
      const days = between(rand, 2, 4)
      const fits = (xs, limit, d) => {
        let used = 1
        let today = 0
        for (const x of xs) {
          if (today + x > limit) {
            used++
            today = 0
          }
          today += x
        }
        return used <= d
      }
      // Linear scan over every limit from the largest single item up, not a binary search
      const solve = (xs, d) => {
        if (!xs.length) return 0
        let limit = Math.max(...xs)
        while (!fits(xs, limit, d)) limit++
        return limit
      }
      const sample = randList(rand, 7, 1, 12)
      const each = randList(rand, 5, 1, 20)
      const cases = [
        ['Example', [sample, days]],
        ['No items to send', [[], days]],
        ['A single item', [[between(rand, 5, 40)], between(rand, 1, 3)]],
        ['Only one day: the limit is the total', [randList(rand, 5, 1, 20), 1]],
        ['A day per item: the limit is the largest item', [each, each.length]],
        ['Random batch', [randList(rand, 9, 1, 25), between(rand, 2, 5)]],
      ]
      return {
        type: 'python', difficulty: 'Medium', topic: 'Binary search', title: `Smallest daily limit to send ${frame.items}`,
        prompt: [
          `${frame.who} must send a queue of ${frame.items}, \`amounts\` (in ${frame.unit}), **in the given order**, within \`days\` days. Each day it sends the next few items in the queue, and the total sent in one day can't go over the daily limit. An item is never split across days.`,
          '',
          'Return the **smallest whole-number daily limit** that gets everything sent within `days` days.',
          '',
          '- With no items, return `0`.',
          '- Aim for O(n log S), where S is the total: binary search on the limit and check each guess in one pass.',
          '',
          ...fence(shown('min_daily_limit', [sample, days], solve(sample, days))),
        ],
        starter: stub('min_daily_limit(amounts, days)'),
        solution: [
          'def min_daily_limit(amounts, days):',
          '    if not amounts:',
          '        return 0',
          '',
          '    def days_needed(limit):',
          '        used, today = 1, 0',
          '        for x in amounts:',
          '            if today + x > limit:      # this item starts a new day',
          '                used += 1',
          '                today = 0',
          '            today += x',
          '        return used',
          '',
          '    lo, hi = max(amounts), sum(amounts)  # the answer is always in this range',
          '    while lo < hi:',
          '        mid = (lo + hi) // 2',
          '        if days_needed(mid) <= days:',
          '            hi = mid                   # mid works; maybe something smaller does too',
          '        else:',
          '            lo = mid + 1',
          '    return lo',
          '',
        ],
        tests: cases.map(([name, [xs, d]]) => test(name, call('min_daily_limit', [xs, d]), solve(xs, d))),
        approach: [
          'You are asked for the smallest value that makes a yes/no check pass, and a bigger limit never hurts. That is binary search on the answer.',
          'The limit is at least the largest item (it must fit in a day) and at most the total (everything in one day).',
          'For a guess, fill each day greedily in order and count the days used. If that is within `days`, try smaller; otherwise go larger.',
          'Each check is O(n) and there are O(log S) guesses, so time is O(n log S) with O(1) extra space.',
        ],
        walkthrough: [
          '`if not amounts: return 0`: max() of an empty list would raise ValueError.',
          '`days_needed(limit)`: greedy fill; an item that would push today over the limit starts a new day.',
          '`lo, hi = max(amounts), sum(amounts)`: the tightest safe range for the answer.',
          '`if days_needed(mid) <= days: hi = mid`: keep mid, because it might be the answer.',
          '`else: lo = mid + 1`: mid is too small, so rule it out.',
          '`return lo`: lo and hi meet at the smallest limit that works.',
        ],
        mistakes: [
          'Starting the search at 1 instead of max(amounts): a limit below the largest item can never work, and the greedy check miscounts it.',
          'Writing hi = mid - 1 when mid works, which can skip the answer.',
          'Sorting the amounts: the order is fixed, and sorting changes which items share a day.',
          'Trying every limit from the largest item upward: correct but O(n times S).',
        ],
        params: { days },
      }
    },
  })

  // ===================================================================== Intervals

  T.push({
    key: 'code-algo-staff-needed', section: 'algo', kind: 'code', type: 'python', topic: 'Intervals', difficulty: 'Medium',
    make(rand) {
      const frame = pick(rand, [
        { staff: 'tellers', visit: 'customer visit', where: 'at a branch' },
        { staff: 'loan officers', visit: 'loan appointment', where: 'at the mortgage center' },
        { staff: 'video banking agents', visit: 'video call', where: 'on the support line' },
      ])
      const touching = rand() < 0.5 // true: a visit ending at t and one starting at t need two people
      // The busiest moment is always at some visit's start: count the visits covering each start
      const solve = (vs) => {
        let best = 0
        for (const [s] of vs) {
          const n = vs.filter(([a, b]) => a <= s && (touching ? s <= b : s < b)).length
          if (n > best) best = n
        }
        return best
      }
      const visit = (lo, hi) => {
        const s = between(rand, lo, hi)
        return [s, s + between(rand, 5, 40)]
      }
      const sample = Array.from({ length: 5 }, () => visit(0, 60))
      const s0 = between(rand, 0, 30)
      const l1 = between(rand, 10, 30)
      const l2 = between(rand, 10, 30)
      const n0 = between(rand, 0, 20)
      const cases = [
        ['Example', sample],
        ['No visits', []],
        ['A single visit', [visit(0, 100)]],
        [touching ? 'Back to back visits need two people' : 'Back to back visits can share one person', [[s0, s0 + l1], [s0 + l1, s0 + l1 + l2]]],
        ['All visits overlap', shuffle(rand, [[n0, n0 + 60], [n0 + 5, n0 + 20], [n0 + 10, n0 + 50]])],
        ['Random day', Array.from({ length: 8 }, () => visit(0, 90))],
      ]
      const freeOp = touching ? '<' : '<='
      return {
        type: 'python', difficulty: 'Medium', topic: 'Intervals', title: `How many ${frame.staff} are needed`,
        prompt: [
          `Each ${frame.visit} ${frame.where} is \`[start, end]\` in minutes after opening, with \`start < end\`. One person handles one ${frame.visit} at a time. Return the **smallest number of ${frame.staff}** needed so that no ${frame.visit} waits.`,
          '',
          touching
            ? `- Someone who finishes at minute \`t\` needs a moment to reset, so they **cannot** take a ${frame.visit} that starts at minute \`t\`. Two that only touch still overlap.`
            : `- Someone who finishes at minute \`t\` **can** take a ${frame.visit} that starts at minute \`t\`. Two that only touch do not overlap.`,
          '- The visits are not in any particular order. With no visits, return `0`.',
          '- Aim for O(n log n).',
          '',
          ...fence(shown('staff_needed', [sample], solve(sample))),
        ],
        starter: stub('staff_needed(visits)'),
        solution: [
          'import heapq',
          '',
          '',
          'def staff_needed(visits):',
          '    busy = []                          # end times of visits in progress (a min-heap)',
          '    best = 0',
          '    for start, end in sorted(visits):',
          `        while busy and busy[0] ${freeOp} start:   # these people are free again`,
          '            heapq.heappop(busy)',
          '        heapq.heappush(busy, end)',
          '        best = max(best, len(busy))',
          '    return best',
          '',
        ],
        tests: cases.map(([name, vs]) => test(name, call('staff_needed', [vs]), solve(vs))),
        approach: [
          'The answer is the largest number of visits happening at the same moment.',
          'Sort by start time. Keep a min-heap of end times for visits in progress, so the person who frees up first is on top.',
          `Before each new visit, pop every visit that has ended. The boundary rule decides the comparison: free when end ${freeOp} start.`,
          'The heap size after pushing is how many people are busy right now; track the maximum. Sorting is O(n log n) and each heap step is O(log n).',
        ],
        walkthrough: [
          '`for start, end in sorted(visits):`: handle visits in the order they begin.',
          `\`while busy and busy[0] ${freeOp} start:\`: release everyone whose visit is over by this start.`,
          '`heapq.heappush(busy, end)`: the new visit takes a person until its end.',
          '`best = max(best, len(busy))`: the most people busy at once so far.',
          '`return best`: 0 when there are no visits, since the loop never runs.',
        ],
        mistakes: [
          touching ? 'Freeing a person when end <= start, so back to back visits share someone even though they need a reset.' : 'Freeing a person only when end < start, so back to back visits wrongly need two people.',
          'Forgetting to sort first: the visits arrive in no particular order.',
          'Counting how many visits overlap any other visit, instead of the most at one moment.',
          'Comparing every pair of visits: O(n squared), and it still does not give the peak count directly.',
        ],
        params: { touching },
      }
    },
  })

  // ===================================================================== Greedy

  T.push({
    key: 'code-algo-trading-profit', section: 'algo', kind: 'code', type: 'python', topic: 'Greedy', difficulty: 'Easy',
    make(rand) {
      const frame = pick(rand, [
        { asset: 'one share of a bank stock', what: 'closing prices', unit: 'dollars' },
        { asset: 'one unit of a money market fund', what: 'daily prices', unit: 'cents' },
        { asset: 'one lot of euros on the FX desk', what: 'daily exchange rates', unit: 'hundredths of a cent' },
      ])
      const newestFirst = rand() < 0.5
      // Day by day state machine over (cash, holding), a different method from summing rises
      const best = (chrono) => {
        let cash = 0
        let hold = -Infinity
        for (const p of chrono) {
          const nextCash = Math.max(cash, hold + p)
          hold = Math.max(hold, cash - p)
          cash = nextCash
        }
        return cash
      }
      const solve = (xs) => best(newestFirst ? [...xs].reverse() : xs)
      const order = (chrono) => (newestFirst ? [...chrono].reverse() : chrono)
      const sample = randList(rand, 7, 1, 12)
      const top = between(rand, 40, 90)
      const falling = [top, top - between(rand, 1, 5), top - 10, top - between(rand, 11, 20)]
      const flat = between(rand, 5, 50)
      const cases = [
        ['Example', sample],
        ['No prices', []],
        ['A single day', [between(rand, 1, 99)]],
        ['Prices only fall over time: no trade pays', order(falling)],
        ['Flat prices', [flat, flat, flat]],
        ['Random prices', randList(rand, 9, 1, 30)],
      ]
      const solution = newestFirst
        ? ['def max_profit(prices):', '    days = prices[::-1]                # oldest first, so time runs forward', '    profit = 0', '    for i in range(1, len(days)):', '        if days[i] > days[i - 1]:', '            profit += days[i] - days[i - 1]', '    return profit', '']
        : ['def max_profit(prices):', '    profit = 0', '    for i in range(1, len(prices)):', '        if prices[i] > prices[i - 1]:     # take every daily rise', '            profit += prices[i] - prices[i - 1]', '    return profit', '']
      const v = newestFirst ? 'days' : 'prices'
      return {
        type: 'python', difficulty: 'Easy', topic: 'Greedy', title: newestFirst ? 'Trading profit from a newest-first price feed' : 'Trading profit with unlimited trades',
        prompt: [
          `\`prices\` holds the ${frame.what} for ${frame.asset} (in ${frame.unit}), ${newestFirst ? '**newest first**: prices[0] is today and the last item is the oldest day' : 'oldest first: prices[0] is the first day'}. You may buy and sell as many times as you like, but you can hold at most one unit at a time, and you must buy before you sell. Selling and buying again on the same day is allowed.`,
          '',
          'Return the **largest total profit** you could have made. If no trade makes money (or there are fewer than two days), return `0`.',
          '',
          '- Aim for one pass, O(n).',
          '',
          ...fence(shown('max_profit', [sample], solve(sample))),
        ],
        starter: stub('max_profit(prices)'),
        solution,
        tests: cases.map(([name, xs]) => test(name, call('max_profit', [xs]), solve(xs))),
        approach: [
          newestFirst ? 'First read the order: the feed is newest first, so reverse it (or compare each price with the one after it) before thinking in time order.' : 'Trades are unlimited, so you never need to pick which rises to take: take all of them.',
          'Greedy idea: any profitable stretch from a low to a high equals the sum of the daily rises inside it. So add up every day-over-day increase and ignore the drops.',
          'Falling or flat prices add nothing, which gives 0 automatically.',
          'One pass, time O(n), extra space O(1) (O(n) if you copy the reversed list).',
        ],
        walkthrough: [
          newestFirst ? '`days = prices[::-1]`: puts the prices in time order, oldest first.' : '`profit = 0`: making no trade at all is always allowed.',
          `\`for i in range(1, len(${v})):\`: compares each day with the day before; with 0 or 1 days the loop never runs.`,
          `\`if ${v}[i] > ${v}[i - 1]:\`: a rise you could capture by holding over that day.`,
          `\`profit += ${v}[i] - ${v}[i - 1]\`: add the rise.`,
          '`return profit`: 0 when nothing rose.',
        ],
        mistakes: [
          newestFirst ? 'Treating the list as oldest first: every rise becomes a fall, and the falling-prices test returns a profit.' : 'Solving the one-trade version (max of price minus earlier minimum), which misses later trades.',
          'Adding the drops as negative numbers instead of skipping them.',
          'Crashing on an empty list by reading prices[0].',
          'Searching every buy and sell pair: O(n squared) and still only one trade.',
        ],
        params: { newestFirst },
      }
    },
  })

  // ===================================================================== Trees

  const TREE_HELPERS = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val = val',
    '        self.left = left',
    '        self.right = right',
    '',
    '',
    'def build(values):',
    '    # Builds a tree from a level-order list; None marks a missing child',
    '    if not values or values[0] is None:',
    '        return None',
    '    root = TreeNode(values[0])',
    '    queue = [root]',
    '    i = 1',
    '    for node in queue:',
    '        if i >= len(values):',
    '            break',
    '        if values[i] is not None:',
    '            node.left = TreeNode(values[i])',
    '            queue.append(node.left)',
    '        i += 1',
    '        if i < len(values) and values[i] is not None:',
    '            node.right = TreeNode(values[i])',
    '            queue.append(node.right)',
    '        i += 1',
    '    return root',
    '',
    '',
  ]

  // Level-order list with null for missing children and no trailing nulls (the format build() reads)
  function levelOrder(root) {
    if (!root) return []
    const out = [root.val]
    const queue = [root]
    for (let i = 0; i < queue.length; i++) {
      for (const child of [queue[i].left, queue[i].right]) {
        out.push(child ? child.val : null)
        if (child) queue.push(child)
      }
    }
    while (out.length && out[out.length - 1] === null) out.pop()
    return out
  }

  T.push({
    key: 'code-algo-richest-level', section: 'algo', kind: 'code', type: 'python', topic: 'Trees', difficulty: 'Medium',
    make(rand) {
      const frame = pick(rand, [
        { tree: "A corporate client's accounts", node: 'account', value: 'balance' },
        { tree: "A bank's regions, districts and branches", node: 'office', value: 'monthly net revenue' },
        { tree: 'A family trust and its sub-trusts', node: 'trust', value: 'net cash flow this quarter' },
      ])
      const deepestOnTie = rand() < 0.5
      const randomTree = (size, lo, hi) => {
        const root = { val: between(rand, lo, hi) }
        const nodes = [root]
        while (nodes.length < size) {
          const parent = pick(rand, nodes)
          const side = rand() < 0.5 ? 'left' : 'right'
          if (!parent[side]) {
            parent[side] = { val: between(rand, lo, hi) }
            nodes.push(parent[side])
          }
        }
        return root
      }
      // Depth-first sums per level (the Python solution goes breadth first)
      const solve = (root) => {
        const sums = []
        const walk = (node, depth) => {
          if (!node) return
          sums[depth] = (sums[depth] || 0) + node.val
          walk(node.left, depth + 1)
          walk(node.right, depth + 1)
        }
        walk(root, 0)
        let bestLevel = 0
        sums.forEach((s, d) => {
          if (!bestLevel || s > sums[bestLevel - 1] || (deepestOnTie && s === sums[bestLevel - 1])) bestLevel = d + 1
        })
        return bestLevel
      }
      const sample = randomTree(7, -5, 20)
      const a = between(rand, 1, 20)
      const b = between(rand, 1, 20)
      const tie = { val: a + b, left: { val: a }, right: { val: b } }
      const neg = { val: -between(rand, 5, 20), left: { val: between(rand, 1, 10), right: { val: -between(rand, 1, 5) } }, right: { val: between(rand, 1, 10) } }
      const cases = [
        ['Example', sample],
        ['Empty tree', null],
        ['Only the root', { val: between(rand, -9, 50) }],
        ['Two levels tie', tie],
        ['Negative values', neg],
        ['Random tree', randomTree(between(rand, 7, 11), -10, 30)],
      ]
      const beats = deepestOnTie ? '>=' : '>'
      const expr = (root) => `richest_level(build(${py(levelOrder(root))}))`
      return {
        type: 'python', difficulty: 'Medium', topic: 'Trees', title: `Level with the largest total ${frame.value}`,
        prompt: [
          `${frame.tree} form a binary tree: each ${frame.node} has a ${frame.value} (\`val\`, in thousand dollars, possibly negative) and up to two children. The root is level 1, its children are level 2, and so on.`,
          '',
          `Return the **level number whose ${frame.node}s add up to the largest total**. If two or more levels tie, return the **${deepestOnTie ? 'deepest (largest level number)' : 'shallowest (smallest level number)'}** one. An empty tree (\`root\` is \`None\`) returns \`0\`.`,
          '',
          'The `TreeNode` class and a `build(values)` helper are provided. `build` takes a level-order list with `None` for missing children. Aim for O(n), visiting each node once.',
          '',
          ...fence(`${expr(sample)}   # ${solve(sample)}`),
        ],
        starter: [...TREE_HELPERS, ...stub('richest_level(root)')],
        solution: [
          ...TREE_HELPERS,
          'def richest_level(root):',
          '    if root is None:',
          '        return 0',
          '    best_level, best_total = 0, None',
          '    level = 0',
          '    current = [root]',
          '    while current:',
          '        level += 1',
          '        total = sum(node.val for node in current)',
          `        if best_total is None or total ${beats} best_total:`,
          '            best_level, best_total = level, total',
          '        current = [child for node in current for child in (node.left, node.right) if child is not None]',
          '    return best_level',
          '',
        ],
        tests: cases.map(([name, root]) => test(name, expr(root), solve(root))),
        approach: [
          'Anything "per level" is a breadth-first traversal: process the tree one level at a time.',
          'Keep the list of nodes on the current level, add up their values, then build the next level from their children.',
          `Start the best total at None, not 0, because every level can be negative. The tie rule is the comparison: ${beats} keeps the ${deepestOnTie ? 'later' : 'earlier'} level.`,
          'Each node is visited once: time O(n), and the widest level sets the extra space.',
        ],
        walkthrough: [
          '`if root is None: return 0`: the empty tree has no levels.',
          '`current = [root]`: level 1 is just the root.',
          '`total = sum(node.val for node in current)`: the total for this level.',
          `\`if best_total is None or total ${beats} best_total:\`: ${deepestOnTie ? '>= lets a later level win a tie' : 'strict > keeps the earlier level on a tie'}.`,
          '`current = [child for node in current ...]`: the next level, skipping missing children.',
        ],
        mistakes: [
          'Starting best_total at 0, so a tree where every level is negative returns the wrong level (or 0).',
          deepestOnTie ? 'Using > for the comparison, which keeps the shallower level on a tie.' : 'Using >= for the comparison, which moves to the deeper level on a tie.',
          'Numbering levels from 0 when the root is level 1.',
          'Depth-first recursion that sums whole paths instead of whole levels.',
        ],
        params: { deepestOnTie },
      }
    },
  })

  // ===================================================================== Graphs

  T.push({
    key: 'code-algo-cheapest-route', section: 'algo', kind: 'code', type: 'python', topic: 'Graphs', difficulty: 'Hard',
    make(rand) {
      const frame = pick(rand, [
        { nodes: 'correspondent banks', edge: 'wire hop', fee: 'fee' },
        { nodes: 'payment networks', edge: 'network handoff', fee: 'routing fee' },
        { nodes: 'currency desks', edge: 'conversion step', fee: 'spread cost' },
      ])
      const byStops = rand() < 0.5 // the limit counts places in between instead of hops
      const param = byStops ? 'max_stops' : 'max_hops'
      const maxEdges = (k) => (byStops ? k + 1 : k)
      // Try every simple path with depth-first search (the Python solution relaxes edges round by round)
      const solve = (n, edges, src, dst, k) => {
        const limit = maxEdges(k)
        let best = Infinity
        const seen = new Set([src])
        const walk = (node, cost, used) => {
          if (node === dst) {
            best = Math.min(best, cost)
            return
          }
          if (used === limit) return
          for (const [a, b, f] of edges) {
            if (a !== node || seen.has(b)) continue
            seen.add(b)
            walk(b, cost + f, used + 1)
            seen.delete(b)
          }
        }
        walk(src, 0, 0)
        return best === Infinity ? -1 : best
      }
      const fee = () => between(rand, 1, 9)
      const randomGraph = (n, m) => {
        const pairs = []
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b) pairs.push([a, b])
        return shuffle(rand, pairs).slice(0, m).map(([a, b]) => [a, b, between(rand, 1, 20)])
      }
      // A hop count written in the limit's own units: k hops, or k - 1 stops
      const lim = (hops) => (byStops ? hops - 1 : hops)
      const [c1, c2, c3] = [fee(), fee(), fee()]
      const sample = [[0, 1, c1], [1, 2, c2], [2, 3, c3], [0, 2, c1 + c2 + between(rand, 1, 5)], [0, 3, c1 + c2 + c3 + between(rand, 6, 15)]]
      const chain = [[0, 1, fee()], [1, 2, fee()], [2, 3, fee()], [0, 3, 40 + between(rand, 0, 20)]]
      const n6 = between(rand, 5, 6)
      const sampleArgs = [4, shuffle(rand, sample), 0, 3, lim(2)]
      const cases = [
        ['Example', sampleArgs],
        ['Fees only go one way, so the target is unreachable', [3, [[0, 1, fee()], [2, 0, fee()], [1, 0, fee()]], 0, 2, lim(2)]],
        ['Sending to the same place costs nothing', [3, [[0, 1, fee()], [1, 2, fee()]], 1, 1, lim(1)]],
        ['The limit is too tight to get there', [3, [[0, 1, fee()], [1, 2, fee()]], 0, 2, lim(1)]],
        ['More hops are cheaper when the limit allows', [4, chain, 0, 3, lim(3)]],
        ['Random network', [n6, randomGraph(n6, between(rand, 7, 10)), 0, n6 - 1, lim(between(rand, 2, 3))]],
      ]
      const rounds = byStops ? 'max_stops + 1' : 'max_hops'
      return {
        type: 'python', difficulty: 'Hard', topic: 'Graphs', title: `Cheapest route between ${frame.nodes} with a ${byStops ? 'stop' : 'hop'} limit`,
        prompt: [
          `There are \`n\` ${frame.nodes}, numbered \`0\` to \`n - 1\`. Each item of \`fees\` is \`[a, b, f]\`: money can move **from** \`a\` **to** \`b\` in one ${frame.edge} for a ${frame.fee} of \`f\` (one direction only, \`f > 0\`).`,
          '',
          byStops
            ? `Return the cheapest total ${frame.fee} to move money from \`src\` to \`dst\` passing through **at most \`max_stops\` ${frame.nodes} in between** (not counting \`src\` and \`dst\`).`
            : `Return the cheapest total ${frame.fee} to move money from \`src\` to \`dst\` using **at most \`max_hops\`** ${frame.edge}s.`,
          '',
          "- If it can't be done within the limit, return `-1`.",
          '- If `src == dst`, the cost is `0`.',
          `- Aim for O(k times E), where E is the number of fees and k is the ${byStops ? 'stop' : 'hop'} limit.`,
          '',
          ...fence(shown('cheapest_route', sampleArgs, solve(...sampleArgs))),
        ],
        starter: stub(`cheapest_route(n, fees, src, dst, ${param})`),
        solution: [
          `def cheapest_route(n, fees, src, dst, ${param}):`,
          "    INF = float('inf')",
          '    cost = [INF] * n',
          '    cost[src] = 0',
          `    for _ in range(${rounds}):${byStops ? '          # k stops in between means k + 1 hops' : ''}`,
          '        new_cost = cost[:]             # copy, so one round adds at most one hop',
          '        for a, b, f in fees:',
          '            if cost[a] + f < new_cost[b]:',
          '                new_cost[b] = cost[a] + f',
          '        cost = new_cost',
          '    return cost[dst] if cost[dst] < INF else -1',
          '',
        ],
        tests: cases.map(([name, args]) => test(name, call('cheapest_route', args), solve(...args))),
        approach: [
          'A hop limit breaks plain Dijkstra: the cheapest path may use too many hops, and a pricier path with fewer hops may be the real answer.',
          `Use Bellman-Ford limited to ${byStops ? 'max_stops + 1 rounds (k stops in between is k + 1 hops)' : 'max_hops rounds'}: after round r, cost[v] is the cheapest way to reach v in at most r hops.`,
          "Relax every fee in each round from a copy of the previous round, so a single round can't chain two hops together.",
          'Time O(k times E), extra space O(n).',
        ],
        walkthrough: [
          '`cost[src] = 0`: zero hops reach only the start, for free.',
          `\`for _ in range(${rounds}):\`: one round per allowed hop.`,
          '`new_cost = cost[:]`: read from last round, write to this one.',
          '`if cost[a] + f < new_cost[b]:`: using this fee as the last hop is cheaper.',
          '`return cost[dst] if cost[dst] < INF else -1`: never reached within the limit means -1.',
        ],
        mistakes: [
          'Updating cost in place during a round, which lets one round use several hops and breaks the limit.',
          byStops ? 'Running max_stops rounds instead of max_stops + 1: stops count the places in between, not the hops.' : 'Running max_hops + 1 rounds, which allows one hop too many.',
          'Plain Dijkstra that ignores the limit and returns the cheapest path overall.',
          'Treating the fees as two-way: money only moves from a to b.',
        ],
        params: { byStops },
      }
    },
  })

  // ===================================================================== Dynamic programming

  T.push({
    key: 'code-algo-k-trades', section: 'algo', kind: 'code', type: 'python', topic: 'Dynamic programming', difficulty: 'Hard',
    make(rand) {
      const frame = pick(rand, [
        { asset: 'a bank stock', what: 'closing prices', unit: 'dollars' },
        { asset: 'a corporate bond', what: 'daily prices', unit: 'dollars per 100 of face value' },
        { asset: 'a currency pair on the FX desk', what: 'daily rates', unit: 'pips' },
      ])
      const K = between(rand, 1, 3)
      // Recursion over (day, trades left, holding) with a memo: top-down, unlike the bottom-up Python
      const solve = (prices, k) => {
        const memo = new Map()
        const f = (i, t, holding) => {
          if (i === prices.length) return 0
          const key = `${i},${t},${holding}`
          if (memo.has(key)) return memo.get(key)
          let best = f(i + 1, t, holding)
          if (holding) best = Math.max(best, prices[i] + f(i + 1, t, false))
          else if (t > 0) best = Math.max(best, -prices[i] + f(i + 1, t - 1, true))
          memo.set(key, best)
          return best
        }
        return f(0, k, false)
      }
      // The example should show the limit mattering
      let sample = randList(rand, 8, 1, 15)
      for (let tries = 0; tries < 30 && solve(sample, K) === solve(sample, K + 3); tries++) sample = randList(rand, 8, 1, 15)
      const top = between(rand, 30, 60)
      const cases = [
        ['Example', [sample, K]],
        ['No prices', [[], K]],
        ['k is 0: no trades allowed', [randList(rand, 5, 1, 20), 0]],
        ['Prices only fall', [[top, top - between(rand, 1, 4), top - 8, top - between(rand, 9, 15)], K]],
        ['k larger than any useful number of trades', [randList(rand, 7, 1, 20), 6]],
        ['Random prices', [randList(rand, 9, 1, 25), between(rand, 1, 3)]],
      ]
      return {
        type: 'python', difficulty: 'Hard', topic: 'Dynamic programming', title: `Best profit with at most ${K === 1 ? 'one trade' : `${K} trades`}`,
        prompt: [
          `\`prices\` holds the ${frame.what} of ${frame.asset} (in ${frame.unit}), oldest first. A trade is one buy followed later by one sell. You may make **at most \`k\` trades**, hold at most one unit at a time, and must sell before buying again (selling and buying on the same day is fine).`,
          '',
          'Return the **largest total profit**. If no trade helps, or `k` is 0, or there are fewer than two prices, return `0`.',
          '',
          '- Aim for O(n times k) time.',
          '',
          ...fence(shown('max_profit_k', [sample, K], solve(sample, K))),
        ],
        starter: stub('max_profit_k(prices, k)'),
        solution: [
          'def max_profit_k(prices, k):',
          '    if not prices or k == 0:',
          '        return 0',
          "    hold = [float('-inf')] * (k + 1)   # hold[t]: best cash while holding, inside trade t",
          '    free = [0] * (k + 1)                # free[t]: best cash with t trades finished',
          '    for p in prices:',
          '        for t in range(1, k + 1):',
          '            hold[t] = max(hold[t], free[t - 1] - p)   # keep holding, or buy today',
          '            free[t] = max(free[t], hold[t] + p)       # keep waiting, or sell today',
          '    return free[k]',
          '',
        ],
        tests: cases.map(([name, args]) => test(name, call('max_profit_k', args), solve(...args))),
        approach: [
          'Greedy (take every rise) breaks once trades are limited: you have to choose which rises to keep. That calls for DP over a small state.',
          'State: how many trades you have started (t from 1 to k) and whether you hold a unit. hold[t] is the best cash while holding inside trade t; free[t] is the best cash after finishing t trades.',
          'Each day, for each t: hold[t] = max(hold[t], free[t - 1] - p) and free[t] = max(free[t], hold[t] + p). The answer is free[k].',
          'Time O(n times k), extra space O(k).',
        ],
        walkthrough: [
          '`if not prices or k == 0: return 0`: no days or no trades means no profit.',
          "`hold = [float('-inf')] * (k + 1)`: you can't be holding before you have bought anything.",
          '`hold[t] = max(hold[t], free[t - 1] - p)`: either keep holding, or start trade t today using cash from t - 1 finished trades.',
          '`free[t] = max(free[t], hold[t] + p)`: either stay out, or sell today and finish trade t.',
          '`return free[k]`: the best cash with up to k trades done; never below 0, because doing nothing counts.',
        ],
        mistakes: [
          'Summing every daily rise: that is the unlimited-trades answer and goes over the limit of k.',
          'Picking the k biggest single-day rises: rises next to each other can be one trade, so this undercounts what k trades can earn.',
          'Starting hold at 0 instead of negative infinity, which pretends you got a unit for free.',
          'Not handling k = 0 or an empty list before indexing.',
        ],
        params: { K },
      }
    },
  })
})()
