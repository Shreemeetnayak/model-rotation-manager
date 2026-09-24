#!/usr/bin/env bash
# SessionStart hook: ensure OmniRoute is running before Claude Code uses it.
set -uo pipefail

PORT="${OMNIROUTE_PORT:-20128}"
HEALTH="http://127.0.0.1:${PORT}/api/health"
STARTED_BIN=""
for b in omniroute omniroute.cmd; do
  if command -v "$b" >/dev/null 2>&1; then STARTED_BIN="$b"; break; fi
done
if [ -z "$STARTED_BIN" ]; then
  [ -d "$HOME/AppData/Roaming/npm" ] && export PATH="$PATH:$HOME/AppData/Roaming/npm"
  command -v omniroute >/dev/null 2>&1 && STARTED_BIN=omniroute
fi

if curl -fsS -m 2 "$HEALTH" >/dev/null 2>&1; then
  echo "OmniRoute already healthy on :$PORT"
  exit 0
fi

if [ -z "$STARTED_BIN" ]; then
  echo "OmniRoute not running and 'omniroute' is not on PATH. Install with: npm install -g omniroute"
  exit 0
fi

# # ponytail: user-level startup, not a Windows service. Move to a service only
# if you need OmniRoute to survive logoff or start before any user process.
nohup "$STARTED_BIN" serve >"$HOME/.omniroute/logs/hook-autostart.log" 2>&1 &
for _ in $(seq 1 30); do
  sleep 1
  if curl -fsS -m 2 "$HEALTH" >/dev/null 2>&1; then
    echo "OmniRoute started and healthy on :$PORT"
    exit 0
  fi
done

echo "OmniRoute did not become healthy on :$PORT within 30s. Check $HOME/.omniroute/logs/hook-autostart.log"
exit 0
