/* ---------------------------------------------------------
   Accounts + cross-device sync.

   Off by default. It switches on only when cloud-config.js has
   your Firebase settings (see SETUP-FIREBASE.md). Until then
   this file does nothing and the site behaves as before.

   How it fits together:
   - Signing in makes the account your active profile. All the
     normal saving still goes to this device first, so the site
     keeps working offline.
   - A sync engine copies changed topics (notes + links + videos)
     to Firestore and pulls changes made on other devices.
   - Images stay on the device they were added on.
   - If two devices edit the same topic, both versions are kept.
   - Signing out removes the account's notes from this device.
--------------------------------------------------------- */
(function () {
  "use strict";

  const cfg = (typeof CLOUD_CONFIG !== "undefined" && CLOUD_CONFIG) ? CLOUD_CONFIG : {};
  // Tests plug a stand-in service in here. Real use never sets this.
  const injected = window.CSN_CLOUD_ADAPTER || null;
  const configured = !!(injected || (cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId));
  if (!configured) {
    console.info("[CS Notes] Accounts are off. Add your Firebase settings to cloud-config.js to switch them on (see SETUP-FIREBASE.md).");
    return;
  }

  const FIREBASE_VERSION = "10.12.2";
  const MAX_NOTES = 50000;        // must match firestore.rules
  const MAX_RESOURCES = 100;      // must match firestore.rules
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URL_OK = /^https?:\/\/[^\s"'<>]+$/i;
  const EMBED_OK = /^https:\/\/(www\.youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)[A-Za-z0-9_-]+$/;

  const $ = id => document.getElementById(id);
  const esc = s => escapeHtml(String(s == null ? "" : s));
  const escAttr = s => esc(s).replace(/"/g, "&quot;");

  /* ---------- Friendly errors ---------- */

  const ERRORS = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/missing-password": "Enter your password.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
    "auth/weak-password": "Choose a stronger password (at least 8 characters).",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/network-request-failed": "Couldn't reach the server. Check your internet connection.",
    "auth/operation-not-allowed": "Email sign-in isn't switched on for this site yet (Firebase console > Authentication > Sign-in method).",
    "auth/unauthorized-domain": "This website's address isn't allowed yet (Firebase console > Authentication > Settings > Authorized domains).",
    "auth/invalid-api-key": "The Firebase settings in cloud-config.js look wrong.",
    "auth/requires-recent-login": "Please sign in again, then retry.",
    "auth/user-disabled": "This account has been disabled.",
    "permission-denied": "The cloud database rejected this. The security rules may not be published yet.",
    "unavailable": "The cloud service is unreachable right now.",
    "csn/timeout": "The server took too long to answer.",
    "csn/offline": "You're offline.",
  };

  function friendlyError(e) {
    const code = (e && e.code) || "";
    return ERRORS[code] || ("Something went wrong" + (code ? " (" + code + ")" : "") + ".");
  }

  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => { const e = new Error("timeout"); e.code = "csn/timeout"; reject(e); }, ms);
      promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
  }

  /* ---------- Cleaning data that comes from the cloud ----------
     Anything arriving from outside is treated as untrusted: only known
     fields, only http(s) links, only known video embed addresses. */

  function cleanResources(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    list.slice(0, MAX_RESOURCES).forEach(r => {
      if (!r || typeof r !== "object" || r.type === "image") return;
      const label = typeof r.label === "string" ? r.label.slice(0, 300) : "";
      const url = typeof r.url === "string" && URL_OK.test(r.url) ? r.url : null;
      if (r.type === "video") {
        out.push({
          type: "video",
          id: typeof r.id === "string" ? r.id.slice(0, 40) : "",
          url: url,
          embedUrl: typeof r.embedUrl === "string" && EMBED_OK.test(r.embedUrl) ? r.embedUrl : null,
          label: label,
        });
      } else {
        out.push({ label: label, url: url });
      }
    });
    return out;
  }

  /* =========================================================
     Firebase adapter. Loads Firebase from Google's CDN only
     when accounts are switched on.
  ========================================================= */

  function makeFirebaseAdapter(firebaseConfig) {
    const BASE = "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/";
    let A = null, F = null, auth = null, db = null, loading = null;

    function load() {
      if (!loading) {
        loading = Promise.all([
          import(BASE + "firebase-app.js"),
          import(BASE + "firebase-auth.js"),
          import(BASE + "firebase-firestore.js"),
        ]).then(mods => {
          A = mods[1];
          F = mods[2];
          const app = mods[0].initializeApp(firebaseConfig);
          auth = A.getAuth(app);
          db = F.getFirestore(app);
        }).catch(e => { loading = null; throw e; }); // lets a later retry start fresh
      }
      return loading;
    }

    const wrap = u => u ? {
      uid: u.uid,
      email: u.email || "",
      displayName: u.displayName || "",
      emailVerified: !!u.emailVerified,
    } : null;

    return {
      name: "firebase",

      onAuthChange(cb) {
        load()
          .then(() => A.onAuthStateChanged(auth, u => cb(wrap(u))))
          .catch(e => cb(null, e));
      },

      async signUp(email, password, displayName) {
        await load();
        const cred = await A.createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          try { await A.updateProfile(cred.user, { displayName: displayName }); } catch (e) { /* the name is optional */ }
        }
        try { await A.sendEmailVerification(cred.user); } catch (e) { /* a reminder, not a requirement */ }
        return wrap(cred.user);
      },

      async signIn(email, password) {
        await load();
        const cred = await A.signInWithEmailAndPassword(auth, email, password);
        return wrap(cred.user);
      },

      async signOut() { await load(); await A.signOut(auth); },

      async sendReset(email) { await load(); await A.sendPasswordResetEmail(auth, email); },

      async sendVerification() {
        await load();
        if (auth.currentUser) await A.sendEmailVerification(auth.currentUser);
      },

      async fetchTopics(sinceMs) {
        await load();
        const col = F.collection(db, "users", auth.currentUser.uid, "topics");
        const q = sinceMs > 0 ? F.query(col, F.where("updatedAt", ">=", F.Timestamp.fromMillis(sinceMs))) : col;
        const snap = await F.getDocs(q);
        return snap.docs.map(d => {
          const x = d.data();
          return {
            id: d.id,
            key: x.key,
            notes: x.notes,
            resources: x.resources,
            updatedAtMs: x.updatedAtMs,
            serverMs: x.updatedAt && typeof x.updatedAt.toMillis === "function" ? x.updatedAt.toMillis() : 0,
          };
        });
      },

      async pushTopics(docs) {
        await load();
        const uid = auth.currentUser.uid;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = F.writeBatch(db);
          docs.slice(i, i + 400).forEach(d => {
            batch.set(F.doc(db, "users", uid, "topics", d.id), {
              key: d.key,
              notes: d.notes,
              resources: d.resources,
              updatedAtMs: d.updatedAtMs,
              updatedAt: F.serverTimestamp(),
            });
          });
          await batch.commit();
        }
      },

      async deleteAccount(password) {
        await load();
        const user = auth.currentUser;
        await A.reauthenticateWithCredential(user, A.EmailAuthProvider.credential(user.email, password));
        const snap = await F.getDocs(F.collection(db, "users", user.uid, "topics"));
        for (let i = 0; i < snap.docs.length; i += 400) {
          const batch = F.writeBatch(db);
          snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
        await A.deleteUser(user);
      },
    };
  }

  const adapter = injected || makeFirebaseAdapter({
    apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId,
  });

  /* =========================================================
     State
  ========================================================= */

  let user = null;          // signed-in person, or null
  let authReady = false;    // true once we know whether someone is signed in
  let loadError = "";       // set if the sign-in service couldn't load
  let meta = null;          // sync bookkeeping for the signed-in person
  let authChain = Promise.resolve();
  const sync = { busy: false, again: false, error: "", offline: false, lastOkMs: 0, lastRunMs: 0, timer: null };

  const accountProfileId = uid => "acct_" + uid;
  const META_KEY = uid => "cs-notes-sync-" + uid + "-v1";
  const EMPTY = JSON.stringify({ n: "", r: [] });

  function displayNameOf(u) {
    // Profile names are shown with innerHTML elsewhere, so strip markup characters.
    const raw = u.displayName || (u.email || "").split("@")[0] || "Account";
    return raw.replace(/[<>&"]/g, "").slice(0, 24) || "Account";
  }

  /* ---------- Sync bookkeeping ---------- */

  function loadMeta(uid) {
    try {
      const m = JSON.parse(localStorage.getItem(META_KEY(uid)) || "null");
      if (m && typeof m === "object") {
        return { pulledUntil: Number(m.pulledUntil) || 0, hashes: m.hashes || {}, edited: m.edited || {}, seen: m.seen || {} };
      }
    } catch (e) { /* start fresh */ }
    return { pulledUntil: 0, hashes: {}, edited: {}, seen: {} };
  }

  function saveMeta() {
    if (!user || !meta) return;
    try { localStorage.setItem(META_KEY(user.uid), JSON.stringify(meta)); } catch (e) { /* storage full: sync still works this session */ }
  }

  const baseHash = k => (meta.hashes[k] !== undefined ? meta.hashes[k] : EMPTY);

  function localImages(key) {
    return (state.resources[key] || []).filter(r => r && r.type === "image");
  }

  // The part of a topic that syncs: notes + links + videos (never images).
  function localTopic(key) {
    const notes = typeof state.notes[key] === "string" ? state.notes[key] : "";
    return {
      notes: notes.slice(0, MAX_NOTES),
      resources: cleanResources((state.resources[key] || []).filter(r => r && r.type !== "image")),
    };
  }

  const topicHash = t => JSON.stringify({ n: t.notes, r: t.resources });

  function allKeys() {
    const set = {};
    Object.keys(state.notes).concat(Object.keys(state.resources), Object.keys(meta.hashes)).forEach(k => { set[k] = 1; });
    return Object.keys(set);
  }

  function dirtyKeys() {
    if (!meta) return [];
    return allKeys().filter(k => topicHash(localTopic(k)) !== baseHash(k));
  }

  // Remember when each topic was last changed on this device.
  function noteLocalEdits() {
    if (!meta) return;
    const now = Date.now();
    let changed = false;
    allKeys().forEach(k => {
      const h = topicHash(localTopic(k));
      if (h !== baseHash(k)) {
        if (meta.seen[k] !== h) { meta.edited[k] = now; meta.seen[k] = h; changed = true; }
      } else if (meta.seen[k] !== h) {
        meta.seen[k] = h; changed = true;
      }
    });
    if (changed) saveMeta();
  }

  /* ---------- Applying cloud changes to the local state ---------- */

  function setTopic(key, notes, resources) {
    if (notes) state.notes[key] = notes; else delete state.notes[key];
    const withImages = resources.concat(localImages(key));
    if (withImages.length) state.resources[key] = withImages; else delete state.resources[key];
  }

  function applyRemote(key, remote) {
    setTopic(key, remote.notes, remote.resources);
  }

  // Both devices changed the same topic: keep everything from both.
  function applyMerged(key, local, remote) {
    let notes = remote.notes;
    if (local.notes.trim() && local.notes !== remote.notes) {
      notes = remote.notes ? remote.notes + "\n\n— edits from this device —\n" + local.notes : local.notes;
    }
    const seen = {};
    const resources = [];
    remote.resources.concat(local.resources).forEach(r => {
      const id = (r.type || "link") + "|" + (r.label || "") + "|" + (r.url || "");
      if (!seen[id]) { seen[id] = 1; resources.push(r); }
    });
    setTopic(key, notes, resources);
  }

  const isTypingIn = key =>
    state.activeTopic === key && !!document.activeElement && document.activeElement.id === "notesArea";

  function refreshViews(changed) {
    renderSidebar();
    renderNavbarStat();
    if (state.activeTopic && changed[state.activeTopic] && !isTypingIn(state.activeTopic)) {
      const parts = (state.activeTopic.split(":")[1] || "").split("/");
      const dir = DATA.find(d => d.slug === parts[0]);
      const topic = dir && dir.topics.find(t => t.slug === parts[1]);
      if (dir && topic) renderTopic(dir, topic);
    }
  }

  /* =========================================================
     Sync engine
  ========================================================= */

  async function pull() {
    const since = meta.pulledUntil;
    const docs = await withTimeout(adapter.fetchTopics(since), 20000);
    if (!user || !meta) return;

    const changed = {};
    let any = false;
    let maxServer = since;
    let hold = Infinity;

    docs.forEach(d => {
      if (!d || typeof d.key !== "string") return;
      const serverMs = Number(d.serverMs) || 0;
      maxServer = Math.max(maxServer, serverMs);
      const key = d.key;

      // Don't overwrite what someone is typing right now. Look at it again next time.
      if (isTypingIn(key)) { hold = Math.min(hold, serverMs); return; }

      const remote = { notes: typeof d.notes === "string" ? d.notes.slice(0, MAX_NOTES) : "", resources: cleanResources(d.resources) };
      const remoteHash = topicHash(remote);
      const local = localTopic(key);
      const localHash = topicHash(local);

      if (remoteHash === localHash) { meta.hashes[key] = remoteHash; meta.seen[key] = remoteHash; return; }
      if (remoteHash === baseHash(key)) return;       // nothing new from the cloud for this topic

      if (localHash === baseHash(key)) {              // only the cloud changed
        applyRemote(key, remote);
        meta.hashes[key] = remoteHash;
        meta.seen[key] = remoteHash;
        meta.edited[key] = Number(d.updatedAtMs) || Date.now();
      } else {                                         // both changed: keep both
        applyMerged(key, local, remote);
        meta.hashes[key] = remoteHash;                 // the merged copy now counts as unsynced
        meta.edited[key] = Date.now();
        delete meta.seen[key];
      }
      changed[key] = 1;
      any = true;
    });

    meta.pulledUntil = Math.max(since, Math.min(maxServer, hold));
    saveMeta();
    if (any) {
      performSave();      // keep this device's copy in step
      refreshViews(changed);
    }
  }

  async function push() {
    if (!user || !meta) return;
    noteLocalEdits();
    const keys = dirtyKeys();
    if (!keys.length) return;

    const docs = [];
    const hashes = {};
    keys.forEach(k => {
      const t = localTopic(k);
      hashes[k] = topicHash(t);
      docs.push({
        id: encodeURIComponent(k),
        key: k,
        notes: t.notes,
        resources: t.resources,
        updatedAtMs: meta.edited[k] || Date.now(),
      });
    });
    await withTimeout(adapter.pushTopics(docs), 20000);
    if (!user || !meta) return;
    keys.forEach(k => { meta.hashes[k] = hashes[k]; });
    saveMeta();
  }

  function handleSyncError(e) {
    const code = (e && e.code) || "";
    const offline = code === "csn/offline" || code === "csn/timeout" || code === "unavailable" ||
      code === "auth/network-request-failed" || navigator.onLine === false;
    sync.offline = offline;
    sync.error = offline ? "" : friendlyError(e);
    console.warn("[CS Notes] sync problem:", e);
    clearTimeout(sync.timer);
    sync.timer = setTimeout(runSync, offline ? 30000 : 60000);
  }

  async function runSync() {
    if (!user || !meta) return;
    if (sync.busy) { sync.again = true; return; }
    sync.busy = true;
    sync.lastRunMs = Date.now();
    setChipSync();
    try {
      if (navigator.onLine === false) { const off = new Error("offline"); off.code = "csn/offline"; throw off; }
      await pull();
      await push();
      sync.lastOkMs = Date.now();
      sync.error = "";
      sync.offline = false;
    } catch (e) {
      handleSyncError(e);
    } finally {
      sync.busy = false;
      setChipSync();
      if (sync.again) { sync.again = false; schedulePush(300); }
    }
  }

  function schedulePush(ms) {
    clearTimeout(sync.timer);
    sync.timer = setTimeout(runSync, ms);
  }

  function onLocalSave() {
    if (!user || !meta || activeProfileId !== accountProfileId(user.uid)) return;
    noteLocalEdits();
    if (dirtyKeys().length) schedulePush(1500);
    setChipSync();
  }

  /* ---------- Status text + the little dot on the profile chip ---------- */

  function ago(ms) {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 10) return "just now";
    if (s < 60) return s + " seconds ago";
    const m = Math.round(s / 60);
    if (m < 60) return m + " minute" + (m > 1 ? "s" : "") + " ago";
    const h = Math.round(m / 60);
    return h + " hour" + (h > 1 ? "s" : "") + " ago";
  }

  function statusText() {
    if (!user || !meta) return "";
    const n = dirtyKeys().length;
    if (sync.busy) return "Syncing…";
    if (sync.error) return "Sync problem: " + sync.error;
    if (sync.offline) return n ? "Offline. " + n + " change" + (n > 1 ? "s" : "") + " will sync when you're back online." : "Offline. Showing your saved notes.";
    if (n) return "Waiting to sync " + n + " change" + (n > 1 ? "s" : "") + "…";
    return sync.lastOkMs ? "All changes synced " + ago(sync.lastOkMs) + "." : "Not synced yet.";
  }

  function setChipSync() {
    const chip = $("profileChipBtn");
    if (chip) {
      if (!user || !meta) {
        chip.removeAttribute("data-sync");
      } else {
        let s = "ok";
        if (sync.busy) s = "busy";
        else if (sync.error) s = "error";
        else if (sync.offline) s = "offline";
        else if (dirtyKeys().length) s = "pending";
        chip.setAttribute("data-sync", s);
      }
    }
    const line = $("acctSyncLine");
    if (line) line.textContent = statusText();
  }

  /* =========================================================
     Signing in and out (the account becomes the active profile)
  ========================================================= */

  function ensureAccountProfile(u) {
    const id = accountProfileId(u.uid);
    let p = profiles.find(x => x.id === id);
    if (!p) {
      p = { id: id, name: displayNameOf(u), color: pickProfileColor(), createdAt: Date.now(), account: true, email: u.email };
      profiles.push(p);
    } else {
      p.name = displayNameOf(u);
      p.email = u.email;
      p.account = true;
    }
    saveProfilesList();
    return p;
  }

  function countTopics(profileId) {
    try {
      const d = JSON.parse(localStorage.getItem(profileDataKey(profileId)) || "null");
      if (!d) return 0;
      const set = {};
      Object.keys(d.notes || {}).forEach(k => { if (String(d.notes[k] || "").trim()) set[k] = 1; });
      Object.keys(d.resources || {}).forEach(k => { if ((d.resources[k] || []).length) set[k] = 1; });
      return Object.keys(set).length;
    } catch (e) { return 0; }
  }

  // A short fingerprint of a guest profile's notes, so we only ask again when they've changed.
  function guestFingerprint(profileId) {
    try {
      const d = JSON.parse(localStorage.getItem(profileDataKey(profileId)) || "null");
      if (!d) return "";
      const s = JSON.stringify({ n: d.notes || {}, r: d.resources || {} });
      let h = 5381;
      for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
      return h + ":" + s.length;
    } catch (e) { return ""; }
  }

  const offeredKey = uid => "cs-notes-offered-" + uid;

  async function onSignedIn(u) {
    const accId = accountProfileId(u.uid);
    const wasActive = activeProfileId === accId;
    if (!wasActive) flushPendingSave();
    const before = getActiveProfile();

    user = u;
    meta = loadMeta(u.uid);
    ensureAccountProfile(u);

    if (!wasActive) {
      let hasCache = false;
      try { hasCache = !!localStorage.getItem(profileDataKey(accId)); } catch (e) { /* ignore */ }
      const guestTopics = before && !before.account ? countTopics(before.id) : 0;
      const fingerprint = guestTopics > 0 ? guestFingerprint(before.id) : "";
      let alreadyOffered = false;
      try { alreadyOffered = localStorage.getItem(offeredKey(u.uid)) === fingerprint; } catch (e) { /* ask again */ }
      if (!hasCache && guestTopics > 0 && !alreadyOffered) {
        const add = await askMigrate(guestTopics);
        try { localStorage.setItem(offeredKey(u.uid), fingerprint); } catch (e) { /* ignore */ }
        if (add) {
          try {
            const raw = localStorage.getItem(profileDataKey(before.id));
            if (raw) localStorage.setItem(profileDataKey(accId), raw);
          } catch (e) { /* ignore */ }
        }
      }
      switchProfile(accId);
    }
    closeAuth();
    setChipSync();
    runSync();
  }

  function onSignedOut() {
    user = null;
    meta = null;
    clearTimeout(sync.timer);
    sync.busy = false; sync.again = false; sync.error = ""; sync.offline = false; sync.lastOkMs = 0;

    const accounts = profiles.filter(p => p.account);
    if (accounts.length) {
      const active = getActiveProfile();
      if (active && active.account) {
        // Leave the account first so its last edits are flushed, then wipe it from this device.
        let guest = profiles.find(p => !p.account);
        if (!guest) {
          guest = { id: generateProfileId(), name: "You", color: pickProfileColor(), createdAt: Date.now() };
          profiles.push(guest);
          saveProfilesList();
        }
        switchProfile(guest.id);
      }
      accounts.forEach(p => {
        try {
          localStorage.removeItem(profileDataKey(p.id));
          localStorage.removeItem(META_KEY(p.id.replace(/^acct_/, "")));
        } catch (e) { /* ignore */ }
      });
      profiles = profiles.filter(p => !p.account);
      saveProfilesList();
      renderProfileChip();
    }
    closeAuth();
    setChipSync();
  }

  async function applyUser(u) {
    if (user && user.uid === u.uid) {
      user = u;
      ensureAccountProfile(u);
      renderProfileChip();
      closeAuth();
      return;
    }
    await onSignedIn(u);
  }

  async function handleAuth(u, err) {
    authReady = true;
    if (err) {
      loadError = "Couldn't load the sign-in service. Check your connection and try again.";
    } else {
      loadError = "";
      if (u) await applyUser(u); else onSignedOut();
    }
    refreshAccountUi();
  }

  function startAuth() {
    loadError = "";
    authReady = false;
    refreshAccountUi();
    adapter.onAuthChange((u, err) => {
      authChain = authChain.then(() => handleAuth(u, err)).catch(e => console.warn("[CS Notes] sign-in state error:", e));
    });
  }

  async function doSignOut() {
    noteLocalEdits();
    const pending = meta ? dirtyKeys().length : 0;
    if (pending && !confirm(pending + " change" + (pending > 1 ? "s haven't" : " hasn't") + " synced yet and would be lost on this device. Sign out anyway?")) return;
    try { await adapter.signOut(); } catch (e) { alert(friendlyError(e)); }
  }

  /* =========================================================
     Account section inside the profile switcher
  ========================================================= */

  function signedInHtml() {
    const p = getActiveProfile() || {};
    const verify = user.emailVerified ? "" : `
      <div class="acct-notice">Please verify your email so you can reset your password later. We sent you a link.
        <button type="button" class="acct-link" data-acct="verify">Send it again</button></div>`;
    return `
      <div class="acct-card acct-card-on">
        <div class="acct-head">
          <span class="acct-avatar" style="background:${escAttr(p.color || "#55D68F")}">${esc(displayNameOf(user).charAt(0).toUpperCase())}</span>
          <div class="acct-who"><strong>${esc(displayNameOf(user))}</strong><span>${esc(user.email)}</span></div>
        </div>
        ${verify}
        <p class="acct-sync" id="acctSyncLine" role="status" aria-live="polite">${esc(statusText())}</p>
        <div class="acct-actions">
          <button type="button" class="fb-btn" data-acct="sync-now">Sync now</button>
          <button type="button" class="fb-btn" data-acct="sign-out">Sign out</button>
        </div>
        <details class="acct-more">
          <summary>More</summary>
          <p>Notes, saved links and video links sync to your account. Images stay on the device they were added on.</p>
          <button type="button" class="fb-btn fb-btn-danger" data-acct="delete">Delete account and cloud data</button>
        </details>
      </div>`;
  }

  function signedOutHtml() {
    return `
      <div class="acct-card">
        <strong>Sync across devices</strong>
        <p>Create an account to keep your notes safe and open them on any device.</p>
        <div class="acct-actions">
          <button type="button" class="fb-btn fb-btn-primary" data-acct="signin">Sign in</button>
          <button type="button" class="fb-btn" data-acct="signup">Create account</button>
        </div>
      </div>`;
  }

  function renderAccountSlot() {
    const slot = $("accountSlot");
    const panel = $("profilePanel");
    if (!slot || !panel) return;
    if (!authReady && !loadError) {
      panel.classList.remove("acct-mode");
      slot.innerHTML = `<div class="acct-card"><p class="acct-muted">Checking your sign-in…</p></div>`;
    } else if (loadError && !user) {
      panel.classList.remove("acct-mode");
      slot.innerHTML = `<div class="acct-card"><p>${esc(loadError)}</p>
        <button type="button" class="fb-btn" data-acct="retry">Try again</button></div>`;
    } else if (user) {
      panel.classList.add("acct-mode");
      slot.innerHTML = signedInHtml();
    } else {
      panel.classList.remove("acct-mode");
      slot.innerHTML = signedOutHtml();
    }
    const title = $("profileTitle");
    if (title) title.textContent = user ? "Your account" : "Switch Profile";
  }

  function refreshAccountUi() {
    renderAccountSlot();
    setChipSync();
  }

  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-acct]");
    if (!btn) return;
    const action = btn.dataset.acct;
    if (action === "signin" || action === "signup") {
      closeProfileSwitcher();
      openAuth(action);
    } else if (action === "sync-now") {
      runSync();
    } else if (action === "sign-out") {
      doSignOut();
    } else if (action === "delete") {
      closeProfileSwitcher();
      openAuth("delete");
    } else if (action === "verify") {
      adapter.sendVerification().then(() => { btn.textContent = "Sent"; }, e2 => alert(friendlyError(e2)));
    } else if (action === "retry") {
      startAuth();
    }
  });

  /* =========================================================
     Sign-in dialog (sign in / create account / reset / delete / bring notes)
  ========================================================= */

  let authOverlay = null, authPanel = null, authLastFocus = null;
  const authUi = { view: "signin", busy: false, email: "", migrateResolve: null, migrateCount: 0 };

  function ensureAuthDialog() {
    if (authOverlay) return;
    authOverlay = document.createElement("div");
    authOverlay.className = "study-overlay";
    authOverlay.id = "authOverlay";
    authOverlay.setAttribute("aria-hidden", "true");
    authPanel = document.createElement("div");
    authPanel.className = "study-panel";
    authPanel.id = "authPanel";
    authPanel.setAttribute("role", "dialog");
    authPanel.setAttribute("aria-modal", "true");
    authPanel.setAttribute("aria-labelledby", "acTitle");
    authOverlay.appendChild(authPanel);
    document.body.appendChild(authOverlay);

    authOverlay.addEventListener("click", e => {
      if (e.target === authOverlay && !authUi.busy && authUi.view !== "migrate") closeAuth();
    });
    authPanel.addEventListener("click", onAuthClick);
    authPanel.addEventListener("submit", onAuthSubmit);
  }

  function authHeader(title) {
    const close = authUi.view === "migrate" ? "" :
      `<button class="study-close-btn" id="acClose" type="button" data-ac="close" aria-label="Close">&times;</button>`;
    return `<div class="study-header"><h2 class="study-title" id="acTitle" tabindex="-1">${esc(title)}</h2>${close}</div>`;
  }

  function emailField(autocomplete) {
    return `<div class="fb-field"><label class="fb-label" for="acEmail">Email</label>
      <input class="fb-input" id="acEmail" type="email" inputmode="email" autocomplete="${autocomplete}" value="${escAttr(authUi.email)}"></div>`;
  }

  function passwordField(label, autocomplete, hint) {
    return `<div class="fb-field"><label class="fb-label" for="acPass">${esc(label)}</label>
      <div class="acct-passrow">
        <input class="fb-input" id="acPass" type="password" autocomplete="${autocomplete}" aria-describedby="acHint">
        <button type="button" class="fb-btn" data-ac="toggle-pass" aria-pressed="false" aria-controls="acPass">Show</button>
      </div>
      <div class="fb-meta" id="acHint" style="text-align:left">${esc(hint || "")}</div></div>`;
  }

  function authHtml() {
    const v = authUi.view;
    if (v === "signup") {
      return `${authHeader("Create account")}
        <p class="fb-intro">One account keeps your notes on every device you use.</p>
        <form id="acForm" novalidate>
          <div class="fb-field"><label class="fb-label" for="acName">Name <span class="fb-opt">optional</span></label>
            <input class="fb-input" id="acName" type="text" autocomplete="name" maxlength="24"></div>
          ${emailField("email")}
          ${passwordField("Password", "new-password", "At least 8 characters.")}
          <p class="fb-error" id="acError" role="alert"></p>
          <button type="submit" class="study-start-btn" id="acSubmit">Create account</button>
        </form>
        <div class="acct-links"><button type="button" class="acct-link" data-ac="view-signin">I already have an account</button></div>`;
    }
    if (v === "reset") {
      return `${authHeader("Reset password")}
        <p class="fb-intro">Enter your email and we'll send you a link to choose a new password.</p>
        <form id="acForm" novalidate>
          ${emailField("email")}
          <p class="fb-error" id="acError" role="alert"></p>
          <button type="submit" class="study-start-btn" id="acSubmit">Send reset link</button>
        </form>
        <div class="acct-links"><button type="button" class="acct-link" data-ac="view-signin">Back to sign in</button></div>`;
    }
    if (v === "resetsent") {
      return `${authHeader("Check your email")}
        <p class="fb-intro">If an account exists for <strong>${esc(authUi.email)}</strong>, a reset link is on its way. It can take a minute, and it may land in your spam folder.</p>
        <div class="acct-links"><button type="button" class="acct-link" data-ac="view-signin">Back to sign in</button></div>`;
    }
    if (v === "delete") {
      return `${authHeader("Delete account")}
        <p class="fb-intro">This permanently deletes your account and the notes synced to it. Notes already on your other devices stay there until you sign out of them. Enter your password to confirm.</p>
        <form id="acForm" novalidate>
          ${passwordField("Password", "current-password", "")}
          <p class="fb-error" id="acError" role="alert"></p>
          <button type="submit" class="study-start-btn acct-danger" id="acSubmit">Delete my account</button>
        </form>`;
    }
    if (v === "migrate") {
      const n = authUi.migrateCount;
      return `${authHeader("Bring your notes along?")}
        <p class="fb-intro">You have notes in <strong>${n}</strong> topic${n === 1 ? "" : "s"} on this device. Add them to your account so they sync to your other devices?</p>
        <div class="acct-actions">
          <button type="button" class="fb-btn fb-btn-primary" data-ac="migrate-yes">Add them to my account</button>
          <button type="button" class="fb-btn" data-ac="migrate-no">Not now</button>
        </div>
        <p class="fb-privacy">If you choose "Not now", those notes stay on this device under your guest profile.</p>`;
    }
    return `${authHeader("Sign in")}
      <p class="fb-intro">Sign in to load your notes on this device and keep them in sync.</p>
      <form id="acForm" novalidate>
        ${emailField("email")}
        ${passwordField("Password", "current-password", "")}
        <p class="fb-error" id="acError" role="alert"></p>
        <button type="submit" class="study-start-btn" id="acSubmit">Sign in</button>
      </form>
      <div class="acct-links">
        <button type="button" class="acct-link" data-ac="view-reset">Forgot password?</button>
        <button type="button" class="acct-link" data-ac="view-signup">Create an account</button>
      </div>`;
  }

  function renderAuth() {
    authPanel.innerHTML = authHtml();
    const h = $("acTitle");
    if (h) h.focus();
  }

  function openAuth(view) {
    ensureAuthDialog();
    if (!authOverlay.classList.contains("visible")) authLastFocus = document.activeElement;
    authUi.view = view;
    authUi.busy = false;
    authOverlay.classList.add("visible");
    authOverlay.setAttribute("aria-hidden", "false");
    document.removeEventListener("keydown", authKeydown);
    document.addEventListener("keydown", authKeydown);
    renderAuth();
  }

  function closeAuth() {
    if (!authOverlay || !authOverlay.classList.contains("visible")) return;
    if (authUi.migrateResolve) { const r = authUi.migrateResolve; authUi.migrateResolve = null; r(false); }
    authOverlay.classList.remove("visible");
    authOverlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", authKeydown);
    authUi.busy = false;
    if (authLastFocus && typeof authLastFocus.focus === "function") authLastFocus.focus();
    authLastFocus = null;
  }

  function askMigrate(count) {
    return new Promise(resolve => {
      authUi.migrateResolve = resolve;
      authUi.migrateCount = count;
      openAuth("migrate");
    });
  }

  function authKeydown(e) {
    if (e.key === "Escape") {
      if (authUi.view !== "migrate" && !authUi.busy) closeAuth();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements(authPanel);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const title = $("acTitle");
    const active = document.activeElement;
    const inside = authPanel.contains(active);
    if (e.shiftKey && (active === first || active === title || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !inside)) { e.preventDefault(); first.focus(); }
  }

  function showAuthError(msg, focusId) {
    const el = $("acError");
    if (el) { el.textContent = msg; el.classList.add("show"); }
    const f = focusId && $(focusId);
    if (f) { f.setAttribute("aria-invalid", "true"); f.focus(); }
  }

  function setAuthBusy(busy, label) {
    authUi.busy = busy;
    const b = $("acSubmit");
    if (b) {
      if (busy) { b.dataset.label = b.textContent; b.textContent = label || "Please wait…"; }
      else if (b.dataset.label) { b.textContent = b.dataset.label; }
      b.disabled = busy;
    }
  }

  function onAuthClick(e) {
    const b = e.target.closest("[data-ac]");
    if (!b) return;
    const a = b.dataset.ac;
    if (a === "close") { closeAuth(); return; }
    if (a === "toggle-pass") {
      const input = $("acPass");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      b.textContent = show ? "Hide" : "Show";
      b.setAttribute("aria-pressed", String(show));
      return;
    }
    if (a === "migrate-yes" || a === "migrate-no") {
      const r = authUi.migrateResolve;
      authUi.migrateResolve = null;
      if (r) r(a === "migrate-yes");
      return;
    }
    const emailEl = $("acEmail");
    if (emailEl) authUi.email = emailEl.value.trim();
    if (a === "view-signin") openAuth("signin");
    else if (a === "view-signup") openAuth("signup");
    else if (a === "view-reset") openAuth("reset");
  }

  async function onAuthSubmit(e) {
    if (e.target.id !== "acForm") return;
    e.preventDefault();
    if (authUi.busy) return;
    const view = authUi.view;
    const emailEl = $("acEmail");
    const email = emailEl ? emailEl.value.trim() : "";
    const pass = $("acPass") ? $("acPass").value : "";
    authUi.email = email || (user ? user.email : "");

    if (view !== "delete" && !EMAIL_RE.test(email)) { showAuthError("Enter a valid email address.", "acEmail"); return; }
    if (view === "signup" && pass.length < 8) { showAuthError("Choose a password with at least 8 characters.", "acPass"); return; }
    if ((view === "signin" || view === "delete") && !pass) { showAuthError("Enter your password.", "acPass"); return; }

    setAuthBusy(true, view === "signin" ? "Signing in…" : view === "signup" ? "Creating account…" : view === "delete" ? "Deleting…" : "Sending…");
    try {
      if (view === "signup") {
        const name = $("acName") ? $("acName").value.trim() : "";
        const u = await adapter.signUp(email, pass, name);
        authChain = authChain.then(() => applyUser(u)).catch(err => console.warn(err));
      } else if (view === "signin") {
        await adapter.signIn(email, pass);   // the sign-in callback finishes the job and closes this dialog
      } else if (view === "reset") {
        try { await adapter.sendReset(email); } catch (err) {
          if (!(err && err.code === "auth/user-not-found")) throw err;   // say the same thing either way
        }
        authUi.view = "resetsent";
        renderAuth();
      } else if (view === "delete") {
        const deletedUid = user && user.uid;
        await adapter.deleteAccount(pass);
        try { if (deletedUid) localStorage.removeItem(offeredKey(deletedUid)); } catch (e) { /* ignore */ }
        closeAuth();
      }
    } catch (err) {
      showAuthError(friendlyError(err), view === "delete" || view === "signin" ? "acPass" : "acEmail");
    } finally {
      if (authUi.view === view) setAuthBusy(false);
      else authUi.busy = false;
    }
  }

  /* =========================================================
     Start
  ========================================================= */

  document.addEventListener("csn:profile-panel", renderAccountSlot);
  document.addEventListener("csn:saved", onLocalSave);
  document.addEventListener("csn:cleared", onLocalSave);
  window.addEventListener("online", () => { if (user) runSync(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && user && Date.now() - sync.lastRunMs > 15000) runSync();
  });

  startAuth();
})();
