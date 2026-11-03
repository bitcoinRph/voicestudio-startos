---
name: voicestudio-transcription
description: Transcribes audio or video with VoiceStudio on StartOS (plain text, verbose_json with word timestamps, SRT/VTT) and covers live dictation over WebSocket. Use when asked to transcribe, caption, subtitle, or get timestamps from speech.
---

# Transcription

## Batch (preferred)

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/v1/audio/transcriptions" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -F file=@a.wav -F model=whisper-1 -F response_format=verbose_json \
  -F 'timestamp_granularities[]=word' -F 'timestamp_granularities[]=segment' -o t.json
```

- `response_format`: `json` (`{text}`), `text`, `verbose_json`, `srt`, `vtt` (save with `-o t.srt` / `t.vtt`).
- `verbose_json`: `language`, `duration`, `text`, `segments[]` (`start`,`end`,`text`); `words[]` (`word`,`start`,`end`) appears only when `timestamp_granularities` includes `word` (extra alignment pass).
- `model` `whisper-1` means the active ASR engine; naming another ASR engine id fails 400 `model_not_active`. Optional `language`, `prompt`, `temperature`. `stream=true` is refused (400).
- `/v1/audio/translations` translates to English (Whisper-family engines only; else 400 `unsupported_task`).
- MCP `transcribe(audio_base64, language?)` returns `{text,language}` without word timestamps; `audio_path` works only inside the server's base path, so use base64 remotely or the REST call.

## Failure handling

- 409 `asr_model_missing`: body has `detail.recommended` (`repo_id`,`label`,`size_gb`). Do not retry. Tell the owner the model and size; with their yes, `POST /models/install` `{"repo_id":"<recommended.repo_id>"}`, poll `GET /models/install/status` until `GET /models` shows it `installed:true`, then retry.
- 403 `model_licence_required`: owner's decision (`voicestudio-connect`).
- 400 `no_audio_track`: the file has no audio stream.
- 504: ASR budget (300 s default) exceeded; split the audio into shorter parts.

## Live dictation (advanced)

Discovery document (public contract `voicestudio.speech.v1`): `GET "$VOICESTUDIO_URL/.well-known/voicestudio-speech"` (or `/v1/audio/capabilities`) with the Bearer header. It lists the WebSocket `/v1/audio/transcriptions/stream`. Connect `wss://<host>/v1/audio/transcriptions/stream?sr=16000&pcm=1` with `Authorization: Bearer` on the handshake, send binary `audio/pcm;encoding=s16le;channels=1` frames, finish with the text frame `{"type":"input_audio.end"}`. Events: `session.started`, `status`, `partial`, `final`, `error`. Send no `Origin` header. Close code 1008 means not authorized. Do not put the key in the URL (`?api_key=` exists but leaks into logs). Use batch unless real-time is required.
