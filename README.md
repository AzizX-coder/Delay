<img src="public/logo.png" alt="Delay" width="112" height="112" style="border-radius: 24px" />

# Delay

**Notes · Tasks · Calendar · AI — one beautifully local desktop app.**

[![Download for Windows](https://img.shields.io/badge/Download-Windows_Installer-007AFF?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/AzizX-coder/Delay/releases/latest)
&nbsp;
[![License](https://img.shields.io/badge/License-MIT-5856D6?style=for-the-badge)](LICENSE)

[Landing Page](https://azizx-coder.github.io/Delay/) · [Releases](https://github.com/AzizX-coder/Delay/releases) · [Report a bug](https://github.com/AzizX-coder/Delay/issues)

</div>

---

## ✨ What is Delay?

Delay is a local-first desktop **Agentic OS** that puts your **notes**, **tasks**, **calendar**, and a built-in **Recursive AI agent** behind one fluid, Apple-Notes-inspired interface. Everything lives on your device — no accounts, no cloud, no tracking.

## 🧩 Features (v1.4.2)

| Module | Highlights |
|--------|-----------|
| **Autonomous AI** | 15-tool agent with ambient context · multi-step reasoning loop · long-term memory · web search · task/note/calendar orchestration |
| **Notes** | TipTap editor with **working tables**, task lists & rich formatting · **6 built-in templates** (Daily Journal, Meeting, Project, Brainstorm, Recipe, Blank) · emoji panel · voice dictation with auto-stop |
| **Tasks** | Full **task editing** modal (title · description · priority · due date) · Inbox / Today / Upcoming / Completed views · custom lists with emoji icons |
| **Calendar** | Month/Week/Day · events + tasks in one view · drag orchestration |
| **I18N** | 7 languages — English, Spanish, French, German, Russian, Arabic (RTL), **Uzbek** |
| **Identity** | Glassmorphic UI · Dark/Light/System themes · Danger-Zone data reset |

## 🖥️ Screenshots

> **Liquid UI v1.4.2**: Explore the new Agentic Mode and Unified Calendar in the latest installer!

## 📥 Download

Grab the latest **Delay-Setup-1.4.2.exe** from the [Releases](https://github.com/AzizX-coder/Delay/releases/latest) page, or visit the [landing page](https://azizx-coder.github.io/Delay/).

**Requirements:** Windows 10 or 11 (x64). Optional: [Ollama](https://ollama.com/) for AI features.

### 🛡️ Windows SmartScreen — "Windows protected your PC"

Delay is built by an independent developer and is **not yet code-signed with a paid EV certificate**. That means on first launch Windows may show a blue SmartScreen banner. The app is safe — it's a standard open-source Electron build uploaded to GitHub via a public CI pipeline ([workflow](.github/workflows/main.yml)) which you can audit.

**To install safely:**

1. Download `Delay-Setup-1.4.2.exe` and the matching `SHA256SUMS.txt` from [Releases](https://github.com/AzizX-coder/Delay/releases/latest).
2. *(Optional but recommended)* verify the download integrity:
   ```powershell
   Get-FileHash .\Delay-Setup-1.4.2.exe -Algorithm SHA256
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
├── electron/        # Main process + preload
├── src/             # React app (components, features, stores)
├── public/          # Icons
├── landing/         # GitHub Pages landing site
├── scripts/         # Build helpers (icon conversion)
└── package.json     # Config + electron-builder
```

## 📄 License

MIT © [AzizX-coder](https://github.com/AzizX-coder)
