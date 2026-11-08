// Saves GET API responses the static pages fetch or link to, so they work in the preview.
// Usage: node saveapi.mjs <config.json> <list-file of "rolename url-path-with-bp" lines>
import fs from "node:fs"; import path from "node:path";
const [,, cfgPath, listPath] = process.argv;
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
const cookieFor = (role) => { const r = cfg.roles.find((x) => x.name === role) || cfg.roles.find((x) => x.name === "super"); const [n, v] = r.login[0].cookie; return `${n}=${v}`; };
const lines = fs.readFileSync(listPath, "utf8").split("\n").filter(Boolean);
let ok = 0;
for (const line of lines) {
  const [role, p] = line.split(" ");
  const res = await fetch(cfg.origin + p + "/", { headers: { cookie: cookieFor(role) }, redirect: "manual" });
  if (res.status !== 200) { console.log("skip", res.status, role, p); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const f = path.join(cfg.out, p.slice(cfg.bp.length));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { fs.writeFileSync(path.join(f, "index.html"), buf); } else { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); }
  ok++;
}
console.log("saved", ok, "of", lines.length);
