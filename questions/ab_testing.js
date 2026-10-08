window.BANK = (window.BANK || []).concat(
[
  {
    "id": "ab-primary-vs-guardrail",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: metrics",
    "title": "Primary metric vs guardrail",
    "prompt": "A bank tests a shorter personal loan application. The goal is more completed applications, but the team worries the shorter form may let in riskier borrowers. Which metric setup is best?",
    "options": [
      "Primary metric: application completion rate. Guardrail: 90 day delinquency rate of the approved loans",
      "Primary metric: 90 day delinquency rate. Guardrail: application completion rate",
      "Primary metric: page views of the application. No guardrail needed",
      "Track 15 metrics equally and ship if most of them improve"
    ],
    "answer": 0,
    "explanations": [
      "Correct. The primary metric is the one the change is meant to move, chosen before the test, and it drives the ship decision. A guardrail is a metric that must not get meaningfully worse; credit quality is exactly the known risk here.",
      "Backwards. The shorter form is designed to raise completions, so that is the primary metric. Delinquency is what you protect, not what you are trying to improve.",
      "Page views measure traffic, not the outcome. A shorter form could even lower page views while raising completions, and skipping guardrails ignores the known credit risk.",
      "Many equal metrics invite cherry-picking and multiple comparison false positives. Pick one primary metric up front and a few guardrails."
    ],
    "approach": [
      "Ask what the change is meant to improve: that is the primary metric, fixed before the test starts.",
      "Ask what could go wrong: those are the guardrails (credit risk, complaints, fraud, latency, revenue).",
      "Decide on the primary metric; use the guardrails as a veto if they get meaningfully worse."
    ]
  },
  {
    "id": "ab-randomization-unit",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: design",
    "title": "Randomizing by page view",
    "prompt": "A bank is testing a redesigned home screen in its mobile app. The analyst proposes assigning treatment or control at random on every page view. What is the main problem?",
    "options": [
      "Page views are too few to reach statistical significance",
      "Randomizing by page view makes the test take longer",
      "The same customer would flip between the two designs, so their experience is mixed and page views from one person are not independent",
      "There is no problem; finer randomization is always better"
    ],
    "answer": 2,
    "explanations": [
      "Page views are the most numerous unit you could pick, so there are more of them, not fewer. Count is not the issue.",
      "If anything, page views pile up faster than users. The issue is contamination, not duration.",
      "Correct. A home screen is something a person experiences over many visits. Randomizing each view shows users both versions, which blurs the effect, and repeated views from the same person are correlated, so standard errors computed per view come out too small. Randomize by customer ID and analyze per customer.",
      "Finer units add sample size but break consistency and independence whenever people notice the change across visits."
    ],
    "approach": [
      "Randomize at the level where a person experiences the change. For a visible redesign that is the user.",
      "Make the analysis unit match the randomization unit, or correct the standard errors for clustering.",
      "Session or page view randomization is fine only for changes nobody notices across visits, like a small backend speed tweak."
    ]
  },
  {
    "id": "ab-half-effect-sample-size",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: sample size and power",
    "title": "Halving the effect you want to detect",
    "prompt": "A power calculation says you need 20,000 customers per group to detect a 2 percentage point lift in card activation rate (80% power, α = 0.05). Leadership now wants to detect a 1 point lift instead, with the same power and α. Roughly how many customers per group do you need?",
    "options": [
      "40,000",
      "80,000",
      "10,000",
      "28,000"
    ],
    "answer": 1,
    "explanations": [
      "This assumes sample size doubles when the effect halves. Sample size scales with 1 over the effect squared, not 1 over the effect.",
      "Correct. Required n is proportional to σ² / δ². Halving δ multiplies 1 / δ² by 4, so 20,000 × 4 = 80,000 per group. (The variance of the rate barely changes for such a small shift.)",
      "A smaller effect is harder to detect, so you need more data, not less.",
      "28,000 is about 20,000 × √2, which would only hold if n grew with the square root of 1 / δ. It grows with the square: 1 / δ²."
    ],
    "approach": [
      "Recall n ∝ σ² / δ²: to resolve an effect half as big, the standard error must be half as big.",
      "The standard error shrinks like 1 / √n, so half the standard error needs 4 times the data.",
      "Rule of thumb: halve the minimum detectable effect, quadruple the sample."
    ]
  },
  {
    "id": "ab-mde-meaning",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: sample size and power",
    "title": "What the minimum detectable effect means",
    "prompt": "Before launching a test of a new savings goal feature, the analyst says the minimum detectable effect (MDE) is a 3% relative lift in deposits. What does this mean?",
    "options": [
      "The feature is guaranteed to raise deposits by at least 3%",
      "Any true lift smaller than 3% will still come out statistically significant",
      "3% is the significance level of the test",
      "With the planned sample size, the test has the chosen power (say 80%) to detect a true lift of 3% or more"
    ],
    "answer": 3,
    "explanations": [
      "The MDE is a property of the test design, not a promise about the result. The true effect could be zero.",
      "Backwards. Lifts smaller than the MDE are likely to be missed, because the test is underpowered for them.",
      "The significance level is α, usually 0.05. The MDE is an effect size, not an error rate.",
      "Correct. The MDE is the smallest true effect the test is built to detect reliably at the chosen α and power. Smaller true effects may exist but will often come out not significant."
    ],
    "approach": [
      "MDE, sample size, α and power are linked: fix three and the fourth follows.",
      "Choose the MDE from the business side: the smallest lift that would be worth shipping.",
      "A smaller MDE needs a much bigger sample (roughly 1 / MDE²)."
    ]
  },
  {
    "id": "ab-peeking",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: pitfalls",
    "title": "Stopping the first day p < 0.05",
    "prompt": "An analyst runs a 4 week test, checks it every morning, and plans to stop the first day the p-value drops below 0.05. Why is this a problem?",
    "options": [
      "Checking results every day uses too much computing power",
      "A p-value can only be calculated after the test has fully finished",
      "It lowers the false positive rate, so the test becomes too conservative",
      "Each look is another chance for noise to cross the threshold, so the overall false positive rate ends up well above 5%"
    ],
    "answer": 3,
    "explanations": [
      "Compute cost is not the issue; the statistics are.",
      "You can compute a p-value at any time. The problem is acting on it again and again as if each look were the only one.",
      "The opposite. Repeated looks with the option to stop raise false positives.",
      "Correct. When there is no true effect, the p-value still wanders up and down over time. With about 20 to 30 daily looks at 0.05, the chance it dips below 0.05 at least once is roughly 25% or more, and stopping there locks in a false win. Fix the sample size in advance, or use a sequential method (alpha spending, always valid p-values) designed for peeking."
    ],
    "approach": [
      "Decide the sample size or duration before starting, and read the result once at the end.",
      "If you need to monitor as you go, use a sequential test built for it.",
      "Watching guardrails for harm (say, a spike in app crashes) is fine; stopping a fixed horizon test early for a win is not."
    ]
  },
  {
    "id": "ab-multiple-comparisons",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: pitfalls",
    "title": "Twenty metrics, one test",
    "prompt": "A test of a new app onboarding flow tracks 20 independent metrics, each tested at α = 0.05. Suppose the change truly has no effect on any of them. About how many metrics would you expect to show a significant result just by chance?",
    "options": [
      "About 1",
      "0, because there is no true effect",
      "About 5",
      "About 10"
    ],
    "answer": 0,
    "explanations": [
      "Correct. Each metric has a 5% false positive chance, so 20 × 0.05 = 1 expected false positive. The chance of at least one is 1 − 0.95^20, about 64%. Fixes: pre-register one primary metric, or adjust α (Bonferroni: 0.05 / 20 = 0.0025 per metric).",
      "Even with no true effect, every test has a 5% chance of a false positive. Across 20 tests those chances add up.",
      "5 would be 20 × 0.25. The false positive rate per metric is 5%, not 25%.",
      "10 would mean half of all tests with no real effect come out significant. That is far more than α = 0.05 allows."
    ],
    "approach": [
      "Expected false positives = number of tests × α.",
      "Declare one primary metric before the test; treat the others as secondary or diagnostic.",
      "If several metrics truly matter, control the error rate: Bonferroni divides α by the number of tests, and Benjamini-Hochberg controls the false discovery rate."
    ]
  },
  {
    "id": "ab-novelty-effect",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: pitfalls",
    "title": "A lift that fades",
    "prompt": "A bank tests a redesigned spending insights tab. In week 1, treatment users open the tab 40% more often than control. By week 4, the gap has shrunk to 3%. What is the most likely explanation?",
    "options": [
      "A primacy effect: users needed time to learn the new design",
      "A sample ratio mismatch",
      "A novelty effect: users explored the design because it was new, and the extra use faded",
      "The test was underpowered in week 1"
    ],
    "answer": 2,
    "explanations": [
      "A primacy effect is the opposite pattern: existing users resist or struggle with a change at first, so treatment starts worse and improves as they adjust.",
      "A sample ratio mismatch is about the group sizes not matching the planned split. Nothing here says the counts are off.",
      "Correct. A big early lift that decays to a small steady level is the classic novelty effect. Judge the long run effect: run long enough, plot the effect by week, and compare new users (who have no old habit) with existing ones.",
      "An underpowered test tends to miss effects or give noisy ones, not a large lift that shrinks steadily week after week."
    ],
    "approach": [
      "Plot the treatment effect over time instead of reporting one pooled number.",
      "Early spike that fades: novelty. Early dip that recovers: primacy (change aversion).",
      "Run for at least a couple of full weeks, and look at new users separately since they have no prior habit."
    ]
  },
  {
    "id": "ab-srm-detect",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: pitfalls",
    "title": "Spotting a sample ratio mismatch",
    "prompt": "A test was meant to split 100,000 users 50/50. It ended with 50,800 in treatment and 49,200 in control. Under a true 50/50 split, the count in one group has a standard deviation of about 160. What should you do?",
    "options": [
      "Nothing; a gap of 1,600 users out of 100,000 is small",
      "Treat it as a sample ratio mismatch: the gap is about 5 standard deviations, so find the cause before trusting any results",
      "Reweight the groups to 50/50 and report the results as usual",
      "Randomly drop 1,600 treatment users so the groups match"
    ],
    "answer": 1,
    "explanations": [
      "It looks small as a percentage, but with 100,000 users chance almost never produces it. Treatment is 800 above its expected 50,000, about 5 standard deviations.",
      "Correct. 50,800 − 50,000 = 800, and 800 / 160 = 5 standard deviations, a p-value far below 0.001 (a chi-square test agrees). An SRM means something in assignment or logging treats the groups differently, such as a redirect, a crash before logging, or bot filtering, so the groups may no longer be comparable.",
      "Reweighting fixes the counts, not the reason they differ. If the missing users are a particular kind (say, the slowest devices), the bias stays.",
      "Trimming treatment hides the symptom, not the cause. Whatever made the counts differ may also have changed who is in each group."
    ],
    "approach": [
      "Compare the observed count with the planned split: z = (observed − expected) / √(n × p × (1 − p)). Here √(100,000 × 0.5 × 0.5) = √25,000 ≈ 158.",
      "If the mismatch is very unlikely (a common bar is p < 0.001), stop and debug assignment and logging before reading any metric.",
      "Common causes: redirects, crashes or slow loads in one arm, bot filtering, and users switching groups."
    ]
  },
  {
    "id": "ab-network-interference",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "A/B testing: design",
    "title": "When treatment leaks into control",
    "prompt": "A bank tests a feature that lets customers split bills and request money from friends with one tap. Customers are randomized individually. Treatment users send many requests to friends who are in control, and those control users start sending more payments too. What is the main issue, and what is a better design?",
    "options": [
      "Interference between groups (network spillover). Randomize clusters of connected customers, or whole regions, so most of a customer's contacts are in the same group",
      "A novelty effect. Run the test for a longer period",
      "A sample ratio mismatch. Check the group counts with a chi-square test",
      "Nothing is wrong. Control users paying more shows the feature works, so the measured difference is accurate"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A/B tests assume one user's assignment does not affect another user's outcome (SUTVA). Here treatment spills into control, raising control's metric and shrinking the measured gap, so the test underestimates the true effect. Cluster (graph based) randomization, geographic randomization or switchback designs keep interacting users together.",
      "Running longer does not help: the spillover continues the whole time. The problem is the randomization unit, not the duration.",
      "Nothing suggests the group sizes are off. The issue is that control outcomes are contaminated, not that counts are unbalanced.",
      "If control rises because of the treatment, control no longer shows a world without the feature, so treatment minus control is biased toward zero."
    ],
    "approach": [
      "Ask: can a treated user change what a control user does? Payments, referrals, marketplaces and social features usually say yes.",
      "If so, randomize at a level that contains most of the interactions: friend clusters, regions or time windows.",
      "Expect fewer effective units and wider intervals; that is the price of an unbiased estimate."
    ]
  },
  {
    "id": "ab-simpsons-paradox",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "Product analytics",
    "title": "Better on every device, worse overall",
    "prompt": "A bank compares credit card application rates before and after a new landing page. February (old page): desktop 80 applications from 800 visitors, mobile 4 from 200. March (new page): desktop 24 from 200, mobile 24 from 800. Overall, the rate fell from 8.4% to 4.8%. What is the best reading?",
    "options": [
      "The new page hurt applications, since the overall rate dropped",
      "The new page hurt desktop applications but helped mobile",
      "The numbers must contain an error, because segment rates and the overall rate cannot move in opposite directions",
      "The new page did better on both devices (desktop 10% to 12%, mobile 2% to 3%); the overall drop comes from traffic shifting toward mobile, which converts far less"
    ],
    "answer": 3,
    "explanations": [
      "The overall rate mixes two things: the page and the device mix. Within each device the rate went up, so the overall drop is not evidence the page hurt.",
      "Desktop went from 80 / 800 = 10% to 24 / 200 = 12%. That is up, not down.",
      "This is Simpson's paradox, and it is entirely possible: when group sizes shift, the overall rate can move opposite to every subgroup.",
      "Correct. Desktop rose from 10% to 12% and mobile from 2% to 3%. But mobile went from 20% to 80% of traffic, and mobile converts far less, which drags the total down: Simpson's paradox. Also, a before and after comparison is not an A/B test; randomizing would keep the device mix balanced across groups."
    ],
    "approach": [
      "Compute the rate inside each segment before trusting the total.",
      "Check whether the segment mix changed between the two periods or groups.",
      "If the mix shifted, compare like with like (by segment, or reweighted to a common mix), or better, run a randomized test."
    ]
  },
  {
    "id": "ab-ci-crosses-zero",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: interpreting results",
    "title": "A confidence interval that includes 0",
    "prompt": "A test of a new autopay prompt reports the lift in autopay enrollment (treatment minus control) with a 95% confidence interval of −0.4 to +1.2 percentage points. What is the correct conclusion?",
    "options": [
      "The prompt definitely raised enrollment, since most of the interval is above 0",
      "The result is not statistically significant at the 5% level: the data are consistent with no effect, a small drop, or a lift of up to about 1.2 points",
      "The prompt has been shown to have no effect at all",
      "There is a 95% chance the true lift is exactly +0.4 points"
    ],
    "answer": 1,
    "explanations": [
      "Where most of the interval sits is not the test. Because 0 is inside the interval, a zero effect is still plausible.",
      "Correct. A 95% interval for a difference that contains 0 means a two-sided test at α = 0.05 would not reject 'no difference'. The point estimate is the midpoint, +0.4 points, but the uncertainty is wide. If a 1 point lift would matter, the test needs more users.",
      "Not significant is not the same as proven zero. The interval also allows a lift of up to 1.2 points; the test may simply lack power.",
      "+0.4 is the point estimate (the middle of the interval). The interval gives a range of plausible values; it does not put a 95% probability on one exact number."
    ],
    "approach": [
      "Check whether 0 is inside the interval for the difference.",
      "If it is, the result is not significant at that level. If the whole interval is above 0, the lift is significant.",
      "Then read the two ends: they show the smallest and largest effects the data support."
    ]
  },
  {
    "id": "ab-practical-vs-statistical",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: interpreting results",
    "title": "Significant but tiny",
    "prompt": "A bank tests a new bill pay layout on 4 million customers. Bill pay completion rises from 60.0% to 60.2% with p < 0.001. Building and maintaining the layout takes real engineering time. What is the best takeaway?",
    "options": [
      "Ship it: p < 0.001 proves the change is valuable",
      "The result must be a mistake, because such a tiny difference cannot be significant",
      "The lift is statistically significant but small (0.2 points); whether to ship depends on whether that lift is worth the cost, compared with the smallest lift the business decided would matter",
      "Rerun the test with fewer customers to get a cleaner answer"
    ],
    "answer": 2,
    "explanations": [
      "A small p-value says the effect is probably not zero. It says nothing about whether the effect is big enough to matter.",
      "With 4 million customers the standard error is tiny, so even small differences come out significant. That is expected, not a mistake.",
      "Correct. Statistical significance answers 'is it real?'; practical significance answers 'is it big enough to care?'. With huge samples almost any real difference is significant, so compare the effect size and its interval with the lift needed to justify the cost.",
      "Fewer customers means less precision. It will not make a small effect any bigger."
    ],
    "approach": [
      "Read the effect size and its confidence interval, not just the p-value.",
      "Compare it with a threshold set before the test (the MDE or a break-even lift).",
      "Large samples make small effects significant; small samples can miss big ones."
    ]
  },
  {
    "id": "ab-two-proportion-test",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "A/B testing: interpreting results",
    "title": "Is a 10% vs 12% gap significant?",
    "prompt": "Control: 100 of 1,000 visitors opened a savings account (10%). Treatment: 120 of 1,000 (12%). Using the pooled rate of 11%, the standard error of the difference is about 1.4 percentage points. At α = 0.05 (two-sided), what do you conclude?",
    "options": [
      "Significant, because 12% is higher than 10%",
      "z ≈ 2 / 1.4 ≈ 1.4, which is below 1.96, so not significant",
      "z ≈ 20 / 1.4 ≈ 14, which is far above 1.96, so significant",
      "z ≈ 2 / 1.4 ≈ 1.4, which is above the 1.28 cutoff, so significant"
    ],
    "answer": 1,
    "explanations": [
      "A higher sample rate is not enough; the gap has to be large compared with its noise. With 1,000 per group, a 2 point gap can easily happen by chance.",
      "Correct. z = (0.12 − 0.10) / 0.014 ≈ 1.4. A two-sided test at α = 0.05 needs |z| > 1.96, so this is not significant (p ≈ 0.15). The test is too small to reliably detect a 2 point lift.",
      "20 is the relative lift (12 / 10 = 1.2, a 20% increase), but the standard error is in percentage points. Keep the units the same: 2 points / 1.4 points ≈ 1.4.",
      "1.28 is the cutoff for a one-sided test at α = 0.10. A two-sided test at α = 0.05 needs |z| > 1.96."
    ],
    "approach": [
      "Difference = treatment rate − control rate, in the same units as the standard error.",
      "Pooled rate p = total conversions / total users = 220 / 2,000 = 11%; SE = √(p(1 − p)(1/n_T + 1/n_C)).",
      "z = difference / SE. For a two-sided 5% test, compare |z| with 1.96."
    ]
  },
  {
    "id": "ab-cuped",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "A/B testing: variance reduction",
    "title": "How much CUPED saves",
    "prompt": "A test on monthly card spend needs 100,000 customers per group. Each customer's spend in the month before the test has a correlation of 0.8 with their spend during the test. Using CUPED (adjusting the metric with this pre-period spend), roughly how many customers per group would give the same power?",
    "options": [
      "20,000",
      "80,000",
      "36,000",
      "64,000"
    ],
    "answer": 2,
    "explanations": [
      "20,000 uses 1 − ρ = 0.2. The share of variance the covariate explains is ρ², not ρ.",
      "80,000 multiplies by ρ = 0.8. The share of variance left after the adjustment is 1 − ρ², not ρ.",
      "Correct. CUPED subtracts θ × (pre-period spend − its mean) from each customer's metric, removing the part of the variance the pre-period explains. The remaining variance is (1 − ρ²) × the original = (1 − 0.64) = 0.36. Sample size scales with variance, so 100,000 × 0.36 = 36,000. The estimate stays unbiased because pre-period spend cannot be affected by the treatment.",
      "64,000 multiplies by ρ² = 0.64. That is the share of variance removed, not the share left; the share left is 1 − 0.64 = 0.36."
    ],
    "approach": [
      "CUPED: Y_adj = Y − θ(X − mean of X), where X is measured before assignment and θ = cov(X, Y) / var(X).",
      "Remaining variance = (1 − ρ²) × original variance.",
      "Required n scales with variance, so multiply n by 1 − ρ². Only use covariates the treatment cannot affect."
    ]
  },
  {
    "id": "ab-when-not-to-test",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "A/B testing: design",
    "title": "When an A/B test is the wrong tool",
    "prompt": "In which situation is an A/B test the least suitable way to decide?",
    "options": [
      "Choosing between two subject lines for a card offer email going to 500,000 customers",
      "Testing whether a new onboarding checklist raises 30 day account funding",
      "Comparing two layouts of the mobile transfer screen, used by millions of customers a month",
      "A new regulation requires an updated fee disclosure for every customer by next month"
    ],
    "answer": 3,
    "explanations": [
      "A large audience, a quick outcome and a cheap change: a textbook A/B test.",
      "A clear metric and a steady flow of new accounts make this a good test, even with a 30 day wait for the outcome.",
      "High traffic and a measurable outcome; this is exactly what A/B testing is for.",
      "Correct. The change must ship to everyone whatever the result, so there is no decision for the test to inform, and holding it back from a control group would break the rule. Other times to skip a test: too little traffic to reach power, one-off events, or changes with clear ethical or legal risk."
    ],
    "approach": [
      "Ask: is there a real decision the result could change?",
      "Ask: can you ethically and legally hold the change back from a control group?",
      "Ask: is there enough traffic to detect an effect that matters in reasonable time? If not, use user research, a staged rollout, or a careful before and after analysis."
    ]
  },
  {
    "id": "ab-north-star-banking",
    "section": "ab",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Product analytics",
    "title": "A north star metric for a banking app",
    "prompt": "A retail bank wants one north star metric for its mobile app: a single number that reflects the value customers get and predicts long run revenue. Which is the best choice?",
    "options": [
      "Monthly active customers who complete at least one core money task in the app (a payment, transfer, deposit or bill pay)",
      "Total app downloads",
      "Average minutes spent in the app per session",
      "Number of push notifications sent per month"
    ],
    "answer": 0,
    "explanations": [
      "Correct. It counts customers getting real value (moving or managing money), it is tied to retention and revenue, and it breaks down into drivers teams can work on (acquisition, activation, frequency). A good north star measures value delivered, not just activity.",
      "Downloads are a vanity metric: they say nothing about whether people use the app or get value, and the total only ever goes up.",
      "In a banking app, more time can mean confusion (hunting for a feature). Faster tasks are usually better, so time spent can move in the wrong direction.",
      "This measures the bank's own output, not customer value, and pushing it up can annoy customers and raise opt-outs."
    ],
    "approach": [
      "A north star should reflect value delivered to customers, lead long run revenue, and be something teams can move.",
      "Avoid vanity metrics (downloads, page views) and metrics where more can be worse (time spent in a utility app).",
      "Pair it with guardrails such as complaints, fraud losses and app crash rate."
    ]
  },
  {
    "id": "ab-multi-diagnose-drop",
    "section": "ab",
    "type": "multi",
    "difficulty": "Medium",
    "topic": "Product analytics",
    "title": "Diagnosing a sudden metric drop",
    "prompt": "Completed online account openings dropped 20% yesterday compared with the same weekday last week. Which are sensible first steps to diagnose it?",
    "options": [
      "Check whether the data pipeline or tracking changed (a broken event, a late data load, a new metric definition)",
      "Break the funnel into steps (landing, start application, identity check, funding, completion) to see which step fell",
      "Segment by platform, app version, browser, region and marketing channel to see whether the drop is concentrated",
      "Check for recent releases, outages or outside events (a holiday, a vendor's identity check service going down)",
      "Immediately roll back every change shipped in the past month",
      "Assume it is random noise and wait a month before looking"
    ],
    "answers": [
      0,
      1,
      2,
      3
    ],
    "explanations": [
      "Correct. Rule out a measurement problem first. Many sudden drops are a broken tracking event or a delayed table, not a real change in customer behavior.",
      "Correct. A funnel breakdown localizes the problem: if only the identity check step fell, you know where to look.",
      "Correct. A drop concentrated in one app version or browser points to a bug; a drop spread evenly points to something broader, like traffic or seasonality.",
      "Correct. Line up the timing with deploys, incidents, vendor status and the calendar. A third-party outage or a holiday often explains a one day drop.",
      "Not a good first step. Rolling back everything is costly and blind. Find the cause first, then roll back the specific change if one is to blame.",
      "Not a good first step. A 20% one day drop in a key metric deserves a look now, and comparing with the same weekday already removes the weekly pattern, so plain noise is unlikely."
    ],
    "approach": [
      "Confirm the drop is real: data freshness, tracking, metric definition.",
      "Localize it: which funnel step, which segment.",
      "Explain it: line it up with releases, incidents, marketing changes and outside events."
    ]
  },
  {
    "id": "ab-multi-srm-causes",
    "section": "ab",
    "type": "multi",
    "difficulty": "Hard",
    "topic": "A/B testing: pitfalls",
    "title": "What causes a sample ratio mismatch",
    "prompt": "A test of a new loan offer page has a sample ratio mismatch: under a planned 50/50 split, noticeably fewer users were logged in treatment than in control. Which of these could cause it?",
    "options": [
      "The treatment page loads slowly, so some users leave before the exposure event is logged",
      "The treatment page crashes on an older Android version before anything is logged",
      "Bot filtering was applied to the treatment group's logs but not to control's",
      "The treatment raised the loan application rate",
      "Users were assigned by hashing their customer ID",
      "The test ran for three weeks instead of two"
    ],
    "answers": [
      0,
      1,
      2
    ],
    "explanations": [
      "Correct. If the exposure event fires only after the page loads, slow loads drop treatment users from the logs, and the ones dropped (slow devices, weak connections) are not random.",
      "Correct. A crash before logging removes a specific kind of user from one group only, a classic SRM source.",
      "Correct. Any filtering or cleaning applied differently by group changes the counts and breaks comparability.",
      "Not a cause. A treatment effect on the outcome changes how many users apply, not how many users are assigned and logged in each group.",
      "Not a cause. Hashing a stable ID is the standard way to assign users consistently, and it gives a split very close to the target.",
      "Not a cause. Running longer adds users to both groups in the same ratio. It changes the total, not the split."
    ],
    "approach": [
      "An SRM means something between assignment and logging treats the groups differently.",
      "Look for steps that happen in only one arm: redirects, extra page loads, crashes, filters.",
      "Slice the mismatch by browser, device, day and entry point to find where the imbalance starts."
    ]
  }
]
);
