import fs from "node:fs"; import path from "node:path";
const root = "/home/user/serve"; const [,, site] = process.argv;
const bp = "/ceda-innovation-portal/" + site;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === "_next" ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const pages = walk(path.join(root, bp)).filter((f) => f.endsWith(".html"));
const missing = new Map();
const exists = (u) => { let p = u.split(/[?#]/)[0]; const f = path.join(root, p); if (fs.existsSync(f) && fs.statSync(f).isFile()) return true; return fs.existsSync(path.join(f, "index.html")); };
for (const f of pages) {
  const h = fs.readFileSync(f, "utf8");
  const links = new Set();
  for (const m of h.matchAll(/href="(\/[^"#]*)/g)) links.add(m[1]);
  for (const m of h.matchAll(/\\"href\\":\\"(\/[^"\\#]*)/g)) links.add(bp + m[1]);
  for (const l of links) {
    if (!l.startsWith(bp) || l.includes("/_next/") || /logout|signout/.test(l)) continue;
    if (!exists(l)) { const k = l.split("?")[0]; missing.set(k, (missing.get(k) || []).concat(f.replace(root, ""))); }
  }
}
console.log(site, "pages:", pages.length, "missing targets:", missing.size);
for (const [k, v] of [...missing].slice(0, 25)) console.log("  ", k, "<-", v.length, "e.g.", v[0]);
