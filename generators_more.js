'use strict'
// More coding templates: Python strings, OOP, exceptions, lambdas and windows; SQL window functions, anti-joins and
// reporting queries. Same contract as generators_code.js: expected output is computed here in JavaScript and a separate
// reference solution ships with each question, and verify.py checks the two agree. Load after generators_code.js.

;(function () {
  const api = typeof window !== 'undefined' ? window.GENERATORS : require('./generators.js')
  const T = api.templates

  const pick = (rand, list) => list[Math.floor(rand() * list.length)]
  const between = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  const shuffle = (rand, list) => {
    const a = [...list]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const sample = (rand, list, k) => shuffle(rand, list).slice(0, k)
  const lines = (s) => s.split('\n')
  const HEADER = '#!/bin/python3\n\nimport math\nimport os\nimport random\nimport re\nimport sys\n\n'
  const hr = (comment, signature, main, body) => lines(`${HEADER}${comment}\ndef ${signature}:\n${body || '    # Write your code here\n'}\n${main}`)
  const stdin = (...rows) => `${rows.flat().join('\n')}\n`
  const out = (rows) => (rows.length ? `${rows.join('\n')}\n` : '')
  const fixed2 = (x) => (Math.round(x * 100) / 100).toFixed(2)

  // A JavaScript value written as a Python literal: strings as JSON (valid Python), tuples marked with {tuple: [...]}
  function py(v) {
    if (v === null || v === undefined) return 'None'
    if (v === true) return 'True'
    if (v === false) return 'False'
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(+v.toFixed(10))
    if (typeof v === 'string') return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(py).join(', ')}]`
    if (v.tuple) return `(${v.tuple.map(py).join(', ')}${v.tuple.length === 1 ? ',' : ''})`
    return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(', ')}}`
  }

  // ===================================================================== Python: strings

  T.push({
    key: 'code-py-compress', section: 'python', kind: 'code',
    make(rand) {
      const always = rand() < 0.5
      const compress = (s) => {
        let res = ''
        for (let i = 0; i < s.length; ) {
          let j = i
          while (j < s.length && s[j] === s[i]) j++
          res += s[i] + (always || j - i > 1 ? String(j - i) : '')
          i = j
        }
        return res
      }
      const runs = () => Array.from({ length: between(rand, 2, 5) }, () => pick(rand, ['a', 'b', 'c', 'x', 'y']).repeat(between(rand, 1, 4))).join('')
      const cases = [
        ['Sample case 0', [runs(), runs(), 'abc']],
        ['Single characters', ['a', 'z']],
        ['Empty string', ['']],
        ['A long run needs two digits', ['k'.repeat(between(rand, 10, 15))]],
        ['Alternating characters', ['ababab']],
        ['Upper and lower case differ', ['aAAa', runs()]],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    for _ in range(n):\n        s = input().strip()\n        print(compressRuns(s))\n"
      const tail = always ? 'str(run_len)' : "(str(run_len) if run_len > 1 else '')"
      const body = `    if not s:\n        return ''\n    parts = []\n    run_char, run_len = s[0], 1\n    for ch in s[1:]:\n        if ch == run_char:\n            run_len += 1\n        else:\n            parts.append(run_char + ${tail})\n            run_char, run_len = ch, 1\n    parts.append(run_char + ${tail})\n    return ''.join(parts)\n`
      const rule = always ? 'followed by the length of the run, even when it is 1' : 'followed by the length of the run, but only when the run is longer than 1'
      return {
        type: 'python', difficulty: 'Easy', topic: 'String manipulation: runs (HackerRank style)', title: 'Compress repeated characters',
        prompt: lines(`Complete \`compressRuns(s)\`, which returns \`s\` with every run of the same character written as the character ${rule}. Upper and lower case are different characters. An empty string returns an empty string.\n\nExample: \`aaabcc\` becomes \`${compress('aaabcc')}\`.\n\n**Input format:** n, then n strings. The code that reads input and prints each result is already written.`),
        starter: hr("#\n# Complete the 'compressRuns' function below.\n#\n# The function is expected to return a STRING.\n# The function accepts STRING s as parameter.\n#\n", 'compressRuns(s)', main),
        solution: hr('', 'compressRuns(s)', main, body),
        tests: cases.map(([name, xs]) => ({ name, stdin: stdin(String(xs.length), xs), stdout: out(xs.map(compress)) })),
        approach: [
          'Walk the string once, keeping the current character and how many times in a row it has appeared.',
          'When the character changes, write out the finished run and start a new one.',
          'Write out the last run after the loop: it never sees a "change".',
          'Handle the empty string before reading s[0].',
        ],
        walkthrough: [
          "`if not s: return ''`: s[0] would raise IndexError on an empty string.",
          '`run_char, run_len = s[0], 1`: the first run starts with the first character.',
          '`for ch in s[1:]:`: compare each later character with the current run.',
          `\`parts.append(run_char + ${tail})\`: finish a run when the character changes.`,
          'The final `parts.append(...)` after the loop: the last run is only written here.',
          "`''.join(parts)`: build the string once from a list.",
        ],
        mistakes: [
          'Forgetting to write out the last run after the loop.',
          always ? 'Leaving out counts of 1, when this version always writes the count.' : 'Writing a count of 1 for single characters, when this version leaves it out.',
          'Counting each character in the whole string (Counter) instead of consecutive runs: "aba" has two runs of a.',
          'Crashing on the empty string.',
        ],
        params: { always },
      }
    },
  })

  T.push({
    key: 'code-py-reverse-words', section: 'python', kind: 'code',
    make(rand) {
      const flip = rand() < 0.5
      const fix = (s) => s.split(/\s+/).filter(Boolean).reverse().map((w) => (flip ? [...w].reverse().join('') : w)).join(' ')
      const words = ['pay', 'rent', 'on', 'time', 'save', 'more', 'bank', 'early', 'loan', 'approved']
      const sentence = () => sample(rand, words, between(rand, 2, 5)).join(' '.repeat(between(rand, 1, 2)))
      const cases = [
        ['Sample case 0', [sentence(), sentence()]],
        ['One word', [pick(rand, words)]],
        ['Extra spaces everywhere', [`  ${sentence()}   `]],
        ['Punctuation stays with its word', ['Hello, world!']],
        ['Empty line', ['']],
        ['Random sentences', [sentence(), sentence(), sentence()]],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    for _ in range(n):\n        line = input()\n        print(reverseWords(line))\n"
      const body = flip ? "    return ' '.join(word[::-1] for word in reversed(line.split()))\n" : "    return ' '.join(reversed(line.split()))\n"
      return {
        type: 'python', difficulty: 'Easy', topic: 'String manipulation: split, reverse, join (HackerRank style)', title: flip ? 'Reverse words and letters' : 'Reverse the word order',
        prompt: lines(`Complete \`reverseWords(line)\`, which returns the words of \`line\` in reverse order${flip ? ', with the letters of each word also reversed' : ''}. Words are separated by one or more spaces; the result uses single spaces and no leading or trailing spaces. Punctuation counts as part of the word it touches.\n\nExample: \`"save  more today"\` becomes \`"${fix('save  more today')}"\`.\n\n**Input format:** n, then n lines. The code that reads input and prints each result is already written.`),
        starter: hr("#\n# Complete the 'reverseWords' function below.\n#\n# The function is expected to return a STRING.\n# The function accepts STRING line as parameter.\n#\n", 'reverseWords(line)', main),
        solution: hr('', 'reverseWords(line)', main, body),
        tests: cases.map(([name, xs]) => ({ name, stdin: stdin(String(xs.length), xs), stdout: out(xs.map(fix)) })),
        approach: [
          'split() with no argument splits on any run of whitespace and drops empty pieces, so it handles extra spaces for free.',
          `Reverse the list of words${flip ? ', reverse each word with slicing [::-1]' : ''}, then join with single spaces.`,
          'An empty line gives an empty list, and joining it gives an empty string.',
        ],
        walkthrough: [
          '`line.split()`: "  save  more " becomes ["save", "more"].',
          '`reversed(...)`: iterates the list backwards without copying.',
          flip ? '`word[::-1]`: a slice with step -1 reverses a string.' : "`' '.join(...)`: puts exactly one space between words.",
          flip ? "`' '.join(...)`: exactly one space between words." : 'No strip() is needed: split() already ignored the outer spaces.',
        ],
        mistakes: [
          "split(' '), which creates empty strings from double spaces and keeps extra spaces in the output.",
          flip ? 'Reversing the whole line with line[::-1], which reverses letters and word order together but keeps the spacing wrong.' : 'Reversing the whole string (line[::-1]), which also reverses the letters.',
          'Returning the list instead of a string.',
        ],
        params: { flip },
      }
    },
  })

  T.push({
    key: 'code-py-mask-email', section: 'python', kind: 'code',
    make(rand) {
      const k = pick(rand, [1, 2, 3])
      const mask = (raw) => {
        const s = raw.trim()
        const parts = s.split('@')
        if (parts.length !== 2) return 'INVALID'
        const [local, domain] = parts
        if (!local || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return 'INVALID'
        return `${local.slice(0, k)}***@${domain.toLowerCase()}`
      }
      const name = () => pick(rand, ['ana.chen', 'bo', 'chloe_p', 'd', 'emma.ross92'])
      const dom = () => pick(rand, ['Gmail.com', 'citizensbank.com', 'Yahoo.COM', 'mail.co.uk'])
      const cases = [
        ['Sample case 0', [`${name()}@${dom()}`, `${name()}@${dom()}`, 'no-at-sign.com']],
        ['Short local part', ['d@bank.com', `ab@${dom()}`]],
        ['Two @ signs', ['a@b@bank.com']],
        ['Bad domains', ['ana@bank', 'ana@.bank.com', 'ana@bank.']],
        ['Empty local part and surrounding spaces', ['@bank.com', `  ${name()}@${dom()}  `]],
        ['Random addresses', [`${name()}@${dom()}`, `${name()}@${dom()}`, `${name()}@${dom()}`]],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    for _ in range(n):\n        print(maskEmail(input()))\n"
      const body = `    s = email.strip()\n    if s.count('@') != 1:\n        return 'INVALID'\n    local, domain = s.split('@')\n    if not local or '.' not in domain or domain.startswith('.') or domain.endswith('.'):\n        return 'INVALID'\n    return local[:${k}] + '***@' + domain.lower()\n`
      return {
        type: 'python', difficulty: 'Easy', topic: 'String manipulation: validation and slicing (HackerRank style)', title: 'Mask email addresses',
        prompt: lines(`Complete \`maskEmail(email)\`. Ignore spaces before or after the address. It is valid when it has exactly one \`@\`, a non-empty part before it, and a domain after it that contains a \`.\` but doesn't start or end with one.\n\n- For a valid address, return the first ${k} character${k > 1 ? 's' : ''} of the part before \`@\` (all of it, if shorter), then \`***@\`, then the domain in lower case.\n- Otherwise return \`INVALID\`.\n\nExample: \`Ana.Chen@Gmail.com\` becomes \`${mask('Ana.Chen@Gmail.com')}\`.\n\n**Input format:** n, then n addresses. The input and printing code is already written.`),
        starter: hr("#\n# Complete the 'maskEmail' function below.\n#\n# The function is expected to return a STRING.\n# The function accepts STRING email as parameter.\n#\n", 'maskEmail(email)', main),
        solution: hr('', 'maskEmail(email)', main, body),
        tests: cases.map(([name, xs]) => ({ name, stdin: stdin(String(xs.length), xs), stdout: out(xs.map(mask)) })),
        approach: [
          'Validate first, then build the result. Each rule is one condition.',
          "count('@') == 1 rules out both zero and two @ signs before you split.",
          `Slicing past the end is safe: local[:${k}] on a shorter string just returns the whole string.`,
          'Only the domain is lower-cased; the kept characters stay as typed.',
        ],
        walkthrough: [
          '`s = email.strip()`: the spaces around the address are not part of it.',
          "`if s.count('@') != 1: return 'INVALID'`: split('@') would give the wrong number of parts otherwise.",
          "`local, domain = s.split('@')`: safe to unpack now there is exactly one @.",
          "`'.' not in domain or domain.startswith('.') or domain.endswith('.')`: the three domain rules.",
          `\`local[:${k}] + '***@' + domain.lower()\`: build the masked form.`,
        ],
        mistakes: [
          "Unpacking s.split('@') before checking the count, which raises ValueError on 'a@b@bank.com'.",
          'Lower-casing the whole address, which changes the kept characters.',
          'Forgetting to strip, so addresses with spaces fail or keep the spaces.',
          'Checking only that a dot exists, so "bank." passes.',
        ],
        params: { k },
      }
    },
  })

  // ===================================================================== Python: OOP and exceptions (function tests)

  T.push({
    key: 'code-py-account-classes', section: 'python', kind: 'code',
    make(rand) {
      const F = pick(rand, [5, 10, 12])
      const W = pick(rand, [1000, 1500, 2500])
      const r = pick(rand, [0.01, 0.02, 0.05])
      const round2 = (x) => Math.round(x * 100) / 100
      const checking = (b) => (b >= W ? b : b - F)
      const savings = (b) => (b > 0 ? round2(b + b * r) : b)
      const b1 = pick(rand, [100, 400, 800])
      const b2 = pick(rand, [200, 600, 1000])
      const tests = [
        { name: 'Checking below the waiver pays the fee', expr: `Checking('A', ${W - 1}).month_end()`, expect: py(checking(W - 1)) },
        { name: 'Checking at exactly the waiver pays nothing', expr: `Checking('A', ${W}).month_end()`, expect: py(checking(W)) },
        { name: 'Savings earns interest', expr: `Savings('B', 1000).month_end()`, expect: py(savings(1000)) },
        { name: 'No interest on a negative balance', expr: `Savings('B', -50).month_end()`, expect: py(savings(-50)) },
        { name: 'Base account is unchanged; subclasses inherit', expr: "(issubclass(Checking, Account), Account('C', 7).month_end())", expect: py({ tuple: [true, 7] }) },
        { name: 'Month end for a mix of accounts', expr: `month_end_all([Checking('A', ${b1}), Savings('B', ${b2}), Account('C', 5)])`, expect: py([checking(b1), savings(b2), 5]) },
      ]
      return {
        type: 'python', difficulty: 'Medium', topic: 'OOP: inheritance and method overriding', title: 'Month-end processing for accounts',
        prompt: lines(`Implement three classes and a function.\n\n- **\`Account(owner, balance)\`**: \`month_end()\` leaves the balance unchanged and returns it.\n- **\`Checking(Account)\`**: at month end, a fee of ${F} is subtracted unless the balance is at least ${W}. Return the new balance.\n- **\`Savings(Account)\`**: at month end, if the balance is above 0, add ${r * 100}% interest and round the balance to 2 decimals. Return the new balance.\n- **\`month_end_all(accounts)\`**: run month end on every account and return the list of new balances, in order.`),
        starter: lines('class Account:\n    def __init__(self, owner, balance):\n        pass\n\n    def month_end(self):\n        pass\n\n\nclass Checking(Account):\n    pass\n\n\nclass Savings(Account):\n    pass\n\n\ndef month_end_all(accounts):\n    pass\n'),
        solution: lines(`class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def month_end(self):\n        return self.balance\n\n\nclass Checking(Account):\n    FEE = ${F}\n    WAIVE_AT = ${W}\n\n    def month_end(self):\n        if self.balance < self.WAIVE_AT:\n            self.balance -= self.FEE\n        return self.balance\n\n\nclass Savings(Account):\n    RATE = ${r}\n\n    def month_end(self):\n        if self.balance > 0:\n            self.balance = round(self.balance * (1 + self.RATE), 2)\n        return self.balance\n\n\ndef month_end_all(accounts):\n    return [a.month_end() for a in accounts]\n`),
        tests,
        approach: [
          'Store owner and balance in Account.__init__; subclasses inherit it, so they need no __init__ of their own.',
          'Override month_end in each subclass with that account type\'s rule.',
          `Read the boundaries: "at least ${W}" waives the fee at exactly ${W}; interest only when the balance is above 0.`,
          'month_end_all calls the same method on every object; each object runs its own version (polymorphism).',
        ],
        walkthrough: [
          '`self.owner = owner` and `self.balance = balance`: shared state, set up once in the parent.',
          `\`if self.balance < self.WAIVE_AT: self.balance -= self.FEE\`: < means a balance of exactly ${W} keeps its money.`,
          '`self.balance = round(self.balance * (1 + self.RATE), 2)`: grow by the rate and round once.',
          '`return self.balance`: every month_end returns the new balance, which the tests check.',
          '`[a.month_end() for a in accounts]`: one call per account; Python picks the right subclass method.',
        ],
        mistakes: [
          `Using <= ${W} for the fee, which charges an account sitting exactly at ${W}.`,
          'Forgetting to return the balance from month_end, so the tests see None.',
          'Defining __init__ in a subclass without calling super().__init__, so self.balance never exists.',
          'Paying interest on a negative balance.',
        ],
        params: { F, W, r },
      }
    },
  })

  T.push({
    key: 'code-py-parse-transfer', section: 'python', kind: 'code',
    make(rand) {
      const L = pick(rand, [1000, 5000, 10000])
      const acct = () => pick(rand, ['ACC1', 'ACC2', 'SAV9', 'CHK3', 'B12'])
      const [a, b] = sample(rand, ['ACC1', 'ACC2', 'SAV9', 'CHK3', 'B12'], 2)
      const amt = between(rand, 1, L - 1)
      const tests = [
        { name: 'A valid transfer, spaces around it', expr: `parse_transfer('  ${a}->${b}:${amt}  ')`, expect: py({ tuple: [a, b, amt] }) },
        { name: 'Exactly the limit is allowed', expr: `parse_transfer('${a}->${b}:${L}')`, expect: py({ tuple: [a, b, L] }) },
        { name: 'Over the limit raises TransferError', expr: `parse_transfer('${a}->${b}:${L + 1}')`, raises: 'TransferError' },
        { name: 'Same account raises TransferError', expr: `parse_transfer('${a}->${a}:${amt}')`, raises: 'TransferError' },
        { name: 'Missing amount raises ValueError', expr: `parse_transfer('${a}->${acct()}')`, raises: 'ValueError' },
        { name: 'Zero or non-numeric amount raises ValueError', expr: `[parse_transfer(t) for t in ['${a}->${b}:0', '${a}->${b}:ten']]`, raises: 'ValueError' },
      ]
      return {
        type: 'python', difficulty: 'Medium', topic: 'Exceptions: custom errors and validation', title: 'Parse a transfer instruction',
        prompt: lines(`Transfers arrive as text like \`ACC1->SAV9:250\`. Define \`TransferError\`, a subclass of \`Exception\`, and write \`parse_transfer(text)\`:\n\n- Ignore spaces before or after the text.\n- It must be \`SOURCE->DEST:AMOUNT\`, with exactly one \`->\` and one \`:\`. Account names are letters and digits; AMOUNT is a whole number of at least 1.\n- If the format is wrong in any way (including an amount of 0 or one that isn't a whole number), raise \`ValueError\`.\n- If the format is fine but SOURCE equals DEST, or AMOUNT is more than ${L}, raise \`TransferError\`.\n- Otherwise return the tuple \`(source, dest, amount)\` with amount as an \`int\`.`),
        starter: lines('class TransferError(Exception):\n    pass\n\n\ndef parse_transfer(text):\n    pass\n'),
        solution: lines(`class TransferError(Exception):\n    pass\n\n\ndef parse_transfer(text):\n    s = text.strip()\n    if s.count('->') != 1 or s.count(':') != 1:\n        raise ValueError(f'Bad format: {text!r}')\n    source, rest = s.split('->')\n    if ':' not in rest:\n        raise ValueError(f'Bad format: {text!r}')\n    dest, amount = rest.split(':')\n    if not (source.isalnum() and dest.isalnum() and amount.isdigit()) or int(amount) == 0:\n        raise ValueError(f'Bad format: {text!r}')\n    amount = int(amount)\n    if source == dest:\n        raise TransferError('Source and destination are the same account')\n    if amount > ${L}:\n        raise TransferError(f'Amount {amount} is over the limit of ${L}')\n    return (source, dest, amount)\n`),
        tests,
        approach: [
          'Validate the shape before unpacking: counting the separators first means split() always gives the parts you expect.',
          'Use two kinds of error on purpose: ValueError for text that is malformed, TransferError for a well-formed request the bank refuses.',
          'Check each piece with isalnum() and isdigit(), then convert with int().',
          `Boundary: "more than ${L}" is > ${L}, so exactly ${L} is allowed.`,
        ],
        walkthrough: [
          '`class TransferError(Exception): pass`: a custom exception needs no body.',
          "`s.count('->') != 1 or s.count(':') != 1`: reject the shape early with ValueError.",
          "`source, rest = s.split('->')` then `dest, amount = rest.split(':')`: safe to unpack because the counts were checked (and the ':' is after the arrow).",
          '`amount.isdigit()` and `int(amount) == 0`: whole numbers only, and at least 1.',
          `\`if source == dest\` / \`if amount > ${L}\`: business rules raise TransferError.`,
          '`return (source, dest, amount)`: a tuple, with amount already an int.',
        ],
        mistakes: [
          'Returning amount as the string "250" instead of the int 250.',
          `Using >= ${L}, which rejects a transfer of exactly ${L}.`,
          'Raising ValueError for the same-account case, which the prompt says is a TransferError.',
          'Catching the error inside the function and returning None instead of raising.',
        ],
        params: { L },
      }
    },
  })

  T.push({
    key: 'code-py-filter-sort', section: 'python', kind: 'code',
    make(rand) {
      const minScore = pick(rand, [600, 650, 700])
      const byAge = rand() < 0.5
      const order = byAge ? ['age, youngest first', 'then score, highest first', 'then name, A to Z'] : ['score, highest first', 'then age, youngest first', 'then name, A to Z']
      const cmp = byAge
        ? (a, b) => a.age - b.age || b.score - a.score || (a.name < b.name ? -1 : 1)
        : (a, b) => b.score - a.score || a.age - b.age || (a.name < b.name ? -1 : 1)
      const pickRows = (recs) => recs.filter((x) => x.score !== null && x.score >= minScore).sort(cmp).map((x) => x.name)
      const names = ['Ana', 'Bo', 'Cy', 'Dee', 'Eve', 'Finn', 'Gus', 'Hal']
      const rec = (name) => ({ name, score: rand() < 0.15 ? null : pick(rand, [minScore - 20, minScore, minScore + 30, minScore + 80]), age: pick(rand, [22, 30, 30, 41]) })
      const lit = (recs) => py(recs)
      const sets = [
        ['Sample case 0', sample(rand, names, 5).map(rec)],
        ['Exactly the minimum is included', [{ name: 'Ana', score: minScore, age: 30 }, { name: 'Bo', score: minScore - 1, age: 30 }]],
        ['Ties on the first two keys', [{ name: 'Cy', score: minScore + 10, age: 25 }, { name: 'Ana', score: minScore + 10, age: 25 }, { name: 'Bo', score: minScore + 50, age: 40 }]],
        ['Missing scores are skipped', [{ name: 'Dee', score: null, age: 20 }, { name: 'Eve', score: minScore + 5, age: 33 }]],
        ['Empty list', []],
        ['Random applicants', sample(rand, names, 6).map(rec)],
      ]
      const key = byAge ? "lambda r: (r['age'], -r['score'], r['name'])" : "lambda r: (-r['score'], r['age'], r['name'])"
      return {
        type: 'python', difficulty: 'Medium', topic: 'Lambdas: filtering and multi-key sorting', title: 'Shortlist applicants',
        prompt: lines(`Write \`shortlist(applicants)\`. Each applicant is a dict with keys \`'name'\`, \`'score'\` (a credit score, or \`None\` if unknown) and \`'age'\`.\n\nReturn the names of applicants whose score is at least ${minScore}, ordered by:\n\n${order.map((o) => `- ${o}`).join('\n')}\n\nApplicants with no score are left out. An empty list returns \`[]\`.`),
        starter: lines('def shortlist(applicants):\n    pass\n'),
        solution: lines(`def shortlist(applicants):\n    keep = [r for r in applicants if r['score'] is not None and r['score'] >= ${minScore}]\n    keep.sort(key=${key})\n    return [r['name'] for r in keep]\n`),
        tests: sets.map(([name, recs]) => ({ name, expr: `shortlist(${lit(recs)})`, expect: py(pickRows(recs)) })),
        approach: [
          'Filter first with a list comprehension, removing None scores before any comparison.',
          'Sort with one lambda that returns a tuple; negate the numbers that go highest first.',
          'Return only the names, in the sorted order.',
        ],
        walkthrough: [
          `\`[r for r in applicants if r['score'] is not None and r['score'] >= ${minScore}]\`: the None check comes first, so the comparison never sees None.`,
          `\`keep.sort(key=${key})\`: the tuple encodes all three rules; negating the score puts higher scores first.`,
          "`[r['name'] for r in keep]`: keep just the names.",
        ],
        mistakes: [
          "Comparing None >= a number, which raises TypeError in Python 3.",
          `Using > ${minScore}, which drops applicants exactly at the minimum.`,
          'sort(reverse=True) on the whole tuple, which also reverses the age and name tie-breaks.',
          'Returning the dicts instead of the names.',
        ],
        params: { minScore, byAge },
      }
    },
  })

  // ===================================================================== Python: grouping and windows (stdin)

  T.push({
    key: 'code-py-group-report', section: 'python', kind: 'code',
    make(rand) {
      const byTotal = rand() < 0.5
      const cats = sample(rand, ['food', 'rent', 'travel', 'fun', 'gas'], 4)
      const report = (rows) => {
        const tot = new Map()
        let skipped = 0
        for (const line of rows) {
          const parts = line.split(/\s+/).filter(Boolean)
          if (parts.length !== 2 || !/^-?\d+(\.\d+)?$/.test(parts[1])) { skipped++; continue }
          const [c, a] = parts
          const cur = tot.get(c) || { total: 0, n: 0 }
          cur.total += Number(a)
          cur.n++
          tot.set(c, cur)
        }
        const keys = [...tot.keys()].sort(byTotal ? (x, y) => tot.get(y).total - tot.get(x).total || (x < y ? -1 : 1) : (x, y) => (x < y ? -1 : 1))
        return [...keys.map((c) => `${c} ${fixed2(tot.get(c).total)} ${tot.get(c).n} ${fixed2(tot.get(c).total / tot.get(c).n)}`), `SKIPPED ${skipped}`]
      }
      // Whole dollars: averages then never land on a rounding tie, where Python and JavaScript round differently
      const row = () => `${pick(rand, cats)} ${pick(rand, [10, 25, 40, 100, 8])}`
      const cases = [
        ['Sample case 0', [`${cats[0]} 10`, `${cats[1]} 25`, `${cats[0]} 5.5`, `${cats[2]} abc`]],
        ['Bad lines are skipped', [`${cats[0]}`, `${cats[1]} 12 extra`, `${cats[2]} 12x`, `${cats[3]} 8`]],
        ['Tied totals', [`${cats[1]} 50`, `${cats[0]} 50`]],
        ['Only bad lines', ['nothing here']],
        ['No lines', []],
        ['Random lines', Array.from({ length: 6 }, row)],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    lines = []\n\n    for _ in range(n):\n        lines.append(input())\n\n    for line in spendingReport(lines):\n        print(line)\n"
      const sortLine = byTotal ? "    order = sorted(totals, key=lambda c: (-totals[c], c))\n" : '    order = sorted(totals)\n'
      const body = `    totals = {}\n    counts = {}\n    skipped = 0\n    for line in lines:\n        parts = line.split()\n        if len(parts) != 2:\n            skipped += 1\n            continue\n        category, text = parts\n        try:\n            amount = float(text)\n        except ValueError:\n            skipped += 1\n            continue\n        totals[category] = totals.get(category, 0) + amount\n        counts[category] = counts.get(category, 0) + 1\n${sortLine}    result = [f'{c} {totals[c]:.2f} {counts[c]} {totals[c] / counts[c]:.2f}' for c in order]\n    result.append(f'SKIPPED {skipped}')\n    return result\n`
      return {
        type: 'python', difficulty: 'Medium', topic: 'Dictionaries, try/except and formatted output (HackerRank style)', title: 'Spending report by category',
        prompt: lines(`Each line should be \`CATEGORY AMOUNT\` (exactly two words, the amount a number). Complete \`spendingReport(lines)\`, which returns the report lines:\n\n- One line per category: \`CATEGORY TOTAL COUNT AVERAGE\`, with TOTAL and AVERAGE to 2 decimals. Order the categories ${byTotal ? 'by total, largest first, then alphabetically' : 'alphabetically'}.\n- Skip any line that isn't exactly two words or whose amount isn't a number, and count it.\n- Finish with \`SKIPPED k\`, the number of skipped lines.\n\n**Input format:** n, then n lines. The code that reads input and prints your lines is already written.`),
        starter: hr("#\n# Complete the 'spendingReport' function below.\n#\n# The function is expected to return a STRING_ARRAY.\n# The function accepts STRING_ARRAY lines as parameter.\n#\n", 'spendingReport(lines)', main),
        solution: hr('', 'spendingReport(lines)', main, body),
        tests: cases.map(([name, rows]) => ({ name, stdin: stdin(String(rows.length), rows), stdout: out(report(rows)) })),
        approach: [
          'Two dicts (totals and counts) keyed by category, or one dict of [total, count].',
          'Validate each line: split() into exactly two words, then float() inside try/except ValueError.',
          `Sort the categories ${byTotal ? 'with key=lambda c: (-totals[c], c)' : 'with sorted(totals)'}, then format each line with :.2f.`,
          'Append the SKIPPED line last, even when nothing was skipped.',
        ],
        walkthrough: [
          '`parts = line.split()` and `if len(parts) != 2`: missing amounts and extra words are both skipped.',
          '`try: amount = float(text) except ValueError:`: non-numeric amounts are skipped instead of crashing.',
          '`totals.get(category, 0) + amount`: start each new category at 0.',
          sortLine.trim().startsWith('order = sorted(totals, key') ? '`sorted(totals, key=lambda c: (-totals[c], c))`: largest total first, alphabetical for ties.' : '`sorted(totals)`: iterating a dict gives its keys, so this sorts category names.',
          "`f'{c} {totals[c]:.2f} {counts[c]} {totals[c] / counts[c]:.2f}'`: exactly the requested format.",
        ],
        mistakes: [
          'Calling float() without try/except, so one bad line crashes the program.',
          'Printing 10.0 instead of 10.00: use :.2f.',
          'Forgetting the SKIPPED line when the count is 0.',
          byTotal ? 'Sorting by total without the alphabetical tie-break.' : 'Sorting by total when the prompt asks for alphabetical order.',
        ],
        params: { byTotal },
      }
    },
  })

  T.push({
    key: 'code-py-best-window', section: 'python', kind: 'code',
    make(rand) {
      const k = pick(rand, [2, 3, 4])
      const best = (xs) => {
        if (xs.length < k) return 'NONE'
        let bestSum = null
        let bestDay = 0
        for (let i = 0; i + k <= xs.length; i++) {
          const sum = xs.slice(i, i + k).reduce((s, v) => s + v, 0)
          if (bestSum === null || sum > bestSum) { bestSum = sum; bestDay = i + 1 }
        }
        return `${bestSum} ${bestDay}`
      }
      const rv = () => between(rand, -50, 100)
      const cases = [
        ['Sample case 0', Array.from({ length: k + 3 }, rv)],
        ['Tie: earliest window wins', [...Array(k).fill(10), ...Array(k).fill(10)]],
        ['All negative', Array.from({ length: k + 2 }, () => -between(rand, 1, 30))],
        ['Exactly k days', Array.from({ length: k }, rv)],
        ['Fewer than k days', Array.from({ length: k - 1 }, rv)],
        ['Random days', Array.from({ length: k + 5 }, rv)],
      ]
      const main = "if __name__ == '__main__':\n    n = int(input().strip())\n\n    amounts = []\n\n    for _ in range(n):\n        amounts.append(int(input().strip()))\n\n    print(bestWindow(amounts))\n"
      const body = `    k = ${k}\n    if len(amounts) < k:\n        return 'NONE'\n    window = sum(amounts[:k])\n    best, best_day = window, 1\n    for i in range(k, len(amounts)):\n        window += amounts[i] - amounts[i - k]\n        if window > best:\n            best, best_day = window, i - k + 2\n    return f'{best} {best_day}'\n`
      return {
        type: 'python', difficulty: 'Medium', topic: 'Lists: sliding windows (HackerRank style)', title: `Best ${k}-day stretch`,
        prompt: lines(`Daily net deposits are given in order. Complete \`bestWindow(amounts)\`, which finds the ${k} consecutive days with the largest total and returns \`"TOTAL DAY"\`, where DAY is the 1-based number of the first day of that stretch. If several stretches tie, use the earliest. If there are fewer than ${k} days, return \`NONE\`.\n\n**Input format:** n, then n whole numbers. The input and printing code is already written.`),
        starter: hr("#\n# Complete the 'bestWindow' function below.\n#\n# The function is expected to return a STRING.\n# The function accepts INTEGER_ARRAY amounts as parameter.\n#\n", 'bestWindow(amounts)', main),
        solution: hr('', 'bestWindow(amounts)', main, body),
        tests: cases.map(([name, xs]) => ({ name, stdin: stdin(String(xs.length), xs.map(String)), stdout: out([best(xs)]) })),
        approach: [
          `Check the short case first: fewer than ${k} values means no window.`,
          `Start with the sum of the first ${k} values, then slide: add the new day, subtract the day that left. That is O(n) instead of recomputing every sum.`,
          'Update the best only on a strictly larger total, so ties keep the earliest window.',
          'Start the best at the first window, not at 0: with all-negative values, 0 would be wrong.',
        ],
        walkthrough: [
          `\`window = sum(amounts[:${k}])\`: the first stretch, starting on day 1.`,
          '`window += amounts[i] - amounts[i - k]`: slide one day right.',
          '`if window > best:`: strictly greater, so an equal later total doesn\'t replace the earlier one.',
          '`best_day = i - k + 2`: the window ending at index i starts at index i − k + 1, which is day i − k + 2.',
        ],
        mistakes: [
          'Initializing best = 0, which is wrong when every total is negative.',
          'Using >=, which picks the latest of tied windows.',
          'Off-by-one day numbers (0-based instead of 1-based).',
          'Returning 0 or crashing instead of NONE for short input.',
        ],
        params: { k },
      }
    },
  })

  // ===================================================================== SQL

  const BRANCHES = ['Back Bay', 'Cambridge', 'Providence', 'Worcester', 'Hartford', 'Albany']
  const NAMES = ['Ava Chen', 'Ben Ortiz', 'Chloe Park', 'Dev Patel', 'Emma Ross', 'Finn Walsh', 'Gia Rossi', 'Hugo Lim', 'Iris Moss']
  const SQL_STARTER = ['/*', 'Enter your query below.', 'Please append a semicolon ";" at the end of the query', '*/', '']
  const cmpBy = (...fns) => (a, b) => {
    for (const f of fns) {
      const r = f(a, b)
      if (r) return r
    }
    return 0
  }
  const asc = (f) => (a, b) => (f(a) < f(b) ? -1 : f(a) > f(b) ? 1 : 0)
  const desc = (f) => (a, b) => (f(a) > f(b) ? -1 : f(a) < f(b) ? 1 : 0)
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100

  T.push({
    key: 'code-sql-share-of-total', section: 'sqlint', kind: 'code',
    make(rand) {
      const br = sample(rand, BRANCHES, 4).map((b, i) => [i + 1, b])
      const deps = []
      let id = 1
      for (const [bid] of br) for (let k = 0; k < between(rand, 1, 3); k++) deps.push([id++, bid, pick(rand, [100, 200, 300, 500, 800])])
      deps.push([id++, br[0][0], null])
      const tot = br.map(([bid, name]) => [name, deps.filter((d) => d[1] === bid).reduce((s, d) => s + (d[2] ?? 0), 0)])
      const all = tot.reduce((s, t) => s + t[1], 0)
      const expected = tot.map(([n, t]) => [n, t, r2((100 * t) / all)]).sort(cmpBy(desc((r) => r[1]), asc((r) => r[0])))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window functions: share of a total', title: "Each branch's share of deposits",
        prompt: ['For each branch, show its total deposits and its **percentage of all deposits** across every branch, rounded to 2 decimal places. NULL amounts are pending and add nothing.', '', '**Output columns:** `branch_name`, `total`, `pct_of_total`', '', '**Sort by:** `total` descending, then `branch_name` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'deposits', columns: [['deposit_id', 'INTEGER'], ['branch_id', 'INTEGER'], ['amount', 'REAL']], rows: shuffle(rand, deps) },
        ],
        solution: ['WITH totals AS (', '    SELECT b.branch_name, SUM(d.amount) AS total', '    FROM branches b', '    JOIN deposits d ON d.branch_id = b.branch_id', '    GROUP BY b.branch_id, b.branch_name', ')', 'SELECT branch_name,', '       total,', '       ROUND(100.0 * total / SUM(total) OVER (), 2) AS pct_of_total', 'FROM totals', 'ORDER BY total DESC, branch_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'total', 'pct_of_total'], rows: expected },
        approach: ['First total per branch with GROUP BY.', 'Then divide by the grand total. SUM(total) OVER () is the sum over all rows, attached to every row; a scalar subquery works too.', 'Multiply by 100.0 before dividing to avoid integer division, then ROUND(..., 2).'],
        walkthrough: ['`SUM(d.amount) ... GROUP BY b.branch_id, b.branch_name`: one total per branch; NULL amounts are skipped.', '`SUM(total) OVER ()`: an empty OVER () means "all rows", so every row sees the grand total.', '`ROUND(100.0 * total / SUM(total) OVER (), 2)`: a percentage with 2 decimals.', '`ORDER BY total DESC, branch_name;`: largest first, name for ties.'],
        mistakes: ['Integer division: 100 * total / grand gives whole numbers in some engines. Use 100.0.', 'Dividing by the branch\'s own total (always 100%).', 'Forgetting the name tie-break.'],
        params: {},
      }
    },
  })

  T.push({
    key: 'code-sql-mom-change', section: 'sqlint', kind: 'code',
    make(rand) {
      const br = sample(rand, BRANCHES, 2).map((b, i) => [i + 1, b])
      const months = ['2025-01', '2025-02', '2025-03', '2025-04']
      const rows = []
      for (const [bid] of br) for (const m of months.slice(0, between(rand, 2, 4))) rows.push([bid, m, pick(rand, [5000, 8000, 9000, 12000])])
      const expected = []
      for (const [bid, name] of [...br].sort(asc((b) => b[1]))) {
        let prev = null
        for (const r of rows.filter((x) => x[0] === bid).sort(asc((x) => x[1]))) {
          expected.push([name, r[1], r[2], prev === null ? null : r[2] - prev])
          prev = r[2]
        }
      }
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window functions: LAG', title: 'Month-over-month change',
        prompt: ["For each branch and month, show the month's total and the change from that branch's previous month. A branch's first month has no previous month, so its change is NULL (not 0).", '', '**Output columns:** `branch_name`, `month`, `total`, `change_from_prev`', '', '**Sort by:** `branch_name`, then `month`, both ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'monthly_deposits', columns: [['branch_id', 'INTEGER'], ['month', 'TEXT'], ['total', 'REAL']], rows: shuffle(rand, rows) },
        ],
        solution: ['SELECT b.branch_name,', '       m.month,', '       m.total,', '       m.total - LAG(m.total) OVER (PARTITION BY m.branch_id ORDER BY m.month) AS change_from_prev', 'FROM monthly_deposits m', 'JOIN branches b ON b.branch_id = m.branch_id', 'ORDER BY b.branch_name, m.month;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'month', 'total', 'change_from_prev'], rows: expected },
        approach: ['"Compared with the previous row" means LAG.', 'PARTITION BY branch so each branch starts fresh, and ORDER BY month inside OVER (table order means nothing).', 'LAG gives NULL on the first row, and anything minus NULL is NULL, exactly as required.'],
        walkthrough: ['`LAG(m.total) OVER (PARTITION BY m.branch_id ORDER BY m.month)`: last month\'s total for the same branch.', '`m.total - LAG(...)`: this month minus last month.', '`ORDER BY b.branch_name, m.month;`: the output order.'],
        mistakes: ['No PARTITION BY, so a branch is compared with another branch\'s month.', 'COALESCE(LAG(...), 0), which makes the first change equal the whole total.', 'LAG(total) - total, which flips the sign.'],
        params: {},
      }
    },
  })

  T.push({
    key: 'code-sql-no-activity', section: 'sqlint', kind: 'code',
    make(rand) {
      const month = pick(rand, ['2025-02', '2025-03', '2025-04'])
      const names = sample(rand, NAMES, 6)
      const customers = names.map((n, i) => [i + 1, n])
      const txns = []
      let id = 1
      const other = ['2025-01-15', '2025-05-02', `${month}-28`.replace(/-(29|30|31)$/, '-28')]
      for (const [cid] of customers) {
        if (rand() < 0.5) txns.push([id++, cid, `${month}-${String(between(rand, 1, 28)).padStart(2, '0')}`, pick(rand, [20, 50, 75])])
        if (rand() < 0.6) txns.push([id++, cid, pick(rand, ['2025-01-15', '2025-05-02']), pick(rand, [20, 50])])
      }
      txns.push([id++, null, `${month}-10`, 5]) // a transaction with no customer: breaks NOT IN
      void other
      const active = new Set(txns.filter((t) => t[1] !== null && t[2].startsWith(month)).map((t) => t[1]))
      const expected = customers.filter(([cid]) => !active.has(cid)).sort(asc((c) => c[1]))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Anti-joins: NOT EXISTS and the NOT IN NULL trap', title: `Customers with no activity in ${month}`,
        prompt: [`List the customers who made **no transactions in ${month}** (activity in other months doesn't matter). Some transactions have a NULL customer_id.`, '', '**Output columns:** `customer_id`, `customer_name`', '', '**Sort by:** `customer_name` ascending.'],
        tables: [
          { name: 'customers', columns: [['customer_id', 'INTEGER'], ['customer_name', 'TEXT']], rows: customers },
          { name: 'transactions', columns: [['txn_id', 'INTEGER'], ['customer_id', 'INTEGER'], ['txn_date', 'TEXT'], ['amount', 'REAL']], rows: shuffle(rand, txns) },
        ],
        solution: ['SELECT c.customer_id, c.customer_name', 'FROM customers c', 'WHERE NOT EXISTS (', '    SELECT 1', '    FROM transactions t', '    WHERE t.customer_id = c.customer_id', `      AND t.txn_date >= '${month}-01'`, `      AND t.txn_date < '${month === '2025-04' ? '2025-05' : month === '2025-03' ? '2025-04' : '2025-03'}-01'`, ')', 'ORDER BY c.customer_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['customer_id', 'customer_name'], rows: expected },
        approach: ['"Customers with no X" is an anti-join: NOT EXISTS, or LEFT JOIN ... WHERE right side IS NULL.', 'Put the month condition inside the subquery (or the ON clause), so activity in other months is ignored.', 'Avoid NOT IN here: the subquery returns a NULL customer_id, and x NOT IN (..., NULL) is never true, so it returns nothing.'],
        walkthrough: ['`WHERE NOT EXISTS (SELECT 1 FROM transactions t WHERE t.customer_id = c.customer_id AND ...)`: keep a customer when no matching transaction exists.', `The date range \`>= '${month}-01'\` and \`< next month\` selects exactly ${month}.`, 'The NULL customer_id row never matches c.customer_id, so it does no harm here.', '`ORDER BY c.customer_name;`: the required sort.'],
        mistakes: ['NOT IN (SELECT customer_id ...), which returns no rows because of the NULL.', 'Filtering the month in an outer WHERE after a LEFT JOIN, which drops customers who are only active in other months.', 'Returning customers with no transactions at all instead of none in that month.'],
        params: { month },
      }
    },
  })

  T.push({
    key: 'code-sql-monthly-report', section: 'sqlint', kind: 'code',
    make(rand) {
      const Y = pick(rand, [2024, 2025])
      const txns = []
      let id = 1
      for (let k = 0; k < between(rand, 7, 11); k++) {
        const y = pick(rand, [Y, Y, Y, Y - 1, Y + 1])
        txns.push([id++, `${y}-${String(between(rand, 1, 4)).padStart(2, '0')}-${String(between(rand, 1, 28)).padStart(2, '0')}`, rand() < 0.15 ? null : pick(rand, [25, 50, 100, 250])])
      }
      txns.push([id++, `${Y}-12-31`, 40], [id++, `${Y + 1}-01-01`, 60])
      const map = new Map()
      for (const [, d, a] of txns) {
        if (!d.startsWith(String(Y))) continue
        const m = d.slice(0, 7)
        const cur = map.get(m) || [m, 0, 0]
        cur[1]++
        cur[2] += a ?? 0
        map.set(m, cur)
      }
      const expected = [...map.values()].sort(asc((r) => r[0]))
      return {
        type: 'sql', difficulty: 'Easy', topic: 'Reporting with dates: GROUP BY month', title: `Monthly transaction report for ${Y}`,
        prompt: [`For every month of ${Y} that has at least one transaction, report the month as \`YYYY-MM\`, the number of transactions, and their total amount. Count every transaction, but a NULL amount adds nothing to the total (a month whose amounts are all NULL shows 0).`, '', '**Output columns:** `month`, `txn_count`, `total`', '', '**Sort by:** `month` ascending.'],
        tables: [{ name: 'transactions', columns: [['txn_id', 'INTEGER'], ['txn_date', 'TEXT'], ['amount', 'REAL']], rows: shuffle(rand, txns) }],
        solution: ['SELECT SUBSTR(txn_date, 1, 7) AS month,', '       COUNT(*) AS txn_count,', '       COALESCE(SUM(amount), 0) AS total', 'FROM transactions', `WHERE txn_date >= '${Y}-01-01' AND txn_date < '${Y + 1}-01-01'`, 'GROUP BY month', 'ORDER BY month;'],
        starter: SQL_STARTER,
        expected: { columns: ['month', 'txn_count', 'total'], rows: expected },
        approach: ["Turn each date into its month: DATE_FORMAT(txn_date, '%Y-%m') in MySQL, or SUBSTR(txn_date, 1, 7) for 'YYYY-MM-DD' text.", `Filter to ${Y} before grouping, with a range that includes Dec 31 and excludes Jan 1 of the next year.`, 'COUNT(*) counts every row; SUM skips NULLs, and COALESCE turns an all-NULL month into 0.'],
        walkthrough: ['`SUBSTR(txn_date, 1, 7) AS month`: the first 7 characters of 2025-03-14 are 2025-03.', `\`WHERE txn_date >= '${Y}-01-01' AND txn_date < '${Y + 1}-01-01'\`: exactly the year ${Y}.`, '`COUNT(*)` and `COALESCE(SUM(amount), 0)`: count rows, total amounts.', '`GROUP BY month ORDER BY month`: one row per month, in calendar order because YYYY-MM text sorts that way.'],
        mistakes: ['COUNT(amount), which skips the NULL-amount transactions.', "MONTH(txn_date) alone, which merges the same month across years and loses the 'YYYY-MM' format.", 'Off-by-one year boundaries (missing Dec 31 or including Jan 1).'],
        params: { Y },
      }
    },
  })

  T.push({
    key: 'code-sql-above-avg', section: 'sqlint', kind: 'code',
    make(rand) {
      const br = sample(rand, BRANCHES, 3).map((b, i) => [i + 1, b])
      const loans = []
      let id = 1
      for (const [bid] of br) for (let k = 0; k < between(rand, 1, 4); k++) loans.push([id++, bid, pick(rand, [10000, 20000, 30000, 40000])])
      loans.push([id++, br[0][0], null], [id++, br[0][0], 40000])
      const expected = []
      for (const [bid, name] of br) {
        const mine = loans.filter((l) => l[1] === bid && l[2] !== null)
        const avg = mine.reduce((s, l) => s + l[2], 0) / mine.length
        for (const l of mine) if (l[2] > avg + 1e-9) expected.push([l[0], name, l[2], r2(avg)])
      }
      expected.sort(cmpBy(asc((r) => r[1]), desc((r) => r[2]), asc((r) => r[0])))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window averages or correlated subqueries', title: "Loans above their branch's average",
        prompt: ["Find loans that are **larger than the average loan amount of their own branch**. Ignore loans with a NULL amount completely. Show the branch average rounded to 2 decimals.", '', '**Output columns:** `loan_id`, `branch_name`, `amount`, `branch_avg`', '', '**Sort by:** `branch_name` ascending, then `amount` descending, then `loan_id` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'loans', columns: [['loan_id', 'INTEGER'], ['branch_id', 'INTEGER'], ['amount', 'REAL']], rows: shuffle(rand, loans) },
        ],
        solution: ['WITH scored AS (', '    SELECT loan_id, branch_id, amount,', '           AVG(amount) OVER (PARTITION BY branch_id) AS branch_avg', '    FROM loans', '    WHERE amount IS NOT NULL', ')', 'SELECT s.loan_id, b.branch_name, s.amount, ROUND(s.branch_avg, 2) AS branch_avg', 'FROM scored s', 'JOIN branches b ON b.branch_id = s.branch_id', 'WHERE s.amount > s.branch_avg', 'ORDER BY b.branch_name, s.amount DESC, s.loan_id;'],
        starter: SQL_STARTER,
        expected: { columns: ['loan_id', 'branch_name', 'amount', 'branch_avg'], rows: expected },
        approach: ['Each row is compared with its own group: AVG() OVER (PARTITION BY branch_id), or a correlated subquery.', "Window results can't be filtered in the same SELECT's WHERE, so compute them in a CTE first.", 'Drop NULL amounts before averaging and keep strict >.'],
        walkthrough: ['`AVG(amount) OVER (PARTITION BY branch_id)`: the branch average on every row, without collapsing rows.', '`WHERE amount IS NOT NULL` in the CTE: NULL loans never reach the output.', '`WHERE s.amount > s.branch_avg`: above-average loans only.', '`ORDER BY b.branch_name, s.amount DESC, s.loan_id`: loan_id breaks equal amounts.'],
        mistakes: ['Comparing with the average over all branches.', 'WHERE amount > AVG(amount) OVER (...) in one query: an error.', 'Missing the loan_id tie-break.'],
        params: {},
      }
    },
  })

  T.push({
    key: 'code-sql-second-highest', section: 'sqlint', kind: 'code',
    make(rand) {
      const br = sample(rand, BRANCHES, 4).map((b, i) => [i + 1, b])
      const loans = []
      let id = 1
      const amts = [15000, 20000, 30000, 50000]
      loans.push([id++, br[0][0], 50000], [id++, br[0][0], 50000], [id++, br[0][0], pick(rand, [20000, 30000])]) // duplicate top
      loans.push([id++, br[1][0], 15000], [id++, br[1][0], 15000]) // only one distinct
      for (let k = 0; k < between(rand, 1, 4); k++) loans.push([id++, br[2][0], pick(rand, amts)])
      loans.push([id++, br[2][0], null])
      // br[3] has no loans at all
      const expected = br.map(([bid, name]) => {
        const distinct = [...new Set(loans.filter((l) => l[1] === bid && l[2] !== null).map((l) => l[2]))].sort((x, y) => y - x)
        return [name, distinct.length > 1 ? distinct[1] : null]
      }).sort(asc((r) => r[0]))
      return {
        type: 'sql', difficulty: 'Medium', topic: 'Window functions: DENSE_RANK and missing results', title: 'Second-largest loan in each branch',
        prompt: ['For every branch, find the **second-highest distinct loan amount**. Ignore NULL amounts. If a branch has no second-highest amount (one distinct amount, or no loans), it still appears with NULL.', '', '**Output columns:** `branch_name`, `second_highest`', '', '**Sort by:** `branch_name` ascending.'],
        tables: [
          { name: 'branches', columns: [['branch_id', 'INTEGER'], ['branch_name', 'TEXT']], rows: br },
          { name: 'loans', columns: [['loan_id', 'INTEGER'], ['branch_id', 'INTEGER'], ['amount', 'REAL']], rows: shuffle(rand, loans) },
        ],
        solution: ['WITH ranked AS (', '    SELECT branch_id, amount,', '           DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC) AS rnk', '    FROM loans', '    WHERE amount IS NOT NULL', ')', 'SELECT b.branch_name, MAX(r.amount) AS second_highest', 'FROM branches b', 'LEFT JOIN ranked r ON r.branch_id = b.branch_id AND r.rnk = 2', 'GROUP BY b.branch_id, b.branch_name', 'ORDER BY b.branch_name;'],
        starter: SQL_STARTER,
        expected: { columns: ['branch_name', 'second_highest'], rows: expected },
        approach: ['"Nth highest distinct" is DENSE_RANK: ties share a rank and the next value gets the next number.', 'Every branch must appear, so LEFT JOIN the rank-2 rows onto branches, with rnk = 2 in the ON clause.', 'Collapse repeated rank-2 rows with MAX (or DISTINCT).'],
        walkthrough: ['`DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC)`: two loans of the same top amount both get 1, so the next amount gets 2.', '`LEFT JOIN ranked r ON ... AND r.rnk = 2`: branches with no rank-2 row still appear, with NULL.', '`MAX(r.amount) ... GROUP BY`: one value per branch.'],
        mistakes: ['ROW_NUMBER, which returns the duplicate top amount as "second".', 'rnk = 2 in WHERE after the LEFT JOIN, which drops branches without a second amount.', 'Forgetting branches with no loans at all.'],
        params: {},
      }
    },
  })
})()
