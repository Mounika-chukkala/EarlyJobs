# EarlyJobs Mini ATS

A Mini Applicant Tracking System built with the **MERN** stack for the EarlyJobs.ai Full Stack Developer Intern assignment.

Manage candidates, move them through hiring stages, search the talent pool, and monitor dashboard metrics.

## Stack

- **MongoDB** + Mongoose
- **Express** REST API
- **React** (Vite) frontend
- **Node.js**

## Features

- Dashboard metrics: total candidates, active pipeline, hired count, open jobs, stage/source breakdown
- Candidate CRUD with skills, rating, source, notes, and job linking
- Search by name, email, role, or skills + filter by stage/source
- Candidate list pagination with selectable page sizes
- Stage-based pipeline with candidate cards, drag-and-drop, and stage updates
- Job openings management
- **Excel import/export** — upload Google Form / spreadsheet responses to create candidates; download template or export current data
- 50 varied sample candidates for testing pagination, search, and filters

See **[CODEBASE.md](./CODEBASE.md)** for a plain-language tour of the whole project.

## Project structure

```
EarlyJobs/
├── client/          # React + Vite
├── server/          # Express + MongoDB
├── package.json     # root scripts
└── README.md
```

## Prerequisites

- Node.js 18+
- For local demo without installing MongoDB, keep `MONGODB_URI=memory` (auto-seeded sample data)
- For GitHub/demo deployment, use a real MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) — this is the production MERN path

## Setup

```bash
# install root + server + client deps
npm install
npm run install:all

# configure env (defaults to in-memory MongoDB)
cp server/.env.example server/.env

# run API (port 5000) + UI (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### MongoDB Atlas (recommended)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Database Access** → create a DB user (username + password)
3. **Network Access** → add IP `0.0.0.0/0` (or your current IP) so the app can connect
4. **Connect** → Drivers → copy the URI, replace `<password>`, and add a DB name, e.g. `earlyjobs_ats`:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/earlyjobs_ats?retryWrites=true&w=majority
   ```
5. Put that URI in `server/.env` as `MONGODB_URI=...`
6. Restart the server (`npm run dev`). If the DB is empty, sample data is seeded automatically.

To wipe and re-seed Atlas: `npm run seed`

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stages` | Hiring stages |
| GET | `/api/dashboard/metrics` | Dashboard metrics |
| GET/POST | `/api/candidates` | List / create candidates |
| GET/PUT/DELETE | `/api/candidates/:id` | Candidate detail / update / delete |
| PATCH | `/api/candidates/:id/stage` | Update hiring stage |
| POST | `/api/candidates/:id/notes` | Add note |
| GET/POST | `/api/jobs` | List / create jobs |
| PUT/DELETE | `/api/jobs/:id` | Update / delete job |

Query params on `GET /api/candidates`: `q`, `stage`, `source`, `job`.

## Production build

```bash
npm run build
npm start
```

The Express server serves the built React app from `client/dist` and the API under `/api`.

Set environment variables on your host:

- `MONGODB_URI`
- `PORT`
- `CLIENT_ORIGIN` (your deployed frontend origin, comma-separated if needed)
- Optional client build var: `VITE_API_URL` (leave empty when API and UI share one origin)

## Demo checklist

1. Open Dashboard and review metrics
2. Search/filter candidates and try the pagination controls
3. Add or edit a candidate
4. Open a Pipeline stage, browse its candidate cards, and change a candidate's stage
5. Create a job and link it to a candidate

## Author

Built for the EarlyJobs.ai Full Stack Developer Intern screening assignment.
