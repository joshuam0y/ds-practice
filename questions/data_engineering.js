window.BANK = (window.BANK || []).concat(
[
  {
    "id": "de-normalization-3nf",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Normalization",
    "title": "Which normal form does this table break",
    "prompt": "A `customers` table has columns `customer_id` (primary key), `name`, `branch_id`, and `branch_city`. Every value is atomic, and `branch_city` is fully determined by `branch_id`. Which normal form does the table violate, and why?",
    "options": [
      "1NF, because `branch_city` repeats across many rows",
      "3NF, because `branch_city` depends on `branch_id`, a non-key column, rather than directly on the key",
      "2NF, because the primary key is a single column",
      "None; a table with a single-column primary key is automatically in 3NF"
    ],
    "answer": 1,
    "explanations": [
      "1NF is about atomic values and no repeating groups. Repeated values across rows are allowed in 1NF; that is redundancy, which later normal forms address.",
      "Correct. customer_id determines branch_id, and branch_id determines branch_city. That chain is a transitive dependency, which 3NF forbids. Fix it by moving branch_city into a `branches` table keyed by branch_id.",
      "2NF problems come from partial dependence on part of a composite key. With a single-column key there is no part to depend on, so this table is in 2NF.",
      "A single-column key only guarantees 2NF. Transitive dependencies between non-key columns can still exist, as branch_id to branch_city does here."
    ],
    "approach": [
      "1NF: atomic values. 2NF: no column depends on only part of a composite key. 3NF: no non-key column depends on another non-key column.",
      "Look for a non-key column that determines another non-key column (branch_id determines branch_city). That is a transitive dependency, so the table is not in 3NF.",
      "The fix is always the same: move the dependent columns into their own table keyed by the determining column."
    ]
  },
  {
    "id": "de-star-vs-snowflake",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "Star and snowflake schemas",
    "title": "Shape of a star schema",
    "prompt": "A bank's warehouse has a central `fact_transactions` table with amounts and foreign keys to `dim_account`, `dim_branch`, and `dim_date`. Each dimension is a single wide table with no further lookups. What is this design called?",
    "options": [
      "A snowflake schema",
      "A fully normalized OLTP schema",
      "A star schema",
      "A data vault"
    ],
    "answer": 2,
    "explanations": [
      "In a snowflake schema the dimensions are themselves normalized into sub-tables (for example dim_branch pointing to dim_region). Here each dimension is a single flat table.",
      "OLTP schemas are normalized for many small writes, not organized around a central fact table of measurements.",
      "Correct. One fact table of events and measures in the middle, with flat (denormalized) dimension tables joined by keys, looks like a star. Queries need only one join per dimension.",
      "A data vault uses hubs, links, and satellites to track history and sources. It is a different modeling method, not this fact plus flat dimension layout."
    ],
    "approach": [
      "Fact table: the events and numbers you aggregate (transactions, amounts). Dimension tables: the descriptive context (who, where, when).",
      "Flat dimensions = star. Dimensions split into further lookup tables = snowflake. Star trades some redundancy for simpler, faster queries."
    ]
  },
  {
    "id": "de-oltp-vs-olap",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "OLTP vs OLAP",
    "title": "Which workload is OLAP",
    "prompt": "Which of these is the best example of an OLAP workload?",
    "options": [
      "Computing total deposits by branch and month over the last five years for a quarterly report",
      "Recording a single card swipe and updating the account balance",
      "Looking up one customer's profile when they log into the mobile app",
      "Inserting a new loan application submitted through a web form"
    ],
    "answer": 0,
    "explanations": [
      "Correct. OLAP (online analytical processing) means large read-heavy scans and aggregations over history, which is exactly a multi-year rollup by branch and month.",
      "A card swipe is a small, fast write that must be correct right now. That is classic OLTP (online transaction processing).",
      "Fetching one row by key for a live app is an OLTP pattern: tiny, frequent, low-latency reads.",
      "Inserting one application row is a transactional write, so it is OLTP."
    ],
    "approach": [
      "OLTP: many small reads and writes of individual rows, normalized schema, low latency. OLAP: few large queries that scan and aggregate many rows, often on a warehouse with a star schema.",
      "Ask: does this touch one record or summarize millions? Summaries over history are OLAP."
    ]
  },
  {
    "id": "de-foreign-key",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "Keys and constraints",
    "title": "Inserting a row with a missing parent",
    "prompt": "`transactions.account_id` is declared as a FOREIGN KEY referencing `accounts.account_id`. A loader tries to insert a transaction with `account_id = 9001`, but no account 9001 exists. What happens in a database that enforces the constraint?",
    "options": [
      "The row is inserted and a new empty account 9001 is created automatically",
      "The row is inserted with account_id set to NULL",
      "The row is inserted, and the mismatch only shows up when you join the tables",
      "The insert is rejected with a foreign key constraint error"
    ],
    "answer": 3,
    "explanations": [
      "Databases never create parent rows for you. A foreign key only checks that the parent already exists.",
      "Setting the column to NULL is an ON DELETE SET NULL behavior for when a parent is deleted, not what happens on an insert with a bad value.",
      "That is what happens when there is no enforced constraint (common in some warehouses). The question says the constraint is enforced.",
      "Correct. A foreign key guarantees referential integrity: every child row must point to an existing parent row, so the insert fails."
    ],
    "approach": [
      "Primary key: uniquely identifies a row, cannot be NULL. Foreign key: a column whose values must exist as a key in another table.",
      "Enforced constraints reject bad writes at insert time. Many cloud warehouses accept constraint definitions but do not enforce them, so pipelines add their own checks."
    ]
  },
  {
    "id": "de-composite-index",
    "section": "de",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "Indexes",
    "title": "Composite index column order",
    "prompt": "The `transactions` table (500 million rows) gets a new index on `(account_id, txn_date)`. Which statement is true?",
    "options": [
      "It speeds up `WHERE txn_date = '2026-10-01'` as much as it speeds up `WHERE account_id = 42`",
      "It makes inserts into `transactions` faster because rows are now stored in sorted order",
      "It helps `WHERE account_id = 42 AND txn_date >= '2026-10-01'`, but a filter on `txn_date` alone generally cannot seek on it, and every insert now pays to update the index",
      "It only helps queries that filter on both columns with equality"
    ],
    "answer": 2,
    "explanations": [
      "A composite index is sorted by account_id first, then by txn_date within each account. Dates for all accounts are scattered across the index, so a filter on txn_date alone cannot use it to jump to the rows (the leftmost prefix rule).",
      "Indexes add write cost: every insert, update, or delete must also update each index on the table. They make reads faster, not writes.",
      "Correct. The index can seek on the leftmost column (account_id) and then range-scan txn_date inside that account. A txn_date-only filter skips the leading column, so it generally needs its own index. Each extra index also slows writes.",
      "The leading column with equality plus a range on the second column is exactly what this index is best at. Filtering on account_id alone also uses it."
    ],
    "approach": [
      "Picture the index as a phone book sorted by last name, then first name. You can find all Smiths, or Smith, Ann, but not everyone named Ann.",
      "Put the column you filter with equality first and the range or sort column second.",
      "Every index is a trade: faster reads on matching queries, slower writes and more storage."
    ]
  },
  {
    "id": "de-scd-type2",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Slowly changing dimensions",
    "title": "Keeping address history",
    "prompt": "A customer moves from Boston to Providence. Analysts need loan applications to keep showing the city the customer lived in at the time they applied. How should `dim_customer` handle the change?",
    "options": [
      "Type 2: close the old row with an end date, insert a new row with a new surrogate key, the new city, and a current flag",
      "Type 1: overwrite the city on the existing row",
      "Delete the customer row and insert a new one with the same key",
      "Add a column named `city_2` to the existing row"
    ],
    "answer": 0,
    "explanations": [
      "Correct. Type 2 keeps every version as its own row with effective dates. Facts recorded earlier still point to the old surrogate key, so they show Boston, while new facts point to the Providence row.",
      "Type 1 overwrites in place and keeps no history, so old applications would wrongly show Providence.",
      "Reusing the key after a delete still loses the old city, so this is just a messier Type 1.",
      "Adding a column for the previous value is closer to Type 3, which keeps only a limited history (one prior value) and does not scale to many moves."
    ],
    "approach": [
      "Type 1: overwrite, no history (fine for fixing typos). Type 2: new row per change with valid_from, valid_to, and is_current (full history).",
      "If the question says reports must reflect the value as of the event time, the answer is Type 2."
    ]
  },
  {
    "id": "de-etl-vs-elt",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "ETL vs ELT",
    "title": "What ELT means",
    "prompt": "A team loads raw core banking extracts straight into Snowflake and then cleans and reshapes them with SQL models inside the warehouse. Which pattern is this?",
    "options": [
      "ETL, because the data is eventually transformed",
      "OLTP, because the source is a transactional system",
      "Change data capture",
      "ELT: extract, load raw data into the warehouse, then transform it there"
    ],
    "answer": 3,
    "explanations": [
      "In ETL the transform step happens before loading, usually on a separate processing server. Here the raw data lands first and is transformed afterward.",
      "OLTP describes the source system's workload, not how data moves into the warehouse.",
      "CDC is a way to extract only changed rows from a source. It can feed either ETL or ELT, but it is not the load-then-transform pattern itself.",
      "Correct. Loading raw data first and transforming with the warehouse's own compute (for example with dbt) is ELT. Keeping the raw copy also makes it easy to rebuild models."
    ],
    "approach": [
      "Look at where and when the transform happens. Before the warehouse: ETL. Inside the warehouse after loading: ELT.",
      "ELT became common because cloud warehouses have cheap, scalable compute; ETL is still used when data must be cleaned or masked before it lands."
    ]
  },
  {
    "id": "de-batch-vs-streaming",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "Batch vs streaming",
    "title": "Choosing streaming",
    "prompt": "Which requirement most clearly calls for a streaming pipeline instead of a nightly batch job?",
    "options": [
      "A monthly regulatory report on loan balances",
      "Flagging a suspicious card transaction within seconds so it can be declined",
      "Rebuilding the customer dimension table once a day",
      "Recomputing last year's interest totals after a rate correction"
    ],
    "answer": 1,
    "explanations": [
      "A monthly report has a deadline of days, so a scheduled batch job is simpler and cheaper.",
      "Correct. Fraud decisions must happen while the transaction is still pending, so events have to be processed as they arrive (for example from Kafka) with seconds of latency.",
      "A once-a-day rebuild is the definition of a batch job.",
      "A historical recomputation is a backfill over a fixed set of data, which is a batch workload."
    ],
    "approach": [
      "Ask how fresh the result must be. Minutes to days: batch. Seconds: streaming.",
      "Streaming adds complexity (state, ordering, late events), so choose it only when latency truly matters."
    ]
  },
  {
    "id": "de-idempotent-rerun",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Idempotent pipelines",
    "title": "Making a daily load safe to re-run",
    "prompt": "A daily job runs `INSERT INTO daily_balances SELECT ... WHERE balance_date = :run_date`. It failed halfway yesterday, and the retry doubled some rows. Which change makes the job idempotent?",
    "options": [
      "Add a retry decorator so the job retries up to five times",
      "Run the job twice and keep the smaller row count",
      "Replace the run date's data instead of appending: delete (or overwrite the partition for) `balance_date = :run_date`, then insert, inside one transaction",
      "Use `SELECT DISTINCT` when analysts query the table"
    ],
    "answer": 2,
    "explanations": [
      "More retries make the duplication worse: each retry appends again.",
      "This is not a mechanism; the table still holds whatever the runs inserted, and nothing removes the extra rows.",
      "Correct. An idempotent job gives the same result whether it runs once or ten times. Overwriting exactly the slice for the run date (delete plus insert in a transaction, a partition overwrite, or a MERGE on the key) makes re-runs and backfills safe.",
      "That hides duplicates in one query but leaves the table wrong for every other consumer, and it can also remove legitimately identical rows."
    ],
    "approach": [
      "Idempotent means running it again does not change the outcome. Plain appends are not idempotent.",
      "Scope each run to a parameter (the run date) and replace that scope completely, or upsert on a unique key."
    ]
  },
  {
    "id": "de-partition-by-date",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Partitioning",
    "title": "Why partition by date",
    "prompt": "A 3 TB `card_transactions` table is partitioned by `txn_date`. Which query benefits most from that partitioning?",
    "options": [
      "`SELECT SUM(amount) FROM card_transactions WHERE txn_date BETWEEN '2026-10-01' AND '2026-10-07'`",
      "`SELECT COUNT(*) FROM card_transactions WHERE merchant_id = 77`",
      "`SELECT * FROM card_transactions WHERE card_id = 'C-123'` across all time",
      "`SELECT DISTINCT merchant_id FROM card_transactions`"
    ],
    "answer": 0,
    "explanations": [
      "Correct. The engine can skip every partition outside those seven dates (partition pruning) and read only a tiny fraction of the table.",
      "The filter is on merchant_id, not the partition column, so every date partition still has to be scanned.",
      "Without a date filter there is nothing to prune; all partitions are read.",
      "A full DISTINCT over all history reads every partition regardless of how the table is split."
    ],
    "approach": [
      "Partitioning only helps queries that filter on the partition column. Pick the column most queries filter on, usually a date.",
      "Avoid partitioning on high-cardinality columns like card_id: it creates huge numbers of tiny files that slow everything down.",
      "Wrapping the column in a function (for example a cast or YEAR(txn_date)) can stop some engines from pruning, so filter on the raw column."
    ]
  },
  {
    "id": "de-data-quality-duplicates",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Data quality checks",
    "title": "Catching a duplicated load",
    "prompt": "After loading yesterday's transactions, which check most directly catches a bug that loaded some transactions twice?",
    "options": [
      "Check that `amount` has no NULLs",
      "Check that yesterday's row count is greater than zero",
      "Check that every `txn_date` equals yesterday",
      "Check that `COUNT(*)` equals `COUNT(DISTINCT txn_id)` for yesterday"
    ],
    "answer": 3,
    "explanations": [
      "A null check catches missing values, not repeated rows. Duplicated rows usually have perfectly valid amounts.",
      "A non-empty check catches a load that brought in nothing. Duplicates make the count bigger, so this check still passes.",
      "This catches rows landing in the wrong date, but duplicates of yesterday's rows still have yesterday's date.",
      "Correct. If txn_id should be unique, any gap between total rows and distinct IDs means duplicates. It is a uniqueness test on the business key."
    ],
    "approach": [
      "Match each check to the failure it catches: not-null for missing values, uniqueness on the key for duplicates, row count bounds or comparison to the source for missing or extra loads, accepted values and ranges for bad data.",
      "Run checks right after the load and fail the pipeline (or quarantine the batch) before bad data reaches reports."
    ]
  },
  {
    "id": "de-cap-theorem",
    "section": "de",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "CAP theorem",
    "title": "What CAP forces during a partition",
    "prompt": "A distributed account ledger runs across two data centers, and the network link between them fails. According to the CAP theorem, what must the system do?",
    "options": [
      "Keep both consistency and availability, since it still has partition tolerance",
      "Choose between consistency (refuse or delay some requests so no one sees conflicting balances) and availability (keep answering, possibly with stale or diverging data)",
      "Give up partition tolerance, because the network failed",
      "Nothing changes; CAP only applies to single-node databases"
    ],
    "answer": 1,
    "explanations": [
      "CAP says that when a partition happens you cannot have both consistency and availability. Being partition tolerant is what forces the choice.",
      "Correct. During a partition the two sides cannot coordinate. A CP system rejects or waits on some requests to keep one true balance; an AP system keeps serving and reconciles later. A bank ledger usually picks consistency.",
      "Partitions are not optional in a distributed system; the network can always fail. The real choice is C or A while it is failing.",
      "A single node has no network between replicas to partition. CAP is specifically about distributed systems."
    ],
    "approach": [
      "Consistency: every read sees the latest write. Availability: every request gets a non-error response. Partition tolerance: the system keeps working when messages between nodes are lost.",
      "Since partitions will happen, CAP really asks: during one, do you prefer correct answers (CP) or always answering (AP)?"
    ]
  },
  {
    "id": "de-columnar-parquet",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Row vs columnar storage",
    "title": "Why Parquet is fast for analytics",
    "prompt": "A table of 2 billion transactions has 120 columns. Analysts mostly run queries like `SELECT branch_id, SUM(amount) ... GROUP BY branch_id`. Why does storing it as Parquet beat a row-oriented CSV?",
    "options": [
      "Parquet keeps each row together, so whole rows are read faster",
      "Parquet files are always smaller because they drop NULL rows",
      "Parquet stores data by column, so the query reads only `branch_id` and `amount` and those columns compress well",
      "Parquet allows faster single-row updates than CSV"
    ],
    "answer": 2,
    "explanations": [
      "That describes row-oriented storage. Reading whole rows is exactly what wastes I/O when you need 2 of 120 columns.",
      "Parquet does not drop rows. It encodes NULLs compactly, but the main win is columnar layout and compression.",
      "Correct. Columnar files let the engine skip the other 118 columns entirely, and values of one type stored together compress far better (dictionary and run-length encoding). Row group statistics also let it skip blocks.",
      "Parquet files are immutable; changing one row means rewriting the file. Columnar formats are built for big scans, not frequent point updates."
    ],
    "approach": [
      "Row storage (CSV, OLTP databases): good for reading or writing whole records. Columnar storage (Parquet, ORC, warehouses): good for scanning a few columns over many rows.",
      "Analytics queries touch few columns and many rows, so columnar wins."
    ]
  },
  {
    "id": "de-dedupe-row-number",
    "section": "de",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "Deduplication with ROW_NUMBER",
    "title": "Keep the latest version of each transaction",
    "prompt": "The raw table `txn_raw(txn_id, status, loaded_at)` has several versions of some transactions. You want exactly one row per `txn_id`: the most recently loaded one. Which query does that?",
    "options": [
      "Wrap `ROW_NUMBER() OVER (PARTITION BY txn_id ORDER BY loaded_at DESC) AS rn` in a subquery and keep `rn = 1`",
      "Same window, but `ORDER BY loaded_at ASC`, keeping `rn = 1`",
      "Use `RANK() OVER (PARTITION BY txn_id ORDER BY loaded_at DESC)` and keep rank 1",
      "`SELECT DISTINCT txn_id, status, loaded_at FROM txn_raw`"
    ],
    "answer": 0,
    "explanations": [
      "Correct. PARTITION BY txn_id numbers each transaction's versions separately, ORDER BY loaded_at DESC makes the newest row number 1, and the filter goes in an outer query because WHERE runs before window functions.",
      "Ascending order makes the oldest version rn = 1, so you would keep the first load, not the latest.",
      "RANK gives tied rows the same rank. If two versions share the same loaded_at, both get rank 1 and you still have a duplicate. ROW_NUMBER always picks exactly one (add a tie-breaker column to make the pick deterministic).",
      "DISTINCT removes only rows identical in every column. Versions with different status or loaded_at all survive."
    ],
    "approach": [
      "Pattern: ROW_NUMBER() OVER (PARTITION BY the key ORDER BY the recency column DESC), then keep rn = 1 in an outer query or with QUALIFY.",
      "ROW_NUMBER for exactly one row per group; RANK or DENSE_RANK when ties should all be kept."
    ]
  },
  {
    "id": "de-upsert-merge",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Upserts",
    "title": "What a MERGE does",
    "prompt": "A nightly job runs `MERGE INTO accounts t USING staging s ON t.account_id = s.account_id WHEN MATCHED THEN UPDATE SET balance = s.balance WHEN NOT MATCHED THEN INSERT (account_id, balance) VALUES (s.account_id, s.balance)`. What is the result?",
    "options": [
      "All rows in accounts are deleted and replaced with the staging rows",
      "Only new accounts are inserted; existing balances are left alone",
      "The job fails whenever an account_id exists in both tables",
      "Existing accounts get the staging balance and accounts not yet in the target are inserted"
    ],
    "answer": 3,
    "explanations": [
      "MERGE never deletes unless you add a WHEN NOT MATCHED BY SOURCE THEN DELETE clause. Accounts missing from staging are untouched.",
      "The WHEN MATCHED clause updates existing accounts, so their balances do change.",
      "Matching rows are exactly what WHEN MATCHED handles. MERGE only errors if one target row matches more than one source row, which is why staging should be deduplicated first.",
      "Correct. This is an upsert: update on match, insert otherwise. It is idempotent, so re-running with the same staging data gives the same table. MySQL writes the same idea as INSERT ... ON DUPLICATE KEY UPDATE."
    ],
    "approach": [
      "Upsert = update if the key exists, insert if not. MERGE (standard SQL, Snowflake, BigQuery), INSERT ... ON CONFLICT DO UPDATE (Postgres, SQLite), INSERT ... ON DUPLICATE KEY UPDATE (MySQL).",
      "Deduplicate the source on the merge key first, or the MERGE can fail or update a row twice."
    ]
  },
  {
    "id": "de-acid-atomicity",
    "section": "de",
    "type": "mcq",
    "difficulty": "Easy",
    "topic": "Transactions and ACID",
    "title": "A transfer that crashes halfway",
    "prompt": "A transfer of $100 runs inside one transaction: debit checking, then credit savings. The server crashes after the debit but before the commit. What does the A in ACID guarantee?",
    "options": [
      "The debit stays and the credit is applied when the server restarts",
      "Atomicity: the transaction is all or nothing, so the uncommitted debit is rolled back",
      "The debit is kept, but other users cannot see it",
      "The database retries the credit automatically until it succeeds"
    ],
    "answer": 1,
    "explanations": [
      "The credit was never committed, so the database does not replay it. Half-finished work is undone, not completed.",
      "Correct. Atomicity means either every statement in the transaction takes effect or none do. Since there was no commit, recovery rolls the debit back and no money disappears.",
      "Hiding uncommitted changes from others is isolation (the I). After a crash the debit is not kept at all.",
      "Databases do not retry your business logic. The application decides whether to try the transfer again."
    ],
    "approach": [
      "Atomicity: all or nothing. Consistency: constraints hold before and after. Isolation: concurrent transactions do not see each other's partial work. Durability: committed data survives crashes.",
      "Money transfers are the textbook atomicity example: a debit without its matching credit must never persist."
    ]
  },
  {
    "id": "de-airflow-dag",
    "section": "de",
    "type": "mcq",
    "difficulty": "Medium",
    "topic": "Orchestration",
    "title": "Airflow DAG basics",
    "prompt": "In Airflow, a DAG has tasks `extract`, `transform`, and `load` with `extract >> transform >> load`, scheduled daily. You need to backfill last week. Why should each task filter on the run's logical date (for example `{{ ds }}`) instead of calling `now()`?",
    "options": [
      "Because Airflow forbids Python's datetime module inside tasks",
      "Because `now()` makes the DAG cyclic",
      "So each backfilled run processes its own day; with `now()` all seven runs would process today's data",
      "Because the logical date makes tasks run in parallel instead of in order"
    ],
    "answer": 2,
    "explanations": [
      "Airflow allows any Python. The issue is correctness, not a restriction.",
      "Cycles come from task dependencies (for example load >> extract), not from how a task reads the time. A DAG must be acyclic so the scheduler can order tasks.",
      "Correct. Each DAG run has a logical date describing the data interval it covers. Tasks that use it are deterministic, so backfills and re-runs reprocess the right day. now() ties output to when the job happened to run.",
      "The >> dependencies decide order. The logical date does not change which tasks wait for which."
    ],
    "approach": [
      "DAG: tasks plus dependencies with no cycles. The scheduler creates one DAG run per schedule interval, each with a logical date.",
      "Good tasks are idempotent and parameterized by the logical date, which makes retries and backfills safe."
    ]
  },
  {
    "id": "de-late-arriving-data",
    "section": "de",
    "type": "mcq",
    "difficulty": "Hard",
    "topic": "Late arriving data",
    "title": "Transactions that arrive days late",
    "prompt": "A job at 1:00 AM aggregates yesterday's card transactions by `event_date` into a daily partition. Some processors send transactions up to 3 days late. What is the best fix so daily totals end up correct?",
    "options": [
      "Ignore late rows; they are a small percentage of volume",
      "Assign late rows to the day they arrived instead of the day they happened",
      "Delay the job by one hour",
      "Each run idempotently reprocesses the last 3 or 4 event dates (overwriting those partitions), so late rows are folded into the day they belong to"
    ],
    "answer": 3,
    "explanations": [
      "Dropping data silently makes financial totals wrong, and the error grows with volume. That is rarely acceptable for a bank.",
      "Using arrival time puts transactions in the wrong business day, which breaks reconciliation and any report by event date.",
      "Delaying by an hour still misses rows that arrive two or three days later.",
      "Correct. A lookback window that recomputes recent partitions catches late events, and because each partition is overwritten, re-running is safe. Streaming systems handle the same issue with watermarks and allowed lateness."
    ],
    "approach": [
      "Separate event time (when it happened) from processing time (when it arrived). Reports usually need event time.",
      "Know how late data can be, reprocess that window each run, and make the reprocessing idempotent."
    ]
  },
  {
    "id": "de-py-parse-logs",
    "section": "de",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Parsing and cleaning",
    "title": "Parse transaction log lines",
    "prompt": [
      "A payment service writes one transaction per line: `timestamp txn_id type amount`, separated by spaces. Write `parse_logs(lines)` that returns a list of dicts with keys `ts`, `txn_id`, `type`, and `amount`, in the original order.",
      "",
      "- `type` must be `DEBIT` or `CREDIT` in any letter case; store it in uppercase.",
      "- `amount` becomes a float.",
      "- Ignore extra spaces around and between fields.",
      "- Skip any malformed line: wrong number of fields, an amount that is not a number, or an unknown type. Blank lines are skipped too.",
      "",
      "```",
      "parse_logs(['2026-10-07T09:15:00 T1 DEBIT 45.20', 'oops'])",
      "# [{'ts': '2026-10-07T09:15:00', 'txn_id': 'T1', 'type': 'DEBIT', 'amount': 45.2}]",
      "```"
    ],
    "starter": [
      "def parse_logs(lines):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def parse_logs(lines):",
      "    records = []",
      "    for line in lines:",
      "        parts = line.split()             # splits on any run of whitespace",
      "        if len(parts) != 4:",
      "            continue",
      "        ts, txn_id, kind, raw_amount = parts",
      "        kind = kind.upper()",
      "        if kind not in ('DEBIT', 'CREDIT'):",
      "            continue",
      "        try:",
      "            amount = float(raw_amount)",
      "        except ValueError:",
      "            continue",
      "        records.append({'ts': ts, 'txn_id': txn_id, 'type': kind, 'amount': amount})",
      "    return records",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "parse_logs(['2026-10-07T09:15:00 T1 DEBIT 45.20', 'oops'])",
        "expect": "[{'ts': '2026-10-07T09:15:00', 'txn_id': 'T1', 'type': 'DEBIT', 'amount': 45.2}]"
      },
      {
        "name": "Two good lines keep their order",
        "setup": "",
        "expr": "parse_logs(['2026-10-07T10:00:00 T2 CREDIT 100', '2026-10-07T08:00:00 T3 DEBIT 7.5'])",
        "expect": "[{'ts': '2026-10-07T10:00:00', 'txn_id': 'T2', 'type': 'CREDIT', 'amount': 100.0}, {'ts': '2026-10-07T08:00:00', 'txn_id': 'T3', 'type': 'DEBIT', 'amount': 7.5}]"
      },
      {
        "name": "Bad amount and unknown type are skipped",
        "setup": "",
        "expr": "parse_logs(['2026-10-07T09:00:00 T4 DEBIT abc', '2026-10-07T09:01:00 T5 REFUND 3.00', '2026-10-07T09:02:00 T6 CREDIT 3.00'])",
        "expect": "[{'ts': '2026-10-07T09:02:00', 'txn_id': 'T6', 'type': 'CREDIT', 'amount': 3.0}]"
      },
      {
        "name": "Lowercase type and extra spaces",
        "setup": "",
        "expr": "parse_logs(['  2026-10-07T11:30:00   T7  debit   12.00  '])",
        "expect": "[{'ts': '2026-10-07T11:30:00', 'txn_id': 'T7', 'type': 'DEBIT', 'amount': 12.0}]"
      },
      {
        "name": "Blank line and too many fields",
        "setup": "",
        "expr": "parse_logs(['', '2026-10-07T12:00:00 T8 DEBIT 5.00 extra', '2026-10-07T12:00:00 T9 DEBIT'])",
        "expect": "[]"
      },
      {
        "name": "Empty input",
        "setup": "",
        "expr": "parse_logs([])",
        "expect": "[]"
      }
    ],
    "approach": [
      "Treat each line independently: split it, validate each piece, and only append when everything checks out.",
      "line.split() with no argument splits on any whitespace and drops leading and trailing spaces, which handles the messy spacing for free.",
      "Converting with float() inside try/except is the cleanest way to reject non-numeric amounts."
    ],
    "walkthrough": [
      "`parts = line.split()`: a blank line gives an empty list, so the length check also skips it.",
      "`if len(parts) != 4: continue`: rejects missing and extra fields before unpacking, so unpacking never raises.",
      "`kind = kind.upper()` then the membership test: accepts debit, Debit, and DEBIT, rejects anything else.",
      "`try: float(raw_amount) except ValueError: continue`: a bad amount skips only that line instead of crashing the whole batch."
    ],
    "mistakes": [
      "Using line.split(' '), which produces empty strings for repeated spaces and breaks the field count.",
      "Letting one bad line raise an exception and kill the whole parse instead of skipping it.",
      "Forgetting to uppercase the type, so 'debit' is either rejected or stored inconsistently.",
      "Leaving amount as a string, so later sums concatenate text instead of adding numbers."
    ]
  },
  {
    "id": "de-py-latest-per-key",
    "section": "de",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Deduplication",
    "title": "Keep the latest record per account",
    "prompt": [
      "A change feed sends account snapshots, possibly several per account and not in time order. Each record is a dict with `account_id`, `updated_at` (an ISO string like `'2026-10-07 09:00'`), and `balance`.",
      "",
      "Write `latest_per_account(records)` that keeps only the record with the greatest `updated_at` for each `account_id` and returns them sorted by `account_id` ascending.",
      "",
      "- If two records for the same account have the same `updated_at`, keep the one that appears later in the input (it was loaded more recently).",
      "- Return the original dicts unchanged.",
      "",
      "```",
      "latest_per_account([",
      "    {'account_id': 2, 'updated_at': '2026-10-07 09:00', 'balance': 50},",
      "    {'account_id': 2, 'updated_at': '2026-10-07 08:00', 'balance': 40},",
      "])",
      "# [{'account_id': 2, 'updated_at': '2026-10-07 09:00', 'balance': 50}]",
      "```"
    ],
    "starter": [
      "def latest_per_account(records):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def latest_per_account(records):",
      "    best = {}                                # account_id -> latest record so far",
      "    for rec in records:",
      "        key = rec['account_id']",
      "        current = best.get(key)",
      "        # >= so a tie goes to the record that appears later",
      "        if current is None or rec['updated_at'] >= current['updated_at']:",
      "            best[key] = rec",
      "    return [best[k] for k in sorted(best)]",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "latest_per_account([{'account_id': 2, 'updated_at': '2026-10-07 09:00', 'balance': 50}, {'account_id': 2, 'updated_at': '2026-10-07 08:00', 'balance': 40}])",
        "expect": "[{'account_id': 2, 'updated_at': '2026-10-07 09:00', 'balance': 50}]"
      },
      {
        "name": "Several accounts, sorted by id",
        "setup": "",
        "expr": "latest_per_account([{'account_id': 9, 'updated_at': '2026-10-06 10:00', 'balance': 5}, {'account_id': 3, 'updated_at': '2026-10-06 11:00', 'balance': 7}, {'account_id': 9, 'updated_at': '2026-10-07 10:00', 'balance': 6}])",
        "expect": "[{'account_id': 3, 'updated_at': '2026-10-06 11:00', 'balance': 7}, {'account_id': 9, 'updated_at': '2026-10-07 10:00', 'balance': 6}]"
      },
      {
        "name": "Tie on updated_at keeps the later record",
        "setup": "",
        "expr": "latest_per_account([{'account_id': 1, 'updated_at': '2026-10-07 12:00', 'balance': 100}, {'account_id': 1, 'updated_at': '2026-10-07 12:00', 'balance': 120}])",
        "expect": "[{'account_id': 1, 'updated_at': '2026-10-07 12:00', 'balance': 120}]"
      },
      {
        "name": "Older record arriving last does not win",
        "setup": "",
        "expr": "latest_per_account([{'account_id': 4, 'updated_at': '2026-10-07 09:00', 'balance': 10}, {'account_id': 4, 'updated_at': '2026-10-05 09:00', 'balance': 99}])",
        "expect": "[{'account_id': 4, 'updated_at': '2026-10-07 09:00', 'balance': 10}]"
      },
      {
        "name": "One record",
        "setup": "",
        "expr": "latest_per_account([{'account_id': 8, 'updated_at': '2026-01-01 00:00', 'balance': 0}])",
        "expect": "[{'account_id': 8, 'updated_at': '2026-01-01 00:00', 'balance': 0}]"
      },
      {
        "name": "Empty feed",
        "setup": "",
        "expr": "latest_per_account([])",
        "expect": "[]"
      }
    ],
    "approach": [
      "This is the Python version of ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY updated_at DESC) = 1.",
      "Keep a dictionary from key to the best record seen so far and update it in one pass.",
      "ISO timestamps in the same format sort correctly as strings, so you can compare them directly.",
      "Decide the tie-break explicitly: >= lets a later record replace an equal one."
    ],
    "walkthrough": [
      "`best = {}`: one entry per account, holding the winning record so far.",
      "`if current is None or rec['updated_at'] >= current['updated_at']`: the first record for an account always goes in; later ones replace it if they are newer or tied.",
      "`[best[k] for k in sorted(best)]`: sorting the keys gives the required account_id order.",
      "One pass plus a sort of the distinct keys: O(n + k log k)."
    ],
    "mistakes": [
      "Keeping the last record seen for each account regardless of timestamp, which breaks when the feed is out of order.",
      "Using > instead of >=, so a tie keeps the earlier record instead of the later one.",
      "Sorting the whole input by updated_at first and forgetting that Python's sort is stable, which makes ties depend on how you sort.",
      "Returning the records in input order instead of sorted by account_id."
    ]
  },
  {
    "id": "de-py-flatten-json",
    "section": "de",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Nested data",
    "title": "Flatten a nested JSON record",
    "prompt": [
      "An API returns nested customer records. Write `flatten(record, sep='.')` that turns nested dicts into one flat dict whose keys are the path joined by `sep`.",
      "",
      "- Only dicts are flattened. Lists and every other value (including `None`) are kept as they are.",
      "- A nested empty dict is kept as the value `{}` so the key is not lost.",
      "- Do not modify the input.",
      "",
      "```",
      "flatten({'id': 1, 'customer': {'name': 'Ana', 'address': {'zip': '02115'}}})",
      "# {'id': 1, 'customer.name': 'Ana', 'customer.address.zip': '02115'}",
      "```"
    ],
    "starter": [
      "def flatten(record, sep='.'):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def flatten(record, sep='.'):",
      "    out = {}",
      "",
      "    def walk(value, prefix):",
      "        for key, inner in value.items():",
      "            path = f'{prefix}{sep}{key}' if prefix else str(key)",
      "            if isinstance(inner, dict) and inner:",
      "                walk(inner, path)            # go one level deeper",
      "            else:",
      "                out[path] = inner            # leaf, list, None, or empty dict",
      "",
      "    walk(record, '')",
      "    return out",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "flatten({'id': 1, 'customer': {'name': 'Ana', 'address': {'zip': '02115'}}})",
        "expect": "{'id': 1, 'customer.name': 'Ana', 'customer.address.zip': '02115'}"
      },
      {
        "name": "Lists are kept as values",
        "setup": "",
        "expr": "flatten({'acct': {'tags': ['vip', 'joint'], 'limit': 5000}})",
        "expect": "{'acct.tags': ['vip', 'joint'], 'acct.limit': 5000}"
      },
      {
        "name": "Empty nested dict and None are kept",
        "setup": "",
        "expr": "flatten({'a': {}, 'b': None, 'c': {'d': {}}})",
        "expect": "{'a': {}, 'b': None, 'c.d': {}}"
      },
      {
        "name": "Custom separator",
        "setup": "",
        "expr": "flatten({'loan': {'rate': {'apr': 6.5}}}, sep='_')",
        "expect": "{'loan_rate_apr': 6.5}"
      },
      {
        "name": "Input is not modified",
        "setup": "rec = {'x': {'y': 1}}\nresult = flatten(rec)",
        "expr": "(result, rec)",
        "expect": "({'x.y': 1}, {'x': {'y': 1}})"
      },
      {
        "name": "Empty record",
        "setup": "",
        "expr": "flatten({})",
        "expect": "{}"
      }
    ],
    "approach": [
      "Nested structures of unknown depth call for recursion: handle one level, and call yourself on any dict you find.",
      "Carry the path built so far (the prefix) down into each call and join it to the next key with sep.",
      "Decide what counts as a leaf: anything that is not a non-empty dict."
    ],
    "walkthrough": [
      "`out = {}` lives outside the helper, so every level writes into the same result.",
      "`path = f'{prefix}{sep}{key}' if prefix else str(key)`: top-level keys have no prefix, so no leading separator.",
      "`if isinstance(inner, dict) and inner`: recurse only into non-empty dicts; an empty dict falls to the else branch and is stored as {}.",
      "The input is only read, never assigned to, so it stays unchanged."
    ],
    "mistakes": [
      "Recursing into an empty dict, which writes nothing and silently drops the key.",
      "Always adding the separator, producing keys like '.id' at the top level.",
      "Flattening lists by index when the spec says to keep them as values.",
      "Building the result by popping or editing the input dict, which changes the caller's data."
    ]
  },
  {
    "id": "de-py-validate-batch",
    "section": "de",
    "type": "python",
    "difficulty": "Hard",
    "topic": "Data validation",
    "title": "Validate a batch against a schema",
    "prompt": [
      "Before loading a batch of transactions, validate every row against a schema. `schema` maps column name to `(type, nullable)`, for example `{'txn_id': (str, False), 'amount': (float, False), 'memo': (str, True)}`.",
      "",
      "Write `validate(rows, schema)` that returns a list of error strings, or `[]` if every row is valid. For row `i` (0-based), check the schema columns in schema order:",
      "",
      "- Column missing from the row: `'row i: missing amount'`",
      "- Value is `None` and the column is not nullable: `'row i: amount is null'` (`None` is fine when nullable)",
      "- Wrong type: `'row i: amount should be float, got str'`. An `int` is accepted where a `float` is expected. A `bool` is never accepted as an `int` or a `float`.",
      "",
      "After the schema columns, report any extra columns not in the schema, in alphabetical order: `'row i: unexpected column x'`. Rows are reported in order.",
      "",
      "```",
      "schema = {'txn_id': (str, False), 'amount': (float, False)}",
      "validate([{'txn_id': 'T1', 'amount': '9.99'}], schema)",
      "# ['row 0: amount should be float, got str']",
      "```"
    ],
    "starter": [
      "def validate(rows, schema):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def type_ok(value, expected):",
      "    if isinstance(value, bool):          # bool is a subclass of int in Python",
      "        return expected is bool",
      "    if expected is float:",
      "        return isinstance(value, (int, float))",
      "    return isinstance(value, expected)",
      "",
      "",
      "def validate(rows, schema):",
      "    errors = []",
      "    for i, row in enumerate(rows):",
      "        for col, (expected, nullable) in schema.items():",
      "            if col not in row:",
      "                errors.append(f'row {i}: missing {col}')",
      "            elif row[col] is None:",
      "                if not nullable:",
      "                    errors.append(f'row {i}: {col} is null')",
      "            elif not type_ok(row[col], expected):",
      "                got = type(row[col]).__name__",
      "                errors.append(f'row {i}: {col} should be {expected.__name__}, got {got}')",
      "        for col in sorted(set(row) - set(schema)):",
      "            errors.append(f'row {i}: unexpected column {col}')",
      "    return errors",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "schema = {'txn_id': (str, False), 'amount': (float, False)}",
        "expr": "validate([{'txn_id': 'T1', 'amount': '9.99'}], schema)",
        "expect": "['row 0: amount should be float, got str']"
      },
      {
        "name": "Valid batch, int accepted as float",
        "setup": "schema = {'txn_id': (str, False), 'amount': (float, False), 'memo': (str, True)}",
        "expr": "validate([{'txn_id': 'T1', 'amount': 50, 'memo': None}, {'txn_id': 'T2', 'amount': 12.5, 'memo': 'rent'}], schema)",
        "expect": "[]"
      },
      {
        "name": "Missing and null columns",
        "setup": "schema = {'txn_id': (str, False), 'amount': (float, False), 'memo': (str, True)}",
        "expr": "validate([{'txn_id': None, 'memo': None}], schema)",
        "expect": "['row 0: txn_id is null', 'row 0: missing amount']"
      },
      {
        "name": "bool is not a number",
        "setup": "schema = {'account_id': (int, False), 'amount': (float, False)}",
        "expr": "validate([{'account_id': True, 'amount': False}], schema)",
        "expect": "['row 0: account_id should be int, got bool', 'row 0: amount should be float, got bool']"
      },
      {
        "name": "Extra columns sorted, rows in order",
        "setup": "schema = {'txn_id': (str, False)}",
        "expr": "validate([{'txn_id': 'T1'}, {'txn_id': 7, 'zeta': 1, 'alpha': 2}], schema)",
        "expect": "['row 1: txn_id should be str, got int', 'row 1: unexpected column alpha', 'row 1: unexpected column zeta']"
      },
      {
        "name": "Empty batch",
        "setup": "schema = {'txn_id': (str, False)}",
        "expr": "validate([], schema)",
        "expect": "[]"
      }
    ],
    "approach": [
      "Loop over rows, then over the schema in its order, so errors come out in a predictable order.",
      "For each column decide in order: is it missing, is it None, is the type right? Only one error per column.",
      "Handle the Python trap explicitly: isinstance(True, int) is True, so check bool before anything else.",
      "Extra columns are a set difference between the row's keys and the schema's keys, sorted for a stable report."
    ],
    "walkthrough": [
      "`type_ok`: checks bool first because bool is a subclass of int; then lets an int pass for a float column; otherwise a plain isinstance check.",
      "`if col not in row` / `elif row[col] is None` / `elif not type_ok(...)`: the elif chain means a missing column is not also reported as null or as the wrong type.",
      "`if not nullable`: None is only an error for required columns, and a nullable None skips the type check.",
      "`sorted(set(row) - set(schema))`: extra columns, alphabetical, reported after the schema checks for that row."
    ],
    "mistakes": [
      "Using isinstance(value, int) alone, which accepts True and False as integers.",
      "Rejecting 50 for a float column, which fails legitimate whole-dollar amounts.",
      "Checking the type of None and reporting 'should be str, got NoneType' instead of a null error.",
      "Stopping at the first error, when the point of an error report is to list every problem in the batch.",
      "Reporting extra columns in dict order, which makes the report nondeterministic across sources."
    ]
  }
]
);
