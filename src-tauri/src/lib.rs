mod settings;
mod window_persistence;
mod ui_state;
mod ui_commands;

use window_persistence::{restore_window_size, track_window_events};
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;

use ui_commands::{
    UiStateManager,
    get_ui_state,
    set_sidebar_open,
    set_sidebar_width,
};

use ui_state::UiState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let store = StoreBuilder::new(app.handle(), "ui_state.json").build()?;

            let ui_state: UiState = store
                .get("uiState")
                .and_then(|v| serde_json::from_value(v).ok())
                .unwrap_or_default();

            app.manage(UiStateManager {
                store: store.clone(),
                state: std::sync::Mutex::new(ui_state),
            });

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}