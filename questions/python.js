window.BANK = (window.BANK || []).concat(
[
  {
    "id": "py-bank-account-oop",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "OOP: classes, inheritance, custom exceptions",
    "title": "Bank accounts with an overdraft rule",
    "prompt": [
      "Implement three classes.",
      "",
      "**`InsufficientFundsError`**: a custom exception that subclasses `Exception`.",
      "",
      "**`BankAccount(owner, balance=0)`**",
      "- `balance` attribute holds the current balance.",
      "- `deposit(amount)`: adds `amount`. Raise `ValueError` if `amount <= 0`.",
      "- `withdraw(amount)`: subtracts `amount`. Raise `ValueError` if `amount <= 0`. If `amount` is more than the balance, raise `InsufficientFundsError` with the message `Insufficient funds: balance B, requested A` (B and A shown exactly as Python prints them) and leave the balance unchanged. Withdrawing the entire balance is allowed.",
      "",
      "**`SavingsAccount(owner, balance=0, min_balance=100)`**: a subclass of `BankAccount`. A withdrawal must leave at least `min_balance` in the account; otherwise raise `InsufficientFundsError` (any message) and leave the balance unchanged."
    ],
    "starter": [
      "class InsufficientFundsError(Exception):",
      "    pass",
      "",
      "",
      "class BankAccount:",
      "    def __init__(self, owner, balance=0):",
      "        pass",
      "",
      "    def deposit(self, amount):",
      "        pass",
      "",
      "    def withdraw(self, amount):",
      "        pass",
      "",
      "",
      "class SavingsAccount(BankAccount):",
      "    def __init__(self, owner, balance=0, min_balance=100):",
      "        pass",
      "",
      "    def withdraw(self, amount):",
      "        pass",
      ""
    ],
    "solution": [
      "class InsufficientFundsError(Exception):",
      "    pass",
      "",
      "",
      "class BankAccount:",
      "    def __init__(self, owner, balance=0):",
      "        self.owner = owner",
      "        self.balance = balance",
      "",
      "    def deposit(self, amount):",
      "        if amount <= 0:",
      "            raise ValueError(\"Deposit must be positive\")",
      "        self.balance += amount",
      "",
      "    def withdraw(self, amount):",
      "        if amount <= 0:",
      "            raise ValueError(\"Withdrawal must be positive\")",
      "        if amount > self.balance:",
      "            raise InsufficientFundsError(",
      "                f\"Insufficient funds: balance {self.balance}, requested {amount}\"",
      "            )",
      "        self.balance -= amount",
      "",
      "",
      "class SavingsAccount(BankAccount):",
      "    def __init__(self, owner, balance=0, min_balance=100):",
      "        super().__init__(owner, balance)",
      "        self.min_balance = min_balance",
      "",
      "    def withdraw(self, amount):",
      "        if amount > 0 and self.balance - amount < self.min_balance:",
      "            raise InsufficientFundsError(",
      "                f\"Withdrawal would leave less than {self.min_balance}\"",
      "            )",
      "        super().withdraw(amount)",
      ""
    ],
    "tests": [
      {
        "name": "Deposit adds to the balance",
        "setup": "a = BankAccount('Ana', 50)\na.deposit(25)",
        "expr": "a.balance",
        "expect": "75"
      },
      {
        "name": "Withdrawing the whole balance leaves 0",
        "setup": "a = BankAccount('Ana', 40)\na.withdraw(40)",
        "expr": "a.balance",
        "expect": "0"
      },
      {
        "name": "Overdrawing raises InsufficientFundsError",
        "setup": "a = BankAccount('Ana', 40)",
        "expr": "a.withdraw(40.01)",
        "raises": "InsufficientFundsError"
      },
      {
        "name": "Zero deposit raises ValueError",
        "setup": "a = BankAccount('Ana')",
        "expr": "a.deposit(0)",
        "raises": "ValueError"
      },
      {
        "name": "Error message format, balance unchanged",
        "setup": "a = BankAccount('Ana', 40)\ntry:\n    a.withdraw(50)\n    msg = None\nexcept InsufficientFundsError as e:\n    msg = str(e)",
        "expr": "(msg, a.balance)",
        "expect": "('Insufficient funds: balance 40, requested 50', 40)"
      },
      {
        "name": "Savings keeps the minimum balance",
        "setup": "s = SavingsAccount('Bo', 300)\ns.withdraw(200)",
        "expr": "s.withdraw(0.01)",
        "raises": "InsufficientFundsError"
      }
    ],
    "approach": [
      "Start with the exception: class InsufficientFundsError(Exception): pass. Raising it with a message makes str(e) return that message.",
      "Validate first, mutate last. Check every error condition before changing self.balance, so a failed withdrawal leaves the balance untouched.",
      "Read the boundary words: \"more than the balance\" is >, so withdrawing exactly the balance is allowed.",
      "In the subclass, call super().__init__ to reuse the parent's setup, and override only withdraw. Do the extra minimum-balance check, then hand off to super().withdraw for the normal rules.",
      "Build the message with an f-string so numbers print the way Python prints them (40, not 40.0)."
    ],
    "walkthrough": [
      "`class InsufficientFundsError(Exception): pass`: a custom exception is just a subclass of Exception; the body can be empty.",
      "`self.owner = owner` and `self.balance = balance` in __init__: store state on the instance so each account has its own balance.",
      "`if amount <= 0: raise ValueError(...)`: validate first and raise; raising stops the method before anything changes.",
      "`if amount > self.balance: raise InsufficientFundsError(f'Insufficient funds: balance {self.balance}, requested {amount}')`: > (not >=) lets you withdraw the exact balance; the f-string builds the exact message the test reads with str(e).",
      "`self.balance -= amount`: only reached when every check passed.",
      "`super().__init__(owner, balance)` in SavingsAccount: reuse the parent's setup, then add min_balance.",
      "`if amount > 0 and self.balance - amount < self.min_balance: raise ...` then `super().withdraw(amount)`: add the extra rule, then let the parent apply the normal rules."
    ],
    "mistakes": [
      "Using >= instead of > for the overdraft check, which wrongly blocks withdrawing the exact balance.",
      "Subtracting before checking, so a failed withdrawal still changes the balance.",
      "Forgetting super().__init__ in SavingsAccount, so self.balance never exists (AttributeError).",
      "Returning an error string instead of raising the exception.",
      "Subclassing ValueError or BaseException when the prompt says Exception, or misspelling the class name the tests import."
    ]
  },
  {
    "id": "py-mask-card",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "String manipulation with edge cases",
    "title": "Mask a card number",
    "prompt": [
      "Write `mask_card(card)`. `card` is a string of digits that may contain spaces or dashes as separators.",
      "",
      "Return the string with every digit except the **last four digits** replaced by `*`. Separators stay exactly where they are. If the string has 4 or fewer digits, return it unchanged (this includes the empty string).",
      "",
      "Examples:",
      "- `mask_card(\"4111 1111 1111 1234\")` returns `\"**** **** **** 1234\"`",
      "- `mask_card(\"12 34 5\")` returns `\"*2 34 5\"`"
    ],
    "starter": ["def mask_card(card):", "    pass", ""],
    "solution": [
      "def mask_card(card):",
      "    to_mask = sum(ch.isdigit() for ch in card) - 4",
      "    out = []",
      "    for ch in card:",
      "        if ch.isdigit() and to_mask > 0:",
      "            out.append('*')",
      "            to_mask -= 1",
      "        else:",
      "            out.append(ch)",
      "    return ''.join(out)",
      ""
    ],
    "tests": [
      {"name": "Spaces kept", "expr": "mask_card('4111 1111 1111 1234')", "expect": "'**** **** **** 1234'"},
      {"name": "Dashes kept", "expr": "mask_card('4111-1111-1111-1234')", "expect": "'****-****-****-1234'"},
      {"name": "Exactly four digits is unchanged", "expr": "mask_card('1234')", "expect": "'1234'"},
      {"name": "Five digits masks one", "expr": "mask_card('12345')", "expect": "'*2345'"},
      {"name": "Empty string", "expr": "mask_card('')", "expect": "''"},
      {"name": "Last four digits span separators", "expr": "mask_card('12 34 5')", "expect": "'*2 34 5'"}
    ],
    "approach": [
      "Count the digits first, so you know how many to hide: total digits minus 4.",
      "Walk the string once. Replace a digit with * while you still have digits left to hide; copy everything else unchanged.",
      "Build a list and ''.join it at the end instead of slicing, because separators make positions and digit counts differ.",
      "Test the boundaries in your head: 4 digits (nothing to hide), 0 digits (empty string), and separators inside the last four."
    ],
    "walkthrough": [
      "`to_mask = sum(ch.isdigit() for ch in card) - 4`: True counts as 1, so this counts digits, then subtracts the 4 to keep.",
      "`for ch in card:`: walk every character, separators included.",
      "`if ch.isdigit() and to_mask > 0: out.append('*'); to_mask -= 1`: hide digits until the quota is used up.",
      "`else: out.append(ch)`: separators and the last four digits pass through unchanged.",
      "`return ''.join(out)`: build the string once from a list, which is faster than repeated +=."
    ],
    "mistakes": [
      "Slicing the last 4 characters (card[-4:]) instead of the last 4 digits: '12 34 5' would keep ' 5' plus two digits and get the count wrong.",
      "Removing the separators, or masking them too.",
      "Masking when there are exactly 4 digits, or crashing on the empty string.",
      "Returning None by forgetting the return statement, or printing the result instead of returning it."
    ]
  },
  {
    "id": "py-rank-customers",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Sorting with lambdas and tie-breaks",
    "title": "Rank customers for a credit offer",
    "prompt": [
      "Write `rank_customers(customers)`. Each customer is a tuple `(name, credit_score, balance)`. Some customers have no credit score yet: their `credit_score` is `None`.",
      "",
      "Return a list of **names** of customers who have a credit score, ordered by:",
      "- `credit_score`, highest first",
      "- then `balance`, highest first",
      "- then `name`, alphabetically",
      "",
      "An empty input returns an empty list."
    ],
    "starter": ["def rank_customers(customers):", "    pass", ""],
    "solution": [
      "def rank_customers(customers):",
      "    scored = [c for c in customers if c[1] is not None]",
      "    scored.sort(key=lambda c: (-c[1], -c[2], c[0]))",
      "    return [name for name, _, _ in scored]",
      ""
    ],
    "tests": [
      {
        "name": "Higher score first",
        "expr": "rank_customers([('Ana', 700, 100), ('Bo', 750, 50)])",
        "expect": "['Bo', 'Ana']"
      },
      {
        "name": "Score tie broken by balance",
        "expr": "rank_customers([('Ana', 700, 100), ('Bo', 700, 900)])",
        "expect": "['Bo', 'Ana']"
      },
      {
        "name": "Score and balance tie broken by name",
        "expr": "rank_customers([('Cy', 700, 500), ('Ana', 700, 500), ('Bo', 680, 999)])",
        "expect": "['Ana', 'Cy', 'Bo']"
      },
      {
        "name": "Customers without a score are left out",
        "expr": "rank_customers([('Ana', None, 5000), ('Bo', 600, 10)])",
        "expect": "['Bo']"
      },
      {"name": "Empty list", "expr": "rank_customers([])", "expect": "[]"},
      {
        "name": "Nobody has a score",
        "expr": "rank_customers([('Ana', None, 1), ('Bo', None, 2)])",
        "expect": "[]"
      }
    ],
    "approach": [
      "Filter first: drop the None scores before sorting, because comparing None with a number raises TypeError in Python 3.",
      "Sort with one key that returns a tuple. Tuples compare element by element, so (score, balance, name) handles every tie-break in one pass.",
      "To sort a number highest first inside an otherwise ascending sort, negate it: -score. Names stay ascending.",
      "Return just the names, and check the empty input returns [] rather than None."
    ],
    "walkthrough": [
      "`scored = [c for c in customers if c[1] is not None]`: drop missing scores first; comparing None with an int raises TypeError.",
      "`scored.sort(key=lambda c: (-c[1], -c[2], c[0]))`: one tuple key: score high to low, balance high to low, name A to Z.",
      "`return [name for name, _, _ in scored]`: unpack each tuple and keep only the name; _ means \"ignored\"."
    ],
    "mistakes": [
      "Sorting with reverse=True and a (score, balance, name) key: it also reverses the names, so ties come out Z to A.",
      "Not filtering None, which raises TypeError: '<' not supported between 'NoneType' and 'int'.",
      "Returning the whole tuples instead of just the names.",
      "Sorting three separate times in the wrong order. Stable multi-pass sorting works only if you sort by the least important key first."
    ]
  },
  {
    "id": "py-parse-amount",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "String parsing and exceptions",
    "title": "Parse a money amount",
    "prompt": [
      "Statements show amounts as text. Write `parse_amount(text)` that returns the amount as a `float`.",
      "",
      "Accepted formats, with optional whitespace around the whole string:",
      "- Digits with an optional decimal part: `7`, `45.00`",
      "- An optional `$` before the digits: `$12.50`",
      "- Commas as thousands separators, in the right places: `$1,234.50`",
      "- A negative amount written with a leading `-` (`-$20`) or in parentheses (`(45.00)`)",
      "",
      "For anything else, including an empty string, raise `ValueError`."
    ],
    "starter": ["def parse_amount(text):", "    pass", ""],
    "solution": [
      "import re",
      "",
      "NUMBER = re.compile(r'\\d{1,3}(,\\d{3})+(\\.\\d+)?|\\d+(\\.\\d+)?')",
      "",
      "",
      "def parse_amount(text):",
      "    s = text.strip()",
      "    negative = False",
      "    if s.startswith('(') and s.endswith(')'):",
      "        negative, s = True, s[1:-1].strip()",
      "    elif s.startswith('-'):",
      "        negative, s = True, s[1:].strip()",
      "    if s.startswith('$'):",
      "        s = s[1:]",
      "    if not NUMBER.fullmatch(s):",
      "        raise ValueError(f'Invalid amount: {text!r}')",
      "    value = float(s.replace(',', ''))",
      "    return -value if negative else value",
      ""
    ],
    "tests": [
      {"name": "Dollar sign and thousands comma", "expr": "parse_amount('$1,234.50')", "expect": "1234.5"},
      {"name": "Leading minus", "expr": "parse_amount('-$20')", "expect": "-20.0"},
      {"name": "Parentheses mean negative", "expr": "parse_amount('(45.00)')", "expect": "-45.0"},
      {"name": "Surrounding whitespace", "expr": "parse_amount('  7 ')", "expect": "7.0"},
      {"name": "Empty string raises ValueError", "expr": "parse_amount('')", "raises": "ValueError"},
      {"name": "Misplaced comma raises ValueError", "expr": "parse_amount('1,23')", "raises": "ValueError"}
    ],
    "approach": [
      "Peel the string from the outside in: strip whitespace, detect and remove the negative marker, remove the $, then validate what's left.",
      "Validate before converting. float() accepts things you don't want (like 'nan' or '1e5') and rejects commas, so check the shape first, here with a regular expression.",
      "Let the empty-string case fall through to the same ValueError instead of special-casing it.",
      "Raise ValueError yourself with a clear message; don't return None or a sentinel."
    ],
    "walkthrough": [
      "`NUMBER = re.compile(...)`: the accepted shapes: comma-grouped digits like 1,234.50, or plain digits like 45.00.",
      "`s = text.strip()`: remove surrounding whitespace before looking at the first and last characters.",
      "`if s.startswith('(') and s.endswith(')'):` / `elif s.startswith('-'):`: detect either negative style and remove it.",
      "`if s.startswith('$'): s = s[1:]`: drop an optional dollar sign.",
      "`if not NUMBER.fullmatch(s): raise ValueError(...)`: fullmatch must match the whole string, so '12abc' and '1,23' fail. An empty string fails too.",
      "`value = float(s.replace(',', ''))`: only now is it safe to remove commas and convert."
    ],
    "mistakes": [
      "Removing every comma before validating, so '1,23' wrongly parses as 123.",
      "Calling float() on the raw text, which fails on '$' and ',' and accepts 'nan'.",
      "Forgetting the parentheses form of negative numbers.",
      "Catching the ValueError and returning None or 0, so the test expecting an exception fails."
    ]
  },
  {
    "id": "py-loan-classes",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "OOP: inheritance, method overriding, __str__",
    "title": "Loans with a promotional period",
    "prompt": [
      "Implement two classes.",
      "",
      "**`Loan(borrower, principal, annual_rate)`**",
      "- Raise `ValueError` if `principal <= 0` or `annual_rate < 0`.",
      "- `interest(months)` returns simple interest, `principal × annual_rate × months / 12`, rounded to 2 decimals. Raise `ValueError` if `months < 0`. Zero months gives `0.0`.",
      "- `str(loan)` returns `Borrower: $principal at rate%`, with the principal using thousands separators and 2 decimals, and the rate as a percentage with 2 decimals. Example: `Ana: $12,500.00 at 4.50%`",
      "",
      "**`PromoLoan(borrower, principal, annual_rate, promo_months)`**: a subclass of `Loan`. No interest is charged during the first `promo_months` months, so `interest(months)` charges only the months after the promotion. `str()` adds ` (promo N months)` to the end of the parent's text."
    ],
    "starter": [
      "class Loan:",
      "    def __init__(self, borrower, principal, annual_rate):",
      "        pass",
      "",
      "    def interest(self, months):",
      "        pass",
      "",
      "    def __str__(self):",
      "        pass",
      "",
      "",
      "class PromoLoan(Loan):",
      "    def __init__(self, borrower, principal, annual_rate, promo_months):",
      "        pass",
      "",
      "    def interest(self, months):",
      "        pass",
      "",
      "    def __str__(self):",
      "        pass",
      ""
    ],
    "solution": [
      "class Loan:",
      "    def __init__(self, borrower, principal, annual_rate):",
      "        if principal <= 0:",
      "            raise ValueError('principal must be positive')",
      "        if annual_rate < 0:",
      "            raise ValueError('annual_rate cannot be negative')",
      "        self.borrower = borrower",
      "        self.principal = principal",
      "        self.annual_rate = annual_rate",
      "",
      "    def interest(self, months):",
      "        if months < 0:",
      "            raise ValueError('months cannot be negative')",
      "        return round(self.principal * self.annual_rate * months / 12, 2)",
      "",
      "    def __str__(self):",
      "        return f'{self.borrower}: ${self.principal:,.2f} at {self.annual_rate * 100:.2f}%'",
      "",
      "",
      "class PromoLoan(Loan):",
      "    def __init__(self, borrower, principal, annual_rate, promo_months):",
      "        super().__init__(borrower, principal, annual_rate)",
      "        self.promo_months = promo_months",
      "",
      "    def interest(self, months):",
      "        if months < 0:",
      "            raise ValueError('months cannot be negative')",
      "        return super().interest(max(0, months - self.promo_months))",
      "",
      "    def __str__(self):",
      "        return f'{super().__str__()} (promo {self.promo_months} months)'",
      ""
    ],
    "tests": [
      {
        "name": "Simple interest for 6 months",
        "expr": "Loan('Ana', 12000, 0.05).interest(6)",
        "expect": "300.0"
      },
      {"name": "Zero months is zero interest", "expr": "Loan('Ana', 1000, 0.07).interest(0)", "expect": "0.0"},
      {
        "name": "String format",
        "expr": "str(Loan('Ana', 12500, 0.045))",
        "expect": "'Ana: $12,500.00 at 4.50%'"
      },
      {"name": "Zero principal raises ValueError", "expr": "Loan('Bo', 0, 0.05)", "raises": "ValueError"},
      {
        "name": "Promo months are free, later months are charged",
        "setup": "p = PromoLoan('Cy', 12000, 0.06, 3)",
        "expr": "(p.interest(2), p.interest(5))",
        "expect": "(0.0, 120.0)"
      },
      {
        "name": "Promo string extends the parent's",
        "expr": "str(PromoLoan('Cy', 12000, 0.06, 3))",
        "expect": "'Cy: $12,000.00 at 6.00% (promo 3 months)'"
      }
    ],
    "approach": [
      "Validate in __init__ and raise immediately, before storing anything.",
      "Use format specs for output: {x:,.2f} gives thousands separators and 2 decimals; multiply the rate by 100 for a percentage.",
      "In the subclass, reuse the parent: super().__init__ for setup, super().interest for the formula, super().__str__ for the text. Override only what changes.",
      "Handle the boundary where months is less than the promotion: max(0, months − promo) keeps it from going negative."
    ],
    "walkthrough": [
      "Validation in __init__ (`if principal <= 0: raise ValueError`): a bad object is never created.",
      "`round(self.principal * self.annual_rate * months / 12, 2)`: compute first, round once at the end.",
      "`f'{self.borrower}: ${self.principal:,.2f} at {self.annual_rate * 100:.2f}%'`: :,.2f gives 12,500.00; multiply the rate by 100 for a percentage.",
      "`super().interest(max(0, months - self.promo_months))`: charge only the months after the promotion, never a negative number of months.",
      "`f'{super().__str__()} (promo {self.promo_months} months)'`: extend the parent's text instead of rebuilding it."
    ],
    "mistakes": [
      "Formatting with str(principal), which gives '12500' instead of '12,500.00'.",
      "Rounding the rate or principal instead of the final interest.",
      "Copying the parent's formula into the subclass instead of calling super(), then forgetting to round there.",
      "Charging negative interest when months < promo_months.",
      "Printing the text inside __str__ instead of returning it, so str() raises TypeError: __str__ returned non-string."
    ]
  },
  {
    "id": "py-monthly-totals",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Dictionaries, string slicing and rounding",
    "title": "Monthly spending totals",
    "prompt": [
      "Write `monthly_totals(transactions)`. Each transaction is a dict like `{'date': '2025-01-15', 'amount': 42.5}`. An `amount` of `None` means the transaction was voided.",
      "",
      "Return a dict that maps each month (`'YYYY-MM'`) to the total amount for that month, rounded to 2 decimals. Voided transactions add nothing, but a month whose transactions are all voided still appears with `0.0`. The dict's keys must be in ascending month order. An empty list returns `{}`."
    ],
    "starter": ["def monthly_totals(transactions):", "    pass", ""],
    "solution": [
      "def monthly_totals(transactions):",
      "    totals = {}",
      "    for t in transactions:",
      "        month = t['date'][:7]",
      "        totals.setdefault(month, 0.0)",
      "        if t['amount'] is not None:",
      "            totals[month] += t['amount']",
      "    return {month: round(totals[month], 2) for month in sorted(totals)}",
      ""
    ],
    "tests": [
      {
        "name": "Two months",
        "expr": "monthly_totals([{'date': '2025-01-03', 'amount': 10.0}, {'date': '2025-01-20', 'amount': 5.5}, {'date': '2025-02-01', 'amount': 7.0}])",
        "expect": "{'2025-01': 15.5, '2025-02': 7.0}"
      },
      {
        "name": "Rounded to 2 decimals",
        "expr": "monthly_totals([{'date': '2025-03-01', 'amount': 0.1}, {'date': '2025-03-02', 'amount': 0.2}])",
        "expect": "{'2025-03': 0.3}"
      },
      {
        "name": "Voided amounts are skipped",
        "expr": "monthly_totals([{'date': '2025-04-01', 'amount': None}, {'date': '2025-04-09', 'amount': 20.0}])",
        "expect": "{'2025-04': 20.0}"
      },
      {
        "name": "Month with only voided transactions shows 0.0",
        "expr": "monthly_totals([{'date': '2025-05-05', 'amount': None}])",
        "expect": "{'2025-05': 0.0}"
      },
      {"name": "Empty input", "expr": "monthly_totals([])", "expect": "{}"},
      {
        "name": "Keys in ascending month order",
        "expr": "list(monthly_totals([{'date': '2025-02-10', 'amount': 1.0}, {'date': '2024-12-31', 'amount': 2.0}, {'date': '2025-01-01', 'amount': 3.0}]))",
        "expect": "['2024-12', '2025-01', '2025-02']"
      }
    ],
    "approach": [
      "The month key is the first 7 characters of the date: date[:7].",
      "Create the key even for voided transactions (setdefault), so an all-voided month still appears with 0.0. Only add when the amount isn't None.",
      "Round at the end, not on each addition, so rounding errors don't pile up.",
      "Dicts keep insertion order, so build the final dict from sorted(keys) to control the order."
    ],
    "walkthrough": [
      "`month = t['date'][:7]`: slicing the first 7 characters of '2025-01-15' gives '2025-01'.",
      "`totals.setdefault(month, 0.0)`: create the month even if its only transactions are voided.",
      "`if t['amount'] is not None: totals[month] += t['amount']`: skip voided amounts; None + a number would raise TypeError.",
      "`{month: round(totals[month], 2) for month in sorted(totals)}`: a dict comprehension over sorted keys builds the result in month order and rounds each total once."
    ],
    "mistakes": [
      "Skipping voided transactions entirely, so an all-voided month never appears.",
      "total += None, which raises TypeError.",
      "Returning 0.30000000000000004 because the total was never rounded.",
      "Returning keys in input order instead of month order."
    ]
  },
  {
    "id": "py-transfer-exceptions",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Exceptions: custom hierarchy, raising and catching",
    "title": "Transfers that fail safely",
    "prompt": [
      "Define an exception hierarchy:",
      "- `TransferError`, a subclass of `Exception`",
      "- `UnknownAccountError` and `InsufficientBalanceError`, both subclasses of `TransferError`",
      "",
      "Write `transfer(balances, src, dst, amount)`. `balances` is a dict of account name to balance. Move `amount` from `src` to `dst` by updating the dict. Check in this order and raise the first problem you find, leaving `balances` unchanged:",
      "1. `amount <= 0`: raise `ValueError`",
      "2. `src` or `dst` is not in `balances`: raise `UnknownAccountError`",
      "3. `balances[src] < amount`: raise `InsufficientBalanceError` (moving the entire balance is allowed)",
      "",
      "Write `run_batch(balances, transfers)`. `transfers` is a list of `(src, dst, amount)` tuples. Apply them in order. Skip any transfer that raises a `TransferError` and keep going. Return the number of skipped transfers. A `ValueError` means the batch itself is broken: do not catch it."
    ],
    "starter": [
      "class TransferError(Exception):",
      "    pass",
      "",
      "",
      "class UnknownAccountError(TransferError):",
      "    pass",
      "",
      "",
      "class InsufficientBalanceError(TransferError):",
      "    pass",
      "",
      "",
      "def transfer(balances, src, dst, amount):",
      "    pass",
      "",
      "",
      "def run_batch(balances, transfers):",
      "    pass",
      ""
    ],
    "solution": [
      "class TransferError(Exception):",
      "    pass",
      "",
      "",
      "class UnknownAccountError(TransferError):",
      "    pass",
      "",
      "",
      "class InsufficientBalanceError(TransferError):",
      "    pass",
      "",
      "",
      "def transfer(balances, src, dst, amount):",
      "    if amount <= 0:",
      "        raise ValueError(f'Amount must be positive, got {amount}')",
      "    for name in (src, dst):",
      "        if name not in balances:",
      "            raise UnknownAccountError(name)",
      "    if balances[src] < amount:",
      "        raise InsufficientBalanceError(f'{src} has {balances[src]}, needs {amount}')",
      "    balances[src] -= amount",
      "    balances[dst] += amount",
      "",
      "",
      "def run_batch(balances, transfers):",
      "    skipped = 0",
      "    for src, dst, amount in transfers:",
      "        try:",
      "            transfer(balances, src, dst, amount)",
      "        except TransferError:",
      "            skipped += 1",
      "    return skipped",
      ""
    ],
    "tests": [
      {
        "name": "Money moves between accounts",
        "setup": "b = {'A': 100, 'B': 0}\ntransfer(b, 'A', 'B', 40)",
        "expr": "b",
        "expect": "{'A': 60, 'B': 40}"
      },
      {
        "name": "Moving the whole balance is allowed",
        "setup": "b = {'A': 100, 'B': 0}\ntransfer(b, 'A', 'B', 100)",
        "expr": "b",
        "expect": "{'A': 0, 'B': 100}"
      },
      {
        "name": "Unknown account raises UnknownAccountError",
        "setup": "b = {'A': 100}",
        "expr": "transfer(b, 'A', 'Z', 10)",
        "raises": "UnknownAccountError"
      },
      {
        "name": "Insufficient balance raises and changes nothing",
        "setup": "b = {'A': 50, 'B': 0}\ntry:\n    transfer(b, 'A', 'B', 60)\n    raised = False\nexcept InsufficientBalanceError:\n    raised = True",
        "expr": "(raised, b)",
        "expect": "(True, {'A': 50, 'B': 0})"
      },
      {
        "name": "Batch skips failures and applies the rest",
        "setup": "b = {'A': 100, 'B': 50}\nn = run_batch(b, [('A', 'B', 30), ('B', 'Z', 5), ('B', 'A', 500), ('B', 'A', 80)])",
        "expr": "(n, b)",
        "expect": "(2, {'A': 150, 'B': 0})"
      },
      {
        "name": "Batch does not swallow ValueError",
        "expr": "run_batch({'A': 10, 'B': 0}, [('A', 'B', 0)])",
        "raises": "ValueError"
      }
    ],
    "approach": [
      "Build the hierarchy with empty class bodies: class UnknownAccountError(TransferError): pass. Catching TransferError then also catches both subclasses.",
      "Check every condition before touching the dict, in the order given, so a failed transfer changes nothing.",
      "In run_batch, catch the narrowest exception that should be skipped (TransferError), never a bare except or Exception, so the ValueError still propagates.",
      "Walk through the batch test by hand: after the first transfer A=70, B=80; the second fails (unknown Z); the third fails (80 < 500); the fourth leaves B=0, A=150."
    ],
    "walkthrough": [
      "`class UnknownAccountError(TransferError): pass`: subclassing TransferError means `except TransferError` catches it too.",
      "`if amount <= 0: raise ValueError(...)`: first check, as the prompt orders them.",
      "`for name in (src, dst): if name not in balances: raise UnknownAccountError(name)`: check both accounts before touching the dict.",
      "`if balances[src] < amount: raise InsufficientBalanceError(...)`: < allows moving the entire balance.",
      "`balances[src] -= amount` and `balances[dst] += amount`: only after every check has passed.",
      "`try: transfer(...) except TransferError: skipped += 1`: catch the family of expected failures and nothing else, so a ValueError still propagates."
    ],
    "mistakes": [
      "except Exception: in run_batch, which also swallows the ValueError the last test expects.",
      "Checking the balance before the account names, so a transfer to an unknown account can still raise KeyError instead of UnknownAccountError.",
      "Subtracting from src before checking dst exists, so a failed transfer still changes the balance.",
      "Using <= in the balance check, which blocks moving the whole balance.",
      "Making UnknownAccountError subclass Exception directly, so except TransferError doesn't catch it."
    ]
  },
  {
    "id": "py-normalize-names",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "String manipulation and de-duplication",
    "title": "Normalize customer names",
    "prompt": [
      "Customer names were typed in by hand. Write `normalize_names(names)` that cleans a list of raw names:",
      "",
      "- Skip entries that are `None` or contain only whitespace.",
      "- Split each name on whitespace and join the words with single spaces.",
      "- In each word, upper-case the first character and lower-case all the others (so `MARY-ANNE` becomes `Mary-anne`).",
      "- Remove duplicates, keeping the first occurrence, comparing the cleaned names.",
      "",
      "Return the cleaned names in their original order. An empty list returns `[]`."
    ],
    "starter": ["def normalize_names(names):", "    pass", ""],
    "solution": [
      "def normalize_names(names):",
      "    seen = set()",
      "    cleaned = []",
      "    for raw in names:",
      "        if raw is None:",
      "            continue",
      "        words = raw.split()",
      "        if not words:",
      "            continue",
      "        name = ' '.join(w[:1].upper() + w[1:].lower() for w in words)",
      "        if name not in seen:",
      "            seen.add(name)",
      "            cleaned.append(name)",
      "    return cleaned",
      ""
    ],
    "tests": [
      {
        "name": "Case and extra spaces",
        "expr": "normalize_names(['  ana   CHEN '])",
        "expect": "['Ana Chen']"
      },
      {
        "name": "Only the first letter of each word is capitalized",
        "expr": "normalize_names([\"MARY-ANNE o'brien\"])",
        "expect": "[\"Mary-anne O'brien\"]"
      },
      {
        "name": "None and blank entries are skipped",
        "expr": "normalize_names([None, '   ', 'bo li'])",
        "expect": "['Bo Li']"
      },
      {
        "name": "Duplicates removed, first one kept",
        "expr": "normalize_names(['bo li', 'Ana Chen', 'BO  LI'])",
        "expect": "['Bo Li', 'Ana Chen']"
      },
      {"name": "Empty list", "expr": "normalize_names([])", "expect": "[]"},
      {
        "name": "Order is preserved",
        "expr": "normalize_names(['zed', 'amy', 'mo'])",
        "expect": "['Zed', 'Amy', 'Mo']"
      }
    ],
    "approach": [
      "str.split() with no argument splits on any run of whitespace and drops leading and trailing spaces, so ' '.join(s.split()) collapses spacing in one step.",
      "Follow the capitalization rule exactly: word[:1].upper() + word[1:].lower(). str.title() and str.capitalize() on the whole string do something different.",
      "Use a set for what you've already kept, and a list for the output, so order is preserved and lookups are fast.",
      "Filter None before calling any string method on the value."
    ],
    "walkthrough": [
      "`if raw is None: continue`: filter None before calling any string method on it.",
      "`words = raw.split()`: split on any whitespace; leading, trailing and repeated spaces disappear.",
      "`if not words: continue`: an all-space entry gives an empty list.",
      "`' '.join(w[:1].upper() + w[1:].lower() for w in words)`: first character upper, rest lower, words joined with single spaces. w[:1] is safe even for a 1-character word.",
      "`if name not in seen: seen.add(name); cleaned.append(name)`: the set gives fast lookups, the list keeps the original order."
    ],
    "mistakes": [
      "Using str.title(), which capitalizes after hyphens and apostrophes too ('Mary-Anne O'Brien'), contradicting the stated rule.",
      "Calling .split() on None, which raises AttributeError.",
      "De-duplicating with set(names) or a dict without care, which loses the original order.",
      "Comparing raw strings for duplicates, so 'bo li' and 'BO  LI' both survive."
    ]
  },
  {
    "id": "py-transaction-alerts",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Conditionals and printed output (HackerRank style)",
    "title": "Transaction alerts",
    "prompt": [
      "You are given a list of transaction amounts (whole dollars). For each amount, in order, print one line:",
      "",
      "- `REFUND` if the amount is negative",
      "- `FRAUD CHECK` if the amount is at least 5000 and is a multiple of 1000",
      "- `LARGE` if the amount is at least 5000 otherwise",
      "- `OK` for everything else, including 0",
      "",
      "Complete the function `transactionAlerts`. It prints its results; it does not return anything. If there are no transactions, print nothing.",
      "",
      "**Input format:** the first line is n, the number of transactions. Each of the next n lines holds one integer amount. The code that reads the input is already written for you."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'transactionAlerts' function below.",
      "#",
      "# The function accepts INTEGER_ARRAY amounts as parameter.",
      "#",
      "",
      "def transactionAlerts(amounts):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    amounts_count = int(input().strip())",
      "",
      "    amounts = []",
      "",
      "    for _ in range(amounts_count):",
      "        amounts_item = int(input().strip())",
      "        amounts.append(amounts_item)",
      "",
      "    transactionAlerts(amounts)",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def transactionAlerts(amounts):",
      "    for amount in amounts:",
      "        if amount < 0:",
      "            print('REFUND')",
      "        elif amount >= 5000 and amount % 1000 == 0:",
      "            print('FRAUD CHECK')",
      "        elif amount >= 5000:",
      "            print('LARGE')",
      "        else:",
      "            print('OK')",
      "",
      "if __name__ == '__main__':",
      "    amounts_count = int(input().strip())",
      "",
      "    amounts = []",
      "",
      "    for _ in range(amounts_count):",
      "        amounts_item = int(input().strip())",
      "        amounts.append(amounts_item)",
      "",
      "    transactionAlerts(amounts)",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "5\n120\n5000\n7350\n-40\n0\n",
        "stdout": "OK\nFRAUD CHECK\nLARGE\nREFUND\nOK\n"
      },
      {"name": "Just around 5000", "stdin": "3\n4999\n5001\n10000\n", "stdout": "OK\nLARGE\nFRAUD CHECK\n"},
      {"name": "No transactions", "stdin": "0\n", "stdout": ""},
      {"name": "Negative multiple of 1000 is a refund", "stdin": "2\n-5000\n1000\n", "stdout": "REFUND\nOK\n"},
      {"name": "Single round amount", "stdin": "1\n6000\n", "stdout": "FRAUD CHECK\n"},
      {
        "name": "Mixed small amounts",
        "stdin": "4\n999\n1000\n-1\n5500\n",
        "stdout": "OK\nOK\nREFUND\nLARGE\n"
      }
    ],
    "approach": [
      "This is FizzBuzz with a banking theme: an if/elif chain where the order of the checks matters.",
      "Put the most specific rule first. Negative amounts come before the \"at least 5000\" rules, and FRAUD CHECK (a special case of large) comes before LARGE.",
      "Print exactly the words asked for, one per line, with nothing else. HackerRank compares your printed output line by line.",
      "Don't edit the input code under __main__, and don't print anything extra (such as debugging text) in your final answer."
    ],
    "walkthrough": [
      "`for amount in amounts:`: one output line per amount, in input order.",
      "`if amount < 0: print('REFUND')`: the sign check comes first, so -5000 can't reach the FRAUD CHECK rule.",
      "`elif amount >= 5000 and amount % 1000 == 0: print('FRAUD CHECK')`: the specific large case before the general one. % gives the remainder, 0 for multiples.",
      "`elif amount >= 5000: print('LARGE')` then `else: print('OK')`: the general large case, then everything else.",
      "The function returns nothing; the main block already calls it, so don't wrap it in print()."
    ],
    "mistakes": [
      "Checking LARGE before FRAUD CHECK, so 5000 and 10000 print LARGE.",
      "Writing amount > 5000, which misses exactly 5000.",
      "Letting -5000 fall into FRAUD CHECK because -5000 % 1000 == 0, by testing the multiple before the sign.",
      "Returning a list instead of printing, or calling print(transactionAlerts(amounts)), which adds a line saying None.",
      "Leaving the stub's \"# Write your code here\" with no code under it: Python raises IndentationError."
    ]
  },
  {
    "id": "py-most-active-account",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Parsing input, dictionaries and tie-breaks (HackerRank style)",
    "title": "Most active account",
    "prompt": [
      "Each transaction is a string with an account ID and an amount separated by a space, for example `A12 -250`. An account's **activity** is the sum of the absolute values of its amounts (so deposits and withdrawals both count).",
      "",
      "Complete `mostActiveAccount`, which returns the ID of the account with the highest activity. If several accounts tie, return the one whose ID comes first alphabetically (plain string comparison).",
      "",
      "**Input format:** the first line is n (n ≥ 1). Each of the next n lines is one transaction. The code that reads the input and writes your returned value is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'mostActiveAccount' function below.",
      "#",
      "# The function is expected to return a STRING.",
      "# The function accepts STRING_ARRAY transactions as parameter.",
      "#",
      "",
      "def mostActiveAccount(transactions):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    transactions_count = int(input().strip())",
      "",
      "    transactions = []",
      "",
      "    for _ in range(transactions_count):",
      "        transactions_item = input()",
      "        transactions.append(transactions_item)",
      "",
      "    result = mostActiveAccount(transactions)",
      "",
      "    fptr.write(result + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def mostActiveAccount(transactions):",
      "    activity = {}",
      "    for line in transactions:",
      "        account, amount = line.split()",
      "        activity[account] = activity.get(account, 0) + abs(int(amount))",
      "    return min(activity, key=lambda a: (-activity[a], a))",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    transactions_count = int(input().strip())",
      "",
      "    transactions = []",
      "",
      "    for _ in range(transactions_count):",
      "        transactions_item = input()",
      "        transactions.append(transactions_item)",
      "",
      "    result = mostActiveAccount(transactions)",
      "",
      "    fptr.write(result + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "tests": [
      {"name": "Sample case 0", "stdin": "4\nA12 100\nB07 -250\nA12 120\nC33 50\n", "stdout": "B07\n"},
      {"name": "Tie goes to the first ID alphabetically", "stdin": "2\nZ1 300\nA9 -300\n", "stdout": "A9\n"},
      {"name": "One transaction of zero", "stdin": "1\nQ5 0\n", "stdout": "Q5\n"},
      {
        "name": "Withdrawals count toward activity",
        "stdin": "5\nX1 10\nX2 20\nX1 -15\nX2 -5\nX3 24\n",
        "stdout": "X1\n"
      },
      {"name": "Totals across several lines", "stdin": "3\nM1 1000\nM2 999\nM2 2\n", "stdout": "M2\n"},
      {
        "name": "String order, not numeric order",
        "stdin": "3\nacc10 5\nacc9 5\nacc10 0\n",
        "stdout": "acc10\n"
      }
    ],
    "approach": [
      "Parse each line with split(): the first part is the ID, the second converts with int().",
      "Accumulate activity per account in a dict with abs() so withdrawals add, not subtract.",
      "Pick the winner with one key that encodes both rules: highest activity first, then alphabetical ID. min(d, key=lambda a: (-d[a], a)) does both.",
      "Return the string; the provided code writes it to the output file. If you print it instead, HackerRank shows it as debug output and the test still fails."
    ],
    "walkthrough": [
      "`account, amount = line.split()`: unpack the two words of each transaction.",
      "`activity[account] = activity.get(account, 0) + abs(int(amount))`: abs makes withdrawals add to activity.",
      "`min(activity, key=lambda a: (-activity[a], a))`: iterating a dict gives its keys; the key picks the highest activity and, for ties, the smallest ID.",
      "Return the ID: the main block writes it with fptr.write(result + '\\n')."
    ],
    "mistakes": [
      "Adding the signed amounts, so a withdrawal lowers activity: B07 would total -250 and lose.",
      "Using max(d, key=d.get), which breaks ties by dictionary order instead of alphabetically.",
      "Comparing IDs as numbers, or assuming 'acc9' sorts before 'acc10'. In string order, '1' comes before '9'.",
      "Printing the result instead of returning it."
    ]
  },
  {
    "id": "py-print-statement",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "String formatting and exact output (HackerRank style)",
    "title": "Print an account statement",
    "prompt": [
      "Print an account statement. You are given a starting balance and a list of transactions, each a date and an amount. For each transaction, in order, update the balance and print one line:",
      "",
      "`DATE AMOUNT BALANCE`",
      "",
      "- AMOUNT always shows its sign and 2 decimals, like `+50.00` or `-30.50`.",
      "- BALANCE shows 2 decimals and a minus sign only if it's negative, like `119.50` or `-80.50`.",
      "- If the new balance is below zero, add ` OVERDRAWN` at the end of that line. A balance of exactly 0 is not overdrawn.",
      "",
      "If there are no transactions, print `No transactions` instead.",
      "",
      "**Input format:** the first line is the starting balance. The second line is n. Each of the next n lines is a date and an amount separated by a space. The input code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'printStatement' function below.",
      "#",
      "# The function accepts following parameters:",
      "#  1. FLOAT start",
      "#  2. LIST transactions of (STRING date, FLOAT amount) pairs",
      "#",
      "",
      "def printStatement(start, transactions):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    start = float(input().strip())",
      "",
      "    n = int(input().strip())",
      "",
      "    transactions = []",
      "",
      "    for _ in range(n):",
      "        date, amount = input().split()",
      "        transactions.append((date, float(amount)))",
      "",
      "    printStatement(start, transactions)",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def printStatement(start, transactions):",
      "    if not transactions:",
      "        print('No transactions')",
      "        return",
      "    balance = start",
      "    for date, amount in transactions:",
      "        balance += amount",
      "        line = f'{date} {amount:+.2f} {balance:.2f}'",
      "        if balance < 0:",
      "            line += ' OVERDRAWN'",
      "        print(line)",
      "",
      "if __name__ == '__main__':",
      "    start = float(input().strip())",
      "",
      "    n = int(input().strip())",
      "",
      "    transactions = []",
      "",
      "    for _ in range(n):",
      "        date, amount = input().split()",
      "        transactions.append((date, float(amount)))",
      "",
      "    printStatement(start, transactions)",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "100\n3\n2025-01-03 50\n2025-01-04 -30.5\n2025-01-09 -200\n",
        "stdout": "2025-01-03 +50.00 150.00\n2025-01-04 -30.50 119.50\n2025-01-09 -200.00 -80.50 OVERDRAWN\n"
      },
      {"name": "No transactions", "stdin": "0\n0\n", "stdout": "No transactions\n"},
      {
        "name": "Exactly zero is not overdrawn",
        "stdin": "20\n1\n2025-02-01 -20\n",
        "stdout": "2025-02-01 -20.00 0.00\n"
      },
      {
        "name": "Starting below zero",
        "stdin": "-10\n1\n2025-03-01 5\n",
        "stdout": "2025-03-01 +5.00 -5.00 OVERDRAWN\n"
      },
      {
        "name": "Decimals are rounded for display",
        "stdin": "0.1\n1\n2025-04-01 0.2\n",
        "stdout": "2025-04-01 +0.20 0.30\n"
      },
      {
        "name": "A zero amount still shows a sign",
        "stdin": "50\n1\n2025-05-05 0\n",
        "stdout": "2025-05-05 +0.00 50.00\n"
      }
    ],
    "approach": [
      "Handle the empty case first and return early.",
      "Keep a running balance and format each line with an f-string: {amount:+.2f} forces a sign, {balance:.2f} gives 2 decimals.",
      "Compare the unrounded balance with 0 for the OVERDRAWN rule, and use < so exactly 0 isn't flagged.",
      "Output format is the whole question here: single spaces, no extra text, one line per transaction."
    ],
    "walkthrough": [
      "`if not transactions: print('No transactions'); return`: handle the empty case first and leave early.",
      "`balance += amount`: keep the running balance.",
      "`f'{date} {amount:+.2f} {balance:.2f}'`: :+.2f always shows a sign (+50.00, -30.50, +0.00); :.2f gives exactly 2 decimals.",
      "`if balance < 0: line += ' OVERDRAWN'`: strictly below zero, so a balance of 0.00 isn't flagged."
    ],
    "mistakes": [
      "Using {amount:.2f}, which drops the plus sign on deposits.",
      "Printing round(balance, 2), which shows 150.0 instead of 150.00.",
      "Using <= 0 for OVERDRAWN, which flags a zero balance.",
      "Printing nothing (instead of No transactions) when n is 0.",
      "Adding extra spaces or labels, which fail a line-by-line comparison."
    ]
  },
  {
    "id": "py-loan-decision",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Conditionals and boundaries (HackerRank style)",
    "title": "Loan decision",
    "prompt": [
      "Complete `loanDecision(score, income, debt)`, which returns one word for a loan application:",
      "",
      "- `REJECT` if the credit score is below 600, or if the monthly income is 0",
      "- `APPROVE` if the score is at least 720 and monthly debt is at most 35% of monthly income",
      "- `REVIEW` for everything else",
      "",
      "All three inputs are whole numbers.",
      "",
      "**Input format:** three lines: score, income, debt. The input and output code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'loanDecision' function below.",
      "#",
      "# The function is expected to return a STRING.",
      "# The function accepts following parameters:",
      "#  1. INTEGER score",
      "#  2. INTEGER income",
      "#  3. INTEGER debt",
      "#",
      "",
      "def loanDecision(score, income, debt):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    score = int(input().strip())",
      "",
      "    income = int(input().strip())",
      "",
      "    debt = int(input().strip())",
      "",
      "    result = loanDecision(score, income, debt)",
      "",
      "    fptr.write(result + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def loanDecision(score, income, debt):",
      "    if score < 600 or income == 0:",
      "        return 'REJECT'",
      "    if score >= 720 and debt * 100 <= income * 35:",
      "        return 'APPROVE'",
      "    return 'REVIEW'",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    score = int(input().strip())",
      "",
      "    income = int(input().strip())",
      "",
      "    debt = int(input().strip())",
      "",
      "    result = loanDecision(score, income, debt)",
      "",
      "    fptr.write(result + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "tests": [
      {"name": "Sample case 0", "stdin": "750\n5000\n1500\n", "stdout": "APPROVE\n"},
      {"name": "Score just under 600", "stdin": "599\n9000\n0\n", "stdout": "REJECT\n"},
      {"name": "Exactly 720 and exactly 35%", "stdin": "720\n4000\n1400\n", "stdout": "APPROVE\n"},
      {"name": "Score just under 720", "stdin": "719\n4000\n0\n", "stdout": "REVIEW\n"},
      {"name": "Zero income", "stdin": "800\n0\n0\n", "stdout": "REJECT\n"},
      {"name": "Debt one dollar over 35%", "stdin": "760\n3000\n1051\n", "stdout": "REVIEW\n"}
    ],
    "approach": [
      "Turn each rule into a condition, then order them: REJECT first (it overrides everything), then APPROVE, then REVIEW as the fallback.",
      "Read the boundary words: \"below 600\" is < 600, \"at least 720\" is >= 720, \"at most 35%\" is <=.",
      "Compare the percentage with whole numbers: debt * 100 <= income * 35 means debt / income <= 0.35, but with no division, so a zero income can't crash it and floats can't round wrongly.",
      "Return the word; the provided code writes it to the output."
    ],
    "walkthrough": [
      "`if score < 600 or income == 0:`: the two rejection rules together. `or` stops at the first true part, so a low score rejects without looking at income.",
      "`return 'REJECT'`: returning ends the function, so the later checks only run for applications that weren't rejected.",
      "`if score >= 720 and debt * 100 <= income * 35:`: both approval conditions must hold, so `and`. Cross-multiplying avoids dividing by income.",
      "`return 'REVIEW'`: anything that falls through both checks is reviewed. No `else` is needed because every earlier branch returns."
    ],
    "mistakes": [
      "Writing score > 720 or score <= 600, which gets the 720 and 600 boundaries wrong.",
      "Computing debt / income first, which raises ZeroDivisionError when income is 0.",
      "Comparing debt / income < 0.35, which rejects exactly 35%.",
      "Printing the word instead of returning it: the output file stays empty."
    ]
  },
  {
    "id": "py-top-memo-words",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Counting with dictionaries and sorting ties (HackerRank style)",
    "title": "Most common words in memos",
    "prompt": [
      "Transaction memos are free text. Complete `topWords(memos, k)`, which returns the `k` most common words as strings `\"word count\"`.",
      "",
      "- A word is any run of characters between spaces. Remove `.`, `,`, `!` and `?` from the start and end of each word, then make it lower case. Skip anything that becomes empty.",
      "- Order by count, highest first. Break ties alphabetically.",
      "- If there are fewer than `k` different words, return them all. If `k` is 0, return an empty list.",
      "",
      "**Input format:** n, then n memo lines, then k. The input and output code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'topWords' function below.",
      "#",
      "# The function is expected to return a STRING_ARRAY.",
      "# The function accepts following parameters:",
      "#  1. STRING_ARRAY memos",
      "#  2. INTEGER k",
      "#",
      "",
      "def topWords(memos, k):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    memos_count = int(input().strip())",
      "",
      "    memos = []",
      "",
      "    for _ in range(memos_count):",
      "        memos_item = input()",
      "        memos.append(memos_item)",
      "",
      "    k = int(input().strip())",
      "",
      "    result = topWords(memos, k)",
      "",
      "    fptr.write('\\n'.join(result))",
      "    fptr.write('\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "from collections import Counter",
      "",
      "",
      "def topWords(memos, k):",
      "    counts = Counter()",
      "    for memo in memos:",
      "        for word in memo.split():",
      "            w = word.strip('.,!?').lower()",
      "            if w:",
      "                counts[w] += 1",
      "    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))",
      "    return [f'{w} {c}' for w, c in ranked[:k]]",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    memos_count = int(input().strip())",
      "",
      "    memos = []",
      "",
      "    for _ in range(memos_count):",
      "        memos_item = input()",
      "        memos.append(memos_item)",
      "",
      "    k = int(input().strip())",
      "",
      "    result = topWords(memos, k)",
      "",
      "    fptr.write('\\n'.join(result))",
      "    fptr.write('\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "3\nCoffee at Cafe\ncoffee, bagel\nRENT payment\n2\n",
        "stdout": "coffee 2\nat 1\n"
      },
      {"name": "k larger than the number of words", "stdin": "1\nfee fee\n5\n", "stdout": "fee 2\n"},
      {
        "name": "Punctuation is stripped, empty words skipped",
        "stdin": "2\nATM fee!\n... fee.\n3\n",
        "stdout": "fee 2\natm 1\n"
      },
      {"name": "All tied: alphabetical", "stdin": "1\nb a c\n3\n", "stdout": "a 1\nb 1\nc 1\n"},
      {"name": "Case is ignored", "stdin": "2\nRent RENT\nrent\n1\n", "stdout": "rent 3\n"},
      {"name": "k is zero", "stdin": "1\nx\n0\n", "stdout": ""}
    ],
    "approach": [
      "Counting things is a dictionary job: collections.Counter, or a dict with .get(word, 0) + 1.",
      "Normalize each word the same way before counting: strip the punctuation from both ends, then lower-case, then skip empties.",
      "Sort the (word, count) pairs with one key that encodes both rules: (-count, word). Negating the count puts the biggest first while the word stays alphabetical.",
      "Slice the first k, which also handles k = 0 and k larger than the list."
    ],
    "walkthrough": [
      "`counts = Counter()`: a dict that starts every missing key at 0.",
      "`for word in memo.split():`: split() with no argument splits on any whitespace and never produces empty strings from double spaces.",
      "`w = word.strip('.,!?').lower()`: strip removes any of those characters from both ends only, so a word like \"e.g.\" keeps its inner dot.",
      "`if w: counts[w] += 1`: skip words that were only punctuation, like \"...\".",
      "`sorted(counts.items(), key=lambda item: (-item[1], item[0]))`: sort by count descending, then word ascending.",
      "`return [f'{w} {c}' for w, c in ranked[:k]]`: build the exact output strings. Slicing past the end of a list is safe in Python."
    ],
    "mistakes": [
      "Using most_common(k) alone: Counter breaks ties by first appearance, not alphabetically.",
      "Sorting with reverse=True on (count, word), which also reverses the words in a tie.",
      "Forgetting lower() or the punctuation strip, so 'Coffee' and 'coffee,' count separately.",
      "Splitting with split(' '), which creates empty strings from double spaces."
    ]
  },
  {
    "id": "py-validate-account-ids",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "String checks (HackerRank style)",
    "title": "Validate account IDs",
    "prompt": [
      "Complete `validateIds(ids)`, which prints `VALID` or `INVALID` for each ID, one per line, in order. Ignore spaces before or after an ID. An ID is valid when all of these hold:",
      "",
      "- It is exactly 10 characters long",
      "- The first 2 characters are capital letters A to Z",
      "- The last 8 characters are digits 0 to 9",
      "- Those 8 digits are not all the same digit",
      "",
      "**Input format:** n, then n IDs, one per line. The input code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'validateIds' function below.",
      "#",
      "# The function accepts STRING_ARRAY ids as parameter.",
      "#",
      "",
      "def validateIds(ids):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    ids_count = int(input().strip())",
      "",
      "    ids = []",
      "",
      "    for _ in range(ids_count):",
      "        ids_item = input()",
      "        ids.append(ids_item)",
      "",
      "    validateIds(ids)",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def validateIds(ids):",
      "    for raw in ids:",
      "        s = raw.strip()",
      "        ok = (",
      "            len(s) == 10",
      "            and all('A' <= c <= 'Z' for c in s[:2])",
      "            and all(c in '0123456789' for c in s[2:])",
      "            and len(set(s[2:])) > 1",
      "        )",
      "        print('VALID' if ok else 'INVALID')",
      "",
      "if __name__ == '__main__':",
      "    ids_count = int(input().strip())",
      "",
      "    ids = []",
      "",
      "    for _ in range(ids_count):",
      "        ids_item = input()",
      "        ids.append(ids_item)",
      "",
      "    validateIds(ids)",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "4\nCB12345678\ncb12345678\nCB1234567\nCB00000000\n",
        "stdout": "VALID\nINVALID\nINVALID\nINVALID\n"
      },
      {
        "name": "Surrounding spaces are ignored",
        "stdin": "2\n  AB98765432  \nA112345678\n",
        "stdout": "VALID\nINVALID\n"
      },
      {"name": "Letter in the digit part", "stdin": "1\nAB1234567X\n", "stdout": "INVALID\n"},
      {"name": "Space inside the ID", "stdin": "1\nAB12 45678\n", "stdout": "INVALID\n"},
      {
        "name": "Almost all the same digit",
        "stdin": "3\nZZ99999998\nZZ99999999\nQQ01010101\n",
        "stdout": "VALID\nINVALID\nVALID\n"
      },
      {"name": "No IDs", "stdin": "0\n", "stdout": ""}
    ],
    "approach": [
      "Strip first, then check each rule on the stripped string. Combine them with and so any failure makes it invalid.",
      "Check the length before slicing so the other checks look at the right characters.",
      "\"Not all the same digit\" means the set of the 8 digits has more than one element.",
      "Print exactly VALID or INVALID, one line per ID."
    ],
    "walkthrough": [
      "`s = raw.strip()`: removes spaces and the newline at both ends, never in the middle, so 'AB12 45678' still fails.",
      "`len(s) == 10`: comes first; `and` stops at the first false part.",
      "`all('A' <= c <= 'Z' for c in s[:2])`: compares characters by their code, so only A to Z pass. isupper() would also accept letters like 'É'.",
      "`all(c in '0123456789' for c in s[2:])`: an explicit digit check. isdigit() also accepts characters like '²'.",
      "`len(set(s[2:])) > 1`: a set keeps one copy of each digit, so all-the-same digits give a set of size 1.",
      "`print('VALID' if ok else 'INVALID')`: a conditional expression picks the word."
    ],
    "mistakes": [
      "Not stripping, so '  AB98765432  ' fails the length check.",
      "Using s.isalpha() on the first two characters, which accepts lower case.",
      "Checking only that the digits aren't all 0, instead of all the same digit.",
      "Returning a list instead of printing, when the starter calls the function without printing anything."
    ]
  },
  {
    "id": "py-process-commands",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Parsing commands and handling errors (HackerRank style)",
    "title": "Process account commands",
    "prompt": [
      "An account starts with a balance of 0. Complete `processCommands(commands)`, which handles each command in order and returns one output line per command:",
      "",
      "| Command | Output |",
      "|---|---|",
      "| `DEPOSIT x` | `OK`, after adding x |",
      "| `WITHDRAW x` | `OK`, after subtracting x |",
      "| `BALANCE` | the current balance, as a whole number |",
      "",
      "Errors (the balance doesn't change):",
      "",
      "- `ERROR invalid amount` if x is 0 or negative",
      "- `ERROR insufficient funds` if a withdrawal is larger than the balance (withdrawing the whole balance is fine)",
      "- `ERROR bad command` for anything else: an unknown or lower-case command, a missing or non-integer amount, or extra words",
      "",
      "**Input format:** n, then n commands. The input and output code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'processCommands' function below.",
      "#",
      "# The function is expected to return a STRING_ARRAY.",
      "# The function accepts STRING_ARRAY commands as parameter.",
      "#",
      "",
      "def processCommands(commands):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    commands_count = int(input().strip())",
      "",
      "    commands = []",
      "",
      "    for _ in range(commands_count):",
      "        commands_item = input()",
      "        commands.append(commands_item)",
      "",
      "    result = processCommands(commands)",
      "",
      "    fptr.write('\\n'.join(result))",
      "    fptr.write('\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def processCommands(commands):",
      "    balance = 0",
      "    out = []",
      "    for line in commands:",
      "        parts = line.split()",
      "        if parts == ['BALANCE']:",
      "            out.append(str(balance))",
      "            continue",
      "        if len(parts) != 2 or parts[0] not in ('DEPOSIT', 'WITHDRAW'):",
      "            out.append('ERROR bad command')",
      "            continue",
      "        try:",
      "            amount = int(parts[1])",
      "        except ValueError:",
      "            out.append('ERROR bad command')",
      "            continue",
      "        if amount <= 0:",
      "            out.append('ERROR invalid amount')",
      "        elif parts[0] == 'WITHDRAW' and amount > balance:",
      "            out.append('ERROR insufficient funds')",
      "        else:",
      "            balance += amount if parts[0] == 'DEPOSIT' else -amount",
      "            out.append('OK')",
      "    return out",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    commands_count = int(input().strip())",
      "",
      "    commands = []",
      "",
      "    for _ in range(commands_count):",
      "        commands_item = input()",
      "        commands.append(commands_item)",
      "",
      "    result = processCommands(commands)",
      "",
      "    fptr.write('\\n'.join(result))",
      "    fptr.write('\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "5\nDEPOSIT 100\nWITHDRAW 30\nBALANCE\nWITHDRAW 100\nBALANCE\n",
        "stdout": "OK\nOK\n70\nERROR insufficient funds\n70\n"
      },
      {
        "name": "Zero and negative amounts",
        "stdin": "3\nDEPOSIT 0\nDEPOSIT -5\nBALANCE\n",
        "stdout": "ERROR invalid amount\nERROR invalid amount\n0\n"
      },
      {
        "name": "Malformed commands",
        "stdin": "4\nDEPOSIT ten\nTRANSFER 5\nWITHDRAW\nBALANCE\n",
        "stdout": "ERROR bad command\nERROR bad command\nERROR bad command\n0\n"
      },
      {
        "name": "Withdrawing the whole balance",
        "stdin": "3\nDEPOSIT 50\nWITHDRAW 50\nBALANCE\n",
        "stdout": "OK\nOK\n0\n"
      },
      {
        "name": "Commands are case-sensitive",
        "stdin": "2\ndeposit 5\nBALANCE\n",
        "stdout": "ERROR bad command\n0\n"
      },
      {
        "name": "Extra words",
        "stdin": "2\nBALANCE 5\nDEPOSIT 5 5\n",
        "stdout": "ERROR bad command\nERROR bad command\n"
      }
    ],
    "approach": [
      "Split each line into words and decide what kind of line it is before doing anything: exactly ['BALANCE'], or exactly two words starting with DEPOSIT or WITHDRAW, or bad.",
      "Convert the amount inside try/except ValueError: int('ten') raises, and that's a bad command, not a crash.",
      "Then check the business rules in the order given: amount <= 0, then insufficient funds, then apply it.",
      "Only change the balance on the success path, so errors leave it untouched."
    ],
    "walkthrough": [
      "`parts = line.split()`: 'DEPOSIT 100' becomes ['DEPOSIT', '100'], and 'WITHDRAW' alone becomes ['WITHDRAW'].",
      "`if parts == ['BALANCE']:`: comparing whole lists rejects 'BALANCE 5' and 'balance' in one go.",
      "`if len(parts) != 2 or parts[0] not in ('DEPOSIT', 'WITHDRAW'):`: catches unknown commands, missing amounts and extra words.",
      "`try: amount = int(parts[1]) except ValueError:`: the narrowest exception that int() raises for bad text. A bare except would hide real bugs.",
      "`elif parts[0] == 'WITHDRAW' and amount > balance:`: > rather than >=, so withdrawing exactly the balance is allowed.",
      "`balance += amount if parts[0] == 'DEPOSIT' else -amount`: one line for both directions using a conditional expression."
    ],
    "mistakes": [
      "Calling int() without try/except, so 'DEPOSIT ten' crashes the whole program.",
      "Using line.startswith('DEPOSIT'), which also accepts 'DEPOSITX 5' or 'DEPOSIT 5 5'.",
      "Upper-casing the input, which makes 'deposit 5' valid when the prompt says commands are case-sensitive.",
      "Subtracting before checking funds, so a failed withdrawal still changes the balance."
    ]
  },
  {
    "id": "py-lowest-balance",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Loops and running values (HackerRank style)",
    "title": "Lowest balance reached",
    "prompt": [
      "Complete `lowestBalance(start, changes)`. The account starts at `start`, then each change is added in order. Return the lowest balance the account ever had, counting the starting balance.",
      "",
      "**Input format:** start, then n, then n changes, one per line. The input and output code is already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'lowestBalance' function below.",
      "#",
      "# The function is expected to return an INTEGER.",
      "# The function accepts following parameters:",
      "#  1. INTEGER start",
      "#  2. INTEGER_ARRAY changes",
      "#",
      "",
      "def lowestBalance(start, changes):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    start = int(input().strip())",
      "",
      "    changes_count = int(input().strip())",
      "",
      "    changes = []",
      "",
      "    for _ in range(changes_count):",
      "        changes_item = int(input().strip())",
      "        changes.append(changes_item)",
      "",
      "    result = lowestBalance(start, changes)",
      "",
      "    fptr.write(str(result) + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def lowestBalance(start, changes):",
      "    balance = start",
      "    lowest = start",
      "    for change in changes:",
      "        balance += change",
      "        lowest = min(lowest, balance)",
      "    return lowest",
      "",
      "if __name__ == '__main__':",
      "    fptr = open(os.environ['OUTPUT_PATH'], 'w')",
      "",
      "    start = int(input().strip())",
      "",
      "    changes_count = int(input().strip())",
      "",
      "    changes = []",
      "",
      "    for _ in range(changes_count):",
      "        changes_item = int(input().strip())",
      "        changes.append(changes_item)",
      "",
      "    result = lowestBalance(start, changes)",
      "",
      "    fptr.write(str(result) + '\\n')",
      "",
      "    fptr.close()",
      ""
    ],
    "tests": [
      {"name": "Sample case 0", "stdin": "100\n4\n-50\n20\n-80\n10\n", "stdout": "-10\n"},
      {"name": "No changes", "stdin": "0\n0\n", "stdout": "0\n"},
      {"name": "Start is the lowest", "stdin": "5\n3\n1\n2\n3\n", "stdout": "5\n"},
      {"name": "Starting negative", "stdin": "-20\n2\n-5\n30\n", "stdout": "-25\n"},
      {"name": "Exactly reaches zero", "stdin": "10\n1\n-10\n", "stdout": "0\n"},
      {"name": "Lowest point in the middle", "stdin": "1000\n3\n-999\n-1\n500\n", "stdout": "0\n"}
    ],
    "approach": [
      "Keep two variables: the running balance, and the lowest value seen so far.",
      "Start both at the starting balance, so an empty list or a list of deposits returns the start.",
      "After each change, update the balance, then the minimum.",
      "Return an int; the provided code converts it to text."
    ],
    "walkthrough": [
      "`balance = start` and `lowest = start`: the starting balance counts, which handles the empty list for free.",
      "`balance += change`: apply the change in order.",
      "`lowest = min(lowest, balance)`: keep the smaller of the old minimum and the new balance.",
      "`return lowest`: return, don't print; the main block writes it."
    ],
    "mistakes": [
      "Starting lowest at 0, which is wrong when every balance stays above 0 or the start is negative.",
      "Returning min(changes), the smallest change instead of the smallest balance.",
      "Forgetting the start, so 'Start is the lowest' returns a later, higher balance."
    ]
  },
  {
    "id": "py-sort-transactions",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Sorting with a lambda key and formatting (HackerRank style)",
    "title": "Sort transactions for review",
    "prompt": [
      "Complete `sortTransactions(rows)`. Each row is a tuple `(txn_id, date, amount)` where date is `YYYY-MM-DD` text and amount is a float. Return a list of lines `\"txn_id date amount\"` (amount with exactly 2 decimals), ordered by:",
      "",
      "- amount, largest first",
      "- then date, earliest first",
      "- then txn_id, in plain string order",
      "",
      "**Input format:** n, then n lines of `txn_id date amount`. The input code and the printing are already written."
    ],
    "starter": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "#",
      "# Complete the 'sortTransactions' function below.",
      "#",
      "# The function is expected to return a STRING_ARRAY.",
      "# The function accepts a LIST of (STRING, STRING, FLOAT) tuples as parameter.",
      "#",
      "",
      "def sortTransactions(rows):",
      "    # Write your code here",
      "",
      "if __name__ == '__main__':",
      "    n = int(input().strip())",
      "",
      "    rows = []",
      "",
      "    for _ in range(n):",
      "        txn_id, date, amount = input().split()",
      "        rows.append((txn_id, date, float(amount)))",
      "",
      "    for line in sortTransactions(rows):",
      "        print(line)",
      ""
    ],
    "solution": [
      "#!/bin/python3",
      "",
      "import math",
      "import os",
      "import random",
      "import re",
      "import sys",
      "",
      "",
      "def sortTransactions(rows):",
      "    ordered = sorted(rows, key=lambda r: (-r[2], r[1], r[0]))",
      "    return [f'{txn_id} {date} {amount:.2f}' for txn_id, date, amount in ordered]",
      "",
      "if __name__ == '__main__':",
      "    n = int(input().strip())",
      "",
      "    rows = []",
      "",
      "    for _ in range(n):",
      "        txn_id, date, amount = input().split()",
      "        rows.append((txn_id, date, float(amount)))",
      "",
      "    for line in sortTransactions(rows):",
      "        print(line)",
      ""
    ],
    "tests": [
      {
        "name": "Sample case 0",
        "stdin": "4\nT3 2025-01-05 20.5\nT1 2025-01-03 100\nT2 2025-01-04 20.5\nT4 2025-01-01 5\n",
        "stdout": "T1 2025-01-03 100.00\nT2 2025-01-04 20.50\nT3 2025-01-05 20.50\nT4 2025-01-01 5.00\n"
      },
      {
        "name": "Same amount and date: by ID",
        "stdin": "2\nB 2025-02-02 10\nA 2025-02-02 10\n",
        "stdout": "A 2025-02-02 10.00\nB 2025-02-02 10.00\n"
      },
      {
        "name": "Negative and zero amounts",
        "stdin": "3\nX 2025-03-01 -5\nY 2025-03-01 0\nZ 2025-03-02 -5\n",
        "stdout": "Y 2025-03-01 0.00\nX 2025-03-01 -5.00\nZ 2025-03-02 -5.00\n"
      },
      {"name": "One row", "stdin": "1\nQ 2025-04-04 1.005\n", "stdout": "Q 2025-04-04 1.00\n"},
      {"name": "No rows", "stdin": "0\n", "stdout": ""},
      {
        "name": "IDs compare as strings",
        "stdin": "2\nT9 2025-05-05 7\nT10 2025-05-05 7\n",
        "stdout": "T10 2025-05-05 7.00\nT9 2025-05-05 7.00\n"
      }
    ],
    "approach": [
      "One sorted() call with a tuple key handles all three rules: Python compares tuples element by element.",
      "Negate the amount so the largest comes first while date and ID stay ascending.",
      "'YYYY-MM-DD' text sorts in date order, so there's no need to parse dates.",
      "Format with {amount:.2f}; don't round() and print, which drops trailing zeros."
    ],
    "walkthrough": [
      "`sorted(rows, key=lambda r: (-r[2], r[1], r[0]))`: the lambda turns each row into (−amount, date, id); sorted orders by that tuple.",
      "Negating works for numbers only. To reverse a text key you'd need a second, stable sort pass instead.",
      "`f'{txn_id} {date} {amount:.2f}'`: :.2f always shows two decimals: 100 becomes 100.00 and 20.5 becomes 20.50.",
      "1.005 prints as 1.00 because the float is really 1.00499999..., the same as on HackerRank, since it also runs CPython."
    ],
    "mistakes": [
      "sorted(..., reverse=True) with key (amount, date, id), which also reverses the date and ID tie-breaks.",
      "Comparing IDs as numbers: the prompt says plain string order, so 'T10' comes before 'T9'.",
      "Printing str(amount), which shows 100.0 and 20.5.",
      "Returning the tuples instead of formatted strings."
    ]
  },
  {
    "id": "py-card-fees-inheritance",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "OOP: inheritance, overriding and class attributes",
    "title": "Card fees with subclasses",
    "prompt": [
      "Implement a small card hierarchy.",
      "",
      "**`Card(holder, balance)`**",
      "- `monthly_fee()` returns `0.0`",
      "- `interest()` returns 2% of the balance, rounded to 2 decimals, or `0.0` if the balance is 0 or negative",
      "- `statement()` returns `\"HOLDER: fee F, interest I\"` with F and I shown to 2 decimals",
      "",
      "**`PremiumCard(Card)`**: monthly fee `15.0`, interest rate 1.5%.",
      "",
      "**`StudentCard(Card)`**: no fee, 2% interest, but interest is capped at `10.0` per month.",
      "",
      "Finally, write `total_charges(cards)`, which returns the total of every card's fee plus interest, rounded to 2 decimals. `statement()` should work for every card type without being rewritten in the subclasses."
    ],
    "starter": [
      "class Card:",
      "    def __init__(self, holder, balance):",
      "        pass",
      "",
      "    def monthly_fee(self):",
      "        pass",
      "",
      "    def interest(self):",
      "        pass",
      "",
      "    def statement(self):",
      "        pass",
      "",
      "",
      "class PremiumCard(Card):",
      "    pass",
      "",
      "",
      "class StudentCard(Card):",
      "    pass",
      "",
      "",
      "def total_charges(cards):",
      "    pass",
      ""
    ],
    "solution": [
      "class Card:",
      "    FEE = 0.0",
      "    RATE = 0.02",
      "",
      "    def __init__(self, holder, balance):",
      "        self.holder = holder",
      "        self.balance = balance",
      "",
      "    def monthly_fee(self):",
      "        return self.FEE",
      "",
      "    def interest(self):",
      "        if self.balance <= 0:",
      "            return 0.0",
      "        return round(self.balance * self.RATE, 2)",
      "",
      "    def statement(self):",
      "        return f'{self.holder}: fee {self.monthly_fee():.2f}, interest {self.interest():.2f}'",
      "",
      "",
      "class PremiumCard(Card):",
      "    FEE = 15.0",
      "    RATE = 0.015",
      "",
      "",
      "class StudentCard(Card):",
      "    CAP = 10.0",
      "",
      "    def interest(self):",
      "        return min(super().interest(), self.CAP)",
      "",
      "",
      "def total_charges(cards):",
      "    return round(sum(c.monthly_fee() + c.interest() for c in cards), 2)",
      ""
    ],
    "tests": [
      {"name": "Basic card interest", "expr": "Card('Ana', 500).interest()", "expect": "10.0"},
      {
        "name": "Premium statement uses the overridden fee and rate",
        "expr": "PremiumCard('Bo', 1000).statement()",
        "expect": "'Bo: fee 15.00, interest 15.00'"
      },
      {"name": "Student interest is capped", "expr": "StudentCard('Cy', 2000).interest()", "expect": "10.0"},
      {"name": "No interest on a credit balance", "expr": "Card('Dee', -50).interest()", "expect": "0.0"},
      {
        "name": "Subclass is a Card and inherits behavior",
        "expr": "(issubclass(PremiumCard, Card), StudentCard('E', 0).interest())",
        "expect": "(True, 0.0)"
      },
      {
        "name": "Total across card types",
        "expr": "total_charges([Card('A', 100), PremiumCard('B', 200), StudentCard('C', 100)])",
        "expect": "22.0"
      }
    ],
    "approach": [
      "Put shared behavior in the parent and let subclasses change only what differs. Here the difference is just two numbers (fee and rate) plus one rule (the cap).",
      "Class attributes (FEE, RATE) are a clean way to vary numbers: the parent's methods read self.FEE, and Python finds the subclass's value first.",
      "Write statement() once in Card, calling self.monthly_fee() and self.interest(). Calling through self is what makes the subclass versions run (polymorphism).",
      "For the cap, override interest() in StudentCard and reuse the parent's calculation with super().interest()."
    ],
    "walkthrough": [
      "`FEE = 0.0` and `RATE = 0.02` on Card: class attributes, shared by every instance unless a subclass defines its own.",
      "`return self.FEE`: self.FEE looks on the object, then its class (PremiumCard), then the parent (Card). That lookup order is the method resolution order.",
      "`if self.balance <= 0: return 0.0`: the guard comes first, so negative balances never compute negative interest.",
      "`class PremiumCard(Card): FEE = 15.0; RATE = 0.015`: no methods needed; the inherited methods pick up the new numbers.",
      "`return min(super().interest(), self.CAP)`: super() runs Card.interest with this object's RATE, then the cap applies.",
      "`round(sum(c.monthly_fee() + c.interest() for c in cards), 2)`: a generator expression adds each card's charges; each call dispatches to the right subclass."
    ],
    "mistakes": [
      "Copying statement() into every subclass instead of calling the overridable methods through self.",
      "Hard-coding 0.02 inside interest(), so PremiumCard can't change the rate without rewriting the method.",
      "Writing Card.interest(self) logic again in StudentCard instead of super().interest(), then forgetting the rounding.",
      "Formatting with str(fee), which prints 15.0 instead of 15.00."
    ]
  },
  {
    "id": "py-safe-average",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Exceptions: try/except while converting",
    "title": "Average of messy amounts",
    "prompt": [
      "A spreadsheet column of amounts was exported as text, and some cells are junk. Write `average_amount(values)`:",
      "",
      "- Convert each value with `float()`. Skip any value that can't be converted, including `None`.",
      "- Return the average of the values that converted, rounded to 2 decimals.",
      "- If nothing converted (or the list is empty), return `0.0`."
    ],
    "starter": ["def average_amount(values):", "    pass", ""],
    "solution": [
      "def average_amount(values):",
      "    numbers = []",
      "    for v in values:",
      "        try:",
      "            numbers.append(float(v))",
      "        except (TypeError, ValueError):",
      "            continue",
      "    if not numbers:",
      "        return 0.0",
      "    return round(sum(numbers) / len(numbers), 2)",
      ""
    ],
    "tests": [
      {"name": "All valid", "expr": "average_amount(['10', '20', '30'])", "expect": "20.0"},
      {"name": "Junk text is skipped", "expr": "average_amount(['10', 'abc', '20'])", "expect": "15.0"},
      {"name": "Empty list", "expr": "average_amount([])", "expect": "0.0"},
      {"name": "Nothing valid, including None", "expr": "average_amount(['x', None])", "expect": "0.0"},
      {"name": "Spaces around numbers are fine", "expr": "average_amount([' 7.5 ', '2.5'])", "expect": "5.0"},
      {"name": "Rounded to 2 decimals", "expr": "average_amount(['-4', '4', '1'])", "expect": "0.33"}
    ],
    "approach": [
      "Converting text that might be bad is exactly what try/except is for: attempt float(v), and if it raises, skip the value.",
      "Catch only the exceptions float() really raises: ValueError for bad text and TypeError for None.",
      "Guard the division: if nothing converted, return 0.0 instead of dividing by zero.",
      "Round once, at the end."
    ],
    "walkthrough": [
      "`numbers.append(float(v))` inside `try`: if float() raises, append never runs.",
      "`except (TypeError, ValueError):`: a tuple catches either type. float(None) raises TypeError; float('abc') raises ValueError.",
      "`continue`: move on to the next value.",
      "`if not numbers: return 0.0`: an empty list is falsy, so this handles both the empty input and the all-junk input.",
      "`round(sum(numbers) / len(numbers), 2)`: / is true division in Python 3, so 1 / 3 is 0.333..., which rounds to 0.33."
    ],
    "mistakes": [
      "Catching only ValueError: float(None) raises TypeError and crashes.",
      "A bare except:, which also hides genuine bugs (and KeyboardInterrupt).",
      "Dividing by len(values) instead of the number that converted.",
      "Returning 0 (an int) or None for the empty case when the prompt says 0.0."
    ]
  },
  {
    "id": "py-format-cents",
    "section": "python",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Integer arithmetic and string formatting",
    "title": "Format cents as dollars",
    "prompt": [
      "Amounts are stored as whole numbers of cents. Write `format_cents(cents)` that returns the amount as text:",
      "",
      "- A dollar sign, thousands separators and exactly 2 decimals: `123456` becomes `$1,234.56`",
      "- Negative amounts put the minus before the dollar sign: `-500` becomes `-$5.00`",
      "- Small amounts keep a leading zero: `5` becomes `$0.05`"
    ],
    "starter": ["def format_cents(cents):", "    pass", ""],
    "solution": [
      "def format_cents(cents):",
      "    sign = '-' if cents < 0 else ''",
      "    dollars, rest = divmod(abs(cents), 100)",
      "    return f'{sign}${dollars:,}.{rest:02d}'",
      ""
    ],
    "tests": [
      {"name": "Thousands separator", "expr": "format_cents(123456)", "expect": "'$1,234.56'"},
      {"name": "Negative amount", "expr": "format_cents(-500)", "expect": "'-$5.00'"},
      {"name": "Zero", "expr": "format_cents(0)", "expect": "'$0.00'"},
      {"name": "Under a dollar", "expr": "format_cents(5)", "expect": "'$0.05'"},
      {"name": "A million dollars", "expr": "format_cents(100000000)", "expect": "'$1,000,000.00'"},
      {"name": "Small negative", "expr": "format_cents(-99)", "expect": "'-$0.99'"}
    ],
    "approach": [
      "Handle the sign separately, then work with abs(cents) so everything else only deals with positive numbers.",
      "divmod(n, 100) gives dollars and leftover cents in one step, with exact integer math (no float rounding).",
      "Format specs do the rest: {dollars:,} adds thousands separators and {rest:02d} pads cents to two digits."
    ],
    "walkthrough": [
      "`sign = '-' if cents < 0 else ''`: remember the sign, because the minus goes before the $.",
      "`dollars, rest = divmod(abs(cents), 100)`: divmod(123456, 100) is (1234, 56). Using abs avoids Python's floor behavior with negatives: divmod(-99, 100) is (-1, 1).",
      "`{dollars:,}`: the comma format spec groups digits by thousands.",
      "`{rest:02d}`: pads with zeros to width 2, so 5 cents prints as 05."
    ],
    "mistakes": [
      "divmod or // on the negative number directly: -99 // 100 is -1, giving '$-1.01'-style nonsense.",
      "Putting the sign after the $: '$-5.00'.",
      "Printing the cents without padding: '$0.5' instead of '$0.05'.",
      "Using cents / 100 and str(), which prints 1234.56 without separators, and 5.0 for 500."
    ]
  },
  {
    "id": "py-category-totals",
    "section": "python",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Dictionaries, normalization and sorting",
    "title": "Spending by category",
    "prompt": [
      "Write `category_totals(transactions)`. Each transaction is a dict that may have a `'category'` and an `'amount'` key.",
      "",
      "- Skip a transaction if its category is missing or empty, or its amount is missing or `None`.",
      "- Treat categories case-insensitively and ignore surrounding spaces: `' Food'` and `'food'` are the same category, reported as `'food'`.",
      "- Return a list of `(category, total)` tuples, totals rounded to 2 decimals, ordered by total (largest first), then category (A to Z)."
    ],
    "starter": ["def category_totals(transactions):", "    pass", ""],
    "solution": [
      "def category_totals(transactions):",
      "    totals = {}",
      "    for t in transactions:",
      "        category = t.get('category')",
      "        amount = t.get('amount')",
      "        if not category or not category.strip() or amount is None:",
      "            continue",
      "        key = category.strip().lower()",
      "        totals[key] = totals.get(key, 0) + amount",
      "    rows = [(c, round(v, 2)) for c, v in totals.items()]",
      "    return sorted(rows, key=lambda row: (-row[1], row[0]))",
      ""
    ],
    "tests": [
      {
        "name": "Totals with mixed case",
        "expr": "category_totals([{'category': 'Food', 'amount': 10}, {'category': 'Rent', 'amount': 500}, {'category': 'food', 'amount': 5.5}])",
        "expect": "[('rent', 500), ('food', 15.5)]"
      },
      {
        "name": "Tie broken alphabetically",
        "expr": "category_totals([{'category': 'b', 'amount': 5}, {'category': 'a', 'amount': 5}])",
        "expect": "[('a', 5), ('b', 5)]"
      },
      {
        "name": "None amount skipped",
        "expr": "category_totals([{'category': 'Gas', 'amount': None}, {'category': 'Gas', 'amount': 20}])",
        "expect": "[('gas', 20)]"
      },
      {
        "name": "Missing or blank category skipped",
        "expr": "category_totals([{'amount': 9}, {'category': '  ', 'amount': 3}, {'category': ' Fun', 'amount': 1}])",
        "expect": "[('fun', 1)]"
      },
      {"name": "Empty input", "expr": "category_totals([])", "expect": "[]"},
      {
        "name": "Rounded totals",
        "expr": "category_totals([{'category': 'x', 'amount': 0.1}, {'category': 'x', 'amount': 0.2}])",
        "expect": "[('x', 0.3)]"
      }
    ],
    "approach": [
      "Use dict.get() so a missing key gives None instead of raising KeyError.",
      "Normalize the category once (strip, lower) and use that as the dict key, so variants merge.",
      "Accumulate with totals.get(key, 0) + amount, round at the end, then sort with (-total, category)."
    ],
    "walkthrough": [
      "`category = t.get('category')`: returns None when the key is missing; t['category'] would raise KeyError.",
      "`if not category or not category.strip() or amount is None:`: covers missing, empty and blank categories, and missing amounts. Use `is None` for the amount so a real 0 isn't skipped.",
      "`key = category.strip().lower()`: one normalized form per category.",
      "`totals[key] = totals.get(key, 0) + amount`: .get with a default starts each new category at 0.",
      "`sorted(rows, key=lambda row: (-row[1], row[0]))`: biggest total first, alphabetical for ties."
    ],
    "mistakes": [
      "t['category'], which crashes on the transaction with no category.",
      "if not amount:, which also skips a legitimate amount of 0.",
      "Normalizing for the key but returning the original spelling, so the output says 'Food' or ' Fun'.",
      "Rounding each amount instead of the total, so 0.1 + 0.2 still shows 0.30000000000000004."
    ]
  }
]
);
