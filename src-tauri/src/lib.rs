mod settings;
mod window_persistence;

use window_persistence::{restore_window_size, track_window_events};
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let store = StoreBuilder::new(app.handle(), "ui_state.json").build()?;

            window.show().unwrap();

            restore_window_size(&window, &store);
            track_window_events(&window, store.clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::settings::load_settings,
            crate::settings::save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}