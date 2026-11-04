<p align="center"><img src="icon.svg" alt="VoiceStudio" width="21%"></p>

# VoiceStudio on StartOS

Technical reference for the StartOS package of [VoiceStudio](https://github.com/debpalash/VoiceStudio). End-user steps are in [instructions.md](instructions.md).

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

## Image and Container Runtime

| Arch   | Image                                                                     |
| ------ | ------------------------------------------------------------------------- |
| x86_64 | `ghcr.io/debpalash/voicestudio:<version>` (upstream's CUDA build)         |

- Upstream's image is used unchanged, pinned by index digest in `startos/manifest/index.ts` and passed to `Dockerfile` as the `IMAGE` build arg.
- It runs on the CPU. With `hardwareAcceleration: true` and `nvidiaContainer: true`, it uses an NVIDIA GPU when the server has one and StartOS passes it through.
- Entrypoint: upstream's (`python3 backend/docker_entrypoint.py`, which execs uvicorn on `0.0.0.0:3900`). Runs as root, as upstream does.
- Only x86_64 is built. Upstream's aarch64 image is an NVIDIA-only build, and its ROCm image targets AMD GPUs; add them back as variants if a server needs them.

## Volume and Data Layout

| Volume   | Mount point           | Contents                                                                                     | Backed up |
| -------- | --------------------- | -------------------------------------------------------------------------------------------- | --------- |
| `main`   | `/app/omnivoice_data` (subpath `data`) | `OMNIVOICE_DATA_DIR`: SQLite DB, voices, outputs, dub jobs, settings          | yes       |
| `main`   | not mounted (root)    | `store.json`                                                                                 | yes       |
| `models` | `/models`             | `huggingface/` (`HF_HOME`, incl. HF token), `engines/` (`OMNIVOICE_ENGINES_DIR`), `torch/`, `cache/` (`XDG_CACHE_HOME`, CUDA JIT cache) | no |
| `public` | not mounted           | `credentials.json`, read by dependent services                                               | yes       |

## File Models

| File               | Volume   | Shape                                 | Purpose                                                          |
| ------------------ | -------- | ------------------------------------- | ---------------------------------------------------------------- |
| `store.json`       | `main`   | `{ analyticsAllowed: boolean }`        | StartOS-level setting; default `false`                           |
| `credentials.json` | `public` | `{ apiKey?: string }`                 | `OMNIVOICE_API_KEY`; generated in init, read by dependents       |

## Dependencies

None. VoiceStudio is a dependency of other packages: HyperFrames declares it optionally.

**Contract for dependents** (stable; keep it compatible):

- package id `voicestudio`, host id `main`, internal port `3900`, plain HTTP on the bridge.
- Resolve `sdk.host.getBridgeAddress(effects, { packageId: 'voicestudio', hostId: 'main', internalPort: 3900 })`.
- Mount volume `public` read-only and read `credentials.json` → `apiKey`. Send `Authorization: Bearer <apiKey>` on every request. Re-read it after a 401: the key can be rotated.
- Minimum version that publishes the key: `0.5.7:0`.
- Send no `Origin`, `Sec-Fetch-Site` or `Referer` header; VoiceStudio's cross-site guard rejects them on some GET routes.

## Network Access and Interfaces

One host (`main`) bound to port 3900 with StartOS TLS. No proxy auth: VoiceStudio enforces `OMNIVOICE_API_KEY` itself on every non-loopback HTTP and WebSocket request (browser UI exchanges it for an 8-hour session cookie).

| Interface   | id    | Type | Path    | Notes                                                    |
| ----------- | ----- | ---- | ------- | -------------------------------------------------------- |
| Web UI      | `ui`  | ui   | `/`     | Login with the API key                                   |
| REST API    | `api` | api  | `/`     | Native API; OpenAI-compatible under `/v1`                 |
| MCP Server  | `mcp` | api  | `/mcp/` | Streamable HTTP; Bearer key; `X-OmniVoice-Client-Id` optional |

Environment set by `startos/main.ts`:

| Variable                         | Value                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| `OMNIVOICE_API_KEY`              | from `credentials.json`                                                |
| `OMNIVOICE_SERVER_MODE`          | `1`                                                                    |
| `OMNIVOICE_ALLOWED_ORIGINS`      | `app://voicestudio` + the origin of every address StartOS publishes    |
| `OMNIVOICE_MCP_ALLOWED_HOSTS`    | every published hostname and the OS bridge IP, each as `h` and `h:*`   |
| `OMNIVOICE_DATA_DIR`, `HF_HOME`, `TORCH_HOME`, `XDG_CACHE_HOME`, `OMNIVOICE_ENGINES_DIR`, `CUDA_CACHE_PATH` | see volume table |
| `OMNIVOICE_ANALYTICS_DISABLED`   | `1` unless **Usage Analytics** is on                                   |

The address list is read with `.const()`, so adding or removing a domain or Tor address restarts VoiceStudio once.

Outbound: VoiceStudio downloads models from Hugging Face, ffmpeg helpers and engine packages when the owner installs them, plus the update and gallery calls upstream documents. Dubbing translation defaults to Google unless the caller chooses a local provider (Argos, NLLB).

## Installation and First-Run Flow

1. Init generates a 40-character key into `credentials.json` and seeds `store.json`.
2. The daemon starts; `/health` answers once uvicorn is up.
3. The owner runs **API Key**, logs in to the Web UI, and completes upstream's first-run setup (model download, licence acceptance, optional Hugging Face token).

## Actions

| Action             | id               | Input                    | Result                                                                     |
| ------------------ | ---------------- | ------------------------ | -------------------------------------------------------------------------- |
| API Key            | `api-key`        | `rotate` toggle          | Shows the key; rotation rewrites `credentials.json` and restarts the service |
| Connect AI Agents  | `connect-agents` | none                     | MCP URL, `/v1` base URL, configs for Claude Code, Codex, Hermes Agent, OpenClaw (masked, contain the key) |
| Usage Analytics    | `analytics`      | `analyticsAllowed` toggle | Writes `store.json`; restarts the service                                  |

## Tasks

None. The key is generated, so nothing blocks the first start.

## Health Checks

| Check        | Method                                         | Grace period |
| ------------ | ---------------------------------------------- | ------------ |
| VoiceStudio  | `GET http://127.0.0.1:3900/health` (loopback)   | 5 minutes    |

## Backups and Restore

`main` and `public` are backed up. `models` is not; after a restore, weights and engine installs download again on first use, and a Hugging Face token stored in the app must be entered again.

## Limitations and Differences

- Desktop-only features (native file pickers, global shortcuts, desktop runtime management, sidecar engine installs that upstream marks desktop-only) are unavailable, as in upstream's Docker image.
- The API key is upstream's single root credential; dependents receive the same key. There is no consumption-only key.
- MCP `audio_url` (files mode) points at `127.0.0.1`; the package keeps upstream's default `resources` output mode. Remote agents should download `GET /audio/<audio_id>.wav` from the REST interface.
- Some model weights are licensed for non-commercial use only (VoiceStudio shows and records the licence per model). The owner decides; the package accepts nothing on their behalf.

## Quick Reference for AI Consumers

```yaml
package_id: voicestudio
upstream: https://github.com/debpalash/VoiceStudio
arch: [x86_64]   # CPU; NVIDIA GPU used when present
host_id: main
internal_port: 3900
interfaces: { ui: /, api: /, openai_compatible: /v1, mcp: /mcp/ }
auth: "Authorization: Bearer <apiKey>"   # apiKey from action api-key or public/credentials.json
volumes: { main: backed-up, public: backed-up, models: not-backed-up }
actions: [api-key, connect-agents, analytics]
health: GET /health
agent_skills: deploy/startos/skills/
```
