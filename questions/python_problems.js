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
  }
]
);
