<div align="center">

<img src="public/logo.png" alt="Delay" width="112" height="112" style="border-radius: 24px" />

# Delay

**The local-first Agentic OS for productivity.**

Notes · Tasks · Calendar · Timer · Code Studio · Disk Flows · AI Agent

[![Download for Windows](https://img.shields.io/badge/Download-Windows_Installer-007AFF?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/AzizX-coder/Delay/releases/latest)
&nbsp;
[![License](https://img.shields.io/badge/License-Apache_2.0-5856D6?style=for-the-badge)](LICENSE)

[Landing Page](https://azizx-coder.github.io/Delay/) · [Releases](https://github.com/AzizX-coder/Delay/releases) · [Report a bug](https://github.com/AzizX-coder/Delay/issues)

</div>

---

## ✨ What is Delay?

Delay is a **local-first desktop Agentic OS** that unifies your **notes**, **tasks**, **calendar**, **smart timer**, **code workspace**, **video downloads**, and a built-in **autonomous AI agent** behind one polished, fluid interface. Everything lives on your device — no accounts, no cloud, no tracking.

## 🧩 Features (v1.6.0)

| Module | Highlights |
|--------|-----------|
| **🤖 Autonomous AI Agent** | 18-tool agent with ambient context · 12-turn reasoning loop · long-term memory · web search · task/note/calendar orchestration · **Sleek Logic Trace UI** |
| **📝 Notes** | TipTap rich editor with tables, task lists & 6 templates · Whispr Flow voice dictation with live waveform overlay · **Native Slash Commands (`/`)** |
| **✅ Tasks** | Full task editing modal (priority · due date · description) · Inbox / Today / Upcoming / Completed views · custom lists |
| **📅 Calendar** | Month / Week / Day views · events + tasks in one unified view |
| **⏱️ Smart Timer** | Pomodoro timer with circular progress ring · Focus / Short Break / Long Break presets · custom durations · session streak tracking · completion chimes |
| **💻 Code Studio** | **Monaco Editor integration** · Multi-tab workspace · 30+ languages · **Inline Agent prompt** · Open folders · Open in VS Code |
| **💾 Disk Flows** | Download YouTube & Instagram videos · **Select Quality & Formats** · **In-App Video Playback** · Show in Folder · Copy to Downloads |
| **🎙️ Voice Input** | Whispr Flow-style frosted overlay · live waveform bars · real-time transcript · auto-send from voice |
| **🌐 I18N** | 11 languages — English, Spanish, French, German, Russian, Arabic (RTL), Uzbek, Japanese, Chinese, Korean, Portuguese |
| **🎨 Themes** | **Custom Image Backgrounds** · Lighter dark mode · Light · System · responsive Glassmorphic UI |

## 📥 Download

Grab the latest **Delay-Setup-1.6.0.exe** from the [Releases](https://github.com/AzizX-coder/Delay/releases/latest) page, or visit the [landing page](https://azizx-coder.github.io/Delay/).

**Requirements:** Windows 10 or 11 (x64). Optional: [Ollama](https://ollama.com/) for AI features. Optional: [yt-dlp](https://github.com/yt-dlp/yt-dlp) for Disk Flows video downloads.

### 🛡️ Windows SmartScreen — "Windows protected your PC"

Delay is built by an independent developer and is **not yet code-signed with a paid EV certificate**. On first launch Windows may show a blue SmartScreen banner. The app is safe — it's a standard open-source Electron build uploaded via a public CI pipeline ([workflow](.github/workflows/main.yml)).

**To install safely:**

1. Download `Delay-Setup-1.6.0.exe` and the matching `SHA256SUMS.txt` from [Releases](https://github.com/AzizX-coder/Delay/releases/latest).
2. *(Optional but recommended)* verify the download integrity:
   ```powershell
   Get-FileHash .\Delay-Setup-1.6.0.exe -Algorithm SHA256
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
│   ├── components/        # Shared UI (VoiceBadge, NavigationRail, etc.)
│   ├── features/          # Feature modules
│   │   ├── ai/            # AI chat + agent
│   │   ├── notes/         # Notes editor
│   │   ├── tasks/         # Task management
│   │   ├── calendar/      # Calendar views
│   │   ├── timer/         # Smart Pomodoro timer
│   │   ├── code-studio/   # Code snippet workspace
│   │   └── disk-flows/    # Video downloader
│   ├── stores/            # Zustand state stores
│   ├── lib/               # Agent, database, i18n, Ollama
│   └── types/             # TypeScript type definitions
├── landing/               # GitHub Pages landing site
└── package.json           # Config + electron-builder
```

## 📦 What's New in v1.5.0

- ⏱️ **Smart Timer** — Pomodoro with circular progress, presets, and session tracking
- 💻 **Code Studio** — Multi-tab code editor with folder opening and VS Code integration
- 💾 **Disk Flows** — YouTube/Instagram video downloader with progress and file management
- 🎙️ **Whispr Flow Voice** — Redesigned full-width voice overlay with waveform visualization
- 🤖 **Smarter Agent** — 18 tools, better prompts, error recovery, think-tag stripping
- 🎨 **Lighter Dark Mode** — Softer, more comfortable dark palette
- ✨ **Smoother UI** — Spring animations, refined navigation, page transitions

## 📄 License

Apache-2.0 © [AzizX-coder](https://github.com/AzizX-coder)
