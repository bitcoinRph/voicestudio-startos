# VoiceStudio on StartOS: agent skills

Task-focused skills for agents that reach a VoiceStudio service on StartOS over HTTPS. They replace OpenAPI rediscovery with verified multi-step flows. For a local, non-StartOS backend see the generic `skills/voicestudio` skill in the VoiceStudio repo.

## Which skill

| Intent | Skill |
|---|---|
| First contact, auth/TLS errors, MCP setup, per-agent voice, model readiness, licences | `voicestudio-connect` |
| Text to speech, long text, MCP `generate_speech` | `voicestudio-tts` |
| Clone a voice from reference audio | `voicestudio-voice-cloning` |
| Create a voice from a text description | `voicestudio-voice-design` |
| Translate and re-voice a video or audio file | `voicestudio-dubbing` |
| Speech to text, subtitles, word timestamps, live dictation | `voicestudio-transcription` |
| HyperFrames installed on the same server | `voicestudio-hyperframes` |

Start with `voicestudio-connect` if you have not verified the connection this session.

## Install

- Claude Code: copy the skill folders into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).
- Codex, Hermes Agent, OpenClaw: copy the folders where your agent loads skills, or reference the `SKILL.md` files from your agent's instruction file (for example `AGENTS.md`). Check your agent's own docs for the exact path.

## Shared conventions (all skills assume these)

- `VOICESTUDIO_URL`: base URL StartOS shows for the service (`https://<name>.local`, a `.onion`, or a custom domain). No trailing slash.
- `VOICESTUDIO_API_KEY`: the key from the StartOS action "API Key". It is a root credential (admin). Never print, log, echo, or paste it into files, URLs, or chat. Send it only as `Authorization: Bearer`.
- Ready-made MCP configs: StartOS action "Connect AI Agents".
- TLS: on another computer, trust the StartOS root CA. curl: `--cacert /path/to/root-ca.crt`. Node agents: `NODE_EXTRA_CA_CERTS=/path/to/root-ca.crt`. Never disable TLS verification (`-k`, `NODE_TLS_REJECT_UNAUTHORIZED=0`); ask the owner for the CA instead.
- Prefer MCP when connected (`/mcp/`); use REST for everything MCP lacks (dubbing, word timestamps, long text, bindings).
- Send no `Origin`, `Referer`, or `Sec-Fetch-*` headers: cross-site requests get 403. curl and Python clients send none.
- Every curl uses `--fail-with-body` so errors are not saved as audio.
- Cloud calls, model downloads, and licence acceptance are the owner's decisions; ask first.
