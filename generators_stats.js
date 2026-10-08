'use strict'
// More statistics templates (multiple choice). Load after generators.js.
// Same contract as generators.js. Categorical answers (which test, which error, which sampling method,
// reject or not) carry a numeric code per option; tools/check_generators.mjs maps each scenario to its code
// from its own table, and re-derives every numeric answer a different way.

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
  // Plain numbers with a true minus sign
  const num = (n) => `${n < 0 ? '−' : ''}${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 4 })}`
  const signed = (n) => `${n < 0 ? '−' : ''}${Math.abs(n)}`
  const isClean = (v, digits) => Math.abs(Math.round(v * 10 ** digits) - v * 10 ** digits) < 1e-6
  // Two decimals at most; anything longer is rounded and marked "about"
  const approx = (v) => (isClean(v, 2) ? num(+v.toFixed(2)) : `about ${num(+v.toFixed(2))}`)
  const cash = (v) => {
    if (isClean(v, 0)) return `$${num(Math.round(v))}`
    return `${isClean(v, 2) ? '' : 'about '}$${v.toFixed(2)}`
  }
  const dollars = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  // Small decimals such as 0.000625 shown in full; messy ones rounded to two significant figures
  const dec = (v) => (isClean(v, 6) ? String(+v.toFixed(6)) : `about ${+v.toPrecision(2)}`)
  // Keep the first three candidates whose values differ from the answer and from each other
  const firstThree = (right, candidates) => {
    const seen = [right]
    const out = []
    for (const c of candidates) {
      if (seen.some((v) => Math.abs(v - c.value) < 1e-9)) continue
      seen.push(c.value)
      out.push(c)
      if (out.length === 3) break
    }
    return out
  }

  // ---------------- Confidence intervals ----------------

  T.push({
    key: 'st-ci-mean', difficulty: 'Medium', section: 'stats', topic: 'Confidence intervals',
    make(rand) {
      const n = pick(rand, [16, 25, 36, 49, 64, 100, 144])
      const root = Math.sqrt(n)
      const se = pick(rand, [2, 3, 4, 5, 6])
      const sd = se * root
      const z = pick(rand, [1.96, 2])
      const ctx = pick(rand, [
        { what: 'monthly checking balance', xbar: pick(rand, [1200, 1850, 2400, 3100]) },
        { what: 'personal loan payment', xbar: pick(rand, [420, 560, 610, 780]) },
        { what: 'ATM withdrawal', xbar: pick(rand, [180, 220, 260]) },
      ])
      const { xbar } = ctx
      const margin = z * se
      const iv = (e) => `${dollars(xbar - e)} to ${dollars(xbar + e)}`
      return {
        title: 'A 95% interval for a mean',
        prompt: `A random sample of ${n} customers has an average ${ctx.what} of $${num(xbar)}. The population standard deviation is known to be $${sd}. Using z = ${z} for 95% confidence, which is the 95% confidence interval for the mean ${ctx.what}?`,
        approach: [
          'Interval = x̄ ± z × σ / √n. The σ / √n part is the standard error of the mean.',
          `√${n} = ${root}, so the standard error is ${sd} / ${root} = ${se}.`,
          'Multiply by z for the margin of error, then add and subtract it from the sample mean.',
        ],
        right: { value: margin, text: iv(margin), why: `Correct. SE = ${sd} / √${n} = ${se}, margin = ${z} × ${se} = ${num(margin)}, so the interval is ${num(xbar)} ± ${num(margin)}.` },
        wrong: [
          { value: z * sd, text: iv(z * sd), why: `This uses ${z} × σ = ${num(z * sd)} as the margin, forgetting to divide by √n. That describes individual customers, not the average.` },
          { value: (z * sd) / n, text: iv((z * sd) / n), why: `This divides σ by n = ${n} instead of √n = ${root}, which makes the interval far too narrow.` },
          { value: se, text: iv(se), why: `This is x̄ ± one standard error (${se}). Without the z multiplier the interval only covers about 68%, not 95%.` },
        ],
        params: { xbar, sd, n, z },
      }
    },
  })

  const LEVELS = [{ p: '68%', z: 1 }, { p: '95%', z: 2 }, { p: '99.7%', z: 3 }]

  T.push({
    key: 'st-ci-width', difficulty: 'Hard', section: 'stats', topic: 'Confidence intervals',
    make(rand) {
      const mode = pick(rand, ['n', 'level', 'both'])
      const n0 = pick(rand, [50, 100, 200, 250])
      const what = pick(rand, ['average credit card balance', 'average loan amount', 'average monthly deposit'])
      let from = LEVELS[1]
      let to = LEVELS[1]
      let k = 1
      let W
      let right
      let candidates
      let question
      let how
      if (mode === 'n') {
        k = pick(rand, [4, 9, 16, 25])
        const rk = Math.sqrt(k)
        W = rk * pick(rand, [4, 5, 6, 8, 10, 12])
        right = W / rk
        question = `If the analyst repeats the study with ${num(n0 * k)} customers instead (${k} times as many), about how wide will the new 95% interval be?`
        how = `Width is proportional to 1 / √n. Multiplying n by ${k} divides the width by √${k} = ${rk}: ${W} / ${rk} = ${num(right)}.`
        candidates = [
          { value: W / k, why: `This divides by ${k} instead of √${k}. Width shrinks with the square root of n.` },
          { value: W, why: 'The width depends on n through the standard error σ / √n, so more data does narrow it.' },
          { value: W * rk, why: 'This goes the wrong way. A bigger sample makes the interval narrower, not wider.' },
          { value: W / 2, why: 'This halves the width no matter how much n grows. Halving needs exactly 4 times the data.' },
        ]
      } else {
        ;[from, to] = shuffle(rand, LEVELS).slice(0, 2)
        if (mode === 'level') {
          W = 6 * pick(rand, [2, 3, 4, 5, 6, 8, 10])
          right = (W * to.z) / from.z
          question = `If the analyst keeps the same data but reports a ${to.p} interval instead, how wide will it be?`
          how = `Width is proportional to z. Going from z = ${from.z} to z = ${to.z} multiplies it by ${to.z}/${from.z}: ${W} × ${to.z} / ${from.z} = ${num(right)}.`
          candidates = [
            { value: (W * from.z) / to.z, why: `This scales the wrong way. ${to.z > from.z ? 'More' : 'Less'} confidence needs a ${to.z > from.z ? 'wider' : 'narrower'} interval.` },
            { value: W, why: 'Changing the confidence level changes the z multiplier, so the width changes too.' },
            { value: (W * to.z * to.z) / (from.z * from.z), why: 'This squares the ratio of z values. Width is linear in z; squaring is what happens with sample size.' },
            { value: W * to.z, why: `This multiplies by the new z without dividing out the old one (${from.z}).` },
          ]
        } else {
          k = pick(rand, [4, 9])
          const rk = Math.sqrt(k)
          W = 36 * pick(rand, [1, 2, 3])
          right = (W * to.z) / (from.z * rk)
          question = `If the analyst gathers ${k} times as many customers (${num(n0 * k)}) and also switches to a ${to.p} interval, how wide will the new interval be?`
          how = `Both effects multiply: × ${to.z}/${from.z} for the level and ÷ √${k} = ${rk} for the sample size. ${W} × ${to.z} / ${from.z} / ${rk} = ${num(right)}.`
          candidates = [
            { value: (W * to.z) / (from.z * k), why: `This divides by ${k} instead of √${k} for the bigger sample.` },
            { value: W / rk, why: 'This handles the bigger sample but ignores the change in confidence level.' },
            { value: (W * to.z) / from.z, why: 'This handles the new confidence level but ignores the bigger sample.' },
            { value: (W * from.z) / (to.z * rk), why: 'This scales the confidence level the wrong way round.' },
            { value: W * rk, why: 'This makes the interval wider for more data, which is backwards.' },
          ]
        }
      }
      return {
        title: 'How the interval width changes',
        prompt: `From a random sample of ${n0} customers, a ${from.p} confidence interval for the ${what} is $${W} wide. Use the 68-95-99.7 multipliers (z = 1, 2 and 3 for 68%, 95% and 99.7%). ${question}`,
        approach: [
          'Width = 2 × z × σ / √n, so width is proportional to z and to 1 / √n.',
          'More data: divide the width by the square root of how many times n grew.',
          'New confidence level: multiply by new z / old z. Higher confidence means wider.',
        ],
        right: { value: right, text: cash(right), why: `Correct. ${how}` },
        wrong: firstThree(right, candidates).map((c) => ({ ...c, text: cash(c.value) })),
        params: { mode, W, n0, k, from: from.p, to: to.p },
      }
    },
  })

  // ---------------- z-scores and the 68-95-99.7 rule ----------------

  T.push({
    key: 'st-z-percentile', difficulty: 'Easy', section: 'stats', topic: 'z-scores and percentiles',
    make(rand) {
      const ctx = pick(rand, [
        { what: 'Credit scores of the bank\'s applicants', who: 'applicants', mu: pick(rand, [680, 700, 720]), sd: pick(rand, [40, 50]), show: (v) => String(v), adj: 'a score' },
        { what: 'Daily ATM withdrawal totals at a busy branch', who: 'days', mu: pick(rand, [300, 400]), sd: pick(rand, [50, 60]), show: (v) => `$${v}`, adj: 'a total' },
        { what: 'Mortgage processing times', who: 'applications', mu: pick(rand, [30, 40]), sd: pick(rand, [4, 5]), show: (v) => `${v} days`, adj: 'a processing time' },
      ])
      const k = pick(rand, [1, 2, 3])
      const ask = pick(rand, ['below', 'above', 'within', 'outside'])
      const z = ask === 'below' || ask === 'above' ? pick(rand, [1, -1]) * k : k
      // Shares in hundredths of a percent, so 99.7% is 9970 and every value is an integer
      const middle = { 1: 6800, 2: 9500, 3: 9970 }[k]
      const tail = (10000 - middle) / 2
      const lo = ctx.mu - k * ctx.sd
      const hi = ctx.mu + k * ctx.sd
      const x = ctx.mu + z * ctx.sd
      const p = (h) => `${h / 100}%`
      const question = {
        below: `About what percent of ${ctx.who} have ${ctx.adj} below ${ctx.show(x)}?`,
        above: `About what percent of ${ctx.who} have ${ctx.adj} above ${ctx.show(x)}?`,
        within: `About what percent of ${ctx.who} have ${ctx.adj} between ${ctx.show(lo)} and ${ctx.show(hi)}?`,
        outside: `About what percent of ${ctx.who} have ${ctx.adj} below ${ctx.show(lo)} or above ${ctx.show(hi)}?`,
      }[ask]
      const opts = [
        { value: middle / 10000, text: p(middle), why: `${p(middle)} is the share within ${k} SD of the mean on both sides, the middle of the curve.` },
        { value: (10000 - middle) / 10000, text: p(10000 - middle), why: `${p(10000 - middle)} is both tails together: everything more than ${k} SD from the mean in either direction.` },
        { value: tail / 10000, text: p(tail), why: `${p(tail)} is one tail only, the share beyond ${k} SD on one side.` },
        { value: (10000 - tail) / 10000, text: p(10000 - tail), why: `${p(10000 - tail)} is the middle plus one tail: everything on one side of a cutoff ${k} SD from the mean.` },
      ]
      let idx
      if (ask === 'within') idx = 0
      else if (ask === 'outside') idx = 1
      else idx = (ask === 'below') === (z > 0) ? 3 : 2
      const zText = ask === 'below' || ask === 'above'
        ? `${ctx.show(x)} is z = (${x} − ${ctx.mu}) / ${ctx.sd} = ${signed(z)}.`
        : `${ctx.show(lo)} and ${ctx.show(hi)} are z = −${k} and z = ${k}.`
      return {
        title: 'Using the 68-95-99.7 rule',
        prompt: `${ctx.what} are roughly normal with mean ${ctx.show(ctx.mu)} and standard deviation ${ctx.show(ctx.sd)}. ${question}`,
        approach: [
          'Convert the cutoff to a z-score: z = (x − mean) / SD.',
          'About 68%, 95% and 99.7% of values fall within 1, 2 and 3 SD of the mean.',
          'What is left over splits evenly between the two tails. Sketch the curve and shade the part asked for.',
        ],
        right: { value: opts[idx].value, text: opts[idx].text, why: `Correct. ${zText} ${opts[idx].why}` },
        wrong: opts.filter((_, i) => i !== idx).map((o) => ({ ...o, why: `${o.why} The question asks for a different region.` })),
        params: { z, ask },
      }
    },
  })

  // ---------------- Sample standard deviation by hand ----------------

  // Deviation patterns from the mean: five integers summing to 0 whose squares add to 16, 36, 64 or 100, so the
  // sample SD (divide by n − 1 = 4) is 2, 3, 4 or 5. The middle value is off the mean so the median trap differs.
  const PATTERNS = []
  ;(function enumerate(prefix, lo) {
    if (prefix.length === 5) {
      const sum = prefix.reduce((s, d) => s + d, 0)
      const ss = prefix.reduce((s, d) => s + d * d, 0)
      if (sum === 0 && [16, 36, 64, 100].includes(ss) && prefix[2] !== 0) PATTERNS.push(prefix)
      return
    }
    for (let d = lo; d <= 7; d++) enumerate([...prefix, d], d)
  })([], -7)

  T.push({
    key: 'st-sample-sd', difficulty: 'Medium', section: 'stats', topic: 'Standard deviation and standard error',
    make(rand) {
      const pattern = pick(rand, PATTERNS)
      const m = between(rand, 12, 30)
      const vals = shuffle(rand, pattern.map((d) => m + d))
      const ss = pattern.reduce((s, d) => s + d * d, 0)
      const s = Math.sqrt(ss / 4)
      const median = m + pattern[2]
      const medSS = vals.reduce((t, v) => t + (v - median) ** 2, 0)
      const ctx = pick(rand, [
        'Five branches opened these numbers of new accounts last week:',
        'A teller handled these numbers of cash deposits on five days:',
        'Five loan officers closed these numbers of loans last month:',
      ])
      return {
        title: 'Sample standard deviation by hand',
        prompt: `${ctx} ${vals.join(', ')}. Treating these as a sample, what is the sample standard deviation?`,
        approach: [
          'Find the mean, then each value\'s deviation from it.',
          'Square the deviations and add them up.',
          'For a sample, divide by n − 1 (not n) to get the variance, then take the square root for the SD.',
        ],
        right: { value: s, text: num(s), why: `Correct. Mean = ${m}. The deviations (${pattern.map(signed).join(', ')}) square to a total of ${ss}. ${ss} / 4 = ${s * s}, and √${s * s} = ${s}.` },
        wrong: [
          { value: Math.sqrt(ss / 5), text: approx(Math.sqrt(ss / 5)), why: `This divides by n = 5. A sample SD divides by n − 1 = 4: √(${ss} / 4) = ${s}.` },
          { value: ss / 4, text: num(ss / 4), why: `${ss / 4} is the sample variance. The SD is its square root.` },
          { value: Math.sqrt(medSS / 4), text: approx(Math.sqrt(medSS / 4)), why: `This measures deviations from the median (${median}) instead of the mean (${m}).` },
        ],
        params: { vals },
      }
    },
  })

  // ---------------- p-value decisions ----------------

  const PCTX = [
    { h0: 'the new reminder email does not change the on-time payment rate', up: 'the new reminder email raises the on-time payment rate', any: 'the new reminder email changes the on-time payment rate' },
    { h0: 'the redesigned app screen does not change the average session length', up: 'the redesigned app screen lengthens the average session', any: 'the redesigned app screen changes the average session length' },
    { h0: 'the new fraud rule does not change the chargeback rate', up: 'the new fraud rule lowers the chargeback rate', any: 'the new fraud rule changes the chargeback rate' },
    { h0: 'the cashback offer does not change average card spending', up: 'the cashback offer raises average card spending', any: 'the cashback offer changes average card spending' },
  ]
  // Candidate p-values for the planned test, in thousandths, for each α (also in thousandths). None equals α.
  const P_CHOICES = {
    10: [2, 4, 6, 8, 12, 16, 20, 30],
    50: [10, 20, 30, 40, 60, 80, 100, 120],
    100: [20, 40, 60, 80, 120, 140, 160, 200],
  }

  T.push({
    key: 'st-pvalue-decision', difficulty: 'Medium', section: 'stats', topic: 'Hypothesis testing: p-values',
    make(rand) {
      const ctx = pick(rand, PCTX)
      const alpha = pick(rand, [10, 50, 100])
      const eff = pick(rand, P_CHOICES[alpha])
      const variant = pick(rand, ['plain', 'plain', 'two-to-one', 'one-to-two'])
      let testSides
      let reportedSides
      let reported
      if (variant === 'plain') {
        testSides = pick(rand, [1, 2])
        reportedSides = testSides
        reported = eff
      } else if (variant === 'two-to-one') {
        testSides = 1
        reportedSides = 2
        reported = eff * 2
      } else {
        testSides = 2
        reportedSides = 1
        reported = eff / 2
      }
      const P = (t) => String(t / 1000)
      const a = P(alpha)
      const h1 = testSides === 1 ? ctx.up : ctx.any
      let prompt
      let convert = ''
      if (variant === 'plain') {
        prompt = `An analyst runs a ${testSides === 1 ? 'one-sided' : 'two-sided'} test of H0: ${ctx.h0}, against H1: ${h1}, at α = ${a}. The test gives p = ${P(reported)}. What should she conclude?`
      } else if (variant === 'two-to-one') {
        prompt = `An analyst planned a one-sided test of H0: ${ctx.h0}, against H1: ${h1}, at α = ${a}. Her software reports only the two-sided p-value, ${P(reported)}, and the sample moved in the direction H1 predicts. What should she conclude?`
        convert = `The one-sided p-value is half the two-sided one: ${P(reported)} / 2 = ${P(eff)}. `
      } else {
        prompt = `An analyst must run a two-sided test of H0: ${ctx.h0}, against H1: ${h1}, at α = ${a}. A colleague already computed the one-sided p-value in the direction the data moved: ${P(reported)}. What should she conclude?`
        convert = `The two-sided p-value doubles the one-sided one: 2 × ${P(reported)} = ${P(eff)}. `
      }
      const reject = eff < alpha
      const opts = [
        { value: 1, text: `Reject H0 at α = ${a}`, why: reject ? `${convert}${P(eff)} is below α = ${a}, so the result is significant.` : `${convert}${P(eff)} is above α = ${a}, so the evidence is not strong enough to reject.` },
        { value: 2, text: `Fail to reject H0 at α = ${a}`, why: reject ? `${convert}${P(eff)} is below α = ${a}, which is strong enough evidence to reject H0.` : `${convert}${P(eff)} is above α = ${a}, so H0 stays.` },
        { value: 3, text: `Accept H0: the data show that ${ctx.h0}`, why: 'A test never proves H0. A large p-value only means the data are consistent with H0; that is why the wording is "fail to reject".' },
        { value: 4, text: `Conclude there is a ${reported / 10}% chance that H0 is true`, why: 'A p-value is the chance of data at least this extreme if H0 were true. It is not the probability that H0 is true.' },
      ]
      const idx = reject ? 0 : 1
      return {
        title: 'Reading a p-value',
        topic: variant === 'plain' ? 'Hypothesis testing: p-values' : 'Hypothesis testing: one- and two-sided tests',
        prompt,
        approach: [
          'Make sure the p-value matches the planned test: when the data move in the predicted direction, the two-sided p-value is double the one-sided one.',
          'Reject H0 when p ≤ α; otherwise fail to reject.',
          'Watch for wording traps: "accept H0" and "the chance H0 is true" are both misreadings.',
        ],
        right: { value: opts[idx].value, text: opts[idx].text, why: `Correct. ${opts[idx].why}` },
        wrong: opts.filter((_, i) => i !== idx),
        params: { alpha, reported, reportedSides, testSides },
      }
    },
  })

  // ---------------- Type I and Type II errors ----------------

  // Each scenario has two states of the world (0 and 1) and the action that goes with concluding each one.
  // flip: whether H0 may be worded as either state (a "no effect" null only makes sense one way).
  const ERR_SCEN = [
    { setup: 'A fraud model screens card transactions.', unit: 'For one transaction', actor: 'the model', state: ['the transaction is legitimate', 'the transaction is fraudulent'], real: ['the transaction was legitimate', 'the transaction was fraud'], act: ['cleared it', 'flagged it as fraud'], flip: true },
    { setup: 'An underwriting model reviews loan applications.', unit: 'For one applicant', actor: 'the model', state: ['the applicant will repay', 'the applicant will default'], real: ['the applicant would have repaid', 'the applicant would have defaulted'], act: ['approved the loan', 'declined the application'], flip: true },
    { setup: 'A call center runs an identity check on callers.', unit: 'On one call', actor: 'the agent', state: ['the caller is the account holder', 'the caller is an impostor'], real: ['the caller really was the account holder', 'the caller was an impostor'], act: ['let the caller into the account', 'locked the account and asked for more ID'], flip: true },
    { setup: 'An anti-money-laundering analyst reviews alerts.', unit: 'For one alert', actor: 'the analyst', state: ['the account activity is normal', 'the account is laundering money'], real: ['the activity was normal', 'the account was laundering money'], act: ['closed the alert', 'filed a suspicious activity report'], flip: true },
    { setup: 'A marketing team A/B tests a new savings offer.', unit: 'In this test', actor: 'the team', state: ['the new offer does not change the sign-up rate', 'the new offer changes the sign-up rate'], real: ['the offer truly had no effect', 'the offer truly did change sign-ups'], act: ['kept the old offer, finding no significant effect', 'declared the new offer a winner'], flip: false },
    { setup: 'A risk team tests a new credit scoring model against the current one.', unit: 'In this test', actor: 'the team', state: ['the new model ranks risk no better than the current one', 'the new model ranks risk better'], real: ['the new model was truly no better', 'the new model truly was better'], act: ['kept the current model', 'switched to the new model'], flip: false },
  ]
  const cap = (s) => s[0].toUpperCase() + s.slice(1)

  T.push({
    key: 'st-error-type', difficulty: 'Easy', section: 'stats', topic: 'Type I and Type II errors',
    make(rand) {
      const scen = pick(rand, ERR_SCEN)
      const h0 = scen.flip ? pick(rand, [0, 1]) : 0
      const actual = pick(rand, [0, 1])
      const concluded = pick(rand, [0, 1])
      const stmt = scen.state[h0]
      const wording = pick(rand, [`H0: "${stmt}"`, `the null hypothesis that ${stmt}`, `the starting assumption (H0) that ${stmt}`])
      const h0True = actual === h0
      const rejected = concluded !== h0
      const fact = `H0 (${stmt}) was ${h0True ? 'true' : 'false'}, and ${scen.actor} ${rejected ? 'rejected' : 'kept'} it.`
      const opts = [
        { value: 1, text: 'Type I error', why: 'A Type I error is rejecting a true H0.' },
        { value: 2, text: 'Type II error', why: 'A Type II error is keeping a false H0.' },
        { value: 3, text: 'Correct decision: a true H0 was kept', why: 'That needs H0 to be true and kept.' },
        { value: 4, text: 'Correct decision: a false H0 was rejected', why: 'That needs H0 to be false and rejected.' },
      ]
      const idx = h0True ? (rejected ? 0 : 2) : rejected ? 3 : 1
      return {
        title: 'Name that outcome',
        prompt: `${scen.setup} ${cap(scen.actor)} works from ${wording}. ${scen.unit}, ${scen.real[actual]}, and ${scen.actor} ${scen.act[concluded]}. How should this outcome be classified?`,
        approach: [
          'Write down H0 in words first. The answer depends on what H0 says, not on which outcome sounds bad.',
          'Was H0 actually true? Did the decision reject it (act on the alternative) or keep it?',
          'Reject a true H0 = Type I. Keep a false H0 = Type II. The other two combinations are correct decisions.',
        ],
        right: { value: opts[idx].value, text: opts[idx].text, why: `Correct. ${fact}` },
        wrong: opts.filter((_, i) => i !== idx).map((o) => ({ ...o, why: `${o.why} Here ${fact}` })),
        params: { h0, actual, concluded },
      }
    },
  })

  // ---------------- Choosing a test ----------------

  const TESTS = { 1: 'Two-sample t-test', 2: 'One-way ANOVA', 3: 'Chi-square test of independence', 4: 'Paired t-test', 5: 'One-proportion z-test' }
  const USE = {
    1: 'comparing the means of two separate groups',
    2: 'comparing the means of three or more groups',
    3: 'checking whether two categorical variables are related, using counts',
    4: 'comparing two measurements taken on the same people or units',
    5: 'comparing one sample proportion with a fixed target',
  }
  const CLUE = {
    1: 'Here there are two independent groups and a numeric outcome.',
    2: 'Here there are three or more groups and a numeric outcome.',
    3: 'Here both variables are categories, so the data are counts in a table.',
    4: 'Here each unit is measured twice, so the before and after values are paired.',
    5: 'Here there is one group, a yes or no outcome, and a fixed benchmark.',
  }
  const BRANCHES = ['Downtown', 'Riverside', 'Airport', 'Harbor', 'Northgate', 'Elm Street']
  const TEST_SCEN = [
    { id: 'two-branches', code: 1, text: (r) => { const [a, b] = shuffle(r, BRANCHES); return `An analyst wants to know whether the average personal loan amount differs between the ${a} and ${b} branches, using a random sample of loans from each.` } },
    { id: 'ab-deposit', code: 1, text: (r) => `New customers were randomly shown one of two welcome offers. Using ${pick(r, [200, 300, 400])} customers per offer, the team compares the average first deposit of the offer A group with that of the offer B group.` },
    { id: 'regions-spend', code: 2, text: (r) => `A bank compares average monthly card spending across its ${pick(r, ['four', 'five'])} regions, using a random sample of cardholders from each region.` },
    { id: 'shifts-wait', code: 2, text: () => 'The call center wants to know whether mean hold time differs across its morning, afternoon and night shifts.' },
    { id: 'acct-age', code: 3, text: () => 'An analyst asks whether account type (checking, savings or money market) is related to age band (under 30, 30 to 50, over 50), using counts of customers in each combination.' },
    { id: 'region-paperless', code: 3, text: (r) => `Using a sample of ${pick(r, [600, 800, 1000])} customers, the bank tests whether region is associated with whether a customer signed up for paperless statements.` },
    { id: 'teller-training', code: 4, text: (r) => `The same ${pick(r, [12, 15, 20])} tellers had their weekly error counts recorded before and after a training course. Did the course change the average error count?` },
    { id: 'card-upgrade', code: 4, text: (r) => `For ${pick(r, [40, 50, 60])} customers, the bank records monthly spending in the month before and the month after each one's card was upgraded, and tests whether spending changed.` },
    { id: 'autopay-target', code: 5, text: (r) => `Management's target is that ${pick(r, [30, 40, 50])}% of customers use autopay. From a random sample of ${pick(r, [400, 500])} customers, an analyst tests whether the true share is above the target.` },
    { id: 'false-alarm-claim', code: 5, text: (r) => `A vendor claims its fraud model flags only ${pick(r, [2, 3, 5])}% of legitimate transactions. The bank checks a random sample of legitimate transactions to test that claim.` },
  ]
  const lowerName = (c) => (c === 2 ? 'one-way ANOVA' : TESTS[c].toLowerCase())

  T.push({
    key: 'st-choose-test', difficulty: 'Medium', section: 'stats', topic: 'Choosing a test',
    make(rand) {
      const scen = pick(rand, TEST_SCEN)
      const others = shuffle(rand, [1, 2, 3, 4, 5].filter((c) => c !== scen.code)).slice(0, 3)
      return {
        title: 'Which test fits',
        prompt: `${scen.text(rand)} Which test is the best fit?`,
        approach: [
          'What kind of outcome is it: a numeric average, a proportion, or counts in categories?',
          'How many groups are compared, and are they separate groups or the same units measured twice?',
          'Two separate means: t-test. Three or more means: ANOVA. Two categorical variables: chi-square. Same units before and after: paired t-test. One proportion against a target: z-test.',
        ],
        right: { value: scen.code, text: TESTS[scen.code], why: `Correct. The ${lowerName(scen.code)} is for ${USE[scen.code]}. ${CLUE[scen.code]}` },
        wrong: others.map((c) => ({ value: c, text: TESTS[c], why: `The ${lowerName(c)} is for ${USE[c]}. ${CLUE[scen.code]}` })),
        params: { id: scen.id },
      }
    },
  })

  // ---------------- Correlation ----------------

  const PAIRS = [
    { x: 'income', y: 'monthly card spending', sign: 1 },
    { x: 'account age', y: 'average balance', sign: 1 },
    { x: 'years as a customer', y: 'number of products held', sign: 1 },
    { x: 'credit score', y: 'interest rate offered', sign: -1 },
    { x: 'number of late payments', y: 'credit score', sign: -1 },
  ]

  T.push({
    key: 'st-correlation', difficulty: 'Medium', section: 'stats', topic: 'Correlation',
    make(rand) {
      const pair = pick(rand, PAIRS)
      const mode = pick(rand, ['statements', 'strongest'])
      if (mode === 'statements') {
        const rt = between(rand, 3, 9) // |r| in tenths
        const s = pair.sign
        const r = (s * rt) / 10
        const sq = rt * rt // percent of variation explained
        const say = (dir, share) => `Higher ${pair.x} goes with ${dir > 0 ? 'higher' : 'lower'} ${pair.y}, and ${pair.x} explains ${share}% of the variation in ${pair.y}`
        return {
          title: 'What r tells you',
          prompt: `Across a sample of customers, the correlation between ${pair.x} and ${pair.y} is r = ${signed(r)}. Which statement does this support?`,
          approach: [
            'The sign of r gives the direction: positive means both rise together, negative means one falls as the other rises.',
            'The share of variation a straight line explains is r², not r.',
            'Square the decimal: 0.6² = 0.36, so 36%.',
          ],
          right: { value: s * sq, text: say(s, sq), why: `Correct. r is ${s > 0 ? 'positive' : 'negative'}, and r² = ${sq / 100}, so ${sq}% of the variation is explained.` },
          wrong: [
            { value: s * rt * 10, text: say(s, rt * 10), why: `The direction is right, but ${rt * 10}% is |r| as a percent. Variation explained is r² = ${sq}%.` },
            { value: -s * sq, text: say(-s, sq), why: `r² = ${sq}% is right, but a ${s > 0 ? 'positive' : 'negative'} r means ${s > 0 ? 'both rise together' : 'one falls as the other rises'}.` },
            { value: -s * rt * 10, text: say(-s, rt * 10), why: 'This gets the direction backwards and uses |r| instead of r² for variation explained.' },
          ],
          params: { mode, r },
        }
      }
      const mags = shuffle(rand, [2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4)
      const top = Math.max(...mags)
      // The strongest one is negative most of the time, since that is the trap
      const rs = mags.map((m) => ((m === top ? rand() < 0.7 : rand() < 0.5) ? -m : m) / 10)
      if (!rs.some((r) => r > 0)) rs[mags.indexOf(Math.min(...mags))] *= -1
      const best = rs[mags.indexOf(top)]
      const biggest = Math.max(...rs)
      const label = (r) => `r = ${signed(r)}`
      return {
        title: 'The strongest relationship',
        prompt: `An analyst correlates ${pair.y} with four different customer features. Which correlation shows the strongest linear relationship?`,
        approach: [
          'Strength is the size of r, ignoring its sign: compare |r|.',
          'The sign only tells direction. r = −0.9 is stronger than r = 0.5.',
          'Equivalently, the strongest relationship has the largest r².',
        ],
        right: { value: best, text: label(best), why: `Correct. |${signed(best)}| = ${top / 10} is the largest magnitude, so this feature has the strongest linear relationship${best < 0 ? ', even though it is negative' : ''}.` },
        wrong: rs.filter((r) => r !== best).map((r) => ({ value: r, text: label(r), why: `|${signed(r)}| = ${Math.abs(r)} is smaller than ${top / 10}.${r === biggest ? ' It is the biggest number, but strength ignores the sign.' : ''}` })),
        params: { mode, rs },
      }
    },
  })

  // ---------------- Sampling methods ----------------

  const METHODS = { 1: 'Simple random sample', 2: 'Stratified sample', 3: 'Cluster sample', 4: 'Systematic sample', 5: 'Convenience sample' }
  const METHOD_DEF = {
    1: 'In a simple random sample every individual, and every group of the chosen size, has the same chance of selection.',
    2: 'A stratified sample splits the population into groups and draws randomly within every group.',
    3: 'A cluster sample randomly picks whole groups and then takes everyone in the chosen groups.',
    4: 'A systematic sample takes every kth item from a list after a random start.',
    5: 'A convenience sample takes whoever is easiest to reach, with no random selection.',
  }
  const SAMPLE_SCEN = [
    { id: 'srs-number', code: 1, text: (r) => { const n = pick(r, [200, 300, 500]); return `The bank numbers all ${pick(r, ['48,000', '60,000', '75,000'])} credit card holders and has software pick ${n} numbers at random, so every set of ${n} customers is equally likely.` } },
    { id: 'srs-draw', code: 1, text: (r) => `An auditor puts the IDs of all ${pick(r, ['800', '1,200', '1,500'])} loan files from the quarter into a random draw and pulls ${pick(r, [40, 50, 60])} of them.` },
    { id: 'strat-tier', code: 2, text: (r) => `To be sure every account tier is represented, the bank splits customers into basic, plus and premium tiers and randomly picks ${pick(r, [50, 100])} customers from each tier.` },
    { id: 'strat-region', code: 2, text: (r) => `Analysts randomly select ${pick(r, [30, 40, 60])} customers within each of the bank's ${pick(r, [4, 5, 6])} regions and combine them into one survey sample.` },
    { id: 'cluster-branch', code: 3, text: (r) => `The bank randomly picks ${pick(r, [5, 6, 8])} of its ${pick(r, [40, 60, 90])} branches and surveys every customer who banks at those branches.` },
    { id: 'cluster-day', code: 3, text: (r) => `An auditor randomly chooses ${pick(r, [3, 4, 5])} business days from last quarter and reviews every wire transfer posted on those days.` },
    { id: 'sys-list', code: 4, text: (r) => { const k = pick(r, [10, 20, 25, 50]); return `After sorting accounts by account number, an analyst picks a random starting account among the first ${k} and then takes every ${k}th account on the list.` } },
    { id: 'sys-calls', code: 4, text: (r) => { const k = pick(r, [10, 15, 20]); return `A quality team starts at a random call among the first ${k} of the day and then listens to every ${k}th call into the service line.` } },
    { id: 'conv-lobby', code: 5, text: (r) => `A researcher surveys the first ${pick(r, [30, 40, 50])} customers who walk into the ${pick(r, BRANCHES)} branch on Monday morning.` },
    { id: 'conv-coworkers', code: 5, text: (r) => `To test a new mobile app screen, an analyst asks ${pick(r, [8, 10, 12])} coworkers who happen to sit nearby to try it and rate it.` },
  ]

  T.push({
    key: 'st-sampling-method', difficulty: 'Easy', section: 'stats', topic: 'Sampling methods',
    make(rand) {
      const scen = pick(rand, SAMPLE_SCEN)
      const others = shuffle(rand, [1, 2, 3, 4, 5].filter((c) => c !== scen.code)).slice(0, 3)
      return {
        title: 'Name the sampling method',
        prompt: `${scen.text(rand)} Which sampling method is this?`,
        approach: [
          'Is anything random at all? If not, it is a convenience sample.',
          'Groups involved? Random picks within every group is stratified; picking whole groups and taking everyone is cluster.',
          'A fixed step through a list after a random start is systematic. One random draw from the full list is simple random.',
        ],
        right: { value: scen.code, text: METHODS[scen.code], why: `Correct. ${METHOD_DEF[scen.code]}` },
        wrong: others.map((c) => ({ value: c, text: METHODS[c], why: `${METHOD_DEF[c]} That is not what happens here.` })),
        params: { id: scen.id },
      }
    },
  })

  // ---------------- Standard error of a proportion ----------------

  // Sample sizes that make p(1 − p) / n a perfect square, keyed by p(1 − p) in ten-thousandths
  const PROP_N = { 2500: [100, 400, 625, 2500], 1600: [64, 100, 400, 1600], 900: [100, 225, 900] }

  T.push({
    key: 'st-se-proportion', difficulty: 'Hard', section: 'stats', topic: 'Standard deviation and standard error',
    make(rand) {
      const p100 = pick(rand, [50, 20, 80, 10, 90])
      const pq = p100 * (100 - p100) // 2500, 1600 or 900
      const rootPq = Math.sqrt(pq) / 100 // 0.5, 0.4 or 0.3
      const p = p100 / 100
      const pqv = pq / 10000
      const ask = pick(rand, ['se', 'moe', 'n'])
      const habit = pick(rand, ['use mobile check deposit', 'carry a balance on their card', 'have a savings account with the bank'])
      let prompt
      let right
      let how
      let candidates
      let n = 0
      let e = 0
      let fmt = dec
      if (ask === 'se' || ask === 'moe') {
        n = pick(rand, PROP_N[pq])
        const se = rootPq / Math.sqrt(n)
        right = ask === 'se' ? se : 2 * se
        prompt = ask === 'se'
          ? `In a random sample of ${num(n)} customers, ${p100}% ${habit}. What is the standard error of this sample proportion?`
          : `In a random sample of ${num(n)} customers, ${p100}% ${habit}. Using z = 2, what is the margin of error of a 95% confidence interval for the true proportion?`
        how = `SE = √(${p} × ${+(1 - p).toFixed(2)} / ${n}) = √(${pqv} / ${n}) = ${dec(se)}${ask === 'moe' ? `, and the margin is 2 × ${dec(se)} = ${dec(right)}` : ''}.`
        candidates = ask === 'se'
          ? [
            { value: pqv / n, why: 'This is p(1 − p) / n, the variance of the sample proportion. The standard error is its square root.' },
            { value: Math.sqrt(p / n), why: 'This drops the (1 − p) factor from inside the square root.' },
            { value: rootPq / n, why: 'This takes the square root of p(1 − p) but divides by n instead of √n.' },
          ]
          : [
            { value: se, why: 'This is one standard error. The 95% margin multiplies it by z = 2.' },
            { value: (2 * pqv) / n, why: 'This doubles p(1 − p) / n but forgets the square root.' },
            { value: (2 * rootPq) / n, why: 'This divides by n instead of √n.' },
            { value: 2 * Math.sqrt(p / n), why: 'This drops the (1 − p) factor.' },
          ]
      } else {
        const e4 = pick(rand, [100, 200, 250, 500]) // target SE in ten-thousandths
        e = e4 / 10000
        right = (pq * 10000) / (e4 * e4)
        fmt = num
        prompt = `About ${p100}% of customers ${habit}. How many customers must a random survey include so that the standard error of the sample proportion is ${e}?`
        how = `Solve √(p(1 − p) / n) = ${e}: n = p(1 − p) / SE² = ${pqv} / ${+(e * e).toFixed(6)} = ${num(right)}.`
        candidates = [
          { value: pqv / e, why: 'This divides p(1 − p) by the SE without squaring it.' },
          { value: rootPq / e, why: 'This solves √(p(1 − p)) / n = SE, forgetting that n sits under the square root.' },
          { value: 1 / (e * e), why: 'This leaves out the p(1 − p) factor.' },
          { value: 1 / e, why: 'This leaves out p(1 − p) and forgets to square the SE.' },
        ]
      }
      return {
        title: ask === 'n' ? 'Survey size for a target error' : 'Standard error of a proportion',
        prompt,
        approach: [
          'SE of a sample proportion = √(p(1 − p) / n).',
          'p(1 − p) is 0.25 at p = 0.5, 0.16 at p = 0.2 or 0.8, and 0.09 at p = 0.1 or 0.9.',
          'The 95% margin of error is about 2 × SE. To hit a target SE, solve for n = p(1 − p) / SE².',
        ],
        right: { value: right, text: fmt(right), why: `Correct. ${how}` },
        wrong: firstThree(right, candidates).map((c) => ({ ...c, text: fmt(c.value) })),
        params: { ask, p, n, e },
      }
    },
  })
})()
