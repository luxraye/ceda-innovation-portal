# CEDA Innovation Portal (Lovable edition)

A youth innovation pipeline for CEDA Botswana: innovators submit ideas, the panel screens, scores and adjudicates them, and everyone tracks progress live.

Started in Lovable ("Visionary Blueprint") and completed outside it. Stack: TanStack Start, React 19, Tailwind 4, Supabase (Postgres, auth and realtime).

## What's in it

| Page | Who | What it does |
| --- | --- | --- |
| `/` | Everyone | Landing page |
| `/auth` | Everyone | Email sign-up and sign-in |
| `/dashboard` | Everyone | Innovators see their ideas and stage trackers. Staff see pipeline counts, live activity and a leaderboard |
| `/ideas/new` | Innovators | Submission form with mandatory-field checks, youth-ownership rule (>50%) and AI Pitch Coach |
| `/ideas/:id` | Owner and staff | Overview, live timeline, conversation thread, weighted scoring, decision panel, AI panel brief. Owners revise and resubmit when asked |
| `/review` | Evaluators, adjudicators, admins | Filterable, sortable queue of every submission |
| `/reports` | Staff | Charts by stage, sector and score, plus CSV export |
| `/admin` | Admins | Grant or remove roles, edit weighted scoring criteria |

The first account to sign up becomes the administrator. Everyone else starts as an innovator until an admin gives them a panel role.

## Run it on Windows

You need Node.js 20 or newer (https://nodejs.org).

1. Copy `.env.example` to `.env` and paste in the values from your Lovable project's `.env`.
2. In this folder, run:

```
npm install
npm run dev
```

3. Open the address it prints (usually http://localhost:8080).

If `npm run dev` fails with `EAFNOSUPPORT`, run `npx vite dev --host 127.0.0.1 --port 8080` instead.

If PowerShell blocks `npm` ("running scripts is disabled"), use Command Prompt (`cmd`) instead, or run `npm.cmd install` and `npm.cmd run dev`.

## Notes

- The database lives in the Lovable Cloud Supabase project, so data is shared with the Lovable preview.
- "Continue with Google" only works inside Lovable's hosting. Use email sign-in when running locally.
- Without `LOVABLE_API_KEY`, the AI Pitch Coach and panel brief use a built-in readiness checklist instead of the AI model.

## Checks

```
npx tsc --noEmit
npm test
npm run build
```
