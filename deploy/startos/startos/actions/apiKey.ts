import { credentialsJson } from '../fileModels/credentials.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { generateApiKey } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  rotate: Value.toggle({
    name: i18n('Generate a new key'),
    description: i18n(
      'Replace the key. VoiceStudio restarts. Update every agent and app outside StartOS; services on this server pick up the new key when they restart.',
    ),
    default: false,
  }),
})

export const apiKey = sdk.Action.withInput(
  'api-key',

  async ({ effects }) => ({
    name: i18n('API Key'),
    description: i18n(
      'Show the key for the web UI login, the REST API and the MCP server, or generate a new one.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => null,

  async ({ effects, input }) => {
    let key = await credentialsJson.read((c) => c.apiKey).once()
    if (input.rotate || !key) {
      key = generateApiKey()
      await credentialsJson.merge(effects, { apiKey: key })
    }

    return {
      version: '1',
      title: i18n('API Key'),
      message: i18n(
        'Paste this key into the web UI login. Agents and apps send it as "Authorization: Bearer <key>".',
      ),
      result: {
        type: 'single',
        name: i18n('API Key'),
        description: null,
        value: key,
        masked: true,
        copyable: true,
        qr: false,
        launchable: false,
      },
    }
  },
)
