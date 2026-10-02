window.BANK = (window.BANK || []).concat(
[
  {
    "id": "sqlb-left-join-where",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "LEFT JOIN and WHERE",
    "title": "A LEFT JOIN that loses rows",
    "prompt": [
      "An analyst wants every customer, with their open accounts if they have any:",
      "",
      "```",
      "SELECT c.customer_id, a.account_id",
      "FROM customers c",
      "LEFT JOIN accounts a ON a.customer_id = c.customer_id",
      "WHERE a.status = 'open';",
      "```",
      "",
      "What happens to customers who have no accounts at all?"
    ],
    "options": [
      "They appear once, with account_id NULL",
      "They are left out of the result",
      "The query fails because a.status can be NULL",
      "They appear once for every open account in the table"
    ],
    "answer": 1,
    "explanations": [
      "This is what the analyst wanted, and it is what the LEFT JOIN alone would produce. The WHERE clause then removes these rows.",
      "Correct. For customers without accounts, a.status is NULL, and NULL = 'open' is unknown, not true, so WHERE drops them. The LEFT JOIN behaves like an INNER JOIN. Moving the condition into the ON clause (ON ... AND a.status = 'open') keeps them.",
      "NULLs in a WHERE comparison never cause an error. The comparison just evaluates to unknown and the row is filtered out.",
      "A LEFT JOIN never pairs a customer with other customers' accounts. That would be a cross join."
    ],
    "approach": [
      "Trace one customer with no match: after the LEFT JOIN, every column from the right table is NULL.",
      "Then apply the WHERE clause to that row. Any comparison with NULL using =, <, > and so on is unknown, which WHERE treats as false.",
      "Rule of thumb: a filter on the right table belongs in ON if you want to keep unmatched left rows; in WHERE it turns the join into an inner join (unless the filter is IS NULL)."
    ]
  },
  {
    "id": "sqlb-is-null",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "NULL comparisons",
    "title": "Finding accounts with no close date",
    "prompt": "The `accounts` table has a `closed_date` column that is NULL for accounts that are still open. Which query returns exactly the accounts that are still open?",
    "options": [
      "`SELECT * FROM accounts WHERE closed_date = NULL;`",
      "`SELECT * FROM accounts WHERE closed_date IS NULL;`",
      "`SELECT * FROM accounts WHERE closed_date = '';`",
      "`SELECT * FROM accounts WHERE closed_date <> NULL;`"
    ],
    "answer": 1,
    "explanations": [
      "Comparing anything to NULL with = gives unknown, never true, so this returns no rows at all.",
      "Correct. IS NULL is the only way to test for a missing value.",
      "An empty string is a real value, not NULL. This finds rows that store '' and misses every NULL.",
      "<> NULL is also unknown for every row, so this returns no rows either. The right way to find closed accounts would be IS NOT NULL."
    ],
    "approach": [
      "NULL means \"unknown,\" so any comparison with it (=, <>, <, >) is unknown too, and WHERE keeps only rows where the condition is true.",
      "Use IS NULL and IS NOT NULL to test for missing values.",
      "Watch for options that swap NULL for an empty string or 0: those are different values."
    ]
  },
  {
    "id": "sqlb-count-variants",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Aggregations: COUNT and NULLs",
    "title": "Three kinds of COUNT",
    "prompt": [
      "The `applicants` table has 5 rows. Their `credit_score` values are 700, NULL, 650, 700, NULL.",
      "",
      "```",
      "SELECT COUNT(*), COUNT(credit_score), COUNT(DISTINCT credit_score)",
      "FROM applicants;",
      "```",
      "",
      "What does this return?"
    ],
    "options": ["5, 3, 2", "5, 5, 3", "3, 3, 2", "5, 3, 3"],
    "answer": 0,
    "explanations": [
      "Correct. COUNT(*) counts rows (5). COUNT(credit_score) skips NULLs (3). COUNT(DISTINCT credit_score) counts different non-NULL values: 700 and 650 (2).",
      "COUNT(column) does not count NULLs, so the second value cannot be 5, and DISTINCT does not treat NULL as a value either.",
      "COUNT(*) counts every row, including rows where some columns are NULL, so it is 5.",
      "This counts NULL as a distinct value. COUNT(DISTINCT ...) ignores NULLs, leaving 700 and 650."
    ],
    "approach": [
      "COUNT(*) counts rows. COUNT(col) counts rows where col is not NULL. COUNT(DISTINCT col) counts different non-NULL values.",
      "Cross out the NULLs first, then count what's left, then count the distinct values among them."
    ]
  },
  {
    "id": "sqlb-having-vs-where",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "GROUP BY and HAVING",
    "title": "Branches with more than 100 accounts",
    "prompt": "Which query lists the branches that have more than 100 accounts?",
    "options": [
      "`SELECT branch_id, COUNT(*) FROM accounts WHERE COUNT(*) > 100 GROUP BY branch_id;`",
      "`SELECT branch_id, COUNT(*) FROM accounts GROUP BY branch_id HAVING COUNT(*) > 100;`",
      "`SELECT branch_id, COUNT(*) FROM accounts GROUP BY branch_id WHERE COUNT(*) > 100;`",
      "`SELECT branch_id, COUNT(*) FROM accounts HAVING COUNT(*) > 100;`"
    ],
    "answer": 1,
    "explanations": [
      "WHERE filters rows before grouping, so it can't use an aggregate like COUNT(*). This is an error.",
      "Correct. GROUP BY forms one group per branch, and HAVING filters the groups using the aggregate.",
      "WHERE must come before GROUP BY, and it still can't contain an aggregate. Syntax error.",
      "Without GROUP BY the whole table is one group, so this checks the total account count, not each branch's. Most engines also reject branch_id here."
    ],
    "approach": [
      "Remember the order SQL evaluates clauses: FROM, WHERE (rows), GROUP BY, HAVING (groups), SELECT, ORDER BY.",
      "A condition on an aggregate (COUNT, SUM, AVG) goes in HAVING. A condition on a raw column goes in WHERE.",
      "Check that the query groups by the thing it reports per row."
    ]
  },
  {
    "id": "sqlb-limit-ties",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "ORDER BY, LIMIT and ties",
    "title": "Top 3 balances when two tie",
    "prompt": [
      "The four largest balances in `accounts` are 9,000, 8,500, 7,000 and 7,000 (two different accounts share 7,000).",
      "",
      "```",
      "SELECT account_id, balance",
      "FROM accounts",
      "ORDER BY balance DESC",
      "LIMIT 3;",
      "```",
      "",
      "What does this return?"
    ],
    "options": [
      "4 rows, because LIMIT keeps both accounts tied for third place",
      "3 rows, and which of the two 7,000 accounts appears is not guaranteed",
      "3 rows, always including the tied account with the lower account_id",
      "An error, because the ORDER BY column has duplicate values"
    ],
    "answer": 1,
    "explanations": [
      "LIMIT counts rows, not distinct values, so it never returns more than 3. To keep ties you need RANK() or DENSE_RANK() and a filter on the rank.",
      "Correct. LIMIT 3 returns exactly 3 rows. The two 7,000 rows are tied in the ORDER BY, and the database may pick either one. Add a tie-breaker (ORDER BY balance DESC, account_id) to make it deterministic.",
      "SQL makes no promise about the order of tied rows unless the ORDER BY says so. It often looks like id order, but you can't rely on it.",
      "Duplicate sort values are perfectly legal. They only make the order among the tied rows undefined."
    ],
    "approach": [
      "LIMIT n always means n rows (or fewer), regardless of ties.",
      "Rows that tie on every ORDER BY column come back in an unspecified order, so \"top N\" with ties is ambiguous.",
      "If a question says \"include ties,\" reach for RANK or DENSE_RANK. If it says \"break ties by X,\" add X to the ORDER BY."
    ]
  },
  {
    "id": "sqlb-distinct-pairs",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "SELECT DISTINCT",
    "title": "DISTINCT on two columns",
    "prompt": [
      "```",
      "SELECT DISTINCT branch_id, account_type",
      "FROM accounts;",
      "```",
      "",
      "What does this query return?"
    ],
    "options": [
      "Each branch_id once, with one of its account types",
      "Each different combination of branch_id and account_type once",
      "Each account_type once, with the first branch that offers it",
      "An error, because DISTINCT can only apply to one column"
    ],
    "answer": 1,
    "explanations": [
      "DISTINCT doesn't pick one value per branch. A branch with checking and savings accounts appears twice.",
      "Correct. DISTINCT applies to the whole selected row, so it removes rows where both columns repeat. A branch with three account types appears three times.",
      "There is no notion of \"first\" here, and account types can appear with several branches.",
      "DISTINCT applies to every column in the SELECT list, however many there are."
    ],
    "approach": [
      "DISTINCT works on the entire row of selected columns, not just the first column.",
      "It is equivalent to GROUP BY branch_id, account_type with no aggregates.",
      "If you need one row per branch, you need GROUP BY branch_id with an aggregate."
    ]
  },
  {
    "id": "sqlb-last-four-chars",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "String functions",
    "title": "Last four digits of a card number",
    "prompt": "`card_number` stores 16-digit card numbers as text, such as `'4111111111111234'`. In MySQL, which expression returns the last four digits (`'1234'`)?",
    "options": [
      "`RIGHT(card_number, 4)`",
      "`LEFT(card_number, 4)`",
      "`SUBSTRING(card_number, 4)`",
      "`SUBSTRING(card_number, 12, 4)`"
    ],
    "answer": 0,
    "explanations": [
      "Correct. RIGHT(s, n) returns the last n characters.",
      "LEFT returns the first 4 characters, '4111'.",
      "With only a start position, SUBSTRING returns everything from position 4 to the end, 13 characters.",
      "SQL strings start at position 1, so the last four of 16 characters start at position 13. Starting at 12 gives '1123': an off-by-one error."
    ],
    "approach": [
      "SQL string positions start at 1, not 0.",
      "SUBSTRING(s, start, length); the last k characters of an n-character string start at n − k + 1.",
      "RIGHT and LEFT are the simplest choice when you want the end or start of a string."
    ]
  },
  {
    "id": "sqlb-inner-join-count",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "INNER JOIN row counts",
    "title": "How many rows does the join return",
    "prompt": [
      "`customers` has 3 rows, with customer_id 1, 2 and 3. `accounts` has 4 rows: two belong to customer 1, one to customer 2, and one has customer_id NULL.",
      "",
      "```",
      "SELECT *",
      "FROM customers c",
      "JOIN accounts a ON a.customer_id = c.customer_id;",
      "```",
      "",
      "How many rows does this return?"
    ],
    "options": ["3", "4", "5", "12"],
    "answer": 0,
    "explanations": [
      "Correct. An inner join keeps only matching pairs: customer 1 matches 2 accounts and customer 2 matches 1. Customer 3 has no match, and the NULL account matches nobody because NULL = anything is never true.",
      "This is the LEFT JOIN count: the 3 matches plus customer 3 kept with NULLs.",
      "This is a FULL OUTER JOIN count: the 3 matches, plus customer 3, plus the unmatched NULL account.",
      "This is a cross join, 3 × 4, every customer paired with every account."
    ],
    "approach": [
      "Count matches customer by customer: each customer contributes one row per matching account.",
      "Inner join drops unmatched rows on both sides. LEFT JOIN keeps unmatched left rows, FULL OUTER keeps both.",
      "NULL keys never match, not even another NULL."
    ],
    "check": { "compute": "2 + 1", "values": ["3", "4", "5", "12"] }
  },
  {
    "id": "sqlb-avg-ignores-null",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Aggregations and NULLs",
    "title": "Average with a missing balance",
    "prompt": "A column `balance` holds 100, 200, NULL and 300. What does `SELECT AVG(balance) FROM accounts;` return?",
    "options": ["150", "200", "NULL", "600"],
    "answer": 1,
    "explanations": [
      "This divides 600 by 4, treating the NULL as 0. AVG skips NULLs, so it divides by 3.",
      "Correct. Aggregates ignore NULLs: (100 + 200 + 300) / 3 = 200. If NULL should count as 0, write AVG(COALESCE(balance, 0)) to get 150.",
      "Arithmetic like 100 + NULL is NULL, but aggregate functions skip NULLs. AVG is NULL only when every value is NULL.",
      "This is SUM(balance), not the average."
    ],
    "approach": [
      "Aggregates (SUM, AVG, MIN, MAX, COUNT(col)) skip NULLs. COUNT(*) is the one that counts every row.",
      "So AVG(col) = SUM(col) / COUNT(col), not SUM(col) / COUNT(*).",
      "Decide whether a missing value should count as zero; if so, use COALESCE."
    ],
    "check": { "compute": "600/3", "values": ["600/4", "600/3", "float('nan')", "600"] }
  },
  {
    "id": "sqlb-between-inclusive",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "WHERE: BETWEEN",
    "title": "Is BETWEEN inclusive",
    "prompt": "Which of the credit scores 649, 650, 700 and 701 satisfy `WHERE credit_score BETWEEN 650 AND 700`?",
    "options": ["650 and 700", "650 only", "None of them; BETWEEN excludes both ends", "700 and 701"],
    "answer": 0,
    "explanations": [
      "Correct. BETWEEN a AND b means >= a AND <= b, so both endpoints are included.",
      "BETWEEN includes the upper end as well as the lower end.",
      "BETWEEN is inclusive on both ends. This mixes it up with an exclusive range.",
      "701 is above the upper bound of 700, and this option leaves out 650, which is included."
    ],
    "approach": [
      "Translate BETWEEN into >= and <= before deciding.",
      "Test the boundary values themselves; they are what these questions are about.",
      "With dates that include times, BETWEEN '2025-01-01' AND '2025-01-31' misses most of Jan 31. A half-open range (< '2025-02-01') is safer."
    ]
  },
  {
    "id": "sqlb-rank-functions",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Window functions: ROW_NUMBER, RANK, DENSE_RANK",
    "title": "Which ranking function gives 1, 2, 2, 4",
    "prompt": "Four accounts have balances 900, 800, 800 and 700. Ordered by balance descending, which window function assigns them 1, 2, 2, 4?",
    "options": [
      "`ROW_NUMBER() OVER (ORDER BY balance DESC)`",
      "`RANK() OVER (ORDER BY balance DESC)`",
      "`DENSE_RANK() OVER (ORDER BY balance DESC)`",
      "`NTILE(2) OVER (ORDER BY balance DESC)`"
    ],
    "answer": 1,
    "explanations": [
      "ROW_NUMBER gives every row a different number, 1, 2, 3, 4, even when values tie. This is how it \"drops\" ties in top-N queries.",
      "Correct. RANK gives tied rows the same rank and then skips: two rows share 2, so the next rank is 4.",
      "DENSE_RANK also gives ties the same rank but doesn't skip: 1, 2, 2, 3.",
      "NTILE(2) splits the rows into 2 equal buckets: 1, 1, 2, 2."
    ],
    "approach": [
      "Memorize the three on the same data (900, 800, 800, 700): ROW_NUMBER 1,2,3,4; RANK 1,2,2,4; DENSE_RANK 1,2,2,3.",
      "Gaps after ties: RANK. No gaps: DENSE_RANK. Never ties: ROW_NUMBER.",
      "\"Nth highest distinct value\" questions want DENSE_RANK; \"include all ties for first\" works with RANK or DENSE_RANK."
    ]
  },
  {
    "id": "sqlb-union-vs-union-all",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "UNION and UNION ALL",
    "title": "Customers with checking or savings",
    "prompt": [
      "`checking` contains customer_id values 1, 2 and 5. `savings` contains customer_id values 5 and 6.",
      "",
      "```",
      "SELECT customer_id FROM checking",
      "UNION",
      "SELECT customer_id FROM savings;",
      "```",
      "",
      "How many rows does this return?"
    ],
    "options": ["5", "4", "1", "6"],
    "answer": 1,
    "explanations": [
      "This is what UNION ALL returns: it keeps duplicates, so customer 5 appears twice.",
      "Correct. UNION removes duplicate rows, so the result is 1, 2, 5, 6.",
      "This is the intersection (customers in both tables), which INTERSECT or an inner join would give.",
      "This is the 3 × 2 cross join count, which has nothing to do with UNION."
    ],
    "approach": [
      "UNION stacks the results and removes duplicates; UNION ALL stacks and keeps everything.",
      "List the combined values and cross out repeats.",
      "UNION ALL is faster because it skips the duplicate check, so use it when you know there are no duplicates or want them."
    ],
    "check": { "compute": "len({1, 2, 5} | {5, 6})", "values": ["5", "4", "1", "6"] }
  },
  {
    "id": "sqlb-group-by-nonaggregated",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "GROUP BY rules",
    "title": "A column that isn't grouped",
    "prompt": [
      "```",
      "SELECT branch_id, customer_name, SUM(balance)",
      "FROM accounts",
      "GROUP BY branch_id;",
      "```",
      "",
      "What happens in standard SQL (and in MySQL with its default ONLY_FULL_GROUP_BY mode)?"
    ],
    "options": [
      "It returns one row per customer with their branch's total",
      "It returns an error, because customer_name is neither grouped nor aggregated",
      "It returns one row per branch with all customer names joined together",
      "It returns one row per branch with the first customer name alphabetically"
    ],
    "answer": 1,
    "explanations": [
      "GROUP BY branch_id makes one row per branch, never one per customer.",
      "Correct. Each branch has many customers, so the database can't pick one customer_name for the branch's single row. Every selected column must be in GROUP BY or inside an aggregate.",
      "Joining names needs an explicit aggregate such as GROUP_CONCAT (MySQL) or STRING_AGG.",
      "Nothing picks the alphabetically first name automatically. You would write MIN(customer_name) for that."
    ],
    "approach": [
      "Rule: every column in SELECT must either appear in GROUP BY or be wrapped in an aggregate.",
      "Picture the output: one row per group. Ask whether each selected column has a single value per group.",
      "Older MySQL returned an arbitrary value instead of an error; don't rely on it."
    ]
  },
  {
    "id": "sqlb-like-ends-with",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "String matching with LIKE",
    "title": "Emails at one domain",
    "prompt": "Which WHERE clause finds customers whose email ends with `@citizensbank.com`?",
    "options": [
      "`WHERE email LIKE '@citizensbank.com%'`",
      "`WHERE email = '%@citizensbank.com'`",
      "`WHERE email LIKE '%@citizensbank.com'`",
      "`WHERE email LIKE '_@citizensbank.com'`"
    ],
    "answer": 2,
    "explanations": [
      "This matches emails that start with '@citizensbank.com', the opposite of what's wanted.",
      "= compares literally, so % is just a percent sign here. Wildcards only work with LIKE.",
      "Correct. % matches any number of characters (including none), so '%@citizensbank.com' means \"anything, then ends with @citizensbank.com.\"",
      "_ matches exactly one character, so this only finds emails like 'a@citizensbank.com'."
    ],
    "approach": [
      "LIKE wildcards: % is any run of characters, _ is exactly one character.",
      "Ends with X: '%X'. Starts with X: 'X%'. Contains X: '%X%'.",
      "Wildcards need LIKE; with = they're ordinary characters."
    ]
  },
  {
    "id": "sqlb-coalesce-first",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "NULL handling with COALESCE",
    "title": "Choosing a display name",
    "prompt": "For a customer whose `nickname` is NULL and `first_name` is `'Ana'`, what does `COALESCE(nickname, first_name, 'Customer')` return?",
    "options": ["NULL", "'Customer'", "'Ana'", "An error, because the arguments mix columns and text"],
    "answer": 2,
    "explanations": [
      "COALESCE returns NULL only if every argument is NULL.",
      "'Customer' is the fallback used only when both nickname and first_name are NULL.",
      "Correct. COALESCE returns the first argument that isn't NULL: nickname is NULL, so it moves on to first_name, 'Ana'.",
      "Mixing columns and literals is normal for COALESCE, as long as the types are compatible."
    ],
    "approach": [
      "Read COALESCE left to right and stop at the first non-NULL value.",
      "Common uses: default values for display, and turning NULL into 0 before arithmetic.",
      "IFNULL(a, b) in MySQL is the two-argument version."
    ]
  }
]
);
