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
  }
]
);
