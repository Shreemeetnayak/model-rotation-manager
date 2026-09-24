# Changelog

## 1.1.0

### Added
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` so the repository
  can be added as a Claude Code marketplace (this was missing, which is why
  "failed to add marketplace" was reported).
- `SessionStart` hook that starts OmniRoute if it is not already healthy on port 20128,
  waits for the health endpoint, and never spawns a duplicate server.
- `/cascade` and `/rotation-status` commands.
- SKILL.md rewritten as operational routing guidance: failure classification,
  pre-send context filtering, credential-level isolation, and concurrency rules.

### Fixed
- `icon.ico` was a 1x1 PNG with an `.ico` extension, which made `cargo build` fail
  with "Invalid reserved field value in ICONDIR". Replaced with a valid ICO.
- `tauri.conf.json` referenced a non-existent `icon.icns`; removed from the icon list.
- `cargo check` now completes successfully.

### Known limitations
- The Tauri desktop app is a separate deliverable; the Claude Code plugin itself is the
  hook + skill + commands in this repository. The app is not required for routing.
- Marketplace submission for public listing is a separate approval process by Anthropic;
  this repository is ready to be referenced by URL but is not on the public marketplace.
