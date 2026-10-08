window.BANK = (window.BANK || []).concat(
[
  {
    "id": "algo-two-sum",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Arrays and hashing",
    "title": "Two payments that add up to a refund",
    "prompt": [
      "A customer was refunded `target` dollars that should match exactly two of their payments. Given the list `amounts` and the `target`, return the positions `[i, j]` (with `i < j`) of the two payments that add up to `target`.",
      "",
      "- There is always exactly one answer.",
      "- You may not use the same payment twice.",
      "- Aim for one pass through the list (O(n)), not checking every pair.",
      "",
      "```",
      "two_sum([20, 45, 5, 30], 50)   # [1, 2]  because 45 + 5 = 50",
      "```"
    ],
    "starter": [
      "def two_sum(amounts, target):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def two_sum(amounts, target):",
      "    seen = {}                        # amount -> its position",
      "    for j, x in enumerate(amounts):",
      "        need = target - x",
      "        if need in seen:",
      "            return [seen[need], j]",
      "        seen[x] = j",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "two_sum([20, 45, 5, 30], 50)",
        "expect": "[1, 2]"
      },
      {
        "name": "Pair at the ends",
        "setup": "",
        "expr": "two_sum([3, 9, 12, 7], 10)",
        "expect": "[0, 3]"
      },
      {
        "name": "Same amount twice",
        "setup": "",
        "expr": "two_sum([25, 10, 25], 50)",
        "expect": "[0, 2]"
      },
      {
        "name": "Negative amounts",
        "setup": "",
        "expr": "two_sum([-5, 15, 40], 10)",
        "expect": "[0, 1]"
      },
      {
        "name": "Two items only",
        "setup": "",
        "expr": "two_sum([1, 2], 3)",
        "expect": "[0, 1]"
      },
      {
        "name": "Zero target",
        "setup": "",
        "expr": "two_sum([4, 0, -4, 9], 0)",
        "expect": "[0, 2]"
      }
    ],
    "approach": [
      "Checking every pair is O(n²). Instead, remember what you've seen in a dictionary.",
      "For each amount x, the partner you need is target - x. If it's already in the dictionary, you're done.",
      "Add x to the dictionary after checking, so a payment can't pair with itself."
    ],
    "walkthrough": [
      "`seen = {}`: maps each amount seen so far to its position.",
      "`need = target - x`: the amount that would complete the pair.",
      "`if need in seen: return [seen[need], j]`: dictionary lookups are O(1); the earlier position comes first, so i < j.",
      "`seen[x] = j`: store after checking, so [25, 10, 25] with target 50 pairs the two different 25s."
    ],
    "mistakes": [
      "Two nested loops: correct but O(n²), which interviews push back on.",
      "Adding x to seen before checking, so 25 can pair with itself when target is 50.",
      "Returning the amounts instead of their positions.",
      "Sorting first, which loses the original positions."
    ]
  },
  {
    "id": "algo-has-duplicate",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Arrays and hashing",
    "title": "Duplicate transaction IDs",
    "prompt": [
      "Return `True` if any transaction ID appears more than once in `ids`, otherwise `False`. An empty list has no duplicates.",
      "",
      "```",
      "has_duplicate(['T1', 'T2', 'T1'])   # True",
      "```"
    ],
    "starter": [
      "def has_duplicate(ids):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def has_duplicate(ids):",
      "    seen = set()",
      "    for x in ids:",
      "        if x in seen:",
      "            return True",
      "        seen.add(x)",
      "    return False",
      ""
    ],
    "tests": [
      {
        "name": "Repeat",
        "setup": "",
        "expr": "has_duplicate(['T1', 'T2', 'T1'])",
        "expect": "True"
      },
      {
        "name": "All different",
        "setup": "",
        "expr": "has_duplicate(['T1', 'T2', 'T3'])",
        "expect": "False"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "has_duplicate([])",
        "expect": "False"
      },
      {
        "name": "One item",
        "setup": "",
        "expr": "has_duplicate(['T9'])",
        "expect": "False"
      },
      {
        "name": "Numbers",
        "setup": "",
        "expr": "has_duplicate([4, 1, 3, 1])",
        "expect": "True"
      },
      {
        "name": "Case matters",
        "setup": "",
        "expr": "has_duplicate(['a1', 'A1'])",
        "expect": "False"
      }
    ],
    "approach": [
      "A set answers \"have I seen this?\" in O(1).",
      "One-line version: len(set(ids)) != len(ids). The loop version stops early at the first repeat."
    ],
    "walkthrough": [
      "`seen = set()`: everything seen so far.",
      "`if x in seen: return True`: stop as soon as a repeat shows up.",
      "`return False` after the loop: no repeats at all, including an empty list."
    ],
    "mistakes": [
      "Comparing every pair (O(n²)).",
      "Sorting and comparing neighbors: works, but O(n log n) and changes the list if you sort in place.",
      "Lower-casing the IDs when the prompt says case matters."
    ]
  },
  {
    "id": "algo-anagram",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Arrays and hashing",
    "title": "Are two codes anagrams",
    "prompt": [
      "Two branch codes are a match if they use exactly the same letters the same number of times, ignoring spaces and upper or lower case. Return `True` or `False`.",
      "",
      "```",
      "is_anagram('Listen', 'Silent')   # True",
      "is_anagram('aab', 'abb')         # False",
      "```"
    ],
    "starter": [
      "def is_anagram(a, b):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def is_anagram(a, b):",
      "    clean = lambda s: s.replace(\" \", \"\").lower()",
      "    counts = {}",
      "    for ch in clean(a):",
      "        counts[ch] = counts.get(ch, 0) + 1",
      "    for ch in clean(b):",
      "        counts[ch] = counts.get(ch, 0) - 1",
      "    return all(v == 0 for v in counts.values())",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "is_anagram('Listen', 'Silent')",
        "expect": "True"
      },
      {
        "name": "Same letters, different counts",
        "setup": "",
        "expr": "is_anagram('aab', 'abb')",
        "expect": "False"
      },
      {
        "name": "Spaces ignored",
        "setup": "",
        "expr": "is_anagram('dormitory', 'dirty room')",
        "expect": "True"
      },
      {
        "name": "Different lengths",
        "setup": "",
        "expr": "is_anagram('abc', 'abcd')",
        "expect": "False"
      },
      {
        "name": "Both empty",
        "setup": "",
        "expr": "is_anagram('', '')",
        "expect": "True"
      },
      {
        "name": "Upper and lower case",
        "setup": "",
        "expr": "is_anagram('ABba', 'baab')",
        "expect": "True"
      }
    ],
    "approach": [
      "Count each letter in one string, subtract the counts from the other, and check everything ends at 0.",
      "Shortcut: sorted(clean(a)) == sorted(clean(b)), or collections.Counter(clean(a)) == Counter(clean(b))."
    ],
    "walkthrough": [
      "`clean`: remove spaces and lower-case first, so 'dirty room' compares with 'dormitory'.",
      "First loop adds 1 per letter of a; second loop subtracts 1 per letter of b.",
      "`all(v == 0 ...)`: every letter used equally often. 'aab' vs 'abb' leaves a at +1 and b at -1."
    ],
    "mistakes": [
      "Comparing set(a) == set(b): 'aab' and 'abb' have the same set of letters but different counts.",
      "Forgetting to remove spaces or lower-case.",
      "Returning early when lengths differ before cleaning the spaces."
    ]
  },
  {
    "id": "algo-group-anagrams",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Arrays and hashing",
    "title": "Group codes that are anagrams",
    "prompt": [
      "Group the codes in `words` so each group holds words that are anagrams of each other (same letters, same counts; all lowercase). Return a list of groups where each group is sorted alphabetically and the groups are sorted by their first word.",
      "",
      "```",
      "group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])",
      "# [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]",
      "```"
    ],
    "starter": [
      "def group_anagrams(words):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def group_anagrams(words):",
      "    groups = {}",
      "    for w in words:",
      "        key = \"\".join(sorted(w))          # 'eat', 'tea', 'ate' -> 'aet'",
      "        groups.setdefault(key, []).append(w)",
      "    return sorted(sorted(g) for g in groups.values())",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])",
        "expect": "[['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]"
      },
      {
        "name": "No anagrams",
        "setup": "",
        "expr": "group_anagrams(['abc', 'xyz'])",
        "expect": "[['abc'], ['xyz']]"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "group_anagrams([])",
        "expect": "[]"
      },
      {
        "name": "Repeated word",
        "setup": "",
        "expr": "group_anagrams(['ab', 'ba', 'ab'])",
        "expect": "[['ab', 'ab', 'ba']]"
      },
      {
        "name": "Single letters",
        "setup": "",
        "expr": "group_anagrams(['b', 'a', 'b'])",
        "expect": "[['a'], ['b', 'b']]"
      },
      {
        "name": "Same letters, different counts",
        "setup": "",
        "expr": "group_anagrams(['aab', 'aba', 'abb'])",
        "expect": "[['aab', 'aba'], ['abb']]"
      }
    ],
    "approach": [
      "Anagrams have the same letters once sorted, so the sorted word is a perfect dictionary key.",
      "Collect words under their key, then sort each group and sort the list of groups for the required output."
    ],
    "walkthrough": [
      "`key = \"\".join(sorted(w))`: sorted('tea') is ['a', 'e', 't'], joined to 'aet'.",
      "`groups.setdefault(key, []).append(w)`: start an empty list the first time a key appears.",
      "`sorted(sorted(g) for g in groups.values())`: sort inside each group, then sort the groups (lists compare by their first item)."
    ],
    "mistakes": [
      "Using a set for each group, which loses the repeated 'ab'.",
      "Using sorted(w) itself as the key: lists can't be dictionary keys, so join it or use a tuple.",
      "Forgetting the final sorting, so groups come out in a different order."
    ]
  },
  {
    "id": "algo-top-k",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Arrays and hashing",
    "title": "Top k merchants",
    "prompt": [
      "Given a list of merchant names (one per transaction) and `k`, return the `k` merchants with the most transactions, most first. Break ties alphabetically. If there are fewer than `k` merchants, return them all.",
      "",
      "```",
      "top_k(['cafe', 'gas', 'cafe', 'shop', 'gas', 'cafe'], 2)   # ['cafe', 'gas']",
      "```"
    ],
    "starter": [
      "def top_k(merchants, k):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def top_k(merchants, k):",
      "    counts = {}",
      "    for m in merchants:",
      "        counts[m] = counts.get(m, 0) + 1",
      "    ranked = sorted(counts, key=lambda m: (-counts[m], m))   # most first, then A to Z",
      "    return ranked[:k]",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "top_k(['cafe', 'gas', 'cafe', 'shop', 'gas', 'cafe'], 2)",
        "expect": "['cafe', 'gas']"
      },
      {
        "name": "Tie broken alphabetically",
        "setup": "",
        "expr": "top_k(['b', 'a', 'c', 'b', 'a'], 1)",
        "expect": "['a']"
      },
      {
        "name": "k bigger than the number of merchants",
        "setup": "",
        "expr": "top_k(['x', 'y'], 5)",
        "expect": "['x', 'y']"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "top_k([], 3)",
        "expect": "[]"
      },
      {
        "name": "All tied",
        "setup": "",
        "expr": "top_k(['d', 'c', 'b'], 2)",
        "expect": "['b', 'c']"
      },
      {
        "name": "k is 0",
        "setup": "",
        "expr": "top_k(['a', 'a'], 0)",
        "expect": "[]"
      }
    ],
    "approach": [
      "Count with a dictionary, then sort the merchants by (-count, name).",
      "For large inputs, heapq.nlargest or bucket sort get to O(n log k) or O(n), but sorting is fine for interviews unless asked."
    ],
    "walkthrough": [
      "`counts[m] = counts.get(m, 0) + 1`: one pass to count.",
      "`sorted(counts, key=lambda m: (-counts[m], m))`: -count puts the most frequent first; the name breaks ties A to Z.",
      "`ranked[:k]`: slicing past the end is safe, so k = 5 with 2 merchants returns both."
    ],
    "mistakes": [
      "Counter(merchants).most_common(k): ties come out in first-seen order, not alphabetically.",
      "sorted(..., reverse=True) on (count, name): also reverses the names in a tie.",
      "Returning (name, count) pairs instead of just names."
    ]
  },
  {
    "id": "algo-product-except-self",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Arrays and hashing",
    "title": "Product of everything else",
    "prompt": [
      "Given a list of growth factors `nums`, return a list where position `i` holds the product of every number except `nums[i]`. Don't use division (the list can contain 0). Aim for O(n).",
      "",
      "```",
      "product_except_self([1, 2, 3, 4])   # [24, 12, 8, 6]",
      "```"
    ],
    "starter": [
      "def product_except_self(nums):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def product_except_self(nums):",
      "    n = len(nums)",
      "    out = [1] * n",
      "    left = 1",
      "    for i in range(n):              # out[i] = product of everything to the left",
      "        out[i] = left",
      "        left *= nums[i]",
      "    right = 1",
      "    for i in range(n - 1, -1, -1):  # times everything to the right",
      "        out[i] *= right",
      "        right *= nums[i]",
      "    return out",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "product_except_self([1, 2, 3, 4])",
        "expect": "[24, 12, 8, 6]"
      },
      {
        "name": "One zero",
        "setup": "",
        "expr": "product_except_self([2, 0, 5])",
        "expect": "[0, 10, 0]"
      },
      {
        "name": "Two zeros",
        "setup": "",
        "expr": "product_except_self([0, 4, 0])",
        "expect": "[0, 0, 0]"
      },
      {
        "name": "Negative numbers",
        "setup": "",
        "expr": "product_except_self([-1, 2, -3])",
        "expect": "[-6, 3, -2]"
      },
      {
        "name": "Two items",
        "setup": "",
        "expr": "product_except_self([7, 3])",
        "expect": "[3, 7]"
      },
      {
        "name": "All ones",
        "setup": "",
        "expr": "product_except_self([1, 1, 1])",
        "expect": "[1, 1, 1]"
      }
    ],
    "approach": [
      "Everything except position i = (product of everything to its left) × (product of everything to its right).",
      "Fill the left products in one pass, then multiply in the right products in a second pass going backwards."
    ],
    "walkthrough": [
      "First loop: before multiplying in nums[i], `left` holds the product of nums[0..i-1], so out = [1, 1, 2, 6] for [1, 2, 3, 4].",
      "Second loop goes right to left: `right` holds the product of everything after i, so out[i] *= right gives [24, 12, 8, 6].",
      "No division, so zeros work: [2, 0, 5] gives [0, 10, 0]."
    ],
    "mistakes": [
      "Dividing the total product by nums[i]: crashes on 0 and the prompt forbids it.",
      "Nested loops multiplying everything else: O(n²).",
      "Updating left before storing it, which includes nums[i] in its own product."
    ]
  },
  {
    "id": "algo-valid-brackets",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Stack",
    "title": "Balanced brackets in a rule string",
    "prompt": [
      "Fraud rules are written with brackets: `()`, `[]` and `{}`. Return `True` if every bracket in `s` is closed by the right type in the right order, otherwise `False`. Other characters can be ignored. An empty string is balanced.",
      "",
      "```",
      "is_balanced('(amount > [5])')   # True",
      "is_balanced('([)]')             # False",
      "```"
    ],
    "starter": [
      "def is_balanced(s):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def is_balanced(s):",
      "    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}",
      "    stack = []",
      "    for ch in s:",
      "        if ch in \"([{\":",
      "            stack.append(ch)",
      "        elif ch in pairs:",
      "            if not stack or stack.pop() != pairs[ch]:",
      "                return False",
      "    return not stack            # anything left open is unbalanced",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "is_balanced('(amount > [5])')",
        "expect": "True"
      },
      {
        "name": "Crossed brackets",
        "setup": "",
        "expr": "is_balanced('([)]')",
        "expect": "False"
      },
      {
        "name": "Empty string",
        "setup": "",
        "expr": "is_balanced('')",
        "expect": "True"
      },
      {
        "name": "Left open",
        "setup": "",
        "expr": "is_balanced('((x)')",
        "expect": "False"
      },
      {
        "name": "Closing first",
        "setup": "",
        "expr": "is_balanced(')(')",
        "expect": "False"
      },
      {
        "name": "Nested types",
        "setup": "",
        "expr": "is_balanced('{[()()]}')",
        "expect": "True"
      }
    ],
    "approach": [
      "The most recently opened bracket must close first: that's a stack (last in, first out).",
      "Push openers; on a closer, pop and check it matches. At the end the stack must be empty."
    ],
    "walkthrough": [
      "`pairs` maps each closer to the opener it needs.",
      "`stack.append(ch)` for an opener.",
      "`if not stack or stack.pop() != pairs[ch]: return False`: a closer with nothing open, or the wrong type, fails right away.",
      "`return not stack`: '((x)' leaves one '(' open, so it's False."
    ],
    "mistakes": [
      "Only counting opens and closes: '([)]' has equal counts but is wrong.",
      "Popping from an empty list, which raises IndexError on ')('.",
      "Returning True at the end without checking the stack is empty."
    ]
  },
  {
    "id": "algo-max-profit",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Sliding window",
    "title": "Best day to buy and sell a stock",
    "prompt": [
      "`prices[i]` is a stock's price on day `i`. You may buy once and sell once later. Return the largest profit possible, or 0 if no profit is possible.",
      "",
      "```",
      "max_profit([7, 1, 5, 3, 6, 4])   # 5 (buy at 1, sell at 6)",
      "```"
    ],
    "starter": [
      "def max_profit(prices):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def max_profit(prices):",
      "    lowest = float(\"inf\")",
      "    best = 0",
      "    for p in prices:",
      "        lowest = min(lowest, p)          # cheapest buy so far",
      "        best = max(best, p - lowest)     # sell today?",
      "    return best",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "max_profit([7, 1, 5, 3, 6, 4])",
        "expect": "5"
      },
      {
        "name": "Prices only fall",
        "setup": "",
        "expr": "max_profit([7, 6, 4, 3, 1])",
        "expect": "0"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "max_profit([])",
        "expect": "0"
      },
      {
        "name": "One day",
        "setup": "",
        "expr": "max_profit([5])",
        "expect": "0"
      },
      {
        "name": "Low comes after the high",
        "setup": "",
        "expr": "max_profit([2, 9, 1, 3])",
        "expect": "7"
      },
      {
        "name": "Flat prices",
        "setup": "",
        "expr": "max_profit([3, 3, 3])",
        "expect": "0"
      }
    ],
    "approach": [
      "You can't sell before you buy, so keep the lowest price seen so far and ask on each day: what if I sold today?",
      "One pass, O(n). max(prices) - min(prices) is wrong when the low comes after the high."
    ],
    "walkthrough": [
      "`lowest = float(\"inf\")`: no price seen yet.",
      "`lowest = min(lowest, p)`: the best day to have bought, up to today.",
      "`best = max(best, p - lowest)`: the best profit if you sold today; starts at 0, so falling prices return 0."
    ],
    "mistakes": [
      "max(prices) - min(prices): for [2, 9, 1, 3] that gives 8, but you can't buy at 1 and sell at 9 earlier.",
      "Checking every pair of days: O(n²).",
      "Returning a negative number when prices only fall."
    ]
  },
  {
    "id": "algo-longest-unique-run",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Sliding window",
    "title": "Longest run with no repeated merchant",
    "prompt": [
      "`s` is a string where each character is one merchant code, in time order. Return the length of the longest stretch of consecutive characters with no repeats.",
      "",
      "```",
      "longest_unique('abcabcbb')   # 3 ('abc')",
      "```"
    ],
    "starter": [
      "def longest_unique(s):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def longest_unique(s):",
      "    last = {}          # character -> last position it appeared",
      "    start = 0          # left edge of the window",
      "    best = 0",
      "    for i, ch in enumerate(s):",
      "        if ch in last and last[ch] >= start:",
      "            start = last[ch] + 1          # jump past the earlier copy",
      "        last[ch] = i",
      "        best = max(best, i - start + 1)",
      "    return best",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "longest_unique('abcabcbb')",
        "expect": "3"
      },
      {
        "name": "All the same",
        "setup": "",
        "expr": "longest_unique('bbbb')",
        "expect": "1"
      },
      {
        "name": "Empty string",
        "setup": "",
        "expr": "longest_unique('')",
        "expect": "0"
      },
      {
        "name": "Repeat inside",
        "setup": "",
        "expr": "longest_unique('pwwkew')",
        "expect": "3"
      },
      {
        "name": "No repeats",
        "setup": "",
        "expr": "longest_unique('abcd')",
        "expect": "4"
      },
      {
        "name": "Old repeat outside the window",
        "setup": "",
        "expr": "longest_unique('abba')",
        "expect": "2"
      }
    ],
    "approach": [
      "Sliding window: keep a window [start, i] with no repeats. When a character repeats inside the window, move start just past its earlier position.",
      "Track each character's last position in a dictionary. Each character is visited once: O(n)."
    ],
    "walkthrough": [
      "`last[ch] >= start`: the repeat only matters if the earlier copy is inside the current window ('abba': the first a is outside by the time the second a arrives).",
      "`start = last[ch] + 1`: shrink the window to drop the earlier copy.",
      "`best = max(best, i - start + 1)`: the window's length."
    ],
    "mistakes": [
      "Moving start back to an old position: without the >= start check, 'abba' gives 3 instead of 2.",
      "Checking every substring: O(n²) or worse.",
      "Returning the substring instead of its length."
    ]
  },
  {
    "id": "algo-binary-search",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Binary search",
    "title": "Find an account in a sorted list",
    "prompt": [
      "`ids` is sorted in increasing order with no repeats. Return the position of `target`, or `-1` if it isn't there. Use binary search (O(log n)), not a scan.",
      "",
      "```",
      "find_id([3, 8, 12, 20, 31], 20)   # 3",
      "```"
    ],
    "starter": [
      "def find_id(ids, target):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def find_id(ids, target):",
      "    lo, hi = 0, len(ids) - 1",
      "    while lo <= hi:",
      "        mid = (lo + hi) // 2",
      "        if ids[mid] == target:",
      "            return mid",
      "        if ids[mid] < target:",
      "            lo = mid + 1          # target is to the right",
      "        else:",
      "            hi = mid - 1          # target is to the left",
      "    return -1",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "find_id([3, 8, 12, 20, 31], 20)",
        "expect": "3"
      },
      {
        "name": "Not there",
        "setup": "",
        "expr": "find_id([3, 8, 12], 5)",
        "expect": "-1"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "find_id([], 4)",
        "expect": "-1"
      },
      {
        "name": "First item",
        "setup": "",
        "expr": "find_id([1, 2, 3], 1)",
        "expect": "0"
      },
      {
        "name": "Last item",
        "setup": "",
        "expr": "find_id([1, 2, 3], 3)",
        "expect": "2"
      },
      {
        "name": "Bigger than everything",
        "setup": "",
        "expr": "find_id([10, 20], 99)",
        "expect": "-1"
      }
    ],
    "approach": [
      "Look at the middle. If it's too small, the answer can only be to the right; too big, only to the left. Halve the range each step.",
      "Loop while lo <= hi, and always move past mid (mid + 1 or mid - 1) so the loop ends."
    ],
    "walkthrough": [
      "`lo, hi = 0, len(ids) - 1`: the whole list.",
      "`mid = (lo + hi) // 2`: the middle position.",
      "`lo = mid + 1` or `hi = mid - 1`: drop the half that can't contain the target.",
      "`return -1`: the range became empty."
    ],
    "mistakes": [
      "while lo < hi: misses a target in the last remaining spot.",
      "lo = mid (not mid + 1): can loop forever.",
      "Using target in ids or ids.index(target): correct but O(n), and index raises an error when it's missing."
    ]
  },
  {
    "id": "algo-merge-intervals",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Intervals",
    "title": "Merge overlapping maintenance windows",
    "prompt": [
      "Each window is `[start, end]`. Merge every set of overlapping windows (touching counts: `[1, 3]` and `[3, 5]` merge) and return the merged windows sorted by start. The input may be unsorted.",
      "",
      "```",
      "merge([[8, 10], [1, 3], [2, 6]])   # [[1, 6], [8, 10]]",
      "```"
    ],
    "starter": [
      "def merge(windows):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def merge(windows):",
      "    out = []",
      "    for start, end in sorted(windows):",
      "        if out and start <= out[-1][1]:         # overlaps the last merged window",
      "            out[-1][1] = max(out[-1][1], end)",
      "        else:",
      "            out.append([start, end])",
      "    return out",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "merge([[8, 10], [1, 3], [2, 6]])",
        "expect": "[[1, 6], [8, 10]]"
      },
      {
        "name": "Touching windows merge",
        "setup": "",
        "expr": "merge([[1, 3], [3, 5]])",
        "expect": "[[1, 5]]"
      },
      {
        "name": "One inside another",
        "setup": "",
        "expr": "merge([[1, 10], [2, 3]])",
        "expect": "[[1, 10]]"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "merge([])",
        "expect": "[]"
      },
      {
        "name": "No overlaps",
        "setup": "",
        "expr": "merge([[5, 6], [1, 2]])",
        "expect": "[[1, 2], [5, 6]]"
      },
      {
        "name": "Chain of overlaps",
        "setup": "",
        "expr": "merge([[1, 4], [4, 7], [6, 9], [11, 12]])",
        "expect": "[[1, 9], [11, 12]]"
      }
    ],
    "approach": [
      "Sort by start first. Then each window either overlaps the last merged one (extend it) or starts a new one.",
      "O(n log n) for the sort."
    ],
    "walkthrough": [
      "`sorted(windows)`: sorts by start (then end).",
      "`start <= out[-1][1]`: overlaps or touches the last merged window.",
      "`out[-1][1] = max(out[-1][1], end)`: max matters when one window is inside another ([1, 10] and [2, 3]).",
      "Otherwise `out.append([start, end])` starts a new merged window."
    ],
    "mistakes": [
      "Forgetting to sort, so [8, 10] is compared with [1, 3] first.",
      "Using < instead of <=, so touching windows stay separate.",
      "Setting the end to the new window's end instead of the max, which shrinks [1, 10] to [1, 3]."
    ]
  },
  {
    "id": "algo-two-sum-sorted",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Two pointers",
    "title": "Pair in a sorted list",
    "prompt": [
      "`amounts` is sorted in increasing order. Return the positions `(i, j)`, with `i < j`, of two amounts that add up to `target`, or `None` if there is no such pair. Use O(1) extra space (no dictionary).",
      "",
      "```",
      "pair_sum_sorted([1, 3, 4, 6, 9], 10)   # (0, 4)  because 1 + 9 = 10",
      "```"
    ],
    "starter": [
      "def pair_sum_sorted(amounts, target):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def pair_sum_sorted(amounts, target):",
      "    i, j = 0, len(amounts) - 1",
      "    while i < j:",
      "        total = amounts[i] + amounts[j]",
      "        if total == target:",
      "            return (i, j)",
      "        if total < target:",
      "            i += 1          # need a bigger sum",
      "        else:",
      "            j -= 1          # need a smaller sum",
      "    return None",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "pair_sum_sorted([1, 3, 4, 6, 9], 10)",
        "expect": "(0, 4)"
      },
      {
        "name": "No pair",
        "setup": "",
        "expr": "(pair_sum_sorted([1, 2, 3], 10), pair_sum_sorted([1, 2, 3], 5))",
        "expect": "(None, (1, 2))"
      },
      {
        "name": "Empty list",
        "setup": "",
        "expr": "(pair_sum_sorted([], 5), pair_sum_sorted([2, 3], 5))",
        "expect": "(None, (0, 1))"
      },
      {
        "name": "Pair in the middle",
        "setup": "",
        "expr": "pair_sum_sorted([1, 4, 5, 11], 9)",
        "expect": "(1, 2)"
      },
      {
        "name": "Negative numbers",
        "setup": "",
        "expr": "pair_sum_sorted([-4, -1, 2, 7], 3)",
        "expect": "(0, 3)"
      },
      {
        "name": "Can't reuse one item",
        "setup": "",
        "expr": "(pair_sum_sorted([5, 6], 10), pair_sum_sorted([5, 5], 10))",
        "expect": "(None, (0, 1))"
      }
    ],
    "approach": [
      "Two pointers: one at each end. Too small a sum means move the left pointer right; too big means move the right pointer left.",
      "Works only because the list is sorted. O(n) time, O(1) space."
    ],
    "walkthrough": [
      "`i, j = 0, len(amounts) - 1`: smallest and largest.",
      "`if total < target: i += 1`: the only way to grow the sum.",
      "`else: j -= 1`: the only way to shrink it.",
      "`while i < j`: stop before the pointers meet, so one item is never used twice."
    ],
    "mistakes": [
      "while i <= j: lets [5, 6] with target 10 use 5 twice.",
      "Using a dictionary, which the prompt rules out here.",
      "Moving both pointers at once and skipping the answer."
    ]
  },
  {
    "id": "algo-best-run",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Greedy",
    "title": "Best stretch of daily net cash flow",
    "prompt": [
      "`flows[i]` is a branch's net cash flow on day `i` (can be negative). Return the largest total of any run of consecutive days (at least one day).",
      "",
      "```",
      "best_run([-2, 1, -3, 4, -1, 2, 1, -5, 4])   # 6 (4 - 1 + 2 + 1)",
      "```"
    ],
    "starter": [
      "def best_run(flows):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def best_run(flows):",
      "    best = current = flows[0]",
      "    for x in flows[1:]:",
      "        current = max(x, current + x)    # extend the run, or start over here",
      "        best = max(best, current)",
      "    return best",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "best_run([-2, 1, -3, 4, -1, 2, 1, -5, 4])",
        "expect": "6"
      },
      {
        "name": "All negative",
        "setup": "",
        "expr": "best_run([-3, -1, -2])",
        "expect": "-1"
      },
      {
        "name": "One day",
        "setup": "",
        "expr": "best_run([5])",
        "expect": "5"
      },
      {
        "name": "All positive",
        "setup": "",
        "expr": "best_run([1, 2, 3])",
        "expect": "6"
      },
      {
        "name": "Start over after a big loss",
        "setup": "",
        "expr": "best_run([2, -10, 3, 4])",
        "expect": "7"
      },
      {
        "name": "Zeros",
        "setup": "",
        "expr": "best_run([0, -1, 0])",
        "expect": "0"
      }
    ],
    "approach": [
      "Kadane's algorithm: at each day, either extend the current run or start a new run at today, whichever is bigger.",
      "Keep the best total seen. O(n). Start from the first value (not 0) so all-negative lists return the least negative day."
    ],
    "walkthrough": [
      "`best = current = flows[0]`: a run must include at least one day.",
      "`current = max(x, current + x)`: if the run so far is dragging you down, drop it and start at x.",
      "`best = max(best, current)`: remember the best run ending anywhere."
    ],
    "mistakes": [
      "Starting best at 0: [-3, -1, -2] would return 0, but the answer must be a real run (-1).",
      "Checking every start and end: O(n²).",
      "Resetting current to 0 instead of to x."
    ]
  },
  {
    "id": "algo-tree-max-depth",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Trees",
    "title": "Deepest level of an account hierarchy",
    "prompt": [
      "A corporate client's accounts form a binary tree: each account can have up to two sub-accounts. Given the `root` account, return how many levels the hierarchy has (the number of accounts on the longest path from the root down to a leaf). An empty hierarchy (`root` is `None`) has 0 levels.",
      "",
      "The `TreeNode` class and a `build(values)` helper are provided. `build` takes a level-order list with `None` for missing children, so `build([3, 9, 20, None, None, 15, 7])` is the tree drawn below.",
      "",
      "```",
      "#      3",
      "#     / \\",
      "#    9   20",
      "#       /  \\",
      "#      15   7",
      "max_depth(build([3, 9, 20, None, None, 15, 7]))   # 3",
      "```"
    ],
    "starter": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def max_depth(root):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def max_depth(root):",
      "    if root is None:                  # an empty subtree adds no levels",
      "        return 0",
      "    return 1 + max(max_depth(root.left), max_depth(root.right))",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "root = build([3, 9, 20, None, None, 15, 7])",
        "expr": "max_depth(root)",
        "expect": "3"
      },
      {
        "name": "Empty hierarchy",
        "setup": "root = build([])",
        "expr": "max_depth(root)",
        "expect": "0"
      },
      {
        "name": "Single account",
        "setup": "root = build([42])",
        "expr": "max_depth(root)",
        "expect": "1"
      },
      {
        "name": "Left-leaning chain",
        "setup": "root = build([1, 2, None, 3, None, 4])",
        "expr": "max_depth(root)",
        "expect": "4"
      },
      {
        "name": "Right-leaning chain",
        "setup": "root = build([1, None, 2, None, 3])",
        "expr": "max_depth(root)",
        "expect": "3"
      },
      {
        "name": "Full tree",
        "setup": "root = build([1, 2, 3, 4, 5, 6, 7])",
        "expr": "max_depth(root)",
        "expect": "3"
      }
    ],
    "approach": [
      "Think recursively: the depth of a tree is 1 (this node) plus the deeper of its two subtrees.",
      "The base case is an empty subtree, which has depth 0. That also handles an empty hierarchy.",
      "Every node is visited once, so it runs in O(n) time with O(h) stack space, where h is the height.",
      "A level-order (BFS) version that counts levels works too and avoids deep recursion on very tall trees."
    ],
    "walkthrough": [
      "`if root is None: return 0`: the base case. Leaves call this on both missing children and get 0 back.",
      "`max_depth(root.left), max_depth(root.right)`: solve the same problem on each sub-hierarchy.",
      "`1 + max(...)`: count this account, then add the deeper side."
    ],
    "mistakes": [
      "Returning 1 for an empty tree, or forgetting the None check and hitting AttributeError on None.left.",
      "Counting edges instead of nodes, which gives 2 instead of 3 for the example.",
      "Only following the left child, which fails on right-leaning trees.",
      "Adding the two sides (left + right) instead of taking the max."
    ]
  },
  {
    "id": "algo-tree-symmetric",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Trees",
    "title": "Mirror-image branch org chart",
    "prompt": [
      "Regional managers want to know if the branch org chart is balanced in a very strict sense: the left half must be a mirror image of the right half, with matching values. Given the `root` of the binary tree, return `True` if it is symmetric around its center, otherwise `False`. An empty chart and a single node are both symmetric.",
      "",
      "The `TreeNode` class and a `build(values)` helper are provided. `build` takes a level-order list with `None` for missing children, so `build([1, 2, 2, 3, 4, 4, 3])` is the tree drawn below.",
      "",
      "```",
      "#        1",
      "#      /   \\",
      "#     2     2",
      "#    / \\   / \\",
      "#   3   4 4   3",
      "is_symmetric(build([1, 2, 2, 3, 4, 4, 3]))         # True",
      "is_symmetric(build([1, 2, 2, None, 3, None, 3]))   # False",
      "```"
    ],
    "starter": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def is_symmetric(root):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def is_symmetric(root):",
      "    def mirror(a, b):",
      "        if a is None and b is None:      # both sides end here",
      "            return True",
      "        if a is None or b is None:       # only one side ends",
      "            return False",
      "        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)",
      "",
      "    return root is None or mirror(root.left, root.right)",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "root = build([1, 2, 2, 3, 4, 4, 3])",
        "expr": "is_symmetric(root)",
        "expect": "True"
      },
      {
        "name": "Same values, wrong shape",
        "setup": "root = build([1, 2, 2, None, 3, None, 3])",
        "expr": "is_symmetric(root)",
        "expect": "False"
      },
      {
        "name": "Empty chart",
        "setup": "root = build([])",
        "expr": "is_symmetric(root)",
        "expect": "True"
      },
      {
        "name": "Single branch",
        "setup": "root = build([7])",
        "expr": "is_symmetric(root)",
        "expect": "True"
      },
      {
        "name": "Outer children only",
        "setup": "root = build([1, 2, 2, 3, None, None, 3])",
        "expr": "is_symmetric(root)",
        "expect": "True"
      },
      {
        "name": "Values differ",
        "setup": "root = build([1, 2, 3])",
        "expr": "is_symmetric(root)",
        "expect": "False"
      }
    ],
    "approach": [
      "Compare two subtrees at once: the left subtree must be the mirror of the right subtree.",
      "Two trees are mirrors when their roots match, the outer pair (a.left, b.right) are mirrors, and the inner pair (a.right, b.left) are mirrors.",
      "Each node is compared once, so it runs in O(n) time and O(h) recursion space."
    ],
    "walkthrough": [
      "`def mirror(a, b)`: a helper that walks two subtrees in opposite directions at the same time.",
      "`if a is None and b is None: return True`: both sides ran out together, which is fine.",
      "`if a is None or b is None: return False`: one side has a node the other lacks, so the shapes differ.",
      "`mirror(a.left, b.right) and mirror(a.right, b.left)`: outer with outer, inner with inner.",
      "`root is None or mirror(root.left, root.right)`: an empty chart is symmetric; otherwise compare the two halves."
    ],
    "mistakes": [
      "Comparing a.left with b.left (checking for identical halves instead of mirrored ones).",
      "Comparing only the level-order values, which misses shape differences like [1, 2, 2, None, 3, None, 3].",
      "Checking that each node's two children are equal, which is a local check and misses deeper mismatches.",
      "Crashing on an empty tree by reading root.left before checking for None."
    ]
  },
  {
    "id": "algo-installment-ways",
    "section": "algo",
    "type": "python",
    "difficulty": "Easy",
    "topic": "Dynamic programming",
    "title": "Ways to pay in $1 and $2 installments",
    "prompt": [
      "A customer owes `n` dollars and pays it off in installments of either $1 or $2. Order matters: paying $1 then $2 is different from $2 then $1. Return how many different payment sequences pay off exactly `n` dollars.",
      "",
      "- `n` is a whole number from 0 to 45.",
      "- When `n` is 0 there is exactly one way: make no payments.",
      "",
      "```",
      "count_ways(3)   # 3  ($1+$1+$1, $1+$2, $2+$1)",
      "```"
    ],
    "starter": [
      "def count_ways(n):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def count_ways(n):",
      "    a, b = 1, 1               # ways to pay 0 dollars, ways to pay 1 dollar",
      "    for _ in range(n):",
      "        a, b = b, a + b       # slide forward one dollar",
      "    return a",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "count_ways(3)",
        "expect": "3"
      },
      {
        "name": "One dollar",
        "setup": "",
        "expr": "count_ways(1)",
        "expect": "1"
      },
      {
        "name": "Two dollars",
        "setup": "",
        "expr": "count_ways(2)",
        "expect": "2"
      },
      {
        "name": "Zero dollars",
        "setup": "",
        "expr": "count_ways(0)",
        "expect": "1"
      },
      {
        "name": "Five dollars",
        "setup": "",
        "expr": "count_ways(5)",
        "expect": "8"
      },
      {
        "name": "Large balance",
        "setup": "",
        "expr": "count_ways(40)",
        "expect": "165580141"
      }
    ],
    "approach": [
      "Look at the last payment: it was either $1 (leaving n - 1 to pay before it) or $2 (leaving n - 2). So ways(n) = ways(n - 1) + ways(n - 2).",
      "That is the Fibonacci recurrence. Build it up from the bottom with two variables: O(n) time and O(1) space.",
      "Plain recursion without memoization recomputes the same values and takes O(2^n) time, which is far too slow for n = 40."
    ],
    "walkthrough": [
      "`a, b = 1, 1`: ways(0) = 1 and ways(1) = 1 are the starting values.",
      "`for _ in range(n)`: each step moves the window one dollar forward.",
      "`a, b = b, a + b`: the new count is the sum of the previous two; tuple assignment updates both at once.",
      "`return a`: after n steps, a holds ways(n). For n = 0 the loop never runs and the answer is 1."
    ],
    "mistakes": [
      "Plain recursion with no cache, which times out on n = 40.",
      "Returning 0 for n = 0 instead of 1.",
      "Counting combinations instead of ordered sequences (treating $1+$2 and $2+$1 as the same).",
      "Updating a and b on separate lines so the second update uses the already-changed value."
    ]
  },
  {
    "id": "algo-tree-level-order",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Trees",
    "title": "Account hierarchy level by level",
    "prompt": [
      "Compliance wants the account hierarchy printed one level at a time. Given the `root` of the binary tree, return a list of levels, top to bottom, where each level is a list of account values from left to right. An empty tree returns `[]`.",
      "",
      "The `TreeNode` class and a `build(values)` helper are provided. `build` takes a level-order list with `None` for missing children, so `build([3, 9, 20, None, None, 15, 7])` is the tree drawn below.",
      "",
      "```",
      "#      3",
      "#     / \\",
      "#    9   20",
      "#       /  \\",
      "#      15   7",
      "level_order(build([3, 9, 20, None, None, 15, 7]))   # [[3], [9, 20], [15, 7]]",
      "```"
    ],
    "starter": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def level_order(root):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "from collections import deque",
      "",
      "",
      "def level_order(root):",
      "    if root is None:",
      "        return []",
      "    levels = []",
      "    queue = deque([root])",
      "    while queue:",
      "        level = []",
      "        for _ in range(len(queue)):      # exactly the nodes on this level",
      "            node = queue.popleft()",
      "            level.append(node.val)",
      "            if node.left:",
      "                queue.append(node.left)",
      "            if node.right:",
      "                queue.append(node.right)",
      "        levels.append(level)",
      "    return levels",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "root = build([3, 9, 20, None, None, 15, 7])",
        "expr": "level_order(root)",
        "expect": "[[3], [9, 20], [15, 7]]"
      },
      {
        "name": "Empty tree",
        "setup": "root = build([])",
        "expr": "level_order(root)",
        "expect": "[]"
      },
      {
        "name": "Single account",
        "setup": "root = build([5])",
        "expr": "level_order(root)",
        "expect": "[[5]]"
      },
      {
        "name": "Right-leaning chain",
        "setup": "root = build([1, None, 2, None, 3])",
        "expr": "level_order(root)",
        "expect": "[[1], [2], [3]]"
      },
      {
        "name": "Full tree",
        "setup": "root = build([1, 2, 3, 4, 5, 6, 7])",
        "expr": "level_order(root)",
        "expect": "[[1], [2, 3], [4, 5, 6, 7]]"
      },
      {
        "name": "Gaps in the middle",
        "setup": "root = build([1, 2, 3, 4, None, None, 5])",
        "expr": "level_order(root)",
        "expect": "[[1], [2, 3], [4, 5]]"
      }
    ],
    "approach": [
      "Level by level means breadth-first search with a queue.",
      "The trick is grouping: at the start of each round, the queue holds exactly one full level, so process len(queue) nodes and collect them into one list.",
      "Each node is enqueued and dequeued once: O(n) time and O(w) extra space, where w is the widest level."
    ],
    "walkthrough": [
      "`queue = deque([root])`: deque.popleft() is O(1); list.pop(0) is O(n).",
      "`for _ in range(len(queue))`: len is read once, before children are added, so this loop covers only the current level.",
      "`if node.left: queue.append(node.left)`: children go to the back of the queue and become the next level.",
      "`levels.append(level)`: one inner list per level, in top-to-bottom order."
    ],
    "mistakes": [
      "Returning one flat list instead of a list per level.",
      "Using a stack (DFS order) and getting the values in the wrong order.",
      "Re-checking len(queue) on every iteration, which mixes the next level into the current one.",
      "Returning [[]] or [None] for an empty tree instead of [].",
      "Appending None children to the queue and then crashing on None.val."
    ]
  },
  {
    "id": "algo-bst-common-parent",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Trees",
    "title": "Closest shared parent account in a BST",
    "prompt": [
      "Account numbers are stored in a binary search tree: every number in a node's left subtree is smaller than the node, and every number in its right subtree is larger. Given the `root` and two account numbers `p` and `q` that are both in the tree, return the **value** of their lowest common ancestor: the deepest node that has both accounts in its subtree. A node counts as an ancestor of itself.",
      "",
      "The `TreeNode` class and a `build(values)` helper are provided. `build` takes a level-order list with `None` for missing children, so `build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])` is the tree drawn below.",
      "",
      "- Aim for O(h) time, where h is the height, by using the BST ordering instead of searching the whole tree.",
      "",
      "```",
      "#          6",
      "#        /   \\",
      "#       2     8",
      "#      / \\   / \\",
      "#     0   4 7   9",
      "#        / \\",
      "#       3   5",
      "common_parent(build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]), 2, 8)   # 6",
      "common_parent(build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]), 2, 4)   # 2",
      "```"
    ],
    "starter": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def common_parent(root, p, q):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "class TreeNode:",
      "    def __init__(self, val, left=None, right=None):",
      "        self.val = val",
      "        self.left = left",
      "        self.right = right",
      "",
      "",
      "def build(values):",
      "    # Builds a tree from a level-order list; None marks a missing child",
      "    if not values or values[0] is None:",
      "        return None",
      "    root = TreeNode(values[0])",
      "    queue = [root]",
      "    i = 1",
      "    for node in queue:",
      "        if i >= len(values):",
      "            break",
      "        if values[i] is not None:",
      "            node.left = TreeNode(values[i])",
      "            queue.append(node.left)",
      "        i += 1",
      "        if i < len(values) and values[i] is not None:",
      "            node.right = TreeNode(values[i])",
      "            queue.append(node.right)",
      "        i += 1",
      "    return root",
      "",
      "",
      "def common_parent(root, p, q):",
      "    node = root",
      "    while node:",
      "        if p < node.val and q < node.val:     # both accounts are on the left",
      "            node = node.left",
      "        elif p > node.val and q > node.val:   # both are on the right",
      "            node = node.right",
      "        else:                                 # they split here, or one of them is this node",
      "            return node.val",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "root = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])",
        "expr": "common_parent(root, 2, 8)",
        "expect": "6"
      },
      {
        "name": "One is the ancestor of the other",
        "setup": "root = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])",
        "expr": "common_parent(root, 2, 4)",
        "expect": "2"
      },
      {
        "name": "Deep split",
        "setup": "root = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])",
        "expr": "common_parent(root, 3, 5)",
        "expect": "4"
      },
      {
        "name": "Order of p and q does not matter",
        "setup": "root = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])",
        "expr": "common_parent(root, 9, 7)",
        "expect": "8"
      },
      {
        "name": "Same account twice",
        "setup": "root = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])",
        "expr": "common_parent(root, 4, 4)",
        "expect": "4"
      },
      {
        "name": "Single-node tree",
        "setup": "root = build([5])",
        "expr": "common_parent(root, 5, 5)",
        "expect": "5"
      }
    ],
    "approach": [
      "Use the BST ordering. Starting at the root: if both numbers are smaller, the answer is in the left subtree; if both are larger, it's in the right subtree.",
      "Otherwise they split at this node (or one of them is this node), so this node is the answer.",
      "Only one path from the root is followed: O(h) time and O(1) extra space with a loop. That is O(log n) on a balanced tree and O(n) on a chain."
    ],
    "walkthrough": [
      "`while node:`: walk down one path; the loop always returns because p and q are in the tree.",
      "`if p < node.val and q < node.val: node = node.left`: both accounts are smaller, so the split point is further left.",
      "`elif p > node.val and q > node.val: node = node.right`: both are larger, so go right.",
      "`else: return node.val`: one goes left and one goes right, or one equals this node. Either way this is the deepest shared ancestor."
    ],
    "mistakes": [
      "Returning the node object instead of its value.",
      "Using strict comparisons in the wrong place so that p == node.val keeps walking past the answer.",
      "Ignoring the BST property and searching the whole tree, which is O(n) and misses the point of the question.",
      "Assuming p < q; the caller may pass them in either order."
    ]
  },
  {
    "id": "algo-fraud-rings",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Graphs",
    "title": "Count fraud rings on a transaction grid",
    "prompt": [
      "A fraud analyst lays out activity on a grid: `1` marks a flagged cell and `0` a clean one. Flagged cells that touch up, down, left, or right belong to the same fraud ring (diagonal does not count). Return the number of separate rings.",
      "",
      "- `grid` is a list of equal-length rows. An empty grid has 0 rings.",
      "- Don't change the caller's grid.",
      "",
      "```",
      "count_rings([[1, 1, 0, 0],",
      "             [1, 0, 0, 1],",
      "             [0, 0, 1, 1],",
      "             [1, 0, 0, 0]])   # 3",
      "```"
    ],
    "starter": [
      "def count_rings(grid):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def count_rings(grid):",
      "    if not grid:",
      "        return 0",
      "    rows, cols = len(grid), len(grid[0])",
      "    seen = set()",
      "    rings = 0",
      "    for r in range(rows):",
      "        for c in range(cols):",
      "            if grid[r][c] == 1 and (r, c) not in seen:",
      "                rings += 1                     # a new ring starts here",
      "                seen.add((r, c))",
      "                stack = [(r, c)]",
      "                while stack:                   # flood fill the whole ring",
      "                    i, j = stack.pop()",
      "                    for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):",
      "                        if 0 <= ni < rows and 0 <= nj < cols and grid[ni][nj] == 1 and (ni, nj) not in seen:",
      "                            seen.add((ni, nj))",
      "                            stack.append((ni, nj))",
      "    return rings",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "count_rings([[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 0, 0, 0]])",
        "expect": "3"
      },
      {
        "name": "Empty grid",
        "setup": "",
        "expr": "count_rings([])",
        "expect": "0"
      },
      {
        "name": "All clean",
        "setup": "",
        "expr": "count_rings([[0, 0], [0, 0]])",
        "expect": "0"
      },
      {
        "name": "All flagged",
        "setup": "",
        "expr": "count_rings([[1, 1, 1], [1, 1, 1]])",
        "expect": "1"
      },
      {
        "name": "Diagonal does not connect",
        "setup": "",
        "expr": "count_rings([[1, 0, 1], [0, 1, 0], [1, 0, 1]])",
        "expect": "5"
      },
      {
        "name": "Winding ring",
        "setup": "",
        "expr": "count_rings([[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0]])",
        "expect": "1"
      }
    ],
    "approach": [
      "Treat each flagged cell as a graph node with edges to its four neighbors. Each ring is a connected component.",
      "Scan every cell. When you hit a flagged cell you haven't visited, count a new ring and flood fill (DFS or BFS) to mark the whole ring as visited.",
      "Every cell is visited a constant number of times: O(rows x cols) time and O(rows x cols) space for the visited set.",
      "Use an explicit stack or a deque instead of recursion so a huge ring can't hit Python's recursion limit."
    ],
    "walkthrough": [
      "`if not grid: return 0`: guard the empty grid before reading grid[0].",
      "`seen = set()`: tracks visited cells so the caller's grid is left alone.",
      "`if grid[r][c] == 1 and (r, c) not in seen: rings += 1`: an unvisited flagged cell must start a new ring.",
      "`seen.add((r, c))`: mark a cell when it is pushed, not when it is popped, which stops the same cell from being pushed twice.",
      "`for ni, nj in ((i + 1, j), ...)`: only the four straight neighbors; diagonals are not connected.",
      "`0 <= ni < rows and 0 <= nj < cols`: bounds check first so negative indexes don't wrap around to the other side."
    ],
    "mistakes": [
      "Counting flagged cells instead of rings.",
      "Including diagonal neighbors, which gives 1 instead of 5 on the checkerboard test.",
      "Forgetting the bounds check: grid[-1] silently reads the last row in Python instead of raising an error.",
      "Overwriting 1s with 0s in the input grid when the prompt says not to change it.",
      "Reading grid[0] on an empty grid and raising IndexError."
    ]
  },
  {
    "id": "algo-loan-steps-order",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Graphs",
    "title": "Can every loan approval step finish",
    "prompt": [
      "A loan approval process has `n` steps numbered `0` to `n - 1`. Each pair `[step, before]` in `prereqs` means `before` must be finished before `step` can start. Return `True` if there is some order that finishes every step, or `False` if the rules contain a cycle that makes that impossible.",
      "",
      "- A step that requires itself (`[2, 2]`) can never finish.",
      "- `n` is at least 1, and `prereqs` may be empty.",
      "",
      "```",
      "can_finish(2, [[1, 0]])           # True   (do 0, then 1)",
      "can_finish(2, [[1, 0], [0, 1]])   # False  (each waits on the other)",
      "```"
    ],
    "starter": [
      "def can_finish(n, prereqs):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "from collections import deque",
      "",
      "",
      "def can_finish(n, prereqs):",
      "    unlocks = [[] for _ in range(n)]   # before -> steps it unlocks",
      "    waiting = [0] * n                  # how many prerequisites each step still has",
      "    for step, before in prereqs:",
      "        unlocks[before].append(step)",
      "        waiting[step] += 1",
      "    ready = deque(i for i in range(n) if waiting[i] == 0)",
      "    done = 0",
      "    while ready:",
      "        cur = ready.popleft()",
      "        done += 1",
      "        for nxt in unlocks[cur]:",
      "            waiting[nxt] -= 1",
      "            if waiting[nxt] == 0:",
      "                ready.append(nxt)",
      "    return done == n                   # anything left over is stuck in a cycle",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "can_finish(2, [[1, 0]])",
        "expect": "True"
      },
      {
        "name": "Two steps waiting on each other",
        "setup": "",
        "expr": "can_finish(2, [[1, 0], [0, 1]])",
        "expect": "False"
      },
      {
        "name": "No prerequisites",
        "setup": "",
        "expr": "can_finish(3, [])",
        "expect": "True"
      },
      {
        "name": "Step requires itself",
        "setup": "",
        "expr": "can_finish(3, [[2, 2]])",
        "expect": "False"
      },
      {
        "name": "Longer cycle",
        "setup": "",
        "expr": "can_finish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])",
        "expect": "False"
      },
      {
        "name": "Diamond with shared prerequisite",
        "setup": "",
        "expr": "can_finish(4, [[1, 0], [2, 0], [3, 1], [3, 2]])",
        "expect": "True"
      }
    ],
    "approach": [
      "This is cycle detection in a directed graph: an edge before -> step for every rule. All steps can finish exactly when the graph has no cycle.",
      "Kahn's algorithm (topological sort): repeatedly take a step with no unfinished prerequisites, finish it, and lower the count for every step it unlocks. If you finish all n steps, there is no cycle.",
      "Each step and rule is processed once: O(n + e) time and space, where e is the number of rules.",
      "A DFS with three colors (unvisited, in progress, done) also works: reaching an in-progress step means a cycle."
    ],
    "walkthrough": [
      "`unlocks[before].append(step)`: build the adjacency list in the direction work flows.",
      "`waiting[step] += 1`: the in-degree, or how many steps must finish first.",
      "`ready = deque(i for i in range(n) if waiting[i] == 0)`: steps with no prerequisites can start right away.",
      "`waiting[nxt] -= 1; if waiting[nxt] == 0: ready.append(nxt)`: finishing a step may free the steps it unlocks.",
      "`return done == n`: steps in a cycle never reach 0, so they are never counted."
    ],
    "mistakes": [
      "Reversing the pair and building edges step -> before, then reading the counts the wrong way round.",
      "Only checking for direct two-step cycles like [1, 0] and [0, 1] and missing longer ones.",
      "A DFS with a single visited set, which wrongly flags the diamond (two paths into step 3) as a cycle.",
      "Forgetting self-loops like [2, 2]."
    ]
  },
  {
    "id": "algo-atm-fewest-bills",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Dynamic programming",
    "title": "Fewest bills for an ATM payout",
    "prompt": [
      "An ATM holds unlimited bills of each value in `bills`. Return the fewest bills that add up to exactly `amount`. If it can't be done, return `-1`. An amount of 0 needs 0 bills.",
      "",
      "- Grabbing the largest bill first does not always give the fewest bills.",
      "",
      "```",
      "fewest_bills([1, 2, 5], 11)   # 3  (5 + 5 + 1)",
      "fewest_bills([1, 3, 4], 6)    # 2  (3 + 3), not 4 + 1 + 1",
      "```"
    ],
    "starter": [
      "def fewest_bills(bills, amount):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def fewest_bills(bills, amount):",
      "    impossible = amount + 1                    # more bills than could ever be needed",
      "    best = [0] + [impossible] * amount         # best[a] = fewest bills for a",
      "    for a in range(1, amount + 1):",
      "        for b in bills:",
      "            if b <= a and best[a - b] + 1 < best[a]:",
      "                best[a] = best[a - b] + 1",
      "    return best[amount] if best[amount] != impossible else -1",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "fewest_bills([1, 2, 5], 11)",
        "expect": "3"
      },
      {
        "name": "Greedy is wrong",
        "setup": "",
        "expr": "fewest_bills([1, 3, 4], 6)",
        "expect": "2"
      },
      {
        "name": "Impossible",
        "setup": "",
        "expr": "fewest_bills([2], 3)",
        "expect": "-1"
      },
      {
        "name": "Zero amount",
        "setup": "",
        "expr": "fewest_bills([1], 0)",
        "expect": "0"
      },
      {
        "name": "Exact single bill",
        "setup": "",
        "expr": "fewest_bills([5, 10, 20], 20)",
        "expect": "1"
      },
      {
        "name": "Mixed denominations",
        "setup": "",
        "expr": "fewest_bills([1, 5, 10, 25], 63)",
        "expect": "6"
      }
    ],
    "approach": [
      "Greedy (largest bill first) fails on [1, 3, 4] with 6, so try every bill for every amount.",
      "Let best[a] be the fewest bills for amount a. The last bill used was some b, so best[a] = 1 + min(best[a - b]) over the bills b that fit.",
      "Fill the table from 0 up to amount: O(amount x len(bills)) time and O(amount) space.",
      "Use a sentinel bigger than any real answer (amount + 1 or infinity) for amounts that can't be made, and turn it into -1 at the end."
    ],
    "walkthrough": [
      "`best = [0] + [impossible] * amount`: 0 bills make 0 dollars; everything else starts as not yet possible.",
      "`for a in range(1, amount + 1)`: smaller amounts are solved first, so best[a - b] is ready when needed.",
      "`if b <= a and best[a - b] + 1 < best[a]`: use bill b on top of the best way to make the rest.",
      "`best[amount] if best[amount] != impossible else -1`: report -1 when the amount was never reached."
    ],
    "mistakes": [
      "Using a greedy approach, which returns 3 instead of 2 for [1, 3, 4] and 6.",
      "Starting the table with 0 everywhere so min() always picks 0.",
      "Returning the sentinel (amount + 1 or inf) instead of -1 when the amount is impossible.",
      "Plain recursion without memoization, which repeats work and is exponential.",
      "Returning -1 for amount 0 instead of 0."
    ]
  },
  {
    "id": "algo-kth-largest-heap",
    "section": "algo",
    "type": "python",
    "difficulty": "Medium",
    "topic": "Heaps",
    "title": "Kth largest transaction with a heap",
    "prompt": [
      "Given a list of transaction `amounts` and a whole number `k`, return the `k`th largest amount. Duplicates count separately, so in `[50, 50, 20]` both the 1st and 2nd largest are 50.",
      "",
      "- Use `heapq` to keep only `k` amounts in memory at a time (O(n log k)), rather than sorting the whole list.",
      "- If `k` is less than 1 or greater than `len(amounts)`, raise `ValueError`.",
      "",
      "```",
      "kth_largest([30, 20, 10, 50, 60, 40], 2)   # 50",
      "```"
    ],
    "starter": [
      "import heapq",
      "",
      "",
      "def kth_largest(amounts, k):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import heapq",
      "",
      "",
      "def kth_largest(amounts, k):",
      "    if k < 1 or k > len(amounts):",
      "        raise ValueError(\"k is out of range\")",
      "    heap = []                          # min-heap of the k largest seen so far",
      "    for x in amounts:",
      "        heapq.heappush(heap, x)",
      "        if len(heap) > k:",
      "            heapq.heappop(heap)        # drop the smallest of the k + 1",
      "    return heap[0]                     # smallest of the top k is the kth largest",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "kth_largest([30, 20, 10, 50, 60, 40], 2)",
        "expect": "50"
      },
      {
        "name": "Duplicates count separately",
        "setup": "",
        "expr": "kth_largest([30, 20, 30, 10, 20, 40, 50, 50, 60], 4)",
        "expect": "40"
      },
      {
        "name": "k is 1 (the maximum)",
        "setup": "",
        "expr": "kth_largest([7, 3, 9, 1], 1)",
        "expect": "9"
      },
      {
        "name": "k is the length (the minimum)",
        "setup": "",
        "expr": "kth_largest([7, 3, 9, 1], 4)",
        "expect": "1"
      },
      {
        "name": "Negative amounts (refunds)",
        "setup": "",
        "expr": "kth_largest([-5, -1, -3], 2)",
        "expect": "-3"
      },
      {
        "name": "k too large",
        "setup": "",
        "expr": "kth_largest([10, 20], 3)",
        "raises": "ValueError"
      }
    ],
    "approach": [
      "Sorting works in O(n log n), but a size-k min-heap does it in O(n log k) with O(k) memory.",
      "Keep the k largest amounts seen so far in a min-heap. When it grows past k, pop the smallest. At the end, the top of the heap (heap[0]) is the kth largest.",
      "Check k first and raise ValueError for an impossible request instead of returning a wrong value.",
      "heapq.nlargest(k, amounts)[-1] is the one-line version of the same idea."
    ],
    "walkthrough": [
      "`if k < 1 or k > len(amounts): raise ValueError(...)`: validate before doing any work.",
      "`heapq.heappush(heap, x)`: heapq is a min-heap, so heap[0] is always the smallest item.",
      "`if len(heap) > k: heapq.heappop(heap)`: throw away the smallest so only the k largest remain.",
      "`return heap[0]`: the smallest of the k largest is exactly the kth largest."
    ],
    "mistakes": [
      "Using a max-heap mindset with heapq, which is a min-heap (negate values if you want a max-heap).",
      "Removing duplicates with set(), which changes the answer when amounts repeat.",
      "Returning heap[-1], which is not the largest item in a heap (only heap[0] has a guaranteed position).",
      "Returning None or -1 for a bad k instead of raising ValueError.",
      "Sorting ascending and taking index k instead of -k (off by one and the wrong end)."
    ]
  },
  {
    "id": "algo-common-spending-pattern",
    "section": "algo",
    "type": "python",
    "difficulty": "Hard",
    "topic": "Dynamic programming",
    "title": "Longest shared spending pattern",
    "prompt": [
      "Each customer's month is written as a string of category codes, one letter per transaction (for example `g` for groceries, `r` for rent). Given two customers' strings `a` and `b`, return the length of their longest common subsequence: the longest sequence of codes that appears in both, in the same order, though not necessarily back to back.",
      "",
      "- Codes are case-sensitive: `'A'` and `'a'` are different.",
      "- If either string is empty, the answer is 0.",
      "",
      "```",
      "lcs_length('grcte', 'gce')   # 3  ('gce' appears in order in both)",
      "```"
    ],
    "starter": [
      "def lcs_length(a, b):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def lcs_length(a, b):",
      "    m, n = len(a), len(b)",
      "    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = LCS of a[:i] and b[:j]",
      "    for i in range(1, m + 1):",
      "        for j in range(1, n + 1):",
      "            if a[i - 1] == b[j - 1]:",
      "                dp[i][j] = dp[i - 1][j - 1] + 1          # use this matching code",
      "            else:",
      "                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # skip one code from a or b",
      "    return dp[m][n]",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "lcs_length('grcte', 'gce')",
        "expect": "3"
      },
      {
        "name": "Nothing in common",
        "setup": "",
        "expr": "lcs_length('abc', 'xyz')",
        "expect": "0"
      },
      {
        "name": "One string empty",
        "setup": "",
        "expr": "lcs_length('', 'grocery')",
        "expect": "0"
      },
      {
        "name": "Identical",
        "setup": "",
        "expr": "lcs_length('ggrr', 'ggrr')",
        "expect": "4"
      },
      {
        "name": "Interleaved",
        "setup": "",
        "expr": "lcs_length('AGGTAB', 'GXTXAYB')",
        "expect": "4"
      },
      {
        "name": "Case-sensitive",
        "setup": "",
        "expr": "lcs_length('Gas', 'gas')",
        "expect": "2"
      }
    ],
    "approach": [
      "Trying every subsequence is O(2^n). Instead, compare prefixes: dp[i][j] is the answer for the first i codes of a and the first j codes of b.",
      "If the last codes match, take them: dp[i][j] = dp[i - 1][j - 1] + 1. Otherwise drop one of them: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]).",
      "Row 0 and column 0 are 0 (an empty prefix shares nothing). The answer is dp[m][n].",
      "O(m x n) time and O(m x n) space; keeping only the previous row brings space down to O(n)."
    ],
    "walkthrough": [
      "`dp = [[0] * (n + 1) for _ in range(m + 1)]`: one extra row and column for the empty prefixes. The list comprehension gives each row its own list.",
      "`if a[i - 1] == b[j - 1]`: dp is 1-indexed by prefix length, the strings are 0-indexed, hence the - 1.",
      "`dp[i][j] = dp[i - 1][j - 1] + 1`: a match extends the best answer for both shorter prefixes.",
      "`max(dp[i - 1][j], dp[i][j - 1])`: no match, so the best answer skips the last code of a or of b.",
      "`return dp[m][n]`: the full strings."
    ],
    "mistakes": [
      "Confusing subsequence with substring and resetting the count to 0 on a mismatch (that solves longest common substring).",
      "Building the table with [[0] * (n + 1)] * (m + 1), which makes every row the same list.",
      "Off-by-one indexing: comparing a[i] and b[j] with a table sized m + 1 by n + 1.",
      "Lower-casing the strings when the prompt says codes are case-sensitive."
    ]
  },
  {
    "id": "algo-payee-edit-distance",
    "section": "algo",
    "type": "python",
    "difficulty": "Hard",
    "topic": "Dynamic programming",
    "title": "Edits to match a payee name",
    "prompt": [
      "To catch typos in wire transfers, the bank measures how far a typed payee name is from the name on file. Return the minimum number of single-character edits that turn `typed` into `on_file`, where one edit is inserting a character, deleting a character, or replacing one character with another.",
      "",
      "- Comparison is case-sensitive.",
      "- Either string may be empty.",
      "",
      "```",
      "edit_distance('jonson', 'johnston')   # 2  (insert 'h', insert 't')",
      "```"
    ],
    "starter": [
      "def edit_distance(typed, on_file):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "def edit_distance(typed, on_file):",
      "    m, n = len(typed), len(on_file)",
      "    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j] = edits for typed[:i] -> on_file[:j]",
      "    for i in range(m + 1):",
      "        dp[i][0] = i                              # delete everything",
      "    for j in range(n + 1):",
      "        dp[0][j] = j                              # insert everything",
      "    for i in range(1, m + 1):",
      "        for j in range(1, n + 1):",
      "            if typed[i - 1] == on_file[j - 1]:",
      "                dp[i][j] = dp[i - 1][j - 1]      # last characters already match",
      "            else:",
      "                dp[i][j] = 1 + min(dp[i - 1][j],      # delete from typed",
      "                                   dp[i][j - 1],      # insert into typed",
      "                                   dp[i - 1][j - 1])  # replace",
      "    return dp[m][n]",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "edit_distance('jonson', 'johnston')",
        "expect": "2"
      },
      {
        "name": "Mixed edits",
        "setup": "",
        "expr": "edit_distance('kitten', 'sitting')",
        "expect": "3"
      },
      {
        "name": "Already correct",
        "setup": "",
        "expr": "edit_distance('Rivera', 'Rivera')",
        "expect": "0"
      },
      {
        "name": "Typed name is empty",
        "setup": "",
        "expr": "edit_distance('', 'lee')",
        "expect": "3"
      },
      {
        "name": "Name on file is empty",
        "setup": "",
        "expr": "edit_distance('park', '')",
        "expect": "4"
      },
      {
        "name": "Case-sensitive replace",
        "setup": "",
        "expr": "edit_distance('Nguyen', 'nguyen')",
        "expect": "1"
      }
    ],
    "approach": [
      "Compare prefixes: dp[i][j] is the fewest edits to turn the first i characters of typed into the first j characters of on_file.",
      "Base cases: turning i characters into nothing takes i deletes, and turning nothing into j characters takes j inserts.",
      "If the last characters match, dp[i][j] = dp[i - 1][j - 1]. Otherwise it's 1 plus the best of delete (dp[i - 1][j]), insert (dp[i][j - 1]) or replace (dp[i - 1][j - 1]).",
      "O(m x n) time and O(m x n) space; two rows are enough if memory matters."
    ],
    "walkthrough": [
      "`dp[i][0] = i`: turning i typed characters into an empty name takes i deletes.",
      "`dp[0][j] = j`: turning an empty name into j characters takes j inserts.",
      "`if typed[i - 1] == on_file[j - 1]: dp[i][j] = dp[i - 1][j - 1]`: matching characters cost nothing.",
      "`dp[i - 1][j]`: delete typed[i - 1] and solve the shorter typed prefix.",
      "`dp[i][j - 1]`: insert on_file[j - 1] at the end, then solve the shorter target.",
      "`dp[i - 1][j - 1]`: replace one character with the other, so both prefixes shrink."
    ],
    "mistakes": [
      "Forgetting the base row and column, which gives 0 for edit_distance('', 'lee').",
      "Adding 1 even when the characters match.",
      "Counting only replacements (a Hamming distance), which breaks when the lengths differ.",
      "Mixing up which neighbor is insert and which is delete; the answer is the same, but explaining it wrong costs points in an interview.",
      "Building the grid with [[0] * (n + 1)] * (m + 1), so every row is the same list."
    ]
  },
  {
    "id": "algo-merge-branch-feeds",
    "section": "algo",
    "type": "python",
    "difficulty": "Hard",
    "topic": "Heaps",
    "title": "Merge sorted feeds from every branch",
    "prompt": [
      "Each branch sends a feed of transaction timestamps that is already sorted in increasing order. Given `feeds`, a list of these sorted lists, return one sorted list containing every timestamp from every feed. Keep duplicates.",
      "",
      "- Some feeds may be empty, and `feeds` itself may be empty.",
      "- Aim for O(N log k), where N is the total number of timestamps and k is the number of feeds. Concatenating and calling sorted() is O(N log N) and doesn't use the fact that each feed is already sorted.",
      "",
      "```",
      "merge_feeds([[1, 4, 5], [1, 3, 4], [2, 6]])   # [1, 1, 2, 3, 4, 4, 5, 6]",
      "```"
    ],
    "starter": [
      "import heapq",
      "",
      "",
      "def merge_feeds(feeds):",
      "    # Write your code here",
      "    pass",
      ""
    ],
    "solution": [
      "import heapq",
      "",
      "",
      "def merge_feeds(feeds):",
      "    # (value, which feed, position in that feed) for the front of every non-empty feed",
      "    heap = [(feed[0], i, 0) for i, feed in enumerate(feeds) if feed]",
      "    heapq.heapify(heap)",
      "    merged = []",
      "    while heap:",
      "        value, i, j = heapq.heappop(heap)          # smallest front across all feeds",
      "        merged.append(value)",
      "        if j + 1 < len(feeds[i]):",
      "            heapq.heappush(heap, (feeds[i][j + 1], i, j + 1))   # that feed's next item",
      "    return merged",
      ""
    ],
    "tests": [
      {
        "name": "Example",
        "setup": "",
        "expr": "merge_feeds([[1, 4, 5], [1, 3, 4], [2, 6]])",
        "expect": "[1, 1, 2, 3, 4, 4, 5, 6]"
      },
      {
        "name": "No feeds",
        "setup": "",
        "expr": "merge_feeds([])",
        "expect": "[]"
      },
      {
        "name": "Only empty feeds",
        "setup": "",
        "expr": "merge_feeds([[], []])",
        "expect": "[]"
      },
      {
        "name": "One feed",
        "setup": "",
        "expr": "merge_feeds([[2, 7, 9]])",
        "expect": "[2, 7, 9]"
      },
      {
        "name": "Uneven feeds with an empty one",
        "setup": "",
        "expr": "merge_feeds([[10], [1, 2, 3, 4], []])",
        "expect": "[1, 2, 3, 4, 10]"
      },
      {
        "name": "Negatives and duplicates",
        "setup": "",
        "expr": "merge_feeds([[-5, 0, 0], [-3, 0, 8]])",
        "expect": "[-5, -3, 0, 0, 0, 8]"
      }
    ],
    "approach": [
      "The next timestamp overall is always the front of one of the k feeds. A min-heap holding one front per feed finds the smallest in O(log k).",
      "Pop the smallest, append it, then push the next item from the same feed. Repeat until the heap is empty.",
      "Each of the N items is pushed and popped once: O(N log k) time, O(k) heap space plus the O(N) output.",
      "Store (value, feed index, position) so equal values are broken by the feed index instead of comparing anything else.",
      "heapq.merge(*feeds) does the same thing lazily; know it exists, but be ready to write it yourself."
    ],
    "walkthrough": [
      "`[(feed[0], i, 0) for i, feed in enumerate(feeds) if feed]`: seed the heap with each feed's first item, skipping empty feeds.",
      "`heapq.heapify(heap)`: turns the list into a heap in O(k).",
      "`value, i, j = heapq.heappop(heap)`: the smallest remaining timestamp and where it came from.",
      "`if j + 1 < len(feeds[i])`: only push the next item if that feed has one.",
      "`heapq.heappush(heap, (feeds[i][j + 1], i, j + 1))`: the heap never holds more than k entries."
    ],
    "mistakes": [
      "Reading feed[0] on an empty feed and raising IndexError.",
      "Pushing every item into the heap at the start, which is O(N log N) and loses the benefit.",
      "Merging feeds one at a time into a growing result, which is O(N x k).",
      "Pushing bare lists or objects that can't be compared when values tie (the index in the tuple avoids that).",
      "Dropping duplicates with a set."
    ]
  }
]
);
