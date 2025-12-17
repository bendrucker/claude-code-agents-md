#!/bin/sh
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node --experimental-strip-types --no-warnings "$HOOK_DIR/hook.ts" "$@"
