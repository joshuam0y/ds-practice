# DS Practice

A timed practice test for a Data Science Intern HackerRank assessment: 14 questions in 75 minutes across SQL,
statistics, Python and applied math. It runs entirely in the browser.

**Live:** https://joshuam0y.github.io/ds-practice/

## What it does

- **Full assessment:** the 14-question, 75-minute simulation of the real HackerRank screen.
- **Skill tests:** timed tests on one subject, like HackerRank's skill tests: SQL (2 queries + 6 multiple choice, 45 min),
  Python (45 min), Statistics and Applied Math (10 questions, 25 min), Problem Solving (2 coding, 45 min), pandas
  (2 coding, 30 min) and Machine Learning (10 questions, 20 min).
- **Role assessments:** timed tests shaped like each role's screen: Data Scientist, Data Analyst (SQL heavy, A/B
  testing, pandas), Data Engineer (SQL, data modeling and pipelines, Python, 90 min) and Data Scientist with an ML focus.
- **Difficulty:** every question is Easy, Medium or Hard. Pick a level for role assessments, skill tests, drills and
  topic practice (timed tests top up from other levels if one runs short).
- **More sections:** NumPy coding, A/B Testing & Product (metrics, power, peeking, SRM, Simpson's paradox, CUPED),
  Data Engineering (modeling, indexes, SCDs, idempotent pipelines, plus Python tasks like parsing logs and validating
  batches), and Problem Solving now covers trees, graphs, heaps and dynamic programming too.
- **Practice by topic:** pick one topic (window functions, Poisson, decorators, ...) for an untimed drill with hints.
  Topics with generators never run out.
- **Extra sections beyond the assessment**, at LeetCode/NeetCode difficulty: Python Problem Solving (the core NeetCode
  patterns: hashing, two pointers, sliding window, stack, binary search, intervals, Kadane), pandas (real pandas in the
  browser through Pyodide: filtering, groupby, merge, pivot tables, duplicates, ranking, missing values) and Machine
  Learning concepts (overfitting, cross-validation, leakage, scaling, precision/recall, ROC AUC, scikit-learn workflow).
  These are an extension of HackerRank, LeetCode and NeetCode practice, not a replacement.

- **Unlimited questions in every section:** besides the written bank, 52 generators build a fresh question every time.
  - `generators.js`: 22 single-answer and 4 multi-select templates for statistics, applied math and SQL basics.
    `tools/check_generators.mjs` builds 10,400 and re-derives every answer independently (brute force where possible).
  - `generators_code.js` and `generators_more.js`: 14 Python and 12 SQL coding templates with new rules, tables and test cases each time. Each
    computes expected output in JavaScript and ships a separate Python or SQL reference solution; verify.py runs 1,560
    of them through real Python and SQLite and requires the two to agree.
- **Multi-select** ("Pick ONE or MORE options") questions, scored all or nothing.
- **Coaching on failed runs:** tips that name the likely mistake (an extra None line, print vs return, spacing,
  2-decimal formatting, aggregates in WHERE, an INNER JOIN that should be LEFT, and more).
- Python questions include line-by-line walkthroughs of the reference solution, and coding questions are labeled Easy or
  Medium to match the real test's range.
- Draws 14 questions per attempt (1 SQL query, 4 statistics, 3 SQL basics, 1 Python, 5 applied math), preferring
  questions you've seen least.
- One 75 minute timer, free navigation, auto-submit at zero. Progress survives a refresh. A practice-only Pause
  stops the timer and hides the questions until you resume (paused time is not counted).
- **Run code** (or Ctrl/Cmd + Enter) on both coding questions:
  - SQL runs on [sql.js](https://github.com/sql-js/sql.js) (SQLite), with MySQL-style `YEAR()`, `MONTH()`, `DAY()`,
    `DATE_FORMAT()`, `DATEDIFF()` and `SUBSTRING_INDEX()` added.
  - Python runs on [Pyodide](https://pyodide.org) (real CPython 3.12) in a background worker; questions that list `packages` (pandas) load them on first use. Some questions use
    HackerRank's own format: a stub that reads stdin under `if __name__ == '__main__':`, graded on printed output
    (or the `OUTPUT_PATH` file) line by line.
- The test screen follows HackerRank's layout: timer pill, Save & Proceed, numbered sidebar by section, bookmarks,
  Input Format and Sample Input/Output for SQL, and a Test Results drawer under the editor.
- Untimed practice: drill a single section (with step-by-step hints), or retry every question you've missed before. The start page tracks
  weak areas by section and topic across attempts.
- Keyboard: 1 to 4 picks an option, Enter goes to the next question.
- Results by section, then a review of every question: the correct answer, how to approach it, and why each wrong
  option is wrong. Coding questions show a reference solution and common mistakes, and you can mark yourself.

## Files

| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `runner.js` | Runs SQL and Python; holds the Python test harness |
| `questions/*.js` | The question bank, one file per section (JSON inside a one-line wrapper) |
| `generators.js` | Templates for endless multiple choice and multi-select questions |
| `generators_code.js` | Templates for endless SQL and Python coding questions |
| `tools/dump_code.mjs` | Builds coding questions for verify.py to run in Python and SQLite |
| `tools/check_generators.mjs` | Independent check of the generators (run by verify.py) |
| `verify.py` | Checks the whole bank |

## Running locally

Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000`.

## Checking the question bank

```sh
python3 verify.py
```

It runs every SQL reference solution in sqlite3 and prints the output, runs every Python reference solution and
starter stub against the sample tests, recomputes numeric multiple choice answers, and checks structure and section
sizes. Run it after any change to `questions/`.

## Checking the bank

`python3 verify.py` checks everything. The pandas questions need pandas installed locally (`pip install pandas`); without it they're skipped with a note.
