use std::sync::{Arc, Mutex};

use tauri::{Runtime, State};
use tauri_plugin_store::Store;

use crate::ui_state::UiState;

pub struct UiStateManager<R: Runtime> {
    pub store: Arc<Store<R>>,
    pub state: Mutex<UiState>,
}

#[tauri::command]
pub fn get_ui_state(
    manager: State<UiStateManager<tauri::Wry>>,
) -> UiState {
    manager.state.lock().unwrap().clone()
}

#[tauri::command]
pub fn set_sidebar_open(
    manager: State<UiStateManager<tauri::Wry>>,
    open: bool,
) {
    let mut state = manager.state.lock().unwrap();
    state.sidebar_open = open;

    manager
        .store
        .set("uiState", serde_json::to_value(&*state).unwrap());
    manager.store.save().unwrap();
}

#[tauri::command]
pub fn set_sidebar_width(
    manager: State<UiStateManager<tauri::Wry>>,
    width: f64,
) {
    let mut state = manager.state.lock().unwrap();
    state.sidebar_width = width;

    manager
        .store
        .set("uiState", serde_json::to_value(&*state).unwrap());
    manager.store.save().unwrap();
}
