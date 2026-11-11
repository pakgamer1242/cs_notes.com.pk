(function () {
  const tok = () => localStorage.getItem('mock-token'); let cb = null;
  async function call(path, method, body) {
    let res;
    try { res = await fetch('/api' + path, { method: method || 'GET', headers: Object.assign({ 'Content-Type': 'application/json' }, tok() ? { Authorization: 'Bearer ' + tok() } : {}), body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { const err = new Error('network'); err.code = 'unavailable'; throw err; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const err = new Error(data.code || 'error'); err.code = data.code || 'unavailable'; err.status = res.status; throw err; }
    return data;
  }
  const setSession = d => { localStorage.setItem('mock-token', d.token); localStorage.setItem('mock-user', JSON.stringify(d.user)); };
  const clearSession = () => { localStorage.removeItem('mock-token'); localStorage.removeItem('mock-user'); };
  window.CSN_CLOUD_ADAPTER = {
    name: 'mock',
    onAuthChange(c) { cb = c; (async () => { if (!tok()) return c(null); try { c((await call('/me')).user); } catch (e) { if (e.status === 401) { clearSession(); c(null); } else c(JSON.parse(localStorage.getItem('mock-user') || 'null')); } })(); },
    async signUp(email, password, displayName) { const d = await call('/signup', 'POST', { email, password, displayName }); setSession(d); cb && cb(d.user); return d.user; },
    async signIn(email, password) { const d = await call('/signin', 'POST', { email, password }); setSession(d); cb && cb(d.user); return d.user; },
    async signOut() { try { await call('/signout', 'POST', {}); } catch (e) {} clearSession(); cb && cb(null); },
    async sendReset(email) { await call('/reset', 'POST', { email }); },
    async sendVerification() { await call('/verify', 'POST', {}); },
    async fetchTopics(since) { return (await call('/topics?since=' + since)).docs; },
    async pushTopics(docs) { await call('/topics', 'POST', { docs }); },
    async sendComplaint(r) { await call('/complaints', 'POST', { id: r.id, createdAt: r.createdAt, type: r.type, description: r.description, contact: r.contact || '', page: r.page || null, env: r.env || null, features: r.features || null }); },
    async isAdmin() { try { return !!(await call('/admin/me')).admin; } catch (e) { return false; } },
    async adminList(max, after) { return (await call('/admin/complaints?limit=' + max + '&after=' + (after || 0))).docs; },
    async adminUpdate(docId, patch) { await call('/admin/update', 'POST', { docId, patch: Object.assign({}, patch, { updatedAtMs: Date.now() }) }); },
    async adminDelete(docIds) { await call('/admin/delete', 'POST', { docIds }); },
    async deleteAccount(password) { await call('/delete', 'POST', { password }); clearSession(); cb && cb(null); },
  };
})();
