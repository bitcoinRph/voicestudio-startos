import { credentialsJson } from '../fileModels/credentials.json'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { generateApiKey } from '../utils'

// Runs on every init and re-runs when credentials.json changes. VoiceStudio's
// key is a machine credential that dependent services read, so it is
// generated rather than asked for. Deleting it rotates it.
export const seedCredentials = sdk.setupOnInit(async (effects) => {
  await storeJson.merge(effects, {})

  const apiKey = await credentialsJson.read((c) => c.apiKey).const(effects)
  if (!apiKey) {
    await credentialsJson.merge(
      effects,
      { apiKey: generateApiKey() },
      { allowWriteAfterConst: true },
    )
  }
})
