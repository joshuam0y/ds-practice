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
  },
  {
    "id": "stat-p-value-meaning",
    "section": "stats",
    "type": "mcq",
    "topic": "Hypothesis testing: p-values",
    "title": "What p = 0.03 means",
    "prompt": "A test of whether a new overdraft notice reduces overdraft fees gives p = 0.03. Which statement correctly interprets this p-value?",
    "options": [
      "There is a 3% chance that the null hypothesis is true",
      "If the null hypothesis were true, results at least this extreme would happen about 3% of the time",
      "There is a 97% chance that the notice reduces fees",
      "The notice reduces fees by 3%"
    ],
    "answer": 1,
    "explanations": [
      "This is the most common misreading. The p-value is computed assuming H0 is true, so it can't be the probability that H0 is true.",
      "Correct. A p-value is P(data at least this extreme | H0 true). Small values mean the data would be surprising if H0 held.",
      "The same mistake in reverse. A p-value is not the probability that the alternative is true.",
      "A p-value measures surprise under H0, not the size of the effect. A tiny effect can have a small p-value with enough data."
    ],
    "approach": [
      "Say the definition out loud: \"assuming H0 is true, the chance of results at least this extreme.\"",
      "Eliminate any option that gives the probability that a hypothesis is true.",
      "Eliminate any option that reads the p-value as an effect size."
    ]
  },
  {
    "id": "stat-two-sided-decision",
    "section": "stats",
    "type": "mcq",
    "topic": "Hypothesis testing: one- and two-sided tests",
    "title": "z = 1.8 in a two-sided test",
    "prompt": "An analyst runs a two-sided z-test at α = 0.05 and gets z = 1.8. The critical values are ±1.96 for a two-sided test and 1.645 for a one-sided test. What should she conclude?",
    "options": [
      "Reject H0, because 1.8 is greater than 1.645",
      "Fail to reject H0, because |1.8| is less than 1.96",
      "Reject H0, because the test statistic is positive",
      "Accept H0 and conclude the two means are equal"
    ],
    "answer": 1,
    "explanations": [
      "1.645 is the one-sided cutoff. Using it on a two-sided test doubles the real chance of a Type I error in that direction.",
      "Correct. A two-sided test at 0.05 puts 2.5% in each tail, so the cutoff is 1.96. Since |1.8| < 1.96, the result is not significant.",
      "The sign shows the direction of the difference, not whether it's significant.",
      "Failing to reject is not proof that H0 is true. The right wording is \"not enough evidence to reject H0.\""
    ],
    "approach": [
      "Check whether the test is one- or two-sided before picking a cutoff.",
      "Two-sided at α = 0.05: compare |z| with 1.96. One-sided: compare z with 1.645 in the stated direction.",
      "Phrase the conclusion as \"reject\" or \"fail to reject,\" never \"accept\" or \"prove.\""
    ]
  },
  {
    "id": "stat-boxplot-five-numbers",
    "section": "stats",
    "type": "mcq",
    "topic": "Box plots: the five-number summary",
    "title": "Reading a box plot's numbers",
    "prompt": "A box plot of daily ATM withdrawals at one machine (in $ hundreds) shows: minimum 2, Q1 5, median 7, Q3 12, maximum 20. Which statement is true?",
    "options": [
      "The mean is 7",
      "About half of the days fall between 5 and 12",
      "The interquartile range is 18",
      "About 25% of the days are above 7"
    ],
    "answer": 1,
    "explanations": [
      "The line in the box is the median, not the mean. A box plot doesn't show the mean at all.",
      "Correct. Q1 to Q3 spans the middle 50% of the data, and the box runs from 5 to 12.",
      "18 is the range (20 − 2). The IQR is Q3 − Q1 = 12 − 5 = 7.",
      "7 is the median, so about 50% of days are above it, not 25%. About 25% are above Q3 = 12."
    ],
    "approach": [
      "Map each number to its meaning: min, Q1 (25th percentile), median (50th), Q3 (75th), max.",
      "Each of the four pieces (lower whisker, two halves of the box, upper whisker) holds about 25% of the data.",
      "Range = max − min. IQR = Q3 − Q1."
    ]
  },
  {
    "id": "stat-undercoverage-bias",
    "section": "stats",
    "type": "mcq",
    "topic": "Sampling methods and bias",
    "title": "A survey only in the mobile app",
    "prompt": "To measure satisfaction among all customers, a bank shows a survey only inside its mobile app. Many older customers bank only at branches. What is the main problem with this sample?",
    "options": ["Nonresponse bias", "Undercoverage (selection) bias", "Response bias", "Random sampling error"],
    "answer": 1,
    "explanations": [
      "Nonresponse bias happens when people who are invited don't answer. Here, branch-only customers are never invited at all.",
      "Correct. Part of the population (branch-only customers) has no chance of being selected, so the sample can't represent them.",
      "Response bias is about inaccurate answers, for example from leading questions or social pressure. Nothing here affects how people answer.",
      "Random sampling error shrinks with a bigger sample. This bias doesn't: a larger app-only sample is just as unrepresentative."
    ],
    "approach": [
      "Ask who could possibly end up in the sample. If a group can't be selected, that's undercoverage.",
      "Invited but didn't answer: nonresponse. Answered inaccurately: response bias.",
      "Bias is systematic and doesn't shrink with sample size; random error does."
    ]
  },
  {
    "id": "stat-standard-error",
    "section": "stats",
    "type": "mcq",
    "topic": "Standard deviation and standard error",
    "title": "Standard error of a sample mean",
    "prompt": "Card transaction amounts have a standard deviation of $60. An analyst takes a random sample of 36 transactions. What is the standard error of the sample mean?",
    "options": ["$10", "about $1.67", "$60", "$100"],
    "answer": 0,
    "explanations": [
      "Correct. SE = σ / √n = 60 / √36 = 60 / 6 = 10.",
      "This divides by n instead of √n: 60 / 36. Forgetting the square root is the classic mistake.",
      "This is the spread of individual transactions. Averages of 36 transactions vary much less than single transactions.",
      "This is the variance of the mean, σ² / n = 3,600 / 36. The standard error is its square root."
    ],
    "approach": [
      "Standard deviation describes individual values; standard error describes how much a sample mean varies.",
      "SE = σ / √n. Variance of the mean = σ² / n.",
      "Pick n values with clean square roots (36, 49, 100) and check that you took the root."
    ],
    "check": { "compute": "60 / sqrt(36)", "values": ["10", "60/36", "60", "100"] }
  },
  {
    "id": "stat-correlation-unit-free",
    "section": "stats",
    "type": "mcq",
    "topic": "Covariance and correlation",
    "title": "The measure without units",
    "prompt": "An analyst wants to compare how strongly balance relates to tenure at two banks, one reporting in dollars and one in euros. Which measure has no units and always lies between −1 and 1?",
    "options": ["Covariance", "Correlation", "Variance", "Standard deviation"],
    "answer": 1,
    "explanations": [
      "Covariance carries the units of both variables (dollar-years here) and has no fixed range, so it can't be compared across currencies.",
      "Correct. Correlation is covariance divided by both standard deviations, which cancels the units and bounds it between −1 and 1.",
      "Variance measures the spread of one variable, in squared units, and is never negative.",
      "Standard deviation measures the spread of one variable, in that variable's units."
    ],
    "approach": [
      "Correlation r = Cov(X, Y) / (SD(X) × SD(Y)): unit-free, between −1 and 1.",
      "Covariance has the right sign but its size depends on units, so it's hard to interpret alone.",
      "Variance and SD describe a single variable, not a relationship."
    ]
  },
  {
    "id": "stat-lower-alpha-tradeoff",
    "section": "stats",
    "type": "mcq",
    "topic": "Type I and Type II errors: the trade-off",
    "title": "Making the fraud test stricter",
    "prompt": "A fraud test uses H0: \"the transaction is legitimate.\" The bank lowers the significance level from 0.05 to 0.01 and changes nothing else. What is the likely effect?",
    "options": [
      "Fewer legitimate transactions flagged, but more fraud missed",
      "Fewer legitimate transactions flagged and less fraud missed",
      "More legitimate transactions flagged, but less fraud missed",
      "Fewer legitimate transactions flagged, with no change in missed fraud"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A smaller alpha makes rejecting H0 harder. False alarms (Type I) fall, but more real fraud fails to be flagged (Type II rises).",
      "With the same data, you can't lower both error rates by changing alpha alone. That takes more data or a better model.",
      "This is the effect of raising alpha, not lowering it.",
      "Type I and Type II errors trade off: making rejection harder always increases misses, all else equal."
    ],
    "approach": [
      "Lower alpha means a stricter bar for rejecting H0.",
      "Stricter bar: fewer false positives (Type I) but more false negatives (Type II).",
      "Translate back into the scenario's words: rejecting \"legitimate\" means flagging."
    ]
  },
  {
    "id": "stat-median-even-count",
    "section": "stats",
    "type": "mcq",
    "topic": "Median with an even number of values",
    "title": "Median of six loan amounts",
    "prompt": "Six recent loans, in $ thousands, are 8, 3, 12, 5, 10 and 6. What is the median?",
    "options": ["8.5", "7", "about 7.33", "6"],
    "answer": 1,
    "explanations": [
      "This averages the two middle values of the unsorted list (12 and 5). Always sort first.",
      "Correct. Sorted: 3, 5, 6, 8, 10, 12. With an even count, the median is the average of the two middle values: (6 + 8) / 2 = 7.",
      "This is the mean, 44 / 6.",
      "This takes only the lower of the two middle values instead of averaging them."
    ],
    "approach": [
      "Sort the values first.",
      "Odd count: the middle value. Even count: the average of the two middle values.",
      "Compare with the mean to see which way the data lean."
    ],
    "check": { "compute": "(6 + 8) / 2", "values": ["8.5", "7", "44/6", "6"] }
  },
  {
    "id": "stat-compare-boxplots",
    "section": "stats",
    "type": "mcq",
    "topic": "Box plots: comparing groups",
    "title": "Two branches' wait times",
    "prompt": "Box plots of customer wait times at two branches show: Branch A has median 8 minutes and IQR 4 minutes. Branch B has median 8 minutes and IQR 12 minutes. Which statement is supported?",
    "options": [
      "Branch B has a longer average wait",
      "Typical waits are similar, but Branch B's waits are much more variable",
      "Branch A has more outliers",
      "Branch B has a higher median wait"
    ],
    "answer": 1,
    "explanations": [
      "The medians are equal, and a box plot doesn't show the mean, so you can't say which average is longer.",
      "Correct. Equal medians mean a similar typical wait, and B's IQR (the spread of the middle 50%) is three times A's.",
      "Nothing given here describes outliers. You'd need to see points beyond the whiskers.",
      "Both medians are 8 minutes."
    ],
    "approach": [
      "Compare centers with medians and spreads with IQRs (or box widths).",
      "Only claim what the five-number summary shows: no means and no outlier counts unless they're drawn.",
      "Eliminate options that contradict the numbers given before weighing the rest."
    ]
  },
  {
    "id": "stat-clt-skewed",
    "section": "stats",
    "type": "mcq",
    "topic": "Sampling distributions and the central limit theorem",
    "title": "Averages of skewed transactions",
    "prompt": "Individual card transaction amounts are strongly right-skewed. An analyst repeatedly takes random samples of 100 transactions and records each sample's mean. What shape will the distribution of these sample means have?",
    "options": [
      "Strongly right-skewed, like the individual transactions",
      "Approximately normal",
      "Uniform",
      "Left-skewed, to balance out the original skew"
    ],
    "answer": 1,
    "explanations": [
      "Individual values keep their skew, but averages of many values don't. With n = 100 the skew largely washes out.",
      "Correct. By the central limit theorem, means of large random samples are approximately normal whatever the original shape, centered at the population mean with spread σ/√n.",
      "Nothing about averaging produces a uniform distribution.",
      "Averaging doesn't flip skew; it reduces it."
    ],
    "approach": [
      "Separate the distribution of individual values from the distribution of sample means.",
      "CLT: for large n (a common rule of thumb is 30 or more), sample means are approximately normal.",
      "The sample means center on the population mean, with standard error σ/√n."
    ]
  }
]
);
