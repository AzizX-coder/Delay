<div align="center">

<img src="public/logo.png" alt="Delay" width="112" height="112" style="border-radius: 24px" />

# Delay — Your Second Brain for Deep Work

[![Web App](https://img.shields.io/badge/Web%20App-delay.app-6366F1?style=flat-square&logo=vercel)](https://delay.app)
[![Windows](https://img.shields.io/badge/Windows-x64%20%7C%20arm64-0078D4?style=flat-square&logo=windows)](https://github.com/AzizX-coder/Delay/releases/latest)
[![Mac](https://img.shields.io/badge/macOS-Apple%20Silicon%20%7C%20Intel-000000?style=flat-square&logo=apple)](https://github.com/AzizX-coder/Delay/releases/latest)
[![Linux](https://img.shields.io/badge/Linux-AppImage-FCC624?style=flat-square&logo=linux&logoColor=black)](https://github.com/AzizX-coder/Delay/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)

**Delay** is a cross-platform productivity OS — one app for notes, tasks, calendar, focus timer, kanban, AI assistant, code studio, whiteboard, voice studio, and more. Beautiful, fast, and offline-first.

</div>

---

## What's New in v3.1.0

- **Cloud Sync** — Notes, tasks, and events sync across all devices via Supabase (real-time, offline queue)
- **Auth Gate** — Sign in with Google, GitHub, or email; skip to offline mode anytime
- **Profile & Plan Badge** — Avatar, plan tier (Free/Pro/Max), XP level in sidebar
- **Public Note Sharing** — Share any note via a permanent public link — Pro feature
- **Pricing Page** — Free / Pro ($8/mo) / Max ($18/mo) with Stripe-ready checkout
- **Paywall Modals** — Graceful upgrade prompts when hitting free tier limits
- **File Preview in Vault** — Click any file to preview images, video, audio, PDF inline
- **Voice Recordings Persisted** — Recordings survive page reloads (IndexedDB)
- **AI Weekly Insight** — Personalized Monday productivity summary (requires OpenRouter key)
- **Page Transitions** — Smooth opacity + slide animations between all modules
- **Mac + Linux Builds** — DMG (x64/arm64), AppImage — alongside Windows NSIS

---

## Download

| Platform | Download | Notes |
|----------|----------|-------|
| Windows x64 | `Delay-Setup-3.1.0-x64.exe` | NSIS installer |
| Windows ARM64 | `Delay-Setup-3.1.0-arm64.exe` | Surface Pro X, Copilot+ PCs |
| macOS Apple Silicon | `Delay-3.1.0-arm64.dmg` | M1/M2/M3/M4 |
| macOS Intel | `Delay-3.1.0-x64.dmg` | Intel Mac |
| Linux | `Delay-3.1.0-x64.AppImage` | All distros (chmod +x first) |
| Web | [delay.app](https://delay.app) | Installable PWA |

→ **[All releases](https://github.com/AzizX-coder/Delay/releases/latest)**

---

## Features

| Module | What it does |
|--------|-------------|
| **Notes** | Rich TipTap editor — markdown, tables, tasks, slash commands, voice dictation, AI write |
| **Tasks** | Inbox / Today / Upcoming / Completed views, priorities, due dates |
| **Calendar** | Month / Week / Day views, all-day events, color categories, recurrence |
| **Timer** | Pomodoro (25/5/15) + custom durations, session history, XP rewards |
| **AI Chat** | Chat & Agent modes — Ollama (local) or OpenRouter (cloud), 15 built-in tools |
| **Code Studio** | Monaco editor + terminal (Electron), AI coding agent |
| **Kanban** | Drag-drop boards, column management, card detail drawer with priorities |
| **Whiteboard** | Infinite tldraw canvas — shapes, connectors, freehand |
| **Voice Studio** | Record with live waveform, Web Audio API, persistent playback |
| **Vault** | Local file storage with folders, file preview modal, drag-drop upload |
| **Capture** | Quick-capture (Ctrl+Shift+S), link saves, global clipboard |
| **Flows** | Link tasks, notes, events, links into project containers |
| **Status** | Activity heatmap, focus charts, XP streaks, AI weekly insight |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript, Vite 8 |
| Desktop | Electron 41 |
| State | Zustand 5 |
| Local DB | Dexie 4 (IndexedDB) |
| Cloud | Supabase (Auth + Postgres + Storage + Realtime) |
| Payments | Stripe (checkout, webhooks, customer portal) |
| Editor | TipTap 3, Monaco 4 |
| Canvas | tldraw 4 |
| Animations | Motion (Framer Motion) |
| Charts | Recharts 2 |
| Styling | Tailwind CSS 4 |
| PWA | Vite PWA + Workbox |
| i18n | 7 languages: en, es, fr, de, ru, ar, uz |
| Themes | 10 built-in + custom background |

---

## Build from Source

### Prerequisites

```bash
node >= 20
npm >= 10
```

### Setup

```bash
git clone https://github.com/AzizX-coder/Delay.git
cd Delay
npm install
```

### Environment Variables (all optional — app works fully offline without them)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TLDRAW_LICENSE_KEY=your-tldraw-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Dev

```bash
npm run web:dev          # Web dev server (port 5173)
npm run electron:dev     # Electron + hot reload
```

### Build

```bash
npm run web:build            # PWA → dist/
npm run electron:build:win   # Windows NSIS (x64 + arm64)
npm run electron:build:mac   # macOS DMG + ZIP (x64 + arm64)
npm run electron:build:linux # Linux AppImage (x64)
npm run electron:build       # Current platform
```

---

## Cloud Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Add URL + anon key to `.env`
3. Apply migrations:

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

4. (Optional) Deploy Stripe Edge Functions:

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Plans

| Feature | Free | Pro ($8/mo) | Max ($18/mo) |
|---------|------|-------------|--------------|
| Notes | 50 | Unlimited | Unlimited |
| Kanban boards | 3 | Unlimited | Unlimited |
| Cloud sync | — | ✓ | ✓ |
| Public sharing | — | ✓ | ✓ |
| Cloud Vault | — | 5 GB | 20 GB |
| AI credits | 20/mo | 500/mo | Unlimited |
| Priority support | — | ✓ | ✓ |

---

## License

Apache 2.0 — see [LICENSE](LICENSE)

---

<div align="center">Made with ❤️ by <a href="https://github.com/AzizX-coder">AzizX-coder</a></div>
