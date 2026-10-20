/* ---------------------------------------------------------
   GRADE 11 — short questions, keyed by topic slug.
   Written from each topic's content; not copied from any
   textbook's exercises. Wrap code in `backticks` for inline code.
--------------------------------------------------------- */

const GRADE11_QUESTIONS = {};

/* ---------- Unit 1: Computer Systems ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "data-representation": [
    { q: "What is a bit, and why do computers use binary?",
      a: "A bit is a single binary digit, 0 or 1. Computers use binary because electronic circuits can reliably tell apart just two states, such as on/off or high/low voltage." },
    { q: "What do ASCII and Unicode do?",
      a: "Both map characters to numeric codes so text can be stored as numbers. ASCII covers basic English characters, while Unicode covers characters from almost all of the world's writing systems." },
    { q: "Convert the binary number `1101` to decimal.",
      a: "1×8 + 1×4 + 0×2 + 1×1 = 13." },
    { q: "Why is hexadecimal convenient for programmers?",
      a: "Each hex digit stands for exactly four bits, so long binary values can be written in a much shorter, easier-to-read form." },
  ],

  "analog-digital-signals": [
    { q: "Differentiate between analog and digital signals.",
      a: "An analog signal varies continuously over time, like a sound wave. A digital signal uses discrete values, usually just two states (0 and 1)." },
    { q: "What does an analog-to-digital converter (ADC) do?",
      a: "It samples a continuous signal at regular intervals and turns each sample into a number, producing a digital approximation of the original." },
    { q: "What is the effect of a higher sampling rate?",
      a: "It captures more detail and gives a closer match to the original signal, but needs more storage and processing." },
    { q: "Why are digital signals less affected by noise?",
      a: "The receiver only has to decide between a few discrete levels, so small disturbances can be ignored or corrected instead of building up the way they do in analog signals." },
  ],

  "digital-logic-gates": [
    { q: "What is a logic gate?",
      a: "An electronic circuit that performs a basic Boolean operation on one or more binary inputs and produces a single binary output." },
    { q: "When does an AND gate output 1?",
      a: "Only when all of its inputs are 1." },
    { q: "What is the difference between OR and XOR?",
      a: "OR outputs 1 if at least one input is 1 (including both). XOR outputs 1 only when the inputs are different." },
    { q: "Why are NAND and NOR called universal gates?",
      a: "Any other logic gate can be built using only NAND gates (or only NOR gates), so either one alone is enough to build any digital circuit." },
    { q: "What is a truth table?",
      a: "A table listing every possible combination of inputs for a gate or circuit, along with the output each combination produces." },
  ],

  "sdlc": [
    { q: "What is the SDLC?",
      a: "The Software Development Life Cycle: a structured series of phases (requirements, design, implementation, testing, deployment and maintenance) used to build software and keep it running." },
    { q: "Why is requirements gathering done first?",
      a: "The team must know what the software has to do before designing or coding it. Otherwise it may build something that works but solves the wrong problem." },
    { q: "Differentiate between the waterfall and agile approaches.",
      a: "Waterfall moves through the phases one after another in a fixed order. Agile repeats the phases in short cycles so feedback can be used early and often." },
    { q: "Why is maintenance an important phase?",
      a: "After release, software needs bug fixes, updates and improvements. This work often lasts longer and costs more than the original build." },
  ],

  "network-topology": [
    { q: "What is network topology?",
      a: "The arrangement of devices and connections in a network, either physically (how cables are laid out) or logically (how data flows)." },
    { q: "Describe a star topology.",
      a: "Every device connects to a central hub or switch. It is easy to manage and one failed device does not affect the others, but if the central device fails the whole network goes down." },
    { q: "What is the main weakness of a bus topology?",
      a: "All devices share one backbone cable, so a break in that cable can disrupt the whole network, and performance drops as more devices are added." },
    { q: "What is a mesh topology, and what is its advantage?",
      a: "Each device connects directly to several others. It is very reliable because data can take another route if a link fails, but it needs a lot of cabling and costs more." },
  ],

  "cybersecurity-basics": [
    { q: "What are the three goals of the CIA triad?",
      a: "Confidentiality (only authorized people can see data), integrity (data is not altered improperly) and availability (systems and data can be accessed when needed)." },
    { q: "What is phishing?",
      a: "A social-engineering attack in which a fake email or message pretends to come from a trusted source to trick people into giving away passwords or other sensitive information." },
    { q: "Why is reusing the same password risky?",
      a: "If one service is breached, attackers can use the same password to get into all of your other accounts." },
    { q: "Why should software be updated regularly?",
      a: "Updates include patches for known security holes. Delaying them leaves those weaknesses open for attackers to exploit." },
  ],
});

/* ---------- Unit 2: Computational Thinking & Algorithms ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "computational-artifacts": [
    { q: "What is a computational artifact?",
      a: "Anything created using computing, such as a program, animation, simulation or visualization, to solve a problem or express an idea." },
    { q: "What are the usual steps in creating one?",
      a: "Define the problem, design a solution, implement it, then test and revise it." },
    { q: "Why should an artifact be documented?",
      a: "Comments and documentation make it understandable to other people, and to your future self, which makes it easier to fix or extend later." },
    { q: "Why is iteration normal when building an artifact?",
      a: "The first version rarely handles every case. Building, testing and revising lets you find problems and improve the result step by step." },
  ],

  "common-algorithms": [
    { q: "Differentiate between linear search and binary search.",
      a: "Linear search checks items one by one from the start. Binary search repeatedly halves a sorted list to find the target much faster, but it needs the data to be sorted." },
    { q: "What is pseudocode?",
      a: "An informal, language-independent way of writing an algorithm's steps in plain, structured English before turning it into code." },
    { q: "What is the purpose of a flowchart?",
      a: "To show an algorithm's steps and decision points visually, using standard symbols joined by arrows." },
    { q: "Name two simple sorting algorithms.",
      a: "Bubble sort and selection sort." },
  ],
});

/* ---------- Unit 3: Programming Fundamentals ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "programs-python-basics": [
    { q: "What is a computer program?",
      a: "A set of precise instructions that a computer follows step by step to perform a task." },
    { q: "Why is Python considered beginner-friendly?",
      a: "Its syntax is readable and close to English, so learners can focus on logic and problem-solving instead of complicated syntax." },
    { q: "What is an IDE?",
      a: "An Integrated Development Environment: a tool that combines a code editor, a way to run programs and a debugger in one place." },
    { q: "Why does indentation matter in Python?",
      a: "Python uses indentation to mark blocks of code, so wrong indentation changes what the program does or causes an error." },
  ],

  "turtle-libraries": [
    { q: "What is a library in programming?",
      a: "A collection of pre-written code that you can import and reuse instead of writing everything yourself." },
    { q: "What does the `turtle` module let you do?",
      a: "Draw shapes on screen by giving movement commands such as `forward()` and `right()` to an on-screen 'turtle'." },
    { q: "How do you use a library in Python?",
      a: "Import it first with the `import` statement, for example `import turtle`, and then call its functions." },
    { q: "What is the difference between the standard library and third-party libraries?",
      a: "The standard library comes built in with Python. Third-party libraries must be installed separately, usually with `pip`." },
  ],

  "python-variables": [
    { q: "What is a variable?",
      a: "A named reference to a value stored in memory, which a program can read and change." },
    { q: "What does 'dynamically typed' mean in Python?",
      a: "You do not declare a variable's type in advance. The type comes from the value it currently holds and can change when you assign a new value." },
    { q: "Differentiate between `=` and `==`.",
      a: "`=` assigns a value to a variable, while `==` compares two values and gives `True` or `False`." },
    { q: "Name four common data types in Python.",
      a: "`int`, `float`, `str` and `bool`." },
  ],

  "python-io": [
    { q: "Which function reads input from the user, and what type does it return?",
      a: "`input()`. It always returns a string, even if the user types digits." },
    { q: "How do you do arithmetic on a number typed by the user?",
      a: "Convert it first, for example `age = int(input('Age: '))`." },
    { q: "What is an f-string?",
      a: "A string starting with `f` that lets you put variables directly inside braces, such as `f'Hello {name}'`." },
    { q: "Why should input prompts be clear?",
      a: "A clear prompt tells the user exactly what to type and in what format, which prevents mistakes and confusing errors." },
  ],

  "python-operators": [
    { q: "What is the difference between `/` and `//`?",
      a: "`/` is true division and gives a decimal result (`7 / 2` is 3.5). `//` is floor division and gives a whole number (`7 // 2` is 3)." },
    { q: "What does the `%` operator do?",
      a: "It gives the remainder of a division, so `n % 2 == 0` is a common way to check for an even number." },
    { q: "Name the three logical operators.",
      a: "`and`, `or` and `not`." },
    { q: "What is operator precedence?",
      a: "The order in which operators are evaluated in an expression. Parentheses can be used to make the order explicit." },
  ],

  "iteration-loops": [
    { q: "What is a loop?",
      a: "A structure that repeats a block of code multiple times." },
    { q: "Differentiate between a `for` loop and a `while` loop.",
      a: "A `for` loop runs over a known sequence or a set number of times. A `while` loop keeps running as long as its condition stays true." },
    { q: "What is an infinite loop?",
      a: "A loop whose condition never becomes false, so it never ends. It is usually caused by forgetting to update the variable the condition depends on." },
    { q: "What do `break` and `continue` do?",
      a: "`break` exits the loop immediately. `continue` skips the rest of the current iteration and moves on to the next one." },
  ],

  "python-lists": [
    { q: "What is a list in Python?",
      a: "An ordered, changeable collection of items written in square brackets, which can hold values of different types." },
    { q: "What is the index of the first item in a list?",
      a: "0. Python lists are zero-indexed." },
    { q: "How do you add an item to the end of a list?",
      a: "Use the `append()` method, for example `scores.append(90)`." },
    { q: "What error occurs if you access an index that does not exist?",
      a: "An `IndexError`." },
  ],

  "python-functions": [
    { q: "What is a function, and why use one?",
      a: "A named, reusable block of code. Functions avoid repetition and make programs shorter and easier to organize and test." },
    { q: "Differentiate between parameters and arguments.",
      a: "Parameters are the names listed in a function's definition. Arguments are the actual values passed in when the function is called." },
    { q: "What does a function return if it has no `return` statement?",
      a: "`None`." },
    { q: "What is local scope?",
      a: "Variables created inside a function exist only inside that function and cannot be used outside it." },
  ],

  "debugging-py": [
    { q: "What is debugging?",
      a: "The process of finding and fixing errors (bugs) in a program." },
    { q: "Name three types of errors.",
      a: "Syntax errors (the code breaks the language's rules), runtime errors (they happen while the program runs) and logic errors (the program runs but gives wrong results)." },
    { q: "What is a breakpoint?",
      a: "A marker that pauses the program at a chosen line so you can inspect its state and step through the code." },
    { q: "Why should you read the whole error message?",
      a: "The traceback shows exactly where the error happened and what kind it was, which usually points straight to the cause." },
  ],
});

/* ---------- Unit 4: Data and Analysis ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "statistical-modeling": [
    { q: "Define mean, median and mode.",
      a: "The mean is the average, the median is the middle value when the data is sorted, and the mode is the most frequent value." },
    { q: "When is the median a better summary than the mean?",
      a: "When the data has extreme outliers, because outliers pull the mean strongly but hardly affect the median." },
    { q: "Does correlation prove causation?",
      a: "No. Correlation only shows that two variables move together. Something else may explain the link." },
    { q: "What is overfitting?",
      a: "When a model fits the existing data so closely, noise included, that it performs poorly on new data." },
  ],

  "experimental-design": [
    { q: "What is a control group?",
      a: "A group that does not receive the change being tested. It is used as a baseline to compare against the test group." },
    { q: "Why change only one variable at a time?",
      a: "So any difference in the results can be put down to that one variable instead of being mixed up with others." },
    { q: "Why does sample size matter?",
      a: "Small samples can give misleading results by chance. Larger samples make the findings more reliable." },
    { q: "What is reproducibility?",
      a: "The ability to get similar results when an experiment is repeated, which is a sign that the findings can be trusted." },
  ],

  "analyze-visualize-datasets": [
    { q: "Give one use each for a bar chart, a line graph and a pie chart.",
      a: "Bar chart: comparing categories. Line graph: showing change over time. Pie chart: showing parts of a whole." },
    { q: "What is data cleaning?",
      a: "Fixing or removing missing, incorrect or duplicate values before analysis so they do not distort the results." },
    { q: "Name three summary statistics.",
      a: "Mean, range and standard deviation. The median and mode also count." },
    { q: "How can a chart mislead even when the data is accurate?",
      a: "By using unlabeled or truncated axes, or inconsistent scales, which exaggerate or hide differences." },
  ],
});

/* ---------- Unit 5: Applications of Computer Science ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "iot-basics": [
    { q: "What is the Internet of Things?",
      a: "A network of physical devices with built-in sensors and connectivity that collect and exchange data over the internet." },
    { q: "Describe the basic IoT cycle.",
      a: "Sense data, transmit it, process it, then act on it. For example, a thermostat measures temperature and switches the heating on or off." },
    { q: "Give two examples of IoT devices.",
      a: "Smart thermostats, fitness trackers, smart door locks or connected farm sensors." },
    { q: "Why is security a major concern in IoT?",
      a: "Many IoT devices have limited processing power and weak default settings, which makes them easy targets for attackers." },
  ],

  "blockchain-basics": [
    { q: "What is a blockchain?",
      a: "A distributed ledger: a record of transactions shared across many computers and stored in linked blocks." },
    { q: "How are blocks linked together?",
      a: "Each block contains a cryptographic hash of the previous block, so changing one block would break every block after it." },
    { q: "Why is a blockchain hard to tamper with?",
      a: "Altering a past record would mean changing all the later blocks on most of the computers in the network." },
    { q: "Is blockchain the same as cryptocurrency?",
      a: "No. Cryptocurrency is only one application of blockchain technology. It can also be used for supply-chain tracking, land records and more." },
  ],

  "blockchain-iot-integration": [
    { q: "Why combine blockchain with IoT?",
      a: "Sensor data written to a blockchain is very hard to alter later, so the record of what the devices reported can be trusted." },
    { q: "Give one use case for this combination.",
      a: "Tracking a medicine shipment: sensors record temperature and location, and the blockchain makes that log hard to falsify." },
    { q: "What limits this combination?",
      a: "IoT devices have little processing power and memory, so interacting with a blockchain directly is demanding and costly." },
    { q: "Does a blockchain guarantee that sensor data is correct?",
      a: "No. It only protects the record after it is written. A faulty sensor still produces wrong data." },
  ],

  "stakeholders-ai": [
    { q: "Who are the stakeholders of an AI system?",
      a: "Everyone affected by or involved with it: developers, users, businesses, regulators and the people affected by its decisions." },
    { q: "Why might stakeholders' interests conflict?",
      a: "They prioritize different things. For example, a company may want to collect more data while users want more privacy." },
    { q: "Why is transparency important in AI systems?",
      a: "When people can see how an AI makes decisions, they can trust it, question it and spot unfair outcomes." },
    { q: "Why consider stakeholders early in design?",
      a: "It is far easier to prevent harmful or unpopular outcomes while designing than to fix them after the system is in use." },
  ],
});

/* ---------- Unit 6: Impacts of Computing ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "information-sources": [
    { q: "Differentiate between primary and secondary sources.",
      a: "Primary sources are original or firsthand material, such as research data or eyewitness accounts. Secondary sources interpret or summarize primary ones." },
    { q: "What is the difference between data and information?",
      a: "Data is raw facts and figures. Information is data that has been organized or processed so that it is meaningful." },
    { q: "Why should you check the publication date of a source?",
      a: "Outdated information may no longer be accurate, especially in fast-changing fields." },
    { q: "How does cross-referencing help?",
      a: "Confirming a claim in several independent sources makes it more likely to be accurate." },
  ],

  "evaluating-reliability": [
    { q: "Name two signs of a reliable source.",
      a: "A named author or organization with expertise, and evidence or citations backing up its claims." },
    { q: "Name two signs of an unreliable source.",
      a: "No author or citations, and a strongly one-sided or sensational tone." },
    { q: "What is bias in data?",
      a: "A systematic distortion caused by how the data was collected, who collected it, or what was left out." },
    { q: "Why can automated tools not fully replace human judgement here?",
      a: "Judging tone, context and intent is hard for software, so people still need to decide whether a source is trustworthy." },
  ],

  "connectivity-effects": [
    { q: "Give two environmental costs of increased connectivity.",
      a: "Energy use by data centers, and electronic waste from discarded devices." },
    { q: "How has connectivity affected culture?",
      a: "It spreads languages, ideas and trends across borders quickly, though it can also reduce local differences." },
    { q: "Name one social effect of constant connectivity.",
      a: "It changes how people communicate and build relationships, and it can affect attention and wellbeing." },
    { q: "Are the benefits of connectivity shared equally?",
      a: "No. People with poor access to devices or the internet get fewer of its benefits." },
  ],

  "assistive-digital-divide": [
    { q: "What are assistive devices?",
      a: "Tools such as screen readers, adaptive keyboards and digital hearing aids that help people with disabilities use technology." },
    { q: "What is the digital divide?",
      a: "The gap between people who have computing devices, internet access and digital skills and those who do not." },
    { q: "Name two causes of the digital divide.",
      a: "Differences in income, and a lack of infrastructure in some regions. A lack of digital skills also contributes." },
    { q: "Why should accessibility be built in from the start?",
      a: "Adding it later is harder and costlier, and designing for everyone usually improves the product for all users." },
  ],

  "technological-innovations": [
    { q: "Describe the usual cycle of an innovation.",
      a: "Invention, adoption, refinement and, sometimes, replacement by something newer." },
    { q: "Why do some new technologies fail?",
      a: "They may cost too much, be hard to use, or not offer a real advantage over existing options." },
    { q: "What are unintended consequences?",
      a: "Effects nobody planned or expected, which only become clear after a technology is widely used." },
    { q: "What question helps you evaluate a new technology?",
      a: "What problem does it actually solve, and what does it cost (in money, risk and side effects) to solve it?" },
  ],
});

/* ---------- Unit 7: Digital Literacy ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "data-collection-strategies": [
    { q: "Why should data collection start with a clear research question?",
      a: "The question decides what data you need and stops you from collecting data that does not help." },
    { q: "Name three data collection methods.",
      a: "Surveys, interviews and observation. Using existing datasets is another." },
    { q: "Differentiate between qualitative and quantitative data.",
      a: "Qualitative data is descriptive, such as opinions or words. Quantitative data is numeric and can be counted or measured." },
    { q: "What is a sample, and why must it be representative?",
      a: "A sample is the part of a group that you collect data from. If it does not represent the whole group, conclusions drawn from it can be wrong." },
  ],

  "data-presentation": [
    { q: "What should a data presentation connect back to?",
      a: "The original research question, showing clearly what the data says about it." },
    { q: "Why should you present contradicting data too?",
      a: "It makes your conclusions more honest and credible than showing only the evidence that supports your view." },
    { q: "What is cherry-picking?",
      a: "Selecting only the data that supports a preferred conclusion and ignoring the rest." },
    { q: "Name two digital tools for presenting findings.",
      a: "Spreadsheets, for tables and charts, and presentation software." },
  ],
});

/* ---------- Unit 8: Entrepreneurship in Digital Age ---------- */
Object.assign(GRADE11_QUESTIONS, {
  "product-development-intro": [
    { q: "What is the first step of product development?",
      a: "Identifying a real problem that is worth solving for a specific group of people." },
    { q: "Why do market research?",
      a: "To check that people actually want a solution before spending heavily on building it." },
    { q: "What is a product roadmap?",
      a: "A plan showing the steps and features from the initial idea to launch." },
    { q: "Why get user feedback early?",
      a: "Changes are much cheaper before full development, so early feedback prevents expensive mistakes." },
  ],

  "understanding-prototypes": [
    { q: "What is a prototype?",
      a: "An early, simplified version of a product, used to test ideas before full development." },
    { q: "Differentiate between low-fidelity and high-fidelity prototypes.",
      a: "Low-fidelity ones (sketches, paper mockups) are quick and cheap. High-fidelity ones look and behave more like the finished product." },
    { q: "Why build a prototype early?",
      a: "Flaws in usability or feasibility show up before expensive development starts." },
    { q: "Is a prototype a finished product?",
      a: "No. It exists to answer specific questions, not to be released." },
  ],

  "creating-prototypes": [
    { q: "In what order does prototyping usually progress?",
      a: "From low-fidelity sketches to higher-fidelity clickable mockups or basic working models." },
    { q: "Why focus only on the features being tested?",
      a: "Copying the whole product wastes time. A prototype only needs enough to answer your questions." },
    { q: "Why involve users while creating a prototype?",
      a: "Their reactions reveal problems early, before you have invested too much in one design." },
    { q: "Why document design decisions?",
      a: "It records why choices were made, so the team does not have to decide them again later." },
  ],

  "testing-prototypes": [
    { q: "What is usability testing?",
      a: "Watching real users try to complete tasks with the prototype to find where they struggle." },
    { q: "How many users are needed for a useful test?",
      a: "Even a small number of representative users usually reveals the most important problems." },
    { q: "Why test with people outside the team?",
      a: "Team members already know how it should work, so they cannot give genuine first impressions." },
    { q: "Why should you avoid guiding users during a test?",
      a: "Helping them hides the real problems. You need to see their natural behaviour." },
  ],

  "building-launching-mvp-g11": [
    { q: "What does MVP stand for?",
      a: "Minimum Viable Product." },
    { q: "What is the purpose of an MVP?",
      a: "To release the smallest useful version so you can learn from real users before building more." },
    { q: "Why launch early?",
      a: "It reduces the risk of spending time and money on features nobody wants." },
    { q: "Is launching the MVP the end of development?",
      a: "No. It is the start of iteration, because feedback and data shape what gets built next." },
  ],
});
