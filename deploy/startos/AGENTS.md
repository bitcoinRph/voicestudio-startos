# AGENTS.md

This is a StartOS service package that lives inside the VoiceStudio fork at `deploy/startos/`. It builds a `.s9pk` from upstream's published images.

Develop it inside a StartOS packaging workspace (`start-cli s9pk init-workspace` in a parent directory). The full guide is at <https://docs.start9.com/packaging>; start every task at its recipe index.

Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes. Record what you verified in commit messages and PR bodies, not in new files.

## This repo

- **The rest of this repository is upstream VoiceStudio.** Its root `CLAUDE.md` and `AGENTS.md` govern changes outside `deploy/startos/` and `.github/workflows/startos.yml`, including its commit-identity rule: no agent co-author trailers or "Generated with" lines in commits or PR bodies.
- **The image is upstream's, unchanged.** `Dockerfile` only takes the pinned tag as a build arg. Do not add layers to fix app behaviour; set environment variables in `startos/main.ts` or fix it upstream.
- **VoiceStudio enforces auth itself.** Do not add `addSsl.auth` to the binding: the Web UI logs in with the API key and a proxy challenge would block it. Keep `OMNIVOICE_API_KEY` set; without it every LAN client is unauthenticated.
- **The host checks need the published addresses.** `OMNIVOICE_ALLOWED_ORIGINS` and `OMNIVOICE_MCP_ALLOWED_HOSTS` come from the host's address list. A new interface that serves browser or MCP traffic on another port needs the same treatment.
- **`utils.ts` constants and `public/credentials.json` are a contract** with dependents (HyperFrames). Changing `mainHostId`, `apiPort`, the volume name or the file shape breaks them; raise their `versionRange` if you must.
- **`models` is deliberately not backed up.** Put nothing there that cannot be downloaded again.
- **Agent skills** live in `skills/`. They document VoiceStudio's API as an agent reaches it through StartOS. Re-check them against the running version's `/openapi.json` when you bump upstream.
- **x86_64 only, CPU first.** The owner's server has no GPU. The CUDA image runs on the CPU and uses an NVIDIA GPU if one is added. Upstream's ROCm and arm64 images are not built.
- **Build in CI.** The image is about 5.5 GB compressed; `.github/workflows/startos.yml` builds it.
