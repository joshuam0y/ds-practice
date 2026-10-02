'use strict'
// Question templates that produce endless fresh multiple choice questions. Each template picks numbers that
// work out with pen and paper, then builds the right answer plus three distractors from real mistakes.
// tools/check_generators.mjs builds hundreds of each and re-derives every answer independently (by brute
// force where possible); verify.py runs it.
//
// A template's make(rand) returns:
//   { title, topic, prompt, approach, right: {text, why, value}, wrong: [{text, why, value} x3], params }
// value is the option's numeric value, used to check that exactly one option is right.

;(function () {
  const pick = (rand, list) => list[Math.floor(rand() * list.length)]
  // Fisher-Yates: every order equally likely (sorting with a random comparator is biased)
  const shuffle = (rand, list) => {
    const a = [...list]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const between = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1))
  const comb = (n, k) => (k < 0 || k > n ? 0 : fact(n) / (fact(k) * fact(n - k)))
  const perm = (n, k) => fact(n) / fact(n - k)
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
  const frac = (n, d) => {
    const g = gcd(n, d)
    return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`
  }
  const num = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  const money = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`
  const pct = (x) => `${+(x * 100).toFixed(2)}%`
  const eTerm = (coef, lam) => (coef === '1' ? `e^−${lam}` : `${coef}e^−${lam}`)

  const T = []

  // ---------------- Applied math ----------------

  T.push({
    key: 'combo-team', section: 'math', topic: 'Combinations',
    make(rand) {
      const n = between(rand, 6, 12)
      const k = between(rand, 2, 4)
      const what = pick(rand, ['loan officers to form an audit team', 'analysts to join a fraud task force', 'branches to pilot a new app'])
      return {
        title: 'Choosing a group',
        prompt: `In how many ways can a bank choose ${k} of its ${n} ${what}, if the members have no distinct roles?`,
        approach: [
          'Ask whether order matters. A team or committee with no roles: no, so use combinations.',
          `C(n, k) = n! / (k!(n − k)!). Compute it as the top ${k} factors of ${n}! divided by ${k}!.`,
          'If the members had roles (first, second, third), it would be a permutation instead.',
        ],
        right: { value: comb(n, k), text: num(comb(n, k)), why: `Correct. Order doesn't matter: C(${n}, ${k}) = ${perm(n, k)} / ${fact(k)} = ${comb(n, k)}.` },
        wrong: [
          { value: perm(n, k), text: num(perm(n, k)), why: `This is P(${n}, ${k}), the ordered count. It counts each group ${k}! = ${fact(k)} times, as if members had roles.` },
          { value: n ** k, text: num(n ** k), why: `This is ${n}^${k}, which lets the same person be picked more than once.` },
          { value: comb(n, k - 1), text: num(comb(n, k - 1)), why: `This is C(${n}, ${k - 1}): one person too few.` },
        ],
        params: { n, k },
      }
    },
  })

  T.push({
    key: 'combo-at-least-one', section: 'math', topic: 'Combinations: at least one',
    make(rand) {
      const a = between(rand, 4, 7)
      const m = between(rand, 2, 5)
      const k = 3
      const total = comb(a + m, k)
      const none = comb(a, k)
      return {
        title: 'At least one manager',
        prompt: `A review panel of ${k} is chosen from ${a} analysts and ${m} managers. How many possible panels include at least one manager?`,
        approach: [
          '"At least one" is usually easiest as total minus none.',
          `Total: C(${a + m}, ${k}). None: all ${k} from the ${a} analysts, C(${a}, ${k}).`,
          'Avoid "pick one manager, then any others": it counts panels with several managers more than once.',
        ],
        right: { value: total - none, text: num(total - none), why: `Correct. C(${a + m}, 3) − C(${a}, 3) = ${total} − ${none} = ${total - none}.` },
        wrong: [
          { value: total, text: num(total), why: `This is every panel, C(${a + m}, 3), including the ${none} with no manager.` },
          { value: m * comb(a + m - 1, k - 1), text: num(m * comb(a + m - 1, k - 1)), why: `This picks a manager first (${m} ways) and then any 2 of the rest (${comb(a + m - 1, 2)} ways). Panels with two or three managers get counted more than once.` },
          { value: m * comb(a, k - 1), text: num(m * comb(a, k - 1)), why: `This counts panels with exactly one manager, ${m} × C(${a}, 2). It misses panels with more than one.` },
        ],
        params: { a, m, k },
      }
    },
  })

  T.push({
    key: 'pin-no-repeat', section: 'math', topic: 'Permutations',
    make(rand) {
      const L = between(rand, 3, 5)
      return {
        title: 'Codes with no repeated digit',
        prompt: `A one-time passcode has ${L} digits, each 0 through 9, and a leading 0 is allowed. How many passcodes have no repeated digit?`,
        approach: [
          'Fill the positions one at a time and multiply the number of choices for each.',
          'Codes are ordered (123 differs from 321), so this is a permutation, not a combination.',
          'Re-read the constraints: are repeats allowed, and is a leading zero allowed?',
        ],
        right: { value: perm(10, L), text: num(perm(10, L)), why: `Correct. 10 choices, then 9, then 8 and so on for ${L} positions: P(10, ${L}) = ${num(perm(10, L))}.` },
        wrong: [
          { value: 10 ** L, text: num(10 ** L), why: `This is 10^${L}, every code including ones with repeated digits.` },
          { value: comb(10, L), text: num(comb(10, L)), why: `This is C(10, ${L}), which counts sets of digits and ignores order.` },
          { value: 9 * perm(9, L - 1), text: num(9 * perm(9, L - 1)), why: 'This wrongly bans a leading 0 (9 choices for the first digit). The prompt allows it.' },
        ],
        params: { L },
      }
    },
  })

  T.push({
    key: 'bayes-flag', section: 'math', topic: 'Conditional probability and Bayes',
    make(rand) {
      const p = pick(rand, [1, 2, 5, 10, 20]) // percent with the condition
      const s = pick(rand, [80, 90, 95]) // percent of true cases flagged
      const f = pick(rand, [5, 10, 20]) // percent of other cases flagged
      const what = pick(rand, [['transactions', 'fraudulent', 'a fraud model'], ['loan applicants', 'high risk', 'a screening model'], ['accounts', 'compromised', 'a security alert']])
      const N = 10000
      const tp = (N * p * s) / 10000
      const fp = (N * (100 - p) * f) / 10000
      return {
        title: `How often a flag is right`,
        prompt: `${p}% of ${what[0]} are ${what[1]}. ${what[2][0].toUpperCase() + what[2].slice(1)} flags ${s}% of the ${what[1]} ones and ${f}% of the others. Given that one is flagged, what is the probability it is actually ${what[1]}?`,
        approach: [
          `Picture ${num(N)} ${what[0]} so every count is a whole number.`,
          `${what[1][0].toUpperCase() + what[1].slice(1)}: ${num((N * p) / 100)}, of which ${s}% are flagged = ${num(tp)}. Others: ${num((N * (100 - p)) / 100)}, of which ${f}% are flagged = ${num(fp)}.`,
          'P(condition | flagged) = true flags / all flags.',
          'Small base rates make most flags false alarms, even for good models.',
        ],
        right: { value: tp / (tp + fp), text: frac(tp, tp + fp), why: `Correct. ${num(tp)} / (${num(tp)} + ${num(fp)}) = ${frac(tp, tp + fp)}.` },
        wrong: [
          { value: s / 100, text: frac(s, 100), why: `This is P(flagged | ${what[1]}), the model's hit rate. The question asks the reverse, P(${what[1]} | flagged).` },
          { value: p / 100, text: frac(p, 100), why: 'This is the base rate before seeing the flag. A flag is evidence, so the probability must rise.' },
          { value: tp / N, text: frac(tp, N), why: `This is P(${what[1]} and flagged), a joint probability. Divide by P(flagged) instead of by everyone.` },
        ],
        params: { p, s, f },
      }
    },
  })

  T.push({
    key: 'poisson-at-least-one', section: 'math', topic: 'Poisson distribution',
    make(rand) {
      const lam = between(rand, 1, 5)
      const what = pick(rand, ['fraud alerts arrive at a monitoring desk', 'customers join the queue at a branch', 'chargebacks arrive for a merchant'])
      const unit = pick(rand, ['hour', 'day'])
      return {
        title: 'At least one event',
        prompt: `On average, ${what} at a rate of ${lam} per ${unit}, following a Poisson distribution. What is the probability of at least one in a given ${unit}?`,
        approach: [
          'Poisson: P(X = k) = λ^k e^−λ / k!, with λ the average count for the interval asked about.',
          '"At least one" = 1 − P(X = 0) = 1 − e^−λ.',
          'Check that λ matches the interval in the question.',
        ],
        right: { value: 1 - Math.exp(-lam), text: `1 − ${eTerm('1', lam)}`, why: `Correct. 1 − P(0) = 1 − e^−${lam}.` },
        wrong: [
          { value: Math.exp(-lam), text: eTerm('1', lam), why: `This is P(X = 0), the chance of none.` },
          { value: lam * Math.exp(-lam), text: eTerm(String(lam), lam), why: `This is P(X = 1): λ e^−λ = ${lam}e^−${lam}.` },
          { value: 1 - (1 + lam) * Math.exp(-lam), text: `1 − ${eTerm(String(1 + lam), lam)}`, why: 'This is 1 − P(0) − P(1), the probability of at least two.' },
        ],
        params: { lam },
      }
    },
  })

  T.push({
    key: 'poisson-exactly', section: 'math', topic: 'Poisson distribution',
    make(rand) {
      const lam = between(rand, 1, 4)
      const k = between(rand, 2, 4)
      const coef = frac(lam ** k, fact(k))
      const swapped = frac(k ** lam, fact(lam))
      return {
        title: 'Exactly k events',
        prompt: `Loan applications arrive at an average rate of ${lam} per hour, following a Poisson distribution. What is the probability of exactly ${k} applications in a given hour?`,
        approach: [
          `Plug into P(X = k) = λ^k e^−λ / k! with λ = ${lam} and k = ${k}.`,
          `Simplify the fraction ${lam}^${k} / ${k}! = ${lam ** k}/${fact(k)}.`,
          'Any answer above 1 is wrong.',
        ],
        right: { value: (lam ** k * Math.exp(-lam)) / fact(k), text: `(${coef})e^−${lam}`, why: `Correct. ${lam}^${k} e^−${lam} / ${k}! = (${coef})e^−${lam}.` },
        wrong: [
          { value: lam ** k * Math.exp(-lam), text: `${lam ** k}e^−${lam}`, why: `This forgets to divide by ${k}!.` },
          { value: (k ** lam * Math.exp(-k)) / fact(lam), text: `(${swapped})e^−${k}`, why: `This swaps λ and k: ${k}^${lam} e^−${k} / ${lam}!.` },
          { value: 1 - Math.exp(-lam), text: `1 − e^−${lam}`, why: 'This is P(at least one), not P(exactly k).' },
        ],
        params: { lam, k },
      }
    },
  })

  T.push({
    key: 'poisson-rescale', section: 'math', topic: 'Poisson distribution: changing the interval',
    make(rand) {
      const [rate, minutes] = pick(rand, [[12, 5], [12, 10], [6, 10], [6, 20], [30, 2], [30, 4], [60, 1], [60, 3], [4, 30], [3, 40]])
      const lam = (rate * minutes) / 60
      return {
        title: 'None in a short window',
        prompt: `A call center receives card disputes at an average of ${rate} per hour, following a Poisson distribution. What is the probability of no disputes in a ${minutes}-minute window?`,
        approach: [
          'λ must be the expected count for the interval in the question: rate × interval length.',
          `${minutes} minutes is ${frac(minutes, 60)} of an hour, so λ = ${rate} × ${frac(minutes, 60)} = ${lam}.`,
          'P(X = 0) = e^−λ.',
        ],
        right: { value: Math.exp(-lam), text: eTerm('1', lam), why: `Correct. λ = ${lam}, so P(0) = e^−${lam}.` },
        wrong: [
          { value: Math.exp(-rate), text: eTerm('1', rate), why: 'This uses the hourly rate for a much shorter window.' },
          { value: 1 - Math.exp(-lam), text: `1 − ${eTerm('1', lam)}`, why: 'This is the chance of at least one dispute, the complement.' },
          { value: Math.exp(-minutes), text: eTerm('1', minutes), why: 'This uses the number of minutes as λ instead of the expected count.' },
        ],
        params: { rate, minutes },
      }
    },
  })

  // Empirical rule: cumulative percent at z = -3..3
  const CUM = { '-3': 0.0015, '-2': 0.025, '-1': 0.16, 0: 0.5, 1: 0.84, 2: 0.975, 3: 0.9985 }
  T.push({
    key: 'normal-interval', section: 'math', topic: 'Normal distribution: empirical rule',
    make(rand) {
      const mean = pick(rand, [40, 50, 600, 650, 700, 20000])
      const sd = mean >= 1000 ? pick(rand, [2000, 4000, 5000]) : mean >= 600 ? pick(rand, [25, 40, 50]) : pick(rand, [4, 5, 8])
      const intervals = [[-1, 1], [-2, 2], [-1, 2], [-2, 1], [0, 2], [-2, 0], [1, 9], [2, 9], [-9, -1], [-9, -2], [0, 1]]
      const z = (v) => (v === 9 ? 9 : v === -9 ? -9 : v)
      const prob = ([a, b]) => (b === 9 ? 1 : CUM[b]) - (a === -9 ? 0 : CUM[a])
      const [a, b] = pick(rand, intervals)
      const label = ([lo, hi]) => (hi === 9 ? `above ${num(mean + lo * sd)}` : lo === -9 ? `below ${num(mean + hi * sd)}` : `between ${num(mean + lo * sd)} and ${num(mean + hi * sd)}`)
      const right = prob([a, b])
      const others = intervals.filter(([x, y]) => Math.abs(prob([x, y]) - right) > 1e-9)
      const seen = new Set([right.toFixed(4)])
      const wrong = []
      for (const iv of shuffle(rand, others)) {
        const v = prob(iv)
        if (seen.has(v.toFixed(4))) continue
        seen.add(v.toFixed(4))
        wrong.push({ value: v, text: pct(v), why: `${pct(v)} is the share ${label(iv)}, a different range (z from ${z(iv[0]) === -9 ? '−∞' : iv[0]} to ${z(iv[1]) === 9 ? '∞' : iv[1]}).` })
        if (wrong.length === 3) break
      }
      return {
        title: 'Using the 68-95-99.7 rule',
        prompt: `Values are approximately normal with mean ${num(mean)} and standard deviation ${num(sd)}. Using the 68-95-99.7 rule, about what percentage of values are ${label([a, b])}?`,
        approach: [
          'Convert each endpoint to a z-score: (value − mean) / SD.',
          'Use the bands: mean to 1 SD holds 34%, 1 to 2 SD holds 13.5%, 2 to 3 SD holds 2.35%, beyond 3 SD 0.15% (on each side).',
          'Add the bands inside the range, or for a tail take what is outside and halve it.',
        ],
        right: { value: right, text: pct(right), why: `Correct. The range is z from ${a === -9 ? '−∞' : a} to ${b === 9 ? '∞' : b}, which holds about ${pct(right)}.` },
        wrong,
        params: { a, b },
      }
    },
  })

  T.push({
    key: 'expected-value', section: 'math', topic: 'Expected value',
    make(rand) {
      const W = pick(rand, [50, 100, 200, 500])
      const L = pick(rand, [100, 400, 1000, 2000])
      const p1 = between(rand, 5, 8) // tenths
      const p2 = between(rand, 1, 10 - p1) // tenths
      const ev = (W * p1 - L * p2) / 10
      return {
        title: 'Expected profit',
        prompt: `A product earns the bank $${num(W)} with probability ${p1}/10, loses $${num(L)} with probability ${p2}/10, and otherwise breaks even. What is the expected profit per customer?`,
        approach: [
          'List each outcome with its probability and its value (losses negative).',
          'Multiply and add: E = Σ p × value. Include the break-even outcome (value 0) so the probabilities sum to 1.',
          'A plain average of the outcomes is wrong unless they are equally likely.',
        ],
        right: { value: ev, text: money(ev), why: `Correct. ${num(W)} × ${p1}/10 − ${num(L)} × ${p2}/10 = ${num((W * p1) / 10)} − ${num((L * p2) / 10)} = ${money(ev)}.` },
        wrong: [
          { value: (W * p1) / 10, text: money((W * p1) / 10), why: 'This counts the gain and forgets the chance of a loss.' },
          { value: (W * p1 + L * p2) / 10, text: money((W * p1 + L * p2) / 10), why: 'This adds the loss instead of subtracting it.' },
          { value: (W - L) / 3, text: money(Math.round(((W - L) / 3) * 100) / 100), why: 'This averages the three outcomes as if each were equally likely.' },
        ],
        params: { W, L, p1, p2 },
      }
    },
  })

  T.push({
    key: 'without-replacement', section: 'math', topic: 'Probability without replacement',
    make(rand) {
      const N = between(rand, 6, 12)
      const D = between(rand, 2, Math.min(5, N - 2))
      return {
        title: 'Two picks, both with errors',
        prompt: `A batch of ${N} loan files contains ${D} with errors. An auditor picks 2 files at random without replacement. What is the probability that both have errors?`,
        approach: [
          'Without replacement, update the counts after the first pick.',
          `P(both) = ${D}/${N} × ${D - 1}/${N - 1}.`,
          `Check: C(${D}, 2) / C(${N}, 2) gives the same answer.`,
        ],
        right: { value: (D * (D - 1)) / (N * (N - 1)), text: frac(D * (D - 1), N * (N - 1)), why: `Correct. ${D}/${N} × ${D - 1}/${N - 1} = ${frac(D * (D - 1), N * (N - 1))}.` },
        wrong: [
          { value: (D * D) / (N * N), text: frac(D * D, N * N), why: `This is (${D}/${N})², which assumes the first file goes back (with replacement).` },
          { value: (D - 1) / (N - 1), text: frac(D - 1, N - 1), why: 'This is only the second step, P(second has errors | first did).' },
          { value: (2 * D) / N, text: frac(2 * D, N), why: '"Both" means multiply along the sequence, not add.' },
        ],
        params: { N, D },
      }
    },
  })

  T.push({
    key: 'independent-either', section: 'math', topic: 'Independent events',
    make(rand) {
      const a = between(rand, 1, 4)
      const b = between(rand, 1, 5)
      const r = 1 - ((10 - a) * (10 - b)) / 100
      return {
        title: 'Flagged by at least one rule',
        prompt: `Two independent checks run on every application. Check A flags ${a * 10}% and check B flags ${b * 10}%. What is the probability an application is flagged by at least one check?`,
        approach: [
          '"At least one" = 1 − P(neither).',
          'For independent events, P(neither) = P(not A) × P(not B).',
          'Or: P(A or B) = P(A) + P(B) − P(A and B).',
        ],
        right: { value: r, text: (+r.toFixed(2)).toFixed(2), why: `Correct. 1 − ${(10 - a) / 10} × ${(10 - b) / 10} = 1 − ${(((10 - a) * (10 - b)) / 100).toFixed(2)} = ${r.toFixed(2)}.` },
        wrong: [
          { value: (a + b) / 10, text: ((a + b) / 10).toFixed(2), why: 'This adds the probabilities, counting applications flagged by both twice.' },
          { value: (a * b) / 100, text: ((a * b) / 100).toFixed(2), why: 'This is P(both), not P(at least one).' },
          { value: (a + b) / 10 - (2 * a * b) / 100, text: ((a + b) / 10 - (2 * a * b) / 100).toFixed(2), why: 'This subtracts the overlap twice, giving P(exactly one).' },
        ],
        params: { a, b },
      }
    },
  })

  const WORDS = ['BALANCE', 'LEDGER', 'ACCESS', 'ASSETS', 'PAYEE', 'TELLER', 'CREDIT', 'ESCROW', 'DEPOSIT', 'CHECKS']
  T.push({
    key: 'arrange-letters', section: 'math', topic: 'Permutations with repeated items',
    make(rand) {
      const word = pick(rand, WORDS)
      const counts = {}
      for (const c of word) counts[c] = (counts[c] || 0) + 1
      const repeats = Object.entries(counts).filter(([, c]) => c > 1)
      const denom = repeats.reduce((d, [, c]) => d * fact(c), 1)
      const n = word.length
      const right = fact(n) / denom
      const candidates = [
        { value: fact(n), why: `This is ${n}!, which treats repeated letters as different and overcounts.` },
        { value: fact(n) / 2, why: 'This divides by 2 whether or not a letter actually repeats twice.' },
        { value: fact(n - 1), why: `This is (${n} − 1)!, which drops a letter.` },
        { value: fact(n) / 4, why: 'This divides by 2! twice, as if two letters repeated.' },
        { value: comb(n, 2), why: `This is C(${n}, 2), which counts pairs of letters, not arrangements.` },
      ]
      const seen = new Set([right])
      const wrong = []
      for (const c of candidates) {
        if (seen.has(c.value) || !Number.isInteger(c.value)) continue
        seen.add(c.value)
        wrong.push({ value: c.value, text: num(c.value), why: c.why })
        if (wrong.length === 3) break
      }
      return {
        title: 'Arranging letters',
        prompt: `How many distinct arrangements are there of the letters in the word ${word}?`,
        approach: [
          'Count the letters and how many times each repeats.',
          'Arrangements = n! / (k1! × k2! × ...), one factorial for each repeated letter.',
          'If nothing repeats, the answer is just n!.',
        ],
        right: { value: right, text: num(right), why: `Correct. ${n} letters${repeats.length ? `, with ${repeats.map(([c, k]) => `${c} × ${k}`).join(' and ')}` : ' and no repeats'}: ${n}! / ${denom} = ${num(right)}.` },
        wrong,
        params: { word },
      }
    },
  })

  T.push({
    key: 'conditional-counts', section: 'math', topic: 'Conditional probability',
    make(rand) {
      const B = pick(rand, [40, 50, 60, 80])
      const both = pick(rand, [10, 20, 30].filter((x) => x < B))
      const A = pick(rand, [60, 90, 120].filter((x) => x > both && x !== B))
      const T0 = 200
      const prods = pick(rand, [['a credit card', 'a mortgage'], ['a savings account', 'a car loan'], ['direct deposit', 'a brokerage account']])
      return {
        title: 'Given one product, the other',
        prompt: `Of ${T0} customers, ${A} have ${prods[0]}, ${B} have ${prods[1]}, and ${both} have both. A randomly chosen customer has ${prods[1]}. What is the probability they also have ${prods[0]}?`,
        approach: [
          '"Given B" shrinks the sample space to the customers in B, so B goes in the denominator.',
          'P(A | B) = count(A and B) / count(B).',
          'Watch for the reversed option, which divides by A.',
        ],
        right: { value: both / B, text: frac(both, B), why: `Correct. ${both} of the ${B} customers with ${prods[1]}: ${frac(both, B)}.` },
        wrong: [
          { value: both / A, text: frac(both, A), why: `This is P(${prods[1]} | ${prods[0]}), the condition reversed.` },
          { value: both / T0, text: frac(both, T0), why: 'This is P(both), which ignores what we already know.' },
          { value: A / T0, text: frac(A, T0), why: `This is P(${prods[0]}) overall, ignoring the condition.` },
        ],
        params: { A, B, both, T: T0 },
      }
    },
  })

  // ---------------- Statistics ----------------

  T.push({
    key: 'standard-error', section: 'stats', topic: 'Standard deviation and standard error',
    make(rand) {
      const n = pick(rand, [16, 25, 36, 49, 64, 81, 100])
      const root = Math.sqrt(n)
      const sd = root * pick(rand, [2, 3, 4, 5, 6, 10])
      return {
        title: 'Standard error of a mean',
        prompt: `Transaction amounts have a standard deviation of $${sd}. An analyst averages a random sample of ${n} transactions. What is the standard error of that sample mean?`,
        approach: [
          'Standard error = σ / √n. It describes how much sample means vary, not individual values.',
          `√${n} = ${root}.`,
          'Check that you took the square root of n.',
        ],
        right: { value: sd / root, text: `$${num(sd / root)}`, why: `Correct. ${sd} / √${n} = ${sd} / ${root} = ${num(sd / root)}.` },
        wrong: [
          { value: sd / n, text: `about $${num(+(sd / n).toFixed(2))}`, why: 'This divides by n instead of √n, the classic missing square root.' },
          { value: sd, text: `$${num(sd)}`, why: 'This is the spread of individual transactions, not of averages.' },
          { value: (sd * sd) / n, text: `$${num((sd * sd) / n)}`, why: 'This is the variance of the mean, σ² / n. The standard error is its square root.' },
        ],
        params: { sd, n },
      }
    },
  })

  T.push({
    key: 'iqr-outlier', section: 'stats', topic: 'Box plots and the 1.5 IQR rule',
    make(rand) {
      const q1 = pick(rand, [10, 20, 30, 40])
      const iqr = pick(rand, [10, 20, 30, 40])
      const q3 = q1 + iqr
      const upper = q3 + 1.5 * iqr
      const out = upper + pick(rand, [1, 2, 5])
      return {
        title: 'Which value is an outlier',
        prompt: `A box plot of loan amounts (in $ thousands) has Q1 = ${q1} and Q3 = ${q3}. Using the 1.5 × IQR rule, which of these loans is plotted as an outlier?`,
        approach: [
          `IQR = Q3 − Q1 = ${iqr}.`,
          `Upper fence = Q3 + 1.5 × IQR = ${upper}; lower fence = Q1 − 1.5 × IQR = ${q1 - 1.5 * iqr}.`,
          'Only points strictly beyond a fence are outliers; a point on the fence is not.',
        ],
        right: { value: out, text: num(out), why: `Correct. The upper fence is ${q3} + 1.5 × ${iqr} = ${upper}, and ${out} is beyond it.` },
        wrong: [
          { value: upper, text: num(upper), why: `${upper} sits exactly on the fence. Only values beyond it count.` },
          { value: q3 + iqr, text: num(q3 + iqr), why: `${q3 + iqr} would be an outlier only with a 1 × IQR fence. The rule uses 1.5.` },
          { value: q3 + iqr / 2, text: num(q3 + iqr / 2), why: 'Being above the box (in the whisker) does not make a point an outlier.' },
        ],
        params: { q1, q3 },
        rule: 'only_greater',
        threshold: upper,
      }
    },
  })

  T.push({
    key: 'sd-transform', section: 'stats', topic: 'Standard deviation under a linear change',
    make(rand) {
      const sd = pick(rand, [5, 10, 20, 25, 40, 50])
      const a = pick(rand, [2, 3, 4])
      const b = pick(rand, [10, 50, 100, 200])
      const r = a * sd
      return {
        title: 'Add, then multiply',
        prompt: `Balances have mean $500 and standard deviation $${sd}. The bank adds $${b} to every balance, then multiplies every balance by ${a}. What is the new standard deviation?`,
        approach: [
          'For Y = aX + b: SD(Y) = |a| × SD(X). Adding a constant shifts values but not their spread.',
          'Variance scales by a², the SD by |a|.',
          'Make sure you answer for the SD, not the variance.',
        ],
        right: { value: r, text: `$${num(r)}`, why: `Correct. Only the multiplier changes spread: ${a} × ${sd} = ${r}.` },
        wrong: [
          { value: a * (sd + b), text: `$${num(a * (sd + b))}`, why: `This adds $${b} to the SD before multiplying. Adding a constant doesn't change spread.` },
          { value: sd, text: `$${num(sd)}`, why: 'Multiplying every value does change the spread.' },
          { value: a * a * sd, text: `$${num(a * a * sd)}`, why: `This scales by ${a}² = ${a * a}, which is what happens to the variance, not the SD.` },
        ],
        params: { sd, a, b },
      }
    },
  })

  T.push({
    key: 'covariance-units', section: 'stats', topic: 'Covariance and correlation',
    make(rand) {
      const k = pick(rand, [10, 100, 1000])
      const m = pick(rand, [2, 3, 5, 8])
      const cov = m * k * k
      return {
        title: 'Covariance after changing units',
        prompt: `The covariance of customers' income and spending, both in dollars, is ${num(cov)}. If both are re-expressed in units of $${num(k)}, what is the new covariance?`,
        approach: [
          'Cov(aX, bY) = ab × Cov(X, Y). Rescaling each variable multiplies covariance once per variable.',
          `Here each variable is divided by ${num(k)}, so covariance is divided by ${num(k)}².`,
          'Correlation is the one that never changes with units.',
        ],
        right: { value: m, text: num(m), why: `Correct. ${num(cov)} / ${num(k)}² = ${num(cov)} / ${num(k * k)} = ${m}.` },
        wrong: [
          { value: cov / k, text: num(cov / k), why: 'This rescales only one of the two variables.' },
          { value: cov, text: num(cov), why: 'This would be true of correlation, not covariance.' },
          { value: cov / (k * k * k), text: num(cov / (k * k * k)), why: `This divides by ${num(k)} three times.` },
        ],
        params: { k, m },
      }
    },
  })

  T.push({
    key: 'median-even', section: 'stats', topic: 'Median with an even number of values',
    make(rand) {
      for (;;) {
        const size = pick(rand, [6, 8])
        const vals = new Set()
        while (vals.size < size) vals.add(between(rand, 1, 30))
        const shuffled = shuffle(rand, [...vals])
        const sorted = [...vals].sort((x, y) => x - y)
        const mid = size / 2
        const median = (sorted[mid - 1] + sorted[mid]) / 2
        const unsorted = (shuffled[mid - 1] + shuffled[mid]) / 2
        const mean = sorted.reduce((s, v) => s + v, 0) / size
        const lower = sorted[mid - 1]
        const values = [median, unsorted, mean, lower].map((v) => +v.toFixed(2))
        if (new Set(values).size < 4) continue
        return {
          title: 'Median of an even count',
          prompt: `The last ${size} loans approved, in $ thousands, were ${shuffled.join(', ')}. What is the median?`,
          approach: [
            'Sort first.',
            'With an even count, the median is the average of the two middle values.',
            'Compare with the mean to see which way the data lean.',
          ],
          right: { value: median, text: num(median), why: `Correct. Sorted: ${sorted.join(', ')}. The middle two are ${sorted[mid - 1]} and ${sorted[mid]}, so the median is ${num(median)}.` },
          wrong: [
            { value: unsorted, text: num(unsorted), why: 'This averages the middle two of the unsorted list. Always sort first.' },
            { value: +mean.toFixed(2), text: Number.isInteger(mean) ? num(mean) : `about ${num(+mean.toFixed(2))}`, why: 'This is the mean, not the median.' },
            { value: lower, text: num(lower), why: 'This takes only the lower middle value instead of averaging the two.' },
          ],
          params: { vals: shuffled },
        }
      }
    },
  })

  // ---------------- SQL basics ----------------

  T.push({
    key: 'count-nulls', section: 'sqlbasic', topic: 'Aggregations: COUNT and NULLs',
    make(rand) {
      for (;;) {
        const n = between(rand, 5, 8)
        const vals = Array.from({ length: n }, () => (rand() < 0.3 ? null : pick(rand, [600, 650, 700, 750])))
        const nonNull = vals.filter((v) => v !== null)
        const distinct = new Set(nonNull).size
        if (nonNull.length === n || nonNull.length < 2 || distinct === nonNull.length) continue
        const opts = [[n, nonNull.length, distinct], [n, n, distinct], [nonNull.length, nonNull.length, distinct], [n, nonNull.length, distinct + 1]]
        if (new Set(opts.map((o) => o.join())).size < 4) continue
        const code = (o) => o[0] * 10000 + o[1] * 100 + o[2]
        return {
          title: 'Three kinds of COUNT',
          prompt: [
            `The \`applicants\` table has ${n} rows. Their \`credit_score\` values are ${vals.map((v) => (v === null ? 'NULL' : v)).join(', ')}.`,
            '',
            '```',
            'SELECT COUNT(*), COUNT(credit_score), COUNT(DISTINCT credit_score)',
            'FROM applicants;',
            '```',
            '',
            'What does this return?',
          ],
          approach: [
            'COUNT(*) counts rows. COUNT(col) skips NULLs. COUNT(DISTINCT col) counts different non-NULL values.',
            'Cross out the NULLs, count what is left, then count the distinct values among them.',
          ],
          right: { value: code(opts[0]), text: opts[0].join(', '), why: `Correct. ${n} rows, ${nonNull.length} non-NULL scores, ${distinct} distinct values (${[...new Set(nonNull)].join(', ')}).` },
          wrong: [
            { value: code(opts[1]), text: opts[1].join(', '), why: 'COUNT(credit_score) skips NULLs, so it cannot equal the row count here.' },
            { value: code(opts[2]), text: opts[2].join(', '), why: 'COUNT(*) counts every row, NULLs included.' },
            { value: code(opts[3]), text: opts[3].join(', '), why: 'COUNT(DISTINCT ...) ignores NULL; it is not counted as a value.' },
          ],
          params: { vals },
        }
      }
    },
  })

  T.push({
    key: 'avg-nulls', section: 'sqlbasic', topic: 'Aggregations and NULLs',
    make(rand) {
      for (;;) {
        const k = between(rand, 2, 4)
        const known = Array.from({ length: k }, () => pick(rand, [100, 200, 300, 400, 500]))
        const sum = known.reduce((s, v) => s + v, 0)
        const nulls = between(rand, 1, 2)
        if (sum % k || sum % (k + nulls)) continue
        const vals = shuffle(rand, [...known, ...Array(nulls).fill(null)])
        return {
          title: 'Average with missing values',
          prompt: `A column \`balance\` holds ${vals.map((v) => (v === null ? 'NULL' : v)).join(', ')}. What does \`SELECT AVG(balance) FROM accounts;\` return?`,
          approach: [
            'Aggregates skip NULLs: AVG(col) = SUM(col) / COUNT(col), not SUM / COUNT(*).',
            'If missing should count as zero, write AVG(COALESCE(col, 0)).',
          ],
          right: { value: sum / k, text: num(sum / k), why: `Correct. The NULLs are skipped: ${sum} / ${k} = ${num(sum / k)}.` },
          wrong: [
            { value: sum / (k + nulls), text: num(sum / (k + nulls)), why: `This divides by all ${k + nulls} rows, treating NULL as 0.` },
            { value: -1, text: 'NULL', why: 'AVG is NULL only when every value is NULL; otherwise NULLs are skipped.' },
            { value: sum, text: num(sum), why: 'This is SUM(balance), not the average.' },
          ],
          params: { vals },
        }
      }
    },
  })

  T.push({
    key: 'union-count', section: 'sqlbasic', topic: 'UNION and UNION ALL',
    make(rand) {
      for (;;) {
        const A = [...new Set(Array.from({ length: between(rand, 2, 4) }, () => between(rand, 1, 9)))].sort((x, y) => x - y)
        const B = [...new Set(Array.from({ length: between(rand, 2, 4) }, () => between(rand, 1, 9)))].sort((x, y) => x - y)
        const union = new Set([...A, ...B]).size
        const inter = A.filter((x) => B.includes(x)).length
        const values = [union, A.length + B.length, inter, A.length * B.length]
        if (inter === 0 || new Set(values).size < 4) continue
        return {
          title: 'How many rows does UNION return',
          prompt: [
            `\`checking\` has customer_id values ${A.join(', ')}. \`savings\` has customer_id values ${B.join(', ')}.`,
            '',
            '```',
            'SELECT customer_id FROM checking',
            'UNION',
            'SELECT customer_id FROM savings;',
            '```',
            '',
            'How many rows does this return?',
          ],
          approach: [
            'UNION stacks results and removes duplicates; UNION ALL keeps them.',
            'List the combined values and cross out repeats.',
          ],
          right: { value: union, text: String(union), why: `Correct. Distinct ids: ${[...new Set([...A, ...B])].sort((x, y) => x - y).join(', ')}.` },
          wrong: [
            { value: A.length + B.length, text: String(A.length + B.length), why: 'This is UNION ALL, which keeps duplicates.' },
            { value: inter, text: String(inter), why: 'This is the intersection (ids in both), which INTERSECT would return.' },
            { value: A.length * B.length, text: String(A.length * B.length), why: 'This is a cross join count, unrelated to UNION.' },
          ],
          params: { A, B },
        }
      }
    },
  })

  T.push({
    key: 'join-count', section: 'sqlbasic', topic: 'JOIN row counts',
    make(rand) {
      for (;;) {
        const nCust = between(rand, 3, 5)
        const perCust = Array.from({ length: nCust }, () => between(rand, 0, 2))
        const orphans = between(rand, 1, 2)
        const inner = perCust.reduce((s, v) => s + v, 0)
        const unmatched = perCust.filter((v) => v === 0).length
        const left = inner + unmatched
        const full = left + orphans
        const accounts = inner + orphans
        const cross = nCust * accounts
        if (!unmatched || new Set([inner, left, full, cross]).size < 4) continue
        const kind = pick(rand, ['JOIN', 'LEFT JOIN'])
        const right = kind === 'JOIN' ? inner : left
        const wrong = [
          kind === 'JOIN'
            ? { value: left, text: String(left), why: 'This is the LEFT JOIN count, which keeps customers with no accounts.' }
            : { value: inner, text: String(inner), why: 'This is the inner join count; a LEFT JOIN also keeps customers with no accounts.' },
          { value: full, text: String(full), why: 'This is a FULL OUTER JOIN count, which also keeps the accounts with a NULL customer_id.' },
          { value: cross, text: String(cross), why: `This is a cross join, ${nCust} × ${accounts}.` },
        ]
        return {
          title: 'Counting join rows',
          prompt: [
            `\`customers\` has ${nCust} rows (customer_id 1 to ${nCust}). \`accounts\` has ${accounts} rows: ${perCust.map((c, i) => `customer ${i + 1} has ${c}`).join(', ')}, and ${orphans} ${orphans === 1 ? 'account has' : 'accounts have'} customer_id NULL.`,
            '',
            '```',
            'SELECT *',
            'FROM customers c',
            `${kind} accounts a ON a.customer_id = c.customer_id;`,
            '```',
            '',
            'How many rows does this return?',
          ],
          approach: [
            'Go customer by customer: each contributes one row per matching account.',
            'An inner JOIN drops unmatched rows; a LEFT JOIN keeps each unmatched customer once, with NULLs.',
            'NULL keys never match anything.',
          ],
          right: { value: right, text: String(right), why: `Correct. Matches: ${inner}${kind === 'LEFT JOIN' ? `, plus ${unmatched} customer${unmatched === 1 ? '' : 's'} with no account kept once each` : ''}.` },
          wrong,
          params: { perCust, orphans, kind },
        }
      }
    },
  })

  // Builds a full question object from a template: options shuffled so the right one lands anywhere
  function build(template, rand = Math.random) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const g = template.make(rand)
      const options = [g.right, ...g.wrong]
      const texts = options.map((o) => o.text)
      if (new Set(texts).size !== 4 || options.length !== 4) continue
      const order = shuffle(rand, [0, 1, 2, 3])
      return {
        id: `gen-${template.key}-${Math.floor(rand() * 1e9).toString(36)}`,
        section: template.section,
        type: 'mcq',
        generated: template.key,
        topic: g.topic || template.topic,
        title: g.title,
        prompt: g.prompt,
        options: order.map((i) => options[i].text),
        answer: order.indexOf(0),
        explanations: order.map((i) => options[i].why),
        approach: g.approach,
        check: { values: order.map((i) => options[i].value), rule: g.rule || 'equal', threshold: g.threshold, params: g.params },
      }
    }
    throw new Error(`Template ${template.key} could not build a valid question`)
  }

  const api = { templates: T, build }
  if (typeof window !== 'undefined') window.GENERATORS = api
  if (typeof module !== 'undefined') module.exports = api
})()
