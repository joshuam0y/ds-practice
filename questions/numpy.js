window.BANK = (window.BANK || []).concat(
[
  {
    "id": "np-reshape-quarters",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Easy",
    "topic": "Creating and reshaping",
    "title": "Quarterly totals from monthly fees",
    "prompt": [
      "`monthly` is a flat list of fee revenue, one number per month, covering whole years in order (January of year 1 first). Its length is always a multiple of 12.",
      "",
      "Return a NumPy array of shape `(n_years, 4)` where row `i` holds the four quarterly totals of year `i` (Q1 = Jan to Mar, Q2 = Apr to Jun, and so on). Do it with `reshape`, not a loop.",
      "",
      "```",
      "quarterly_totals([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])",
      "# array([[ 6., 15., 24., 33.]])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def quarterly_totals(monthly):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def quarterly_totals(monthly):",
      "    arr = np.asarray(monthly, dtype=float)",
      "    return arr.reshape(-1, 4, 3).sum(axis=2)",
      ""
    ],
    "tests": [
      {
        "name": "One year",
        "setup": "m = list(range(1, 13))",
        "expr": "quarterly_totals(m).tolist()",
        "expect": "[[6.0, 15.0, 24.0, 33.0]]"
      },
      {
        "name": "Shape for two years",
        "setup": "m = [10.0] * 24",
        "expr": "tuple(int(d) for d in quarterly_totals(m).shape)",
        "expect": "(2, 4)"
      },
      {
        "name": "Two years of values",
        "setup": "m = [10.0] * 12 + list(range(12))",
        "expr": "quarterly_totals(m).tolist()",
        "expect": "[[30.0, 30.0, 30.0, 30.0], [3.0, 12.0, 21.0, 30.0]]"
      },
      {
        "name": "Works on a NumPy input",
        "setup": "m = np.arange(36, dtype=float)",
        "expr": "quarterly_totals(m)[2].tolist()",
        "expect": "[75.0, 84.0, 93.0, 102.0]"
      },
      {
        "name": "Zeros and refunds",
        "setup": "m = [0, 0, 0, 5, -5, 0, 100, 0, -40, 0, 0, 0]",
        "expr": "quarterly_totals(m).tolist()",
        "expect": "[[0.0, 0.0, 60.0, 0.0]]"
      },
      {
        "name": "Grand total preserved",
        "setup": "m = [1.5] * 36",
        "expr": "round(float(quarterly_totals(m).sum()), 4)",
        "expect": "54.0"
      }
    ],
    "approach": [
      "Months are stored year by year, so reshape to (n_years, 12) gives one row per year.",
      "Go one step further: reshape to (n_years, 4, 3) so the last axis holds the three months of a quarter.",
      "Sum over axis=2 to collapse each quarter. The result has shape (n_years, 4), and no Python loop is needed.",
      "Use -1 for the year count so NumPy works it out from the length."
    ],
    "walkthrough": [
      "`np.asarray(monthly, dtype=float)`: turns a list (or array) into a float array without copying when it is already one.",
      "`arr.reshape(-1, 4, 3)`: row-major order means each run of 3 months becomes one quarter, each run of 4 quarters one year.",
      "`.sum(axis=2)`: adds the three months inside each quarter, leaving shape (n_years, 4)."
    ],
    "mistakes": [
      "Reshaping to (4, -1) or (-1, 3, 4): the numbers fit, but months get grouped into the wrong quarters.",
      "Summing over axis=1 instead of axis=2, which adds the same month across quarters.",
      "Hard-coding one year, so a 24 month input crashes or gets truncated.",
      "Returning a list of lists built with a for loop; the point is to let reshape do the grouping."
    ]
  },
  {
    "id": "np-boolean-mask",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Easy",
    "topic": "Boolean masks",
    "title": "Large withdrawals",
    "prompt": [
      "`amounts` is a NumPy array of account activity: positive values are deposits and negative values are withdrawals.",
      "",
      "Return a NumPy array of the **withdrawals** whose size is at least `limit`, written as positive numbers, in their original order. Use a boolean mask, not a loop.",
      "",
      "```",
      "amounts = np.array([500.0, -120.0, -800.0, 75.0, -300.0])",
      "large_withdrawals(amounts, 300)",
      "# array([800., 300.])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def large_withdrawals(amounts, limit):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def large_withdrawals(amounts, limit):",
      "    amounts = np.asarray(amounts, dtype=float)",
      "    mask = (amounts < 0) & (-amounts >= limit)",
      "    return -amounts[mask]",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "a = np.array([500.0, -120.0, -800.0, 75.0, -300.0])",
        "expr": "large_withdrawals(a, 300).tolist()",
        "expect": "[800.0, 300.0]"
      },
      {
        "name": "Boundary is included",
        "setup": "a = np.array([-300.0, -299.99, -300.01])",
        "expr": "large_withdrawals(a, 300).tolist()",
        "expect": "[300.0, 300.01]"
      },
      {
        "name": "Big deposits are not withdrawals",
        "setup": "a = np.array([5000.0, -50.0, 2500.0])",
        "expr": "large_withdrawals(a, 100).tolist()",
        "expect": "[]"
      },
      {
        "name": "Limit of zero keeps every withdrawal",
        "setup": "a = np.array([10.0, -1.0, 0.0, -2.5])",
        "expr": "large_withdrawals(a, 0).tolist()",
        "expect": "[1.0, 2.5]"
      },
      {
        "name": "Count of flagged rows",
        "setup": "a = np.array([-1000.0, -2000.0, 3000.0, -999.0, -1000.0])",
        "expr": "int(large_withdrawals(a, 1000).size)",
        "expect": "3"
      },
      {
        "name": "Input is not changed",
        "setup": "a = np.array([-400.0, 100.0]); r = large_withdrawals(a, 100)",
        "expr": "(a.tolist(), r.tolist())",
        "expect": "([-400.0, 100.0], [400.0])"
      }
    ],
    "approach": [
      "Build two boolean arrays of the same shape as amounts and combine them with &.",
      "Indexing with a boolean mask returns only the True positions, in order, as a new 1D array.",
      "Negate the selected values so they come out positive. Everything is vectorized: one pass over the array, no Python loop."
    ],
    "walkthrough": [
      "`(amounts < 0)`: True where the row is a withdrawal.",
      "`(-amounts >= limit)`: True where the withdrawal is big enough. For deposits this is False because -amounts is negative.",
      "`&`: elementwise and. Each condition needs its own parentheses because & binds tighter than comparisons.",
      "`-amounts[mask]`: select the flagged rows and flip the sign. This makes a new array, so the input is untouched."
    ],
    "mistakes": [
      "Using `and` instead of `&`, which raises 'truth value of an array is ambiguous'.",
      "Writing `amounts < -limit` without the parentheses around each comparison when combining masks.",
      "Using np.abs(amounts) >= limit alone, which also flags large deposits.",
      "Changing amounts in place (for example amounts *= -1), which corrupts the caller's data."
    ]
  },
  {
    "id": "np-where-fees",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Easy",
    "topic": "np.where",
    "title": "Month end interest and overdraft fees",
    "prompt": [
      "`balances` is a NumPy array of account balances at month end. Apply this rule to every account at once:",
      "",
      "- If the balance is **negative**, subtract a flat `fee`.",
      "- Otherwise, add interest: `balance * (1 + rate)`.",
      "",
      "Return the new balances as a float array rounded to 2 decimals. Use `np.where`, not a loop.",
      "",
      "```",
      "month_end(np.array([1000.0, -50.0, 0.0]), fee=35, rate=0.01)",
      "# array([1010.,  -85.,    0.])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def month_end(balances, fee, rate):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def month_end(balances, fee, rate):",
      "    b = np.asarray(balances, dtype=float)",
      "    return np.round(np.where(b < 0, b - fee, b * (1 + rate)), 2)",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "b = np.array([1000.0, -50.0, 0.0])",
        "expr": "month_end(b, 35, 0.01).tolist()",
        "expect": "[1010.0, -85.0, 0.0]"
      },
      {
        "name": "Zero balance earns no fee",
        "setup": "b = np.array([0.0, 0.0])",
        "expr": "month_end(b, 25, 0.05).tolist()",
        "expect": "[0.0, 0.0]"
      },
      {
        "name": "Rounding to cents",
        "setup": "b = np.array([123.45, -0.01])",
        "expr": "month_end(b, 10, 0.0125).tolist()",
        "expect": "[124.99, -10.01]"
      },
      {
        "name": "All overdrawn",
        "setup": "b = np.array([-1.0, -200.0, -35.5])",
        "expr": "month_end(b, 35, 0.02).tolist()",
        "expect": "[-36.0, -235.0, -70.5]"
      },
      {
        "name": "Integer input",
        "setup": "b = np.array([100, -100])",
        "expr": "month_end(b, 30, 0.1).tolist()",
        "expect": "[110.0, -130.0]"
      },
      {
        "name": "2D array keeps its shape",
        "setup": "b = np.array([[500.0, -20.0], [-5.0, 80.0]])",
        "expr": "month_end(b, 15, 0.02).tolist()",
        "expect": "[[510.0, -35.0], [-20.0, 81.6]]"
      }
    ],
    "approach": [
      "np.where(condition, a, b) picks from a where the condition is True and from b elsewhere, elementwise.",
      "Both branches are computed for every element as whole arrays, then combined, so the output has the same shape as balances (1D or 2D).",
      "Round once at the end with np.round(..., 2)."
    ],
    "walkthrough": [
      "`b = np.asarray(balances, dtype=float)`: makes integer input float so interest is not truncated.",
      "`b < 0`: a boolean array marking overdrawn accounts.",
      "`np.where(b < 0, b - fee, b * (1 + rate))`: overdrawn accounts get the fee, the rest get interest.",
      "`np.round(..., 2)`: round to cents."
    ],
    "mistakes": [
      "Using `b <= 0`, which charges an overdraft fee to an empty account.",
      "Looping with if/else over each element; it works but is slow and misses the point.",
      "Writing `b * rate` instead of `b * (1 + rate)`, which returns only the interest.",
      "Forgetting to round, so 81.6 comes back as 81.60000000000001."
    ]
  },
  {
    "id": "np-standardize",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Medium",
    "topic": "Broadcasting",
    "title": "Standardize credit features",
    "prompt": [
      "`X` is a 2D NumPy array: one row per applicant, one column per feature (income, debt, credit age, ...). Standardize **each column**: subtract that column's mean and divide by that column's standard deviation (population std, `ddof=0`).",
      "",
      "If a column is constant (std of 0), its standardized values should all be `0.0` instead of NaN. Return a float array with the same shape as `X`, and do not use a loop over columns.",
      "",
      "```",
      "X = np.array([[1.0, 10.0], [2.0, 10.0], [3.0, 10.0]])",
      "standardize(X)",
      "# array([[-1.2247,  0.    ],",
      "#        [ 0.    ,  0.    ],",
      "#        [ 1.2247,  0.    ]])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def standardize(X):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def standardize(X):",
      "    X = np.asarray(X, dtype=float)",
      "    mean = X.mean(axis=0)",
      "    std = X.std(axis=0)",
      "    safe = np.where(std == 0, 1.0, std)",
      "    return (X - mean) / safe",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "X = np.array([[1.0, 10.0], [2.0, 10.0], [3.0, 10.0]])",
        "expr": "np.round(standardize(X), 4).tolist()",
        "expect": "[[-1.2247, 0.0], [0.0, 0.0], [1.2247, 0.0]]"
      },
      {
        "name": "Column means become 0",
        "setup": "X = np.array([[50000.0, 0.3], [72000.0, 0.1], [61000.0, 0.5], [90000.0, 0.2]])",
        "expr": "(bool(np.allclose(standardize(X).mean(axis=0), 0)), round(float(standardize(X)[0, 0]), 4))",
        "expect": "(True, -1.2355)"
      },
      {
        "name": "Column stds become 1",
        "setup": "X = np.array([[50000.0, 0.3], [72000.0, 0.1], [61000.0, 0.5], [90000.0, 0.2]])",
        "expr": "np.round(standardize(X).std(axis=0), 4).tolist()",
        "expect": "[1.0, 1.0]"
      },
      {
        "name": "Three columns",
        "setup": "X = np.array([[2.0, 4.0, 1.0], [4.0, 4.0, 3.0], [6.0, 4.0, 8.0], [8.0, 4.0, 0.0]])",
        "expr": "np.round(standardize(X), 4).tolist()",
        "expect": "[[-1.3416, 0.0, -0.6489], [-0.4472, 0.0, 0.0], [0.4472, 0.0, 1.6222], [1.3416, 0.0, -0.9733]]"
      },
      {
        "name": "Integer input, no NaN",
        "setup": "X = np.array([[1, 5], [1, 7]])",
        "expr": "np.round(standardize(X), 4).tolist()",
        "expect": "[[0.0, -1.0], [0.0, 1.0]]"
      },
      {
        "name": "Shape and input unchanged",
        "setup": "X = np.array([[1.0, 2.0], [3.0, 6.0], [5.0, 4.0]]); Z = standardize(X)",
        "expr": "(tuple(int(d) for d in Z.shape), X.tolist(), round(float(Z[0, 0]), 4))",
        "expect": "((3, 2), [[1.0, 2.0], [3.0, 6.0], [5.0, 4.0]], -1.2247)"
      }
    ],
    "approach": [
      "Column statistics come from reducing over axis=0: X.mean(axis=0) and X.std(axis=0) both have shape (n_features,).",
      "Broadcasting lines a shape (n_features,) array up with the last axis of an (n_rows, n_features) array, so X - mean subtracts each column's own mean from every row.",
      "Guard against division by zero by swapping std values of 0 for 1; the numerator is already 0 in a constant column.",
      "The whole thing is three vectorized lines with no loop over columns."
    ],
    "walkthrough": [
      "`mean = X.mean(axis=0)`: one mean per column, shape (n_features,).",
      "`std = X.std(axis=0)`: population standard deviation per column (NumPy's default ddof=0).",
      "`safe = np.where(std == 0, 1.0, std)`: replace zero stds so a constant column divides 0 by 1 instead of 0 by 0.",
      "`(X - mean) / safe`: broadcasting stretches the (n_features,) arrays across every row."
    ],
    "mistakes": [
      "Using axis=1, which standardizes each applicant across features instead of each feature across applicants.",
      "Using ddof=1 (sample std) when the question asks for population std, which shifts every value slightly.",
      "Letting a constant column turn into NaN from 0 / 0.",
      "Computing X.mean() with no axis, which gives one overall mean for the whole matrix.",
      "Writing X -= mean on the caller's array, which modifies the input in place."
    ]
  },
  {
    "id": "np-vectorize-growth",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Medium",
    "topic": "Vectorizing loops",
    "title": "Balance path without a loop",
    "prompt": [
      "A savings account starts at `start`. In month `i` it earns interest at `rates[i]`, and then the bank takes a management fee of `fee_pct` of the balance. In loop form:",
      "",
      "```",
      "balance = start",
      "path = []",
      "for r in rates:",
      "    balance = balance * (1 + r)",
      "    balance = balance * (1 - fee_pct)",
      "    path.append(balance)",
      "```",
      "",
      "Write `balance_path(start, rates, fee_pct)` that returns the same `path` as a NumPy float array rounded to 2 decimals, **without a Python loop**. If `rates` is empty, return an empty array.",
      "",
      "```",
      "balance_path(1000, [0.01, 0.02, -0.01], 0.0)",
      "# array([1010.  , 1030.2 , 1019.9 ])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def balance_path(start, rates, fee_pct):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def balance_path(start, rates, fee_pct):",
      "    rates = np.asarray(rates, dtype=float)",
      "    factors = (1 + rates) * (1 - fee_pct)",
      "    return np.round(start * np.cumprod(factors), 2)",
      ""
    ],
    "tests": [
      {
        "name": "Example, no fee",
        "setup": "",
        "expr": "balance_path(1000, [0.01, 0.02, -0.01], 0.0).tolist()",
        "expect": "[1010.0, 1030.2, 1019.9]"
      },
      {
        "name": "Fee only",
        "setup": "",
        "expr": "balance_path(500, [0.0, 0.0, 0.0], 0.1).tolist()",
        "expect": "[450.0, 405.0, 364.5]"
      },
      {
        "name": "Interest and fee",
        "setup": "",
        "expr": "balance_path(1000, [0.05, 0.05], 0.01).tolist()",
        "expect": "[1039.5, 1080.56]"
      },
      {
        "name": "Matches the loop over 24 months",
        "setup": "rates = np.linspace(0.0, 0.023, 24)",
        "expr": "round(float(balance_path(2500, rates, 0.002)[-1]), 2)",
        "expect": "3133.36"
      },
      {
        "name": "Empty rates",
        "setup": "",
        "expr": "balance_path(1000, [], 0.01).tolist()",
        "expect": "[]"
      },
      {
        "name": "Length matches rates",
        "setup": "rates = np.full(12, 0.004)",
        "expr": "(int(balance_path(100, rates, 0.0).size), float(balance_path(100, rates, 0.0)[-1]))",
        "expect": "(12, 104.91)"
      }
    ],
    "approach": [
      "Each month multiplies the balance by the same kind of factor: (1 + rate) times (1 - fee_pct).",
      "Build all the factors at once as an array with the same shape as rates.",
      "The balance after month i is start times the product of the first i + 1 factors, which is exactly np.cumprod. This replaces the loop with one vectorized call.",
      "np.cumprod of an empty array is an empty array, so the edge case handles itself."
    ],
    "walkthrough": [
      "`rates = np.asarray(rates, dtype=float)`: works for lists, arrays and an empty list.",
      "`factors = (1 + rates) * (1 - fee_pct)`: one growth factor per month, computed elementwise.",
      "`np.cumprod(factors)`: running product, so entry i is factor 0 times factor 1 ... times factor i.",
      "`np.round(start * ..., 2)`: scale by the starting balance and round to cents."
    ],
    "mistakes": [
      "Using np.cumsum of the rates (simple interest) instead of a product (compound interest).",
      "Applying the fee as a subtraction of fee_pct * start every month instead of a share of the current balance.",
      "Rounding inside the loop logic each month, which can drift from the unrounded path the question describes.",
      "Returning only the final balance instead of the whole path."
    ]
  },
  {
    "id": "np-axis-aggregation",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Medium",
    "topic": "Aggregation by axis",
    "title": "Spending by customer and category",
    "prompt": [
      "`S` is a 2D NumPy array of card spend: one row per customer, one column per merchant category. Return a tuple of three plain Python lists:",
      "",
      "1. `row_totals`: total spend per customer.",
      "2. `col_totals`: total spend per category.",
      "3. `top_category`: for each customer, the column index of their largest category. On a tie, use the smallest index.",
      "",
      "```",
      "S = np.array([[120.0, 40.0, 300.0],",
      "              [ 80.0, 80.0,  10.0]])",
      "spend_summary(S)",
      "# ([460.0, 170.0], [200.0, 120.0, 310.0], [2, 0])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def spend_summary(S):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def spend_summary(S):",
      "    S = np.asarray(S, dtype=float)",
      "    row_totals = S.sum(axis=1)",
      "    col_totals = S.sum(axis=0)",
      "    top_category = S.argmax(axis=1)",
      "    return row_totals.tolist(), col_totals.tolist(), top_category.tolist()",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "S = np.array([[120.0, 40.0, 300.0], [80.0, 80.0, 10.0]])",
        "expr": "spend_summary(S)",
        "expect": "([460.0, 170.0], [200.0, 120.0, 310.0], [2, 0])"
      },
      {
        "name": "Row totals",
        "setup": "S = np.array([[1.5, 2.5], [0.0, 0.0], [10.0, -4.0]])",
        "expr": "spend_summary(S)[0]",
        "expect": "[4.0, 0.0, 6.0]"
      },
      {
        "name": "Column totals",
        "setup": "S = np.array([[1.5, 2.5], [0.0, 0.0], [10.0, -4.0]])",
        "expr": "spend_summary(S)[1]",
        "expect": "[11.5, -1.5]"
      },
      {
        "name": "Ties go to the first column",
        "setup": "S = np.array([[5.0, 5.0, 5.0], [0.0, 7.0, 7.0], [1.0, 2.0, 3.0]])",
        "expr": "spend_summary(S)[2]",
        "expect": "[0, 1, 2]"
      },
      {
        "name": "Single customer",
        "setup": "S = np.array([[3.0, 9.0, 1.0, 9.5]])",
        "expr": "spend_summary(S)",
        "expect": "([22.5], [3.0, 9.0, 1.0, 9.5], [3])"
      },
      {
        "name": "Single category",
        "setup": "S = np.array([[4.0], [6.0]])",
        "expr": "spend_summary(S)",
        "expect": "([4.0, 6.0], [10.0], [0, 0])"
      }
    ],
    "approach": [
      "The axis you pass is the axis that disappears: axis=1 collapses columns (one value per row), axis=0 collapses rows (one value per column).",
      "For S of shape (n_customers, n_categories): sum(axis=1) has shape (n_customers,), sum(axis=0) has shape (n_categories,).",
      "argmax(axis=1) returns one index per row and already breaks ties by taking the first occurrence.",
      "Convert with .tolist() so the caller gets plain Python numbers. No loop over rows is needed."
    ],
    "walkthrough": [
      "`S.sum(axis=1)`: add across each row, giving each customer's total.",
      "`S.sum(axis=0)`: add down each column, giving each category's total.",
      "`S.argmax(axis=1)`: position of the largest value in each row; ties pick the lowest index.",
      "`.tolist()`: turn NumPy arrays into lists of Python floats and ints."
    ],
    "mistakes": [
      "Mixing up the axes, so row_totals has one value per category.",
      "Using S.max(axis=1), which returns the largest amount rather than its column index.",
      "Calling S.argmax() with no axis, which returns a single index into the flattened array.",
      "Returning NumPy arrays instead of lists, which compares differently from plain lists."
    ]
  },
  {
    "id": "np-moving-average",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Medium",
    "topic": "Moving average",
    "title": "Trailing average of daily balances",
    "prompt": [
      "`balances` is a 1D NumPy array of end of day balances. Return the **trailing moving average** with window `w`: entry `i` of the result is the mean of `balances[i : i + w]`. Only include full windows, so the result has length `len(balances) - w + 1`. If `w` is larger than the number of days, return an empty array.",
      "",
      "Round to 2 decimals. Use `np.convolve` or `np.cumsum`, not a loop.",
      "",
      "```",
      "moving_average(np.array([100.0, 200.0, 300.0, 400.0]), 2)",
      "# array([150., 250., 350.])",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def moving_average(balances, w):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def moving_average(balances, w):",
      "    x = np.asarray(balances, dtype=float)",
      "    if w > x.size:",
      "        return np.array([])",
      "    c = np.cumsum(np.concatenate(([0.0], x)))",
      "    return np.round((c[w:] - c[:-w]) / w, 2)",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "b = np.array([100.0, 200.0, 300.0, 400.0])",
        "expr": "moving_average(b, 2).tolist()",
        "expect": "[150.0, 250.0, 350.0]"
      },
      {
        "name": "Window of 3",
        "setup": "b = np.array([10.0, 20.0, 60.0, 0.0, 30.0])",
        "expr": "moving_average(b, 3).tolist()",
        "expect": "[30.0, 26.67, 30.0]"
      },
      {
        "name": "Window of 1 returns the data",
        "setup": "b = np.array([5.5, -2.0, 7.25])",
        "expr": "moving_average(b, 1).tolist()",
        "expect": "[5.5, -2.0, 7.25]"
      },
      {
        "name": "Window equals length",
        "setup": "b = np.array([1.0, 2.0, 3.0, 4.0])",
        "expr": "moving_average(b, 4).tolist()",
        "expect": "[2.5]"
      },
      {
        "name": "Window too large",
        "setup": "b = np.array([1.0, 2.0])",
        "expr": "moving_average(b, 5).tolist()",
        "expect": "[]"
      },
      {
        "name": "Length on 30 days",
        "setup": "b = np.arange(30, dtype=float)",
        "expr": "(int(moving_average(b, 7).size), float(moving_average(b, 7)[0]), float(moving_average(b, 7)[-1]))",
        "expect": "(24, 3.0, 26.0)"
      }
    ],
    "approach": [
      "A 'valid' moving average of window w over n points has n - w + 1 outputs.",
      "Cumsum trick: prepend a 0, take the running sum c, and then c[i + w] - c[i] is the sum of the window starting at i. Slicing c[w:] - c[:-w] does every window at once.",
      "Equivalent: np.convolve(x, np.ones(w) / w, mode='valid').",
      "Handle w > n first, since the slices would otherwise give a negative length result."
    ],
    "walkthrough": [
      "`x = np.asarray(balances, dtype=float)`: float array so the division is exact.",
      "`if w > x.size: return np.array([])`: no full window exists.",
      "`c = np.cumsum(np.concatenate(([0.0], x)))`: running totals with a leading 0, length n + 1.",
      "`(c[w:] - c[:-w]) / w`: each difference is one window's sum, so this is n - w + 1 window means computed together.",
      "`np.round(..., 2)`: round to cents."
    ],
    "mistakes": [
      "Using np.convolve with the default mode='full', which returns n + w - 1 values including partial windows at both ends.",
      "Forgetting the leading 0 in the cumsum trick, which drops the first window.",
      "Using mode='same', which keeps length n by averaging partial windows.",
      "Off by one in the slice, such as c[w:] - c[:-w-1], which gives arrays of different lengths."
    ]
  },
  {
    "id": "np-pairwise-distance",
    "section": "numpy",
    "type": "python",
    "packages": [
      "numpy"
    ],
    "difficulty": "Hard",
    "topic": "Broadcasting",
    "title": "Nearest peer customer",
    "prompt": [
      "`X` is a 2D NumPy array with one row per customer and one column per (already scaled) feature. A fraud team wants each customer's closest peer.",
      "",
      "Write `nearest_peers(X)` that returns a tuple `(D, nearest)`:",
      "",
      "- `D`: the `(n, n)` matrix of Euclidean distances, where `D[i, j]` is the distance between rows `i` and `j`.",
      "- `nearest`: a 1D integer array where `nearest[i]` is the index of the closest **other** row to row `i` (never `i` itself). On a tie, use the smallest index.",
      "",
      "Assume `n >= 2`. Use broadcasting, not nested loops.",
      "",
      "```",
      "X = np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 0.0]])",
      "D, nearest = nearest_peers(X)",
      "# D = [[0.    , 5.    , 1.    ],",
      "#      [5.    , 0.    , 4.4721],",
      "#      [1.    , 4.4721, 0.    ]]",
      "# nearest = [2, 2, 0]",
      "```"
    ],
    "starter": [
      "import numpy as np",
      "",
      "",
      "def nearest_peers(X):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import numpy as np",
      "",
      "",
      "def nearest_peers(X):",
      "    X = np.asarray(X, dtype=float)",
      "    diff = X[:, None, :] - X[None, :, :]",
      "    D = np.sqrt((diff ** 2).sum(axis=2))",
      "    masked = D.copy()",
      "    np.fill_diagonal(masked, np.inf)",
      "    nearest = masked.argmin(axis=1)",
      "    return D, nearest",
      ""
    ],
    "tests": [
      {
        "name": "Distance matrix",
        "setup": "X = np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 0.0]])",
        "expr": "np.round(nearest_peers(X)[0], 4).tolist()",
        "expect": "[[0.0, 5.0, 1.0], [5.0, 0.0, 4.4721], [1.0, 4.4721, 0.0]]"
      },
      {
        "name": "Nearest peers",
        "setup": "X = np.array([[0.0, 0.0], [3.0, 4.0], [1.0, 0.0]])",
        "expr": "nearest_peers(X)[1].tolist()",
        "expect": "[2, 2, 0]"
      },
      {
        "name": "Never picks itself",
        "setup": "X = np.array([[1.0, 1.0], [10.0, 10.0]])",
        "expr": "nearest_peers(X)[1].tolist()",
        "expect": "[1, 0]"
      },
      {
        "name": "Duplicate customers",
        "setup": "X = np.array([[2.0, 2.0], [5.0, 5.0], [2.0, 2.0]])",
        "expr": "(nearest_peers(X)[1].tolist(), round(float(nearest_peers(X)[0][0, 2]), 4))",
        "expect": "([2, 0, 0], 0.0)"
      },
      {
        "name": "Ties use the smallest index",
        "setup": "X = np.array([[0.0], [-1.0], [1.0], [5.0]])",
        "expr": "nearest_peers(X)[1].tolist()",
        "expect": "[1, 0, 0, 2]"
      },
      {
        "name": "Three features, symmetric with zero diagonal",
        "setup": "X = np.array([[1.0, 2.0, 2.0], [0.0, 0.0, 0.0], [4.0, 6.0, 2.0], [1.0, 0.0, 0.0]])",
        "expr": "(np.round(nearest_peers(X)[0][0], 4).tolist(), bool(np.allclose(nearest_peers(X)[0], nearest_peers(X)[0].T)), float(np.trace(nearest_peers(X)[0])), nearest_peers(X)[1].tolist())",
        "expect": "([0.0, 3.0, 5.0, 2.8284], True, 0.0, [3, 3, 0, 1])"
      }
    ],
    "approach": [
      "Shapes drive the trick: X[:, None, :] has shape (n, 1, d) and X[None, :, :] has shape (1, n, d). Subtracting broadcasts to (n, n, d), every pair of rows at once.",
      "Square, sum over the feature axis (axis=2) and take the square root to get the (n, n) distance matrix, fully vectorized.",
      "To exclude self matches, copy D and set the diagonal to infinity before argmin(axis=1). argmin returns the first minimum, which gives the smallest index on ties.",
      "Memory is O(n * n * d). For large n, the identity |a - b|^2 = |a|^2 + |b|^2 - 2 a.b avoids the 3D array (clip tiny negatives to 0 before sqrt)."
    ],
    "walkthrough": [
      "`X[:, None, :] - X[None, :, :]`: broadcasting gives diff[i, j] = X[i] - X[j], shape (n, n, d).",
      "`np.sqrt((diff ** 2).sum(axis=2))`: squared differences summed over features, then the root, shape (n, n).",
      "`masked = D.copy()`: keep the returned D intact with zeros on its diagonal.",
      "`np.fill_diagonal(masked, np.inf)`: a row can never be its own nearest peer.",
      "`masked.argmin(axis=1)`: index of the smallest distance in each row; ties go to the lowest index."
    ],
    "mistakes": [
      "Forgetting to mask the diagonal, so every row reports itself (distance 0) as nearest.",
      "Filling the diagonal of D itself with inf and returning that D, so the distance matrix is wrong.",
      "Summing over the wrong axis (axis=0 or 1), which mixes customers instead of features.",
      "Using the dot product identity without clipping, so tiny negative values make np.sqrt return NaN.",
      "Writing a double for loop over i and j, which is O(n^2) Python iterations and far too slow for interview expectations."
    ]
  }
]
);
