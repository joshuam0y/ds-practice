window.BANK = (window.BANK || []).concat(
[
  {
    "id": "stat-type1-fraud",
    "section": "stats",
    "type": "mcq",
    "topic": "Type I and Type II errors",
    "title": "Type I error in a fraud check",
    "prompt": "A fraud model tests each card transaction with the null hypothesis H0: \"this transaction is legitimate.\" In this setting, what is a Type I error?",
    "options": [
      "Flagging a legitimate transaction as fraud",
      "Letting a fraudulent transaction through as legitimate",
      "Correctly flagging a fraudulent transaction",
      "Correctly clearing a legitimate transaction"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A Type I error rejects a true null hypothesis. H0 (legitimate) is true, but the model rejects it and flags the transaction: a false positive.",
      "This is a Type II error: failing to reject H0 when it is false. The transaction really is fraud, but the model keeps calling it legitimate (a false negative).",
      "This is a correct rejection of a false H0. Its probability is the test's power, not an error.",
      "This is correctly failing to reject a true H0, which happens with probability 1 minus alpha. Not an error."
    ],
    "approach": [
      "Write down H0 in words first. Every error question hinges on what H0 says.",
      "Type I = reject H0 when H0 is true (false positive, probability alpha). Type II = keep H0 when H0 is false (false negative, probability beta).",
      "Translate \"reject H0\" into the scenario: here rejecting \"legitimate\" means flagging as fraud."
    ]
  },
  {
    "id": "stat-boxplot-outlier",
    "section": "stats",
    "type": "mcq",
    "topic": "Box plots and the 1.5 IQR rule",
    "title": "Spotting an outlier on a box plot",
    "prompt": "A box plot of personal loan amounts (in $ thousands) has Q1 = 20 and Q3 = 50. Using the standard 1.5 × IQR rule, which of these loans is plotted as an outlier?",
    "options": ["85", "95", "101", "60"],
    "answer": 2,
    "explanations": [
      "85 is inside the upper fence of 95. It would only count as an outlier if you used Q3 + 1 × IQR = 80, which is the wrong multiplier.",
      "95 is exactly the upper fence. Points beyond the fence are outliers; a point on the fence is not. This is the boundary trap.",
      "Correct. IQR = 50 − 20 = 30, so the upper fence is Q3 + 1.5 × 30 = 95. Only 101 lies beyond it.",
      "60 is above Q3 but well inside the fence. Being above the box (in the whisker) does not make a point an outlier."
    ],
    "approach": [
      "Compute IQR = Q3 − Q1.",
      "Fences: lower = Q1 − 1.5 × IQR, upper = Q3 + 1.5 × IQR.",
      "An outlier is strictly beyond a fence. Check each option against the fences, watching for one that sits exactly on a fence."
    ],
    "check": { "compute": "50 + 1.5 * (50 - 20)", "rule": "only_greater", "values": ["85", "95", "101", "60"] }
  },
  {
    "id": "stat-sample-size-power",
    "section": "stats",
    "type": "mcq",
    "topic": "Hypothesis testing: power and sample size",
    "title": "What a bigger sample changes",
    "prompt": "An analyst tests whether a new loan offer raises the average balance. She keeps the significance level at α = 0.05 but doubles the sample size. What happens?",
    "options": [
      "The probability of a Type I error goes down",
      "The probability of a Type II error goes down",
      "The probability of a Type I error goes up",
      "The probability of a Type II error goes up"
    ],
    "answer": 1,
    "explanations": [
      "The Type I error rate is alpha, which she chose and held at 0.05. Sample size does not change it.",
      "Correct. A larger sample shrinks the standard error, so a real effect is easier to detect. Power rises and beta, the Type II error rate, falls.",
      "Alpha is fixed by the analyst at 0.05, so it cannot go up when only the sample size changes.",
      "Backwards: more data makes it easier, not harder, to detect a real effect."
    ],
    "approach": [
      "Remember who controls what: you set alpha directly; beta depends on alpha, effect size, variability and sample size.",
      "More data means a smaller standard error (σ/√n), so the test can tell a real difference from noise more often.",
      "If alpha is held fixed, sample size changes only beta and power (power = 1 − beta)."
    ]
  },
  {
    "id": "stat-covariance-units",
    "section": "stats",
    "type": "mcq",
    "topic": "Covariance and correlation",
    "title": "Covariance after changing units",
    "prompt": "The covariance between customers' annual income and annual card spending, both in dollars, is 2,000,000. If both variables are re-expressed in thousands of dollars, what is the new covariance?",
    "options": ["2", "2,000", "2,000,000", "0.002"],
    "answer": 0,
    "explanations": [
      "Correct. Cov(aX, bY) = ab Cov(X, Y). Dividing each variable by 1,000 multiplies the covariance by 1/1,000 × 1/1,000, so 2,000,000 / 1,000,000 = 2.",
      "This rescales only one variable. Both income and spending changed units, so the factor applies twice.",
      "This would be true of correlation, which has no units. Covariance carries the units of both variables, so it changes.",
      "This divides by 1,000 three times. The factor is (1/1,000)², not (1/1,000)³."
    ],
    "approach": [
      "Covariance is in units of X times units of Y, so rescaling X by a and Y by b multiplies it by a × b.",
      "Correlation is covariance divided by both standard deviations, so the scale factors cancel and correlation never changes with units.",
      "Write the factor once per variable that changed."
    ],
    "check": { "compute": "2000000 * (1/1000) * (1/1000)", "values": ["2", "2000", "2000000", "0.002"] }
  },
  {
    "id": "stat-stratified-sampling",
    "section": "stats",
    "type": "mcq",
    "topic": "Sampling methods",
    "title": "Sampling by region",
    "prompt": "A bank surveys customer satisfaction. It splits customers into its 5 regions and then randomly selects customers from every region, in proportion to each region's size. What sampling method is this?",
    "options": ["Cluster sampling", "Stratified sampling", "Systematic sampling", "Convenience sampling"],
    "answer": 1,
    "explanations": [
      "Cluster sampling randomly picks some whole groups (say 2 of the 5 regions) and surveys everyone in them. Here every region is sampled.",
      "Correct. The population is divided into groups (strata) and a random sample is drawn from every group, here in proportion to size.",
      "Systematic sampling takes every kth customer from an ordered list, such as every 50th account number.",
      "Convenience sampling uses whoever is easiest to reach, such as customers who walk into one branch. Nothing here is random by convenience."
    ],
    "approach": [
      "Ask two questions: is the population split into groups, and are some groups or all groups sampled?",
      "All groups sampled, randomly within each: stratified. Some whole groups chosen at random: cluster.",
      "Every kth item from a list: systematic. Whoever is easy to reach: convenience (biased)."
    ]
  }
]
);
