#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DREAMHOST_HOST:?Set DREAMHOST_HOST to your DreamHost SSH server}"
: "${DREAMHOST_USER:?Set DREAMHOST_USER to your DreamHost shell username}"
: "${DREAMHOST_PATH:?Set DREAMHOST_PATH to the dedicated domain web directory}"
[[ "$DREAMHOST_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]+$ ]] || { echo 'Invalid server hostname.' >&2; exit 1; }
[[ "$DREAMHOST_USER" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_-]*$ ]] || { echo 'Invalid shell username.' >&2; exit 1; }
[[ "$DREAMHOST_PATH" =~ ^/home/[a-zA-Z0-9_-]+/[a-zA-Z0-9][a-zA-Z0-9._/-]+/?$ ]] || { echo 'Use the absolute /home/USER/DOMAIN web directory, without spaces.' >&2; exit 1; }
[[ "$DREAMHOST_PATH" != *'..'* ]] || { echo 'Parent path segments are not allowed.' >&2; exit 1; }
[[ -f build/index.html ]] || { echo 'Build the site first with npm run build.' >&2; exit 1; }
args=(-az --itemize-changes --delay-updates)
case "${1:-}" in
  --dry-run) args+=(--dry-run) ;;
  '') ;;
  *) echo 'Usage: scripts/deploy-dreamhost.sh [--dry-run]' >&2; exit 1 ;;
esac
export RSYNC_RSH='ssh -o BatchMode=yes -o StrictHostKeyChecking=yes'
destination="${DREAMHOST_USER}@${DREAMHOST_HOST}:${DREAMHOST_PATH%/}/"
# Upload referenced assets before switching the page; retain old assets for open tabs.
rsync "${args[@]}" --exclude='/index.html' build/ "$destination"
rsync "${args[@]}" build/index.html "$destination"
