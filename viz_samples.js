window.CF_VIZ_SAMPLES = {
 "two-sum": {
  "approach_name": "Hash map, one pass",
  "summary": "Instead of checking every pair, remember each number we pass. For each new number, ask whether its partner has already been seen.",
  "key_insight": "Looking up the partner in a hash map is O(1), so one pass is enough.",
  "example": {
   "input": "nums = [2,7,11,15], target = 9",
   "output": "[0,1]"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(n)",
   "why": "One pass; the map stores at most n numbers."
  },
  "pseudocode": [
   "seen = empty map",
   "for i, x in nums:",
   "  need = target - x",
   "  if need in seen:",
   "    return [seen[need], i]",
   "  seen[x] = i"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "We want two numbers that add up to 9. We keep a table of numbers we have already passed and where we saw them.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "2",
       "7",
       "11",
       "15"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "map",
      "label": "seen (value → index)",
      "key_header": "num",
      "value_header": "index",
      "entries": [],
      "highlight": []
     }
    ]
   },
   {
    "title": "Look at 2",
    "caption": "We need 7 to pair with 2 (since 9 − 2 = 7). Is 7 already in the table?",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "2",
       "7",
       "11",
       "15"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 0
       }
      ],
      "style": "cells",
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "map",
      "label": "seen (value → index)",
      "key_header": "num",
      "value_header": "index",
      "entries": [],
      "highlight": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "need",
        "value": "7",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "Remember 2",
    "caption": "7 is not in the table yet, so we store 2 → index 0 and move on.",
    "pseudo_line": 5,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "2",
       "7",
       "11",
       "15"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 0
       }
      ],
      "style": "cells",
      "highlight": [],
      "done": [],
      "dim": [
       0
      ]
     },
     {
      "type": "map",
      "label": "seen (value → index)",
      "key_header": "num",
      "value_header": "index",
      "entries": [
       {
        "key": "2",
        "value": "0"
       }
      ],
      "highlight": [
       "2"
      ]
     }
    ]
   },
   {
    "title": "Look at 7",
    "caption": "We need 2 to pair with 7 (since 9 − 7 = 2). Is 2 already in the table?",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "2",
       "7",
       "11",
       "15"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 1
       }
      ],
      "style": "cells",
      "highlight": [
       1
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "map",
      "label": "seen (value → index)",
      "key_header": "num",
      "value_header": "index",
      "entries": [
       {
        "key": "2",
        "value": "0"
       }
      ],
      "highlight": [
       "2"
      ]
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "need",
        "value": "2",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "Pair found!",
    "caption": "2 is in the table at index 0, so nums[0] + nums[1] = 2 + 7 = 9. Answer: [0, 1].",
    "pseudo_line": 4,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "2",
       "7",
       "11",
       "15"
      ],
      "pointers": [
       {
        "name": "j",
        "index": 0
       },
       {
        "name": "i",
        "index": 1
       }
      ],
      "style": "cells",
      "highlight": [],
      "done": [
       0,
       1
      ],
      "dim": []
     },
     {
      "type": "map",
      "label": "seen (value → index)",
      "key_header": "num",
      "value_header": "index",
      "entries": [
       {
        "key": "2",
        "value": "0"
       }
      ],
      "highlight": [
       "2"
      ]
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "reverse-linked-list": {
  "approach_name": "Iterative pointer reversal",
  "summary": "Walk the list once, turning every node's next pointer around to face the previous node.",
  "key_insight": "Save next before overwriting it, otherwise the rest of the list is lost.",
  "example": {
   "input": "head = [1,2,3,4]",
   "output": "[4,3,2,1]"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(1)",
   "why": "Single pass, three pointers."
  },
  "pseudocode": [
   "prev = null, cur = head",
   "while cur:",
   "  nxt = cur.next",
   "  cur.next = prev",
   "  prev = cur; cur = nxt",
   "return prev"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "prev starts as null and cur points at the head. We will flip each arrow one at a time.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       1,
       2,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": -1
       },
       {
        "name": "cur",
        "index": 0
       }
      ],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Save next of 1",
    "caption": "Before changing 1's arrow, remember where it points so we do not lose the rest of the list.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       1,
       2,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": -1
       },
       {
        "name": "cur",
        "index": 0
       },
       {
        "name": "nxt",
        "index": 1
       }
      ],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Flip arrow of 1",
    "caption": "1 now points backwards to null.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       2,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": -1
       },
       {
        "name": "cur",
        "index": 0
       }
      ],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Save next of 2",
    "caption": "Before changing 2's arrow, remember where it points so we do not lose the rest of the list.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       2,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 0
       },
       {
        "name": "cur",
        "index": 1
       },
       {
        "name": "nxt",
        "index": 2
       }
      ],
      "highlight": [
       1
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Flip arrow of 2",
    "caption": "2 now points backwards to 1.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 0
       },
       {
        "name": "cur",
        "index": 1
       }
      ],
      "highlight": [
       1
      ],
      "done": [
       0
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Save next of 3",
    "caption": "Before changing 3's arrow, remember where it points so we do not lose the rest of the list.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       3,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 1
       },
       {
        "name": "cur",
        "index": 2
       },
       {
        "name": "nxt",
        "index": 3
       }
      ],
      "highlight": [
       2
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Flip arrow of 3",
    "caption": "3 now points backwards to 2.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       1,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 1
       },
       {
        "name": "cur",
        "index": 2
       }
      ],
      "highlight": [
       2
      ],
      "done": [
       0,
       1
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Save next of 4",
    "caption": "Before changing 4's arrow, remember where it points so we do not lose the rest of the list.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       1,
       4
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 2
       },
       {
        "name": "cur",
        "index": 3
       }
      ],
      "highlight": [
       3
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Flip arrow of 4",
    "caption": "4 now points backwards to 3.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       1,
       2
      ],
      "pointers": [
       {
        "name": "prev",
        "index": 2
       },
       {
        "name": "cur",
        "index": 3
       }
      ],
      "highlight": [
       3
      ],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Done",
    "caption": "cur ran off the end, so prev is the new head. Every arrow now points the other way.",
    "pseudo_line": 5,
    "structures": [
     {
      "type": "linkedlist",
      "label": "list",
      "values": [
       "1",
       "2",
       "3",
       "4"
      ],
      "next": [
       4,
       0,
       1,
       2
      ],
      "pointers": [
       {
        "name": "head",
        "index": 3
       }
      ],
      "highlight": [],
      "done": [
       0,
       1,
       2,
       3
      ],
      "dim": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "binary-tree-level-order-traversal": {
  "approach_name": "Breadth-first search with a queue",
  "summary": "Process the tree one level at a time by counting how many nodes are in the queue at the start of each round.",
  "key_insight": "The queue size at the start of a round equals the size of that level.",
  "example": {
   "input": "root = [3,9,20,null,null,15,7]",
   "output": "[[3],[9,20],[15,7]]"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(n)",
   "why": "Each node is enqueued once; the queue holds at most one level."
  },
  "pseudocode": [
   "queue = [root]",
   "while queue:",
   "  size = len(queue)",
   "  level = pop size nodes, push their children",
   "  result.append(level)",
   "return result"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Put the root in a queue. A queue hands nodes back in the order they were added, which gives us level-by-level order.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "tree",
      "label": "root",
      "values": [
       "3",
       "9",
       "20",
       null,
       null,
       "15",
       "7"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "queue",
      "label": "queue",
      "items": [
       "3"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "text",
      "label": "",
      "text": "result = []"
     }
    ]
   },
   {
    "title": "Level 1",
    "caption": "Take everything currently in the queue (just 3). That is one level. Add its children 9 and 20 for the next round.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "tree",
      "label": "root",
      "values": [
       "3",
       "9",
       "20",
       null,
       null,
       "15",
       "7"
      ],
      "pointers": [],
      "highlight": [
       1,
       2
      ],
      "done": [
       0
      ],
      "dim": []
     },
     {
      "type": "queue",
      "label": "queue",
      "items": [
       "9",
       "20"
      ],
      "highlight": [
       0,
       1
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "text",
      "label": "",
      "text": "result = [[3]]"
     }
    ]
   },
   {
    "title": "Level 2",
    "caption": "The queue holds 9 and 20. 9 has no children; 20 adds 15 and 7.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "tree",
      "label": "root",
      "values": [
       "3",
       "9",
       "20",
       null,
       null,
       "15",
       "7"
      ],
      "pointers": [],
      "highlight": [
       5,
       6
      ],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     },
     {
      "type": "queue",
      "label": "queue",
      "items": [
       "15",
       "7"
      ],
      "highlight": [
       0,
       1
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "text",
      "label": "",
      "text": "result = [[3],[9,20]]"
     }
    ]
   },
   {
    "title": "Level 3 and finish",
    "caption": "15 and 7 have no children, so the queue empties and we are done.",
    "pseudo_line": 5,
    "structures": [
     {
      "type": "tree",
      "label": "root",
      "values": [
       "3",
       "9",
       "20",
       null,
       null,
       "15",
       "7"
      ],
      "pointers": [],
      "highlight": [],
      "done": [
       0,
       1,
       2,
       5,
       6
      ],
      "dim": []
     },
     {
      "type": "queue",
      "label": "queue",
      "items": [],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "text",
      "label": "",
      "text": "result = [[3],[9,20],[15,7]]"
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "number-of-islands": {
  "approach_name": "DFS flood fill",
  "summary": "Count connected groups of land by flood-filling each group the first time we touch it.",
  "key_insight": "Marking visited cells makes each cell cost O(1) total.",
  "example": {
   "input": "4x4 grid with three land groups",
   "output": "3"
  },
  "complexity": {
   "time": "O(R·C)",
   "space": "O(R·C)",
   "why": "Each cell is visited once; recursion/stack can hold every cell."
  },
  "pseudocode": [
   "count = 0",
   "for each cell:",
   "  if land and not visited:",
   "    count += 1; flood-fill(cell)",
   "return count"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Scan every cell. Each time we meet unvisited land we have found a new island, then we flood-fill it so we never count it twice.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "grid",
      "label": "grid (1 = land)",
      "rows": [
       [
        "1",
        "1",
        "0",
        "0"
       ],
       [
        "1",
        "0",
        "0",
        "1"
       ],
       [
        "0",
        "0",
        "1",
        "1"
       ],
       [
        "0",
        "0",
        "0",
        "0"
       ]
      ],
      "highlight": [],
      "done": [],
      "dim": [],
      "pointers": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "islands",
        "value": "0",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Island 1",
    "caption": "Land at (0,0) that we have not seen: new island! Flood-fill all connected land cells.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "grid",
      "label": "grid (1 = land)",
      "rows": [
       [
        "1",
        "1",
        "0",
        "0"
       ],
       [
        "1",
        "0",
        "0",
        "1"
       ],
       [
        "0",
        "0",
        "1",
        "1"
       ],
       [
        "0",
        "0",
        "0",
        "0"
       ]
      ],
      "highlight": [
       [
        0,
        0
       ],
       [
        0,
        1
       ],
       [
        1,
        0
       ]
      ],
      "done": [],
      "dim": [],
      "pointers": [
       {
        "name": "start",
        "row": 0,
        "col": 0
       }
      ]
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "islands",
        "value": "1",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "Island 2",
    "caption": "Land at (1,3) that we have not seen: new island! Flood-fill all connected land cells.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "grid",
      "label": "grid (1 = land)",
      "rows": [
       [
        "1",
        "1",
        "0",
        "0"
       ],
       [
        "1",
        "0",
        "0",
        "1"
       ],
       [
        "0",
        "0",
        "1",
        "1"
       ],
       [
        "0",
        "0",
        "0",
        "0"
       ]
      ],
      "highlight": [
       [
        1,
        3
       ],
       [
        2,
        3
       ],
       [
        2,
        2
       ]
      ],
      "done": [
       [
        0,
        1
       ],
       [
        0,
        0
       ],
       [
        1,
        0
       ]
      ],
      "dim": [],
      "pointers": [
       {
        "name": "start",
        "row": 1,
        "col": 3
       }
      ]
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "islands",
        "value": "2",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "Done",
    "caption": "Every land cell is visited. There are 2 islands.",
    "pseudo_line": null,
    "structures": [
     {
      "type": "grid",
      "label": "grid (1 = land)",
      "rows": [
       [
        "1",
        "1",
        "0",
        "0"
       ],
       [
        "1",
        "0",
        "0",
        "1"
       ],
       [
        "0",
        "0",
        "1",
        "1"
       ],
       [
        "0",
        "0",
        "0",
        "0"
       ]
      ],
      "highlight": [],
      "done": [
       [
        0,
        1
       ],
       [
        0,
        0
       ],
       [
        2,
        3
       ],
       [
        2,
        2
       ],
       [
        1,
        0
       ],
       [
        1,
        3
       ]
      ],
      "dim": [],
      "pointers": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "islands",
        "value": "2",
        "highlight": true
       }
      ]
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "climbing-stairs": {
  "approach_name": "Dynamic programming (Fibonacci)",
  "summary": "The ways to reach a step are the ways to reach the previous step plus the ways to reach the one before that.",
  "key_insight": "The last move was either 1 step or 2 steps, so the problem splits into two smaller ones.",
  "example": {
   "input": "n = 6",
   "output": "13"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(n)",
   "why": "One value per step; can shrink to O(1)."
  },
  "pseudocode": [
   "dp[0] = dp[1] = 1",
   "for i in 2..n:",
   "  dp[i] = dp[i-1] + dp[i-2]",
   "return dp[n]"
  ],
  "scenes": [
   {
    "title": "Base cases",
    "caption": "There is 1 way to stand on step 0 (do nothing) and 1 way to reach step 1.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "?",
       "?",
       "?",
       "?",
       "?"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [
       0,
       1
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Step 2",
    "caption": "We arrive at step 2 from step 1 (one step) or step 0 (two steps): 1 + 1 = 2 ways.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "?",
       "?",
       "?",
       "?"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 2
       }
      ],
      "style": "cells",
      "highlight": [
       2
      ],
      "done": [
       1,
       0
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Step 3",
    "caption": "We arrive at step 3 from step 2 (one step) or step 1 (two steps): 2 + 1 = 3 ways.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "3",
       "?",
       "?",
       "?"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 3
       }
      ],
      "style": "cells",
      "highlight": [
       3
      ],
      "done": [
       2,
       1
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Step 4",
    "caption": "We arrive at step 4 from step 3 (one step) or step 2 (two steps): 3 + 2 = 5 ways.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "3",
       "5",
       "?",
       "?"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 4
       }
      ],
      "style": "cells",
      "highlight": [
       4
      ],
      "done": [
       3,
       2
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Step 5",
    "caption": "We arrive at step 5 from step 4 (one step) or step 3 (two steps): 5 + 3 = 8 ways.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "3",
       "5",
       "8",
       "?"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 5
       }
      ],
      "style": "cells",
      "highlight": [
       5
      ],
      "done": [
       4,
       3
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Step 6",
    "caption": "We arrive at step 6 from step 5 (one step) or step 4 (two steps): 8 + 5 = 13 ways.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "3",
       "5",
       "8",
       "13"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 6
       }
      ],
      "style": "cells",
      "highlight": [
       6
      ],
      "done": [
       5,
       4
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Answer",
    "caption": "dp[6] = 13 distinct ways to climb 6 stairs.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "dp[i] = ways to reach step i",
      "values": [
       "1",
       "1",
       "2",
       "3",
       "5",
       "8",
       "13"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [
       6
      ],
      "dim": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "valid-parentheses": {
  "approach_name": "Stack",
  "summary": "The most recently opened bracket must be the first one closed, which is exactly last-in-first-out.",
  "key_insight": "An empty stack at the end means every opener was closed in the right order.",
  "example": {
   "input": "s = \"({[]})\"",
   "output": "true"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(n)",
   "why": "One pass; the stack holds at most n openers."
  },
  "pseudocode": [
   "stack = []",
   "for ch in s:",
   "  if ch is opener: push ch",
   "  else:",
   "    if stack empty or top != match(ch): return false",
   "    pop",
   "return stack is empty"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Opening brackets wait on a stack. Each closing bracket must match the most recent opener on top.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Open '('",
    "caption": "'(' is an opener, so push it onto the stack.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 0
       }
      ],
      "style": "cells",
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [
       "("
      ],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Open '{'",
    "caption": "'{' is an opener, so push it onto the stack.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 1
       }
      ],
      "style": "cells",
      "highlight": [
       1
      ],
      "done": [
       0
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [
       "(",
       "{"
      ],
      "highlight": [
       1
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Open '['",
    "caption": "'[' is an opener, so push it onto the stack.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 2
       }
      ],
      "style": "cells",
      "highlight": [
       2
      ],
      "done": [
       0,
       1
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [
       "(",
       "{",
       "["
      ],
      "highlight": [
       2
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Close ']'",
    "caption": "']' needs '[' on top, and the top was '['. Match, so pop it.",
    "pseudo_line": 4,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 3
       }
      ],
      "style": "cells",
      "highlight": [
       3
      ],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [
       "(",
       "{"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Close '}'",
    "caption": "'}' needs '{' on top, and the top was '{'. Match, so pop it.",
    "pseudo_line": 4,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 4
       }
      ],
      "style": "cells",
      "highlight": [
       4
      ],
      "done": [
       0,
       1,
       2,
       3
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [
       "("
      ],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Close ')'",
    "caption": "')' needs '(' on top, and the top was '('. Match, so pop it.",
    "pseudo_line": 4,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 5
       }
      ],
      "style": "cells",
      "highlight": [
       5
      ],
      "done": [
       0,
       1,
       2,
       3,
       4
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Result",
    "caption": "The stack is empty, so every bracket was matched: valid.",
    "pseudo_line": 6,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "(",
       "{",
       "[",
       "]",
       "}",
       ")"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      "dim": []
     },
     {
      "type": "stack",
      "label": "stack",
      "items": [],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "network-delay-time": {
  "approach_name": "Dijkstra's algorithm",
  "summary": "Repeatedly finalize the closest unvisited node, then see whether going through it shortens the route to its neighbours.",
  "key_insight": "With non-negative weights, the closest unfinished node can never be improved later.",
  "example": {
   "input": "4 nodes, start at A",
   "output": "A=0, B=1, C=3, D=6"
  },
  "complexity": {
   "time": "O(E log V)",
   "space": "O(V)",
   "why": "Each edge relaxes at most once with a heap."
  },
  "pseudocode": [
   "dist = ∞, dist[start] = 0",
   "heap = [(0, start)]",
   "while heap:",
   "  pop closest node u",
   "  for each neighbour v:",
   "    dist[v] = min(dist[v], dist[u] + w)"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Every distance starts at infinity except the start node A = 0. Always expand the closest unfinished node next.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [],
      "done": [],
      "dim": [],
      "highlight_edges": [],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "∞",
       "C": "∞",
       "D": "∞"
      },
      "pointers": []
     }
    ]
   },
   {
    "title": "Expand A",
    "caption": "A is the closest unfinished node (distance 0). Try each neighbour: a shorter route replaces the old distance.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [
       "A"
      ],
      "done": [],
      "dim": [],
      "highlight_edges": [
       [
        "A",
        "B"
       ],
       [
        "A",
        "C"
       ]
      ],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "1",
       "C": "4",
       "D": "∞"
      },
      "pointers": []
     }
    ]
   },
   {
    "title": "Expand B",
    "caption": "B is the closest unfinished node (distance 1). Try each neighbour: a shorter route replaces the old distance.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [
       "B"
      ],
      "done": [
       "A"
      ],
      "dim": [],
      "highlight_edges": [
       [
        "B",
        "C"
       ],
       [
        "B",
        "D"
       ]
      ],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "1",
       "C": "3",
       "D": "7"
      },
      "pointers": []
     }
    ]
   },
   {
    "title": "Expand C",
    "caption": "C is the closest unfinished node (distance 3). Try each neighbour: a shorter route replaces the old distance.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [
       "C"
      ],
      "done": [
       "A",
       "B"
      ],
      "dim": [],
      "highlight_edges": [
       [
        "C",
        "D"
       ]
      ],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "1",
       "C": "3",
       "D": "6"
      },
      "pointers": []
     }
    ]
   },
   {
    "title": "Expand D",
    "caption": "D is the closest unfinished node (distance 6). Try each neighbour: a shorter route replaces the old distance.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [
       "D"
      ],
      "done": [
       "A",
       "B",
       "C"
      ],
      "dim": [],
      "highlight_edges": [],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "1",
       "C": "3",
       "D": "6"
      },
      "pointers": []
     }
    ]
   },
   {
    "title": "Finished",
    "caption": "Every node is finalized. Each number is the shortest distance from A.",
    "pseudo_line": 5,
    "structures": [
     {
      "type": "graph",
      "label": "graph (distance shown)",
      "directed": false,
      "nodes": [
       {
        "id": "A",
        "label": "A"
       },
       {
        "id": "B",
        "label": "B"
       },
       {
        "id": "C",
        "label": "C"
       },
       {
        "id": "D",
        "label": "D"
       }
      ],
      "edges": [
       {
        "from": "A",
        "to": "B",
        "weight": "1"
       },
       {
        "from": "A",
        "to": "C",
        "weight": "4"
       },
       {
        "from": "B",
        "to": "C",
        "weight": "2"
       },
       {
        "from": "B",
        "to": "D",
        "weight": "6"
       },
       {
        "from": "C",
        "to": "D",
        "weight": "3"
       }
      ],
      "highlight": [],
      "done": [
       "A",
       "B",
       "C",
       "D"
      ],
      "dim": [],
      "highlight_edges": [],
      "done_edges": [],
      "dim_edges": [],
      "node_info": {
       "A": "0",
       "B": "1",
       "C": "3",
       "D": "6"
      },
      "pointers": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "container-with-most-water": {
  "approach_name": "Two pointers",
  "summary": "Start with the widest container and move the shorter wall inward, since only a taller wall can improve the area.",
  "key_insight": "Moving the taller wall can never help: width shrinks and the height is still capped by the short wall.",
  "example": {
   "input": "height = [1,8,6,2,5,4,8,3,7]",
   "output": "49"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(1)",
   "why": "Each pointer moves inward at most n times."
  },
  "pseudocode": [
   "l, r = 0, n-1",
   "while l < r:",
   "  best = max(best, min(h[l],h[r]) * (r-l))",
   "  move the shorter pointer inward"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Begin with the widest container: left and right ends. Width is as large as it will ever be.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 0
       },
       {
        "name": "R",
        "index": 8
       }
      ],
      "style": "bars",
      "highlight": [
       0,
       8
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 0,
       "to": 8,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "0",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 8",
    "caption": "Water height is limited by the shorter side: min(1,7) × width 8 = 8.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 0
       },
       {
        "name": "R",
        "index": 8
       }
      ],
      "style": "bars",
      "highlight": [
       0,
       8
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 0,
       "to": 8,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "8",
        "highlight": true
       },
       {
        "name": "best",
        "value": "8",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 49",
    "caption": "Water height is limited by the shorter side: min(8,7) × width 7 = 49.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 8
       }
      ],
      "style": "bars",
      "highlight": [
       1,
       8
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 8,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "49",
        "highlight": true
       },
       {
        "name": "best",
        "value": "49",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 18",
    "caption": "Water height is limited by the shorter side: min(8,3) × width 6 = 18.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 7
       }
      ],
      "style": "bars",
      "highlight": [
       1,
       7
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 7,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "18",
        "highlight": true
       },
       {
        "name": "best",
        "value": "49",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 40",
    "caption": "Water height is limited by the shorter side: min(8,8) × width 5 = 40.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 6
       }
      ],
      "style": "bars",
      "highlight": [
       1,
       6
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 6,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "40",
        "highlight": true
       },
       {
        "name": "best",
        "value": "49",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 16",
    "caption": "Water height is limited by the shorter side: min(8,4) × width 4 = 16.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 5
       }
      ],
      "style": "bars",
      "highlight": [
       1,
       5
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 5,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "16",
        "highlight": true
       },
       {
        "name": "best",
        "value": "49",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "Area = 15",
    "caption": "Water height is limited by the shorter side: min(8,5) × width 3 = 15.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 4
       }
      ],
      "style": "bars",
      "highlight": [
       1,
       4
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 4,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "area",
        "value": "15",
        "highlight": true
       },
       {
        "name": "best",
        "value": "49",
        "highlight": false
       }
      ]
     }
    ]
   },
   {
    "title": "…keep going",
    "caption": "We keep moving the shorter side inward; skipping ahead to the result.",
    "pseudo_line": null,
    "structures": [
     {
      "type": "array",
      "label": "height",
      "values": [
       "1",
       "8",
       "6",
       "2",
       "5",
       "4",
       "8",
       "3",
       "7"
      ],
      "pointers": [
       {
        "name": "L",
        "index": 1
       },
       {
        "name": "R",
        "index": 3
       }
      ],
      "style": "bars",
      "highlight": [],
      "done": [],
      "dim": [
       0,
       4,
       5,
       6,
       7,
       8
      ],
      "window": {
       "from": 1,
       "to": 3,
       "label": "container"
      }
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "49",
        "highlight": true
       }
      ]
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "kth-largest-element-in-an-array": {
  "approach_name": "Min-heap of size k",
  "summary": "Never keep more than k numbers: the heap's root is always the smallest of the k largest.",
  "key_insight": "Throwing away the smallest each time keeps only the top k.",
  "example": {
   "input": "nums = [3,2,1,5,6,4], k = 2",
   "output": "5"
  },
  "complexity": {
   "time": "O(n log k)",
   "space": "O(k)",
   "why": "Each push/pop costs log k."
  },
  "pseudocode": [
   "heap = []",
   "for x in nums:",
   "  push x",
   "  if size > k: pop",
   "return heap[0]"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Keep a min-heap holding the k largest numbers seen so far. Its smallest element (the root) is the k-th largest.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [],
      "pointers": [],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 3",
    "caption": "Push 3.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 0
       }
      ],
      "style": "cells",
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "3"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 2",
    "caption": "Push 2.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 1
       }
      ],
      "style": "cells",
      "highlight": [
       1
      ],
      "done": [
       0
      ],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "2",
       "3"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 1",
    "caption": "Push 1. Heap is bigger than k, so pop the smallest.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 2
       }
      ],
      "style": "cells",
      "highlight": [
       2
      ],
      "done": [
       0,
       1
      ],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "2",
       "3"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 5",
    "caption": "Push 5. Heap is bigger than k, so pop the smallest.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 3
       }
      ],
      "style": "cells",
      "highlight": [
       3
      ],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "3",
       "5"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 6",
    "caption": "Push 6. Heap is bigger than k, so pop the smallest.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 4
       }
      ],
      "style": "cells",
      "highlight": [
       4
      ],
      "done": [
       0,
       1,
       2,
       3
      ],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "5",
       "6"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Read 4",
    "caption": "Push 4. Heap is bigger than k, so pop the smallest.",
    "pseudo_line": 2,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [
       {
        "name": "i",
        "index": 5
       }
      ],
      "style": "cells",
      "highlight": [
       5
      ],
      "done": [
       0,
       1,
       2,
       3,
       4
      ],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "5",
       "6"
      ],
      "pointers": [],
      "highlight": [
       0
      ],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Answer",
    "caption": "The root of the heap is 5, the 2nd largest.",
    "pseudo_line": 4,
    "structures": [
     {
      "type": "array",
      "label": "nums",
      "values": [
       "3",
       "2",
       "1",
       "5",
       "6",
       "4"
      ],
      "pointers": [],
      "style": "cells",
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "heap",
      "label": "min-heap (size ≤ 2)",
      "values": [
       "5",
       "6"
      ],
      "pointers": [],
      "highlight": [],
      "done": [
       0
      ],
      "dim": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "merge-intervals": {
  "approach_name": "Sort then sweep",
  "summary": "After sorting by start, overlapping intervals are neighbours, so one pass can merge them.",
  "key_insight": "Only the last merged interval can overlap the next one.",
  "example": {
   "input": "[[1,3],[2,6],[8,10],[15,18]]",
   "output": "[[1,6],[8,10],[15,18]]"
  },
  "complexity": {
   "time": "O(n log n)",
   "space": "O(n)",
   "why": "Sorting dominates."
  },
  "pseudocode": [
   "sort intervals by start",
   "merged = [first]",
   "for each next interval:",
   "  if overlaps last: extend last.end",
   "  else: append"
  ],
  "scenes": [
   {
    "title": "Start",
    "caption": "Sort by start time, then sweep left to right, extending the last merged interval whenever the next one overlaps it.",
    "pseudo_line": 0,
    "structures": [
     {
      "type": "intervals",
      "label": "sorted input",
      "items": [
       {
        "start": 1.0,
        "end": 3.0,
        "label": "I0"
       },
       {
        "start": 2.0,
        "end": 6.0,
        "label": "I1"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "I2"
       },
       {
        "start": 15.0,
        "end": 18.0,
        "label": "I3"
       }
      ],
      "markers": [],
      "highlight": [],
      "done": [],
      "dim": []
     }
    ]
   },
   {
    "title": "Interval 2",
    "caption": "[2,6] starts at 2 ≤ 1..6's end, so they overlap: merge.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "intervals",
      "label": "input",
      "items": [
       {
        "start": 1.0,
        "end": 3.0,
        "label": "I0"
       },
       {
        "start": 2.0,
        "end": 6.0,
        "label": "I1"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "I2"
       },
       {
        "start": 15.0,
        "end": 18.0,
        "label": "I3"
       }
      ],
      "markers": [],
      "highlight": [
       1
      ],
      "done": [
       0
      ],
      "dim": []
     },
     {
      "type": "intervals",
      "label": "merged so far",
      "items": [
       {
        "start": 1.0,
        "end": 6.0,
        "label": "M0"
       }
      ],
      "markers": [],
      "highlight": [],
      "done": [
       0
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Interval 3",
    "caption": "[8,10] starts after the last merged interval ends, so it begins a new group.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "intervals",
      "label": "input",
      "items": [
       {
        "start": 1.0,
        "end": 3.0,
        "label": "I0"
       },
       {
        "start": 2.0,
        "end": 6.0,
        "label": "I1"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "I2"
       },
       {
        "start": 15.0,
        "end": 18.0,
        "label": "I3"
       }
      ],
      "markers": [],
      "highlight": [
       2
      ],
      "done": [
       0,
       1
      ],
      "dim": []
     },
     {
      "type": "intervals",
      "label": "merged so far",
      "items": [
       {
        "start": 1.0,
        "end": 6.0,
        "label": "M0"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "M1"
       }
      ],
      "markers": [],
      "highlight": [],
      "done": [
       0,
       1
      ],
      "dim": []
     }
    ]
   },
   {
    "title": "Interval 4",
    "caption": "[15,18] starts after the last merged interval ends, so it begins a new group.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "intervals",
      "label": "input",
      "items": [
       {
        "start": 1.0,
        "end": 3.0,
        "label": "I0"
       },
       {
        "start": 2.0,
        "end": 6.0,
        "label": "I1"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "I2"
       },
       {
        "start": 15.0,
        "end": 18.0,
        "label": "I3"
       }
      ],
      "markers": [],
      "highlight": [
       3
      ],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     },
     {
      "type": "intervals",
      "label": "merged so far",
      "items": [
       {
        "start": 1.0,
        "end": 6.0,
        "label": "M0"
       },
       {
        "start": 8.0,
        "end": 10.0,
        "label": "M1"
       },
       {
        "start": 15.0,
        "end": 18.0,
        "label": "M2"
       }
      ],
      "markers": [],
      "highlight": [],
      "done": [
       0,
       1,
       2
      ],
      "dim": []
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 },
 "longest-substring-without-repeating-characters": {
  "approach_name": "Sliding window",
  "summary": "Grow the window on the right; when a repeat appears, shrink from the left until the window has no repeats.",
  "key_insight": "Each character enters and leaves the window at most once.",
  "example": {
   "input": "s = \"abcabcbb\"",
   "output": "3"
  },
  "complexity": {
   "time": "O(n)",
   "space": "O(k)",
   "why": "k is the alphabet size."
  },
  "pseudocode": [
   "l = 0; seen = {}",
   "for r in range(n):",
   "  while s[r] in seen: remove s[l]; l++",
   "  add s[r]; best = max(best, r-l+1)"
  ],
  "scenes": [
   {
    "title": "r = 0",
    "caption": "Add 'a'. Window length is 1.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 0
       },
       {
        "name": "r",
        "index": 0
       }
      ],
      "style": "cells",
      "highlight": [
       0
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 0,
       "to": 0,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "a"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "1",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "r = 1",
    "caption": "Add 'b'. Window length is 2.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 0
       },
       {
        "name": "r",
        "index": 1
       }
      ],
      "style": "cells",
      "highlight": [
       1
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 0,
       "to": 1,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "a",
       "b"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "2",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "r = 2",
    "caption": "Add 'c'. Window length is 3.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 0
       },
       {
        "name": "r",
        "index": 2
       }
      ],
      "style": "cells",
      "highlight": [
       2
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 0,
       "to": 2,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "a",
       "b",
       "c"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "3",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "r = 3",
    "caption": "'a' is already in the window, so shrink from the left until it is not. Window length is 3.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 1
       },
       {
        "name": "r",
        "index": 3
       }
      ],
      "style": "cells",
      "highlight": [
       3
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 1,
       "to": 3,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "b",
       "c",
       "a"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "3",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "r = 4",
    "caption": "'b' is already in the window, so shrink from the left until it is not. Window length is 3.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 2
       },
       {
        "name": "r",
        "index": 4
       }
      ],
      "style": "cells",
      "highlight": [
       4
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 2,
       "to": 4,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "c",
       "a",
       "b"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "3",
        "highlight": true
       }
      ]
     }
    ]
   },
   {
    "title": "r = 5",
    "caption": "'c' is already in the window, so shrink from the left until it is not. Window length is 3.",
    "pseudo_line": 3,
    "structures": [
     {
      "type": "array",
      "label": "s",
      "values": [
       "a",
       "b",
       "c",
       "a",
       "b",
       "c",
       "b",
       "b"
      ],
      "pointers": [
       {
        "name": "l",
        "index": 3
       },
       {
        "name": "r",
        "index": 5
       }
      ],
      "style": "cells",
      "highlight": [
       5
      ],
      "done": [],
      "dim": [],
      "window": {
       "from": 3,
       "to": 5,
       "label": "window"
      }
     },
     {
      "type": "set",
      "label": "chars in window",
      "items": [
       "a",
       "b",
       "c"
      ],
      "highlight": [],
      "done": [],
      "dim": []
     },
     {
      "type": "vars",
      "label": "",
      "items": [
       {
        "name": "best",
        "value": "3",
        "highlight": true
       }
      ]
     }
    ]
   }
  ],
  "ai_generated": true,
  "execution_verified": false
 }
};
