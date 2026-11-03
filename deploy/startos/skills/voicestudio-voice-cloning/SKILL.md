---
name: voicestudio-voice-cloning
description: Clones a voice into a VoiceStudio profile from reference audio on StartOS, tests it, and optionally binds it to an agent. Use when asked to clone, copy, or replicate a voice, or make a voice from a recording.
---

# Voice cloning

## Consent first

VoiceStudio does NOT enforce consent: nothing checks it at creation or generation. You must. Ask the owner to confirm the voice is their own or that the speaker gave permission. If they cannot confirm, stop. Never clone a third party's voice from a recording found online.

## Reference audio

One speaker, clean, about 5-30 s, no music. Any audio or video container works; it must contain an audio stream (else 422; non-media gives 415). Optional `ref_text` is the exact transcript; blank triggers local ASR at save (needs an ASR model; otherwise it is transcribed later).

## Create

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/profiles" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -F name="Narrator" -F kind=clone -F language=en -F ref_audio=@ref.wav -F ref_text="Exact words spoken."
```

The response is the profile row; `id` is the profile id. Via MCP: `clone_voice(name, ref_audio_base64 | ref_audio_path, ref_text, instruct, language)` returns `{profile_id,name,kind}`. `ref_audio_path` only works for files inside the server's MCP base path, which a remote agent cannot reach, so use base64 (limit 200 MB) or the REST call.

## Record consent (recommended)

```sh
curl -sS --fail-with-body -X POST "$VOICESTUDIO_URL/profiles/<id>/attestation" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -H 'Content-Type: application/json' -d '{"basis":"own_voice"}'
```

`basis` is `own_voice` or `speaker_permission`. Record only what the owner told you.

## Test

Generate one short sentence with the new id (see `voicestudio-tts`), e.g. `/generate` with `-F profile_id=<id> -F language=en`. Confirm duration and tell the owner to listen; you cannot judge likeness.

## Bind to an agent (optional, owner agrees)

`PUT /api/mcp/bindings` with `{"client_id":"...","profile_id":"<id>"}` (see `voicestudio-connect`).

## Failures

- 422 no audio stream: re-extract audio and retry.
- Blank `ref_text` in the row: ASR model missing; tell the owner (see `voicestudio-transcription`), or pass `ref_text`.
- Delete a bad profile: `DELETE /profiles/<id>` only for one you created this session.
