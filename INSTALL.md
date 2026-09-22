# Model Rotation Manager - Complete Installation Guide

## Quick Start (For End Users)

### Option 1: Install from Pre-built Release (Recommended)

1. **Download the latest release:**
   - Go to the [Releases page](https://github.com/your-username/model-rotation-manager/releases)
   - Download `ModelRotationManager-v1.0.0.zip` (or latest version)

2. **Extract and Install:**
   ```powershell
   # Right-click the ZIP file → "Extract All..."
   # Or use PowerShell:
   Expand-Archive -Path "ModelRotationManager-v1.0.0.zip" -DestinationPath "$env:USERPROFILE\.claude\plugins\ModelRotationManager"
   ```

3. **Restart Claude Code** - The plugin will appear in your plugins menu

---

### Option 2: Install from Source (For Developers)

#### Prerequisites

| Tool | Version | Install Command |
|------|---------|-----------------|
| **Node.js** | ≥ 18.x | `winget install OpenJS.NodeJS` or download from [nodejs.org](https://nodejs.org) |
| **Rust** | ≥ 1.70 | `winget install Rustlang.Rust.GNU` or [rustup.rs](https://rustup.rs) |
| **Claude Code CLI** | Latest | `npm install -g @anthropic-ai/claude-code` |

#### Build Steps

```powershell
# 1. Clone the repository
git clone https://github.com/your-username/model-rotation-manager.git
cd model-rotation-manager

# 2. Install Node.js dependencies
npm install

# 3. Build the frontend
npm run build

# 4. Build the Tauri application (creates MSI installer)
npm run tauri:build

# 5. Find the installer in:
# src-tauri/target/release/bundle/msi/ModelRotationManager_1.0.0_x64_en-US.msi
```

#### Install the Built Plugin

```powershell
# Option A: Run the MSI installer (system-wide)
# Double-click the .msi file and follow the wizard

# Option B: Manual plugin installation (user-specific)
# Copy the built plugin folder to Claude Code plugins directory:
Copy-Item -Path "dist" -Destination "$env:USERPROFILE\.claude\plugins\ModelRotationManager" -Recurse -Force

# Or copy the entire project folder (for development):
Copy-Item -Path "." -Destination "$env:USERPROFILE\.claude\plugins\ModelRotationManager" -Recurse -Force
```

---

## Detailed Installation Methods

### Method 1: GitHub Release ZIP (Easiest for Users)

1. **Navigate to Releases:**
   ```
   https://github.com/your-username/model-rotation-manager/releases
   ```

2. **Download the Assets:**
   - `ModelRotationManager-v1.0.0.zip` - Complete plugin package
   - `ModelRotationManager_1.0.0_x64_en-US.msi` - Windows installer

3. **Install via ZIP:**
   ```powershell
   # Extract to plugins directory
   $pluginDir = "$env:USERPROFILE\.claude\plugins\ModelRotationManager"
   if (Test-Path $pluginDir) { Remove-Item $pluginDir -Recurse -Force }
   Expand-Archive "ModelRotationManager-v1.0.0.zip" -DestinationPath $pluginDir
   ```

4. **Verify Installation:**
   - Restart Claude Code
   - Open Plugins menu (Ctrl+Shift+P → "Plugins")
   - "Model Rotation Manager" should appear

### Method 2: Windows MSI Installer (System-wide)

1. Download the `.msi` file from Releases
2. Double-click to run installer
3. Follow the installation wizard
4. The plugin registers automatically with Claude Code

### Method 3: Scoop/Chocolatey (Package Managers)

```powershell
# Scoop (if bucket is configured)
scoop bucket add model-rotation-manager https://github.com/your-username/scoop-bucket
scoop install model-rotation-manager

# Chocolatey (if package exists)
choco install model-rotation-manager
```

### Method 4: Development Install (Live Reload)

```powershell
# 1. Clone and setup
git clone https://github.com/your-username/model-rotation-manager.git
cd model-rotation-manager
npm install

# 2. Start development server (with hot reload)
npm run tauri:dev

# 3. In another terminal, link to Claude Code plugins
$pluginDir = "$env:USERPROFILE\.claude\plugins\ModelRotationManager"
New-Item -ItemType SymbolicLink -Path $pluginDir -Target (Get-Location).Path
```

---

## Post-Installation Configuration

### 1. First Launch
- Open Claude Code
- Press `Ctrl+Shift+P` → Type "Model Rotation Manager" → Select "Open Dashboard"
- Or find it in the Plugins menu

### 2. Configure Models (Settings → Models Tab)
Default models are pre-configured:
- **Claude Opus 4** (Priority 1) - `ANTHROPIC_MODEL=claude-opus-4`
- **Claude Sonnet 4** (Priority 2) - `ANTHROPIC_MODEL=claude-sonnet-4`
- **Claude Haiku 3.5** (Priority 3) - `ANTHROPIC_MODEL=claude-haiku-3-5`

To add custom models:
1. Click "Add Model"
2. Enter: ID, Name, Environment Variable (e.g., `ANTHROPIC_MODEL=my-custom-model`)
3. Set priority and enable/disable

### 3. Configure Error Patterns (Settings → Error Patterns Tab)
Pre-configured patterns:
| Pattern | Regex | Description |
|---------|-------|-------------|
| Rate Limit | `rate.?limit|too many requests` | API rate limiting |
| Timeout | `timeout|timed out` | Request timeouts |
| Model Overload | `overloaded|at capacity` | Model at capacity |
| Context Length | `context length|maximum context` | Context window exceeded |
| Authentication | `authentication|invalid api key` | Auth errors |

### 4. Configure Behavior (Settings → Behavior Tab)
- **Max Retries:** 1-10 (default: 3)
- **Retry Delay:** 100-10000ms (default: 1000ms)
- **Auto Rotate:** On/Off (default: On)

---

## Verification Checklist

After installation, verify everything works:

- [ ] Plugin appears in Claude Code Plugins menu
- [ ] Dashboard opens without errors
- [ ] Default models are listed in Settings → Models
- [ ] Error patterns are configured in Settings → Error Patterns
- [ ] Test error detection: Run a prompt that triggers a rate limit
- [ ] Check Error History shows the detected error
- [ ] Manual "Cascade" button rotates to next model

---

## Troubleshooting

### Plugin Not Showing in Menu
```powershell
# Verify plugin folder structure
ls "$env:USERPROFILE\.claude\plugins\ModelRotationManager\"
# Should contain: SKILL.md, package.json, src/, src-tauri/, dist/ (or built files)

# Check Claude Code logs
# Help → Toggle Developer Tools → Console tab
```

### "Claude command not found" Error
```powershell
# Verify Claude Code is in PATH
claude --version
# If not found, add to PATH or reinstall:
npm install -g @anthropic-ai/claude-code
```

### Models Not Rotating
1. Check Settings → Models: At least 2 models must be **enabled**
2. Check Settings → Behavior: "Auto Rotate" must be **On**
3. Check Error History: Errors must match configured patterns

### Build Fails (Development)
```powershell
# Clear caches and rebuild
npm run clean  # if available
Remove-Item node_modules, package-lock.json -Recurse -Force -ErrorAction SilentlyContinue
npm install
cd src-tauri
cargo clean
cd ..
npm run tauri:build
```

### Antivirus Blocks MSI/Executable
- Add exception for the build output folder
- Or install from ZIP instead of MSI

---

## Uninstallation

### Remove Plugin (ZIP/Manual Install)
```powershell
Remove-Item "$env:USERPROFILE\.claude\plugins\ModelRotationManager" -Recurse -Force
```

### Uninstall MSI
- Settings → Apps → Installed Apps → "Model Rotation Manager" → Uninstall

### Clean Data (Optional)
```powershell
# Remove settings and error history
Remove-Item "$env:LOCALAPPDATA\ModelRotationManager" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## Distribution for Developers

### Creating a Release ZIP

```powershell
# 1. Build production version
npm run build
npm run tauri:build

# 2. Create distribution package
$version = "1.0.0"
$distDir = "dist-release"
Remove-Item $distDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $distDir

# Copy plugin files (exclude dev files)
$exclude = @('node_modules', '.git', 'src-tauri/target', 'dist-release', '*.log', '.env*')
Get-ChildItem -Exclude $exclude | Copy-Item -Destination $distDir -Recurse

# Create ZIP
Compress-Archive -Path "$distDir\*" -DestinationPath "ModelRotationManager-v$version.zip"
```

### GitHub Actions Release Workflow (`.github/workflows/release.yml`)

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - uses: dtolnay/rust-toolchain@stable
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run tauri:build
      - name: Create release ZIP
        run: |
          $version = "${{ github.ref_name }}".TrimStart('v')
          Compress-Archive -Path "src-tauri/target/release/bundle/msi/*" -DestinationPath "ModelRotationManager-v$version.zip"
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/msi/*.msi
            ModelRotationManager-v$version.zip
```

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10 1903+ | Windows 11 |
| **RAM** | 4 GB | 8 GB+ |
| **Disk** | 500 MB | 1 GB |
| **Claude Code** | Latest | Latest |
| **Network** | Internet for model API calls | Stable broadband |

---

## Security & Privacy

- **No telemetry** - No usage data sent anywhere
- **Local storage only** - Settings and error history stay on your machine
- **Prompt hashing** - Only SHA256 hashes of prompts stored (never full text)
- **No network calls** - Except Claude Code's own API requests
- **Open source** - Full source code auditable at GitHub

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-username/model-rotation-manager/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/model-rotation-manager/discussions)
- **Documentation:** See `README.md` and this `INSTALL.md`

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

**Version:** 1.0.0  
**Last Updated:** 2026-09-23  
**Compatibility:** Claude Code 1.0+, Windows 10/11