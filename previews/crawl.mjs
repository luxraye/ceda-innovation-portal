// Usage: node crawl.mjs config.json
// Crawls a running app as each role and writes a static copy.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";
import path from "node:path";

const cfg = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const { origin, bp, out } = cfg;
const saved = new Set();
const skip = (p) => /\/(logout|sign-?out)\b/i.test(p) || p.includes("/_next/") || /\.(png|jpe?g|svg|webp|ico|json|js|css|pdf|csv|txt|xml|woff2?)$/i.test(p) && !cfg.saveExt;
const maxPages = cfg.maxPages || 400;

function norm(href, from) {
  try {
    const u = new URL(href, origin + from);
    if (u.origin !== origin) return null;
    let p = u.pathname;
    if (!p.startsWith(bp + "/") && p !== bp) return null;
    p = p.slice(bp.length) || "/";
    if (!p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) p += "/";
    return p;
  } catch { return null; }
}

function extractLinks(html, from) {
  const links = new Set();
  // attributes
  for (const m of html.matchAll(/href="([^"#]+)/g)) links.add(m[1]);
  // RSC payload strings like \"href\":\"/app/x\"
  for (const m of html.matchAll(/\\?"href\\?":\\?"(\/[^"\\#?]*)/g)) links.add(bp + m[1]);
  for (const m of html.matchAll(/\\"(\/app\/[^"\\#?]*)\\"/g)) links.add(bp + m[1]);
  (cfg.extraLinkRe || []).forEach((re) => { for (const m of html.matchAll(new RegExp(re, "g"))) links.add(bp + m[1]); });
  return [...links].map((l) => norm(l.startsWith("/") && !l.startsWith(bp) && !l.startsWith("//") ? bp + l : l, from)).filter(Boolean);
}

function rewriteHtml(html, role) {
  // prefix root-relative attribute URLs outside <script> blocks
  const parts = html.split(/(<script[\s\S]*?<\/script>)/i);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/(\s(?:href|src|action|poster|data-src)=")\/(?!\/)/g, (m, a, off, s) => {
      return s.startsWith(bp.slice(1) + "/", off + m.length) || s.startsWith(bp.slice(1) + '"', off + m.length) ? m : a + bp + "/";
    }).replace(/(\ssrcset=")([^"]*)/g, (m, a, v) => a + v.replace(/(^|,\s*)\/(?!\/)/g, (x, s) => s + bp + "/").replace(new RegExp(bp.replace(/\//g, "\\/") + bp.replace(/\//g, "\\/"), "g"), bp))
      .replace(/url\((['"]?)\/(?!\/)/g, (m, q, off, s) => s.startsWith(bp.slice(1), off + m.length) ? m : `url(${q}${bp}/`);
  }
  html = parts.join("");
  const conf = JSON.stringify({ bp, name: cfg.name, roles: cfg.roles.filter(r=>!r.hidden).map((r) => ({ label: r.label, home: r.home })), logins: cfg.logins || {}, clickLogins: cfg.clickLogins, loginPaths: cfg.loginPaths || [], defaultHome: cfg.defaultHome });
  const sess = role && role.session ? `window.__PREVIEW_SESSION__=${JSON.stringify(role.session)};` : "";
  const inject = `<script>window.__PREVIEW__=${conf};${sess}</script><script src="${bp}/__preview-shim.js"></script>`;
  return html.replace(/<head([^>]*)>/i, `<head$1>${inject}`);
}

function save(p, body) {
  const file = path.join(out, p.endsWith("/") ? p + "index.html" : p);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

const browser = await chromium.launch();
const redirects = {};
for (const role of [{ name: "public", label: "Public", start: cfg.publicStart || ["/"] }, ...cfg.roles]) {
  const ctx = await browser.newContext({ baseURL: origin });
  const page = await ctx.newPage();
  if (role.login) {
    for (const step of role.login) {
      if (step.goto) await page.goto(origin + bp + step.goto, { waitUntil: "networkidle" });
      if (step.fill) await page.fill(step.fill[0], step.fill[1]);
      if (step.click) { await page.click(step.click); }
      if (step.waitUrl) await page.waitForURL(new RegExp(step.waitUrl), { timeout: 30000 });
      if (step.wait) await page.waitForTimeout(step.wait);
      if (step.eval) await page.evaluate(step.eval);
      if (step.cookie) await ctx.addCookies([{ name: step.cookie[0], value: step.cookie[1], url: origin }]);
    }
    console.log(role.name, "logged in at", page.url());
  }
  const queue = [...(role.start || [role.home])];
  const seen = new Set();
  let count = 0;
  while (queue.length && count < maxPages) {
    const p = queue.shift();
    if (seen.has(p) || skip(p)) continue;
    seen.add(p);
    const res = await ctx.request.get(origin + bp + p, { maxRedirects: 0, failOnStatusCode: false });
    const st = res.status();
    if (st >= 300 && st < 400) {
      const loc = res.headers()["location"];
      const n = loc && norm(loc, p);
      if (n && !redirects[p] ) redirects[p] = n;
      if (n) queue.push(n);
      continue;
    }
    const ct = res.headers()["content-type"] || "";
    if (st !== 200 || !ct.includes("text/html")) continue;
    const html = await res.text();
    count++;
    for (const l of extractLinks(html, bp + p)) if (!seen.has(l)) queue.push(l);
    const owned = (role.own || []).some((pre) => p.startsWith(pre));
    if (saved.has(p) && !owned) continue;
    if (saved.has(p) && owned && saved.has("owned:" + p)) continue;
    saved.add(p); if (owned) saved.add("owned:" + p);
    save(p, rewriteHtml(html, role));
  }
  for (const api of role.api || []) {
    const res = await ctx.request.get(origin + bp + api, { failOnStatusCode: false });
    if (res.ok()) save(api.endsWith("/") ? api : api + "/", await res.text());
  }
  console.log(role.name, "pages:", count);
  await ctx.close();
}
// redirect stubs for paths that only redirect
for (const [from, to] of Object.entries(redirects)) {
  if (saved.has(from)) continue;
  save(from, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${bp}${to}"><script>location.replace(${JSON.stringify(bp + to)})</script>`);
}
await browser.close();
console.log("saved", [...saved].filter((s) => !s.startsWith("owned:")).length, "pages");
