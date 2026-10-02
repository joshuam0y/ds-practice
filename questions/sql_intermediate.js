window.BANK = (window.BANK || []).concat(
[
  {
    "id": "sqli-top-depositor-per-branch",
    "section": "sqlint",
    "type": "sql",
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
          [1, "Ava Chen", 1], [2, "Ben Ortiz", 1], [3, "Chloe Park", 1],
          [4, "Dev Patel", 2], [5, "Emma Ross", 2], [6, "Finn Walsh", 3]
        ]
      },
      {
        "name": "transactions",
        "columns": [["txn_id", "INTEGER"], ["customer_id", "INTEGER"], ["txn_type", "TEXT"], ["amount", "REAL"], ["txn_date", "TEXT"]],
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
    "starter": ["-- Write your query here", ""],
    "approach": [
      "Spot the pattern: \"top N per group\" with \"return all ties\" means a window function, and specifically RANK or DENSE_RANK, not ROW_NUMBER.",
      "Build it in layers with CTEs. First filter and aggregate (one row per customer with their 2025 deposit total), then rank inside each branch, then keep rank 1.",
      "Apply every filter before aggregating: the deposit type and the date range. A half-open range (>= 2025-01-01 and < 2026-01-01) is safe whether dates have times or not; YEAR(txn_date) = 2025 also works here.",
      "Join to branches last for the name, and finish with the exact ORDER BY the prompt asks for."
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
          [101, 1, 12000, "default"], [102, 1, 8000, "current"], [103, 1, 15000, "default"], [104, 1, 5000, "paid"],
          [105, 2, 20000, "default"], [106, 2, 9000, null], [107, 2, 4000, "current"],
          [108, 3, 7000, "default"], [109, 3, 3000, "default"],
          [110, 4, 11000, "default"], [111, 4, 6000, "default"], [112, 4, 2500, "current"], [113, 4, 9500, null],
          [114, 5, 10000, "default"], [115, 5, 4000, "current"], [116, 5, 6000, "current"], [117, 5, 3000, "paid"]
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
    "starter": ["-- Write your query here", ""],
    "approach": [
      "\"For each branch ... only branches with ...\" means GROUP BY branch, then filter groups with HAVING (WHERE can't see aggregates).",
      "Count conditionally with SUM(CASE WHEN status = 'default' THEN 1 ELSE 0 END). It treats NULL status as 0, which is what the prompt wants.",
      "Count loans with COUNT(loan_id) or COUNT(*), never COUNT(status), because COUNT(column) skips NULLs.",
      "Force decimal division (1.0 * x / y) before ROUND. In SQLite and several other engines, integer / integer truncates.",
      "Read the boundaries literally: \"at least 3\" is >= 3 and \"above 0.25\" is > 0.25. Check them against the sample: Providence has only 2 loans and Hartford sits at exactly 0.25.",
      "Sort by rate descending, and break ties by name: Back Bay and Worcester are both 0.5."
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
    "starter": ["-- Write your query here", ""],
    "approach": [
      "\"Running\" or \"cumulative\" total per something means SUM(...) OVER (PARTITION BY something ORDER BY time).",
      "Make the window's ORDER BY unique. If it orders only by date, rows on the same date are \"peers,\" and the default window frame includes all peers at once, so both same-day rows show the end-of-day total.",
      "Handle NULLs explicitly with COALESCE, both for the displayed amount and inside the SUM.",
      "The final ORDER BY sorts the output; it is separate from the window's ORDER BY. Write both."
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
        "columns": [["account_id", "INTEGER"], ["branch_id", "INTEGER"], ["opened_date", "TEXT"], ["opening_deposit", "REAL"]],
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
    "starter": ["-- Write your query here", ""],
    "approach": [
      "\"Every branch must appear\" means start from branches and LEFT JOIN the accounts.",
      "Put the date filter in the ON clause. In WHERE, it would remove the NULL rows the LEFT JOIN created for Providence, turning it back into an inner join.",
      "Count a column from the right table, COUNT(a.account_id), so a branch with no match counts 0, not 1.",
      "SUM over no rows is NULL, so wrap it in COALESCE(..., 0).",
      "Check the year boundaries in the sample: Dec 31, 2024, Dec 31, 2025 and Jan 1, 2026."
    ],
    "mistakes": [
      "Filtering the year in WHERE: Providence disappears from the output.",
      "COUNT(*): Providence's single NULL-padded row counts as 1 account opened.",
      "Showing NULL instead of 0 for Providence's total.",
      "Off-by-one dates: <= '2025-12-31' is fine for plain dates, but BETWEEN '2025-01-01' AND '2025-12-31' misses late-day timestamps if the column has times.",
      "Forgetting the branch_name tie-breaker: Back Bay and Cambridge both opened 2."
    ]
  }
]
);
