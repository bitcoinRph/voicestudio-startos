import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// StartOS-level settings, kept at the root of the `main` volume. The app's own
// data lives under the volume's `data` subpath, so it never sees this file.
const shape = z.looseObject({
  // Upstream asks for analytics consent on first run. StartOS turns analytics
  // off entirely unless the owner allows the prompt.
  analyticsAllowed: z.boolean().catch(false),
})

export type Store = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
