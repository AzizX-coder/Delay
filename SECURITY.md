# Security

## Verifying a release

Every tagged release publishes:

- `Delay-Setup-<version>.exe` — the Windows installer
- `SHA256SUMS.txt` — SHA-256 of every published artifact
- `latest.yml` — electron-updater manifest (also SHA-512 hashed)

Before running the installer, verify the hash matches:

```powershell
# Compare this hash against the line for the same filename in SHA256SUMS.txt
Get-FileHash .\Delay-Setup-1.4.0.exe -Algorithm SHA256
```

If the hashes do not match, **do not run the installer** — re-download from the [official releases page](https://github.com/AzizX-coder/Delay/releases).

## Why does SmartScreen warn me?

Delay is not yet signed with a paid EV code-signing certificate, so Windows SmartScreen flags the installer on first launch (this is normal for every unsigned app — including most open-source tools).

You can confirm the installer is the one this repo built by:

1. Matching the SHA-256 hash above.
2. Reviewing the build that produced it — every release is built in a public GitHub Actions run you can audit at [Actions](https://github.com/AzizX-coder/Delay/actions).

Code-signing via [SignPath Foundation](https://signpath.org/) (free for qualifying OSS projects) is being pursued. Until that lands, use **More info → Run anyway** on the SmartScreen dialog.

## Data & telemetry

Delay is local-first and does not phone home.

- All notes, tasks, events, AI conversations, and memories live in your browser's IndexedDB inside the installed app.
- The only outbound network traffic:
  - Update checks to `github.com/AzizX-coder/Delay/releases` (electron-updater)
  - AI requests to whichever Ollama endpoint you configure (by default `http://localhost:11434`)
  - Optional `searchWeb` tool calls to `api.duckduckgo.com` when explicitly triggered by the agent

No analytics SDK, no account system, no third-party trackers.

## Reporting a vulnerability

Please email security reports to the address in the repo's GitHub profile rather than opening a public issue. Include:

- A description of the vulnerability
- Steps to reproduce
- The affected version(s)

You'll get an acknowledgement within 7 days.
