import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

// Upstream's x86_64 image, pinned by index digest. Bump with versions/current.ts.
// It is the CUDA build: it runs on the CPU, and uses an NVIDIA GPU when the
// server has one and StartOS passes it through.
const image =
  'ghcr.io/debpalash/voicestudio:0.5.7@sha256:65f1305c749c759d3656fed5f12623a98aff11e5f326d28bf7095cb57f3a9e0b'

export const manifest = setupManifest({
  id: 'voicestudio',
  title: 'VoiceStudio',
  license: 'AGPL-3.0-only',
  packageRepo: 'https://github.com/bitcoinRph/voicestudio-startos',
  upstreamRepo: 'https://github.com/debpalash/VoiceStudio',
  marketingUrl: 'https://voicestudio.sh',
  donationUrl: 'https://github.com/sponsors/debpalash',
  description: { short, long },
  // main: voices, projects, dubs, database and store.json (backed up).
  // models: model weights and engine installs (re-downloadable, not backed up).
  // public: credentials.json, read by dependent services.
  volumes: ['main', 'models', 'public'],
  images: {
    voicestudio: {
      source: {
        dockerBuild: {
          workdir: '.',
          dockerfile: 'Dockerfile',
          buildArgs: { IMAGE: image },
        },
      },
      arch: ['x86_64'],
      emulateMissing: false,
      nvidiaContainer: true,
    },
  },
  hardwareAcceleration: true,
})
