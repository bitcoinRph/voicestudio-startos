---
name: voicestudio-voice-design
description: Designs a new VoiceStudio voice profile from a text description (gender, age, pitch, accent, style) on StartOS. Use when asked to invent, design, or describe a voice rather than clone one.
---

# Voice design

Design is a keyword mapper over a fixed vocabulary: gender, age, pitch, whisper style, English accents, Chinese dialects. Words outside it (raspy, warm) are reported as `unmatched` and have no effect.

## 1. Dry run (saves nothing)

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/design/describe" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -H 'Content-Type: application/json' -d '{"description":"elderly British woman, low pitch"}'
```

Response: `attrs`, `instruct` (e.g. `female, elderly, low pitch, british accent`), `matched`, `unmatched`. Description max 2000 chars. If `matched` is empty the design is refused (MCP `design_voice` refuses too): rephrase with supported words. Tell the user which words were unmatched.

## 2. Create

MCP: `design_voice(name, description, language)` returns `{profile_id,name,kind,attrs,unmatched}`. REST:

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/profiles" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" \
  -F name="Gran" -F kind=design -F language=en -F instruct="female, elderly, low pitch, british accent" \
  -F vd_states="$ATTRS_JSON"
```

Set `ATTRS_JSON` to the `attrs` object returned by step 1, as a compact JSON string (`jq -c .attrs`); never hand-write it. Missing `vd_states` gives 422. Optional `seed` (default 42) keeps the identity stable.

## 3. Render the sample

The sample may be pending. Fetch it once, which renders it lazily:

```sh
curl -sS --fail-with-body "$VOICESTUDIO_URL/profiles/<id>/audio" -H "Authorization: Bearer $VOICESTUDIO_API_KEY" -o sample.wav
```

Verify it is audio, then use the profile id like any voice (`voicestudio-tts`). The first render can wait on the OmniVoice model (503 + `Retry-After`: retry; licence 403: owner's decision, see `voicestudio-connect`).
