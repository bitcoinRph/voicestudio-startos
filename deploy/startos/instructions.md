## Documentation

- [VoiceStudio README](https://github.com/debpalash/VoiceStudio/blob/main/README.md): what each studio does and which engines it supports.
- [MCP server guide](https://github.com/debpalash/VoiceStudio/blob/main/docs/mcp.md): the agent tools, per-agent voices and output modes.
- [API authentication](https://github.com/debpalash/VoiceStudio/blob/main/docs/api-auth.md): how the API key, sessions and the OpenAI-compatible API work.
- [Downloading models](https://github.com/debpalash/VoiceStudio/blob/main/docs/downloading-models.md): model sizes, mirrors and the Hugging Face token.

## What you get on StartOS

- **Web UI**: the full studio for voice cloning, voice design, dubbing, transcription and narration.
- **REST API**: VoiceStudio's own API, plus an OpenAI-compatible speech and transcription API under `/v1`.
- **MCP Server**: tools for AI agents to speak, clone and design voices, and transcribe audio.
- A generated **API key** protects all three. Other services on this server, such as HyperFrames, use the same key automatically.

Voices, projects, dubs and history are in your backups. Downloaded models are not: after a restore, VoiceStudio downloads them again when you first use them.

## Getting set up

1. Open the **Actions** tab and run **API Key**. Copy the key.
2. Open the **Web UI** interface and paste the key when VoiceStudio asks for it.
3. Follow the first-run setup in the Web UI to download a voice model. The first model is several GB, so the download can take some time.
4. Before you use VoiceStudio for business, read the licence that the Web UI shows for each model. Some models allow only non-commercial use. You accept each licence yourself in the Web UI.

## Connecting AI agents

1. Run the **Connect AI Agents** action. It shows ready-to-paste settings for Claude Code, Codex, Hermes Agent, OpenClaw and OpenAI-compatible apps. Each snippet contains your API key, so keep it private.
2. If the agent runs on another computer, that computer must trust your server's root certificate. Download the certificate from your StartOS system settings and add it to the computer's trust store. For Node-based agents, you can also set the `NODE_EXTRA_CA_CERTS` environment variable to the certificate file.
3. Each agent sends its own client id (for example `claude-code`). In the Web UI you can give each agent its own voice.

To have an agent put VoiceStudio audio into videos, install HyperFrames on the same server. Its agent tools then include speech, voice cloning, voice design, transcription and dubbing, and they write the audio straight into your HyperFrames project.

## Actions

- **API Key**: shows the key. Turn on **Generate a new key** to replace it. VoiceStudio restarts. Update every agent and app outside StartOS with the new key. Services on this server, such as HyperFrames, pick it up when they restart.
- **Connect AI Agents**: settings for AI agents and OpenAI-compatible apps.
- **Usage Analytics**: off by default, and VoiceStudio then sends no usage analytics. When you turn it on, the Web UI asks for your consent once.

## Hardware

VoiceStudio runs on the CPU. On a CPU, transcription and short narration are practical. Long narration and dubbing are slow: a GPU is often 10 to 50 times faster. If you add an NVIDIA GPU to your server, VoiceStudio uses it automatically.
