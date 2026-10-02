#!/usr/bin/env python3
"""Check the whole question bank. Run from the project folder:  python3 verify.py

1. SQL coding questions: loads each question's sample tables into sqlite3, runs the reference
   solution, and prints the output so it can be compared with the prompt.
2. Python coding questions: runs the reference solution against its sample tests (all must pass),
   then the starter stub (every test should fail). It uses the same test harness the browser uses,
   read straight out of runner.js.
3. Multiple choice: 4 distinct options, a valid answer index, an explanation per option, required
   fields, unique ids. Questions with a "check" block are recomputed independently, and exactly one
   option may match the recomputed answer.
4. Every section has enough questions to fill a test.
It also rejects em dashes and en dashes anywhere in the bank.

Exits with status 1 if anything is wrong.
"""
import json
import math
import re
import sqlite3
import sys
from datetime import date
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = ["sql_intermediate", "statistics", "sql_basic", "python", "applied_math"]
PER_TEST = {"sqlint": 1, "stats": 4, "sqlbasic": 3, "python": 1, "math": 5}
TARGET = {"sqlint": 8, "stats": 20, "sqlbasic": 15, "python": 8, "math": 25}
NAMES = {"sqlint": "SQL (Intermediate)", "stats": "Statistics", "sqlbasic": "SQL (Basic)", "python": "Python (Basic)", "math": "Applied Math"}
TYPE_FOR = {"sqlint": "sql", "python": "python", "stats": "mcq", "sqlbasic": "mcq", "math": "mcq"}
PREFIX = "window.BANK = (window.BANK || []).concat("
BAD_DASHES = {"\u2014": "em dash", "\u2013": "en dash"}

problems = []


def problem(where, message):
    problems.append(f"{where}: {message}")


def text(v):
    return "\n".join(v) if isinstance(v, list) else (v or "")


# ---------- Loading ----------

def load_bank():
    bank = []
    for name in FILES:
        path = ROOT / "questions" / f"{name}.js"
        raw = path.read_text(encoding="utf-8")
        for ch, label in BAD_DASHES.items():
            for lineno, line in enumerate(raw.splitlines(), 1):
                if ch in line:
                    problem(f"{path.name}:{lineno}", f"contains an {label}")
        first, _, rest = raw.partition("\n")
        if first.strip() != PREFIX:
            problem(path.name, f"first line must be exactly: {PREFIX}")
            continue
        body = rest.rstrip()
        if not body.endswith(");"):
            problem(path.name, "must end with );")
            continue
        try:
            items = json.loads(body[:-2])
        except json.JSONDecodeError as e:
            problem(path.name, f"is not valid JSON: {e}")
            continue
        for q in items:
            q["_file"] = path.name
        bank.extend(items)
    return bank


# ---------- MySQL-style functions, matching runner.js ----------

MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DATE_RE = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?")


def parse_date(v):
    if v is None:
        return None
    m = DATE_RE.match(str(v))
    if not m:
        return None
    return [int(g or 0) for g in m.groups()]


def date_format(v, fmt):
    t = parse_date(v)
    if t is None or fmt is None:
        return None
    y, mo, d, h, mi, s = t
    weekday = DAYS[date(y, mo, d).weekday()]
    codes = {"Y": y, "y": f"{y % 100:02d}", "m": f"{mo:02d}", "c": mo, "d": f"{d:02d}", "e": d, "M": MONTHS[mo - 1],
             "b": MONTHS[mo - 1][:3], "W": weekday, "a": weekday[:3], "H": f"{h:02d}", "i": f"{mi:02d}", "s": f"{s:02d}",
             "S": f"{s:02d}", "%": "%"}
    return re.sub(r"%(.)", lambda m: str(codes[m.group(1)]) if m.group(1) in codes else m.group(0), str(fmt))


def datediff(a, b):
    x, y = parse_date(a), parse_date(b)
    if x is None or y is None:
        return None
    return (date(*x[:3]) - date(*y[:3])).days


def substring_index(s, delim, n):
    if s is None or delim is None or n is None:
        return None
    if delim == "" or n == 0:
        return ""
    parts = str(s).split(str(delim))
    return str(delim).join(parts[:n] if n > 0 else parts[n:])


def connect(question):
    db = sqlite3.connect(":memory:")
    db.create_function("YEAR", 1, lambda v: (parse_date(v) or [None])[0])
    db.create_function("MONTH", 1, lambda v: (parse_date(v) or [None, None])[1])
    db.create_function("DAY", 1, lambda v: (parse_date(v) or [None, None, None])[2])
    db.create_function("DATE_FORMAT", 2, date_format)
    db.create_function("DATEDIFF", 2, datediff)
    db.create_function("SUBSTRING_INDEX", 3, substring_index)
    for t in question["tables"]:
        cols = ", ".join(f"{n} {ty}" for n, ty in t["columns"])
        db.execute(f"CREATE TABLE {t['name']} ({cols})")
        marks = ", ".join("?" for _ in t["columns"])
        for row in t["rows"]:
            if len(row) != len(t["columns"]):
                problem(question["id"], f"table {t['name']} has a row with {len(row)} values for {len(t['columns'])} columns: {row}")
                continue
            db.execute(f"INSERT INTO {t['name']} VALUES ({marks})", row)
    return db


def show_table(columns, rows):
    cells = [[("NULL" if v is None else str(round(v, 4)) if isinstance(v, float) else str(v)) for v in r] for r in rows]
    widths = [max([len(c)] + [len(r[i]) for r in cells]) for i, c in enumerate(columns)]
    line = lambda vals: "  | " + " | ".join(v.ljust(w) for v, w in zip(vals, widths)) + " |"
    out = [line(columns), "  |" + "|".join("-" * (w + 2) for w in widths) + "|"]
    out += [line(r) for r in cells] or ["  (no rows)"]
    return "\n".join(out)


# ---------- Checks ----------

COMMON = ["id", "section", "type", "topic", "title", "prompt", "approach"]
NEEDS = {
    "mcq": ["options", "answer", "explanations"],
    "sql": ["tables", "solution", "starter", "mistakes"],
    "python": ["tests", "solution", "starter", "mistakes"],
}


def check_structure(bank):
    seen = {}
    for q in bank:
        where = f"{q.get('id', '?')} ({q['_file']})"
        for field in COMMON + NEEDS.get(q.get("type"), []):
            if field not in q or q[field] in ("", [], None):
                problem(where, f"missing field '{field}'")
        if q.get("id") in seen:
            problem(where, f"duplicate id (also in {seen[q['id']]})")
        seen[q.get("id")] = q["_file"]
        sec = q.get("section")
        if sec not in PER_TEST:
            problem(where, f"unknown section '{sec}'")
        elif q.get("type") != TYPE_FOR[sec]:
            problem(where, f"type '{q.get('type')}' does not fit section '{sec}' (expected '{TYPE_FOR[sec]}')")
        if q.get("type") == "mcq":
            opts = q.get("options", [])
            if len(opts) != 4:
                problem(where, f"has {len(opts)} options, needs exactly 4")
            if len(set(map(str.strip, opts))) != len(opts):
                problem(where, "has duplicate options")
            ans = q.get("answer")
            if not isinstance(ans, int) or isinstance(ans, bool) or not 0 <= ans < len(opts):
                problem(where, f"answer index {ans!r} is not valid")
            if len(q.get("explanations", [])) != len(opts) or not all(e.strip() for e in q.get("explanations", [])):
                problem(where, "needs one non-empty explanation per option")
            elif isinstance(ans, int) and 0 <= ans < len(opts) and not q["explanations"][ans].startswith("Correct"):
                problem(where, "the correct option's explanation should start with 'Correct'")


def check_sql(q):
    where = q["id"]
    print(f"\n[SQL] {q['id']}: {q['title']}")
    try:
        db = connect(q)
        cur = db.execute(text(q["solution"]))
        columns = [d[0] for d in cur.description]
        rows = cur.fetchall()
    except sqlite3.Error as e:
        problem(where, f"reference solution fails in sqlite3: {e}")
        return
    print(show_table(columns, rows))
    prompt = text(q["prompt"])
    if not rows:
        problem(where, "reference solution returns no rows on the sample data")
    for c in columns:
        if f"`{c}`" not in prompt:
            problem(where, f"output column '{c}' is not named in the prompt")
    if "ORDER BY" not in text(q["solution"]).upper():
        problem(where, "reference solution has no ORDER BY, so row order is undefined")
    if "sort" not in prompt.lower():
        problem(where, "prompt does not state the sort order")


def load_harness():
    source = (ROOT / "runner.js").read_text(encoding="utf-8")
    m = re.search(r"const PY_HARNESS = String\.raw`(.*?)`", source, re.S)
    if not m:
        sys.exit("Could not find PY_HARNESS in runner.js")
    namespace = {}
    exec(m.group(1), namespace)
    return namespace["run_tests"]


def check_python(q, run_tests):
    where = q["id"]
    tests = q["tests"]
    print(f"\n[Python] {q['id']}: {q['title']}  ({len(tests)} tests)")
    if not 5 <= len(tests) <= 6:
        problem(where, f"has {len(tests)} sample tests, needs 5 or 6")
    names = [t["name"] for t in tests]
    if len(set(names)) != len(names):
        problem(where, "has duplicate test names")
    ref = json.loads(run_tests(text(q["solution"]), json.dumps(tests)))
    if ref["error"]:
        problem(where, f"reference solution raised {ref['error']}")
    for t in ref["tests"]:
        print(f"  solution {'PASS' if t['pass'] else 'FAIL'}  {t['name']}{'' if t['pass'] else '  -> ' + t['message']}")
        if not t["pass"]:
            problem(where, f"reference solution fails test '{t['name']}': {t['message']}")
    stub = json.loads(run_tests(text(q["starter"]), json.dumps(tests)))
    passing = [t["name"] for t in stub["tests"] if t["pass"]]
    print(f"  starter stub passes {len(passing)} of {len(tests)} tests (should be 0)")
    if passing:
        problem(where, f"starter stub already passes: {', '.join(passing)}")


SAFE = {"math": math, "Fraction": Fraction, "comb": math.comb, "perm": math.perm, "factorial": math.factorial,
        "sqrt": math.sqrt, "exp": math.exp, "e": math.e, "__builtins__": {"abs": abs, "round": round, "sum": sum, "min": min, "max": max, "float": float, "int": int, "len": len}}


def check_numeric(q):
    c = q["check"]
    where = q["id"]
    try:
        target = eval(c["compute"], dict(SAFE))
        values = [eval(v, dict(SAFE)) for v in c["values"]]
    except Exception as e:
        problem(where, f"check block does not evaluate: {e}")
        return None
    if len(values) != len(q["options"]):
        problem(where, "check block needs one value per option")
        return None
    rule = c.get("rule", "equal")
    if rule == "equal":
        hits = [i for i, v in enumerate(values) if math.isclose(float(v), float(target), rel_tol=1e-9, abs_tol=1e-12)]
    elif rule == "only_greater":
        hits = [i for i, v in enumerate(values) if float(v) > float(target)]
    elif rule == "only_less":
        hits = [i for i, v in enumerate(values) if float(v) < float(target)]
    else:
        problem(where, f"unknown check rule '{rule}'")
        return None
    if hits != [q["answer"]]:
        problem(where, f"recomputed answer {float(target):.6g} matches options {hits}, but the answer key is {q['answer']}")
    return float(target)


def main():
    bank = load_bank()
    check_structure(bank)
    by_section = {s: [q for q in bank if q.get("section") == s] for s in PER_TEST}

    print("=" * 70)
    print("1. SQL coding questions: reference output on the sample tables")
    print("=" * 70)
    for q in by_section["sqlint"]:
        if q.get("tables") and q.get("solution"):
            check_sql(q)

    print("\n" + "=" * 70)
    print("2. Python coding questions: reference solution and starter stub")
    print("=" * 70)
    run_tests = load_harness()
    for q in by_section["python"]:
        if q.get("tests") and q.get("solution"):
            check_python(q, run_tests)

    print("\n" + "=" * 70)
    print("3. Multiple choice: structure and recomputed numeric answers")
    print("=" * 70)
    mcqs = [q for q in bank if q.get("type") == "mcq"]
    checked = 0
    for q in mcqs:
        if "check" in q:
            target = check_numeric(q)
            if target is not None:
                checked += 1
                print(f"  {q['id']}: recomputed {target:.6g} -> option {q['answer'] + 1} ({q['options'][q['answer']]})")
    print(f"  {len(mcqs)} multiple choice questions, {checked} with numeric answers recomputed")

    print("\n" + "=" * 70)
    print("4. Section sizes")
    print("=" * 70)
    for s, need in PER_TEST.items():
        have = len(by_section[s])
        flag = "" if have >= need else "  <- NOT ENOUGH FOR A TEST"
        if have < need:
            problem(NAMES[s], f"has {have} questions but a test needs {need}")
        print(f"  {NAMES[s]:<20} {have:>3} in bank  (test uses {need}, target {TARGET[s]}){flag}")
    print(f"  {'Total':<20} {len(bank):>3}")

    print()
    if problems:
        print(f"FAILED: {len(problems)} problem(s)")
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
