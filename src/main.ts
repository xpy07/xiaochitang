import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PondCanvas } from "./canvas";
import { CursorManager } from "./cursor";

const pond = new PondCanvas();
const cursor = new CursorManager();

async function toggleInteraction(): Promise<void> {
  const interactive = await invoke<boolean>("toggle_interaction");
  document.body.classList.toggle("interactive", interactive);
  if (!interactive) {
    cursor.setTool(null);
  }
}

listen("hotkey-toggle", () => {
  toggleInteraction().catch(console.error);
});

window.addEventListener("mousemove", (e) => {
  cursor.updateMouse(e.clientX, e.clientY);
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (!document.body.classList.contains("interactive")) return;
  if (e.key === "s" || e.key === "S") {
    pond.scene.toggleMode();
  }
  if (e.key === "Tab") {
    e.preventDefault();
    cursor.cycleTool();
  }
});

function loop(timeMs: number): void {
  pond.render(timeMs);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
