/* ---------------------------------------------------------
   GRADE 11 — Federal Board (Pakistan) Computer Science.
   Original notes written from the National Curriculum 2022-23
   unit/topic structure. Not a transcription of any textbook.
--------------------------------------------------------- */

const GRADE11_DATA = [
  {
    slug: "unit1-computer-systems", name: "unit 1: computer systems", glyph: "⚙", color: "#3B6FA6",
    topics: [
      { slug: "data-representation", title: "Data Representation in a Digital Computer", tag: "core",
        desc: "How computers represent numbers, text, and other data using binary — the foundation everything else builds on.",
        keyPoints: [
          "All data in a digital computer is ultimately stored and processed as binary digits (bits): 0s and 1s",
          "Numbers can be represented in different bases: binary (base 2), decimal (base 10), and hexadecimal (base 16)",
          "Text is represented using character encoding standards like ASCII and Unicode, mapping characters to numeric codes",
          "Images, audio, and video are represented as structured collections of binary values, not as text",
          "Converting between binary, decimal, and hexadecimal is a core skill for understanding how data is stored and addressed",
        ],
        code: { lang: "python", label: "Python", code:
`# Converting between number systems
decimal_value = 42
print(bin(decimal_value))   # '0b101010' - binary
print(hex(decimal_value))   # '0x2a' - hexadecimal

# Going the other way
print(int('101010', 2))     # 42 - binary string to decimal
print(int('2a', 16))        # 42 - hex string to decimal` },
        pitfalls: [
          "Assuming '8 bits = 1 byte' always applies to every architecture, when byte size has historically varied",
          "Confusing how a number is represented (binary) with how it's displayed (decimal), leading to conversion errors",
          "Forgetting that negative numbers need a specific representation scheme (like two's complement), not just a minus sign",
        ],
        practice: "Every file format — a photo, a song, a spreadsheet — is ultimately just a specific, agreed-upon way of interpreting a long string of binary digits.",
      },
      { slug: "analog-digital-signals", title: "Analog and Digital Signals", tag: "core",
        desc: "The difference between continuous real-world signals and the discrete values computers actually work with.",
        keyPoints: [
          "Analog signals vary continuously over time, like sound waves or temperature changes",
          "Digital signals represent information as discrete values, typically just two states (high/low, 0/1)",
          "Analog-to-digital conversion (ADC) samples a continuous signal at intervals to produce a digital approximation",
          "Higher sampling rates capture more detail but require more storage and processing",
          "Digital signals are more resistant to noise and degradation than analog signals during transmission and storage",
        ],
        code: { lang: "python", label: "Python", code:
`import math

def sample_signal(duration, sample_rate):
    samples = []
    for i in range(int(duration * sample_rate)):
        t = i / sample_rate
        value = math.sin(2 * math.pi * 5 * t)  # a 5 Hz analog wave
        samples.append(round(value, 3))
    return samples

print(sample_signal(1, 10))  # 10 digital samples per second` },
        pitfalls: [
          "Assuming digital signals are 'more accurate' by nature — they're an approximation, and low sampling rates lose real information",
          "Forgetting that most real-world phenomena start out analog and must be converted before a computer can process them",
          "Overlooking that digital-to-analog conversion is needed to turn digital data back into something we can see or hear",
        ],
        practice: "Every time you record audio on a phone, you're watching analog-to-digital conversion happen in real time — the microphone captures a continuous wave, and the phone samples it thousands of times per second to store it digitally.",
      },
      { slug: "digital-logic-gates", title: "Digital Logic and Logic Gates", tag: "core",
        desc: "The basic building blocks — AND, OR, NOT, and friends — that all digital circuits and processors are built from.",
        keyPoints: [
          "Logic gates are physical circuits that implement basic boolean operations: AND, OR, NOT, NAND, NOR, XOR",
          "A truth table lists every possible input combination and the corresponding output for a gate or circuit",
          "Combining simple gates lets you build more complex circuits, like adders and multiplexers",
          "NAND and NOR gates are 'universal' — any other logic gate can be built using only NAND gates (or only NOR gates)",
          "Boolean algebra provides the mathematical rules for simplifying logic circuits before they're built",
        ],
        code: { lang: "python", label: "Python", code:
`def AND(a, b): return a and b
def OR(a, b): return a or b
def NOT(a): return not a
def NAND(a, b): return not (a and b)

print(AND(True, False))   # False
print(NAND(True, True))   # False - NOT + AND combined` },
        pitfalls: [
          "Confusing OR (true if at least one input is true) with XOR (true only if inputs differ)",
          "Forgetting that a NAND gate is NOT + AND applied together, not just AND with a different symbol",
          "Not simplifying a logic expression before building it, resulting in a more complex circuit than necessary",
        ],
        practice: "Every operation a CPU performs — arithmetic, comparisons, branching — ultimately reduces to millions of these simple logic gates switching on and off.",
        table: { headers: ["Gate", "Output is TRUE when..."], rows: [
          ["AND", "all inputs are TRUE"],
          ["OR", "at least one input is TRUE"],
          ["NOT", "the single input is FALSE"],
          ["XOR", "inputs are different"],
          ["NAND", "not all inputs are TRUE"],
          ["NOR", "no inputs are TRUE"],
        ]},
      },
      { slug: "sdlc", title: "Software Development Life Cycle (SDLC)", tag: "core",
        desc: "The structured phases software typically passes through, from an idea to a maintained product.",
        keyPoints: [
          "Common SDLC phases: requirements gathering, design, implementation, testing, deployment, and maintenance",
          "The waterfall model moves through phases sequentially; agile models iterate through them repeatedly in short cycles",
          "Requirements gathering determines what the software needs to do before any code is written",
          "Testing isn't a single phase — it happens throughout development, not just at the end",
          "Maintenance is often the longest phase of a software product's life, handling bug fixes and updates after release",
        ],
        code: { lang: "python", label: "Python", code:
`phases = ["Requirements", "Design", "Implementation", "Testing", "Deployment", "Maintenance"]

for i, phase in enumerate(phases, start=1):
    print(f"Phase {i}: {phase}")` },
        pitfalls: [
          "Treating SDLC as a strict linear checklist rather than a framework that gets adapted to the project",
          "Skipping proper requirements gathering, leading to software that's technically correct but solves the wrong problem",
          "Underestimating the maintenance phase, which usually costs more over time than the initial build",
        ],
        practice: "Whichever methodology a team uses, the same underlying questions get answered in some order: what are we building, how will we build it, does it work, and how do we keep it working.",
      },
      { slug: "network-topology", title: "Network Topology", tag: "core",
        desc: "The different ways devices on a network can be physically or logically arranged.",
        keyPoints: [
          "Bus topology connects all devices to a single central cable — simple but a single point of failure",
          "Star topology connects all devices to a central hub or switch — easy to manage, but the hub is critical",
          "Ring topology connects devices in a closed loop, with data passing from device to device",
          "Mesh topology connects devices directly to many others, offering redundancy at the cost of complexity and cabling",
          "Real-world networks often combine topologies (hybrid) to balance cost, reliability, and performance",
        ],
        code: { lang: "python", label: "Python", code:
`# A star topology represented as an adjacency list
network = {
    "hub": ["pc1", "pc2", "pc3", "printer"],
    "pc1": ["hub"],
    "pc2": ["hub"],
    "pc3": ["hub"],
    "printer": ["hub"],
}

print(len(network["hub"]))  # devices connected to the hub` },
        pitfalls: [
          "Assuming one topology is 'best' in general, rather than a fit for specific reliability, cost, and scale needs",
          "Confusing physical topology (how cables are laid out) with logical topology (how data actually flows)",
          "Overlooking that a star topology's central hub is a single point of failure, just like bus topology's cable",
        ],
        practice: "Most home and office networks today are physically star-topology (everything plugs into a router or switch), because it's the easiest to troubleshoot when one device fails.",
      },
      { slug: "cybersecurity-basics", title: "Cybersecurity", tag: "core",
        desc: "The basic principles and threats behind protecting systems, networks, and data.",
        keyPoints: [
          "Confidentiality, integrity, and availability (the 'CIA triad') are the three core goals of cybersecurity",
          "Common threats include malware, phishing, and unauthorized access attempts",
          "Firewalls, antivirus software, and strong authentication are baseline defenses for most systems",
          "Social engineering attacks target people, not just technical vulnerabilities in software",
          "Regular updates and patches close known security holes before attackers can exploit them",
        ],
        code: { lang: "python", label: "Python", code:
`import hashlib

password = "myPassword123"
hashed = hashlib.sha256(password.encode()).hexdigest()
print(hashed)   # never store the plain password itself` },
        pitfalls: [
          "Assuming security is purely a technical problem, when human behavior is often the weakest link",
          "Reusing the same password across multiple accounts, so one breach compromises many services",
          "Ignoring software updates, leaving known and already-patched vulnerabilities exposed",
        ],
        practice: "Phishing emails succeed not because people are careless, but because they're designed to create urgency and bypass careful thinking — recognizing that pressure is itself a security skill.",
      },
    ],
  },
  {
    slug: "unit2-computational-thinking", name: "unit 2: computational thinking & algorithms", glyph: "⌘", color: "#1E8F6F",
    topics: [
      { slug: "computational-artifacts", title: "Computational Artifacts", tag: "core",
        desc: "The tangible outputs of computational thinking — programs, simulations, visualizations, and more.",
        keyPoints: [
          "A computational artifact is anything created using computing, such as a program, animation, or simulation",
          "Building computational artifacts typically involves defining a problem, designing a solution, and implementing it",
          "Artifacts can be evaluated on correctness, efficiency, and how well they meet the original goal",
          "Documentation and comments make an artifact understandable to others (and to your future self)",
          "Iteration — building, testing, and revising — is normal and expected when creating computational artifacts",
        ],
        code: { lang: "python", label: "Python", code:
`# A small computational artifact: a temperature converter
def celsius_to_fahrenheit(c):
    return (c * 9 / 5) + 32

for temp in [0, 20, 37, 100]:
    print(f"{temp}C = {celsius_to_fahrenheit(temp)}F")` },
        pitfalls: [
          "Jumping straight into building without a clear plan of what problem is actually being solved",
          "Treating a first working version as the final version, without testing edge cases",
          "Skipping documentation, making the artifact hard for anyone else (or you, later) to understand or modify",
        ],
        practice: "A weather app, a grade calculator, a simple game — these are all computational artifacts built the same way: understand the problem, design a solution, build, test, revise.",
      },
      { slug: "common-algorithms", title: "Common Computing Algorithms", tag: "core",
        desc: "The everyday algorithmic patterns — searching, sorting, and basic problem-solving strategies — that show up across programming.",
        keyPoints: [
          "Linear search checks each item one by one; binary search repeatedly halves a sorted list to find a target faster",
          "Sorting algorithms (like bubble sort or selection sort) arrange data into a defined order",
          "An algorithm's efficiency is often described by how its runtime grows as the input size grows",
          "Pseudocode lets you plan an algorithm's logic before committing to a specific programming language's syntax",
          "Flowcharts visually represent an algorithm's steps and decision points",
        ],
        code: { lang: "python", label: "Python", code:
`def binary_search(sorted_list, target):
    low, high = 0, len(sorted_list) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_list[mid] == target:
            return mid
        elif sorted_list[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1  # not found` },
        pitfalls: [
          "Using linear search on data that's already sorted, missing the chance to use a much faster binary search",
          "Writing code directly without planning the algorithm first, leading to messier and harder-to-debug logic",
          "Assuming an algorithm that works correctly on small test cases will also perform well at a larger scale",
        ],
        practice: "Binary search is why looking up a word in a printed dictionary is fast — you don't read every page, you jump to the middle and narrow your search each time.",
      },
    ],
  },
  {
    slug: "unit3-programming-fundamentals", name: "unit 3: programming fundamentals", glyph: "{}", color: "#4A6FA0",
    topics: [
      { slug: "programs-python-basics", title: "Computer Programs & Python Basics", tag: "core",
        desc: "What a program actually is, why Python is a common starting language, and the tools used to write and run it.",
        keyPoints: [
          "A computer program is a set of precise instructions a computer executes step by step",
          "Python is a high-level, interpreted language known for readable, English-like syntax",
          "An IDE (Integrated Development Environment) bundles a code editor, runner, and debugger in one tool",
          "Python code is typically saved in .py files and run through an interpreter, not compiled ahead of time",
          "Indentation in Python isn't just style — it defines code blocks, unlike curly-brace languages",
        ],
        code: { lang: "python", label: "Python", code:
`# A first Python program
print("Hello, World!")   # this line is an instruction the interpreter executes

# Comments (like this one) are ignored when the program runs` },
        pitfalls: [
          "Mixing tabs and spaces for indentation, which can cause errors that are hard to spot visually",
          "Assuming Python's simple syntax means the underlying programming concepts are simpler too",
          "Skipping an IDE's debugging tools and relying only on print statements to find every bug",
        ],
        practice: "Python's readability is exactly why it's often a first language — code that reads almost like English lets you focus on learning logic and problem-solving rather than fighting syntax.",
      },
      { slug: "turtle-libraries", title: "Turtle Graphics & Libraries", tag: "core",
        desc: "Drawing with code using Python's turtle module, and the broader idea of libraries that extend what a language can do.",
        keyPoints: [
          "Turtle graphics lets you draw shapes by issuing movement commands (forward, turn) to an on-screen 'turtle'",
          "A library is a collection of pre-written code you can import and reuse instead of writing from scratch",
          "Python's standard library ships with many built-in modules (like math, random, and turtle)",
          "Third-party libraries extend Python further, installed separately (e.g. via pip)",
          "Importing only what you need keeps code cleaner than importing an entire library broadly",
        ],
        code: { lang: "python", label: "Python", code:
`import turtle

t = turtle.Turtle()
for _ in range(4):
    t.forward(100)
    t.right(90)   # draws a square

turtle.done()` },
        pitfalls: [
          "Reinventing functionality that already exists in the standard library, wasting time and introducing bugs",
          "Forgetting to import a library before using its functions, causing a NameError",
          "Not checking a library's documentation, leading to misuse of functions with unexpected parameters",
        ],
        practice: "Turtle graphics is a gentle way to see code and output connected directly — every line of logic maps to a visible line on screen, which is why it's a common first way to teach loops and functions.",
      },
      { slug: "python-variables", title: "Python Variables", tag: "core",
        desc: "How Python stores and labels data during a program's execution.",
        keyPoints: [
          "A variable is a named reference to a value stored in memory",
          "Python is dynamically typed — a variable's type is determined by the value it holds, and can change",
          "Variable names should be descriptive; Python convention favors snake_case (like total_score)",
          "Common types include int, float, str, and bool",
          "Assignment (=) stores a value in a variable; it's different from mathematical equality",
        ],
        code: { lang: "python", label: "Python", code:
`score = 92           # int
average = 87.5        # float
name = "Ayesha"       # str
passed = True         # bool

print(type(score), type(average), type(name), type(passed))` },
        pitfalls: [
          "Using vague variable names (x, data1) that make code hard to read later",
          "Confusing = (assignment) with == (equality comparison), a very common beginner bug",
          "Reassigning a variable to a different type mid-program in a way that confuses the code's logic",
        ],
        practice: "Clear variable names are a form of documentation — score, is_valid, and user_name explain themselves; x, y, and z force a reader to trace back through the code to understand them.",
      },
      { slug: "python-io", title: "Python Input/Output (I/O)", tag: "core",
        desc: "Getting information from the user and displaying results back to them.",
        keyPoints: [
          "input() reads text typed by the user as a string, even if it looks like a number",
          "print() displays output to the console, and can format multiple values together",
          "Input from input() must often be explicitly converted (e.g., with int()) before it can be used numerically",
          "f-strings let you embed variables directly inside a string for readable output formatting",
          "Good I/O includes clear prompts, so the user knows exactly what input is expected",
        ],
        code: { lang: "python", label: "Python", code:
`name = input("What's your name? ")
age = int(input("How old are you? "))

print(f"Hello {name}, next year you'll be {age + 1}.")` },
        pitfalls: [
          "Forgetting to convert input() results before doing math with them, causing a type error",
          "Writing vague prompts that leave the user unsure what format of input is expected",
          "Not handling unexpected input (like text where a number was expected), causing the program to crash",
        ],
        practice: "A calculator program is a simple full loop of I/O: read numbers as text input, convert them, compute a result, then format that result back into readable output.",
      },
      { slug: "python-operators", title: "Operators in Python", tag: "core",
        desc: "The symbols that let you do math, compare values, and combine logical conditions.",
        keyPoints: [
          "Arithmetic operators: +, -, *, /, // (integer division), % (modulus), ** (exponent)",
          "Comparison operators (==, !=, <, >, <=, >=) evaluate to True or False",
          "Logical operators (and, or, not) combine multiple boolean conditions",
          "Operator precedence determines the order operations are evaluated in, just like in math",
          "The modulus operator (%) is especially useful for checking divisibility (e.g., even/odd numbers)",
        ],
        code: { lang: "python", label: "Python", code:
`a, b = 17, 5
print(a // b)   # 3   - floor division
print(a % b)    # 2   - remainder
print(a ** 2)   # 289 - exponent
print(a > b and b > 0)   # True - logical AND` },
        pitfalls: [
          "Confusing / (true division, gives a decimal) with // (floor division, gives a whole number)",
          "Forgetting operator precedence and getting an unexpected result without parentheses to clarify",
          "Using = instead of == inside a condition, which is a syntax error in Python",
        ],
        practice: "The modulus operator is the standard trick behind 'is this number even?' checks (n % 2 == 0) and behind cycling through a fixed range of values, like wrapping around a clock.",
      },
      { slug: "iteration-loops", title: "Iteration & Loops", tag: "core",
        desc: "Repeating actions without repeating code — the for and while loops that drive most real logic.",
        keyPoints: [
          "A for loop iterates a known number of times or over a collection (like a list or range)",
          "A while loop repeats as long as a condition remains true, useful when the iteration count isn't known upfront",
          "break exits a loop early; continue skips to the next iteration",
          "Infinite loops happen when a while loop's condition never becomes false — usually a bug, not a feature",
          "Nested loops (a loop inside another loop) are common for working with grids or combinations of items",
        ],
        code: { lang: "python", label: "Python", code:
`# for loop: known number of iterations
for i in range(5):
    print(i)   # 0 1 2 3 4

# while loop: repeats until a condition is false
count = 0
while count < 5:
    print(count)
    count += 1` },
        pitfalls: [
          "Forgetting to update the condition variable inside a while loop, causing an infinite loop",
          "Using a while loop where a simpler for loop would be clearer and less error-prone",
          "Off-by-one errors — looping one time too many or too few, especially with range()",
        ],
        practice: "Almost anything that processes a list of items — validating every entry in a form, calculating a total from a list of prices — is a loop under the hood, even when a library hides it behind a friendlier function.",
      },
      { slug: "python-lists", title: "Lists", tag: "core",
        desc: "Python's core structure for storing ordered collections of values.",
        keyPoints: [
          "A list is an ordered, mutable collection that can hold items of different types",
          "Items are accessed by index, starting at 0 (list[0] is the first item)",
          "Common operations: append() to add, remove() or pop() to delete, and slicing (list[1:3]) to extract a range",
          "Lists can be looped over directly with a for loop, without needing to track an index manually",
          "List comprehensions offer a compact way to build a new list from an existing one",
        ],
        code: { lang: "python", label: "Python", code:
`scores = [85, 92, 78, 90]
scores.append(88)          # add an item
scores.remove(78)          # remove a specific value

top_scores = [s for s in scores if s >= 88]  # list comprehension
print(top_scores)          # [92, 90, 88]` },
        pitfalls: [
          "Trying to access an index that doesn't exist, causing an IndexError",
          "Modifying a list while looping over it directly, which can skip elements unexpectedly",
          "Confusing a list (mutable, ordered) with other Python collections like tuples (immutable) or sets (unordered)",
        ],
        practice: "A to-do app, a shopping cart, a leaderboard — anything involving an ordered group of items you add to, remove from, or scan through is built on the same list operations.",
      },
      { slug: "python-functions", title: "Functions in Python", tag: "core",
        desc: "Packaging logic into reusable, named blocks — the building blocks of organized programs.",
        keyPoints: [
          "A function is defined with def, and can take parameters and return a value",
          "Functions let you avoid repeating the same code by giving a piece of logic a reusable name",
          "Parameters are the inputs a function expects; arguments are the actual values passed in when calling it",
          "A function without an explicit return statement returns None by default",
          "Variables defined inside a function are local to it, and don't exist outside its scope",
        ],
        code: { lang: "python", label: "Python", code:
`def calculate_average(numbers):
    return sum(numbers) / len(numbers)

test_scores = [85, 92, 78, 90]
print(calculate_average(test_scores))  # 86.25` },
        pitfalls: [
          "Forgetting to return a value, then being surprised the function's result is None",
          "Writing functions that do too many unrelated things, making them hard to test and reuse",
          "Confusing a function definition (def) with actually calling it (functionName())",
        ],
        practice: "Once the same three lines of code show up in a program a second time, that's usually the signal to turn them into a function instead of copying and pasting again.",
      },
      { slug: "debugging-py", title: "Debugging", tag: "advanced",
        desc: "Finding and fixing the inevitable gap between what your code does and what you meant it to do.",
        keyPoints: [
          "Syntax errors are caught before a program runs; runtime errors and logic errors show up during execution",
          "Print statements are a simple, effective way to inspect a variable's value at a specific point",
          "A debugger lets you pause execution (breakpoints) and step through code line by line",
          "Reading the full error message and traceback usually points directly at the problem's location",
          "Reproducing a bug consistently is the first step to actually fixing it",
        ],
        code: { lang: "python", label: "Python", code:
`def average(numbers):
    return sum(numbers) / len(numbers)   # bug: crashes if numbers is empty

try:
    print(average([]))
except ZeroDivisionError:
    print("Can't average an empty list")` },
        pitfalls: [
          "Only reading the first line of an error message and missing the actual root cause further down",
          "Making random changes to 'see if it fixes it' instead of methodically isolating the problem",
          "Fixing the symptom (suppressing an error) instead of the underlying cause",
        ],
        practice: "Experienced programmers don't write bug-free code on the first try any more often than beginners do — the real skill is debugging efficiently, not avoiding bugs entirely.",
      },
    ],
  },
  {
    slug: "unit4-data-analysis", name: "unit 4: data and analysis", glyph: "∑", color: "#8B5CC7",
    topics: [
      { slug: "statistical-modeling", title: "Statistical Modeling", tag: "core",
        desc: "Using math to describe patterns in data and make predictions from it.",
        keyPoints: [
          "A statistical model describes the relationship between variables using mathematical equations",
          "Mean, median, and mode summarize a dataset's central tendency in different ways",
          "A model is fit to existing data, then used to predict or explain new data points",
          "Correlation measures how two variables move together, but doesn't prove one causes the other",
          "Simpler models are often preferred when they explain the data nearly as well as complex ones",
        ],
        code: { lang: "python", label: "Python", code:
`import statistics

scores = [78, 85, 85, 90, 92, 100]
print(statistics.mean(scores))     # 88.33...
print(statistics.median(scores))   # 87.5
print(statistics.mode(scores))     # 85` },
        pitfalls: [
          "Assuming correlation implies causation, a very common statistical misinterpretation",
          "Using the mean on data with extreme outliers, when the median might represent the data better",
          "Overfitting a model so closely to existing data that it fails to generalize to new data",
        ],
        practice: "Weather forecasts, exam grade predictions, and sports statistics all rely on the same core idea: fit a model to historical data, then use it to estimate what comes next.",
      },
      { slug: "experimental-design", title: "Experimental Design in Data Science", tag: "advanced",
        desc: "Structuring an investigation so its results can actually be trusted.",
        keyPoints: [
          "A good experiment isolates one variable at a time to determine its actual effect",
          "A control group provides a baseline to compare results against",
          "Sample size matters — small samples can produce misleading results by chance",
          "Bias can creep in through how data is collected, not just how it's analyzed afterward",
          "Reproducibility — getting similar results if the experiment is repeated — is a hallmark of trustworthy findings",
        ],
        code: { lang: "python", label: "Python", code:
`import random

group = ["student_" + str(i) for i in range(20)]
random.shuffle(group)

control_group = group[:10]
test_group = group[10:]   # random split reduces selection bias` },
        pitfalls: [
          "Drawing conclusions from a sample too small to be statistically meaningful",
          "Changing multiple variables at once, making it impossible to know which one caused an effect",
          "Designing data collection in a way that unintentionally favors a particular outcome",
        ],
        practice: "A/B testing a website's button color is a small, everyday example of experimental design — one variable changed, one control group, measured against a clear outcome.",
      },
      { slug: "analyze-visualize-datasets", title: "Analyzing and Visualizing Datasets", tag: "core",
        desc: "Turning raw data into summary statistics and visuals that people can actually understand.",
        keyPoints: [
          "Summary statistics (mean, range, standard deviation) condense large datasets into a few meaningful numbers",
          "Bar charts compare quantities across categories; line graphs show trends over time; pie charts show proportions",
          "Choosing the right chart type depends on what relationship in the data you're trying to show",
          "Mislabeled axes or inconsistent scales can make a chart misleading, even with accurate data",
          "Cleaning data (handling missing or incorrect values) usually comes before any meaningful analysis",
        ],
        code: { lang: "python", label: "Python", code:
`sales = [120, 135, 128, 150, 142]

print("Total:", sum(sales))
print("Average:", sum(sales) / len(sales))
print("Highest:", max(sales), "Lowest:", min(sales))` },
        pitfalls: [
          "Picking a chart type that doesn't match the data (e.g. a pie chart for data that doesn't sum to a whole)",
          "Skipping data cleaning, letting errors or outliers quietly distort the analysis",
          "Truncating a chart's axis in a way that visually exaggerates small differences",
        ],
        practice: "A well-chosen chart can make a pattern obvious in seconds that would take paragraphs of text to explain from a raw table of numbers.",
      },
    ],
  },
  {
    slug: "unit5-applications", name: "unit 5: applications of computer science", glyph: "◇", color: "#2C8FA8",
    topics: [
      { slug: "iot-basics", title: "Internet of Things (IoT)", tag: "core",
        desc: "How everyday physical devices become connected, data-generating parts of a network.",
        keyPoints: [
          "IoT refers to physical devices embedded with sensors and connectivity to collect and exchange data",
          "Enabling technologies include sensors, wireless connectivity (Wi-Fi, Bluetooth), and cloud platforms",
          "IoT devices typically follow a cycle: sense data, transmit it, process it, and act on it",
          "Interoperability (different devices/brands working together) remains a major challenge in IoT",
          "Security is a critical concern, since many IoT devices have limited processing power for strong protections",
        ],
        code: { lang: "python", label: "Python", code:
`def check_temperature(sensor_reading, threshold=30):
    if sensor_reading > threshold:
        return "Turn on fan"   # the 'act' step in sense-transmit-process-act
    return "No action needed"

print(check_temperature(33))` },
        pitfalls: [
          "Assuming all IoT devices are equally secure — many ship with weak default settings",
          "Overlooking that IoT generates enormous amounts of data, which needs real infrastructure to process",
          "Treating connectivity as automatically valuable, without considering what problem it's actually solving",
        ],
        practice: "A smart thermostat that learns your schedule is a complete IoT loop: sensors gather temperature data, it's sent to the cloud, processed, and used to automatically adjust the house.",
      },
      { slug: "blockchain-basics", title: "Blockchain", tag: "advanced",
        desc: "A way of recording data across many computers so that no single party can alter history unnoticed.",
        keyPoints: [
          "A blockchain is a distributed ledger — a record of transactions shared across many computers (nodes)",
          "Each block contains data and a cryptographic link to the previous block, forming a chain",
          "Altering data already on a blockchain would require changing every subsequent block across the network",
          "Consensus mechanisms let a distributed network agree on which transactions are valid",
          "Blockchain applications extend beyond cryptocurrency into supply chain tracking, land records, and more",
        ],
        code: { lang: "python", label: "Python", code:
`import hashlib

def make_block(data, previous_hash):
    block_content = data + previous_hash
    return hashlib.sha256(block_content.encode()).hexdigest()

genesis_hash = make_block("Genesis Block", "0")
block2_hash = make_block("Transaction A->B", genesis_hash)  # linked to the block before it` },
        pitfalls: [
          "Assuming blockchain is inherently 'secure' for any use case, when it mainly guarantees tamper resistance, not privacy",
          "Confusing blockchain (the underlying technology) with cryptocurrency (one application of it)",
          "Underestimating the energy and computing costs some consensus mechanisms require",
        ],
        practice: "Blockchain's core value is trust without a central authority — useful when multiple parties who don't fully trust each other need to agree on a shared, tamper-evident record.",
      },
      { slug: "blockchain-iot-integration", title: "Integration of Blockchain and IoT", tag: "advanced",
        desc: "Combining tamper-resistant records with real-world sensor data.",
        keyPoints: [
          "Combining IoT and blockchain lets sensor data be recorded in a way that's difficult to alter after the fact",
          "This integration is useful in supply chains, where verifying a product's journey matters",
          "IoT devices' limited processing power is a real constraint when interacting directly with a blockchain",
          "Data integrity from sensors is only as trustworthy as the sensor itself — blockchain doesn't fix a faulty sensor",
          "This is still an emerging area, with real trade-offs between security, cost, and device capability",
        ],
        code: { lang: "python", label: "Python", code:
`import hashlib

def log_sensor_reading(sensor_id, value, previous_hash):
    record = f"{sensor_id}:{value}"
    return hashlib.sha256((record + previous_hash).encode()).hexdigest()

h1 = log_sensor_reading("temp-01", 24.5, "0")
h2 = log_sensor_reading("temp-01", 25.1, h1)   # each reading links to the last` },
        pitfalls: [
          "Assuming blockchain automatically makes IoT sensor data accurate, when it only protects the record after it's recorded",
          "Underestimating the computing overhead blockchain integration adds to already resource-limited IoT devices",
          "Applying this combination where a simpler centralized database would work just as well, at far lower cost",
        ],
        practice: "Tracking a shipment of medicine from factory to pharmacy is a realistic use case — IoT sensors log temperature and location, and a blockchain makes that log difficult to quietly falsify.",
      },
      { slug: "stakeholders-ai", title: "Stakeholder Interests in AI Systems", tag: "core",
        desc: "Recognizing that different groups affected by an AI system often want different, sometimes conflicting things.",
        keyPoints: [
          "Stakeholders in an AI system include developers, users, businesses, regulators, and the people affected by its decisions",
          "Different stakeholders may prioritize different concerns: accuracy, privacy, fairness, cost, or speed",
          "Conflicts of interest can arise, such as a business wanting more data collection while users want more privacy",
          "Transparency about how an AI system makes decisions helps stakeholders trust and evaluate it",
          "Considering stakeholder interests early in design reduces the risk of harmful or unpopular outcomes later",
        ],
        code: { lang: "python", label: "Python", code:
`stakeholders = {
    "developers": "accuracy and performance",
    "users": "fairness and privacy",
    "business": "cost and efficiency",
    "regulators": "compliance and transparency",
}

for group, priority in stakeholders.items():
    print(f"{group}: prioritizes {priority}")` },
        pitfalls: [
          "Designing a system only around the interests of the people building it, ignoring those affected by its decisions",
          "Assuming all users want the same thing from a system, when needs can vary widely across groups",
          "Treating fairness and accuracy as automatically aligned goals, when improving one can sometimes affect the other",
        ],
        practice: "A hiring AI tool has to balance the interests of the company (efficiency), the applicants (fairness), and regulators (compliance) — and those interests don't always point the same direction.",
      },
    ],
  },
  {
    slug: "unit6-impacts-of-computing", name: "unit 6: impacts of computing", glyph: "⚖", color: "#B5473E",
    topics: [
      { slug: "information-sources", title: "Information & Information Sources", tag: "core",
        desc: "Where information comes from, and why the source matters as much as the content.",
        keyPoints: [
          "Information is data that has been processed or organized to be meaningful",
          "Primary sources come directly from original research or firsthand accounts; secondary sources interpret them",
          "Common information sources include books, academic journals, websites, and government publications",
          "Not all sources are equally reliable — authority, currency, and purpose all affect trustworthiness",
          "Cross-referencing multiple independent sources helps verify whether information is accurate",
        ],
        code: { lang: "python", label: "Python", code:
`sources = [
    {"title": "Study on X", "author": "Dr. Khan", "year": 2024},
    {"title": "Blog post about X", "author": None, "year": 2019},
]

for s in sources:
    reliable = s["author"] is not None and s["year"] >= 2022
    print(s["title"], "-> reliable:", reliable)` },
        pitfalls: [
          "Treating the first search result as automatically the most reliable one",
          "Not distinguishing between a source reporting facts and one expressing opinion",
          "Failing to check when a source was published, using outdated information as if it were current",
        ],
        practice: "Fact-checking a claim usually comes down to the same habit: find the original source, not just the article summarizing it.",
      },
      { slug: "evaluating-reliability", title: "Evaluating Information Reliability", tag: "core",
        desc: "Practical habits for judging whether a source of information is trustworthy — and knowing what a computer still can't check for you.",
        keyPoints: [
          "Reliable information typically comes from sources with clear authorship, evidence, and accountability",
          "Bias in data can come from how it was collected, who collected it, or what was left out",
          "Common signs of unreliable sources: no author listed, no citations, or a strong one-sided agenda",
          "Advanced search techniques (specific keywords, filters, quotation marks) help locate more relevant, credible sources",
          "Some verification tasks — judging tone, context, or intent — are still better suited to humans than automated tools",
        ],
        code: { lang: "python", label: "Python", code:
`def reliability_score(has_author, has_citations, is_recent):
    return sum([has_author, has_citations, is_recent])  # a simple 0-3 score

print(reliability_score(True, True, False))  # 2 out of 3` },
        pitfalls: [
          "Assuming a professional-looking website automatically means reliable content",
          "Overlooking that even accurate data can be presented in a biased or misleading way",
          "Relying entirely on automated fact-checking tools without applying any human judgment",
        ],
        practice: "Checking 'who benefits from me believing this' is one of the fastest practical filters for spotting biased or unreliable information sources.",
      },
      { slug: "connectivity-effects", title: "Effects of Increased Connectivity", tag: "core",
        desc: "How being constantly connected reshapes the environment, culture, and daily life — not always for the better.",
        keyPoints: [
          "Increased connectivity has environmental costs, including energy use from data centers and e-waste from devices",
          "Global connectivity has accelerated the spread of culture, language, and ideas across borders",
          "Constant connectivity has changed social behavior, attention spans, and how people build relationships",
          "The benefits of connectivity (access to information, opportunity) aren't distributed equally across the world",
          "Computing's impact is rarely purely positive or negative — most effects involve real trade-offs",
        ],
        code: { lang: "python", label: "Python", code:
`connected_devices_billions = {2018: 22, 2020: 30, 2022: 43, 2024: 55}

years = list(connected_devices_billions.keys())
growth = connected_devices_billions[years[-1]] - connected_devices_billions[years[0]]
print(f"Growth from {years[0]} to {years[-1]}: {growth} billion devices")` },
        pitfalls: [
          "Treating connectivity's effects as uniformly positive, overlooking real costs like environmental impact",
          "Assuming everyone has equal access to the same connectivity and its benefits",
          "Ignoring the cultural and psychological effects of connectivity because they're harder to measure than economic ones",
        ],
        practice: "A single data center's energy use, and a single viral trend's cultural reach, are two sides of the same increased-connectivity story — computing power always has both a footprint and a reach.",
      },
      { slug: "assistive-digital-divide", title: "Assistive Devices & Digital Divide", tag: "core",
        desc: "How technology can both close and widen the gap in who gets to participate fully in a digital world.",
        keyPoints: [
          "Assistive devices (screen readers, adaptive keyboards, digitally-enhanced hearing aids) help make technology usable for people with disabilities",
          "The digital divide refers to unequal access to computing devices, internet connectivity, and digital skills",
          "The divide exists both between countries and within them, often along economic and geographic lines",
          "Designing accessible technology from the start is more effective than retrofitting it later",
          "Closing the digital divide requires more than just hardware — it also needs affordable connectivity and digital literacy",
        ],
        code: { lang: "html", label: "HTML", code:
`<img src="graph.png" alt="Bar chart showing internet access by region">
<!-- alt text is read aloud by screen readers, an assistive technology -->` },
        pitfalls: [
          "Treating accessibility as an optional add-on rather than a core design consideration",
          "Assuming the digital divide is purely about device ownership, ignoring connectivity and skills gaps",
          "Designing 'one-size-fits-all' technology without considering users with different abilities and needs",
        ],
        practice: "Captions, originally built as an assistive feature for deaf viewers, are now used by a huge share of all viewers watching video with the sound off — accessible design often ends up helping everyone.",
      },
      { slug: "technological-innovations", title: "Technological Innovations", tag: "core",
        desc: "How to think critically about new technology, rather than assuming 'newer' always means 'better.'",
        keyPoints: [
          "Technological innovation often follows a cycle: invention, adoption, refinement, and sometimes replacement",
          "Not every new technology succeeds — adoption depends on cost, usability, and real advantage over existing options",
          "Innovations often have unintended consequences that only become clear after widespread adoption",
          "Evaluating an innovation means weighing its benefits against its risks and costs, not just its novelty",
          "Some of the most impactful innovations are improvements to existing ideas, not entirely new inventions",
        ],
        code: { lang: "python", label: "Python", code:
`def adoption_over_time(initial_users, growth_rate, years):
    users = initial_users
    for year in range(1, years + 1):
        users *= (1 + growth_rate)
        print(f"Year {year}: {int(users)} users")

adoption_over_time(1000, 0.4, 5)   # models exponential early adoption` },
        pitfalls: [
          "Assuming new technology is automatically an improvement over what it replaces",
          "Overlooking the unintended social or environmental consequences of a new technology",
          "Judging an innovation only by its initial hype rather than its long-term real-world impact",
        ],
        practice: "Evaluating a new technology usually comes down to the same question analysts ask about anything new: what problem does this actually solve, and what does it cost to solve it?",
      },
    ],
  },
  {
    slug: "unit7-digital-literacy", name: "unit 7: digital literacy", glyph: "⌕", color: "#2E9E5B",
    topics: [
      { slug: "data-collection-strategies", title: "Data Collection Strategies", tag: "core",
        desc: "How to gather information systematically to answer a specific research question.",
        keyPoints: [
          "Data collection starts with a clear, specific research question to guide what's actually gathered",
          "Common methods include surveys, interviews, observation, and using existing (secondary) datasets",
          "Sampling — choosing who or what to collect data from — affects how well results represent the whole picture",
          "Both qualitative (descriptive) and quantitative (numeric) data can help answer different kinds of questions",
          "A data collection plan should be decided before collection starts, not adjusted after seeing early results",
        ],
        code: { lang: "python", label: "Python", code:
`responses = []

def collect_response(answer):
    responses.append(answer)

for r in ["Yes", "No", "Yes", "Yes", "No"]:
    collect_response(r)

print(f"Sample size: {len(responses)}")` },
        pitfalls: [
          "Collecting data without a clear question in mind, resulting in data that doesn't actually answer anything",
          "Using a sample that doesn't represent the group you're trying to draw conclusions about",
          "Changing your methodology mid-collection in a way that makes results inconsistent",
        ],
        practice: "A well-designed survey with 100 representative responses is more useful than a poorly designed one with 10,000 responses from the wrong audience.",
      },
      { slug: "data-presentation", title: "Data Presentation for Research Questions", tag: "core",
        desc: "Communicating what you found in a way that directly answers the question you set out to investigate.",
        keyPoints: [
          "Good data presentation connects directly back to the original research question, not just showing data for its own sake",
          "Visuals should be chosen to highlight the specific pattern or comparison that matters",
          "A clear narrative — what the data shows and why it matters — is as important as the visuals themselves",
          "Presenting both supporting and contradicting data builds more credible, trustworthy conclusions",
          "Digital tools (spreadsheets, presentation software) make it easier to iterate on how findings are shown",
        ],
        code: { lang: "python", label: "Python", code:
`import matplotlib.pyplot as plt

categories = ["Survey A", "Survey B", "Survey C"]
values = [45, 62, 38]

plt.bar(categories, values)
plt.title("Responses by Survey")
plt.show()` },
        pitfalls: [
          "Presenting data without explaining what it means or why it answers the research question",
          "Cherry-picking only the data points that support a preferred conclusion",
          "Overloading a single chart or slide with more information than an audience can actually absorb",
        ],
        practice: "A findings summary that opens with 'here's what we wanted to know, and here's the answer' communicates far more effectively than one that opens with a wall of raw numbers.",
      },
    ],
  },
  {
    slug: "unit8-entrepreneurship", name: "unit 8: entrepreneurship in digital age", glyph: "↗", color: "#C98A2E",
    topics: [
      { slug: "product-development-intro", title: "Introduction to Product Development", tag: "core",
        desc: "The process of turning an idea into something real people can actually use.",
        keyPoints: [
          "Product development starts with identifying a real problem worth solving for a specific group of people",
          "Market research helps validate whether a problem is worth solving before investing heavily in a solution",
          "A product roadmap outlines the planned steps and features from initial idea to launch",
          "Early feedback from potential users is far cheaper to act on than feedback gathered after a full launch",
          "Product development is iterative — first versions are rarely the final version",
        ],
        code: { lang: "python", label: "Python", code:
`product_idea = {
    "problem": "Students forget assignment deadlines",
    "target_user": "high school students",
    "solution": "a simple deadline reminder app",
}

print(f"Building for: {product_idea['target_user']}")` },
        pitfalls: [
          "Building a solution before confirming the problem is real and worth solving",
          "Skipping market research and assuming personal intuition is enough to validate an idea",
          "Treating the first version of a product as the finished product rather than a starting point",
        ],
        practice: "Most successful products didn't start as the polished version people use today — they started as a rough attempt to solve one specific, validated problem.",
      },
      { slug: "understanding-prototypes", title: "Understanding Prototypes", tag: "core",
        desc: "Why a rough, low-cost version of an idea is more useful early on than a polished one.",
        keyPoints: [
          "A prototype is an early, simplified version of a product used to test ideas before full development",
          "Low-fidelity prototypes (sketches, paper mockups) are fast and cheap, ideal for early-stage feedback",
          "High-fidelity prototypes look and behave more like the final product, useful for later-stage testing",
          "Prototypes exist to answer specific questions about usability or feasibility, not to be a finished product",
          "Testing a prototype early can reveal major flaws before expensive development work begins",
        ],
        code: { lang: "python", label: "Python", code:
`fidelity_levels = ["paper sketch", "wireframe", "clickable mockup", "working prototype"]

def next_fidelity(current):
    idx = fidelity_levels.index(current)
    return fidelity_levels[idx + 1] if idx + 1 < len(fidelity_levels) else "done"

print(next_fidelity("wireframe"))  # 'clickable mockup'` },
        pitfalls: [
          "Investing too much polish into an early prototype, making it costly to change based on feedback",
          "Skipping prototyping entirely and going straight to full development",
          "Testing a prototype without a specific question in mind, gathering vague rather than actionable feedback",
        ],
        practice: "A paper sketch of an app's screens can reveal confusing navigation just as effectively as a fully coded version — for a fraction of the time and cost.",
      },
      { slug: "creating-prototypes", title: "Creating Prototypes", tag: "core",
        desc: "The practical process of turning a concept sketch into something people can actually interact with.",
        keyPoints: [
          "Prototyping typically moves from low-fidelity (sketches) to higher-fidelity (clickable mockups or basic working models)",
          "Digital prototyping tools let you simulate interactions without writing full production code",
          "Prototypes should focus on the specific features being tested, not attempt to replicate the entire product",
          "Involving real potential users during creation, not just at the end, catches problems earlier",
          "Documenting design decisions during prototyping makes later full development faster and more consistent",
        ],
        code: { lang: "python", label: "Python", code:
`screens = {
    "login": "signup",
    "signup": "home",
    "home": "profile",
}

current_screen = "login"
current_screen = screens[current_screen]   # simulates tapping 'next' in a clickable mockup
print(current_screen)  # 'signup'` },
        pitfalls: [
          "Building a prototype so complex it takes almost as long as building the real product",
          "Designing only for yourself rather than for the actual target users",
          "Not documenting why design choices were made, forcing the team to re-decide things later",
        ],
        practice: "A clickable mockup that lets a tester tap through a signup flow can expose confusing steps long before a single line of production code is written.",
      },
      { slug: "testing-prototypes", title: "Testing Prototypes", tag: "core",
        desc: "Getting real people to interact with your prototype so you learn what actually works before you build the real thing.",
        keyPoints: [
          "Usability testing observes real users attempting tasks with the prototype, revealing friction points",
          "Testing with even a small number of representative users often reveals the most significant problems",
          "Both what users do and what they say (their frustration, confusion) provide useful signal",
          "Testing early prototypes cheaply prevents expensive redesigns after full development",
          "Feedback should be gathered from users, not just team members who already understand the intended design",
        ],
        code: { lang: "python", label: "Python", code:
`feedback_ratings = [4, 5, 3, 4, 2, 5]

average_rating = sum(feedback_ratings) / len(feedback_ratings)
print(f"Average usability rating: {average_rating:.1f} / 5")` },
        pitfalls: [
          "Testing only with people already familiar with the product's concept, missing genuine first impressions",
          "Leading test users toward the 'correct' way to use the prototype instead of observing natural behavior",
          "Only fixing the specific issues mentioned, without probing why those problems occurred",
        ],
        practice: "Usability testing regularly finds that the feature a team is proudest of is often the one that confuses real users the most — that's exactly why testing happens before a full launch, not after.",
      },
      { slug: "building-launching-mvp-g11", title: "Building and Launching the MVP", tag: "advanced",
        desc: "Releasing the smallest version of a product that still delivers real value, so real-world feedback can guide what comes next.",
        keyPoints: [
          "An MVP (Minimum Viable Product) includes just enough features to be genuinely useful and testable by real users",
          "The goal of an MVP is learning from real usage, not delivering a complete feature set",
          "Launching early reduces the risk of investing heavily in features nobody actually wants",
          "Post-launch metrics and user feedback should directly shape what gets built next",
          "An MVP is a starting point for iteration, not a lesser or unfinished version of the 'real' product",
        ],
        code: { lang: "python", label: "Python", code:
`mvp_features = {
    "user_login": True,
    "core_task_flow": True,
    "social_sharing": False,   # cut from the MVP, added later based on demand
    "push_notifications": False,
}

enabled = [f for f, on in mvp_features.items() if on]
print("Shipping with:", enabled)` },
        pitfalls: [
          "Adding too many features to the MVP, delaying launch and diluting what's actually being tested",
          "Ignoring post-launch feedback and continuing to build based on the original plan alone",
          "Treating a successful MVP launch as the finish line rather than the start of ongoing iteration",
        ],
        practice: "Many well-known products launched with a fraction of the features they have today — the MVP's job was never to be complete, just to prove the core idea was worth building further.",
      },
    ],
  },
];