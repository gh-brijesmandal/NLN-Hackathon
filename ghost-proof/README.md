# Ghost-Proof — AI Job Application Intelligence

A React + TypeScript + Tailwind CSS app that turns rejection emails into actionable skill gap data using Claude AI.

---

## Features

- **Dashboard** — live application tracker with ghost probability bars and skill gap summary
- **Rejection Parser** — Claude AI reads rejection emails and extracts hidden skill gaps
- **Skill Heatmap** — bubble visualization of recurring gaps across all rejections
- **Application Tracker** — full CRUD tracker with status filters and ghost risk calculation
- **Settings** — API key management

---

## Setup & Installation

### Prerequisites
- Node.js v18 or higher (`node -v` to check)
- npm v9 or higher (`npm -v` to check)
- An Anthropic API key — get one free at https://console.anthropic.com

---

### Step 1 — Install dependencies

```bash
cd ghost-proof
npm install
```

---

### Step 2 — Add your API key (two options)

**Option A — via .env file (recommended):**
```bash
cp .env.example .env
# then edit .env and replace the placeholder with your real key:
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

**Option B — in the app UI:**
Skip this step entirely. You can paste your API key directly in the Settings page or the Rejection Parser page after launching the app. It's stored in memory only.

---

### Step 3 — Start the dev server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

### Step 4 — Demo the Rejection Parser (hackathon wow moment)

1. Click **Rejection Parser** in the sidebar
2. Click **"Load demo data"** to auto-fill sample JD + rejection email
3. If you haven't set an API key yet, paste it in the yellow banner
4. Click **Analyze Rejection**
5. Watch Claude extract technical gaps, soft skill flags, and a ghosting risk score live

---

## Build for production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` folder — deployable to Vercel, Netlify, or any static host.

---

## Project Structure

```
ghost-proof/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Layout.tsx        # Sidebar + outlet wrapper
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── StatCard.tsx      # Metric summary card
│   │   ├── StatusBadge.tsx   # Colored status pill
│   │   └── GhostBar.tsx      # Ghost probability bar
│   ├── hooks/
│   │   ├── useStore.tsx      # Global app state (Context)
│   │   └── useRejectionParser.ts  # Anthropic API call logic
│   ├── lib/
│   │   ├── mockData.ts       # Sample applications + skill gaps
│   │   └── ghostRisk.ts      # Ghost probability math
│   ├── pages/
│   │   ├── Dashboard.tsx     # Main overview
│   │   ├── RejectionParser.tsx  # AI rejection analysis
│   │   ├── Heatmap.tsx       # Skill gap bubbles
│   │   ├── Tracker.tsx       # Full applications table
│   │   └── Settings.tsx      # API key + about
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── App.tsx               # Router setup
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind + global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Build | Vite 5 |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |

---

## Ghost Probability Formula

```
P(ghost) = min(daysElapsed / (stageBenchmark × 1.5), 1.0)

Stage benchmarks:
  Applied      → 14 days
  Interviewed  → 7 days
  Final Round  → 4 days
  Offer        → 2 days
```

---

## Notes

- API keys entered in the UI are stored **in memory only** — they are cleared on page refresh.
- For a persistent key, use the `.env` file approach.
- The app works fully without an API key — all pages except the live Rejection Parser use mock data.
