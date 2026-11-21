#!/bin/sh
# vite-office Graphify post-checkout hook
set -eu

script=$0
case "$script" in
  /*) ;;
  *) script=$PWD/$script ;;
esac

cd "$(git rev-parse --show-toplevel)"

refresh() {
  mkdir -p .graphify || return 1
  : > .graphify/refresh-pending || return 1
  if [ ! -x .graphify/venv/bin/graphify ]; then
    echo "Graphify: set up the local environment as described in README.md." >&2
    return 1
  fi

  if [ -s graphify-out/graph.json ]; then
    GRAPHIFY_OUT=graphify-out GRAPHIFY_NO_TIPS=1 .graphify/venv/bin/graphify update . || return 1
  else
    GRAPHIFY_OUT=graphify-out .graphify/venv/bin/graphify extract . --code-only || return 1
  fi
  test -s graphify-out/graph.json || return 1
  rm -f .graphify/refresh-pending
}

install_hook() {
  hooks_dir=$(git rev-parse --path-format=absolute --git-path hooks)
  if [ ! -d "$hooks_dir" ]; then
    echo "Graphify: Git hook directory does not exist: $hooks_dir" >&2
    return 1
  fi
  hooks_dir=$(cd "$hooks_dir" && pwd -P)
  case "$hooks_dir/" in
    "$(pwd -P)/"*) ;;
    *) echo "Graphify: the hooks directory must be inside this repository." >&2; return 1 ;;
  esac

  hook=$hooks_dir/post-checkout
  if [ -L "$hook" ] || { [ -e "$hook" ] && ! grep -Fxq '# vite-office Graphify post-checkout hook' "$hook"; }; then
    echo "Graphify: existing post-checkout hook found at $hook." >&2
    return 1
  fi
  if [ -x "$hook" ] && cmp -s "$script" "$hook"; then
    return
  fi
  temporary=$(mktemp "$hooks_dir/.graphify-post-checkout.XXXXXXXX")
  trap 'if [ -e "$temporary" ]; then rm "$temporary"; fi' EXIT
  cp "$script" "$temporary"
  chmod +x "$temporary"
  mv "$temporary" "$hook"
}

if [ "${0##*/}" = post-checkout ]; then
  # Git passes 0 for path checkout and 1 for a branch or detached HEAD checkout.
  if [ "${3:-0}" = 1 ] && ! refresh; then
    echo "Graphify: checkout completed, but the graph could not be refreshed." >&2
  fi
  exit 0
fi

case "${1:-}" in
  install-hook) install_hook ;;
  refresh) refresh ;;
  finish)
    shift
    refresh
    if command -v ap >/dev/null 2>&1; then
      exec ap finish "$@"
    fi
    exec agentplane finish "$@"
    ;;
  *)
    echo "Usage: sh scripts/graphify-context.sh {install-hook|refresh|finish [AgentPlane arguments]}" >&2
    exit 2
    ;;
esac
