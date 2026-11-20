/* ---------------------------------------------------------
   Phone layout behaviour.

   On phones (and phones held sideways) the page becomes:
     top bar         logo, the current page's title, search, your profile
     bottom bar      Home, Browse (the unit menu), Study, More
     search          opens full screen
     dialogs         slide up as sheets; drag the top down to close
     More            share this page, print, the complaint box

   Everything here is reached through the existing buttons and functions
   (Study, the menu, the complaint box...), so each feature still lives
   in one place. This file only runs if style.css is new enough: with an
   old stylesheet it does nothing and the existing layout is left alone.
--------------------------------------------------------- */
(function () {
  "use strict";

  const cssVersion = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--csn-ui"), 10) || 0;
  if (cssVersion < 5 || typeof SECTIONS === "undefined") return;

  const PHONE = "(max-width: 760px), (max-height: 500px) and (pointer: coarse)";
  const mq = window.matchMedia(PHONE);
  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? "" : s));
  const reduced = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // style.css is new enough: reveal the phone-only parts (CSS shows them on phones only)
  document.querySelectorAll(".m-only").forEach(el => { el.hidden = false; });
  document.body.classList.add("m-ready");

  /* ---------- Top bar title ---------- */

  function setTitle(info) {
    const e = $("mEyebrow"), h = $("mHeading");
    if (e) e.textContent = info.eyebrow;
    if (h) h.textContent = info.title;
    document.body.classList.toggle("m-reading", !!info.reading);
  }

  function currentInfo() {
    return window.CSNPage ? window.CSNPage.info() : { eyebrow: "CS Notes", title: SECTIONS[state.section].label, reading: !!state.activeTopic, section: state.section };
  }

  /* ---------- Bottom bar: which item is lit ---------- */

  let moreOpen = false;
  const studyOpen = () => { const o = $("studyOverlay"); return !!(o && o.classList.contains("visible")); };

  function syncActive() {
    const drawer = document.body.classList.contains("drawer-open");
    const reading = document.body.classList.contains("m-reading");
    const flags = { home: !reading && !drawer && !studyOpen() && !moreOpen, browse: drawer || (reading && !studyOpen() && !moreOpen), study: studyOpen(), more: moreOpen };
    document.querySelectorAll("#mNav .m-nav-item").forEach(b => {
      const on = !!flags[b.dataset.m];
      b.classList.toggle("active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    const info = currentInfo();
    document.querySelectorAll(".m-sections [data-sec]").forEach(b => {
      const on = b.dataset.sec === info.section;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  /* ---------- Section switcher at the top of the menu ---------- */

  const sidebar = $("sidebar"), tree = $("sidebarTree");
  if (sidebar && tree) {
    const seg = document.createElement("div");
    seg.className = "m-sections m-only";
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", "Section");
    seg.innerHTML = Object.keys(SECTIONS).map(k => '<button type="button" data-sec="' + esc(k) + '">' + esc(SECTIONS[k].label) + "</button>").join("");
    sidebar.insertBefore(seg, tree);
    seg.addEventListener("click", e => {
      const b = e.target.closest("[data-sec]");
      if (!b) return;
      const wasOpen = document.body.classList.contains("drawer-open");
      switchSection(b.dataset.sec);
      // switching section normally closes the menu; here you are about to pick a topic from the new section, so keep it open
      if (wasOpen && !document.body.classList.contains("drawer-open")) $("toggleSidebarBtn").click();
    });
  }

  /* ---------- Search (full screen) ---------- */

  const navSearch = document.querySelector(".navbar-search");
  if (navSearch) {
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "m-search-cancel";
    cancel.hidden = true;                       // shown by the phone stylesheet while search is open; hidden on any other screen
    cancel.textContent = "Cancel";
    navSearch.appendChild(cancel);
    const hint = document.createElement("p");
    hint.className = "m-search-hint";
    hint.hidden = true;
    hint.textContent = "Search every topic in all three sections, for example \u201cdynamic programming\u201d.";
    navSearch.appendChild(hint);
    cancel.addEventListener("click", closeSearch);
  }

  function openSearch() {
    if (document.body.classList.contains("drawer-open")) $("toggleSidebarBtn").click();
    document.body.classList.add("m-search-open");
    const i = $("searchInput");
    if (i) i.focus();
  }

  function closeSearch() {
    if (!document.body.classList.contains("m-search-open")) return;
    document.body.classList.remove("m-search-open");
    const i = $("searchInput");
    if (i) { i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); i.blur(); }
  }

  /* ---------- The More sheet ---------- */

  let moreOverlay = null, morePanel = null, moreFocus = null;

  function toast(msg) {
    const t = $("mToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function ensureMore() {
    if (moreOverlay) return;
    moreOverlay = document.createElement("div");
    moreOverlay.className = "study-overlay";
    moreOverlay.id = "mMoreOverlay";
    moreOverlay.setAttribute("aria-hidden", "true");
    morePanel = document.createElement("div");
    morePanel.className = "study-panel m-more-panel";
    morePanel.setAttribute("role", "dialog");
    morePanel.setAttribute("aria-modal", "true");
    morePanel.setAttribute("aria-labelledby", "mMoreTitle");
    const ic = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>";
    morePanel.innerHTML =
      '<div class="study-header"><h2 class="study-title" id="mMoreTitle" tabindex="-1">More</h2>' +
      '<button class="study-close-btn" type="button" data-m="close" aria-label="Close">&times;</button></div>' +
      '<div class="m-list">' +
        '<button type="button" class="m-list-item" data-m="share">' + ic('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>') + '<span><b>Share this page</b><small>Send a link to what you are reading</small></span></button>' +
        (window.CSNPrint ? '<button type="button" class="m-list-item" data-m="print">' + ic('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>') + '<span><b>Print notes</b><small>One topic, a whole unit, or topics you pick</small></span></button>' : "") +
        '<button type="button" class="m-list-item" data-m="complaint">' + ic('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>') + '<span><b>Complaint box</b><small>Report a problem or suggest an improvement</small></span></button>' +
      "</div>";
    moreOverlay.appendChild(morePanel);
    document.body.appendChild(moreOverlay);
    moreOverlay.addEventListener("click", e => { if (e.target === moreOverlay) closeMore(); });
    morePanel.addEventListener("click", onMoreClick);
  }

  function openMore() {
    ensureMore();
    moreFocus = document.activeElement;
    moreOpen = true;
    moreOverlay.classList.add("visible");
    moreOverlay.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onMoreKey);
    syncActive();
    const t = $("mMoreTitle");
    if (t) t.focus();
  }

  function closeMore(restoreFocus) {
    if (!moreOpen) return;
    moreOpen = false;
    moreOverlay.classList.remove("visible");
    moreOverlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onMoreKey);
    syncActive();
    if (restoreFocus !== false && moreFocus && typeof moreFocus.focus === "function") moreFocus.focus();
    moreFocus = null;
  }

  function onMoreKey(e) {
    if (e.key === "Escape") { closeMore(); return; }
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(morePanel);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1], title = $("mMoreTitle");
    const cur = document.activeElement, inside = morePanel.contains(cur);
    if (e.shiftKey && (cur === first || cur === title || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (cur === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  async function sharePage() {
    const url = location.href;
    const title = document.title;
    if (navigator.share) {
      try { await navigator.share({ title: title, url: url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied"); }
    catch (e) { toast("Couldn't copy the link"); }
  }

  function onMoreClick(e) {
    const b = e.target.closest("[data-m]");
    if (!b) return;
    const a = b.dataset.m;
    if (a === "close") { closeMore(); return; }
    closeMore(false);
    // let the sheet finish closing, then do the thing
    setTimeout(() => {
      if (a === "share") sharePage();
      else if (a === "print" && window.CSNPrint) window.CSNPrint.open(!!state.activeTopic);
      else if (a === "complaint") { const f = $("feedbackBtn"); if (f) f.click(); }
    }, reduced() ? 0 : 180);
  }

  /* ---------- Bottom bar + top bar buttons ---------- */

  const nav = $("mNav");
  if (nav) nav.addEventListener("click", e => {
    const b = e.target.closest("[data-m]");
    if (!b) return;
    const a = b.dataset.m;
    closeSearch();
    if (a === "home") {
      if (document.body.classList.contains("drawer-open")) $("toggleSidebarBtn").click();
      if (state.activeTopic) goToLanding();
      else contentEl.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    } else if (a === "browse") {
      $("toggleSidebarBtn").click();
    } else if (a === "study") {
      if (document.body.classList.contains("drawer-open")) $("toggleSidebarBtn").click();
      $("studyModeBtn").click();
    } else if (a === "more") {
      if (document.body.classList.contains("drawer-open")) $("toggleSidebarBtn").click();
      openMore();
    }
  });
  const mt = $("mTitle");
  if (mt) mt.addEventListener("click", () => contentEl.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" }));
  const sb = $("mSearchBtn");
  if (sb) sb.addEventListener("click", openSearch);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("m-search-open")) closeSearch();
  });

  /* ---------- Swipe a sheet down to close it ---------- */

  let drag = null;
  document.addEventListener("pointerdown", e => {
    if (e.pointerType !== "touch" || !mq.matches) return;
    const panel = e.target.closest(".study-panel");
    if (!panel || panel.classList.contains("image-lightbox-panel")) return;
    const overlay = panel.closest(".study-overlay");
    if (!overlay || !overlay.classList.contains("visible")) return;
    const r = panel.getBoundingClientRect();
    if (e.clientY - r.top > 56) return;                  // only the top strip (handle + title) drags
    if (e.target.closest("button, a, input, select, textarea")) return;
    drag = { panel: panel, id: e.pointerId, y0: e.clientY, dy: 0, t0: performance.now(), on: false };
  });
  document.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y0;
    if (!drag.on && dy > 6) { drag.on = true; drag.panel.style.transition = "none"; }
    if (drag.on) { drag.dy = Math.max(0, dy); drag.panel.style.transform = "translate3d(0," + drag.dy + "px,0)"; }
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.on) return;
    const speed = d.dy / Math.max(1, performance.now() - d.t0);
    d.panel.style.transition = "";
    d.panel.style.transform = "";
    if (d.dy > 110 || (speed > 0.6 && d.dy > 40)) {
      const x = d.panel.querySelector('.study-close-btn, [data-av="cancel"], [data-pr="cancel"], [data-ac="close"]');
      if (x) x.click(); else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    }
  }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);

  /* ---------- Keep everything in step ---------- */

  document.addEventListener("csn:page", e => { setTitle(e.detail); closeSearch(); syncActive(); });
  new MutationObserver(syncActive).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  const so = $("studyOverlay");
  if (so) new MutationObserver(syncActive).observe(so, { attributes: true, attributeFilter: ["class"] });
  const onViewport = () => { if (!mq.matches) { closeSearch(); closeMore(false); } };
  if (mq.addEventListener) mq.addEventListener("change", onViewport); else if (mq.addListener) mq.addListener(onViewport);

  setTitle(currentInfo());
  syncActive();
})();
