/* ---------------------------------------------------------
   Page navigation and motion.

   - Every page has a real address, like  #/grade12/<unit>/<topic>
     so the browser's back and forward buttons work, a topic can be
     shared or opened in a new tab, and the tab title follows the page.
   - Pages arrive with a short, direction-aware animation
     (forward rises in, back slides in from the left).
   - "Continue where you left off" appears on the landing page.
   - A reading-progress bar and a back-to-top button.

   It hooks the two functions that draw a page (renderLanding and
   renderTopic), so every route to a page is covered: sidebar, cards,
   search, related topics, previous/next, breadcrumb and the back button.
--------------------------------------------------------- */
(function () {
  "use strict";

  if (typeof SECTIONS === "undefined" || typeof renderTopic !== "function" || typeof renderLanding !== "function") return;

  const RESUME_KEY = "cs-notes-resume-v1";
  const SITE = "CS Notes";
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const reduced = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };

  const origRenderTopic = renderTopic;
  const origRenderLanding = renderLanding;

  let current = { section: state.section, dir: null, topic: null };   // the page on screen
  let routing = false;        // true while a page is being opened FROM the address (don't write history)
  let pending = false;        // a commit is queued
  let changed = false;        // a different page was drawn since the last commit
  let navDir = "forward";
  let histIndex = 0;
  let leaveScroll = 0;        // scroll position of the page being left
  let restoreScroll = null;   // scroll position to return to (back/forward)

  /* ---------- Addresses ---------- */

  function lookup(sectionKey, dirSlug, topicSlug) {
    if (!hasOwn(SECTIONS, sectionKey)) return null;
    const dir = SECTIONS[sectionKey].data.find(d => d.slug === dirSlug);
    const topic = dir && dir.topics.find(t => t.slug === topicSlug);
    return topic ? { dir: dir, topic: topic } : null;
  }

  // Returns null for anything that isn't one of our addresses (like the skip link's "#content").
  function parseHash(hash) {
    const h = String(hash || "").replace(/^#/, "");
    if (h && h.charAt(0) !== "/") return null;
    const parts = h.split("/").filter(Boolean).map(dec);
    if (!parts.length || !hasOwn(SECTIONS, parts[0])) return { section: "reference" };
    const route = { section: parts[0] };
    if (parts.length >= 3 && lookup(parts[0], parts[1], parts[2])) { route.dir = parts[1]; route.topic = parts[2]; }
    return route;
  }

  const buildHash = c => "#/" + c.section + (c.topic ? "/" + c.dir + "/" + c.topic : "");

  function writeHistory(hash) {
    const url = location.pathname + location.search + hash;
    try {
      if (location.hash === hash) { history.replaceState({ i: histIndex }, "", url); return; }
      // Remember how far the page we're leaving was scrolled, then add the new page.
      history.replaceState({ i: histIndex, scroll: leaveScroll }, "", location.href);
      histIndex += 1;
      history.pushState({ i: histIndex }, "", url);
    } catch (e) { /* if the browser blocks the history API the site still works, just without addresses */ }
  }

  function updateTitle() {
    if (current.topic) {
      const f = lookup(current.section, current.dir, current.topic);
      if (f) { document.title = f.topic.title + " · " + f.dir.name + " — " + SITE; return; }
    }
    document.title = SECTIONS[current.section].label + " — " + SITE;
  }

  /* ---------- Resume ---------- */

  function rememberTopic() {
    if (!current.topic) return;
    try { localStorage.setItem(RESUME_KEY, JSON.stringify({ section: current.section, dir: current.dir, topic: current.topic })); } catch (e) {}
  }

  function readResume() {
    try {
      const r = JSON.parse(localStorage.getItem(RESUME_KEY));
      return r && lookup(r.section, r.dir, r.topic) ? r : null;
    } catch (e) { return null; }
  }

  function addResumeCard() {
    const r = readResume();
    if (!r) return;
    const f = lookup(r.section, r.dir, r.topic);
    const a = document.createElement("a");
    a.className = "resume-card";
    a.href = buildHash(r);
    a.innerHTML =
      '<span class="rs-text"><span class="rs-kicker">Continue where you left off</span>' +
      '<span class="rs-title">' + escapeHtml(f.topic.title) + '</span>' +
      '<span class="rs-meta">' + escapeHtml(SECTIONS[r.section].label) + " · " + escapeHtml(f.dir.name) + '</span></span>' +
      '<span class="rs-arrow" aria-hidden="true">&rarr;</span>';
    contentEl.insertBefore(a, contentEl.firstChild);
  }

  /* ---------- Hooking the two page-drawing functions ---------- */

  window.renderTopic = function (dir, topic) {
    contentEl.classList.remove("page-enter");
    const same = current.section === state.section && current.dir === dir.slug && current.topic === topic.slug;
    if (!same) leaveScroll = contentEl.scrollTop;
    origRenderTopic(dir, topic);
    if (same) return;           // the same page drawn again (for example after adding a note): no animation, no new history entry
    current = { section: state.section, dir: dir.slug, topic: topic.slug };
    changed = true;
    schedule();
  };

  window.renderLanding = function () {
    contentEl.classList.remove("page-enter");
    const same = current.section === state.section && !current.topic;
    if (!same) leaveScroll = contentEl.scrollTop;
    origRenderLanding();
    addResumeCard();
    if (same) return;
    current = { section: state.section, dir: null, topic: null };
    changed = true;
    schedule();
  };

  function schedule() {
    if (pending) return;
    pending = true;
    Promise.resolve().then(commit);     // after the current click has finished drawing, before the browser paints
  }

  function commit() {
    pending = false;
    const fromAddress = routing;
    routing = false;
    if (!fromAddress) writeHistory(buildHash(current));
    updateTitle();
    rememberTopic();
    if (changed) { changed = false; enter(); }
    navDir = "forward";
    restoreScroll = null;
    onScroll();
  }

  /* ---------- Page entrance ---------- */

  function countUp(el) {
    const target = parseInt(el.textContent, 10);
    if (!isFinite(target) || target <= 0) return;
    const t0 = performance.now();
    el.textContent = "0";
    (function tick(now) {
      const p = Math.min(1, ((now || performance.now()) - t0) / 900);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick); else el.textContent = String(target);
    })(t0);
  }

  function enter() {
    const only = contentEl.children.length === 1 ? contentEl.firstElementChild : null;
    const root = only && only.classList.contains("content-inner") ? only : contentEl;
    let n = 0;
    Array.prototype.forEach.call(root.children, el => { el.style.setProperty("--i", Math.min(n++, 8)); });
    Array.prototype.forEach.call(contentEl.querySelectorAll(".landing-grid > *"), (el, k) => el.style.setProperty("--i", Math.min(k, 14)));
    contentEl.scrollTop = restoreScroll != null ? restoreScroll : 0;
    if (reduced()) return;

    contentEl.dataset.nav = navDir;
    contentEl.classList.remove("page-enter");
    void contentEl.offsetWidth;                         // restart the animation
    contentEl.classList.add("page-enter");

    if (!current.topic) {
      Array.prototype.forEach.call(contentEl.querySelectorAll(".stat-headline .num, .sb-value"), countUp);
      const fill = contentEl.querySelector(".stat-progress-fill");
      if (fill) {
        const w = fill.style.width;
        fill.style.transition = "none";
        fill.style.width = "0%";
        void fill.offsetWidth;
        fill.style.transition = "";
        requestAnimationFrame(() => { fill.style.width = w; });
      }
    }
  }

  /* ---------- Opening a page from the address bar, back/forward, or a link ---------- */

  function applyRoute(route, scroll) {
    routing = true;
    restoreScroll = scroll == null ? null : scroll;
    if (state.section !== route.section) switchSection(route.section);
    const f = route.topic ? lookup(route.section, route.dir, route.topic) : null;
    if (f) selectTopic(f.dir, f.topic);
    else if (!(current.section === route.section && !current.topic)) goToLanding();
    schedule();                 // always: settles the title and clears "routing" even if nothing needed drawing
  }

  window.addEventListener("popstate", e => {
    const route = parseHash(location.hash);
    if (!route) return;         // something like "#content", not a page address
    const st = e.state;
    const known = !!(st && typeof st.i === "number");
    const target = known ? st.i : histIndex + 1;      // a plain link click arrives without our bookkeeping
    navDir = target < histIndex ? "back" : "forward";
    histIndex = target;
    if (!known) { try { history.replaceState({ i: histIndex }, "", location.href); } catch (err) {} }
    applyRoute(route, known && typeof st.scroll === "number" ? st.scroll : null);
  });

  /* ---------- Reading progress + back to top ---------- */

  const bar = document.createElement("div");
  bar.className = "read-progress";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = "<i></i>";
  document.body.appendChild(bar);

  const toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14.5l6-6 6 6"/></svg>';
  document.body.appendChild(toTop);

  let saveTimer = null;
  function rememberScroll() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { history.replaceState({ i: histIndex, scroll: contentEl.scrollTop }, "", location.href); } catch (e) {}
    }, 120);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = contentEl.scrollHeight - contentEl.clientHeight;
      const p = max > 20 ? Math.min(1, contentEl.scrollTop / max) : 0;
      bar.firstChild.style.transform = "scaleX(" + p.toFixed(4) + ")";
      bar.classList.toggle("on", !!current.topic && max > 240);
      toTop.classList.toggle("on", contentEl.scrollTop > 700);
    });
  }
  contentEl.addEventListener("scroll", () => { onScroll(); rememberScroll(); }, { passive: true });
  toTop.addEventListener("click", () => {
    contentEl.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    focusMainHeading();
  });

  /* ---------- Start up ---------- */

  const skip = document.getElementById("skipLink");
  if (skip) skip.addEventListener("click", e => { e.preventDefault(); contentEl.focus(); });

  try { history.scrollRestoration = "manual"; } catch (e) {}
  try { history.replaceState({ i: 0 }, "", location.href); } catch (e) {}

  const first = parseHash(location.hash);
  if (first && location.hash.length > 1) applyRoute(first, null);
  else addResumeCard();         // app.js drew the landing page before this file loaded

  setTimeout(() => document.body.classList.remove("boot"), 1500);
})();
