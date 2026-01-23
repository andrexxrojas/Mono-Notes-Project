use serde::{Deserialize, Serialize};
use tauri::{WebviewWindow, LogicalPosition, LogicalSize, WindowEvent, Runtime};
use tauri_plugin_store::Store;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Serialize, Deserialize)]
pub struct WindowState {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool,
}

pub fn restore_window_size<R: Runtime>(window: &WebviewWindow<R>, store: &Arc<Store<R>>) {
    if let Some(value) = store.get("windowState") {
        if let Ok(state) = serde_json::from_value::<WindowState>(value) {
            if state.maximized {
                let _ = window.maximize();
            } else {
                let _ = window.unmaximize();
                let _ = window.set_size(LogicalSize { width: state.width, height: state.height });
                let _ = window.set_position(LogicalPosition { x: state.x, y: state.y });
            }
        }
    }
}

pub fn track_window_events<R: Runtime>(window: &WebviewWindow<R>, store: Arc<Store<R>>) {
    let window_clone = window.clone();
    let last_save = Arc::new(Mutex::new(Instant::now()));
    let pending_state: Arc<Mutex<Option<WindowState>>> = Arc::new(Mutex::new(None));

    let store_clone = store.clone();
    let last_save_clone = last_save.clone();
    let pending_state_clone = pending_state.clone();

    std::thread::spawn(move || {
        loop {
            std::thread::sleep(Duration::from_millis(300));

            let mut pending = pending_state_clone.lock().unwrap();
            if let Some(state) = pending.take() {
                let mut last = last_save_clone.lock().unwrap();
                if last.elapsed() >= Duration::from_millis(300) {
                    let _ = store_clone.set("windowState", serde_json::to_value(&state).unwrap());
                    let _ = store_clone.save();
                    *last = Instant::now();
                }
            }
        }
    });

    window.on_window_event(move |event| {
        if let WindowEvent::Resized(physical_size) = event {
            let maximized = window_clone.is_maximized().unwrap_or(false);
            let scale_factor = window_clone.scale_factor().unwrap_or(1.0);
            let logical_size = physical_size.to_logical::<f64>(scale_factor);

            let pos = if maximized {
                LogicalPosition { x: 0.0, y: 0.0 }
            } else {
                let p = window_clone.outer_position().unwrap_or(tauri::PhysicalPosition { x: 0, y: 0 });
                p.to_logical::<f64>(scale_factor)
            };

            let state = WindowState {
                width: logical_size.width,
                height: logical_size.height,
                x: pos.x,
                y: pos.y,
                maximized,
            };

            let mut pending = pending_state.lock().unwrap();
            *pending = Some(state);
        }
    });
}