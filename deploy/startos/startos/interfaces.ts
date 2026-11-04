import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, mainHostId, mcpPath } from './utils'

// VoiceStudio enforces its own credential: with OMNIVOICE_API_KEY set, every
// non-loopback request, including one from the StartOS proxy or the bridge,
// must present the key (Bearer header) or a session the web UI exchanged it
// for. So the proxy adds TLS only; a second gate here would block the UI's
// own login. The three interfaces share one host and port.
export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const origin = await sdk.MultiHost.of(effects, mainHostId).bindPort(apiPort, {
    protocol: 'http',
  })

  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n(
      'The VoiceStudio studio for your browser. Log in with the key from the API Key action.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const api = sdk.createInterface(effects, {
    name: i18n('REST API'),
    id: 'api',
    description: i18n(
      'Native and OpenAI-compatible speech API. Append /v1 for OpenAI clients. Send the API key as a bearer token.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const mcp = sdk.createInterface(effects, {
    name: i18n('MCP Server'),
    id: 'mcp',
    description: i18n(
      'Model Context Protocol endpoint (streamable HTTP) for Claude Code, Codex, Hermes Agent, OpenClaw and other MCP clients. Send the API key as a bearer token.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: mcpPath,
    query: {},
  })

  return [await origin.export([ui, api, mcp])]
})
