use tauri::State;
use std::sync::Mutex;
use std::process::{Command, Stdio};
use serde::{Deserialize, Serialize};
use dirs::data_local_dir;
use sha2::{Sha256, Digest};
use regex::Regex;

// State structs
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ModelConfig {
    id: String,
    name: String,
    cli_flag: Option<String>,
    env_var: Option<String>,
    priority: usize,
    enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ErrorPattern {
    id: String,
    name: String,
    regex: String,
    description: String,
    enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ErrorRecord {
    id: String,
    timestamp: u64,
    model_id: String,
    prompt_hash: String,
    error_message: String,
    matched_pattern_id: Option<String>,
    rotated: bool,
    rotation_target_model_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RotationSettings {
    models: Vec<ModelConfig>,
    current_model_index: usize,
    error_patterns: Vec<ErrorPattern>,
    max_retries: usize,
    retry_delay_ms: u64,
    auto_rotate: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RotationState {
    current_model: Option<ModelConfig>,
    is_retrying: bool,
    retry_count: usize,
    last_error: Option<ErrorRecord>,
    rotation_history: Vec<ErrorRecord>,
}

struct AppState {
    settings: Mutex<RotationSettings>,
    state: Mutex<RotationState>,
    claude_process: Mutex<Option<std::process::Child>>,
}

// Default settings
fn default_settings() -> RotationSettings {
    RotationSettings {
        models: vec![
            ModelConfig {
                id: "opus-4".to_string(),
                name: "Claude Opus 4".to_string(),
                cli_flag: None,
                env_var: Some("ANTHROPIC_MODEL=claude-opus-4".to_string()),
                priority: 1,
                enabled: true,
            },
            ModelConfig {
                id: "sonnet-4".to_string(),
                name: "Claude Sonnet 4".to_string(),
                cli_flag: None,
                env_var: Some("ANTHROPIC_MODEL=claude-sonnet-4".to_string()),
                priority: 2,
                enabled: true,
            },
            ModelConfig {
                id: "haiku-3-5".to_string(),
                name: "Claude Haiku 3.5".to_string(),
                cli_flag: None,
                env_var: Some("ANTHROPIC_MODEL=claude-haiku-3-5".to_string()),
                priority: 3,
                enabled: true,
            },
        ],
        current_model_index: 0,
        error_patterns: vec![
            ErrorPattern {
                id: "rate-limit".to_string(),
                name: "Rate Limit".to_string(),
                regex: "rate.?limit|too many requests".to_string(),
                description: "API rate limiting errors".to_string(),
                enabled: true,
            },
            ErrorPattern {
                id: "timeout".to_string(),
                name: "Timeout".to_string(),
                regex: "timeout|timed out".to_string(),
                description: "Request timeouts".to_string(),
                enabled: true,
            },
            ErrorPattern {
                id: "overload".to_string(),
                name: "Model Overload".to_string(),
                regex: "overloaded|at capacity|model.?overloaded".to_string(),
                description: "Model at capacity errors".to_string(),
                enabled: true,
            },
            ErrorPattern {
                id: "context-length".to_string(),
                name: "Context Length".to_string(),
                regex: "context.?length|maximum context|context.?exceeded".to_string(),
                description: "Context window exceeded".to_string(),
                enabled: true,
            },
            ErrorPattern {
                id: "auth".to_string(),
                name: "Authentication".to_string(),
                regex: "authentication|invalid.?api.?key|unauthorized".to_string(),
                description: "Authentication failures".to_string(),
                enabled: true,
            },
        ],
        max_retries: 3,
        retry_delay_ms: 1000,
        auto_rotate: true,
    }
}

fn default_state() -> RotationState {
    RotationState {
        current_model: None,
        is_retrying: false,
        retry_count: 0,
        last_error: None,
        rotation_history: Vec::new(),
    }
}

// Helper functions
fn get_data_dir() -> std::path::PathBuf {
    data_local_dir().unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("ModelRotationManager")
}

fn load_settings() -> RotationSettings {
    let settings_path = get_data_dir().join("settings.json");
    if let Ok(content) = std::fs::read_to_string(settings_path) {
        if let Ok(settings) = serde_json::from_str(&content) {
            return settings;
        }
    }
    default_settings()
}

fn save_settings_to_file(settings: &RotationSettings) {
    let settings_path = get_data_dir().join("settings.json");
    let _ = std::fs::create_dir_all(get_data_dir());
    let _ = std::fs::write(settings_path, serde_json::to_string_pretty(settings).unwrap());
}

fn load_state() -> RotationState {
    let state_path = get_data_dir().join("state.json");
    if let Ok(content) = std::fs::read_to_string(state_path) {
        if let Ok(state) = serde_json::from_str(&content) {
            return state;
        }
    }
    default_state()
}

fn save_state_to_file(state: &RotationState) {
    let state_path = get_data_dir().join("state.json");
    let _ = std::fs::create_dir_all(get_data_dir());
    let _ = std::fs::write(state_path, serde_json::to_string_pretty(state).unwrap());
}

fn hash_prompt(prompt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(prompt.as_bytes());
    format!("{:x}", hasher.finalize())
}

fn match_error_pattern(error: &str, patterns: &[ErrorPattern]) -> Option<String> {
    for pattern in patterns {
        if pattern.enabled {
            if let Ok(re) = Regex::new(&pattern.regex) {
                if re.is_match(error) {
                    return Some(pattern.id.clone());
                }
            }
        }
    }
    None
}

fn get_next_model_index(current_index: usize, models: &[ModelConfig]) -> usize {
    let mut next = (current_index + 1) % models.len();
    // Skip disabled models
    while !models[next].enabled && next != current_index {
        next = (next + 1) % models.len();
        if next == current_index {
            break; // All disabled or only current enabled
        }
    }
    next
}

// Tauri commands
#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> Result<RotationSettings, String> {
    let settings = state.settings.lock().map_err(|e| e.to_string())?;
    Ok(settings.clone())
}

#[tauri::command]
fn save_settings(state: State<'_, AppState>, settings: RotationSettings) -> Result<(), String> {
    let mut settings_lock = state.settings.lock().map_err(|e| e.to_string())?;
    *settings_lock = settings.clone();
    save_settings_to_file(&settings);
    Ok(())
}

#[tauri::command]
fn get_current_model(state: State<'_, AppState>) -> Result<Option<ModelConfig>, String> {
    let state_lock = state.state.lock().map_err(|e| e.to_string())?;
    Ok(state_lock.current_model.clone())
}

#[tauri::command]
fn set_current_model(state: State<'_, AppState>, model_id: String) -> Result<(), String> {
    let mut settings_lock = state.settings.lock().map_err(|e| e.to_string())?;
    let mut state_lock = state.state.lock().map_err(|e| e.to_string())?;
    if let Some(index) = settings_lock.models.iter().position(|m| m.id == model_id) {
        settings_lock.current_model_index = index;
        state_lock.current_model = Some(settings_lock.models[index].clone());
        save_settings_to_file(&settings_lock);
        save_state_to_file(&state_lock);
        Ok(())
    } else {
        Err("Model not found".to_string())
    }
}

#[tauri::command]
fn rotate_model(state: State<'_, AppState>) -> Result<Option<ModelConfig>, String> {
    let mut settings_lock = state.settings.lock().map_err(|e| e.to_string())?;
    let mut state_lock = state.state.lock().map_err(|e| e.to_string())?;

    let next_index = get_next_model_index(settings_lock.current_model_index, &settings_lock.models);
    settings_lock.current_model_index = next_index;
    let next_model = settings_lock.models[next_index].clone();
    state_lock.current_model = Some(next_model.clone());

    save_settings_to_file(&settings_lock);
    save_state_to_file(&state_lock);

    Ok(Some(next_model))
}

#[tauri::command]
fn log_error(state: State<'_, AppState>, error_message: String, prompt: String) -> Result<(), String> {
    let mut settings_lock = state.settings.lock().map_err(|e| e.to_string())?;
    let mut state_lock = state.state.lock().map_err(|e| e.to_string())?;

    let prompt_hash = hash_prompt(&prompt);
    let matched_pattern_id = match_error_pattern(&error_message, &settings_lock.error_patterns);

    let error_record = ErrorRecord {
        id: format!("{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()),
        timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs(),
        model_id: state_lock.current_model.as_ref().map(|m| m.id.clone()).unwrap_or_else(|| "unknown".to_string()),
        prompt_hash,
        error_message,
        matched_pattern_id,
        rotated: false,
        rotation_target_model_id: None,
    };

    state_lock.last_error = Some(error_record.clone());
    state_lock.rotation_history.push(error_record);
    // Keep only last 100 errors
    if state_lock.rotation_history.len() > 100 {
        state_lock.rotation_history.truncate(100);
    }

    save_state_to_file(&state_lock);
    Ok(())
}

#[tauri::command]
fn get_error_history(state: State<'_, AppState>) -> Result<Vec<ErrorRecord>, String> {
    let state_lock = state.state.lock().map_err(|e| e.to_string())?;
    Ok(state_lock.rotation_history.clone())
}

#[tauri::command]
fn clear_error_history(state: State<'_, AppState>) -> Result<(), String> {
    let mut state_lock = state.state.lock().map_err(|e| e.to_string())?;
    state_lock.rotation_history.clear();
    save_state_to_file(&state_lock);
    Ok(())
}

#[tauri::command]
fn start_claude_code(state: State<'_, AppState>, prompt: String) -> Result<(), String> {
    // Stop any existing process
    let _ = stop_claude_code(state.clone());

    let settings_lock = state.settings.lock().map_err(|e| e.to_string())?;
    let state_lock = state.state.lock().map_err(|e| e.to_string())?;

    let current_model = state_lock.current_model.as_ref()
        .ok_or_else(|| "No model selected".to_string())?;

    // Build command with environment variable
    let mut cmd = Command::new("claude");
    if let Some(env_var) = &current_model.env_var {
        let parts: Vec<&str> = env_var.splitn(2, '=').collect();
        if parts.len() == 2 {
            cmd.env(parts[0], parts[1]);
        }
    }
    cmd.arg("--print") // Assuming we want to print the response, adjust as needed
        .arg(prompt)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null());

    let mut child = cmd.spawn()
        .map_err(|e| format!("Failed to spawn Claude Code: {}", e))?;

    // Store the process
    {
        let mut process_lock = state.claude_process.lock().map_err(|e| e.to_string())?;
        *process_lock = Some(child);
    }

    // We'll monitor the process in a separate thread (simplified for now)
    // In a real implementation, we would read stdout/stderr and handle rotation
    // For brevity, we're just showing the structure

    Ok(())
}

#[tauri::command]
fn stop_claude_code(state: State<'_, AppState>) -> Result<(), String> {
    let mut process_lock = state.claude_process.lock().map_err(|e| e.to_string())?;
    if let Some(mut child) = process_lock.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    Ok(())
}

#[tauri::command]
fn send_prompt(state: State<'_, AppState>, prompt: String) -> Result<String, String> {
    // This would be the main entry point from the frontend
    // For now, we'll just start the process and return a placeholder
    let _ = start_claude_code(state, prompt)?;
    Ok("Prompt sent".to_string())
}

#[tauri::command]
fn show_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    let window = app_handle.get_webview_window("main").unwrap();
    window.show().unwrap();
    window.set_focus().unwrap();
    Ok(())
}

#[tauri::command]
fn hide_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    let window = app_handle.get_webview_window("main").unwrap();
    window.hide().unwrap();
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            settings: Mutex::new(load_settings()),
            state: Mutex::new(load_state()),
            claude_process: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            get_current_model,
            set_current_model,
            rotate_model,
            log_error,
            get_error_history,
            clear_error_history,
            start_claude_code,
            stop_claude_code,
            send_prompt,
            show_window,
            hide_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}