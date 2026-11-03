// Constants shared across the package. Dependent packages (for example
// hyperframes-startos) copy `mainHostId`, `apiPort` and the `public` volume's
// `credentials.json` contract, so treat them as a stable interface.

import { utils } from '@start9labs/start-sdk'

/** The VoiceStudio backend (web UI, REST API, OpenAI-compatible API and MCP) listens here. */
export const apiPort = 3900

/** The one host every interface is exported on. Dependents resolve its bridge address. */
export const mainHostId = 'main'

/** Where the `main` volume's `data` subpath is mounted (upstream's `OMNIVOICE_DATA_DIR`). */
export const dataDir = '/app/omnivoice_data'

/** Where the `models` volume is mounted: Hugging Face cache, engine installs, tool caches. */
export const modelsDir = '/models'

/** Mounted path of the MCP endpoint. The trailing slash works on every VoiceStudio version. */
export const mcpPath = '/mcp/'

/** Path of the OpenAI-compatible API, relative to the API interface. */
export const openAiPath = '/v1'

export const variant = (process.env.VARIANT || 'generic') as 'generic' | 'rocm'

export const generateApiKey = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 40 })
