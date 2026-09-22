---
name: model-rotation-manager
displayName: Model Rotation Manager
description: Automatically detects API errors in Claude Code and rotates through configured models (Opus 4 → Sonnet 4 → Haiku 3.5) for uninterrupted AI assistance.
version: 1.0.0
author: Shreemeetnayak
license: MIT
repository: https://github.com/Shreemeetnayak/model-rotation-manager
homepage: https://github.com/Shreemeetnayak/model-rotation-manager
category: productivity
tags:
  - model-rotation
  - error-handling
  - claude-code
  - automation
  - productivity
main: src/main.tsx
icon: icons/icon.png
platforms:
  - win32
  - darwin
  - linux
engines:
  node: ">=18.0.0"
  rust: ">=1.70.0"
---

# Model Rotation Manager

A Tauri-based desktop plugin for Claude Code that automatically detects API errors and rotates between Claude models for uninterrupted AI assistance.

## Features

- **Auto Error Detection**: Monitors for rate limits, timeouts, overloads, context limits, auth errors
- **Smart Model Rotation**: Opus 4 → Sonnet 4 → Haiku 3.5 (configurable priority)
- **Retry Logic**: Configurable retries (default 3) with delay (default 1s)
- **Full UI**: Dashboard, Settings (3 tabs), Error History with filtering
- **Manual Cascade**: One-click button to force model rotation
- **Privacy-First**: SHA256 prompt hashing, local storage, zero telemetry

## Installation

### Option 1: From GitHub Release (Easiest)
1. Download `ModelRotationManager-v1.0.0.zip` from [Releases](https://github.com/Shreemeetnayak/model-rotation-manager/releases)
2. Extract to: `%USERPROFILE%\.claude\plugins\ModelRotationManager\`
3. Restart Claude Code
4. Access via Plugins menu → "Model Rotation Manager"

### Option 2: Build from Source
```bash
git clone https://github.com/Shreemeetnayak/model-rotation-manager.git
cd model-rotation-manager
npm install
npm run build
npm run tauri:build
```

## Usage

1. Open Claude Code
2. Press `Ctrl+Shift+P` → "Model Rotation Manager" → "Open Dashboard"
3. Configure models in Settings → Models (defaults provided)
4. Use Claude Code normally - plugin handles errors automatically

## Configuration

- **Models Tab**: Add/remove models with ID, name, env var, priority, enabled
- **Error Patterns Tab**: Pre-configured regex patterns for common errors
- **Behavior Tab**: Max retries, retry delay, auto-rotate toggle

## How It Works

1. Plugin monitors Claude Code output for error patterns
2. On error detection: logs error, increments retry counter
3. If retries < max: waits delay, resends prompt
4. If retries ≥ max: rotates to next enabled model, resends prompt
4. Process repeats until success

## Privacy

- No telemetry or data collection
- All data stored locally in `%LOCALAPPDATA%\ModelRotationManager`
- Only SHA256 hashes of prompts stored (never full text)
- No network calls except Claude Code's own API requests
- Open source - full code auditable

## Support

- Issues: [GitHub Issues](https://github.com/Shreemeetnayak/model-rotation-manager/issues)
- Discussions: [GitHub Discussions](https://github.com/Shreemeetnayak/model-rotation-manager/discussions)
