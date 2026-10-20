# EarlyJobs Mini ATS — Codebase Guide

This document explains the **whole project** in plain language: folders, how data flows, and where to change things.

---

## What this app does

A small **Applicant Tracking System (ATS)** for EarlyJobs:

1. See hiring **metrics** on the Dashboard
2. Manage **candidates** (add, edit, search, notes, pagination)
3. Review candidates by **hiring stage** and move them through Pipeline
4. Manage **job openings**
5. **Import / export Excel** (including Google Form response sheets)

Stack: **MongoDB + Express + React + Node** (MERN).

---

## Folder map (start here)

```
EarlyJobs/
├── README.md                 ← How to install & run
├── CODEBASE.md               ← This file (how the code works)
├── package.json              ← Root scripts (run client + server together)
│
├── client/                   ← FRONTEND (React + Vite)
│   ├── index.html
│   ├── vite.config.js        ← Dev server + /api proxy → port 5000
│   └── src/
│       ├── main.jsx          ← App entry
│       ├── App.jsx           ← Layout + routes (nav)
│       ├── api.js            ← All HTTP calls to the backend
│       ├── styles.css        ← Tailwind import, theme tokens, animations, base styles
│       ├── pages/            ← Full screens
│       │   ├── Dashboard.jsx
│       │   ├── Candidates.jsx   ← paginated list + search + Excel import/export
│       │   ├── Pipeline.jsx     ← stage tabs + candidate card grid
│       │   └── Jobs.jsx
│       └── components/       ← Reusable UI pieces
│           ├── CandidateForm.jsx
│           ├── Modal.jsx
│           └── StageBadge.jsx
│
└── server/                   ← BACKEND (Express API)
    ├── .env                  ← Secrets / config (not committed)
    ├── .env.example          ← Template for env vars
    └── src/
        ├── index.js          ← Starts server, mounts routes
        ├── config/db.js      ← Chooses memory vs MongoDB Atlas
        ├── constants/stages.js
        ├── data/sampleData.js← Demo jobs + candidates
        ├── seed.js / seedData.js
        ├── models/           ← Mongoose schemas (used with Atlas)
        │   ├── Candidate.js
        │   └── Job.js
        ├── store/            ← Business logic for data
        │   ├── index.js      ← Picks memoryStore or mongoStore
        │   ├── memoryStore.js
        │   └── mongoStore.js
        ├── routes/           ← HTTP endpoints
        │   ├── candidates.js ← CRUD + Excel import/export
        │   ├── jobs.js
        │   └── dashboard.js
        └── utils/excel.js    ← Parse / build Excel files
```

---

## How a request flows

Example: user clicks **Import Excel** on Candidates page.

```
Browser (Candidates.jsx)
    → api.importExcel(file)          // client/src/api.js
    → POST /api/candidates/import/excel
    → Express route                  // server/src/routes/candidates.js
    → parseCandidatesFromExcel()     // server/src/utils/excel.js
    → store().bulkCreateCandidates() // memoryStore OR mongoStore
    → JSON response { imported, skipped, ... }
    → UI reloads candidate list + pipeline/dashboard see new people
```

Same pattern for everything else: **Page → api.js → route → store → database**.

---

## Database: memory vs Atlas

Controlled by `server/.env`:

| `MONGODB_URI` | Behavior |
|---|---|
| `memory` | In-memory arrays. Fast local demo. **Data resets when server restarts.** |
| `mongodb+srv://...` | Real **MongoDB Atlas**. Data persists. This is what you want for the assignment deploy. |

Code switch:

- `server/src/config/db.js` sets mode
- `server/src/store/index.js` returns `memoryStore` or `mongoStore`
- Routes never talk to Mongo/memory directly — they always call `store()`

**Not “realtime” websockets.** The UI fetches data when you open a page or after you take an action (create, import, move stage). With Atlas, that data is still the real shared database.

---

## Hiring stages

Defined once in `server/src/constants/stages.js`:

`Applied → Screening → Interview → Offer → Hired` (+ `Rejected`)

Used by:

- Candidate model / forms
- Pipeline columns
- Dashboard charts

---

## Main features (where the code lives)

### 1. Dashboard metrics
- **UI:** `client/src/pages/Dashboard.jsx`
- **API:** `GET /api/dashboard/metrics`
- **Logic:** `store().metrics()` counts candidates by stage/source, recent apps, open jobs

### 2. Candidates CRUD + search + pagination
- **UI:** `client/src/pages/Candidates.jsx`
- **API:** `GET/POST /api/candidates`, `PUT/DELETE /api/candidates/:id`
- Search query params: `q`, `stage`, `source`; pagination is applied to the filtered results in the UI
- Sample data includes 50 candidates to exercise search, filters, and page controls

### 3. Pipeline
- **UI:** `client/src/pages/Pipeline.jsx`
- Select a stage to show its candidate card grid; drag a card to a stage tab or change its dropdown → `PATCH /api/candidates/:id/stage`
- Same candidate records as the Candidates page (one source of truth)

### 4. Jobs
- **UI:** `client/src/pages/Jobs.jsx`
- **API:** `/api/jobs`
- Candidates can link to a job by id or (on import) by matching **job title**

### 5. Excel import / export ⭐
- **UI:** Candidates page → Template / Import / Export buttons
- **Parse & build files:** `server/src/utils/excel.js`
- **Endpoints:**
  - `GET /api/candidates/import/template` — blank template + column guide
  - `POST /api/candidates/import/excel` — upload `.xlsx` / `.xls` / `.csv`
  - `GET /api/candidates/export/excel` — download all current candidates

**Import rules:**
- Required columns: **Name**, **Email** (Google Form header names also work, e.g. “Email Address”)
- Optional: phone, role, skills, stage, source, rating, resume URL, job title, notes
- Duplicate **emails** are skipped
- New people show up in Candidates, Pipeline, and Dashboard automatically

---

## Frontend routing

`client/src/App.jsx` uses React Router:

| Path | Page |
|---|---|
| `/` | Dashboard |
| `/candidates` | Candidates + Excel |
| `/pipeline` | Pipeline board |
| `/jobs` | Jobs |

Vite proxies `/api/*` to `http://localhost:5000` in development (`client/vite.config.js`).

---

## Useful scripts

From project root:

```bash
npm run install:all   # install server + client deps
npm run dev           # API :5000 + UI :5173
npm run seed          # wipe + re-seed (needs real Mongo URI)
npm run build         # build React for production
npm start             # serve API (+ built UI if client/dist exists)
```

---

## Env vars (`server/.env`)

```env
PORT=5000
MONGODB_URI=memory          # or Atlas connection string
AUTO_SEED=true              # seed empty Atlas DB on startup
CLIENT_ORIGIN=http://localhost:5173
```

Never commit real passwords. `.env` is in `.gitignore`.

---

## Where to change common things

| Goal | Edit |
|---|---|
| Add a hiring stage | `server/src/constants/stages.js` + UI selects |
| Change sample demo data | `server/src/data/sampleData.js` |
| Add a candidate field | Model (`Candidate.js`) + both stores + form + excel mapping |
| Change Excel columns / Google Form headers | `server/src/utils/excel.js` → `HEADER_ALIASES` |
| Restyle the site | Tailwind classes in components; theme and global styles in `client/src/styles.css` |
| Add a new page | Create under `client/src/pages/` + link in `App.jsx` |

---

## Mental model (one sentence)

**React screens call `api.js` → Express routes call `store()` → memory or MongoDB Atlas holds candidates/jobs → Dashboard & Pipeline just read that same data.**

If you remember that path, you can find almost any feature in under a minute.
