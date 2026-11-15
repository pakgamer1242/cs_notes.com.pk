/* ---------------------------------------------------------
   Profile photo dialog.

   window.CSNAvatar.pick({ current, name, synced }) opens a dialog where
   someone chooses (or drops) a picture, moves and zooms it into a round
   frame, and gets back a small square JPEG as a data URL.

   It resolves to:
     "data:image/jpeg;base64,..."   a new photo
     ""                             remove the photo
     null                           cancelled

   The picture is read and shrunk inside the browser. Nothing is uploaded
   anywhere by this file; where the result is kept is up to the caller.
--------------------------------------------------------- */
(function () {
  "use strict";

  const STAGE = 280;                       // the square the person edits in (CSS pixels)
  const OUT = 192;                         // saved picture size (pixels)
  const OUT_SMALL = 144;                   // fallback if the picture is still too big
  const MAX_FILE = 15 * 1024 * 1024;
  const MAX_CHARS = 30000;                 // stays under the 40000 the security rules allow
  const TYPES = /^image\/(png|jpe?g|webp|gif)$/i;
  const BG = "#0c2218";

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? "" : s));

  let overlay = null, panel = null, fileInput = null, lastFocus = null, done = null, active = false;
  let ui = null;
  const pointers = new Map();
  let pinch = null;

  /* ---------- Opening and closing ---------- */

  function pick(opts) {
    if (active) return Promise.resolve(null);
    opts = opts || {};
    active = true;
    ensure();
    ui = { step: "choose", current: opts.current || "", name: opts.name || "", synced: !!opts.synced, error: "" };
    lastFocus = document.activeElement;
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.removeEventListener("keydown", onKey, true);
    document.addEventListener("keydown", onKey, true);      // capture: Escape here must not also close the profile window behind
    render();
    return new Promise(resolve => { done = resolve; });
  }

  function finish(value) {
    if (!active) return;
    active = false;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey, true);
    pointers.clear();
    pinch = null;
    const resolve = done;
    done = null;
    ui = null;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
    if (resolve) resolve(value);
  }

  function ensure() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "study-overlay";
    overlay.id = "avatarOverlay";
    overlay.setAttribute("aria-hidden", "true");
    panel = document.createElement("div");
    panel.className = "study-panel avatar-panel";
    panel.id = "avatarPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "avTitle");
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp,image/gif";
    fileInput.hidden = true;
    overlay.appendChild(panel);
    overlay.appendChild(fileInput);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) finish(null); });
    panel.addEventListener("click", onClick);
    panel.addEventListener("input", e => { if (e.target.id === "avZoom") setScale(ui.min * parseFloat(e.target.value)); });
    panel.addEventListener("keydown", onStageKey);
    panel.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerup", onPointerEnd);
    panel.addEventListener("pointercancel", onPointerEnd);
    panel.addEventListener("wheel", e => {
      if (!ui || ui.step !== "crop" || !e.target.closest("#avStage")) return;
      e.preventDefault();
      setScale(ui.scale * (e.deltaY < 0 ? 1.07 : 1 / 1.07));
    }, { passive: false });
    panel.addEventListener("dragover", e => { e.preventDefault(); panel.classList.add("dragging"); });
    panel.addEventListener("dragleave", () => panel.classList.remove("dragging"));
    panel.addEventListener("drop", e => {
      e.preventDefault();
      panel.classList.remove("dragging");
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
    fileInput.addEventListener("change", () => {
      const f = fileInput.files && fileInput.files[0];
      fileInput.value = "";                       // so choosing the same file again still works
      if (f) handleFile(f);
    });
  }

  /* ---------- Screens ---------- */

  function chooseHtml() {
    const initial = esc((ui.name || "?").charAt(0).toUpperCase());
    const big = ui.current
      ? `<span class="av-big has-photo" style="background-image:url(${ui.current})" aria-hidden="true"></span>`
      : `<span class="av-big av-initial" aria-hidden="true">${initial}</span>`;
    return `
      <div class="study-header">
        <h2 class="study-title" id="avTitle" tabindex="-1">Profile photo</h2>
        <button class="study-close-btn" type="button" data-av="cancel" aria-label="Close">&times;</button>
      </div>
      <div class="av-choose">
        ${big}
        <p class="fb-intro">Pick a picture, then move and zoom it into the round frame. ${ui.synced ? "It's saved with your account, so it follows you to your other devices." : "It stays on this device."}</p>
        <p class="fb-error${ui.error ? " show" : ""}" id="avError" role="alert">${esc(ui.error)}</p>
        <div class="av-actions">
          <button type="button" class="fb-btn fb-btn-primary" data-av="choose">Choose a photo</button>
          ${ui.current ? '<button type="button" class="fb-btn fb-btn-danger" data-av="remove">Remove photo</button>' : ""}
          <button type="button" class="fb-btn" data-av="cancel">Cancel</button>
        </div>
        <p class="fb-privacy">You can also drop a picture onto this window.</p>
      </div>`;
  }

  function cropHtml() {
    return `
      <div class="study-header">
        <h2 class="study-title" id="avTitle" tabindex="-1">Position your photo</h2>
        <button class="study-close-btn" type="button" data-av="cancel" aria-label="Close">&times;</button>
      </div>
      <div class="av-crop">
        <div class="av-stage" id="avStage" tabindex="0" role="group" aria-label="Photo position. Drag to move it. Arrow keys move the photo, plus and minus zoom.">
          <canvas id="avCanvas"></canvas>
          <div class="av-mask" aria-hidden="true"></div>
        </div>
        <div class="av-zoom">
          <label for="avZoom">Zoom</label>
          <input type="range" id="avZoom" min="1" max="4" step="0.01" value="${(ui.scale / ui.min).toFixed(2)}">
        </div>
        <div class="av-previews" aria-hidden="true">
          <canvas id="avPrev1" width="56" height="56"></canvas>
          <canvas id="avPrev2" width="32" height="32"></canvas>
          <span>How it will look</span>
        </div>
        <p class="fb-error" id="avError" role="alert"></p>
        <div class="av-actions">
          <button type="button" class="fb-btn fb-btn-primary" data-av="use">Use this photo</button>
          <button type="button" class="fb-btn" data-av="again">Choose another</button>
          <button type="button" class="fb-btn" data-av="cancel">Cancel</button>
        </div>
      </div>`;
  }

  function render() {
    if (!ui) return;
    panel.innerHTML = ui.step === "crop" ? cropHtml() : chooseHtml();
    if (ui.step === "crop") { ui.canvas = $("avCanvas"); draw(); }
    const h = $("avTitle");
    if (h) h.focus();
  }

  function showError(msg) {
    const el = $("avError");
    if (el) { el.textContent = msg; el.classList.add("show"); }
  }

  /* ---------- Reading the picture ---------- */

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }

  async function handleFile(file) {
    if (!ui) return;
    if (file.type && !TYPES.test(file.type)) { ui.step = "choose"; ui.error = "That isn't a picture we can use. Choose a PNG, JPEG, WebP or GIF."; render(); return; }
    if (file.size > MAX_FILE) { ui.step = "choose"; ui.error = "That picture is larger than 15 MB. Choose a smaller one."; render(); return; }
    try {
      const img = await loadImage(file);
      if (!ui) return;                                  // closed while it was loading
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("empty");
      ui.img = img;
      ui.iw = img.naturalWidth;
      ui.ih = img.naturalHeight;
      ui.min = STAGE / Math.min(ui.iw, ui.ih);          // smallest zoom that still fills the frame
      ui.scale = ui.min;
      ui.x = 0;
      ui.y = 0;
      ui.step = "crop";
      ui.error = "";
      render();
    } catch (e) {
      if (!ui) return;
      ui.step = "choose";
      ui.error = "That file couldn't be opened as a picture.";
      render();
    }
  }

  /* ---------- Moving and zooming ---------- */

  function clamp() {
    const w = ui.iw * ui.scale, h = ui.ih * ui.scale;
    const mx = Math.max(0, (w - STAGE) / 2), my = Math.max(0, (h - STAGE) / 2);
    ui.x = Math.min(mx, Math.max(-mx, ui.x));
    ui.y = Math.min(my, Math.max(-my, ui.y));
  }

  function setScale(s) {
    if (!ui || ui.step !== "crop") return;
    const next = Math.min(ui.min * 4, Math.max(ui.min, s));
    const k = next / ui.scale;
    ui.x *= k;
    ui.y *= k;
    ui.scale = next;
    clamp();
    const z = $("avZoom");
    if (z) z.value = (ui.scale / ui.min).toFixed(2);
    draw();
  }

  function sourceRect() {
    const sw = STAGE / ui.scale;                        // the visible square, in picture pixels
    const cx = ui.iw / 2 - ui.x / ui.scale;
    const cy = ui.ih / 2 - ui.y / ui.scale;
    return { sx: cx - sw / 2, sy: cy - sw / 2, sw: sw };
  }

  function draw() {
    if (!ui || !ui.canvas || !ui.img) return;
    const c = ui.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(STAGE * dpr)) { c.width = Math.round(STAGE * dpr); c.height = Math.round(STAGE * dpr); }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, STAGE, STAGE);
    const w = ui.iw * ui.scale, h = ui.ih * ui.scale;
    ctx.drawImage(ui.img, STAGE / 2 + ui.x - w / 2, STAGE / 2 + ui.y - h / 2, w, h);
    [["avPrev1", 56], ["avPrev2", 32]].forEach(p => {
      const pc = $(p[0]);
      if (!pc) return;
      const pctx = pc.getContext("2d");
      const r = sourceRect();
      pctx.clearRect(0, 0, p[1], p[1]);
      pctx.save();
      pctx.beginPath();
      pctx.arc(p[1] / 2, p[1] / 2, p[1] / 2, 0, Math.PI * 2);
      pctx.clip();
      pctx.fillStyle = BG;
      pctx.fillRect(0, 0, p[1], p[1]);
      pctx.drawImage(ui.img, r.sx, r.sy, r.sw, r.sw, 0, 0, p[1], p[1]);
      pctx.restore();
    });
  }

  function pointerRatio() {
    const s = $("avStage");
    return s ? STAGE / s.getBoundingClientRect().width : 1;
  }

  function onPointerDown(e) {
    if (!ui || ui.step !== "crop") return;
    const stage = e.target.closest("#avStage");
    if (!stage) return;
    e.preventDefault();
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* not essential */ }
    stage.focus({ preventScroll: true });
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale: ui.scale };
    }
  }

  function onPointerMove(e) {
    const p = pointers.get(e.pointerId);
    if (!p || !ui || ui.step !== "crop") return;
    const k = pointerRatio();
    if (pointers.size === 1) {
      ui.x += (e.clientX - p.x) * k;
      ui.y += (e.clientY - p.y) * k;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 2 && pinch) {
      const [a, b] = Array.from(pointers.values());
      setScale(pinch.scale * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.dist));
    }
    clamp();
    draw();
  }

  function onPointerEnd(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
  }

  function onStageKey(e) {
    if (!ui || ui.step !== "crop" || !e.target.closest || !e.target.closest("#avStage")) return;
    const step = 12;
    let handled = true;
    if (e.key === "ArrowLeft") ui.x += step;
    else if (e.key === "ArrowRight") ui.x -= step;
    else if (e.key === "ArrowUp") ui.y += step;
    else if (e.key === "ArrowDown") ui.y -= step;
    else if (e.key === "+" || e.key === "=") { setScale(ui.scale * 1.08); return e.preventDefault(); }
    else if (e.key === "-" || e.key === "_") { setScale(ui.scale / 1.08); return e.preventDefault(); }
    else handled = false;
    if (handled) { e.preventDefault(); clamp(); draw(); }
  }

  /* ---------- Saving ---------- */

  function exportImage() {
    const r = sourceRect();
    function render(size, quality) {
      const out = document.createElement("canvas");
      out.width = out.height = size;
      const ctx = out.getContext("2d");
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, size, size);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(ui.img, r.sx, r.sy, r.sw, r.sw, 0, 0, size, size);
      return out.toDataURL("image/jpeg", quality);
    }
    for (const size of [OUT, OUT_SMALL]) {
      let q = 0.88;
      let data = render(size, q);
      while (data.length > MAX_CHARS && q > 0.45) { q -= 0.08; data = render(size, q); }
      if (data.length <= MAX_CHARS) return data;
    }
    return null;
  }

  /* ---------- Clicks and keys ---------- */

  function onClick(e) {
    const b = e.target.closest("[data-av]");
    if (!b || !ui) return;
    const a = b.dataset.av;
    if (a === "cancel") finish(null);
    else if (a === "remove") finish("");
    else if (a === "choose" || a === "again") fileInput.click();
    else if (a === "use") {
      let data = null;
      try { data = exportImage(); } catch (err) { data = null; }
      if (data && /^data:image\/jpeg;base64,/.test(data)) finish(data);
      else showError("Couldn't prepare that picture. Try a different one.");
    }
  }

  function onKey(e) {
    if (e.key === "Escape") { e.stopPropagation(); finish(null); return; }
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(panel);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const title = $("avTitle");
    const current = document.activeElement;
    const inside = panel.contains(current);
    if (e.shiftKey && (current === first || current === title || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (current === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  window.CSNAvatar = { pick: pick };
})();
