# CEDA Innovation Portal

> **Your idea. Botswana's future.** One place for Botswana's youth-owned companies to submit ideas, and for CEDA to evaluate, track and award them fairly and in the open.

Built by **Local Grow (Pty) Ltd** (UIN BW00009995803) for the CEDA Innovation Portal Hackathon, November 2026. All people, companies and ideas in the demo are fictional.

## The problem, in one line

Good ideas get lost in inboxes: applications arrive as emailed PDFs, applicants hear nothing for months, scoring lives in spreadsheets, and a rejection comes without a reason.

## What the portal does

| For | What they get |
| --- | --- |
| **Young innovators** | Eligibility checked up front, one guided form that won't let you miss a required answer, a live tracker for every idea, feedback per criterion and a chance to resubmit |
| **Evaluators** | A queue with deadlines, a conflict-of-interest declaration before each idea opens, blind review, one-screen weighted scoring |
| **CEDA committee** | Rankings normalised for harsh and generous judges, panel disagreement flagged, decide with a recorded reason |
| **Programme managers** | Build a call (form, rubric, stages) without a developer, place it on the sector × venture-stage matrix, pipeline board, instance register with tamper checks, reports and CSV export |
| **Data Protection Officer** | Consent records, data-rights requests with due dates, retention rules, a breach register with a 72-hour clock |

## Calls are templates, ideas are instances

A call is a template: its form (with mandatory fields), rubric and stages, placed on CEDA's sector × venture-stage matrix. Every idea is an instance of one template: a sealed, versioned container of answers and documents. Submitting seals the answers and every document hash with SHA-256 and issues an HMAC-signed receipt (reference `CEDA-26-0001`). Admins see the matrix and an instance register at `/app/admin/instances`, where a tamper check re-hashes the sealed answers, re-verifies the receipt, and decrypts and re-hashes every stored document. Every check is written to the audit trail.

## Brand

Colours, logo mark and typeface follow ceda.co.bw: CEDA orange `#d94914`, the sunrise reds, oranges and ambers of the logo, the brown wordmark `#604038`, zinc greys, and Poppins. There are no script or italic display fonts.

## How it meets the brief (section 3.2)

| Requirement | Where to see it |
| --- | --- |
| (a) Submission interface | `/calls/youth-innovation-challenge-2026` → apply; `src/components/submission-form.tsx` |
| (b) Multi-level evaluation | Evaluator queue, committee board, `src/lib/scoring.ts`, `src/lib/workflow.ts` |
| (c) Real-time tracking | Stage tracker, timelines, live notification bell, pipeline board |
| (d) RBAC and security | `src/middleware.ts` + server-side checks in every action, `src/lib/access.ts`, hash-chained audit trail |
| (e) Feedback and iteration | Criterion-level feedback, "changes requested", versioned resubmissions with a word-level diff |
| (f) Reporting | `/app/reports`, pseudonymised CSV export, print to PDF |
| (g) Scalability | Calls, forms, rubrics and stages are data; Postgres in production; API and notification adapter seams |
| Data Protection Act 2024 | `/app/privacy`, `/app/dpo`, `/privacy` |

Press **Judge mode** in any workspace to show gold badges naming the requirement each screen answers. `/tour` walks through everything with one-click role sign-in.

## AI help

- **Pitch Coach** (apply form): checks the innovator's draft against the call's own rubric and returns a readiness score, strengths and the improvements worth making, each linked to the question it refers to. Advice only; it never scores.
- **Panel Brief** (evaluator review, committee and admin idea pages): evidence and gaps per rubric criterion, questions to ask and claims to verify. Built from the blind answers only, so it can't reveal or guess who applied, and it never scores or recommends.

Set `ANTHROPIC_API_KEY` to use Claude (`claude-opus-5-5` by default, with automatic fallback to another model if a request is refused). Without a key, both features use a built-in checklist with the same layout, so the demo always works. Every use is written to the audit trail and limited to 6 requests a minute per person.

## Security and integrity

- Sessions are signed JWTs in HttpOnly cookies; passwords are bcrypt-hashed; login is throttled.
- Role checks happen twice: at the route (middleware) and inside every server action and API.
- Evaluators can only open ideas assigned to them and only after declaring no conflict; review is blind.
- Uploaded files are hashed (SHA-256) in the browser and on the server, then encrypted with AES-256-GCM.
- Each submitted version is sealed (canonical JSON + file hashes → SHA-256) and receives an HMAC-signed receipt, verifiable at `/verify`.
- The audit trail is hash-chained: editing or deleting any past entry is detected at `/app/admin/audit`.

## Run it locally

Needs Node.js 20 or newer. No database server: local mode uses a SQLite file.

**Windows (PowerShell)**

```powershell
git clone https://github.com/luxraye/ceda-innovation-portal.git
cd ceda-innovation-portal
.\setup.ps1
npm run dev
```

**macOS / Linux**

```bash
git clone https://github.com/luxraye/ceda-innovation-portal.git
cd ceda-innovation-portal
cp .env.example .env   # then set AUTH_SECRET and FILE_ENCRYPTION_KEY
npm install && npm run setup
npm run dev
```

Open http://localhost:3000. Every demo account uses the password `CedaDemo2026!`:

| Role | Email |
| --- | --- |
| Innovator | naledi@demo.ceda.bw |
| Evaluator | thabo.eval@demo.ceda.bw |
| Adjudicator | lesego.adj@demo.ceda.bw |
| Programme admin | admin@demo.ceda.bw |
| Data Protection Officer | dpo@demo.ceda.bw |

`npm run db:reset` restores the demo data at any time.

## Production

Set `DATABASE_URL` to a PostgreSQL URL; the build switches the Prisma provider automatically (`scripts/select-provider.mjs`). Set `DEMO_MODE=false` to hide one-click demo sign-in. For live applicant data, host the database in Botswana to respect the Act's cross-border transfer rules.

## Stack

Next.js 15 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 (SQLite locally, PostgreSQL in production) · jose · bcrypt · Recharts · three.js (landing globe, built from Natural Earth data via `scripts/build-globe.mjs`) · Motion · Geist and Instrument Serif type · lucide-react.

## Photography

Photos in `public/photos` are from Unsplash (free to use under the Unsplash licence) by Ed Wingate, Wynand Uys, Justice Hubane, Iwaria Inc., Daniel Thomas, Christina @ wocintechchat, Ali Mkumbwa, ThisisEngineering, Richard Nyoni and Nathan Wong. The portal shows them in a warm CEDA duotone that turns to full colour on hover.
