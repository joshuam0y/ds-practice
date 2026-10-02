window.BANK = (window.BANK || []).concat(
[
  {
    "id": "math-bayes-fraud-flag",
    "section": "math",
    "type": "mcq",
    "topic": "Conditional probability and Bayes",
    "title": "How often a flag means fraud",
    "prompt": "1% of card transactions are fraudulent. A fraud detector flags 90% of fraudulent transactions, and it also flags 5% of legitimate ones. A transaction gets flagged. What is the probability that it is actually fraudulent?",
    "options": ["9/10", "2/13", "1/100", "9/50"],
    "answer": 1,
    "explanations": [
      "This is P(flagged | fraud), the detector's hit rate. The question asks the reverse, P(fraud | flagged). Confusing the two is the classic Bayes mistake.",
      "Correct. P(flag and fraud) = 0.01 × 0.9 = 0.009. P(flag and legit) = 0.99 × 0.05 = 0.0495. P(fraud | flag) = 0.009 / (0.009 + 0.0495) = 0.009 / 0.0585 = 90/585 = 2/13, about 15%.",
      "This is the base rate before seeing the flag. A flag is evidence, so the probability must go up.",
      "This divides 0.009 by 0.05, using only the false positive rate as the denominator. The denominator must be the total chance of a flag, from both fraud and legitimate transactions (0.0585)."
    ],
    "approach": [
      "Imagine 10,000 transactions so every number is whole: 100 fraud, 9,900 legitimate.",
      "Flags from fraud: 90% of 100 = 90. Flags from legitimate: 5% of 9,900 = 495.",
      "P(fraud | flagged) = fraud flags / all flags = 90 / (90 + 495) = 90/585 = 2/13.",
      "Sanity check: when the base rate is tiny, most flags are false alarms even for a good detector."
    ],
    "check": { "compute": "0.01*0.9 / (0.01*0.9 + 0.99*0.05)", "values": ["9/10", "2/13", "1/100", "9/50"] }
  },
  {
    "id": "math-poisson-at-least-one",
    "section": "math",
    "type": "mcq",
    "topic": "Poisson distribution",
    "title": "At least one fraud alert in an hour",
    "prompt": "Fraud alerts arrive at a monitoring desk at an average rate of 3 per hour, following a Poisson distribution. What is the probability of at least one alert in a given hour?",
    "options": ["e^−3", "3e^−3", "1 − e^−3", "1 − 4e^−3"],
    "answer": 2,
    "explanations": [
      "This is P(X = 0), the chance of no alerts at all: λ^0 e^−λ / 0! = e^−3.",
      "This is P(X = 1): λ^1 e^−λ / 1! = 3e^−3.",
      "Correct. \"At least one\" is the complement of \"none\": 1 − P(X = 0) = 1 − e^−3, about 0.95.",
      "This is 1 − P(0) − P(1) = 1 − e^−3 − 3e^−3, the probability of at least two alerts."
    ],
    "approach": [
      "Poisson: P(X = k) = λ^k e^−λ / k!, where λ is the average count for the interval (here 3 per hour).",
      "\"At least one\" almost always means use the complement: 1 − P(X = 0).",
      "Make sure λ matches the interval asked about. If the question asked about 2 hours, λ would be 6."
    ],
    "check": { "compute": "1 - math.exp(-3)", "values": ["math.exp(-3)", "3*math.exp(-3)", "1 - math.exp(-3)", "1 - 4*math.exp(-3)"] }
  },
  {
    "id": "math-choose-audit-team",
    "section": "math",
    "type": "mcq",
    "topic": "Combinations",
    "title": "Choosing an audit team",
    "prompt": "A branch has 8 loan officers. In how many ways can it choose 3 of them to form an audit team, if the team members have no distinct roles?",
    "options": ["24", "56", "336", "512"],
    "answer": 1,
    "explanations": [
      "This multiplies 8 × 3, which doesn't count anything meaningful here.",
      "Correct. Order doesn't matter, so this is C(8, 3) = 8 × 7 × 6 / (3 × 2 × 1) = 336 / 6 = 56.",
      "This is 8 × 7 × 6, the number of ordered selections (permutations). It counts each team 3! = 6 times, as if the roles were distinct.",
      "This is 8^3, which allows the same officer to be picked more than once."
    ],
    "approach": [
      "Ask: does order matter? Teams, committees and hands of cards: no (combinations). Rankings, roles, PINs: yes (permutations).",
      "Without repetition, C(n, k) = n! / (k!(n − k)!). Compute it as the top k factors of n! divided by k!: 8 × 7 × 6 / 6.",
      "If the members had roles (chair, secretary, reviewer), the answer would be the permutation 8 × 7 × 6 = 336."
    ],
    "check": { "compute": "math.comb(8, 3)", "values": ["24", "56", "336", "512"] }
  },
  {
    "id": "math-normal-credit-score",
    "section": "math",
    "type": "mcq",
    "topic": "Normal distribution: empirical rule",
    "title": "Credit scores above 800",
    "prompt": "Credit scores in a bank's applicant pool are approximately normal with mean 700 and standard deviation 50. Using the 68-95-99.7 rule, approximately what percentage of applicants score above 800?",
    "options": ["16%", "5%", "2.5%", "0.15%"],
    "answer": 2,
    "explanations": [
      "16% is the share above one standard deviation (750). 800 is two standard deviations above the mean.",
      "5% is the share outside ±2 standard deviations in both tails combined. The question asks only about the upper tail.",
      "Correct. 800 is (800 − 700) / 50 = 2 standard deviations above the mean. About 95% lie within ±2 SD, so 5% lie outside, split evenly: 2.5% above.",
      "0.15% is the upper tail beyond 3 standard deviations (850)."
    ],
    "approach": [
      "Convert to a z-score: z = (x − mean) / SD = (800 − 700) / 50 = 2.",
      "Use the empirical rule: within ±1, ±2, ±3 SD lie about 68%, 95%, 99.7%.",
      "For one tail, take what is outside and halve it: (100% − 95%) / 2 = 2.5%.",
      "Before answering, check you used the right tail and the right number of SDs."
    ],
    "check": { "compute": "(1 - 0.95) / 2", "values": ["0.16", "0.05", "0.025", "0.0015"] }
  },
  {
    "id": "math-expected-loan-profit",
    "section": "math",
    "type": "mcq",
    "topic": "Expected value",
    "title": "Expected profit on a small loan",
    "prompt": "A bank lends $1,000 for one year and charges $100 in interest. The probability the borrower defaults is 5%. If the borrower defaults, the bank recovers nothing and loses the $1,000. Otherwise the bank earns the $100. What is the bank's expected profit on this loan?",
    "options": ["$100", "$95", "$45", "$40"],
    "answer": 2,
    "explanations": [
      "This ignores the chance of default entirely.",
      "This counts the 95% chance of earning $100 but forgets the 5% chance of losing $1,000.",
      "Correct. E = 0.95 × 100 + 0.05 × (−1,000) = 95 − 50 = 45.",
      "This treats the loss as $1,100 (principal plus the interest never received). The $100 not earned is already accounted for by the 95% branch, so the loss is $1,000."
    ],
    "approach": [
      "List every outcome with its probability and its profit (gains positive, losses negative).",
      "Multiply each profit by its probability and add: E = Σ p × value.",
      "Check that the probabilities add to 1 and that you didn't double-count a loss."
    ],
    "check": { "compute": "0.95*100 + 0.05*(-1000)", "values": ["100", "95", "45", "40"] }
  },
  {
    "id": "math-pin-no-repeats",
    "section": "math",
    "type": "mcq",
    "topic": "Permutations and counting",
    "title": "PINs with no repeated digit",
    "prompt": "A debit card PIN is 4 digits, each 0 through 9, and a leading 0 is allowed. How many PINs have no repeated digit?",
    "options": ["10,000", "5,040", "4,536", "210"],
    "answer": 1,
    "explanations": [
      "This is 10^4, every PIN including those with repeated digits.",
      "Correct. Order matters and digits can't repeat: 10 × 9 × 8 × 7 = 5,040.",
      "This is 9 × 9 × 8 × 7, which wrongly bans a leading 0. The prompt allows it.",
      "This is C(10, 4), which counts sets of digits. In a PIN, order matters: 1234 and 4321 are different."
    ],
    "approach": [
      "Fill positions one at a time and multiply the choices: 10 for the first digit, then 9 unused, then 8, then 7.",
      "Order matters for codes and PINs, so use permutations, not combinations.",
      "Re-read the constraints (repeats allowed? leading zero allowed?) before multiplying."
    ],
    "check": { "compute": "10*9*8*7", "values": ["10000", "5040", "4536", "210"] }
  }
]
);
