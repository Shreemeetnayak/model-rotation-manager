# Model Rotation Manager Plugin

A Claude Code plugin that automatically detects errors, rotates through configured models (omniroute/combo), and retries prompts without manual intervention.

## Features

- **Auto Error Detection**: Monitors Claude Code stderr/stdout for known error patterns
- **Intelligent Model Rotation**: Rotates through user-configured model list when errors detected
- **Automatic Retry**: Resends the same prompt with the next model in rotation
- **Manual Cascade**: One-click button to manually advance to next model
- **Error Learning**: Tracks which models fail on which error types to improve future decisions
- **System Tray**: Runs in background with accessible dashboard

## Installation

1. Copy this entire folder to your Claude Code plugins directory
   - Typically: `%USERPROFILE%\.claude\plugins\`
2. Restart Claude Code
3. The plugin will appear in your plugins list

## Usage

1. Launch Model Rotation Manager from your plugins menu
2. Configure your models in Settings (default includes common Anthropic models)
3. Set error patterns to watch for (rate limits, timeouts, etc.)
4. Start using Claude Code normally - the app will handle errors automatically
5. Use the "Cascade" button or system tray menu to manually rotate models

## How It Works

1. Spawns Claude Code CLI as child process and monitors stdout/stderr
2. Matches output against configured error patterns using regex
3. On match, rotates to next enabled model in rotation list
4. Retries the same prompt with new model configuration
5. Logs all errors and rotation decisions for review
6. Provides manual cascade functionality for user-controlled rotation

## Configuration

### Models Tab
- Add/remove/reorder models in your rotation list
- Each model needs: ID, Name, and optionally CLI flag or environment variable
- Default models include Claude Opus 4, Sonnet 4, and Haiku 3.5

### Error Patterns Tab
- Predefined patterns for common errors:
  - Rate limit: `/rate.?limit/i` or `/too many requests/i`
  - Timeout: `/timeout/i` or `/timed out/i`
  - Model overload: `/overloaded/i` or `/at capacity/i`
  - Context window: `/context.?length/i` or `/maximum context/i`
  - Auth error: `/authentication/i` or `/invalid api key/i`
- Add custom regex patterns as needed
- Test patterns against sample error text

### Behavior Tab
- Max retries: 1-10 (default: 3)
- Retry delay: milliseconds between retries (default: 1000ms)
- Auto-rotation: Enable/disable automatic rotation
- Notification preferences

## Data Storage

- **Settings**: Stored locally in `%LOCALAPPDATA%\ModelRotationManager\settings.json`
- **Error History**: Stored in SQLite database at `%LOCALAPPDATA%\ModelRotationManager\error_history.db`
- **Privacy**: Only stores SHA256 hashes of prompts (never full prompts)
- **Security**: No network calls unless update checks are explicitly enabled

## Requirements

- Windows 10/11 (64-bit)
- Claude Code CLI installed and accessible in PATH
- Works with existing omniroute/combo setup

## Development

If you wish to modify or build from source:

```bash
# Install dependencies
npm install

# Development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Troubleshooting

- **Plugin not showing**: Ensure folder is copied to correct plugins directory and Claude Code is restarted
- **Not detecting errors**: Check that error patterns match actual Claude Code error output
- **Models not rotating**: Verify that environment variables or CLI flags are correctly configured
- **Process issues**: Check that `claude` command is in your system PATH

## Support

For issues or feature requests, please check the plugin documentation or contact the Model Rotation Manager Team.

---
Version: 1.0.0
Built with Tauri + React + TypeScript