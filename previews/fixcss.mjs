import fs from "node:fs"; import path from "node:path";
const [, , dir, bp] = process.argv;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(dir).filter((f) => f.endsWith(".css"))) {
  const s = fs.readFileSync(f, "utf8");
  const t = s.replace(/url\((['"]?)\/(?!\/)/g, (m, q, off) => s.startsWith(bp.slice(1) + "/", off + m.length) ? m : `url(${q}${bp}/`);
  if (t !== s) fs.writeFileSync(f, t);
}
