# Updating the upstream version

The package wraps upstream's published images. To move to a new VoiceStudio release `X.Y.Z`:

1. Confirm the release images exist and get their index digests:

   ```sh
   TOKEN=$(curl -fsS "https://ghcr.io/token?scope=repository:debpalash/voicestudio:pull" | jq -r .token)
   for t in X.Y.Z; do
     printf '%s ' "$t"
     curl -fsSI -H "Authorization: Bearer $TOKEN" \
       -H 'Accept: application/vnd.oci.image.index.v1+json' \
       "https://ghcr.io/v2/debpalash/voicestudio/manifests/$t" | grep -i docker-content-digest
   done
   ```

2. Update the `tag@digest` constant in `startos/manifest/index.ts` and the `ARG IMAGE` default in `Dockerfile`.
3. Set `version` in `startos/versions/current.ts` to `X.Y.Z:0` and rewrite `releaseNotes` for this release (all locales).
4. Read upstream's `CHANGELOG.md` for new environment variables, ports, data paths or auth changes, and update `startos/main.ts`, `README.md` and `instructions.md` if any affect the package.
5. Run `npm ci && npx tsc --noEmit`, then build: push the branch and let `.github/workflows/startos.yml` build it.
6. Install the result on a StartOS server and check: Web UI login with the key, one speech generation, one transcription, the MCP endpoint from an agent, and HyperFrames' `voicestudio_status`.

Bump the StartOS revision (`X.Y.Z:1`, `:2`, …) for package-only changes.
