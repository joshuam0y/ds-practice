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
  }
]
);
