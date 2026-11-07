# CEDA Innovation Portal (Genspark prototype)

A second prototype for the CEDA Innovation Portal Hackathon, separate from Sky (the Next.js app on `main`). It was started in Genspark and finished here.

**Stack:** Hono on Cloudflare Pages/Workers, Cloudflare D1 (SQLite), and a vanilla JavaScript single-page app styled with Tailwind.

## Run it locally

You need Node 18 or newer.

```bash
cd genspark
npm install
npm run db:reset      # create the local D1 database and load demo data
npm run build
npx wrangler pages dev dist --local --ip 127.0.0.1 --port 8788
```

Open http://127.0.0.1:8788 for the landing page, or http://127.0.0.1:8788/app to go straight to the workspace.

The front end loads Tailwind, Font Awesome, Chart.js and Day.js from public CDNs, so the browser needs internet access.

## Demo accounts

Every demo account uses the password `Demo@2026`. On the sign-in page you can also click an account to sign in with it.

| Role | Email |
| --- | --- |
| Innovator | thabo@youthventures.bw, amantle@agritech.bw, kabelo@solarpay.bw |
| Evaluator | evaluator1@ceda.co.bw, evaluator2@ceda.co.bw, evaluator3@ceda.co.bw |
| Adjudicator | adjudicator@ceda.co.bw |
| Administrator | admin@ceda.co.bw |

## What each role can do

- **Innovator:** registers with data-protection consent and submits ideas through a five-step guided form. Drafts are saved automatically. Innovators track each idea on a stage tracker, read evaluator feedback and panel decisions, reply to the panel, add links to supporting documents, see earlier versions, resubmit after a revision request (the number of resubmissions is capped), and can withdraw an idea.
- **Evaluator:** works through a queue of assigned ideas and scores each one on a weighted scoring sheet with sliders. They add a comment per criterion, give a recommendation, write an overall comment for the innovator, and declare any conflict of interest. In blind rounds the innovator's identity is hidden.
- **Adjudicator:** sees ideas grouped by readiness: ready to decide (enough evaluations are in), being scored, needing evaluators, and approved. They assign evaluators and record decisions (advance, revise, reject, approve, award) with a rationale. The rationale is shared with the innovator. They can also download CSV reports.
- **Administrator:** has everything above, plus a programme dashboard with charts. Administrators set up rounds, criteria and weights, manage categories, manage users and roles, change programme settings (open or close submissions, the deadline, the resubmission limit), and read the audit log.

Every sign-in, submission, score, decision and export is written to an audit log. This supports accountability under Botswana's Data Protection Act, 2024.

## Project layout

```
genspark/
  src/index.tsx            Hono app, route mounting, page shells
  src/routes/*.ts          REST API: auth, ideas, evaluation, admin
  src/lib/core.ts          auth middleware, audit, notifications, scoring
  src/pages.ts             landing page and app shell HTML
  public/static/app.js     SPA core: API client, router, layout, auth pages
  public/static/views-*.js screens for innovators, evaluators/adjudicators, admins
  migrations/              D1 schema
  seed.sql                 demo data
```

## Deploy to Cloudflare

1. Create the database with `npx wrangler d1 create webapp-production`.
2. Put the `database_id` it returns into `wrangler.jsonc`.
3. Apply the schema and deploy:

```bash
npm run db:migrate:prod
npm run build
npx wrangler pages deploy dist --project-name ceda-innovation-portal
```

## Photography

Photos in `public/static/img` are from Unsplash (free to use under the Unsplash licence) by Ed Wingate, Wynand Uys, Justice Hubane, Iwaria Inc., Daniel Thomas, Christina @ wocintechchat, Ali Mkumbwa, ThisisEngineering, Richard Nyoni and Nathan Wong.
