'use strict'
// Load after generators.js. Numeric templates for the data science sections: machine learning metrics and
// cross-validation (ml), A/B test sizing and pitfalls (ab), and data engineering row and partition counts (de).
// Same contract as generators.js; tools/check_generators.mjs re-derives every answer by simulation or counting.

;(function () {
  const api = typeof window !== 'undefined' ? window.GENERATORS : require('./generators.js')
  const T = api.templates

  const pick = (rand, list) => list[Math.floor(rand() * list.length)]
  const between = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
  const frac = (n, d) => {
    const g = gcd(n, d)
    return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`
  }
  // Numbers with thousands separators and a true minus sign
  const num = (n) => `${n < 0 ? '−' : ''}${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 4 })}`
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

  // ---------------- Machine learning ----------------

  T.push({
    key: 'ml-confusion-metric', difficulty: 'Easy', section: 'ml', topic: 'Metrics: precision and recall',
    make(rand) {
      const tp = pick(rand, [30, 40, 60, 80, 90])
      const fp = pick(rand, [10, 20, 30, 40, 60])
      const fn = pick(rand, [10, 20, 30, 40, 60])
      const tn = pick(rand, [700, 760, 800, 850, 900])
      const total = tp + fp + fn + tn
      const ask = pick(rand, ['precision', 'recall', 'F1'])
      const m = {
        precision: { value: tp / (tp + fp), text: frac(tp, tp + fp), calc: `TP / (TP + FP) = ${tp} / ${tp + fp}` },
        recall: { value: tp / (tp + fn), text: frac(tp, tp + fn), calc: `TP / (TP + FN) = ${tp} / ${tp + fn}` },
        F1: { value: (2 * tp) / (2 * tp + fp + fn), text: frac(2 * tp, 2 * tp + fp + fn), calc: `2TP / (2TP + FP + FN) = ${2 * tp} / ${2 * tp + fp + fn}` },
      }
      const acc = { value: (tp + tn) / total, text: frac(tp + tn, total) }
      const spec = { value: tn / (tn + fp), text: frac(tn, tn + fp) }
      // (P + R) / 2 = TP(2TP + FP + FN) / (2(TP + FP)(TP + FN))
      const avgNum = tp * (2 * tp + fp + fn)
      const avgDen = 2 * (tp + fp) * (tp + fn)
      const candidates = {
        precision: [
          { ...m.recall, why: 'This is recall, TP / (TP + FN). Precision divides by everything the model flagged, TP + FP.' },
          { ...acc, why: 'This is accuracy. The many true negatives make it look high, which is why it is a poor fraud metric.' },
          { value: fp / (tp + fp), text: frac(fp, tp + fp), why: 'This is the share of flags that were false alarms, which is 1 minus precision.' },
          { ...spec, why: 'This is specificity, TN / (TN + FP), the share of legitimate transactions left alone.' },
        ],
        recall: [
          { ...m.precision, why: 'This is precision, TP / (TP + FP). Recall divides by every actual fraud case, TP + FN.' },
          { ...acc, why: 'This is accuracy. The many true negatives make it look high, which is why it is a poor fraud metric.' },
          { ...spec, why: 'This is specificity, TN / (TN + FP): recall for the legitimate class, not for fraud.' },
          { value: fn / (tp + fn), text: frac(fn, tp + fn), why: 'This is the miss rate, FN / (TP + FN), which is 1 minus recall.' },
        ],
        F1: [
          { value: avgNum / avgDen, text: frac(avgNum, avgDen), why: 'This is the plain average of precision and recall. F1 is their harmonic mean, which sits closer to the smaller one.' },
          { ...m.precision, why: 'This is precision alone. F1 combines precision and recall.' },
          { ...m.recall, why: 'This is recall alone. F1 combines precision and recall.' },
          { ...acc, why: 'This is accuracy, which also counts true negatives. F1 ignores them.' },
        ],
      }[ask]
      return {
        title: `${ask === 'F1' ? 'F1 score' : ask[0].toUpperCase() + ask.slice(1)} from a confusion matrix`,
        prompt: `A fraud model is scored on ${num(total)} test transactions. It flags ${tp + fp}: ${tp} are real fraud (true positives) and ${fp} are legitimate (false positives). Of the transactions it does not flag, ${fn} are fraud (false negatives) and ${num(tn)} are legitimate (true negatives). What is the model's ${ask}${ask === 'F1' ? ' score' : ''}?`,
        approach: [
          'Precision = TP / (TP + FP): of the flags, how many were right. Recall = TP / (TP + FN): of the real fraud, how much was caught.',
          'F1 = 2PR / (P + R), which simplifies to 2TP / (2TP + FP + FN).',
          'True negatives appear only in accuracy and specificity, so for these metrics you can ignore them.',
        ],
        right: { value: m[ask].value, text: m[ask].text, why: `Correct. ${m[ask].calc} = ${m[ask].text}.` },
        wrong: firstThree(m[ask].value, candidates),
        params: { tp, fp, fn, tn, ask },
      }
    },
  })

  T.push({
    key: 'ml-majority-baseline', difficulty: 'Medium', section: 'ml', topic: 'Metrics: class imbalance',
    make(rand) {
      const N = pick(rand, [1000, 2000, 5000, 10000])
      const dPct = pick(rand, [1, 2, 3, 4, 5, 8, 10])
      const d = (N * dPct) / 100
      const accPct = 100 - dPct
      const what = pick(rand, [['loans', 'defaulted', 'no default', 'defaults'], ['card transactions', 'were fraud', 'not fraud', 'fraud cases'], ['customers', 'churned', 'stays', 'churners']])
      const code = (a, r) => a * 1000 + r
      const label = (a, r) => `Accuracy ${a}%, recall ${r}%`
      return {
        title: 'Always predicting the majority',
        prompt: `A test set has ${num(N)} ${what[0]}, and ${num(d)} of them ${what[1]}. A baseline model predicts "${what[2]}" for every one. What are its accuracy and its recall on the ${what[3]}?`,
        approach: [
          'Accuracy = correct predictions / all predictions. Predicting the majority class gets every majority row right.',
          'Recall for the rare class = caught / actual rare cases. A model that never predicts the rare class catches none.',
          'This is why accuracy misleads on imbalanced data: a useless model can score above 90%.',
        ],
        right: { value: code(accPct, 0), text: label(accPct, 0), why: `Correct. It is right on the ${num(N - d)} majority rows, so accuracy is ${num(N - d)} / ${num(N)} = ${accPct}%, and it catches 0 of the ${num(d)} ${what[3]}, so recall is 0%.` },
        wrong: [
          { value: code(accPct, 100), text: label(accPct, 100), why: `100% is the recall for the majority class. Recall on the ${what[3]} counts how many of them were caught, and that is none.` },
          { value: code(dPct, 0), text: label(dPct, 0), why: `${dPct}% is the error rate, the share of rows it gets wrong. Accuracy is the share it gets right.` },
          { value: code(50, 50), text: label(50, 50), why: 'A constant prediction is not a coin flip. Its accuracy equals the majority share, and it never finds a rare case.' },
        ],
        params: { N, d },
      }
    },
  })

  T.push({
    key: 'ml-r-squared', difficulty: 'Easy', section: 'ml', topic: 'Regression metrics',
    make(rand) {
      const sst = pick(rand, [200, 400, 500, 800, 1000, 2000])
      const [fn, fd] = pick(rand, [[1, 10], [1, 5], [1, 4], [2, 5], [4, 5]])
      const sse = (sst * fn) / fd
      const r2 = (fd - fn) / fd
      const target = pick(rand, ['monthly deposits', 'loan amounts', 'card spend'])
      return {
        title: 'R² from two sums of squares',
        prompt: `A regression model predicts ${target} (in $ thousands). On the test set, the sum of squared errors (SSE, actual minus predicted) is ${num(sse)}, and the total sum of squares around the mean (SST) is ${num(sst)}. What is the model's R²?`,
        approach: [
          'R² = 1 − SSE / SST: the share of the variation around the mean that the model explains.',
          'SSE / SST is the share left unexplained, so subtract it from 1.',
          'R² is a share, so it is at most 1. It goes below 0 only when the model is worse than predicting the mean.',
        ],
        right: { value: r2, text: num(r2), why: `Correct. 1 − ${num(sse)} / ${num(sst)} = 1 − ${num(fn / fd)} = ${num(r2)}.` },
        wrong: [
          { value: fn / fd, text: num(fn / fd), why: 'This is SSE / SST, the unexplained share. R² is 1 minus it.' },
          { value: sst - sse, text: num(sst - sse), why: 'This is the explained sum of squares, SST − SSE. Divide it by SST to get a share.' },
          { value: (fn - fd) / fn, text: num((fn - fd) / fn), why: 'This swaps the sums, computing 1 − SST / SSE.' },
        ],
        params: { sse, sst },
      }
    },
  })

  T.push({
    key: 'ml-grid-cv-fits', difficulty: 'Medium', section: 'ml', topic: 'Cross-validation',
    make(rand) {
      for (;;) {
        const k = pick(rand, [3, 4, 5, 10])
        const a = between(rand, 2, 5)
        const b = between(rand, 2, 4)
        const right = a * b * k + 1
        const values = [right, a * b * k, (a + b) * k + 1, a * b * (k - 1) + 1]
        if (new Set(values).size < 4) continue
        const depths = [2, 3, 4, 5, 6].slice(0, a)
        const trees = [100, 200, 300, 500].slice(0, b)
        return {
          title: 'How many models a grid search fits',
          prompt: [
            'A credit risk team tunes a gradient boosting model with scikit-learn. Counting every model trained, including the final refit, how many models does this train?',
            '',
            '```',
            `grid = {'max_depth': [${depths.join(', ')}], 'n_estimators': [${trees.join(', ')}]}`,
            `search = GridSearchCV(GradientBoostingClassifier(), grid, cv=${k}, refit=True)`,
            'search.fit(X_train, y_train)',
            '```',
          ],
          approach: [
            'A grid tries every combination: multiply the number of values for each hyperparameter.',
            'k-fold cross-validation trains k models per combination, each on k − 1 folds.',
            'refit=True trains one more model, the best combination, on all of the training data.',
          ],
          right: { value: right, text: String(right), why: `Correct. ${a} × ${b} = ${a * b} combinations, ${k} folds each is ${a * b * k} fits, plus 1 refit = ${right}.` },
          wrong: [
            { value: a * b * k, text: String(a * b * k), why: 'This forgets the final refit on the full training set that refit=True adds.' },
            { value: (a + b) * k + 1, text: String((a + b) * k + 1), why: `This adds the grid sizes (${a} + ${b}) instead of multiplying them. The grid tries every combination.` },
            { value: a * b * (k - 1) + 1, text: String(a * b * (k - 1) + 1), why: `This uses k − 1 = ${k - 1} fits per combination. Each fit trains on k − 1 folds, but there are still k fits.` },
          ],
          params: { a, b, k },
        }
      }
    },
  })

  // ---------------- A/B testing ----------------

  T.push({
    key: 'ab-mde-sample-size', difficulty: 'Medium', section: 'ab', topic: 'A/B testing: sample size and power',
    make(rand) {
      const [oldM, newM] = pick(rand, [[2, 1], [1, 2], [3, 1], [1, 3], [4, 2], [2, 4], [6, 2], [2, 6]])
      const R = Math.max(oldM, newM) / Math.min(oldM, newM)
      const n = R * R * pick(rand, [1000, 2000, 3000, 5000])
      const up = oldM > newM // a smaller effect needs more customers
      const right = up ? n * R * R : n / (R * R)
      const noSquare = up ? n * R : n / R
      const backwards = up ? n / (R * R) : n * R * R
      const both = up ? n / R : n * R
      const metric = pick(rand, ['card activation rate', 'online banking sign-up rate', 'savings account open rate'])
      const pp = (x) => `${x} percentage point${x === 1 ? '' : 's'}`
      return {
        title: 'Changing the minimum detectable effect',
        prompt: `A power calculation says a test on ${metric} needs ${num(n)} customers per group to detect a lift of ${pp(oldM)}. Keeping the same significance level and power, about how many customers per group are needed to detect a lift of ${pp(newM)}?`,
        approach: [
          'Required sample size per group is proportional to 1 / MDE²: n = 2(z_α/2 + z_β)² σ² / MDE².',
          `The MDE changes by a factor of ${frac(newM, oldM)}, so n changes by a factor of 1 / (${frac(newM, oldM)})² = ${frac(oldM * oldM, newM * newM)}.`,
          'Halving the effect you want to detect quadruples the sample, not doubles it.',
        ],
        right: { value: right, text: num(right), why: `Correct. n scales with 1 / MDE²: ${num(n)} × (${oldM} / ${newM})² = ${num(right)}.` },
        wrong: [
          { value: noSquare, text: num(noSquare), why: `This scales n by ${oldM} / ${newM} without squaring. Sample size depends on the square of the effect.` },
          { value: backwards, text: num(backwards), why: 'This squares the factor but moves it the wrong way. A smaller effect needs more data, a larger one less.' },
          { value: both, text: num(both), why: 'This moves the wrong way and also forgets the square.' },
        ],
        params: { n, oldM, newM },
      }
    },
  })

  T.push({
    key: 'ab-many-metrics', difficulty: 'Medium', section: 'ab', topic: 'A/B testing: pitfalls',
    make(rand) {
      const alpha = pick(rand, [0.05, 0.1, 0.01])
      const m = between(rand, 3, alpha === 0.1 ? 8 : 10)
      const keep = +(1 - alpha).toFixed(2)
      const right = 1 - keep ** m
      return {
        title: 'At least one false positive',
        prompt: `A test of a new mobile banking home screen reports ${m} independent metrics, each tested at α = ${alpha}. The change actually affects none of them. What is the probability that at least one metric comes out statistically significant?`,
        approach: [
          'Each metric has probability α of a false positive and 1 − α of correctly showing nothing.',
          `"At least one" = 1 − P(none). With independent metrics, P(none) = (1 − α)^m = ${keep}^${m}.`,
          'Fix it with a correction such as Bonferroni (test each at α / m) or by naming one primary metric before the test.',
        ],
        right: { value: right, text: `1 − ${keep}^${m}`, why: `Correct. P(no false positives) = ${keep}^${m}, so P(at least one) = 1 − ${keep}^${m}, about ${Math.round(right * 100)}%.` },
        wrong: [
          { value: m * alpha, text: num(+(m * alpha).toFixed(4)), why: `This adds the error rates, ${m} × ${alpha}. That double counts outcomes where several metrics are false positives at once; it is only an upper bound.` },
          { value: keep ** m, text: `${keep}^${m}`, why: 'This is the probability that none of the metrics comes out significant, the complement of what was asked.' },
          { value: alpha ** m, text: `${alpha}^${m}`, why: 'This is the probability that every metric is a false positive, not at least one.' },
        ],
        params: { alpha, m },
      }
    },
  })

  T.push({
    key: 'ab-srm-sd', difficulty: 'Hard', section: 'ab', topic: 'A/B testing: pitfalls',
    make(rand) {
      const n = pick(rand, [10000, 40000, 90000, 160000, 250000, 1000000])
      const root = Math.sqrt(n)
      const sd = root / 2
      const z = between(rand, 1, 6)
      const dev = z * sd
      const control = pick(rand, [true, false]) ? n / 2 + dev : n / 2 - dev
      const treat = n - control
      return {
        title: 'How far off is the split',
        prompt: `A test meant to split customers 50/50 assigned ${num(n)} customers: ${num(control)} to control and ${num(treat)} to treatment. Treat the control count as binomial with p = 0.5. How many standard deviations is the control count from its expected value?`,
        approach: [
          'The expected control count is n / 2. The binomial SD is √(n × p × (1 − p)) = √(n × 0.25) = √n / 2.',
          `Here √${num(n)} = ${num(root)}, so the SD is ${num(sd)}.`,
          'Divide the gap between the observed and expected control count by the SD. Anything beyond about 3 signals a sample ratio mismatch worth investigating.',
        ],
        right: { value: z, text: num(z), why: `Correct. The expected count is ${num(n / 2)}, the gap is ${num(dev)}, and ${num(dev)} / ${num(sd)} = ${z}.` },
        wrong: [
          { value: z / 2, text: num(z / 2), why: `This uses √n = ${num(root)} as the SD, leaving out the p(1 − p) = 0.25 inside the root.` },
          { value: 2 * z, text: num(2 * z), why: `This divides the gap between the two groups (${num(2 * dev)}) by the SD of one group's count. That gap is twice the deviation of the control count.` },
          { value: dev / (n / 4), text: num(dev / (n / 4)), why: `This divides by the variance, n × 0.25 = ${num(n / 4)}, and forgets the square root.` },
        ],
        params: { n, control },
      }
    },
  })

  T.push({
    key: 'ab-cuped', difficulty: 'Medium', section: 'ab', topic: 'A/B testing: variance reduction',
    make(rand) {
      const r10 = pick(rand, [3, 4, 6, 7, 8, 9])
      const rho = r10 / 10
      const ask = pick(rand, ['n', 'variance'])
      const base = ask === 'n' ? pick(rand, [10000, 20000, 50000, 100000]) : pick(rand, [400, 900, 2500, 10000])
      const scaled = (h) => (base * h) / 100 // h is in hundredths
      const keepH = 100 - r10 * r10
      const right = scaled(keepH)
      const metric = pick(rand, ['monthly card spend', 'monthly deposits', 'transfers per customer'])
      const whatNow = ask === 'n' ? `needs ${num(base)} customers per group` : `has a per-customer variance of ${num(base)}`
      const ques = ask === 'n' ? 'About how many customers per group give the same power after the adjustment?' : 'What is the variance of the adjusted metric?'
      const h2 = (h) => (h / 100).toFixed(2)
      return {
        title: 'What CUPED buys you',
        prompt: `A test on ${metric} ${whatNow}. Each customer's value in the month before the test has a correlation of ${rho} with their value during the test. The team applies CUPED, adjusting the metric with the pre-period value. ${ques}`,
        approach: [
          'CUPED removes the part of the metric explained by the pre-period covariate. The remaining variance is σ²(1 − ρ²).',
          'Required sample size is proportional to variance, so n shrinks by the same factor.',
          `Here 1 − ρ² = 1 − ${h2(r10 * r10)} = ${h2(keepH)}.`,
        ],
        right: { value: right, text: num(right), why: `Correct. ${num(base)} × (1 − ${rho}²) = ${num(base)} × ${h2(keepH)} = ${num(right)}.` },
        wrong: [
          { value: scaled(10 * (10 - r10)), text: num(scaled(10 * (10 - r10))), why: `This multiplies by 1 − ρ = ${((10 - r10) / 10).toFixed(1)} and forgets to square the correlation.` },
          { value: scaled(r10 * r10), text: num(scaled(r10 * r10)), why: `This multiplies by ρ² = ${h2(r10 * r10)}, the share CUPED removes, instead of the share that remains.` },
          { value: scaled((10 - r10) ** 2), text: num(scaled((10 - r10) ** 2)), why: `This squares the wrong thing: (1 − ρ)² = ${h2((10 - r10) ** 2)} instead of 1 − ρ².` },
        ],
        params: { base, rho, ask },
      }
    },
  })

  // ---------------- Data engineering ----------------

  const iso = (d) => d.toISOString().slice(0, 10)
  const DAY = 86400000

  T.push({
    key: 'de-partition-scan', difficulty: 'Easy', section: 'de', topic: 'Partitioning',
    make(rand) {
      const start = new Date(Date.UTC(2025, 0, 1) + between(rand, 0, 320) * DAY)
      const L = between(rand, 3, 40)
      const end = new Date(start.getTime() + L * DAY)
      const op = pick(rand, ['between', 'halfopen'])
      const full = 731 // every day of 2024 (a leap year) and 2025
      // A common shortcut: pretend every month has 30 days
      const naive = (end.getUTCMonth() - start.getUTCMonth()) * 30 + end.getUTCDate() - start.getUTCDate()
      const right = op === 'between' ? L + 1 : L
      const where = op === 'between'
        ? `WHERE txn_date BETWEEN '${iso(start)}' AND '${iso(end)}'`
        : `WHERE txn_date >= '${iso(start)}' AND txn_date < '${iso(end)}'`
      const fullWhy = 'This is every partition in the table. A filter directly on the partition column lets the engine skip the rest.'
      const naiveWhy = 'This assumes every month has 30 days. Count the real days in each month.'
      const candidates = op === 'between'
        ? [
            { value: L, text: String(L), why: `This subtracts the dates (${L} days apart), which drops one endpoint. BETWEEN includes both ends.` },
            { value: full, text: String(full), why: fullWhy },
            { value: naive + 1, text: String(naive + 1), why: naiveWhy },
            { value: L + 2, text: String(L + 2), why: 'This adds an extra day on top of the inclusive count.' },
          ]
        : [
            { value: L + 1, text: String(L + 1), why: `This includes ${iso(end)}, but txn_date < '${iso(end)}' excludes it.` },
            { value: full, text: String(full), why: fullWhy },
            { value: naive, text: String(naive), why: naiveWhy },
            { value: L - 1, text: String(L - 1), why: `This leaves out ${iso(start)}, but >= includes the start date.` },
          ]
      return {
        title: 'Partitions a date filter reads',
        prompt: [
          '`transactions` is partitioned by `txn_date`, one partition per day, and holds every day of 2024 and 2025. Assuming the engine prunes partitions, how many partitions does this query read?',
          '',
          '```',
          'SELECT branch_id, SUM(amount) AS total',
          'FROM transactions',
          where,
          'GROUP BY branch_id;',
          '```',
        ],
        approach: [
          'A filter on the partition column lets the engine skip every partition outside the range.',
          'BETWEEN includes both endpoints: (end − start) + 1 days. A half-open range (>= start AND < end) covers end − start days.',
          'Count month by month using the real month lengths (February 2025 has 28 days).',
        ],
        right: { value: right, text: String(right), why: `Correct. ${iso(start)} and ${iso(end)} are ${L} days apart, so the ${op === 'between' ? 'inclusive' : 'half-open'} range covers ${right} daily partitions.` },
        wrong: firstThree(right, candidates),
        params: { start: iso(start), end: iso(end), op },
      }
    },
  })

  T.push({
    key: 'de-dedup-row-number', difficulty: 'Medium', section: 'de', topic: 'Deduplication with ROW_NUMBER',
    make(rand) {
      for (;;) {
        const once = between(rand, 2, 6)
        const twice = between(rand, 1, 4)
        const thrice = between(rand, 1, 3)
        const ties = between(rand, 1, 2)
        const fn = pick(rand, ['ROW_NUMBER', 'RANK'])
        const rows = once + 2 * twice + 3 * thrice
        const ids = once + twice + thrice
        const right = fn === 'ROW_NUMBER' ? ids : ids + ties
        const wrong = firstThree(right, [
          fn === 'ROW_NUMBER'
            ? { value: ids + ties, text: String(ids + ties), why: `This is what RANK() would keep. ROW_NUMBER breaks ${ties === 1 ? 'the tie' : 'ties'} arbitrarily, so each txn_id still gets exactly one row numbered 1.` }
            : { value: ids, text: String(ids), why: 'This is what ROW_NUMBER() would keep. RANK gives tied rows the same rank, so both tied newest versions get rank 1.' },
          { value: rows, text: String(rows), why: 'This is every row in the raw table, as if nothing were filtered.' },
          { value: twice + 2 * thrice, text: String(twice + 2 * thrice), why: 'This is the number of rows the filter removes, not the number it keeps.' },
          { value: once, text: String(once), why: 'This keeps only the txn_ids that were never duplicated. The filter keeps a row for every txn_id.' },
        ])
        if (wrong.length < 3) continue
        return {
          title: `Rows left after ${fn} dedup`,
          prompt: [
            `\`txn_raw\` has ${rows} rows. ${once} txn_ids appear once, ${twice} appear twice and ${thrice} appear three times. For ${ties} of the repeated txn_ids, the two newest versions have exactly the same \`loaded_at\`. How many rows does this query return?`,
            '',
            '```',
            'SELECT *',
            'FROM (',
            '  SELECT r.*,',
            `         ${fn}() OVER (PARTITION BY txn_id ORDER BY loaded_at DESC) AS rn`,
            '  FROM txn_raw r',
            ') t',
            'WHERE rn = 1;',
            '```',
          ],
          approach: [
            'PARTITION BY txn_id numbers each transaction\'s versions separately, so every txn_id has a row with rn = 1.',
            'ROW_NUMBER gives 1, 2, 3 even when values tie, so it keeps exactly one row per txn_id.',
            'RANK gives tied rows the same rank, so a tie for newest keeps both rows.',
          ],
          right: { value: right, text: String(right), why: fn === 'ROW_NUMBER' ? `Correct. ROW_NUMBER keeps one row per txn_id, ties or not: ${once} + ${twice} + ${thrice} = ${ids}.` : `Correct. One row per txn_id (${ids}), plus one more for each tie at the top, because RANK gives both tied rows rank 1: ${ids} + ${ties} = ${ids + ties}.` },
          wrong,
          params: { once, twice, thrice, ties, fn },
        }
      }
    },
  })

  T.push({
    key: 'de-scd2-rows', difficulty: 'Medium', section: 'de', topic: 'Slowly changing dimensions',
    make(rand) {
      for (;;) {
        const N = pick(rand, [100, 200, 500, 1000])
        const a = between(rand, 5, 30)
        const b = between(rand, 1, 10)
        const c = between(rand, 2, 15)
        const right = N + a + 2 * b
        const wrong = firstThree(right, [
          { value: N + a + b, text: num(N + a + b), why: `This counts customers who moved (${a + b}) rather than moves. The ${b} who moved twice each add two rows.` },
          { value: right + c, text: num(right + c), why: `This adds a row for each of the ${c} phone changes. Phone is Type 1, so it is overwritten in place.` },
          { value: N + 2 * (a + 2 * b), text: num(N + 2 * (a + 2 * b)), why: 'This counts two new rows per move. Closing the old version updates its end date in place; only the new version is a new row.' },
          { value: N, text: num(N), why: 'This is the number of current rows. Type 2 keeps the expired versions too.' },
        ])
        if (wrong.length < 3) continue
        return {
          title: 'Counting rows in a Type 2 dimension',
          prompt: `\`dim_customer\` starts the month with ${num(N)} rows, one per customer. Address is tracked as SCD Type 2 (a new row with effective dates for each change) and phone number as Type 1 (overwritten). During the month, ${a} customers move once, ${b} other customers move twice, and ${c} other customers change only their phone number. How many rows does \`dim_customer\` have at the end of the month?`,
          approach: [
            'Type 2: each change closes the current row (an update to its end date and current flag) and inserts one new row.',
            'Type 1: the value is overwritten, so the row count does not change.',
            'Count changes, not customers: a customer who moves twice adds two rows.',
          ],
          right: { value: right, text: num(right), why: `Correct. ${num(N)} + ${a} × 1 + ${b} × 2 = ${num(right)}. The phone changes add nothing.` },
          wrong,
          params: { N, a, b, c },
        }
      }
    },
  })

  T.push({
    key: 'de-rerun-insert-merge', difficulty: 'Hard', section: 'de', topic: 'Idempotent pipelines',
    make(rand) {
      for (;;) {
        const E = pick(rand, [10000, 20000, 50000, 120000])
        const B = pick(rand, [200, 500, 800, 1000])
        const p = pick(rand, [100, 150, 300].filter((x) => x < B))
        const k = between(rand, 1, 3)
        const mode = pick(rand, ['INSERT', 'MERGE'])
        const insertRows = E + p + k * B
        const right = mode === 'INSERT' ? insertRows : E + B
        const wrong = firstThree(right, mode === 'INSERT'
          ? [
              { value: E + B, text: num(E + B), why: 'This is what an idempotent load (MERGE, or delete the date and then insert) would leave. A plain INSERT appends on every run.' },
              { value: E + k * B, text: num(E + k * B), why: `This forgets the ${p} rows the crashed attempt already committed. They stay in the table.` },
              { value: p + k * B, text: num(p + k * B), why: `This forgets the ${num(E)} rows from earlier days.` },
              { value: E + (k + 1) * B, text: num(E + (k + 1) * B), why: `This counts the crashed attempt as a full batch. It committed only ${p} rows.` },
            ]
          : [
              { value: insertRows, text: num(insertRows), why: 'This is what a plain INSERT would leave. MERGE updates rows whose txn_id already exists instead of adding copies.' },
              { value: E + B + p, text: num(E + B + p), why: `This keeps the ${p} rows from the crashed attempt as extra copies. Their txn_ids are in the batch, so the retry matches and updates them.` },
              { value: E, text: num(E), why: 'MERGE also inserts the txn_ids that do not match yet; it does not only update.' },
              { value: B, text: num(B), why: 'MERGE leaves the rows for other days alone; it does not replace the table.' },
            ])
        if (wrong.length < 3) continue
        const reruns = k === 1
          ? 'The automatic retry then ran to completion.'
          : `The automatic retry then ran to completion, and someone re-ran the job by hand ${k === 2 ? 'once more' : 'twice more'}, each run completing.`
        const load = mode === 'INSERT'
          ? 'The job loads with a plain `INSERT INTO fact_txn SELECT ... FROM staging_txn`.'
          : 'The job loads with `MERGE INTO fact_txn USING staging_txn ON txn_id`, updating matches and inserting the rest.'
        return {
          title: `Re-running a load with ${mode}`,
          prompt: `\`fact_txn\` holds ${num(E)} rows from earlier days. The nightly job loads the 2026-10-01 batch of ${num(B)} transactions, each with a unique txn_id. ${load} The first attempt crashed after committing ${p} rows. ${reruns} How many rows does \`fact_txn\` have now?`,
          approach: [
            'A plain INSERT is not idempotent: every run appends its rows again, on top of whatever a crashed run already wrote.',
            'MERGE on the key (or deleting the date before inserting) is idempotent: running it again leaves the same result.',
            'Go attempt by attempt and add up what each one leaves behind.',
          ],
          right: { value: right, text: num(right), why: mode === 'INSERT' ? `Correct. ${num(E)} existing + ${p} from the crash + ${k} × ${num(B)} from the full runs = ${num(right)}.` : `Correct. The first full MERGE updates the ${p} partial rows and inserts the other ${num(B - p)}${k > 1 ? '; later runs only update' : ''}. ${num(E)} + ${num(B)} = ${num(right)}.` },
          wrong,
          params: { E, B, p, k, mode },
        }
      }
    },
  })
})()
