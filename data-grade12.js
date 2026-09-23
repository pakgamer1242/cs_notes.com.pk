/* ---------------------------------------------------------
   GRADE 12 — Federal Board (Pakistan) Computer Science.
   Original notes written from the National Curriculum 2022-23
   unit/topic structure. Not a transcription of any textbook.
--------------------------------------------------------- */

const GRADE12_DATA = [
  {
    slug: "unit1-computer-systems", name: "unit 1: computer systems", glyph: "▣", color: "#3B6FA6",
    topics: [
      { slug: "usability-security-accessibility", title: "System/Device Usability, Security, and Accessibility", tag: "core",
        desc: "Balancing how easy a system is to use with how well it protects users and includes people of all abilities.",
        keyPoints: [
          "Usability measures how easily and efficiently users can accomplish tasks with a system",
          "Security measures how well a system protects data and resources from unauthorized access",
          "Accessibility ensures a system can be used effectively by people with a wide range of abilities",
          "These three goals often interact — a highly secure system can become harder to use if not designed carefully",
          "Good design considers all three from the start, rather than treating any one as an afterthought",
        ],
        code: { lang: "python", label: "Python", code:
`def check_accessibility(has_alt_text, has_keyboard_nav, contrast_ratio):
    checks = [has_alt_text, has_keyboard_nav, contrast_ratio >= 4.5]
    return all(checks)

print(check_accessibility(True, True, 5.2))   # True` },
        pitfalls: [
          "Treating accessibility as a final add-on feature instead of a core design requirement",
          "Assuming more security features always mean a better system overall, ignoring the usability cost",
          "Designing only for the 'average' user, overlooking edge cases and diverse needs",
        ],
        practice: "A banking app that's secure but so confusing that customers write down their PINs on paper has, in a real sense, failed at security too — usability and security aren't actually separate concerns.",
      },
      { slug: "hci", title: "Human-Computer Interaction (HCI)", tag: "core",
        desc: "The field focused on how people and computer systems actually interact — and how to make that interaction effective.",
        keyPoints: [
          "HCI studies how people interact with computing systems and how to design that interaction well",
          "Good HCI design accounts for how users think, what they expect, and how they make mistakes",
          "Feedback (visual, audio, haptic) helps users understand what a system is doing in response to their actions",
          "Consistency across an interface reduces the mental effort needed to learn and use a system",
          "User testing is central to HCI — assumptions about ease of use should be validated with real users",
        ],
        code: { lang: "python", label: "Python", code:
`class Button:
    def __init__(self, label):
        self.label = label

    def click(self):
        print(f"'{self.label}' pressed")   # immediate feedback confirms the action worked

Button("Submit").click()` },
        pitfalls: [
          "Designing an interface based on what looks impressive rather than what's easiest to use",
          "Assuming users will read instructions rather than designing for intuitive, self-explanatory interaction",
          "Ignoring feedback loops, leaving users unsure whether their action actually worked",
        ],
        practice: "The reason a well-designed app rarely needs a manual is HCI done well — every button, label, and response is designed to be understood without external explanation.",
      },
      { slug: "usability-security-tradeoffs", title: "Trade-offs between Usability and Security in Computing Systems", tag: "advanced",
        desc: "Why making a system more secure often makes it a little harder to use — and how to find a reasonable balance.",
        keyPoints: [
          "Enhancing security (like multi-factor authentication) often adds extra steps that reduce convenience",
          "Access controls that protect sensitive data can also slow down legitimate users trying to do their jobs",
          "The right balance depends on context — a hospital record system and a public blog need very different trade-offs",
          "Security measures should be proportional to what's actually being protected and its real risk level",
          "Cost, privacy, and ethics all factor into deciding where on the usability-security spectrum a system should sit",
        ],
        code: { lang: "python", label: "Python", code:
`def login(password, mfa_code=None, require_mfa=True):
    if require_mfa and mfa_code is None:
        return "Enter your MFA code"   # extra security step, extra friction
    return "Logged in"

print(login("secret123", require_mfa=True))` },
        pitfalls: [
          "Applying the same strict security measures everywhere, regardless of how sensitive the actual data is",
          "Assuming users will tolerate any amount of friction 'for their own security'",
          "Ignoring that overly strict security can push users toward risky workarounds, like writing down passwords",
        ],
        practice: "A banking app asking for a one-time code on login is a deliberate usability-security trade-off — a few extra seconds of friction in exchange for meaningfully reduced fraud risk.",
        table: { headers: ["Aspect", "Security Impact", "Usability Impact"], rows: [
          ["Authentication Complexity", "Stronger protection via MFA", "Extra steps slow down access"],
          ["Access Controls", "Restricts data to authorized users", "Frequent permission requests slow work"],
        ]},
      },
    ],
  },
  {
    slug: "unit2-computational-thinking", name: "unit 2: computational thinking & algorithms", glyph: "⌘", color: "#1E8F6F",
    topics: [
      { slug: "data-structures-g12", title: "Data Structures", tag: "core",
        desc: "The organized ways of storing data so it can be accessed and modified efficiently for a given task.",
        keyPoints: [
          "A data structure organizes data to support specific operations efficiently, like fast lookup or ordered access",
          "Common structures include lists/arrays (ordered), stacks (last-in-first-out), and queues (first-in-first-out)",
          "Choosing the right data structure depends on what operations (search, insert, delete) matter most",
          "Some structures trade memory for speed, or speed of one operation for speed of another",
          "Data structures are a foundation for implementing more complex algorithms efficiently",
        ],
        code: { lang: "python", label: "Python", code:
`# Stack: last-in, first-out (like an undo button)
stack = []
stack.append("edit 1")
stack.append("edit 2")
last_action = stack.pop()   # 'edit 2' - undoes the most recent change

# Queue: first-in, first-out (like a print queue)
from collections import deque
queue = deque()
queue.append("job 1")
queue.append("job 2")
next_job = queue.popleft()   # 'job 1' - processed in arrival order` },
        pitfalls: [
          "Using a list for everything, even when a stack, queue, or other structure fits the problem better",
          "Ignoring how a data structure's performance changes as the amount of data grows",
          "Not considering whether data needs to stay ordered, unique, or both, before choosing a structure",
        ],
        practice: "An 'undo' feature in almost any application is a stack in disguise — the most recent action is the first one undone.",
      },
      { slug: "evaluating-solutions", title: "Evaluating Computational Solutions", tag: "advanced",
        desc: "Judging whether a solution to a problem is actually good — not just whether it works.",
        keyPoints: [
          "A computational solution should be evaluated on correctness, efficiency, and how well it generalizes",
          "Time complexity (using Big-O notation) estimates how an algorithm's runtime grows with input size",
          "Space complexity estimates how much memory a solution requires, which matters as much as speed in some contexts",
          "Readability and maintainability matter too — a solution nobody can understand later has a real cost",
          "Comparing multiple valid solutions to the same problem is a normal and useful part of the design process",
        ],
        code: { lang: "python", label: "Python", code:
`import time

def time_solution(func, *args):
    start = time.time()
    result = func(*args)
    elapsed = time.time() - start
    return result, elapsed

result, seconds = time_solution(sum, range(1000000))
print(f"Result: {result}, took {seconds:.4f}s")` },
        pitfalls: [
          "Judging a solution only by whether it produces the correct output on the test cases you happened to try",
          "Ignoring efficiency until performance problems appear at a larger scale",
          "Optimizing for speed at the cost of code that's unreadable or nearly impossible to maintain",
        ],
        practice: "Choosing between two working solutions to the same problem usually comes down to the same three questions: which is faster, which uses less memory, and which will be easier to maintain.",
      },
    ],
  },
  {
    slug: "unit3-programming-fundamentals", name: "unit 3: programming fundamentals", glyph: "{}", color: "#4A6FA0",
    topics: [
      { slug: "programming-paradigms", title: "Programming Paradigms", tag: "advanced",
        desc: "The different overall approaches to structuring code — and the trade-offs each one brings.",
        keyPoints: [
          "A programming paradigm is a general approach or style for structuring and organizing code",
          "Functional programming emphasizes what to compute, organizing code around functions rather than changing state",
          "Procedural programming organizes code as a sequence of step-by-step instructions and reusable procedures",
          "Object-oriented programming organizes code around objects that bundle data and behavior together",
          "A single language can often support multiple paradigms; Python supports procedural, object-oriented, and some functional style",
        ],
        code: { lang: "python", label: "Python", code:
`# Procedural style
def total_procedural(prices):
    total = 0
    for p in prices:
        total += p
    return total

# Functional style
from functools import reduce
def total_functional(prices):
    return reduce(lambda acc, p: acc + p, prices, 0)` },
        pitfalls: [
          "Assuming one paradigm is universally 'better,' rather than better suited to specific kinds of problems",
          "Mixing paradigm styles inconsistently within the same codebase without a clear reason",
          "Forcing a functional or object-oriented style onto a small script where a simple procedural approach would be clearer",
        ],
        practice: "Functional programming's appeal for data-heavy work (like processing large datasets) is that isolated, side-effect-free functions are easier to test, debug, and even run in parallel.",
      },
      { slug: "data-structures-file-handling", title: "Data Structures & File Handling in Python", tag: "core",
        desc: "Working with more advanced Python data structures, and reading and writing data to files on disk.",
        keyPoints: [
          "Beyond lists, Python offers dictionaries (key-value pairs), tuples (immutable sequences), and sets (unique items)",
          "File handling lets a program read from and write to files, so data can persist beyond a single program run",
          "Files should be properly opened and closed — Python's with statement handles closing automatically",
          "Reading a file line by line is memory-efficient for large files, compared to loading it all at once",
          "Choosing the right structure (list vs. dict vs. set) affects both code clarity and performance",
        ],
        code: { lang: "python", label: "Python", code:
`# Writing to a file
with open("scores.txt", "w") as f:
    f.write("Alice: 92\\nBob: 85\\n")

# Reading it back
with open("scores.txt", "r") as f:
    for line in f:
        print(line.strip())` },
        pitfalls: [
          "Forgetting to close a file after writing to it, which can leave changes unsaved or the file locked",
          "Using a list to check membership repeatedly, when a set would do the same check much faster",
          "Overwriting a file unintentionally by opening it in write mode when append mode was intended",
        ],
        practice: "Saving a game's progress, exporting a report, or logging errors to a file for later review are all just structured file I/O — the same fundamental read/write operations every time.",
      },
      { slug: "python-databases", title: "Working with Databases in Python", tag: "advanced",
        desc: "Connecting a Python program to a database so data can be stored and queried beyond a single file.",
        keyPoints: [
          "Python can connect to databases (like SQLite) using built-in or third-party libraries",
          "SQL queries (SELECT, INSERT, UPDATE) let a program read and modify structured, persistent data",
          "A database connection should be properly closed after use, similar to file handling",
          "Using parameterized queries instead of building SQL strings manually protects against injection issues",
          "Databases handle much larger and more structured data reliably than flat text files",
        ],
        code: { lang: "python", label: "Python", code:
`import sqlite3

conn = sqlite3.connect("students.db")
cursor = conn.cursor()

cursor.execute(
    "INSERT INTO students (name, grade) VALUES (?, ?)",
    ("Ali", "A")
)
conn.commit()
conn.close()` },
        pitfalls: [
          "Building SQL query strings by directly inserting user input, a serious security risk",
          "Forgetting to commit changes after an insert or update, so the data isn't actually saved",
          "Opening a new database connection repeatedly instead of reusing one, hurting performance",
        ],
        practice: "A simple student record system — storing names, grades, and attendance — is a natural first project for connecting Python to a real database instead of a plain text file.",
      },
      { slug: "testing-debugging-advanced", title: "Techniques for Testing & Debugging", tag: "advanced",
        desc: "More rigorous ways to catch bugs — unit tests, breakpoints, and watches — beyond scattering print statements.",
        keyPoints: [
          "Unit tests check that individual functions behave correctly, and can be re-run automatically after every change",
          "Breakpoints pause a program's execution at a specific line so you can inspect its state",
          "Watches let you monitor how a specific variable's value changes as the program runs",
          "Writing tests before or alongside code helps catch bugs immediately, not after they've spread",
          "A good test suite makes it safer to change code later, since tests will catch anything that breaks",
        ],
        code: { lang: "python", label: "Python", code:
`def divide(a, b):
    return a / b

# A simple unit test
def test_divide():
    assert divide(10, 2) == 5
    assert divide(-6, 3) == -2

test_divide()
print("All tests passed")` },
        pitfalls: [
          "Writing tests only for the easy, obviously-correct cases, and skipping edge cases",
          "Debugging by only reading code rather than actually running it with breakpoints to observe real behavior",
          "Treating passing tests as proof of a bug-free program rather than proof that the tested cases work",
        ],
        practice: "A single unit test for 'does this function handle an empty list?' regularly catches bugs that would otherwise only show up unpredictably in production.",
      },
    ],
  },
  {
    slug: "unit4-data-analysis", name: "unit 4: data and analysis", glyph: "∑", color: "#8B5CC7",
    topics: [
      { slug: "data-types-ml", title: "Data Types", tag: "core",
        desc: "How data is categorized in data science and machine learning, and why the category affects how you can use it.",
        keyPoints: [
          "Data is broadly categorized as structured (tables, spreadsheets) or unstructured (text, images, audio)",
          "Numeric data can be continuous (any value in a range) or discrete (specific countable values)",
          "Categorical data represents groups or labels rather than numbers, like a color or a yes/no response",
          "The type of data available directly shapes which analysis techniques and models are appropriate",
          "Real-world datasets often mix multiple data types together, requiring different handling for each",
        ],
        code: { lang: "python", label: "Python", code:
`data_sample = {
    "age": 34,              # numeric, discrete
    "temperature": 36.6,    # numeric, continuous
    "city": "Lahore",       # categorical
    "is_active": True,      # categorical (boolean)
}

for field, value in data_sample.items():
    print(field, "->", type(value).__name__)` },
        pitfalls: [
          "Treating categorical data as if it were numeric, leading to meaningless calculations (like averaging zip codes)",
          "Assuming all data is clean and complete without checking for missing or malformed values",
          "Applying a technique designed for structured data directly to unstructured data without adaptation",
        ],
        practice: "Before building any machine learning model, the first real question is always 'what type of data am I actually working with' — that answer shapes every decision that follows.",
      },
      { slug: "data-visualization-g12", title: "Data Visualization", tag: "core",
        desc: "Representing data visually — charts, graphs, maps, and diagrams — to make patterns easier to see and communicate.",
        keyPoints: [
          "Data visualization turns raw numbers into charts, graphs, maps, or diagrams that are easier to interpret",
          "Different visualization types suit different goals: trends over time, comparisons, distributions, or relationships",
          "Good visualizations reduce cognitive load, letting a viewer grasp a pattern faster than reading raw data",
          "Color, scale, and labeling choices can significantly affect how a visualization is interpreted",
          "Interactive visualizations let users explore data themselves, beyond a single fixed view",
        ],
        code: { lang: "python", label: "Python", code:
`import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr"]
revenue = [12000, 15000, 11000, 18000]

plt.plot(months, revenue, marker="o")
plt.title("Monthly Revenue Trend")
plt.show()` },
        pitfalls: [
          "Choosing a visually appealing chart type that doesn't actually fit the data or the question being asked",
          "Overloading a single visualization with too many variables or categories at once",
          "Using inconsistent or misleading scales that distort the apparent size of differences",
        ],
        practice: "A dashboard that shows sales trending downward at a glance is doing its job — the visualization itself should communicate the key insight before anyone reads a single number.",
      },
      { slug: "hypothesis-testing", title: "Hypothesis Formulation and Hypothesis Testing", tag: "advanced",
        desc: "Turning an educated guess about your data into something you can actually test with statistics.",
        keyPoints: [
          "A hypothesis is an educated guess about a relationship between variables, based on existing data or prior knowledge",
          "The null hypothesis assumes no real effect or relationship exists; the alternative hypothesis assumes one does",
          "Hypothesis testing uses statistical tools (like p-values) to judge whether observed data likely reflects a real effect",
          "A well-formed hypothesis proposes a specific, testable relationship — not just a vague idea",
          "Failing to reject the null hypothesis doesn't prove it's true, only that the data didn't provide strong enough evidence against it",
        ],
        code: { lang: "python", label: "Python", code:
`from scipy import stats

group_a_scores = [78, 82, 85, 90]
group_b_scores = [70, 74, 76, 80]

t_stat, p_value = stats.ttest_ind(group_a_scores, group_b_scores)
print("Reject null hypothesis" if p_value < 0.05 else "Fail to reject null hypothesis")` },
        pitfalls: [
          "Treating a hypothesis test's result as absolute proof, rather than a probability-based conclusion",
          "Formulating a hypothesis after already seeing the data, rather than before collecting it",
          "Confusing 'failing to reject the null hypothesis' with 'proving the null hypothesis is true'",
        ],
        practice: "'Increased study hours lead to better exam scores' is a testable hypothesis — it names a specific cause, a specific effect, and can actually be checked against real data.",
      },
    ],
  },
  {
    slug: "unit5-applications", name: "unit 5: applications of computer science", glyph: "◇", color: "#2C8FA8",
    topics: [
      { slug: "iot-applications", title: "Internet of Things (IoT)", tag: "core",
        desc: "Designing and applying connected-device solutions to real problems, including in a Pakistani context.",
        keyPoints: [
          "Designing an IoT application starts with identifying a real problem sensors and connectivity can meaningfully solve",
          "IoT applications in agriculture, traffic management, and utilities are especially relevant to Pakistan's infrastructure needs",
          "A typical IoT application design considers what to sense, how to transmit data, and what action to take on it",
          "Local infrastructure constraints (connectivity, power reliability) shape what IoT solutions are actually practical",
          "Successful IoT applications balance ambition with the real-world constraints of cost and maintainability",
        ],
        code: { lang: "python", label: "Python", code:
`def irrigation_decision(soil_moisture_percent, threshold=30):
    if soil_moisture_percent < threshold:
        return "Activate irrigation"
    return "Soil moisture sufficient"

print(irrigation_decision(22))  # 'Activate irrigation'` },
        pitfalls: [
          "Designing an IoT solution around ideal infrastructure conditions that don't reflect real deployment environments",
          "Overengineering a solution with more sensors and complexity than the problem actually requires",
          "Ignoring long-term maintenance needs, like battery replacement or connectivity costs, in the initial design",
        ],
        practice: "IoT-based smart irrigation, which senses soil moisture and only waters when needed, is a directly practical application for water-scarce agricultural regions.",
      },
      { slug: "blockchain-applications", title: "Blockchain", tag: "advanced",
        desc: "Applying blockchain technology to real problems, including in the context of Pakistan's economy and institutions.",
        keyPoints: [
          "Blockchain applications relevant to Pakistan include land registry, supply chain transparency, and secure record-keeping",
          "A key value of blockchain in these contexts is reducing fraud through tamper-evident records",
          "Adoption depends on infrastructure, regulation, and institutional willingness to change existing systems",
          "Blockchain doesn't eliminate the need for trustworthy data entry — it only protects records after they're added",
          "Real-world blockchain applications need to weigh the technology's benefits against its cost and complexity",
        ],
        code: { lang: "python", label: "Python", code:
`import hashlib

def register_land_record(owner, plot_id, previous_hash):
    record = f"{owner}:{plot_id}"
    return hashlib.sha256((record + previous_hash).encode()).hexdigest()

h1 = register_land_record("Ali", "Plot-204", "0")
h2 = register_land_record("Sara", "Plot-205", h1)  # each record links to the one before` },
        pitfalls: [
          "Assuming blockchain is a universal fix for corruption or fraud without addressing how data enters the system",
          "Underestimating the institutional and regulatory changes needed to adopt blockchain-based systems",
          "Choosing blockchain for a problem that a simpler, centralized database could solve just as well",
        ],
        practice: "A blockchain-based land registry doesn't stop someone from lying about who currently owns a plot of land — but it does make it much harder to quietly alter that record after it's been entered.",
      },
      { slug: "cloud-computing-g12", title: "Cloud Computing", tag: "core",
        desc: "Renting computing power and storage over the internet instead of owning and maintaining physical infrastructure.",
        keyPoints: [
          "Cloud computing delivers computing resources (servers, storage, software) over the internet, on demand",
          "Common service models include IaaS (raw infrastructure), PaaS (managed platforms), and SaaS (ready-to-use software)",
          "Cloud computing lets organizations scale resources up or down based on actual need, rather than fixed hardware",
          "Benefits include reduced upfront cost and easier scaling; trade-offs include ongoing costs and reliance on a provider",
          "Data stored in the cloud still requires careful security and access management by the organization using it",
        ],
        code: { lang: "python", label: "Python", code:
`# Scaling resources based on demand (a simplified autoscaling rule)
def scale_servers(current_load_percent):
    if current_load_percent > 80:
        return "Add 2 more servers"
    elif current_load_percent < 30:
        return "Remove 1 server"
    return "No change"

print(scale_servers(85))` },
        pitfalls: [
          "Assuming cloud storage is automatically secure without configuring proper access controls",
          "Underestimating long-term subscription costs compared to a one-time infrastructure investment",
          "Choosing a cloud service model that doesn't match the actual level of control the project needs",
        ],
        practice: "A small business using cloud-based email and storage instead of running its own physical servers is a simple, everyday example of trading upfront infrastructure cost for ongoing convenience.",
      },
      { slug: "neural-networks-deep-learning", title: "Neural Networks and Deep Learning", tag: "advanced",
        desc: "How layered networks of simple computations can learn to recognize complex patterns in data.",
        keyPoints: [
          "Neural networks are inspired loosely by biological neurons, using layers of connected nodes to process data",
          "Deep learning refers to neural networks with many layers, capable of learning complex patterns",
          "These systems learn by adjusting internal weights based on errors between predicted and actual outcomes",
          "Deep learning powers applications like image recognition, speech recognition, and recommendation systems",
          "Training deep learning models typically requires large amounts of data and significant computing power",
        ],
        code: { lang: "python", label: "Python", code:
`def relu(x):
    return max(0, x)

def simple_neuron(inputs, weights, bias):
    total = sum(i * w for i, w in zip(inputs, weights)) + bias
    return relu(total)

print(simple_neuron([1.0, 0.5], [0.8, -0.2], 0.1))` },
        pitfalls: [
          "Assuming deep learning is always the right tool, even for problems with too little data to train it well",
          "Treating a neural network as a 'black box' without any effort to understand or explain its decisions",
          "Underestimating the computing resources and time needed to properly train a deep learning model",
        ],
        practice: "The face-unlock feature on a smartphone is deep learning in daily use — a neural network trained to recognize patterns distinguishing your face from anyone else's.",
      },
      { slug: "data-sharing-privacy", title: "Data Sharing and Privacy", tag: "core",
        desc: "The benefits of sharing data across organizations, weighed against the real privacy risks involved.",
        keyPoints: [
          "Data sharing improves collaboration, research, and decision-making across organizations and sectors",
          "Data privacy is about a person's ability to control how their personal information is collected and used",
          "Personally Identifiable Information (PII) includes names, ID numbers, and contact details that can identify someone",
          "Conflicts arise when the benefits of sharing data clash with individuals' expectations of privacy",
          "Clear policies and consent processes help balance the value of data sharing with privacy protection",
        ],
        code: { lang: "python", label: "Python", code:
`def anonymize(record):
    return {
        "age_range": f"{(record['age'] // 10) * 10}s",  # 34 -> '30s'
        "city": record["city"],
    }   # name and exact age removed before sharing

print(anonymize({"name": "Bilal", "age": 34, "city": "Karachi"}))` },
        pitfalls: [
          "Sharing data without properly anonymizing or securing personally identifiable information",
          "Assuming users have consented to data sharing just because they accepted a long terms-of-service agreement",
          "Treating privacy and usefulness of shared data as mutually exclusive, when careful anonymization often allows both",
        ],
        practice: "Health researchers sharing anonymized patient data to study disease patterns is a real example of the data sharing vs. privacy balance — valuable collaboration, without exposing any individual's identity.",
      },
    ],
  },
  {
    slug: "unit6-impacts-of-computing", name: "unit 6: impacts of computing", glyph: "⚖", color: "#B5473E",
    topics: [
      { slug: "privacy-identity-theft", title: "Privacy Risks & Identity Theft", tag: "core",
        desc: "How personal information gets misused, and the practical habits that reduce the risk.",
        keyPoints: [
          "Sharing private information online creates risk of it being collected, sold, or misused without consent",
          "Identity theft occurs when someone uses another person's private information to impersonate or defraud them",
          "Common prevention practices include strong unique passwords, minimizing shared personal details, and monitoring accounts",
          "Data breaches at organizations can expose personal information even when an individual was careful",
          "Recovering from identity theft is typically far more costly and time-consuming than preventing it",
        ],
        code: { lang: "python", label: "Python", code:
`import re

def is_strong_password(pw):
    return len(pw) >= 10 and re.search(r"\\d", pw) and re.search(r"[A-Z]", pw)

print(is_strong_password("weak"))         # False
print(is_strong_password("Str0ngPass!"))  # True` },
        pitfalls: [
          "Reusing the same password across multiple accounts, multiplying the damage from a single breach",
          "Oversharing personal details on public profiles that can be used to answer security questions",
          "Assuming identity theft only happens to other people, leading to lax personal security habits",
        ],
        practice: "Freezing your credit and monitoring account statements are the standard first responses to suspected identity theft — prevention is cheaper, but a clear response plan matters too.",
      },
      { slug: "cyber-attacks-threats", title: "Cyber-Attacks & Threats", tag: "advanced",
        desc: "Recognizing common categories of cyber-attacks and how to spot the signs of a real threat.",
        keyPoints: [
          "Common cyber-attack types include phishing, malware, denial-of-service attacks, and man-in-the-middle attacks",
          "Identifying a cybersecurity threat starts with noticing unusual account activity, system slowdowns, or unexpected requests",
          "Attackers often exploit human trust (social engineering) as much as technical vulnerabilities",
          "Early detection of a threat significantly reduces the potential damage compared to catching it late",
          "Staying current on common attack patterns helps recognize new variations of familiar threats",
        ],
        code: { lang: "python", label: "Python", code:
`suspicious_signs = ["urgent action required", "verify your account", "unusual login"]

def flag_email(subject):
    return any(sign in subject.lower() for sign in suspicious_signs)

print(flag_email("URGENT: Verify your account now"))  # True` },
        pitfalls: [
          "Assuming an attack must look technically sophisticated to be dangerous — many succeed through simple deception",
          "Ignoring small warning signs (an odd login alert, a slightly-off email) that often precede a bigger breach",
          "Believing that antivirus software alone is sufficient protection against all types of threats",
        ],
        practice: "A phishing email pretending to be from a bank, urgently asking you to 'verify your account,' is still one of the most common and effective real-world cyber-attacks.",
      },
      { slug: "security-methods-protocols", title: "Security Methods & Protocols", tag: "advanced",
        desc: "The practical tools and protocols — encryption, secure transmission, troubleshooting — that keep data and systems protected.",
        keyPoints: [
          "Security protocols (like HTTPS/TLS) define standardized, agreed-upon ways to protect data in transit",
          "Encryption transforms readable data into unreadable ciphertext, reversible only with the correct key",
          "Safe data transmission relies on protocols that verify both the sender's identity and the data's integrity",
          "Troubleshooting a security problem starts with identifying exactly what's failing — authentication, encryption, or access",
          "Layered security methods, working together, are more resilient than relying on any single method",
        ],
        code: { lang: "python", label: "Python", code:
`from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

encrypted = cipher.encrypt(b"Sensitive data")
decrypted = cipher.decrypt(encrypted)
print(decrypted.decode())` },
        pitfalls: [
          "Assuming a padlock icon or 'https' alone guarantees a website is entirely trustworthy",
          "Troubleshooting security issues by disabling protections to 'see if that's the problem,' creating new risk",
          "Relying on a single security method instead of combining multiple layers of protection",
        ],
        practice: "Every time a browser shows a padlock icon, TLS has just handled encryption, identity verification, and data integrity for that connection, all before the page even finishes loading.",
      },
      { slug: "computational-perspectives", title: "Computational Perspectives & Applications", tag: "core",
        desc: "How the tools computing offers can be applied thoughtfully to real problems, and the perspective that shapes good use.",
        keyPoints: [
          "A computational perspective means framing a real-world problem in terms of data, processes, and automation",
          "Computing applications span nearly every field: healthcare, agriculture, education, finance, and government",
          "Effective application of computing starts with understanding the actual problem, not just the available technology",
          "The same computational tool, like automation or data analysis, can be applied very differently across fields",
          "Evaluating a computing application means checking whether it truly improves outcomes, not just adds technology for its own sake",
        ],
        code: { lang: "python", label: "Python", code:
`appointments = [("9:00", 15), ("9:15", 20), ("9:45", 10)]  # (time, duration in minutes)

total_minutes = sum(duration for _, duration in appointments)
print(f"Total scheduled time: {total_minutes} minutes")` },
        pitfalls: [
          "Applying a computational solution to a problem that doesn't actually benefit from automation or data analysis",
          "Assuming a computing application that works well in one field will transfer directly to another without adaptation",
          "Focusing on technical sophistication over whether the application solves a genuine, validated problem",
        ],
        practice: "Applying computational thinking to reduce hospital wait times might mean analyzing scheduling data, not building anything flashy — the right computing application is often the simplest one that solves the real bottleneck.",
      },
      { slug: "digital-accessibility-collaboration", title: "Digital Accessibility & Collaboration", tag: "core",
        desc: "Making sure information and collaborative tools are genuinely usable by everyone, not just the most technically equipped.",
        keyPoints: [
          "Equal information accessibility means ensuring resources are usable regardless of ability, language, or connectivity",
          "Collaborative tools (shared documents, video conferencing, project management platforms) enable remote teamwork",
          "Effective collaboration tools reduce friction in communication, version tracking, and shared decision-making",
          "Accessibility and collaboration intersect — a collaborative tool that isn't accessible excludes some team members entirely",
          "Choosing the right collaborative tool depends on team size, technical skill, and the nature of the work",
        ],
        code: { lang: "html", label: "HTML", code:
`<!-- A shared doc link with accessible labeling -->
<a href="https://docs.example.com/plan" aria-label="Open shared project plan document">
  Project Plan
</a>` },
        pitfalls: [
          "Choosing collaboration tools based on popularity alone, without considering their accessibility for all team members",
          "Assuming every team member has equally reliable internet access to fully participate in real-time tools",
          "Introducing too many overlapping collaboration tools, creating confusion rather than efficiency",
        ],
        practice: "A shared document that multiple people can edit simultaneously, with visible version history, replaced the old workflow of emailing files back and forth — a small change with a large collaboration impact.",
      },
    ],
  },
  {
    slug: "unit7-digital-literacy", name: "unit 7: digital literacy", glyph: "⌕", color: "#2E9E5B",
    topics: [
      { slug: "advanced-searches", title: "Performing Advanced Searches & Communicating Results", tag: "core",
        desc: "Using precise search techniques to find credible information, then presenting what you found clearly.",
        keyPoints: [
          "Advanced search techniques include Boolean operators (AND, OR, NOT), exact-phrase quotation marks, and filters by date or source",
          "Academic databases (like Google Scholar) surface peer-reviewed, more rigorously vetted sources than general search engines",
          "A focused research question guides which search terms and filters are actually worth using",
          "Communicating findings well means connecting results directly back to the original research question",
          "Digital presentation tools make it easy to iterate on how findings are shared, beyond a static written report",
        ],
        code: { lang: "python", label: "Python", code:
`query = '"climate policy" site:.gov -blog'
# Boolean operators and quotes narrow results to credible, on-topic sources
print(f"Searching: {query}")` },
        pitfalls: [
          "Relying only on basic keyword searches when Boolean operators or filters would find far more relevant sources",
          "Gathering credible sources but presenting findings in a way that doesn't clearly answer the original question",
          "Trusting the first page of search results without checking source credibility further",
        ],
        practice: "Searching 'climate policy' with a site filter and excluded terms is the kind of precise, filtered search that turns a vague research question into a manageable, credible set of sources.",
      },
    ],
  },
  {
    slug: "unit8-entrepreneurship", name: "unit 8: entrepreneurship in digital age", glyph: "↗", color: "#C98A2E",
    topics: [
      { slug: "building-launching-mvp-g12", title: "Building and Launching the MVP", tag: "core",
        desc: "Turning a validated idea into a real, minimal product ready for actual users.",
        keyPoints: [
          "Building an MVP means focusing engineering effort only on the features needed to test the product's core value",
          "A launch plan should include how early users will find the product and how their feedback will be collected",
          "Technical shortcuts are often acceptable in an MVP if they let the team learn faster from real usage",
          "Setting clear success metrics before launch makes it possible to judge whether the MVP is actually working",
          "Launching is a milestone in an ongoing process, not the final step of product development",
        ],
        code: { lang: "python", label: "Python", code:
`success_metrics = {"signups": 0, "target_signups": 100}

def track_signup():
    success_metrics["signups"] += 1
    if success_metrics["signups"] >= success_metrics["target_signups"]:
        print("MVP goal reached")

for _ in range(100):
    track_signup()` },
        pitfalls: [
          "Delaying launch to add 'just one more feature,' missing the actual point of an MVP",
          "Launching without any way to collect meaningful feedback or usage data from early users",
          "Defining success too vaguely to actually judge whether the MVP achieved its goal",
        ],
        practice: "A minimum viable product succeeds not by being impressive, but by being real enough that its first users' feedback is actually trustworthy.",
      },
      { slug: "iterative-development", title: "Iterative Development", tag: "core",
        desc: "Continuously improving a product after launch, driven by real feedback and data rather than assumptions.",
        keyPoints: [
          "Iterative development means repeatedly refining a product in short cycles based on real feedback and data",
          "Feedback analysis looks for patterns and trends across many users, not just individual comments",
          "Engagement metrics (retention, usage frequency) reveal how well a product is actually satisfying users over time",
          "Prioritization matters — not every piece of feedback deserves equal weight or immediate action",
          "Iterative development requires flexibility to pivot when data contradicts the original assumptions",
        ],
        code: { lang: "python", label: "Python", code:
`feedback = [5, 4, 5, 2, 5, 4, 1, 5]

average = sum(feedback) / len(feedback)
low_scores = [f for f in feedback if f <= 2]
print(f"Average: {average:.1f}, low scores to investigate: {len(low_scores)}")` },
        pitfalls: [
          "Reacting to every individual piece of feedback instead of looking for broader, more reliable patterns",
          "Continuing down an original roadmap despite clear data suggesting a different direction is needed",
          "Iterating on minor details while ignoring larger structural problems the data is pointing to",
        ],
        practice: "A product's star ratings and written feedback both matter, but it's the pattern across hundreds of responses — not any single five-star or one-star review — that should actually drive the next iteration.",
      },
      { slug: "conclusion-future-directions", title: "Conclusion and Future Directions", tag: "core",
        desc: "Reflecting on a product's journey so far, and planning thoughtfully for what comes next.",
        keyPoints: [
          "Reviewing a product's development journey helps identify what worked, what didn't, and why",
          "Future planning should be grounded in real data and user feedback, not just ambition",
          "Scaling a successful MVP often requires revisiting technical, business, and team decisions made early on",
          "Long-term product direction should stay flexible as markets, technology, and user needs continue to change",
          "Documenting lessons learned makes future product decisions faster and better informed",
        ],
        code: { lang: "python", label: "Python", code:
`lessons_learned = [
    "Users wanted faster onboarding",
    "Push notifications increased retention",
    "Feature X was rarely used and was removed",
]

for lesson in lessons_learned:
    print("-", lesson)` },
        pitfalls: [
          "Assuming early success guarantees continued success without ongoing adaptation",
          "Scaling too quickly before validating that the core product genuinely meets a sustained need",
          "Failing to document what was learned, forcing the same lessons to be relearned on future projects",
        ],
        practice: "Looking back at why early assumptions were right or wrong is often more valuable for future planning than looking only at what metrics currently say.",
      },
    ],
  },
];