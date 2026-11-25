#!/usr/bin/env bash
# shellcheck disable=SC2086

# -----------------------------------------------------------------------------
# StackCode CLI smoke test harness
# -----------------------------------------------------------------------------
# This script performs a lightweight end-to-end check against the StackCode CLI.
# It builds the CLI, runs its automated test suite, and then exercises every
# registered command to ensure they load correctly. For non-interactive
# commands, it also performs a minimal functional check inside an isolated temp
# workspace so the repository remains untouched.
#
# Usage:
#   ./scripts/test-cli-commands.sh
#
# Environment flags:
#   SKIP_CLI_BUILD=1   -> Skip the build step (assumes dist/ is up-to-date)
#   SKIP_CLI_TESTS=1   -> Skip the vitest suite execution
# -----------------------------------------------------------------------------

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI_WORKSPACE="@stackcode/cli"
CLI_BIN="$ROOT_DIR/packages/cli/dist/index.js"

run() {
  local cmd=("$@")
  echo "[exec] ${cmd[*]}"
  "${cmd[@]}"
}

if [[ "${SKIP_CLI_BUILD:-0}" != "1" ]]; then
  echo "\n==> Building StackCode CLI"
  run npm run build --workspace "$CLI_WORKSPACE"
else
  echo "\n==> Skipping CLI build (SKIP_CLI_BUILD=1)"
fi

if [[ ! -f "$CLI_BIN" ]]; then
  echo "[error] CLI binary not found at $CLI_BIN" >&2
  exit 1
fi

if [[ "${SKIP_CLI_TESTS:-0}" != "1" ]]; then
  echo "\n==> Running CLI automated tests"
  run npm run test --workspace "$CLI_WORKSPACE"
else
  echo "\n==> Skipping CLI tests (SKIP_CLI_TESTS=1)"
fi

# Smoke-check every command entry point with --help to ensure the handler loads.
declare -a HELP_COMMANDS=(
  "commit --help"
  "config --help"
  "generate --help"
  "git --help"
  "git start --help"
  "git finish --help"
  "init --help"
  "release --help"
  "validate --help"
  "github --help"
  "github auth --help"
  "github issues --help"
)

echo "\n==> Verifying CLI command registration"
for entry in "${HELP_COMMANDS[@]}"; do
  # shellcheck disable=SC2086 # we want word splitting for the sub-arguments
  if node "$CLI_BIN" $entry >/dev/null 2>&1; then
    printf '[pass] stackcode %s\n' "$entry"
  else
    printf '[fail] stackcode %s\n' "$entry" >&2
    exit 1
  fi
done

# Functional smoke tests for non-interactive commands inside a temp workspace.
TEMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Isolate Configstore writes so the user's environment is untouched.
export XDG_CONFIG_HOME="$TEMP_DIR/.config"
mkdir -p "$XDG_CONFIG_HOME"

pushd "$TEMP_DIR" >/dev/null

# Initialise a tiny git repo to keep git-dependent commands happy when invoked
# with --help (some flows inspect git presence during setup).
git init -q
git config user.name "StackCode Smoke"
git config user.email "cli-smoke@example.com"

echo "\n==> Running functional smoke checks inside $TEMP_DIR"

# 1. Validate command should accept a well-formed message.
node "$CLI_BIN" validate "chore: smoke-check"

# 2. Generate README and .gitignore without prompts.
node "$CLI_BIN" generate readme
node "$CLI_BIN" generate gitignore

# 3. Config command in non-interactive mode (writes to temp XDG_CONFIG_HOME).
node "$CLI_BIN" config set lang en

popd >/dev/null

echo "\nAll StackCode CLI smoke checks passed!"