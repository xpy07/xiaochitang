use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter,
};
use tauri_plugin_autostart::ManagerExt;

pub fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let toggle = MenuItem::with_id(app, "toggle", "切换交互 (Ctrl+Alt+F)", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "打开设置 (P)", true, None::<&str>)?;
    let achievements =
        MenuItem::with_id(app, "achievements", "打开成就 (H)", true, None::<&str>)?;
    let updates = MenuItem::with_id(app, "updates", "检查更新", true, None::<&str>)?;
    let autostart_enabled = app.autolaunch().is_enabled().unwrap_or(false);
    let autostart = CheckMenuItem::with_id(
        app,
        "autostart",
        "开机自启",
        true,
        autostart_enabled,
        None::<&str>,
    )?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&toggle, &settings, &achievements, &updates, &autostart, &sep, &quit],
    )?;

    let autostart_item = autostart.clone();
    TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("小鱼塘")
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "toggle" => {
                let _ = app.emit("hotkey-toggle", ());
            }
            "settings" => {
                let _ = app.emit("open-settings", ());
            }
            "achievements" => {
                let _ = app.emit("open-achievements", ());
            }
            "updates" => {
                let _ = app.emit("check-updates", ());
            }
            "autostart" => {
                let mgr = app.autolaunch();
                let enable = !mgr.is_enabled().unwrap_or(false);
                let _ = if enable {
                    mgr.enable()
                } else {
                    mgr.disable()
                };
                let _ = autostart_item.set_checked(enable);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::DoubleClick { .. } = event {
                let app = tray.app_handle();
                let _ = app.emit("hotkey-toggle", ());
            }
        })
        .build(app)?;

    Ok(())
}
