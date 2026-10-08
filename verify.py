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
5. Question generators (generators.js): runs tools/check_generators.mjs with Node, which builds hundreds
   of questions from every template and re-derives each answer independently.
It also rejects em dashes and en dashes anywhere in the bank.

Exits with status 1 if anything is wrong.
"""
import json
import math
import re
import shutil
import sqlite3
import subprocess
import sys
from datetime import date
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = ["sql_intermediate", "statistics", "sql_basic", "python", "applied_math", "python_problems", "pandas", "machine_learning",
         "numpy", "ab_testing", "data_engineering"]
# Extra practice sections (not in the full test) need enough for one skill test: 2 coding or 10 multiple choice
PER_TEST = {"sqlint": 1, "stats": 4, "sqlbasic": 3, "python": 1, "math": 5, "algo": 2, "pandas": 2, "ml": 10, "numpy": 2, "ab": 10, "de": 9}
TARGET = {"sqlint": 8, "stats": 20, "sqlbasic": 15, "python": 8, "math": 25, "algo": 12, "pandas": 8, "ml": 15, "numpy": 8, "ab": 15, "de": 15}
NAMES = {"sqlint": "SQL (Intermediate)", "stats": "Statistics", "sqlbasic": "SQL (Basic)", "python": "Python (Basic)", "math": "Applied Math",
         "algo": "Python (Problem Solving)", "pandas": "pandas", "ml": "Machine Learning", "numpy": "NumPy", "ab": "A/B Testing & Product",
         "de": "Data Engineering"}
TYPE_FOR = {"sqlint": {"sql"}, "python": {"python"}, "stats": {"mcq", "multi"}, "sqlbasic": {"mcq", "multi"}, "math": {"mcq", "multi"},
            "algo": {"python"}, "pandas": {"python"}, "ml": {"mcq", "multi"}, "numpy": {"python"}, "ab": {"mcq", "multi"},
            "de": {"mcq", "multi", "python"}}
PREFIX = "window.BANK = (window.BANK || []).concat("
BAD_DASHES = {"\u2014": "em dash", "\u2013": "en dash"}

problems = []
SKIPPED = []   # questions that need a package (like pandas) that isn't installed here


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


def mysql_group_concat(sql):
    """MySQL's GROUP_CONCAT(expr ORDER BY ... SEPARATOR 's') -> SQLite's group_concat(expr, 's' ORDER BY ...).
    Same rewrite as runner.js, so reference solutions can be written the MySQL way."""
    out, i, low = [], 0, sql.lower()
    while True:
        j = low.find("group_concat(", i)
        if j < 0:
            out.append(sql[i:])
            return "".join(out)
        k, depth, quote = j + len("group_concat("), 1, None
        while k < len(sql) and depth:
            ch = sql[k]
            if quote:
                if ch == quote:
                    quote = None
            elif ch in "'\"":
                quote = ch
            elif ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
            k += 1
        body = sql[j + len("group_concat("):k - 1]
        out.append(sql[i:j] + "group_concat(" + _rewrite_gc_body(body) + ")")
        i = k


def _top_level(body, word):
    """Index of a keyword outside quotes and parentheses, or -1."""
    depth, quote, low = 0, None, body.lower()
    for n, ch in enumerate(body):
        if quote:
            if ch == quote:
                quote = None
            continue
        if ch in "'\"":
            quote = ch
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif depth == 0 and low.startswith(word, n) and (not word[0].isalnum() or n == 0 or not (low[n - 1].isalnum() or low[n - 1] == "_")):
            return n
    return -1


def _rewrite_gc_body(body):
    sep_at = _top_level(body, "separator")
    sep = "','"
    if sep_at >= 0:
        sep = body[sep_at + len("separator"):].strip()
        body = body[:sep_at]
    order_at = _top_level(body, "order by")
    expr, order = (body[:order_at], body[order_at:]) if order_at >= 0 else (body, "")
    if sep_at < 0 and (not order or _top_level(expr, ",") >= 0):
        return body  # already SQLite style
    return f"{expr.strip()}, {sep}" + (f" {order.strip()}" if order else "")


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
    "multi": ["options", "answers", "explanations"],
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
        elif q.get("type") not in TYPE_FOR[sec]:
            problem(where, f"type '{q.get('type')}' does not fit section '{sec}' (expected one of {sorted(TYPE_FOR[sec])})")
        if q.get("type") == "multi":
            opts = q.get("options", [])
            if not 4 <= len(opts) <= 7 or len(set(map(str.strip, opts))) != len(opts):
                problem(where, f"multi-select needs 4 to 7 distinct options, has {len(opts)}")
            answers = q.get("answers", [])
            if not answers or len(set(answers)) != len(answers) or not all(isinstance(a, int) and 0 <= a < len(opts) for a in answers):
                problem(where, f"answers {answers!r} must be distinct valid option indexes, at least one")
            exps = q.get("explanations", [])
            if len(exps) != len(opts):
                problem(where, "needs one explanation per option")
            else:
                for i, e in enumerate(exps):
                    if (i in answers) != e.startswith("Correct"):
                        problem(where, f"option {i + 1}: explanations must start with 'Correct' exactly for the options that should be selected")
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


def check_difficulty(bank):
    for q in bank:
        if "difficulty" in q and q["difficulty"] not in ("Easy", "Medium", "Hard"):
            problem(q.get("id", "?"), f"difficulty must be Easy, Medium or Hard, not {q['difficulty']!r}")


def check_sql(q):
    where = q["id"]
    print(f"\n[SQL] {q['id']}: {q['title']}")
    try:
        db = connect(q)
        cur = db.execute(mysql_group_concat(text(q["solution"])))
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


def check_truth(q):
    """Multi-select: each option's claim is evaluated independently and must match the answer set."""
    where = q["id"]
    try:
        truths = [bool(eval(expr, dict(SAFE))) for expr in q["check"]["truth"]]
    except Exception as e:
        problem(where, f"truth check does not evaluate: {e}")
        return None
    expected = [i for i, t in enumerate(truths) if t]
    if sorted(q["answers"]) != expected:
        problem(where, f"truth check says options {expected} are true, but the answers are {sorted(q['answers'])}")
    return expected


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


def normalize_row(row):
    return [round(v, 2) if isinstance(v, (int, float)) and not isinstance(v, bool) else v for v in row]


def check_generated_code(node, run_tests, per_template=60):
    """Each generated coding question has expected output computed in JavaScript and a reference solution in
    Python or SQL. Run the reference here and require it to match, for many instances of every template."""
    run = subprocess.run([node, str(ROOT / "tools" / "dump_code.mjs"), str(per_template)], capture_output=True, text=True)
    if run.returncode != 0:
        problem("generators_code.js", f"could not build coding questions: {run.stderr.strip()[:300]}")
        return
    questions = json.loads(run.stdout)
    counts = {}
    for q in questions:
        key = q["generated"]
        where = f"{key} ({q['id']})"
        counts[key] = counts.get(key, 0) + 1
        for ch, label in BAD_DASHES.items():
            if ch in json.dumps(q, ensure_ascii=False):
                problem(where, f"contains an {label}")
        if q["type"] == "python":
            if len(q["tests"]) not in (5, 6):
                problem(where, f"has {len(q['tests'])} tests")
            ref = json.loads(run_tests(text(q["solution"]), json.dumps(q["tests"])))
            bad = [t for t in ref["tests"] if not t["pass"]]
            if ref["error"] or bad:
                problem(where, f"reference solution fails: {ref['error'] or bad[0]['name'] + ': ' + bad[0]['message']}")
            stub = json.loads(run_tests(text(q["starter"]), json.dumps(q["tests"])))
            if any(t["pass"] for t in stub["tests"]):
                problem(where, "starter stub passes a test")
        else:
            try:
                db = connect(q)
                cur = db.execute(mysql_group_concat(text(q["solution"])))
                columns = [d[0] for d in cur.description]
                rows = [normalize_row(list(r)) for r in cur.fetchall()]
            except sqlite3.Error as e:
                problem(where, f"reference SQL fails: {e}")
                continue
            want = [normalize_row(r) for r in q["expected"]["rows"]]
            if columns != q["expected"]["columns"]:
                problem(where, f"columns {columns} differ from expected {q['expected']['columns']}")
            if rows != want:
                problem(where, f"reference SQL returned {rows[:4]}... but the generator expected {want[:4]}...")
            prompt = text(q["prompt"])
            for c in columns:
                if f"`{c}`" not in prompt:
                    problem(where, f"output column '{c}' is not named in the prompt")
    for key, n in sorted(counts.items()):
        print(f"  {key:<28} {n} generated, reference solution checked against independent expected output")


def _importable(module):
    try:
        __import__(module)
        return True
    except ImportError:
        return False


def main():
    bank = load_bank()
    check_structure(bank)
    check_difficulty(bank)
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
    for q in by_section["python"] + by_section["algo"] + by_section["pandas"] + by_section["numpy"] + [q for q in by_section["de"] if q.get("type") == "python"]:
        if q.get("tests") and q.get("solution"):
            if q.get("packages") and not all(_importable(m) for m in q["packages"]):
                SKIPPED.append(q["id"])
                print(f"\n[Python] {q['id']}: SKIPPED, needs {' and '.join(q['packages'])} (pip install {' '.join(q['packages'])})")
                continue
            check_python(q, run_tests)

    print("\n" + "=" * 70)
    print("3. Multiple choice: structure and recomputed numeric answers")
    print("=" * 70)
    mcqs = [q for q in bank if q.get("type") == "mcq"]
    multis = [q for q in bank if q.get("type") == "multi"]
    for q in multis:
        if "check" in q and "truth" in q["check"]:
            got = check_truth(q)
            if got is not None:
                print(f"  {q['id']}: truth check -> options {[i + 1 for i in got]} are true")
    print(f"  {len(multis)} multi-select questions, {sum('check' in q for q in multis)} with every option checked")
    checked = 0
    for q in mcqs:
        if "check" in q:
            target = check_numeric(q)
            if target is not None:
                checked += 1
                print(f"  {q['id']}: recomputed {target:.6g} -> option {q['answer'] + 1} ({q['options'][q['answer']]})")
    print(f"  {len(mcqs)} multiple choice questions, {checked} with numeric answers recomputed")
    # The correct option shouldn't sit in the same position so often that guessing it pays off
    for s in ("stats", "sqlbasic", "math", "ml", "ab", "de"):
        positions = [q["answer"] for q in by_section[s] if isinstance(q.get("answer"), int)]
        if not positions:
            continue
        counts = [positions.count(i) for i in range(4)]
        limit = math.ceil(len(positions) / 4) + 1
        print(f"  {NAMES[s]}: correct answer positions A-D = {counts}")
        if min(counts) == 0 or max(counts) > limit:
            problem(NAMES[s], f"correct answers are unevenly spread across positions {counts} (each should be used, at most {limit})")

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

    print("\n" + "=" * 70)
    print("5. Question generators")
    print("=" * 70)
    node = shutil.which("node")
    if not node:
        print("  Node.js not found, so the generators were not checked. Install Node to check them.")
    else:
        run = subprocess.run([node, str(ROOT / "tools" / "check_generators.mjs")], capture_output=True, text=True)
        print("  " + (run.stdout + run.stderr).strip().replace("\n", "\n  "))
        if run.returncode != 0:
            problem("generators.js", "the generator check failed (see above)")

    print("\n" + "=" * 70)
    print("6. Generated coding questions (Python and SQL)")
    print("=" * 70)
    if node:
        check_generated_code(node, run_tests)

    print()
    if problems:
        print(f"FAILED: {len(problems)} problem(s)")
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    if SKIPPED:
        print(f"ALL CHECKS PASSED, except {len(SKIPPED)} question(s) skipped because pandas or numpy isn't installed here: pip install pandas numpy")
    else:
        print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
