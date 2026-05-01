<div align="center">

<img src="public/logo.png" alt="Delay" width="112" height="112" style="border-radius: 24px" />

# Delay

**The local-first Agentic OS for productivity.**

Notes · Tasks · Calendar · Timer · Code Studio · Whiteboard · AI Agent

[![Download for Windows](https://img.shields.io/badge/Download-Windows_Installer-007AFF?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/AzizX-coder/Delay/releases/latest)
&nbsp;
[![License](https://img.shields.io/badge/License-Apache_2.0-5856D6?style=for-the-badge)](LICENSE)

[Landing Page](https://azizx-coder.github.io/Delay/) · [Releases](https://github.com/AzizX-coder/Delay/releases) · [Report a bug](https://github.com/AzizX-coder/Delay/issues)

</div>

---

## ✨ What is Delay?

Delay is a **local-first desktop Agentic OS** with **10 modular workspaces** — notes, tasks, calendar, timer, kanban, whiteboard, code studio, voice studio, disk flows — all unified behind an **autonomous AI Agent**. Everything lives on your device — no accounts, no cloud, no tracking.

## 🧩 Features (v2.3.0)

| Module | Highlights |
|--------|-----------|
| **🤖 AI Agent** | Unified autonomous agent with file control, terminal execution, and 20+ tools |
| **📝 Notes** | TipTap docs · 13 slash commands · Export (MD/HTML/TXT) · 10 templates · Voice dictation |
| **✅ Tasks** | Priority · Due dates · Inbox/Today/Upcoming views · Custom lists |
| **📅 Calendar** | Month / Week / Day views · Events + tasks unified |
| **⏱️ Timer + Goals** | Pomodoro with purpose-driven goals · Focus/break scheduling · Multi-day tracking |
| **📋 Kanban** | Drag-and-drop columns & cards · Custom columns · Color labels |
| **🎨 Whiteboard** | Miro-like infinite canvas · Sticky notes · Shapes · Pen · Pan/zoom · Grid/dots |
| **💻 Code Studio** | Monaco IDE · File tree · Terminal · AI coding agent |
| **💾 Disk Flows** | Video download · Quality selection · In-app playback |
| **🎙️ Voice Studio** | Smart recording · Live waveform · Playback & download |
| **⚙️ Customizable** | Toggle modules on/off · Onboarding module picker · Custom backgrounds |

## 📥 Download

Grab the latest **Delay-Setup-2.3.0.exe** from the [Releases](https://github.com/AzizX-coder/Delay/releases/latest) page, or visit the [landing page](https://azizx-coder.github.io/Delay/).

**Requirements:** Windows 10 or 11 (x64). Optional: [Ollama](https://ollama.com/) for AI features. Optional: [yt-dlp](https://github.com/yt-dlp/yt-dlp) for Disk Flows video downloads.

### 🛡️ Windows SmartScreen — "Windows protected your PC"

Delay is built by an independent developer and is **not yet code-signed with a paid EV certificate**. On first launch Windows may show a blue SmartScreen banner. The app is safe — it's a standard open-source Electron build uploaded via a public CI pipeline ([workflow](.github/workflows/main.yml)).

**To install safely:**

1. Download the latest `.exe` and the matching `SHA256SUMS.txt` from [Releases](https://github.com/AzizX-coder/Delay/releases/latest).
2. *(Optional but recommended)* verify the download integrity:
   ```powershell
   Get-FileHash .\Delay-Setup-2.3.0.exe -Algorithm SHA256
   ```
   The hash must match the one in `SHA256SUMS.txt`.
3. Double-click the installer. If SmartScreen appears, click **More info → Run anyway**.
4. Follow the NSIS installer (you can choose the install directory).

> SmartScreen reputation accumulates automatically as more users install. Code-signing via [SignPath Foundation](https://signpath.org/) (free for OSS) is on the roadmap — PRs welcome.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron 41 |
| Frontend | React 19 · TypeScript · Vite 8 |
| Styling | Tailwind CSS v4 · custom Liquid UI variables |
| State | Zustand |
| Storage | Dexie.js (IndexedDB) — 100% local |
| Editor | TipTap |
| Animation | Motion (Framer Motion) |
| AI | Ollama HTTP SDK |
| Downloads | yt-dlp (subprocess) |
| Packaging | electron-builder (NSIS) |

## 🚀 Build from source

```bash
git clone https://github.com/AzizX-coder/Delay.git
cd Delay
npm install
npm run electron:dev          # development
npm run electron:build        # Windows installer → release/
```

## 📁 Project layout

```
├── electron/              # Main process + preload
│   ├── main.cjs           # Electron main process, IPC handlers
│   └── preload.cjs        # Context bridge API
├── src/
│   ├── components/        # Shared UI (DelayIcon, NavigationRail, etc.)
│   ├── features/          # Feature modules
│   │   ├── ai/            # AI chat + agent
│   │   ├── notes/         # Notes editor with slash commands & export
│   │   ├── tasks/         # Task management
│   │   ├── calendar/      # Calendar views
│   │   ├── timer/         # Smart Pomodoro timer
│   │   ├── kanban/        # Kanban boards
│   │   ├── whiteboard/    # Miro-like infinite canvas
│   │   ├── code-studio/   # VS Code-like IDE workspace
│   │   ├── voice-studio/  # Voice recording
│   │   └── disk-flows/    # Video downloader
│   ├── stores/            # Zustand state stores
│   ├── lib/               # Agent, database, i18n, Ollama
│   └── types/             # TypeScript type definitions
├── landing/               # GitHub Pages landing site
└── package.json           # Config + electron-builder
```

## 📦 What's New in v2.3.0

- 📝 **Notes as Docs** — 13 searchable slash commands, export to Markdown/HTML/Text
- 🎨 **Miro-like Whiteboard** — Object canvas with sticky notes, shapes, pen, pan/zoom, grid/dots
- 🎯 **Custom Delay Icons** — Branded SVG icons (indigo/skyblue) replace all emojis in templates & lists
- 📋 **10 Templates** — Added Weekly Review, Study Notes, Bug Report, Decision Log
- 🧹 **Streamlined** — Removed 6 redundant modules (Docs, Sheets, Slides, Photo, Video, Studio)
- 🐛 **Bug Fixes** — Fixed duplicate Electron IPC handlers, cleaned Siyoh from repo

## 📄 License

Apache-2.0 © [AzizX-coder](https://github.com/AzizX-coder)
