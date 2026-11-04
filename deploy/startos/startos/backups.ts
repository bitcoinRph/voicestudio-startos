import { sdk } from './sdk'

// `models` is left out: weights and engine installs are large and
// re-downloadable. A restored server downloads them again on first use.
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) => sdk.Backups.ofVolumes('main', 'public'),
)
