export const DEFAULT_LANG = 'en_US'

const dict = {
  'Allow the analytics consent prompt': 0,
  'Off: VoiceStudio sends no usage analytics. On: the web UI asks for consent on first run and sends content-free usage data only if you answer yes.': 1,
  'Usage Analytics': 2,
  'Choose whether VoiceStudio may ask for consent to send anonymous usage analytics. Off by default.': 3,
  'Generate a new key': 4,
  'Replace the key. VoiceStudio restarts. Update every agent and app outside StartOS; services on this server pick up the new key when they restart.': 5,
  'API Key': 6,
  'Show the key for the web UI login, the REST API and the MCP server, or generate a new one.': 7,
  'Paste this key into the web UI login. Agents and apps send it as "Authorization: Bearer <key>".': 8,
  'Connect AI Agents': 9,
  'Ready-to-paste settings for Claude Code, Codex, Hermes Agent, OpenClaw and OpenAI-compatible apps.': 10,
  'VoiceStudio has no reachable address or API key yet. Start the service, then run this action again.': 11,
  'MCP endpoint': 12,
  'OpenAI-compatible base URL': 13,
  "Each snippet contains your API key. Agents on another computer must trust this server's root certificate (for Node-based agents, set NODE_EXTRA_CA_CERTS). See the instructions for details.": 14,
  'Web UI': 15,
  'The VoiceStudio studio for your browser. Log in with the key from the API Key action.': 16,
  'REST API': 17,
  'Native and OpenAI-compatible speech API. Append /v1 for OpenAI clients. Send the API key as a bearer token.': 18,
  'MCP Server': 19,
  'Model Context Protocol endpoint (streamable HTTP) for Claude Code, Codex, Hermes Agent, OpenClaw and other MCP clients. Send the API key as a bearer token.': 20,
  'The API key is missing. Run the API Key action.': 21,
  VoiceStudio: 22,
  'VoiceStudio is ready': 23,
  'VoiceStudio is not responding': 24,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
