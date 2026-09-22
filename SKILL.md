---
name: model-rotation-manager
description: Auto-detects errors in Claude Code, rotates through omniroute/combo models, and retries prompts without manual intervention. Eliminates "try again" commands.
---

# Model Rotation Manager Skill

A Tauri-based desktop application that wraps Claude Code CLI to provide automatic model rotation on errors. Works seamlessly with omniroute/combo setups.

## Problem Solved

When using Claude Code with omniroute/combo for model rotation, users often encounter:
- Rate limits on specific models
- Model overload/at-capacity errors
- Timeouts on certain models
- Context window exceeded errors

Currently, users must manually type "try again" or restart with a different model. This skill automates that entirely.

## Features

### Core Features
- **Auto Error Detection**: Monitors stderr/stdout for 5+ common error patterns
- **Intelligent Model Rotation**: Rotates through configured model list on error
- **Automatic Retry**: Resends same prompt with next model (configurable max retries)
- **Manual Cascade Button**: One-click to advance to next model
- **Error Learning**: Tracks which models fail on which error types
- **System Tray**: Runs in background, accessible via tray icon

### Configuration
- **Models Tab**: Add/remove/reorder models with drag-and-drop
- **Error Patterns Tab**: Predefined + custom regex patterns
- **Behavior Tab**: Max retries (1-10), retry delay, auto-rotation toggle

### Integration
- Works with existing omniroute/combo setup
- Uses `ANTHROPIC_MODEL` env var for model switching
- No changes to your Claude Code configuration needed

## Installation

### As a Skill (Recommended)
```bash
# From the skill directory
npx skills add ./model-rotation-manager -g -y
```

### As a Standalone App
```bash
# Build from source
cd ModelRotationManager
npm install
npm run tauri build
# Install the .msi from src-tauri/target/release/bundle/msi/
```

## Usage

### Starting the Manager
The skill adds a command to Claude Code:
```
/model-rotation-manager
```

Or launch from system tray after first run.

### Configuration
1. Click the tray icon → Settings
2. **Models Tab**: Add your omniroute/combo model names
3. **Error Patterns Tab**: Enable/disable patterns (all enabled by default)
4. **Behavior Tab**: Set max retries (default 3), delay (default 1000ms)

### During Use
- **Auto**: Errors trigger rotation automatically
- **Manual**: Click tray icon → "Cascade to Next Model" or press `Ctrl+Shift+C`
- **Status**: Tray icon shows green (ready), yellow (retrying), red (error)

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Tauri + React App                  │
├─────────────────────────────────────────────────┤
│  Frontend: Dashboard, Settings, History, Tray  │
├─────────────────────────────────────────────────┤
│  Backend (Rust):                               │
│  ├── ModelRotationManager - Core logic         │
│  ├── ClaudeCodeInterface - Process management  │
│  ├── ErrorPatternMatcher - Regex detection     │
│  ├── SettingsStore - JSON persistence          │
│  └── ErrorHistoryStore - SQLite logging        │
├─────────────────────────────────────────────────┤
│  Claude Code CLI (child process)               │
│  stdin/stdout/stderr ↔ Tauri commands          │
└─────────────────────────────────────────────────┘
```

## Data Models

### ModelConfig
```typescript
interface ModelConfig {
  id: string;
  name: string;           // e.g., "Claude 3 Opus"
  cliFlag?: string;       // e.g., "--model opus"
  envVar?: string;        // e.g., "ANTHROPIC_MODEL=claude-3-opus"
  priority: number;       // Lower = higher priority
  enabled: boolean;
}
```

### ErrorPattern
```typescript
interface ErrorPattern {
  id: string;
  name: string;
  regex: string;          // e.g., "/rate.?limit|too many requests/i"
  description: string;
  enabled: boolean;
}
```

### ErrorRecord
```typescript
interface ErrorRecord {
  id: string;
  timestamp: number;      // Unix ms
  modelId: string;
  promptHash: string;     // SHA256, not full prompt
  errorMessage: string;
  matchedPatternId?: string;
  rotated: boolean;
  rotationTargetModelId?: string;
}
```

## Default Error Patterns

| Pattern ID | Regex | Description |
|------------|-------|-------------|
| `rate-limit` | `/rate.?limit|too many requests/i` | Rate limiting errors |
| `timeout` | `/timeout|timed out/i` | Request timeouts |
| `overload` | `/overloaded|at capacity|model.?overloaded/i` | Model at capacity |
| `context-length` | `/context.?length|maximum context|context.?exceeded/i` | Context window exceeded |
| `auth` | `/authentication|invalid.?api.?key|unauthorized/i` | Authentication failures |

## Configuration File

Stored at `%APPDATA%\ModelRotationManager\settings.json`:

```json
{
  "models": [
    { "id": "opus-4", "name": "Claude Opus 4", "envVar": "ANTHROPIC_MODEL=claude-opus-4", "priority": 1, "enabled": true },
    { "id": "sonnet-4", "name": "Claude Sonnet 4", "envVar": "ANTHROPIC_MODEL=claude-sonnet-4", "priority": 2, "enabled": true },
    { "id": "haiku-3-5", "name": "Claude Haiku 3.5", "envVar": "ANTHROPIC_MODEL=claude-haiku-3-5", "priority": 3, "enabled": true }
  ],
  "currentModelIndex": 0,
  "errorPatterns": [
    { "id": "rate-limit", "name": "Rate Limit", "regex": "rate.?limit|too many requests", "description": "API rate limiting", "enabled": true },
    { "id": "timeout", "name": "Timeout", "regex": "timeout|timed out", "description": "Request timeout", "enabled": true },
    { "id": "overload", "name": "Model Overload", "regex": "overloaded|at capacity|model.?overloaded", "description": "Model at capacity", "enabled": true },
    { "id": "context-length", "name": "Context Length", "regex": "context.?length|maximum context|context.?exceeded", "description": "Context window exceeded", "enabled": true },
    { "id": "auth", "name": "Authentication", "regex": "authentication|invalid.?api.?key|unauthorized", "description": "Auth failure", "enabled": true }
  ],
  "maxRetries": 3,
  "retryDelayMs": 1000,
  "autoRotate": true
}
```

## Commands

| Command | Description |
|---------|-------------|
| `/model-rotation-manager` | Launch/show the manager dashboard |
| `/model-rotation-manager cascade` | Manually rotate to next model |
| `/model-rotation-manager status` | Show current model and rotation status |
| `/model-rotation-manager config` | Open settings |

## Requirements

- Windows 10/11 (64-bit)
- Node.js >= 18
- Rust >= 1.70
- Claude Code CLI installed and in PATH
- Existing omniroute/combo configuration working

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run tauri dev

# Build for distribution
npm run tauri build

# Run tests
npm test
cargo test
```

## Permissions

The skill requires these Tauri permissions:
- `process:spawn` - Launch Claude Code CLI
- `fs:read` / `fs:write` - Settings and history storage
- `shell:execute` - System tray operations
- `notification:show` - Status notifications

## Troubleshooting

### "Claude Code not found"
Ensure `claude` is in your PATH. Test with `claude --version` in terminal.

### "Model not rotating"
1. Check Settings → Models: models are enabled and ordered correctly
2. Check Settings → Error Patterns: patterns match your errors
3. Verify omniroute/combo respects `ANTHROPIC_MODEL` env var

### "Settings not persisting"
Check `%APPDATA%\ModelRotationManager\` exists and is writable.

## Changelog

### v1.0.0 (2026-09-22)
- Initial release
- Auto error detection with 5 default patterns
- Model rotation with configurable priority
- Manual cascade button
- System tray integration
- Error history with SQLite
- Full settings persistence

---

**Author**: Model Rotation Manager Team
**License**: MIT
**Repository**: https://github.com/yourusername/model-rotation-manager