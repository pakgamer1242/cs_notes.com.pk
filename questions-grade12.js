/* ---------------------------------------------------------
   GRADE 12 — short questions, keyed by topic slug.
   Written from each topic's content; not copied from any
   textbook's exercises. Wrap code in `backticks` for inline code.
--------------------------------------------------------- */

const GRADE12_QUESTIONS = {};

/* ---------- Unit 1: Computer Systems ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "usability-security-accessibility": [
    { q: "Define usability.",
      a: "How easily and efficiently users can accomplish their tasks with a system." },
    { q: "What is accessibility in computing?",
      a: "Designing systems so that people with a wide range of abilities, including disabilities, can use them effectively." },
    { q: "Give an example of an accessibility feature.",
      a: "Screen readers, closed captions, high-contrast modes or zoom functions." },
    { q: "Why can added security reduce usability?",
      a: "Extra protection, such as additional login steps, takes more effort from users and can frustrate them if it is not designed well." },
  ],

  "hci": [
    { q: "What is HCI?",
      a: "Human-Computer Interaction: the study and design of how people interact with computing systems." },
    { q: "Why is feedback important in an interface?",
      a: "It tells users that their action worked and what the system is doing, so they are not left guessing." },
    { q: "Why is consistency important in interface design?",
      a: "Familiar patterns reduce the effort needed to learn and use the system." },
    { q: "Why test an interface with real users?",
      a: "Designers' assumptions about ease of use are often wrong. Real users reveal the actual problems." },
  ],

  "usability-security-tradeoffs": [
    { q: "Give an example of a usability-security trade-off.",
      a: "Multi-factor authentication improves security but adds extra steps every time you log in." },
    { q: "Why does the right balance depend on context?",
      a: "A hospital record system needs much stricter protection than a public blog, so the same measures do not suit both." },
    { q: "How can too much security be harmful?",
      a: "If it is too inconvenient, people find risky workarounds, such as writing their passwords down." },
    { q: "What should security measures be proportional to?",
      a: "The value of what is being protected and the real level of risk." },
  ],
});

/* ---------- Unit 2: Computational Thinking & Algorithms ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "data-structures-g12": [
    { q: "What is a data structure?",
      a: "A way of organizing and storing data so that it can be accessed and modified efficiently." },
    { q: "Differentiate between a stack and a queue.",
      a: "A stack is last-in, first-out (LIFO). A queue is first-in, first-out (FIFO)." },
    { q: "Give a real-life example of a stack.",
      a: "The undo feature in an application: the most recent action is the first one undone. A pile of plates is another example." },
    { q: "What should decide your choice of data structure?",
      a: "Which operations matter most for the problem, such as searching, inserting or deleting." },
  ],

  "evaluating-solutions": [
    { q: "On what criteria is a computational solution evaluated?",
      a: "Correctness, efficiency, and how well it works on different inputs (generalization). Readability matters too." },
    { q: "What does Big-O notation describe?",
      a: "How an algorithm's running time or memory use grows as the input size grows." },
    { q: "Differentiate between time complexity and space complexity.",
      a: "Time complexity measures how long an algorithm takes. Space complexity measures how much memory it uses." },
    { q: "Why does maintainability matter?",
      a: "A solution that nobody can understand later is costly to fix or change." },
  ],
});

/* ---------- Unit 3: Programming Fundamentals ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "programming-paradigms": [
    { q: "What is a programming paradigm?",
      a: "A general style or approach to structuring and organizing code." },
    { q: "Name three programming paradigms.",
      a: "Procedural, functional and object-oriented programming." },
    { q: "What is the focus of functional programming?",
      a: "Describing what to compute using functions, instead of changing program state step by step." },
    { q: "Can one language support more than one paradigm?",
      a: "Yes. Python supports procedural and object-oriented styles, and some functional style as well." },
  ],

  "data-structures-file-handling": [
    { q: "Name three Python data structures other than lists.",
      a: "Dictionaries, tuples and sets." },
    { q: "Why use the `with` statement when opening files?",
      a: "It closes the file automatically when the block ends, even if an error occurs." },
    { q: "Differentiate between the `'w'` and `'a'` file modes.",
      a: "`'w'` overwrites the file's existing contents, while `'a'` adds new data to the end." },
    { q: "Why is reading a file line by line useful?",
      a: "It uses less memory than loading the whole file at once, which matters for large files." },
  ],

  "python-databases": [
    { q: "Which module connects Python to an SQLite database?",
      a: "The built-in `sqlite3` module." },
    { q: "Why use parameterized queries?",
      a: "They keep user input separate from the SQL command, which protects against SQL injection." },
    { q: "Why must you call `commit()` after an INSERT?",
      a: "Changes are not saved permanently to the database until they are committed." },
    { q: "Name two advantages of a database over a text file.",
      a: "It handles large, structured data reliably, and it allows fast searching and querying." },
  ],

  "testing-debugging-advanced": [
    { q: "What is a unit test?",
      a: "A small test that checks that one function or component behaves correctly on its own." },
    { q: "What do breakpoints and watches do?",
      a: "A breakpoint pauses execution at a chosen line. A watch lets you monitor a variable's value as the program runs." },
    { q: "Why should you test edge cases?",
      a: "Bugs often appear with unusual inputs, such as an empty list or zero, which simple tests miss." },
    { q: "Does passing all tests prove a program has no bugs?",
      a: "No. It only proves that the cases that were tested work." },
  ],
});

/* ---------- Unit 4: Data and Analysis ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "data-types-ml": [
    { q: "Differentiate between structured and unstructured data.",
      a: "Structured data is organized in tables with fixed fields. Unstructured data, such as text, images and audio, has no fixed format." },
    { q: "Differentiate between discrete and continuous data.",
      a: "Discrete data takes countable values, like the number of students. Continuous data can take any value in a range, like height." },
    { q: "What is categorical data?",
      a: "Data that represents groups or labels, such as colors or yes/no answers, rather than numbers." },
    { q: "Why does the data type matter?",
      a: "It decides which analysis techniques and models can be used correctly." },
  ],

  "data-visualization-g12": [
    { q: "What is data visualization?",
      a: "Showing data as charts, graphs, maps or diagrams so that patterns are easier to see." },
    { q: "Why is it useful?",
      a: "People can understand a pattern much faster from a good chart than from rows of raw numbers." },
    { q: "Name two choices that affect how a chart is read.",
      a: "Color and scale. Labeling also matters." },
    { q: "What is an interactive visualization?",
      a: "One that lets users explore the data themselves, for example by filtering or zooming." },
  ],

  "hypothesis-testing": [
    { q: "What is a hypothesis?",
      a: "A testable, educated guess about a relationship between variables." },
    { q: "Differentiate between the null and alternative hypotheses.",
      a: "The null hypothesis says there is no effect or relationship. The alternative hypothesis says there is one." },
    { q: "What does a p-value help you decide?",
      a: "Whether the observed result is likely to be just due to chance, which guides whether to reject the null hypothesis." },
    { q: "What does 'failing to reject the null hypothesis' mean?",
      a: "The data did not give strong enough evidence against it. It does not prove that the null hypothesis is true." },
  ],
});

/* ---------- Unit 5: Applications of Computer Science ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "iot-applications": [
    { q: "Name two areas where IoT suits Pakistan's needs.",
      a: "Agriculture, for example smart irrigation, and traffic or utility management." },
    { q: "What three things does an IoT application design consider?",
      a: "What to sense, how to transmit the data, and what action to take on it." },
    { q: "How do local conditions affect IoT design?",
      a: "Limited connectivity and unreliable power decide which solutions are actually practical." },
    { q: "Why plan for maintenance from the start?",
      a: "Batteries, connectivity costs and repairs continue after deployment, and ignoring them can make a system fail." },
  ],

  "blockchain-applications": [
    { q: "Give two blockchain applications relevant to Pakistan.",
      a: "Land registry and supply-chain transparency. Secure record-keeping is another." },
    { q: "How does blockchain help reduce fraud?",
      a: "Records are tamper-evident, so changing them afterwards is very difficult and easy to detect." },
    { q: "Does blockchain fix wrong data entry?",
      a: "No. It protects records after they are added, but it cannot tell whether the original entry was truthful." },
    { q: "What can slow down blockchain adoption?",
      a: "Infrastructure limits, regulation, and reluctance to change existing systems." },
  ],

  "cloud-computing-g12": [
    { q: "What is cloud computing?",
      a: "Delivering computing resources such as servers, storage and software over the internet, on demand." },
    { q: "Differentiate between IaaS, PaaS and SaaS.",
      a: "IaaS provides raw infrastructure. PaaS provides a managed platform for building applications. SaaS provides ready-to-use software." },
    { q: "Name two benefits and one drawback of cloud computing.",
      a: "Benefits: lower upfront cost and easy scaling. Drawback: ongoing costs and dependence on the provider." },
    { q: "Who is responsible for securing data stored in the cloud?",
      a: "The organization using the service still has to manage access and security properly, not just the provider." },
  ],

  "neural-networks-deep-learning": [
    { q: "What is a neural network?",
      a: "A model made of layers of connected nodes, loosely inspired by brain neurons, that learns patterns from data." },
    { q: "What makes learning 'deep'?",
      a: "Having many layers, which lets the network learn more complex patterns." },
    { q: "How does a neural network learn?",
      a: "It adjusts its internal weights based on the error between its predictions and the actual outcomes." },
    { q: "Name two applications of deep learning.",
      a: "Image recognition and speech recognition. Recommendation systems are another." },
  ],

  "data-sharing-privacy": [
    { q: "Give two benefits of data sharing.",
      a: "Better collaboration and research, and better decision-making across organizations." },
    { q: "What is PII?",
      a: "Personally Identifiable Information: details such as names, ID numbers and contact information that can identify a person." },
    { q: "Why can data sharing conflict with privacy?",
      a: "Sharing makes data more useful, but exposing personal details goes against people's expectation of controlling their own information." },
    { q: "How can organizations reduce this conflict?",
      a: "By anonymizing data, getting clear consent and having clear policies." },
  ],
});

/* ---------- Unit 6: Impacts of Computing ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "privacy-identity-theft": [
    { q: "What is identity theft?",
      a: "Using another person's private information to impersonate them or commit fraud." },
    { q: "Give two ways to prevent it.",
      a: "Use strong, unique passwords and avoid sharing unnecessary personal details online. Monitoring your accounts also helps." },
    { q: "Can a careful person still be affected?",
      a: "Yes. A data breach at an organization can expose personal information even if the individual was careful." },
    { q: "Why is prevention better than recovery?",
      a: "Recovering from identity theft is usually costly and takes a long time." },
  ],

  "cyber-attacks-threats": [
    { q: "Name three types of cyber-attack.",
      a: "Phishing, malware and denial-of-service attacks. Man-in-the-middle attacks are another." },
    { q: "What is a denial-of-service attack?",
      a: "Flooding a system with traffic or requests so that legitimate users cannot use it." },
    { q: "What is social engineering?",
      a: "Manipulating people, rather than breaking technology, into giving away access or information." },
    { q: "Give two warning signs of a cyber threat.",
      a: "Unusual account activity or login alerts, and unexpected requests or sudden system slowdowns." },
  ],

  "security-methods-protocols": [
    { q: "What is encryption?",
      a: "Converting readable data into unreadable ciphertext that only someone with the correct key can turn back." },
    { q: "What do HTTPS and TLS provide?",
      a: "Encryption of data in transit, verification of the website's identity, and protection against tampering." },
    { q: "Why use layered security?",
      a: "If one protection fails, the others still guard the system, so no single failure exposes everything." },
    { q: "What is the first step in troubleshooting a security problem?",
      a: "Identify exactly what is failing (authentication, encryption or access control) instead of switching protections off to test." },
  ],

  "computational-perspectives": [
    { q: "What is a computational perspective?",
      a: "Looking at a real-world problem in terms of data, processes and automation." },
    { q: "Name three fields where computing is applied.",
      a: "Healthcare, agriculture and education. Finance and government are others." },
    { q: "Why start with the problem rather than the technology?",
      a: "Otherwise you may build something impressive that does not solve any real need." },
    { q: "How do you judge a computing application?",
      a: "Check whether it truly improves outcomes, not just whether it uses technology." },
  ],

  "digital-accessibility-collaboration": [
    { q: "What is equal information accessibility?",
      a: "Making resources usable regardless of ability, language or connectivity." },
    { q: "Name two collaborative tools.",
      a: "Shared documents and video conferencing. Project-management platforms are another." },
    { q: "How do collaboration tools help teams?",
      a: "They reduce friction in communication, version tracking and shared decision-making." },
    { q: "Why must collaborative tools be accessible?",
      a: "An inaccessible tool shuts some team members out of the work completely." },
  ],
});

/* ---------- Unit 7: Digital Literacy ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "advanced-searches": [
    { q: "Name three Boolean operators used in searching.",
      a: "`AND`, `OR` and `NOT`." },
    { q: "What do quotation marks do in a search?",
      a: "They search for the exact phrase instead of treating the words separately." },
    { q: "Why use academic databases such as Google Scholar?",
      a: "They list peer-reviewed, more carefully checked sources than general search results do." },
    { q: "Why should findings link back to the research question?",
      a: "So that your results clearly show the answer to what you set out to investigate." },
  ],
});

/* ---------- Unit 8: Entrepreneurship in Digital Age ---------- */
Object.assign(GRADE12_QUESTIONS, {
  "building-launching-mvp-g12": [
    { q: "What should an MVP include?",
      a: "Only the features needed to test the product's core value with real users." },
    { q: "Why set success metrics before launch?",
      a: "Without clear targets you cannot tell whether the MVP is actually working." },
    { q: "Is it acceptable to take technical shortcuts in an MVP?",
      a: "Often yes, if it helps the team learn faster from real usage. They can be improved later." },
    { q: "Why plan how to collect feedback?",
      a: "Launching without a feedback channel wastes the main benefit of an MVP, which is learning from users." },
  ],

  "iterative-development": [
    { q: "What is iterative development?",
      a: "Improving a product repeatedly in short cycles, using real feedback and data." },
    { q: "Why look for patterns in feedback?",
      a: "One comment can be unrepresentative. Patterns across many users show what truly matters." },
    { q: "Name two engagement metrics.",
      a: "Retention rate and usage frequency." },
    { q: "What does 'pivot' mean?",
      a: "Changing direction when the data shows that the original plan is not working." },
  ],

  "conclusion-future-directions": [
    { q: "Why review a product's journey?",
      a: "To see what worked, what did not and why, so that future decisions are better informed." },
    { q: "What should future plans be based on?",
      a: "Real data and user feedback, not just ambition." },
    { q: "What can scaling a successful MVP require?",
      a: "Revisiting early technical, business and team decisions." },
    { q: "Why document lessons learned?",
      a: "So the same lessons do not have to be learned all over again on future projects." },
  ],
});
