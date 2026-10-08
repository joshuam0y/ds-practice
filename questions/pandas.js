window.BANK = (window.BANK || []).concat(
[
  {
    "id": "pd-filter-sort",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Easy",
    "topic": "Filtering and sorting",
    "title": "Large approved transactions",
    "prompt": [
      "`df` has columns `txn_id`, `status` and `amount`. Return a DataFrame of the **approved** transactions with `amount >= min_amount`, with only the columns `txn_id` and `amount`, sorted by `amount` (largest first) and then `txn_id` (smallest first). The index should run 0, 1, 2, ...",
      "",
      "```",
      "big_approved(df, 200)",
      "#    txn_id  amount",
      "# 0       5  1200.0",
      "# 1       1   250.0",
      "# 2       4   250.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def big_approved(df, min_amount):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def big_approved(df, min_amount):",
      "    keep = df[(df[\"status\"] == \"approved\") & (df[\"amount\"] >= min_amount)]",
      "    out = keep.sort_values([\"amount\", \"txn_id\"], ascending=[False, True])",
      "    return out[[\"txn_id\", \"amount\"]].reset_index(drop=True)",
      ""
    ],
    "tests": [
      {
        "name": "Example rows",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "big_approved(df, 200).to_dict('records')",
        "expect": "[{'txn_id': 5, 'amount': 1200.0}, {'txn_id': 1, 'amount': 250.0}, {'txn_id': 4, 'amount': 250.0}]"
      },
      {
        "name": "Only two columns",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "list(big_approved(df, 200).columns)",
        "expect": "['txn_id', 'amount']"
      },
      {
        "name": "Index starts again at 0",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "list(big_approved(df, 200).index)",
        "expect": "[0, 1, 2]"
      },
      {
        "name": "Boundary included",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "list(big_approved(df, 1200)['txn_id'])",
        "expect": "[5]"
      },
      {
        "name": "Declined never included",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "900.0 in list(big_approved(df, 0)['amount'])",
        "expect": "False"
      },
      {
        "name": "Nothing qualifies",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'status': ['approved', 'declined', 'approved', 'approved', 'approved'], 'amount': [250.0, 900.0, 75.0, 250.0, 1200.0]})",
        "expr": "len(big_approved(df, 5000))",
        "expect": "0"
      }
    ],
    "approach": [
      "Build a boolean mask with & (and), each condition in its own parentheses.",
      "sort_values takes a list of columns and a matching list for ascending.",
      "Select columns with a list, then reset_index(drop=True)."
    ],
    "walkthrough": [
      "`df[(df[\"status\"] == \"approved\") & (df[\"amount\"] >= min_amount)]`: both conditions must be true. Use &, not and.",
      "`sort_values([\"amount\", \"txn_id\"], ascending=[False, True])`: biggest amount first, ties by smaller txn_id.",
      "`out[[\"txn_id\", \"amount\"]]`: double brackets select a list of columns.",
      "`.reset_index(drop=True)`: renumber 0, 1, 2 and drop the old index."
    ],
    "mistakes": [
      "Writing `and` instead of `&`, or leaving out the parentheses: Python raises an error about ambiguous truth values.",
      "Using > instead of >=, which drops a transaction of exactly min_amount.",
      "Forgetting reset_index, so the index stays 4, 0, 3.",
      "Sorting by amount only, so the two 250.0 rows can come out in either order."
    ]
  },
  {
    "id": "pd-groupby-agg",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Easy",
    "topic": "groupby and aggregation",
    "title": "Deposits per branch",
    "prompt": [
      "`df` has columns `branch` and `amount`. Return one row per branch with columns `branch`, `n` (number of deposits), `total` and `avg` (rounded to 2 decimals), sorted by `total` (largest first) and then `branch`.",
      "",
      "```",
      "branch_summary(df)",
      "#        branch  n  total    avg",
      "# 0    Back Bay  3  600.0  200.0",
      "# 1   Cambridge  2  500.0  250.0",
      "# 2  Providence  1   50.0   50.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def branch_summary(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def branch_summary(df):",
      "    out = (df.groupby(\"branch\", as_index=False)",
      "             .agg(n=(\"amount\", \"count\"), total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\")))",
      "    out[\"avg\"] = out[\"avg\"].round(2)",
      "    return out.sort_values([\"total\", \"branch\"], ascending=[False, True]).reset_index(drop=True)",
      ""
    ],
    "tests": [
      {
        "name": "Example rows",
        "setup": "df = pd.DataFrame({'branch': ['Back Bay', 'Cambridge', 'Back Bay', 'Providence', 'Cambridge', 'Back Bay'], 'amount': [100.0, 250.0, 300.0, 50.0, 250.0, 200.0]})",
        "expr": "branch_summary(df).to_dict('records')",
        "expect": "[{'branch': 'Back Bay', 'n': 3, 'total': 600.0, 'avg': 200.0}, {'branch': 'Cambridge', 'n': 2, 'total': 500.0, 'avg': 250.0}, {'branch': 'Providence', 'n': 1, 'total': 50.0, 'avg': 50.0}]"
      },
      {
        "name": "Column names and order",
        "setup": "df = pd.DataFrame({'branch': ['Back Bay', 'Cambridge', 'Back Bay', 'Providence', 'Cambridge', 'Back Bay'], 'amount': [100.0, 250.0, 300.0, 50.0, 250.0, 200.0]})",
        "expr": "list(branch_summary(df).columns)",
        "expect": "['branch', 'n', 'total', 'avg']"
      },
      {
        "name": "Average rounded to 2 decimals",
        "setup": "df = pd.DataFrame({'branch': ['A', 'A', 'A'], 'amount': [1.0, 1.0, 2.0]})",
        "expr": "branch_summary(df)['avg'].tolist()",
        "expect": "[1.33]"
      },
      {
        "name": "Tie on total broken by branch name",
        "setup": "df = pd.DataFrame({'branch': ['Zed', 'Amy'], 'amount': [10.0, 10.0]})",
        "expr": "branch_summary(df)['branch'].tolist()",
        "expect": "['Amy', 'Zed']"
      },
      {
        "name": "branch is a column, not the index",
        "setup": "df = pd.DataFrame({'branch': ['Back Bay', 'Cambridge', 'Back Bay', 'Providence', 'Cambridge', 'Back Bay'], 'amount': [100.0, 250.0, 300.0, 50.0, 250.0, 200.0]})",
        "expr": "list(branch_summary(df).index)",
        "expect": "[0, 1, 2]"
      },
      {
        "name": "One branch",
        "setup": "df = pd.DataFrame({'branch': ['X'], 'amount': [5.0]})",
        "expr": "branch_summary(df)['n'].tolist()",
        "expect": "[1]"
      }
    ],
    "approach": [
      "groupby(...).agg(new_name=(column, function), ...) is named aggregation: one call, the column names you want.",
      "as_index=False keeps branch as a normal column.",
      "Round after aggregating, then sort with a tie-breaker."
    ],
    "walkthrough": [
      "`df.groupby(\"branch\", as_index=False)`: one group per branch, kept as a column.",
      "`.agg(n=(\"amount\", \"count\"), total=(\"amount\", \"sum\"), avg=(\"amount\", \"mean\"))`: three summary columns with the names asked for.",
      "`out[\"avg\"].round(2)`: (1 + 1 + 2) / 3 = 1.333... becomes 1.33.",
      "`sort_values([\"total\", \"branch\"], ascending=[False, True]).reset_index(drop=True)`: the required order and a clean index."
    ],
    "mistakes": [
      "Leaving branch as the index (no as_index=False or reset_index), so the columns don't match.",
      "Using size vs count interchangeably: count skips missing values, size doesn't.",
      "Rounding before averaging.",
      "Sorting by total only, so tied branches can come out in either order."
    ]
  },
  {
    "id": "pd-merge-fill",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "merge (joins) and missing values",
    "title": "Every customer's total deposits",
    "prompt": [
      "Return every customer in `customers` (columns `customer_id`, `name`) with `total`, the sum of their rows in `deposits` (columns `customer_id`, `amount`). Customers with no deposits get `0.0`. Deposits from unknown customers are ignored. Columns: `customer_id`, `name`, `total`, sorted by `customer_id`.",
      "",
      "```",
      "customer_totals(customers, deposits)",
      "#    customer_id name  total",
      "# 0            1  Ava  150.0",
      "# 1            2  Ben    0.0",
      "# 2            3   Cy   20.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def customer_totals(customers, deposits):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def customer_totals(customers, deposits):",
      "    totals = deposits.groupby(\"customer_id\", as_index=False)[\"amount\"].sum()",
      "    out = customers.merge(totals, on=\"customer_id\", how=\"left\")   # keep every customer",
      "    out = out.rename(columns={\"amount\": \"total\"})",
      "    out[\"total\"] = out[\"total\"].fillna(0.0)",
      "    return out.sort_values(\"customer_id\").reset_index(drop=True)",
      ""
    ],
    "tests": [
      {
        "name": "Example rows",
        "setup": "customers = pd.DataFrame({'customer_id': [1, 2, 3], 'name': ['Ava', 'Ben', 'Cy']})\ndeposits = pd.DataFrame({'customer_id': [1, 1, 3, 4], 'amount': [100.0, 50.0, 20.0, 999.0]})",
        "expr": "customer_totals(customers, deposits).to_dict('records')",
        "expect": "[{'customer_id': 1, 'name': 'Ava', 'total': 150.0}, {'customer_id': 2, 'name': 'Ben', 'total': 0.0}, {'customer_id': 3, 'name': 'Cy', 'total': 20.0}]"
      },
      {
        "name": "Unknown customer ignored",
        "setup": "customers = pd.DataFrame({'customer_id': [1, 2, 3], 'name': ['Ava', 'Ben', 'Cy']})\ndeposits = pd.DataFrame({'customer_id': [1, 1, 3, 4], 'amount': [100.0, 50.0, 20.0, 999.0]})",
        "expr": "len(customer_totals(customers, deposits))",
        "expect": "3"
      },
      {
        "name": "No deposits at all",
        "setup": "customers = pd.DataFrame({'customer_id': [7], 'name': ['Dee']})\ndeposits = pd.DataFrame({'customer_id': [], 'amount': []})",
        "expr": "customer_totals(customers, deposits)['total'].tolist()",
        "expect": "[0.0]"
      },
      {
        "name": "Column names",
        "setup": "customers = pd.DataFrame({'customer_id': [1, 2, 3], 'name': ['Ava', 'Ben', 'Cy']})\ndeposits = pd.DataFrame({'customer_id': [1, 1, 3, 4], 'amount': [100.0, 50.0, 20.0, 999.0]})",
        "expr": "list(customer_totals(customers, deposits).columns)",
        "expect": "['customer_id', 'name', 'total']"
      },
      {
        "name": "Sorted by customer_id",
        "setup": "customers = pd.DataFrame({'customer_id': [3, 1], 'name': ['Cy', 'Ava']})\ndeposits = pd.DataFrame({'customer_id': [3], 'amount': [5.0]})",
        "expr": "customer_totals(customers, deposits)['customer_id'].tolist()",
        "expect": "[1, 3]"
      },
      {
        "name": "No missing values left",
        "setup": "customers = pd.DataFrame({'customer_id': [1, 2, 3], 'name': ['Ava', 'Ben', 'Cy']})\ndeposits = pd.DataFrame({'customer_id': [1, 1, 3, 4], 'amount': [100.0, 50.0, 20.0, 999.0]})",
        "expr": "int(customer_totals(customers, deposits)['total'].isna().sum())",
        "expect": "0"
      }
    ],
    "approach": [
      "Aggregate first (one row per customer), then merge, so the join can't multiply rows.",
      "how=\"left\" keeps every customer, like a SQL LEFT JOIN; missing totals become NaN, then fillna(0.0)."
    ],
    "walkthrough": [
      "`deposits.groupby(\"customer_id\", as_index=False)[\"amount\"].sum()`: one total per customer.",
      "`customers.merge(totals, on=\"customer_id\", how=\"left\")`: every customer, plus their total if they have one (customer 4's deposit has no customer, so it's dropped).",
      "`rename(columns={\"amount\": \"total\"})` then `fillna(0.0)`: Ben gets 0.0 instead of NaN.",
      "`sort_values(\"customer_id\").reset_index(drop=True)`: the required order."
    ],
    "mistakes": [
      "An inner merge (the default), which drops Ben.",
      "Merging before aggregating and then summing, which works here but is easy to get wrong with more columns.",
      "Leaving NaN instead of 0.0.",
      "how=\"outer\", which adds the unknown customer 4."
    ]
  },
  {
    "id": "pd-pivot-month",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "pivot tables and dates",
    "title": "Monthly spending by category",
    "prompt": [
      "`df` has columns `date` (text like `'2025-01-05'`), `category` and `amount`. Return a pivot table with one row per month (index labels like `'2025-01'`), one column per category (alphabetical), and the total amount in each cell. Months with no spending in a category show `0.0`.",
      "",
      "```",
      "monthly_pivot(df)",
      "#          food  fuel  travel",
      "# 2025-01  10.0   0.0   200.0",
      "# 2025-02  20.0  40.0     0.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def monthly_pivot(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def monthly_pivot(df):",
      "    df = df.copy()",
      "    df[\"month\"] = pd.to_datetime(df[\"date\"]).dt.strftime(\"%Y-%m\")",
      "    return df.pivot_table(index=\"month\", columns=\"category\", values=\"amount\",",
      "                          aggfunc=\"sum\", fill_value=0.0)",
      ""
    ],
    "tests": [
      {
        "name": "January travel",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})",
        "expr": "float(monthly_pivot(df).loc['2025-01', 'travel'])",
        "expect": "200.0"
      },
      {
        "name": "February food adds two rows",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})",
        "expr": "float(monthly_pivot(df).loc['2025-02', 'food'])",
        "expect": "20.0"
      },
      {
        "name": "Empty cell is 0.0",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})",
        "expr": "float(monthly_pivot(df).loc['2025-01', 'fuel'])",
        "expect": "0.0"
      },
      {
        "name": "Months as the index",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})",
        "expr": "list(monthly_pivot(df).index)",
        "expect": "['2025-01', '2025-02']"
      },
      {
        "name": "Categories as columns, alphabetical",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})",
        "expr": "list(monthly_pivot(df).columns)",
        "expect": "['food', 'fuel', 'travel']"
      },
      {
        "name": "Input not changed",
        "setup": "df = pd.DataFrame({'date': ['2025-01-05', '2025-01-20', '2025-02-03', '2025-02-10', '2025-02-11'], 'category': ['food', 'travel', 'food', 'food', 'fuel'], 'amount': [10.0, 200.0, 15.0, 5.0, 40.0]})\nresult = monthly_pivot(df)",
        "expr": "(list(df.columns), result.shape)",
        "expect": "(['date', 'category', 'amount'], (2, 3))"
      }
    ],
    "approach": [
      "Make a month column first: pd.to_datetime(...).dt.strftime(\"%Y-%m\").",
      "pivot_table(index=rows, columns=columns, values=what, aggfunc=\"sum\", fill_value=0.0) builds the grid in one call.",
      "Work on a copy so you don't change the caller's DataFrame."
    ],
    "walkthrough": [
      "`df = df.copy()`: adding a column to the original would change the caller's data.",
      "`pd.to_datetime(df[\"date\"]).dt.strftime(\"%Y-%m\")`: '2025-02-10' becomes '2025-02'.",
      "`pivot_table(..., aggfunc=\"sum\", fill_value=0.0)`: two February food rows add to 20.0; missing cells become 0.0 instead of NaN."
    ],
    "mistakes": [
      "pivot instead of pivot_table: pivot can't add up two February food rows and raises an error on duplicates.",
      "Leaving NaN in empty cells (no fill_value).",
      "Slicing the text with [:7]: works for this format, but to_datetime handles other date formats too.",
      "Adding the month column to the caller's DataFrame."
    ]
  },
  {
    "id": "pd-latest-record",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "Duplicates and sorting",
    "title": "Latest balance per account",
    "prompt": [
      "`df` holds balance snapshots: `account_id`, `updated_at` (text dates like `'2025-03-05'`) and `balance`. An account can have several rows. Return the most recent row for each account, columns `account_id` and `balance`, sorted by `account_id`.",
      "",
      "```",
      "latest_balances(df)",
      "#    account_id  balance",
      "# 0          10    450.0",
      "# 1          20     80.0",
      "# 2          30      0.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def latest_balances(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def latest_balances(df):",
      "    ordered = df.sort_values([\"account_id\", \"updated_at\"])",
      "    latest = ordered.drop_duplicates(subset=\"account_id\", keep=\"last\")   # last = most recent",
      "    return latest[[\"account_id\", \"balance\"]].reset_index(drop=True)",
      ""
    ],
    "tests": [
      {
        "name": "Example rows",
        "setup": "df = pd.DataFrame({'account_id': [10, 20, 10, 20, 30], 'updated_at': ['2025-03-01', '2025-03-02', '2025-03-05', '2025-02-28', '2025-01-01'], 'balance': [500.0, 80.0, 450.0, 95.0, 0.0]})",
        "expr": "latest_balances(df).to_dict('records')",
        "expect": "[{'account_id': 10, 'balance': 450.0}, {'account_id': 20, 'balance': 80.0}, {'account_id': 30, 'balance': 0.0}]"
      },
      {
        "name": "One row per account",
        "setup": "df = pd.DataFrame({'account_id': [10, 20, 10, 20, 30], 'updated_at': ['2025-03-01', '2025-03-02', '2025-03-05', '2025-02-28', '2025-01-01'], 'balance': [500.0, 80.0, 450.0, 95.0, 0.0]})",
        "expr": "len(latest_balances(df))",
        "expect": "3"
      },
      {
        "name": "Rows out of date order",
        "setup": "df = pd.DataFrame({'account_id': [1, 1, 1], 'updated_at': ['2025-05-01', '2025-07-01', '2025-06-01'], 'balance': [1.0, 3.0, 2.0]})",
        "expr": "latest_balances(df)['balance'].tolist()",
        "expect": "[3.0]"
      },
      {
        "name": "Columns",
        "setup": "df = pd.DataFrame({'account_id': [10, 20, 10, 20, 30], 'updated_at': ['2025-03-01', '2025-03-02', '2025-03-05', '2025-02-28', '2025-01-01'], 'balance': [500.0, 80.0, 450.0, 95.0, 0.0]})",
        "expr": "list(latest_balances(df).columns)",
        "expect": "['account_id', 'balance']"
      },
      {
        "name": "Index starts at 0",
        "setup": "df = pd.DataFrame({'account_id': [10, 20, 10, 20, 30], 'updated_at': ['2025-03-01', '2025-03-02', '2025-03-05', '2025-02-28', '2025-01-01'], 'balance': [500.0, 80.0, 450.0, 95.0, 0.0]})",
        "expr": "list(latest_balances(df).index)",
        "expect": "[0, 1, 2]"
      },
      {
        "name": "Single snapshot",
        "setup": "df = pd.DataFrame({'account_id': [5], 'updated_at': ['2025-01-01'], 'balance': [9.0]})",
        "expr": "latest_balances(df)['balance'].tolist()",
        "expect": "[9.0]"
      }
    ],
    "approach": [
      "Sort so each account's newest row comes last, then drop_duplicates(subset=\"account_id\", keep=\"last\").",
      "Dates written as YYYY-MM-DD sort correctly as text. (Alternative: df.loc[df.groupby(\"account_id\")[\"updated_at\"].idxmax()].)"
    ],
    "walkthrough": [
      "`sort_values([\"account_id\", \"updated_at\"])`: within each account, oldest to newest.",
      "`drop_duplicates(subset=\"account_id\", keep=\"last\")`: keep the newest row per account.",
      "`latest[[\"account_id\", \"balance\"]].reset_index(drop=True)`: the requested columns and a clean index."
    ],
    "mistakes": [
      "drop_duplicates without sorting first: keeps whichever row came last in the file, not the newest.",
      "keep=\"first\" after sorting oldest to newest, which keeps the oldest.",
      "groupby(...).max() on balance: gives the highest balance, not the latest one.",
      "Forgetting subset=, so only fully identical rows are dropped."
    ]
  },
  {
    "id": "pd-top-per-group",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "Ranking within groups",
    "title": "Top customer in each branch",
    "prompt": [
      "`df` has columns `branch`, `customer` and `balance`. Return the customer (or customers, if tied) with the highest balance in each branch, columns `branch`, `customer`, `balance`, sorted by `branch` then `customer`.",
      "",
      "```",
      "top_customers(df)",
      "#   branch customer  balance",
      "# 0      A      Ava    900.0",
      "# 1      A      Ben    900.0",
      "# 2      B      Eli     70.0",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def top_customers(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def top_customers(df):",
      "    best = df.groupby(\"branch\")[\"balance\"].transform(\"max\")   # each row gets its branch's max",
      "    top = df[df[\"balance\"] == best]",
      "    return top.sort_values([\"branch\", \"customer\"]).reset_index(drop=True)[[\"branch\", \"customer\", \"balance\"]]",
      ""
    ],
    "tests": [
      {
        "name": "Example rows",
        "setup": "df = pd.DataFrame({'branch': ['A', 'A', 'A', 'B', 'B'], 'customer': ['Ava', 'Ben', 'Cy', 'Dee', 'Eli'], 'balance': [900.0, 900.0, 300.0, 50.0, 70.0]})",
        "expr": "top_customers(df).to_dict('records')",
        "expect": "[{'branch': 'A', 'customer': 'Ava', 'balance': 900.0}, {'branch': 'A', 'customer': 'Ben', 'balance': 900.0}, {'branch': 'B', 'customer': 'Eli', 'balance': 70.0}]"
      },
      {
        "name": "Ties are kept",
        "setup": "df = pd.DataFrame({'branch': ['A', 'A', 'A', 'B', 'B'], 'customer': ['Ava', 'Ben', 'Cy', 'Dee', 'Eli'], 'balance': [900.0, 900.0, 300.0, 50.0, 70.0]})",
        "expr": "len(top_customers(df)[top_customers(df)['branch'] == 'A'])",
        "expect": "2"
      },
      {
        "name": "One branch",
        "setup": "df = pd.DataFrame({'branch': ['Z', 'Z'], 'customer': ['Bo', 'Al'], 'balance': [1.0, 2.0]})",
        "expr": "top_customers(df)['customer'].tolist()",
        "expect": "['Al']"
      },
      {
        "name": "Sorted by branch then customer",
        "setup": "df = pd.DataFrame({'branch': ['B', 'A', 'A'], 'customer': ['Cy', 'Zoe', 'Abe'], 'balance': [5.0, 5.0, 5.0]})",
        "expr": "top_customers(df)['customer'].tolist()",
        "expect": "['Abe', 'Zoe', 'Cy']"
      },
      {
        "name": "Columns",
        "setup": "df = pd.DataFrame({'branch': ['A', 'A', 'A', 'B', 'B'], 'customer': ['Ava', 'Ben', 'Cy', 'Dee', 'Eli'], 'balance': [900.0, 900.0, 300.0, 50.0, 70.0]})",
        "expr": "list(top_customers(df).columns)",
        "expect": "['branch', 'customer', 'balance']"
      },
      {
        "name": "Negative balances",
        "setup": "df = pd.DataFrame({'branch': ['X', 'X'], 'customer': ['Ann', 'Bob'], 'balance': [-5.0, -2.0]})",
        "expr": "top_customers(df)['customer'].tolist()",
        "expect": "['Bob']"
      }
    ],
    "approach": [
      "transform(\"max\") returns a value for every row (its group's max), so you can compare each row with its own group.",
      "Keep rows equal to the max: ties stay. (Same idea as SQL's RANK() = 1. rank(method=\"min\", ascending=False) == 1 also works.)"
    ],
    "walkthrough": [
      "`df.groupby(\"branch\")[\"balance\"].transform(\"max\")`: a column the same length as df, holding 900, 900, 900, 70, 70.",
      "`df[df[\"balance\"] == best]`: rows that match their branch's best, so Ava and Ben both stay.",
      "Sort, reset the index, and pick the column order."
    ],
    "mistakes": [
      "groupby(...).max(): one row per branch, and it loses which customer had it.",
      "idxmax(): keeps only one customer when two tie.",
      "sort_values(\"balance\").drop_duplicates(\"branch\", keep=\"last\"): also drops ties.",
      "Forgetting the customer tie-break in the sort."
    ]
  },
  {
    "id": "pd-most-common",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "value_counts and ties",
    "title": "Each customer's most common category",
    "prompt": [
      "`df` has one row per purchase: `customer` and `category`. Return a dictionary mapping each customer to their most frequent category. Break ties alphabetically.",
      "",
      "```",
      "favorite_category(df)   # {'Ava': 'food', 'Ben': 'food', 'Cy': 'gym'}",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def favorite_category(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def favorite_category(df):",
      "    counts = df.groupby([\"customer\", \"category\"]).size().reset_index(name=\"n\")",
      "    counts = counts.sort_values([\"customer\", \"n\", \"category\"], ascending=[True, False, True])",
      "    best = counts.drop_duplicates(subset=\"customer\", keep=\"first\")",
      "    return dict(zip(best[\"customer\"], best[\"category\"]))",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "df = pd.DataFrame({'customer': ['Ava', 'Ava', 'Ava', 'Ben', 'Ben', 'Cy'], 'category': ['food', 'travel', 'food', 'fuel', 'food', 'gym']})",
        "expr": "favorite_category(df)",
        "expect": "{'Ava': 'food', 'Ben': 'food', 'Cy': 'gym'}"
      },
      {
        "name": "Tie broken alphabetically",
        "setup": "df = pd.DataFrame({'customer': ['Bo', 'Bo'], 'category': ['zoo', 'art']})",
        "expr": "favorite_category(df)",
        "expect": "{'Bo': 'art'}"
      },
      {
        "name": "Clear winner",
        "setup": "df = pd.DataFrame({'customer': ['Al'] * 3, 'category': ['b', 'c', 'c']})",
        "expr": "favorite_category(df)",
        "expect": "{'Al': 'c'}"
      },
      {
        "name": "One purchase",
        "setup": "df = pd.DataFrame({'customer': ['Zed'], 'category': ['fuel']})",
        "expr": "favorite_category(df)",
        "expect": "{'Zed': 'fuel'}"
      },
      {
        "name": "Returns a dict",
        "setup": "df = pd.DataFrame({'customer': ['Ava', 'Ava', 'Ava', 'Ben', 'Ben', 'Cy'], 'category': ['food', 'travel', 'food', 'fuel', 'food', 'gym']})",
        "expr": "type(favorite_category(df)).__name__",
        "expect": "'dict'"
      },
      {
        "name": "Every customer included",
        "setup": "df = pd.DataFrame({'customer': ['Ava', 'Ava', 'Ava', 'Ben', 'Ben', 'Cy'], 'category': ['food', 'travel', 'food', 'fuel', 'food', 'gym']})",
        "expr": "sorted(favorite_category(df))",
        "expect": "['Ava', 'Ben', 'Cy']"
      }
    ],
    "approach": [
      "Count purchases per (customer, category) with groupby(...).size().",
      "Sort by customer, count (high first) and category (A to Z), then keep the first row per customer.",
      "Build the dict with zip."
    ],
    "walkthrough": [
      "`groupby([\"customer\", \"category\"]).size().reset_index(name=\"n\")`: one row per pair with its count (Ava food 2, Ava travel 1, ...).",
      "`sort_values([\"customer\", \"n\", \"category\"], ascending=[True, False, True])`: each customer's best category first, ties alphabetical.",
      "`drop_duplicates(subset=\"customer\", keep=\"first\")` then `dict(zip(...))`: one entry per customer."
    ],
    "mistakes": [
      "mode() or value_counts().idxmax(): ties don't break alphabetically (Ben's food vs fuel tie happens to work, Bo's zoo vs art doesn't).",
      "Sorting by count only.",
      "Returning a Series or DataFrame instead of a dict."
    ]
  },
  {
    "id": "pd-fill-missing",
    "section": "pandas",
    "type": "python",
    "packages": [
      "pandas"
    ],
    "difficulty": "Medium",
    "topic": "Missing values",
    "title": "Fill missing amounts with the category median",
    "prompt": [
      "Some `amount` values are missing (NaN). Return a copy of `df` where each missing amount is replaced by the **median** amount of its own category. Don't change the caller's DataFrame.",
      "",
      "```",
      "fill_with_median(df)['amount'].tolist()   # [10.0, 20.0, 30.0, 50.0, 50.0]",
      "```"
    ],
    "starter": [
      "import pandas as pd",
      "",
      "",
      "def fill_with_median(df):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import pandas as pd",
      "",
      "",
      "def fill_with_median(df):",
      "    out = df.copy()",
      "    medians = out.groupby(\"category\")[\"amount\"].transform(\"median\")   # NaN is skipped",
      "    out[\"amount\"] = out[\"amount\"].fillna(medians)",
      "    return out",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'category': ['food', 'food', 'food', 'fuel', 'fuel'], 'amount': [10.0, None, 30.0, None, 50.0]})",
        "expr": "fill_with_median(df)['amount'].tolist()",
        "expect": "[10.0, 20.0, 30.0, 50.0, 50.0]"
      },
      {
        "name": "No missing values left",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'category': ['food', 'food', 'food', 'fuel', 'fuel'], 'amount': [10.0, None, 30.0, None, 50.0]})",
        "expr": "int(fill_with_median(df)['amount'].isna().sum())",
        "expect": "0"
      },
      {
        "name": "Original not changed",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'category': ['food', 'food', 'food', 'fuel', 'fuel'], 'amount': [10.0, None, 30.0, None, 50.0]})\nout = fill_with_median(df)",
        "expr": "(int(df['amount'].isna().sum()), int(out['amount'].isna().sum()))",
        "expect": "(2, 0)"
      },
      {
        "name": "Uses the median, not the mean",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4], 'category': ['a'] * 4, 'amount': [1.0, 2.0, 100.0, None]})",
        "expr": "fill_with_median(df)['amount'].tolist()[3]",
        "expect": "2.0"
      },
      {
        "name": "Nothing missing",
        "setup": "df = pd.DataFrame({'txn_id': [1], 'category': ['a'], 'amount': [5.0]})",
        "expr": "fill_with_median(df)['amount'].tolist()",
        "expect": "[5.0]"
      },
      {
        "name": "Other columns kept",
        "setup": "df = pd.DataFrame({'txn_id': [1, 2, 3, 4, 5], 'category': ['food', 'food', 'food', 'fuel', 'fuel'], 'amount': [10.0, None, 30.0, None, 50.0]})",
        "expr": "list(fill_with_median(df).columns)",
        "expect": "['txn_id', 'category', 'amount']"
      }
    ],
    "approach": [
      "transform(\"median\") gives each row its own category's median (missing values are ignored when computing it).",
      "fillna(that column) fills each missing value with the matching row's median.",
      "Work on df.copy()."
    ],
    "walkthrough": [
      "`out = df.copy()`: so the caller's DataFrame still has its NaNs.",
      "`groupby(\"category\")[\"amount\"].transform(\"median\")`: food's median is median(10, 30) = 20; fuel's is 50.",
      "`out[\"amount\"].fillna(medians)`: only the NaN rows change."
    ],
    "mistakes": [
      "fillna(df[\"amount\"].median()): one overall median instead of each category's.",
      "Using the mean: a single large value like 100 drags it up.",
      "dropna(), which removes the rows instead of filling them.",
      "Changing df in place, so the test checking the original fails."
    ]
  }
]
);
