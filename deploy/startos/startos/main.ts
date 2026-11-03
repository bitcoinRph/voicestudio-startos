import { credentialsJson } from './fileModels/credentials.json'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort, dataDir, mainHostId, modelsDir } from './utils'

// Origin of the Electron desktop app, which can use this server as its
// remote backend. Setting OMNIVOICE_ALLOWED_ORIGINS replaces upstream's
// default list (backend/core/csrf.py), so it is restated here.
const desktopOrigin = 'app://voicestudio'

export const main = sdk.setupMain(async ({ effects }) => {
  // Init generates the key on install, so it is only missing if the file was
  // removed by hand. Without it VoiceStudio would serve every LAN client
  // unauthenticated, so refuse to start.
  const apiKey = await credentialsJson.read((c) => c.apiKey).const(effects)
  if (!apiKey)
    throw new Error(i18n('The API key is missing. Run the API Key action.'))

  const analyticsAllowed = await storeJson
    .read((s) => s.analyticsAllowed)
    .const(effects)

  // Every address StartOS publishes for this host. VoiceStudio checks Origin
  // (CSRF, CORS) and Host (DNS-rebinding guard, MCP transport security)
  // against them. A comma-joined string keeps `.const()` from restarting the
  // service unless the set really changes.
  const addresses = await sdk.host
    .getOwn(effects, mainHostId, (host) => {
      const urls =
        host?.bindings[apiPort]?.interfaces['ui']?.addressInfo.format('url')
      if (!urls) return ''
      const unique = new Set(urls.map((u) => `${u.origin} ${u.hostname}`))
      return [...unique].sort().join(',')
    })
    .const()

  const pairs = addresses ? addresses.split(',').map((p) => p.split(' ')) : []
  const origins = [...new Set(pairs.map(([origin]) => origin))]
  const hostnames = [...new Set(pairs.map(([, hostname]) => hostname))]

  // Dependents dial the bridge address, whose Host is the OS IP.
  const osIp = await sdk.getOsIp(effects)
  const mcpHosts = [...hostnames, osIp].flatMap((h) => [h, `${h}:*`])

  const env: Record<string, string> = {
    OMNIVOICE_API_KEY: apiKey,
    OMNIVOICE_DATA_DIR: dataDir,
    OMNIVOICE_SERVER_MODE: '1',
    OMNIVOICE_BIND_HOST: '0.0.0.0',
    OMNIVOICE_PORT: String(apiPort),
    OMNIVOICE_ALLOWED_ORIGINS: [desktopOrigin, ...origins].join(','),
    OMNIVOICE_MCP_ALLOWED_HOSTS: mcpHosts.join(','),
    // Re-downloadable weights and engine installs live on the `models`
    // volume, which backups skip.
    HF_HOME: `${modelsDir}/huggingface`,
    TORCH_HOME: `${modelsDir}/torch`,
    XDG_CACHE_HOME: `${modelsDir}/cache`,
    OMNIVOICE_ENGINES_DIR: `${modelsDir}/engines`,
    // CUDA's JIT cache survives restarts; inert without an NVIDIA GPU.
    CUDA_CACHE_PATH: `${modelsDir}/cache/nv`,
  }
  if (!analyticsAllowed) env.OMNIVOICE_ANALYTICS_DISABLED = '1'

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'voicestudio' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: 'data',
        mountpoint: dataDir,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'models',
        subpath: null,
        mountpoint: modelsDir,
        readonly: false,
      }),
    'voicestudio-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer,
    exec: { command: sdk.useEntrypoint(), env },
    ready: {
      display: i18n('VoiceStudio'),
      // The first start creates the database and loads Python; it can take
      // minutes on a slow disk before /health answers.
      gracePeriod: 300_000,
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          `http://127.0.0.1:${apiPort}/health`,
          {
            successMessage: i18n('VoiceStudio is ready'),
            errorMessage: i18n('VoiceStudio is not responding'),
          },
        ),
    },
    requires: [],
  })
})
