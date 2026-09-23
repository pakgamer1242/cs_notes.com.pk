/* ---------------------------------------------------------
   CS Reference — general computer science reference data.
--------------------------------------------------------- */

const REFERENCE_DATA = [
  {
    slug: "algorithms", name: "algorithms", glyph: "ƒ(n)", color: "#1E8F6F",
    topics: [
      { slug: "big-o", title: "Big-O Notation", tag: "core",
        desc: "Describing how runtime and memory scale with input size — the vocabulary for comparing algorithms before you ever run them.",
        keyPoints: [
          "Describes the upper bound growth rate of time or space as input size n grows",
          "Ignores constant factors and lower-order terms — O(2n + 5) simplifies to O(n)",
          "Ω (omega) is the lower bound / best case, Θ (theta) is the tight bound / average case",
          "Worst-case analysis is standard, but average-case and amortized analysis matter in practice",
          "Multiple nested loops over the same input often multiply complexities, e.g. two nested O(n) loops give O(n²)",
          "Space complexity analysis follows the same rules as time complexity, just counting memory instead of operations",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// O(n) - single pass
function sumArray(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i]; // one operation per element
  }
  return total;
}

// O(n^2) - nested loop over the same input
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}` },
        pitfalls: [
          "Confusing 'fast in practice' with 'good asymptotic complexity' — a low constant-factor O(n²) can beat O(n log n) on small inputs",
          "Forgetting that recursive calls add their own stack space to the space complexity",
          "Assuming worst-case Big-O always reflects real-world performance, when average-case often matters more",
        ],
        practice: "Interviewers ask for Big-O because it's the fastest way to check whether your solution will scale — an O(n²) answer on a 10-million-row dataset is a red flag before you write a single line of code.",
        table: { headers: ["Notation", "Name", "Example"], rows: [
          ["O(1)", "Constant", "Array index lookup"],
          ["O(log n)", "Logarithmic", "Binary search"],
          ["O(n)", "Linear", "Array scan"],
          ["O(n log n)", "Linearithmic", "Merge sort"],
          ["O(n²)", "Quadratic", "Bubble sort"],
          ["O(2ⁿ)", "Exponential", "Naive recursive Fibonacci"],
        ]},
      },
      { slug: "sorting", title: "Sorting Algorithms", tag: "core",
        desc: "Comparison-based and non-comparison sorts, their trade-offs, and when each one wins.",
        keyPoints: [
          "Comparison sorts (merge, quick, heap) have a proven lower bound of O(n log n)",
          "Non-comparison sorts (counting, radix, bucket) can beat O(n log n) under data assumptions",
          "Stability matters when sorting by multiple keys — merge sort is stable, quicksort typically isn't",
          "In-place sorts (quicksort, heapsort) trade stability for O(1) extra space",
          "Timsort (used by Python and Java) is a hybrid of merge sort and insertion sort tuned for real-world data",
          "Quicksort's worst case (O(n²)) happens on already-sorted input with a naive pivot choice — randomized pivots avoid this",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Merge sort: O(n log n), stable
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}` },
        pitfalls: [
          "Assuming a language's built-in sort is always quicksort — many use Timsort or introsort instead",
          "Ignoring stability when sorting objects by a secondary key after already sorting by a primary one",
          "Reaching for a custom sort implementation when a well-tested built-in one is faster and safer",
        ],
        practice: "Most production code never hand-writes a sort — the real skill is knowing which built-in guarantee (stability, worst-case time) you need and choosing the right comparator.",
        table: { headers: ["Algorithm", "Avg Time", "Space", "Stable"], rows: [
          ["Merge Sort", "O(n log n)", "O(n)", "Yes"],
          ["Quick Sort", "O(n log n)", "O(log n)", "No"],
          ["Heap Sort", "O(n log n)", "O(1)", "No"],
          ["Insertion Sort", "O(n²)", "O(1)", "Yes"],
          ["Counting Sort", "O(n + k)", "O(k)", "Yes"],
        ]},
      },
      { slug: "trees-graphs", title: "Trees & Graphs", tag: "core",
        desc: "Traversal strategies, balanced trees, and shortest-path algorithms that show up in almost every interview.",
        keyPoints: [
          "BFS explores level by level with a queue; guarantees shortest path in unweighted graphs",
          "DFS explores depth-first with a stack or recursion; useful for cycle detection and topological sort",
          "Balanced BSTs (AVL, Red-Black) guarantee O(log n) search/insert/delete by bounding tree height",
          "Dijkstra finds shortest paths with non-negative weights; Bellman-Ford handles negative weights",
          "A trie (prefix tree) is optimized for fast lookups on strings sharing common prefixes, like autocomplete",
          "Topological sort only works on Directed Acyclic Graphs (DAGs) — a cycle means no valid ordering exists",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// BFS shortest path in an unweighted graph
function bfs(graph, start, target) {
  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === target) return path;

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null; // no path found
}` },
        pitfalls: [
          "Forgetting to mark nodes as visited in DFS/BFS, causing infinite loops on cyclic graphs",
          "Using DFS for shortest path in an unweighted graph, when BFS is the correct choice",
          "Not distinguishing between a graph's adjacency list and adjacency matrix trade-offs (space vs. edge lookup speed)",
        ],
        practice: "Course prerequisite scheduling, build-dependency resolution, and social network 'friends of friends' features are all graph traversal problems in disguise.",
      },
      { slug: "dynamic-programming", title: "Dynamic Programming", tag: "advanced",
        desc: "Breaking problems into overlapping subproblems, and recognizing when DP actually applies.",
        keyPoints: [
          "Applies when a problem has optimal substructure and overlapping subproblems",
          "Top-down (memoization) caches recursive calls; bottom-up (tabulation) builds a table iteratively",
          "Classic examples: knapsack, longest common subsequence, edit distance, coin change",
          "Space can often shrink from O(n²) to O(n) by keeping only the last one or two rows",
          "Drawing the recursion tree first often reveals the overlapping subproblems that make DP worth using",
          "The state (what you memoize on) is the hardest part to design — get it wrong and memoization won't help",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Longest Common Subsequence, with memoization
function lcs(a, b, i = a.length, j = b.length, memo = {}) {
  const key = i + "," + j;
  if (i === 0 || j === 0) return 0;
  if (key in memo) return memo[key];

  if (a[i - 1] === b[j - 1]) {
    memo[key] = 1 + lcs(a, b, i - 1, j - 1, memo);
  } else {
    memo[key] = Math.max(lcs(a, b, i - 1, j, memo), lcs(a, b, i, j - 1, memo));
  }
  return memo[key];
}` },
        pitfalls: [
          "Trying to apply DP to a problem without optimal substructure, where subproblem solutions don't combine cleanly",
          "Memoizing on the wrong set of parameters, so different problem instances collide in the cache",
          "Jumping straight to code without first defining the recurrence relation in plain language",
        ],
        practice: "DP shows up constantly outside interviews too — spell checkers (edit distance), version control diffs, and route planning all lean on the same core technique.",
      },
      { slug: "hashing", title: "Hashing", tag: "core",
        desc: "Hash functions, collision handling, and why hash tables give near-constant-time lookups.",
        keyPoints: [
          "A hash function maps keys to array indices in expected O(1) time",
          "Collisions are handled via chaining (linked lists per bucket) or open addressing (probing)",
          "Load factor (entries / buckets) drives when a hash table resizes and rehashes",
          "Good hash functions distribute keys uniformly, avoiding clustering and worst-case O(n) lookups",
          "Cryptographic hash functions (SHA-256) are designed to be one-way and collision-resistant, unlike hash-table hash functions",
          "Rehashing to a larger table is typically triggered around a 0.7 load factor to keep lookups fast",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// A simple hash table with chaining for collisions
class HashMap {
  constructor(size = 16) {
    this.buckets = Array.from({ length: size }, () => []);
  }
  hash(key) {
    let h = 0;
    for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) % this.buckets.length;
    return h;
  }
  set(key, value) {
    const bucket = this.buckets[this.hash(key)];
    const entry = bucket.find(e => e[0] === key);
    entry ? (entry[1] = value) : bucket.push([key, value]);
  }
  get(key) {
    const entry = this.buckets[this.hash(key)].find(e => e[0] === key);
    return entry ? entry[1] : undefined;
  }
}` },
        pitfalls: [
          "Using a mutable object as a hash key, which can silently break lookups if the object changes after insertion",
          "Assuming hash table order is meaningful — most implementations don't guarantee insertion order",
          "Underestimating how a poor hash function can degrade performance to O(n) under adversarial input",
        ],
        practice: "Caches, database indexes, and deduplication logic all lean on hashing to turn 'is this here?' into a near-instant lookup instead of a scan.",
      },
    ],
  },
  {
    slug: "systems", name: "systems", glyph: "◱", color: "#3B6FA6",
    topics: [
      { slug: "operating-systems", title: "Operating Systems", tag: "core",
        desc: "Processes, threads, and scheduling — how the OS mediates every program's access to hardware.",
        keyPoints: [
          "The kernel mediates all access to hardware: CPU, memory, disk, and I/O devices",
          "Processes have isolated memory; threads share memory within the same process",
          "Common scheduling algorithms: round robin, priority scheduling, multilevel feedback queues",
          "System calls are the interface user programs use to request kernel services",
          "Context switching between processes/threads has real overhead, which is why too many threads can hurt performance",
          "Interrupts let hardware signal the CPU immediately, rather than the CPU having to constantly poll for events",
        ],
        code: { lang: "c", label: "C", code:
`#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();          // create a new process
    if (pid == 0) {
        execlp("ls", "ls", NULL); // child replaces itself with 'ls'
    } else {
        wait(NULL);               // parent waits for the child
    }
    return 0;
}` },
        pitfalls: [
          "Assuming more threads always means more speed — beyond the CPU's core count, threads mostly add overhead",
          "Confusing a process crash with a thread crash — an unhandled thread exception can take down the whole process",
          "Ignoring that file I/O and system calls are often the real bottleneck, not CPU-bound computation",
        ],
        practice: "Every 'why is my app frozen' bug eventually traces back to OS concepts — a blocked thread, a full disk buffer, or a starved scheduler queue.",
      },
      { slug: "architecture", title: "Computer Architecture", tag: "core",
        desc: "CPU pipelines, caching, and the memory hierarchy everything else is built on top of.",
        keyPoints: [
          "Memory hierarchy trades speed for capacity: registers > L1/L2/L3 cache > RAM > disk",
          "Pipelining overlaps instruction stages (fetch, decode, execute) to increase throughput",
          "Cache locality (temporal and spatial) is why 'cache-friendly' code can be far faster",
          "RISC vs. CISC: two philosophies for instruction set design, simple-fixed vs. complex-variable",
          "Branch prediction lets the CPU guess which way an if-statement will go and start executing ahead of time",
          "SIMD instructions let a single CPU instruction operate on multiple data points at once, key to fast numeric code",
        ],
        code: { lang: "c", label: "C", code:
`// Row-major traversal: cache-friendly, sequential memory access
for (int i = 0; i < n; i++)
  for (int j = 0; j < n; j++)
    sum += matrix[i][j];

// Column-major traversal: cache-unfriendly, jumps n elements each step
for (int j = 0; j < n; j++)
  for (int i = 0; i < n; i++)
    sum += matrix[i][j];` },
        pitfalls: [
          "Writing code that jumps around memory unpredictably, defeating the CPU cache and slowing things down dramatically",
          "Assuming clock speed alone determines performance, ignoring instructions-per-cycle and core count",
          "Overlooking that a cache miss can cost 100x longer than a cache hit",
        ],
        practice: "Iterating a 2D array in row-major order instead of column-major order can be several times faster purely because of cache locality — no algorithm change required.",
      },
      { slug: "concurrency", title: "Concurrency", tag: "advanced",
        desc: "Race conditions, locks, and the patterns for writing correct code when multiple things run at once.",
        keyPoints: [
          "A race condition occurs when the outcome depends on unpredictable thread timing",
          "Mutexes enforce mutual exclusion; semaphores control access to a limited resource pool",
          "Deadlock requires four conditions at once: mutual exclusion, hold-and-wait, no preemption, circular wait",
          "Lock-free structures avoid blocking using atomic compare-and-swap operations",
          "Atomic operations complete as a single indivisible step, avoiding the need for a lock on simple counters",
          "Thread pools reuse a fixed set of worker threads instead of creating a new thread per task",
        ],
        code: { lang: "python", label: "Python", code:
`import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100_000):
        with lock:        # only one thread at a time
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(4)]
[t.start() for t in threads]
[t.join() for t in threads]
print(counter)  # deterministic: 400000` },
        pitfalls: [
          "Holding a lock longer than necessary, turning a concurrent program into an effectively sequential one",
          "Acquiring locks in inconsistent order across different code paths, a common cause of deadlock",
          "Assuming 'it worked in testing' means it's race-condition-free — races are often timing-dependent and rare",
        ],
        practice: "Web servers handling thousands of simultaneous requests rely on concurrency primitives to avoid one slow request blocking every other user.",
      },
      { slug: "memory-management", title: "Memory Management", tag: "core",
        desc: "Stack vs. heap, garbage collection, and the pitfalls of manual memory management.",
        keyPoints: [
          "The stack holds fixed-size, function-scoped data with automatic cleanup; the heap is dynamic",
          "Garbage collectors reclaim heap memory via strategies like reference counting or mark-and-sweep",
          "Manual memory management (C/C++) risks leaks, dangling pointers, and double frees",
          "Virtual memory lets a process address more memory than physically exists, backed by paging",
          "Fragmentation happens when free memory is scattered in small chunks too small to satisfy new allocation requests",
          "Generational garbage collectors optimize for the common case that most objects die young",
        ],
        code: { lang: "c", label: "C", code:
`int *arr = malloc(10 * sizeof(int));  // allocate on the heap
if (arr == NULL) return -1;           // always check allocation

arr[0] = 42;
free(arr);       // release the memory
arr = NULL;      // avoid a dangling pointer` },
        pitfalls: [
          "Holding onto references longer than needed in a GC'd language, causing memory leaks despite automatic collection",
          "Manually freeing memory that's still referenced elsewhere, creating a dangling pointer",
          "Assuming stack allocation is always safe for large data — deep recursion or big local arrays can overflow it",
        ],
        practice: "Memory leaks in long-running services (not crashing programs) are usually the hardest bugs to find, since the symptom — slow degradation — only shows up hours or days later.",
      },
      { slug: "compilers", title: "Compilers", tag: "advanced",
        desc: "Lexing, parsing, optimization, and code generation — how source becomes something a machine runs.",
        keyPoints: [
          "Pipeline: lexical analysis → parsing → semantic analysis → optimization → code generation",
          "A lexer turns source text into tokens; a parser builds an abstract syntax tree from them",
          "Optimization passes include constant folding, dead code elimination, and loop unrolling",
          "Interpreters execute code directly; compilers translate it ahead of time",
          "Just-in-time (JIT) compilation compiles code at runtime, blending interpretation's flexibility with compiled speed",
          "Intermediate representations (IR) let a compiler support multiple source languages and target architectures separately",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// A minimal tokenizer for simple arithmetic expressions
function tokenize(input) {
  const tokens = [];
  const regex = /\\s*(\\d+|\\+|-|\\*|\\/|\\(|\\))/g;
  let match;
  while ((match = regex.exec(input))) {
    tokens.push(match[1]);
  }
  return tokens;
}

tokenize("12 + (3 * 4)"); // ["12", "+", "(", "3", "*", "4", ")"]` },
        pitfalls: [
          "Assuming compiled code is always faster than interpreted — JIT-compiled languages can rival ahead-of-time compiled ones",
          "Underestimating how much undefined behavior in a language can let a compiler 'legally' surprise you",
          "Ignoring compiler warnings that flag real bugs disguised as style issues",
        ],
        practice: "Understanding how your compiler optimizes (or doesn't) is why 'premature optimization' advice exists — the compiler may already handle what you're about to hand-optimize.",
      },
    ],
  },
  {
    slug: "ai-ml", name: "ai-ml", glyph: "∑", color: "#8B5CC7",
    topics: [
      { slug: "neural-networks", title: "Neural Networks", tag: "core",
        desc: "Layers, activation functions, and backpropagation — the building blocks of most modern ML.",
        keyPoints: [
          "A network is layers of weighted connections passed through nonlinear activations (ReLU, sigmoid, tanh)",
          "Backpropagation computes gradients via the chain rule to update weights and minimize loss",
          "Overfitting is fought with regularization, dropout, and early stopping",
          "Deeper networks model more complex functions but are harder to train and can vanish gradients",
          "Batch normalization stabilizes training by normalizing layer inputs, allowing higher learning rates",
          "Convolutional layers exploit spatial structure in images; recurrent/transformer layers exploit sequence structure in text",
        ],
        code: { lang: "python", label: "Python", code:
`import numpy as np

def relu(x):
    return np.maximum(0, x)

def forward(x, W1, b1, W2, b2):
    h = relu(x @ W1 + b1)   # hidden layer
    return h @ W2 + b2      # output layer (logits)

# One gradient descent weight update
W1 -= learning_rate * dW1` },
        pitfalls: [
          "Using a learning rate that's too high (training diverges) or too low (training crawls) without tuning",
          "Assuming more layers always helps — very deep networks can perform worse without techniques like residual connections",
          "Training on data that doesn't represent real-world inputs, then being surprised by poor deployment performance",
        ],
        practice: "Image recognition, voice assistants, and recommendation feeds are all neural networks trained on the exact same core mechanics: forward pass, loss, backward pass, repeat.",
      },
      { slug: "supervised-learning", title: "Supervised Learning", tag: "core",
        desc: "Regression and classification, loss functions, and the train/validate/test workflow.",
        keyPoints: [
          "Regression predicts continuous values; classification predicts discrete categories",
          "Common losses: mean squared error (regression), cross-entropy (classification)",
          "The bias-variance tradeoff explains why overly simple and overly complex models both generalize poorly",
          "Data is split into train/validation/test sets to tune and honestly evaluate a model",
          "Feature engineering — choosing and transforming inputs — often matters more than the choice of model",
          "A baseline model (like predicting the average) is essential to know if a complex model is actually helping",
        ],
        code: { lang: "python", label: "Python", code:
`from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)
preds = model.predict(X_test)
print(accuracy_score(y_test, preds))` },
        pitfalls: [
          "Letting information from the test set leak into training, producing misleadingly high accuracy",
          "Ignoring class imbalance, so a model can score 95% accuracy by always predicting the majority class",
          "Chasing a fancier model when the real problem is noisy or insufficient training data",
        ],
        practice: "Fraud detection, medical diagnosis support, and spam filtering are supervised learning at their core — labeled historical examples training a model to label new ones.",
      },
      { slug: "nlp", title: "Natural Language Processing", tag: "advanced",
        desc: "Tokenization, embeddings, and transformers — how models represent and generate language.",
        keyPoints: [
          "Tokenization breaks text into words, subwords, or characters a model can process",
          "Word embeddings (Word2Vec, GloVe) represent words as vectors capturing semantic similarity",
          "Transformers use self-attention to weigh relationships between all tokens at once",
          "Modern LLMs are pretrained on massive text corpora, then fine-tuned for specific tasks",
          "Attention scores let a model learn which words in a sentence matter most for understanding each other word",
          "Fine-tuning adapts a large pretrained model to a specific task using a much smaller labeled dataset",
        ],
        code: { lang: "python", label: "Python", code:
`# Tokenization + a tiny bag-of-words vector
text = "the cat sat on the mat"
tokens = text.split()
vocab = sorted(set(tokens))
vector = [tokens.count(word) for word in vocab]
print(dict(zip(vocab, vector)))
# {'cat': 1, 'mat': 1, 'on': 1, 'sat': 1, 'the': 2}` },
        pitfalls: [
          "Assuming a language model 'understands' meaning the way a human does, rather than predicting likely tokens",
          "Ignoring tokenization quirks — the same word can be split differently depending on context and vocabulary",
          "Evaluating only on English, then being surprised by poor performance on other languages or dialects",
        ],
        practice: "Autocomplete, machine translation, and chatbots all sit on the same NLP foundation: turning text into numbers, modeling relationships between them, then turning numbers back into text.",
      },
      { slug: "reinforcement-learning", title: "Reinforcement Learning", tag: "advanced",
        desc: "Agents, rewards, and policies — learning through interaction rather than labeled data.",
        keyPoints: [
          "An agent learns a policy by interacting with an environment and receiving reward signals",
          "The exploration-exploitation tradeoff balances trying new actions vs. using known good ones",
          "Q-learning estimates the value of an action in a state; deep Q-networks scale this with neural nets",
          "Markov Decision Processes formalize RL as states, actions, transitions, and rewards",
          "A reward function that's too sparse (rare feedback) makes learning slow; shaping it carefully speeds convergence",
          "On-policy methods learn from the current policy's actions; off-policy methods can learn from past or others' experience",
        ],
        code: { lang: "python", label: "Python", code:
`alpha, gamma = 0.1, 0.9

for episode in range(1000):
    state = env.reset()
    action = choose_action(state, Q)      # explore or exploit
    next_state, reward = env.step(action)

    # Q-learning update rule
    Q[state][action] += alpha * (
        reward + gamma * max(Q[next_state]) - Q[state][action]
    )` },
        pitfalls: [
          "Designing a reward function that's technically satisfied in an unintended way — 'reward hacking'",
          "Underestimating how much RL training requires — far more interactions than supervised learning typically needs",
          "Testing only in simulation and assuming the policy transfers cleanly to the real world",
        ],
        practice: "Game-playing agents (chess, Go, video games) and robotic control are the classic RL showcases, but recommendation systems increasingly use RL-style feedback loops too.",
      },
      { slug: "model-evaluation", title: "Model Evaluation", tag: "core",
        desc: "Precision, recall, and the metrics that tell you whether a model actually works.",
        keyPoints: [
          "Accuracy alone is misleading on imbalanced data — precision, recall, and F1 give a fuller picture",
          "A confusion matrix breaks predictions into true/false positives and negatives",
          "Cross-validation (e.g., k-fold) gives a more reliable estimate than a single train/test split",
          "ROC-AUC measures a classifier's ability to distinguish classes across all decision thresholds",
          "A/B testing evaluates a model's real-world impact, which can differ from its offline metrics",
          "Calibration measures whether a model's predicted probabilities actually match observed outcome frequencies",
        ],
        code: { lang: "python", label: "Python", code:
`from sklearn.metrics import precision_score, recall_score, f1_score

precision = precision_score(y_true, y_pred)
recall = recall_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred)

print(f"precision={precision:.2f} recall={recall:.2f} f1={f1:.2f}")` },
        pitfalls: [
          "Reporting a single metric without considering the cost of false positives vs. false negatives for the use case",
          "Evaluating on data too similar to training data, inflating apparent performance",
          "Ignoring performance across subgroups, missing that a model works well on average but poorly for some group",
        ],
        practice: "A spam filter and a cancer-screening model might have the same accuracy but need wildly different precision/recall tradeoffs, since the cost of a missed positive differs enormously.",
      },
    ],
  },
  {
    slug: "databases", name: "databases", glyph: "⌗", color: "#C2622D",
    topics: [
      { slug: "relational-sql", title: "Relational Model & SQL", tag: "core",
        desc: "Tables, keys, and joins — the query language underlying most production data stores.",
        keyPoints: [
          "Data lives in tables (relations) with rows (tuples) and columns (attributes)",
          "Primary keys uniquely identify rows; foreign keys enforce relationships between tables",
          "Joins (inner, left, right, full) combine rows from multiple tables on related columns",
          "Normalization reduces redundancy by organizing data according to normal forms (1NF, 2NF, 3NF)",
          "Aggregate functions (COUNT, SUM, AVG) combined with GROUP BY summarize data across many rows at once",
          "Views are saved queries that behave like virtual tables, simplifying repeated complex logic",
        ],
        code: { lang: "sql", label: "SQL", code:
`SELECT customers.name, COUNT(orders.id) AS order_count
FROM customers
JOIN orders ON orders.customer_id = customers.id
WHERE orders.created_at >= '2026-01-01'
GROUP BY customers.name
ORDER BY order_count DESC;` },
        pitfalls: [
          "Using SELECT * in production code, pulling unnecessary columns and breaking when the schema changes",
          "Forgetting that NULL comparisons (= NULL) never return true — IS NULL is required instead",
          "Writing correlated subqueries that re-run per row, when a JOIN would be far more efficient",
        ],
        practice: "Almost every dashboard, report, or admin panel you've used is ultimately a SQL query rendered as a table or chart.",
      },
      { slug: "indexing", title: "Indexing", tag: "core",
        desc: "B-trees and how databases avoid scanning every row for every query.",
        keyPoints: [
          "An index is a separate structure (often a B-tree) that speeds up lookups on a column",
          "Indexes speed up reads but slow down writes, since every insert/update also updates the index",
          "Composite indexes cover multiple columns but only help when queried in a matching column order",
          "Over-indexing wastes storage and can hurt write performance more than it helps reads",
          "A covering index includes all columns a query needs, letting the database skip the table entirely",
          "Index selectivity — how many distinct values a column has — determines how much an index actually helps",
        ],
        code: { lang: "sql", label: "SQL", code:
`-- Speeds up lookups on email, since it's queried often
CREATE INDEX idx_users_email ON users (email);

EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'ada@example.com';` },
        pitfalls: [
          "Indexing every column 'just in case', which bloats storage and slows every write",
          "Expecting an index to help when a query wraps the column in a function, which can prevent its use",
          "Not rebuilding or analyzing indexes over time as data distribution changes",
        ],
        practice: "A single well-placed index can turn a report that takes minutes into one that takes milliseconds — it's usually the highest-leverage database fix available.",
      },
      { slug: "transactions-acid", title: "Transactions & ACID", tag: "advanced",
        desc: "The four guarantees that make databases trustworthy under concurrent access and failure.",
        keyPoints: [
          "Atomicity means a transaction either fully completes or fully rolls back, never partially",
          "Consistency means a transaction moves the database from one valid state to another",
          "Isolation levels (read uncommitted, read committed, repeatable read, serializable) trade consistency for concurrency performance",
          "Optimistic locking checks for conflicts at commit time; pessimistic locking prevents conflicts by locking upfront",
        ],
        code: { lang: "sql", label: "SQL", code:
`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- both updates succeed together, or neither does` },
        pitfalls: [
          "Assuming 'serializable' isolation is free — it's the strictest and often the slowest option",
          "Wrapping unrelated operations into one giant transaction, increasing lock contention unnecessarily",
          "Forgetting that distributed transactions across services need different patterns (like sagas) than single-database ACID",
        ],
        practice: "A bank transfer is the textbook ACID example: debiting one account and crediting another must happen entirely or not at all, even if the server crashes mid-operation.",
        table: { headers: ["Property", "Guarantee"], rows: [
          ["Atomicity", "A transaction fully completes or fully rolls back"],
          ["Consistency", "A transaction moves the DB from one valid state to another"],
          ["Isolation", "Concurrent transactions don't interfere with each other"],
          ["Durability", "Committed changes survive crashes or power loss"],
        ]},
      },
      { slug: "nosql", title: "NoSQL", tag: "core",
        desc: "Document, key-value, and graph stores — when to trade relational structure for scale or flexibility.",
        keyPoints: [
          "Document stores (MongoDB) hold flexible, JSON-like records without a fixed schema",
          "Key-value stores (Redis) offer extremely fast lookups by a single key",
          "Column-family stores (Cassandra) optimize for write-heavy, wide-column workloads at scale",
          "NoSQL systems often favor eventual consistency and horizontal scaling over strict ACID",
          "Graph databases (Neo4j) optimize specifically for traversing relationships, outperforming relational joins at deep connections",
          "Schema flexibility in document stores shifts validation responsibility from the database to the application layer",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Document store: flexible schema per record
db.products.insertOne({
  name: "Wireless Mouse",
  price: 24.99,
  specs: { dpi: 1600, wireless: true } // nested, no fixed columns
});

db.products.find({ "specs.wireless": true });` },
        pitfalls: [
          "Choosing NoSQL by default for 'scale' when a well-indexed relational database would have handled the load fine",
          "Modeling data exactly like a relational schema inside a document store, losing the benefits of denormalization",
          "Underestimating the complexity of maintaining consistency across a distributed NoSQL cluster",
        ],
        practice: "A social media feed, a product catalog with wildly varying attributes, or a real-time leaderboard are common cases where NoSQL's flexibility or speed outweighs relational structure.",
      },
      { slug: "query-optimization", title: "Query Optimization", tag: "advanced",
        desc: "Execution plans and how the database decides the fastest way to answer a query.",
        keyPoints: [
          "The query planner estimates the cost of different execution strategies before running a query",
          "EXPLAIN ANALYZE shows the actual chosen plan, useful for diagnosing slow queries",
          "Poor performance is often a missing index, a full table scan, or an unnecessary join",
          "Denormalization sometimes trades storage and redundancy for faster reads",
          "Statistics about data distribution (row counts, value spread) drive most of the planner's cost estimates",
          "Partitioning splits a large table into smaller physical pieces, letting queries skip irrelevant partitions entirely",
        ],
        code: { lang: "sql", label: "SQL", code:
`-- Before: full scan on a large table
SELECT * FROM orders WHERE status = 'pending';

-- After: an index lets the planner skip the scan
CREATE INDEX idx_orders_status ON orders (status);
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';` },
        pitfalls: [
          "Optimizing a query in isolation without considering how it performs under real concurrent load",
          "Trusting stale statistics after a large bulk data change, leading the planner to a bad plan",
          "Adding indexes to fix a slow query without checking whether the query itself could be rewritten more simply",
        ],
        practice: "A query that's fast on a 1,000-row test table can become unusably slow at 10 million rows — optimization work usually only becomes visible at production scale.",
      },
    ],
  },
  {
    slug: "networking", name: "networking", glyph: "⇄", color: "#2C8FA8",
    topics: [
      { slug: "osi-model", title: "OSI Model", tag: "core",
        desc: "The seven-layer mental model for how data moves from an application down to a wire and back.",
        keyPoints: [
          "Data is encapsulated with headers going down the stack, and stripped going back up",
          "The TCP/IP model condenses these seven layers into four: Link, Internet, Transport, Application",
          "Layer 3 handles logical addressing and routing; Layer 2 handles physical (MAC) addressing",
          "Most day-to-day web development lives entirely at Layer 7 (Application)",
          "Network engineers often say 'it's a layer 8 problem' as a joke — meaning the issue is human/process, not technical",
          "Troubleshooting typically starts at the bottom (Physical) and works up, or top-down depending on the symptom",
        ],
        code: { lang: "bash", label: "Bash", code:
`ping 8.8.8.8                  # Layer 3: is there IP connectivity?
traceroute example.com        # Layer 3: where does it fail?
dig example.com                # Layer 7: does DNS resolve?
curl -I https://example.com    # Layer 7: does HTTP respond?` },
        pitfalls: [
          "Treating the OSI model as literally how real protocol stacks are implemented, rather than a conceptual reference",
          "Confusing routers (Layer 3) with switches (Layer 2) and their different addressing responsibilities",
          "Assuming a 'connection' at one layer guarantees anything about reliability at another layer",
        ],
        practice: "When 'the internet is down,' working through the layers — cable, IP address, DNS, then the app itself — is exactly how real troubleshooting proceeds.",
        table: { headers: ["#", "Layer", "Example"], rows: [
          ["7", "Application", "HTTP, FTP, DNS"],
          ["6", "Presentation", "Encryption, encoding"],
          ["5", "Session", "Session establishment"],
          ["4", "Transport", "TCP, UDP"],
          ["3", "Network", "IP, routing"],
          ["2", "Data Link", "Ethernet, MAC addresses"],
          ["1", "Physical", "Cables, radio signals"],
        ]},
      },
      { slug: "tcp-ip", title: "TCP/IP", tag: "core",
        desc: "How packets are addressed, routed, and reliably delivered across the internet.",
        keyPoints: [
          "TCP is connection-oriented and reliable, guaranteeing ordered delivery via acknowledgments",
          "UDP is connectionless and faster but offers no delivery guarantees — used for streaming, gaming",
          "The three-way handshake (SYN, SYN-ACK, ACK) establishes a TCP connection before data transfer",
          "IP addresses identify hosts; ports identify specific applications or services on those hosts",
          "TCP uses sequence numbers and acknowledgments to detect and retransmit lost packets automatically",
          "NAT (Network Address Translation) lets many devices on a private network share one public IP address",
        ],
        code: { lang: "python", label: "Python", code:
`import socket

# TCP: reliable, connection-oriented
tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp.connect(("example.com", 80))

# UDP: connectionless, no delivery guarantee
udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp.sendto(b"ping", ("example.com", 9999))` },
        pitfalls: [
          "Assuming UDP is unreliable and therefore rarely useful — many real-time systems prefer it precisely for that tradeoff",
          "Forgetting that TCP's reliability guarantees add latency, which matters for real-time applications like gaming or calls",
          "Confusing a closed port with a firewall block — they look similar but have very different causes",
        ],
        practice: "Video calls typically use UDP (drop a frame rather than wait for it), while file downloads use TCP (every byte must arrive intact) — the same network, two different tradeoffs.",
      },
      { slug: "http-web", title: "HTTP & the Web", tag: "core",
        desc: "Requests, responses, and status codes — the protocol behind nearly every web app.",
        keyPoints: [
          "HTTP is stateless — each request is independent, which is why cookies/sessions exist",
          "Common methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)",
          "HTTPS wraps HTTP in TLS encryption to protect data in transit",
          "REST APIs use HTTP methods and status codes to represent operations on resources",
          "HTTP/2 and HTTP/3 improve on HTTP/1.1 mainly by multiplexing multiple requests over fewer connections",
          "Caching headers (Cache-Control, ETag) let browsers and CDNs avoid re-fetching unchanged resources",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`const res = await fetch("/api/users/42", {
  method: "GET",
  headers: { "Accept": "application/json" }
});

if (res.status === 200) {
  const user = await res.json();
} else if (res.status === 404) {
  console.log("user not found");
}` },
        pitfalls: [
          "Using GET requests to change server state, breaking caching and idempotency assumptions",
          "Returning 200 OK with an error message in the body instead of an accurate status code",
          "Ignoring CORS errors as 'just a browser thing' rather than understanding the security model behind them",
        ],
        practice: "Every API you've called from a frontend app — fetching a user profile, submitting a form, loading a feed — is this same request/response cycle underneath.",
        table: { headers: ["Range", "Meaning", "Example"], rows: [
          ["1xx", "Informational", "100 Continue"],
          ["2xx", "Success", "200 OK"],
          ["3xx", "Redirection", "301 Moved Permanently"],
          ["4xx", "Client Error", "404 Not Found"],
          ["5xx", "Server Error", "500 Internal Server Error"],
        ]},
      },
      { slug: "dns", title: "DNS", tag: "core",
        desc: "How human-readable domain names get resolved into IP addresses.",
        keyPoints: [
          "DNS resolves domain names into IP addresses through a hierarchical lookup",
          "Resolution flows: browser cache → OS cache → recursive resolver → root, TLD, authoritative servers",
          "Common record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail server)",
          "TTL controls how long a record is cached before it's looked up again",
          "Anycast routing lets the same DNS/IP address resolve to the nearest of many physical servers",
          "DNSSEC adds cryptographic signatures to DNS responses, defending against certain spoofing attacks",
        ],
        code: { lang: "bash", label: "Bash", code:
`dig example.com A +short      # get the IPv4 address
dig example.com MX +short     # get the mail servers
dig example.com +trace        # follow root -> TLD -> authoritative` },
        pitfalls: [
          "Assuming DNS changes take effect instantly — cached TTLs can delay propagation for hours",
          "Confusing a DNS failure with a server-down issue, since both look like 'the site won't load'",
          "Forgetting that lowering a TTL should happen before a planned change, not during it",
        ],
        practice: "When you register a new domain and 'it doesn't work yet,' you're usually just waiting on DNS propagation across the world's caching resolvers.",
      },
      { slug: "network-security", title: "Network Security", tag: "advanced",
        desc: "Firewalls, TLS, and common attack vectors at the network layer.",
        keyPoints: [
          "Firewalls filter traffic based on rules about ports, IP addresses, and protocols",
          "TLS/SSL provides encryption, authentication, and integrity for data in transit",
          "A VPN creates an encrypted tunnel between a device and a network over an untrusted connection",
          "Common attacks: man-in-the-middle, DDoS, and packet sniffing on unencrypted traffic",
          "A DMZ (demilitarized zone) isolates public-facing servers from the internal network they might expose if compromised",
          "Rate limiting and WAFs (web application firewalls) mitigate abuse at the application layer, not just the network layer",
        ],
        code: { lang: "bash", label: "Bash", code:
`# Only allow HTTPS and SSH inbound, drop everything else
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -j DROP` },
        pitfalls: [
          "Relying on a firewall alone, without patching the actual vulnerable software behind it",
          "Trusting internal network traffic by default, the exact assumption zero trust architecture rejects",
          "Treating HTTPS as sufficient security by itself, when it only protects data in transit, not at rest or app logic",
        ],
        practice: "Most real breaches don't involve exotic attacks — they involve unpatched software, weak credentials, or a misconfigured permission, all things layered network security is designed to catch.",
      },
    ],
  },
  {
    slug: "software-eng", name: "software-eng", glyph: "{}", color: "#4A6FA0",
    topics: [
      { slug: "design-patterns", title: "Design Patterns", tag: "core",
        desc: "Reusable solutions to recurring design problems, and when (not) to reach for them.",
        keyPoints: [
          "Creational patterns (factory, singleton, builder) manage object creation",
          "Structural patterns (adapter, decorator, facade) manage how objects and classes compose",
          "Behavioral patterns (observer, strategy, command) manage communication between objects",
          "Patterns are a shared vocabulary, not a checklist — apply them when they fit a real problem",
          "The strategy pattern lets you swap an algorithm's implementation at runtime without changing the code that uses it",
          "Overusing patterns to look 'enterprise' is a well-known anti-pattern in itself — sometimes a function is enough",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Strategy pattern: swap behavior without changing the caller
class PaymentContext {
  constructor(strategy) { this.strategy = strategy; }
  pay(amount) { return this.strategy.pay(amount); }
}

const creditCard = { pay: (amt) => \`Charged $\${amt} to card\` };
const payPal = { pay: (amt) => \`Sent $\${amt} via PayPal\` };

const checkout = new PaymentContext(payPal);
checkout.pay(50);` },
        pitfalls: [
          "Forcing a pattern onto a problem it doesn't actually fit, adding complexity instead of reducing it",
          "Treating patterns as a vocabulary test rather than understanding the problem each one solves",
          "Ignoring that many patterns exist because of language limitations that modern languages have since solved differently",
        ],
        practice: "Observer pattern powers everything from UI event listeners to pub/sub message queues — the same idea recurs at wildly different scales.",
      },
      { slug: "testing", title: "Testing", tag: "core",
        desc: "Unit, integration, and end-to-end testing, and the mindset of writing testable code.",
        keyPoints: [
          "Unit tests verify individual functions or components in isolation, often with mocked dependencies",
          "Integration tests verify that multiple components work correctly together",
          "End-to-end tests simulate real user flows through the entire system",
          "The testing pyramid: many fast unit tests, fewer integration tests, very few slow E2E tests",
          "Test-driven development (TDD) writes a failing test before the implementation, using tests to drive design",
          "Flaky tests — passing or failing inconsistently — erode trust in a test suite faster than having no tests at all",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`function add(a, b) { return a + b; }

test("adds two numbers", () => {
  expect(add(2, 3)).toBe(5);
});

test("handles negative numbers", () => {
  expect(add(-1, 1)).toBe(0);
});` },
        pitfalls: [
          "Writing tests that check implementation details rather than behavior, breaking on every harmless refactor",
          "Chasing 100% code coverage as a goal, rather than covering the code paths that actually matter",
          "Mocking so much that a 'passing' test no longer proves the real components work together",
        ],
        practice: "A good test suite is what lets a team ship on a Friday afternoon without dread — confidence that a change didn't silently break something else.",
      },
      { slug: "version-control", title: "Version Control", tag: "core",
        desc: "Branching, merging, and using git as more than just a save button.",
        keyPoints: [
          "A commit is a snapshot of the repository at a point in time, not just a diff",
          "Branching lets you develop features in isolation before merging back into the main line",
          "Merge conflicts occur when the same lines are changed differently on two branches",
          "Rebasing rewrites history for a linear log; merging preserves the original branch history",
          "A pull request is both a code review mechanism and a record of why a change was made",
          "Git bisect uses binary search across commit history to quickly find which commit introduced a bug",
        ],
        code: { lang: "bash", label: "Bash", code:
`git checkout -b feature/login
git add . && git commit -m "Add login form validation"
git push origin feature/login

git bisect start          # binary search for a bad commit
git bisect bad HEAD
git bisect good v1.2.0` },
        pitfalls: [
          "Committing generated files or secrets into version control, which are painful to fully remove later",
          "Writing vague commit messages ('fix stuff') that give future-you no useful history to search",
          "Force-pushing to a shared branch, silently overwriting a teammate's work",
        ],
        practice: "When production breaks after a deploy, git blame and bisect are usually the fastest way to find exactly which change caused it.",
      },
      { slug: "system-design", title: "System Design", tag: "advanced",
        desc: "Scaling, load balancing, and designing systems for real-world constraints.",
        keyPoints: [
          "Horizontal scaling adds more machines; vertical scaling adds more power to one machine",
          "Load balancers distribute traffic across multiple servers to avoid single points of failure",
          "Caching (CDN, in-memory, database) reduces load and latency for frequently accessed data",
          "CAP theorem: a distributed system can only guarantee two of Consistency, Availability, Partition tolerance",
          "Database read replicas offload read traffic from the primary database, a common first scaling step",
          "Message queues decouple services so a slow or failing consumer doesn't take down the producer",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// A simple round-robin load balancer
class LoadBalancer {
  constructor(servers) { this.servers = servers; this.index = 0; }
  getServer() {
    const server = this.servers[this.index];
    this.index = (this.index + 1) % this.servers.length;
    return server;
  }
}` },
        pitfalls: [
          "Designing for a scale you don't have yet, adding complexity that slows down actual early-stage development",
          "Treating caching as a free performance win, without a plan for cache invalidation",
          "Ignoring failure modes — designing only for the happy path where every service always responds",
        ],
        practice: "System design interviews exist because the same handful of building blocks — load balancer, cache, queue, replica — combine differently to solve almost every real scaling problem.",
      },
      { slug: "agile-process", title: "Agile & Process", tag: "core",
        desc: "Sprints, standups, and the team workflows that shape how software actually gets built.",
        keyPoints: [
          "Agile favors iterative delivery in short cycles (sprints) over long upfront planning",
          "A backlog is a prioritized list of work; sprint planning selects what gets tackled next",
          "Standups are short, frequent syncs to surface blockers, not status reports for management",
          "Retrospectives close each cycle by reflecting on what worked and what to change",
          "Story points estimate relative effort/complexity, not hours, to avoid false precision in planning",
          "A definition of done sets a shared bar for when a piece of work actually counts as complete",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`const sprintBacklog = [
  { title: "Add password reset", points: 3, status: "in-progress" },
  { title: "Fix mobile nav bug", points: 1, status: "done" },
];

const velocity = sprintBacklog
  .filter(item => item.status === "done")
  .reduce((sum, item) => sum + item.points, 0);` },
        pitfalls: [
          "Treating agile ceremonies as the goal rather than tools in service of shipping working software",
          "Overloading a sprint with more work than the team's historical velocity supports",
          "Skipping retrospectives when things are going well, missing the chance to reinforce what's working",
        ],
        practice: "Agile's real value shows up when priorities shift mid-project — a well-run process absorbs that change in days, not months.",
      },
    ],
  },
  {
    slug: "theory", name: "theory", glyph: "∀", color: "#7A6FD1",
    topics: [
      { slug: "automata", title: "Automata Theory", tag: "advanced",
        desc: "Finite state machines and the formal models that describe what a computation can look like.",
        keyPoints: [
          "A finite automaton is a simple machine with states and transitions recognizing regular languages",
          "Deterministic (DFA) and nondeterministic (NFA) automata are provably equivalent in power",
          "Regular expressions and finite automata describe exactly the same class of languages",
          "Pushdown automata add a stack, recognizing context-free languages finite automata cannot",
          "The pumping lemma is a standard tool for proving a language is NOT regular",
          "Every regular language can be recognized by some DFA with a finite, fixed number of states",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// DFA that accepts binary strings ending in "01"
const transitions = {
  q0: { "0": "q1", "1": "q0" },
  q1: { "0": "q1", "1": "q2" },
  q2: { "0": "q1", "1": "q0" },
};

function accepts(str) {
  let state = "q0";
  for (const ch of str) state = transitions[state][ch];
  return state === "q2";
}

accepts("1101"); // true — ends in "01"` },
        pitfalls: [
          "Assuming any pattern-matching problem is regular — nested or balanced structures (like matching parentheses) are not",
          "Confusing an NFA's 'multiple possible paths' with actual nondeterminism in real hardware",
          "Forgetting that minimizing a DFA doesn't change what language it recognizes, only its state count",
        ],
        practice: "Every regex engine, lexer, and simple pattern matcher is a finite automaton under the hood, even when the syntax looks nothing like states and transitions.",
      },
      { slug: "turing-machines", title: "Turing Machines", tag: "advanced",
        desc: "The abstract model that defines what 'computable' actually means.",
        keyPoints: [
          "A Turing machine is an abstract model with an infinite tape, a head, and a set of rules",
          "The Church-Turing thesis holds that anything 'computable' can be computed by a Turing machine",
          "A problem is decidable if a Turing machine always halts with a correct yes/no answer",
          "The halting problem proves no algorithm can determine, for all programs, whether it halts",
          "A universal Turing machine can simulate any other Turing machine, given its description as input",
          "Different computational models (lambda calculus, Turing machines) have been proven equivalent in what they can compute",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// A single step of a very simplified Turing machine
function step(tape, head, state, rules) {
  const symbol = tape[head] ?? "_";
  const [write, move, next] = rules[state][symbol];
  tape[head] = write;
  return { head: head + (move === "R" ? 1 : -1), state: next };
}` },
        pitfalls: [
          "Treating 'Turing complete' as meaning 'practical' — a language can be Turing complete and still terrible for real use",
          "Assuming undecidability means 'we haven't found an algorithm yet' rather than 'no algorithm can ever exist'",
          "Confusing computability (can it be computed at all) with complexity (how efficiently can it be computed)",
        ],
        practice: "When someone says a language or system is 'Turing complete,' they mean it can theoretically compute anything computable — CSS and even some spreadsheets have been shown to qualify.",
      },
      { slug: "complexity-classes", title: "Complexity Classes (P vs NP)", tag: "advanced",
        desc: "Classifying problems by how hard they are to solve — and the biggest open question in the field.",
        keyPoints: [
          "P is the class of problems solvable in polynomial time; NP is the class verifiable in polynomial time",
          "Every problem in P is also in NP — the open question is whether P equals NP",
          "NP-complete problems are the hardest problems in NP; solving one efficiently would solve them all",
          "NP-hard problems are at least as hard as NP-complete ones but may not themselves be in NP",
          "NP-complete problems are often solved in practice with heuristics or approximations rather than exact algorithms",
          "Reduction — showing one NP-complete problem can be transformed into another — is how new problems join the class",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Verifying a candidate solution is fast (polynomial)
function verifySubsetSum(nums, subset, target) {
  return subset.every(n => nums.includes(n)) &&
         subset.reduce((a, b) => a + b, 0) === target;
}

// Finding the solution by brute force is exponential — tries all 2^n subsets` },
        pitfalls: [
          "Assuming a problem is 'impossible' because it's NP-hard, when good-enough approximate solutions often exist",
          "Confusing NP ('nondeterministic polynomial', i.e. verifiable quickly) with 'not polynomial'",
          "Believing P vs NP has been resolved — it remains one of the most famous open problems in mathematics",
        ],
        practice: "The traveling salesman problem, scheduling, and many optimization problems businesses solve daily are NP-hard — solved in practice with approximations, not exact brute force.",
        table: { headers: ["Class", "Meaning"], rows: [
          ["P", "Solvable in polynomial time"],
          ["NP", "Verifiable in polynomial time"],
          ["NP-complete", "Hardest problems in NP — solving one solves them all"],
          ["NP-hard", "At least as hard as NP-complete, may not be in NP"],
        ]},
      },
      { slug: "computability", title: "Computability", tag: "advanced",
        desc: "What problems can never be solved by any algorithm, no matter how much time you have.",
        keyPoints: [
          "Some problems are provably impossible for any algorithm to solve, regardless of resources",
          "The halting problem is the canonical example of an undecidable problem",
          "Reduction — transforming one problem into another — is the standard tool for proving undecidability",
          "Computability sets the outer boundary of what software can ever do, before efficiency matters",
          "Rice's theorem generalizes the halting problem: almost any nontrivial property of a program's behavior is undecidable",
          "Some undecidable problems are still 'semi-decidable' — an algorithm can confirm yes-instances but may run forever on no-instances",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// You cannot write a general isDecidable(fn, input) that
// always halts and correctly answers "does fn(input) halt?"
// This is the halting problem — provably impossible in general.
function riskyCall(fn, input) {
  return fn(input); // might run forever — no way to know in advance
}` },
        pitfalls: [
          "Assuming a specific case being undecidable in general means every instance of it is unsolvable",
          "Conflating 'my program can't figure this out' with a formal proof of undecidability",
          "Ignoring that many real tools (linters, type checkers) work around undecidability with conservative approximations",
        ],
        practice: "Static analysis tools can never perfectly predict every bug — the halting problem guarantees some questions about arbitrary code are simply unanswerable in general.",
      },
      { slug: "formal-languages", title: "Formal Languages", tag: "core",
        desc: "Grammars and language hierarchies that underpin parsing and compiler design.",
        keyPoints: [
          "The Chomsky hierarchy ranks language classes: regular, context-free, context-sensitive, recursively enumerable",
          "A grammar defines a language through production rules that generate valid strings",
          "Context-free grammars are the basis for most programming language syntax and parsers",
          "Parsing determines whether — and how — a string can be derived from a grammar's rules",
          "Ambiguous grammars can parse the same string in more than one way, a real problem for compiler correctness",
          "Parser generators (like Yacc/Bison, ANTLR) build a parser automatically from a formal grammar specification",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Context-free grammar: S -> ( S ) S | epsilon
function generateBalanced(depth) {
  if (depth === 0) return "";
  return "(" + generateBalanced(depth - 1) + ")" + generateBalanced(depth - 1);
}` },
        pitfalls: [
          "Assuming natural language can be captured by the same context-free grammars used for programming languages",
          "Writing a grammar with unintended ambiguity, causing a parser to behave unpredictably",
          "Underestimating how much of 'understanding syntax' is really about understanding grammar formalism",
        ],
        practice: "Every programming language's syntax reference is essentially a formal grammar — and every 'syntax error' is the parser reporting a string that grammar can't derive.",
      },
    ],
  },
  {
    slug: "security", name: "security", glyph: "⚿", color: "#B5473E",
    topics: [
      { slug: "cryptography", title: "Cryptography Basics", tag: "core",
        desc: "Symmetric vs. asymmetric encryption, hashing, and how secure communication works.",
        keyPoints: [
          "Symmetric encryption uses one shared key for both directions — fast, but key distribution is hard",
          "Asymmetric encryption uses a public/private key pair, solving distribution at the cost of speed",
          "Hashing is one-way — used for integrity checks and password storage, not encryption",
          "Digital signatures use asymmetric keys to prove authenticity and integrity of a message",
          "Perfect forward secrecy ensures that a compromised key today can't decrypt past recorded sessions",
          "Key exchange protocols (like Diffie-Hellman) let two parties agree on a shared secret over an insecure channel",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Hashing (one-way) with the Web Crypto API
const data = new TextEncoder().encode("hello world");
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashHex = [...new Uint8Array(hashBuffer)]
  .map(b => b.toString(16).padStart(2, "0")).join("");` },
        pitfalls: [
          "Rolling your own cryptography instead of using well-vetted, standard libraries and algorithms",
          "Assuming encryption alone guarantees integrity — encrypted data can still be tampered with without authentication",
          "Reusing the same key or nonce across multiple encryptions, which can leak information depending on the scheme",
        ],
        practice: "Every HTTPS connection performs a real-time key exchange, symmetric encryption for speed, and hashing for integrity, all in the time it takes a page to start loading.",
      },
      { slug: "web-vulnerabilities", title: "Web Vulnerabilities", tag: "core",
        desc: "SQL injection, XSS, CSRF — common exploits and how to prevent them.",
        keyPoints: [
          "SQL injection exploits unsanitized input to run unintended database queries",
          "Cross-site scripting (XSS) injects malicious scripts into pages viewed by other users",
          "Cross-site request forgery (CSRF) tricks a logged-in user's browser into unwanted requests",
          "Input validation, parameterized queries, and output encoding defend against all three",
          "Insecure direct object references let a user access data by simply changing an ID in a URL",
          "Security headers (Content-Security-Policy, X-Frame-Options) add browser-enforced defenses beyond server-side code",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Vulnerable: string concatenation
const query = \`SELECT * FROM users WHERE email = '\${email}'\`;

// Safe: parameterized query
db.query("SELECT * FROM users WHERE email = ?", [email]);` },
        pitfalls: [
          "Sanitizing input on the client side only, which an attacker can simply bypass",
          "Trusting that 'nobody would guess that URL' is a valid access control strategy",
          "Concatenating strings to build SQL or shell commands instead of using parameterized calls",
        ],
        practice: "Bug bounty reports are dominated by these same few vulnerability classes — most real-world breaches aren't exotic, they're a missed input check.",
      },
      { slug: "authentication", title: "Authentication", tag: "core",
        desc: "Passwords, tokens, and OAuth — verifying who's actually making a request.",
        keyPoints: [
          "Authentication verifies identity; authorization determines what that identity can do",
          "Passwords should be stored as salted hashes (bcrypt, Argon2), never plaintext",
          "Sessions track logged-in state server-side; tokens (like JWTs) encode it client-side",
          "OAuth lets a user grant limited access to their data without sharing their password",
          "Multi-factor authentication combines something you know, have, or are, so one compromised factor isn't enough",
          "Session fixation and token theft are why secure, HttpOnly, and properly-scoped cookies matter",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`const bcrypt = require("bcrypt");

const hash = await bcrypt.hash(password, 12);   // store this, not the password
const isValid = await bcrypt.compare(inputPassword, hash);` },
        pitfalls: [
          "Storing authentication tokens in a way accessible to client-side scripts, exposing them to XSS attacks",
          "Rolling a custom authentication scheme instead of using a well-audited library or provider",
          "Treating 'logged in' and 'authorized for this specific action' as the same check",
        ],
        practice: "'Login with Google/GitHub' buttons are OAuth in action — letting you prove identity to a third party without ever handing your password to the app you're using.",
      },
      { slug: "network-security-2", title: "Network Security", tag: "advanced",
        desc: "Defending infrastructure at scale, rather than a single application.",
        keyPoints: [
          "Defense in depth layers multiple protections so no single failure compromises the whole system",
          "Intrusion detection systems monitor traffic for known attack patterns or anomalies",
          "Zero trust assumes no device or user is inherently trusted, even inside the perimeter",
          "Regular patching closes known vulnerabilities before they're exploited at scale",
          "Segmentation limits how far an attacker can move laterally after breaching one part of a network",
          "Threat modeling systematically asks 'what could go wrong here' before a system is built, not after",
        ],
        code: { lang: "bash", label: "Bash", code:
`# nginx: limit requests per IP to slow down abuse
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

location /api/ {
  limit_req zone=api burst=10 nodelay;
}` },
        pitfalls: [
          "Assuming a strong perimeter defense means internal systems don't need their own security",
          "Delaying patches because 'nothing's broken,' leaving known vulnerabilities exposed",
          "Underinvesting in logging, so a breach isn't discovered until long after it happened",
        ],
        practice: "The average time to detect a breach is often measured in months, which is exactly why monitoring and segmentation matter as much as prevention.",
      },
      { slug: "secure-coding", title: "Secure Coding", tag: "core",
        desc: "Input validation, least privilege, and writing code that isn't vulnerable by default.",
        keyPoints: [
          "Never trust client-side input — validate and sanitize everything on the server",
          "The principle of least privilege limits access to only what's necessary",
          "Dependency vulnerabilities are a common attack surface — keep libraries patched and audited",
          "Fail securely: an error should never leave a system in a more permissive or exposed state",
          "Threat modeling and code review catch entire classes of bugs that automated scanners miss",
          "Secure defaults (deny by default, fail closed) limit damage when something does go wrong",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`function createUser(input) {
  if (!input.email || !/^[^@]+@[^@]+\\.[^@]+$/.test(input.email)) {
    throw new Error("Invalid email");
  }
  const role = "user"; // never trust a client-supplied role
  return db.users.insert({ email: input.email, role });
}` },
        pitfalls: [
          "Trusting third-party dependencies without checking their maintenance status or known vulnerabilities",
          "Logging sensitive data (passwords, tokens) in plaintext, creating a new leak vector",
          "Assuming security is a final step before launch rather than a concern throughout development",
        ],
        practice: "The cheapest time to fix a security flaw is during code review — the same bug found after a breach costs orders of magnitude more in cleanup and trust.",
      },
    ],
  },
  {
    slug: "web-dev", name: "web-dev", glyph: "</>", color: "#2E9E5B",
    topics: [
      { slug: "html-semantics", title: "HTML & Semantic Markup", tag: "core",
        desc: "Structure and meaning, not appearance — the foundation every page is built on.",
        keyPoints: [
          "Semantic tags (nav, article, section) improve accessibility and SEO over generic divs",
          "The DOM is a live tree representation of the page that JavaScript can read and modify",
          "Attributes like alt, aria-label, and role make content usable by screen readers",
          "Form input types and validation attributes handle a huge share of real-world interaction",
          "The head/body split separates document metadata from visible content, but both affect how a page performs",
          "Landmark roles (main, nav, footer) let assistive technology users jump directly to page sections",
        ],
        code: { lang: "html", label: "HTML", code:
`<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
<main>
  <article>
    <h1>Post title</h1>
    <p>Content goes here.</p>
  </article>
</main>` },
        pitfalls: [
          "Using a div with a click handler instead of a real button, breaking keyboard and screen-reader access",
          "Nesting headings out of order (h1 to h4, skipping h2/h3), which confuses document outline tools",
          "Treating alt text as optional decoration rather than essential content for non-visual users",
        ],
        practice: "A well-structured HTML document is usable even with CSS and JavaScript disabled — that's the real test of whether markup is doing its job.",
      },
      { slug: "css-layout", title: "CSS Layout (Flexbox/Grid)", tag: "core",
        desc: "The two layout systems that power nearly every modern web interface.",
        keyPoints: [
          "Flexbox lays out items along a single axis (row or column), ideal for components",
          "Grid lays out items in two dimensions at once, ideal for full page layouts",
          "The box model (content, padding, border, margin) governs how elements take up space",
          "Specificity and the cascade determine which conflicting CSS rule actually applies",
          "align-items controls the cross-axis, justify-content controls the main-axis — mixing these up is the most common flexbox confusion",
          "CSS custom properties (variables) let a design system's values live in one place and cascade everywhere",
        ],
        code: { lang: "css", label: "CSS", code:
`.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}` },
        pitfalls: [
          "Fighting flexbox to build a two-dimensional layout it wasn't designed for, when Grid fits better",
          "Overriding styles with !important instead of understanding why specificity resolved differently",
          "Assuming a layout that works in one browser works identically everywhere without testing",
        ],
        practice: "Modern component libraries lean almost entirely on Flexbox and Grid now — older float-based layout techniques are mostly legacy knowledge at this point.",
      },
      { slug: "js-dom", title: "JavaScript & the DOM", tag: "core",
        desc: "How JavaScript reads, modifies, and responds to what's happening on the page.",
        keyPoints: [
          "The DOM API lets JavaScript select, create, and modify elements after the page loads",
          "Event listeners connect user actions (clicks, input, scroll) to responding code",
          "The event loop lets JS handle async work (fetch, timers) without blocking the main thread",
          "Closures let a function retain access to variables from its enclosing scope",
          "Event delegation attaches one listener to a parent instead of many to children, improving performance for dynamic lists",
          "Promises and async/await are syntax for handling the same underlying asynchronous, non-blocking behavior",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// Event delegation: one listener for many list items
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.matches("li")) {
    e.target.classList.toggle("done");
  }
});` },
        pitfalls: [
          "Directly manipulating the DOM inside a framework (React, Vue) that expects to own those updates itself",
          "Forgetting that variables declared with var are function-scoped, not block-scoped like let/const",
          "Not handling promise rejections, causing silent failures that are hard to debug",
        ],
        practice: "Every interactive element you use daily — a dropdown, an infinite-scroll feed, a live form validation message — is DOM manipulation triggered by an event.",
      },
      { slug: "responsive-design", title: "Responsive Design", tag: "core",
        desc: "Making one layout work cleanly across phones, tablets, and desktops.",
        keyPoints: [
          "Media queries apply different CSS rules based on viewport width or device features",
          "Mobile-first design starts with the smallest layout and adds complexity for larger screens",
          "Relative units (%, rem, vw/vh) scale more predictably across devices than fixed pixels",
          "One flexible layout is usually more maintainable than separate desktop/mobile codebases",
          "Container queries let a component adapt based on its own container size, not just the viewport",
          "Testing on real devices catches issues that browser dev-tool emulation sometimes misses",
        ],
        code: { lang: "css", label: "CSS", code:
`.card { font-size: 1rem; padding: 1rem; }

@media (min-width: 768px) {
  .card { font-size: 1.125rem; padding: 1.5rem; }
}` },
        pitfalls: [
          "Designing only for common breakpoints, missing the wide range of actual screen sizes in use",
          "Using fixed pixel font sizes that don't respect a user's browser accessibility settings",
          "Hiding content on mobile instead of restructuring it, effectively removing functionality for those users",
        ],
        practice: "More web traffic globally comes from mobile devices than desktops, which is why mobile-first isn't a stylistic preference, it's a reflection of who's actually visiting.",
      },
      { slug: "web-performance", title: "Web Performance", tag: "advanced",
        desc: "Core Web Vitals and the techniques behind a fast-loading page.",
        keyPoints: [
          "Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift are the Core Web Vitals",
          "Minimizing render-blocking CSS/JS and lazy-loading images speeds up first paint",
          "A CDN serves static assets from servers geographically closer to the user",
          "Bundling and code-splitting balance fewer requests against shipping unused code",
          "Tree-shaking removes unused code from a bundle at build time, based on what's actually imported",
          "The critical rendering path is the sequence of steps a browser takes to turn code into pixels on screen",
        ],
        code: { lang: "html", label: "HTML", code:
`<img src="hero.jpg" loading="lazy" alt="Hero banner">
<script src="analytics.js" defer></script>
<link rel="preload" href="font.woff2" as="font" crossorigin>` },
        pitfalls: [
          "Loading large JavaScript bundles before content is visible, delaying interactivity even if content 'looks' loaded",
          "Optimizing for a fast home network while ignoring how the site performs on throttled mobile connections",
          "Adding performance monitoring only after users start complaining, rather than tracking it continuously",
        ],
        practice: "A 1-second delay in page load has been shown repeatedly to measurably hurt conversion rates — performance work is directly tied to business outcomes, not just technical pride.",
      },
    ],
  },
  {
    slug: "mobile", name: "mobile", glyph: "▤", color: "#3E8FA0",
    topics: [
      { slug: "native-vs-cross", title: "Native vs Cross-Platform", tag: "core",
        desc: "The core tradeoff behind almost every mobile architecture decision.",
        keyPoints: [
          "Native apps (Swift/Kotlin) get full platform access and best performance, at the cost of two codebases",
          "Cross-platform frameworks (React Native, Flutter) share one codebase across iOS and Android",
          "Cross-platform tools bridge to native components, which can introduce performance tradeoffs",
          "The right choice depends on team size, performance needs, and platform-specific feel required",
          "Platform-specific UI conventions (back gestures, system dialogs) are easiest to get right with native or well-integrated cross-platform tools",
          "Team expertise often matters more than the framework itself when predicting project success",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`// React Native: one component, both platforms
import { View, Text, TouchableOpacity } from "react-native";

function Button({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}` },
        pitfalls: [
          "Choosing cross-platform for a highly performance-sensitive app (like a game) where native would serve better",
          "Assuming 'write once, run anywhere' means zero platform-specific code will ever be needed",
          "Underestimating the cost of keeping cross-platform framework versions and native dependencies in sync",
        ],
        practice: "Large companies with dedicated iOS and Android teams often go native; smaller teams building an MVP often start cross-platform to move faster with one codebase.",
      },
      { slug: "mobile-ui-patterns", title: "Mobile UI Patterns", tag: "core",
        desc: "Designing for touch, small screens, and platform-specific conventions.",
        keyPoints: [
          "Touch targets need enough size and spacing to be reliably tappable on small screens",
          "Navigation differs by platform: tab bars and stacks (iOS) vs. drawers and bottom nav (Android)",
          "Gestures (swipe, pinch, long-press) replace many desktop mouse interactions",
          "Designing for one-handed use keeps key actions reachable near the bottom of the screen",
          "Skeleton screens (placeholder shapes while loading) feel faster to users than blank screens or spinners",
          "Offline-first design assumes connectivity will drop and plans for it, rather than treating it as an edge case",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`const styles = {
  button: {
    minHeight: 44,     // Apple's recommended minimum touch target
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
};` },
        pitfalls: [
          "Designing touch targets sized for a mouse cursor instead of a fingertip",
          "Ignoring platform-specific expectations, making an app feel foreign on the OS it's running on",
          "Assuming users will read onboarding screens instead of designing for immediate, intuitive use",
        ],
        practice: "The apps that feel 'native' even when built cross-platform are usually the ones that respected these small platform conventions instead of using one generic design everywhere.",
      },
      { slug: "app-lifecycle", title: "App Lifecycle & State", tag: "advanced",
        desc: "How mobile OSes manage apps that aren't in the foreground.",
        keyPoints: [
          "Mobile OSes can suspend, background, or kill an app at any time to save resources",
          "Apps must persist and restore state so users don't lose progress switching away and back",
          "Lifecycle hooks (onPause/onResume, viewDidAppear/viewDidDisappear) mark these transitions",
          "Battery and memory constraints make mobile state management stricter than typical web apps",
          "State restoration lets a killed app reopen exactly where the user left off, a strong signal of quality",
          "Foreground vs. background execution limits differ significantly between iOS and Android",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`import { AppState } from "react-native";

AppState.addEventListener("change", (nextState) => {
  if (nextState === "background") {
    saveDraftToStorage(currentDraft); // persist before the OS may kill it
  }
});` },
        pitfalls: [
          "Assuming an app will always terminate gracefully, rather than testing for abrupt OS-initiated kills",
          "Storing critical unsaved state only in memory, losing it the moment the app is backgrounded",
          "Not testing low-memory conditions, where the OS is most aggressive about killing background apps",
        ],
        practice: "A user switching to check a text message and returning expects the app exactly as they left it — that expectation is entirely an app lifecycle engineering problem.",
      },
      { slug: "push-notifications", title: "Push Notifications & Background Tasks", tag: "advanced",
        desc: "Reaching users outside the app, within strict platform limits.",
        keyPoints: [
          "Push notifications are delivered through a platform service (APNs, FCM), not directly from your server",
          "Background tasks are tightly limited by the OS to preserve battery life",
          "Notification permissions must be explicitly requested and can be revoked at any time",
          "Deep linking lets a notification open the app directly to relevant content",
          "Silent (data-only) push notifications can wake an app briefly to sync data without alerting the user",
          "Notification batching and timing windows on the OS side exist specifically to protect battery life",
        ],
        code: { lang: "javascript", label: "JavaScript", code:
`import messaging from "@react-native-firebase/messaging";

messaging().onMessage(async (remoteMessage) => {
  showLocalNotification(remoteMessage.notification);
});

const token = await messaging().getToken(); // send to your server` },
        pitfalls: [
          "Over-notifying users, which is one of the most common reasons people disable notifications or uninstall an app",
          "Assuming a background task will complete, when the OS can suspend it mid-execution at any time",
          "Not handling the case where notification permission was denied or later revoked",
        ],
        practice: "A delivery-tracking app updating your ETA in the background is a background task and push notification working together within the OS's tight resource budget.",
      },
      { slug: "app-store-deployment", title: "App Store Deployment", tag: "core",
        desc: "Getting an app reviewed, published, and safely updated.",
        keyPoints: [
          "Both major app stores require review before an app becomes publicly available",
          "Versioning and staged rollouts ship updates to a subset of users before a full release",
          "Crash reporting and analytics are essential once you can't directly observe a user's device",
          "App size, permissions requested, and privacy disclosures all affect approval and trust",
          "A/B testing store listings (icons, screenshots, descriptions) can meaningfully affect install conversion rates",
          "Beta testing programs (TestFlight, Play Console tracks) let real users try builds before a public release",
        ],
        code: { lang: "bash", label: "Bash", code:
`# fastlane: automate a staged rollout
fastlane deploy --rollout_percentage 5
# monitor crash-free rate, then:
fastlane deploy --rollout_percentage 100` },
        pitfalls: [
          "Submitting an update without reading current store guidelines, risking an avoidable rejection",
          "Ignoring crash-free rate as a metric, which store algorithms increasingly factor into visibility",
          "Rushing a rollback plan, so a bad release can't be pulled back quickly if something breaks",
        ],
        practice: "A staged rollout to 5% of users before a full release is standard practice specifically so a bad build affects the fewest people possible before anyone notices.",
      },
    ],
  },
  {
    slug: "cloud-devops", name: "cloud-devops", glyph: "☁", color: "#4776B0",
    topics: [
      { slug: "cloud-service-models", title: "Cloud Service Models", tag: "core",
        desc: "IaaS, PaaS, and SaaS — how much infrastructure you manage vs. how much you don't.",
        keyPoints: [
          "IaaS (e.g., EC2) provides raw virtual machines — you manage the OS and everything above it",
          "PaaS (e.g., Heroku) manages the OS and runtime — you deploy code, not infrastructure",
          "SaaS (e.g., Gmail) delivers a complete application — you just use it",
          "Moving up the stack trades control for reduced operational burden",
          "Serverless (FaaS) takes PaaS further — you deploy individual functions and pay only for execution time",
          "Multi-cloud and hybrid-cloud strategies trade vendor lock-in risk for added operational complexity",
        ],
        code: { lang: "yaml", label: "YAML", code:
`# serverless.yml — FaaS: deploy a function, not a server
functions:
  hello:
    handler: handler.hello
    events:
      - http:
          path: hello
          method: get` },
        pitfalls: [
          "Choosing IaaS by default when a PaaS or serverless option would need far less ongoing maintenance",
          "Underestimating egress costs (moving data out of a cloud provider), which can be a hidden expense",
          "Assuming 'cloud' automatically means 'more reliable' without reading a provider's actual uptime guarantees",
        ],
        practice: "A startup MVP often runs entirely on PaaS or serverless to avoid hiring dedicated infrastructure engineers before there's traffic to justify it.",
      },
      { slug: "containers-docker", title: "Containers & Docker", tag: "core",
        desc: "Packaging an app with its dependencies so it runs the same way everywhere.",
        keyPoints: [
          "A container packages an application with its dependencies so it runs consistently anywhere",
          "Containers share the host OS kernel, making them lighter weight than full virtual machines",
          "A Dockerfile defines the steps to build an image; a container is a running instance of it",
          "Orchestration tools (Kubernetes) manage scaling, networking, and recovery across containers",
          "A container registry (Docker Hub, ECR) stores and versions images so they can be pulled anywhere they're needed",
          "Multi-stage builds keep final container images small by discarding build-time-only dependencies",
        ],
        code: { lang: "docker", label: "Dockerfile", code:
`FROM node:20-slim
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
CMD ["node", "server.js"]` },
        pitfalls: [
          "Running containers as root by default, unnecessarily widening the attack surface if compromised",
          "Baking secrets directly into an image, where they remain even if 'deleted' in a later layer",
          "Treating containers as lightweight VMs rather than understanding what kernel-sharing actually implies for isolation",
        ],
        practice: "'It works on my machine' problems are exactly what containers were built to eliminate, by shipping the whole runtime environment alongside the code.",
      },
      { slug: "ci-cd", title: "CI/CD Pipelines", tag: "core",
        desc: "Automating the path from committed code to running in production.",
        keyPoints: [
          "Continuous Integration automatically builds and tests code on every commit or pull request",
          "Continuous Deployment automatically ships passing changes to production without manual steps",
          "Pipelines typically run: lint → test → build → deploy, failing fast at the first broken stage",
          "Feature flags let you deploy code without immediately exposing it to all users",
          "Canary deployments release a change to a small subset of servers first, watching for errors before a full rollout",
          "Rollback automation matters as much as deployment automation — being able to undo quickly limits blast radius",
        ],
        code: { lang: "yaml", label: "YAML", code:
`name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test` },
        pitfalls: [
          "Treating a green pipeline as proof of correctness, when tests themselves might have gaps",
          "Allowing pipelines to become so slow that developers start skipping or ignoring them",
          "Deploying directly to production without a staging environment that mirrors it closely",
        ],
        practice: "Teams that deploy dozens of times a day usually aren't reckless — they've just automated enough safety checks that each individual deploy is low-risk.",
      },
      { slug: "infrastructure-as-code", title: "Infrastructure as Code", tag: "advanced",
        desc: "Defining servers and networks as versioned, reviewable configuration.",
        keyPoints: [
          "Infrastructure is defined in versioned config files instead of manual setup",
          "Tools like Terraform describe desired end-state; the tool figures out how to reach it",
          "IaC makes environments reproducible and reviewable through the same process as application code",
          "Drift happens when real infrastructure diverges from what the code says it should be",
          "State files track what infrastructure a tool believes currently exists, and must stay in sync with reality",
          "Modules let teams package and reuse common infrastructure patterns instead of duplicating configuration",
        ],
        code: { lang: "terraform", label: "Terraform", code:
`resource "aws_instance" "web" {
  ami           = "ami-0123456789"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}` },
        pitfalls: [
          "Manually editing infrastructure through a cloud console, causing drift from the code that's supposed to define it",
          "Storing a state file with sensitive data in plaintext without proper access controls",
          "Writing one giant configuration file instead of composable, reviewable modules",
        ],
        practice: "Recreating an entire production environment for disaster recovery is realistic with IaC — without it, it often depends on tribal knowledge and manual steps.",
      },
      { slug: "monitoring-observability", title: "Monitoring & Observability", tag: "advanced",
        desc: "Knowing what your system is doing once it's running in production.",
        keyPoints: [
          "Logs, metrics, and traces are the three pillars of observability",
          "Metrics answer 'what' is happening (error rate, latency); traces answer 'where'",
          "Alerting on symptoms (high latency, error rate) is more useful than alerting on every anomaly",
          "Dashboards should surface the few metrics that indicate real user impact",
          "Distributed tracing follows a single request across multiple services, critical for debugging microservice latency",
          "SLOs (service level objectives) define measurable reliability targets that alerting thresholds should map back to",
        ],
        code: { lang: "yaml", label: "YAML", code:
`groups:
  - name: api-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.05
        for: 10m
        labels: { severity: page }` },
        pitfalls: [
          "Alerting on every possible anomaly, causing fatigue that leads engineers to ignore real alerts",
          "Logging so verbosely that finding the signal in the noise becomes its own problem",
          "Only monitoring infrastructure metrics (CPU, memory) while ignoring user-facing metrics (error rate, latency)",
        ],
        practice: "When a service 'feels slow' with no obvious cause, distributed tracing is usually what turns a vague complaint into a specific, fixable bottleneck.",
      },
    ],
  },
  {
    slug: "discrete-math", name: "discrete-math", glyph: "∴", color: "#9C5FA8",
    topics: [
      { slug: "set-theory-logic", title: "Set Theory & Logic", tag: "core",
        desc: "The formal foundation underneath data structures and boolean logic in code.",
        keyPoints: [
          "Sets, unions, intersections, and complements underlie how structures like hash sets behave",
          "Propositional logic (AND, OR, NOT, implies) is the foundation for boolean expressions in code",
          "Truth tables let you verify whether two logical expressions are equivalent",
          "Quantifiers (∀ for all, ∃ there exists) formalize statements used throughout CS theory",
          "De Morgan's laws describe how negation distributes over AND/OR, used constantly when simplifying conditionals in code",
          "A power set (the set of all subsets) grows exponentially, 2ⁿ subsets for a set of size n",
        ],
        code: { lang: "python", label: "Python", code:
`a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a & b)   # intersection: {3, 4}
print(a | b)   # union: {1, 2, 3, 4, 5, 6}
print(a - b)   # difference: {1, 2}

# De Morgan's law: not (A and B) == (not A) or (not B)` },
        pitfalls: [
          "Writing a compound boolean condition without simplifying it, making the logic harder to verify at a glance",
          "Confusing 'for all' and 'there exists' when translating a requirement into logic or code",
          "Assuming set operations are always fast — the underlying data structure determines the real performance",
        ],
        practice: "Every complex if-statement in code is a small logic expression, and De Morgan's laws are exactly the tool for simplifying a tangled one into something readable.",
      },
      { slug: "combinatorics", title: "Combinatorics", tag: "core",
        desc: "Counting arrangements and selections — the math behind probability and complexity analysis.",
        keyPoints: [
          "Permutations count orderings; combinations count selections where order doesn't matter",
          "The pigeonhole principle: more items than containers means some container holds more than one",
          "Combinatorics underlies probability calculations and complexity analysis (e.g., counting subsets)",
          "Recurrence relations describe counting problems recursively, often solved like DP problems",
          "The multiplication principle — multiplying choice counts across independent steps — underlies most basic counting",
          "Binomial coefficients (n choose k) count subsets and appear throughout probability and algorithm analysis",
        ],
        code: { lang: "python", label: "Python", code:
`from math import comb, perm

comb(10, 3)   # 120 ways to choose 3 of 10 (order doesn't matter)
perm(10, 3)   # 720 ways to arrange 3 of 10 (order matters)` },
        pitfalls: [
          "Double-counting arrangements by forgetting whether order matters for the specific problem",
          "Applying a permutation formula to a problem that actually calls for combinations, or vice versa",
          "Underestimating how quickly combinatorial counts explode, making brute-force enumeration impractical",
        ],
        practice: "Estimating whether a brute-force algorithm is feasible almost always starts with a quick combinatorics calculation — how many possibilities actually exist to check.",
      },
      { slug: "graph-theory", title: "Graph Theory Foundations", tag: "core",
        desc: "The mathematical backbone behind networks, scheduling, and pathfinding.",
        keyPoints: [
          "A graph is a set of vertices connected by edges, directed or undirected, weighted or not",
          "Degree, connectivity, and cycles are basic properties used to reason about graph structure",
          "Trees are a special case of graphs: connected, acyclic, with exactly n-1 edges for n vertices",
          "Graph coloring, matching, and flow problems model real scheduling and network problems",
          "A bipartite graph's vertices split into two groups with edges only between groups, modeling things like matching problems",
          "Minimum spanning tree algorithms (Kruskal, Prim) find the cheapest way to connect all vertices in a weighted graph",
        ],
        code: { lang: "python", label: "Python", code:
`graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("A", 4), ("C", 2)],
    "C": [("A", 1), ("B", 2)],
}

# degree of a vertex = number of edges touching it
degree_A = len(graph["A"])  # 2` },
        pitfalls: [
          "Assuming a graph is connected without checking, which breaks many algorithms that expect a single component",
          "Confusing a graph's diameter (longest shortest path) with its total number of edges",
          "Overlooking that directed and undirected versions of the same algorithm can behave very differently",
        ],
        practice: "Matching job applicants to positions, students to schools, or riders to drivers are all bipartite matching problems solved with graph theory.",
      },
      { slug: "proof-techniques", title: "Proof Techniques", tag: "advanced",
        desc: "The core skill for reasoning rigorously about whether an algorithm is actually correct.",
        keyPoints: [
          "Direct proof establishes a statement by straightforward logical steps from known facts",
          "Proof by contradiction assumes the opposite of what you want to prove, then finds an inconsistency",
          "Mathematical induction proves a statement for all natural numbers via base case + inductive step",
          "Reading and writing proofs underlies rigorous reasoning about algorithm correctness",
          "A counterexample is often the fastest way to disprove a general claim, without needing a full proof",
          "Strong induction assumes all previous cases hold, not just the immediately preceding one, useful for some recurrences",
        ],
        code: { lang: "python", label: "Python", code:
`def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    # invariant: if target is in arr, it's within arr[lo:hi+1]
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1` },
        pitfalls: [
          "Assuming a pattern holds after checking only a few small cases, without proving it in general",
          "Skipping the base case in an induction proof, leaving the whole argument unanchored",
          "Confusing 'I can't find a counterexample' with 'I've proven this is always true'",
        ],
        practice: "Loop invariants — the technique behind proving an algorithm correct — are induction applied directly to code, one iteration at a time.",
      },
      { slug: "probability-cs", title: "Probability for CS", tag: "core",
        desc: "The math behind randomized algorithms, inference, and recommendation systems.",
        keyPoints: [
          "Expected value gives the long-run average outcome of a random process",
          "Independence means one event's outcome doesn't affect another's probability",
          "Conditional probability and Bayes' theorem underlie spam filters and recommendation systems",
          "Randomized algorithms (like randomized quicksort) use probability to guarantee good average-case time",
          "The union bound gives a simple (if loose) upper bound on the probability that at least one of several events occurs",
          "Variance measures how spread out outcomes are around the expected value, not just what the average outcome is",
        ],
        code: { lang: "python", label: "Python", code:
`import random

def randomized_pivot(arr):
    return random.choice(arr)   # avoids worst-case O(n^2) on sorted input

# Expected value of a fair 6-sided die
expected_value = sum(range(1, 7)) / 6  # 3.5` },
        pitfalls: [
          "Assuming independence between events without verifying it, which silently breaks many probability calculations",
          "Confusing correlation with causation when reasoning about probabilistic relationships in data",
          "Underestimating how counterintuitive probability can be (e.g. the birthday paradox) without doing the actual math",
        ],
        practice: "Hash collision probability, load balancing fairness, and A/B test significance are all everyday engineering questions that are really probability problems underneath.",
      },
    ],
  },
];