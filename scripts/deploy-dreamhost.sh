#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

env_file="${DEPLOY_ENV_FILE:-$project_root/.env}"
if [[ -f "$env_file" ]]; then
  set -a
  # The deployment .env is a local, trusted shell-compatible settings file.
  source "$env_file"
  set +a
fi

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
ssh_command=(ssh -o BatchMode=yes -o StrictHostKeyChecking=yes)
if [[ -n "${DREAMHOST_SSH_KEY_FILE:-}" ]]; then
  [[ "$DREAMHOST_SSH_KEY_FILE" = /* ]] || { echo 'DREAMHOST_SSH_KEY_FILE must be an absolute path.' >&2; exit 1; }
  [[ -f "$DREAMHOST_SSH_KEY_FILE" ]] || { echo 'DREAMHOST_SSH_KEY_FILE does not exist.' >&2; exit 1; }
  ssh_command+=(-i "$DREAMHOST_SSH_KEY_FILE" -o IdentitiesOnly=yes)
fi
printf -v RSYNC_RSH '%q ' "${ssh_command[@]}"
export RSYNC_RSH="${RSYNC_RSH% }"
destination="${DREAMHOST_USER}@${DREAMHOST_HOST}:${DREAMHOST_PATH%/}/"
# Upload referenced assets before switching the page; retain old assets for open tabs.
rsync "${args[@]}" --exclude='/index.html' build/ "$destination"
rsync "${args[@]}" build/index.html "$destination"
