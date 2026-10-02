window.BANK = (window.BANK || []).concat(
[
  {
    "id": "py-bank-account-oop",
    "section": "python",
    "type": "python",
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
      { "name": "Deposit adds to the balance", "setup": "a = BankAccount('Ana', 50)\na.deposit(25)", "expr": "a.balance", "expect": "75" },
      { "name": "Withdrawing the whole balance leaves 0", "setup": "a = BankAccount('Ana', 40)\na.withdraw(40)", "expr": "a.balance", "expect": "0" },
      { "name": "Overdrawing raises InsufficientFundsError", "setup": "a = BankAccount('Ana', 40)", "expr": "a.withdraw(40.01)", "raises": "InsufficientFundsError" },
      { "name": "Zero deposit raises ValueError", "setup": "a = BankAccount('Ana')", "expr": "a.deposit(0)", "raises": "ValueError" },
      { "name": "Error message format, balance unchanged", "setup": "a = BankAccount('Ana', 40)\ntry:\n    a.withdraw(50)\n    msg = None\nexcept InsufficientFundsError as e:\n    msg = str(e)", "expr": "(msg, a.balance)", "expect": "('Insufficient funds: balance 40, requested 50', 40)" },
      { "name": "Savings keeps the minimum balance", "setup": "s = SavingsAccount('Bo', 300)\ns.withdraw(200)", "expr": "s.withdraw(0.01)", "raises": "InsufficientFundsError" }
    ],
    "approach": [
      "Start with the exception: class InsufficientFundsError(Exception): pass. Raising it with a message makes str(e) return that message.",
      "Validate first, mutate last. Check every error condition before changing self.balance, so a failed withdrawal leaves the balance untouched.",
      "Read the boundary words: \"more than the balance\" is >, so withdrawing exactly the balance is allowed.",
      "In the subclass, call super().__init__ to reuse the parent's setup, and override only withdraw. Do the extra minimum-balance check, then hand off to super().withdraw for the normal rules.",
      "Build the message with an f-string so numbers print the way Python prints them (40, not 40.0)."
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
    "starter": [
      "def mask_card(card):",
      "    pass",
      ""
    ],
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
      { "name": "Spaces kept", "expr": "mask_card('4111 1111 1111 1234')", "expect": "'**** **** **** 1234'" },
      { "name": "Dashes kept", "expr": "mask_card('4111-1111-1111-1234')", "expect": "'****-****-****-1234'" },
      { "name": "Exactly four digits is unchanged", "expr": "mask_card('1234')", "expect": "'1234'" },
      { "name": "Five digits masks one", "expr": "mask_card('12345')", "expect": "'*2345'" },
      { "name": "Empty string", "expr": "mask_card('')", "expect": "''" },
      { "name": "Last four digits span separators", "expr": "mask_card('12 34 5')", "expect": "'*2 34 5'" }
    ],
    "approach": [
      "Count the digits first, so you know how many to hide: total digits minus 4.",
      "Walk the string once. Replace a digit with * while you still have digits left to hide; copy everything else unchanged.",
      "Build a list and ''.join it at the end instead of slicing, because separators make positions and digit counts differ.",
      "Test the boundaries in your head: 4 digits (nothing to hide), 0 digits (empty string), and separators inside the last four."
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
    "starter": [
      "def rank_customers(customers):",
      "    pass",
      ""
    ],
    "solution": [
      "def rank_customers(customers):",
      "    scored = [c for c in customers if c[1] is not None]",
      "    scored.sort(key=lambda c: (-c[1], -c[2], c[0]))",
      "    return [name for name, _, _ in scored]",
      ""
    ],
    "tests": [
      { "name": "Higher score first", "expr": "rank_customers([('Ana', 700, 100), ('Bo', 750, 50)])", "expect": "['Bo', 'Ana']" },
      { "name": "Score tie broken by balance", "expr": "rank_customers([('Ana', 700, 100), ('Bo', 700, 900)])", "expect": "['Bo', 'Ana']" },
      { "name": "Score and balance tie broken by name", "expr": "rank_customers([('Cy', 700, 500), ('Ana', 700, 500), ('Bo', 680, 999)])", "expect": "['Ana', 'Cy', 'Bo']" },
      { "name": "Customers without a score are left out", "expr": "rank_customers([('Ana', None, 5000), ('Bo', 600, 10)])", "expect": "['Bo']" },
      { "name": "Empty list", "expr": "rank_customers([])", "expect": "[]" },
      { "name": "Nobody has a score", "expr": "rank_customers([('Ana', None, 1), ('Bo', None, 2)])", "expect": "[]" }
    ],
    "approach": [
      "Filter first: drop the None scores before sorting, because comparing None with a number raises TypeError in Python 3.",
      "Sort with one key that returns a tuple. Tuples compare element by element, so (score, balance, name) handles every tie-break in one pass.",
      "To sort a number highest first inside an otherwise ascending sort, negate it: -score. Names stay ascending.",
      "Return just the names, and check the empty input returns [] rather than None."
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
    "starter": [
      "def parse_amount(text):",
      "    pass",
      ""
    ],
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
      { "name": "Dollar sign and thousands comma", "expr": "parse_amount('$1,234.50')", "expect": "1234.5" },
      { "name": "Leading minus", "expr": "parse_amount('-$20')", "expect": "-20.0" },
      { "name": "Parentheses mean negative", "expr": "parse_amount('(45.00)')", "expect": "-45.0" },
      { "name": "Surrounding whitespace", "expr": "parse_amount('  7 ')", "expect": "7.0" },
      { "name": "Empty string raises ValueError", "expr": "parse_amount('')", "raises": "ValueError" },
      { "name": "Misplaced comma raises ValueError", "expr": "parse_amount('1,23')", "raises": "ValueError" }
    ],
    "approach": [
      "Peel the string from the outside in: strip whitespace, detect and remove the negative marker, remove the $, then validate what's left.",
      "Validate before converting. float() accepts things you don't want (like 'nan' or '1e5') and rejects commas, so check the shape first, here with a regular expression.",
      "Let the empty-string case fall through to the same ValueError instead of special-casing it.",
      "Raise ValueError yourself with a clear message; don't return None or a sentinel."
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
      { "name": "Simple interest for 6 months", "expr": "Loan('Ana', 12000, 0.05).interest(6)", "expect": "300.0" },
      { "name": "Zero months is zero interest", "expr": "Loan('Ana', 1000, 0.07).interest(0)", "expect": "0.0" },
      { "name": "String format", "expr": "str(Loan('Ana', 12500, 0.045))", "expect": "'Ana: $12,500.00 at 4.50%'" },
      { "name": "Zero principal raises ValueError", "expr": "Loan('Bo', 0, 0.05)", "raises": "ValueError" },
      { "name": "Promo months are free, later months are charged", "setup": "p = PromoLoan('Cy', 12000, 0.06, 3)", "expr": "(p.interest(2), p.interest(5))", "expect": "(0.0, 120.0)" },
      { "name": "Promo string extends the parent's", "expr": "str(PromoLoan('Cy', 12000, 0.06, 3))", "expect": "'Cy: $12,000.00 at 6.00% (promo 3 months)'" }
    ],
    "approach": [
      "Validate in __init__ and raise immediately, before storing anything.",
      "Use format specs for output: {x:,.2f} gives thousands separators and 2 decimals; multiply the rate by 100 for a percentage.",
      "In the subclass, reuse the parent: super().__init__ for setup, super().interest for the formula, super().__str__ for the text. Override only what changes.",
      "Handle the boundary where months is less than the promotion: max(0, months − promo) keeps it from going negative."
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
    "topic": "Dictionaries, string slicing and rounding",
    "title": "Monthly spending totals",
    "prompt": [
      "Write `monthly_totals(transactions)`. Each transaction is a dict like `{'date': '2025-01-15', 'amount': 42.5}`. An `amount` of `None` means the transaction was voided.",
      "",
      "Return a dict that maps each month (`'YYYY-MM'`) to the total amount for that month, rounded to 2 decimals. Voided transactions add nothing, but a month whose transactions are all voided still appears with `0.0`. The dict's keys must be in ascending month order. An empty list returns `{}`."
    ],
    "starter": [
      "def monthly_totals(transactions):",
      "    pass",
      ""
    ],
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
      { "name": "Two months", "expr": "monthly_totals([{'date': '2025-01-03', 'amount': 10.0}, {'date': '2025-01-20', 'amount': 5.5}, {'date': '2025-02-01', 'amount': 7.0}])", "expect": "{'2025-01': 15.5, '2025-02': 7.0}" },
      { "name": "Rounded to 2 decimals", "expr": "monthly_totals([{'date': '2025-03-01', 'amount': 0.1}, {'date': '2025-03-02', 'amount': 0.2}])", "expect": "{'2025-03': 0.3}" },
      { "name": "Voided amounts are skipped", "expr": "monthly_totals([{'date': '2025-04-01', 'amount': None}, {'date': '2025-04-09', 'amount': 20.0}])", "expect": "{'2025-04': 20.0}" },
      { "name": "Month with only voided transactions shows 0.0", "expr": "monthly_totals([{'date': '2025-05-05', 'amount': None}])", "expect": "{'2025-05': 0.0}" },
      { "name": "Empty input", "expr": "monthly_totals([])", "expect": "{}" },
      { "name": "Keys in ascending month order", "expr": "list(monthly_totals([{'date': '2025-02-10', 'amount': 1.0}, {'date': '2024-12-31', 'amount': 2.0}, {'date': '2025-01-01', 'amount': 3.0}]))", "expect": "['2024-12', '2025-01', '2025-02']" }
    ],
    "approach": [
      "The month key is the first 7 characters of the date: date[:7].",
      "Create the key even for voided transactions (setdefault), so an all-voided month still appears with 0.0. Only add when the amount isn't None.",
      "Round at the end, not on each addition, so rounding errors don't pile up.",
      "Dicts keep insertion order, so build the final dict from sorted(keys) to control the order."
    ],
    "mistakes": [
      "Skipping voided transactions entirely, so an all-voided month never appears.",
      "total += None, which raises TypeError.",
      "Returning 0.30000000000000004 because the total was never rounded.",
      "Returning keys in input order instead of month order."
    ]
  }
]
);
