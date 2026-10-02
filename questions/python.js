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
  }
]
);
