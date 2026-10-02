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
  },
  {
    "id": "stat-type2-ab-test",
    "section": "stats",
    "type": "mcq",
    "topic": "Type I and Type II errors",
    "title": "A real effect the test missed",
    "prompt": "A bank tests H0: \"the new mobile app design does not change average monthly deposits.\" In reality the design does raise deposits, but the test fails to reject H0. What happened?",
    "options": [
      "A Type I error",
      "A Type II error",
      "No error, because failing to reject H0 is not the same as accepting it",
      "Both a Type I and a Type II error"
    ],
    "answer": 1,
    "explanations": [
      "A Type I error needs H0 to be true and rejected. Here H0 is false and was not rejected.",
      "Correct. H0 is false (the design does change deposits) but the test kept it. That is a Type II error, a false negative, with probability beta.",
      "It's true that failing to reject is not proof that H0 holds, but the decision still missed a real effect. Error types are defined by the decision versus the truth, so this is a Type II error.",
      "Only one decision was made, and it can be wrong in only one way. Type I needs a rejection; there wasn't one."
    ],
    "approach": [
      "Make a 2 × 2 grid: truth (H0 true or false) against decision (reject or not).",
      "Find the cell: H0 false, not rejected. That cell is Type II.",
      "Shortcut: Type I is a false alarm, Type II is a miss."
    ]
  },
  {
    "id": "stat-boxplot-skew",
    "section": "stats",
    "type": "mcq",
    "topic": "Box plots and skewness",
    "title": "Reading skew from a box plot",
    "prompt": "In a box plot of checking account balances, the median line sits close to the bottom of the box, and the upper whisker is much longer than the lower whisker. What is the shape of the distribution most likely to be?",
    "options": ["Right-skewed (long tail of high balances)", "Left-skewed (long tail of low balances)", "Symmetric", "Bimodal"],
    "answer": 0,
    "explanations": [
      "Correct. The data are bunched at the low end (median near Q1) and stretch far to the high end (long upper whisker). That long right tail also pulls the mean above the median.",
      "This reverses the direction. Skew is named for the side of the long tail, and here the long tail is on the high side.",
      "A symmetric distribution has the median near the middle of the box and whiskers of similar length.",
      "A box plot can't show two peaks: it only shows five summary numbers. Nothing here points to bimodality."
    ],
    "approach": [
      "Skew is named after the long tail, not where most of the data sit.",
      "Look for two clues: where the median sits inside the box, and which whisker is longer.",
      "Median near the bottom plus a long upper whisker means right skew, and mean > median. Income and balances are the classic right-skewed examples."
    ]
  },
  {
    "id": "stat-mean-median-outlier",
    "section": "stats",
    "type": "mcq",
    "topic": "Mean, median and outliers",
    "title": "One very large balance",
    "prompt": "Five savings accounts have balances of $200, $300, $300, $400 and $10,000. What are the mean and the median?",
    "options": [
      "Mean $2,240, median $300",
      "Mean $300, median $2,240",
      "Mean $2,240, median $400",
      "Mean $2,800, median $300"
    ],
    "answer": 0,
    "explanations": [
      "Correct. The total is 11,200, and 11,200 / 5 = 2,240. Sorted, the middle (3rd) value is 300. The one large balance drags the mean far above the median.",
      "These are swapped. The median is the middle value of the sorted list, which can't be larger than four of the five values here.",
      "400 is the 4th value, not the middle one. With 5 values the median is the 3rd.",
      "This divides the total by 4 instead of 5."
    ],
    "approach": [
      "Mean: add everything and divide by the count. Median: sort, then take the middle value (or the average of the two middle values for an even count).",
      "An outlier moves the mean a lot and the median barely at all, which is why medians are used for skewed data like balances and income.",
      "Sanity check: here the mean is bigger than four of the five values, a sign of a right-skewed outlier."
    ]
  },
  {
    "id": "stat-sd-linear-transform",
    "section": "stats",
    "type": "mcq",
    "topic": "Standard deviation under a linear change",
    "title": "Add, then double",
    "prompt": "Account balances have mean $500 and standard deviation $50. The bank adds $100 to every account and then doubles every balance. What is the new standard deviation?",
    "options": ["$100", "$300", "$50", "$200"],
    "answer": 0,
    "explanations": [
      "Correct. Adding a constant shifts every value equally, so spread doesn't change. Multiplying by 2 doubles every distance from the mean, so the SD doubles: 2 × 50 = 100.",
      "This adds the $100 to the SD before doubling: (50 + 100) × 2. Adding a constant moves the mean, not the spread.",
      "Doubling does change the spread. Only the added constant leaves it alone.",
      "This multiplies the SD by 4, which is what happens to the variance. Variance scales by 2² = 4; the SD scales by 2."
    ],
    "approach": [
      "For Y = aX + b: mean(Y) = a × mean(X) + b, SD(Y) = |a| × SD(X), Var(Y) = a² × Var(X).",
      "Shifts (adding b) change only the mean. Scaling (multiplying by a) changes both.",
      "Check whether the question asks for the SD or the variance before squaring anything."
    ],
    "check": { "compute": "abs(2) * 50", "values": ["100", "300", "50", "200"] }
  },
  {
    "id": "stat-correlation-meaning",
    "section": "stats",
    "type": "mcq",
    "topic": "Correlation",
    "title": "What r = −0.8 tells you",
    "prompt": "Across a bank's loan portfolio, the correlation between borrowers' credit scores and their default rates is r = −0.8. Which statement is correct?",
    "options": [
      "Borrowers with higher credit scores tend to have lower default rates",
      "Low credit scores cause 80% of defaults",
      "Credit score explains 80% of the variation in default rates",
      "The relationship is weak because the correlation is negative"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A negative correlation means that as one variable goes up, the other tends to go down, and 0.8 in size is a strong linear relationship.",
      "Correlation says nothing about causation, and r is not a percentage of cases.",
      "The share of variation explained is r², not r: (−0.8)² = 0.64, so about 64%.",
      "The sign gives the direction; the size gives the strength. |r| = 0.8 is strong."
    ],
    "approach": [
      "Read the sign for direction and the absolute value for strength (around 0.7 or more is strong).",
      "If an option mentions \"variation explained,\" square r.",
      "Reject any option that turns correlation into causation."
    ]
  }
]
);
