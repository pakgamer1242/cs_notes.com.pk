/* ---------------------------------------------------------
   Printing.

   - "Print" on a topic page (or the printer button in the toolbar) opens a
     dialog: this topic, every topic in the unit, or pick topics from any
     section; add short questions with answers and your own notes; choose
     the look and the paper size.
   - The printed pages are built with the SAME functions that draw a topic
     on screen (key points, code, tables, pitfalls...), so they look like the
     page, in the same fonts. "Same as the screen" keeps the dark theme;
     "Paper-friendly" switches to a white background to save ink.
   - Pressing Ctrl+P (or the browser's Print) on a topic page prints that
     topic the same way, without opening the dialog.
   - In the browser's print window, choose "Save as PDF" to keep a file.
--------------------------------------------------------- */
(function () {
  "use strict";

  if (typeof SECTIONS === "undefined" || typeof renderKeyPoints !== "function") return;

  const STORE = "cs-notes-print-v1";
  const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? "" : s));
  const escAttr = s => esc(s).replace(/"/g, "&quot;");

  const DEFAULTS = { scope: "topic", look: "screen", size: "A4", pageBreak: true, questions: true, mine: true };
  const opts = loadOptions();

  let overlay = null, panel = null, lastFocus = null, isOpen = false;
  let pickSection = null;
  const chosen = new Set();                 // "section|unit|topic"

  /* ---------- Is style.css as new as this script? ----------
     Printing only looks right with the matching style.css. If someone uploaded the new scripts but kept an old
     style.css, say so plainly instead of producing a broken printout. */
  function stylesCurrent() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--csn-ui"), 10) >= 3;
  }
  const STALE_HTML = '<p role="alert" style="margin:0 0 14px;padding:10px 12px;border:1px solid #C98A2E;border-radius:8px;background:rgba(201,138,46,0.16);color:#f3d9a8;font-size:14px;line-height:1.5"><strong>This site\'s style.css is older than its scripts.</strong> Printing would look broken, so it is switched off. Upload the newest style.css to GitHub, then refresh with Ctrl+F5.</p>';

  /* ---------- Remembered choices ---------- */

  function loadOptions() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { saved = {}; }
    const o = Object.assign({}, DEFAULTS);
    if (["topic", "unit", "pick"].indexOf(saved.scope) !== -1) o.scope = saved.scope;
    if (["screen", "paper"].indexOf(saved.look) !== -1) o.look = saved.look;
    if (["A4", "Letter"].indexOf(saved.size) !== -1) o.size = saved.size;
    ["pageBreak", "questions", "mine"].forEach(k => { if (typeof saved[k] === "boolean") o[k] = saved[k]; });
    return o;
  }
  function saveOptions() { try { localStorage.setItem(STORE, JSON.stringify(opts)); } catch (e) {} }

  /* ---------- What is on screen / what to print ---------- */

  function lookup(secKey, dirSlug, topicSlug) {
    if (!hasOwn(SECTIONS, secKey)) return null;
    const dir = SECTIONS[secKey].data.find(d => d.slug === dirSlug);
    const topic = dir && dir.topics.find(t => t.slug === topicSlug);
    return topic ? { section: secKey, dir: dir, topic: topic } : null;
  }

  function currentSelection() {
    const m = /^([^:]+):([^/]+)\/(.+)$/.exec(state.activeTopic || "");
    return m ? lookup(m[1], m[2], m[3]) : null;
  }

  function collect() {
    const cur = currentSelection();
    if (opts.scope === "topic" && cur) return [cur];
    if (opts.scope === "unit" && cur) return cur.dir.topics.map(t => ({ section: cur.section, dir: cur.dir, topic: t }));
    const out = [];
    Object.keys(SECTIONS).forEach(sk => SECTIONS[sk].data.forEach(d => d.topics.forEach(t => {
      if (chosen.has(sk + "|" + d.slug + "|" + t.slug)) out.push({ section: sk, dir: d, topic: t });
    })));
    return out;
  }

  /* ---------- Building the pages ---------- */

  function resourcesHtml(list) {
    const items = list.map(r => {
      const type = r.type || "link";
      if (type === "image") {
        if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(String(r.dataUrl || ""))) return "";
        return `<li class="pr-image"><img src="${r.dataUrl}" alt=""><span>${esc(r.name || "Image")}</span></li>`;
      }
      if (type === "video") {
        const url = r.url || r.embedUrl || "";
        return `<li><span class="pr-label">${esc(r.label || "Video")}</span>${url ? ` <span class="pr-url">${esc(url)}</span>` : ""}</li>`;
      }
      return `<li><span class="pr-label">${esc(r.label || r.url || "Link")}</span>${r.url && r.url !== r.label ? ` <span class="pr-url">${esc(r.url)}</span>` : ""}</li>`;
    }).filter(Boolean);
    return items.length ? `<h2 class="section-label">your resources</h2><ul class="print-resources">${items.join("")}</ul>` : "";
  }

  function topicHtml(item, o, dateText) {
    const dir = item.dir, topic = item.topic;
    const key = item.section + ":" + dir.slug + "/" + topic.slug;
    const notes = String((state.notes && state.notes[key]) || "").trim();
    const res = (state.resources && state.resources[key]) || [];
    let questions = o.questions ? renderShortQuestions(topic.shortQuestions) : "";
    questions = questions.replace(/<details class="sq-item">/g, '<details class="sq-item" open>');   // answers are shown on paper
    return `
      <article class="print-topic">
        <div class="print-meta">CS Notes &middot; ${esc(SECTIONS[item.section].label)} &middot; ${esc(dir.name)}</div>
        <div class="content-inner">
          <div class="topic-eyebrow" style="color:${dir.color}">${dir.glyph} ${dir.name}</div>
          <div class="topic-header">
            <h1>${topic.title}</h1>
            <span class="topic-tag ${topic.tag}">${topic.tag}</span>
          </div>
          <p class="topic-desc">${topic.desc}</p>
          ${renderKeyPoints(topic.keyPoints)}
          ${renderCode(topic.code)}
          ${renderTable(topic.table)}
          ${renderPitfalls(topic.pitfalls)}
          ${renderPractice(topic.practice)}
          ${questions}
          ${o.mine && notes ? `<h2 class="section-label">your notes</h2><div class="print-notes">${esc(notes)}</div>` : ""}
          ${o.mine && res.length ? resourcesHtml(res) : ""}
        </div>
        <div class="print-foot">Printed from CS Notes &middot; ${esc(dateText)}</div>
      </article>`;
  }

  function buildPrintArea(items, o) {
    cleanup();
    const root = document.documentElement;
    const area = document.createElement("div");
    area.id = "printArea";
    area.className = "print-area";
    area.setAttribute("data-look", o.look);
    if (!o.pageBreak) area.setAttribute("data-flow", "continuous");
    const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    area.innerHTML = items.map(it => topicHtml(it, o, date)).join("");
    document.body.appendChild(area);

    const style = document.createElement("style");
    style.id = "printPageStyle";
    // The page colour is set on @page itself so the margins match the page (otherwise a dark page prints with white borders).
    style.textContent = "@page { size: " + (o.size === "Letter" ? "letter" : "A4") + "; margin: 12mm; background: " + (o.look === "paper" ? "#ffffff" : "#0A2016") + "; }";
    document.head.appendChild(style);

    root.setAttribute("data-print-look", o.look);
    document.body.classList.add("printing");
  }

  function cleanup() {
    const a = $("printArea"); if (a) a.remove();
    const s = $("printPageStyle"); if (s) s.remove();
    document.documentElement.removeAttribute("data-print-look");
    document.body.classList.remove("printing");
  }

  window.addEventListener("beforeprint", () => {
    if ($("printArea") || !stylesCurrent()) return;  // already prepared by the dialog, or the stylesheet is too old to print properly
    const cur = currentSelection();
    if (cur) buildPrintArea([cur], opts);            // Ctrl+P on a topic page prints that topic, nicely
  });
  window.addEventListener("afterprint", cleanup);

  function run() {
    const items = collect();
    if (!stylesCurrent()) return;
    if (!items.length) { showError("Choose at least one topic to print."); return; }
    saveOptions();
    close();
    buildPrintArea(items, opts);
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => setTimeout(() => window.print(), 120));
  }

  /* ---------- The dialog ---------- */

  function ensure() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "study-overlay";
    overlay.id = "printOverlay";
    overlay.setAttribute("aria-hidden", "true");
    panel = document.createElement("div");
    panel.className = "study-panel print-panel";
    panel.id = "printPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "prTitle");
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    panel.addEventListener("click", onClick);
    panel.addEventListener("change", onChange);
  }

  function open(fromTopic) {
    ensure();
    lastFocus = document.activeElement;
    const cur = currentSelection();
    if (fromTopic && cur && opts.scope === "pick") opts.scope = "topic";
    if (!cur && opts.scope !== "pick") opts.scope = "pick";
    if (!pickSection || !hasOwn(SECTIONS, pickSection)) pickSection = cur ? cur.section : state.section;
    if (cur && !chosen.size) chosen.add(cur.section + "|" + cur.dir.slug + "|" + cur.topic.slug);
    isOpen = true;
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.removeEventListener("keydown", onKey);
    document.addEventListener("keydown", onKey);
    render();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function treeHtml() {
    const sec = SECTIONS[pickSection];
    const options = Object.keys(SECTIONS).map(k => `<option value="${escAttr(k)}"${k === pickSection ? " selected" : ""}>${esc(SECTIONS[k].label)}</option>`).join("");
    const units = sec.data.map(d => {
      const keys = d.topics.map(t => pickSection + "|" + d.slug + "|" + t.slug);
      const n = keys.filter(k => chosen.has(k)).length;
      return `
        <details class="pr-unit"${n ? " open" : ""}>
          <summary>
            <label class="pr-unit-all"><input type="checkbox" data-pr-unit="${escAttr(d.slug)}"${n === keys.length ? " checked" : ""}> <span>${esc(d.name.replace(/-/g, " "))}</span></label>
            <span class="pr-unit-count">${n}/${keys.length}</span>
          </summary>
          <div class="pr-topics">
            ${d.topics.map(t => `<label class="pr-topic"><input type="checkbox" data-pr-topic="${escAttr(pickSection + "|" + d.slug + "|" + t.slug)}"${chosen.has(pickSection + "|" + d.slug + "|" + t.slug) ? " checked" : ""}> <span>${t.title}</span></label>`).join("")}
          </div>
        </details>`;
    }).join("");
    return `
      <div class="pr-pick">
        <div class="pr-pick-head">
          <label class="fb-label" for="prSection">Section</label>
          <select class="study-select" id="prSection">${options}</select>
        </div>
        <div class="pr-units">${units}</div>
      </div>`;
  }

  function render() {
    if (!isOpen) return;
    const cur = currentSelection();
    const radio = (val, label, disabled) =>
      `<label class="pr-radio${disabled ? " disabled" : ""}"><input type="radio" name="prScope" value="${val}"${opts.scope === val ? " checked" : ""}${disabled ? " disabled" : ""}> <span>${label}</span></label>`;
    const count = collect().length;
    const prev = document.activeElement;
    let restore = null;
    if (prev && panel.contains(prev)) {
      if (prev.id) restore = "#" + prev.id;
      else if (prev.name) restore = '[name="' + prev.name + '"][value="' + prev.value + '"]';
    }
    panel.innerHTML = `
      <div class="study-header">
        <h2 class="study-title" id="prTitle" tabindex="-1">Print notes</h2>
        <button class="study-close-btn" type="button" data-pr="cancel" aria-label="Close">&times;</button>
      </div>
      ${stylesCurrent() ? "" : STALE_HTML}
      <fieldset class="pr-group">
        <legend class="fb-label">What to print</legend>
        ${radio("topic", cur ? `This topic <em>${esc(cur.topic.title)}</em>` : "This topic <em>(open a topic first)</em>", !cur)}
        ${radio("unit", cur ? `Every topic in <em>${esc(cur.dir.name.replace(/-/g, " "))}</em>` : "Every topic in this unit <em>(open a topic first)</em>", !cur)}
        ${radio("pick", "Choose topics&hellip;", false)}
        ${opts.scope === "pick" ? treeHtml() : ""}
      </fieldset>
      <fieldset class="pr-group">
        <legend class="fb-label">Include</legend>
        <label class="pr-check"><input type="checkbox" id="prQuestions"${opts.questions ? " checked" : ""}> <span>Short questions with their answers</span></label>
        <label class="pr-check"><input type="checkbox" id="prMine"${opts.mine ? " checked" : ""}> <span>My notes, links and pictures</span></label>
      </fieldset>
      <fieldset class="pr-group pr-row">
        <div>
          <legend class="fb-label">Look</legend>
          <label class="pr-radio"><input type="radio" name="prLook" value="screen"${opts.look === "screen" ? " checked" : ""}> <span>Same as the screen</span></label>
          <label class="pr-radio"><input type="radio" name="prLook" value="paper"${opts.look === "paper" ? " checked" : ""}> <span>Paper-friendly (white, saves ink)</span></label>
        </div>
        <div>
          <label class="fb-label" for="prSize">Paper</label>
          <select class="study-select" id="prSize"><option value="A4"${opts.size === "A4" ? " selected" : ""}>A4</option><option value="Letter"${opts.size === "Letter" ? " selected" : ""}>Letter</option></select>
          <label class="pr-check"><input type="checkbox" id="prBreak"${opts.pageBreak ? " checked" : ""}> <span>New page for each topic</span></label>
        </div>
      </fieldset>
      <p class="fb-error" id="prError" role="alert"></p>
      <p class="fb-privacy" id="prCount" role="status" aria-live="polite">${count} topic${count === 1 ? "" : "s"} selected. In the print window, choose "Save as PDF" to keep a file, and turn on "Background graphics" if the colours don't show.</p>
      <div class="pr-actions">
        <button type="button" class="study-start-btn" data-pr="print"${stylesCurrent() ? "" : " disabled"}>Print / save as PDF</button>
        <button type="button" class="fb-btn" data-pr="cancel">Cancel</button>
      </div>`;
    const back = restore && panel.querySelector(restore);
    const h = $("prTitle");
    if (back) back.focus(); else if (h) h.focus();
  }

  function showError(msg) {
    const el = $("prError");
    if (el) { el.textContent = msg; el.classList.add("show"); }
  }

  function updateCount() {
    const n = collect().length;
    const el = $("prCount");
    if (el) el.textContent = n + " topic" + (n === 1 ? "" : "s") + " selected. In the print window, choose \"Save as PDF\" to keep a file, and turn on \"Background graphics\" if the colours don't show.";
  }

  function onClick(e) {
    const b = e.target.closest("[data-pr]");
    if (!b) return;
    if (b.dataset.pr === "cancel") close();
    else if (b.dataset.pr === "print") run();
  }

  function onChange(e) {
    const t = e.target;
    if (t.name === "prScope") { opts.scope = t.value; render(); return; }
    if (t.name === "prLook") { opts.look = t.value; return; }
    if (t.id === "prSize") { opts.size = t.value; return; }
    if (t.id === "prBreak") { opts.pageBreak = t.checked; return; }
    if (t.id === "prQuestions") { opts.questions = t.checked; return; }
    if (t.id === "prMine") { opts.mine = t.checked; return; }
    if (t.id === "prSection") { pickSection = t.value; render(); return; }
    if (t.dataset && t.dataset.prTopic) {
      if (t.checked) chosen.add(t.dataset.prTopic); else chosen.delete(t.dataset.prTopic);
      syncUnits();
      updateCount();
      return;
    }
    if (t.dataset && t.dataset.prUnit) {
      const dir = SECTIONS[pickSection].data.find(d => d.slug === t.dataset.prUnit);
      if (dir) dir.topics.forEach(tp => { const k = pickSection + "|" + dir.slug + "|" + tp.slug; if (t.checked) chosen.add(k); else chosen.delete(k); });
      panel.querySelectorAll('[data-pr-topic^="' + pickSection + "|" + t.dataset.prUnit + '|"]').forEach(c => { c.checked = t.checked; });
      syncUnits();
      updateCount();
    }
  }

  // Keep each unit's "select all" box and its n/total counter in step with its topics.
  function syncUnits() {
    panel.querySelectorAll(".pr-unit").forEach(u => {
      const boxes = Array.prototype.slice.call(u.querySelectorAll("[data-pr-topic]"));
      const n = boxes.filter(c => c.checked).length;
      const all = u.querySelector("[data-pr-unit]");
      const cnt = u.querySelector(".pr-unit-count");
      if (all) { all.checked = n === boxes.length; all.indeterminate = n > 0 && n < boxes.length; }
      if (cnt) cnt.textContent = n + "/" + boxes.length;
    });
  }

  function onKey(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    const title = $("prTitle"), current = document.activeElement, inside = panel.contains(current);
    if (e.shiftKey && (current === first || current === title || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (current === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Entry points ---------- */

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-print-open]");
    if (b) { e.preventDefault(); open(b.dataset.printOpen === "topic"); }
  });

  window.CSNPrint = { open: open, build: buildPrintArea, cleanup: cleanup };
})();
