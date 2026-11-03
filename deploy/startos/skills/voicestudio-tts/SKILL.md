---
name: voicestudio-tts
description: Generates speech with VoiceStudio on StartOS via the OpenAI-compatible speech endpoint, native /generate for long text, or MCP generate_speech, then verifies the audio. Use when asked to read text aloud, narrate, make a voiceover, or produce an audio file from text.
---

# Text to speech

Needs a verified connection (`voicestudio-connect`). Pick a voice id first: `GET /v1/audio/voices` (use a `type:"profile"` entry's `id`) or `GET /profiles`. Do not invent ids: an unknown `profile_id` on `/generate` silently falls back to a generic voice, so confirm with `GET /profiles/<id>`.

## Short text (<= 4096 chars): OpenAI route

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/v1/audio/speech" \
  -H "Authorization: Bearer $VOICESTUDIO_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"omnivoice","voice":"<profile id or name>","input":"Hello world","response_format":"wav","language":"en"}' -o out.wav
```

`response_format`: mp3 (default), opus, aac, flac, wav, pcm (24 kHz s16le). mp3/opus/aac need ffmpeg on the server. Also: `speed` 0.25-4, `instructions`, `seed`. Language is not taken from the profile on this route; send `language`. Returns audio bytes only: no id, nothing saved server-side.

## Long text: native /generate

No length limit; text is chunked and crossfaded server-side.

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/generate" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -F text=@script.txt -F profile_id=<id> -F language=en -D hdr.txt -o out.wav
grep -i '^x-audio-id\|^x-audio-duration' hdr.txt
```

Returns WAV only; the take id is in the `X-Audio-Id` header. Re-download later: `GET "$VOICESTUDIO_URL/audio/<id>.wav"` (also `.ogg` / `.opus`, needs ffmpeg). Only the newest 200 unstarred takes are kept: download immediately. Optional form fields: `speed`, `instruct`, `seed`, `engine`, `effect_preset` (default `broadcast`), `wav_bits`. If `-F text=@file` is used, the file content is the text.

## MCP `generate_speech`

Args: `text`, `language?`, `profile_id?`, `instruct?`, `speed`, `steps`, `format` (`wav`|`ogg`|`opus`). Result JSON always has `audio_id`. Output modes are server-side: `resources` (default) returns `wav_base64` inline (large; avoid for long text); `files`/`both` add `audio_url`/`output_path`. `audio_url` normally points at `127.0.0.1` and is useless remotely. Instead fetch `"$VOICESTUDIO_URL/audio/<audio_id>.wav"` with the Bearer header. `output_path` is on the server, not your machine.

## Verify before reporting success

1. HTTP status was 2xx (`--fail-with-body` aborts otherwise; then `out.wav` holds the error body, delete it).
2. `file out.wav` / `ffprobe -v error -show_entries format=duration -of csv=p=0 out.wav` shows real audio and a plausible duration.
3. Report path, duration, voice, language.

## Failures

- 503 with `Retry-After` / `X-OmniVoice-Retryable: true`: model loading or engine busy. Wait that long and retry (the first call may download the model, up to ~20 min).
- 429: GPU saturated; honour `Retry-After`.
- 403 `model_licence_required`: owner's decision; see `voicestudio-connect`.
- 400 `unsupported_response_format`: ffmpeg missing; use `wav`.
- Long calls: set client timeouts of at least 10 minutes.
