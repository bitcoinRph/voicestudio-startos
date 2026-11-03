import { T } from '@start9labs/start-sdk'
import { credentialsJson } from '../fileModels/credentials.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { apiPort, mainHostId, openAiPath } from '../utils'

type Snippet = { name: string; value: string; masked: boolean }

// The address a remote agent can reach and verify best: a public domain,
// then the .local name, then any other non-local address.
const bestUrl = (effects: T.Effects, interfaceId: 'api' | 'mcp') =>
  sdk.host
    .getOwn(effects, mainHostId, (host) => {
      const info = host?.bindings[apiPort]?.interfaces[interfaceId]?.addressInfo
      if (!info) return null
      return (
        info.public.format()[0] ??
        info.filter({ kind: 'mdns' }).format()[0] ??
        info.nonLocal.format()[0] ??
        null
      )
    })
    .once()

export const connectAgents = sdk.Action.withoutInput(
  'connect-agents',

  async ({ effects }) => ({
    name: i18n('Connect AI Agents'),
    description: i18n(
      'Ready-to-paste settings for Claude Code, Codex, Hermes Agent, OpenClaw and OpenAI-compatible apps.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const key = (await credentialsJson.read((c) => c.apiKey).once()) ?? ''
    const mcpUrl = await bestUrl(effects, 'mcp')
    const apiUrl = await bestUrl(effects, 'api')
    if (!key || !mcpUrl || !apiUrl) {
      return {
        version: '1',
        title: i18n('Connect AI Agents'),
        message: i18n(
          'VoiceStudio has no reachable address or API key yet. Start the service, then run this action again.',
        ),
        result: null,
      }
    }
    const openAiBase = `${apiUrl.replace(/\/$/, '')}${openAiPath}`

    // The client id lets VoiceStudio give each agent its own voice
    // (docs/mcp.md, "Per-agent voices").
    const snippets: Snippet[] = [
      { name: i18n('MCP endpoint'), value: mcpUrl, masked: false },
      {
        name: i18n('OpenAI-compatible base URL'),
        value: openAiBase,
        masked: false,
      },
      {
        name: 'Claude Code',
        value: `claude mcp add --transport http voicestudio ${mcpUrl} --header "Authorization: Bearer ${key}" --header "X-OmniVoice-Client-Id: claude-code"`,
        masked: true,
      },
      {
        name: 'Codex (~/.codex/config.toml)',
        value: `[mcp_servers.voicestudio]\nurl = "${mcpUrl}"\nhttp_headers = { "Authorization" = "Bearer ${key}", "X-OmniVoice-Client-Id" = "codex-cli" }`,
        masked: true,
      },
      {
        name: 'Hermes Agent (~/.hermes/config.yaml)',
        value: `mcp_servers:\n  voicestudio:\n    url: "${mcpUrl}"\n    headers:\n      Authorization: "Bearer ${key}"\n      X-OmniVoice-Client-Id: "hermes"`,
        masked: true,
      },
      {
        name: 'OpenClaw (~/.openclaw/openclaw.json, mcp.servers)',
        value: JSON.stringify(
          {
            voicestudio: {
              url: mcpUrl,
              transport: 'streamable-http',
              headers: {
                Authorization: `Bearer ${key}`,
                'X-OmniVoice-Client-Id': 'openclaw',
              },
            },
          },
          null,
          2,
        ),
        masked: true,
      },
    ]

    return {
      version: '1',
      title: i18n('Connect AI Agents'),
      message: i18n(
        "Each snippet contains your API key. Agents on another computer must trust this server's root certificate (for Node-based agents, set NODE_EXTRA_CA_CERTS). See the instructions for details.",
      ),
      result: {
        type: 'group',
        value: snippets.map((s) => ({
          type: 'single' as const,
          name: s.name,
          description: null,
          value: s.value,
          masked: s.masked,
          copyable: true,
          qr: false,
          launchable: false,
        })),
      },
    }
  },
)
