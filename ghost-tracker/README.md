# 👻 GhostTracker

Automatically tracks your job applications from Gmail and flags companies that have gone silent for 30+ days.

## Features

- **Gmail auto-scan** — detects application confirmation emails automatically
- **Ghost detection** — labels applications as 👻 Ghosted after 30 days of silence  
- **Status tracking** — Applied → Screening → Interviewing → Offer / Rejected / Ghosted
- **Demo mode** — works instantly without any setup
- **Read-only** — never modifies, sends, or deletes your emails

---

## Quick Start (Demo Mode)

```bash
unzip ghost-tracker.zip
cd ghost-tracker
npm install
npm run dev
```

Open http://localhost:5173 and click **"Try demo mode"** — no Google account needed.

---

## Full Setup (Real Gmail)

### 1. Google Cloud Console (5 min)

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "ghost-tracker")
3. **Enable APIs**: Search and enable:
   - Gmail API
   - Google People API (for profile info)
4. **OAuth Consent Screen**:
   - User Type: External
   - App name: GhostTracker
   - Add scope: `https://www.googleapis.com/auth/gmail.readonly`
   - Add your email as a test user
5. **Credentials**:
   - Create → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Copy the **Client ID**

### 2. Configure .env

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 → click **"Continue with Google"**

---

## How Ghost Detection Works

The app scans Gmail for emails matching application confirmation keywords:
- "application received"
- "thank you for applying"  
- "we received your application"
- etc.

Each email thread is classified:

| Signal | Status |
|--------|--------|
| Rejection keywords found | Rejected |
| Interview/offer keywords | Interviewing |
| Phone screen keywords | Screening |
| No reply after **30 days** | 👻 Ghosted |
| Otherwise | Applied |

The Ghost Meter bar fills up as days of silence increase, turning amber at the 30-day mark.

---

## Project Structure

```
src/
├── components/
│   ├── GhostMeter.tsx      # Silence progress bar
│   ├── Layout.tsx          # App shell with sidebar
│   ├── Sidebar.tsx         # Navigation
│   ├── ScanOverlay.tsx     # Scanning animation
│   ├── StatCard.tsx        # Dashboard stat tiles
│   └── StatusBadge.tsx     # Status pill badges
├── context/
│   └── AuthContext.tsx     # Google OAuth state
├── hooks/
│   └── useApplications.ts  # Gmail scan orchestration
├── lib/
│   ├── gmail.ts            # Gmail API + classification logic
│   └── mockData.ts         # Demo mode data
├── pages/
│   ├── Dashboard.tsx       # Overview + stats
│   ├── Login.tsx           # Sign-in screen
│   ├── NotFound.tsx        # 404 page
│   ├── Settings.tsx        # Preferences
│   └── Tracker.tsx         # Full applications table
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## Tech Stack

- **React 18** + TypeScript
- **Vite** — dev server & bundler
- **Tailwind CSS v3** — styling
- **React Router v6** — routing
- **date-fns** — date formatting
- **Google Identity Services** — OAuth token flow
- **Gmail REST API** — email scanning

---

## Privacy

- Read-only Gmail access — never sends, modifies, or deletes emails
- Email content is never stored on any server
- OAuth token lives in browser memory and is cleared on sign out
