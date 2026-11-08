import { landingPage, appShell } from "/home/user/builds/genspark/genspark/src/pages";
import fs from "node:fs";
const BP = "/ceda-innovation-portal/genspark";
const out = "/home/user/site/genspark";
const fix = (h: string) => h
  .replace(/(href|src)="\/(?!\/)/g, `$1="${BP}/`)
  .replace(/url\((['"]?)\/(?!\/)/g, `url($1${BP}/`)
  .replace(new RegExp(BP + "/app#", "g"), BP + "/app/#");
fs.mkdirSync(out + "/app", { recursive: true });
fs.writeFileSync(out + "/index.html", fix(String(landingPage())));
const shell = fix(String(appShell())).replace(`<script src="${BP}/static/app.js"></script>`, `<script src="${BP}/static/preview-backend.js"></script>\n  <script src="${BP}/static/app.js"></script>`);
fs.writeFileSync(out + "/app/index.html", shell);
