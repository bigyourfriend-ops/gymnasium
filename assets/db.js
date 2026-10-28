/* Клиент базы данных сайта (сервер — api/ на хостинге ps.kz, MySQL).
   Повторяет ту часть интерфейса supabase-js, которой пользуется сайт: sb.from(), sb.rpc(), sb.auth, sb.storage.
   Поэтому остальной код сайта почти не менялся при переезде с Supabase. */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var API = CFG.apiUrl || "api/";
  var KEY = "gm-session";
  var sess = null, listeners = [], pendingEvent = null;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null") } catch (e) { return null } }
  function save(s) { sess = s; try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY) } catch (e) { } }
  function emit(ev) { var s = sess; listeners.forEach(function (fn) { try { fn(ev, s) } catch (e) { if (window.console) console.error(e) } }) }
  sess = load();

  /* ссылка из письма: #gm_auth=<токен>&type=signup|recovery */
  (function () {
    var m = /gm_auth=([a-f0-9]{64})(?:&type=([a-z]+))?/.exec(location.hash || "");
    if (!m) return;
    save({ access_token: m[1], user: null });
    pendingEvent = m[2] === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN";
    try { history.replaceState(null, "", location.pathname + location.search + (m[2] === "recovery" ? "#home" : "#profile")) } catch (e) { }
  })();

  function call(action, payload, form) {
    var h = {};
    if (sess && sess.access_token) { h.Authorization = "Bearer " + sess.access_token; h["X-GM-Token"] = sess.access_token }   // второй заголовок — если Apache не передаёт Authorization в PHP
    var body;
    if (form) body = form; else { h["Content-Type"] = "application/json"; body = JSON.stringify(payload || {}) }
    return fetch(API + "?a=" + action, { method: "POST", headers: h, body: body, cache: "no-store", credentials: "same-origin" })
      .then(function (r) { return r.json().catch(function () { return { data: null, error: { message: "bad_response", code: String(r.status) } } }) })
      .then(function (j) {
        if (!j || typeof j !== "object") j = { data: null, error: { message: "bad_response" } };
        if (j.error && j.error.code === "session_expired" && sess) { save(null); emit("SIGNED_OUT") }
        if (j.data === undefined) j.data = null;
        return j;
      }, function (e) { return { data: null, error: { message: "network: " + (e && e.message || e), code: "network" } } });
  }

  /* ---------- sb.from(table) ---------- */
  function Query(table) { this.q = { table: table, op: "select", cols: "*", filters: [], order: [], limit: null, single: null, values: null } }
  Query.prototype.select = function (cols) { if (this.q.op === "select") this.q.cols = cols || "*"; return this };
  Query.prototype.eq = function (c, v) { this.q.filters.push([c, "eq", v]); return this };
  Query.prototype.in = function (c, v) { this.q.filters.push([c, "in", v]); return this };
  Query.prototype.order = function (c, o) { this.q.order.push([c, !(o && o.ascending === false)]); return this };
  Query.prototype.limit = function (n) { this.q.limit = n; return this };
  Query.prototype.maybeSingle = function () { this.q.single = "maybe"; return this };
  Query.prototype.single = function () { this.q.single = "one"; return this };
  Query.prototype.insert = function (v) { this.q.op = "insert"; this.q.values = v; return this };
  Query.prototype.upsert = function (v) { this.q.op = "upsert"; this.q.values = v; return this };
  Query.prototype.update = function (v) { this.q.op = "update"; this.q.values = v; return this };
  Query.prototype["delete"] = function () { this.q.op = "delete"; return this };
  Query.prototype.then = function (ok, bad) { return call("db", this.q).then(ok, bad) };
  Query.prototype["catch"] = function (bad) { return this.then(null, bad) };

  function setUserFromResponse(r) {
    var d = r && r.data;
    if (d && d.session) { save(d.session); return true }
    if (d && d.user && sess) { sess.user = d.user; save(sess) }
    return false;
  }

  var auth = {
    getSession: function () { return Promise.resolve({ data: { session: sess && sess.user ? sess : null }, error: null }) },
    getUser: function () { return Promise.resolve({ data: { user: sess && sess.user || null }, error: null }) },
    signInWithPassword: function (o) {
      return call("login", { email: o.email, password: o.password }).then(function (r) {
        if (!r.error && setUserFromResponse(r)) emit("SIGNED_IN");
        return { data: r.data || { user: null, session: null }, error: r.error };
      });
    },
    signUp: function (o) {
      var data = (o.options && o.options.data) || {};
      return call("signup", { email: o.email, password: o.password, data: data }).then(function (r) {
        if (!r.error && setUserFromResponse(r)) emit("SIGNED_IN");
        return { data: r.data || { user: null, session: null }, error: r.error };
      });
    },
    signOut: function (o) {
      return call("logout", { scope: o && o.scope || "local" }).then(function () { save(null); emit("SIGNED_OUT"); return { error: null } });
    },
    resetPasswordForEmail: function (email) { return call("recover", { email: email }) },
    updateUser: function (o) {
      return call("update_user", o || {}).then(function (r) {
        if (!r.error) { setUserFromResponse(r); emit("USER_UPDATED") }
        return { data: r.data, error: r.error };
      });
    },
    onAuthStateChange: function (fn) {
      listeners.push(fn);
      setTimeout(function () {
        if (!sess) { fn("INITIAL_SESSION", null); return }
        call("user", {}).then(function (r) {
          if (r.error || !r.data || !r.data.user) {
            if (r.error && r.error.code === "network") { if (sess.user) fn("INITIAL_SESSION", sess); return }   // нет сети — работаем с сохранённым входом
            save(null); fn("SIGNED_OUT", null); return;
          }
          sess.user = r.data.user; save(sess);
          var ev = pendingEvent || "INITIAL_SESSION"; pendingEvent = null;
          fn(ev, sess);
        });
      }, 0);
      return { data: { subscription: { unsubscribe: function () { listeners = listeners.filter(function (x) { return x !== fn }) } } } };
    }
  };

  function siteBase() { return (CFG.siteUrl || (location.origin + location.pathname.replace(/[^/]*$/, ""))).replace(/\/?$/, "/") }
  var storage = {
    from: function (bucket) {
      return {
        upload: function (path, file, opts) {
          var fd = new FormData();
          fd.append("path", path);
          fd.append("upsert", opts && opts.upsert ? "1" : "0");
          fd.append("file", file, String(path).split("/").pop());
          return call("upload", null, fd);
        },
        getPublicUrl: function (path) { return { data: { publicUrl: siteBase() + "uploads/" + bucket + "/" + path } } }
      };
    }
  };

  window.GMDB = {
    from: function (t) { return new Query(t) },
    rpc: function (fn, args) { return call("rpc", { fn: fn, args: args || {} }) },
    auth: auth,
    storage: storage,
    token: function () { return sess && sess.access_token || "" }
  };
})();
