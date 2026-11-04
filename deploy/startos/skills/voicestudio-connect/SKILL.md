---
name: voicestudio-connect
description: Connects to and verifies a VoiceStudio service running on StartOS (health, auth, TLS, MCP config, per-agent voice binding, model readiness, licences). Use before any other VoiceStudio task, or when a call returns 401, 403, a Host rejection, a TLS error, a 409 asr_model_missing, or 403 model_licence_required.
---

# Connect to VoiceStudio on StartOS

Requires `VOICESTUDIO_URL` and `VOICESTUDIO_API_KEY` (see the README conventions). Never print the key.

## 1. Health (no key needed)

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/health"
```

## 2. Auth check

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/v1/audio/voices" -H "Authorization: Bearer $VOICESTUDIO_API_KEY"
```

| Symptom | Cause and action |
|---|---|
| TLS/certificate error | Trust the StartOS root CA (`--cacert`, `NODE_EXTRA_CA_CERTS`). Never disable verification. |
| 401 `API key required` | Key missing or wrong. Ask the owner to re-copy it from the StartOS action "API Key". |
| 403 on a POST or guarded GET | Request carried `Origin`/`Referer`/`Sec-Fetch-*`. Remove them; call from a non-browser client. |
| Host rejected (often 4xx, e.g. 421 or 400, mostly on `/mcp/`) | The StartOS package allows exactly the addresses StartOS publishes for VoiceStudio. Use one of them (the "Connect AI Agents" action shows one), not a raw IP or port forward. A domain the owner just added is allowed once the service has restarted. |
| Connection refused/timeout | Service stopped or wrong address; ask the owner. |

## 3. MCP

Endpoint `"$VOICESTUDIO_URL/mcp/"` (keep the trailing slash), Streamable HTTP, headers `Authorization: Bearer <key>` and `X-OmniVoice-Client-Id: <agent id>`. Use the config from "Connect AI Agents"; do not hand-write keys into committed files. Shapes (docs/mcp.md):

```toml
# Codex ~/.codex/config.toml
[mcp_servers.voicestudio]
url = "https://<host>/mcp/"
http_headers = { "X-OmniVoice-Client-Id" = "codex-cli", "Authorization" = "Bearer <key>" }
```

Hermes: `mcp_servers.voicestudio.url` plus `headers` (same two headers) in `~/.hermes/config.yaml`. Tools: `generate_speech`, `clone_voice`, `describe_voice`, `design_voice`, `transcribe`, `list_voices`, `list_personalities`, `list_languages`, `check_health`. No dubbing tools.

## 4. Per-agent voice

Voice precedence in `generate_speech`: explicit `profile_id`, then the client-id binding, then the default. Bindings are admin REST (the key qualifies):

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/api/mcp/bindings" -H "Authorization: Bearer $VOICESTUDIO_API_KEY"
curl -sS --fail-with-body -X PUT "$VOICESTUDIO_URL/api/mcp/bindings" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -H 'Content-Type: application/json' -d '{"client_id":"codex-cli","label":"Codex","profile_id":"<profile id>"}'
curl -sS --fail-with-body -X DELETE "$VOICESTUDIO_URL/api/mcp/bindings/codex-cli" -H "Authorization: Bearer $VOICESTUDIO_API_KEY"
```

Bind only with the owner's agreement; prefer a voice with recorded consent.

## 5. Readiness

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/models" -H "Authorization: Bearer $VOICESTUDIO_API_KEY"        # rows: role, installed, disk_free_gb
curl -sS --fail-with-body "$VOICESTUDIO_URL/engines/tts" -H "Authorization: Bearer $VOICESTUDIO_API_KEY"   # backends[].available/reason
```

Report which TTS, ASR, and translation models are `installed:true`. Installing is a large download: ask the owner, then:

```sh
curl -sS --fail-with-body -X POST "$VOICESTUDIO_URL/models/install" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -H 'Content-Type: application/json' -d '{"repo_id":"<id from /models>"}'
```

Poll `GET /models/install/status`, then re-read `/models` until `installed:true`. 429 means a recent failure cooldown; wait.

## 6. Licences: owner decision

403 `model_licence_required` means a model licence is unaccepted. OmniVoice (`k2-fsa/OmniVoice`) and NLLB (`facebook/nllb-200-distilled-600M`) are marked non-commercial in VoiceStudio's licence registry. Show the owner the terms and ask. Check state with `GET /models/licenses/acceptance/<repo_id>`. NEVER call `POST /models/licenses/accept` yourself, even though the key technically allows it; do it only if the owner explicitly tells you to accept that named model.
