import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

const variant = process.env.VARIANT || 'generic'

// Upstream images pinned by index digest. Bump with versions/current.ts.
const upstream = 'ghcr.io/debpalash/voicestudio'
const cudaAmd64 = `${upstream}:0.5.7@sha256:65f1305c749c759d3656fed5f12623a98aff11e5f326d28bf7095cb57f3a9e0b`
const cudaArm64 = `${upstream}:0.5.7-cuda-arm64@sha256:328e7917fc7d0efb0e1edcc098bbffe345d4f34da3fcb3b06be4203d8d3d18d1`
const rocmAmd64 = `${upstream}:0.5.7-rocm@sha256:f776f3681827b5c3f4305d2a21020804aeca5e1c3edb819ea2ef5586dba65ed3`

type Mutable<T> = { -readonly [K in keyof T]: Mutable<T[K]> }
const mutable = <T>(value: T): Mutable<T> => value as Mutable<T>

// `generic` is upstream's CUDA image. It uses an NVIDIA GPU when StartOS
// passes one through and runs on the CPU otherwise, so it is the fallback
// variant with no device requirement. `rocm` is upstream's AMD image.
const imageConfigs = {
  generic: {
    source: {
      dockerBuild: {
        workdir: '.',
        dockerfile: 'Dockerfile',
        buildArgs: { AMD64_IMAGE: cudaAmd64, ARM64_IMAGE: cudaArm64 },
      },
    },
    arch: ['x86_64', 'aarch64'],
    emulateMissing: false,
    nvidiaContainer: true,
  },
  rocm: {
    source: {
      dockerBuild: {
        workdir: '.',
        dockerfile: 'Dockerfile',
        // ARM64_IMAGE is never built for this variant; the Dockerfile needs a value.
        buildArgs: { AMD64_IMAGE: rocmAmd64, ARM64_IMAGE: cudaArm64 },
      },
    },
    arch: ['x86_64'],
    emulateMissing: false,
    nvidiaContainer: false,
  },
} as const

const hwDevices = {
  rocm: [
    {
      class: 'display' as const,
      product: null,
      vendor: null,
      driver: 'amdgpu',
      description: 'An AMD GPU supported by ROCm',
    },
  ],
} as const

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
    voicestudio: mutable(
      imageConfigs[variant as keyof typeof imageConfigs] ??
        imageConfigs.generic,
    ),
  },
  hardwareAcceleration: true,
  hardwareRequirements: {
    device: [...(hwDevices[variant as keyof typeof hwDevices] ?? [])],
  },
})
