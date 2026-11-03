# The StartOS image is upstream's published image, unchanged. A Dockerfile is
# used only because upstream publishes x86_64 and aarch64 under different tags
# (`X.Y.Z` and `X.Y.Z-cuda-arm64`), and one StartOS image id must cover both.
# The build args are set per variant in startos/manifest/index.ts; bump them
# together with startos/versions/current.ts (see UPDATING.md).
ARG AMD64_IMAGE=ghcr.io/debpalash/voicestudio:0.5.7
ARG ARM64_IMAGE=ghcr.io/debpalash/voicestudio:0.5.7-cuda-arm64
ARG TARGETARCH

FROM --platform=linux/amd64 ${AMD64_IMAGE} AS base-amd64
FROM --platform=linux/arm64 ${ARM64_IMAGE} AS base-arm64
FROM base-${TARGETARCH}
