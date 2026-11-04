import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * On the `public` volume. Dependent services mount it read-only to read the
 * key VoiceStudio requires from every non-loopback caller.
 */
const shape = z.looseObject({
  apiKey: z.string().optional().catch(undefined),
})

export const credentialsJson = FileHelper.json(
  { base: sdk.volumes.public, subpath: 'credentials.json' },
  shape,
)
