---
name: voicestudio-dubbing
description: Runs the full headless video or audio dubbing pipeline on VoiceStudio over StartOS REST (upload, transcribe with speaker voices, translate locally, generate, download MP4/WAV/SRT/VTT). Use when asked to dub, translate, localize, or re-voice a video or audio file into another language.
---

# Dubbing (REST only; MCP has no dubbing tools)

Preflight: `voicestudio-connect` done; an ASR model, the TTS model, and a LOCAL translation provider are installed and licences accepted by the owner. All tasks share ONE worker queue: jobs run serially, so another caller's job delays yours. Set `H="Authorization: Bearer $VOICESTUDIO_API_KEY"` and `B="$VOICESTUDIO_URL"` (do not echo them). Always use `--fail-with-body`.

## 1. Upload and prep

```sh
R=$(curl -sS --fail-with-body "$B/dub/upload" -H "$H" -F video=@in.mp4 -F source_lang=en)   # field name is literally "video"; audio files OK with -F input_type=audio
JOB=$(echo "$R" | jq -r .job_id); T=$(echo "$R" | jq -r .task_id)    # 202; T = prep_<JOB>
```

Poll `GET $B/jobs/$T` every 3-5 s until `.status` is `done` (terminal: `failed`, `cancelled`; show `.error`). `source_lang` is ISO or `auto`. `/dub/ingest-url` (`{"url":...}`) accepts public URLs only; private/internal URLs are refused, so upload files instead.

## 2. Transcribe with speaker voices

```sh
curl -sSN --fail-with-body "$B/dub/transcribe-stream/$JOB?per_segment_refs=true" -H "$H" > stream.txt
```

SSE; blocks until `done`. Take the data line of `event: final`: `segments[]` (`id,start,end,text,speaker_id,profile_id?`), `source_lang`. `profile_id` of form `auto:<speaker>` is a voice cloned from the original speaker. Abort/`error` events: stop and report. Do NOT use `POST /dub/transcribe/$JOB`: it yields no speaker voices.

## 3. Translate (LOCAL provider, explicit)

Always send `provider`. The server default is `google` (cloud); use it, or any cloud provider, only after the owner's explicit yes. Local: `argos` or `nllb`.

```sh
curl -sS --fail-with-body "$B/dub/translate" -H "$H" -H 'Content-Type: application/json' \
 -d '{"job_id":"'$JOB'","target_lang":"es","provider":"argos","quality":"fast","segments":[{"id":"1","text":"..."}]}'
```

- 409 `argos_pack_missing` (lists `pairs`): ask the owner, then `POST /engines/translation/argos/packs/install` with `{"source_lang":"en","target_langs":["es"]}` (downloads from the Argos index).
- `nllb` needs `facebook/nllb-200-distilled-600M` installed and its (non-commercial) licence accepted by the owner.
- Response `translated[]` with `id`,`text`; a per-row `error` means that row stayed in the source language. Re-check those.
- `quality` `cinematic|autofit|agent` need an LLM provider; otherwise they silently return the fast result. 400 `source_language_required`: pass `source_lang`.

## 4. Generate

Build `dubreq.json` from the `final` segments and translated text:

```json
{"segments":[{"start":0.0,"end":2.4,"text":"<translated>","profile_id":"auto:spk1"}],"language":"es","language_code":"es","timing_strategy":"concise","voice_match":"per_line"}
```

Keep each segment's `profile_id` (`auto:...`) for original voices, or set one saved profile id on every segment, or omit for the engine default. `timing_strategy`: `concise` (default), `smart_fit`, `stretch_video`, `strict_slot`.

```sh
TASK=$(curl -sS --fail-with-body "$B/dub/generate/$JOB" -H "$H" -H 'Content-Type: application/json' -d @dubreq.json | jq -r .task_id)
```

Poll `GET $B/jobs/$TASK` until `done` (can take many minutes; queued behind other jobs; give up only after the owner agrees). Cancel: `POST /tasks/cancel/$TASK`. Do not resubmit a slow job; that queues a duplicate.

## 5. Download

```sh
curl -sS --fail-with-body "$B/dub/download/$JOB?include_tracks=es&default_track=es&preserve_bg=true" -H "$H" -o dubbed.mp4
curl -sS --fail-with-body "$B/dub/download-audio/$JOB?lang=es&preserve_bg=true" -H "$H" -o dubbed.wav
curl -sS --fail-with-body "$B/dub/srt/$JOB?lang=es" -H "$H" -o dubbed.srt     # also /dub/vtt/
```

Muxing is synchronous and slow: use a long timeout. Audio-only jobs: `out_format` wav|m4a|mp3|flac.

## QC and report

`ffprobe` outputs (video present, audio duration close to source). Spot-check translated rows for `error`. From the job's `done` event/row note `fit_status` and `sync_scores` if present. Report: paths, target language, provider used (state it was local), voices used, any rows that fell back, and anything you could not verify by listening.
