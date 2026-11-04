---
name: voicestudio-hyperframes
description: Routes voice work between VoiceStudio and HyperFrames when both run on the same StartOS server. Use when making a video in HyperFrames that needs narration, transcription, a cloned or designed voice, or a dub.
---

# VoiceStudio with HyperFrames

- If the HyperFrames service on the same StartOS server exposes its `voicestudio_*` tools (speak, transcribe, clone, design, dub), use those. They write results straight into the HyperFrames project, so no upload or download is needed.
- Otherwise use the other VoiceStudio skills (`voicestudio-tts`, `voicestudio-transcription`, `voicestudio-voice-cloning`, `voicestudio-voice-design`, `voicestudio-dubbing`) and upload the resulting files into the HyperFrames project yourself.
- Do not guess HyperFrames tool parameters; read them from the tool schema at runtime.
- Never hand a raw VoiceStudio URL to a browser or `<audio>` tag: it cannot send the Bearer key. Download the file first and reference the local copy.
- Consent and licence rules from `voicestudio-voice-cloning` and `voicestudio-connect` still apply.
