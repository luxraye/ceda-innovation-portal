/* Static preview shim: keeps links inside the preview, makes it read-only. */
(function () {
  var C = window.__PREVIEW__ || {};
  var BP = C.bp || "";
  function fix(u) {
    if (typeof u === "string" && u.charAt(0) === "/" && u.charAt(1) !== "/" && u.indexOf(BP + "/") !== 0 && u !== BP) return BP + u;
    return u;
  }
  function toast(msg) {
    var t = document.getElementById("__pv_toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "__pv_toast";
      t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:90vw;text-align:center";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t.__h);
    t.__h = setTimeout(function () { t.style.display = "none"; }, 3500);
  }
  var RO = "This is a read-only preview, so saving and sending are switched off. Everything else is clickable.";
  var never = new Promise(function () {});
  // The preview has no service worker: a cached copy would hide new previews.
  if (navigator.serviceWorker) {
    try { navigator.serviceWorker.register = function () { return Promise.resolve({ update: function () {}, unregister: function () { return Promise.resolve(true); } }); }; } catch (e) {}
    try { navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }); } catch (e) {}
  }
  if (!C.live) {
  var of = window.fetch;
  window.fetch = function (input, init) {
    var method = (init && init.method) || (input && input.method) || "GET";
    var url0 = typeof input === "string" ? input : (input && input.url) || "";
    if (url0.indexOf("/api/auth/") >= 0) {
      var body = url0.indexOf("/api/auth/session") >= 0 ? (window.__PREVIEW_SESSION__ || {}) : {};
      // Signing out goes back to the preview's public home, not the site root.
      if (url0.indexOf("/api/auth/signout") >= 0) body = { url: location.origin + BP + "/" };
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));
    }
    if (String(method).toUpperCase() !== "GET") { toast(RO); return never; }
    if (typeof input === "string") input = fix(input);
    return of.call(this, input, init);
  };
  var oo = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    arguments[1] = fix(u);
    return oo.apply(this, arguments);
  };
  window.addEventListener("submit", function (e) {
    var f = e.target;
    var em = f.querySelector && f.querySelector('input[name="email"], input[type="email"]');
    var logins = C.logins || {};
    var key = em && em.value;
    if (key && logins[key]) { e.preventDefault(); e.stopImmediatePropagation(); location.href = BP + logins[key]; return; }
    if (C.loginPaths && C.loginPaths.some(function (p) { return location.pathname.indexOf(BP + p) === 0; }) && C.defaultHome) {
      e.preventDefault(); e.stopImmediatePropagation(); location.href = BP + C.defaultHome; return;
    }
    e.preventDefault(); e.stopImmediatePropagation(); toast(RO);
  }, true);
  }
  document.addEventListener("click", function (e) {
    if (C.clickLogins && C.loginPaths && C.loginPaths.some(function (p) { return location.pathname.indexOf(BP + p) === 0; })) {
      var btn = e.target.closest && e.target.closest("button");
      if (btn && !btn.closest("form")) {
        var txt = btn.textContent || "";
        for (var k in C.clickLogins) if (txt.indexOf(k) >= 0) { e.preventDefault(); e.stopImmediatePropagation(); location.href = BP + C.clickLogins[k]; return; }
      }
    }
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href");
    if (h && h.charAt(0) === "/" && h.indexOf(BP + "/") !== 0 && h.charAt(1) !== "/") a.setAttribute("href", fix(h));
  }, true);
  function bar() {
    if (!C.roles || window.__pvClosed || document.getElementById("__pv_bar")) return;
    var b = document.createElement("div");
    b.id = "__pv_bar";
    b.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483646;background:rgba(15,23,42,.92);color:#e2e8f0;border-radius:12px;padding:8px 10px;font:12px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3);display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:calc(100vw - 24px)";
    var lab = document.createElement("span");
    lab.textContent = (C.name || "Preview") + " · view as:";
    lab.style.cssText = "opacity:.75;margin-right:2px";
    b.appendChild(lab);
    var home = document.createElement("a");
    home.href = BP + "/"; home.textContent = "Public site";
    b.appendChild(home);
    C.roles.forEach(function (r) {
      var a = document.createElement("a");
      a.href = BP + r.home; a.textContent = r.label;
      b.appendChild(a);
    });
    var all = document.createElement("a");
    all.href = "/ceda-innovation-portal/"; all.textContent = "All versions";
    b.appendChild(all);
    [].forEach.call(b.querySelectorAll("a"), function (a) { a.style.cssText = "color:#fff;background:rgba(255,255,255,.12);padding:4px 8px;border-radius:7px;text-decoration:none"; });
    var x = document.createElement("button");
    x.textContent = "×"; x.title = "Hide";
    x.style.cssText = "background:none;border:0;color:#94a3b8;font-size:16px;cursor:pointer;padding:0 4px";
    x.onclick = function () { window.__pvClosed = true; b.remove(); };
    b.appendChild(x);
    document.body.appendChild(b);
    var st = document.createElement("style");
    st.textContent = "@media print{#__pv_bar,#__pv_toast{display:none!important}}";
    document.head.appendChild(st);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bar); else bar();
  setInterval(bar, 1500);
})();
