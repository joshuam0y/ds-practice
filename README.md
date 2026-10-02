# DS Practice

A timed practice test for a Data Science Intern HackerRank assessment: 14 questions in 75 minutes across SQL,
statistics, Python and applied math. It runs entirely in the browser.

**Live:** https://joshuam0y.github.io/ds-practice/

## What it does

- Draws 14 questions per attempt (1 SQL query, 4 statistics, 3 SQL basics, 1 Python, 5 applied math), preferring
  questions you've seen least.
- One 75 minute timer, free navigation, auto-submit at zero. Progress survives a refresh.
- **Run code** (or Ctrl/Cmd + Enter) on both coding questions:
  - SQL runs on [sql.js](https://github.com/sql-js/sql.js) (SQLite), with MySQL-style `YEAR()`, `MONTH()`, `DAY()`,
    `DATE_FORMAT()`, `DATEDIFF()` and `SUBSTRING_INDEX()` added.
  - Python runs on [Pyodide](https://pyodide.org) (real CPython 3.12) in a background worker. Some questions use
    HackerRank's own format: a stub that reads stdin under `if __name__ == '__main__':`, graded on printed output
    (or the `OUTPUT_PATH` file) line by line.
- The test screen follows HackerRank's layout: timer pill, Save & Proceed, numbered sidebar by section, bookmarks,
  Input Format and Sample Input/Output for SQL, and a Test Results drawer under the editor.
- Untimed practice: drill a single section, or retry every question you've missed before. The start page tracks
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
