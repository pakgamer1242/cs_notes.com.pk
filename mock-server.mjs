import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = '/home/claude/cs-notes';
const S = { complaints: new Map(), admins: new Set(), users: new Map(), byEmail: new Map(), tokens: new Map(), topics: new Map(), down: false, lastServer: 0, resets: [], verifies: 0 };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain' };
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const readBody = req => new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch (e) { r({}); } }); });
const authed = req => { const t = (req.headers.authorization || '').replace('Bearer ', ''); const uid = S.tokens.get(t); return uid ? S.users.get(uid) : null; };
const pub = u => ({ uid: u.uid, email: u.email, displayName: u.displayName, emailVerified: u.emailVerified });
const tick = () => { S.lastServer = Math.max(Date.now(), S.lastServer + 1); return S.lastServer; };
const ALLOWED = ['id', 'key', 'notes', 'resources', 'updatedAtMs'];
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); const p = url.pathname;
  if (!p.startsWith('/api/')) {
    const file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(file));
  }
  const body = req.method === 'POST' ? await readBody(req) : {};
  try {
    if (p === '/api/signup') {
      const email = String(body.email || '').toLowerCase();
      if (S.byEmail.has(email)) return json(res, 400, { code: 'auth/email-already-in-use' });
      if (String(body.password || '').length < 6) return json(res, 400, { code: 'auth/weak-password' });
      const u = { uid: 'u' + (S.users.size + 1) + Math.random().toString(36).slice(2, 6), email, password: body.password, displayName: body.displayName || '', emailVerified: false };
      S.users.set(u.uid, u); S.byEmail.set(email, u.uid);
      const token = 't' + Math.random().toString(36).slice(2); S.tokens.set(token, u.uid);
      return json(res, 200, { token, user: pub(u) });
    }
    if (p === '/api/signin') {
      const uid = S.byEmail.get(String(body.email || '').toLowerCase()); const u = uid && S.users.get(uid);
      if (!u || u.password !== body.password) return json(res, 400, { code: 'auth/invalid-credential' });
      const token = 't' + Math.random().toString(36).slice(2); S.tokens.set(token, u.uid);
      return json(res, 200, { token, user: pub(u) });
    }
    if (p === '/api/me') { const u = authed(req); return u ? json(res, 200, { user: pub(u) }) : json(res, 401, { code: 'auth/session-expired' }); }
    if (p === '/api/signout') { S.tokens.delete((req.headers.authorization || '').replace('Bearer ', '')); return json(res, 200, {}); }
    if (p === '/api/reset') { S.resets.push(body.email); return json(res, 200, {}); }
    if (p === '/api/verify') { S.verifies++; return json(res, 200, {}); }
    if (p === '/api/topics') {
      if (S.down) return json(res, 503, { code: 'unavailable' });
      const u = authed(req); if (!u) return json(res, 403, { code: 'permission-denied' });
      const mine = S.topics.get(u.uid) || new Map();
      if (req.method === 'GET') { const since = Number(url.searchParams.get('since')) || 0; return json(res, 200, { docs: [...mine.values()].filter(d => d.serverMs >= since) }); }
      for (const d of body.docs || []) {
        const bad = Object.keys(d).some(k => !ALLOWED.includes(k)) || typeof d.notes !== 'string' || d.notes.length > 50000 || !Array.isArray(d.resources) || d.resources.length > 100 || typeof d.key !== 'string';
        if (bad) return json(res, 403, { code: 'permission-denied' });
      }
      if (!S.topics.has(u.uid)) S.topics.set(u.uid, mine);
      for (const d of body.docs || []) mine.set(d.id, Object.assign({}, d, { serverMs: tick() }));
      return json(res, 200, {});
    }
    if (p === '/api/delete') {
      const u = authed(req); if (!u) return json(res, 403, { code: 'permission-denied' });
      if (u.password !== body.password) return json(res, 400, { code: 'auth/invalid-credential' });
      S.topics.delete(u.uid); S.users.delete(u.uid); S.byEmail.delete(u.email);
      for (const [t, uid] of [...S.tokens]) if (uid === u.uid) S.tokens.delete(t);
      return json(res, 200, {});
    }
    if (p === '/api/complaints') {
      if (S.down) return json(res, 503, { code: 'unavailable' });
      const d = body; const KEYS = ['id', 'createdAt', 'type', 'description', 'contact', 'page', 'env', 'features'];
      const isMapOrNull = v => v === null || v === undefined || (typeof v === 'object' && !Array.isArray(v));
      const bad = Object.keys(d).some(k => !KEYS.includes(k)) || typeof d.id !== 'string' || !/^[A-Za-z0-9]{1,40}$/.test(d.id) || typeof d.createdAt !== 'string' ||
        !['compatibility', 'display', 'content', 'suggestion', 'other'].includes(d.type) || typeof d.description !== 'string' || d.description.length < 1 || d.description.length > 2000 ||
        (d.contact !== undefined && (typeof d.contact !== 'string' || d.contact.length > 200)) || !isMapOrNull(d.page) || !isMapOrNull(d.env) || !isMapOrNull(d.features);
      if (bad || S.complaints.has(d.id)) return json(res, 403, { code: 'permission-denied' });
      S.complaints.set(d.id, Object.assign({}, d, { docId: d.id, status: 'new', receivedMs: tick() }));
      return json(res, 200, {});
    }
    if (p.startsWith('/api/admin/')) {
      const u = authed(req);
      if (p === '/api/admin/me') return json(res, 200, { admin: !!(u && S.admins.has(u.uid)) });
      if (!u || !S.admins.has(u.uid)) return json(res, 403, { code: 'permission-denied' });
      if (S.down) return json(res, 503, { code: 'unavailable' });
      if (p === '/api/admin/complaints') {
        const limit = Number(url.searchParams.get('limit')) || 200; const after = Number(url.searchParams.get('after')) || 0;
        return json(res, 200, { docs: [...S.complaints.values()].sort((a, b) => b.receivedMs - a.receivedMs).filter(c => !after || c.receivedMs < after).slice(0, limit) });
      }
      if (p === '/api/admin/update') {
        const c = S.complaints.get(body.docId); const patch = body.patch || {};
        const ok = c && Object.keys(patch).every(k => ['status', 'adminNote', 'updatedAtMs'].includes(k)) && (patch.status === undefined || ['new', 'in-progress', 'resolved', 'dismissed'].includes(patch.status)) && (patch.adminNote === undefined || (typeof patch.adminNote === 'string' && patch.adminNote.length <= 2000));
        if (!ok) return json(res, 403, { code: 'permission-denied' });
        Object.assign(c, patch); return json(res, 200, {});
      }
      if (p === '/api/admin/delete') { (body.docIds || []).forEach(id => S.complaints.delete(id)); return json(res, 200, {}); }
    }
    if (p === '/api/_admin') {
      if ('down' in body) S.down = !!body.down;
      if (body.revoke) S.tokens.clear();
      if (body.makeAdmin) { const uid = S.byEmail.get(body.makeAdmin); if (uid) S.admins.add(uid); }
      if (body.clearComplaints) S.complaints.clear();
      return json(res, 200, {});
    }
    if (p === '/api/_dump') {
      const topics = {}; for (const [uid, m] of S.topics) topics[S.users.get(uid) ? S.users.get(uid).email : uid] = Object.fromEntries(m);
      return json(res, 200, { complaints: [...S.complaints.values()], users: [...S.users.values()].map(pub), topics, resets: S.resets, verifies: S.verifies });
    }
  } catch (e) { return json(res, 500, { code: 'internal', message: String(e) }); }
  json(res, 404, { code: 'no-route' });
});
export function start(port) { return new Promise(r => server.listen(port, () => r(server))); }
