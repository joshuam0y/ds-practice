I want you to build a practice website for a HackerRank technical assessment I'm taking for a Data Science Intern position at Citizens Bank. It's due October 7, 2026. This is prep only; I'll use it to practice beforehand, not during the real test.

First, save this whole message as CLAUDE.md in the project root so you have it in future sessions.

## About me and how to work with me
- I'm Joshua, a Data Science student at Northeastern. Comfortable with Python, SQL, pandas, git. GitHub username: joshuam0y.
- I want to understand the workflow, not just get finished code. Explain what you're doing and why in plain language as you go. If there's a real choice between approaches, tell me the tradeoff before picking.
- Keep explanations direct, no filler.
- Never use em dashes anywhere: code comments, UI text, question text, or messages to me.

## The real assessment (simulate this exactly)
- 75 minutes, one overall timer.
- 14 questions: 1 SQL coding question, 1 Python coding question, 12 multiple choice.
- Sections, in this order:
  1. SQL (Intermediate): 1 question, write a query
  2. Statistics: 4 multiple choice
  3. SQL (Basic): 3 multiple choice
  4. Python (Basic): 1 question, write code
  5. Applied Math: 5 multiple choice
- The coding questions are worth the most. Score each coding question as 5 points and each multiple choice as 1 (22 total).
- Assume no calculator. Math must be doable with pen and paper: clean numbers, fraction answers, or answers written as expressions like 1 − e^−3.

Topics from the official prep guide:
- SQL: SELECT, WHERE, JOIN, GROUP BY, HAVING, aggregations, window functions, string manipulation, reporting queries.
- Statistics: hypothesis testing, Type I and Type II errors, sampling methods, mean, median, standard deviation, correlation, covariance, box plots.
- Probability: conditional probability, normal and Poisson distributions, expected value.
- Math reasoning: counting, permutations, combinations, analytical reasoning.
- Python: OOP, classes, inheritance, exceptions, string manipulation, functions, lambdas.
- The guide stresses tie-breaking rules, edge cases, and output format, so test those.

## What to build
A static single-page site deployed on GitHub Pages. No backend, no build step. Keep it simple: index.html plus a separate questions file if that makes editing easier.

Test flow:
- Start screen showing the format and a Start button.
- Each attempt draws 14 questions from a larger bank in the section counts above, preferring questions I've seen least (track seen counts in localStorage). Save in-progress attempts in localStorage so a refresh doesn't lose answers.
- Navigate freely between questions. Submit button with an in-page confirmation dialog. Don't use browser alert(), confirm(), or prompt(). Auto-submit when time runs out.

Look and feel: make it look like the HackerRank test interface. Dark narrow sidebar on the left with numbered question circles (filled when answered), problem statement on the left half, answer area on the right half, timer in the top bar, green primary buttons, white panels on light gray, Open Sans for UI and Source Code Pro for code. Multiple choice uses radio-style options. Coding questions use a dark code editor with line numbers and a language label. Must work cleanly on a 1280px laptop screen and stack properly on narrow windows with nothing overlapping. Include dark mode.

Run code button (also Ctrl/Cmd + Enter) on both coding questions:
- SQL: run my query in the browser against that question's sample tables (sql.js is fine). Show my output, the expected output, and pass/fail with a reason (wrong columns, wrong row count, wrong values or order). Compare numbers rounded to 2 decimals. If the engine is SQLite, add MySQL-style YEAR(), MONTH(), DAY(), and DATE_FORMAT() so MySQL habits work.
- Python: run my code in the browser (Pyodide or Brython; recommend one and explain why) and then a list of named sample tests. Show which tests pass and the error message for each failure, plus anything I printed.
- Load libraries from cdnjs or jsdelivr with pinned versions.

Review after submitting (this matters most to me):
- Results page with total score, per-section scores, time used, and a list of every question with its result.
- Clicking any question shows the correct answer, a "How to approach it" box with the steps to recognize and attack that type of problem, and an explanation of why each wrong option is wrong.
- Coding questions show the reference solution, the approach, the common mistakes, and let me mark myself correct or not. Run code still works in review.
- A "Start a new test" button.

## Question bank
Start with at least: 8 SQL intermediate, 20 statistics, 15 SQL basic, 8 Python, 25 applied math. Rules:
- Match an early-career bank HackerRank screen: SQL easy to medium, Python basic but with a real edge case, math and stats conceptual over computational.
- Use banking scenarios where natural: loans, accounts, transactions, branches, fraud, credit scores.
- Every multiple choice question has exactly 4 options and exactly one correct answer. Distractors should be the mistakes people actually make (forgetting a square root, confusing P(A|B) with P(B|A), integer division, ROW_NUMBER dropping ties, LEFT JOIN plus WHERE turning into an inner join, NULL comparisons) and the explanation should name them.
- Every coding question includes a tie-break, NULL, boundary, or empty-input case.
- SQL coding questions show the sample tables in the prompt and specify exact output columns and sort order.
- Python coding questions include a starter stub and 5 or 6 sample tests.
- Cover every prep guide topic, weighted toward: window functions, GROUP BY with HAVING, joins and NULLs, Type I and II errors, box plots, conditional probability and Bayes, Poisson, normal distribution, combinations, OOP with inheritance and custom exceptions.

## Verification (required, every time questions change)
Write a script I can run with one command that:
1. Loads each SQL question's tables into Python sqlite3, runs the reference solution, and prints the output so it can be checked against the prompt.
2. Runs each Python reference solution against its sample tests in CPython (all must pass), then runs the starter stub against the tests (they should fail, proving the tests test something).
3. Checks every multiple choice question has 4 options, a valid answer index, a unique id, and all required fields.
4. Checks each section has enough questions to fill a test.
Also independently recompute every numeric multiple choice answer yourself and confirm no distractor is also correct. Explain how the script works the first time you run it.

## Deployment
Set up git, create a public GitHub repo called ds-practice on my account, push, and walk me through enabling GitHub Pages (deploy from main, root). It should end up at https://joshuam0y.github.io/ds-practice/. Add a short README.

## Order of work
1. Plan the file structure and tell me briefly.
2. Build the app with a small starter bank (a few per section) and get Run code working for SQL and Python.
3. Write the verification script and run it.
4. Deploy and confirm the live site works.
5. Grow the bank to the target size in batches of about 10, running verification after each batch and telling me what you added.

After that, if there's time: weak-area tracking across attempts, a single-section drill mode, a "review missed questions" mode, and keyboard shortcuts (1 to 4 to pick an option, Enter for next).

## Done means
Verification passes, the page loads with no console errors, I can start, answer, submit, and review a full attempt, Run code works for both languages, and you've told me in a few sentences what changed and what to test by hand.
