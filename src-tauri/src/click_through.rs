use tauri::WebviewWindow;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_LAYERED, WS_EX_TRANSPARENT,
};

pub fn set_click_through(window: &WebviewWindow, enabled: bool) {
    let hwnd = window.hwnd().expect("failed to get hwnd");
    let hwnd = HWND(hwnd.0);

    unsafe {
        let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let new_style = if enabled {
            style | WS_EX_TRANSPARENT.0 as isize | WS_EX_LAYERED.0 as isize
        } else {
            style & !WS_EX_TRANSPARENT.0 as isize | WS_EX_LAYERED.0 as isize
        };
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new_style);
    }
}
