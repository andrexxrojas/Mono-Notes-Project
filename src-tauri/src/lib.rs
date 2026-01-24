mod settings;
mod window_persistence;
mod ui_state;
mod db;
mod commands;

use window_persistence::{restore_window_size, track_window_events};
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;

use commands::ui_commands::{
    UiStateManager,
    get_ui_state,
    set_sidebar_open,
    set_sidebar_width,
};

use commands::notes_commands::{
    add_note_cmd,
    get_notes_cmd,
    add_block_cmd,
    get_blocks_cmd
};

use dirs::data_dir;
use std::fs;
use std::sync::Arc;
use db::notes_db::NotesDb;
use ui_state::UiState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // --- SETTINGS ---
            let settings_path = crate::settings::get_settings_path();
            if !settings_path.exists() {
                let default_settings = crate::settings::Settings::default();
                std::fs::write(
                    &settings_path,
                    serde_json::to_string_pretty(&default_settings).unwrap()
                ).expect("Failed to create default settings.json");
            }

            // --- UI STATE ---
            let store = StoreBuilder::new(app.handle(), "ui_state.json").build()?;
            let ui_state: UiState = store
                .get("uiState")
                .and_then(|v| serde_json::from_value(v).ok())
                .unwrap_or_default();

            app.manage(UiStateManager {
                store: store.clone(),
                state: std::sync::Mutex::new(ui_state),
            });

            // --- NOTES DB ---
            let mut db_path = data_dir().expect("failed to get data dir");
            db_path.push("com.tauri.dev");
            fs::create_dir_all(&db_path).expect("failed to create app folder");
            db_path.push("notes.db");
            let notes_db = NotesDb::new(db_path.to_str().unwrap())?;
            app.manage(Arc::new(notes_db));

            // --- WINDOWS PERSISTENCE ---
            restore_window_size(&window, &store);
            track_window_events(&window, store.clone());

            window.show().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::settings::load_settings,
            crate::settings::save_settings,
            get_ui_state,
            set_sidebar_open,
            set_sidebar_width,
            add_note_cmd,
            get_notes_cmd,
            add_block_cmd,
            get_blocks_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}