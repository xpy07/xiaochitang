#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod click_through;
mod hotkey;
mod scene;
mod tray;

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Manager, State};

pub struct AppState {
    pub interactive: AtomicBool,
}

#[tauri::command]
fn toggle_interaction(app: AppHandle, state: State<AppState>) -> bool {
    let new_val = !state.interactive.fetch_xor(true, Ordering::Relaxed);

    if let Some(window) = app.get_webview_window("main") {
        if let Err(e) = click_through::set_click_through(&window, !new_val) {
            eprintln!("Failed to set click-through: {}", e);
        }
        let _ = window.emit("interaction-changed", new_val);
    }

    new_val
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            interactive: AtomicBool::new(false),
        })
        .invoke_handler(tauri::generate_handler![toggle_interaction])
        .setup(|app| {
            let handle = app.handle().clone();
            let window = app.get_webview_window("main").expect("no main window");

            // start with click-through enabled (non-interactive)
            if let Err(e) = click_through::set_click_through(&window, true) {
                eprintln!("Failed to set click-through: {}", e);
            }

            if let Err(e) = hotkey::register(&handle) {
                eprintln!("Failed to register hotkey: {}", e);
                // Don't abort - continue without hotkey
            }
            tray::setup(&handle)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
