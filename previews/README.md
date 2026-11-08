# Preview builds

Static previews of every CEDA portal version, published to GitHub Pages from the `gh-pages` branch:
https://luxraye.github.io/ceda-innovation-portal/

Nothing here changes the apps themselves. These scripts make a demo build of each version that needs no database, no backend and no sign-in.

| Version | Source | How the preview works |
| --- | --- | --- |
| Sky (`/sky/`) | `main` | Next.js app run locally on SQLite, crawled as each demo role, saved as static pages (`build-site.sh` + `crawl.mjs`). |
| Sky upgraded (`/skyplus/`) | `claude/project-thread-jv14ng` (PR #1) | Same as Sky. |
| Arena (`/arena/`) | `claude/project-thread-avjxpq` | Same as Sky. |
| Genspark (`/genspark/`) | `genspark-app` | The Hono API runs inside the browser on sql.js (SQLite in WebAssembly) with the seed data (`genspark/entry.ts`). |
| Lovable (`/lovable/`) | `lovable-app` | Built as a single-page app with an in-browser stand-in for Supabase and demo data (`lovable/client.ts`). |
| CEDA on the regulator base (`/regulator/`) | `luxraye/regulator` `main` | Next.js app run on a local Postgres, crawled like Sky. Sessions are minted with `regulator-mint-session.mjs`. |

`shim.js` is added to every crawled page. It keeps links inside the preview, adds the "view as" role bar, and makes saving read-only.

To rebuild a Next.js version: check out its branch, run `patch-next.sh <dir> /ceda-innovation-portal/<name>`, install, seed the demo database, `npm run build`, then `build-site.sh <dir> <config>.json <port>`.
