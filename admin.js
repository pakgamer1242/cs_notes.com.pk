/* ---------------------------------------------------------
   Complaints panel (admin only).

   It appears as a "Complaints panel" button in your account card,
   and only if your account is listed in the Firestore "admins"
   collection (see SETUP-FIREBASE.md). The security rules, not this
   file, are what actually keep everyone else out.

   Works like a small database view: sort by any column, filter by
   status/type/text, select several rows for bulk changes, open a
   report to read everything and add a note, delete, and export.

   Everything shown here was typed by strangers, so every value is
   escaped before it is shown and spreadsheet-formula characters are
   neutralised in the CSV export.
--------------------------------------------------------- */
(function () {
  "use strict";

  if (!window.CSNCloud) return;
  const cloud = window.CSNCloud;

  const PAGE_SIZE = 200;

  const STATUSES = [
    { value: "new", label: "New" },
    { value: "in-progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ];
  const STATUS_VALUES = STATUSES.map(s => s.value);
  const statusLabel = v => { const s = STATUSES.find(x => x.value === v); return s ? s.label : "New"; };
  const statusRank = v => Math.max(0, STATUS_VALUES.indexOf(v));

  const TYPES = {
    compatibility: "Not working on my device",
    display: "Something looks wrong",
    content: "Wrong or unclear content",
    suggestion: "Idea or suggestion",
    other: "Something else",
  };
  const typeLabel = v => TYPES[v] || "Something else";
  const cls = v => String(v).replace(/[^a-z]/g, "") || "other";

  // Sortable columns. words[0] describes the field's default direction.
  const FIELDS = {
    receivedMs: { label: "Date", num: true, get: r => r.receivedMs, dir: "desc", words: ["newest first", "oldest first"] },
    type: { label: "Type", get: r => typeLabel(r.type), dir: "asc", words: ["A–Z", "Z–A"] },
    status: { label: "Status", num: true, get: r => statusRank(r.status), dir: "asc", words: ["new first", "dismissed first"] },
    page: { label: "Page", get: r => r.page, dir: "asc", words: ["A–Z", "Z–A"] },
    device: { label: "Device", get: r => r.device, dir: "asc", words: ["A–Z", "Z–A"] },
  };

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? "" : s));
  const escAttr = s => esc(s).replace(/"/g, "&quot;");

  let overlay = null, panel = null, lastFocus = null;
  let rows = [];
  let hasMore = false;
  let loading = false;
  let loadSeq = 0;
  let detailId = null;
  const selected = new Set();
  const view = { sortKey: "receivedMs", sortDir: "desc", status: "all", type: "all", q: "" };

  /* ---------- Turning stored documents into rows ---------- */

  function deviceLabel(env) {
    if (!env) return "";
    const ua = String(env.browser || "");
    let b = "Other";
    if (/Edg\//.test(ua)) b = "Edge";
    else if (/OPR\/|Opera/.test(ua)) b = "Opera";
    else if (/SamsungBrowser/.test(ua)) b = "Samsung Internet";
    else if (/Firefox\/|FxiOS/.test(ua)) b = "Firefox";
    else if (/Chrome\/|CriOS/.test(ua)) b = "Chrome";
    else if (/Safari\//.test(ua)) b = "Safari";
    let os = "Other";
    if (/Windows/.test(ua)) os = "Windows";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
    else if (/CrOS/.test(ua)) os = "ChromeOS";
    else if (/Linux/.test(ua)) os = "Linux";
    return b + " on " + os;
  }

  const plainMap = m => {
    if (!m || typeof m !== "object" || Array.isArray(m)) return null;
    const out = {};
    Object.keys(m).slice(0, 40).forEach(k => { out[String(k).slice(0, 60)] = String(m[k] == null ? "" : m[k]).slice(0, 400); });
    return out;
  };

  function normalize(d) {
    const page = plainMap(d.page);
    const env = plainMap(d.env);
    const r = {
      docId: String(d.docId || ""),
      id: String(d.id || d.docId || ""),
      type: Object.prototype.hasOwnProperty.call(TYPES, d.type) ? d.type : "other",
      status: STATUS_VALUES.indexOf(d.status) !== -1 ? d.status : "new",
      description: String(d.description || ""),
      contact: String(d.contact || ""),
      adminNote: String(d.adminNote || ""),
      receivedMs: Number(d.receivedMs) || Date.parse(d.createdAt) || 0,
      createdAt: String(d.createdAt || ""),
      page: page ? [page.section, page.unit, page.topic].filter(Boolean).join(" › ") : "",
      env: env,
      features: plainMap(d.features),
    };
    r.device = deviceLabel(env);
    r.search = [r.id, r.description, r.contact, r.page, r.device, r.adminNote, typeLabel(r.type), statusLabel(r.status)].join(" ").toLowerCase();
    return r;
  }

  const fmtDate = ms => ms ? new Date(ms).toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  /* ---------- Sorting + filtering (like a query on the loaded rows) ---------- */

  function visibleList() {
    const q = view.q.trim().toLowerCase();
    const list = rows.filter(r =>
      (view.status === "all" || r.status === view.status) &&
      (view.type === "all" || r.type === view.type) &&
      (!q || r.search.indexOf(q) !== -1));
    const f = FIELDS[view.sortKey];
    const m = view.sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const c = f.num ? f.get(a) - f.get(b) : String(f.get(a)).localeCompare(String(f.get(b)));
      return (c * m) || (b.receivedMs - a.receivedMs);
    });
    return list;
  }

  const rowById = id => rows.find(r => r.docId === id);

  /* ---------- Rendering ---------- */

  function sortOptionsHtml() {
    return Object.keys(FIELDS).map(k => {
      const f = FIELDS[k];
      const other = f.dir === "asc" ? "desc" : "asc";
      return [[f.dir, f.words[0]], [other, f.words[1]]].map(p => {
        const val = k + ":" + p[0];
        return `<option value="${val}"${view.sortKey === k && view.sortDir === p[0] ? " selected" : ""}>${esc(f.label)}: ${esc(p[1])}</option>`;
      }).join("");
    }).join("");
  }

  const statusOptions = (current, allLabel) =>
    (allLabel ? `<option value="all"${current === "all" ? " selected" : ""}>${esc(allLabel)}</option>` : "") +
    STATUSES.map(s => `<option value="${s.value}"${current === s.value ? " selected" : ""}>${esc(s.label)}</option>`).join("");

  function shellHtml() {
    const typeOpts = `<option value="all">All types</option>` +
      Object.keys(TYPES).map(k => `<option value="${k}">${esc(TYPES[k])}</option>`).join("");
    return `
      <div class="adm-head">
        <div class="adm-titlebox">
          <h2 class="study-title" id="admTitle" tabindex="-1">Complaints</h2>
          <span class="adm-count" id="admCount"></span>
        </div>
        <div class="adm-head-actions">
          <button type="button" class="fb-btn" data-adm="refresh">Refresh</button>
          <button type="button" class="fb-btn" data-adm="export-csv">Export CSV</button>
          <button type="button" class="fb-btn" data-adm="export-json">Export JSON</button>
          <button type="button" class="study-close-btn" data-adm="close" aria-label="Close">&times;</button>
        </div>
      </div>
      <div class="adm-chips" id="admChips" role="group" aria-label="Filter by status"></div>
      <div class="adm-filters">
        <div class="adm-field adm-field-grow"><label class="fb-label" for="admSearch">Search</label>
          <input class="fb-input" id="admSearch" type="search" autocomplete="off" placeholder="Words, email, page, device…" value="${escAttr(view.q)}"></div>
        <div class="adm-field adm-field-status"><label class="fb-label" for="admStatusFilter">Status</label>
          <select class="study-select" id="admStatusFilter">${statusOptions(view.status, "All statuses")}</select></div>
        <div class="adm-field"><label class="fb-label" for="admTypeFilter">Type</label>
          <select class="study-select" id="admTypeFilter">${typeOpts}</select></div>
        <div class="adm-field"><label class="fb-label" for="admSort">Sort by</label>
          <select class="study-select" id="admSort">${sortOptionsHtml()}</select></div>
        <button type="button" class="fb-btn adm-clear" data-adm="clear-filters">Clear filters</button>
      </div>
      <details class="adm-insights"><summary>Compatibility insights</summary><div id="admInsights"></div></details>
      <div id="admBulk" class="adm-bulk" role="region" aria-label="Bulk actions"></div>
      <p class="adm-status-line" id="admMsg" role="status" aria-live="polite"></p>
      <div class="adm-split">
        <div class="adm-body" id="admBody"></div>
        <aside class="adm-detail" id="admDetail" aria-label="Report details" hidden></aside>
      </div>`;
  }

  function renderChips() {
    const el = $("admChips");
    if (!el) return;
    const count = v => rows.filter(r => r.status === v).length;
    el.innerHTML =
      `<button type="button" class="adm-chip${view.status === "all" ? " active" : ""}" data-chip="all" aria-pressed="${view.status === "all"}">All <b>${rows.length}</b></button>` +
      STATUSES.map(s => `<button type="button" class="adm-chip adm-chip-${cls(s.value)}${view.status === s.value ? " active" : ""}" data-chip="${s.value}" aria-pressed="${view.status === s.value}">${esc(s.label)} <b>${count(s.value)}</b></button>`).join("");
  }

  function rowHtml(r) {
    const sel = selected.has(r.docId);
    const short = r.description.length > 110 ? r.description.slice(0, 110) + "…" : r.description;
    return `
      <tr class="adm-row adm-row-${cls(r.status)}${sel ? " is-selected" : ""}${r.docId === detailId ? " is-open" : ""}" data-doc="${escAttr(r.docId)}">
        <td class="adm-col-check"><input type="checkbox" data-sel="${escAttr(r.docId)}" aria-label="Select report ${escAttr(r.id)}"${sel ? " checked" : ""}></td>
        <td data-label="Date">${esc(fmtDate(r.receivedMs))}</td>
        <td data-label="Type"><span class="fb-badge fb-badge-${cls(r.type)}">${esc(typeLabel(r.type))}</span></td>
        <td data-label="Status"><span class="adm-status adm-status-${cls(r.status)}">${esc(statusLabel(r.status))}</span></td>
        <td data-label="Page">${esc(r.page || "—")}</td>
        <td data-label="Report"><button type="button" class="adm-open" data-open="${escAttr(r.docId)}">${esc(short)}</button></td>
        <td data-label="Device">${esc(r.device || "—")}</td>
      </tr>`;
  }

  function tableHtml(list) {
    if (!list.length) {
      return `<p class="adm-empty">${loading ? "Loading…" : rows.length ? "No reports match these filters." : "No complaints yet."}</p>`;
    }
    const th = (key, label) => {
      const on = view.sortKey === key;
      const aria = on ? (view.sortDir === "asc" ? "ascending" : "descending") : "none";
      return `<th scope="col" aria-sort="${aria}"><button type="button" class="adm-sort" data-sort="${key}">${esc(label)}</button></th>`;
    };
    return `
      <table class="adm-table">
        <caption class="visually-hidden">Complaints</caption>
        <thead><tr>
          <th scope="col" class="adm-col-check"><input type="checkbox" id="admAll" aria-label="Select all shown reports"></th>
          ${th("receivedMs", "Date")}${th("type", "Type")}${th("status", "Status")}${th("page", "Page")}
          <th scope="col">Report</th>${th("device", "Device")}
        </tr></thead>
        <tbody>${list.map(rowHtml).join("")}</tbody>
      </table>
      ${hasMore ? `<div class="adm-more"><button type="button" class="fb-btn" data-adm="load-more">Load older reports</button></div>` : ""}`;
  }

  function syncSelectAll(list) {
    const all = $("admAll");
    if (!all) return;
    const n = list.filter(r => selected.has(r.docId)).length;
    all.checked = list.length > 0 && n === list.length;
    all.indeterminate = n > 0 && n < list.length;
  }

  function renderBody() {
    const body = $("admBody");
    if (!body) return;
    const list = visibleList();
    body.innerHTML = tableHtml(list);
    syncSelectAll(list);
    const count = $("admCount");
    if (count) count.textContent = rows.length ? `${list.length} shown of ${rows.length} loaded` : "";
    renderBulk();
  }

  function renderBulk() {
    const el = $("admBulk");
    if (!el) return;
    const n = selected.size;
    if (!n) { el.innerHTML = ""; el.classList.remove("show"); return; }
    el.classList.add("show");
    el.innerHTML = `
      <span><b>${n}</b> selected</span>
      <label class="adm-inline"><span>Mark as</span>
        <select class="study-select" id="admBulkStatus" aria-label="New status for selected reports">${statusOptions("resolved", "")}</select></label>
      <button type="button" class="fb-btn fb-btn-primary" data-adm="bulk-apply">Apply</button>
      <button type="button" class="fb-btn fb-btn-danger" data-adm="bulk-delete">Delete</button>
      <button type="button" class="fb-btn" data-adm="bulk-clear">Clear selection</button>`;
  }

  function kv(map, colour) {
    if (!map || !Object.keys(map).length) return `<p class="adm-muted">None recorded.</p>`;
    return `<dl class="fb-kv">${Object.keys(map).map(k =>
      `<dt>${esc(k)}</dt><dd${colour ? ` class="fb-feat-${cls(map[k])}"` : ""}>${esc(map[k])}</dd>`).join("")}</dl>`;
  }

  function renderDetail() {
    const el = $("admDetail");
    if (!el) return;
    const r = detailId && rowById(detailId);
    if (!r) { detailId = null; el.hidden = true; el.innerHTML = ""; return; }
    const list = visibleList();
    const idx = list.findIndex(x => x.docId === r.docId);
    el.hidden = false;
    el.innerHTML = `
      <div class="adm-detail-head">
        <h3 id="admDetailTitle" tabindex="-1">Report ${esc(r.id)}</h3>
        <button type="button" class="fb-btn" data-adm="detail-close">Close</button>
      </div>
      <dl class="adm-meta">
        <dt>Received</dt><dd>${esc(fmtDate(r.receivedMs))}</dd>
        <dt>Type</dt><dd>${esc(typeLabel(r.type))}</dd>
        <dt>Page</dt><dd>${esc(r.page || "Not included")}</dd>
        <dt>Contact</dt><dd>${esc(r.contact || "None given")}</dd>
        <dt>Device</dt><dd>${esc(r.device || "Not included")}</dd>
      </dl>
      <h4>What happened</h4>
      <p class="adm-desc">${esc(r.description)}</p>
      <h4>Device and browser</h4>${kv(r.env, false)}
      <h4>Feature support</h4>${kv(r.features, true)}
      <h4>Manage</h4>
      <div class="adm-field"><label class="fb-label" for="admDetailStatus">Status</label>
        <select class="study-select" id="admDetailStatus">${statusOptions(r.status, "")}</select></div>
      <div class="adm-field"><label class="fb-label" for="admDetailNote">Your note <span class="fb-opt">only you can see it</span></label>
        <textarea class="fb-textarea" id="admDetailNote" rows="4" maxlength="2000">${esc(r.adminNote)}</textarea></div>
      <div class="fb-actions">
        <button type="button" class="fb-btn fb-btn-primary" data-adm="detail-save">Save</button>
        <button type="button" class="fb-btn" data-adm="detail-prev"${idx <= 0 ? " disabled" : ""}>Previous</button>
        <button type="button" class="fb-btn" data-adm="detail-next"${idx === -1 || idx >= list.length - 1 ? " disabled" : ""}>Next</button>
        <button type="button" class="fb-btn fb-btn-danger" data-adm="detail-delete">Delete</button>
      </div>`;
  }

  function tally(items) {
    const t = {};
    items.forEach(x => { t[x] = (t[x] || 0) + 1; });
    return Object.keys(t).map(k => [k, t[k]]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function renderInsights() {
    const el = $("admInsights");
    if (!el) return;
    const open = rows.filter(r => r.status === "new" || r.status === "in-progress");
    const devices = tally(open.filter(r => r.device).map(r => r.device)).slice(0, 8);
    const feats = {};
    open.forEach(r => { if (r.features) Object.keys(r.features).forEach(k => { if (r.features[k] === "no") feats[k] = (feats[k] || 0) + 1; }); });
    const featList = Object.keys(feats).map(k => [k, feats[k]]).sort((a, b) => b[1] - a[1]);
    const table = (list, empty) => list.length
      ? `<table class="adm-mini">${list.map(p => `<tr><td>${esc(p[0])}</td><td>${p[1]}</td></tr>`).join("")}</table>`
      : `<p class="adm-muted">${empty}</p>`;
    el.innerHTML = `
      <p class="adm-muted">Based on the ${open.length} report${open.length === 1 ? "" : "s"} that are new or in progress.</p>
      <div class="adm-insight-grid">
        <div><h4>Devices reporting problems</h4>${table(devices, "No device details yet.")}</div>
        <div><h4>Features reported as unsupported</h4>${table(featList, "None reported.")}</div>
      </div>`;
  }

  function renderAll() {
    renderChips();
    renderBody();
    renderDetail();
    renderInsights();
  }

  function say(msg, isError) {
    const el = $("admMsg");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }

  /* ---------- Loading and changing data ---------- */

  async function load(more) {
    if (loading) return;
    loading = true;
    const seq = ++loadSeq;
    say(more ? "Loading older reports…" : "Loading…");
    if (!more) renderBody();
    try {
      const after = more && rows.length ? Math.min.apply(null, rows.map(r => r.receivedMs)) : 0;
      const docs = await cloud.admin.list(PAGE_SIZE, after);
      if (seq !== loadSeq || !overlay || !overlay.classList.contains("visible")) return;
      const fresh = docs.map(normalize);
      if (more) {
        const have = {};
        rows.forEach(r => { have[r.docId] = 1; });
        fresh.forEach(r => { if (!have[r.docId]) rows.push(r); });
      } else {
        rows = fresh;
        selected.clear();
        if (detailId && !rowById(detailId)) detailId = null;
      }
      hasMore = docs.length >= PAGE_SIZE;
      say(rows.length ? "" : "No complaints yet.");
    } catch (e) {
      say(cloud.friendlyError(e), true);
    } finally {
      loading = false;
      if (overlay && overlay.classList.contains("visible")) renderAll();
    }
  }

  // Run the same change on several reports; report how many worked.
  async function applyToMany(ids, change) {
    let done = 0, failed = 0, lastError = null;
    for (let i = 0; i < ids.length; i += 10) {
      const results = await Promise.all(ids.slice(i, i + 10).map(id =>
        change(id).then(() => ({ ok: true, id }), e => ({ ok: false, id, e }))));
      results.forEach(r => { if (r.ok) done++; else { failed++; lastError = r.e; } });
    }
    return { done, failed, lastError };
  }

  async function setStatus(ids, status, note) {
    say("Saving…");
    const patch = { status };
    if (note !== undefined) patch.adminNote = note;
    const res = await applyToMany(ids, id => cloud.admin.update(id, patch));
    ids.forEach(id => {
      const r = rowById(id);
      if (r) {
        r.status = status;
        if (note !== undefined) r.adminNote = note;
        r.search = [r.id, r.description, r.contact, r.page, r.device, r.adminNote, typeLabel(r.type), statusLabel(r.status)].join(" ").toLowerCase();
      }
    });
    if (res.failed) say(`${res.done} saved, ${res.failed} failed: ${cloud.friendlyError(res.lastError)}`, true);
    else say(res.done === 1 ? "Saved." : `${res.done} reports updated.`);
    renderAll();
  }

  async function removeMany(ids) {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} report${ids.length === 1 ? "" : "s"} permanently? This can't be undone.`)) return;
    say("Deleting…");
    try {
      await cloud.admin.remove(ids);
      const gone = {};
      ids.forEach(id => { gone[id] = 1; selected.delete(id); });
      rows = rows.filter(r => !gone[r.docId]);
      if (detailId && gone[detailId]) detailId = null;
      say(ids.length === 1 ? "Deleted." : `${ids.length} reports deleted.`);
    } catch (e) {
      say(cloud.friendlyError(e), true);
    }
    renderAll();
  }

  /* ---------- Export ---------- */

  function csvCell(v) {
    let s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;       // stops a spreadsheet running pasted formulas
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function toCsv(list) {
    const head = ["id", "received", "status", "type", "page", "contact", "description", "admin_note", "device", "browser", "platform", "screen", "window", "language", "unsupported_features"];
    const lines = [head.join(",")];
    list.forEach(r => {
      const e = r.env || {};
      const unsupported = r.features ? Object.keys(r.features).filter(k => r.features[k] === "no").join("; ") : "";
      lines.push([r.id, r.receivedMs ? new Date(r.receivedMs).toISOString() : "", r.status, typeLabel(r.type), r.page, r.contact,
        r.description, r.adminNote, r.device, e.browser, e.platform, e.screen, e.window, e.language, unsupported].map(csvCell).join(","));
    });
    return "\uFEFF" + lines.join("\r\n");
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

  function exportRows(kind) {
    const list = visibleList();
    if (!list.length) { say("Nothing to export with the current filters."); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      if (kind === "csv") {
        download(`complaints-${stamp}.csv`, toCsv(list), "text/csv");
      } else {
        const out = list.map(r => ({
          id: r.id, received: r.receivedMs ? new Date(r.receivedMs).toISOString() : "", status: r.status, type: r.type,
          page: r.page, contact: r.contact, description: r.description, adminNote: r.adminNote, env: r.env, features: r.features,
        }));
        download(`complaints-${stamp}.json`, JSON.stringify(out, null, 2), "application/json");
      }
      say(`Exported ${list.length} report${list.length === 1 ? "" : "s"}.`);
    } catch (e) {
      say("Couldn't start the download.", true);
    }
  }

  /* ---------- Opening, closing, wiring ---------- */

  function openDetail(docId) {
    detailId = docId;
    renderBody();
    renderDetail();
    const h = $("admDetailTitle");
    if (h) h.focus();
  }

  function closeDetail() {
    const id = detailId;
    detailId = null;
    renderBody();
    renderDetail();
    const safe = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id || "") : String(id || "").replace(/[^A-Za-z0-9_-]/g, "");
    const btn = id && panel.querySelector(`[data-open="${safe}"]`);
    if (btn) btn.focus();
  }

  function moveDetail(step) {
    const list = visibleList();
    const i = list.findIndex(r => r.docId === detailId);
    const next = list[i + step];
    if (next) openDetail(next.docId);
  }

  function ensurePanel() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "study-overlay";
    overlay.id = "admOverlay";
    overlay.setAttribute("aria-hidden", "true");
    panel = document.createElement("div");
    panel.className = "study-panel adm-panel";
    panel.id = "admPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "admTitle");
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    panel.addEventListener("click", onClick);
    panel.addEventListener("change", onChange);
    panel.addEventListener("input", onInput);
  }

  function open() {
    if (!cloud.isAdmin()) return;
    ensurePanel();
    lastFocus = document.activeElement;
    detailId = null;
    selected.clear();
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.removeEventListener("keydown", onKeydown);
    document.addEventListener("keydown", onKeydown);
    panel.innerHTML = shellHtml();
    const t = $("admTypeFilter");
    if (t) t.value = view.type;
    renderAll();
    const h = $("admTitle");
    if (h) h.focus();
    load(false);
  }

  function close() {
    if (!overlay || !overlay.classList.contains("visible")) return;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown);
    rows = [];                 // don't keep other people's reports in memory once the panel is shut
    selected.clear();
    detailId = null;
    loadSeq++;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      if (detailId) closeDetail(); else close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const title = $("admTitle");
    const active = document.activeElement;
    const inside = panel.contains(active);
    if (e.shiftKey && (active === first || active === title || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  function setSort(key, dir) {
    view.sortKey = key;
    view.sortDir = dir;
    const sel = $("admSort");
    if (sel) sel.value = key + ":" + dir;
  }

  function onClick(e) {
    const chip = e.target.closest("[data-chip]");
    if (chip) {
      view.status = chip.dataset.chip;
      const sel = $("admStatusFilter");
      if (sel) sel.value = view.status;
      renderChips(); renderBody();
      return;
    }
    const sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      const key = sortBtn.dataset.sort;
      if (view.sortKey === key) setSort(key, view.sortDir === "asc" ? "desc" : "asc");
      else setSort(key, FIELDS[key].dir);
      renderBody();
      const again = panel.querySelector(`[data-sort="${key}"]`);
      if (again) again.focus();
      return;
    }
    const openBtn = e.target.closest("[data-open]");
    if (openBtn) { openDetail(openBtn.dataset.open); return; }

    const btn = e.target.closest("[data-adm]");
    if (!btn) return;
    const a = btn.dataset.adm;
    if (a === "close") close();
    else if (a === "refresh") load(false);
    else if (a === "load-more") load(true);
    else if (a === "export-csv") exportRows("csv");
    else if (a === "export-json") exportRows("json");
    else if (a === "clear-filters") {
      view.status = "all"; view.type = "all"; view.q = "";
      setSort("receivedMs", "desc");
      const s = $("admSearch"), st = $("admStatusFilter"), ty = $("admTypeFilter");
      if (s) s.value = ""; if (st) st.value = "all"; if (ty) ty.value = "all";
      renderChips(); renderBody();
    }
    else if (a === "bulk-clear") { selected.clear(); renderBody(); }
    else if (a === "bulk-apply") { const s = $("admBulkStatus"); if (s) setStatus(Array.from(selected), s.value); }
    else if (a === "bulk-delete") removeMany(Array.from(selected));
    else if (a === "detail-close") closeDetail();
    else if (a === "detail-prev") moveDetail(-1);
    else if (a === "detail-next") moveDetail(1);
    else if (a === "detail-delete") { if (detailId) removeMany([detailId]); }
    else if (a === "detail-save") {
      if (!detailId) return;
      const status = $("admDetailStatus").value;
      const note = $("admDetailNote").value.trim();
      setStatus([detailId], status, note);
    }
  }

  function onChange(e) {
    const t = e.target;
    if (t.id === "admStatusFilter") { view.status = t.value; renderChips(); renderBody(); }
    else if (t.id === "admTypeFilter") { view.type = t.value; renderBody(); }
    else if (t.id === "admSort") { const p = t.value.split(":"); setSort(p[0], p[1]); renderBody(); }
    else if (t.id === "admAll") {
      visibleList().forEach(r => { if (t.checked) selected.add(r.docId); else selected.delete(r.docId); });
      renderBody();
    }
    else if (t.dataset && t.dataset.sel) {
      if (t.checked) selected.add(t.dataset.sel); else selected.delete(t.dataset.sel);
      const row = t.closest("tr");
      if (row) row.classList.toggle("is-selected", t.checked);
      syncSelectAll(visibleList());
      renderBulk();
    }
  }

  function onInput(e) {
    if (e.target.id === "admSearch") { view.q = e.target.value; renderBody(); }
  }

  document.addEventListener("click", e => {
    if (e.target.closest('[data-acct="admin"]')) {
      if (typeof closeProfileSwitcher === "function") closeProfileSwitcher();
      open();
    }
  });

  // Signed out, or no longer an admin: shut the panel and forget the data.
  document.addEventListener("csn:admin-changed", () => { if (!cloud.isAdmin()) close(); });
})();