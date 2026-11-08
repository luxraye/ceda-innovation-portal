import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [,, start, ...steps] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push("pageerror " + e.message));
p.on("console", (m) => { if (m.type() === "error") errs.push("console " + m.text().slice(0, 200)); });
p.on("response", (r) => { if (r.status() >= 400) errs.push(r.status() + " " + r.url()); });
await p.goto(start, { waitUntil: "networkidle" });
console.log("start:", await p.title(), "|", p.url());
for (const s of steps) {
  const [k, ...rest] = s.split(":"); const v = rest.join(":");
  try {
    if (k === "shot") await p.screenshot({ path: v });
    else if (k === "click") await p.click(v, { timeout: 8000 });
    else if (k === "goto") await p.goto(v, { waitUntil: "networkidle" });
    else if (k === "fill") { const [sel, val] = v.split("="); await p.fill(sel, val); }
    else if (k === "text") console.log("text:", (await p.innerText("body")).replace(/\s+/g, " ").slice(0, 300));
    await p.waitForLoadState("networkidle"); await p.waitForTimeout(1000);
    console.log(k, v, "->", p.url());
  } catch (e) { console.log("FAIL", s, e.message.split("\n")[0]); }
}
console.log(errs.slice(0, 15).join("\n"));
await b.close();
