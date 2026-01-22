use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use dirs::config_dir;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Settings {
    pub sidebar_width: u32,
    pub interface_font: String,
    pub content_font: String,
    pub theme: String,
    pub background: String,
}

impl Default for Settings {
    fn default() -> Self {
       Self {
          sidebar_width: 260,
          interface_font: "Manrope".into(),
          content_font: "Manrope".into(),
          theme: "light".into(),
          background: "#FFFFFF".into(),
      }
    }
}

pub fn get_settings_path() -> PathBuf {
    let mut path = config_dir().expect("failed to get config dir");
    path.push("mono");
    fs::create_dir_all(&path).unwrap();
    path.push("settings.json");
    path
}

#[tauri::command]
pub fn load_settings() -> Settings {
    let path = get_settings_path();
    if path.exists() {
        let data = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Settings::default()
    }
}

#[tauri::command]
pub fn save_settings(settings: Settings) -> Result<(), String> {
    let path = get_settings_path();
    let data = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&path, data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(())
}