/* ---------------------------------------------------------
   CS Notes — reference data.
   Each subfield has a color used for its pill, sidebar glyph,
   and card accent. Each topic carries key points, a runnable
   code example, common pitfalls, a real-world practice note,
   and sometimes a reference table. Extend as your coursework grows.
--------------------------------------------------------- */



/* ---------------------------------------------------------
   Sections — CS Reference, 11th Class, 12th Class.
   REFERENCE_DATA, GRADE11_DATA, GRADE12_DATA are defined in
   data-reference.js, data-grade11.js, data-grade12.js,
   loaded before this file.
--------------------------------------------------------- */

const SECTIONS = {
  reference: { key: "reference", label: "CS Reference", data: REFERENCE_DATA,
    groupWord: "subfield", eyebrow: "personal reference workspace",
    heading: "Learn Computer<br>Science, your way.",
    blurb: "key points, runnable code examples, common pitfalls, and quick-reference tables" },
  grade11: { key: "grade11", label: "11th Class", data: GRADE11_DATA,
    groupWord: "unit", eyebrow: "grade 11 · federal board pakistan",
    heading: "11th Class<br>Computer Science Notes.",
    blurb: "key points, code examples, common pitfalls, and real-world context for every unit" },
  grade12: { key: "grade12", label: "12th Class", data: GRADE12_DATA,
    groupWord: "unit", eyebrow: "grade 12 · federal board pakistan",
    heading: "12th Class<br>Computer Science Notes.",
    blurb: "key points, code examples, common pitfalls, and real-world context for every unit" },
};

let DATA = SECTIONS.reference.data;

/* ---------------------------------------------------------
   State — notes and resources persist to localStorage.
--------------------------------------------------------- */

const state = {
  section: "reference",
  notes: {},
  resources: {},
  activeTopic: null,
  openDirs: new Set(),
  filter: "",
  sidebarCollapsed: false,
  chromeCollapsed: false,
};

/* ---------------------------------------------------------
   Profiles — lets multiple people share one browser/device,
   each with their own separate notes, resources, and progress.
   No passwords: nothing sensitive is being protected, this is
   just a way to keep separate people's study data apart on a
   shared computer. Everything still lives only in this browser.
--------------------------------------------------------- */

const PROFILES_KEY = "cs-notes-profiles-v1";
const LEGACY_STORAGE_KEY = "cs-notes-app-data-v1"; // pre-profiles data, migrated once
const PROFILE_COLORS = ["#55D68F", "#3E8FA0", "#C98A2E", "#8B5CC7", "#B5473E", "#2C8FA8", "#2E9E5B"];

let profiles = [];
let activeProfileId = null;
let storageAvailable = true;
let saveTimer = null;

function profileDataKey(id) { return `cs-notes-profile-${id}-v1`; }

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateProfileId() {
  return "p_" + generateId();
}

function pickProfileColor() {
  return PROFILE_COLORS[profiles.length % PROFILE_COLORS.length];
}

function saveProfilesList() {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify({ profiles, activeProfileId }));
  } catch (e) {
    storageAvailable = false;
    console.warn("CS Notes: couldn't save the profile list.", e);
  }
}

function loadProfilesList() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.profiles) && parsed.profiles.length) {
        profiles = parsed.profiles;
        activeProfileId = parsed.activeProfileId && profiles.some(p => p.id === parsed.activeProfileId)
          ? parsed.activeProfileId : profiles[0].id;
        return;
      }
    }
  } catch (e) {
    storageAvailable = false;
    console.warn("CS Notes: couldn't read the profile list.", e);
  }

  // No profile list yet — migrate any pre-profiles data, or start fresh.
  const newId = generateProfileId();
  const newProfile = { id: newId, name: "You", color: pickProfileColor(), createdAt: Date.now() };
  profiles = [newProfile];
  activeProfileId = newId;

  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      localStorage.setItem(profileDataKey(newId), legacyRaw);
    }
  } catch (e) { /* no legacy data to migrate, that's fine */ }

  saveProfilesList();
}

function getActiveProfile() {
  return profiles.find(p => p.id === activeProfileId) || profiles[0];
}

function loadActiveProfileData() {
  try {
    const raw = localStorage.getItem(profileDataKey(activeProfileId));
    if (raw) {
      const parsed = JSON.parse(raw);
      state.notes = parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {};
      state.resources = parsed.resources && typeof parsed.resources === "object" ? parsed.resources : {};
      state.sidebarCollapsed = !!parsed.sidebarCollapsed;
      state.chromeCollapsed = !!parsed.chromeCollapsed;
      return;
    }
  } catch (e) {
    storageAvailable = false;
    console.warn("CS Notes: couldn't read this profile's saved data.", e);
  }
  state.notes = {};
  state.resources = {};
  state.sidebarCollapsed = false;
  state.chromeCollapsed = false;
}

function performSave() {
  try {
    localStorage.setItem(profileDataKey(activeProfileId), JSON.stringify({
      notes: state.notes,
      resources: state.resources,
      sidebarCollapsed: state.sidebarCollapsed,
      chromeCollapsed: state.chromeCollapsed,
      savedAt: Date.now(),
    }));
    flashSaveIndicator();
    return true;
  } catch (e) {
    // Quota errors are recoverable (remove something, try again) — don't
    // permanently disable saving for those. Anything else (storage blocked
    // entirely, e.g. some private-browsing modes) isn't worth retrying.
    const isQuotaError = e && (e.name === "QuotaExceededError" || e.code === 22 || e.name === "NS_ERROR_DOM_QUOTA_REACHED");
    if (!isQuotaError) storageAvailable = false;
    console.warn("CS Notes: couldn't save to this browser's storage.", e);
    return false;
  }
}

function saveToStorage() {
  if (!storageAvailable) return;
  // debounce so rapid typing doesn't write on every keystroke
  clearTimeout(saveTimer);
  saveTimer = setTimeout(performSave, 300);
}

function flushPendingSave() {
  if (saveTimer !== null) { clearTimeout(saveTimer); saveTimer = null; }
  if (!storageAvailable) return false;
  return performSave();
}

function flashSaveIndicator() {
  const el = document.getElementById("saveIndicator");
  if (!el) return;
  el.classList.add("visible");
  clearTimeout(flashSaveIndicator._t);
  flashSaveIndicator._t = setTimeout(() => el.classList.remove("visible"), 1200);
}

function clearAllSavedData() {
  const confirmed = confirm(`Delete all of ${getActiveProfile().name}'s saved notes and resources across every section? This can't be undone.`);
  if (!confirmed) return;
  state.notes = {};
  state.resources = {};
  try { localStorage.removeItem(profileDataKey(activeProfileId)); } catch (e) { /* ignore */ }
  renderSidebar();
  renderNavbarStat();
  if (state.activeTopic) {
    const [dirSlug] = state.activeTopic.split(":")[1].split("/");
    const dir = DATA.find(d => d.slug === dirSlug);
    const topic = dir && dir.topics.find(t => topicKey(dir.slug, t.slug) === state.activeTopic);
    if (dir && topic) renderTopic(dir, topic);
  } else {
    renderLanding();
  }
}

function topicKey(dirSlug, topicSlug) { return `${state.section}:${dirSlug}/${topicSlug}`; }

/* ---------------------------------------------------------
   Window controls — minimize/maximize the sidebar and toolbar.
--------------------------------------------------------- */

const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const toggleChromeBtn = document.getElementById("toggleChromeBtn");
const sidebarBtnIcon = document.getElementById("sidebarBtnIcon");
const chromeBtnIcon = document.getElementById("chromeBtnIcon");

function applyLayoutPrefs() {
  document.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  document.body.classList.toggle("chrome-collapsed", state.chromeCollapsed);

  sidebarBtnIcon.innerHTML = state.sidebarCollapsed ? "&#9634;" : "&#8722;";
  toggleSidebarBtn.classList.toggle("active-collapsed", state.sidebarCollapsed);
  toggleSidebarBtn.title = state.sidebarCollapsed ? "Restore sidebar" : "Minimize sidebar";
  toggleSidebarBtn.setAttribute("aria-label", toggleSidebarBtn.title);

  chromeBtnIcon.innerHTML = state.chromeCollapsed ? "&#9634;" : "&#8722;";
  toggleChromeBtn.classList.toggle("active-collapsed", state.chromeCollapsed);
  toggleChromeBtn.title = state.chromeCollapsed ? "Restore toolbar" : "Minimize toolbar";
  toggleChromeBtn.setAttribute("aria-label", toggleChromeBtn.title);
}

toggleSidebarBtn.addEventListener("click", () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applyLayoutPrefs();
  saveToStorage();
});

toggleChromeBtn.addEventListener("click", () => {
  state.chromeCollapsed = !state.chromeCollapsed;
  applyLayoutPrefs();
  saveToStorage();
});

function totalTopicCount() { return DATA.reduce((sum, d) => sum + d.topics.length, 0); }
function notesStartedCount() {
  const prefix = `${state.section}:`;
  return Object.entries(state.notes).filter(([k, v]) => k.startsWith(prefix) && v && v.trim()).length;
}
function resourcesCount() {
  const prefix = `${state.section}:`;
  return Object.entries(state.resources)
    .filter(([k]) => k.startsWith(prefix))
    .reduce((sum, [, arr]) => sum + (arr ? arr.length : 0), 0);
}

/* ---------------------------------------------------------
   Element refs
--------------------------------------------------------- */

const sidebarTree = document.getElementById("sidebarTree");
const contentEl = document.getElementById("content");
const sectionBar = document.getElementById("sectionBar");
const pillStrip = document.getElementById("pillStrip");
const bcPath = document.getElementById("bcPath");
const bcHome = document.getElementById("bcHome");
const navbarStat = document.getElementById("navbarStat");
const searchInput = document.getElementById("searchInput");

/* ---------------------------------------------------------
   Section switching
--------------------------------------------------------- */

function renderSectionBar() {
  sectionBar.innerHTML = "";
  Object.values(SECTIONS).forEach(section => {
    const tab = document.createElement("button");
    tab.className = "section-tab";
    if (state.section === section.key) tab.classList.add("active");
    tab.textContent = section.label;
    tab.addEventListener("click", () => switchSection(section.key));
    sectionBar.appendChild(tab);
  });
}

function switchSection(key) {
  if (state.section === key) return;
  state.section = key;
  DATA = SECTIONS[key].data;
  state.activeTopic = null;
  state.openDirs = new Set();
  state.filter = "";
  searchInput.value = "";
  renderSectionBar();
  renderPillStrip();
  renderSidebar();
  renderNavbarStat();
  renderLanding();
  const heading = document.getElementById("mainHeading");
  if (heading) heading.focus();
}

/* ---------------------------------------------------------
   Navbar stat + breadcrumb
--------------------------------------------------------- */

function renderNavbarStat() {
  navbarStat.innerHTML = `<span class="dot">●</span> ${notesStartedCount()}/${totalTopicCount()} documented`;
}

function renderBreadcrumb(dir, topic) {
  if (!dir) { bcPath.textContent = ""; return; }
  bcPath.textContent = topic ? ` / ${dir.name} / ${topic.slug}` : ` / ${dir.name}`;
}

function goToLanding() {
  renderLanding();
  const heading = document.getElementById("mainHeading");
  if (heading) heading.focus();
}

bcHome.addEventListener("click", goToLanding);
document.getElementById("navbarBrand").addEventListener("click", goToLanding);

/* ---------------------------------------------------------
   Pill strip
--------------------------------------------------------- */

function renderPillStrip() {
  pillStrip.innerHTML = "";
  DATA.forEach(dir => {
    const pill = document.createElement("button");
    pill.className = "pill";
    pill.style.setProperty("--pill-color", dir.color);
    if (state.activeTopic && state.activeTopic.startsWith(dir.slug + "/")) pill.classList.add("active");
    pill.textContent = dir.name.toUpperCase();
    pill.addEventListener("click", () => {
      state.openDirs.add(dir.slug);
      renderSidebar();
      selectTopic(dir, dir.topics[0]);
    });
    pillStrip.appendChild(pill);
  });
}

/* ---------------------------------------------------------
   Sidebar
--------------------------------------------------------- */

function renderSidebar() {
  sidebarTree.innerHTML = "";
  const filter = state.filter.trim().toLowerCase();

  DATA.forEach(dir => {
    const matchingTopics = dir.topics.filter(t =>
      !filter || t.title.toLowerCase().includes(filter) || t.slug.includes(filter)
    );
    if (filter && matchingTopics.length === 0) return;

    const dirNotesCount = dir.topics.filter(t => {
      const v = state.notes[topicKey(dir.slug, t.slug)];
      return v && v.trim();
    }).length;

    const group = document.createElement("div");
    group.className = "dir-group";
    const isOpen = state.openDirs.has(dir.slug) || (filter && matchingTopics.length > 0);
    if (isOpen) group.classList.add("open");

    const label = document.createElement("div");
    label.className = "dir-label";
    label.style.setProperty("--dir-color", dir.color);
    label.innerHTML = `
      <span class="dir-caret">&#9656;</span>
      <span class="dir-glyph">${dir.glyph}</span>
      <span class="dir-name">${dir.name}</span>
      ${dirNotesCount > 0 ? `<span class="dir-progress">${dirNotesCount}/${dir.topics.length}</span>` : ""}
    `;
    label.addEventListener("click", () => {
      if (state.openDirs.has(dir.slug)) state.openDirs.delete(dir.slug);
      else state.openDirs.add(dir.slug);
      renderSidebar();
    });

    const items = document.createElement("div");
    items.className = "dir-items";

    matchingTopics.forEach(topic => {
      const key = topicKey(dir.slug, topic.slug);
      const btn = document.createElement("button");
      btn.className = "topic-item";
      if (state.activeTopic === key) btn.classList.add("active");
      const hasNotes = !!(state.notes[key] && state.notes[key].trim());
      btn.innerHTML = `${hasNotes ? '<span class="has-notes-dot"></span>' : '<span class="no-notes-dot"></span>'}${topic.title}`;
      btn.addEventListener("click", () => selectTopic(dir, topic));
      items.appendChild(btn);
    });

    group.appendChild(label);
    group.appendChild(items);
    sidebarTree.appendChild(group);
  });
}

/* ---------------------------------------------------------
   Landing (hero + subfield grid)
--------------------------------------------------------- */

function renderLanding() {
  state.activeTopic = null;
  renderPillStrip();
  renderBreadcrumb(null);

  const total = totalTopicCount();
  const started = notesStartedCount();
  const resCount = resourcesCount();
  const pct = total ? Math.round((started / total) * 100) : 0;
  const meta = SECTIONS[state.section];
  const groupWordPlural = meta.groupWord + "s";

  const grid = DATA.map(dir => `
    <div class="landing-card" data-slug="${dir.slug}" style="--card-color:${dir.color}">
      <div class="lc-glyph">${dir.glyph}</div>
      <div class="lc-title">${dir.name.replace(/-/g, " ")}</div>
      <div class="lc-count">${dir.topics.length} topics</div>
    </div>
  `).join("");

  contentEl.innerHTML = `
    <section class="hero fade-in">
      <div>
        <div class="hero-eyebrow">${meta.eyebrow}</div>
        <h1 id="mainHeading" tabindex="-1">${meta.heading}</h1>
        <p>A reference index across ${DATA.length} ${groupWordPlural} and ${total} topics — ${meta.blurb}. No sign-up, runs entirely in your browser.</p>
        <ul class="hero-checklist">
          <li><span class="check">✓</span> Organized by ${meta.groupWord}</li>
          <li><span class="check">✓</span> Real code examples</li>
          <li><span class="check">✓</span> Your own notes & resources</li>
          <li><span class="check">✓</span> Fully client-side</li>
        </ul>
      </div>
      <div class="stat-card">
        <div class="stat-headline"><span class="bolt">⚡</span><span class="num">${total}</span></div>
        <h3>Topics in your index</h3>
        <div class="stat-sub">Across ${DATA.length} ${groupWordPlural} of computer science.</div>
        <div class="stat-row">
          <div class="stat-block">
            <div class="sb-label">NOTES STARTED</div>
            <div class="sb-value">${started}</div>
          </div>
          <div class="stat-block">
            <div class="sb-label">RESOURCES SAVED</div>
            <div class="sb-value">${resCount}</div>
          </div>
        </div>
        <div class="stat-progress-track"><div class="stat-progress-fill" style="width:${pct}%"></div></div>
      </div>
    </section>
    <section class="landing-section">
      <h2 class="section-title">Browse by ${meta.groupWord}</h2>
      <div class="landing-grid">${grid}</div>
    </section>
  `;

  contentEl.querySelectorAll(".landing-card").forEach(card => {
    card.addEventListener("click", () => {
      const slug = card.dataset.slug;
      state.openDirs.add(slug);
      renderSidebar();
      const dir = DATA.find(d => d.slug === slug);
      if (dir && dir.topics[0]) selectTopic(dir, dir.topics[0]);
    });
  });
}

/* ---------------------------------------------------------
   Topic page
--------------------------------------------------------- */

function selectTopic(dir, topic) {
  state.activeTopic = topicKey(dir.slug, topic.slug);
  state.openDirs.add(dir.slug);
  renderSidebar();
  renderPillStrip();
  renderBreadcrumb(dir, topic);
  renderTopic(dir, topic);
  const heading = document.getElementById("mainHeading");
  if (heading) heading.focus();
}

function renderKeyPoints(points) {
  if (!points || points.length === 0) return "";
  return `
    <h2 class="section-label">key points</h2>
    <ul class="keypoints-list">
      ${points.map(p => `<li><span class="kp-bullet">▸</span>${p}</li>`).join("")}
    </ul>
  `;
}

function renderPitfalls(pitfalls) {
  if (!pitfalls || pitfalls.length === 0) return "";
  return `
    <h2 class="section-label">common pitfalls</h2>
    <ul class="pitfalls-list">
      ${pitfalls.map(p => `<li><span class="pf-bullet">⚠</span>${p}</li>`).join("")}
    </ul>
  `;
}

function renderPractice(practice) {
  if (!practice) return "";
  return `
    <div class="practice-box">
      <div class="pb-label">in practice</div>
      <p>${practice}</p>
    </div>
  `;
}

function renderTable(table) {
  if (!table) return "";
  return `
    <h2 class="section-label">reference</h2>
    <div class="ref-table-wrap">
      <table class="ref-table">
        <thead><tr>${table.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* ---------------------------------------------------------
   Lightweight syntax highlighter (no external dependencies)
--------------------------------------------------------- */

const LANG_KEYWORDS = {
  javascript: ["const","let","var","function","return","if","else","for","while","class","extends","new","this","import","export","from","default","async","await","try","catch","throw","typeof","instanceof","true","false","null","undefined","break","continue","switch","case"],
  python: ["def","return","if","elif","else","for","while","class","import","from","as","try","except","finally","with","lambda","True","False","None","and","or","not","in","is","yield","global","break","continue","print"],
  sql: ["SELECT","FROM","WHERE","JOIN","ON","GROUP","BY","ORDER","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","INDEX","TABLE","BEGIN","COMMIT","ROLLBACK","AND","OR","NOT","NULL","AS","EXPLAIN","ANALYZE","DESC","ASC"],
  c: ["int","char","float","double","void","if","else","for","while","return","struct","typedef","include","define","sizeof","NULL","const","static"],
  bash: ["if","then","else","fi","for","do","done","while","echo","export","function","return"],
  yaml: [],
  terraform: ["resource","variable","output","module","provider"],
  docker: ["FROM","WORKDIR","COPY","RUN","CMD","ENV","EXPOSE","ENTRYPOINT","ADD","ARG","USER"],
  html: [],
  css: [],
};

const LANG_COMMENT = {
  javascript: "//", python: "#", sql: "--", c: "//", bash: "#",
  yaml: "#", terraform: "#", docker: "#",
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightGeneric(escaped, lang) {
  const keywords = LANG_KEYWORDS[lang] || [];
  const comment = LANG_COMMENT[lang];
  const parts = [];
  if (comment) {
    const esc = comment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    parts.push(`(?<comment>${esc}.*)`);
  }
  parts.push(`(?<string>"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`)`);
  parts.push(`(?<number>\\b\\d+(?:\\.\\d+)?\\b)`);
  if (keywords.length) {
    const kwAlt = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    parts.push(`(?<keyword>\\b(?:${kwAlt})\\b)`);
  }
  const regex = new RegExp(parts.join("|"), lang === "sql" ? "gi" : "g");
  return escaped.replace(regex, (match, ...args) => {
    const groups = args[args.length - 1];
    if (groups && groups.comment) return `<span class="tok-comment">${groups.comment}</span>`;
    if (groups && groups.string) return `<span class="tok-string">${groups.string}</span>`;
    if (groups && groups.number) return `<span class="tok-number">${groups.number}</span>`;
    if (groups && groups.keyword) return `<span class="tok-keyword">${groups.keyword}</span>`;
    return match;
  });
}

function highlightHTML(escaped) {
  let out = escaped.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)/g, '$1<span class="tok-keyword">$2</span>');
  out = out.replace(/"(?:\\.|[^"\\])*"/g, m => `<span class="tok-string">${m}</span>`);
  return out;
}

function highlightCSS(escaped) {
  let out = escaped.replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-comment">${m}</span>`);
  out = out.replace(/([a-zA-Z-]+)(\s*:)/g, '<span class="tok-keyword">$1</span>$2');
  out = out.replace(/"(?:\\.|[^"\\])*"/g, m => `<span class="tok-string">${m}</span>`);
  return out;
}

function highlightCode(code, lang) {
  const escaped = escapeHtml(code);
  if (lang === "html") return highlightHTML(escaped);
  if (lang === "css") return highlightCSS(escaped);
  return highlightGeneric(escaped, lang);
}

let codeBlockCounter = 0;

function renderCode(codeObj) {
  if (!codeObj) return "";
  codeBlockCounter++;
  const id = `codeblock-${codeBlockCounter}`;
  const highlighted = highlightCode(codeObj.code, codeObj.lang);
  return `
    <h2 class="section-label">code example</h2>
    <div class="code-block-wrap">
      <div class="code-block-header">
        <span class="code-block-lang">${codeObj.label}</span>
        <button class="code-copy-btn" data-target="${id}">Copy</button>
      </div>
      <pre class="code-block"><code id="${id}" data-raw="${encodeURIComponent(codeObj.code)}">${highlighted}</code></pre>
    </div>
  `;
}

function wireCopyButtons(root) {
  root.querySelectorAll(".code-copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.dataset.target;
      const codeEl = document.getElementById(targetId);
      const raw = decodeURIComponent(codeEl.dataset.raw);
      try {
        await navigator.clipboard.writeText(raw);
        const original = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1500);
      } catch (e) {
        btn.textContent = "Select & copy";
      }
    });
  });
}

/* ---------------------------------------------------------
   Related topics — computed automatically from title/description
   overlap across all sections, no manual curation needed.
--------------------------------------------------------- */

const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","your","with","this","that","from","have",
  "has","was","were","will","can","its","which","when","where","what","why","how","who",
  "all","any","some","more","most","than","then","them","they","their","these","those",
  "such","into","over","under","between","about","after","before","only","also","much",
  "many","each","every","both","other","another","same","own","just","like","use","used",
  "using","get","gets","make","made","one","two","need","needs","often","usually","typically",
  "common","commonly","real","world","actually","really","still","even","without","within",
  "across","around","while","because","being","been","does","doing","done","gives","given",
  "helps","help","means","meant","lets","let","shows","show","includes","include","including",
  // CS-generic terms too common across almost every topic to be meaningful signal
  "data","computer","computers","computing","system","systems","using","information",
  "technology","technologies","process","processes","processed","application","applications",
  "user","users","provide","provides","provided","different","various","example","examples",
  "specific","particular","understanding","approach","approaches","allows","allow","allowing",
  "result","results","perform","performs","performance","create","creates","creating","build",
  "builds","building","design","designs","designed","designing","work","works","working",
  "important","significant","essential","fundamental","complex","simple","program","programs",
  "programming","software","code","coding","time","value","values","type","types","field",
  "level","levels","large","small","number","numbers","step","steps","way","ways","point",
  "points","part","parts","action","actions","function","functions","structure","structures",
  "basics","basic","fundamentals","fundamental","overview","introduction","introductions",
  "guide","guides","principles","principle","concept","concepts","essentials","essential",
]);

function normalizeTopicTitle(title) {
  return title.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function extractSignificantWords(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));
}

let REL_INDEX = null;

function buildRelatedIndex() {
  const index = [];
  Object.values(SECTIONS).forEach(section => {
    section.data.forEach(dir => {
      dir.topics.forEach(topic => {
        index.push({
          sectionKey: section.key, sectionLabel: section.label,
          dirSlug: dir.slug, dirName: dir.name, dirColor: dir.color, dirGlyph: dir.glyph,
          topicSlug: topic.slug, topicTitle: topic.title,
          normTitle: normalizeTopicTitle(topic.title),
          titleWords: new Set(extractSignificantWords(topic.title)),
          descWords: new Set(extractSignificantWords(topic.desc)),
        });
      });
    });
  });
  return index;
}

function getRelatedIndex() {
  if (!REL_INDEX) REL_INDEX = buildRelatedIndex();
  return REL_INDEX;
}

function wordOverlapCount(setA, setB) {
  let count = 0;
  setA.forEach(w => { if (setB.has(w)) count++; });
  return count;
}

function getRelatedTopics(sectionKey, dirSlug, topicSlug, limit) {
  const index = getRelatedIndex();
  const current = index.find(i => i.sectionKey === sectionKey && i.dirSlug === dirSlug && i.topicSlug === topicSlug);
  if (!current) return [];

  const scored = [];
  index.forEach(item => {
    if (item.sectionKey === sectionKey && item.dirSlug === dirSlug && item.topicSlug === topicSlug) return;
    let score = 0;
    if (current.normTitle && item.normTitle === current.normTitle) score += 50;
    score += wordOverlapCount(current.titleWords, item.titleWords) * 4;
    score += wordOverlapCount(current.descWords, item.descWords);
    if (item.sectionKey === sectionKey && item.dirSlug === dirSlug) score += 2;
    if (score > 0) scored.push({ item, score });
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score >= 4).slice(0, limit).map(s => s.item);
}

function renderRelatedTopics(dir, topic) {
  const related = getRelatedTopics(state.section, dir.slug, topic.slug, 4);
  if (!related.length) return "";
  return `
    <h2 class="section-label">related topics</h2>
    <div class="related-grid">
      ${related.map(r => `
        <button class="related-card" data-section="${r.sectionKey}" data-dir="${r.dirSlug}" data-topic="${r.topicSlug}" style="--rc-color:${r.dirColor}">
          <span class="rc-glyph">${r.dirGlyph}</span>
          <span class="rc-body">
            <span class="rc-title">${r.topicTitle}</span>
            <span class="rc-meta">${r.sectionLabel} · ${r.dirName}</span>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderUnitNav(dir, topic) {
  const idx = dir.topics.findIndex(t => t.slug === topic.slug);
  const prev = idx > 0 ? dir.topics[idx - 1] : null;
  const next = idx < dir.topics.length - 1 ? dir.topics[idx + 1] : null;
  if (!prev && !next) return "";
  return `
    <div class="unit-nav">
      ${prev
        ? `<button class="unit-nav-btn prev" data-nav-topic="${prev.slug}"><span class="unb-dir">&larr; Previous</span><span class="unb-title">${prev.title}</span></button>`
        : `<div class="unit-nav-spacer"></div>`}
      ${next
        ? `<button class="unit-nav-btn next" data-nav-topic="${next.slug}"><span class="unb-dir">Next &rarr;</span><span class="unb-title">${next.title}</span></button>`
        : `<div class="unit-nav-spacer"></div>`}
    </div>
  `;
}

function goToRelatedTopic(sectionKey, dirSlug, topicSlug) {
  if (state.section !== sectionKey) switchSection(sectionKey);
  const dir = DATA.find(d => d.slug === dirSlug);
  const topic = dir && dir.topics.find(t => t.slug === topicSlug);
  if (dir && topic) selectTopic(dir, topic);
}

/* ---------------------------------------------------------
   Attachments — images (compressed client-side, stored as
   data URLs) and video embeds (paste a YouTube/Vimeo link).
   No file uploads to any server — everything stays local.
--------------------------------------------------------- */

function compressImageFile(file, maxDimension = 1100, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Couldn't read that image file."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

function parseYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function parseVimeoId(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

async function handleImageFileSelected(file, key, dir, topic) {
  let dataUrl;
  try {
    dataUrl = await compressImageFile(file);
  } catch (err) {
    alert(err.message || "Couldn't process that image.");
    return;
  }
  if (!state.resources[key]) state.resources[key] = [];
  const item = { type: "image", id: generateId(), dataUrl, name: file.name.replace(/\.[^./]+$/, ""), addedAt: Date.now() };
  state.resources[key].push(item);

  const saved = flushPendingSave();
  if (!saved) {
    state.resources[key].pop();
    alert("Couldn't save that image — this browser's storage is full. Try removing an existing image first, or use a smaller photo.");
    return;
  }
  renderTopic(dir, topic);
  renderNavbarStat();
}

function addVideoAttachment(key, dir, topic) {
  const input = document.getElementById("videoUrlInput");
  const val = input.value.trim();
  if (!val) return;

  const ytId = parseYouTubeId(val);
  const vimeoId = !ytId ? parseVimeoId(val) : null;
  let item;
  if (ytId) {
    item = { type: "video", id: generateId(), url: val, embedUrl: `https://www.youtube.com/embed/${ytId}`, label: "YouTube video" };
  } else if (vimeoId) {
    item = { type: "video", id: generateId(), url: val, embedUrl: `https://player.vimeo.com/video/${vimeoId}`, label: "Vimeo video" };
  } else {
    item = { type: "video", id: generateId(), url: val, embedUrl: null, label: val };
  }

  if (!state.resources[key]) state.resources[key] = [];
  state.resources[key].push(item);
  input.value = "";
  renderTopic(dir, topic);
  renderNavbarStat();
  saveToStorage();
}

function renderResourceItem(r, i) {
  const type = r.type || "link"; // undefined type = old data saved before attachments existed

  if (type === "image") {
    return `
      <li class="resource-item resource-item-image">
        <button class="resource-thumb-btn" data-image-index="${i}" aria-label="View full image: ${escapeHtml(r.name || "image")}">
          <img src="${r.dataUrl}" alt="" class="resource-thumb">
        </button>
        <span class="resource-item-name">${escapeHtml(r.name || "Image")}</span>
        <button class="res-remove" data-index="${i}" aria-label="Remove image">&times;</button>
      </li>
    `;
  }

  if (type === "video") {
    if (r.embedUrl) {
      // Videos saved earlier used youtube-nocookie.com, which fails with
      // "Error 153" when the site is opened as a local file. Repair on render.
      const embedSrc = r.embedUrl.replace("youtube-nocookie.com/embed/", "youtube.com/embed/");
      return `
        <li class="resource-item resource-item-video">
          <div class="resource-video-frame">
            <iframe src="${embedSrc}" title="${escapeHtml(r.label || "Embedded video")}" loading="lazy" allowfullscreen></iframe>
          </div>
          <div class="resource-video-footer">
            <span class="resource-item-name">${escapeHtml(r.label || "Video")}</span>
            <button class="res-remove" data-index="${i}" aria-label="Remove video">&times;</button>
          </div>
        </li>
      `;
    }
    return `
      <li class="resource-item">
        <span>&#9654; <a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.label || r.url)}</a></span>
        <button class="res-remove" data-index="${i}" aria-label="Remove video link">&times;</button>
      </li>
    `;
  }

  return `
    <li class="resource-item">
      <span>${r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a>` : escapeHtml(r.label)}</span>
      <button class="res-remove" data-index="${i}" aria-label="Remove resource">&times;</button>
    </li>
  `;
}

/* ---------------------------------------------------------
   Image lightbox — full-size preview + remove, as an
   accessible dialog matching the Study/Profile pattern.
--------------------------------------------------------- */

const imageOverlay = document.getElementById("imageOverlay");
const imagePanel = document.getElementById("imagePanel");
let lastFocusedBeforeImage = null;
let currentLightboxContext = null;

function trapImageFocus(e) {
  if (e.key !== "Tab") return;
  const focusable = getFocusableElements(imagePanel);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openImageLightbox(key, dir, topic, index) {
  const item = state.resources[key][index];
  if (!item) return;
  currentLightboxContext = { key, dir, topic, index };
  lastFocusedBeforeImage = document.activeElement;

  imagePanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="imageLightboxTitle" tabindex="-1">${escapeHtml(item.name || "Image")}</h2>
      <button class="study-close-btn" id="imageCloseBtn" aria-label="Close">&times;</button>
    </div>
    <img src="${item.dataUrl}" alt="${escapeHtml(item.name || "Attached image")}" class="lightbox-image">
    <button class="study-secondary-btn lightbox-remove-btn" id="imageRemoveBtn">Remove this image</button>
  `;

  imageOverlay.classList.add("visible");
  imageOverlay.setAttribute("aria-hidden", "false");
  document.addEventListener("keydown", trapImageFocus);
  const heading = document.getElementById("imageLightboxTitle");
  if (heading) heading.focus();
}

function closeImageLightbox() {
  imageOverlay.classList.remove("visible");
  imageOverlay.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", trapImageFocus);
  if (lastFocusedBeforeImage && typeof lastFocusedBeforeImage.focus === "function") {
    lastFocusedBeforeImage.focus();
  }
  lastFocusedBeforeImage = null;
  currentLightboxContext = null;
}

imageOverlay.addEventListener("click", e => {
  if (e.target === imageOverlay) closeImageLightbox();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && imageOverlay.classList.contains("visible")) closeImageLightbox();
});

imagePanel.addEventListener("click", e => {
  if (e.target.closest("#imageCloseBtn")) { closeImageLightbox(); return; }
  if (e.target.closest("#imageRemoveBtn")) {
    const { key, dir, topic, index } = currentLightboxContext;
    state.resources[key].splice(index, 1);
    closeImageLightbox();
    renderTopic(dir, topic);
    renderNavbarStat();
    saveToStorage();
  }
});

function renderTopic(dir, topic) {
  const key = topicKey(dir.slug, topic.slug);
  const notesValue = state.notes[key] || "";
  const resources = state.resources[key] || [];

  contentEl.innerHTML = `
    <div class="content-inner fade-in">
      <div class="topic-eyebrow" style="color:${dir.color}">${dir.glyph} ${dir.name}</div>
      <div class="topic-header">
        <h1 id="mainHeading" tabindex="-1">${topic.title}</h1>
        <span class="topic-tag ${topic.tag}">${topic.tag}</span>
      </div>
      <p class="topic-desc">${topic.desc}</p>

      ${renderKeyPoints(topic.keyPoints)}
      ${renderCode(topic.code)}
      ${renderTable(topic.table)}
      ${renderPitfalls(topic.pitfalls)}
      ${renderPractice(topic.practice)}
      ${renderRelatedTopics(dir, topic)}

      <h2 class="section-label">your notes</h2>
      <textarea class="notes-area" id="notesArea" placeholder="Write what you know, what's confusing, worked examples, whatever's useful to future-you...">${notesValue}</textarea>
      <div class="notes-hint">saved for this session only — see note at the bottom of the page</div>

      <h2 class="section-label">your resources</h2>
      <ul class="resources-list" id="resourcesList">
        ${resources.length === 0 ? '<li class="empty-state" style="border:none;">no resources added yet</li>' :
          resources.map((r, i) => renderResourceItem(r, i)).join("")
        }
      </ul>

      <div class="attach-tabs" role="tablist" aria-label="Add a resource">
        <button class="attach-tab active" data-attach-type="link" role="tab" aria-selected="true">Link</button>
        <button class="attach-tab" data-attach-type="image" role="tab" aria-selected="false">Image</button>
        <button class="attach-tab" data-attach-type="video" role="tab" aria-selected="false">Video</button>
      </div>

      <div class="attach-row" id="attachRowLink">
        <input type="text" id="resourceLabel" placeholder="Resource name or link...">
        <button id="addResourceBtn">Add</button>
      </div>

      <div class="attach-row" id="attachRowImage" style="display:none;">
        <input type="file" id="imageFileInput" accept="image/*" class="visually-hidden">
        <button id="chooseImageBtn" class="attach-choose-btn">Choose Image…</button>
        <span class="attach-hint">auto-resized to save space</span>
      </div>

      <div class="attach-row" id="attachRowVideo" style="display:none;">
        <input type="text" id="videoUrlInput" placeholder="Paste a YouTube or Vimeo link...">
        <button id="addVideoBtn">Embed</button>
      </div>

      <div class="storage-note">
        <span id="saveIndicator" class="save-indicator">✓ saved to this browser</span>
        notes and resources are saved automatically to your profile in this browser — they'll be here next time you open this page, but won't sync to another device or browser. <button id="clearDataBtn" class="clear-data-btn">Clear all saved data</button>
      </div>

      ${renderUnitNav(dir, topic)}
    </div>
  `;

  wireCopyButtons(contentEl);

  document.getElementById("notesArea").addEventListener("input", e => {
    state.notes[key] = e.target.value;
    renderSidebar();
    renderNavbarStat();
    saveToStorage();
  });

  document.getElementById("clearDataBtn").addEventListener("click", clearAllSavedData);

  document.getElementById("addResourceBtn").addEventListener("click", () => addResource(key, dir, topic));
  document.getElementById("resourceLabel").addEventListener("keydown", e => {
    if (e.key === "Enter") addResource(key, dir, topic);
  });

  const attachTabs = contentEl.querySelectorAll(".attach-tab");
  attachTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      attachTabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const type = tab.dataset.attachType;
      contentEl.querySelectorAll(".attach-row").forEach(row => { row.style.display = "none"; });
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      document.getElementById(`attachRow${label}`).style.display = "flex";
    });
  });

  document.getElementById("chooseImageBtn").addEventListener("click", () => {
    document.getElementById("imageFileInput").click();
  });
  document.getElementById("imageFileInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) handleImageFileSelected(file, key, dir, topic);
    e.target.value = "";
  });

  document.getElementById("addVideoBtn").addEventListener("click", () => addVideoAttachment(key, dir, topic));
  document.getElementById("videoUrlInput").addEventListener("keydown", e => {
    if (e.key === "Enter") addVideoAttachment(key, dir, topic);
  });

  contentEl.querySelectorAll(".res-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      state.resources[key].splice(idx, 1);
      renderTopic(dir, topic);
      renderNavbarStat();
      saveToStorage();
    });
  });

  contentEl.querySelectorAll(".resource-thumb-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      openImageLightbox(key, dir, topic, parseInt(btn.dataset.imageIndex, 10));
    });
  });

  contentEl.querySelectorAll(".related-card").forEach(btn => {
    btn.addEventListener("click", () => {
      goToRelatedTopic(btn.dataset.section, btn.dataset.dir, btn.dataset.topic);
    });
  });

  contentEl.querySelectorAll(".unit-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTopic = dir.topics.find(t => t.slug === btn.dataset.navTopic);
      if (targetTopic) selectTopic(dir, targetTopic);
    });
  });
}

function addResource(key, dir, topic) {
  const input = document.getElementById("resourceLabel");
  const val = input.value.trim();
  if (!val) return;
  if (!state.resources[key]) state.resources[key] = [];
  const isUrl = /^https?:\/\//i.test(val);
  state.resources[key].push({ label: val, url: isUrl ? val : null });
  renderTopic(dir, topic);
  renderNavbarStat();
  saveToStorage();
}

/* ---------------------------------------------------------
   Profile switcher — a lightweight, no-password way for
   multiple people to share one device with separate histories.
--------------------------------------------------------- */

const profileChipBtn = document.getElementById("profileChipBtn");
const profileOverlay = document.getElementById("profileOverlay");
const profilePanel = document.getElementById("profilePanel");
let lastFocusedBeforeProfile = null;

function renderProfileChip() {
  const p = getActiveProfile();
  if (!profileChipBtn || !p) return;
  profileChipBtn.innerHTML = `
    <span class="profile-chip-avatar" style="background:${p.color}">${p.name.charAt(0).toUpperCase()}</span>
    <span class="profile-chip-name">${p.name}</span>
  `;
  profileChipBtn.title = `Switch profile (currently ${p.name})`;
  profileChipBtn.setAttribute("aria-label", profileChipBtn.title);
}

function trapProfileFocus(e) {
  if (e.key !== "Tab") return;
  const focusable = getFocusableElements(profilePanel);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openProfileSwitcher() {
  lastFocusedBeforeProfile = document.activeElement;
  profileOverlay.classList.add("visible");
  profileOverlay.setAttribute("aria-hidden", "false");
  renderProfilePanel();
  document.addEventListener("keydown", trapProfileFocus);
}

function closeProfileSwitcher() {
  profileOverlay.classList.remove("visible");
  profileOverlay.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", trapProfileFocus);
  if (lastFocusedBeforeProfile && typeof lastFocusedBeforeProfile.focus === "function") {
    lastFocusedBeforeProfile.focus();
  }
  lastFocusedBeforeProfile = null;
}

function renderProfilePanel() {
  profilePanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="profileTitle" tabindex="-1">Switch Profile</h2>
      <button class="study-close-btn" id="profileCloseBtn" aria-label="Close">&times;</button>
    </div>
    <p class="profile-intro">Sharing this device? Each profile keeps its own notes, resources, and quiz progress — stored only in this browser.</p>
    <div class="profile-list">
      ${profiles.map(p => `
        <div class="profile-card${p.id === activeProfileId ? " active" : ""}">
          <button class="profile-select-btn" data-select-profile="${p.id}" style="--pc-color:${p.color}">
            <span class="profile-avatar">${p.name.charAt(0).toUpperCase()}</span>
            <span class="profile-name">${p.name}</span>
            ${p.id === activeProfileId ? '<span class="profile-active-badge">Active</span>' : ""}
          </button>
          <div class="profile-card-actions">
            <button class="profile-icon-btn" data-rename-profile="${p.id}" aria-label="Rename ${p.name}" title="Rename">&#9998;</button>
            <button class="profile-icon-btn" data-delete-profile="${p.id}" aria-label="Delete ${p.name}" title="Delete"${profiles.length <= 1 ? " disabled" : ""}>&times;</button>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="profile-add-row">
      <input type="text" id="newProfileName" placeholder="New profile name..." maxlength="24" autocomplete="off">
      <button id="addProfileBtn">Add Profile</button>
    </div>
  `;
  const heading = document.getElementById("profileTitle");
  if (heading) heading.focus();
}

function switchProfile(id) {
  if (id === activeProfileId) { closeProfileSwitcher(); return; }
  flushPendingSave();
  activeProfileId = id;
  saveProfilesList();
  loadActiveProfileData();
  applyLayoutPrefs();
  renderProfileChip();
  state.activeTopic = null;
  renderSidebar();
  renderNavbarStat();
  closeProfileSwitcher();
  goToLanding();
}

function createProfile(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const newProfile = { id: generateProfileId(), name: trimmed, color: pickProfileColor(), createdAt: Date.now() };
  profiles.push(newProfile);
  saveProfilesList();
  switchProfile(newProfile.id);
}

function renameProfile(id) {
  const p = profiles.find(pr => pr.id === id);
  if (!p) return;
  const newName = prompt("Rename profile", p.name);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) return;
  p.name = trimmed.slice(0, 24);
  saveProfilesList();
  if (id === activeProfileId) renderProfileChip();
  renderProfilePanel();
}

function deleteProfile(id) {
  if (profiles.length <= 1) return;
  const p = profiles.find(pr => pr.id === id);
  if (!p) return;
  const confirmed = confirm(`Delete "${p.name}"'s profile and all of their saved notes and progress? This can't be undone.`);
  if (!confirmed) return;

  try { localStorage.removeItem(profileDataKey(id)); } catch (e) { /* ignore */ }
  profiles = profiles.filter(pr => pr.id !== id);

  if (id === activeProfileId) {
    activeProfileId = profiles[0].id;
    saveProfilesList();
    loadActiveProfileData();
    applyLayoutPrefs();
    renderProfileChip();
    state.activeTopic = null;
    renderSidebar();
    renderNavbarStat();
    renderProfilePanel();
    goToLanding();
  } else {
    saveProfilesList();
    renderProfilePanel();
  }
}

profileChipBtn.addEventListener("click", openProfileSwitcher);

profileOverlay.addEventListener("click", e => {
  if (e.target === profileOverlay) closeProfileSwitcher();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && profileOverlay.classList.contains("visible")) closeProfileSwitcher();
});

profilePanel.addEventListener("click", e => {
  if (e.target.closest("#profileCloseBtn")) { closeProfileSwitcher(); return; }

  const selectBtn = e.target.closest("[data-select-profile]");
  if (selectBtn) { switchProfile(selectBtn.dataset.selectProfile); return; }

  const renameBtn = e.target.closest("[data-rename-profile]");
  if (renameBtn) { renameProfile(renameBtn.dataset.renameProfile); return; }

  const deleteBtn = e.target.closest("[data-delete-profile]");
  if (deleteBtn && !deleteBtn.disabled) { deleteProfile(deleteBtn.dataset.deleteProfile); return; }

  if (e.target.closest("#addProfileBtn")) {
    const input = document.getElementById("newProfileName");
    createProfile(input.value);
    return;
  }
});

profilePanel.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id === "newProfileName") {
    createProfile(e.target.value);
  }
});

/* ---------------------------------------------------------
   Study Mode — quiz and flashcards generated from the real
   key points and pitfalls already in the data.
--------------------------------------------------------- */

const studyOverlay = document.getElementById("studyOverlay");
const studyPanel = document.getElementById("studyPanel");
const studyModeBtn = document.getElementById("studyModeBtn");

let studyState = {
  screen: "picker",     // picker | quiz | summary | flashcards
  section: "reference",
  unit: "all",
  mode: "quiz",
  questions: [],
  currentIndex: 0,
  answered: false,
  selectedOption: null,
  correctCount: 0,
  cards: [],
  cardIndex: 0,
  flipped: false,
};

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function collectScopeTopics(sectionKey, unitSlug) {
  const data = SECTIONS[sectionKey].data;
  const result = [];
  data.forEach(dir => {
    if (unitSlug !== "all" && dir.slug !== unitSlug) return;
    dir.topics.forEach(topic => result.push({ dir, topic }));
  });
  return result;
}

function generateQuizQuestions(sectionKey, scopeTopics, count) {
  const pool = collectScopeTopics(sectionKey, "all");
  const used = new Set();
  const questions = [];
  let attempts = 0;

  while (questions.length < count && attempts < count * 10) {
    attempts++;
    const { dir, topic } = scopeTopics[Math.floor(Math.random() * scopeTopics.length)];
    const type = Math.random() < 0.5 ? "keyPoints" : "pitfalls";
    const arr = topic[type];
    if (!arr || !arr.length) continue;

    const usedKey = `${dir.slug}/${topic.slug}/${type}`;
    if (used.has(usedKey)) continue;

    const correctText = arr[Math.floor(Math.random() * arr.length)];

    const candidates = [];
    pool.forEach(p => {
      if (p.dir.slug === dir.slug && p.topic.slug === topic.slug) return;
      const otherArr = p.topic[type];
      if (otherArr && otherArr.length) candidates.push(otherArr[Math.floor(Math.random() * otherArr.length)]);
    });
    const uniqueCandidates = [...new Set(candidates)].filter(c => c !== correctText);
    if (uniqueCandidates.length < 3) continue;

    const distractors = shuffleArray(uniqueCandidates).slice(0, 3);
    const options = shuffleArray([correctText, ...distractors]);
    const correctIndex = options.indexOf(correctText);

    questions.push({
      dir, topic, type, options, correctIndex,
      prompt: type === "keyPoints"
        ? `Which of these is true about "${topic.title}"?`
        : `Which of these is a common pitfall with "${topic.title}"?`,
      explanation: topic.practice || `From the "${topic.title}" notes in ${dir.name}.`,
    });
    used.add(usedKey);
  }
  return questions;
}

function buildFlashcards(scopeTopics) {
  return shuffleArray(scopeTopics);
}

let lastFocusedBeforeStudy = null;

function getFocusableElements(container) {
  const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return [...container.querySelectorAll(selector)].filter(el => el.offsetParent !== null);
}

function trapStudyFocus(e) {
  if (e.key !== "Tab") return;
  const focusable = getFocusableElements(studyPanel);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openStudyMode() {
  lastFocusedBeforeStudy = document.activeElement;
  studyState = {
    screen: "picker",
    section: state.section,
    unit: "all",
    mode: "quiz",
    questions: [], currentIndex: 0, answered: false, selectedOption: null, correctCount: 0,
    cards: [], cardIndex: 0, flipped: false,
  };
  studyOverlay.classList.add("visible");
  studyOverlay.setAttribute("aria-hidden", "false");
  renderStudyPanel();
  document.addEventListener("keydown", trapStudyFocus);
}

function closeStudyMode() {
  studyOverlay.classList.remove("visible");
  studyOverlay.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", trapStudyFocus);
  if (lastFocusedBeforeStudy && typeof lastFocusedBeforeStudy.focus === "function") {
    lastFocusedBeforeStudy.focus();
  }
  lastFocusedBeforeStudy = null;
}

function renderStudyPanel() {
  if (studyState.screen === "picker") renderStudyPicker();
  else if (studyState.screen === "quiz") renderQuizQuestion();
  else if (studyState.screen === "summary") renderQuizSummary();
  else if (studyState.screen === "flashcards") renderFlashcard();
  const heading = document.getElementById("studyTitle");
  if (heading) heading.focus();
}

function renderStudyPicker() {
  const units = SECTIONS[studyState.section].data;
  const totalInSection = units.reduce((sum, d) => sum + d.topics.length, 0);

  studyPanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="studyTitle" tabindex="-1">Study Mode</h2>
      <button class="study-close-btn" id="studyCloseBtn" aria-label="Close">&times;</button>
    </div>

    <div class="study-field-label">Section</div>
    <div class="study-option-grid">
      ${Object.values(SECTIONS).map(s => `
        <button class="study-picker-card${studyState.section === s.key ? " active" : ""}" data-section="${s.key}">${s.label}</button>
      `).join("")}
    </div>

    <div class="study-field-label">Unit</div>
    <select class="study-select" id="studyUnitSelect">
      <option value="all"${studyState.unit === "all" ? " selected" : ""}>All units (${totalInSection} topics)</option>
      ${units.map(d => `<option value="${d.slug}"${studyState.unit === d.slug ? " selected" : ""}>${d.name} (${d.topics.length})</option>`).join("")}
    </select>

    <div class="study-field-label">Mode</div>
    <div class="study-option-grid two-col">
      <button class="study-picker-card${studyState.mode === "quiz" ? " active" : ""}" data-mode="quiz">
        <div class="spc-title">Quiz</div>
        <div class="spc-desc">Multiple choice, scored</div>
      </button>
      <button class="study-picker-card${studyState.mode === "flashcards" ? " active" : ""}" data-mode="flashcards">
        <div class="spc-title">Flashcards</div>
        <div class="spc-desc">Flip through key points</div>
      </button>
    </div>

    <button class="study-start-btn" id="studyStartBtn">Start ${studyState.mode === "quiz" ? "Quiz" : "Flashcards"}</button>
  `;
}

function startStudySession() {
  const scopeTopics = collectScopeTopics(studyState.section, studyState.unit);
  if (!scopeTopics.length) return;

  if (studyState.mode === "quiz") {
    const count = Math.min(10, scopeTopics.length * 2);
    studyState.questions = generateQuizQuestions(studyState.section, scopeTopics, count);
    studyState.currentIndex = 0;
    studyState.answered = false;
    studyState.selectedOption = null;
    studyState.correctCount = 0;
    studyState.screen = studyState.questions.length ? "quiz" : "picker";
  } else {
    studyState.cards = buildFlashcards(scopeTopics);
    studyState.cardIndex = 0;
    studyState.flipped = false;
    studyState.screen = "flashcards";
  }
  renderStudyPanel();
}

function renderQuizQuestion() {
  const q = studyState.questions[studyState.currentIndex];
  if (!q) { studyState.screen = "summary"; renderStudyPanel(); return; }

  studyPanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="studyTitle" tabindex="-1">Quiz · ${SECTIONS[studyState.section].label}</h2>
      <button class="study-close-btn" id="studyCloseBtn" aria-label="Close">&times;</button>
    </div>
    <div class="study-progress">
      <div class="study-progress-track"><div class="study-progress-fill" style="width:${(studyState.currentIndex / studyState.questions.length) * 100}%"></div></div>
      <div class="study-progress-label">Question ${studyState.currentIndex + 1} of ${studyState.questions.length}</div>
    </div>
    <div class="study-eyebrow" style="color:${q.dir.color}">${q.dir.glyph} ${q.dir.name}</div>
    <div class="study-question">${q.prompt}</div>
    <div class="study-options" id="studyOptionsList">
      ${q.options.map((opt, i) => `<button class="study-option-btn" data-index="${i}">${opt}</button>`).join("")}
    </div>
    <div class="study-explanation" id="studyExplanation" style="display:none;"></div>
    <button class="study-next-btn" id="studyNextBtn" style="display:none;">${studyState.currentIndex + 1 < studyState.questions.length ? "Next question" : "See results"}</button>
  `;
}

function selectQuizAnswer(idx) {
  const q = studyState.questions[studyState.currentIndex];
  if (!q || studyState.answered) return;
  studyState.answered = true;
  studyState.selectedOption = idx;
  const correct = idx === q.correctIndex;
  if (correct) studyState.correctCount++;

  const buttons = studyPanel.querySelectorAll("#studyOptionsList .study-option-btn");
  buttons.forEach((btn, i) => {
    btn.classList.add("disabled");
    if (i === q.correctIndex) btn.classList.add("correct");
    else if (i === idx) btn.classList.add("incorrect");
  });

  const explanationEl = document.getElementById("studyExplanation");
  explanationEl.style.display = "block";
  explanationEl.innerHTML = `<strong>${correct ? "Correct." : "Not quite."}</strong> ${q.explanation}`;
  document.getElementById("studyNextBtn").style.display = "inline-flex";
}

function nextQuizQuestion() {
  studyState.currentIndex++;
  studyState.answered = false;
  studyState.selectedOption = null;
  if (studyState.currentIndex >= studyState.questions.length) studyState.screen = "summary";
  renderStudyPanel();
}

function renderQuizSummary() {
  const total = studyState.questions.length;
  const correct = studyState.correctCount;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const message = pct >= 80 ? "Excellent — that's solid recall."
    : pct >= 50 ? "Good progress — a bit more review will help."
    : "Worth another pass through these topics.";

  studyPanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="studyTitle" tabindex="-1">Quiz Results</h2>
      <button class="study-close-btn" id="studyCloseBtn" aria-label="Close">&times;</button>
    </div>
    <div class="study-score">${correct} / ${total}</div>
    <div class="study-score-pct">${pct}%</div>
    <div class="study-score-msg">${message}</div>
    <div class="study-summary-actions">
      <button class="study-secondary-btn" id="studyChangeScopeBtn">Change scope</button>
      <button class="study-start-btn" id="studyRetryBtn">Retry</button>
    </div>
  `;
}

function renderFlashcard() {
  const card = studyState.cards[studyState.cardIndex];
  if (!card) { closeStudyMode(); return; }
  const isLast = studyState.cardIndex + 1 >= studyState.cards.length;

  studyPanel.innerHTML = `
    <div class="study-header">
      <h2 class="study-title" id="studyTitle" tabindex="-1">Flashcards · ${SECTIONS[studyState.section].label}</h2>
      <button class="study-close-btn" id="studyCloseBtn" aria-label="Close">&times;</button>
    </div>
    <div class="study-progress-label">Card ${studyState.cardIndex + 1} of ${studyState.cards.length}</div>
    <div class="study-flashcard${studyState.flipped ? " flipped" : ""}" id="studyFlashcard">
      <div class="study-flashcard-inner">
        <div class="study-flashcard-front">
          <div class="study-eyebrow" style="color:${card.dir.color}">${card.dir.glyph} ${card.dir.name}</div>
          <div class="sf-title">${card.topic.title}</div>
          <div class="sf-hint">Click to flip</div>
        </div>
        <div class="study-flashcard-back">
          <ul class="sf-points">${(card.topic.keyPoints || []).map(p => `<li>${p}</li>`).join("")}</ul>
          ${card.topic.practice ? `<div class="sf-practice">${card.topic.practice}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="study-flash-nav">
      <button id="flashPrevBtn"${studyState.cardIndex === 0 ? " disabled" : ""}>&larr; Prev</button>
      <button id="flashShuffleBtn">Shuffle</button>
      <button id="flashNextBtn">${isLast ? "Done" : "Next \u2192"}</button>
    </div>
  `;
}

function flipFlashcard() {
  studyState.flipped = !studyState.flipped;
  const el = document.getElementById("studyFlashcard");
  if (el) el.classList.toggle("flipped", studyState.flipped);
}

function prevFlashcard() {
  if (studyState.cardIndex === 0) return;
  studyState.cardIndex--;
  studyState.flipped = false;
  renderStudyPanel();
}

function nextFlashcard() {
  if (studyState.cardIndex + 1 >= studyState.cards.length) { closeStudyMode(); return; }
  studyState.cardIndex++;
  studyState.flipped = false;
  renderStudyPanel();
}

function shuffleFlashcards() {
  studyState.cards = shuffleArray(studyState.cards);
  studyState.cardIndex = 0;
  studyState.flipped = false;
  renderStudyPanel();
}

studyModeBtn.addEventListener("click", openStudyMode);

studyOverlay.addEventListener("click", e => {
  if (e.target === studyOverlay) closeStudyMode();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && studyOverlay.classList.contains("visible")) closeStudyMode();
});

studyPanel.addEventListener("change", e => {
  if (e.target.id === "studyUnitSelect") studyState.unit = e.target.value;
});

studyPanel.addEventListener("click", e => {
  if (e.target.closest("#studyCloseBtn")) { closeStudyMode(); return; }

  const sectionCard = e.target.closest("[data-section]");
  if (sectionCard) { studyState.section = sectionCard.dataset.section; studyState.unit = "all"; renderStudyPicker(); return; }

  const modeCard = e.target.closest("[data-mode]");
  if (modeCard) { studyState.mode = modeCard.dataset.mode; renderStudyPicker(); return; }

  if (e.target.closest("#studyStartBtn")) { startStudySession(); return; }

  const optBtn = e.target.closest(".study-option-btn");
  if (optBtn && !studyState.answered) { selectQuizAnswer(parseInt(optBtn.dataset.index, 10)); return; }

  if (e.target.closest("#studyNextBtn")) { nextQuizQuestion(); return; }
  if (e.target.closest("#studyRetryBtn")) { startStudySession(); return; }
  if (e.target.closest("#studyChangeScopeBtn")) { studyState.screen = "picker"; renderStudyPanel(); return; }

  if (e.target.closest("#studyFlashcard")) { flipFlashcard(); return; }
  if (e.target.closest("#flashPrevBtn")) { prevFlashcard(); return; }
  if (e.target.closest("#flashNextBtn")) { nextFlashcard(); return; }
  if (e.target.closest("#flashShuffleBtn")) { shuffleFlashcards(); return; }
});

/* ---------------------------------------------------------
   Global search — searches across every section at once.
--------------------------------------------------------- */

const searchResultsEl = document.getElementById("searchResults");
let SEARCH_INDEX = null;
let currentSearchResults = [];
let searchHighlightIndex = -1;

function buildSearchIndex() {
  const index = [];
  Object.values(SECTIONS).forEach(section => {
    section.data.forEach(dir => {
      dir.topics.forEach(topic => {
        const blob = [
          topic.title,
          topic.desc,
          ...(topic.keyPoints || []),
        ].join(" ").toLowerCase();
        index.push({
          sectionKey: section.key,
          sectionLabel: section.label,
          dirSlug: dir.slug,
          dirName: dir.name,
          dirColor: dir.color,
          dirGlyph: dir.glyph,
          topicSlug: topic.slug,
          topicTitle: topic.title,
          topicTag: topic.tag,
          searchBlob: blob,
        });
      });
    });
  });
  return index;
}

function searchTopics(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (!SEARCH_INDEX) SEARCH_INDEX = buildSearchIndex();

  const results = [];
  for (const item of SEARCH_INDEX) {
    const titleLower = item.topicTitle.toLowerCase();
    let score = 0;
    if (titleLower === q) score = 100;
    else if (titleLower.startsWith(q)) score = 80;
    else if (titleLower.includes(q)) score = 60;
    else if (item.dirName.toLowerCase().includes(q)) score = 40;
    else if (item.searchBlob.includes(q)) score = 20;
    if (score > 0) results.push({ item, score });
  }
  results.sort((a, b) => b.score - a.score || a.item.topicTitle.localeCompare(b.item.topicTitle));
  return results.slice(0, 20).map(r => r.item);
}

function renderSearchResults(results) {
  currentSearchResults = results;
  searchHighlightIndex = results.length ? 0 : -1;

  if (!searchInput.value.trim()) {
    searchResultsEl.innerHTML = "";
    searchResultsEl.classList.remove("visible");
    return;
  }

  if (!results.length) {
    searchResultsEl.innerHTML = `<div class="search-empty">No topics match "${escapeHtml(searchInput.value.trim())}"</div>`;
    searchResultsEl.classList.add("visible");
    return;
  }

  searchResultsEl.innerHTML = results.map((r, i) => `
    <button class="search-result-item${i === 0 ? " active" : ""}" data-index="${i}" style="--sr-color:${r.dirColor}">
      <span class="sr-glyph">${r.dirGlyph}</span>
      <span class="sr-body">
        <span class="sr-title">${r.topicTitle}</span>
        <span class="sr-meta">${r.sectionLabel} · ${r.dirName}</span>
      </span>
      <span class="sr-tag">${r.topicTag}</span>
    </button>
  `).join("");
  searchResultsEl.classList.add("visible");

  searchResultsEl.querySelectorAll(".search-result-item").forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    btn.addEventListener("mouseenter", () => setSearchHighlight(idx));
    btn.addEventListener("click", () => selectSearchResult(idx));
  });
}

function setSearchHighlight(idx) {
  searchHighlightIndex = idx;
  searchResultsEl.querySelectorAll(".search-result-item").forEach((el, i) => {
    el.classList.toggle("active", i === idx);
  });
  const activeEl = searchResultsEl.children[idx];
  if (activeEl && typeof activeEl.scrollIntoView === "function") activeEl.scrollIntoView({ block: "nearest" });
}

function selectSearchResult(idx) {
  const r = currentSearchResults[idx];
  if (!r) return;
  if (state.section !== r.sectionKey) switchSection(r.sectionKey);
  const dir = DATA.find(d => d.slug === r.dirSlug);
  const topic = dir && dir.topics.find(t => t.slug === r.topicSlug);
  if (dir && topic) selectTopic(dir, topic);
  closeSearchResults();
}

function closeSearchResults() {
  searchInput.value = "";
  searchResultsEl.innerHTML = "";
  searchResultsEl.classList.remove("visible");
  currentSearchResults = [];
  searchHighlightIndex = -1;
}

searchInput.addEventListener("input", e => {
  renderSearchResults(searchTopics(e.target.value));
});

searchInput.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (currentSearchResults.length) setSearchHighlight((searchHighlightIndex + 1) % currentSearchResults.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (currentSearchResults.length) setSearchHighlight((searchHighlightIndex - 1 + currentSearchResults.length) % currentSearchResults.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (searchHighlightIndex >= 0) selectSearchResult(searchHighlightIndex);
  } else if (e.key === "Escape") {
    closeSearchResults();
    searchInput.blur();
  }
});

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim()) renderSearchResults(searchTopics(searchInput.value));
});

document.addEventListener("click", e => {
  if (!e.target.closest(".navbar-search")) {
    searchResultsEl.classList.remove("visible");
  }
});

document.addEventListener("keydown", e => {
  const mod = navigator.platform.toUpperCase().includes("MAC") ? e.metaKey : e.ctrlKey;
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

const searchKbdEl = document.getElementById("searchKbd");
if (searchKbdEl && navigator.platform.toUpperCase().includes("MAC")) {
  searchKbdEl.textContent = "⌘K";
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */

loadProfilesList();
loadActiveProfileData();
renderProfileChip();
applyLayoutPrefs();
renderSectionBar();
renderSidebar();
renderNavbarStat();
renderLanding();
