let interactive = false;

export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

export async function safeInvoke(cmd: string): Promise<unknown> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke(cmd);
  }
  switch (cmd) {
    case "get_desktop_icons":
      return [];
    case "toggle_interaction":
      interactive = !interactive;
      return interactive;
    default:
      return null;
  }
}

export function safeListen(event: string, handler: () => void): void {
  if (isTauri) {
    import("@tauri-apps/api/event").then(({ listen }) => listen(event, handler));
    return;
  }
  const keyMap: Record<string, string> = {
    "hotkey-toggle": "F2",
    "open-settings": "F3",
    "open-achievements": "F4",
    "check-updates": "F5",
  };
  const key = keyMap[event];
  if (key) {
    window.addEventListener("keydown", (e) => {
      if (e.key === key) handler();
    });
  }
}

export async function safeCheckUpdate(): Promise<unknown | null> {
  if (!isTauri) return null;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    return await check();
  } catch {
    return null;
  }
}
