# Overrides to s9pk.mk must precede the include statement.
# Each <variant>-<arch> target builds exactly one s9pk, so CI can fan the
# matrix out. Upstream publishes ROCm images for x86_64 only.
TARGETS := generic-x86 generic-arm rocm-x86
ARCHES := x86 arm

include node_modules/@start9labs/start-sdk/s9pk.mk

.PHONY += generic rocm

generic: generic-x86 generic-arm
rocm: rocm-x86

generic-%:; VARIANT=generic $(MAKE) $*
rocm-%:; VARIANT=rocm $(MAKE) $*
