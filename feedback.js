/* ---------------------------------------------------------
   Complaint box: a floating button that opens a report form.

   This site has no server, so nothing is sent anywhere
   automatically. Reports are saved in this browser and can be
   copied, downloaded, or (if an address is set below) emailed.

   Each report can carry page + device/browser details and a
   feature check for the CSS/JS this site relies on. That is
   meant to make later cross-platform compatibility work easier.
--------------------------------------------------------- */
(function () {
  "use strict";

  /* ---------- Settings ---------- */

  const FEEDBACK_CONFIG = {
    // Optional. If you put an address here, a "Send by email" button appears
    // after a report is saved. It opens the visitor's mail app with the report
    // filled in. Leave empty to hide the button.
    email: "",
  };

  const STORE_KEY = "cs-notes-feedback-v1";
  const MAX_SAVED = 50;
  const MAX_LEN = 1000;

  const TYPES = [
    { value: "compatibility", label: "Not working on my device" },
    { value: "display", label: "Something looks wrong" },
    { value: "content", label: "Wrong or unclear content" },
    { value: "suggestion", label: "Idea or suggestion" },
    { value: "other", label: "Something else" },
  ];

  const ENV_LABELS = {
    browser: "Browser",
    platform: "Platform",
    language: "Language",
    screen: "Screen size",
    window: "Window size",
    pixelRatio: "Pixel ratio",
    touch: "Touch screen",
    colorScheme: "Color scheme",
    reducedMotion: "Reduced motion",
    online: "Online",
    openedFrom: "Opened from",
  };

  /* ---------- Elements + state ---------- */

  const btn = document.getElementById("feedbackBtn");
  const overlay = document.getElementById("feedbackOverlay");
  const panel = document.getElementById("feedbackPanel");
  if (!btn || !overlay || !panel) return;

  const emptyDraft = () => ({ type: "", description: "", contact: "", include: true });
  let ui = { view: "form", draft: emptyDraft(), lastReport: null, saveFailed: false, sentOnline: false, sendFailed: false };
  // When accounts are switched on (cloud.js), reports go straight to the site owner.
  // Without that, this box behaves as before: reports are kept on the device.
  const cloud = () => (window.CSNCloud && window.CSNCloud.configured ? window.CSNCloud : null);
  let lastFocused = null;

  /* ---------- Small helpers ---------- */

  const esc = s => escapeHtml(String(s == null ? "" : s));
  const escAttr = s => esc(s).replace(/"/g, "&quot;");
  const typeLabel = v => { const t = TYPES.find(x => x.value === v); return t ? t.label : "Something else"; };
  const typeClass = v => String(v).replace(/[^a-z]/g, "") || "other";
  const fmtVal = v => typeof v === "boolean" ? (v ? "yes" : "no") : (v === null || v === undefined ? "unknown" : String(v));

  /* ---------- Saved reports (this browser only) ---------- */

  function loadReports() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr)
        ? arr.filter(r => r && typeof r.id === "string" && typeof r.description === "string")
        : [];
    } catch (e) {
      return [];
    }
  }

  function saveReports(list) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Page + device details ---------- */

  function getPageContext() {
    const sectionLabel = SECTIONS[state.section] ? SECTIONS[state.section].label : String(state.section);
    if (state.activeTopic) {
      const rest = state.activeTopic.split(":")[1] || "";
      const parts = rest.split("/");
      const dir = DATA.find(d => d.slug === parts[0]);
      const topic = dir && dir.topics.find(t => t.slug === parts[1]);
      if (dir && topic) return { section: sectionLabel, unit: dir.name, topic: topic.title };
    }
    return { section: sectionLabel, unit: "", topic: "" };
  }

  function pageText(p) {
    const trail = [p.section, p.unit, p.topic].filter(Boolean).join(" › ");
    return p.topic ? trail : trail + " (home page)";
  }

  function matches(q) {
    return typeof window.matchMedia === "function" ? window.matchMedia(q).matches : null;
  }

  function collectEnvironment() {
    const nav = typeof navigator !== "undefined" ? navigator : {};
    const scr = window.screen || {};
    const dark = matches("(prefers-color-scheme: dark)");
    return {
      browser: nav.userAgent || "unknown",
      platform: (nav.userAgentData && nav.userAgentData.platform) || nav.platform || "unknown",
      language: nav.language || "unknown",
      screen: scr.width ? scr.width + "×" + scr.height : "unknown",
      window: window.innerWidth + "×" + window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      touch: ("ontouchstart" in window) || (nav.maxTouchPoints > 0),
      colorScheme: dark === null ? "unknown" : (dark ? "dark" : "light"),
      reducedMotion: matches("(prefers-reduced-motion: reduce)"),
      online: typeof nav.onLine === "boolean" ? nav.onLine : null,
      openedFrom: location.protocol === "file:" ? "a local file" : "the web (" + location.protocol.replace(":", "") + ")",
    };
  }

  function cssSupports(a, b) {
    try {
      if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return null;
      return b === undefined ? CSS.supports(a) : CSS.supports(a, b);
    } catch (e) {
      return null;
    }
  }

  function anyOf(values) {
    if (values.some(v => v === true)) return true;
    if (values.every(v => v === null)) return null;
    return false;
  }

  function probeStorage() {
    try {
      localStorage.setItem("__fb_probe__", "1");
      localStorage.removeItem("__fb_probe__");
      return true;
    } catch (e) {
      return false;
    }
  }

  function canvasWorks() {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext && c.getContext("2d"));
    } catch (e) {
      return false;
    }
  }

  // The features this site actually depends on, as "yes" / "no" / "unknown".
  function detectFeatures() {
    const f = {
      "Glass blur (backdrop-filter)": anyOf([cssSupports("backdrop-filter", "blur(2px)"), cssSupports("-webkit-backdrop-filter", "blur(2px)")]),
      "color-mix()": cssSupports("color", "color-mix(in srgb, red, blue)"),
      "aspect-ratio": cssSupports("aspect-ratio", "16 / 9"),
      ":focus-visible": cssSupports("selector(:focus-visible)"),
      "CSS grid": cssSupports("display", "grid"),
      "Saving notes (localStorage)": probeStorage(),
      "Copy to clipboard": !!(navigator.clipboard && navigator.clipboard.writeText),
      "Image attachments (canvas)": canvasWorks(),
      "FileReader": typeof FileReader !== "undefined",
      "<details> element": "open" in document.createElement("details"),
    };
    Object.keys(f).forEach(k => { f[k] = f[k] === null ? "unknown" : (f[k] ? "yes" : "no"); });
    return f;
  }

  /* ---------- Building and formatting a report ---------- */

  function buildReport(draft) {
    return {
      id: "R" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      type: draft.type,
      description: draft.description,
      contact: draft.contact || "",
      page: draft.include ? getPageContext() : null,
      env: draft.include ? collectEnvironment() : null,
      features: draft.include ? detectFeatures() : null,
    };
  }

  function formatReport(r) {
    const lines = [
      "CS Notes: complaint box report",
      "Report ID: " + r.id,
      "Date: " + new Date(r.createdAt).toLocaleString(),
      "Type: " + typeLabel(r.type),
    ];
    if (r.page) lines.push("Page: " + pageText(r.page));
    lines.push("", "What happened:", r.description);
    if (r.contact) lines.push("", "Contact: " + r.contact);
    if (r.env) {
      lines.push("", "Device and browser:");
      Object.keys(ENV_LABELS).forEach(k => lines.push("- " + ENV_LABELS[k] + ": " + fmtVal(r.env[k])));
    }
    if (r.features) {
      lines.push("", "Feature support:");
      Object.keys(r.features).forEach(k => lines.push("- " + k + ": " + r.features[k]));
    }
    return lines.join("\n");
  }

  function mailtoHref(r) {
    let body = formatReport(r);
    if (body.length > 1800) body = body.slice(0, 1800) + "\n...(shortened, use Copy or Download for the full report)";
    return "mailto:" + FEEDBACK_CONFIG.email +
      "?subject=" + encodeURIComponent("CS Notes report: " + typeLabel(r.type)) +
      "&body=" + encodeURIComponent(body);
  }

  /* ---------- Copy + download ---------- */

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through to the older method */ }
    const previous = document.activeElement;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (previous && typeof previous.focus === "function") previous.focus();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Rendering ---------- */

  function savedTabHtml(formActive) {
    const n = loadReports().length;
    if (cloud() && n === 0 && formActive) return "";   // nothing is waiting to be sent
    const label = (cloud() ? "Unsent (" : "Saved (") + n + ")";
    return `<button class="fb-tab${formActive ? "" : " active"}" type="button" role="tab" aria-selected="${!formActive}" data-fb-view="history">${label}</button>`;
  }

  function headerHtml(title) {
    const formActive = ui.view !== "history";
    return `
      <div class="study-header">
        <h2 class="study-title" id="feedbackTitle" tabindex="-1">${esc(title)}</h2>
        <button class="study-close-btn" id="fbCloseBtn" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="fb-tabs" role="tablist" aria-label="Complaint box">
        <button class="fb-tab${formActive ? " active" : ""}" type="button" role="tab" aria-selected="${formActive}" data-fb-view="form">New report</button>
        ${savedTabHtml(formActive)}
      </div>
    `;
  }

  function detailsHtml(page, env, feats) {
    const envRows = Object.keys(ENV_LABELS)
      .map(k => `<dt>${esc(ENV_LABELS[k])}</dt><dd>${esc(fmtVal(env[k]))}</dd>`).join("");
    const featRows = Object.keys(feats)
      .map(k => `<dt>${esc(k)}</dt><dd class="fb-feat-${typeClass(feats[k])}">${esc(feats[k])}</dd>`).join("");
    return `
      <dl class="fb-kv"><dt>Page</dt><dd>${esc(pageText(page))}</dd>${envRows}</dl>
      <p class="fb-kv-title">Feature support</p>
      <dl class="fb-kv">${featRows}</dl>
    `;
  }

  function formHtml() {
    const d = ui.draft;
    const page = getPageContext();
    return `
      ${headerHtml("Complaint box")}
      <p class="fb-intro">Something broken, confusing or not working on your device or browser? Tell us what happened. ${cloud() ? "Your report goes straight to the site owner. " : ""}Device details are attached by default, which makes compatibility problems much easier to fix.</p>
      <form id="fbForm" novalidate>
        <fieldset class="fb-fieldset">
          <legend class="fb-label">What kind of problem is it? <span class="fb-req">required</span></legend>
          <div class="fb-types">
            ${TYPES.map(t => `
              <span class="fb-type">
                <input class="visually-hidden" type="radio" name="fbType" id="fbType-${t.value}" value="${t.value}"${d.type === t.value ? " checked" : ""}>
                <label for="fbType-${t.value}">${esc(t.label)}</label>
              </span>`).join("")}
          </div>
        </fieldset>

        <div class="fb-field">
          <label class="fb-label" for="fbDesc">What happened? <span class="fb-req">required</span></label>
          <textarea class="fb-textarea" id="fbDesc" rows="5" maxlength="${MAX_LEN}" aria-describedby="fbCount" placeholder="For example: the sidebar won't open on my phone, or the page looks blurry in Firefox...">${esc(d.description)}</textarea>
          <div class="fb-meta"><span id="fbCount">${d.description.length} / ${MAX_LEN}</span></div>
        </div>

        <div class="fb-field">
          <label class="fb-label" for="fbContact">Name or email <span class="fb-opt">optional</span></label>
          <input class="fb-input" id="fbContact" type="text" maxlength="80" autocomplete="off" placeholder="Only if you'd like a reply" value="${escAttr(d.contact)}">
        </div>

        <label class="fb-check">
          <input type="checkbox" id="fbInclude"${d.include ? " checked" : ""}>
          <span>Include page &amp; device details (recommended)</span>
        </label>
        <details class="fb-tech">
          <summary>See exactly what's included</summary>
          ${detailsHtml(page, collectEnvironment(), detectFeatures())}
        </details>

        <div class="fb-hp" aria-hidden="true"><label>Website <input type="text" id="fbWebsite" name="website" tabindex="-1" autocomplete="off"></label></div>
        <p class="fb-error" id="fbError" role="alert"></p>
        <button type="submit" class="study-start-btn" id="fbSubmit">${cloud() ? "Send report" : "Save report"}</button>
      </form>
      <p class="fb-privacy">${cloud()
        ? "Your report is sent to the site owner so they can fix the problem. It contains what you write and, if ticked, the page and device details above, but never your notes. Nothing is kept on this device once it's sent."
        : "Nothing is sent anywhere automatically. Reports are saved in this browser, and you can copy or download them afterwards."}</p>
    `;
  }

  function sentOnlineHtml() {
    return `
      ${headerHtml("Report sent")}
      <div class="fb-success">
        <span class="fb-success-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Sent. Thank you!</strong>
          <p>Your report went to the site owner. Nothing is kept on this device.</p>
        </div>
      </div>
      <div class="fb-actions">
        <button type="button" class="fb-btn" data-fb-act="new">Send another report</button>
      </div>
    `;
  }

  function sendFailedHtml() {
    return `
      ${headerHtml("Not sent yet")}
      <div class="fb-success fb-success-warn">
        <span class="fb-success-icon" aria-hidden="true">!</span>
        <div>
          <strong>Couldn't send it right now.</strong>
          <p>${ui.saveFailed
            ? "It also couldn't be kept on this device, so copy it now before closing this window."
            : "It's kept on this device and will be sent automatically when you're back online."}</p>
        </div>
      </div>
      <div class="fb-actions">
        <button type="button" class="fb-btn fb-btn-primary" data-fb-act="retry-send">Try again now</button>
        <button type="button" class="fb-btn" data-fb-act="copy">Copy report</button>
        <button type="button" class="fb-btn" data-fb-act="download">Download (.txt)</button>
      </div>
      <p class="fb-notice" id="fbNotice" role="status" aria-live="polite"></p>
      <div class="fb-actions">
        <button type="button" class="fb-btn" data-fb-act="new">New report</button>
      </div>
    `;
  }

  function sentHtml() {
    const r = ui.lastReport;
    if (ui.sentOnline) return sentOnlineHtml();
    if (ui.sendFailed) return sendFailedHtml();
    const mail = FEEDBACK_CONFIG.email
      ? `<a class="fb-btn" href="${escAttr(mailtoHref(r))}">Send by email</a>` : "";
    return `
      ${headerHtml("Report saved")}
      <div class="fb-success${ui.saveFailed ? " fb-success-warn" : ""}">
        <span class="fb-success-icon" aria-hidden="true">${ui.saveFailed ? "!" : "✓"}</span>
        <div>
          <strong>${ui.saveFailed ? "Couldn't save it in this browser." : "Saved on this device."}</strong>
          <p>${ui.saveFailed
            ? "Storage is full or blocked, so copy or download the report now, before closing this window."
            : `Report <code>${esc(r.id)}</code> is in your saved reports.`}</p>
        </div>
      </div>
      <p class="fb-help">This site has no server, so a report stays in this browser until you pass it on. Copy it, download it${mail ? ", or send it by email" : ""}.</p>
      <div class="fb-actions">
        <button type="button" class="fb-btn fb-btn-primary" data-fb-act="copy">Copy report</button>
        <button type="button" class="fb-btn" data-fb-act="download">Download (.txt)</button>
        ${mail}
      </div>
      <p class="fb-notice" id="fbNotice" role="status" aria-live="polite"></p>
      <div class="fb-actions">
        <button type="button" class="fb-btn" data-fb-act="new">New report</button>
        <button type="button" class="fb-btn" data-fb-act="history">Saved reports</button>
      </div>
    `;
  }

  function reportHtml(r) {
    const when = new Date(r.createdAt).toLocaleString();
    const short = r.description.length > 90 ? r.description.slice(0, 90) + "…" : r.description;
    return `
      <details class="fb-report">
        <summary class="fb-report-summary">
          <span class="fb-badge fb-badge-${typeClass(r.type)}">${esc(typeLabel(r.type))}</span>
          <span class="fb-report-text">${esc(short)}</span>
          <span class="fb-report-date">${esc(when)}</span>
        </summary>
        <div class="fb-report-body">
          <pre class="fb-pre">${esc(formatReport(r))}</pre>
          <div class="fb-actions">
            <button type="button" class="fb-btn" data-fb-act="copy" data-id="${escAttr(r.id)}">Copy</button>
            <button type="button" class="fb-btn" data-fb-act="download" data-id="${escAttr(r.id)}">Download</button>
            <button type="button" class="fb-btn fb-btn-danger" data-fb-act="delete" data-id="${escAttr(r.id)}">Delete</button>
          </div>
        </div>
      </details>
    `;
  }

  function historyHtml() {
    const list = loadReports();
    const body = list.length === 0
      ? `<p class="fb-empty">${cloud() ? "Nothing is waiting to be sent." : "No saved reports yet. Reports you submit are kept here, on this device."}</p>`
      : `${cloud() ? '<p class="fb-help">These reports couldn\'t be sent yet. They go out automatically once you\'re online.</p>' : ""}
         <div class="fb-history-actions">
           ${cloud() ? '<button type="button" class="fb-btn fb-btn-primary" data-fb-act="retry-send">Send now</button>' : ""}
           <button type="button" class="fb-btn" data-fb-act="export-all">Export all (.json)</button>
           <button type="button" class="fb-btn fb-btn-danger" data-fb-act="clear-all">Clear all</button>
         </div>
         <div class="fb-history">${list.map(reportHtml).join("")}</div>`;
    return `${headerHtml("Saved reports")}<p class="fb-notice" id="fbNotice" role="status" aria-live="polite"></p>${body}`;
  }

  function render() {
    if (ui.view === "sent" && ui.lastReport) panel.innerHTML = sentHtml();
    else if (ui.view === "history") panel.innerHTML = historyHtml();
    else { ui.view = "form"; panel.innerHTML = formHtml(); }
    const heading = document.getElementById("feedbackTitle");
    if (heading) heading.focus();
  }

  function setNotice(msg) {
    const el = document.getElementById("fbNotice");
    if (el) el.textContent = msg;
  }

  /* ---------- Form handling ---------- */

  function captureDraft() {
    const form = document.getElementById("fbForm");
    if (!form) return;
    const t = form.querySelector('input[name="fbType"]:checked');
    ui.draft = {
      type: t ? t.value : "",
      description: form.querySelector("#fbDesc").value,
      contact: form.querySelector("#fbContact").value,
      include: form.querySelector("#fbInclude").checked,
    };
  }

  function showError(msg, focusEl) {
    const el = document.getElementById("fbError");
    if (el) { el.textContent = msg; el.classList.add("show"); }
    if (focusEl) focusEl.focus();
  }

  function clearError() {
    const el = document.getElementById("fbError");
    if (el) { el.textContent = ""; el.classList.remove("show"); }
  }

  function handleSubmit(form) {
    const typeEl = form.querySelector('input[name="fbType"]:checked');
    const descEl = form.querySelector("#fbDesc");
    const description = descEl.value.trim();
    descEl.removeAttribute("aria-invalid");

    if (!typeEl) {
      showError("Choose what kind of problem this is.", form.querySelector('input[name="fbType"]'));
      return;
    }
    if (!description) {
      descEl.setAttribute("aria-invalid", "true");
      showError("Please describe what happened.", descEl);
      return;
    }

    const trap = form.querySelector("#fbWebsite");
    if (trap && trap.value.trim()) {                 // a bot filled the hidden field: pretend it worked
      ui.lastReport = buildReport({ type: typeEl.value, description, contact: "", include: false });
      ui.draft = emptyDraft();
      ui.sentOnline = true; ui.sendFailed = false;
      ui.view = "sent";
      render();
      return;
    }

    const report = buildReport({
      type: typeEl.value,
      description,
      contact: form.querySelector("#fbContact").value.trim(),
      include: form.querySelector("#fbInclude").checked,
    });
    ui.lastReport = report;
    ui.draft = emptyDraft();
    ui.sentOnline = false; ui.sendFailed = false; ui.saveFailed = false;

    if (cloud()) { sendOrQueue(report); return; }

    const list = loadReports();
    list.unshift(report);
    ui.saveFailed = !saveReports(list);
    ui.view = "sent";
    render();
  }

  // Send to the site owner. Only if that fails is the report kept here (in the outbox) and retried.
  async function sendOrQueue(report) {
    const b = document.getElementById("fbSubmit");
    if (b) { b.disabled = true; b.textContent = "Sending…"; }
    try {
      await cloud().sendComplaint(report);
      ui.sentOnline = true;
    } catch (e) {
      // After a timeout we can't tell whether it arrived; remember that so a retry can't create a duplicate.
      report.maybeSent = !!(e && e.code === "csn/timeout");
      const list = loadReports();
      list.unshift(report);
      ui.saveFailed = !saveReports(list);
      ui.sendFailed = true;
      console.warn("[CS Notes] complaint not sent yet:", e);
    }
    ui.view = "sent";
    render();
  }

  let flushing = false;
  async function flushOutbox() {
    const c = cloud();
    if (!c || flushing || !c.ready() || navigator.onLine === false) return;
    flushing = true;
    try {
      let list = loadReports();
      const oldestFirst = list.slice().reverse();
      for (let i = 0; i < oldestFirst.length; i++) {
        const r = oldestFirst[i];
        try {
          await c.sendComplaint(r);
        } catch (e) {
          const alreadyThere = e && e.code === "permission-denied" && r.maybeSent;
          if (!alreadyThere) {
            if (e && e.code === "csn/timeout") r.maybeSent = true;
            saveReports(list);
            break;
          }
        }
        list = list.filter(x => x.id !== r.id);
        saveReports(list);
      }
    } finally {
      flushing = false;
      if (overlay.classList.contains("visible") && (ui.view === "history" || ui.view === "sent")) render();
    }
  }

  function handleAction(el) {
    const action = el.dataset.fbAct;
    const id = el.dataset.id;
    const reports = loadReports();
    const target = id ? reports.find(r => r.id === id) : ui.lastReport;

    if (action === "new") { ui.view = "form"; ui.sentOnline = false; ui.sendFailed = false; render(); return; }
    if (action === "retry-send") {
      setNotice("Sending…");
      flushOutbox().then(() => {
        if (loadReports().length === 0) {
          if (ui.view === "sent" && ui.sendFailed) { ui.sendFailed = false; ui.sentOnline = true; }
          render();
        } else {
          setNotice("Still couldn't send. It will keep trying automatically.");
        }
      });
      return;
    }
    if (action === "history") { ui.view = "history"; render(); return; }

    if (action === "copy" && target) {
      copyText(formatReport(target)).then(ok =>
        setNotice(ok ? "Copied to clipboard." : "Couldn't copy automatically. Try Download instead."));
      return;
    }
    if (action === "download" && target) {
      try {
        download("cs-notes-report-" + target.id + ".txt", formatReport(target), "text/plain");
        setNotice("Download started.");
      } catch (e) {
        setNotice("Couldn't start the download. Try Copy instead.");
      }
      return;
    }
    if (action === "export-all") {
      try {
        download("cs-notes-reports.json", JSON.stringify(reports, null, 2), "application/json");
        setNotice("Download started.");
      } catch (e) {
        setNotice("Couldn't start the download.");
      }
      return;
    }
    if (action === "delete" && target) {
      if (confirm("Delete this saved report?")) {
        saveReports(reports.filter(r => r.id !== id));
        render();
      }
      return;
    }
    if (action === "clear-all") {
      if (confirm("Delete all " + reports.length + " saved reports? This can't be undone.")) {
        saveReports([]);
        render();
      }
    }
  }

  /* ---------- Open / close + keyboard ---------- */

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const title = document.getElementById("feedbackTitle");
    const active = document.activeElement;
    const inside = panel.contains(active);
    // The heading takes focus on each screen but isn't in the tab list, so
    // Shift+Tab from it (or from outside the dialog) must wrap too.
    if (e.shiftKey && (active === first || active === title || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  }

  function open() {
    lastFocused = document.activeElement;
    ui.view = "form";
    ui.sentOnline = false;
    ui.sendFailed = false;
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", trapFocus);
    render();
  }

  function close() {
    captureDraft();
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", trapFocus);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    lastFocused = null;
  }

  document.addEventListener("csn:cloud-ready", flushOutbox);
  window.addEventListener("online", flushOutbox);

  btn.addEventListener("click", open);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("visible")) close();
  });

  panel.addEventListener("click", e => {
    if (e.target.closest("#fbCloseBtn")) { close(); return; }
    const tab = e.target.closest("[data-fb-view]");
    if (tab) { captureDraft(); ui.view = tab.dataset.fbView; render(); return; }
    const act = e.target.closest("[data-fb-act]");
    if (act) handleAction(act);
  });

  panel.addEventListener("submit", e => {
    if (e.target.id === "fbForm") {
      e.preventDefault();
      handleSubmit(e.target);
    }
  });

  panel.addEventListener("input", e => {
    if (e.target.id === "fbDesc") {
      const count = document.getElementById("fbCount");
      if (count) count.textContent = e.target.value.length + " / " + MAX_LEN;
      e.target.removeAttribute("aria-invalid");
      clearError();
    }
  });

  panel.addEventListener("change", e => {
    if (e.target.name === "fbType") clearError();
  });
})();
