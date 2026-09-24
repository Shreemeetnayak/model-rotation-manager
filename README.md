# Model Rotation Manager

Claude Code plugin that keeps OmniRoute combos working when models, credentials or
providers fail — so you stop typing "try again".

## What it does

| Problem you see | What the plugin does |
|-----------------|----------------------|
| `Request failed, retrying` | Classifies the failure, excludes the incapable route, picks a working one |
| `429` rate limit | Cools down that credential only, rotates to another credential |
| `502` / `503` | Short cooldown on that route, falls back |
| `400` context overflow | Excludes that model **for this request** before any API call |
| `model not available in active live catalog` | Refreshes catalog, stops routing to it until it returns |
| `401` / `403` | Disables that credential, other credentials keep serving |
| Timeout / connection reset | Health penalty, fallback to next route |
| OmniRoute not running | Starts it automatically when Claude Code starts |

## Install

Add as a marketplace from GitHub:

```
/plugin marketplace add Shreemeetnayak/model-rotation-manager
```

Then install:

```
/plugin install model-rotation-manager@model-rotation-manager
```

Or copy the folder manually to `%USERPROFILE%\.claude\plugins\model-rotation-manager`
and restart Claude Code.

## Requirements

- Claude Code with plugin support
- OmniRoute installed and `omniroute` on PATH (`npm install -g omniroute`)
- Default port 20128, or set `OMNIROUTE_PORT`

## Commands

- `/cascade` — move to the next capable route
- `/rotation-status` — show current model, eligible routes, and exclusion reasons

## How it avoids wasting requests

Before sending, the router filters routes by:

1. Model exists in the provider's live catalog
2. Provider reachable
3. Credential healthy and not cooling down
4. `estimated_input + output_budget + margin <= context_window`
5. Required capabilities present
6. Concurrency slot free

Only then is a request sent. A 128K model never receives a 160K request.

## Concurrency

Each request independently acquires a free route. One busy conversation never blocks
another. A credential's limit applies only to that credential.

## Permissions

| Permission | Why |
|-----------|-----|
| `Bash(curl:*)` | Read health and status endpoints |
| `Bash(omniroute:*)` | Start the server if it is not running |

No API keys are stored by this plugin. OmniRoute owns credential storage.

## Troubleshooting

**Marketplace add fails** — Claude Code requires `.claude-plugin/marketplace.json` at
the repository root. This repo now has it. If you cloned before v1.1.0, pull the latest.

**OmniRoute does not start** — check `omniroute --version`, then
`~/.omniroute/logs/hook-autostart.log`.

**Still seeing context errors** — the model you are calling directly does not do
context-aware selection. Use a combo configured with `context-optimized` or
`context-relay` strategy, and verify with `/rotation-status`.

## Development

The `src/` and `src-tauri/` folders contain an optional Tauri desktop dashboard.
They are not required for the plugin to work.

```bash
npm install
npm run build       # frontend
cd src-tauri && cargo check
```

## License

MIT — see [LICENSE](LICENSE).
