window.BANK = (window.BANK || []).concat(
[
  {
    "id": "sqli-top-depositor-per-branch",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: ranking with ties",
    "title": "Top depositor in each branch",
    "prompt": [
      "Each branch wants to thank its top depositor for 2025.",
      "",
      "For every branch, find the customer (or customers) with the highest **total deposit amount in 2025**. Only count rows where `txn_type` is `'deposit'`. A deposit with a NULL amount is still pending and adds nothing. If two or more customers tie for the highest total in a branch, return all of them. Branches with no 2025 deposits do not appear.",
      "",
      "**Output columns:** `branch_name`, `customer_name`, `total_deposits`",
      "",
      "**Sort by:** `branch_name` ascending, then `customer_name` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"], [3, "Providence"]]
      },
      {
        "name": "customers",
        "columns": [["customer_id", "INTEGER"], ["customer_name", "TEXT"], ["branch_id", "INTEGER"]],
        "rows": [
          [1, "Ava Chen", 1],
          [2, "Ben Ortiz", 1],
          [3, "Chloe Park", 1],
          [4, "Dev Patel", 2],
          [5, "Emma Ross", 2],
          [6, "Finn Walsh", 3]
        ]
      },
      {
        "name": "transactions",
        "columns": [
          ["txn_id", "INTEGER"],
          ["customer_id", "INTEGER"],
          ["txn_type", "TEXT"],
          ["amount", "REAL"],
          ["txn_date", "TEXT"]
        ],
        "rows": [
          [1, 1, "deposit", 500, "2025-01-15"],
          [2, 1, "deposit", 300, "2025-03-02"],
          [3, 2, "deposit", 800, "2025-02-10"],
          [4, 3, "deposit", 200, "2025-04-01"],
          [5, 3, "withdrawal", 900, "2025-04-03"],
          [6, 2, "deposit", null, "2025-05-20"],
          [7, 4, "deposit", 650, "2025-06-11"],
          [8, 5, "deposit", 400, "2025-02-14"],
          [9, 5, "deposit", 300, "2025-07-08"],
          [10, 4, "deposit", 1000, "2024-12-30"],
          [11, 6, "deposit", 700, "2024-11-05"],
          [12, 3, "deposit", 500, "2025-09-09"]
        ]
      }
    ],
    "solution": [
      "WITH totals AS (",
      "    SELECT c.branch_id, c.customer_name, SUM(t.amount) AS total_deposits",
      "    FROM transactions t",
      "    JOIN customers c ON c.customer_id = t.customer_id",
      "    WHERE t.txn_type = 'deposit'",
      "      AND t.txn_date >= '2025-01-01' AND t.txn_date < '2026-01-01'",
      "    GROUP BY c.branch_id, c.customer_id, c.customer_name",
      "),",
      "ranked AS (",
      "    SELECT branch_id, customer_name, total_deposits,",
      "           RANK() OVER (PARTITION BY branch_id ORDER BY total_deposits DESC) AS rnk",
      "    FROM totals",
      ")",
      "SELECT b.branch_name, r.customer_name, r.total_deposits",
      "FROM ranked r",
      "JOIN branches b ON b.branch_id = r.branch_id",
      "WHERE r.rnk = 1",
      "ORDER BY b.branch_name, r.customer_name;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "Spot the pattern: \"top N per group\" with \"return all ties\" means a window function, and specifically RANK or DENSE_RANK, not ROW_NUMBER.",
      "Build it in layers with CTEs. First filter and aggregate (one row per customer with their 2025 deposit total), then rank inside each branch, then keep rank 1.",
      "Apply every filter before aggregating: the deposit type and the date range. A half-open range (>= 2025-01-01 and < 2026-01-01) is safe whether dates have times or not; YEAR(txn_date) = 2025 also works here.",
      "Join to branches last for the name, and finish with the exact ORDER BY the prompt asks for."
    ],
    "walkthrough": [
      "`WITH totals AS (... SUM(t.amount) ... GROUP BY c.branch_id, c.customer_id, c.customer_name)`: first, one row per customer with their 2025 deposit total.",
      "`WHERE t.txn_type = 'deposit' AND t.txn_date >= '2025-01-01' AND t.txn_date < '2026-01-01'`: filters run before grouping, so withdrawals and 2024 rows never reach the SUM.",
      "`RANK() OVER (PARTITION BY branch_id ORDER BY total_deposits DESC) AS rnk`: rank customers inside each branch; ties share rank 1.",
      "`WHERE r.rnk = 1`: keep every top customer, including ties (Ava and Ben).",
      "`JOIN branches b ...` then `ORDER BY b.branch_name, r.customer_name;`: add names and apply the required sort."
    ],
    "mistakes": [
      "Using ROW_NUMBER(): Ava and Ben both have 800 in Back Bay, and ROW_NUMBER keeps only one of them.",
      "Forgetting the txn_type filter: Chloe's 900 withdrawal would push her to 1,600 and make her the wrong winner.",
      "Forgetting the year filter: Dev's 2024 deposit gives him 1,650 in Cambridge, and Providence (only 2024 activity) wrongly appears.",
      "Filtering rank in the same SELECT that computes it (WHERE RANK() OVER ... = 1). Window functions run after WHERE, so you need a CTE or subquery.",
      "Grouping by customer_name alone: two customers with the same name would merge. Group by the id too."
    ]
  },
  {
    "id": "sqli-branch-default-rate",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "GROUP BY with HAVING, NULLs and integer division",
    "title": "Branches with a high loan default rate",
    "prompt": [
      "Risk wants a list of branches whose loans are defaulting too often.",
      "",
      "For each branch, count its loans and how many have `status = 'default'`. A loan whose status is NULL has not been reviewed yet: it still counts as a loan, but not as a default. Return only branches with **at least 3 loans** and a **default rate above 0.25**. The default rate is defaulted loans divided by total loans, rounded to 2 decimal places.",
      "",
      "**Output columns:** `branch_name`, `total_loans`, `defaulted_loans`, `default_rate`",
      "",
      "**Sort by:** `default_rate` descending, then `branch_name` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"], [3, "Providence"], [4, "Worcester"], [5, "Hartford"]]
      },
      {
        "name": "loans",
        "columns": [["loan_id", "INTEGER"], ["branch_id", "INTEGER"], ["amount", "REAL"], ["status", "TEXT"]],
        "rows": [
          [101, 1, 12000, "default"],
          [102, 1, 8000, "current"],
          [103, 1, 15000, "default"],
          [104, 1, 5000, "paid"],
          [105, 2, 20000, "default"],
          [106, 2, 9000, null],
          [107, 2, 4000, "current"],
          [108, 3, 7000, "default"],
          [109, 3, 3000, "default"],
          [110, 4, 11000, "default"],
          [111, 4, 6000, "default"],
          [112, 4, 2500, "current"],
          [113, 4, 9500, null],
          [114, 5, 10000, "default"],
          [115, 5, 4000, "current"],
          [116, 5, 6000, "current"],
          [117, 5, 3000, "paid"]
        ]
      }
    ],
    "solution": [
      "SELECT b.branch_name,",
      "       COUNT(l.loan_id) AS total_loans,",
      "       SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) AS defaulted_loans,",
      "       ROUND(1.0 * SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) / COUNT(l.loan_id), 2) AS default_rate",
      "FROM branches b",
      "JOIN loans l ON l.branch_id = b.branch_id",
      "GROUP BY b.branch_id, b.branch_name",
      "HAVING COUNT(l.loan_id) >= 3",
      "   AND 1.0 * SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END) / COUNT(l.loan_id) > 0.25",
      "ORDER BY default_rate DESC, b.branch_name;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"For each branch ... only branches with ...\" means GROUP BY branch, then filter groups with HAVING (WHERE can't see aggregates).",
      "Count conditionally with SUM(CASE WHEN status = 'default' THEN 1 ELSE 0 END). It treats NULL status as 0, which is what the prompt wants.",
      "Count loans with COUNT(loan_id) or COUNT(*), never COUNT(status), because COUNT(column) skips NULLs.",
      "Force decimal division (1.0 * x / y) before ROUND. In SQLite and several other engines, integer / integer truncates.",
      "Read the boundaries literally: \"at least 3\" is >= 3 and \"above 0.25\" is > 0.25. Check them against the sample: Providence has only 2 loans and Hartford sits at exactly 0.25.",
      "Sort by rate descending, and break ties by name: Back Bay and Worcester are both 0.5."
    ],
    "walkthrough": [
      "`COUNT(l.loan_id) AS total_loans`: counts every loan, including NULL-status ones.",
      "`SUM(CASE WHEN l.status = 'default' THEN 1 ELSE 0 END)`: a conditional count; NULL status falls to ELSE 0.",
      "`ROUND(1.0 * SUM(...) / COUNT(l.loan_id), 2)`: 1.0 * forces decimal division before rounding.",
      "`HAVING COUNT(l.loan_id) >= 3 AND 1.0 * ... > 0.25`: both conditions are on aggregates, so they go in HAVING.",
      "`ORDER BY default_rate DESC, b.branch_name;`: the name breaks the 0.5 tie."
    ],
    "mistakes": [
      "COUNT(status) instead of COUNT(loan_id): it skips the NULL-status loans, so Cambridge looks like 1 of 2 (0.5) and Worcester 2 of 3.",
      "Integer division: 2 / 4 is 0 in SQLite, so every rate becomes 0 or 1. Multiply by 1.0 first.",
      "Using >= 0.25: Hartford (exactly 0.25) would wrongly appear.",
      "Putting the count condition in WHERE instead of HAVING, which is an error.",
      "Missing the name tie-breaker, so Back Bay and Worcester can come out in either order."
    ]
  },
  {
    "id": "sqli-running-balance",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: running totals",
    "title": "Running balance per account",
    "prompt": [
      "Show a running balance for every transaction. Deposits are positive amounts and withdrawals are negative. An amount of NULL means the transaction was reversed: show its amount as 0 and leave the balance unchanged.",
      "",
      "Each account's running balance starts at 0 and adds transactions in date order. When an account has several transactions on the same date, apply them in `txn_id` order.",
      "",
      "**Output columns:** `account_id`, `txn_id`, `txn_date`, `amount`, `running_balance`",
      "",
      "**Sort by:** `account_id` ascending, then `txn_date` ascending, then `txn_id` ascending."
    ],
    "tables": [
      {
        "name": "transactions",
        "columns": [["txn_id", "INTEGER"], ["account_id", "INTEGER"], ["txn_date", "TEXT"], ["amount", "REAL"]],
        "rows": [
          [1, 10, "2025-03-01", 500],
          [2, 10, "2025-03-03", -200],
          [3, 10, "2025-03-03", 50],
          [4, 10, "2025-03-07", -100],
          [8, 10, "2025-03-08", null],
          [5, 20, "2025-03-02", 1000],
          [6, 20, "2025-03-05", -1000],
          [7, 20, "2025-03-05", 250]
        ]
      }
    ],
    "solution": [
      "SELECT account_id,",
      "       txn_id,",
      "       txn_date,",
      "       COALESCE(amount, 0) AS amount,",
      "       SUM(COALESCE(amount, 0)) OVER (",
      "           PARTITION BY account_id",
      "           ORDER BY txn_date, txn_id",
      "       ) AS running_balance",
      "FROM transactions",
      "ORDER BY account_id, txn_date, txn_id;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Running\" or \"cumulative\" total per something means SUM(...) OVER (PARTITION BY something ORDER BY time).",
      "Make the window's ORDER BY unique. If it orders only by date, rows on the same date are \"peers,\" and the default window frame includes all peers at once, so both same-day rows show the end-of-day total.",
      "Handle NULLs explicitly with COALESCE, both for the displayed amount and inside the SUM.",
      "The final ORDER BY sorts the output; it is separate from the window's ORDER BY. Write both."
    ],
    "walkthrough": [
      "`COALESCE(amount, 0) AS amount`: shows reversed transactions as 0.",
      "`SUM(COALESCE(amount, 0)) OVER (PARTITION BY account_id ORDER BY txn_date, txn_id)`: a running total per account. With an ORDER BY, the window sums from the first row up to the current one.",
      "txn_id in the window's ORDER BY makes every row unique, so same-day rows get different running totals instead of the end-of-day total.",
      "`ORDER BY account_id, txn_date, txn_id;`: the output sort, separate from the window's ordering."
    ],
    "mistakes": [
      "ORDER BY txn_date alone inside OVER: account 10's two rows on March 3 would both show 350, and account 20's rows on March 5 would both show 250.",
      "Leaving amount as NULL in the output when the prompt asks for 0.",
      "Forgetting PARTITION BY, so account 20's balance continues from account 10's.",
      "Using GROUP BY, which collapses the transactions into one row per account instead of one row per transaction."
    ]
  },
  {
    "id": "sqli-accounts-opened-per-branch",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "LEFT JOIN with a filter, COUNT and COALESCE",
    "title": "Accounts opened per branch, including zero",
    "prompt": [
      "For every branch, report how many accounts were opened in 2025 and the total of their opening deposits. Every branch must appear, even one that opened no accounts in 2025 (show 0 and 0). An account opened with a NULL opening deposit still counts as opened and adds 0 to the total.",
      "",
      "**Output columns:** `branch_name`, `accounts_opened`, `total_opening_deposit`",
      "",
      "**Sort by:** `accounts_opened` descending, then `branch_name` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"], [3, "Providence"], [4, "Worcester"]]
      },
      {
        "name": "accounts",
        "columns": [
          ["account_id", "INTEGER"],
          ["branch_id", "INTEGER"],
          ["opened_date", "TEXT"],
          ["opening_deposit", "REAL"]
        ],
        "rows": [
          [1, 1, "2025-01-10", 500],
          [2, 1, "2025-02-11", 1500],
          [3, 1, "2024-12-31", 800],
          [4, 2, "2025-05-05", 250],
          [5, 2, "2025-06-30", null],
          [6, 3, "2024-07-01", 300],
          [7, 4, "2025-12-31", 1000],
          [8, 4, "2026-01-01", 2000]
        ]
      }
    ],
    "solution": [
      "SELECT b.branch_name,",
      "       COUNT(a.account_id) AS accounts_opened,",
      "       COALESCE(SUM(a.opening_deposit), 0) AS total_opening_deposit",
      "FROM branches b",
      "LEFT JOIN accounts a",
      "       ON a.branch_id = b.branch_id",
      "      AND a.opened_date >= '2025-01-01'",
      "      AND a.opened_date < '2026-01-01'",
      "GROUP BY b.branch_id, b.branch_name",
      "ORDER BY accounts_opened DESC, b.branch_name;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Every branch must appear\" means start from branches and LEFT JOIN the accounts.",
      "Put the date filter in the ON clause. In WHERE, it would remove the NULL rows the LEFT JOIN created for Providence, turning it back into an inner join.",
      "Count a column from the right table, COUNT(a.account_id), so a branch with no match counts 0, not 1.",
      "SUM over no rows is NULL, so wrap it in COALESCE(..., 0).",
      "Check the year boundaries in the sample: Dec 31, 2024, Dec 31, 2025 and Jan 1, 2026."
    ],
    "walkthrough": [
      "`FROM branches b LEFT JOIN accounts a ON a.branch_id = b.branch_id AND a.opened_date >= '2025-01-01' AND a.opened_date < '2026-01-01'`: the date filter sits in ON, so branches without 2025 accounts still get one NULL-padded row.",
      "`COUNT(a.account_id)`: counts only matched accounts, giving Providence 0 instead of 1.",
      "`COALESCE(SUM(a.opening_deposit), 0)`: SUM of nothing is NULL; COALESCE turns it into 0.",
      "`GROUP BY b.branch_id, b.branch_name` and `ORDER BY accounts_opened DESC, b.branch_name;`: one row per branch, with the name tie-break."
    ],
    "mistakes": [
      "Filtering the year in WHERE: Providence disappears from the output.",
      "COUNT(*): Providence's single NULL-padded row counts as 1 account opened.",
      "Showing NULL instead of 0 for Providence's total.",
      "Off-by-one dates: <= '2025-12-31' is fine for plain dates, but BETWEEN '2025-01-01' AND '2025-12-31' misses late-day timestamps if the column has times.",
      "Forgetting the branch_name tie-breaker: Back Bay and Cambridge both opened 2."
    ]
  },
  {
    "id": "sqli-card-many-merchants",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Easy",
    "topic": "GROUP BY with HAVING and COUNT DISTINCT",
    "title": "Cards used at many merchants in one day",
    "prompt": [
      "The fraud team wants cards that were used at **3 or more different merchants on the same day**.",
      "",
      "Only count approved transactions (`status = 'approved'`). Several transactions at the same merchant on the same day count as one merchant. A transaction with a NULL merchant has no known merchant and does not count.",
      "",
      "**Output columns:** `card_id`, `txn_date`, `merchant_count`",
      "",
      "**Sort by:** `txn_date` ascending, then `card_id` ascending."
    ],
    "tables": [
      {
        "name": "card_transactions",
        "columns": [
          ["txn_id", "INTEGER"],
          ["card_id", "TEXT"],
          ["merchant", "TEXT"],
          ["txn_date", "TEXT"],
          ["status", "TEXT"]
        ],
        "rows": [
          [1, "C1", "Amazon", "2025-04-01", "approved"],
          [2, "C1", "Target", "2025-04-01", "approved"],
          [3, "C1", "Amazon", "2025-04-01", "approved"],
          [4, "C1", "Shell", "2025-04-01", "declined"],
          [5, "C2", "Amazon", "2025-04-01", "approved"],
          [6, "C2", "Target", "2025-04-01", "approved"],
          [7, "C2", "Shell", "2025-04-01", "approved"],
          [8, "C3", "Uber", "2025-04-02", "approved"],
          [9, "C3", null, "2025-04-02", "approved"],
          [10, "C3", "Lyft", "2025-04-02", "approved"],
          [11, "C1", "Uber", "2025-04-02", "approved"],
          [12, "C1", "Lyft", "2025-04-02", "approved"],
          [13, "C1", "Starbucks", "2025-04-02", "approved"],
          [14, "C1", "Amazon", "2025-04-02", "approved"],
          [15, "C2", "Uber", "2025-04-02", "approved"]
        ]
      }
    ],
    "solution": [
      "SELECT card_id, txn_date, COUNT(DISTINCT merchant) AS merchant_count",
      "FROM card_transactions",
      "WHERE status = 'approved'",
      "GROUP BY card_id, txn_date",
      "HAVING COUNT(DISTINCT merchant) >= 3",
      "ORDER BY txn_date, card_id;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Per card per day\" means GROUP BY card_id, txn_date.",
      "\"Different merchants\" means COUNT(DISTINCT merchant). It also skips NULL merchants automatically.",
      "Filter rows before grouping with WHERE (approved only); filter groups after with HAVING (>= 3).",
      "Check the boundaries against the sample: C2 on April 1 has exactly 3 and must appear; C1 on April 1 has only 2 approved merchants."
    ],
    "walkthrough": [
      "`WHERE status = 'approved'`: drop declined rows before grouping.",
      "`GROUP BY card_id, txn_date`: one group per card per day.",
      "`COUNT(DISTINCT merchant)`: counts different merchants, once each, and skips NULL.",
      "`HAVING COUNT(DISTINCT merchant) >= 3`: \"3 or more\", so exactly 3 qualifies.",
      "`ORDER BY txn_date, card_id;`: the required sort."
    ],
    "mistakes": [
      "COUNT(*) or COUNT(merchant) instead of COUNT(DISTINCT merchant): C1's two Amazon purchases on April 1 count twice, and C3's NULL row counts with COUNT(*).",
      "Forgetting the approved filter: C1's declined Shell transaction pushes it to 3 merchants on April 1.",
      "Using > 3 instead of >= 3, which drops C2.",
      "Putting the count condition in WHERE, which is an error."
    ]
  },
  {
    "id": "sqli-second-highest-loan",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: DENSE_RANK and missing results",
    "title": "Second-largest loan in each branch",
    "prompt": [
      "For every branch, find the **second-highest distinct loan amount**. If two loans share the top amount, the second-highest is the next smaller amount. Ignore loans with a NULL amount. If a branch has no second-highest amount, it still appears, with NULL.",
      "",
      "**Output columns:** `branch_name`, `second_highest`",
      "",
      "**Sort by:** `branch_name` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"], [3, "Providence"], [4, "Worcester"]]
      },
      {
        "name": "loans",
        "columns": [["loan_id", "INTEGER"], ["branch_id", "INTEGER"], ["amount", "REAL"]],
        "rows": [
          [1, 1, 50000],
          [2, 1, 30000],
          [3, 1, 50000],
          [4, 1, 20000],
          [5, 2, 15000],
          [6, 2, 15000],
          [7, 3, 40000],
          [8, 4, 10000],
          [9, 4, 25000],
          [10, 4, 18000],
          [11, 4, null]
        ]
      }
    ],
    "solution": [
      "WITH ranked AS (",
      "    SELECT branch_id, amount,",
      "           DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC) AS rnk",
      "    FROM loans",
      "    WHERE amount IS NOT NULL",
      ")",
      "SELECT b.branch_name, MAX(r.amount) AS second_highest",
      "FROM branches b",
      "LEFT JOIN ranked r ON r.branch_id = b.branch_id AND r.rnk = 2",
      "GROUP BY b.branch_id, b.branch_name",
      "ORDER BY b.branch_name;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Nth highest distinct\" is DENSE_RANK: ties share a rank and the next value gets the next number.",
      "Rank within each branch with PARTITION BY branch_id, after dropping NULL amounts.",
      "\"Every branch, NULL if missing\" means start from branches and LEFT JOIN the rank-2 rows, with rnk = 2 in the ON clause.",
      "Several loans can share the second amount, so collapse them to one row per branch (MAX or DISTINCT).",
      "A non-window alternative: MAX(amount) among loans where amount < the branch's MAX(amount)."
    ],
    "walkthrough": [
      "`DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC)` on non-NULL amounts: duplicates share a rank and the next value gets the next number, so rank 2 is the second-highest distinct amount.",
      "`FROM branches b LEFT JOIN ranked r ON r.branch_id = b.branch_id AND r.rnk = 2`: every branch appears; branches without a rank-2 row get NULL.",
      "`MAX(r.amount)` with `GROUP BY b.branch_id, b.branch_name`: collapses repeated rank-2 rows into one value.",
      "`ORDER BY b.branch_name;`: the required sort."
    ],
    "mistakes": [
      "ROW_NUMBER or RANK: Back Bay's two 50,000 loans make row 2 another 50,000 (ROW_NUMBER), or leave no rank 2 at all (RANK jumps to 3).",
      "ORDER BY amount DESC LIMIT 1 OFFSET 1 per branch: it returns the duplicate 50,000, and it doesn't work per group anyway.",
      "Filtering rnk = 2 in WHERE after a LEFT JOIN, which drops Cambridge and Providence instead of showing NULL.",
      "Returning duplicate rows when two loans share the second amount."
    ]
  },
  {
    "id": "sqli-contact-list-strings",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Easy",
    "topic": "String manipulation and NULL defaults",
    "title": "A clean customer contact list",
    "prompt": [
      "Marketing wants a tidy contact list. For each customer return:",
      "",
      "- `customer_id`",
      "- `display_name`: the last name in UPPER CASE, then a comma and a space, then the first name. Remove any spaces stored before or after either name. Example: `PARK, Chloe`",
      "- `email_domain`: the part of the email after the `@`, in lower case. If the email is NULL, show `none`.",
      "",
      "**Output columns:** `customer_id`, `display_name`, `email_domain`",
      "",
      "**Sort by:** `email_domain` ascending, then `customer_id` ascending."
    ],
    "tables": [
      {
        "name": "customers",
        "columns": [["customer_id", "INTEGER"], ["first_name", "TEXT"], ["last_name", "TEXT"], ["email", "TEXT"]],
        "rows": [
          [1, " Ana ", "chen", "Ana.Chen@Gmail.com"],
          [2, "Ben", "Ortiz", null],
          [3, "Chloe", "park ", "chloe@citizensbank.com"],
          [4, "Dev", "Patel", "dev.patel@gmail.com"],
          [5, "Emma", "Ross", "emma@Yahoo.com"]
        ]
      }
    ],
    "solution": [
      "SELECT customer_id,",
      "       UPPER(TRIM(last_name)) || ', ' || TRIM(first_name) AS display_name,",
      "       COALESCE(LOWER(SUBSTR(email, INSTR(email, '@') + 1)), 'none') AS email_domain",
      "FROM customers",
      "ORDER BY email_domain, customer_id;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "Build each output column separately, and test it on the trickiest rows: the spaces around ' Ana ' and 'park ', the mixed-case domains, and the NULL email.",
      "Trim before you change case or concatenate. In MySQL, write CONCAT(UPPER(TRIM(last_name)), ', ', TRIM(first_name)); in SQLite, || joins strings.",
      "For the domain, take everything after the @: SUBSTRING_INDEX(email, '@', -1) in MySQL, or SUBSTR(email, INSTR(email, '@') + 1). Both work here.",
      "Lower-case the domain before sorting, or 'Gmail.com' and 'gmail.com' sort apart (capital letters sort before lower case).",
      "Wrap the whole domain expression in COALESCE(..., 'none'), since any string function applied to NULL returns NULL."
    ],
    "walkthrough": [
      "`UPPER(TRIM(last_name)) || ', ' || TRIM(first_name)`: trim first, then upper-case the last name, then join. In MySQL: CONCAT(UPPER(TRIM(last_name)), ', ', TRIM(first_name)).",
      "`SUBSTR(email, INSTR(email, '@') + 1)`: INSTR finds the position of @; starting one character later gives the domain. MySQL also has SUBSTRING_INDEX(email, '@', -1).",
      "`LOWER(...)` around it: 'Gmail.com' and 'gmail.com' become the same and sort correctly.",
      "`COALESCE(..., 'none')`: string functions return NULL for a NULL email, so COALESCE supplies 'none'.",
      "`ORDER BY email_domain, customer_id;`: sort by the cleaned domain, then id."
    ],
    "mistakes": [
      "Forgetting LOWER: 'Gmail.com' and 'Yahoo.com' keep their capitals and sort before 'citizensbank.com'.",
      "Forgetting TRIM: Ana's name comes out as 'CHEN,  Ana ' with extra spaces.",
      "Leaving NULL instead of 'none' for Ben, which also sorts him first instead of between gmail.com and yahoo.com.",
      "Using SUBSTR(email, INSTR(email, '@')), which keeps the '@' in the domain.",
      "In MySQL, CONCAT returns NULL if any argument is NULL. SQLite's CONCAT and || behave differently with NULLs, so handle NULLs explicitly either way."
    ]
  },
  {
    "id": "sqli-month-over-month",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: LAG",
    "title": "Month-over-month change in deposits",
    "prompt": [
      "For each branch and month, show the month's deposit total and the change from that branch's previous month. A branch's first month has no previous month, so its change is NULL (not 0).",
      "",
      "**Output columns:** `branch_name`, `month`, `total`, `change_from_prev`",
      "",
      "**Sort by:** `branch_name` ascending, then `month` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"]]
      },
      {
        "name": "monthly_deposits",
        "columns": [["branch_id", "INTEGER"], ["month", "TEXT"], ["total", "REAL"]],
        "rows": [
          [1, "2025-02", 12000],
          [1, "2025-01", 10000],
          [2, "2025-01", 5000],
          [1, "2025-03", 9000],
          [2, "2025-02", 5000]
        ]
      }
    ],
    "solution": [
      "SELECT b.branch_name,",
      "       m.month,",
      "       m.total,",
      "       m.total - LAG(m.total) OVER (PARTITION BY m.branch_id ORDER BY m.month) AS change_from_prev",
      "FROM monthly_deposits m",
      "JOIN branches b ON b.branch_id = m.branch_id",
      "ORDER BY b.branch_name, m.month;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Compared with the previous row\" means LAG (or LEAD for the next row).",
      "PARTITION BY the group (branch) so each branch's first month has no previous value, and ORDER BY the time column inside OVER. The table's row order means nothing.",
      "LAG returns NULL when there's no previous row, and anything minus NULL is NULL, which is exactly what the prompt asks for. Don't COALESCE it to 0.",
      "'YYYY-MM' text sorts in date order, so ordering by month works directly."
    ],
    "walkthrough": [
      "`LAG(m.total) OVER (PARTITION BY m.branch_id ORDER BY m.month)`: the previous month's total for the same branch, or NULL for its first month.",
      "`m.total - LAG(...)`: this month minus last month. Anything minus NULL is NULL, which is what the first month should show.",
      "`JOIN branches b ...`: adds the branch name.",
      "`ORDER BY b.branch_name, m.month;`: the output order; the window's own ORDER BY handles the out-of-order table rows."
    ],
    "mistakes": [
      "No PARTITION BY: Cambridge's January is compared with Back Bay's March (5000 − 9000).",
      "Relying on insertion order instead of ORDER BY month inside OVER: Back Bay's rows were stored out of order.",
      "COALESCE(LAG(...), 0), which makes each first month's change equal its whole total.",
      "Computing LAG(total) − total, which flips the sign."
    ]
  },
  {
    "id": "sqli-high-balance-customers",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Easy",
    "topic": "GROUP BY with HAVING",
    "title": "Customers with high total balances",
    "prompt": [
      "Each customer can have several accounts. Print the IDs of customers whose **total balance across all their accounts is more than 10000**. An account with a NULL balance is being opened and adds nothing.",
      "",
      "**Output columns:** `customer_id`",
      "",
      "**Sort by:** `customer_id` ascending."
    ],
    "tables": [
      {
        "name": "accounts",
        "columns": [["account_id", "INTEGER"], ["customer_id", "INTEGER"], ["balance", "REAL"]],
        "rows": [
          [1, 101, 6000],
          [2, 101, 4500],
          [3, 102, 10000],
          [4, 103, 12000],
          [5, 104, 3000],
          [6, 104, null],
          [7, 105, 5000],
          [8, 105, 5000.01],
          [9, 103, -500]
        ]
      }
    ],
    "solution": [
      "SELECT customer_id",
      "FROM accounts",
      "GROUP BY customer_id",
      "HAVING SUM(balance) > 10000",
      "ORDER BY customer_id;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"Total ... per customer\" means GROUP BY customer_id with SUM(balance).",
      "A condition on a total goes in HAVING, which runs after grouping. WHERE can't see SUM.",
      "\"More than 10000\" is > 10000, so a total of exactly 10000 is excluded.",
      "SUM skips NULLs, so the account being opened is handled automatically."
    ],
    "walkthrough": [
      "`SELECT customer_id`: one output column, as asked.",
      "`FROM accounts`: everything is in one table.",
      "`GROUP BY customer_id`: one group per customer, holding all their accounts.",
      "`HAVING SUM(balance) > 10000`: keep a group only when its total is over 10000. Customer 103 has 12000 − 500 = 11500, so it stays; 102 has exactly 10000, so it doesn't.",
      "`ORDER BY customer_id;`: the required sort, and the semicolon HackerRank asks for."
    ],
    "mistakes": [
      "WHERE balance > 10000, which filters single accounts instead of totals: customer 101 (6000 + 4500 = 10500) disappears, and 103's negative account is ignored.",
      "Using >= 10000, which wrongly includes customer 102.",
      "Forgetting that a negative balance reduces the total.",
      "Missing ORDER BY: HackerRank compares row order too."
    ]
  },
  {
    "id": "sqli-score-bands",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Easy",
    "topic": "CASE expressions with GROUP BY",
    "title": "Customers per credit score band",
    "prompt": [
      "Group customers into credit score bands and count them:",
      "",
      "| Band | Scores |",
      "|---|---|",
      "| `Poor` | below 580 |",
      "| `Fair` | 580 to 669 |",
      "| `Good` | 670 to 739 |",
      "| `Excellent` | 740 and above |",
      "| `Unknown` | score is NULL |",
      "",
      "Only list bands that have at least one customer.",
      "",
      "**Output columns:** `band`, `customers`",
      "",
      "**Sort by:** `customers` descending, then `band` ascending."
    ],
    "tables": [
      {
        "name": "customers",
        "columns": [["customer_id", "INTEGER"], ["name", "TEXT"], ["credit_score", "INTEGER"]],
        "rows": [
          [1, "Ana", 579],
          [2, "Ben", 580],
          [3, "Cy", 669],
          [4, "Dee", 670],
          [5, "Eve", 739],
          [6, "Finn", 740],
          [7, "Gus", null],
          [8, "Hal", 812],
          [9, "Ivy", 610]
        ]
      }
    ],
    "solution": [
      "SELECT CASE",
      "           WHEN credit_score IS NULL THEN 'Unknown'",
      "           WHEN credit_score < 580 THEN 'Poor'",
      "           WHEN credit_score < 670 THEN 'Fair'",
      "           WHEN credit_score < 740 THEN 'Good'",
      "           ELSE 'Excellent'",
      "       END AS band,",
      "       COUNT(*) AS customers",
      "FROM customers",
      "GROUP BY band",
      "ORDER BY customers DESC, band;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "Turning ranges into labels is a CASE expression. CASE checks its WHEN branches top to bottom and stops at the first true one.",
      "Order the branches so each only needs an upper bound: after < 580, the next check < 670 automatically means 580 to 669.",
      "Check NULL first: NULL < 580 is unknown, not true, so without the IS NULL branch a NULL score falls through to ELSE and becomes 'Excellent'.",
      "Group by the CASE result and count. MySQL and SQLite both let you GROUP BY the alias."
    ],
    "walkthrough": [
      "`WHEN credit_score IS NULL THEN 'Unknown'`: handle NULL before any comparison.",
      "`WHEN credit_score < 580 THEN 'Poor'`: 579 is Poor, 580 is not.",
      "`WHEN credit_score < 670 THEN 'Fair'`: only reached for 580 and up, so this means 580 to 669.",
      "`ELSE 'Excellent'`: everything left is 740 or above.",
      "`COUNT(*) AS customers` with `GROUP BY band`: one row per band that has customers. Bands with nobody never appear, as the prompt wants.",
      "`ORDER BY customers DESC, band;`: Good and Excellent tie at 2, and Poor and Unknown tie at 1, so the alphabetical tie-break matters."
    ],
    "mistakes": [
      "Using BETWEEN with overlapping ends (580 AND 670, then 670 AND 740), which puts 670 in two bands depending on order.",
      "Leaving out the NULL branch, so Gus is counted as Excellent.",
      "Writing the WHEN branches from highest to lowest with < bounds, so everything matches the first branch.",
      "COUNT(credit_score), which counts 0 for the Unknown band."
    ]
  },
  {
    "id": "sqli-above-branch-average",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Subqueries or window averages",
    "title": "Loans above their branch's average",
    "prompt": [
      "Find loans that are **larger than the average loan amount of their own branch**. Loans with a NULL amount are still in review: ignore them completely (they don't count toward the average either). Show the branch average rounded to 2 decimal places.",
      "",
      "**Output columns:** `loan_id`, `branch_name`, `amount`, `branch_avg`",
      "",
      "**Sort by:** `branch_name` ascending, then `amount` descending, then `loan_id` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [["branch_id", "INTEGER"], ["branch_name", "TEXT"]],
        "rows": [[1, "Back Bay"], [2, "Cambridge"], [3, "Providence"]]
      },
      {
        "name": "loans",
        "columns": [["loan_id", "INTEGER"], ["branch_id", "INTEGER"], ["amount", "REAL"]],
        "rows": [
          [1, 1, 10000],
          [2, 1, 20000],
          [3, 1, 30000],
          [4, 1, null],
          [5, 2, 5000],
          [6, 2, 5000],
          [7, 2, 8000],
          [8, 3, 12000],
          [9, 1, 30000]
        ]
      }
    ],
    "solution": [
      "WITH scored AS (",
      "    SELECT loan_id, branch_id, amount,",
      "           AVG(amount) OVER (PARTITION BY branch_id) AS branch_avg",
      "    FROM loans",
      "    WHERE amount IS NOT NULL",
      ")",
      "SELECT s.loan_id, b.branch_name, s.amount, ROUND(s.branch_avg, 2) AS branch_avg",
      "FROM scored s",
      "JOIN branches b ON b.branch_id = s.branch_id",
      "WHERE s.amount > s.branch_avg",
      "ORDER BY b.branch_name, s.amount DESC, s.loan_id;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "Each loan is compared with a value computed from its own group, so you need the group average next to every row: a window AVG() OVER (PARTITION BY branch_id), or a correlated subquery.",
      "Window functions can't be filtered in the same SELECT's WHERE, so compute them in a CTE first, then filter outside.",
      "Remove NULL amounts before averaging. AVG skips NULLs anyway, but they must not appear in the output.",
      "Use strict > as the prompt says, and check Providence: a branch with one loan can't be above its own average."
    ],
    "walkthrough": [
      "`AVG(amount) OVER (PARTITION BY branch_id) AS branch_avg`: adds the branch average to every row without collapsing rows like GROUP BY would. Back Bay's average is (10000 + 20000 + 30000 + 30000) / 4 = 22500.",
      "`WHERE amount IS NOT NULL` inside the CTE: drops loans still in review before the average is computed.",
      "`JOIN branches b ON b.branch_id = s.branch_id`: brings in the branch name.",
      "`WHERE s.amount > s.branch_avg`: keeps only above-average loans. In Cambridge the average is 6000, so only the 8000 loan qualifies.",
      "`ORDER BY b.branch_name, s.amount DESC, s.loan_id;`: Back Bay's two 30000 loans tie on amount, so loan_id breaks the tie.",
      "Alternative: `WHERE l.amount > (SELECT AVG(amount) FROM loans x WHERE x.branch_id = l.branch_id)`, a correlated subquery."
    ],
    "mistakes": [
      "Comparing with the overall average across all branches instead of each loan's own branch.",
      "Writing WHERE amount > AVG(amount) OVER (...) in one query, which is an error: window functions run after WHERE.",
      "Showing the unrounded average, or rounding before comparing (which can change borderline results).",
      "Missing the loan_id tie-break for the two 30000 loans."
    ]
  },
  {
    "id": "sqli-first-transaction",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: ROW_NUMBER for first per group",
    "title": "Each customer's first transaction",
    "prompt": [
      "For each customer, show their **first transaction**: the earliest `txn_date`. If a customer has several transactions on that earliest date, the one with the smallest `txn_id` counts as first. Customers with no transactions don't appear.",
      "",
      "**Output columns:** `customer_name`, `txn_id`, `txn_date`, `amount`",
      "",
      "**Sort by:** `customer_name` ascending."
    ],
    "tables": [
      {
        "name": "customers",
        "columns": [["customer_id", "INTEGER"], ["customer_name", "TEXT"]],
        "rows": [[1, "Ava Chen"], [2, "Ben Ortiz"], [3, "Chloe Park"], [4, "Dev Patel"]]
      },
      {
        "name": "transactions",
        "columns": [["txn_id", "INTEGER"], ["customer_id", "INTEGER"], ["txn_date", "TEXT"], ["amount", "REAL"]],
        "rows": [
          [11, 1, "2025-02-01", 50],
          [12, 1, "2025-01-15", 200],
          [13, 2, "2025-01-10", 75],
          [14, 2, "2025-01-10", 30],
          [15, 3, "2025-03-03", 500],
          [16, 2, "2025-01-09", 10],
          [17, 3, "2025-03-03", 20]
        ]
      }
    ],
    "solution": [
      "WITH ordered AS (",
      "    SELECT customer_id, txn_id, txn_date, amount,",
      "           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY txn_date, txn_id) AS rn",
      "    FROM transactions",
      ")",
      "SELECT c.customer_name, o.txn_id, o.txn_date, o.amount",
      "FROM ordered o",
      "JOIN customers c ON c.customer_id = o.customer_id",
      "WHERE o.rn = 1",
      "ORDER BY c.customer_name;"
    ],
    "starter": ["/*", "Enter your query below.", "Please append a semicolon \";\" at the end of the query", "*/", ""],
    "approach": [
      "\"First (or latest, or top) row per group, exactly one\" is ROW_NUMBER() partitioned by the group, then keep rn = 1.",
      "Here ROW_NUMBER is right because the prompt wants exactly one row and defines the tie-break, so put the tie-break (txn_id) in the window's ORDER BY.",
      "Number in a CTE, filter rn = 1 outside it.",
      "An inner join to customers naturally drops Dev, who has no transactions."
    ],
    "walkthrough": [
      "`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY txn_date, txn_id) AS rn`: numbers each customer's transactions 1, 2, 3 in date order, with txn_id deciding same-day ties.",
      "`WHERE o.rn = 1`: keeps exactly one row per customer: their first.",
      "Ben's earliest date is 2025-01-09 (txn 16), even though it appears later in the table. Chloe has two transactions on 2025-03-03, and txn 15 wins on id.",
      "`JOIN customers c ...`: adds names; customers with no rows in ordered can't appear.",
      "`ORDER BY c.customer_name;`: the required sort."
    ],
    "mistakes": [
      "MIN(txn_date) with GROUP BY, then joining back on the date: Chloe gets two rows because two transactions share her first date.",
      "RANK() or DENSE_RANK() without txn_id in the ORDER BY, which also returns both of Chloe's same-day transactions.",
      "Ordering by txn_id alone, which picks Ben's txn 13 instead of his earliest transaction, 16.",
      "A LEFT JOIN from customers, which adds Dev with NULLs."
    ]
  },
  {
    "id": "sqli-loan-outcome-report",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "GROUP BY with GROUP_CONCAT, CASE and NULL defaults",
    "title": "Loan application outcome report",
    "prompt": [
      "The lending team wants a one-page summary of loan applications by outcome.",
      "",
      "For each `status` in `loan_applications`, report how many applications there were, their total amount, and the rejection reasons.",
      "",
      "- `total_applications`: the number of applications with that status.",
      "- `total_amount`: the sum of `amount` for that status, rounded to 2 decimal places.",
      "- `rejection_reasons`: for `'approved'` rows, always the text `N/A` (even if a reason was filled in by mistake). For `'rejected'` rows, every distinct reason in one string, separated by a comma and a space (`, `), ordered by how many applications had that reason (most first), then alphabetically. A rejected application with a NULL `reject_reason` counts as the reason `Unknown`.",
      "",
      "**Output columns:** `status`, `total_applications`, `total_amount`, `rejection_reasons`",
      "",
      "**Sort by:** `status` ascending."
    ],
    "tables": [
      {
        "name": "loan_applications",
        "columns": [
          [
            "app_id",
            "INTEGER"
          ],
          [
            "status",
            "TEXT"
          ],
          [
            "amount",
            "REAL"
          ],
          [
            "reject_reason",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            "approved",
            5000.0,
            null
          ],
          [
            2,
            "rejected",
            2000.0,
            "low score"
          ],
          [
            3,
            "rejected",
            1500.0,
            "high debt"
          ],
          [
            4,
            "approved",
            12000.5,
            null
          ],
          [
            5,
            "rejected",
            800.0,
            "low score"
          ],
          [
            6,
            "rejected",
            3000.0,
            null
          ],
          [
            7,
            "rejected",
            2500.0,
            "high debt"
          ],
          [
            8,
            "approved",
            750.25,
            null
          ],
          [
            9,
            "approved",
            1000.0,
            "manual review"
          ]
        ]
      }
    ],
    "solution": [
      "WITH reason_counts AS (",
      "    SELECT COALESCE(reject_reason, 'Unknown') AS reason, COUNT(*) AS n",
      "    FROM loan_applications",
      "    WHERE status = 'rejected'",
      "    GROUP BY COALESCE(reject_reason, 'Unknown')",
      "),",
      "reason_list AS (",
      "    SELECT GROUP_CONCAT(reason ORDER BY n DESC, reason ASC SEPARATOR ', ') AS reasons",
      "    FROM reason_counts",
      ")",
      "SELECT a.status,",
      "       COUNT(*) AS total_applications,",
      "       ROUND(SUM(a.amount), 2) AS total_amount,",
      "       CASE WHEN a.status = 'approved' THEN 'N/A'",
      "            ELSE (SELECT reasons FROM reason_list)",
      "       END AS rejection_reasons",
      "FROM loan_applications a",
      "GROUP BY a.status",
      "ORDER BY a.status;"
    ],
    "starter": [
      "/*",
      "Enter your query below.",
      "Please append a semicolon \";\" at the end of the query",
      "*/",
      ""
    ],
    "approach": [
      "Split the work in two: the per-status counts and totals are a plain GROUP BY, and the reason list needs its own grouping (one row per reason with its count) before you can sort the reasons.",
      "Turn NULL reasons into 'Unknown' with COALESCE before counting, so they group together.",
      "Build the list with GROUP_CONCAT(reason ORDER BY n DESC, reason ASC SEPARATOR ', '). The ORDER BY inside GROUP_CONCAT controls the order of the items in the string.",
      "Use CASE in the final SELECT to print 'N/A' for approved rows no matter what their reason column says."
    ],
    "walkthrough": [
      "`reason_counts`: only rejected rows, with NULL reasons renamed to 'Unknown', grouped so each reason has its count: high debt 2, low score 2, Unknown 1.",
      "`reason_list`: one row holding 'high debt, low score, Unknown'. The two reasons with 2 tie, so the alphabetical tie-break puts high debt first.",
      "Main query: `GROUP BY a.status` gives one row per status with `COUNT(*)` and `ROUND(SUM(a.amount), 2)` (approved: 5000 + 12000.50 + 750.25 + 1000 = 18750.75).",
      "`CASE WHEN a.status = 'approved' THEN 'N/A' ELSE (SELECT reasons FROM reason_list) END`: approved always shows N/A, even app 9 with its stray 'manual review' reason.",
      "`ORDER BY a.status;`: approved before rejected."
    ],
    "mistakes": [
      "GROUP_CONCAT(reject_reason) straight from the table: reasons repeat ('low score, high debt, low score, ...'), the NULL one disappears, and the order is random.",
      "Forgetting COALESCE: the rejected application with no reason never shows up as Unknown.",
      "Sorting the list only alphabetically, or only by count, so ties come out in the wrong order.",
      "Letting approved rows show their reasons: app 9 would print 'manual review' instead of N/A.",
      "Using ',' instead of ', ' as the separator when the prompt asks for a comma and a space."
    ]
  },
  {
    "id": "sqli-decline-report-by-category",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Conditional counts with CASE and top value per group",
    "title": "Card declines by merchant category",
    "prompt": [
      "Risk wants to see which merchant categories have the most declined card payments.",
      "",
      "For each `category` in `card_txns`, report:",
      "",
      "- `approved`: the number of approved transactions.",
      "- `declined`: the number of declined transactions.",
      "- `decline_rate`: declined divided by all transactions in the category, rounded to 2 decimal places.",
      "- `top_decline_code`: the most common `decline_code` among that category's declined transactions. Count a NULL code as `UNKNOWN`. Break ties alphabetically. If the category has no declines, show `None`.",
      "",
      "**Output columns:** `category`, `approved`, `declined`, `decline_rate`, `top_decline_code`",
      "",
      "**Sort by:** `decline_rate` descending, then `category` ascending."
    ],
    "tables": [
      {
        "name": "card_txns",
        "columns": [
          [
            "txn_id",
            "INTEGER"
          ],
          [
            "category",
            "TEXT"
          ],
          [
            "status",
            "TEXT"
          ],
          [
            "amount",
            "REAL"
          ],
          [
            "decline_code",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            "grocery",
            "approved",
            54.2,
            null
          ],
          [
            2,
            "grocery",
            "approved",
            12.1,
            null
          ],
          [
            3,
            "grocery",
            "approved",
            80.0,
            null
          ],
          [
            4,
            "grocery",
            "declined",
            300.0,
            null
          ],
          [
            5,
            "travel",
            "approved",
            420.0,
            null
          ],
          [
            6,
            "travel",
            "declined",
            950.0,
            "LIMIT"
          ],
          [
            7,
            "travel",
            "declined",
            610.0,
            "NSF"
          ],
          [
            8,
            "travel",
            "declined",
            1200.0,
            "LIMIT"
          ],
          [
            9,
            "dining",
            "approved",
            45.0,
            null
          ],
          [
            10,
            "dining",
            "approved",
            60.5,
            null
          ],
          [
            11,
            "dining",
            "declined",
            75.0,
            "NSF"
          ],
          [
            12,
            "dining",
            "declined",
            220.0,
            "FRAUD"
          ],
          [
            13,
            "fuel",
            "approved",
            40.0,
            null
          ],
          [
            14,
            "fuel",
            "approved",
            38.75,
            null
          ]
        ]
      }
    ],
    "solution": [
      "WITH counts AS (",
      "    SELECT category,",
      "           SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,",
      "           SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) AS declined,",
      "           COUNT(*) AS total",
      "    FROM card_txns",
      "    GROUP BY category",
      "),",
      "codes AS (",
      "    SELECT category,",
      "           COALESCE(decline_code, 'UNKNOWN') AS code,",
      "           ROW_NUMBER() OVER (PARTITION BY category",
      "                              ORDER BY COUNT(*) DESC, COALESCE(decline_code, 'UNKNOWN')) AS rn",
      "    FROM card_txns",
      "    WHERE status = 'declined'",
      "    GROUP BY category, COALESCE(decline_code, 'UNKNOWN')",
      ")",
      "SELECT c.category,",
      "       c.approved,",
      "       c.declined,",
      "       ROUND(1.0 * c.declined / c.total, 2) AS decline_rate,",
      "       COALESCE(k.code, 'None') AS top_decline_code",
      "FROM counts c",
      "LEFT JOIN codes k ON k.category = c.category AND k.rn = 1",
      "ORDER BY decline_rate DESC, c.category;"
    ],
    "starter": [
      "/*",
      "Enter your query below.",
      "Please append a semicolon \";\" at the end of the query",
      "*/",
      ""
    ],
    "approach": [
      "Conditional counts: SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) counts one status inside a normal GROUP BY.",
      "\"Most common X per group, ties alphabetical\" is a ranking problem: group by (category, code) to count, then ROW_NUMBER() OVER (PARTITION BY category ORDER BY COUNT(*) DESC, code).",
      "LEFT JOIN the rank-1 code back so categories with no declines stay, then COALESCE the missing code to 'None'.",
      "Multiply by 1.0 before dividing so 1 / 4 is 0.25, not 0."
    ],
    "walkthrough": [
      "`counts`: one row per category. grocery has 3 approved and 1 declined out of 4.",
      "`codes`: declined rows only, NULL codes renamed UNKNOWN, counted per category and code. travel: LIMIT 2, NSF 1. dining: FRAUD 1 and NSF 1 tie.",
      "`ROW_NUMBER() ... ORDER BY COUNT(*) DESC, code`: the most common code gets 1; for dining the tie goes alphabetically to FRAUD.",
      "`LEFT JOIN codes k ON ... AND k.rn = 1`: fuel has no declines, so its code is NULL and COALESCE prints None.",
      "`ROUND(1.0 * c.declined / c.total, 2)` and the final ORDER BY: travel 0.75, dining 0.5, grocery 0.25, fuel 0.0."
    ],
    "mistakes": [
      "COUNT(status = 'declined') or COUNT(CASE ... ELSE 0 END): COUNT counts every non-NULL value, including 0, so both columns come out as the total.",
      "Integer division: 1 / 4 is 0 in SQLite, so every rate except travel's would show 0.",
      "Putting k.rn = 1 in WHERE after the LEFT JOIN, which drops fuel.",
      "Breaking the dining tie by first appearance (NSF) instead of alphabetically (FRAUD).",
      "Forgetting COALESCE on the code: grocery's only decline has no code and must count as UNKNOWN."
    ]
  },
  {
    "id": "sqli-top-three-amounts",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: DENSE_RANK top N per group",
    "title": "Top three deposit amounts in each branch",
    "prompt": [
      "Each branch wants to see its biggest depositors: every deposit whose amount is among the **three highest distinct amounts** in that branch. If two deposits share an amount, both appear, and they count as one of the three amounts.",
      "",
      "Branches with no deposits don't appear.",
      "",
      "**Output columns:** `branch_name`, `customer_name`, `amount`",
      "",
      "**Sort by:** `branch_name` ascending, then `amount` descending, then `customer_name` ascending."
    ],
    "tables": [
      {
        "name": "branches",
        "columns": [
          [
            "branch_id",
            "INTEGER"
          ],
          [
            "branch_name",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            "Back Bay"
          ],
          [
            2,
            "Cambridge"
          ],
          [
            3,
            "Providence"
          ]
        ]
      },
      {
        "name": "deposits",
        "columns": [
          [
            "deposit_id",
            "INTEGER"
          ],
          [
            "branch_id",
            "INTEGER"
          ],
          [
            "customer_name",
            "TEXT"
          ],
          [
            "amount",
            "REAL"
          ]
        ],
        "rows": [
          [
            1,
            1,
            "Ava",
            900
          ],
          [
            2,
            1,
            "Ben",
            900
          ],
          [
            3,
            1,
            "Cy",
            700
          ],
          [
            4,
            1,
            "Dee",
            650
          ],
          [
            5,
            1,
            "Eli",
            400
          ],
          [
            6,
            2,
            "Fay",
            500
          ],
          [
            7,
            2,
            "Gus",
            300
          ]
        ]
      }
    ],
    "solution": [
      "WITH ranked AS (",
      "    SELECT branch_id, customer_name, amount,",
      "           DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC) AS rnk",
      "    FROM deposits",
      ")",
      "SELECT b.branch_name, r.customer_name, r.amount",
      "FROM ranked r",
      "JOIN branches b ON b.branch_id = r.branch_id",
      "WHERE r.rnk <= 3",
      "ORDER BY b.branch_name, r.amount DESC, r.customer_name;"
    ],
    "starter": [
      "/*",
      "Enter your query below.",
      "Please append a semicolon \";\" at the end of the query",
      "*/",
      ""
    ],
    "approach": [
      "\"Top N distinct values per group, keep ties\" is DENSE_RANK: tied amounts share a rank and the next amount gets the next number.",
      "Rank in a CTE, then keep rnk <= 3 in the outer query (window functions can't go in WHERE).",
      "A branch with fewer than three amounts just returns what it has."
    ],
    "walkthrough": [
      "`DENSE_RANK() OVER (PARTITION BY branch_id ORDER BY amount DESC)`: Back Bay's 900, 900, 700, 650, 400 get 1, 1, 2, 3, 4.",
      "`WHERE r.rnk <= 3`: keeps Ava, Ben, Cy and Dee (four rows, three distinct amounts); Eli's 400 is rank 4.",
      "Cambridge has only two amounts, so both stay. Providence has none, so the inner JOIN leaves it out.",
      "`ORDER BY b.branch_name, r.amount DESC, r.customer_name`: the exact order asked for."
    ],
    "mistakes": [
      "RANK instead of DENSE_RANK: 900, 900, 700, 650 get 1, 1, 3, 4, so Dee's 650 is wrongly dropped.",
      "ROW_NUMBER: keeps only one of the two 900 deposits.",
      "ORDER BY amount DESC LIMIT 3: works for the whole table, not per branch.",
      "Putting the rank condition in the same SELECT's WHERE."
    ]
  },
  {
    "id": "sqli-login-streaks",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "Window functions: LAG with dates",
    "title": "Customers who logged in three days in a row",
    "prompt": [
      "Find every customer who logged in to online banking on **at least three consecutive calendar days** at some point. A customer can log in several times on one day; that still counts as one day.",
      "",
      "**Output columns:** `customer_id`",
      "",
      "**Sort by:** `customer_id` ascending."
    ],
    "tables": [
      {
        "name": "logins",
        "columns": [
          [
            "login_id",
            "INTEGER"
          ],
          [
            "customer_id",
            "INTEGER"
          ],
          [
            "login_date",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            1,
            "2025-03-01"
          ],
          [
            2,
            1,
            "2025-03-02"
          ],
          [
            3,
            1,
            "2025-03-02"
          ],
          [
            4,
            1,
            "2025-03-03"
          ],
          [
            5,
            2,
            "2025-03-01"
          ],
          [
            6,
            2,
            "2025-03-02"
          ],
          [
            7,
            2,
            "2025-03-04"
          ],
          [
            8,
            2,
            "2025-03-05"
          ],
          [
            9,
            3,
            "2025-03-10"
          ],
          [
            10,
            3,
            "2025-03-11"
          ],
          [
            11,
            3,
            "2025-03-12"
          ],
          [
            12,
            3,
            "2025-03-13"
          ],
          [
            13,
            4,
            "2025-03-31"
          ],
          [
            14,
            4,
            "2025-04-01"
          ],
          [
            15,
            4,
            "2025-04-02"
          ],
          [
            16,
            5,
            "2025-03-05"
          ]
        ]
      }
    ],
    "solution": [
      "WITH days AS (",
      "    SELECT DISTINCT customer_id, login_date",
      "    FROM logins",
      "),",
      "lagged AS (",
      "    SELECT customer_id, login_date,",
      "           LAG(login_date, 2) OVER (PARTITION BY customer_id ORDER BY login_date) AS two_back",
      "    FROM days",
      ")",
      "SELECT DISTINCT customer_id",
      "FROM lagged",
      "WHERE DATEDIFF(login_date, two_back) = 2",
      "ORDER BY customer_id;"
    ],
    "starter": [
      "/*",
      "Enter your query below.",
      "Please append a semicolon \";\" at the end of the query",
      "*/",
      ""
    ],
    "approach": [
      "Remove same-day repeats first (SELECT DISTINCT customer_id, login_date), or two logins on one day look like two days.",
      "LAG(login_date, 2) is the login day two rows earlier. If that day is exactly 2 days before this one, the three days in between are consecutive.",
      "DISTINCT in the final SELECT, because a customer with a 4-day streak matches twice."
    ],
    "walkthrough": [
      "`days`: customer 1 becomes 03-01, 03-02, 03-03 (the duplicate 03-02 is gone).",
      "`LAG(login_date, 2) OVER (PARTITION BY customer_id ORDER BY login_date)`: for 03-03 it's 03-01.",
      "`DATEDIFF(login_date, two_back) = 2`: 03-03 minus 03-01 is 2 days, so customer 1 qualifies. Customer 4's 04-02 minus 03-31 is also 2, across the month boundary.",
      "Customer 2 has a gap (03-02 to 03-04), and customer 5 has one day, so neither appears.",
      "`SELECT DISTINCT customer_id ... ORDER BY customer_id`: customer 3's 4-day streak matches twice but appears once."
    ],
    "mistakes": [
      "Skipping the DISTINCT on days: customer 1's two 03-02 logins make LAG look at the wrong row.",
      "Comparing day numbers (DAY(login_date)) instead of whole dates, which breaks across months.",
      "Using LAG(login_date) once, which only checks two days in a row.",
      "Forgetting DISTINCT in the final SELECT, so customer 3 appears twice."
    ]
  },
  {
    "id": "sqli-verification-rate",
    "section": "sqlint",
    "type": "sql",
    "difficulty": "Medium",
    "topic": "LEFT JOIN with AVG(CASE) rates",
    "title": "One-time passcode verification rate",
    "prompt": [
      "When a customer signs in on a new device, the bank texts a one-time passcode. Each request in `otp_requests` ends as `'verified'` or `'expired'`.",
      "",
      "For **every** customer, report their verification rate: verified requests divided by all their requests, rounded to 2 decimal places. A customer with no requests has a rate of 0.",
      "",
      "**Output columns:** `customer_id`, `verification_rate`",
      "",
      "**Sort by:** `customer_id` ascending."
    ],
    "tables": [
      {
        "name": "customers",
        "columns": [
          [
            "customer_id",
            "INTEGER"
          ],
          [
            "name",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            "Ava"
          ],
          [
            2,
            "Ben"
          ],
          [
            3,
            "Cy"
          ],
          [
            4,
            "Dee"
          ]
        ]
      },
      {
        "name": "otp_requests",
        "columns": [
          [
            "request_id",
            "INTEGER"
          ],
          [
            "customer_id",
            "INTEGER"
          ],
          [
            "result",
            "TEXT"
          ]
        ],
        "rows": [
          [
            1,
            1,
            "verified"
          ],
          [
            2,
            1,
            "verified"
          ],
          [
            3,
            1,
            "expired"
          ],
          [
            4,
            2,
            "expired"
          ],
          [
            5,
            2,
            "expired"
          ],
          [
            6,
            3,
            "verified"
          ]
        ]
      }
    ],
    "solution": [
      "SELECT c.customer_id,",
      "       ROUND(COALESCE(AVG(CASE WHEN o.result = 'verified' THEN 1.0 ELSE 0 END), 0), 2) AS verification_rate",
      "FROM customers c",
      "LEFT JOIN otp_requests o ON o.customer_id = c.customer_id",
      "GROUP BY c.customer_id",
      "ORDER BY c.customer_id;"
    ],
    "starter": [
      "/*",
      "Enter your query below.",
      "Please append a semicolon \";\" at the end of the query",
      "*/",
      ""
    ],
    "approach": [
      "\"For every customer\" means start from customers and LEFT JOIN the requests.",
      "AVG(CASE WHEN ... THEN 1.0 ELSE 0 END) is the share of rows that match: a rate in one expression.",
      "Use 1.0 (not 1) so the average isn't integer math, and COALESCE for safety."
    ],
    "walkthrough": [
      "`LEFT JOIN otp_requests o ON o.customer_id = c.customer_id`: Dee has no requests, so she gets one row of NULLs.",
      "`CASE WHEN o.result = 'verified' THEN 1.0 ELSE 0 END`: 1 for verified, 0 for expired, and 0 for Dee's NULL row.",
      "`AVG(...)`: Ava (1 + 1 + 0) / 3 = 0.67, Ben 0, Cy 1, Dee 0.",
      "`ROUND(..., 2)` and `ORDER BY c.customer_id`: two decimals, in id order."
    ],
    "mistakes": [
      "An inner JOIN, which drops Dee.",
      "SUM(verified) / COUNT(*) with whole numbers: integer division turns 2 / 3 into 0.",
      "COUNT(*) as the denominator after the LEFT JOIN with a THEN 1 ELSE NULL CASE: Dee's NULL row changes the math.",
      "Forgetting to round to 2 decimals."
    ]
  }
]
);
