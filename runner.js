'use strict'
// Runs answers to the coding questions:
//   SQL through sql.js (SQLite in WebAssembly), in the page.
//   Python through Pyodide (CPython in WebAssembly), in a background worker so a slow or looping
//   answer can't freeze the page.
// verify.py reads PY_HARNESS out of this file, so the browser and the verifier grade Python the same way.

const SQLJS_VERSION = '1.12.0'
const PYODIDE_VERSION = '0.27.2'
const PY_TIME_LIMIT_MS = 8000

// Python that runs a submission against a question's sample tests and reports the results as JSON.
// Two kinds of test:
//   Function tests: {name, setup?, expr, expect} (expr must equal expect) or {name, setup?, expr, raises}.
//     Every test gets a fresh copy of the submission.
//   Program tests, the way HackerRank grades: {name, stdin, stdout}. The whole file runs as __main__ with
//     stdin fed in and OUTPUT_PATH pointing at a file. What the program writes to that file (or, if it
//     writes nothing there, what it prints) must match stdout, ignoring trailing spaces and blank lines.
const PY_HARNESS = String.raw`
import contextlib
import io
import json
import math
import os
import sys
import tempfile


def _short(e):
    text = str(e)
    return f"{type(e).__name__}: {text}" if text else type(e).__name__


def _same(a, b):
    # Floats compare with a small tolerance; booleans and None must match exactly
    if isinstance(a, bool) or isinstance(b, bool) or a is None or b is None:
        return type(a) is type(b) and a == b
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
        except TypeError:
            return False
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return type(a) is type(b) and len(a) == len(b) and all(_same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_same(a[k], b[k]) for k in a)
    return a == b


def _load(code, out):
    namespace = {"__name__": "__main__"}
    with contextlib.redirect_stdout(out):
        exec(compile(code, "solution.py", "exec"), namespace)
    return namespace


def _lines(text):
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]
    while lines and not lines[-1]:
        lines.pop()
    return lines


def _program(code, stdin_text):
    path = os.path.join(tempfile.gettempdir(), "hackerrank_output.txt")
    open(path, "w").close()
    printed = io.StringIO()
    old_stdin, old_path = sys.stdin, os.environ.get("OUTPUT_PATH")
    sys.stdin = io.StringIO(stdin_text)
    os.environ["OUTPUT_PATH"] = path
    error = None
    try:
        with contextlib.redirect_stdout(printed):
            exec(compile(code, "solution.py", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException as e:
        error = e
    finally:
        sys.stdin = old_stdin
        if old_path is None:
            os.environ.pop("OUTPUT_PATH", None)
        else:
            os.environ["OUTPUT_PATH"] = old_path
    with open(path) as f:
        written = f.read()
    return printed.getvalue(), written, error


def _run_program_test(code, t):
    printed, written, error = _program(code, t["stdin"])
    graded = written if written.strip() else printed
    result = {"name": t["name"], "pass": False, "message": "", "stdin": t["stdin"], "expected": t["stdout"], "output": graded,
              "debug": printed if written.strip() else ""}
    if error is not None:
        result["message"] = _short(error)
        return result
    got, want = _lines(graded), _lines(t["stdout"])
    if got == want:
        result["pass"] = True
        return result
    for i, (g, w) in enumerate(zip(got, want)):
        if g != w:
            result["message"] = f"Line {i + 1}: expected {w!r}, got {g!r}"
            return result
    result["message"] = f"Expected {len(want)} line(s) of output, got {len(got)}"
    return result


def run_tests(code, tests_json):
    tests = json.loads(tests_json)
    printed = io.StringIO()
    report = {"error": None, "stdout": "", "tests": []}
    program = any("stdin" in t for t in tests)
    try:
        if program:
            compile(code, "solution.py", "exec")
        else:
            _load(code, printed)
    except BaseException as e:
        report["error"] = _short(e)
        report["stdout"] = printed.getvalue()
        report["tests"] = [{"name": t["name"], "pass": False, "message": "Your code did not run, so this test could not run."} for t in tests]
        return json.dumps(report)

    for t in tests:
        if "stdin" in t:
            report["tests"].append(_run_program_test(code, t))
            continue
        result = {"name": t["name"], "pass": False, "message": ""}
        during = io.StringIO()
        try:
            env = _load(code, io.StringIO())
            with contextlib.redirect_stdout(during):
                if t.get("setup"):
                    exec(t["setup"], env)
                if "raises" in t:
                    try:
                        exec(t["expr"], env)
                    except BaseException as e:
                        names = [c.__name__ for c in type(e).__mro__]
                        if t["raises"] in names:
                            result["pass"] = True
                        else:
                            result["message"] = f"Expected {t['raises']}, but got {_short(e)}"
                    else:
                        result["message"] = f"Expected {t['raises']} to be raised, but nothing was raised."
                else:
                    got = eval(t["expr"], env)
                    want = eval(t["expect"], env)
                    if _same(got, want):
                        result["pass"] = True
                    else:
                        result["message"] = f"Expected {want!r}, got {got!r}"
        except BaseException as e:
            result["message"] = _short(e)
        if during.getvalue():
            printed.write(f"--- printed during '{t['name']}' ---\n{during.getvalue()}")
        report["tests"].append(result)

    report["stdout"] = printed.getvalue()
    return json.dumps(report)
`

const Runner = (() => {
  const lines = (v) => (Array.isArray(v) ? v.join('\n') : v ?? '')

  // ---------- SQL ----------

  let sqlPromise = null
  function loadSql() {
    sqlPromise ??= initSqlJs({ locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VERSION}/${file}` })
    return sqlPromise
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  function parseDate(value) {
    if (value === null || value === undefined) return null
    const m = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
    if (!m) return null
    return { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0) }
  }

  function dateFormat(value, format) {
    const t = parseDate(value)
    if (!t || format === null || format === undefined) return null
    const pad = (n) => String(n).padStart(2, '0')
    const weekday = new Date(Date.UTC(t.y, t.mo - 1, t.d)).getUTCDay()
    const codes = {
      Y: t.y, y: pad(t.y % 100), m: pad(t.mo), c: t.mo, d: pad(t.d), e: t.d,
      M: MONTHS[t.mo - 1], b: MONTHS[t.mo - 1].slice(0, 3), W: DAYS[weekday], a: DAYS[weekday].slice(0, 3),
      H: pad(t.h), i: pad(t.mi), s: pad(t.s), S: pad(t.s), '%': '%',
    }
    return String(format).replace(/%(.)/g, (whole, code) => (code in codes ? String(codes[code]) : whole))
  }

  // MySQL SUBSTRING_INDEX(s, delim, n): text before the nth delimiter (n > 0) or after the nth from the end (n < 0)
  function substringIndex(s, delim, n) {
    if (s === null || delim === null || n === null) return null
    if (delim === '' || n === 0) return ''
    const parts = String(s).split(String(delim))
    return (n > 0 ? parts.slice(0, n) : parts.slice(n)).join(String(delim))
  }

  // MySQL habits on SQLite: YEAR(), MONTH(), DAY(), DATE_FORMAT(), DATEDIFF() and SUBSTRING_INDEX()
  function addMysqlFunctions(db) {
    db.create_function('YEAR', (v) => parseDate(v)?.y ?? null)
    db.create_function('MONTH', (v) => parseDate(v)?.mo ?? null)
    db.create_function('DAY', (v) => parseDate(v)?.d ?? null)
    db.create_function('DATE_FORMAT', (v, f) => dateFormat(v, f))
    db.create_function('SUBSTRING_INDEX', (s, d, n) => substringIndex(s, d, n))
    db.create_function('DATEDIFF', (a, b) => {
      const x = parseDate(a)
      const y = parseDate(b)
      if (!x || !y) return null
      return Math.round((Date.UTC(x.y, x.mo - 1, x.d) - Date.UTC(y.y, y.mo - 1, y.d)) / 86400000)
    })
  }

  function buildDb(SQL, question) {
    const db = new SQL.Database()
    addMysqlFunctions(db)
    for (const table of question.tables) {
      db.run(`CREATE TABLE ${table.name} (${table.columns.map(([name, type]) => `${name} ${type}`).join(', ')})`)
      const insert = db.prepare(`INSERT INTO ${table.name} VALUES (${table.columns.map(() => '?').join(', ')})`)
      for (const row of table.rows) insert.run(row)
      insert.free()
    }
    return db
  }

  // Runs every statement and keeps the last result set, the way a query editor shows the final SELECT
  function runOn(SQL, question, sql) {
    const db = buildDb(SQL, question)
    try {
      const results = db.exec(sql)
      const last = results[results.length - 1]
      return last ? { columns: last.columns, rows: last.values } : { columns: [], rows: [] }
    } finally {
      db.close()
    }
  }

  // Numbers (and numeric text) compare rounded to 2 decimals; everything else compares as text
  function normalize(v) {
    if (v === null || v === undefined) return null
    if (typeof v === 'number') return Math.round(v * 100) / 100
    if (/^-?\d+(\.\d+)?$/.test(String(v).trim())) return Math.round(Number(v) * 100) / 100
    return String(v)
  }
  const showRow = (row) => `(${row.map((v) => (v === null ? 'NULL' : typeof v === 'string' ? `'${v}'` : String(v))).join(', ')})`

  function compare(got, expected) {
    if (!got.columns.length) {
      return { pass: false, reason: 'Your query returned no rows or columns. Make sure the last statement is a SELECT.' }
    }
    if (got.columns.length !== expected.columns.length) {
      return {
        pass: false,
        reason: `Wrong columns: expected ${expected.columns.length} (${expected.columns.join(', ')}), got ${got.columns.length} (${got.columns.join(', ')}).`,
      }
    }
    const nameNote = got.columns.some((c, i) => c.toLowerCase() !== expected.columns[i].toLowerCase())
      ? ` Your column names differ from the expected ones (${expected.columns.join(', ')}). HackerRank usually compares values only, but match the names the prompt asks for.`
      : ''
    if (got.rows.length !== expected.rows.length) {
      return { pass: false, reason: `Wrong row count: expected ${expected.rows.length}, got ${got.rows.length}.${nameNote}` }
    }
    const key = (row) => JSON.stringify(row.map(normalize))
    const g = got.rows.map(key)
    const e = expected.rows.map(key)
    const first = g.findIndex((k, i) => k !== e[i])
    if (first === -1) return { pass: true, reason: `Output matches.${nameNote}` }
    const sameRows = [...g].sort().join('\n') === [...e].sort().join('\n')
    if (sameRows) {
      return { pass: false, reason: `Right rows, wrong order. Row ${first + 1} should be ${showRow(expected.rows[first])}, but yours is ${showRow(got.rows[first])}. Check ORDER BY and its tie-breaker.${nameNote}` }
    }
    return { pass: false, reason: `Wrong values in row ${first + 1}: expected ${showRow(expected.rows[first])}, got ${showRow(got.rows[first])}.${nameNote}` }
  }

  async function runSql(question, sql) {
    const SQL = await loadSql()
    const expected = runOn(SQL, question, lines(question.solution))
    if (!sql.trim()) return { pass: false, reason: 'Write a query first.', expected }
    let got
    try {
      got = runOn(SQL, question, sql)
    } catch (e) {
      return { pass: false, error: e.message, reason: 'Your query has an error.', expected }
    }
    return { got, expected, ...compare(got, expected) }
  }

  async function expectedSql(question) {
    const SQL = await loadSql()
    return runOn(SQL, question, lines(question.solution))
  }

  // ---------- Python ----------

  const WORKER_SOURCE = `
    importScripts('https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js')
    const ready = loadPyodide().then((py) => { postMessage({ type: 'ready' }); return py })
      .catch((e) => { postMessage({ type: 'failed', error: String(e) }); throw e })
    let harnessLoaded = false
    onmessage = async (event) => {
      const { id, harness, code, tests } = event.data
      try {
        const py = await ready
        if (!harnessLoaded) { py.runPython(harness); harnessLoaded = true }
        const runTests = py.globals.get('run_tests')
        const out = runTests(code, JSON.stringify(tests))
        runTests.destroy()
        postMessage({ type: 'result', id, result: JSON.parse(out) })
      } catch (e) {
        postMessage({ type: 'result', id, error: String(e) })
      }
    }`

  let worker = null
  let workerReady = null
  const pending = new Map()
  let nextId = 1

  function startWorker() {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }))
    worker = new Worker(url)
    workerReady = new Promise((resolve, reject) => {
      worker.addEventListener('message', (event) => {
        const msg = event.data
        if (msg.type === 'ready') resolve()
        else if (msg.type === 'failed') reject(new Error(`Python could not load: ${msg.error}`))
        else if (msg.type === 'result') {
          const job = pending.get(msg.id)
          if (!job) return
          pending.delete(msg.id)
          clearTimeout(job.timer)
          if (msg.error) job.reject(new Error(msg.error))
          else job.resolve(msg.result)
        }
      })
      worker.addEventListener('error', (e) => reject(new Error(`Python could not load: ${e.message || 'network error'}`)))
    })
    workerReady.catch(() => {})
  }

  // Start downloading Python early so the first Run is quick
  function warmPython() {
    if (!worker) startWorker()
    return workerReady
  }

  async function runPython(question, code) {
    warmPython()
    await workerReady
    const id = nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // A loop that never ends: stop this worker and start a fresh one for next time
        pending.delete(id)
        worker.terminate()
        worker = null
        reject(new Error(`Your code ran for more than ${PY_TIME_LIMIT_MS / 1000} seconds and was stopped. Look for a loop that never ends.`))
      }, PY_TIME_LIMIT_MS)
      pending.set(id, { resolve, reject, timer })
      worker.postMessage({ id, harness: PY_HARNESS, code, tests: question.tests })
    })
  }

  const pythonState = () => (!worker ? 'idle' : 'started')

  return { loadSql, runSql, expectedSql, warmPython, runPython, pythonState, compare, dateFormat }
})()
