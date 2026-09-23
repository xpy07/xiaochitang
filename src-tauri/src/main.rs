#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod click_through;
mod hotkey;
mod scene;
mod tray;

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_autostart::ManagerExt;
use windows::core::w;
use windows::Win32::Foundation::{LPARAM, POINT, WPARAM, HWND};
use windows::Win32::UI::Controls::{LVM_GETITEMCOUNT, LVM_GETITEMPOSITION};
use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, FindWindowExW, SendMessageW, SetParent, SetWindowPos, HWND_BOTTOM, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, SWP_SHOWWINDOW};

pub struct AppState {
    pub interactive: AtomicBool,
}

#[derive(serde::Serialize)]
struct IconRect {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

const ICON_SIZE: f64 = 75.0;

unsafe fn find_desktop_listview() -> Option<HWND> {
    let progman = FindWindowW(w!("Progman"), None).ok()?;

    if let Ok(defview) = FindWindowExW(progman, HWND::default(), w!("SHELLDLL_DefView"), None) {
        if let Ok(lv) = FindWindowExW(defview, HWND::default(), w!("SysListView32"), None) {
            return Some(lv);
        }
    }

    let mut prev = HWND::default();
    while let Ok(workerw) = FindWindowExW(HWND::default(), prev, w!("WorkerW"), None) {
        if let Ok(defview) = FindWindowExW(workerw, HWND::default(), w!("SHELLDLL_DefView"), None) {
            if let Ok(lv) = FindWindowExW(defview, HWND::default(), w!("SysListView32"), None) {
                return Some(lv);
            }
        }
        prev = workerw;
    }

    None
}

fn setup_wallpaper_layer(window: &tauri::WebviewWindow) {
    unsafe {
        let hwnd = window.hwnd().map_err(|e| e.to_string()).unwrap();
        let hwnd = HWND(hwnd.0);

        // Tell Progman to spawn a WorkerW behind wallpaper
        if let Ok(progman) = FindWindowW(w!("Progman"), None) {
            SendMessageW(progman, 0x052C, WPARAM(0), LPARAM(0));
        }

        // Find the WorkerW that sits behind desktop icons
        let mut prev = HWND::default();
        let mut target_workerw = HWND::default();
        while let Ok(workerw) = FindWindowExW(HWND::default(), prev, w!("WorkerW"), None) {
            if let Ok(defview) = FindWindowExW(workerw, HWND::default(), w!("SHELLDLL_DefView"), None) {
                if !defview.is_invalid() {
                    target_workerw = workerw;
                }
            }
            prev = workerw;
        }

        if target_workerw.is_invalid() {
            target_workerw = FindWindowW(w!("WorkerW"), None).unwrap_or(HWND::default());
        }

        if !target_workerw.is_invalid() {
            SetParent(hwnd, target_workerw);
            SetWindowPos(
                hwnd,
                HWND_BOTTOM,
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW,
            );
        }
    }
}

#[tauri::command]
fn get_desktop_icons() -> Vec<IconRect> {
    unsafe {
        let Some(lv) = find_desktop_listview() else {
            return vec![];
        };

        let count = SendMessageW(lv, LVM_GETITEMCOUNT, WPARAM(0), LPARAM(0)).0 as usize;
        let mut icons = Vec::with_capacity(count);

        for i in 0..count {
            let mut pt = POINT { x: 0, y: 0 };
            SendMessageW(
                lv,
                LVM_GETITEMPOSITION,
                WPARAM(i),
                LPARAM(&mut pt as *mut POINT as isize),
            );
            icons.push(IconRect {
                x: pt.x as f64,
                y: pt.y as f64,
                width: ICON_SIZE,
                height: ICON_SIZE,
            });
        }

        icons
    }
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

#[tauri::command]
async fn set_autostart(app: AppHandle, enable: bool) -> Result<(), String> {
    let autostart = app.autolaunch();
    if enable {
        autostart.enable().map_err(|e| e.to_string())?;
    } else {
        autostart.disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_autostart(app: AppHandle) -> bool {
    app.autolaunch().is_enabled().unwrap_or(false)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(AppState {
            interactive: AtomicBool::new(false),
        })
        .invoke_handler(tauri::generate_handler![
            toggle_interaction,
            get_desktop_icons,
            set_autostart,
            get_autostart
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let window = app.get_webview_window("main").expect("no main window");

            // Set wallpaper layer (WorkerW) — must happen after window creation
            setup_wallpaper_layer(&window);

            // Start with click-through enabled (non-interactive)
            if let Err(e) = click_through::set_click_through(&window, true) {
                eprintln!("Failed to set click-through: {}", e);
            }

            if let Err(e) = hotkey::register(&handle) {
                eprintln!("Failed to register hotkey: {}", e);
            }
            tray::setup(&handle)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
