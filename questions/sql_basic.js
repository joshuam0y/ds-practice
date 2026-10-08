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
      "The query fails because a.status can be NULL",
      "They are left out of the result",
      "They appear once for every open account in the table"
    ],
    "answer": 2,
    "explanations": [
      "This is what the analyst wanted, and it is what the LEFT JOIN alone would produce. The WHERE clause then removes these rows.",
      "NULLs in a WHERE comparison never cause an error. The comparison just evaluates to unknown and the row is filtered out.",
      "Correct. For customers without accounts, a.status is NULL, and NULL = 'open' is unknown, not true, so WHERE drops them. The LEFT JOIN behaves like an INNER JOIN. Moving the condition into the ON clause (ON ... AND a.status = 'open') keeps them.",
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
      "`SELECT * FROM accounts WHERE closed_date <> NULL;`",
      "`SELECT * FROM accounts WHERE closed_date = '';`",
      "`SELECT * FROM accounts WHERE closed_date IS NULL;`"
    ],
    "answer": 3,
    "explanations": [
      "Comparing anything to NULL with = gives unknown, never true, so this returns no rows at all.",
      "<> NULL is also unknown for every row, so this returns no rows either. The right way to find closed accounts would be IS NOT NULL.",
      "An empty string is a real value, not NULL. This finds rows that store '' and misses every NULL.",
      "Correct. IS NULL is the only way to test for a missing value."
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
      "Each different combination of branch_id and account_type once",
      "Each branch_id once, with one of its account types",
      "Each account_type once, with the first branch that offers it",
      "An error, because DISTINCT can only apply to one column"
    ],
    "answer": 0,
    "explanations": [
      "Correct. DISTINCT applies to the whole selected row, so it removes rows where both columns repeat. A branch with three account types appears three times.",
      "DISTINCT doesn't pick one value per branch. A branch with checking and savings accounts appears twice.",
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
      "`SUBSTRING(card_number, 12, 4)`",
      "`LEFT(card_number, 4)`",
      "`SUBSTRING(card_number, 4)`",
      "`RIGHT(card_number, 4)`"
    ],
    "answer": 3,
    "explanations": [
      "SQL strings start at position 1, so the last four of 16 characters start at position 13. Starting at 12 gives '1123': an off-by-one error.",
      "LEFT returns the first 4 characters, '4111'.",
      "With only a start position, SUBSTRING returns everything from position 4 to the end, 13 characters.",
      "Correct. RIGHT(s, n) returns the last n characters."
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
    "options": ["5", "4", "3", "12"],
    "answer": 2,
    "explanations": [
      "This is a FULL OUTER JOIN count: the 3 matches, plus customer 3, plus the unmatched NULL account.",
      "This is the LEFT JOIN count: the 3 matches plus customer 3 kept with NULLs.",
      "Correct. An inner join keeps only matching pairs: customer 1 matches 2 accounts and customer 2 matches 1. Customer 3 has no match, and the NULL account matches nobody because NULL = anything is never true.",
      "This is a cross join, 3 × 4, every customer paired with every account."
    ],
    "approach": [
      "Count matches customer by customer: each customer contributes one row per matching account.",
      "Inner join drops unmatched rows on both sides. LEFT JOIN keeps unmatched left rows, FULL OUTER keeps both.",
      "NULL keys never match, not even another NULL."
    ],
    "check": {"compute": "2 + 1", "values": ["5", "4", "3", "12"]}
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
    "check": {"compute": "600/3", "values": ["600/4", "600/3", "float('nan')", "600"]}
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
      "`DENSE_RANK() OVER (ORDER BY balance DESC)`",
      "`RANK() OVER (ORDER BY balance DESC)`",
      "`NTILE(2) OVER (ORDER BY balance DESC)`"
    ],
    "answer": 2,
    "explanations": [
      "ROW_NUMBER gives every row a different number, 1, 2, 3, 4, even when values tie. This is how it \"drops\" ties in top-N queries.",
      "DENSE_RANK also gives ties the same rank but doesn't skip: 1, 2, 2, 3.",
      "Correct. RANK gives tied rows the same rank and then skips: two rows share 2, so the next rank is 4.",
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
    "options": ["5", "6", "1", "4"],
    "answer": 3,
    "explanations": [
      "This is what UNION ALL returns: it keeps duplicates, so customer 5 appears twice.",
      "This is the 3 × 2 cross join count, which has nothing to do with UNION.",
      "This is the intersection (customers in both tables), which INTERSECT or an inner join would give.",
      "Correct. UNION removes duplicate rows, so the result is 1, 2, 5, 6."
    ],
    "approach": [
      "UNION stacks the results and removes duplicates; UNION ALL stacks and keeps everything.",
      "List the combined values and cross out repeats.",
      "UNION ALL is faster because it skips the duplicate check, so use it when you know there are no duplicates or want them."
    ],
    "check": {"compute": "len({1, 2, 5} | {5, 6})", "values": ["5", "6", "1", "4"]}
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
      "It returns one row per branch with all customer names joined together",
      "It returns an error, because customer_name is neither grouped nor aggregated",
      "It returns one row per branch with the first customer name alphabetically"
    ],
    "answer": 2,
    "explanations": [
      "GROUP BY branch_id makes one row per branch, never one per customer.",
      "Joining names needs an explicit aggregate such as GROUP_CONCAT (MySQL) or STRING_AGG.",
      "Correct. Each branch has many customers, so the database can't pick one customer_name for the branch's single row. Every selected column must be in GROUP BY or inside an aggregate.",
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
      "`WHERE email LIKE '%@citizensbank.com'`",
      "`WHERE email = '%@citizensbank.com'`",
      "`WHERE email LIKE '_@citizensbank.com'`"
    ],
    "answer": 1,
    "explanations": [
      "This matches emails that start with '@citizensbank.com', the opposite of what's wanted.",
      "Correct. % matches any number of characters (including none), so '%@citizensbank.com' means \"anything, then ends with @citizensbank.com.\"",
      "= compares literally, so % is just a percent sign here. Wildcards only work with LIKE.",
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
    "options": ["NULL", "'Customer'", "An error, because the arguments mix columns and text", "'Ana'"],
    "answer": 3,
    "explanations": [
      "COALESCE returns NULL only if every argument is NULL.",
      "'Customer' is the fallback used only when both nickname and first_name are NULL.",
      "Mixing columns and literals is normal for COALESCE, as long as the types are compatible.",
      "Correct. COALESCE returns the first argument that isn't NULL: nickname is NULL, so it moves on to first_name, 'Ana'."
    ],
    "approach": [
      "Read COALESCE left to right and stop at the first non-NULL value.",
      "Common uses: default values for display, and turning NULL into 0 before arithmetic.",
      "IFNULL(a, b) in MySQL is the two-argument version."
    ]
  },
  {
    "id": "sqlb-multi-customers-without-accounts",
    "section": "sqlbasic",
    "type": "multi",
    "topic": "Joins, NOT IN and NULLs",
    "title": "Queries that find customers with no accounts",
    "prompt": [
      "Some rows in `accounts` have `customer_id` NULL. Which queries correctly return the customers who have no accounts?"
    ],
    "options": [
      "`SELECT c.* FROM customers c LEFT JOIN accounts a ON a.customer_id = c.customer_id WHERE a.customer_id IS NULL;`",
      "`SELECT * FROM customers WHERE customer_id NOT IN (SELECT customer_id FROM accounts);`",
      "`SELECT * FROM customers c WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.customer_id = c.customer_id);`",
      "`SELECT c.* FROM customers c JOIN accounts a ON a.customer_id = c.customer_id WHERE a.customer_id IS NULL;`",
      "`SELECT c.* FROM customers c LEFT JOIN accounts a ON a.customer_id = c.customer_id WHERE a.customer_id = NULL;`"
    ],
    "answers": [0, 2],
    "explanations": [
      "Correct. The anti-join pattern: unmatched customers get NULLs from the LEFT JOIN, and IS NULL keeps exactly those.",
      "Not true. Because the subquery contains a NULL, x NOT IN (..., NULL) is never true, so this returns no rows at all.",
      "Correct. NOT EXISTS is safe with NULLs: a NULL account simply never matches.",
      "Not true. An inner join keeps only matches, and a matched row never has a NULL customer_id, so this is always empty.",
      "Not true. = NULL is never true; you need IS NULL."
    ],
    "approach": [
      "Know the three anti-join patterns: LEFT JOIN ... IS NULL, NOT EXISTS, and NOT IN.",
      "NOT IN breaks when the subquery can return NULL. Prefer NOT EXISTS or the LEFT JOIN pattern.",
      "= NULL and <> NULL never match anything."
    ]
  },
  {
    "id": "sqlb-multi-null-facts",
    "section": "sqlbasic",
    "type": "multi",
    "topic": "NULL handling",
    "title": "True statements about NULL",
    "prompt": "Which statements about NULL in SQL are true?",
    "options": [
      "`NULL = NULL` evaluates to unknown, not true",
      "`COUNT(*)` counts a row even if every column in it is NULL",
      "`SUM(col)` returns 0 when every value of col is NULL",
      "`COALESCE(NULL, NULL, 5)` returns 5",
      "`WHERE col <> 'x'` also returns rows where col is NULL",
      "`GROUP BY col` puts all NULL values of col into a single group"
    ],
    "answers": [0, 1, 3, 5],
    "explanations": [
      "Correct. Any comparison with NULL is unknown, even with another NULL.",
      "Correct. COUNT(*) counts rows, not values.",
      "Not true. With no non-NULL values, SUM returns NULL. Wrap it in COALESCE(SUM(col), 0) for 0.",
      "Correct. COALESCE returns the first non-NULL argument.",
      "Not true. NULL <> 'x' is unknown, so those rows are filtered out. Add OR col IS NULL to keep them.",
      "Correct. For grouping, NULLs are treated as equal and form one group."
    ],
    "approach": [
      "Separate comparisons (NULL gives unknown) from aggregates (NULLs are skipped) and grouping (NULLs form one group).",
      "Watch for claims that an aggregate over only NULLs returns 0: it returns NULL (COUNT is the exception, returning 0)."
    ]
  },
  {
    "id": "sqlb-multi-ranking-facts",
    "section": "sqlbasic",
    "type": "multi",
    "topic": "Window functions: ROW_NUMBER, RANK, DENSE_RANK",
    "title": "Ranking four balances",
    "prompt": "Four accounts have balances 900, 800, 800 and 700, ranked with `ORDER BY balance DESC`. Which statements are true?",
    "options": [
      "`ROW_NUMBER()` gives the 700 row the number 4",
      "`RANK()` gives the 700 row rank 4",
      "`DENSE_RANK()` gives the 700 row rank 3",
      "`RANK()` gives both 800 rows rank 2",
      "`ROW_NUMBER()` gives both 800 rows the number 2",
      "`DENSE_RANK()` gives the 700 row rank 4"
    ],
    "answers": [0, 1, 2, 3],
    "explanations": [
      "Correct. ROW_NUMBER numbers rows 1, 2, 3, 4 with no ties.",
      "Correct. RANK gives both 800s rank 2 and then skips to 4.",
      "Correct. DENSE_RANK doesn't leave gaps: 1, 2, 2, 3.",
      "Correct. Tied rows share a rank.",
      "Not true. ROW_NUMBER never repeats a number; the two 800s get 2 and 3 in an unspecified order.",
      "Not true. That's RANK. DENSE_RANK gives 3."
    ],
    "approach": [
      "Write out the three sequences for the same data: ROW_NUMBER 1,2,3,4; RANK 1,2,2,4; DENSE_RANK 1,2,2,3.",
      "Then check each statement against them."
    ]
  },
  {
    "id": "sqlb-multi-having-queries",
    "section": "sqlbasic",
    "type": "multi",
    "topic": "GROUP BY, HAVING and ORDER BY (MySQL)",
    "title": "Branches over a million, largest first",
    "prompt": "Using MySQL, which queries list branches whose total balance is over 1,000,000, largest total first?",
    "options": [
      "`SELECT branch_id, SUM(balance) AS total FROM accounts GROUP BY branch_id HAVING SUM(balance) > 1000000 ORDER BY total DESC;`",
      "`SELECT branch_id, SUM(balance) AS total FROM accounts WHERE SUM(balance) > 1000000 GROUP BY branch_id ORDER BY total DESC;`",
      "`SELECT branch_id, SUM(balance) AS total FROM accounts GROUP BY branch_id HAVING total > 1000000 ORDER BY total DESC;`",
      "`SELECT branch_id, SUM(balance) AS total FROM accounts GROUP BY branch_id HAVING SUM(balance) > 1000000 ORDER BY total;`",
      "`SELECT * FROM (SELECT branch_id, SUM(balance) AS total FROM accounts GROUP BY branch_id) t WHERE total > 1000000 ORDER BY total DESC;`"
    ],
    "answers": [0, 2, 4],
    "explanations": [
      "Correct. The standard pattern: aggregate per branch, filter groups with HAVING, then sort.",
      "Not true. WHERE runs before grouping and can't use aggregates. This is an error.",
      "Correct. MySQL (and SQLite) allow a select alias in HAVING. Some other databases don't, so the SUM form is the portable choice.",
      "Not true. ORDER BY defaults to ascending, so the largest total comes last.",
      "Correct. Filtering the grouped result in an outer query works too: there, total is an ordinary column."
    ],
    "approach": [
      "Conditions on aggregates go in HAVING, or in an outer query's WHERE.",
      "Check the sort direction: \"largest first\" needs DESC.",
      "Know which shortcuts MySQL allows (aliases in HAVING) and which are errors everywhere (aggregates in WHERE)."
    ]
  },
  {
    "id": "sqlb-ddl-drop-column",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Table structure: ALTER TABLE",
    "title": "Removing a column",
    "prompt": "The `transfers` table has a `memo` column nobody uses. Which MySQL statement removes the column itself (not just its values)?",
    "options": [
      "UPDATE transfers SET memo = NULL;",
      "DELETE memo FROM transfers;",
      "ALTER TABLE transfers DROP COLUMN memo;",
      "DROP COLUMN memo FROM transfers;"
    ],
    "answer": 2,
    "explanations": [
      "This empties the values but the column is still there. UPDATE changes data, not the table's structure.",
      "DELETE removes rows, never columns, and this isn't valid syntax.",
      "Correct. Changing a table's structure (adding, removing or renaming a column) is always ALTER TABLE: ALTER TABLE transfers DROP COLUMN memo.",
      "There is no standalone DROP COLUMN statement; DROP COLUMN only works inside ALTER TABLE."
    ],
    "approach": [
      "Data or structure? Changing rows uses INSERT, UPDATE, DELETE. Changing columns uses ALTER TABLE.",
      "ALTER TABLE t ADD COLUMN c type; ALTER TABLE t DROP COLUMN c; ALTER TABLE t RENAME COLUMN a TO b."
    ]
  },
  {
    "id": "sqlb-truncate-vs-drop",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Table structure: DROP, TRUNCATE, DELETE",
    "title": "Empty a table but keep it",
    "prompt": "Every night the `staging_txns` table is loaded fresh. You need to remove all of today's rows but keep the table and its columns for tomorrow's load. Which statement does that?",
    "options": [
      "DROP TABLE staging_txns;",
      "TRUNCATE TABLE staging_txns;",
      "ALTER TABLE staging_txns DROP ROWS;",
      "DELETE TABLE staging_txns;"
    ],
    "answer": 1,
    "explanations": [
      "DROP TABLE deletes the whole table, columns included. Tomorrow's load would fail because the table no longer exists.",
      "Correct. TRUNCATE removes every row and keeps the table structure. DELETE FROM staging_txns; would also work (row by row, and it can take a WHERE).",
      "ALTER TABLE changes structure; there is no DROP ROWS.",
      "Not valid syntax. The DELETE statement is DELETE FROM table_name."
    ],
    "approach": [
      "DROP = the table is gone. TRUNCATE = all rows gone, table kept. DELETE FROM ... WHERE = some or all rows gone, table kept."
    ]
  },
  {
    "id": "sqlb-join-statement-false",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Joins: what each join returns",
    "title": "Which statement about joins is false",
    "prompt": "Which of these statements about joins is **not** correct?",
    "options": [
      "An INNER JOIN returns only the rows that have a match in both tables.",
      "A LEFT JOIN keeps every row from the left table, with NULLs where the right table has no match.",
      "A self join joins a table to itself, using two different aliases.",
      "A RIGHT JOIN returns only the rows from the right table that have a match in the left table."
    ],
    "answer": 3,
    "explanations": [
      "This is true: rows without a match on either side are dropped.",
      "This is true: that's what makes a LEFT JOIN different from an INNER JOIN.",
      "This is true: for example, employees e JOIN employees m ON e.manager_id = m.emp_id.",
      "Correct (this is the false one). A RIGHT JOIN keeps every row from the right table, matched or not; it's a LEFT JOIN with the tables swapped. Only matching rows describes an INNER JOIN."
    ],
    "approach": [
      "Read \"not correct\" twice: you're looking for the one false statement.",
      "LEFT keeps all of the left table, RIGHT keeps all of the right table, INNER keeps only matches."
    ]
  },
  {
    "id": "sqlb-self-join-manager",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Joins: self join",
    "title": "Each employee's manager",
    "prompt": "`employees(emp_id, name, manager_id)` stores each employee's manager as another row in the same table. The CEO's `manager_id` is NULL. Which query lists every employee with their manager's name, including the CEO?",
    "options": [
      "SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.emp_id;",
      "SELECT e.name, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.emp_id;",
      "SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.emp_id = m.manager_id;",
      "SELECT e.name, m.name AS manager FROM employees e CROSS JOIN employees m;"
    ],
    "answer": 0,
    "explanations": [
      "Correct. A self join with two aliases: e is the employee, m is the manager row whose emp_id equals e.manager_id. LEFT JOIN keeps the CEO, with a NULL manager.",
      "An inner join drops the CEO, whose NULL manager_id matches nothing.",
      "The condition is reversed: this pairs each employee with the people who report to them.",
      "A cross join pairs every employee with every employee, with no relationship at all."
    ],
    "approach": [
      "Give the two copies of the table clear roles (e = employee, m = manager) and write the ON condition in words first: the manager's id equals my manager_id.",
      "\"Including\" rows that may not match means LEFT JOIN."
    ]
  },
  {
    "id": "sqlb-ddl-add-column",
    "section": "sqlbasic",
    "type": "mcq",
    "topic": "Table structure: ALTER TABLE",
    "title": "Adding a column",
    "prompt": "Which statement adds a new `risk_score` integer column to the existing `loans` table?",
    "options": [
      "ALTER TABLE loans ADD COLUMN risk_score INT;",
      "INSERT INTO loans (risk_score) VALUES (NULL);",
      "UPDATE loans ADD risk_score INT;",
      "CREATE COLUMN risk_score INT ON loans;"
    ],
    "answer": 0,
    "explanations": [
      "Correct. New columns are added with ALTER TABLE ... ADD COLUMN. Existing rows get NULL (or the DEFAULT, if one is given).",
      "INSERT adds a new row, and only works for columns that already exist.",
      "UPDATE changes values in existing columns; it can't add one.",
      "There is no CREATE COLUMN statement."
    ],
    "approach": [
      "Structure changes are ALTER TABLE: ADD COLUMN, DROP COLUMN, RENAME COLUMN, MODIFY (MySQL)."
    ]
  }
]
);
