use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

pub fn register(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    app.global_shortcut().on_shortcut(
        "CmdOrCtrl+Alt+F",
        |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let _ = app.emit("hotkey-toggle", ());
            }
        },
    )?;

    // Emergency quit: Ctrl+Alt+Q
    app.global_shortcut().on_shortcut(
        "CmdOrCtrl+Alt+Q",
        |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                app.exit(0);
            }
        },
    )?;

    Ok(())
}
