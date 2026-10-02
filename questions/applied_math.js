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
  },
  {
    "id": "math-audit-includes-flagged",
    "section": "math",
    "type": "mcq",
    "topic": "Combinations with a constraint",
    "title": "An audit sample that must include one file",
    "prompt": "An auditor picks 4 of 10 loan files to review. One specific file has been flagged and must be included. How many different samples are possible?",
    "options": ["210", "126", "84", "36"],
    "answer": 2,
    "explanations": [
      "This is C(10, 4), all 4-file samples, ignoring the requirement to include the flagged file.",
      "This is C(9, 4), the samples that leave the flagged file out: the complement of what's asked.",
      "Correct. Put the flagged file in first. That leaves 3 more to choose from the other 9: C(9, 3) = 9 × 8 × 7 / 6 = 84.",
      "This is C(9, 2), choosing one file too few after including the flagged one."
    ],
    "approach": [
      "Handle the forced item first: place it, then count the free choices that remain.",
      "Here: 1 fixed, choose 3 of the remaining 9.",
      "Check with complements: C(10, 4) − C(9, 4) = 210 − 126 = 84, the samples that do include it."
    ],
    "check": { "compute": "comb(9, 3)", "values": ["210", "126", "84", "36"] }
  },
  {
    "id": "math-conditional-two-way",
    "section": "math",
    "type": "mcq",
    "topic": "Conditional probability",
    "title": "Mortgage holders with a credit card",
    "prompt": "Of 200 customers, 120 have a credit card, 80 have a mortgage, and 50 have both. A customer is chosen at random and turns out to have a mortgage. What is the probability that they also have a credit card?",
    "options": ["5/12", "5/8", "1/4", "3/5"],
    "answer": 1,
    "explanations": [
      "This is 50/120, P(mortgage | credit card). The condition is reversed: we know they have a mortgage.",
      "Correct. Given a mortgage, the sample space shrinks to the 80 mortgage holders, and 50 of them have a card: 50/80 = 5/8.",
      "This is 50/200, P(both). It forgets that we already know the customer has a mortgage.",
      "This is 120/200, P(credit card) overall, which ignores the information given."
    ],
    "approach": [
      "\"Given B\" means divide by the count of B: P(A | B) = count(A and B) / count(B).",
      "Identify which event is known (here, the mortgage) and put it in the denominator.",
      "Watch for the reversed option, P(B | A), which divides by the wrong group."
    ],
    "check": { "compute": "50/80", "values": ["50/120", "50/80", "50/200", "120/200"] }
  },
  {
    "id": "math-independent-at-least-one",
    "section": "math",
    "type": "mcq",
    "topic": "Independent events",
    "title": "Flagged by at least one rule",
    "prompt": "Two independent fraud rules check every transaction. Rule A flags 10% of transactions and rule B flags 20%. What is the probability that a transaction is flagged by at least one rule?",
    "options": ["0.30", "0.28", "0.02", "0.26"],
    "answer": 1,
    "explanations": [
      "This adds the probabilities and forgets that some transactions are flagged by both, which are then counted twice.",
      "Correct. P(neither) = 0.9 × 0.8 = 0.72, so P(at least one) = 1 − 0.72 = 0.28. Equivalently 0.1 + 0.2 − 0.1 × 0.2 = 0.28.",
      "This is P(both) = 0.1 × 0.2, not P(at least one).",
      "This subtracts the overlap twice: 0.3 − 2 × 0.02."
    ],
    "approach": [
      "\"At least one\" is easiest as 1 − P(none).",
      "For independent events, multiply: P(neither) = P(not A) × P(not B).",
      "Or use inclusion-exclusion: P(A or B) = P(A) + P(B) − P(A and B)."
    ],
    "check": { "compute": "1 - 0.9*0.8", "values": ["0.30", "0.28", "0.02", "0.26"] }
  },
  {
    "id": "math-expected-bonus",
    "section": "math",
    "type": "mcq",
    "topic": "Expected value",
    "title": "Expected sign-up bonus",
    "prompt": "A promotion gives each new customer a $50 bonus with probability 1/10, a $10 bonus with probability 3/10, and nothing otherwise. What is the expected bonus per new customer?",
    "options": ["$8", "$20", "$30", "$60"],
    "answer": 0,
    "explanations": [
      "Correct. E = 50 × 1/10 + 10 × 3/10 + 0 × 6/10 = 5 + 3 + 0 = $8.",
      "This averages the three amounts (50 + 10 + 0) / 3 as if they were equally likely. They aren't.",
      "This averages only the two nonzero amounts and ignores the probabilities.",
      "This adds the amounts without weighting them by probability."
    ],
    "approach": [
      "Expected value is a probability-weighted average: multiply each outcome by its probability and add.",
      "Include the zero outcome so the probabilities add to 1 (1/10 + 3/10 + 6/10).",
      "A plain average is only right when every outcome is equally likely."
    ],
    "check": { "compute": "50*Fraction(1,10) + 10*Fraction(3,10)", "values": ["8", "20", "30", "60"] }
  },
  {
    "id": "math-arrange-balance",
    "section": "math",
    "type": "mcq",
    "topic": "Permutations with repeated items",
    "title": "Rearranging the letters of BALANCE",
    "prompt": "How many distinct arrangements are there of the letters in the word BALANCE?",
    "options": ["5,040", "2,520", "1,260", "720"],
    "answer": 1,
    "explanations": [
      "This is 7!, which treats the two A's as different letters and so counts every arrangement twice.",
      "Correct. BALANCE has 7 letters with A appearing twice. Divide 7! by 2! for the repeated A's: 5,040 / 2 = 2,520.",
      "This divides by 2! twice, as if another letter also repeated. Only A repeats (B, L, N, C, E appear once each).",
      "This is 6!, which drops a letter."
    ],
    "approach": [
      "Count the letters and how often each repeats: here 7 letters, A twice, all others once.",
      "Arrangements = n! / (k1! × k2! × ...), one factorial for each repeated letter.",
      "Double-check the repeats by writing out the letters; it's easy to imagine a repeat that isn't there."
    ],
    "check": { "compute": "factorial(7) // factorial(2)", "values": ["5040", "2520", "1260", "720"] }
  },
  {
    "id": "math-poisson-exactly-three",
    "section": "math",
    "type": "mcq",
    "topic": "Poisson distribution",
    "title": "Exactly three applications in an hour",
    "prompt": "Loan applications arrive at an average rate of 2 per hour, following a Poisson distribution. What is the probability of exactly 3 applications in a given hour?",
    "options": ["(4/3)e^−2", "8e^−2", "(9/2)e^−3", "1 − e^−2"],
    "answer": 0,
    "explanations": [
      "Correct. P(X = 3) = λ³ e^−λ / 3! = 8e^−2 / 6 = (4/3)e^−2, about 0.18.",
      "This forgets to divide by 3!. It's also about 1.08, more than 1, so it can't be a probability.",
      "This swaps λ and k: 3² e^−3 / 2!.",
      "This is P(at least one), not P(exactly three)."
    ],
    "approach": [
      "Write the formula with the numbers in place: P(X = k) = λ^k e^−λ / k!, with λ = 2 and k = 3.",
      "Simplify the fraction: 2³ / 3! = 8/6 = 4/3.",
      "Sanity check: any answer above 1 is wrong."
    ],
    "check": { "compute": "2**3 * math.exp(-2) / factorial(3)", "values": ["Fraction(4,3)*math.exp(-2)", "8*math.exp(-2)", "4.5*math.exp(-3)", "1 - math.exp(-2)"] }
  },
  {
    "id": "math-poisson-rescale",
    "section": "math",
    "type": "mcq",
    "topic": "Poisson distribution: changing the interval",
    "title": "No disputes in five minutes",
    "prompt": "A call center receives card disputes at an average of 12 per hour, following a Poisson distribution. What is the probability of receiving no disputes in a 5-minute window?",
    "options": ["e^−12", "e^−1", "1 − e^−1", "e^−5"],
    "answer": 1,
    "explanations": [
      "This uses the hourly rate for a 5-minute window. The rate must be rescaled to the interval.",
      "Correct. 5 minutes is 1/12 of an hour, so λ = 12 × 1/12 = 1. P(X = 0) = e^−λ = e^−1, about 0.37.",
      "This is P(at least one dispute), the complement of what's asked.",
      "This uses the number of minutes as λ instead of the expected count in 5 minutes."
    ],
    "approach": [
      "λ is the expected count for the exact interval in the question. Scale it: rate × interval length.",
      "P(X = 0) = e^−λ.",
      "Before plugging in, ask whether the question wants none, exactly k, or at least one."
    ],
    "check": { "compute": "math.exp(-12 * 5 / 60)", "values": ["math.exp(-12)", "math.exp(-1)", "1 - math.exp(-1)", "math.exp(-5)"] }
  },
  {
    "id": "math-normal-between",
    "section": "math",
    "type": "mcq",
    "topic": "Normal distribution: empirical rule",
    "title": "Processing times between two values",
    "prompt": "Loan processing times are approximately normal with mean 40 minutes and standard deviation 8 minutes. Using the 68-95-99.7 rule, about what percentage of loans take between 32 and 56 minutes?",
    "options": ["68%", "81.5%", "95%", "47.5%"],
    "answer": 1,
    "explanations": [
      "68% covers ±1 SD, from 32 to 48. The interval here reaches 56, which is +2 SD.",
      "Correct. 32 is 1 SD below (z = −1) and 56 is 2 SD above (z = 2). The mean to −1 SD holds 68/2 = 34%, and the mean to +2 SD holds 95/2 = 47.5%. Total 81.5%.",
      "95% covers ±2 SD, from 24 to 56. The lower end here is 32, only 1 SD below.",
      "This counts only the part from the mean up to 56 and forgets the part from 32 up to the mean."
    ],
    "approach": [
      "Turn each endpoint into a z-score: (32 − 40)/8 = −1 and (56 − 40)/8 = 2.",
      "Split the interval at the mean and use half of each empirical-rule percentage on each side.",
      "Add the pieces: 34% + 47.5%."
    ],
    "check": { "compute": "0.68/2 + 0.95/2", "values": ["0.68", "0.815", "0.95", "0.475"] }
  },
  {
    "id": "math-bayes-not-flagged",
    "section": "math",
    "type": "mcq",
    "topic": "Conditional probability and Bayes",
    "title": "High risk even though not flagged",
    "prompt": "20% of loan applicants are high risk. A screening model flags 80% of high-risk applicants and 10% of low-risk applicants. An applicant is **not** flagged. What is the probability that they are high risk?",
    "options": ["1/5", "1/19", "1/25", "2/3"],
    "answer": 1,
    "explanations": [
      "This is the base rate. Not being flagged is evidence of lower risk, so the probability should drop below 1/5.",
      "Correct. P(high and not flagged) = 0.2 × 0.2 = 0.04. P(low and not flagged) = 0.8 × 0.9 = 0.72. So P(high | not flagged) = 0.04 / 0.76 = 1/19.",
      "This is P(high and not flagged) = 0.04, a joint probability. You still need to divide by P(not flagged) = 0.76.",
      "This is P(high | flagged) = 0.16 / 0.24. The question is about applicants who were not flagged."
    ],
    "approach": [
      "Use 100 applicants: 20 high risk, 80 low risk.",
      "Not flagged: high-risk 20 × 20% = 4, low-risk 80 × 90% = 72.",
      "P(high | not flagged) = 4 / (4 + 72) = 4/76 = 1/19.",
      "Read carefully whether the condition is \"flagged\" or \"not flagged.\""
    ],
    "check": { "compute": "(0.2*0.2) / (0.2*0.2 + 0.8*0.9)", "values": ["1/5", "1/19", "1/25", "2/3"] }
  },
  {
    "id": "math-tellers-not-adjacent",
    "section": "math",
    "type": "mcq",
    "topic": "Counting with a restriction",
    "title": "Two tellers who can't sit together",
    "prompt": "Five tellers are assigned to five windows in a row, one teller per window. Two particular tellers must not be at neighboring windows. How many assignments are possible?",
    "options": ["120", "96", "72", "48"],
    "answer": 2,
    "explanations": [
      "This is 5!, every assignment, ignoring the restriction.",
      "This subtracts only 24 adjacent arrangements, forgetting that the pair can sit in either order (×2).",
      "Correct. Total 5! = 120. For adjacent arrangements, glue the pair into one block: 4! = 24 orders of 4 units, times 2 orders inside the block, gives 48. Not adjacent: 120 − 48 = 72.",
      "This is the number of arrangements where they are adjacent, the opposite of what's asked."
    ],
    "approach": [
      "\"Must not\" problems are usually easiest as total minus the forbidden cases.",
      "Count \"together\" cases by treating the pair as one block, then multiply by the ways to order inside the block.",
      "Subtract from the total, and check which of the two counts the question actually wants."
    ],
    "check": { "compute": "factorial(5) - factorial(4)*2", "values": ["120", "96", "72", "48"] }
  },
  {
    "id": "math-at-least-one-manager",
    "section": "math",
    "type": "mcq",
    "topic": "Combinations: at least one",
    "title": "A review panel with at least one manager",
    "prompt": "A review panel of 3 is chosen from 5 analysts and 4 managers. How many panels include at least one manager?",
    "options": ["84", "74", "112", "40"],
    "answer": 1,
    "explanations": [
      "This is C(9, 3), every panel, including the 10 with no manager.",
      "Correct. Total panels C(9, 3) = 84. Panels with no manager: C(5, 3) = 10. At least one manager: 84 − 10 = 74.",
      "This picks one manager first (4 ways) and then any 2 of the other 8 (28 ways). Panels with two or three managers get counted more than once.",
      "This counts panels with exactly one manager: 4 × C(5, 2) = 40. It misses the panels with two or three."
    ],
    "approach": [
      "\"At least one\" counts are easiest as total minus none.",
      "Total: C(9, 3). None: all three from the 5 analysts, C(5, 3).",
      "Avoid \"pick one, then pick the rest\" for at-least-one problems: it double counts."
    ],
    "check": { "compute": "comb(9, 3) - comb(5, 3)", "values": ["84", "74", "112", "40"] }
  },
  {
    "id": "math-expected-disputes",
    "section": "math",
    "type": "mcq",
    "topic": "Expected value of a count",
    "title": "Expected number of disputes",
    "prompt": "Each of 200 card accounts files a dispute in a given month with probability 0.01, independently of the others. What is the expected number of disputes this month?",
    "options": ["0.01", "0.2", "2", "20"],
    "answer": 2,
    "explanations": [
      "This is the probability for a single account, not the expected count across all 200.",
      "This misplaces the decimal: 200 × 0.01 is 2, not 0.2.",
      "Correct. The count is binomial, and its expected value is n × p = 200 × 0.01 = 2.",
      "This misplaces the decimal the other way: it uses p = 0.1."
    ],
    "approach": [
      "Expected count = number of trials × probability per trial (n × p).",
      "This works by linearity of expectation, even without knowing the full distribution.",
      "With large n and small p, the count is close to Poisson with λ = n × p = 2."
    ],
    "check": { "compute": "200 * 0.01", "values": ["0.01", "0.2", "2", "20"] }
  },
  {
    "id": "math-normal-symmetry",
    "section": "math",
    "type": "mcq",
    "topic": "Normal distribution: symmetry",
    "title": "Using symmetry around the mean",
    "prompt": "Personal loan amounts are normally distributed with mean $20,000. The probability that a loan is above $26,000 is 0.10. What is the probability that a loan is between $14,000 and $26,000?",
    "options": ["0.90", "0.80", "0.20", "0.40"],
    "answer": 1,
    "explanations": [
      "This removes only the upper tail. By symmetry, the lower tail below $14,000 is also 0.10.",
      "Correct. $14,000 and $26,000 are the same distance from the mean, so each tail beyond them is 0.10. The middle is 1 − 0.10 − 0.10 = 0.80.",
      "This is the two tails together, the probability of being outside the interval.",
      "This is the probability from the mean to one end only (0.5 − 0.1)."
    ],
    "approach": [
      "Check whether the endpoints are symmetric around the mean: 20,000 ± 6,000.",
      "A normal curve is symmetric, so equal-distance tails have equal probability.",
      "Middle = 1 − both tails. Draw the curve and shade it if unsure."
    ],
    "check": { "compute": "1 - 2*0.10", "values": ["0.90", "0.80", "0.20", "0.40"] }
  },
  {
    "id": "math-ordering-tellers",
    "section": "math",
    "type": "mcq",
    "topic": "Analytical reasoning: ordering",
    "title": "Who processed the second fewest",
    "prompt": "Four tellers processed different numbers of transactions yesterday. Ana processed more than Bo. Cy processed fewer than Bo but more than Dee. Who processed the second fewest?",
    "options": ["Ana", "Bo", "Cy", "Dee"],
    "answer": 2,
    "explanations": [
      "Ana processed more than Bo, who processed more than Cy and Dee, so Ana has the most.",
      "Bo is second most: only Ana is above him.",
      "Correct. The order from most to fewest is Ana, Bo, Cy, Dee, so Cy is second fewest.",
      "Dee processed fewer than Cy, so Dee has the fewest."
    ],
    "approach": [
      "Turn each sentence into an inequality: Ana > Bo, Bo > Cy, Cy > Dee.",
      "Chain them into one order: Ana > Bo > Cy > Dee.",
      "Re-read what's asked (\"second fewest\") and count from the correct end."
    ]
  },
  {
    "id": "math-without-replacement",
    "section": "math",
    "type": "mcq",
    "topic": "Probability without replacement",
    "title": "Two files that both have errors",
    "prompt": "A batch of 10 loan files contains 3 with errors. An auditor picks 2 files at random, without replacement. What is the probability that both have errors?",
    "options": ["1/15", "9/100", "3/5", "2/9"],
    "answer": 0,
    "explanations": [
      "Correct. P(first has an error) = 3/10. Given that, 2 of the remaining 9 have errors: 2/9. Multiply: 3/10 × 2/9 = 6/90 = 1/15. Or C(3, 2) / C(10, 2) = 3/45 = 1/15.",
      "This is (3/10)², which assumes the first file goes back before the second pick (with replacement).",
      "This adds 3/10 + 3/10. \"Both\" means multiply (with the right conditional probability), not add.",
      "This is only the second step, P(second has an error | first had one). It leaves out the first draw."
    ],
    "approach": [
      "Without replacement, the second probability depends on the first: update both the count and the total.",
      "Multiply along the sequence: P(A) × P(B | A).",
      "Check with combinations: favorable pairs / all pairs = C(3, 2) / C(10, 2)."
    ],
    "check": { "compute": "Fraction(3, 10) * Fraction(2, 9)", "values": ["1/15", "9/100", "3/5", "2/9"] }
  }
]
);
