import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { PondCanvas } from "./canvas";

const pond = new PondCanvas();
let interactive = false;

async function toggleInteraction(): Promise<void> {
  interactive = await invoke<boolean>("toggle_interaction");
  document.body.classList.toggle("interactive", interactive);
}

listen("hotkey-toggle", () => {
  toggleInteraction().catch(console.error);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") {
    pond.scene.toggleMode();
  }
});

function loop(): void {
  pond.render();
  requestAnimationFrame(loop);
}

loop();
