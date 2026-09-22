use tauri::WebviewWindow;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_LAYERED, WS_EX_TRANSPARENT,
};

pub fn compute_style(style: isize, pass_through: bool) -> isize {
    if pass_through {
        style | (WS_EX_TRANSPARENT.0 as isize) | (WS_EX_LAYERED.0 as isize)
    } else {
        style & !(WS_EX_TRANSPARENT.0 as isize) | (WS_EX_LAYERED.0 as isize)
    }
}

pub fn set_click_through(window: &WebviewWindow, pass_through: bool) -> Result<(), String> {
    let hwnd = window.hwnd().map_err(|e| format!("failed to get hwnd: {}", e))?;
    let hwnd = HWND(hwnd.0);

    unsafe {
        let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let new_style = compute_style(style, pass_through);
        if SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new_style) == 0 {
            return Err("SetWindowLongPtrW failed".to_string());
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_style() {
        let base = 0x00040000isize; // some base style
        let with_through = compute_style(base, true);
        assert_eq!(with_through & (WS_EX_TRANSPARENT.0 as isize), WS_EX_TRANSPARENT.0 as isize);

        let without_through = compute_style(base, false);
        assert_eq!(without_through & (WS_EX_TRANSPARENT.0 as isize), 0);
    }
}
